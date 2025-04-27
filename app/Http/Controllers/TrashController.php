<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TrashController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $trashedFiles = $user->files()
            ->where('is_trashed', true)
            ->orderBy('trashed_at', 'desc')
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'size' => $file->formatted_size,
                    'trashed_at' => $file->trashed_at->diffForHumans(),
                    'deleteAfter' => $file->trashed_at->addHours(24)->diffForHumans(),
                    'item_type' => 'file'
                ];
            });

        $trashedFolders = $user->folders()
            ->where('is_trashed', true)
            ->orderBy('trashed_at', 'desc')
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'color' => $folder->color,
                    'trashed_at' => $folder->trashed_at->diffForHumans(),
                    'deleteAfter' => $folder->trashed_at->addHours(24)->diffForHumans(),
                    'item_count' => $folder->getTrashedItemCount(),
                    'item_type' => 'folder'
                ];
            });

        return Inertia::render('Trash/Index', [
            'trashedFiles' => $trashedFiles,
            'trashedFolders' => $trashedFolders
        ]);
    }

    public function moveToTrash(Request $request)
    {
        $request->validate([
            'item_type' => 'required|in:file,folder',
            'item_id' => 'required|integer'
        ]);

        $item_type = $request->item_type;
        $item_id = $request->item_id;

        if ($item_type === 'file') {
            $file = File::findOrFail($item_id);

            if (Auth::id() !== $file->user_id) {
                abort(403);
            }

            $file->update([
                'is_trashed' => true,
                'trashed_at' => now()
            ]);

            return redirect()->back()->with('success', 'File moved to trash');
        } else {
            $folder = Folder::findOrFail($item_id);

            if (Auth::id() !== $folder->user_id) {
                abort(403);
            }

            $folder->update([
                'is_trashed' => true,
                'trashed_at' => now()
            ]);

            return redirect()->back()->with('success', 'Folder moved to trash');
        }
    }

    public function restore(Request $request)
    {
        $request->validate([
            'item_type' => 'required|in:file,folder',
            'item_id' => 'required|integer'
        ]);

        $item_type = $request->item_type;
        $item_id = $request->item_id;

        if ($item_type === 'file') {
            $file = File::findOrFail($item_id);

            if (Auth::id() !== $file->user_id) {
                abort(403);
            }

            $file->update([
                'is_trashed' => false,
                'trashed_at' => null
            ]);

            return redirect()->back()->with('success', 'File restored');
        } else {
            $folder = Folder::findOrFail($item_id);

            if (Auth::id() !== $folder->user_id) {
                abort(403);
            }

            $folder->update([
                'is_trashed' => false,
                'trashed_at' => null
            ]);

            return redirect()->back()->with('success', 'Folder restored');
        }
    }

    public function emptyTrash()
    {
        $user = Auth::user();

        // Get all trashed files
        $trashedFiles = $user->files()->where('is_trashed', true)->get();

        // Delete files from storage and database
        foreach ($trashedFiles as $file) {
            // If file is on IPFS, remove it
            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }

            // Delete file from storage
            Storage::disk('private')->delete($file->path);

            // Delete file record
            $file->delete();
        }

        // Get all trashed folders
        $trashedFolders = $user->folders()->where('is_trashed', true)->get();

        // Delete folders and their contents
        foreach ($trashedFolders as $folder) {
            $this->deleteFolderContents($folder);
            $folder->delete();
        }

        return redirect()->back()->with('success', 'Trash emptied');
    }

    public function permanentlyDelete(Request $request)
    {
        $request->validate([
            'item_type' => 'required|in:file,folder',
            'item_id' => 'required|integer'
        ]);

        $item_type = $request->item_type;
        $item_id = $request->item_id;

        if ($item_type === 'file') {
            $file = File::findOrFail($item_id);

            if (Auth::id() !== $file->user_id) {
                abort(403);
            }

            // If file is on IPFS, remove it
            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }

            // Delete file from storage
            Storage::disk('private')->delete($file->path);

            // Delete file record
            $file->delete();

            return redirect()->back()->with('success', 'File permanently deleted');
        } else {
            $folder = Folder::findOrFail($item_id);

            if (Auth::id() !== $folder->user_id) {
                abort(403);
            }

            $this->deleteFolderContents($folder);
            $folder->delete();

            return redirect()->back()->with('success', 'Folder permanently deleted');
        }
    }

    private function deleteFolderContents($folder)
    {
        // Get all files in the folder
        $files = $folder->files;

        foreach ($files as $file) {
            // If file is on IPFS, remove it
            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }

            // Delete file from storage
            Storage::disk('private')->delete($file->path);

            // Delete file record
            $file->delete();
        }

        // Delete subfolders recursively
        foreach ($folder->children as $subfolder) {
            $this->deleteFolderContents($subfolder);
            $subfolder->delete();
        }
    }

    // Method to clean up trashed items older than 24 hours
    // This would typically be called by a scheduled task
    public function cleanupTrash()
    {
        $cutoff = now()->subHours(24);

        // Find files trashed more than 24 hours ago
        $expiredFiles = File::where('is_trashed', true)
            ->where('trashed_at', '<', $cutoff)
            ->get();

        foreach ($expiredFiles as $file) {
            // If file is on IPFS, remove it
            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }

            // Delete file from storage
            Storage::disk('private')->delete($file->path);

            // Delete file record
            $file->delete();
        }

        // Find folders trashed more than 24 hours ago
        $expiredFolders = Folder::where('is_trashed', true)
            ->where('trashed_at', '<', $cutoff)
            ->get();

        foreach ($expiredFolders as $folder) {
            $this->deleteFolderContents($folder);
            $folder->delete();
        }

        return response()->json(['message' => 'Trash cleanup completed']);
    }
}
