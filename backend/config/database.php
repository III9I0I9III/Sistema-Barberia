<?php

class Database {

    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;

    public $conn;

    public function __construct() {
        $this->host = getenv("DB_HOST");
        $this->port = getenv("DB_PORT");
        $this->db_name = getenv("DB_NAME");
        $this->username = getenv("DB_USER");
        $this->password = getenv("DB_PASSWORD");
    }

    public function getConnection() {

        $this->conn = null;

        try {
            $this->conn = new PDO(
                "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name};sslmode=require",
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            echo "🔥 Conectado a Neon 🔥";

        } catch(PDOException $exception) {

            die(json_encode([
                "error" => "Database connection failed",
                "details" => $exception->getMessage()
            ]));

        }

        return $this->conn;
    }
}

$database = new Database();
$conn = $database->getConnection();
