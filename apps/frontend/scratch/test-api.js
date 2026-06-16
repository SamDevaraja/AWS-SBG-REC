const axios = require('axios');

async function testApi() {
  console.log("Testing learning topics fetch...");
  try {
    const res = await axios.get('http://localhost:4000/api/roadmap/learning/topics');
    console.log("Success! Topics count:", res.data.topics?.length);
    console.log("Data sample:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Failed to load topics:", {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
  }
}

testApi();
