<?php
require_once __DIR__ . '/_bootstrap.php';
$admin = require_permission('view_leads');
$message = '';
$q = trim((string) ($_GET['q'] ?? ''));
$status = trim((string) ($_GET['status'] ?? ''));
$source = trim((string) ($_GET['source'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    if (!can('manage_leads')) {
        http_response_code(403);
        exit('Access denied');
    }
    $leadId = (int) ($_POST['lead_id'] ?? 0);
    if (isset($_POST['convert_lead'])) {
        $stmt = db()->prepare('SELECT * FROM quick_leads WHERE id=?');
        $stmt->execute([$leadId]);
        $lead = $stmt->fetch();
        if (!$lead) {
            $message = 'Lead not found.';
        } else {
            $userStmt = db()->prepare('SELECT * FROM users WHERE phone=? LIMIT 1');
            $userStmt->execute([$lead['phone']]);
            $user = $userStmt->fetch();
            if (!$user) {
                $message = 'No existing user with this phone. Ask the customer to sign up first, then convert.';
            } else {
                $code = 'REQ-' . random_int(100000, 999999);
                db()->prepare('INSERT INTO service_requests (request_code, user_id, service_type, status, details) VALUES (?, ?, ?, ?, ?)')->execute([$code, (int) $user['id'], $lead['service'] ?: 'General Tax Support', 'Request received', $lead['message'] ?? 'Converted from quick lead']);
                $requestId = (int) db()->lastInsertId();
                db()->prepare('INSERT INTO status_updates (request_id,status,note,visible_to_user) VALUES (?,?,?,1)')->execute([$requestId, 'Request received', 'Request created from quick phone lead.']);
                db()->prepare('UPDATE quick_leads SET status=?, admin_note=? WHERE id=?')->execute(['Converted', 'Converted to request ' . $code, $leadId]);
                audit_log((int) $admin['id'], (int) $user['id'], 'lead_converted', 'Lead ' . $leadId . ' converted to request ' . $code);
                $message = 'Lead converted to request ' . $code . '.';
            }
        }
    } else {
    $leadStatus = trim((string) ($_POST['status'] ?? 'New'));
    $note = trim((string) ($_POST['admin_note'] ?? ''));
    db()->prepare('UPDATE quick_leads SET status=?, admin_note=? WHERE id=?')->execute([$leadStatus, $note, $leadId]);
    audit_log((int) $admin['id'], null, 'lead_updated', 'Lead ' . $leadId . ': ' . $leadStatus);
    $message = 'Lead updated.';
    }
}

$where = [];
$params = [];
if ($q !== '') {
    $where[] = '(name LIKE ? OR phone LIKE ? OR service LIKE ? OR message LIKE ?)';
    $like = '%' . $q . '%';
    $params = [$like, $like, $like, $like];
}
if ($status !== '') {
    $where[] = 'status = ?';
    $params[] = $status;
}
if ($source !== '') {
    $where[] = 'source_page LIKE ?';
    $params[] = '%' . $source . '%';
}
$sql = 'SELECT * FROM quick_leads';
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY created_at DESC LIMIT 300';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Quick Phone Leads');
if ($message) echo '<div class="notice success">' . e($message) . '</div>';
?>
<form class="toolbar">
  <label class="field"><span>Search</span><input name="q" value="<?= e($q) ?>" placeholder="Phone, name, service"></label>
  <label class="field"><span>Status</span><select name="status"><option value="">All</option><?= admin_select_options(['New','Contacted','Interested','Not reachable','Converted','Closed'], $status) ?></select></label>
  <label class="field"><span>Source</span><input name="source" value="<?= e($source) ?>" placeholder="home, contact, ad"></label>
  <button class="btn">Filter</button>
  <?php if (can('export_data')): ?><a class="btn light" href="export_leads.php">Export CSV</a><?php endif; ?>
</form>
<div class="table-wrap">
<table><tr><th>ID</th><th>Name</th><th>Phone</th><th>Service</th><th>Status</th><th>Source</th><th>Action</th><th>Date</th></tr>
<?php
foreach ($rows as $row) {
    $wa = admin_whatsapp_url($row['phone'], 'Hello, you requested help from VB Consultants for ' . $row['service'] . '.');
    echo '<tr><td>' . e($row['id']) . '</td><td>' . e($row['name']) . '<br><span class="muted">' . e($row['message']) . '</span></td><td>' . e($row['phone']) . '</td><td>' . e($row['service']) . '</td><td>' . status_badge(ucfirst((string) $row['status'])) . '<br><span class="muted">' . e($row['admin_note'] ?? '') . '</span></td><td>' . e($row['source_page']) . '</td><td><div class="actions"><a class="btn small" href="' . e($wa) . '" target="_blank" rel="noopener noreferrer">WhatsApp</a>';
    if (can('manage_leads')) {
        echo '<form method="post">' . csrf_field() . '<input type="hidden" name="lead_id" value="' . e($row['id']) . '"><select name="status">' . admin_select_options(['New','Contacted','Interested','Not reachable','Converted','Closed'], ucfirst((string) $row['status'])) . '</select><input name="admin_note" placeholder="Note" value="' . e($row['admin_note'] ?? '') . '"><button class="btn small light">Save</button></form>';
        echo '<form method="post" onsubmit="return confirm(\'Convert this lead to a request for an existing user with the same phone?\')">' . csrf_field() . '<input type="hidden" name="lead_id" value="' . e($row['id']) . '"><button class="btn small secondary" name="convert_lead" value="1">Convert</button></form>';
    }
    echo '</div></td><td>' . e($row['created_at']) . '</td></tr>';
}
?>
</table></div>
<?php
admin_footer();
