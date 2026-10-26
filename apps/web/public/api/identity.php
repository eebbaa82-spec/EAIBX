<?php
// Verification codes for the borrower profile builder's identity check, on the
// cPanel host (connect.eruditeafrica.et). After checking a business on the Ministry of
// Trade register (etrade.et) and the requester's documents, the Erudite Africa Connect team
// emails the requester one unused code from the list Erudite keeps (the
// hashes are in _identity-codes.php). The first time a code is entered it is
// tied to that TIN for good (~/investopia-submissions/identity-codes.csv), so
// it cannot unlock the pack for any other business.

header_remove('X-Powered-By');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
header('Cache-Control: no-store');

require __DIR__ . '/_common.php';
$dir = data_dir();
$csv = $dir . '/identity-codes.csv';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'POST only']);
}
if (trim($_POST['website'] ?? '') !== '') {
    reply(200, ['ok' => false, 'error' => 'Not verified']);
}
require_robot_check($dir);

$tin = preg_replace('/\D/', '', (string) ($_POST['tin'] ?? ''));
$code = strtoupper(preg_replace('/\s+/', '', (string) ($_POST['code'] ?? '')));
if (!preg_match('/^\d{10}$/', $tin)) {
    reply(400, ['ok' => false, 'error' => 'Enter the 10-digit TIN']);
}
$hash = hash('sha256', $code);
if (!in_array($hash, require __DIR__ . '/_identity-codes.php', true)) {
    usleep(500000);
    reply(403, ['ok' => false, 'error' => 'That verification code is not valid']);
}

$handle = @fopen($csv, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) {
    reply(500, ['ok' => false, 'error' => 'Could not check the code. Please try again']);
}
$header = fgetcsv($handle);
while (($row = fgetcsv($handle)) !== false) {
    if (count($row) === 3 && $row[0] === $hash) {
        flock($handle, LOCK_UN);
        fclose($handle);
        if ($row[1] !== $tin) {
            reply(403, ['ok' => false, 'error' => 'This code was issued for a different business']);
        }
        reply(200, ['ok' => true, 'verified' => $row[2]]);
    }
}
$today = gmdate('Y-m-d');
fseek($handle, 0, SEEK_END);
if ($header === false) {
    fputcsv($handle, ['code_hash', 'tin', 'verified']);
}
fputcsv($handle, [$hash, $tin, $today]);
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);

reply(200, ['ok' => true, 'verified' => $today]);
