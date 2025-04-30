<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SidebarController extends Controller
{
    

    public function availableFolders(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'folders' => []
            ]);
        }

        $currentFolderId = $request->query('current_folder_id');

        $allFolders = $user->folders()
            ->where('is_trashed', false)
            ->get();

        $result = [];

        
        if ($currentFolderId) {
            $result[] = [
                'id' => null,
                'name' => 'Root',
                'color' => '#6B7280',
                'path' => ['Root'],
                'full_path' => 'Root'
            ];
        }

        
        if ($currentFolderId) {
            $currentFolder = Folder::find($currentFolderId);
            if ($currentFolder) {
                $subfolders = $allFolders->where('parent_id', $currentFolderId);

                foreach ($subfolders as $subfolder) {
                    if ($subfolder->id == $currentFolderId) continue;

                    $result[] = [
                        'id' => $subfolder->id,
                        'name' => $subfolder->name,
                        'color' => $subfolder->color ?? '#6366F1',
                        'path' => [$subfolder->name],
                        'full_path' => $subfolder->name,
                        'parent_id' => $currentFolderId
                    ];
                }
            }
        }

        
        if ($currentFolderId) {
            $currentFolder = Folder::find($currentFolderId);
            $excludedIds = [$currentFolderId];

            if ($currentFolder) {
                $descendantIds = $currentFolder->getAllChildren()->pluck('id')->toArray();
                $excludedIds = array_merge($excludedIds, $descendantIds);
            }

            $otherFolders = $allFolders->filter(function($folder) use($excludedIds, $result) {
                return !in_array($folder->id, $excludedIds) &&
                    !collect($result)->contains('id', $folder->id);
            });

            $rootFolders = $otherFolders->whereNull('parent_id');
            foreach ($rootFolders as $folder) {
                
                if ($folder->name !== 'Root') {
                    $result[] = [
                        'id' => $folder->id,
                        'name' => $folder->name,
                        'color' => $folder->color ?? '#6366F1',
                        'path' => [$folder->name],
                        'full_path' => $folder->name
                    ];
                }
            }

            foreach ($rootFolders as $rootFolder) {
                $this->addChildFoldersToResult($result, $otherFolders, $rootFolder, [$rootFolder->name]);
            }
        } else {
            
            $rootFolders = $allFolders->whereNull('parent_id');
            foreach ($rootFolders as $folder) {
                
                if ($folder->name !== 'Root') {
                    $result[] = [
                        'id' => $folder->id,
                        'name' => $folder->name,
                        'color' => $folder->color ?? '#6366F1',
                        'path' => [$folder->name],
                        'full_path' => $folder->name
                    ];
                }
            }

            foreach ($rootFolders as $rootFolder) {
                if ($rootFolder->name !== 'Root') {
                    $this->addChildFoldersToResult($result, $allFolders, $rootFolder, [$rootFolder->name]);
                }
            }
        }

        return response()->json([
            'folders' => $result
        ]);
    }

    private function addChildFoldersToResult(&$result, $allFolders, $parentFolder, $parentPath)
    {
        $children = $allFolders->where('parent_id', $parentFolder->id);
        foreach ($children as $child) {
            $path = array_merge($parentPath, [$child->name]);
            $result[] = [
                'id' => $child->id,
                'name' => $child->name,
                'color' => $child->color ?? '#6366F1',
                'path' => $path,
                'full_path' => implode(' > ', $path),
                'parent_id' => $parentFolder->id
            ];

            $this->addChildFoldersToResult($result, $allFolders, $child, $path);
        }
    }
}
