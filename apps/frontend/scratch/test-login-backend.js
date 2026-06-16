const axios = require('axios');

async function testAuthAndTopics() {
  console.log("Attempting backend login...");
  try {
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'samdevaraja.j.2024.cse@rajalakshmi.edu.in',
      password: 'sam123'
    });
    console.log("Login Success! User:", loginRes.data.user);
    const token = loginRes.data.accessToken || loginRes.data.data?.accessToken;
    console.log("Token retrieved:", token);

    if (!token) {
      console.log("No token in response. Full data:", JSON.stringify(loginRes.data, null, 2));
      return;
    }

    console.log("\nTesting learning topics fetch with token...");
    const topicsRes = await axios.get('http://localhost:4000/api/roadmap/learning/topics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Full topics response data:", JSON.stringify(topicsRes.data, null, 2));

    console.log("\nTesting learning topic details fetch with token...");
    const detailRes = await axios.get('http://localhost:4000/api/roadmap/learning/topics/aws-core', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Full topic details response data:", JSON.stringify(detailRes.data, null, 2));

    console.log("\nTesting continue module fetch with token...");
    const continueRes = await axios.get('http://localhost:4000/api/roadmap/learning/continue', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Full continue response data:", JSON.stringify(continueRes.data, null, 2));
  } catch (err) {
    console.error("Error occurred:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
  }
}

testAuthAndTopics();
