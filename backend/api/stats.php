<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();

if ($userData['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access denied"]);
    exit;
}

/* =========================
        STATS
========================= */

$totalUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalBarbers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'barber'")->fetchColumn();
$totalBookings = $pdo->query("SELECT COUNT(*) FROM bookings")->fetchColumn();
$totalProducts = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
$totalRevenue = $pdo->query("
    SELECT COALESCE(SUM(s.price),0)
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    WHERE b.status = 'completed'
")->fetchColumn();

echo json_encode([
    "data" => [
        "totalUsers" => (int)$totalUsers,
        "totalBarbers" => (int)$totalBarbers,
        "totalBookings" => (int)$totalBookings,
        "totalProducts" => (int)$totalProducts,
        "totalRevenue" => (float)$totalRevenue
    ]
]);
