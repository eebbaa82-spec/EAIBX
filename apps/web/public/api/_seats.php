<?php
// Institutional Academy subscriptions: shared by academy.php and certificate.php.
// A bank or MFI subscribes for its staff. Erudite lists the institution in
// _institutions.php (name, seats, expiry, the hash of the training department's
// admin key). The training department adds staff on /academy/institution/,
// which gives each one a personal seat code; staff unlock the Academy with it
// and their browser reports progress, which the department sees on its
// dashboard. Seats and progress are kept in the Academy database (_db.php).
// Defines functions only, so opening it in a browser does nothing.

require_once __DIR__ . '/_db.php';

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
    $row = seat_get($code);
    $inst = $row ? (institutions()[$row['institution']] ?? null) : null;
    if (!$row || $row['status'] !== 'active' || !$inst || !institution_active($inst)) {
        return null;
    }
    return [$row['institution'], $inst, seat_row($row)];
}
