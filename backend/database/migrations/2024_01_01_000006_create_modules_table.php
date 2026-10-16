<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('code')->unique();
            $table->foreignId('filiere_id')->constrained('filieres')->onDelete('cascade');
            $table->integer('volume_horaire');
            $table->decimal('coefficient', 3, 2);
            $table->foreignId('professeur_id')->constrained('professeurs')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
