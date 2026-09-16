<?php
/**
 * API endpoint for Current Affairs management
 * Handles CRUD operations for current affairs posts
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($conn === null) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed."]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET': handleGet($conn); break;
        case 'POST': handlePost($conn); break;
        case 'PUT': handlePut($conn); break;
        case 'DELETE': handleDelete($conn); break;
        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed"]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error", "error" => $e->getMessage()]);
}

function handleGet($conn) {
    if (isset($_GET['id'])) {
        $stmt = $conn->prepare('SELECT id, title, excerpt, content, cover_image_url as image_url, category, city, author, created_at, views, 0 as featured, tags FROM blogs WHERE id = ?');
        $stmt->execute([$_GET['id']]);
        $affair = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($affair) {
            $updateStmt = $conn->prepare('UPDATE blogs SET views = views + 1 WHERE id = ?');
            $updateStmt->execute([$_GET['id']]);
            echo json_encode(["success" => true, "data" => $affair]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Current affair not found"]);
        }
    } else {
        $whereConditions = [];
        $params = [];

        if (isset($_GET['category']) && $_GET['category'] !== 'All') {
            $whereConditions[] = 'category = ?';
            $params[] = $_GET['category'];
        }
        if (isset($_GET['city']) && $_GET['city'] !== 'All Cities') {
            $whereConditions[] = 'city = ?';
            $params[] = $_GET['city'];
        }
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $whereConditions[] = '(title ILIKE ? OR content ILIKE ?)';
            $searchTerm = '%' . $_GET['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        $query = "SELECT id, title, excerpt, cover_image_url as image_url, category, city, author, created_at, views,
                         0 as featured, tags, content
                  FROM blogs $whereClause
                  ORDER BY created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $affairs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $affairs]);
    }
}

function handlePost($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Title and content are required"]);
        return;
    }

    $excerpt = strlen($data['content']) > 150 ? substr($data['content'], 0, 150) . '...' : $data['content'];
    $query = 'INSERT INTO blogs (title, content, excerpt, cover_image_url, category, city, author, tags)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        $data['title'], $data['content'], $excerpt, $data['image_url'] ?? null,
        $data['category'] ?? 'General', $data['city'] ?? 'All Cities',
        $data['author'] ?? 'Admin', $data['tags'] ?? ''
    ]);

    if ($result) {
        echo json_encode(["success" => true, "message" => "Current affair created successfully", "id" => $conn->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create current affair"]);
    }
}

function handlePut($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id']) || !isset($data['title']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID, title and content are required"]);
        return;
    }

    $excerpt = strlen($data['content']) > 150 ? substr($data['content'], 0, 150) . '...' : $data['content'];
    $query = 'UPDATE blogs SET title = ?, content = ?, excerpt = ?, cover_image_url = ?, category = ?, city = ?, author = ?, tags = ? WHERE id = ?';
    $stmt = $conn->prepare($query);
    $result = $stmt->execute([
        $data['title'], $data['content'], $excerpt, $data['image_url'] ?? null,
        $data['category'] ?? 'General', $data['city'] ?? 'All Cities',
        $data['author'] ?? 'Admin', $data['tags'] ?? '', $data['id']
    ]);

    if ($result) {
        echo json_encode(["success" => true, "message" => "Current affair updated successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update current affair"]);
    }
}

function handleDelete($conn) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID is required"]);
        return;
    }

    $stmt = $conn->prepare('DELETE FROM blogs WHERE id = ?');
    $result = $stmt->execute([$data['id']]);
    if ($result) {
        echo json_encode(["success" => true, "message" => "Current affair deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete current affair"]);
    }
}
?>
