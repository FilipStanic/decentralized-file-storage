<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


Route::get('/', function () {
    // Get file data if the user is authenticated
    $fileData = Auth::check() ? app(FileController::class)->index() : [
        'recentFiles' => [],
        'quickAccessFiles' => [],
    ];

    return Inertia::render('HomePage', array_merge([
        'auth' => [
            'user' => Auth::user(),
        ],
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ], $fileData));
})->name('home');

// File management routes - all require authentication
Route::middleware(['auth'])->group(function () {
    Route::post('/files', [FileController::class, 'store'])->name('files.store');
    Route::get('/files/{file}/download', [FileController::class, 'download'])->name('files.download');
    Route::post('/files/{file}/toggle-star', [FileController::class, 'toggleStar'])->name('files.toggle-star');
    Route::delete('/files/{file}', [FileController::class, 'destroy'])->name('files.destroy');
    Route::put('/files/{file}/rename', [FileController::class, 'rename'])->name('files.rename');
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Authentication routes (already provided by Breeze)
require __DIR__.'/auth.php';
