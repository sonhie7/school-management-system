<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devoirs', function (Blueprint $table) {
            $table->foreignId('classe_id')->nullable()->after('professeur_id')->constrained('classes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('devoirs', function (Blueprint $table) {
            $table->dropForeign(['classe_id']);
            $table->dropColumn('classe_id');
        });
    }
};
