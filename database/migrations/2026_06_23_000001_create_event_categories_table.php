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
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('target_km', 8, 2);
            $table->boolean('ranking_enabled')->default(false);
            $table->unsignedBigInteger('badge_id')->nullable()->index();
            $table->string('certificate_template')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'name']);
            $table->index(['event_id', 'ranking_enabled']);
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
