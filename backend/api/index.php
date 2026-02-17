<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', trim($request_uri, '/'));

$endpoint = isset($uri[count($uri) - 1]);

function getInputData() {
    return json_decode(file_get_contents("php://input"), true);
}

function sendResponse($status, $data) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function verifyToken() {
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        sendResponse(401, ["error" => "No token provided"]);
    }
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    
    $secret_key = 'tu_clave_secreta_barbados_2024';
    try {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            sendResponse(401, ["error" => "Invalid token"]);
        }
        $payload = json_decode(base64_decode($parts[1]), true);
        if (!$payload || !isset($payload['id'])) {
            sendResponse(401, ["error" => "Invalid token payload"]);
        }
        return $payload;
    } catch (Exception $e) {
        sendResponse(401, ["error" => "Token verification failed"]);
    }
}

function createToken($user) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24)
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", 'tu_clave_secreta_barbados_2024');
    return "$header.$payload.$signature";
}

// Autenticación
if ($endpoint === 'register' && $request_method === 'POST') {
    $data = getInputData();
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        sendResponse(400, ["error" => "Missing required fields"]);
    }
    try {
        global $conn;
        $check_email = $conn->prepare("SELECT id FROM users WHERE email = :email");
        $check_email->bindParam(":email", $data['email']);
        $check_email->execute();
        if ($check_email->rowCount() > 0) {
            sendResponse(400, ["error" => "Email already exists"]);
        }
        $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT);
        $query = $conn->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (:name, :email, :password, :phone, 'client')");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":email", $data['email']);
        $query->bindParam(":password", $hashed_password);
        $phone = isset($data['phone']) ? $data['phone'] : '';
        $query->bindParam(":phone", $phone);
        $query->execute();
        $user_id = $conn->lastInsertId();
        $user = [
            'id' => $user_id,
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => 'client'
        ];
        $token = createToken($user);
        sendResponse(201, ['message' => 'User registered successfully', 'token' => $token, 'user' => $user]);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'login' && $request_method === 'POST') {
    $data = getInputData();
    if (empty($data['email']) || empty($data['password'])) {
        sendResponse(400, ["error" => "Email and password are required"]);
    }
    try {
        global $conn;
        $query = $conn->prepare("SELECT id, name, email, password, phone, role, avatar FROM users WHERE email = :email");
        $query->bindParam(":email", $data['email']);
        $query->execute();
        $user = $query->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            sendResponse(401, ["error" => "Invalid credentials"]);
        }
        if (!password_verify($data['password'], $user['password'])) {
            sendResponse(401, ["error" => "Invalid credentials"]);
        }
        unset($user['password']);
        $token = createToken($user);
        sendResponse(200, ['message' => 'Login successful', 'token' => $token, 'user' => $user]);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Servicios
if ($endpoint === 'services' && $request_method === 'GET') {
    try {
        global $conn;
        $query = $conn->query("SELECT * FROM services ORDER BY name");
        $services = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $services);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'services' && $request_method === 'POST') {
    $payload = verifyToken();
    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Unauthorized"]);
    }
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("INSERT INTO services (name, description, price, duration, category) VALUES (:name, :description, :price, :duration, :category)");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":description", $data['description']);
        $query->bindParam(":price", $data['price']);
        $query->bindParam(":duration", $data['duration']);
        $query->bindParam(":category", $data['category']);
        $query->execute();
        sendResponse(201, ['message' => 'Service created', 'id' => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Productos
if ($endpoint === 'products' && $request_method === 'GET') {
    try {
        global $conn;
        $query = $conn->query("SELECT * FROM products ORDER BY name");
        $products = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $products);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'products' && $request_method === 'POST') {
    $payload = verifyToken();
    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Unauthorized"]);
    }
    $query = $conn->prepare("INSERT INTO products (name, description, price, stock, category) VALUES (:name, :description, :price, :stock, :category)");
    $query->bindParam(":name", $data['name']);
    $query->bindParam(":description", $data['description']);
    $query->bindParam(":price", $data['price']);
    $query->bindParam(":stock", $data['stock']);
    $query->bindParam(":category", $data['category']);
    $query->execute();
    sendResponse(201, ['message' => 'Product created', 'id' => $conn->lastInsertId()]);
}

// Barberos
if ($endpoint === 'barbers' && $request_method === 'GET') {
    try {
        global $conn;
        $query = $conn->query("SELECT u.id, u.name, u.email, u.phone, u.avatar, b.specialty, b.bio FROM users u JOIN barbers b ON u.id = b.user_id WHERE u.role = 'barber'");
        $barbers = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $barbers);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Usuarios
if ($endpoint === 'users' && $request_method === 'GET') {
    $payload = verifyToken();
    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Unauthorized"]);
    }
    try {
        global $conn;
        $query = $conn->query("SELECT id, name, email, phone, role, created_at FROM users ORDER BY name");
        $users = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $users);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if (strpos($request_uri, 'profile') && $request_method === 'GET') {
    $payload = verifyToken();
    try {
        global $conn;
        $query = $conn->prepare("SELECT id, name, email, phone, avatar, role FROM users WHERE id = :id");
        $query->bindParam(":id", $payload['id']);
        $query->execute();
        $user = $query->fetch(PDO::FETCH_ASSOC);
        sendResponse(200, $user);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if (strpos($request_uri, 'profile') && $request_method === 'PUT') {
    $payload = verifyToken();
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("UPDATE users SET name = :name, phone = :phone WHERE id = :id");
        $query->bindParam(":name", $data['name']);
        $query->bindParam(":phone", $data['phone']);
        $query->bindParam(":id", $payload['id']);
        $query->execute();
        sendResponse(200, ['message' => 'Profile updated successfully']);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'change-password' && $request_method === 'POST') {
    $payload = verifyToken();
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("SELECT password FROM users WHERE id = :id");
        $query->bindParam(":id", $payload['id']);
        $query->execute();
        $user = $query->fetch(PDO::FETCH_ASSOC);
        if (!password_verify($data['current_password'], $user['password'])) {
            sendResponse(401, ["error" => "Current password is incorrect"]);
        }
        $hashed_password = password_hash($data['new_password'], PASSWORD_BCRYPT);
        $update = $conn->prepare("UPDATE users SET password = :password WHERE id = :id");
        $update->bindParam(":password", $hashed_password);
        $update->bindParam(":id", $payload['id']);
        $update->execute();
        sendResponse(200, ['message' => 'Password changed successfully']);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'delete-account' && $request_method === 'DELETE') {
    $payload = verifyToken();
    try {
        global $conn;
        $query = $conn->prepare("DELETE FROM users WHERE id = :id");
        $query->bindParam(":id", $payload['id']);
        $query->execute();
        sendResponse(200, ['message' => 'Account deleted successfully']);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Reservas
if ($endpoint === 'bookings' && $request_method === 'GET') {
    $payload = verifyToken();
    try {
        global $conn;
        if ($payload['role'] === 'client') {
            $query = $conn->prepare("SELECT b.id, b.booking_date, b.booking_time, b.status, b.notes, s.name as service_name, s.price, u.name as barber_name FROM bookings b JOIN services s ON b.service_id = s.id JOIN users u ON b.barber_id = u.id WHERE b.user_id = :user_id ORDER BY b.booking_date DESC");
            $query->bindParam(":user_id", $payload['id']);
        } elseif ($payload['role'] === 'barber') {
            $query = $conn->prepare("SELECT b.id, b.booking_date, b.booking_time, b.status, b.notes, s.name as service_name, u.name as client_name, u.phone as client_phone FROM bookings b JOIN services s ON b.service_id = s.id JOIN users u ON b.user_id = u.id WHERE b.barber_id = :barber_id ORDER BY b.booking_date DESC");
            $query->bindParam(":barber_id", $payload['id']);
        } else {
            $query = $conn->query("SELECT b.*, s.name as service_name, u.name as client_name, ub.name as barber_name FROM bookings b JOIN services s ON b.service_id = s.id JOIN users u ON b.user_id = u.id JOIN users ub ON b.barber_id = ub.id ORDER BY b.booking_date DESC");
        }
        $query->execute();
        $bookings = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $bookings);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'bookings' && $request_method === 'POST') {
    $payload = verifyToken();
    $payload = verifyToken();
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("INSERT INTO bookings (user_id, barber_id, service_id, booking_date, booking_time, notes) VALUES (:user_id, :barber_id, :service_id, :booking_date, :booking_time, :notes)");
        $query->bindParam(":user_id", $payload['id']);
        $query->bindParam(":barber_id", $data['barber_id']);
        $query->bindParam(":service_id", $data['service_id']);
        $query->bindParam(":booking_date", $data['booking_date']);
        $query->bindParam(":booking_time", $data['booking_time']);
        $query->bindParam(":notes", $data['notes']);
        $query->execute();
        sendResponse(201, ['message' => 'Booking created successfully', 'id' => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if (strpos($request_uri, 'bookings/') && $request_method === 'PUT') {
    $payload = verifyToken();
    $payload = verifyToken();
    $parts = explode('/', $request_uri);
    $id = end($parts);
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("UPDATE bookings SET status = :status WHERE id = :id");
        $query->bindParam(":status", $data['status']);
        $query->bindParam(":id", $id);
        $query->execute();
        sendResponse(200, ['message' => 'Booking updated successfully']);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if (strpos($request_uri, 'bookings/') && $request_method === 'DELETE') {
    $payload = verifyToken();
    $parts = explode('/', $request_uri);
    $id = end($parts);
    try {
        global $conn;
        $query = $conn->prepare("DELETE FROM bookings WHERE id = :id");
        $query->bindParam(":id", $id);
        $query->execute();
        sendResponse(200, ['message' => 'Booking deleted successfully']);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Chat
if ($endpoint === 'messages' && $request_method === 'GET') {
    $payload = verifyToken();
    try {
        global $conn;
        $receiver_id = isset($_GET['receiver_id']) ? $_GET['receiver_id'] : null;
        if ($receiver_id) {
            $query = $conn->prepare("SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE (m.sender_id = :sender_id AND m.receiver_id = :receiver_id) OR (m.sender_id = :receiver_id2 AND m.receiver_id = :sender_id2) ORDER BY m.created_at ASC");
            $query->bindParam(":sender_id", $payload['id']);
            $query->bindParam(":receiver_id", $receiver_id);
            $query->bindParam(":receiver_id2", $receiver_id);
            $query->bindParam(":sender_id2", $payload['id']);
        } else {
            $query = $conn->prepare("SELECT DISTINCT CASE WHEN sender_id = :user_id THEN receiver_id ELSE sender_id END as contact_id, u.name as contact_name, (SELECT message FROM messages m2 WHERE (m2.sender_id = :user_id2 OR m2.receiver_id = :user_id3 ORDER BY m2.created_at DESC LIMIT 1) as last_message, MAX(messages.created_at) as last_time FROM messages JOIN users u ON u.id = CASE WHEN sender_id = :user_id4 THEN receiver_id ELSE sender_id END WHERE sender_id = :user_id5 OR receiver_id = :user_id6 GROUP BY contact_id, contact_name ORDER BY last_time DESC");
            $query->bindParam(":user_id", $payload['id']);
            $query->bindParam(":user_id2", $payload['id']);
            $query->bindParam(":user_id3", $payload['id']);
            $query->bindParam(":user_id4", $payload['id']);
            $query->bindParam(":user_id5", $payload['id']);
            $query->bindParam(":user_id6", $payload['id']);
        }
        $query->execute();
        $messages = $query->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(200, $messages);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

if ($endpoint === 'messages' && $request_method === 'POST') {
    $payload = verifyToken();
    $data = getInputData();
    try {
        global $conn;
        $query = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)");
        $query->bindParam(":sender_id", $payload['id']);
        $query->bindParam(":receiver_id", $data['receiver_id']);
        $query->bindParam(":message", $data['message']);
        $query->execute();
        sendResponse(201, ['message' => 'Message sent successfully', 'id' => $conn->lastInsertId()]);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

// Stats para Admin
if ($endpoint === 'stats' && $request_method === 'GET') {
    $payload = verifyToken();
    if ($payload['role'] !== 'admin') {
        sendResponse(403, ["error" => "Unauthorized"]);
    }
    try {
        global $conn;
        $stats = [];
        $total_users = $conn->query("SELECT COUNT(*) as total FROM users")->fetch(PDO::FETCH_ASSOC);
        $stats['total_users'] = $total_users['total'];

        $total_clients = $conn->query("SELECT COUNT(*) as total FROM users WHERE role = 'client'")->fetch(PDO::FETCH_ASSOC);
        $stats['total_clients'] = $total_clients['total'];

        $total_bookings = $conn->query("SELECT COUNT(*) as total FROM bookings")->fetch(PDO::FETCH_ASSOC);
        $stats['total_bookings'] = $total_bookings['total'];

        $total_revenue = $conn->query("SELECT SUM(s.price) as total FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.status = 'completed'")->fetch(PDO::FETCH_ASSOC);
        $stats['total_revenue'] = isset($total_revenue['total']) ? $total_revenue['total'] : 0;

        sendResponse(200, $stats);
    } catch(PDOException $e) {
        sendResponse(500, ["error" => $e->getMessage()]);
    }
}

sendResponse(404, ["error" => "Endpoint not found"]);
?>
