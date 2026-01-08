import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA88GbEF31qoq4aOjK-ZOaJVl8JFAEHBbY"; // User provided key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are an advanced AI system designed for a real-world waste-to-value marketplace platform.

Your task is to analyze a given waste image and generate a complete, structured, and reliable analysis that can be directly used by a production web application.

You MUST strictly follow all instructions and output formats below.
Do NOT hallucinate unknown materials.
If confidence is low, explicitly mention it.

------------------------------------
OBJECTIVE
------------------------------------
From the provided waste image, perform the following tasks:

1. Identify and classify the waste materials present
2. Estimate quantity and quality
3. Suggest the BEST possible conversion options (reuse, upcycling, recycling)
4. Evaluate feasibility and economic value
5. Generate prompts for AI-based product image generation
6. Provide environmental impact metrics
7. Prepare data suitable for vendor matching and pricing

------------------------------------
INPUT
------------------------------------
- One image containing waste material(s)
- The image may contain multiple waste items
- The waste may be partially damaged, mixed, or contaminated

------------------------------------
OUTPUT REQUIREMENTS
------------------------------------
Your output MUST be valid JSON.
Do NOT include markdown.
Do NOT include explanations outside JSON.
Use realistic values.
Use INR (₹) for prices.

------------------------------------
STEP 1: WASTE DETECTION & CLASSIFICATION
------------------------------------
Detect all visible waste items and classify them.

For each detected item include:
- material_type (plastic, metal, glass, paper, fabric, organic, e-waste, mixed)
- specific_object (e.g., PET bottle, aluminum can, cardboard box)
- confidence_score (0.0 – 1.0)

------------------------------------
STEP 2: QUALITY & CONDITION ANALYSIS
------------------------------------
For each item determine:
- cleanliness_level (clean / moderately_dirty / heavily_contaminated)
- damage_level (intact / partially_damaged / broken)
- reusability_score (0.0 – 1.0)
- contamination_risk (low / medium / high)

------------------------------------
STEP 3: QUANTITY ESTIMATION
------------------------------------
Estimate:
- count (if discrete items)
- approximate_weight_kg
- volume_estimate_liters

Use conservative estimates if unsure.

------------------------------------
STEP 4: CONVERSION OPTIONS (VERY IMPORTANT)
------------------------------------
For each waste type, suggest conversion options ranked by priority.

Each option must include:
- product_name
- conversion_type (DIY / local_vendor / industrial)
- required_processing (cleaning, cutting, melting, shredding, etc.)
- difficulty_level (easy / medium / hard)
- estimated_conversion_cost_inr
- estimated_market_value_inr
- expected_profit_or_loss_inr

------------------------------------
STEP 5: FEASIBILITY SCORING
------------------------------------
For each conversion option calculate a feasibility score:

feasibility_score =
(0.4 × material_suitability)
+ (0.3 × cost_efficiency)
+ (0.2 × vendor_availability)
+ (0.1 × market_demand)

Return the score between 0 and 1.

------------------------------------
STEP 6: BEST RECOMMENDED OPTION
------------------------------------
Select ONE best option overall and explain why using:
- technical feasibility
- economic value
- environmental benefit

------------------------------------
STEP 7: IMAGE GENERATION PROMPTS
------------------------------------
For the best recommended option, generate TWO prompts:

1. product_visual_prompt:
   - Highly detailed
   - Photorealistic
   - Suitable for Stable Diffusion / Imagen
   - Must describe material transformation clearly

2. before_after_prompt:
   - Split-view description
   - Left: original waste
   - Right: final product

------------------------------------
STEP 8: ENVIRONMENTAL IMPACT
------------------------------------
Estimate:
- CO2_saved_kg
- landfill_diverted_kg
- energy_saved_kwh
- sustainability_score (0 – 100)

------------------------------------
STEP 9: PLATFORM-COMPATIBLE OUTPUT
------------------------------------
Structure final JSON exactly as follows:

{
  "waste_analysis": {...},
  "quality_assessment": {...},
  "quantity_estimation": {...},
  "conversion_options": [...],
  "best_recommendation": {...},
  "image_generation": {...},
  "environmental_impact": {...},
  "overall_confidence": 0.0 – 1.0,
  "warnings_or_limitations": []
}

------------------------------------
IMPORTANT RULES
------------------------------------
- Do NOT invent materials not visible
- Be conservative with estimates
- If image quality is poor, mention it
- Assume Indian context (prices, materials, vendors)
- This output will be used for real pricing and vendor payments
- Accuracy and consistency are more important than creativity
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeWasteImage(base64Image) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            // Remove header if present (e.g., "data:image/jpeg;base64,")
            const imageParts = [
                {
                    inlineData: {
                        data: base64Image.split(",")[1] || base64Image,
                        mimeType: "image/jpeg",
                    },
                },
            ];

            const result = await model.generateContent([SYSTEM_PROMPT, ...imageParts]);
            const response = await result.response;
            const text = response.text();

            // Robust JSON extraction: Find the first '{' and the last '}'
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');

            if (startIndex === -1 || endIndex === -1) {
                throw new Error("Invalid response format from AI");
            }

            const jsonString = text.substring(startIndex, endIndex + 1);
            return JSON.parse(jsonString);

        } catch (error) {
            console.error(`Gemini Analysis Error (Attempt ${attempt + 1}/${maxRetries}):`, error);

            // Handle both 429 (Too Many Requests) and 503 (Service Unavailable/Overloaded)
            if (error.message.includes("429") || error.status === 429 || error.message.includes("503") || error.status === 503) {
                attempt++;
                if (attempt < maxRetries) {
                    const waitTime = 2000 * Math.pow(2, attempt); // Exponential backoff: 4s, 8s, 16s
                    console.log(`Service overloaded or rate limit hit. Retrying in ${waitTime}ms...`);
                    await delay(waitTime);
                    continue;
                }
            }
            // For other errors, or if retries exhausted, throw
            if (attempt === maxRetries) {
                throw new Error("Service is currently experiencing high traffic. We tried multiple times but failed. Please try again in a minute.");
            }
            throw new Error("Failed to analyze image. Please try again.");
        }
    }
}
