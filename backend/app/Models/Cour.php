<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cour extends Model
{
    use HasFactory;

    protected $table = 'cours';
    protected $fillable = [
        'titre', 'module_id', 'professeur_id', 'classe_id', 'fichier', 'type_fichier'
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

    public function getFichierUrlAttribute()
    {
        return asset('storage/cours/' . $this->fichier);
    }
}
