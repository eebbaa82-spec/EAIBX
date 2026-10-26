<?php
// Banks and MFIs with an institutional Academy subscription (see _seats.php).
// Add one with: node scripts/new-institution.mjs <ID> "<Name>" <seats> <expires>
// key_hash is the SHA-256 of the training department's admin key; the key
// itself is given to the institution privately and is not kept here.
// To renew, change expires; to add seats, change seats.

return [
    'DEMO-BANK' => ['name' => 'Demo Bank (Erudite Africa Connect test)', 'seats' => 25, 'expires' => '2027-12-31', 'key_hash' => 'cc16b8934eb8fbe71c36104e211f54453782bae84e21157fe8613e268a0bdf4a'],
];
