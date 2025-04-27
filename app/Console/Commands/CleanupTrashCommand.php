<?php

namespace App\Console\Commands;

use App\Http\Controllers\TrashController;
use Illuminate\Console\Command;

class CleanupTrashCommand extends Command
{
    protected $signature = 'trash:cleanup';
    protected $description = 'Clean up items in trash that are older than 24 hours';

    public function handle()
    {
        $this->info('Starting trash cleanup...');

        app(TrashController::class)->cleanupTrash();

        $this->info('Trash cleanup completed successfully.');

        return Command::SUCCESS;
    }
}
