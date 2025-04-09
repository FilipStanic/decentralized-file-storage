<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FileController extends Controller
{
    /**
     * Get files for the homepage (recent and quick access)
     */
    public function index()
    {
        $user = Auth::user();

        $recentFiles = $user->files()
            ->orderByRaw('CASE WHEN last_accessed IS NOT NULL THEN 0 ELSE 1 END')
            ->orderBy('last_accessed', 'desc')
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'size' => $file->formatted_size,
                    'shared' => $file->share_count,
                    'lastModified' => $file->updated_at->diffForHumans(),
                    'starred' => $file->starred,
                    'folder_id' => $file->folder_id,
                    'folder_name' => $file->folder ? $file->folder->name : null,
                ];
            });

        $quickAccessFiles = $user->files()
            ->where(function($query) {
                $query->where('starred', true)
                    ->orWhere('last_accessed', '>=', now()->subDays(7));
            })
            ->orderBy('starred', 'desc')
            ->orderBy('last_accessed', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'date' => $file->updated_at->diffForHumans(),
                    'starred' => $file->starred,
                    'folder_id' => $file->folder_id,
                    'folder_name' => $file->folder ? $file->folder->name : null,
                ];
            });


        $starredFolders = $user->folders()
            ->where('starred', true)
            ->orderBy('updated_at', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'color' => $folder->color,
                    'type' => 'folder',
                    'date' => $folder->updated_at->diffForHumans(),
                    'starred' => $folder->starred,
                ];
            });

        $quickAccessItems = $quickAccessFiles->merge($starredFolders)
            ->sortByDesc('starred')
            ->sortByDesc('date')
            ->take(4)
            ->values();

        \Log::info('FileController@index hit');
        return [
            'recentFiles' => $recentFiles,
            'quickAccessFiles' => $quickAccessItems,
        ];
    }

    /**
     * Upload a new file
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', 
            'folder_id' => 'nullable|exists:folders,id',
        ]);

        $file = $request->file('file');
        $user = Auth::user();

        if ($request->folder_id) {
            $folder = Folder::findOrFail($request->folder_id);

            if (Gate::denies('addFiles', $folder)) {
                abort(403);
            }
        }

        $filename = uniqid() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('files/' . $user->id, $filename, 'private');

        $mimeType = $file->getMimeType();
        $type = 'Other';

        if (strpos($mimeType, 'image') !== false) {
            $type = 'Image';
        } elseif (strpos($mimeType, 'pdf') !== false) {
            $type = 'PDF';
        } elseif (strpos($mimeType, 'spreadsheet') !== false || strpos($mimeType, 'excel') !== false) {
            $type = 'Spreadsheet';
        } elseif (strpos($mimeType, 'presentation') !== false || strpos($mimeType, 'powerpoint') !== false) {
            $type = 'Presentation';
        } elseif (strpos($mimeType, 'word') !== false || strpos($mimeType, 'document') !== false) {
            $type = 'Document';
        }

        $fileRecord = $user->files()->create([
            'name' => $file->getClientOriginalName(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $mimeType,
            'extension' => $file->getClientOriginalExtension(),
            'path' => $path,
            'size' => $file->getSize(),
            'type' => $type,
            'folder_id' => $request->folder_id,
            'last_accessed' => now(),
        ]);

        return redirect()->back()->with('success', 'File uploaded successfully');
    }

    /**
     * Download a file
     */
    public function download($id)
    {
        $file = File::findOrFail($id);

        if (Auth::id() !== $file->user_id) {
            abort(403);
        }

        $fullPath = storage_path('app/private/' . $file->path);

        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        
        $file->update(['last_accessed' => now()]);

        return response()->file($fullPath, [
            'Content-Disposition' => 'attachment; filename="' . $file->original_name . '"',
            'Content-Type' => $file->mime_type
        ]);
    }

    /**
     * Toggle star status for a file
     */
    public function toggleStar($id)
    {
        $file = File::findOrFail($id);

        if (Gate::denies('update', $file)) {
            abort(403);
        }

        $file->timestamps = false;
        $file->update(['starred' => !$file->starred]);

        return redirect()->back();
    }

    /**
     * Delete a file
     */
    public function destroy($id)
    {
        $file = File::findOrFail($id);

        if (Gate::denies('delete', $file)) {
            abort(403);
        }

        Storage::disk('private')->delete($file->path);

        $file->delete();

        return redirect()->back()->with('success', 'File deleted successfully');
    }

    /**
     * Rename a file
     */
    public function rename(Request $request, $id)
    {
        $file = File::findOrFail($id);

        if (Gate::denies('update', $file)) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $file->update([
            'name' => $request->name,
        ]);

        return redirect()->back();
    }

    /**
     * Move a file to a folder
     */
    public function move(Request $request, $id)
    {
        $file = File::findOrFail($id);

        if (Gate::denies('update', $file)) {
            abort(403);
        }

        $request->validate([
            'folder_id' => 'nullable|exists:folders,id',
        ]);

        
        if ($request->folder_id) {
            $folder = Folder::findOrFail($request->folder_id);

            if (Gate::denies('addFiles', $folder)) {
                abort(403);
            }
        }

        $file->update([
            'folder_id' => $request->folder_id,
        ]);

        return redirect()->back()->with('success', 'File moved successfully');
    }
}
