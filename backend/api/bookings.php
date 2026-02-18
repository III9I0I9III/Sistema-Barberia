<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

$uri = explode("/", trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), "/"));
$id = is_numeric(end($uri)) ? end($uri) : null;

/* =========================
        GET BOOKINGS
========================= */

if ($method === 'GET') {

    if ($userData['role'] === 'admin') {
        $stmt = $pdo->query("SELECT * FROM bookings ORDER BY created_at DESC");
    } else {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userData['id']]);
    }

    $bookings = $stmt->fetchAll();

    echo json_encode(["data" => $bookings]);
    exit;
}

/* =========================
        CREATE BOOKING
========================= */

if ($method === 'POST') {

    $barberId = $input['barber_id'] ?? null;
    $serviceId = $input['service_id'] ?? null;
    $date = $input['date'] ?? null;
    $time = $input['time'] ?? null;

    if (!$barberId || !$serviceId || !$date || !$time) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO bookings (user_id, barber_id, service_id, booking_date, booking_time)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
    ");

    $stmt->execute([
        $userData['id'],
        $barberId,
        $serviceId,
        $date,
        $time
    ]);

    $booking = $stmt->fetch();

    echo json_encode([
        "message" => "Booking created",
        "data" => $booking
    ]);
    exit;
}

/* =========================
        UPDATE BOOKING STATUS
========================= */

if ($method === 'PUT' && $id) {

    if (!in_array($userData['role'], ['admin', 'barber'])) {
        http_response_code(403);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $status = $input['status'] ?? null;

    if (!$status) {
        http_response_code(400);
        echo json_encode(["error" => "Status required"]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE bookings
        SET status = ?
        WHERE id = ?
        RETURNING *
    ");

    $stmt->execute([$status, $id]);
    $booking = $stmt->fetch();

    echo json_encode([
        "message" => "Booking updated",
        "data" => $booking
    ]);
    exit;
}

/* =========================
        DELETE BOOKING
========================= */

if ($method === 'DELETE' && $id) {

    if ($userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can delete bookings"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Booking deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
