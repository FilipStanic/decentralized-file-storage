<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\CustomResetPassword;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    public function sharedFiles()
    {
        return $this->belongsToMany(File::class, 'file_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    public function sharedFolders()
    {
        return $this->belongsToMany(Folder::class, 'folder_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    public function getLocalStorageUsedAttribute()
    {
        return $this->files()->sum('size');
    }

    public function getIpfsStorageUsedAttribute()
    {
        return $this->files()->whereNotNull('ipfs_hash')->sum('size');
    }

    public function getFormattedLocalStorageUsedAttribute()
    {
        return $this->formatBytes($this->local_storage_used);
    }

    public function getFormattedIpfsStorageUsedAttribute()
    {
        return $this->formatBytes($this->ipfs_storage_used);
    }

    public function getIpfsStoragePercentageAttribute()
    {
        $limit = 1 * 1024 * 1024 * 1024; // 1GB in bytes
        $percentage = ($this->ipfs_storage_used / $limit) * 100;
        return min(round($percentage, 1), 100);
    }

    public function getLocalStoragePercentageAttribute()
    {
        $limit = 50 * 1024 * 1024 * 1024;
        $percentage = ($this->local_storage_used / $limit) * 100;
        return min(round($percentage, 1), 100);
    }

    protected function formatBytes($bytes, $precision = 2)
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $base = 1024;
        $exponent = floor(log($bytes) / log($base));

        return round($bytes / pow($base, $exponent), $precision) . ' ' . $units[$exponent];
    }

    public function hasEnoughIpfsStorage($fileSize)
    {
        $limit = 1 * 1024 * 1024 * 1024; // 1GB in bytes
        return ($this->ipfs_storage_used + $fileSize) <= $limit;
    }

    public function getProfilePictureUrlAttribute()
    {
        if ($this->profile_picture) {
            return $this->profile_picture;
        }

        return '/images/default/default-avatar.png';
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }
}
