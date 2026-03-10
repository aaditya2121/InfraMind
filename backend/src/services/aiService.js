const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          is_relevant: {
            type: SchemaType.BOOLEAN,
            description: "True ONLY if the image/text is a photorealistic, real-world depiction of campus infrastructure, building maintenance, or facilities damage. Strictly False if it is anime, digital art, a screenshot, a logo, a selfie, an animal, food, or unrelated.",
          },
          category: {
            type: SchemaType.STRING,
            description: "If is_relevant is true, exactly ONE of: Electrical, Plumbing, Furniture, Cleaning, Internet, Hardware, Safety/Security, or Other. If is_relevant is false, MUST return 'Invalid'.",
          },
          priority: {
            type: SchemaType.STRING,
            description: "One of: High, Medium, Low. If is_relevant is false, MUST return 'Low'.",
          },
          department: {
            type: SchemaType.STRING,
            description: "The responsible department (e.g., Facilities Management, IT Support). If is_relevant is false, MUST return 'None'.",
          },
          generated_description: {
            type: SchemaType.STRING,
            description: "If is_relevant is false, briefly explain EXACTLY why it was rejected (e.g., 'Image is an anime landscape'). If true, provide a detailed description of the infrastructure issue.",
          },
          ai_analysis_note: {
            type: SchemaType.STRING,
            description: "Internal note explaining why this was classified this way, or noting relevance issues.",
          },
          is_duplicate: {
            type: SchemaType.BOOLEAN,
            description: "True if this looks like the EXACT same issue/photo already reported in the same location.",
          },
          location_integrity: {
            type: SchemaType.STRING,
            description: "One of: Verified, Suspicious, or Inconsistent. 'Suspicious' if the photo looks like a stock image or if it's identical to another room's photo.",
          }
        },
        required: ["is_relevant", "category", "priority", "department", "generated_description", "ai_analysis_note", "is_duplicate", "location_integrity"],
      }
    }
  });
};

// Helper to convert base64 image from frontend to Gemini's inlineData format
const fileToGenerativePart = (base64String) => {
  if (!base64String) return null;

  // Extract mime type and base64 data from string like: "data:image/jpeg;base64,/9j/4AAQSkZ..."
  const matches = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    console.warn("Invalid Base64 format received for AI Vision.");
    return null;
  }
  return {
    inlineData: {
      data: matches[2],
      mimeType: matches[1]
    }
  };
};

// ── Feature 1: Classify a new issue ──────────────────────────────────────────
const classifyIssue = async (description, location = "", imageUrl = null) => {
  try {
    const model = getModel();
    if (!model) {
      console.warn("⚠️ Gemini API Key is missing. Falling back to default classification.");
      return null;
    }

    const promptText = `
      You are an extremely strict AI Content Moderator for a campus maintenance system.
      Your ONLY goal is to reject invalid, fake, or irrelevant submissions.
      
      CRITICAL REJECTION CRITERIA (Set is_relevant to false if ANY match):
      1. Image is purely digital art, anime, cartoons, or 3D renders.
      2. Image is a screenshot of a computer/phone screen, or contains UI elements.
      3. Image is a logo, meme, text-only, or graphic design.
      4. Image is of people (selfies), pets, food, or natural landscapes without buildings.
      5. The content does NOT clearly show physical infrastructure, hardware, or property damage.

      If the image is rejected (is_relevant: false), you MUST adhere to the schema by setting:
      - category: "Invalid"
      - priority: "Low"
      - department: "None"
      - generated_description: "REJECTED: [Reason it was rejected, e.g., 'This is an anime wallpaper.']"
      - location_integrity: "Suspicious"

      If the image IS a valid, real-world photograph of physical infrastructure / damage (is_relevant: true):
      1. Provide a detailed objective 'generated_description'.
      2. Assign the correct category, priority, and department.
      3. Flag 'location_integrity' as 'Suspicious' if it looks like a generic stock photo.

      Reported Location: "${location || 'General Campus'}"
      User-provided Description: "${description || 'No description provided.'}"
    `;

    const imagePart = fileToGenerativePart(imageUrl);
    const contentParts = imagePart ? [promptText, imagePart] : [promptText];

    const result = await model.generateContent(contentParts);
    // Because we use responseMimeType: "application/json", the response text is already a guaranteed JSON string
    const jsonString = result.response.text();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Classification Error details:", {
      message: error.message,
      stack: error.stack,
      location,
      hasDescription: !!description,
      hasImage: !!imageUrl
    });
    return null;
  }
};

// ── Feature 2: Detect recurring issues ──────────────────────────────────────
const detectRecurrence = async (newComplaint, recentComplaints) => {
  try {
    const model = getModel();
    if (!model || recentComplaints.length === 0) return null;

    const recentSummary = recentComplaints.map(c =>
      `- Location: "${c.location}", Category: "${c.category}", Date: ${new Date(c.created_at).toDateString()}`
    ).join('\n');

    const prompt = `
      You are an infrastructure pattern analysis engine for a campus maintenance system.
      A new complaint has been submitted. Your job is to detect if this is a RECURRING issue.

      New Complaint:
      - Location: "${newComplaint.location}"
      - Category: "${newComplaint.category}"
      - Description: "${newComplaint.description}"

      Recent complaints from the past 30 days:
      ${recentSummary}

      DUPLICATE VS RECURRING:
      - "is_recurring": true if this is a NEW instance of an OLD problem (e.g., sink clogs every week).
      - "is_duplicate": true if this is the EXACT SAME physical instance (e.g. two people reporting the same broken pipe right now). 
      - If it's a duplicate but the user claims a different room than the previous report, set "location_mismatch": true.

      Return ONLY valid JSON.
      {
        "is_recurring": boolean,
        "is_duplicate": boolean,
        "location_mismatch": boolean,
        "recurrence_note": "A note explaining the pattern or warning about duplicate/fraudulent reports."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Recurrence Detection Error:", error.message);
    return null;
  }
};

module.exports = { classifyIssue, detectRecurrence };
