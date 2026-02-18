<?php

require_once __DIR__ . '/../core/middleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true);

// Obtener ID si viene en la URL: /api/products/123
$uri = explode("/", trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), "/"));
$id  = is_numeric(end($uri)) ? (int) end($uri) : null;

/* =========================
        GET PRODUCTS (PUBLIC)
========================= */
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
    $products = $stmt->fetchAll();

    echo json_encode(["data" => $products]);
    exit;
}

/* =========================
   AUTH REQUIRED FROM HERE
========================= */
$userData = requireAuth();

/* =========================
        CREATE PRODUCT (ADMIN)
========================= */
if ($method === 'POST') {

    if (($userData['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can create products"]);
        exit;
    }

    $name        = $input['name'] ?? null;
    $description = $input['description'] ?? null;
    $price       = $input['price'] ?? null;
    $stock       = $input['stock'] ?? 0;
    $image       = $input['image'] ?? null;
    $category    = $input['category'] ?? null;

    if (!$name || !$price) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, price, stock, image, category)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING *
    ");

    $stmt->execute([$name, $description, $price, $stock, $image, $category]);
    $product = $stmt->fetch();

    echo json_encode([
        "message" => "Product created",
        "data"    => $product
    ]);
    exit;
}

/* =========================
        UPDATE PRODUCT (ADMIN)
========================= */
if ($method === 'PUT' && $id) {

    if (($userData['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can update products"]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE products
        SET name = ?, description = ?, price = ?, stock = ?, image = ?, category = ?
        WHERE id = ?
        RETURNING *
    ");

    $stmt->execute([
        $input['name'] ?? null,
        $input['description'] ?? null,
        $input['price'] ?? null,
        $input['stock'] ?? 0,
        $input['image'] ?? null,
        $input['category'] ?? null,
        $id
    ]);

    $product = $stmt->fetch();

    echo json_encode([
        "message" => "Product updated",
        "data"    => $product
    ]);
    exit;
}

/* =========================
        DELETE PRODUCT (ADMIN)
========================= */
if ($method === 'DELETE' && $id) {

    if (($userData['role'] ?? '') !== 'admin') {
        http_response_code(403);
        echo json_encode(["error" => "Only admin can delete products"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(["message" => "Product deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);