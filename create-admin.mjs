/**
 * Create a new Firebase user and output their UID for admin setup.
 * Run: node create-admin.mjs
 */

const API_KEY    = "AIzaSyDeHcdQ7Wxq-D6aPzQHlVMYFAyFGHA_goA";
const PROJECT_ID = "golden-waka";

const NEW_USER = {
    displayName: "GW Admin",
    email:       "admin@goldenwaka.com",
    password:    "GoldenWaka@2026!",
};

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';

console.log(`\n${BOLD}Creating Firebase user…${RESET}\n`);

// 1. Create user via Firebase Auth REST API
const signUpRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email:             NEW_USER.email,
            password:          NEW_USER.password,
            displayName:       NEW_USER.displayName,
            returnSecureToken: true,
        }),
    }
);

const signUpData = await signUpRes.json();

if (signUpData.error) {
    const code = signUpData.error.message;
    if (code === 'EMAIL_EXISTS') {
        console.log(`${YELLOW}⚠  User already exists with that email.${RESET}`);
        // Sign in to get UID
        const signInRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email:             NEW_USER.email,
                    password:          NEW_USER.password,
                    returnSecureToken: true,
                }),
            }
        );
        const signInData = await signInRes.json();
        if (signInData.error) {
            console.error(`${RED}Sign-in failed: ${signInData.error.message}${RESET}`);
            process.exit(1);
        }
        printResult(signInData.localId, true);
    } else {
        console.error(`${RED}Error: ${code}${RESET}`);
        process.exit(1);
    }
} else {
    printResult(signUpData.localId, false);
}

function printResult(uid, existed) {
    console.log(`${GREEN}${BOLD}${existed ? '✓ User already existed' : '✓ User created successfully'}${RESET}\n`);

    console.log(`${BOLD}━━━ Admin Credentials ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`  Display Name : ${NEW_USER.displayName}`);
    console.log(`  Email        : ${NEW_USER.email}`);
    console.log(`  Password     : ${NEW_USER.password}`);
    console.log(`  UID          : ${BOLD}${uid}${RESET}`);
    console.log(`${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

    console.log(`${YELLOW}${BOLD}Next step — grant admin access in Firebase Console:${RESET}`);
    console.log(`\n  1. Open this URL:`);
    console.log(`     ${BOLD}https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/-default-/data/~2Fadmins${RESET}`);
    console.log(`\n  2. Click ${BOLD}+ Add document${RESET}`);
    console.log(`     Document ID : ${BOLD}${uid}${RESET}`);
    console.log(`     Field name  : role`);
    console.log(`     Type        : string`);
    console.log(`     Value       : admin`);
    console.log(`\n  3. Click ${BOLD}Save${RESET}\n`);
    console.log(`  Done — sign in with the credentials above and go to /admin\n`);
}
