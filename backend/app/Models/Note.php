<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasFactory;

    protected $fillable = [
        'etudiant_id', 'module_id', 'examen_id',
        'note', 'commentaire', 'published', 'professeur_id'
    ];

    protected $casts = [
        'note' => 'decimal:2',
        'published' => 'boolean',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }
}
