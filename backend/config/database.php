<?php

class Database {

    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;

    public $conn;

    public function __construct() {

        $this->host = getenv("DB_HOST") ?: "localhost";
        $this->port = getenv("DB_PORT") ?: "5432";
        $this->db_name = getenv("DB_NAME") ?: "";
        $this->username = getenv("DB_USER") ?: "";
        $this->password = getenv("DB_PASSWORD") ?: "";
    }

    public function getConnection() {

        $this->conn = null;

        try {

            if (!$this->host || !$this->db_name || !$this->username) {
                throw new Exception("Variables de entorno DB faltantes");
            }

            $this->conn = new PDO(
                "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name};sslmode=require",
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch(Exception $e) {

            http_response_code(500);
            die(json_encode([
                "error" => "Database config error",
                "details" => $e->getMessage()
            ]));

        } catch(PDOException $exception) {

            http_response_code(500);
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
