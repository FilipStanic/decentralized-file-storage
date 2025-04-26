<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PinataService
{
    protected $apiKey;
    protected $secretKey;
    protected $jwt;
    protected $baseUrl = 'https://api.pinata.cloud';

    public function __construct()
    {
        $this->apiKey = env('PINATA_API_KEY');
        $this->secretKey = env('PINATA_SECRET_KEY');
        $this->jwt = env('PINATA_JWT');
    }

    public function uploadFile(UploadedFile $file, string $name = null)
    {
        try {
            $filePath = $file->getRealPath();
            $fileName = $name ?? $file->getClientOriginalName();

            $response = Http::withHeaders([
                'pinata_api_key' => $this->apiKey,
                'pinata_secret_api_key' => $this->secretKey,
            ])
                ->attach('file', file_get_contents($filePath), $fileName)
                ->post("{$this->baseUrl}/pinning/pinFileToIPFS", [
                    'pinataMetadata' => json_encode([
                        'name' => $fileName,
                    ]),
                ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Pinata upload failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Pinata service error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return null;
        }
    }

    public function uploadFileWithJWT(UploadedFile $file, string $name = null)
    {
        try {
            $filePath = $file->getRealPath();
            $fileName = $name ?? $file->getClientOriginalName();

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->jwt}",
            ])
                ->attach('file', file_get_contents($filePath), $fileName)
                ->post("{$this->baseUrl}/pinning/pinFileToIPFS");

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Pinata JWT upload failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Pinata JWT service error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return null;
        }
    }

    public function pinJSONToIPFS(array $jsonData, string $name = null)
    {
        try {
            $response = Http::withHeaders([
                'pinata_api_key' => $this->apiKey,
                'pinata_secret_api_key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])
                ->post("{$this->baseUrl}/pinning/pinJSONToIPFS", [
                    'pinataContent' => $jsonData,
                    'pinataMetadata' => [
                        'name' => $name ?? 'JSON Data ' . time(),
                    ],
                ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Pinata JSON upload failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Pinata JSON service error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return null;
        }
    }

    public function getFileList($limit = 10)
    {
        try {
            $response = Http::withHeaders([
                'pinata_api_key' => $this->apiKey,
                'pinata_secret_api_key' => $this->secretKey,
            ])
                ->get("{$this->baseUrl}/data/pinList", [
                    'status' => 'pinned',
                    'pageLimit' => $limit,
                ]);

            if ($response->successful()) {
                return $response->json();
            } else {
                Log::error('Pinata get list failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return null;
            }
        } catch (\Exception $e) {
            Log::error('Pinata list service error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return null;
        }
    }

    public function unpin($ipfsHash)
    {
        try {
            $response = Http::withHeaders([
                'pinata_api_key' => $this->apiKey,
                'pinata_secret_api_key' => $this->secretKey,
            ])
                ->delete("{$this->baseUrl}/pinning/unpin/{$ipfsHash}");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Pinata unpin service error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'ipfsHash' => $ipfsHash,
            ]);
            return false;
        }
    }

    public function getGatewayUrl($ipfsHash)
    {
        return "https://gateway.pinata.cloud/ipfs/{$ipfsHash}";
    }
}
