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
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('event_category_id')
                ->constrained()
                ->cascadeOnDelete();

            // Registration information
            $table->string('bib_number');

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'completed',
            ])->default('pending')->index();

            // Progress
            $table->decimal('completed_km', 8, 2)
                ->default(0);

            $table->unsignedInteger('activity_count')
                ->default(0);

            $table->timestamp('last_activity_at')
                ->nullable();

            // Lifecycle
            $table->timestamp('approved_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->timestamps();

            $table->unique([
                'user_id',
                'event_category_id',
            ]);

            $table->index([
                'event_category_id',
                'status',
            ]);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
