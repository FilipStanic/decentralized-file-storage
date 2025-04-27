<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Services\PinataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
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

    public function uploadToIPFS($id)
    {
        try {
            $file = File::findOrFail($id);

            // Check if user owns this file or has permission
            if (Auth::id() !== $file->user_id) {
                return response()->json(['message' => 'You do not have permission to upload this file to IPFS'], 403);
            }

            if ($file->ipfs_hash) {
                return response()->json(['message' => 'File is already on IPFS'], 400);
            }

            $user = Auth::user();
            if (!$user->hasEnoughIpfsStorage($file->size)) {
                return response()->json(['message' => 'IPFS storage limit exceeded. Your limit is 1GB.'], 400);
            }

            $localPath = storage_path('app/private/' . $file->path);

            if (!file_exists($localPath)) {
                return response()->json(['message' => 'Local file not found'], 404);
            }

            $uploadedFile = new \Illuminate\Http\UploadedFile(
                $localPath,
                $file->original_name,
                $file->mime_type,
                null,
                true
            );

            $pinataResult = $this->pinataService->uploadFile($uploadedFile, $file->name);

            if (isset($pinataResult['IpfsHash'])) {
                $file->update([
                    'ipfs_hash' => $pinataResult['IpfsHash'],
                    'ipfs_url' => $this->pinataService->getGatewayUrl($pinataResult['IpfsHash']),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'File uploaded to IPFS successfully',
                    'ipfs_hash' => $pinataResult['IpfsHash'],
                    'ipfs_url' => $this->pinataService->getGatewayUrl($pinataResult['IpfsHash'])
                ]);
            }

            return response()->json(['message' => 'Failed to upload file to IPFS'], 500);
        } catch (\Exception $e) {
            Log::error('Pinata upload failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'An unexpected error occurred while uploading to IPFS.'], 500);
        }
    }

    public function removeFromIPFS($id)
    {
        try {
            $file = File::findOrFail($id);

            // Check if user owns this file or has permission
            if (Auth::id() !== $file->user_id) {
                return response()->json(['message' => 'You do not have permission to remove this file from IPFS'], 403);
            }

            if (!$file->ipfs_hash) {
                return response()->json(['message' => 'File is not on IPFS'], 400);
            }

            $result = $this->pinataService->unpin($file->ipfs_hash);

            if ($result) {
                $file->update([
                    'ipfs_hash' => null,
                    'ipfs_url' => null,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'File removed from IPFS successfully'
                ]);
            }

            return response()->json(['message' => 'Failed to remove file from IPFS'], 500);
        } catch (\Exception $e) {
            Log::error('Pinata unpin failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'An unexpected error occurred while removing from IPFS.'], 500);
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
