<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once '../config/database.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!isset($data['blogs']) || !is_array($data['blogs'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid payload — expected blogs array']);
    exit();
}

$results = [];
$insertedCount = 0;

foreach ($data['blogs'] as $i => $row) {
    $title = trim($row['title'] ?? '');
    $content = trim($row['content'] ?? '');

    if (!$title || !$content) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => 'title and content are required', 'title' => $title];
        continue;
    }

    try {
        $stmt = $conn->prepare(
            'INSERT INTO blogs (title, content, excerpt, cover_image_url, category, city, author, tags)
             VALUES (:title, :content, :excerpt, :image_url, :category, :city, :author, :tags)'
        );

        $plainContent = trim(strip_tags($content));
        $excerpt = trim($row['excerpt'] ?? '');
        if (!$excerpt) {
            $excerpt = strlen($plainContent) > 150 ? substr($plainContent, 0, 150) . '...' : $plainContent;
        }

        $stmt->execute([
            ':title' => $title,
            ':content' => $content,
            ':excerpt' => $excerpt,
            ':image_url' => trim($row['image_url'] ?? ''),
            ':category' => trim($row['category'] ?? 'General'),
            ':city' => trim($row['city'] ?? 'All Cities'),
            ':author' => trim($row['author'] ?? 'Admin'),
            ':tags' => trim($row['tags'] ?? ''),
        ]);

        $newId = $conn->lastInsertId();
        $results[] = ['row' => $i + 1, 'success' => true, 'id' => $newId, 'title' => $title];
        $insertedCount++;
    } catch (Exception $e) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => $e->getMessage(), 'title' => $title];
    }
}

echo json_encode([
    'success' => true,
    'inserted' => $insertedCount,
    'total' => count($data['blogs']),
    'results' => $results
]);
