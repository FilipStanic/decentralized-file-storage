<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\SidebarController;
use App\Http\Controllers\FolderController;


Route::get('/', function () {
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

Route::middleware(['auth'])->group(function () {
    Route::post('/files', [FileController::class, 'store'])->name('files.store');
    Route::get('/files/{id}/download', [FileController::class, 'download'])->name('files.download');
    Route::post('/files/{file}/toggle-star', [FileController::class, 'toggleStar'])->name('files.toggle-star');
    Route::delete('/files/{file}', [FileController::class, 'destroy'])->name('files.destroy');
    Route::put('/files/{file}/rename', [FileController::class, 'rename'])->name('files.rename');
});

Route::middleware('auth')->get('/sidebar-data', SidebarController::class)->name('sidebar.data');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/folders/{id?}', [FolderController::class, 'show'])->name('folders.show');
    Route::post('/folders', [FolderController::class, 'store'])->name('folders.store');
    Route::put('/folders/{folder}', [FolderController::class, 'update'])->name('folders.update');
    Route::delete('/folders/{folder}', [FolderController::class, 'destroy'])->name('folders.destroy');
    Route::post('/folders/{folder}/toggle-star', [FolderController::class, 'toggleStar'])->name('folders.toggle-star');
    Route::post('/folders/{folder?}/move-files', [FolderController::class, 'moveFiles'])->name('folders.move-files');
    Route::post('/folders/{targetFolder?}/move-folders', [FolderController::class, 'moveFolders'])->name('folders.move-folders');

    Route::post('/files/{id}/move', [FileController::class, 'move'])->name('files.move');
});


Route::middleware('auth')->get('/sidebar-data', SidebarController::class)->name('sidebar.data');


require __DIR__.'/auth.php';
