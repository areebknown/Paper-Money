require('dotenv').config({ path: '.env.local' });
const { Client } = require('@upstash/qstash');

const client = new Client({
    token: process.env.QSTASH_TOKEN || '',
    baseUrl: process.env.QSTASH_URL, // e.g. https://qstash.upstash.io
});

async function test() {
    console.log("QSTASH_TOKEN:", process.env.QSTASH_TOKEN ? 'EXISTS' : 'MISSING');
    console.log("QSTASH_URL:", process.env.QSTASH_URL);

    try {
        const res = await client.publishJSON({
            url: "https://paper-money.vercel.app/api/webhooks/qstash",
            body: { test: true },
            delay: 10,
        });
        console.log("Success:", res);
    } catch (err) {
        console.error("Failed:", err);
    }
}
test();
