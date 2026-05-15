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

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!isset($data['blogs']) || !is_array($data['blogs'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid payload — expected blogs array']); exit();
}

$results = [];
$insertedCount = 0;

foreach ($data['blogs'] as $i => $row) {
    $title   = trim($row['title'] ?? '');
    $content = trim($row['content'] ?? '');

    if (!$title || !$content) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => 'title and content are required', 'title' => $title];
        continue;
    }

    try {
        $stmt = $conn->prepare(
            'INSERT INTO current_affairs (title, content, image_url, category, city, author, tags, featured)
             VALUES (:title, :content, :image_url, :category, :city, :author, :tags, :featured)'
        );
        $featured = filter_var($row['featured'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $stmt->execute([
            ':title'     => $title,
            ':content'   => $content,
            ':image_url' => trim($row['image_url'] ?? ''),
            ':category'  => trim($row['category'] ?? 'General'),
            ':city'      => trim($row['city'] ?? 'All Cities'),
            ':author'    => trim($row['author'] ?? 'Admin'),
            ':tags'      => trim($row['tags'] ?? ''),
            ':featured'  => $featured,
        ]);
        $newId = $conn->lastInsertId();
        $results[] = ['row' => $i + 1, 'success' => true, 'id' => $newId, 'title' => $title];
        $insertedCount++;
    } catch (Exception $e) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => $e->getMessage(), 'title' => $title];
    }
}

echo json_encode(['success' => true, 'inserted' => $insertedCount, 'total' => count($data['blogs']), 'results' => $results]);
