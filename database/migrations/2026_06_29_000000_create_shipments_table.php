<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('tracking_id')->unique();

            // What is being shipped (e.g. "Finisher Medal — Davao Marathon").
            $table->string('item');
            $table->string('courier')->nullable();
            $table->text('notes')->nullable();

            $table->enum('status', ['preparing', 'shipped', 'delivered'])
                ->default('preparing')
                ->index();

            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
