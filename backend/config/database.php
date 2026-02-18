<?php

$host = "ep-restless-river-ailgwk3r-pooler.c-4.us-east-1.aws.neon.tech";
$port = "5432";
$dbname = "neondb";
$user = "neondb_owner";
$password = "npg_pRIYVX5o1FHE";

try {

    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require",
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
