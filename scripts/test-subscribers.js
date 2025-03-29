// scripts/test-subscribers.js
(async () => {
  try {
    console.log("Testing subscriber system...");

    // 1. First seed a test subscriber
    console.log("\n1. Seeding test subscriber...");
    const seedResponse = await fetch(
      "http://localhost:3000/api/seed-subscriber"
    );
    const seedData = await seedResponse.json();

    if (!seedData.success) {
      throw new Error("Failed to seed: " + seedData.error);
    }
    console.log("✓ Test subscriber created:", seedData.subscriber.email);

    // 2. Verify retrieval
    console.log("\n2. Retrieving subscribers...");
    const getResponse = await fetch("http://localhost:3000/api/cli-test");
    const getData = await getResponse.json();

    if (!getData.success) {
      throw new Error("Failed to retrieve: " + getData.error);
    }

    console.log("✓ Subscribers retrieved:", getData.subscribers.length);
    console.table(getData.subscribers);

    // 3. Cleanup
    console.log("\n3. Cleaning up...");
    const deleteResponse = await fetch(
      "http://localhost:3000/api/seed-subscriber"
    ); // Same endpoint clears data
    const deleteData = await deleteResponse.json();

    console.log("✓ Test data cleaned up");
  } catch (error) {
    console.error("\n! Test failed:", error.message);
  }
})();
