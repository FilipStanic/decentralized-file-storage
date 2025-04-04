<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Support\Facades\Auth;

class SidebarController extends Controller
{
    public function __invoke()
    {
        $user = Auth::user();

        if (!$user) {
            return [
                'rootFolders' => [],
                'recentFolders' => []
            ];
        }

        // Get root folders
        $rootFolders = $user->folders()
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'color' => $folder->color ?? '#6366F1',
                ];
            });

        $recentFolders = $user->folders()
            ->whereNotNull('last_accessed')
            ->orderBy('last_accessed', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'color' => $folder->color ?? '#6366F1',
                ];
            });

        return [
            'rootFolders' => $rootFolders,
            'recentFolders' => $recentFolders
        ];
    }
}
