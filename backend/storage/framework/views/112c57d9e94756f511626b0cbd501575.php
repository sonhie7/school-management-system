<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Emploi du Temps - <?php echo e($classe->nom); ?></title>
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
        <p><strong>Classe:</strong> <?php echo e($classe->nom); ?></p>
        <p><strong>Filière:</strong> <?php echo e($classe->filiere->nom); ?></p>
        <p><strong>Niveau:</strong> <?php echo e($classe->niveau); ?></p>
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
            <?php $__currentLoopData = $emplois; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $emploi): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <tr>
                <td><?php echo e($emploi->jour); ?></td>
                <td><?php echo e($emploi->heure_debut); ?></td>
                <td><?php echo e($emploi->heure_fin); ?></td>
                <td><?php echo e($emploi->module->nom); ?></td>
                <td><?php echo e($emploi->professeur->full_name); ?></td>
                <td><?php echo e($emploi->salle); ?></td>
            </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
    </table>
</body>
</html>
<?php /**PATH D:\ETUDE\ismagi\student-management-system\backend\resources\views/pdf/emploi-temps.blade.php ENDPATH**/ ?>