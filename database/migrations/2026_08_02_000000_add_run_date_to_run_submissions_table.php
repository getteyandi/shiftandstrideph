<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            // The date the run actually happened (chosen by the runner), as
            // opposed to created_at which is when it was submitted for review.
            $table->date('run_date')->nullable()->after('distance');
        });

        // Backfill existing rows: assume the run happened the day it was logged.
        DB::table('run_submissions')
            ->whereNull('run_date')
            ->update(['run_date' => DB::raw('DATE(created_at)')]);
    }

    public function down(): void
    {
        Schema::table('run_submissions', function (Blueprint $table) {
            $table->dropColumn('run_date');
        });
    }
};
