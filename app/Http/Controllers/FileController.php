<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use App\Services\PinataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FileController extends Controller
{
    protected $pinataService;

    public function __construct(PinataService $pinataService)
    {
        $this->pinataService = $pinataService;
    }

    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return ['recentFiles' => [], 'quickAccessFiles' => []];
        }

        try {
            $recentFiles = $user->files()
                ->where('is_trashed', false)
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
                        'lastModified' => optional($file->updated_at)->diffForHumans(),
                        'starred' => $file->starred,
                        'folder_id' => $file->folder_id,
                        'folder_name' => optional($file->folder)->name,
                        'ipfs_hash' => $file->ipfs_hash,
                        'ipfs_url' => $file->ipfs_hash ? "https://gateway.pinata.cloud/ipfs/{$file->ipfs_hash}" : null,
                    ];
                });

            $quickAccessFiles = $user->files()
                ->where('is_trashed', false)
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
                        'date' => optional($file->updated_at)->diffForHumans(),
                        'starred' => $file->starred,
                        'folder_id' => $file->folder_id,
                        'folder_name' => optional($file->folder)->name,
                        'ipfs_hash' => $file->ipfs_hash,
                        'ipfs_url' => $file->ipfs_hash ? "https://gateway.pinata.cloud/ipfs/{$file->ipfs_hash}" : null,
                    ];
                });

            $starredFolders = $user->folders()
                ->where('is_trashed', false)
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
                        'date' => optional($folder->updated_at)->diffForHumans(),
                        'starred' => $folder->starred,
                    ];
                });

            $quickAccessItems = collect(array_merge(
                $quickAccessFiles->toArray(),
                $starredFolders->toArray()
            ))
                ->filter(fn($item) => isset($item['date']) && isset($item['starred']))
                ->sortByDesc('starred')
                ->sortByDesc('date')
                ->take(4)
                ->values();

            return [
                'recentFiles' => $recentFiles,
                'quickAccessFiles' => $quickAccessItems,
            ];

        } catch (\Exception $e) {
            Log::error('Error in FileController@index', [
                'message' => $e->getMessage(),
                'trace_snippet' => $e->getTraceAsString()
            ]);
            return ['recentFiles' => [], 'quickAccessFiles' => []];
        }
    }



    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400',
            'folder_id' => 'nullable|exists:folders,id',
        ]);
    
        $file = $request->file('file');
        $user = Auth::user();

        $userDirectory = 'files/' . $user->id;
        if (!Storage::disk('private')->exists($userDirectory)) {
            Storage::disk('private')->makeDirectory($userDirectory);
        }
    
        $localStorageLimit = 50 * 1024 * 1024 * 1024;
        if ($user->local_storage_used + $file->getSize() > $localStorageLimit) {
            return redirect()->back()->with('error', 'Local storage limit reached (50GB). Please delete some files first.');
        }
    
        if ($request->folder_id) {
            $folder = Folder::findOrFail($request->folder_id);
            if (Gate::denies('addFiles', $folder)) { abort(403); }
        }
    
        $filename = uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('files/' . $user->id, $filename, 'private');
        $mimeType = $file->getMimeType();
        $type = 'Other';
    
        if (strpos($mimeType, 'image') !== false) { $type = 'Image'; }
        elseif (strpos($mimeType, 'pdf') !== false) { $type = 'PDF'; }
        elseif (strpos($mimeType, 'spreadsheet') !== false || strpos($mimeType, 'excel') !== false) { $type = 'Spreadsheet'; }
        elseif (strpos($mimeType, 'presentation') !== false || strpos($mimeType, 'powerpoint') !== false) { $type = 'Presentation'; }
        elseif (strpos($mimeType, 'word') !== false || strpos($mimeType, 'document') !== false) { $type = 'Document'; }
    
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
            'ipfs_hash' => null,
            'ipfs_url' => null,
        ]);
    
        return redirect()->back()->with('success', 'File uploaded successfully to local storage');
    }
    

    public function download($id)
    {
        $file = File::findOrFail($id);
        if (Auth::id() !== $file->user_id) { abort(403); }

        if ($file->ipfs_hash && $file->ipfs_url) {
            return redirect($file->ipfs_url);
        }

        $fullPath = storage_path('app/private/' . $file->path);
        if (!file_exists($fullPath)) { return response()->json(['error' => 'File not found'], 404); }
        $file->update(['last_accessed' => now()]);

        return response()->file($fullPath, [
            'Content-Disposition' => 'attachment; filename="' . $file->original_name . '"',
            'Content-Type' => $file->mime_type
        ]);
    }

    public function toggleStar($id)
    {
        $file = File::findOrFail($id);
        if (Gate::denies('update', $file)) { abort(403); }
        $file->timestamps = false;
        $file->update(['starred' => !$file->starred]);
        return redirect()->back();
    }

    public function destroy($id)
    {
        try {
            $file = File::findOrFail($id);

            if (Gate::denies('delete', $file)) {
                abort(403);
            }

            $file->update([
                'is_trashed' => true,
                'trashed_at' => now()
            ]);

            return redirect()->back()->with('success', 'File moved to trash');
        } catch (\Exception $e) {
            Log::error('Error in FileController@destroy', [
                'message' => $e->getMessage(),
                'trace_snippet' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Could not move file to trash. Please try again.');
        }
    }

    public function rename(Request $request, $id)
    {
        $file = File::findOrFail($id);
        if (Gate::denies('update', $file)) { abort(403); }
        $request->validate(['name' => 'required|string|max:255']);
        $file->update(['name' => $request->name]);
        return redirect()->back();
    }

    public function move(Request $request, $id)
    {
        $file = File::findOrFail($id);
        if (Gate::denies('update', $file)) { abort(403); }
        $request->validate(['folder_id' => 'nullable|exists:folders,id']);

        if ($request->folder_id) {
            $folder = Folder::findOrFail($request->folder_id);
            if (Gate::denies('addFiles', $folder)) { abort(403); }
        }

        $file->update(['folder_id' => $request->folder_id]);
        return redirect()->back()->with('success', 'File moved successfully');
    }
}
