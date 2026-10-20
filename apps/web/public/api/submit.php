<?php
// Receives the public site's forms on the cPanel host (investopia.et), emails
// each submission to the Investopia inbox and appends it to a CSV file kept
// outside the web folder (~/investopia-submissions/<form>.csv).
// The Next.js site is static, so this is the only server-side code it uses.
//
// Robot check: before sending, the page asks for a challenge (GET ?challenge)
// and spends a second or two of browser work finding a nonce whose SHA-256
// starts with DIFFICULTY zero bits. People never see it; scripted spam has to
// pay that cost per message, and each challenge is signed, expires and works
// once.

const INBOX = 'investopia@eruditeafrica.com';
const SENDER = 'no-reply@investopia.et';
const FORMS = [
    'contact' => 'Contact form',
    'partnership' => 'Partnership enquiry',
    'newsletter' => 'Newsletter sign-up',
    'waitlist' => 'Coming-soon waitlist',
    'course' => 'Financial literacy course registration',
];
// Forms kept as a mailing list get one spreadsheet column per field.
const CSV_COLUMNS = [
    'course' => ['name', 'occupation', 'education', 'email', 'mobile', 'consent', 'language', 'page'],
];
const MAX_FIELDS = 20;
const MAX_LENGTH = 5000;
const MIN_SECONDS_BETWEEN = 20;
const DIFFICULTY = 16;
const CHALLENGE_MIN_AGE = 2;
const CHALLENGE_MAX_AGE = 7200;

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

$dir = dirname(__DIR__, 2) . '/investopia-submissions';
if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
}

// Signing key for challenges, created on first use and kept outside the web folder.
function secret(string $dir): string
{
    $file = $dir . '/.challenge-key';
    $key = is_file($file) ? (string) @file_get_contents($file) : '';
    if (strlen($key) < 32) {
        $key = bin2hex(random_bytes(32));
        @file_put_contents($file, $key, LOCK_EX);
        @chmod($file, 0600);
    }
    return $key;
}

function sign(string $payload, string $dir): string
{
    return hash_hmac('sha256', $payload, secret($dir));
}

function leading_zero_bits(string $raw): int
{
    $bits = 0;
    foreach (str_split($raw) as $byte) {
        $b = ord($byte);
        if ($b === 0) {
            $bits += 8;
            continue;
        }
        while (($b & 0x80) === 0) {
            $bits++;
            $b <<= 1;
        }
        break;
    }
    return $bits;
}

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

// The robot check: a valid, fresh, unused challenge with a solved nonce.
$challenge = (string) ($_POST['pow_challenge'] ?? '');
$nonce = (string) ($_POST['pow_nonce'] ?? '');
$parts = explode('.', $challenge);
$age = count($parts) === 3 ? time() - (int) $parts[0] : -1;
if (
    count($parts) !== 3
    || !hash_equals(sign($parts[0] . '.' . $parts[1], $dir), $parts[2])
    || $age < CHALLENGE_MIN_AGE
    || $age > CHALLENGE_MAX_AGE
    || !preg_match('/^[0-9]{1,12}$/', $nonce)
    || leading_zero_bits(hash('sha256', $challenge . ':' . $nonce, true)) < DIFFICULTY
) {
    reply(403, ['ok' => false, 'error' => 'Robot check failed. Please reload the page and try again']);
}
$used = $dir . '/.used-' . md5($challenge);
if (is_file($used)) {
    reply(403, ['ok' => false, 'error' => 'Robot check failed. Please reload the page and try again']);
}
@touch($used);
// Forget used challenges once they have expired anyway.
if (mt_rand(1, 50) === 1) {
    foreach (glob($dir . '/.used-*') ?: [] as $old) {
        if (time() - (int) @filemtime($old) > CHALLENGE_MAX_AGE) {
            @unlink($old);
        }
    }
}

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
$lines[] = 'Sent from ' . ($_SERVER['HTTP_REFERER'] ?? 'investopia.et');

$subject = '=?UTF-8?B?' . base64_encode('Investopia: ' . FORMS[$form]) . '?=';
$headers = implode("\r\n", [
    'From: Investopia <' . SENDER . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
]);

$sent = @mail(INBOX, $subject, implode("\n", $lines), $headers, '-f' . SENDER);

// The CSV copy is kept even if mail fails, so nothing is lost.
reply($sent || is_file($csv) ? 200 : 500, ['ok' => $sent || is_file($csv)]);
