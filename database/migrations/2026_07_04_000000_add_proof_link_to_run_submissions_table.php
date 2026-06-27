<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            // Proof can now be a photo OR an external link (Strava, etc.).
            $table->string('photo')->nullable()->change();
            $table->string('proof_link')->nullable()->after('photo');
        });
    }

    public function down(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            $table->dropColumn('proof_link');
        });
    }
};
