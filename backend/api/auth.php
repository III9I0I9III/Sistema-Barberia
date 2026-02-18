<?php

require_once __DIR__ . '/../core/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {

    /* =========================
            REGISTER
    ========================= */

    if (str_contains($_SERVER['REQUEST_URI'], 'register')) {

        $name = $input['name'] ?? null;
        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;
        $phone = $input['phone'] ?? null;

        if (!$name || !$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        // Verificar si el email ya existe
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);

        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["error" => "Email already registered"]);
            exit;
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, phone, role)
            VALUES (?, ?, ?, ?, 'client')
            RETURNING id, name, email, phone, role, avatar
        ");

        $stmt->execute([$name, $email, $hashedPassword, $phone]);
        $user = $stmt->fetch();

        $token = generateJWT($user);

        echo json_encode([
            "token" => $token,
            "user" => $user
        ]);
        exit;
    }

    /* =========================
            LOGIN
    ========================= */

    if (str_contains($_SERVER['REQUEST_URI'], 'login')) {

        $email = $input['email'] ?? null;
        $password = $input['password'] ?? null;

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password required"]);
            exit;
        }

        $stmt = $pdo->prepare("
            SELECT id, name, email, password, phone, role, avatar
            FROM users
            WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
            exit;
        }

        unset($user['password']);

        $token = generateJWT($user);

        echo json_encode([
            "token" => $token,
            "user" => $user
        ]);
        exit;
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
