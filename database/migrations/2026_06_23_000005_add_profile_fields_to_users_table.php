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
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('profile_photo')->nullable()->after('last_name');
            $table->string('runner_code', 50)->nullable()->unique()->after('profile_photo');
            $table->date('birthday')->nullable()->after('runner_code');
            $table->string('gender', 20)->nullable()->after('birthday');
            $table->string('province', 100)->nullable()->after('gender');
            $table->string('city', 100)->nullable()->after('province');

            $table->index(['last_name', 'first_name']);
            $table->index(['province', 'city']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['last_name', 'first_name']);
            $table->dropIndex(['province', 'city']);
            $table->dropUnique(['runner_code']);
            $table->dropColumn([
                'first_name',
                'last_name',
                'profile_photo',
                'runner_code',
                'birthday',
                'gender',
                'province',
                'city',
            ]);
        });
    }
};
