<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($request_uri, '/'));
$endpoint = end($uri);

function getInputData() {
    return json_decode(file_get_contents("php://input"), true);
}

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

/* ================= JWT ================= */

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

    if (!$decoded_payload || !isset($decoded_payload['id'])) {
        sendResponse(401, ["error" => "Invalid token payload"]);
    }

    if ($decoded_payload['exp'] < time()) {
        sendResponse(401, ["error" => "Token expired"]);
    }

    return $decoded_payload;
}

/* ================= AUTH ================= */

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

        $query = $conn->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (:name, :email, :password, :phone, 'client')");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":email", $data['email']);
        $query->bindParam(":password", $hashed_password);
        $phone = $data['phone'] ?? '';
        $query->bindParam(":phone", $phone);
        $query->execute();

        $user_id = $conn->lastInsertId();

        $user = [
            'id' => $user_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'client'
        ];

        $token = createToken($user);

        sendResponse(201, ['message' => 'User registered successfully', 'token' => $token, 'user' => $user]);

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

        sendResponse(200, ['message' => 'Login successful', 'token' => $token, 'user' => $user]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* ================= SERVICES ================= */

if ($endpoint === 'services' && $request_method === 'GET') {
    try {
        global $conn;
        $services = $conn->query("SELECT * FROM services ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $services);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* ================= PRODUCTS ================= */

if ($endpoint === 'products' && $request_method === 'GET') {
    try {
        global $conn;
        $products = $conn->query("SELECT * FROM products ORDER BY name")->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $products);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'products' && $request_method === 'POST') {
    $payload = verifyToken();

    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Unauthorized"]);
    }

    $data = getInputData();

    try {
        global $conn;

        $query = $conn->prepare("INSERT INTO products (name, description, price, stock, category) VALUES (:name, :description, :price, :stock, :category)");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":description", $data['description']);
        $query->bindParam(":price", $data['price']);
        $query->bindParam(":stock", $data['stock']);
        $query->bindParam(":category", $data['category']);
        $query->execute();

        sendResponse(201, ['message' => 'Product created', 'id' => $conn->lastInsertId()]);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* ================= PROFILE ================= */

if ($endpoint === 'profile' && $request_method === 'GET') {
    $payload = verifyToken();

    try {
        global $conn;

        $query = $conn->prepare("SELECT id, name, email, phone, avatar, role FROM users WHERE id = :id");
        $query->bindParam(":id", $payload['id']);
        $query->execute();

        $user = $query->fetch(PDO::FETCH_ASSOC);

        sendResponse(200, $user);

    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

/* ================= FALLBACK ================= */

sendResponse(404, ["error" => "Endpoint not found"]);
?>
