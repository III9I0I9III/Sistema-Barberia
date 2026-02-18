<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config/database.php';

$url = $_GET['url'] ?? '';

switch ($url) {

    case 'api/products':
        require __DIR__ . '/api/products.php';
        break;

    case 'api/services':
        require __DIR__ . '/api/services.php';
        break;

    case 'api/barbers':
        require __DIR__ . '/api/barbers.php';
        break;

    case 'api/bookings':
        require __DIR__ . '/api/bookings.php';
        break;

    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Ruta no encontrada",
            "debug_url" => $url
        ]);
        break;
}
