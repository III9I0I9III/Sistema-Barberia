<?php

$host = "localhost"; // si estás en local
$port = "5432";
$dbname = "neondb"; // 👈 ESTE ES EL CAMBIO IMPORTANTE
$user = "postgres"; // o el usuario que uses en pgAdmin
$password = "password"; // o la contraseña que uses en pgAdmin

try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed",
        "details" => $e->getMessage()
    ]);
    exit;
}
