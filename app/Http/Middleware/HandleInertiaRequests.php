<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Folder;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],
            // Add this shared prop logic
            'sharedSidebarFolders' => function () use ($request) {
                if ($user = $request->user()) {
                    return $user->folders()
                        ->whereNull('parent_id')
                        ->orderBy('name')
                        ->get()
                        ->map(fn(Folder $folder) => [
                            'id' => $folder->id,
                            'name' => $folder->name,
                            'color' => $folder->color ?? '#6366F1',
                        ]);
                }
                return [];
            }
        ]);
    }   
}
