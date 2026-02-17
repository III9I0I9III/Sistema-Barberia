<?php
require_once __DIR__ . '/config/database.php';

echo "Iniciando migración...\n";

// Ruta del archivo SQL
$sqlFile = __DIR__ . '/migrations/001_initial_schema.sql';

if (!file_exists($sqlFile)) {
    die("No se encontró el archivo SQL.\n");
}

// Leer archivo
$sql = file_get_contents($sqlFile);

// Verificar conexión
if (!$conn) {
    die("Error: No hay conexión a PostgreSQL.\n");
}

try {
    $conn->exec($sql);
    echo "Migración ejecutada correctamente ✅\n";
} catch (PDOException $e) {
    echo "Error en la migración: " . $e->getMessage() . "\n";
}
