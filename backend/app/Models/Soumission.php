<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Soumission extends Model
{
    use HasFactory;

    protected $fillable = [
        'devoir_id', 'etudiant_id', 'fichier', 'commentaire'
    ];

    public function devoir()
    {
        return $this->belongsTo(Devoir::class);
    }

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function getFichierUrlAttribute()
    {
        return $this->fichier ? asset('storage/soumissions/' . $this->fichier) : null;
    }
}
