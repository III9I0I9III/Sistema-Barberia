<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    exit(0);
}

require_once __DIR__ . "/config/database.php";

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$uri = explode("/", trim($uri, "/"));
$endpoint = $uri[count($uri) - 1];

switch (true) {

    case $endpoint === "register":
    case $endpoint === "login":
        require __DIR__ . "/api/auth.php";
        break;

    case $endpoint === "profile":
    case $endpoint === "change-password":
    case $endpoint === "delete-account":
        require __DIR__ . "/api/profile.php";
        break;

    case str_contains($endpoint, "bookings"):
        require __DIR__ . "/api/bookings.php";
        break;

    case $endpoint === "services":
        require __DIR__ . "/api/services.php";
        break;

    case $endpoint === "products":
        require __DIR__ . "/api/products.php";
        break;

    case $endpoint === "barbers":
        require __DIR__ . "/api/barbers.php";
        break;

    case $endpoint === "users":
        require __DIR__ . "/api/users.php";
        break;

    case $endpoint === "messages":
        require __DIR__ . "/api/messages.php";
        break;

    case $endpoint === "stats":
        require __DIR__ . "/api/stats.php";
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
}
