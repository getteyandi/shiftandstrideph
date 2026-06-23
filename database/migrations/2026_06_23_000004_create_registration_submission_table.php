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
        Schema::create('registration_submission', function (Blueprint $table) {
            $table->foreignId('registration_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('run_submission_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->primary(['registration_id', 'run_submission_id']);
            $table->index('run_submission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_submission');
    }
};
