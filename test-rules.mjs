/**
 * Firebase Security Rules Test
 * Run: node test-rules.mjs <email> <password>
 *
 * Tests:
 *  ✓ Unauthenticated write to /reservations → DENIED
 *  ✓ Unauthenticated read  from /reservations → DENIED
 *  ✓ Authenticated create reservation (own userId) → ALLOWED
 *  ✓ Authenticated read own reservation → ALLOWED
 *  ✓ Authenticated create reservation with wrong userId → DENIED
 *  ✓ Authenticated write to another user's subcollection → DENIED
 *  ✓ Authenticated read own user subcollection → ALLOWED
 */

const API_KEY    = "AIzaSyDeHcdQ7Wxq-D6aPzQHlVMYFAyFGHA_goA";
const PROJECT_ID = "golden-waka";
const BASE_FS    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const AUTH_URL   = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

const GREEN  = '\x1b[32m✓\x1b[0m';
const RED    = '\x1b[31m✗\x1b[0m';
const YELLOW = '\x1b[33m⚠\x1b[0m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

let passed = 0, failed = 0;

function result(label, ok, extra = '') {
  if (ok) { console.log(`  ${GREEN} ${label}${extra ? ' — ' + extra : ''}`); passed++; }
  else     { console.log(`  ${RED} ${label}${extra ? ' — ' + extra : ''}`); failed++; }
}

// ── Firestore REST helpers ──────────────────────────────────────────────────

async function fsWrite(path, body, idToken = null) {
  const url = `${BASE_FS}/${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

async function fsRead(path, idToken = null) {
  const url = `${BASE_FS}/${path}`;
  const headers = {};
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  const res = await fetch(url, { headers });
  return { status: res.status, body: await res.json() };
}

// Firestore document field format
function firestoreDoc(fields) {
  const out = { fields: {} };
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string')  out.fields[k] = { stringValue: v };
    if (typeof v === 'number')  out.fields[k] = { integerValue: String(v) };
    if (typeof v === 'boolean') out.fields[k] = { booleanValue: v };
  }
  return out;
}

// ── Auth ────────────────────────────────────────────────────────────────────

async function signIn(email, password) {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!data.idToken) throw new Error(`Sign-in failed: ${JSON.stringify(data.error)}`);
  return { idToken: data.idToken, uid: data.localId };
}

// ── Main ────────────────────────────────────────────────────────────────────

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error('Usage: node test-rules.mjs <email> <password>');
  process.exit(1);
}

console.log(`\n${BOLD}Firebase Security Rules Test — golden-waka${RESET}`);
console.log('─'.repeat(50));

// 1. Sign in
let uid, idToken;
try {
  console.log(`\nSigning in as ${email}…`);
  ({ uid, idToken } = await signIn(email, password));
  console.log(`  ${GREEN} Signed in  (uid: ${uid.slice(0,8)}…)\n`);
} catch (e) {
  console.error(`  ${RED} ${e.message}`);
  process.exit(1);
}

const testDocId = `test-${Date.now()}`;

// ── TEST 1: Unauthenticated write to /reservations → DENIED ────────────────
console.log(`${BOLD}1. Unauthenticated writes${RESET}`);
{
  const r = await fsWrite(
    `reservations`,
    firestoreDoc({ userId: 'hacker', destination: 'test', status: 'Pending' })
  );
  result('Unauth write to /reservations → DENIED', r.status === 403,
         `HTTP ${r.status}`);
}

// ── TEST 2: Unauthenticated read /reservations → DENIED ───────────────────
{
  const r = await fsRead(`reservations`);
  result('Unauth read  /reservations → DENIED', r.status === 403,
         `HTTP ${r.status}`);
}

// ── TEST 3: Authenticated create with correct userId → ALLOWED ─────────────
console.log(`\n${BOLD}2. Authenticated writes (own data)${RESET}`);
let createdDocName = null;
{
  const r = await fsWrite(
    `reservations`,
    firestoreDoc({ userId: uid, destination: 'Paris', status: 'Pending', guests: 2 }),
    idToken
  );
  const ok = r.status === 200;
  result('Auth create reservation (own userId) → ALLOWED', ok, `HTTP ${r.status}`);
  if (ok && r.body.name) createdDocName = r.body.name.split('/').pop();
}

// ── TEST 4: Authenticated create with WRONG userId → DENIED ───────────────
{
  const r = await fsWrite(
    `reservations`,
    firestoreDoc({ userId: 'someone-elses-uid', destination: 'Paris', status: 'Pending' }),
    idToken
  );
  result('Auth create reservation (wrong userId) → DENIED', r.status === 403,
         `HTTP ${r.status}`);
}

// ── TEST 5: Read own reservation → ALLOWED ─────────────────────────────────
console.log(`\n${BOLD}3. Authenticated reads (own data)${RESET}`);
if (createdDocName) {
  const r = await fsRead(`reservations/${createdDocName}`, idToken);
  result('Auth read own reservation → ALLOWED', r.status === 200, `HTTP ${r.status}`);
} else {
  console.log(`  ${YELLOW} Skipped (create failed, nothing to read)`);
}

// ── TEST 6: Write to own user subcollection → ALLOWED ─────────────────────
console.log(`\n${BOLD}4. User subcollection${RESET}`);
let subDocName = null;
{
  const r = await fsWrite(
    `users/${uid}/reservations`,
    firestoreDoc({ userId: uid, destination: 'Tokyo', status: 'Pending' }),
    idToken
  );
  const ok = r.status === 200;
  result('Auth write to own users/{uid}/reservations → ALLOWED', ok, `HTTP ${r.status}`);
  if (ok && r.body.name) subDocName = r.body.name.split('/').pop();
}

// ── TEST 7: Write to ANOTHER user's subcollection → DENIED ────────────────
{
  const fakeUid = 'fake-uid-99999';
  const r = await fsWrite(
    `users/${fakeUid}/reservations`,
    firestoreDoc({ userId: uid, destination: 'Tokyo', status: 'Pending' }),
    idToken
  );
  result('Auth write to other user\'s subcollection → DENIED', r.status === 403,
         `HTTP ${r.status}`);
}

// ── TEST 8: Read own subcollection → ALLOWED ──────────────────────────────
if (subDocName) {
  const r = await fsRead(`users/${uid}/reservations/${subDocName}`, idToken);
  result('Auth read own subcollection doc → ALLOWED', r.status === 200, `HTTP ${r.status}`);
} else {
  console.log(`  ${YELLOW} Skipped (subcollection create failed)`);
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log('\n' + '─'.repeat(50));
console.log(`${BOLD}Results: ${GREEN} ${passed} passed  ${failed > 0 ? RED : ''} ${failed} failed${RESET}`);
if (failed === 0) {
  console.log(`\n${GREEN} All rules are working correctly. Your Firestore is production-ready.\n`);
} else {
  console.log(`\n${RED} Some rules need attention. Check the output above.\n`);
}
