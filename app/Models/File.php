<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'folder_id',
        'name',
        'original_name',
        'mime_type',
        'extension',
        'path',
        'size',
        'type',
        'starred',
        'last_accessed',
        'ipfs_hash',
        'ipfs_url',
        'is_trashed',
        'trashed_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'starred' => 'boolean',
        'last_accessed' => 'datetime',
        'is_trashed' => 'boolean',
        'trashed_at' => 'datetime',
    ];

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'id';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'file_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getIsSharedAttribute(): bool
    {
        return $this->sharedWith()->count() > 0;
    }

    public function getShareCountAttribute(): int
    {
        return $this->sharedWith()->count();
    }

    public function getIsRecentAttribute(): bool
    {
        return $this->updated_at->diffInDays(now()) <= 7;
    }

    public function getIsOnIpfsAttribute(): bool
    {
        return !empty($this->ipfs_hash);
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
}
