<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SidebarController extends Controller
{
    public function data()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'rootFolders' => []
            ]);
        }

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

        return response()->json([
            'rootFolders' => $rootFolders
        ]);
    }
}
