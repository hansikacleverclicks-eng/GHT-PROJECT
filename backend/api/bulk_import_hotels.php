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

if (!isset($data['hotels']) || !is_array($data['hotels'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid payload — expected hotels array']); exit();
}

$results = [];
$insertedCount = 0;

foreach ($data['hotels'] as $i => $row) {
    $hotelName = trim($row['hotel_name'] ?? '');
    $city      = trim($row['city'] ?? '');

    if (!$hotelName || !$city) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => 'hotel_name and city are required', 'hotel_name' => $hotelName];
        continue;
    }

    try {
        $stmt = $conn->prepare(
            'INSERT INTO hotels (hotel_name, city, state, country, parent_company, sub_brand, description, website_url, hero_image_url)
             VALUES (:hotel_name, :city, :state, :country, :parent_company, :sub_brand, :description, :website_url, :hero_image_url)'
        );
        $stmt->execute([
            ':hotel_name'     => $hotelName,
            ':city'           => $city,
            ':state'          => trim($row['state'] ?? ''),
            ':country'        => trim($row['country'] ?? 'India'),
            ':parent_company' => trim($row['parent_company'] ?? ''),
            ':sub_brand'      => trim($row['sub_brand'] ?? ''),
            ':description'    => trim($row['description'] ?? ''),
            ':website_url'    => trim($row['website_url'] ?? ''),
            ':hero_image_url' => trim($row['hero_image_url'] ?? ''),
        ]);
        $newId = $conn->lastInsertId();
        $results[] = ['row' => $i + 1, 'success' => true, 'id' => $newId, 'hotel_name' => $hotelName];
        $insertedCount++;
    } catch (Exception $e) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => $e->getMessage(), 'hotel_name' => $hotelName];
    }
}

echo json_encode(['success' => true, 'inserted' => $insertedCount, 'total' => count($data['hotels']), 'results' => $results]);
