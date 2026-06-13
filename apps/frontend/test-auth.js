const pg = require('pg');

const DATABASE_URL = "postgresql://postgres:Samdev%402005@localhost:5432/event_management?schema=public";
const BASE_URL = "http://localhost:3000";

async function queryDb(queryText, values = []) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(queryText, values);
    return res.rows;
  } finally {
    await client.end();
  }
}

async function testSuite() {
  console.log("=== STARTING AUTH API INTEGRATION TESTS ===");

  const randomId = Math.floor(Math.random() * 1000000);
  const testEmail = `test.user.${randomId}@rajalakshmi.edu.in`;
  const testPassword = "Password123!";
  const testFullName = "Test Verification User";

  console.log(`Test Email: ${testEmail}`);

  // 1. SIGNUP TEST
  console.log("\n[1/6] Testing Signup API...");
  const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testEmail,
      fullName: testFullName,
      password: testPassword
    })
  });

  const signupResult = await signupResponse.json();
  console.log("Signup API Status:", signupResponse.status);
  console.log("Signup API Result:", signupResult);

  if (signupResponse.status !== 200 || !signupResult.success) {
    throw new Error("Signup API failed!");
  }

  // Verify in DB
  const usersInDb = await queryDb(
    'SELECT * FROM "User" WHERE email = $1',
    [testEmail]
  );
  if (usersInDb.length === 0) {
    throw new Error("User was not found in database after successful signup!");
  }
  const user = usersInDb[0];
  console.log("Database Verify - User Record found:");
  console.log(`  ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  First Name: ${user.firstName}`);
  console.log(`  Last Name: ${user.lastName}`);
  console.log(`  Active: ${user.isActive}`);
  
  if (user.firstName !== "Test" || user.lastName !== "Verification User") {
    throw new Error(`Name splitting failed! Expected 'Test' and 'Verification User', got '${user.firstName}' and '${user.lastName}'`);
  }
  console.log("✓ Name splitting verification passed!");

  // 2. DUPLICATE SIGNUP CHECK
  console.log("\n[2/6] Testing Duplicate Signup...");
  const dupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testEmail,
      fullName: testFullName,
      password: testPassword
    })
  });
  const dupResult = await dupResponse.json();
  console.log("Duplicate Signup API Status:", dupResponse.status);
  console.log("Duplicate Signup API Result:", dupResult);
  if (dupResponse.status !== 400 || dupResult.success) {
    throw new Error("Duplicate signup should have failed with status 400!");
  }
  console.log("✓ Duplicate signup restriction works!");

  // 3. LOGIN TEST
  console.log("\n[3/6] Testing Login API with correct password...");
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  const loginResult = await loginResponse.json();
  console.log("Login API Status:", loginResponse.status);
  console.log("Login API Result:", loginResult);

  if (loginResponse.status !== 200 || !loginResult.success) {
    throw new Error("Login failed with correct credentials!");
  }
  if (loginResult.user.fullName !== "Test Verification User") {
    throw new Error(`Returned user fullName incorrect: ${loginResult.user.fullName}`);
  }
  console.log("✓ Login verification passed!");

  // 4. FORGOT PASSWORD TEST
  console.log("\n[4/6] Testing Forgot Password API...");
  const forgotResponse = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotResult = await forgotResponse.json();
  console.log("Forgot Password API Status:", forgotResponse.status);
  console.log("Forgot Password API Result:", forgotResult);

  if (forgotResponse.status !== 200 || !forgotResult.success) {
    throw new Error("Forgot Password API failed!");
  }

  // Retrieve token from DB
  const updatedUsers = await queryDb(
    'SELECT "resetToken", "resetTokenExp" FROM "User" WHERE email = $1',
    [testEmail]
  );
  const resetToken = updatedUsers[0].resetToken;
  const resetTokenExp = updatedUsers[0].resetTokenExp;
  console.log("Database Verify - Reset Token in DB:", resetToken);
  console.log("Database Verify - Reset Token Expiration in DB:", resetTokenExp);
  if (!resetToken || !resetTokenExp) {
    throw new Error("Forgot password did not store resetToken or resetTokenExp!");
  }
  console.log("✓ Forgot password token generated and stored successfully!");

  // 5. RESET PASSWORD TEST
  console.log("\n[5/6] Testing Reset Password API...");
  const newPassword = "NewPassword123!";
  const resetResponse = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      token: resetToken,
      password: newPassword
    })
  });
  const resetResult = await resetResponse.json();
  console.log("Reset Password API Status:", resetResponse.status);
  console.log("Reset Password API Result:", resetResult);

  if (resetResponse.status !== 200 || !resetResult.success) {
    throw new Error("Reset Password API failed!");
  }

  // Verify token cleared in DB
  const postResetUsers = await queryDb(
    'SELECT "resetToken", "resetTokenExp" FROM "User" WHERE email = $1',
    [testEmail]
  );
  if (postResetUsers[0].resetToken !== null || postResetUsers[0].resetTokenExp !== null) {
    throw new Error("Reset password did not clear resetToken and resetTokenExp in DB!");
  }
  console.log("✓ Reset password cleared token columns correctly!");

  // 6. LOGIN WITH NEW PASSWORD TEST
  console.log("\n[6/6] Testing Login with old and new password...");
  // Test Old Password (should fail)
  const oldLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  const oldLoginResult = await oldLoginResponse.json();
  console.log("Login with OLD password status (should be 401):", oldLoginResponse.status);
  if (oldLoginResponse.status !== 401 || oldLoginResult.success) {
    throw new Error("Login with old password should have been unauthorized!");
  }

  // Test New Password (should succeed)
  const newLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE_URL },
    body: JSON.stringify({
      email: testEmail,
      password: newPassword
    })
  });
  const newLoginResult = await newLoginResponse.json();
  console.log("Login with NEW password status (should be 200):", newLoginResponse.status);
  if (newLoginResponse.status !== 200 || !newLoginResult.success) {
    throw new Error("Login with new password failed!");
  }
  console.log("✓ Login with new password succeeded!");

  // Clean up
  console.log("\nCleaning up test user from DB...");
  await queryDb('DELETE FROM "User" WHERE email = $1', [testEmail]);
  console.log("Clean up finished!");

  console.log("\n=== ALL AUTH FLOW TESTS COMPLETED SUCCESSFULLY! ===");
}

testSuite().catch(err => {
  console.error("Test Suite Failed:", err);
  // Clean up test user in case of failure
  queryDb('DELETE FROM "User" WHERE email LIKE \'%rajalakshmi.edu.in\' AND \"firstName\" = \'Test\'').then(() => {
    process.exit(1);
  });
});
