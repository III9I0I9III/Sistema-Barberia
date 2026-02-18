<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

/* =========================
        GET PROFILE
========================= */

if ($method === 'GET' && str_contains($_SERVER['REQUEST_URI'], 'profile')) {

    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, role, avatar
        FROM users
        WHERE id = ?
    ");
    $stmt->execute([$userData['id']]);
    $user = $stmt->fetch();

    echo json_encode(["user" => $user]);
    exit;
}

/* =========================
        UPDATE PROFILE
========================= */

if ($method === 'PUT' && str_contains($_SERVER['REQUEST_URI'], 'profile')) {

    $name = $input['name'] ?? null;
    $phone = $input['phone'] ?? null;

    $stmt = $pdo->prepare("
        UPDATE users
        SET name = ?, phone = ?
        WHERE id = ?
        RETURNING id, name, email, phone, role, avatar
    ");
    $stmt->execute([$name, $phone, $userData['id']]);
    $user = $stmt->fetch();

    echo json_encode([
        "message" => "Profile updated",
        "user" => $user
    ]);
    exit;
}

/* =========================
        CHANGE PASSWORD
========================= */

if ($method === 'POST' && str_contains($_SERVER['REQUEST_URI'], 'change-password')) {

    $currentPassword = $input['current_password'] ?? null;
    $newPassword = $input['new_password'] ?? null;

    if (!$currentPassword || !$newPassword) {
        http_response_code(400);
        echo json_encode(["error" => "Passwords required"]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userData['id']]);
    $user = $stmt->fetch();

    if (!password_verify($currentPassword, $user['password'])) {
        http_response_code(401);
        echo json_encode(["error" => "Current password incorrect"]);
        exit;
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $userData['id']]);

    echo json_encode(["message" => "Password updated successfully"]);
    exit;
}

/* =========================
        DELETE ACCOUNT
========================= */

if ($method === 'DELETE' && str_contains($_SERVER['REQUEST_URI'], 'delete-account')) {

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userData['id']]);

    echo json_encode(["message" => "Account deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
