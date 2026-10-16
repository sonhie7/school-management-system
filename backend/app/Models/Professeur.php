<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom', 'prenom', 'cin', 'telephone', 'email',
        'departement', 'date_recrutement', 'user_id'
    ];

    protected $casts = [
        'date_recrutement' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function modules()
    {
        return $this->hasMany(Module::class);
    }

    public function emploisTemps()
    {
        return $this->hasMany(EmploiTemp::class);
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

    public function getFullNameAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}
