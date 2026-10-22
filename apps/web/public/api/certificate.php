<?php
// Academy certificate register on the cPanel host (investopia.et).
// POST issues a certificate: the learner's browser sends the course, the name,
// the exam score and the subscriber access code; the server checks the code,
// creates a unique certificate number and keeps the record outside the web
// folder (~/investopia-submissions/certificates.csv). The same learner, code
// and course get the same number back.
// Institutional staff use their seat code instead (see _seats.php), and the
// certificate then shows on their training department's dashboard.
// GET ?id=<number> looks the number up, so anyone holding a certificate can
// check it is genuine on /academy/verify/ (the QR code on the certificate).

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

require __DIR__ . '/_common.php';
require __DIR__ . '/_seats.php';
$dir = data_dir();
$csv = $dir . '/certificates.csv';
const COLUMNS = ['id', 'issued', 'name', 'course', 'course_title', 'score', 'code_hash', 'email'];

function clean(string $value, int $max): string
{
    $value = trim(preg_replace('/\s+/u', ' ', str_replace("\0", '', $value)) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

/** Every certificate on record, keyed by number. */
function records(string $csv): array
{
    $rows = [];
    if (!is_file($csv) || !($handle = @fopen($csv, 'r'))) {
        return $rows;
    }
    flock($handle, LOCK_SH);
    fgetcsv($handle);
    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) === count(COLUMNS)) {
            $record = array_combine(COLUMNS, $row);
            $rows[$record['id']] = $record;
        }
    }
    flock($handle, LOCK_UN);
    fclose($handle);
    return $rows;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    $id = strtoupper(clean((string) ($_GET['id'] ?? ''), 60));
    if (!preg_match('#^INV/ACAD/[A-Z0-9-]{1,20}/[0-9]{4}/[A-Z0-9]{8}$#', $id)) {
        reply(200, ['ok' => true, 'found' => false]);
    }
    // A short pause per lookup makes guessing numbers slow.
    usleep(300000);
    $record = records($csv)[$id] ?? null;
    if (!$record) {
        reply(200, ['ok' => true, 'found' => false]);
    }
    reply(200, [
        'ok' => true,
        'found' => true,
        'id' => $record['id'],
        'name' => $record['name'],
        'course' => $record['course_title'],
        'score' => (int) $record['score'],
        'issued' => $record['issued'],
    ]);
}

if ($method !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'GET or POST only']);
}

if (trim($_POST['website'] ?? '') !== '') {
    reply(200, ['ok' => false, 'error' => 'Not issued']);
}
require_robot_check($dir);

$name = clean((string) ($_POST['name'] ?? ''), 80);
$course = clean((string) ($_POST['course'] ?? ''), 80);
$courseId = strtoupper(clean((string) ($_POST['course_id'] ?? ''), 20));
$title = clean((string) ($_POST['course_title'] ?? ''), 160);
$score = (int) ($_POST['score'] ?? 0);
$code = strtoupper(preg_replace('/\s+/', '', (string) ($_POST['code'] ?? '')));
$email = clean((string) ($_POST['email'] ?? ''), 160);

if ($name === '' || $title === '' || !preg_match('/^[a-z0-9-]{1,80}$/', $course) || !preg_match('/^[A-Z0-9-]{1,20}$/', $courseId)) {
    reply(400, ['ok' => false, 'error' => 'Missing course or name']);
}
if ($score < 70 || $score > 100) {
    reply(400, ['ok' => false, 'error' => 'A pass in the final exam is required']);
}
$codeHash = hash('sha256', $code);
// Individual subscribers hold an access code; institutional staff a seat code.
$seat = in_array($codeHash, require __DIR__ . '/_academy-codes.php', true) ? null : find_seat($code);
if (!$seat && !in_array($codeHash, require __DIR__ . '/_academy-codes.php', true)) {
    reply(403, ['ok' => false, 'error' => 'That access code is not valid']);
}
if ($seat && $seat[2]['courses'] && !in_array($course, $seat[2]['courses'], true)) {
    reply(403, ['ok' => false, 'error' => 'This course is not assigned to your seat']);
}

/** Puts the certificate on the institution's dashboard when a member of staff earns it. */
function record_on_seat(?array $seat, string $course, string $id, int $score): void
{
    if (!$seat) {
        return;
    }
    $now = gmdate('Y-m-d H:i');
    with_institution($seat[0], function ($staff, $progress) use ($seat, $course, $id, $score, $now) {
        $c = $progress[$seat[2]['code']][$course] ?? ['started' => $now, 'done' => []];
        $c['certificate'] = $id;
        $c['completed'] = $c['completed'] ?? $now;
        $c['exam'] = max((int) ($c['exam'] ?? 0), $score);
        $c['last'] = $now;
        $progress[$seat[2]['code']][$course] = $c;
        return [$staff, $progress, null];
    });
}

$handle = @fopen($csv, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    reply(500, ['ok' => false, 'error' => 'Could not issue the certificate. Please try again']);
}
$existing = [];
$header = fgetcsv($handle);
while (($row = fgetcsv($handle)) !== false) {
    if (count($row) === count(COLUMNS)) {
        $existing[] = array_combine(COLUMNS, $row);
    }
}
// Same learner, code and course: give the number already issued.
foreach ($existing as $record) {
    if ($record['course'] === $course && $record['code_hash'] === $codeHash && strcasecmp($record['name'], $name) === 0) {
        flock($handle, LOCK_UN);
        fclose($handle);
        record_on_seat($seat, $course, $record['id'], $score);
        reply(200, ['ok' => true, 'id' => $record['id'], 'issued' => $record['issued']]);
    }
}
$taken = array_column($existing, 'id');
$alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
do {
    $suffix = '';
    for ($i = 0; $i < 8; $i++) {
        $suffix .= $alphabet[random_int(0, 31)];
    }
    $id = 'INV/ACAD/' . $courseId . '/' . gmdate('Y') . '/' . $suffix;
} while (in_array($id, $taken, true));

$issued = gmdate('Y-m-d');
fseek($handle, 0, SEEK_END);
if ($header === false) {
    fputcsv($handle, COLUMNS);
}
fputcsv($handle, [$id, $issued, $name, $course, $title, (string) $score, $codeHash, $email]);
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);
record_on_seat($seat, $course, $id, $score);

reply(200, ['ok' => true, 'id' => $id, 'issued' => $issued]);
