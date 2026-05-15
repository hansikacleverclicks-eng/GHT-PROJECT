<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']); exit();
}

require_once '../config/database.php';

$type     = $_POST['type'] ?? '';       // hotels | vendors | blogs
$recordId = intval($_POST['record_id'] ?? 0);
$rowNum   = intval($_POST['row_num'] ?? 0);

if (!in_array($type, ['hotels', 'vendors', 'blogs'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid type']); exit();
}
if (!isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'error' => 'No image file']); exit();
}

$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($_FILES['image']['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'error' => 'Invalid file type']); exit();
}
if ($_FILES['image']['size'] > 8 * 1024 * 1024) {
    echo json_encode(['success' => false, 'error' => 'File too large (max 8MB)']); exit();
}

$dirMap = ['hotels' => 'hotel-images', 'vendors' => 'logos', 'blogs' => 'blogs'];
$dir = "../../public/{$dirMap[$type]}/";
if (!is_dir($dir)) mkdir($dir, 0777, true);

$ext      = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$prefix   = rtrim($type, 's'); // hotel, vendor, blog
$filename = "{$prefix}_{$recordId}_" . time() . ".{$ext}";
$target   = $dir . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
    echo json_encode(['success' => false, 'error' => 'Failed to save file']); exit();
}

$urlDir   = $dirMap[$type];
$imageUrl = "/{$urlDir}/{$filename}";

// Update DB
try {
    if ($type === 'hotels' && $recordId) {
        $stmt = $conn->prepare('UPDATE hotels SET hero_image_url = ? WHERE id = ?');
        $stmt->execute([$imageUrl, $recordId]);
    } elseif ($type === 'vendors' && $recordId) {
        $stmt = $conn->prepare('UPDATE vendors SET image_url = ? WHERE id = ?');
        $stmt->execute([$imageUrl, $recordId]);
    } elseif ($type === 'blogs' && $recordId) {
        $stmt = $conn->prepare('UPDATE current_affairs SET image_url = ? WHERE id = ?');
        $stmt->execute([$imageUrl, $recordId]);
    }
} catch (Exception $e) {
    // Image saved but DB update failed — still return the URL
    echo json_encode(['success' => true, 'image_url' => $imageUrl, 'warning' => 'DB update failed: ' . $e->getMessage()]);
    exit();
}

echo json_encode(['success' => true, 'image_url' => $imageUrl, 'record_id' => $recordId, 'row_num' => $rowNum]);
