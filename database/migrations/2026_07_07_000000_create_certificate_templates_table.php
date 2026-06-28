<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();
            // null event_id = the global default template.
            $table->foreignId('event_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('title')->default('Certificate of Completion');
            $table->text('body');
            $table->string('accent_color', 9)->default('#a6e212');
            $table->enum('orientation', ['landscape', 'portrait'])->default('landscape');
            $table->string('background_path')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('signature_path')->nullable();
            $table->string('signatory_name')->nullable();
            $table->string('signatory_title')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_templates');
    }
};
