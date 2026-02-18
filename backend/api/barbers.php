<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

/* =========================
        GET BARBERS
========================= */

if ($method === 'GET') {

    $stmt = $pdo->query("
        SELECT 
            u.id,
            u.name,
            u.avatar,
            b.specialty,
            b.bio
        FROM barbers b
        JOIN users u ON u.id = b.user_id
        WHERE u.role = 'barber'
    ");

    $barbers = $stmt->fetchAll();

    // Agregar campos que el frontend espera
    $formatted = array_map(function ($barber) {
        return [
            "id" => $barber["id"],
            "name" => $barber["name"],
            "avatar" => $barber["avatar"] ?? "",
            "specialty" => $barber["specialty"],
            "rating" => 5, // valor fijo (puedes mejorarlo luego)
            "available" => true // puedes conectar esto a bookings luego
        ];
    }, $barbers);

    echo json_encode(["data" => $formatted]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
