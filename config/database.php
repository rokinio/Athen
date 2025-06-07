<?php
// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'athen');
define('DB_USER', 'dryazdandb');
define('DB_PASS', 'RIHNjxYuAiZCzSrWFqunim1O2Xk5AbyMfGuN9jrLL6sq8JyqjweYt'); // Add your password here
define('DB_PORT', 3306);
define('DB_CHARSET', 'utf8mb4');

class Database {
    private $connection;
    
    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
}
?>