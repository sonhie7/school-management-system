<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'code', 'description'];

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function etudiants()
    {
        return $this->hasMany(Etudiant::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }
}
