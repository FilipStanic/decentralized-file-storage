<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class InitializeStorageCommand extends Command
{
    protected $signature = 'storage:initialize';
    protected $description = 'Initialize storage directories for the application';

    public function handle()
    {
        $this->info('Initializing storage directories...');


        $privateDirectories = [
            'files',
        ];

        foreach ($privateDirectories as $dir) {
            if (!Storage::disk('private')->exists($dir)) {
                Storage::disk('private')->makeDirectory($dir);
                $this->info("Created private directory: {$dir}");
            }
        }

        $publicDirectories = [
            'profile_pictures',
        ];

        foreach ($publicDirectories as $dir) {
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
                $this->info("Created public directory: {$dir}");
            }
        }

        $this->call('storage:link');

        $this->info('Storage directories initialized successfully.');
        return Command::SUCCESS;
    }
}