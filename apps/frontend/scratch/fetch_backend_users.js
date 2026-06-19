const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://localhost:4000/api/users');
    const data = await res.json();
    console.log("Response status:", res.status);
    console.log("Returned Users:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching users from NestJS:", err);
  }
}

test();
