<?php

// ---------------------------------------------
// Headers / CORS
// ---------------------------------------------
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// ---------------------------------------------
// Base path (backend/api) => un nivel arriba de public/
// Estructura:
// backend/api/public/index.php  (este archivo)
// backend/api/config/database.php
// backend/api/api/*.php
// ---------------------------------------------
define('BASE_PATH', dirname(__DIR__));

// Cargar DB (si falla, respondemos JSON)
try {
    require_once BASE_PATH . "/config/database.php";
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "No se pudo cargar la configuración de base de datos",
        "details" => $e->getMessage()
    ]);
    exit;
}

// ---------------------------------------------
// Routing
// ---------------------------------------------
$path = trim(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH), "/");
$parts = $path === "" ? [] : explode("/", $path);

// Si viene con /api/... lo quitamos
if (isset($parts[0]) && $parts[0] === "api") {
    array_shift($parts);
}

$resource = $parts[0] ?? "";
$subparts = array_slice($parts, 1);          // lo que viene después del recurso
$subpath  = implode("/", $subparts);         // útil si ocupas "algo/mas"
$id       = $subparts[0] ?? null;            // por ejemplo bookings/123 -> id=123

// Health-check / raíz
if ($resource === "") {
    echo json_encode([
        "status" => "ok",
        "message" => "API running"
    ]);
    exit;
}

// Exponer variables útiles para los controladores
$_GET["resource"] = $resource;
$_GET["subpath"]  = $subpath;

// Si el primer segmento extra parece ID, lo exponemos
if ($id !== null && ctype_digit((string)$id)) {
    $_GET["id"] = (int)$id;
}

// ---------------------------------------------
// Dispatcher
// ---------------------------------------------
switch (true) {

    // AUTH
    case $resource === "register":
    case $resource === "login":
        require BASE_PATH . "/api/auth.php";
        break;

    // PROFILE
    case $resource === "profile":
    case $resource === "change-password":
    case $resource === "delete-account":
        require BASE_PATH . "/api/profile.php";
        break;

    // BOOKINGS (soporta /bookings y /bookings/{id})
    case $resource === "bookings":
        require BASE_PATH . "/api/bookings.php";
        break;

    // SERVICES
    case $resource === "services":
        require BASE_PATH . "/api/services.php";
        break;

    // PRODUCTS
    case $resource === "products":
        require BASE_PATH . "/api/products.php";
        break;

    // BARBERS
    case $resource === "barbers":
        require BASE_PATH . "/api/barbers.php";
        break;

    // USERS
    case $resource === "users":
        require BASE_PATH . "/api/users.php";
        break;

    // MESSAGES
    case $resource === "messages":
        require BASE_PATH . "/api/messages.php";
        break;

    // STATS
    case $resource === "stats":
        require BASE_PATH . "/api/stats.php";
        break;

    // DEFAULT
    default:
        http_response_code(404);
        echo json_encode([
            "error" => "Endpoint not found",
            "path" => $path,
            "resource" => $resource
        ]);
        break;
}