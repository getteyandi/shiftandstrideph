<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            // A submission now targets one specific registration (event/category).
            $table->foreignId('registration_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('registration_id');
        });
    }
};
