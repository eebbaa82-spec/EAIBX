<?php
// Shared by submit.php and certificate.php: JSON replies, the private data
// folder outside the web root, and the signed robot check (see submit.php).
// Defines functions only, so opening it in a browser does nothing.

const DIFFICULTY = 16;
const CHALLENGE_MIN_AGE = 2;
const CHALLENGE_MAX_AGE = 7200;

function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function data_dir(): string
{
    $dir = dirname(__DIR__, 2) . '/investopia-submissions';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
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

/** Stops with 403 unless the request carries a valid, fresh, unused challenge with a solved nonce. */
function require_robot_check(string $dir): void
{
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
}
