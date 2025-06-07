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
            $stmt = $conn->prepare("
                SELECT mp.*, 
                       tp.name as payer_name, tp.profile_picture as payer_picture,
                       tr.name as receiver_name, tr.profile_picture as receiver_picture
                FROM manual_payments mp
                LEFT JOIN travelers tp ON mp.payer_id = tp.id
                LEFT JOIN travelers tr ON mp.receiver_id = tr.id
                ORDER BY mp.date DESC, mp.created_at DESC
            ");
            $stmt->execute();
            $payments = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'data' => $payments]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $required = ['payerId', 'receiverId', 'amount', 'currency', 'date'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    throw new Exception("فیلد $field الزامی است");
                }
            }
            
            if ($input['payerId'] === $input['receiverId']) {
                throw new Exception('پرداخت کننده و دریافت کننده نمی‌توانند یکسان باشند');
            }
            
            $id = generateUUID();
            
            $stmt = $conn->prepare("
                INSERT INTO manual_payments (id, payer_id, receiver_id, amount, currency, date) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $input['payerId'],
                $input['receiverId'],
                $input['amount'],
                $input['currency'],
                $input['date']
            ]);
            
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('شناسه پرداخت الزامی است');
            }
            
            $stmt = $conn->prepare("DELETE FROM manual_payments WHERE id = ?");
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