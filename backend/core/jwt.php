<?php

function generateJWT($user) {
    $secret = "SUPER_SECRET_KEY_2025";

    $header = base64_encode(json_encode([
        "alg" => "HS256",
        "typ" => "JWT"
    ]));

    $payload = base64_encode(json_encode([
        "id" => $user["id"],
        "email" => $user["email"],
        "role" => $user["role"],
        "exp" => time() + (60 * 60 * 24)
    ]));

    $signature = base64_encode(hash_hmac(
        "sha256",
        "$header.$payload",
        $secret,
        true
    ));

    return "$header.$payload.$signature";
}

function verifyJWT($token) {
    $secret = "SUPER_SECRET_KEY_2025";

    $parts = explode(".", $token);
    if (count($parts) !== 3) return false;

    [$header, $payload, $signature] = $parts;

    $validSignature = base64_encode(hash_hmac(
        "sha256",
        "$header.$payload",
        $secret,
        true
    ));

    if ($signature !== $validSignature) return false;

    $decoded = json_decode(base64_decode($payload), true);

    if ($decoded["exp"] < time()) return false;

    return $decoded;
}
