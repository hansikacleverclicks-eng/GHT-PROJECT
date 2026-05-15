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

if (!isset($data['vendors']) || !is_array($data['vendors'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid payload — expected vendors array']); exit();
}

$results = [];
$insertedCount = 0;

foreach ($data['vendors'] as $i => $row) {
    $name  = trim($row['vendorName'] ?? $row['vendor_name'] ?? '');
    $email = trim($row['email'] ?? '');

    if (!$name || !$email) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => 'vendorName and email are required', 'name' => $name];
        continue;
    }

    // Check duplicate email
    $check = $conn->prepare('SELECT id FROM vendors WHERE email = ?');
    $check->execute([$email]);
    if ($check->fetch()) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => "Email $email already exists", 'name' => $name];
        continue;
    }

    try {
        $stmt = $conn->prepare(
            'INSERT INTO vendors (vendor_name, email, phone, contact_person_name, category, city, website_url, image_url, description, status)
             VALUES (:vendor_name, :email, :phone, :contact_person_name, :category, :city, :website_url, :image_url, :description, :status)'
        );
        $stmt->execute([
            ':vendor_name'         => $name,
            ':email'               => $email,
            ':phone'               => trim($row['phone'] ?? ''),
            ':contact_person_name' => trim($row['contactPersonName'] ?? $row['contact_person'] ?? ''),
            ':category'            => trim($row['category'] ?? ''),
            ':city'                => trim($row['city'] ?? ''),
            ':website_url'         => trim($row['websiteUrl'] ?? $row['website_url'] ?? ''),
            ':image_url'           => trim($row['imageUrl'] ?? $row['image_url'] ?? ''),
            ':description'         => trim($row['description'] ?? ''),
            ':status'              => trim($row['status'] ?? 'active'),
        ]);
        $newId = $conn->lastInsertId();
        $results[] = ['row' => $i + 1, 'success' => true, 'id' => $newId, 'name' => $name];
        $insertedCount++;
    } catch (Exception $e) {
        $results[] = ['row' => $i + 1, 'success' => false, 'error' => $e->getMessage(), 'name' => $name];
    }
}

echo json_encode(['success' => true, 'inserted' => $insertedCount, 'total' => count($data['vendors']), 'results' => $results]);
