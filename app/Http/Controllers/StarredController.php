<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StarredController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        try {
            $starredFiles = $user->files()
                ->where('starred', true)
                ->orderBy('updated_at', 'desc')
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
                    ];
                });

            $starredFolders = $user->folders()
                ->where('starred', true)
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function ($folder) {
                    return [
                        'id' => $folder->id,
                        'name' => $folder->name,
                        'color' => $folder->color,
                        'type' => 'folder',
                        'lastModified' => optional($folder->updated_at)->diffForHumans(),
                        'starred' => $folder->starred,
                        'item_count' => $folder->files->count() + $folder->children->count(),
                    ];
                });

            return Inertia::render('Starred/Index', [
                'starredFiles' => $starredFiles,
                'starredFolders' => $starredFolders,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('home')->with('error', 'Unable to fetch starred items');
        }
    }
}
