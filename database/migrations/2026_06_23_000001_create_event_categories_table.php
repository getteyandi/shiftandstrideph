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
        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('event_id')
                ->constrained()
                ->cascadeOnDelete();

            // Category Information
            $table->string('name');               // e.g. 5 KM, 21 KM, 300 KM
            $table->decimal('target_km', 8, 2);

            // Display Order
            $table->unsignedInteger('sort_order')
                ->default(1);

            // Registration
            $table->unsignedInteger('registration_limit')
                ->nullable();

            // Leaderboard
            $table->boolean('ranking_enabled')
                ->default(false);

            // Rewards
            $table->unsignedBigInteger('badge_id')
                ->nullable()
                ->index();

            $table->string('certificate_template')
                ->nullable();

            $table->timestamps();

            // Constraints
            $table->unique([
                'event_id',
                'name',
            ]);

            $table->index([
                'event_id',
                'ranking_enabled',
            ]);

            $table->index([
                'event_id',
                'sort_order',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_categories');
    }
};
