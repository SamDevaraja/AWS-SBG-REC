const axios = require('axios');

async function testLogs() {
  try {
    const res = await axios.get('http://localhost:3000/api/workspace/dashboard/security-logs');
    console.log("Status:", res.status);
    console.log("Logs:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Failed to load security logs:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
  }
}

testLogs();
