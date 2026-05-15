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
    $conn->exec("CREATE TABLE IF NOT EXISTS awards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nominee_name VARCHAR(255) NOT NULL,
        nominee_type ENUM('hotel','vendor','other') DEFAULT 'hotel',
        category VARCHAR(100) NOT NULL,
        tier ENUM('Pinnacle','Excellence','Distinction') NOT NULL,
        city VARCHAR(100),
        year INT DEFAULT 2025,
        description TEXT,
        image_url VARCHAR(500),
        status ENUM('nominated','winner','finalist') DEFAULT 'nominated',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (PDOException $e) {}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $stmt = $conn->query('SELECT * FROM awards ORDER BY year DESC, created_at DESC');
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $rows]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['nominee_name']) || empty($data['tier'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Nominee name and tier are required']);
                break;
            }
            $stmt = $conn->prepare('INSERT INTO awards (nominee_name, nominee_type, category, tier, city, year, description, image_url, status) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->execute([
                $data['nominee_name'],
                $data['nominee_type'] ?? 'hotel',
                $data['category'] ?? '',
                $data['tier'],
                $data['city'] ?? '',
                $data['year'] ?? date('Y'),
                $data['description'] ?? '',
                $data['image_url'] ?? '',
                $data['status'] ?? 'nominated'
            ]);
            echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('UPDATE awards SET nominee_name=?, nominee_type=?, category=?, tier=?, city=?, year=?, description=?, image_url=?, status=? WHERE id=?');
            $stmt->execute([
                $data['nominee_name'],
                $data['nominee_type'] ?? 'hotel',
                $data['category'] ?? '',
                $data['tier'],
                $data['city'] ?? '',
                $data['year'] ?? date('Y'),
                $data['description'] ?? '',
                $data['image_url'] ?? '',
                $data['status'] ?? 'nominated',
                (int)$data['id']
            ]);
            echo json_encode(['success' => true]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) { http_response_code(400); echo json_encode(['success' => false, 'error' => 'ID required']); break; }
            $stmt = $conn->prepare('DELETE FROM awards WHERE id=?');
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
