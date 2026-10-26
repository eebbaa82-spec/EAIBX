<?php
// Receives the public site's forms on the cPanel hosts (connect.eruditeafrica.et
// and the course site, eruditeafrica.et), emails each submission to the Erudite Africa Connect inbox and appends it to a CSV file kept
// outside the web folder (~/investopia-submissions/<form>.csv).
// The Next.js site is static, so this is the only server-side code it uses.
//
// Robot check: before sending, the page asks for a challenge (GET ?challenge)
// and spends a second or two of browser work finding a nonce whose SHA-256
// starts with DIFFICULTY zero bits. People never see it; scripted spam has to
// pay that cost per message, and each challenge is signed, expires and works
// once.

const INBOX = 'connect@eruditeafrica.com';
// The same script runs on connect.eruditeafrica.et and on the course site, eruditeafrica.et;
// mail goes out from the site that received the form.
const SITES = [
    'connect.eruditeafrica.et' => 'Erudite Africa Connect',
    'eruditeafrica.et' => 'Erudite Africa Center of Excellence',
];
$host = strtolower(preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? ''));
if (!isset(SITES[$host])) {
    $host = 'connect.eruditeafrica.et';
}
define('SENDER', 'no-reply@' . $host);
define('SENDER_NAME', SITES[$host]);
const FORMS = [
    'contact' => 'Contact form',
    'partnership' => 'Partnership enquiry',
    'newsletter' => 'Newsletter sign-up',
    'waitlist' => 'Coming-soon waitlist',
    'course' => 'Financial literacy course registration',
    'member' => 'Member registration',
    'academy' => 'Academy subscription request',
    'identity' => 'Borrower identity check request',
];
// Forms kept as a mailing list get one spreadsheet column per field.
const CSV_COLUMNS = [
    'course' => ['name', 'occupation', 'education', 'email', 'mobile', 'consent', 'language', 'page'],
    'member' => ['name', 'business', 'email', 'mobile', 'consent', 'page'],
    'academy' => ['name', 'business', 'email', 'mobile', 'plan', 'learners', 'course', 'consent', 'page'],
    'identity' => ['requester', 'role', 'id_number', 'business', 'tin', 'licence', 'email', 'mobile', 'etrade_checked', 'consent', 'page'],
];
const MAX_FIELDS = 20;
const MAX_LENGTH = 5000;
const MIN_SECONDS_BETWEEN = 20;

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

require __DIR__ . '/_common.php';
$dir = data_dir();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['challenge'])) {
    header('Cache-Control: no-store');
    $payload = time() . '.' . bin2hex(random_bytes(12));
    reply(200, ['challenge' => $payload . '.' . sign($payload, $dir), 'difficulty' => DIFFICULTY]);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'POST only']);
}

$form = $_POST['form'] ?? '';
if (!isset(FORMS[$form])) {
    reply(400, ['ok' => false, 'error' => 'Unknown form']);
}

// Bots fill in the hidden "website" field; pretend it worked.
if (trim($_POST['website'] ?? '') !== '') {
    reply(200, ['ok' => true]);
}

require_robot_check($dir);

$fields = [];
foreach ($_POST as $key => $value) {
    if (in_array($key, ['form', 'website', 'pow_challenge', 'pow_nonce'], true) || is_array($value)) {
        continue;
    }
    if (count($fields) >= MAX_FIELDS) {
        break;
    }
    $key = substr(preg_replace('/[^A-Za-z0-9_]/', '', (string) $key), 0, 40);
    $value = trim(str_replace("\0", '', (string) $value));
    if ($key === '' || $value === '') {
        continue;
    }
    $fields[$key] = function_exists('mb_substr') ? mb_substr($value, 0, MAX_LENGTH) : substr($value, 0, MAX_LENGTH);
}

$email = $fields['email'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(400, ['ok' => false, 'error' => 'A valid email address is required']);
}

// One submission per address every few seconds keeps casual floods out.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$stamp = $dir . '/.last-' . md5($ip);
if (is_file($stamp) && time() - (int) @filemtime($stamp) < MIN_SECONDS_BETWEEN) {
    reply(429, ['ok' => false, 'error' => 'Please wait a moment and try again']);
}
@touch($stamp);

$when = gmdate('Y-m-d H:i:s') . ' UTC';

$csv = $dir . '/' . $form . '.csv';
$isNew = !is_file($csv);
if ($handle = @fopen($csv, 'a')) {
    if (flock($handle, LOCK_EX)) {
        $columns = CSV_COLUMNS[$form] ?? null;
        if ($isNew) {
            fputcsv($handle, $columns ? array_merge(['received'], $columns) : ['received', 'fields']);
        }
        fputcsv($handle, $columns
            ? array_merge([$when], array_map(function ($c) use ($fields) { return $fields[$c] ?? ''; }, $columns))
            : [$when, json_encode($fields, JSON_UNESCAPED_UNICODE)]);
        flock($handle, LOCK_UN);
    }
    fclose($handle);
}

$lines = [FORMS[$form] . ' received ' . $when, ''];
foreach ($fields as $key => $value) {
    $lines[] = $key . ': ' . $value;
}
$lines[] = '';
$lines[] = 'Sent from ' . ($_SERVER['HTTP_REFERER'] ?? $host);

$subject = '=?UTF-8?B?' . base64_encode('Erudite Africa Connect: ' . FORMS[$form]) . '?=';
$headers = implode("\r\n", [
    'From: ' . SENDER_NAME . ' <' . SENDER . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = @mail(INBOX, $subject, implode("\n", $lines), $headers, '-f' . SENDER);

// The CSV copy is kept even if mail fails, so nothing is lost.
reply($sent || is_file($csv) ? 200 : 500, ['ok' => $sent || is_file($csv)]);
