<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TrashController extends Controller
{
    public function index()
    {
        try {
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
                        'item_type' => 'file',
                        'starred' => $file->starred,
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
                        'item_type' => 'folder',
                        'starred' => $folder->starred,
                    ];
                });

            return Inertia::render('Trash/Index', [
                'trashedFiles' => $trashedFiles,
                'trashedFolders' => $trashedFolders
            ]);
        } catch (\Exception $e) {
            Log::error('Error in TrashController@index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Trash/Index', [
                'trashedFiles' => [],
                'trashedFolders' => [],
                'error' => 'Failed to load trash items. Please try again.'
            ]);
        }
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


            $wasStarred = $file->starred;


            $file->folder_id = null;
            $file->is_trashed = true;
            $file->trashed_at = now();

            $file->starred = $wasStarred;
            $file->save();

            return redirect()->back()->with('success', 'File moved to trash');
        } else {
            $folder = Folder::findOrFail($item_id);

            if (Auth::id() !== $folder->user_id) {
                abort(403);
            }


            $wasStarred = $folder->starred;


            $folder->parent_id = null;
            $folder->is_trashed = true;
            $folder->trashed_at = now();

            $folder->starred = $wasStarred;
            $folder->save();

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


            $file->is_trashed = false;
            $file->trashed_at = null;
            $file->save();

            return redirect()->back()->with('success', 'File restored');
        } else {
            $folder = Folder::findOrFail($item_id);

            if (Auth::id() !== $folder->user_id) {
                abort(403);
            }


            $folder->is_trashed = false;
            $folder->trashed_at = null;
            $folder->save();

            return redirect()->back()->with('success', 'Folder restored');
        }
    }

    public function emptyTrash()
    {
        $user = Auth::user();


        $trashedFiles = $user->files()->where('is_trashed', true)->get();


        foreach ($trashedFiles as $file) {

            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }


            Storage::disk('private')->delete($file->path);


            $file->delete();
        }


        $trashedFolders = $user->folders()->where('is_trashed', true)->get();


        foreach ($trashedFolders as $folder) {
            $this->deleteFolderContents($folder);
            $folder->delete();
        }

        return redirect()->back()->with('success', 'Trash emptied');
    }

    public function permanentlyDelete(Request $request)
    {
        try {
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


                if ($file->ipfs_hash) {
                    app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
                }


                Storage::disk('private')->delete($file->path);


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
        } catch (\Exception $e) {
            Log::error('Error in TrashController@permanentlyDelete', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to delete item. Please try again.');
        }
    }

    private function deleteFolderContents($folder)
    {

        $files = $folder->files;

        foreach ($files as $file) {

            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }


            Storage::disk('private')->delete($file->path);


            $file->delete();
        }


        foreach ($folder->children as $subfolder) {
            $this->deleteFolderContents($subfolder);
            $subfolder->delete();
        }
    }



    public function cleanupTrash()
    {
        $cutoff = now()->subHours(24);


        $expiredFiles = File::where('is_trashed', true)
            ->where('trashed_at', '<', $cutoff)
            ->get();

        foreach ($expiredFiles as $file) {

            if ($file->ipfs_hash) {
                app(\App\Services\PinataService::class)->unpin($file->ipfs_hash);
            }


            Storage::disk('private')->delete($file->path);


            $file->delete();
        }


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
