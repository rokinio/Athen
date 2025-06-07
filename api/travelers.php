<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        try {
            $stmt = $conn->prepare("SELECT * FROM travelers ORDER BY created_at DESC");
            $stmt->execute();
            $travelers = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $travelers]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || empty(trim($input['name']))) {
                throw new Exception('نام مسافر الزامی است');
            }
            
            $id = generateUUID();
            $name = trim($input['name']);
            $profilePicture = isset($input['profilePicture']) ? $input['profilePicture'] : null;
            
            $stmt = $conn->prepare("INSERT INTO travelers (id, name, profile_picture) VALUES (?, ?, ?)");
            $stmt->execute([$id, $name, $profilePicture]);
            
            echo json_encode([
                'success' => true, 
                'data' => [
                    'id' => $id,
                    'name' => $name,
                    'profile_picture' => $profilePicture,
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('شناسه مسافر الزامی است');
            }
            
            $stmt = $conn->prepare("DELETE FROM travelers WHERE id = ?");
            $stmt->execute([$input['id']]);
            
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'error' => 'متد غیرمجاز']);
        break;
}
?>