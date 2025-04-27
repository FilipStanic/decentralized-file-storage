<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Services\PinataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IPFSController extends Controller
{
    protected $pinataService;

    public function __construct(PinataService $pinataService)
    {
        $this->pinataService = $pinataService;
    }

    public function index()
    {
        $user = Auth::user();

        $ipfsFiles = $user->files()
            ->whereNotNull('ipfs_hash')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'type' => $file->type,
                    'size' => $file->formatted_size,
                    'lastModified' => optional($file->updated_at)->diffForHumans(),
                    'ipfs_hash' => $file->ipfs_hash,
                    'ipfs_url' => $file->ipfs_url ?? $this->pinataService->getGatewayUrl($file->ipfs_hash),
                ];
            });

        return Inertia::render('IPFS/Index', [
            'ipfsFiles' => $ipfsFiles,
            'storageStats' => [
                'used' => $user->formatted_ipfs_storage_used,
                'percentage' => $user->ipfs_storage_percentage,
                'limit' => config('storage.ipfs_limit', '1.00 GB'),
            ]
        ]);
    }

    public function uploadToIPFS(File $file)
    {
        $this->authorize('update', $file);

        $user = Auth::user();

        if ($file->ipfs_hash) {
            return redirect()->back()->with('error', 'File is already on IPFS');
        }

        if (!$user->hasEnoughIpfsStorage($file->size)) {
            return redirect()->back()->with('error', 'IPFS storage limit exceeded. Your limit is 1GB.');
        }

        $localPath = storage_path('app/private/' . $file->path);

        if (!file_exists($localPath)) {
            return redirect()->back()->with('error', 'Local file not found');
        }

        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $localPath,
            $file->original_name,
            $file->mime_type,
            null,
            true
        );

        try {
            $pinataResult = $this->pinataService->uploadFile($uploadedFile, $file->name);

            if (isset($pinataResult['IpfsHash'])) {
                $file->update([
                    'ipfs_hash' => $pinataResult['IpfsHash'],
                    'ipfs_url' => $this->pinataService->getGatewayUrl($pinataResult['IpfsHash']),
                ]);

                return redirect()->back()->with('success', 'File uploaded to IPFS successfully');
            }

            return redirect()->back()->with('error', 'Failed to upload file to IPFS');
        } catch (\Exception $e) {
            Log::error('Pinata upload failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'An unexpected error occurred while uploading to IPFS.');
        }
    }

    public function removeFromIPFS(File $file)
    {
        $this->authorize('delete', $file);

        if (!$file->ipfs_hash) {
            return redirect()->back()->with('error', 'File is not on IPFS');
        }

        try {
            $result = $this->pinataService->unpin($file->ipfs_hash);

            if ($result) {
                $file->update([
                    'ipfs_hash' => null,
                    'ipfs_url' => null,
                ]);

                return redirect()->back()->with('success', 'File removed from IPFS successfully');
            }

            return redirect()->back()->with('error', 'Failed to remove file from IPFS');
        } catch (\Exception $e) {
            Log::error('Pinata unpin failed', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'An unexpected error occurred while removing from IPFS.');
        }
    }

    public function storageStats()
    {
        $user = Auth::user();

        return response()->json([
            'ipfs' => [
                'used' => $user->formatted_ipfs_storage_used,
                'percentage' => $user->ipfs_storage_percentage,
                'limit' => config('storage.ipfs_limit', '1.00 GB'),
            ],
            'local' => [
                'used' => $user->formatted_local_storage_used,
                'percentage' => $user->local_storage_percentage,
                'limit' => config('storage.local_limit', '50.00 GB'),
            ]
        ]);
    }
}
