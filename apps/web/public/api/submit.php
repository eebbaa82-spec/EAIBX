<?php
// Receives the public site's forms on the cPanel host (investopia.et), emails
// each submission to the Investopia inbox and appends it to a CSV file kept
// outside the web folder (~/investopia-submissions/<form>.csv).
// The Next.js site is static, so this is the only server-side code it uses.

const INBOX = 'investopia@eruditeafrica.com';
const SENDER = 'no-reply@investopia.et';
const FORMS = [
    'contact' => 'Contact form',
    'partnership' => 'Partnership enquiry',
    'newsletter' => 'Newsletter sign-up',
    'waitlist' => 'Coming-soon waitlist',
];
const MAX_FIELDS = 20;
const MAX_LENGTH = 5000;
const MIN_SECONDS_BETWEEN = 20;

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
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

$fields = [];
foreach ($_POST as $key => $value) {
    if (in_array($key, ['form', 'website'], true) || is_array($value)) {
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

$home = dirname(__DIR__, 2);
$dir = $home . '/investopia-submissions';
if (!is_dir($dir)) {
    @mkdir($dir, 0700, true);
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
        if ($isNew) {
            fputcsv($handle, ['received', 'fields']);
        }
        fputcsv($handle, [$when, json_encode($fields, JSON_UNESCAPED_UNICODE)]);
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
