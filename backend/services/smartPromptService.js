const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseTravelPrompt(userPrompt) {
  // Using the exact alias from your listModels results
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
  Extract structured travel details from the below user input.

  Return ONLY JSON in this format:
  {
    "destination": "",
    "days": number,
    "budget": number,
    "interests": []
  }

  User Input:
  "${userPrompt}"
  `;

  console.log("🤖 Sending Prompt to Gemini:", prompt);
  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  console.log("🤖 Raw Gemini Response:", response);

  try {
    // Clean the response if it contains markdown code blocks
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(response);
  } catch (parseError) {
    console.error("❌ Failed to parse JSON from Gemini:", parseError.message);
    throw new Error("AI returned invalid data format");
  }
}

module.exports = { parseTravelPrompt };
