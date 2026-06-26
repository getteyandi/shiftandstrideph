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
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');

            // Branding
            $table->string('banner')->nullable();

            // Event Information
            $table->string('location');

            // Registration Period
            $table->dateTime('registration_start')
                ->nullable()
                ->index();

            $table->dateTime('registration_end')
                ->nullable()
                ->index();

            // Event Period
            $table->dateTime('start_date')
                ->index();

            $table->dateTime('end_date')
                ->index();

            // Status
            $table->enum('status', [
                'upcoming',
                'open',
                'closed',
                'completed',
            ])->default('upcoming')->index();

            $table->boolean('is_published')
                ->default(false)
                ->after('status');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
