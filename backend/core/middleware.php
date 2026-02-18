<?php

require_once __DIR__ . "/jwt.php";

function requireAuth() {
    $headers = getallheaders();

    if (!isset($headers["Authorization"])) {
        http_response_code(401);
        echo json_encode(["error" => "Token required"]);
        exit;
    }

    $token = str_replace("Bearer ", "", $headers["Authorization"]);
    $decoded = verifyJWT($token);

    if (!$decoded) {
        http_response_code(401);
        echo json_encode(["error" => "Invalid token"]);
        exit;
    }

    return $decoded;
}
