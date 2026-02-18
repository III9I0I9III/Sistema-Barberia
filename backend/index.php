<?php

/* =========================
   CORS (SIEMPRE PRIMERO)
========================= */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    http_response_code(200);
    exit();
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

/* =========================
   ERRORES (PRODUCCIÓN)
========================= */

ini_set('display_errors', 0);
error_reporting(E_ALL);

/* =========================
   DATABASE
========================= */

require_once 'config/database.php';

/* =========================
   ROUTER
========================= */

$request_method = $_SERVER['REQUEST_METHOD'];

$uri = $_SERVER['REQUEST_URI'];
$uri = explode('?', $uri)[0];
$uri = str_replace('/api/', '', $uri);
$uri = trim($uri, '/');

$endpoint = $uri;

/* =========================
   HELPERS
========================= */

function getInputData() {
    return json_decode(file_get_contents("php://input"), true);
}

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

/* =========================
   PRODUCTS
========================= */

if ($endpoint === 'products' && $request_method === 'GET') {

    try {
        global $conn;

        $query = $conn->query("SELECT * FROM products ORDER BY id DESC");
        $products = $query->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200, ["data" => $products]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   SERVICES
========================= */

if ($endpoint === 'services' && $request_method === 'GET') {

    try {
        global $conn;

        $query = $conn->query("SELECT * FROM services ORDER BY id ASC");
        $services = $query->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200, ["data" => $services]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   BARBERS
========================= */

if ($endpoint === 'barbers' && $request_method === 'GET') {

    try {
        global $conn;

        $query = $conn->query("
            SELECT id, name, avatar
            FROM users
            WHERE role = 'barber'
        ");

        $barbers = $query->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(200, ["data" => $barbers]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   DEFAULT
========================= */

sendResponse(404, ["error" => "Endpoint not found"]);
