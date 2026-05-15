<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing image file']);
    exit;
}

$targetDir = '../../city-images/';
if (!is_dir($targetDir)) {
    if (!mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create upload directory']);
        exit;
    }
}

$ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$filename = 'city_' . time() . '_' . rand(1000, 9999) . '.' . $ext;
$targetFile = $targetDir . $filename;

if (!is_uploaded_file($_FILES['image']['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid uploaded file']);
    exit;
}

if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
    exit;
}

$image_url = '/city-images/' . $filename;

// If cityId provided, update DB
if (isset($_POST['cityId']) && $conn !== null) {
    try {
        $stmt = $conn->prepare('UPDATE cities SET hero_image_url=? WHERE id=?');
        $stmt->execute([$image_url, (int)$_POST['cityId']]);
    } catch (PDOException $e) {
        // Non-fatal — still return the URL
    }
}

echo json_encode(['success' => true, 'image_url' => $image_url]);
?>
