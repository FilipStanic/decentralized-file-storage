<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Folder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'color',
        'starred',
        'last_accessed',
    ];

    protected $casts = [
        'starred' => 'boolean',
        'last_accessed' => 'datetime',
    ];

    /**
     * Get the user that owns the folder.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent folder.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    /**
     * Get the child folders.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    /**
     * Get all files in this folder.
     */
    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    /**
     * Get the users with whom this folder is shared.
     */
    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'folder_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    /**
     * Check if the folder is shared.
     */
    public function getIsSharedAttribute(): bool
    {
        return $this->sharedWith()->count() > 0;
    }

    /**
     * Get the count of users this folder is shared with.
     */
    public function getShareCountAttribute(): int
    {
        return $this->sharedWith()->count();
    }

    /**
     * Get the path to this folder (array of parent folders).
     */
    public function getPathAttribute(): array
    {
        $path = [];
        $current = $this;

        while ($current->parent_id !== null) {
            $current = $current->parent;
            array_unshift($path, [
                'id' => $current->id,
                'name' => $current->name,
            ]);
        }

        return $path;
    }

    /**
     * Get all subfolders recursively.
     */
    public function getAllChildren()
    {
        $children = $this->children;

        foreach ($this->children as $child) {
            $children = $children->merge($child->getAllChildren());
        }

        return $children;
    }
}
