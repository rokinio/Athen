<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

function calculateSettlement($conn) {
    // Get all travelers
    $stmt = $conn->prepare("SELECT id, name FROM travelers");
    $stmt->execute();
    $travelers = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    if (empty($travelers)) {
        return ['settlements' => [], 'totalExpenses' => [], 'totalPaid' => []];
    }
    
    $balances = [];
    $totalExpenses = [];
    $totalPaid = [];
    
    // Initialize balances
    foreach (array_keys($travelers) as $travelerId) {
        $balances[$travelerId] = ['TOMAN' => 0, 'USD' => 0, 'EUR' => 0, 'GBP' => 0];
        $totalPaid[$travelerId] = ['TOMAN' => 0, 'USD' => 0, 'EUR' => 0, 'GBP' => 0];
    }
    
    // Calculate balances from expenses
    $stmt = $conn->prepare("
        SELECT e.*, COUNT(ep.traveler_id) as participant_count
        FROM expenses e
        LEFT JOIN expense_participants ep ON e.id = ep.expense_id
        GROUP BY e.id
    ");
    $stmt->execute();
    $expenses = $stmt->fetchAll();
    
    foreach ($expenses as $expense) {
        $shareAmount = $expense['amount'] / $expense['participant_count'];
        
        // Payer gets credit
        $balances[$expense['payer_id']][$expense['currency']] += $expense['amount'];
        $totalPaid[$expense['payer_id']][$expense['currency']] += $expense['amount'];
        
        // Add to total expenses
        if (!isset($totalExpenses[$expense['currency']])) {
            $totalExpenses[$expense['currency']] = 0;
        }
        $totalExpenses[$expense['currency']] += $expense['amount'];
        
        // Get participants and debit them
        $stmt = $conn->prepare("SELECT traveler_id FROM expense_participants WHERE expense_id = ?");
        $stmt->execute([$expense['id']]);
        $participants = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($participants as $participantId) {
            $balances[$participantId][$expense['currency']] -= $shareAmount;
        }
    }
    
    // Apply manual payments
    $stmt = $conn->prepare("SELECT * FROM manual_payments");
    $stmt->execute();
    $manualPayments = $stmt->fetchAll();
    
    foreach ($manualPayments as $payment) {
        $balances[$payment['payer_id']][$payment['currency']] -= $payment['amount'];
        $balances[$payment['receiver_id']][$payment['currency']] += $payment['amount'];
    }
    
    // Generate settlements for each currency
    $settlements = [];
    $currencies = ['TOMAN', 'USD', 'EUR', 'GBP'];
    
    foreach ($currencies as $currency) {
        $currencyBalances = [];
        foreach ($balances as $travelerId => $balance) {
            if (abs($balance[$currency]) > 0.01) {
                $currencyBalances[] = [
                    'travelerId' => $travelerId,
                    'amount' => $balance[$currency]
                ];
            }
        }
        
        $debtors = array_filter($currencyBalances, function($b) { return $b['amount'] < 0; });
        $creditors = array_filter($currencyBalances, function($b) { return $b['amount'] > 0; });
        
        // Optimize settlements using greedy algorithm
        foreach ($debtors as $debtor) {
            $remainingDebt = abs($debtor['amount']);
            
            foreach ($creditors as &$creditor) {
                if ($remainingDebt > 0.01 && $creditor['amount'] > 0.01) {
                    $settlementAmount = min($remainingDebt, $creditor['amount']);
                    
                    $settlements[] = [
                        'from' => $debtor['travelerId'],
                        'to' => $creditor['travelerId'],
                        'amount' => round($settlementAmount, 2),
                        'currency' => $currency,
                        'fromName' => $travelers[$debtor['travelerId']],
                        'toName' => $travelers[$creditor['travelerId']]
                    ];
                    
                    $remainingDebt -= $settlementAmount;
                    $creditor['amount'] -= $settlementAmount;
                }
            }
        }
    }
    
    // Filter out zero settlements
    $settlements = array_filter($settlements, function($s) { return $s['amount'] > 0.01; });
    
    // Clean up zero totals
    $totalExpenses = array_filter($totalExpenses, function($amount) { return $amount > 0; });
    foreach ($totalPaid as $travelerId => &$amounts) {
        $amounts = array_filter($amounts, function($amount) { return $amount > 0; });
    }
    
    return [
        'settlements' => array_values($settlements),
        'totalExpenses' => $totalExpenses,
        'totalPaid' => $totalPaid,
        'travelers' => $travelers,
        'manualPayments' => $manualPayments
    ];
}

try {
    $result = calculateSettlement($conn);
    echo json_encode(['success' => true, 'data' => $result]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>