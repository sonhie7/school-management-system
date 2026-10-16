<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'etudiant_id', 'module_id', 'date', 'statut', 'professeur_id'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }
}
