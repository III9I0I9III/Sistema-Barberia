<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit(0);
}

// BASE: backend/api  (un nivel arriba de public/)
define('BASE_PATH', dirname(__DIR__));

// ✅ Ahora sí existe:
require_once BASE_PATH . "/config/database.php";

// ----------------------------------------------------
// Routing
// ----------------------------------------------------
$path = trim(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH), "/");
$parts = $path === "" ? [] : explode("/", $path);

// Si tu API viene con prefijo /api, lo quitamos:
if (isset($parts[0]) && $parts[0] === "api") {
    array_shift($parts);
}

// Recurso e id (para rutas tipo /bookings/123)
$resource = $parts[0] ?? "";
$id = $parts[1] ?? null;

// Si hay un id numérico al final, lo exponemos para tus scripts
if ($id !== null) {
    $_GET["id"] = $id;
}

switch (true) {

    case $resource === "register":
    case $resource === "login":
        require BASE_PATH . "/api/auth.php";
        break;

    case $resource === "profile":
    case $resource === "change-password":
    case $resource === "delete-account":
        require BASE_PATH . "/api/profile.php";
        break;

    case $resource === "bookings":
        require BASE_PATH . "/api/bookings.php";
        break;

    case $resource === "services":
        require BASE_PATH . "/api/services.php";
        break;

    case $resource === "products":
        require BASE_PATH . "/api/products.php";
        break;

    case $resource === "barbers":
        require BASE_PATH . "/api/barbers.php";
        break;

    case $resource === "users":
        require BASE_PATH . "/api/users.php";
        break;

    case $resource === "messages":
        require BASE_PATH . "/api/messages.php";
        break;

    case $resource === "stats":
        require BASE_PATH . "/api/stats.php";
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found", "path" => $path]);
        break;
}