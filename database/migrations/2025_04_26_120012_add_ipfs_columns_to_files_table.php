<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->string('ipfs_hash')->nullable()->after('starred');
            $table->string('ipfs_url')->nullable()->after('ipfs_hash');
        });
    }

    public function down(): void
    {
        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['ipfs_hash', 'ipfs_url']);
        });
    }
};
