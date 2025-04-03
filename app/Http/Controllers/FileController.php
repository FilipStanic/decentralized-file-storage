<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate; // Added this import
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

        // Get recently accessed files
        $recentFiles = $user->files()
            ->orderByRaw('CASE WHEN last_accessed IS NOT NULL THEN 0 ELSE 1 END')
            ->orderBy('last_accessed', 'desc')
            ->orderBy('updated_at', 'desc')
            ->limit(5)
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
                ];
            });

        // Get quick access files (starred or recently accessed)
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
                ];
            });

        return [
            'recentFiles' => $recentFiles,
            'quickAccessFiles' => $quickAccessFiles,
        ];
    }

    /**
     * Upload a new file
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB max
        ]);

        $file = $request->file('file');
        $user = Auth::user();

        // Generate a unique filename
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();

        // Store the file
        $path = $file->storeAs('files/' . $user->id, $filename, 'private');

        // Determine file type based on mime type
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

        // Create file record
        $fileRecord = $user->files()->create([
            'name' => $file->getClientOriginalName(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $mimeType,
            'extension' => $file->getClientOriginalExtension(),
            'path' => $path,
            'size' => $file->getSize(),
            'type' => $type,
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

        // Check permissions
        if (Gate::denies('download', $file)) {
            abort(403);
        }

        // Update last accessed
        $file->update(['last_accessed' => now()]);

        return Storage::disk('private')->download($file->path, $file->original_name);
    }

    /**
     * Toggle star status for a file
     */
    public function toggleStar($id)
    {
        $file = File::findOrFail($id);

        // Check permissions
        if (Gate::denies('update', $file)) {
            abort(403);
        }

        $file->update(['starred' => !$file->starred]);

        return redirect()->back();
    }

    /**
     * Delete a file
     */
    public function destroy($id)
    {
        $file = File::findOrFail($id);

        // Use Gate facade to check permission
        if (Gate::denies('delete', $file)) {
            abort(403);
        }

        // Delete the file from storage
        Storage::disk('private')->delete($file->path);

        // Delete the record
        $file->delete();

        return redirect()->back()->with('success', 'File deleted successfully');
    }
}
