<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    use HasFactory;

    protected $fillable = [
        'cin', 'nom', 'prenom', 'sexe', 'date_naissance',
        'telephone', 'email', 'adresse', 'filiere_id',
        'classe_id', 'niveau', 'date_inscription', 'user_id'
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_inscription' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function getFullNameAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}
