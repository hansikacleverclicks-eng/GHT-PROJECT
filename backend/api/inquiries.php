<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../config/database.php';

if ($conn === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

// Create table if not exists
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT,
        number_of_guests VARCHAR(50),
        attending VARCHAR(100),
        meal_preferences VARCHAR(100),
        message TEXT,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $conn->query('SELECT * FROM inquiries ORDER BY created_at DESC');
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['name']) || empty($data['email'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name and email are required']);
                break;
            }
            $stmt = $conn->prepare('INSERT INTO inquiries (name, email, address, number_of_guests, attending, meal_preferences, message) VALUES (?,?,?,?,?,?,?)');
            $stmt->execute([
                trim($data['name']),
                trim($data['email']),
                $data['address'] ?? '',
                $data['numberOfGuests'] ?? $data['number_of_guests'] ?? '',
                $data['attending'] ?? '',
                $data['mealPreferences'] ?? $data['meal_preferences'] ?? '',
                $data['message'] ?? ''
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('DELETE FROM inquiries WHERE id=?');
            $stmt->execute([(int)$data['id']]);
            echo json_encode(['success' => true]);
            break;

        case 'PUT':
            // Mark as read
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('UPDATE inquiries SET is_read=1 WHERE id=?');
            $stmt->execute([(int)$data['id']]);
            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
