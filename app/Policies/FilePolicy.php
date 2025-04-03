<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FilePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, File $file)
    {
        return $user->id === $file->user_id;
    }

    /**
     * Determine whether the user can download the model.
     */
    public function download(User $user, File $file)
    {
        return $user->id === $file->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, File $file)
    {
        return $user->id === $file->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, File $file)
    {
        return $user->id === $file->user_id;
    }
}
