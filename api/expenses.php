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
                SELECT e.*, t.name as payer_name, t.profile_picture as payer_picture,
                       GROUP_CONCAT(ep.traveler_id) as participant_ids
                FROM expenses e
                LEFT JOIN travelers t ON e.payer_id = t.id
                LEFT JOIN expense_participants ep ON e.id = ep.expense_id
                GROUP BY e.id
                ORDER BY e.date DESC, e.created_at DESC
            ");
            $stmt->execute();
            $expenses = $stmt->fetchAll();
            
            // Get participant details for each expense
            foreach ($expenses as &$expense) {
                if ($expense['participant_ids']) {
                    $participantIds = explode(',', $expense['participant_ids']);
                    $placeholders = str_repeat('?,', count($participantIds) - 1) . '?';
                    $stmt = $conn->prepare("SELECT id, name, profile_picture FROM travelers WHERE id IN ($placeholders)");
                    $stmt->execute($participantIds);
                    $expense['participants'] = $stmt->fetchAll();
                } else {
                    $expense['participants'] = [];
                }
                
                // Decode receipts JSON
                $expense['receipts'] = $expense['receipts'] ? json_decode($expense['receipts'], true) : [];
            }
            
            echo json_encode(['success' => true, 'data' => $expenses]);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'POST':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validation
            $required = ['title', 'amount', 'currency', 'payerId', 'participantIds', 'date'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    throw new Exception("فیلد $field الزامی است");
                }
            }
            
            $conn->beginTransaction();
            
            $id = generateUUID();
            $receipts = isset($input['receipts']) ? json_encode($input['receipts']) : null;
            
            // Insert expense
            $stmt = $conn->prepare("
                INSERT INTO expenses (id, title, amount, currency, payer_id, date, receipts) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $id,
                $input['title'],
                $input['amount'],
                $input['currency'],
                $input['payerId'],
                $input['date'],
                $receipts
            ]);
            
            // Insert participants
            $stmt = $conn->prepare("INSERT INTO expense_participants (expense_id, traveler_id) VALUES (?, ?)");
            foreach ($input['participantIds'] as $participantId) {
                $stmt->execute([$id, $participantId]);
            }
            
            $conn->commit();
            
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                throw new Exception('شناسه هزینه الزامی است');
            }
            
            $stmt = $conn->prepare("DELETE FROM expenses WHERE id = ?");
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