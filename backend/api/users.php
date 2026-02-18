<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();

if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access denied"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

$uri = explode("/", trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), "/"));
$id = is_numeric(end($uri)) ? end($uri) : null;

/* =========================
        GET USERS
========================= */

if ($method === 'GET') {

    $stmt = $pdo->query("
        SELECT id, name, email, role, avatar, created_at
        FROM users
        ORDER BY created_at DESC
    ");

    $users = $stmt->fetchAll();

    echo json_encode(["data" => $users]);
    exit;
}

/* =========================
        UPDATE ROLE
========================= */

if ($method === 'PUT' && $id) {

    $role = $input['role'] ?? null;

    if (!in_array($role, ['client', 'barber', 'admin'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid role"]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE users SET role = ?
        WHERE id = ?
        RETURNING id, name, email, role
    ");

    $stmt->execute([$role, $id]);
    $user = $stmt->fetch();

    echo json_encode([
        "message" => "Role updated",
        "data" => $user
    ]);
    exit;
}

/* =========================
        DELETE USER
========================= */

if ($method === 'DELETE' && $id) {

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "User deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
