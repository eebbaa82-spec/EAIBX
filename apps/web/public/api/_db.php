<?php
// The Academy database: institutional seats, their course progress and the
// certificate register. Shared by academy.php and certificate.php.
//
// MySQL when ~/investopia-db.php exists (outside the web folder), for example:
//   <?php return ['dsn' => 'mysql:host=localhost;dbname=investan_academy;charset=utf8mb4',
//                 'user' => 'investan_academy', 'password' => '...'];
// Otherwise an SQLite file in ~/investopia-submissions/academy.sqlite, which
// needs no setup. The tables are created on first use, and records kept in the
// earlier file format (certificates.csv, institutions/<ID>/*.json) are
// imported once. Defines functions only, so opening it in a browser does nothing.

function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $config = dirname(__DIR__, 2) . '/investopia-db.php';
    try {
        if (is_file($config)) {
            $c = require $config;
            $pdo = new PDO($c['dsn'], $c['user'] ?? null, $c['password'] ?? null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } else {
            $pdo = new PDO('sqlite:' . data_dir() . '/academy.sqlite', null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Readers do not wait for writers, and a busy writer is waited for rather than failing.
            $pdo->exec('PRAGMA journal_mode = WAL');
            $pdo->exec('PRAGMA busy_timeout = 10000');
            $pdo->exec('PRAGMA synchronous = NORMAL');
        }
        db_setup($pdo);
    } catch (Throwable $e) {
        error_log('Investopia academy database: ' . $e->getMessage());
        reply(503, ['ok' => false, 'error' => 'The Academy is busy. Please try again in a minute']);
    }
    return $pdo;
}

function db_mysql(PDO $pdo): bool
{
    return $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
}

function db_setup(PDO $pdo): void
{
    $mysql = db_mysql($pdo);
    $tail = $mysql ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
    $index = fn (string $name, string $cols) => $mysql ? ", KEY $name ($cols)" : '';
    $pdo->exec("CREATE TABLE IF NOT EXISTS academy_meta (k VARCHAR(40) PRIMARY KEY, v TEXT)$tail");
    $done = $pdo->query("SELECT v FROM academy_meta WHERE k = 'schema'")->fetchColumn();
    if ($done === '1') {
        return;
    }
    $pdo->exec('CREATE TABLE IF NOT EXISTS academy_seats (
        code VARCHAR(20) PRIMARY KEY, institution VARCHAR(40) NOT NULL, name VARCHAR(160) NOT NULL,
        staff_id VARCHAR(60) NOT NULL DEFAULT \'\', email VARCHAR(191) NOT NULL DEFAULT \'\',
        department VARCHAR(160) NOT NULL DEFAULT \'\', branch VARCHAR(160) NOT NULL DEFAULT \'\',
        courses TEXT, due VARCHAR(10) NOT NULL DEFAULT \'\', status VARCHAR(10) NOT NULL, added VARCHAR(10) NOT NULL'
        . $index('seats_institution', 'institution, status') . ")$tail");
    $pdo->exec('CREATE TABLE IF NOT EXISTS academy_progress (
        code VARCHAR(20) NOT NULL, course VARCHAR(80) NOT NULL, started VARCHAR(16) NOT NULL,
        done VARCHAR(255) NOT NULL DEFAULT \'\', exam INT NULL, exam_attempts INT NOT NULL DEFAULT 0, sim INT NULL,
        certificate VARCHAR(60) NULL, completed VARCHAR(16) NULL, last VARCHAR(16) NULL,
        PRIMARY KEY (code, course))' . $tail);
    $pdo->exec('CREATE TABLE IF NOT EXISTS academy_certificates (
        id VARCHAR(60) PRIMARY KEY, issued VARCHAR(10) NOT NULL, name VARCHAR(160) NOT NULL, course VARCHAR(80) NOT NULL,
        course_title VARCHAR(200) NOT NULL, score INT NOT NULL, code_hash CHAR(64) NOT NULL, email VARCHAR(191) NOT NULL DEFAULT \'\''
        . $index('certificates_holder', 'code_hash, course') . ")$tail");
    if (!$mysql) {
        $pdo->exec('CREATE INDEX IF NOT EXISTS seats_institution ON academy_seats (institution, status)');
        $pdo->exec('CREATE INDEX IF NOT EXISTS certificates_holder ON academy_certificates (code_hash, course)');
    }
    db_import($pdo);
    $pdo->prepare('INSERT INTO academy_meta (k, v) VALUES (?, ?)')->execute(['schema', '1']);
}

/** Brings in records kept in the earlier file format, once. */
function db_import(PDO $pdo): void
{
    $dir = data_dir();
    $pdo->beginTransaction();
    $csv = $dir . '/certificates.csv';
    if (is_file($csv) && ($h = @fopen($csv, 'r'))) {
        $cols = ['id', 'issued', 'name', 'course', 'course_title', 'score', 'code_hash', 'email'];
        $add = $pdo->prepare('INSERT INTO academy_certificates (id, issued, name, course, course_title, score, code_hash, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        fgetcsv($h);
        while (($row = fgetcsv($h)) !== false) {
            if (count($row) === count($cols)) {
                try {
                    $add->execute($row);
                } catch (PDOException $e) {
                    // Already there.
                }
            }
        }
        fclose($h);
    }
    foreach (glob($dir . '/institutions/*/staff.json') ?: [] as $file) {
        $id = basename(dirname($file));
        $staff = json_decode((string) @file_get_contents($file), true) ?: [];
        $progress = json_decode((string) @file_get_contents(dirname($file) . '/progress.json'), true) ?: [];
        $seat = $pdo->prepare('INSERT INTO academy_seats (code, institution, name, staff_id, email, department, branch, courses, due, status, added) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($staff as $s) {
            try {
                $seat->execute([$s['code'], $id, $s['name'], $s['staff_id'], $s['email'], $s['department'], $s['branch'], json_encode($s['courses']), $s['due'], $s['status'], $s['added']]);
            } catch (PDOException $e) {
                // Already there.
            }
        }
        foreach ($progress as $code => $courses) {
            foreach ($courses as $course => $c) {
                progress_save($pdo, $code, $course, $c);
            }
        }
    }
    $pdo->commit();
}

/* ------------------------------------------------------------------ seats */

function seat_row(array $r): array
{
    $r['courses'] = json_decode((string) $r['courses'], true) ?: [];
    unset($r['institution']);
    return $r;
}

function seats_of(string $institution): array
{
    $q = db()->prepare('SELECT * FROM academy_seats WHERE institution = ? ORDER BY added, name');
    $q->execute([$institution]);
    return array_map('seat_row', $q->fetchAll());
}

function seat_get(string $code): ?array
{
    $q = db()->prepare('SELECT * FROM academy_seats WHERE code = ?');
    $q->execute([$code]);
    $r = $q->fetch();
    return $r ?: null;
}

function active_seat_count(string $institution): int
{
    $q = db()->prepare("SELECT COUNT(*) FROM academy_seats WHERE institution = ? AND status = 'active'");
    $q->execute([$institution]);
    return (int) $q->fetchColumn();
}

/* ------------------------------------------------------------------ progress */

function progress_row(array $r): array
{
    $out = ['started' => $r['started'], 'done' => $r['done'] === '' ? [] : explode(',', $r['done'])];
    foreach (['exam', 'sim'] as $k) {
        if ($r[$k] !== null) {
            $out[$k] = (int) $r[$k];
        }
    }
    foreach (['certificate', 'completed', 'last'] as $k) {
        if ($r[$k] !== null && $r[$k] !== '') {
            $out[$k] = $r[$k];
        }
    }
    return $out;
}

/** Progress keyed by seat code, then course: every seat of an institution, or one seat. */
function progress_of(string $institution = '', string $code = ''): array
{
    if ($code !== '') {
        $q = db()->prepare('SELECT * FROM academy_progress WHERE code = ?');
        $q->execute([$code]);
    } else {
        $q = db()->prepare('SELECT p.* FROM academy_progress p JOIN academy_seats s ON s.code = p.code WHERE s.institution = ?');
        $q->execute([$institution]);
    }
    $out = [];
    foreach ($q->fetchAll() as $r) {
        $out[$r['code']][$r['course']] = progress_row($r);
    }
    return $out;
}

/** Writes one course record for a seat, inserting it the first time. */
function progress_save(PDO $pdo, string $code, string $course, array $c): void
{
    $values = [
        $c['started'] ?? gmdate('Y-m-d H:i'),
        implode(',', $c['done'] ?? []),
        $c['exam'] ?? null,
        (int) ($c['exam_attempts'] ?? 0),
        $c['sim'] ?? null,
        $c['certificate'] ?? null,
        $c['completed'] ?? null,
        $c['last'] ?? null,
    ];
    $update = $pdo->prepare('UPDATE academy_progress SET started = ?, done = ?, exam = ?, exam_attempts = ?, sim = ?, certificate = ?, completed = ?, last = ? WHERE code = ? AND course = ?');
    $update->execute(array_merge($values, [$code, $course]));
    if ($update->rowCount() === 0) {
        try {
            $pdo->prepare('INSERT INTO academy_progress (started, done, exam, exam_attempts, sim, certificate, completed, last, code, course) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                ->execute(array_merge($values, [$code, $course]));
        } catch (PDOException $e) {
            // Inserted by a parallel request in the meantime (MySQL also reports 0 rows when nothing changed).
            $update->execute(array_merge($values, [$code, $course]));
        }
    }
}

/** Reads, changes and saves one course record in a single transaction. */
function progress_change(string $code, string $course, callable $change): void
{
    $pdo = db();
    for ($try = 0; $try < 3; $try++) {
        try {
            // SQLite: take the write lock now, so two reports cannot both read the old record.
            db_mysql($pdo) ? $pdo->beginTransaction() : $pdo->exec('BEGIN IMMEDIATE');
            $q = $pdo->prepare('SELECT * FROM academy_progress WHERE code = ? AND course = ?' . (db_mysql($pdo) ? ' FOR UPDATE' : ''));
            $q->execute([$code, $course]);
            $row = $q->fetch();
            $c = $row ? progress_row($row) + ['exam_attempts' => (int) $row['exam_attempts']] : ['started' => gmdate('Y-m-d H:i'), 'done' => []];
            progress_save($pdo, $code, $course, $change($c));
            db_mysql($pdo) ? $pdo->commit() : $pdo->exec('COMMIT');
            return;
        } catch (PDOException $e) {
            try {
                db_mysql($pdo) ? $pdo->rollBack() : $pdo->exec('ROLLBACK');
            } catch (Throwable $ignored) {
                // Nothing open.
            }
            usleep(100000 * ($try + 1));
        }
    }
    reply(503, ['ok' => false, 'error' => 'The Academy is busy. Please try again in a minute']);
}
