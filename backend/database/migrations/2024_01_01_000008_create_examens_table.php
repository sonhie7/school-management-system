<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('modules')->onDelete('cascade');
            $table->enum('type', ['controle', 'examen_final', 'rattrapage']);
            $table->date('date');
            $table->time('heure');
            $table->string('salle');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examens');
    }
};
