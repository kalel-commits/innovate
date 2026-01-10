import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA2B7PSMBk9XJtCkmsACJc9Qyx7b_7Wn18"; // User provided key
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp-image-generation" });

const SYSTEM_PROMPT = `
You are an advanced AI system designed for a waste-to-value marketplace platform that helps REGULAR PEOPLE transform their waste into PRACTICAL, EVERYDAY USEFUL ITEMS.

Your task is to analyze a given waste image and suggest SIMPLE, DOABLE conversions that normal people can either:
1. Make themselves (DIY)
2. Get help from local vendors using cheap/accessible materials
3. Create using materials they already have at home

CRITICAL FOCUS AREAS:
- Suggest PRACTICAL items for DAILY LIFE (home decor, organizers, planters, toys, furniture, etc.)
- Prioritize SIMPLE conversions over industrial/complex ones
- Focus on LOW-COST or FREE additional materials
- Consider what VENDORS can help with (cutting, painting, assembly, etc.)
- Think about what CUSTOMERS might already have (glue, paint, rope, fabric scraps, etc.)

You MUST strictly follow all instructions and output formats below.
Do NOT hallucinate unknown materials.
If confidence is low, explicitly mention it.

------------------------------------
OBJECTIVE
------------------------------------
From the provided waste image, perform the following tasks:

1. Identify and classify the waste materials present
2. Estimate quantity and quality
3. Suggest PRACTICAL conversion options for EVERYDAY USE (prioritize DIY and vendor-assisted)
4. Evaluate feasibility for REGULAR PEOPLE (not industrial scale)
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
STEP 4: CONVERSION OPTIONS (VERY IMPORTANT - READ CAREFULLY)
------------------------------------
For each waste type, suggest conversion options ranked by priority.

**PRIORITIZE THESE TYPES OF CONVERSIONS:**
1. **DIY Projects** - Simple things people can make at home with basic tools
2. **Vendor-Assisted** - Local vendors help with specific tasks (cutting, drilling, painting)
3. **Hybrid** - Customer provides some materials, vendor provides others at low cost

**FOCUS ON EVERYDAY USEFUL ITEMS:**
- Home organizers (pen holders, storage boxes, drawer dividers)
- Planters and garden items (pots, seed starters, bird feeders)
- Home decor (wall art, photo frames, candle holders, vases)
- Kids items (toys, craft supplies, learning tools)
- Furniture (stools, shelves, side tables, lamp stands)
- Kitchen items (utensil holders, coasters, trivets)
- Outdoor items (wind chimes, garden markers, hanging decorations)

**AVOID:**
- Industrial products (pellets, raw materials, bulk recycling)
- Complex manufacturing processes
- Items requiring expensive machinery
- Products with no clear daily use

Each option must include:
- product_name (MUST be a practical everyday item)
- conversion_type (DIY / vendor_assisted / hybrid)
- required_processing (simple steps: cleaning, cutting, gluing, painting, assembling, etc.)
- difficulty_level (easy / medium / hard) - PRIORITIZE easy and medium
- materials_needed (list cheap/free materials: glue, paint, rope, fabric, nails, etc.)
- customer_can_provide (materials customer might already have)
- vendor_can_provide (affordable materials vendor can supply)
- estimated_conversion_cost_inr (keep LOW - under ₹200 for most items)
- estimated_market_value_inr
- expected_profit_or_loss_inr
- daily_use_case (explain HOW this will be used in daily life)

------------------------------------
STEP 5: FEASIBILITY SCORING
------------------------------------
For each conversion option calculate a feasibility score:

feasibility_score =
(0.3 × simplicity_for_regular_people)
+ (0.3 × daily_usefulness)
+ (0.2 × low_cost_materials)
+ (0.2 × vendor_availability)

Return the score between 0 and 1.

------------------------------------
STEP 6: BEST RECOMMENDED OPTION
------------------------------------
Select ONE best option that is:
- SIMPLE enough for regular people
- USEFUL in daily life
- AFFORDABLE to make
- PRACTICAL and beautiful

Explain why using:
- ease of creation
- daily usefulness
- low cost
- environmental benefit

------------------------------------
STEP 7: IMAGE GENERATION PROMPTS
------------------------------------
For the best recommended option, generate TWO prompts:

1. product_visual_prompt:
   - Highly detailed
   - Photorealistic
   - Show the item in a HOME SETTING (on a table, shelf, garden, etc.)
   - Must describe material transformation clearly
   - Should look BEAUTIFUL and USEFUL

2. before_after_prompt:
   - Split-view description
   - Left: original waste
   - Right: final product IN USE in a home/daily setting

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
- Do NOT suggest industrial products (pellets, raw materials, bulk items)
- Do NOT suggest complex manufacturing processes
- ALWAYS prioritize items people can USE DAILY in their homes
- Keep conversion costs LOW (most under ₹200)
- Suggest items that are SIMPLE to make or get vendor help with
- Think like a REGULAR PERSON, not a factory
- Consider what materials people ALREADY HAVE at home
- Be conservative with estimates
- If image quality is poor, mention it
- Assume Indian context (prices, materials, vendors)
- This output will be used for real pricing and vendor payments
`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate an image using Gemini's image generation capabilities
 * @param {string} prompt - Detailed text prompt for image generation
 * @returns {Promise<string>} - Base64 encoded image data URL
 */
