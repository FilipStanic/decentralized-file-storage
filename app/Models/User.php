<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get all files owned by the user.
     */
    public function files()
    {
        return $this->hasMany(File::class);
    }

    /**
     * Get all folders owned by the user.
     */
    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    /**
     * Get all files shared with the user.
     */
    public function sharedFiles()
    {
        return $this->belongsToMany(File::class, 'file_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }

    /**
     * Get all folders shared with the user.
     */
    public function sharedFolders()
    {
        return $this->belongsToMany(Folder::class, 'folder_shares')
            ->withPivot('permission')
            ->withTimestamps();
    }
}
