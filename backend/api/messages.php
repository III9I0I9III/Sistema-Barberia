<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

/* =========================
        SEND MESSAGE
========================= */

if ($method === 'POST') {

    $message = $input['message'] ?? null;

    if (!$message) {
        http_response_code(400);
        echo json_encode(["error" => "Message is required"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO messages (user_id, message)
        VALUES (?, ?)
        RETURNING *
    ");

    $stmt->execute([$userData['id'], $message]);
    $newMessage = $stmt->fetch();

    echo json_encode([
        "message" => "Message sent",
        "data" => $newMessage
    ]);
    exit;
}

/* =========================
        GET MESSAGES (ADMIN)
========================= */

if ($method === 'GET') {

    if ($userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can view messages"]);
        exit;
    }

    $stmt = $pdo->query("
        SELECT 
            m.id,
            m.message,
            m.created_at,
            u.name,
            u.email
        FROM messages m
        JOIN users u ON u.id = m.user_id
        ORDER BY m.created_at DESC
    ");

    $messages = $stmt->fetchAll();

    echo json_encode(["data" => $messages]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
