<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_categories', function (Blueprint $table) {
            // An "open" category treats target_km as a goal the runner can
            // EXCEED — distance keeps accumulating past the target instead of
            // being capped at it. Fixed-distance categories stay capped.
            $table->boolean('is_open')->default(false)->after('target_km');
        });

        // Existing categories with no fixed target (e.g. seeded "Open KM") are
        // open by definition.
        DB::table('event_categories')
            ->where('target_km', '<=', 0)
            ->update(['is_open' => true]);
    }

    public function down(): void
    {
        Schema::table('event_categories', function (Blueprint $table) {
            $table->dropColumn('is_open');
        });
    }
};
