<?php

require_once __DIR__ . '/../core/middleware.php';

$userData = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

$uri = explode("/", trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), "/"));
$id = is_numeric(end($uri)) ? end($uri) : null;

/* =========================
        GET SERVICES
========================= */

if ($method === 'GET') {

    $stmt = $pdo->query("SELECT * FROM services ORDER BY created_at DESC");
    $services = $stmt->fetchAll();

    echo json_encode(["data" => $services]);
    exit;
}

/* =========================
        CREATE SERVICE
========================= */

if ($method === 'POST') {

    if ($userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can create services"]);
        exit;
    }

    $name = $input['name'] ?? null;
    $description = $input['description'] ?? null;
    $price = $input['price'] ?? null;
    $duration = $input['duration'] ?? null;
    $image = $input['image'] ?? null;
    $category = $input['category'] ?? null;

    if (!$name || !$price || !$duration) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO services (name, description, price, duration, image, category)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
    ");

    $stmt->execute([
        $name,
        $description,
        $price,
        $duration,
        $image,
        $category
    ]);

    $service = $stmt->fetch();

    echo json_encode([
        "message" => "Service created",
        "data" => $service
    ]);
    exit;
}

/* =========================
        UPDATE SERVICE
========================= */

if ($method === 'PUT' && $id) {

    if ($userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can update services"]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE services
        SET name = ?, description = ?, price = ?, duration = ?, image = ?, category = ?
        WHERE id = ?
        RETURNING *
    ");

    $stmt->execute([
        $input['name'],
        $input['description'],
        $input['price'],
        $input['duration'],
        $input['image'],
        $input['category'],
        $id
    ]);

    $service = $stmt->fetch();

    echo json_encode([
        "message" => "Service updated",
        "data" => $service
    ]);
    exit;
}

/* =========================
        DELETE SERVICE
========================= */

if ($method === 'DELETE' && $id) {

    if ($userData['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can delete services"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Service deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
