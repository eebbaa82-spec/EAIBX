<?php
// Institutional Academy subscriptions: shared by academy.php and certificate.php.
// A bank or MFI subscribes for its staff. Erudite lists the institution in
// _institutions.php (name, seats, expiry, the hash of the training department's
// admin key). The training department adds staff on /academy/institution/,
// which gives each one a personal seat code; staff unlock the Academy with it
// and their browser reports progress, which the department sees on its
// dashboard. Everything is kept outside the web folder, one folder per
// institution: ~/investopia-submissions/institutions/<ID>/{staff,progress}.json.
// Defines functions only, so opening it in a browser does nothing.

/** The institutions Erudite has signed up, keyed by ID. */
function institutions(): array
{
    $list = require __DIR__ . '/_institutions.php';
    return is_array($list) ? $list : [];
}

function institution_active(array $inst): bool
{
    return ($inst['expires'] ?? '') === '' || gmdate('Y-m-d') <= $inst['expires'];
}

function institution_dir(string $id): string
{
    $dir = data_dir() . '/institutions/' . $id;
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

/**
 * Runs $change on the institution's staff and progress under one lock and saves
 * what it returns; $change gets [staff, progress] and returns [staff, progress, result].
 */
function with_institution(string $id, callable $change)
{
    $dir = institution_dir($id);
    $lock = @fopen($dir . '/.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        reply(500, ['ok' => false, 'error' => 'Please try again']);
    }
    $load = function (string $file) use ($dir): array {
        $data = is_file("$dir/$file") ? json_decode((string) @file_get_contents("$dir/$file"), true) : [];
        return is_array($data) ? $data : [];
    };
    $staff = $load('staff.json');
    $progress = $load('progress.json');
    [$newStaff, $newProgress, $result] = $change($staff, $progress);
    if ($newStaff !== $staff) {
        @file_put_contents("$dir/staff.json", json_encode($newStaff, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    if ($newProgress !== $progress) {
        @file_put_contents("$dir/progress.json", json_encode($newProgress, JSON_UNESCAPED_UNICODE));
    }
    flock($lock, LOCK_UN);
    fclose($lock);
    return $result;
}

function seat_code(string $code): string
{
    return strtoupper(preg_replace('/\s+/', '', $code));
}

/** The active seat a code belongs to: [institution ID, institution, seat], or null. */
function find_seat(string $code): ?array
{
    $code = seat_code($code);
    if (!preg_match('/^INS-[A-Z0-9]{5}-[A-Z0-9]{5}$/', $code)) {
        return null;
    }
    foreach (institutions() as $id => $inst) {
        if (!institution_active($inst)) {
            continue;
        }
        $file = institution_dir($id) . '/staff.json';
        $staff = is_file($file) ? json_decode((string) @file_get_contents($file), true) : [];
        $seat = is_array($staff) ? ($staff[$code] ?? null) : null;
        if ($seat && ($seat['status'] ?? '') === 'active') {
            return [$id, $inst, $seat];
        }
    }
    return null;
}
