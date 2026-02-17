<?php

// =========================
// CORS DEFINITIVO
// =========================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =========================
// DATABASE
// =========================
require_once '../config/database.php';

// =========================
// ROUTER CORRECTO PARA RENDER
// =========================
$request_method = $_SERVER['REQUEST_METHOD'];

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Quitar /api si existe
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Ahora el endpoint real
$endpoint = $path;

// =========================
// HELPERS
// =========================
function getInputData() {
    return json_decode(file_get_contents("php://input"), true);
}

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

// =========================
// JWT
// =========================
function createToken($user) {
    $secret_key = 'tu_clave_secreta_barbados_2024';

    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24)
    ]));

    $signature = hash_hmac('sha256', "$header.$payload", $secret_key);

    return "$header.$payload.$signature";
}

function verifyToken() {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        sendResponse(401, ["error" => "No token provided"]);
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $secret_key = 'tu_clave_secreta_barbados_2024';

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        sendResponse(401, ["error" => "Invalid token format"]);
    }

    list($header, $payload, $signature) = $parts;

    $valid_signature = hash_hmac('sha256', "$header.$payload", $secret_key);

    if (!hash_equals($valid_signature, $signature)) {
        sendResponse(401, ["error" => "Invalid token signature"]);
    }

    $decoded_payload = json_decode(base64_decode($payload), true);

    if (!$decoded_payload || $decoded_payload['exp'] < time()) {
        sendResponse(401, ["error" => "Token invalid or expired"]);
    }

    return $decoded_payload;
}

// =========================
// AUTH
// =========================
if ($endpoint === 'register' && $request_method === 'POST') {

    $data = getInputData();

    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(400, ["error" => "Missing required fields"]);
    }

    try {
        global $conn;

        $check = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $check->bindParam(":email", $data['email']);
        $check->execute();

        if ($check->rowCount() > 0) {
            sendResponse(400, ["error" => "Email already exists"]);
        }

        $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);

        $query = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'client')");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":email", $data['email']);
        $query->bindParam(":password", $hashed_password);
        $query->execute();

        $user_id = $conn->lastInsertId();

        $user = [
            'id' => $user_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'client'
        ];

        $token = createToken($user);

        sendResponse(201, ['token' => $token, 'user' => $user]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'login' && $request_method === 'POST') {

    $data = getInputData();

    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(400, ["error" => "Email and password required"]);
    }

    try {
        global $conn;

        $query = $conn->prepare("SELECT * FROM users WHERE email = :email");
        $query->bindParam(":email", $data['email']);
        $query->execute();

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

// =========================
// PROFILE
// =========================
if ($endpoint === 'profile' && $request_method === 'GET') {

    $payload = verifyToken();

    try {
        global $conn;

        $query = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = :id");
        $query->bindParam(":id", $payload['id']);
        $query->execute();

        $user = $query->fetch(PDO::FETCH_ASSOC);

        sendResponse(200, $user);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// =========================
// FALLBACK
// =========================
sendResponse(404, ["error" => "Endpoint not found"]);
