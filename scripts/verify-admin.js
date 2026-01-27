
const BASE_URL = 'http://localhost:3000/api';

async function verifyAdmin() {
    console.log('Starting Admin Verification...');

    // 1. Signup Admin
    console.log('\n--- 1. Signup Admin ---');
    const adminRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'adminpassword' }),
    });
    const adminData = await adminRes.json();
    const adminToken = parseCookie(adminRes.headers.get('set-cookie'));
    console.log('Admin Signup:', adminRes.status, adminData);
    if (!adminData.user?.isAdmin) console.error('FAIL: User is not admin');

    // 2. Signup Common User (Charlie)
    console.log('\n--- 2. Signup Charlie ---');
    const charlieRes = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'charlie', password: 'password123' }),
    });
    await charlieRes.json();

    // 3. List Users (As Admin)
    console.log('\n--- 3. List Users ---');
    const listRes = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Cookie: `token=${adminToken}` }
    });
    const listData = await listRes.json();
    console.log('Users found:', listData.users?.length);
    if (!listData.users || listData.users.length < 2) console.error("FAIL: Should have at least admin and charlie");

    // 4. Update Charlie Balance
    console.log('\n--- 4. Update Charlie Balance to 500 ---');
    const charlie = listData.users.find(u => u.username === 'charlie');
    if (!charlie) { console.error("FAIL: Charlie not found"); return; }

    const updateRes = await fetch(`${BASE_URL}/admin/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `token=${adminToken}`
        },
        body: JSON.stringify({ id: charlie.id, balance: 500 })
    });
    const updateData = await updateRes.json();
    console.log('Update Result:', updateData);
    if (updateData.user.balance !== 500) console.error("FAIL: Balance not updated");

    // 5. Bulk Allocate (Airdrop)
    console.log('\n--- 5. Airdrop 1000 to all ---');
    const airdropRes = await fetch(`${BASE_URL}/admin/users`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `token=${adminToken}`
        },
        body: JSON.stringify({ broadcast: true, amountToAdd: 1000 })
    });
    console.log('Airdrop Result:', await airdropRes.json());

    // Verify Charlie Balance (500 + 1000 = 1500)
    const listRes2 = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Cookie: `token=${adminToken}` }
    });
    const listData2 = await listRes2.json();
    const charlie2 = listData2.users.find(u => u.username === 'charlie');
    console.log('Charlie Final Balance:', charlie2.balance);
    if (charlie2.balance !== 1500) console.error("FAIL: Airdrop failed");
    else console.log("PASS: Airdrop success");

    // 6. Delete Charlie
    console.log('\n--- 6. Delete Charlie ---');
    const deleteRes = await fetch(`${BASE_URL}/admin/users?id=${charlie.id}`, {
        method: 'DELETE',
        headers: { Cookie: `token=${adminToken}` }
    });
    console.log('Delete status:', deleteRes.status);

    // Verify deletion
    const listRes3 = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Cookie: `token=${adminToken}` }
    });
    const listData3 = await listRes3.json();
    if (listData3.users.find(u => u.username === 'charlie')) console.error("FAIL: Charlie still exists");
    else console.log("PASS: Charlie deleted");
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

verifyAdmin().catch(console.error);
