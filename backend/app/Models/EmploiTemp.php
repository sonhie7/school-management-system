<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmploiTemp extends Model
{
    use HasFactory;

    protected $table = 'emplois_temps';
    protected $fillable = [
        'classe_id', 'jour', 'heure_debut', 'heure_fin',
        'module_id', 'professeur_id', 'salle'
    ];

    protected $casts = [
        'heure_debut' => 'datetime:H:i',
        'heure_fin' => 'datetime:H:i',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
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