export async function generateImageWithGemini(prompt) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            console.log('🎨 Generating image with Gemini, prompt length:', prompt.length);
            console.log('🔧 Using model: gemini-2.0-flash-exp-image-generation');
            
            // Use Gemini image generation model
            const result = await imageModel.generateContent([prompt]);

            console.log('📥 Received response from Gemini');
            const response = await result.response;
            console.log('📊 Response object keys:', Object.keys(response));
            console.log('📊 Response candidates:', response.candidates?.length);
            
            // Check if response contains image data
            if (response.candidates && response.candidates[0]) {
                const candidate = response.candidates[0];
                console.log('📊 Candidate content parts:', candidate.content?.parts?.length);
                
                // Extract image from response
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        console.log('📊 Part type:', part.inlineData ? 'inlineData' : part.text ? 'text' : 'unknown');
                        
                        if (part.inlineData) {
                            // Return as data URL
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            const imageData = part.inlineData.data;
                            console.log('✅ Image generated successfully!');
                            console.log('📊 Image size (base64):', imageData.length, 'characters');
                            console.log('📊 MIME type:', mimeType);
                            return `data:${mimeType};base64,${imageData}`;
                        }
                        
                        if (part.text) {
                            console.log('⚠️ Received text instead of image:', part.text.substring(0, 200));
                        }
                    }
                }
            }

            // If no image in response, throw error to trigger retry/fallback
            console.error('❌ No image data found in Gemini response');
            console.error('Full response structure:', JSON.stringify(response, null, 2).substring(0, 500));
            throw new Error('No image data in Gemini response');

        } catch (error) {
            console.error(`❌ Gemini Image Generation Error (Attempt ${attempt + 1}/${maxRetries}):`, error.message);
            console.error('Error type:', error.constructor.name);
            console.error('Error status:', error.status);
            console.error('Error details:', error);

            // Handle rate limiting and service issues
            if (error.message.includes("429") || error.status === 429 || 
                error.message.includes("503") || error.status === 503) {
                attempt++;
                if (attempt < maxRetries) {
                    const waitTime = 2000 * Math.pow(2, attempt);
                    console.log(`⏳ Service overloaded. Retrying image generation in ${waitTime}ms...`);
                    await delay(waitTime);
                    continue;
                }
            }

            // For other errors or exhausted retries, throw
            if (attempt === maxRetries) {
                throw new Error('Failed to generate image after multiple attempts: ' + error.message);
            }
            
            attempt++;
            if (attempt < maxRetries) {
                console.log(`⏳ Retrying in 1 second...`);
                await delay(1000);
                continue;
            }
            
            throw error;
        }
    }
}

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
