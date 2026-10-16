<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'code', 'filiere_id', 'classe_id', 'volume_horaire',
        'coefficient', 'professeur_id'
    ];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function emploisTemps()
    {
        return $this->hasMany(EmploiTemp::class);
    }

    public function examens()
    {
        return $this->hasMany(Examen::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function cours()
    {
        return $this->hasMany(Cour::class);
    }

    public function devoirs()
    {
        return $this->hasMany(Devoir::class);
    }
}
