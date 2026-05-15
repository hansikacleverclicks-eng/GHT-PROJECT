<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
    $conn->exec("CREATE TABLE IF NOT EXISTS premier_destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        city VARCHAR(100),
        description TEXT,
        image_url VARCHAR(500),
        sort_order INT DEFAULT 0,
        active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $conn->query('SELECT * FROM premier_destinations ORDER BY sort_order ASC, created_at DESC');
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['title']) || empty($data['region'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Title and region are required']);
                break;
            }
            $stmt = $conn->prepare('INSERT INTO premier_destinations (title, region, city, description, image_url, sort_order, active) VALUES (?,?,?,?,?,?,?)');
            $stmt->execute([
                $data['title'],
                $data['region'],
                $data['city'] ?? '',
                $data['description'] ?? '',
                $data['image_url'] ?? '',
                $data['sort_order'] ?? 0,
                isset($data['active']) ? (int)$data['active'] : 1
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('UPDATE premier_destinations SET title=?, region=?, city=?, description=?, image_url=?, sort_order=?, active=? WHERE id=?');
            $stmt->execute([
                $data['title'],
                $data['region'],
                $data['city'] ?? '',
                $data['description'] ?? '',
                $data['image_url'] ?? '',
                $data['sort_order'] ?? 0,
                isset($data['active']) ? (int)$data['active'] : 1,
                (int)$data['id']
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('DELETE FROM premier_destinations WHERE id=?');
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
