<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id', 'classe_id', 'type', 'date', 'heure', 'salle'
    ];

    protected $casts = [
        'date' => 'date',
        'heure' => 'datetime:H:i',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
