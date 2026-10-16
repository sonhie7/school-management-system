<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class NoteController extends Controller
{
    public function storeNotes(Request $request)
    {
        $professeur = Auth::user()->professeur;
        
        $validator = Validator::make($request->all(), [
            'notes' => 'required|array',
            'notes.*.etudiant_id' => 'required|exists:etudiants,id',
            'notes.*.module_id' => 'required|exists:modules,id',
            'notes.*.examen_id' => 'required|exists:examens,id',
            'notes.*.note' => 'required|numeric|min:0|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $savedNotes = [];

        foreach ($request->notes as $noteData) {
            // Vérifier que le professeur enseigne ce module
            $module = \App\Models\Module::find($noteData['module_id']);
            if (!$module || $module->professeur_id !== $professeur->id) {
                return response()->json([
                    'message' => 'Vous n\'enseignez pas ce module',
                    'module_id' => $noteData['module_id']
                ], 403);
            }

            $note = Note::updateOrCreate(
                [
                    'etudiant_id' => $noteData['etudiant_id'],
                    'module_id' => $noteData['module_id'],
                    'examen_id' => $noteData['examen_id'],
                ],
                [
                    'note' => $noteData['note'],
                    'professeur_id' => $professeur->id,
                    'published' => false, // Notes are always saved as unpublished
                ]
            );
            $savedNotes[] = $note;
        }

        return response()->json([
            'message' => 'Notes enregistrées avec succès',
            'notes' => $savedNotes
        ]);
    }

    /**
     * Publish notes for a specific module and examen
     */
    public function publishNotes(Request $request)
    {
        $professeur = Auth::user()->professeur;
        
        $validator = Validator::make($request->all(), [
            'module_id' => 'required|exists:modules,id',
            'examen_id' => 'required|exists:examens,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $moduleId = $request->module_id;
        $examenId = $request->examen_id;

        // Vérifier que le professeur enseigne ce module
        $module = \App\Models\Module::find($moduleId);
        if (!$module || $module->professeur_id !== $professeur->id) {
            return response()->json([
                'message' => 'Vous n\'enseignez pas ce module'
            ], 403);
        }

        // Publish all notes for this module and examen
        $count = Note::where('module_id', $moduleId)
            ->where('examen_id', $examenId)
            ->where('professeur_id', $professeur->id)
            ->update(['published' => true]);

        return response()->json([
            'message' => $count . ' note(s) publiée(s) avec succès',
            'published_count' => $count
        ]);
    }

    public function getNotesByClasseAndModule($classeId, $moduleId)
    {
        $professeur = Auth::user()->professeur;
        
        $module = \App\Models\Module::find($moduleId);
        if (!$module || $module->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'enseignez pas ce module'], 403);
        }

        $notes = Note::where('module_id', $moduleId)
            ->whereHas('etudiant', function ($q) use ($classeId) {
                $q->where('classe_id', $classeId);
            })
            ->with(['etudiant', 'examen'])
            ->get();

        return response()->json($notes);
    }

    public function getExamensByModule($moduleId)
    {
        $professeur = Auth::user()->professeur;
        
        $module = \App\Models\Module::find($moduleId);
        if (!$module || $module->professeur_id !== $professeur->id) {
            return response()->json(['message' => 'Vous n\'enseignez pas ce module'], 403);
        }

        $examens = \App\Models\Examen::where('module_id', $moduleId)
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($examens);
    }
}
