async function test() {
  const url = "http://localhost:3000/api/events";
  try {
    const response = await fetch(url);
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Returned data type/structure:", typeof data);
    console.log("Success:", data.success);
    console.log("Events count:", data.data?.data?.length);
    if (data.data?.data?.length > 0) {
      console.log("First event title:", data.data.data[0].title);
    }
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
