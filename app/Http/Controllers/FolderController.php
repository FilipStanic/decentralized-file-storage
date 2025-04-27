<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class FolderController extends Controller
{
    public function show($id = null)
    {
        $user = Auth::user();
        $currentFolder = null;
        $breadcrumbs = [];

        if ($id) {
            $currentFolder = Folder::findOrFail($id);

            if ($currentFolder->is_trashed || Gate::denies('view', $currentFolder)) {
                abort(403);
            }

            $currentFolder->update(['last_accessed' => now()]);

            $breadcrumbs = $currentFolder->path;
            $breadcrumbs[] = [
                'id' => $currentFolder->id,
                'name' => $currentFolder->name,
            ];
        }

        $folders = $user->folders()
            ->where('is_trashed', false)
            ->when($id, function ($query) use ($id) {
                return $query->where('parent_id', $id);
            })
            ->when(!$id, function ($query) {
                return $query->whereNull('parent_id');
            })
            ->orderBy('name')
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'color' => $folder->color,
                    'starred' => $folder->starred,
                    'shared' => $folder->share_count > 0,
                    'last_modified' => $folder->updated_at->diffForHumans(),
                    'item_count' => $folder->files()->where('is_trashed', false)->count() + $folder->children()->where('is_trashed', false)->count(),
                ];
            });

        $files = $user->files()
            ->where('is_trashed', false)
            ->when($id, function ($query) use ($id) {
                return $query->where('folder_id', $id);
            })
            ->when(!$id, function ($query) {
                return $query->whereNull('folder_id');
            })
            ->orderBy('name')
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'size' => $file->formatted_size,
                    'shared' => $file->share_count > 0,
                    'lastModified' => $file->updated_at->diffForHumans(),
                    'starred' => $file->starred,
                ];
            });

        return Inertia::render('Folders/FolderView', [
            'currentFolder' => $currentFolder ? [
                'id' => $currentFolder->id,
                'name' => $currentFolder->name,
                'color' => $currentFolder->color,
            ] : null,
            'breadcrumbs' => $breadcrumbs,
            'folders' => $folders,
            'files' => $files,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:folders,id',
            'color' => 'nullable|string|max:7',
        ]);

        if ($request->parent_id) {
            $parentFolder = Folder::findOrFail($request->parent_id);
            if (Gate::denies('update', $parentFolder)) {
                abort(403);
            }
        }

        $folder = Auth::user()->folders()->create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'color' => $request->color,
            'last_accessed' => now(),
        ]);

        return redirect()->back()->with('success', 'Folder created successfully');
    }

    public function update(Request $request, Folder $folder)
    {
        if (Gate::denies('update', $folder)) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $folder->update([
            'name' => $request->name,
            'color' => $request->color,
        ]);

        return redirect()->back()->with('success', 'Folder updated successfully');
    }

    public function moveFiles(Request $request, Folder $folder = null)
    {
        $request->validate([
            'file_ids' => 'required|array',
            'file_ids.*' => 'exists:files,id',
        ]);

        if ($folder && Gate::denies('addFiles', $folder)) {
            abort(403);
        }

        $files = File::whereIn('id', $request->file_ids)->get();

        foreach ($files as $file) {
            if ($file->user_id !== Auth::id()) {
                abort(403);
            }
            $file->update([
                'folder_id' => $folder ? $folder->id : null,
            ]);
        }

        return redirect()->back()->with('success', 'Files moved successfully');
    }

    public function moveFolders(Request $request, Folder $targetFolder = null)
    {
        $request->validate([
            'folder_ids' => 'required|array',
            'folder_ids.*' => 'exists:folders,id',
        ]);

        if ($targetFolder && Gate::denies('update', $targetFolder)) {
            abort(403);
        }

        $folders = Folder::whereIn('id', $request->folder_ids)->get();

        foreach ($folders as $folder) {
            if ($folder->user_id !== Auth::id()) {
                abort(403);
            }

            if ($targetFolder && ($folder->id === $targetFolder->id ||
                    $folder->getAllChildren()->contains('id', $targetFolder->id))) {
                continue;
            }

            $folder->update([
                'parent_id' => $targetFolder ? $targetFolder->id : null,
            ]);
        }

        return redirect()->back()->with('success', 'Folders moved successfully');
    }

    public function toggleStar(Folder $folder)
    {
        if (Gate::denies('update', $folder)) {
            abort(403);
        }

        $folder->timestamps = false;
        $folder->update(['starred' => !$folder->starred]);

        return redirect()->back();
    }

    public function destroy(Folder $folder)
    {
        if (Gate::denies('delete', $folder)) {
            abort(403, 'You do not have permission to delete this folder');
        }

        $folder->update([
            'is_trashed' => true,
            'trashed_at' => now()
        ]);

        return redirect()->back()->with('success', 'Folder moved to trash');
    }

    private function deleteFolderContents(Folder $folder)
    {
        foreach ($folder->files as $file) {
            Storage::disk('private')->delete($file->path);
            $file->delete();
        }

        foreach ($folder->children as $subfolder) {
            $this->deleteFolderContents($subfolder);
            $subfolder->delete();
        }
    }
}
