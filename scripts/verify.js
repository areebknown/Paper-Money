
const BASE_URL = 'http://localhost:3000/api';

async function verify() {
    console.log('Starting Verification...');

    // 1. Signup Alice
    console.log('\n--- 1. Signup Alice ---');
    const aliceRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'alice', password: 'password123' }),
    });
    const text = await aliceRes.text();
    let aliceData;
    try {
        aliceData = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON. Status:', aliceRes.status);
        console.error('Response text:', text);
        throw e;
    }
    const aliceToken = parseCookie(aliceRes.headers.get('set-cookie'));
    console.log('Alice Signup:', aliceRes.status, aliceData);
    if (aliceData.user?.balance !== 100) console.error('FAIL: Alice balance is not 100');
    else console.log('PASS: Alice balance is 100');

    // 2. Signup Bob
    console.log('\n--- 2. Signup Bob ---');
    const bobRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'bob', password: 'password123' }),
    });
    const bobData = await bobRes.json();
    const bobToken = parseCookie(bobRes.headers.get('set-cookie'));
    console.log('Bob Signup:', bobRes.status, bobData);
    if (bobData.user?.balance !== 100) console.error('FAIL: Bob balance is not 100');
    else console.log('PASS: Bob balance is 100');

    // 3. User Data Check (Alice)
    console.log('\n--- 3. Check Alice User Data ---');
    const aliceUserRes = await fetch(`${BASE_URL}/user`, {
        headers: { Cookie: `token=${aliceToken}` }
    });
    const aliceUserData = await aliceUserRes.json();
    console.log('Alice Data:', aliceUserData);

    // 4. Transfer Alice -> Bob (50)
    console.log('\n--- 4. Transfer Alice -> Bob (50) ---');
    const transferRes = await fetch(`${BASE_URL}/transfer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `token=${aliceToken}`
        },
        body: JSON.stringify({ receiverUsername: 'bob', amount: 50 }),
    });
    const transferData = await transferRes.json();
    console.log('Transfer Result:', transferData);

    // 5. Verify Balances
    console.log('\n--- 5. Verify Balances ---');
    // Check Alice (should be 50)
    const aliceCheckRes = await fetch(`${BASE_URL}/user`, {
        headers: { Cookie: `token=${aliceToken}` }
    });
    const aliceCheck = await aliceCheckRes.json();
    console.log('Alice Balance:', aliceCheck.user.balance);
    if (aliceCheck.user.balance !== 50) console.error('FAIL: Alice balance incorrect');
    else console.log('PASS: Alice balance is 50');

    // Check Bob (should be 150)
    const bobCheckRes = await fetch(`${BASE_URL}/user`, {
        headers: { Cookie: `token=${bobToken}` }
    });
    const bobCheck = await bobCheckRes.json();
    console.log('Bob Balance:', bobCheck.user.balance);
    if (bobCheck.user.balance !== 150) console.error('FAIL: Bob balance incorrect');
    else console.log('PASS: Bob balance is 150');

    // 6. Verify Transaction History
    console.log('\n--- 6. Verify History ---');
    if (aliceCheck.history.length > 0) console.log('PASS: Alice has history');
    else console.error('FAIL: Alice has no history');

    if (bobCheck.history.length > 0) console.log('PASS: Bob has history');
    else console.error('FAIL: Bob has no history');
}

function parseCookie(setCookieHeader) {
    if (!setCookieHeader) return null;
    const parts = setCookieHeader.split(';');
    const tokenPart = parts.find(p => p.trim().startsWith('token='));
    if (tokenPart) {
        return tokenPart.split('=')[1];
    }
    return null;
}

// Simple retry logic to wait for server
async function main() {
    let retries = 10;
    while (retries > 0) {
        try {
            await fetch(BASE_URL.replace('/api', '')); // Check root
            break;
        } catch (e) {
            console.log('Waiting for server...');
            await new Promise(r => setTimeout(r, 2000));
            retries--;
        }
    }
    await verify();
}

main();
