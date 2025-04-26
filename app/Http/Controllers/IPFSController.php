<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Services\PinataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'ipfsFiles' => $ipfsFiles
        ]);
    }

    public function uploadToIPFS($id)
    {
        $file = File::findOrFail($id);

        if (Auth::id() !== $file->user_id) {
            abort(403);
        }

        if ($file->ipfs_hash) {
            return redirect()->back()->with('error', 'File is already on IPFS');
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

        $pinataResult = $this->pinataService->uploadFile($uploadedFile, $file->name);

        if ($pinataResult && isset($pinataResult['IpfsHash'])) {
            $file->update([
                'ipfs_hash' => $pinataResult['IpfsHash'],
                'ipfs_url' => $this->pinataService->getGatewayUrl($pinataResult['IpfsHash']),
            ]);

            return redirect()->back()->with('success', 'File uploaded to IPFS successfully');
        }

        return redirect()->back()->with('error', 'Failed to upload file to IPFS');
    }

    public function removeFromIPFS($id)
    {
        $file = File::findOrFail($id);

        if (Auth::id() !== $file->user_id) {
            abort(403);
        }

        if (!$file->ipfs_hash) {
            return redirect()->back()->with('error', 'File is not on IPFS');
        }

        $result = $this->pinataService->unpin($file->ipfs_hash);

        if ($result) {
            $file->update([
                'ipfs_hash' => null,
                'ipfs_url' => null,
            ]);

            return redirect()->back()->with('success', 'File removed from IPFS successfully');
        }

        return redirect()->back()->with('error', 'Failed to remove file from IPFS');
    }
}
