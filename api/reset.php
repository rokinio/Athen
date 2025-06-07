<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'متد غیرمجاز']);
    exit;
}

$db = new Database();
$conn = $db->getConnection();

try {
    $conn->beginTransaction();
    
    // Delete in correct order due to foreign key constraints
    $conn->exec("DELETE FROM expense_participants");
    $conn->exec("DELETE FROM manual_payments");
    $conn->exec("DELETE FROM expenses");
    $conn->exec("DELETE FROM travelers");
    
    $conn->commit();
    
    echo json_encode(['success' => true, 'message' => 'تمام داده‌ها با موفقیت حذف شدند']);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>