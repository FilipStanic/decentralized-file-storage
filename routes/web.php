<?php

use App\Http\Controllers\FileController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StarredController;
use App\Http\Controllers\IPFSController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\SidebarController;


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

    // Add the starred route
    Route::get('/starred', [StarredController::class, 'index'])->name('starred.index');

    // Add IPFS routes
    Route::get('/ipfs', [IPFSController::class, 'index'])->name('ipfs.index');
    Route::post('/ipfs/upload/{id}', [IPFSController::class, 'uploadToIPFS'])->name('ipfs.upload');
    Route::delete('/ipfs/remove/{id}', [IPFSController::class, 'removeFromIPFS'])->name('ipfs.remove');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/sidebar/data', [SidebarController::class, 'data'])->name('sidebar.data');


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



require __DIR__.'/auth.php';
