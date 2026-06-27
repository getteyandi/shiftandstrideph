<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_groups', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'denied'])
                ->default('pending')
                ->after('type')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('event_groups', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
