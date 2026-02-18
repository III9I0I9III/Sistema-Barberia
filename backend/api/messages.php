<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

// Detectar si existe la columna receiver_id en messages (PostgreSQL)
$hasReceiverId = false;
try {
    $check = $pdo->prepare("
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'receiver_id'
        LIMIT 1
    ");
    $check->execute();
    $hasReceiverId = (bool) $check->fetchColumn();
} catch (Throwable $e) {
    $hasReceiverId = false;
}

/* =========================
        SEND MESSAGE
========================= */
if ($method === 'POST') {

    $message = $input['message'] ?? null;
    $receiverId = $input['receiver_id'] ?? null;

    if (!$message) {
        http_response_code(400);
        echo json_encode(["error" => "Message is required"]);
        exit;
    }

    if ($hasReceiverId) {
        // Si tu tabla tiene receiver_id, lo usamos
        if (!$receiverId) {
            http_response_code(400);
            echo json_encode(["error" => "receiver_id is required"]);
            exit;
        }

        // Intentamos primero sender_id/receiver_id si existen, si no user_id/receiver_id
        try {
            $stmt = $pdo->prepare("
                INSERT INTO messages (sender_id, receiver_id, message)
                VALUES (?, ?, ?)
                RETURNING *
            ");
            $stmt->execute([$userData['id'], $receiverId, $message]);
        } catch (Throwable $e) {
            $stmt = $pdo->prepare("
                INSERT INTO messages (user_id, receiver_id, message)
                VALUES (?, ?, ?)
                RETURNING *
            ");
            $stmt->execute([$userData['id'], $receiverId, $message]);
        }

        $newMessage = $stmt->fetch();

        echo json_encode([
            "message" => "Message sent",
            "data" => $newMessage
        ]);
        exit;
    }

    // Si NO existe receiver_id, guardamos el mensaje “simple”
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
        GET MESSAGES
========================= */
if ($method === 'GET') {

    // si hay receiver_id y el usuario no es admin, filtramos conversación
    $receiverId = $_GET['receiver_id'] ?? null;

    if ($userData['role'] === 'admin') {
        // Admin ve todo
        $stmt = $pdo->query("SELECT * FROM messages ORDER BY created_at DESC");
        $messages = $stmt->fetchAll();
        echo json_encode(["data" => $messages]);
        exit;
    }

    // No admin
    if ($hasReceiverId && $receiverId) {
        // conversación entre userData.id y receiverId
        // intentamos con sender_id/receiver_id o user_id/receiver_id según exista
        try {
            $stmt = $pdo->prepare("
                SELECT *
                FROM messages
                WHERE (sender_id = ? AND receiver_id = ?)
                   OR (sender_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC
            ");
            $stmt->execute([$userData['id'], $receiverId, $receiverId, $userData['id']]);
        } catch (Throwable $e) {
            $stmt = $pdo->prepare("
                SELECT *
                FROM messages
                WHERE (user_id = ? AND receiver_id = ?)
                   OR (user_id = ? AND receiver_id = ?)
                ORDER BY created_at DESC
            ");
            $stmt->execute([$userData['id'], $receiverId, $receiverId, $userData['id']]);
        }

        $messages = $stmt->fetchAll();
        echo json_encode(["data" => $messages]);
        exit;
    }

    // Si no hay receiver_id en tabla o no enviaron receiver_id: mostrar solo mensajes del usuario
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userData['id']]);
    $messages = $stmt->fetchAll();

    echo json_encode(["data" => $messages]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);