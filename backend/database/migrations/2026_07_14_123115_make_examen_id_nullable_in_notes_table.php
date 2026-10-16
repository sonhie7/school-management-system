<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            // Supprimer la contrainte foreign key existante
            $table->dropForeign(['examen_id']);
            // Rendre la colonne nullable
            $table->unsignedBigInteger('examen_id')->nullable()->change();
            // Recréer la contrainte avec nullable
            $table->foreign('examen_id')->references('id')->on('examens')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropForeign(['examen_id']);
            $table->unsignedBigInteger('examen_id')->nullable(false)->change();
            $table->foreign('examen_id')->references('id')->on('examens')->onDelete('cascade');
        });
    }
};
