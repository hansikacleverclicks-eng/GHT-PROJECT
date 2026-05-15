<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if ($conn === null) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'City name is required']);
    exit;
}

// Auto-generate slug from name if not provided
$slug = isset($data['slug']) && $data['slug'] !== ''
    ? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $data['slug']))
    : strtolower(preg_replace('/[^a-z0-9]+/i', '-', $data['name']));

try {
    $stmt = $conn->prepare('INSERT INTO cities (name, slug, hero_image_url, tagline) VALUES (?, ?, ?, ?)');
    $stmt->execute([
        trim($data['name']),
        trim($slug),
        $data['hero_image_url'] ?? '',
        $data['tagline'] ?? ''
    ]);
    echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
