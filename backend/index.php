<?php

/* =========================
   DEBUG (CRÍTICO EN RENDER)
   ========================= */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/* =========================
   CORS (OBLIGATORIO)
   ========================= */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

/* =========================
   PREFLIGHT REQUEST
   ========================= */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* =========================
   DATABASE
   ========================= */

require_once __DIR__ . '/config/database.php';

/* =========================
   ROUTER
   ========================= */

$url = $_GET['url'] ?? '';

switch ($url) {

    /* =========================
       PRODUCTS
       ========================= */
    case 'api/products':
        require __DIR__ . '/api/products.php';
        break;

    /* =========================
       SERVICES
       ========================= */
    case 'api/services':
        require __DIR__ . '/api/services.php';
        break;

    /* =========================
       BARBERS
       ========================= */
    case 'api/barbers':
        require __DIR__ . '/api/barbers.php';
        break;

    /* =========================
       BOOKINGS
       ========================= */
    case 'api/bookings':
        require __DIR__ . '/api/bookings.php';
        break;

    /* =========================
       DEFAULT / DEBUG
       ========================= */
    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Ruta no encontrada",
            "requested_url" => $url,
            "hint" => "Usa /api/products o /api/services"
        ]);
        break;
}
