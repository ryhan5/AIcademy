const term = "React";

async function testSideProject() {
    console.log(`Testing Side Project Generator with input: "${term}"...\n`);

    // Determine the base URL based on environment or default to localhost
    const baseUrl = 'http://localhost:3000';
    const url = `${baseUrl}/api/generate-side-project`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: term })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log("Response Status:", response.status);
        console.log("Data Received:");
        console.log(JSON.stringify(data, null, 2));

        if (data.projects && data.projects.length === 3) {
            console.log("\n✅ SUCCESS: Received 3 project ideas.");
        } else {
            console.error("\n❌ FAILURE: Did not receive 3 project ideas.");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        if (error.cause) console.error("Cause:", error.cause);
        console.log("\nNOTE: Ensure the Next.js server is running on localhost:3000 for this test to work.");
    }
}

testSideProject();
