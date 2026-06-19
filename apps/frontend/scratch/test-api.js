const axios = require('axios');

async function testApi() {
  console.log("Testing permissions fetch...");
  try {
    const res = await axios.get('http://localhost:3000/api/auth/permissions');
    console.log("Success! Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Failed to load permissions:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
  }
}

testApi();

