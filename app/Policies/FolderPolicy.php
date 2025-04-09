<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FolderPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Folder $folder)
    {
        return $user->id === $folder->user_id ||
            $folder->sharedWith->contains($user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user)
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Folder $folder)
    {

        if ($user->id === $folder->user_id) {
            return true;
        }


        $share = $folder->sharedWith()->where('user_id', $user->id)->first();
        return $share && $share->pivot->permission === 'edit';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Folder $folder)
    {

        return $user->id === $folder->user_id;
    }

    /**
     * Determine whether the user can add files to the folder.
     */
    public function addFiles(User $user, Folder $folder)
    {

        if ($user->id === $folder->user_id) {
            return true;
        }


        $share = $folder->sharedWith()->where('user_id', $user->id)->first();
        return $share && $share->pivot->permission === 'edit';
    }
}
