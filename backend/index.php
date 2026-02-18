<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

/* =========================
   CORS
========================= */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
   JWT HELPERS
========================= */
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function getAuthorizationHeader() {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }

    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
    }

    return null;
}

/* =========================
   JWT
========================= */
function createToken($user) {

    $secret_key = getenv('JWT_SECRET') ?: 'SUPER_SECRET_KEY_2026';

    $header = base64url_encode(json_encode([
        'typ' => 'JWT',
        'alg' => 'HS256'
    ]));

    $payload = base64url_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24)
    ]));

    $signature = base64url_encode(
        hash_hmac('sha256', "$header.$payload", $secret_key, true)
    );

    return "$header.$payload.$signature";
}

function verifyToken() {

    $secret_key = getenv('JWT_SECRET') ?: 'SUPER_SECRET_KEY_2026';

    $auth_header = getAuthorizationHeader();

    if (!$auth_header) {
        sendResponse(401, ["error" => "No token provided"]);
    }

    $token = str_replace('Bearer ', '', $auth_header);
    $parts = explode('.', $token);

    if (count($parts) !== 3) {
        sendResponse(401, ["error" => "Invalid token"]);
    }

    list($header, $payload, $signature) = $parts;

    $valid_signature = base64url_encode(
        hash_hmac('sha256', "$header.$payload", $secret_key, true)
    );

    if (!hash_equals($valid_signature, $signature)) {
        sendResponse(401, ["error" => "Invalid signature"]);
    }

    $decoded_payload = json_decode(base64url_decode($payload), true);

    if (!$decoded_payload || $decoded_payload['exp'] < time()) {
        sendResponse(401, ["error" => "Token expired"]);
    }

    return $decoded_payload;
}

/* =========================
   REGISTER
========================= */
if ($endpoint === 'register' && $request_method === 'POST') {

    $data = getInputData();

    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(400, ["error" => "Missing required fields"]);
    }

    try {
        global $conn;

        $check = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $check->execute(['email' => $data['email']]);

        if ($check->rowCount() > 0) {
            sendResponse(400, ["error" => "Email already exists"]);
        }

        $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);

        $query = $conn->prepare("
            INSERT INTO users (name, email, password, phone, role)
            VALUES (:name, :email, :password, :phone, 'client')
            RETURNING id
        ");

        $query->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $hashed_password,
            'phone' => $data['phone'] ?? null
        ]);

        $user_id = $query->fetchColumn();

        $user = [
            'id' => $user_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'role' => 'client'
        ];

        $token = createToken($user);

        sendResponse(201, ['token' => $token, 'user' => $user]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   LOGIN
========================= */
if ($endpoint === 'login' && $request_method === 'POST') {

    $data = getInputData();

    try {
        global $conn;

        $query = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $query->execute(['email' => $data['email']]);

        $user = $query->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            sendResponse(401, ["error" => "Invalid credentials"]);
        }

        unset($user['password']);

        $token = createToken($user);

        sendResponse(200, ['token' => $token, 'user' => $user]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   PRODUCTS
========================= */
if ($endpoint === 'products' && $request_method === 'GET') {
    global $conn;
    $query = $conn->query("SELECT * FROM products ORDER BY id DESC");
    sendResponse(200, $query->fetchAll(PDO::FETCH_ASSOC));
}

/* =========================
   SERVICES
========================= */
if ($endpoint === 'services' && $request_method === 'GET') {
    global $conn;
    $query = $conn->query("SELECT * FROM services ORDER BY id ASC");
    sendResponse(200, $query->fetchAll(PDO::FETCH_ASSOC));
}

/* =========================
   BARBERS
========================= */
if ($endpoint === 'barbers' && $request_method === 'GET') {
    global $conn;
    $query = $conn->query("SELECT id, name, specialty, avatar FROM users WHERE role = 'barber'");
    sendResponse(200, $query->fetchAll(PDO::FETCH_ASSOC));
}

/* =========================
   BOOKINGS (CREATE)
========================= */
if ($endpoint === 'bookings' && $request_method === 'POST') {

    $payload = verifyToken();
    $data = getInputData();

    if (empty($data['service_id']) || empty($data['barber_id']) || empty($data['date']) || empty($data['time'])) {
        sendResponse(400, ["error" => "Missing booking data"]);
    }

    try {
        global $conn;

        $query = $conn->prepare("
            INSERT INTO bookings (user_id, barber_id, service_id, date, time, status)
            VALUES (:user_id, :barber_id, :service_id, :date, :time, 'pending')
        ");

        $query->execute([
            'user_id' => $payload['id'],
            'barber_id' => $data['barber_id'],
            'service_id' => $data['service_id'],
            'date' => $data['date'],
            'time' => $data['time']
        ]);

        sendResponse(201, ["message" => "Booking created"]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* =========================
   BOOKINGS (USER)
========================= */
if ($endpoint === 'bookings' && $request_method === 'GET') {

    $payload = verifyToken();

    global $conn;

    $query = $conn->prepare("
        SELECT b.*, s.name AS service, u.name AS barber
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        JOIN users u ON b.barber_id = u.id
        WHERE b.user_id = :id
        ORDER BY b.date DESC
    ");

    $query->execute(['id' => $payload['id']]);

    sendResponse(200, $query->fetchAll(PDO::FETCH_ASSOC));
}

/* =========================
   ADMIN BOOKINGS
========================= */
if ($endpoint === 'admin/bookings' && $request_method === 'GET') {

    $payload = verifyToken();

    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Forbidden"]);
    }

    global $conn;

    $query = $conn->query("
        SELECT b.*, u.name, s.name AS service
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.date DESC
    ");

    sendResponse(200, $query->fetchAll(PDO::FETCH_ASSOC));
}

sendResponse(404, ["error" => "Endpoint not found"]);
