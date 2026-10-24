<?php
// Institutional Academy subscriptions on the course site's cPanel host (eruditeafrica.et); see
// _seats.php for how it fits together. POST only, with an "action":
//   login    institution + admin key -> a signed session for the dashboard
//   overview session -> the institution, its staff seats and their progress
//   add      session + staff (JSON list) -> new seats with their codes
//   update   session + code + changes (status, courses, due date, details)
//   seat     code -> unlocks the Academy for a member of staff
//   report   code + course progress -> recorded for the dashboard (certificates
//            are recorded by certificate.php itself, so they cannot be faked here)

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

require __DIR__ . '/_common.php';
require __DIR__ . '/_seats.php';
$dir = data_dir();

const SESSION_HOURS = 12;
const MAX_STAFF_PER_ADD = 500;

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'POST only']);
}

function text(string $key, int $max): string
{
    $value = trim(preg_replace('/\s+/u', ' ', str_replace("\0", '', (string) ($_POST[$key] ?? ''))) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function clip($value, int $max): string
{
    $value = trim(preg_replace('/\s+/u', ' ', str_replace("\0", '', (string) $value)) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function courses_list($value): array
{
    $list = is_array($value) ? $value : explode(',', (string) $value);
    $out = [];
    foreach ($list as $slug) {
        $slug = trim((string) $slug);
        if (preg_match('/^[a-z0-9-]{1,80}$/', $slug) && !in_array($slug, $out, true)) {
            $out[] = $slug;
        }
    }
    return array_slice($out, 0, 60);
}

function due_date($value): string
{
    $value = trim((string) $value);
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) ? $value : '';
}

/** The institution a dashboard session belongs to; stops with 401 if the session is not valid. */
function session_institution(string $dir): array
{
    $parts = explode('.', (string) ($_POST['session'] ?? ''));
    $list = institutions();
    if (
        count($parts) !== 3
        || !hash_equals(sign('inst.' . $parts[0] . '.' . $parts[1], $dir), $parts[2])
        || (int) $parts[1] < time()
        || !isset($list[$parts[0]])
    ) {
        reply(401, ['ok' => false, 'error' => 'Your session has ended. Please sign in again']);
    }
    return [$parts[0], $list[$parts[0]]];
}

function new_code(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = 'INS-';
    for ($i = 0; $i < 10; $i++) {
        $code .= ($i === 5 ? '-' : '') . $alphabet[random_int(0, 31)];
    }
    return $code;
}

$action = (string) ($_POST['action'] ?? '');

if ($action === 'login') {
    $id = strtoupper(text('institution', 40));
    $key = (string) ($_POST['key'] ?? '');
    $inst = institutions()[$id] ?? null;
    if (!$inst || !hash_equals((string) $inst['key_hash'], hash('sha256', trim($key)))) {
        usleep(800000);
        reply(403, ['ok' => false, 'error' => 'That institution ID and admin key do not match']);
    }
    if (!institution_active($inst)) {
        reply(403, ['ok' => false, 'error' => 'This subscription has expired. Please contact investopia@eruditeafrica.com']);
    }
    $expires = time() + SESSION_HOURS * 3600;
    reply(200, ['ok' => true, 'session' => $id . '.' . $expires . '.' . sign('inst.' . $id . '.' . $expires, $dir), 'name' => $inst['name']]);
}

if ($action === 'overview') {
    [$id, $inst] = session_institution($dir);
    reply(200, [
        'ok' => true,
        'institution' => ['id' => $id, 'name' => $inst['name'], 'seats' => (int) $inst['seats'], 'expires' => $inst['expires'] ?? ''],
        'staff' => seats_of($id),
        'progress' => (object) progress_of($id),
    ]);
}

if ($action === 'add') {
    [$id, $inst] = session_institution($dir);
    $rows = json_decode((string) ($_POST['staff'] ?? '[]'), true);
    if (!is_array($rows) || !$rows || count($rows) > MAX_STAFF_PER_ADD) {
        reply(400, ['ok' => false, 'error' => 'Add between 1 and ' . MAX_STAFF_PER_ADD . ' staff at a time']);
    }
    $pdo = db();
    $pdo->beginTransaction();
    $free = (int) $inst['seats'] - active_seat_count($id);
    if (count($rows) > $free) {
        $pdo->rollBack();
        reply(400, ['ok' => false, 'error' => "Only $free seats are left on your subscription. Revoke unused seats or contact Investopia for more."]);
    }
    $insert = $pdo->prepare('INSERT INTO academy_seats (code, institution, name, staff_id, email, department, branch, courses, due, status, added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $added = [];
    foreach ($rows as $row) {
        $name = clip($row['name'] ?? '', 120);
        if ($name === '') {
            continue;
        }
        do {
            $code = new_code();
        } while (seat_get($code));
        $seat = [
            'code' => $code,
            'name' => $name,
            'staff_id' => clip($row['staff_id'] ?? '', 40),
            'email' => clip($row['email'] ?? '', 160),
            'department' => clip($row['department'] ?? '', 120),
            'branch' => clip($row['branch'] ?? '', 120),
            'courses' => courses_list($row['courses'] ?? []),
            'due' => due_date($row['due'] ?? ''),
            'status' => 'active',
            'added' => gmdate('Y-m-d'),
        ];
        $insert->execute([$code, $id, $seat['name'], $seat['staff_id'], $seat['email'], $seat['department'], $seat['branch'], json_encode($seat['courses']), $seat['due'], 'active', $seat['added']]);
        $added[] = $seat;
    }
    $pdo->commit();
    reply(200, ['ok' => true, 'added' => $added]);
}

if ($action === 'update') {
    [$id, $inst] = session_institution($dir);
    $code = seat_code((string) ($_POST['code'] ?? ''));
    $changes = json_decode((string) ($_POST['changes'] ?? '{}'), true);
    $row = seat_get($code);
    if (!is_array($changes) || !$row || $row['institution'] !== $id) {
        reply(400, ['ok' => false, 'error' => 'No such seat']);
    }
    $seat = seat_row($row);
    if (isset($changes['status']) && in_array($changes['status'], ['active', 'revoked'], true)) {
        if ($changes['status'] === 'active' && $seat['status'] !== 'active' && active_seat_count($id) >= (int) $inst['seats']) {
            reply(400, ['ok' => false, 'error' => 'All seats are in use. Revoke another seat first']);
        }
        $seat['status'] = $changes['status'];
    }
    foreach (['name' => 120, 'staff_id' => 40, 'email' => 160, 'department' => 120, 'branch' => 120] as $field => $max) {
        if (isset($changes[$field])) {
            $seat[$field] = clip($changes[$field], $max);
        }
    }
    if (isset($changes['courses'])) {
        $seat['courses'] = courses_list($changes['courses']);
    }
    if (isset($changes['due'])) {
        $seat['due'] = due_date($changes['due']);
    }
    db()->prepare('UPDATE academy_seats SET name = ?, staff_id = ?, email = ?, department = ?, branch = ?, courses = ?, due = ?, status = ? WHERE code = ?')
        ->execute([$seat['name'], $seat['staff_id'], $seat['email'], $seat['department'], $seat['branch'], json_encode($seat['courses']), $seat['due'], $seat['status'], $code]);
    reply(200, ['ok' => true, 'seat' => $seat]);
}

if ($action === 'seat' || $action === 'report') {
    $found = find_seat((string) ($_POST['code'] ?? ''));
    if (!$found) {
        usleep(500000);
        reply(403, ['ok' => false, 'error' => 'That access code is not valid']);
    }
    [$id, $inst, $seat] = $found;
    $code = $seat['code'];

    if ($action === 'seat') {
        reply(200, [
            'ok' => true,
            'institution' => $inst['name'],
            'name' => $seat['name'],
            'courses' => $seat['courses'],
            'due' => $seat['due'],
            'progress' => (object) (progress_of('', $code)[$code] ?? []),
        ]);
    }

    $course = text('course', 80);
    if (!preg_match('/^[a-z0-9-]{1,80}$/', $course) || ($seat['courses'] && !in_array($course, $seat['courses'], true))) {
        reply(400, ['ok' => false, 'error' => 'Course not assigned']);
    }
    $done = array_values(array_filter(explode(',', text('done', 200)), fn ($m) => preg_match('/^[a-z0-9-]{1,20}$/', $m)));
    $examScore = (int) ($_POST['exam_score'] ?? -1);
    $examTotal = (int) ($_POST['exam_total'] ?? 0);
    $simScore = (int) ($_POST['sim_score'] ?? -1);
    $simDone = ($_POST['sim_done'] ?? '') === '1';
    $now = gmdate('Y-m-d H:i');
    progress_change($code, $course, function ($c) use ($done, $examScore, $examTotal, $simScore, $simDone, $now) {
        $c['done'] = array_slice(array_values(array_unique(array_merge($c['done'] ?? [], array_slice($done, 0, 20)))), 0, 20);
        if ($examTotal > 0 && $examTotal <= 200 && $examScore >= 0 && $examScore <= $examTotal) {
            $pct = (int) round($examScore * 100 / $examTotal);
            if ($pct >= (int) ($c['exam'] ?? -1)) {
                $c['exam'] = $pct;
            }
            $c['exam_attempts'] = max((int) ($c['exam_attempts'] ?? 0), 1);
        }
        if ($simDone && $simScore >= 0 && $simScore <= 100 && $simScore >= (int) ($c['sim'] ?? -1)) {
            $c['sim'] = $simScore;
        }
        $c['last'] = $now;
        return $c;
    });
    reply(200, ['ok' => true]);
}

reply(400, ['ok' => false, 'error' => 'Unknown action']);
