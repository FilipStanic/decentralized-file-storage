<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        
        Schema::table('files', function (Blueprint $table) {
            $table->boolean('is_trashed')->default(false)->after('ipfs_url');
            $table->timestamp('trashed_at')->nullable()->after('is_trashed');
        });

        
        Schema::table('folders', function (Blueprint $table) {
            $table->boolean('is_trashed')->default(false)->after('starred');
            $table->timestamp('trashed_at')->nullable()->after('is_trashed');
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['is_trashed', 'trashed_at']);
        });

        Schema::table('folders', function (Blueprint $table) {
            $table->dropColumn(['is_trashed', 'trashed_at']);
        });
    }
};
