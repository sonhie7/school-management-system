<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devoir extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre', 'description', 'type', 'module_id',
        'professeur_id', 'classe_id', 'date_limite', 'fichier'
    ];

    protected $casts = [
        'date_limite' => 'date',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function soumissions()
    {
        return $this->hasMany(Soumission::class);
    }

    public function getFichierUrlAttribute()
    {
        return $this->fichier ? asset('storage/devoirs/' . $this->fichier) : null;
    }
}
