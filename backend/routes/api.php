<?php

use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\CourController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DevoirController;
use App\Http\Controllers\Api\EmploiTempController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\EtudiantDashboardController;
use App\Http\Controllers\Api\ExamenController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\ProfesseurController;
use App\Http\Controllers\Api\ProfesseurDashboardController;
use App\Http\Controllers\Api\SoumissionController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth routes (public)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Admin routes - require auth:sanctum AND role:admin
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'stats']);

        Route::apiResource('etudiants', EtudiantController::class);
        Route::apiResource('professeurs', ProfesseurController::class);
        Route::apiResource('modules', ModuleController::class);
        Route::apiResource('examens', ExamenController::class);
        Route::apiResource('filieres', FiliereController::class);
        Route::apiResource('classes', ClasseController::class);

        Route::get('/emplois-temps', [EmploiTempController::class, 'index']);
        Route::get('/emplois-temps/classe/{classe}', [EmploiTempController::class, 'byClasse']);
        Route::post('/emplois-temps', [EmploiTempController::class, 'store']);
        Route::put('/emplois-temps/{emploiTemp}', [EmploiTempController::class, 'update']);
        Route::delete('/emplois-temps/{emploiTemp}', [EmploiTempController::class, 'destroy']);
        Route::get('/emplois-temps/{classe}/pdf', [EmploiTempController::class, 'exportPdf']);

        Route::get('/modules/{module}/professeurs', [ModuleController::class, 'getProfesseurs']);
    });

    // Professeur routes - require auth:sanctum AND role:professeur
    Route::middleware(['auth:sanctum', 'role:professeur'])->prefix('professeur')->group(function () {
        Route::get('/dashboard', [ProfesseurDashboardController::class, 'dashboard']);
        Route::get('/mes-modules', [ProfesseurDashboardController::class, 'mesModulesUniques']);
        Route::get('/mes-classes', [ProfesseurDashboardController::class, 'mesClassesUniques']);
        Route::get('/classes/{classe}/etudiants', [ProfesseurDashboardController::class, 'etudiantsParClasse']);

        // Routes pour les notes
        Route::get('/classes/{classe}/modules/{module}/notes', [NoteController::class, 'getNotesByClasseAndModule']);
        Route::get('/modules/{module}/examens', [NoteController::class, 'getExamensByModule']);
        Route::get('/classes/{classe}/modules/{module}/etudiants', [ProfesseurDashboardController::class, 'etudiantsPourNotes']);
        Route::post('/notes', [NoteController::class, 'storeNotes']);
        Route::post('/notes/publish', [NoteController::class, 'publishNotes']);

        // Routes pour les absences
        Route::get('/classes/{classe}/modules/{module}/absences', [AbsenceController::class, 'getEtudiantsParClasse']);
        Route::post('/absences', [AbsenceController::class, 'storeAbsences']);

        // Cours
        Route::get('/cours', [CourController::class, 'index']);
        Route::post('/cours', [CourController::class, 'store']);
        Route::delete('/cours/{cour}', [CourController::class, 'destroy']);

        // Devoirs
        Route::get('/devoirs', [DevoirController::class, 'index']);
        Route::post('/devoirs', [DevoirController::class, 'store']);
        Route::get('/devoirs/{devoir}', [DevoirController::class, 'show']);
        Route::put('/devoirs/{devoir}', [DevoirController::class, 'update']);
        Route::delete('/devoirs/{devoir}', [DevoirController::class, 'destroy']);
        Route::get('/devoirs/{devoir}/soumissions', [SoumissionController::class, 'index']);
    });

    // Etudiant routes - require auth:sanctum AND role:etudiant
    Route::middleware(['auth:sanctum', 'role:etudiant'])->prefix('etudiant')->group(function () {
        Route::get('/dashboard', [EtudiantDashboardController::class, 'dashboard']);
        Route::get('/profil', [EtudiantDashboardController::class, 'monProfil']);
        Route::get('/mes-modules', [EtudiantDashboardController::class, 'mesModules']);
        Route::get('/mes-notes', [EtudiantDashboardController::class, 'mesNotes']);
        Route::get('/mon-emploi-temps', [EtudiantDashboardController::class, 'monEmploiTemps']);
        Route::get('/mes-cours', [EtudiantDashboardController::class, 'mesCours']);
        Route::get('/mes-devoirs', [EtudiantDashboardController::class, 'mesDevoirs']);
        Route::get('/mes-absences', [AbsenceController::class, 'getAbsencesEtudiant']);
    });

    // Shared routes
    Route::get('/cours/{cour}/download', [CourController::class, 'download']);
    Route::get('/devoirs/{devoir}/download', [DevoirController::class, 'download']);
    Route::post('/devoirs/{devoir}/soumettre', [SoumissionController::class, 'store']);
    Route::get('/soumissions/{soumission}/download', [SoumissionController::class, 'download']);
    Route::get('/emplois-temps/{classe}/pdf', [EmploiTempController::class, 'exportPdf']);
});