async function test() {
  const url = "http://localhost:3000/api/auth/login";
  
  const payload = {
    email: "samdevaraja.j.2024.cse@rajalakshmi.edu.in",
    password: "sam123"
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", data);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
