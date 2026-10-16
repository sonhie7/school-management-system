<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Emploi du Temps - {{ $classe->nom }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 10px; text-align: left; }
        th { background-color: #f0f0f0; }
        .header { margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Emploi du Temps</h1>
        <p><strong>Classe:</strong> {{ $classe->nom }}</p>
        <p><strong>Filière:</strong> {{ $classe->filiere->nom }}</p>
        <p><strong>Niveau:</strong> {{ $classe->niveau }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Jour</th>
                <th>Heure Début</th>
                <th>Heure Fin</th>
                <th>Module</th>
                <th>Professeur</th>
                <th>Salle</th>
            </tr>
        </thead>
        <tbody>
            @foreach($emplois as $emploi)
            <tr>
                <td>{{ $emploi->jour }}</td>
                <td>{{ $emploi->heure_debut }}</td>
                <td>{{ $emploi->heure_fin }}</td>
                <td>{{ $emploi->module->nom }}</td>
                <td>{{ $emploi->professeur->full_name }}</td>
                <td>{{ $emploi->salle }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
