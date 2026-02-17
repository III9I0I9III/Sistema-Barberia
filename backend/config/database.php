<?php

// Solo enviar headers si no estamos en CLI
if (php_sapi_name() !== 'cli') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

class Database {
    private $host = 'localhost';
    private $port = '5432';
    private $db_name = 'barberia_db';
    private $username = 'postgres';
    private $password = 'password'; // Cambia por tu contraseña real
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name}",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "Conectado a PostgreSQL\n";
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage() . "\n";
        }
        return $this->conn;
    }
}

$database = new Database();
$conn = $database->getConnection();
