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
    ];

    protected $casts = [
        'size' => 'integer',
        'starred' => 'boolean',
        'last_accessed' => 'datetime',
    ];

    /**
     * Get the user that owns the file.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the folder that contains the file.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(Folder::class);
    }

    /**
     * Get the users with whom this file is shared.
     */
    public function sharedWith(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'file_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    /**
     * Format the file size for human readability.
     */
    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if the file is shared.
     */
    public function getIsSharedAttribute(): bool
    {
        return $this->sharedWith()->count() > 0;
    }

    /**
     * Get the count of users this file is shared with.
     */
    public function getShareCountAttribute(): int
    {
        return $this->sharedWith()->count();
    }

    /**
     * Check if the file is recently modified (within 7 days).
     */
    public function getIsRecentAttribute(): bool
    {
        return $this->updated_at->diffInDays(now()) <= 7;
    }
}
