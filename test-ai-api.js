// Test script for AI API endpoint
// Run with: node test-ai-api.js (while dev server is running)

const testPayload = {
  mode: "critique",
  userPrompt: "Is this sentence clear and concise?",
  context: {
    selectedText: "The quick brown fox jumps over the lazy dog.",
    localContext: "This is a sample paragraph about animals. The quick brown fox jumps over the lazy dog. Animals are interesting creatures.",
    outline: "# Introduction\n## Animals"
  },
  brain: {
    goal: "Write a clear essay about animals",
    constraints: ["Keep it simple", "Use active voice"],
    glossary: [],
    decisions: []
  },
  meta: {
    documentId: "test-doc",
    anchorId: "test-anchor"
  }
};

async function testAIEndpoint() {
  console.log("Testing AI API endpoint...\n");
  console.log("Payload:", JSON.stringify(testPayload, null, 2), "\n");

  try {
    const response = await fetch("http://localhost:3002/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText, "\n");

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.message) {
      console.log("\n✅ AI Response:");
      console.log(data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAIEndpoint();
