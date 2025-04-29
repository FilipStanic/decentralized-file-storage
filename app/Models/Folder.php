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
        'is_trashed',
        'trashed_at',
        'last_accessed',
    ];

    protected $casts = [
        'starred' => 'boolean',
        'is_trashed' => 'boolean',
        'trashed_at' => 'datetime',
        'last_accessed' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'folder_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    public function getIsSharedAttribute(): bool
    {
        return $this->sharedWith()->count() > 0;
    }

    public function getShareCountAttribute(): int
    {
        return $this->sharedWith()->count();
    }

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

    public function getAllChildren()
    {
        $allChildren = collect();

        foreach ($this->children as $child) {

            $allChildren->push($child);

            $childrenOfChild = $child->getAllChildren();
            if ($childrenOfChild->count() > 0) {
                $allChildren = $allChildren->merge($childrenOfChild);
            }
        }

        return $allChildren;
    }

    public function scopeNotTrashed($query)
    {
        return $query->where('is_trashed', false);
    }

    public function scopeTrashed($query)
    {
        return $query->where('is_trashed', true);
    }

    public function getTimeUntilPermanentDeletionAttribute()
    {
        if (!$this->is_trashed || !$this->trashed_at) {
            return null;
        }

        $deleteAt = $this->trashed_at->addHours(24);
        return $deleteAt->diffForHumans(now());
    }

    public function getTrashedItemCount()
    {
        $fileCount = $this->files()->count();
        $folderCount = $this->getAllChildren()->count();

        return $fileCount + $folderCount;
    }
}
