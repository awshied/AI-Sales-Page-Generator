import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import dbConnect from "@/src/lib/dbConnect";
import GeneratedSales from "@/src/models/GeneratedSales";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required.");
}

function buildSalesPagePrompt(data: {
  productName: string;
  productDescription: string;
  features: string;
  targetAudience: string;
  price: string;
  usp: string;
}) {
  return `You are a professional copywriter and conversion expert. Create a COMPLETE sales page for the following product:

PRODUCT NAME: ${data.productName}
DESCRIPTION: ${data.productDescription}
KEY FEATURES: ${data.features}
TARGET AUDIENCE: ${data.targetAudience}
PRICE: ${data.price}
UNIQUE SELLING POINTS: ${data.usp}

Generate the following sections in English as general language or using any languages depending on user want to be:

1. HEADLINE: A compelling, attention-grabbing headline (max 15 words)
2. SUB-HEADLINE: Supporting line that reinforces the headline (max 20 words)
3. BENEFITS SECTION: 3-5 key benefits, each with a short explanation (100-150 words total)
4. FEATURES BREAKDOWN: Detailed breakdown of each feature with emojis (100-150 words)
5. SOCIAL PROOF PLACEHOLDER: Example testimonial or trust signal (50 words)
6. PRICING DISPLAY: Display the price with value proposition (30-50 words)
7. CALL TO ACTION: Urgent, action-oriented button text and instruction (20-30 words)

Return the response as a JSON object with this exact structure:
{
  "headline": "...",
  "subHeadline": "...",
  "benefitsSection": "...",
  "featuresBreakdown": "...",
  "socialProofPlaceholder": "...",
  "pricingDisplay": "...",
  "callToAction": "..."
}

IMPORTANT: Write ALL content in English language or anything else. Make it persuasive, benefit-driven, and suitable for ${data.targetAudience}.`;
}

function isApiError(
  error: unknown,
): error is { status?: number; message?: string } {
  return typeof error === "object" && error !== null;
}

export async function generateWithRetry(
  model: GenerativeModel,
  prompt: string,
  maxRetries = 3,
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error: unknown) {
      if (
        isApiError(error) &&
        (error.status === 503 ||
          error.status === 429 ||
          String(error.message).includes("429")) &&
        i < maxRetries - 1
      ) {
        console.log(`Model busy, retrying in ${(i + 1) * 2} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 2000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content after retries.");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first." },
        { status: 401 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON body." },
        { status: 400 },
      );
    }

    const {
      productName,
      productDescription,
      features,
      targetAudience,
      price,
      usp,
    } = body;
    if (
      !productName ||
      !productDescription ||
      !features ||
      !targetAudience ||
      !price ||
      !usp
    ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    const prompt = buildSalesPagePrompt({
      productName,
      productDescription,
      features,
      targetAudience,
      price,
      usp,
    });

    const model = genAI.getGenerativeModel({
      model: "gemma-4-26b-a4b-it",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        topP: 0.95,
        topK: 40,
      },
    });

    const result = await generateWithRetry(model, prompt);
    const responseText = result.response.text();
    if (!responseText) {
      return NextResponse.json(
        { message: "Failed to generate sales page, please try again." },
        { status: 500 },
      );
    }

    let aiResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Failed to parse AI response:", responseText);
      return NextResponse.json(
        { message: "AI response parsing failed" },
        { status: 500 },
      );
    }

    const fullHtml = buildFullHtml({
      productName,
      price,
      headline: aiResponse.headline,
      subHeadline: aiResponse.subHeadline,
      benefitsSection: aiResponse.benefitsSection,
      featuresBreakdown: aiResponse.featuresBreakdown,
      socialProofPlaceholder: aiResponse.socialProofPlaceholder,
      pricingDisplay: aiResponse.pricingDisplay,
      callToAction: aiResponse.callToAction,
    });

    await dbConnect();
    const generatedSalesPage = await GeneratedSales.create({
      userId: session.user.id,
      productName,
      productDescription,
      features,
      targetAudience,
      price,
      usp,
      headline: aiResponse.headline,
      subHeadline: aiResponse.subHeadline,
      benefitsSection: aiResponse.benefitsSection,
      featuresBreakdown: aiResponse.featuresBreakdown,
      socialProofPlaceholder: aiResponse.socialProofPlaceholder,
      pricingDisplay: aiResponse.pricingDisplay,
      callToAction: aiResponse.callToAction,
      fullHtml,
    });

    console.log("=== API GENERATE RESPONSE ===");
    console.log("Generated Sales Page ID:", generatedSalesPage._id);
    console.log("Full HTML length:", generatedSalesPage.fullHtml?.length);
    console.log(
      "Full HTML preview:",
      generatedSalesPage.fullHtml?.substring(0, 200),
    );
    console.log("==============================");

    return NextResponse.json({
      message: "Sales page generated successfully.",
      data: {
        _id: generatedSalesPage._id,
        productName: generatedSalesPage.productName,
        headline: generatedSalesPage.headline,
        fullHtml: generatedSalesPage.fullHtml,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);

    const errorMessage = (error as Error).message;
    if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { message: "Too many requests. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { message: "Server error", error: errorMessage },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFullHtml(data: {
  productName: string;
  price: string;
  headline: string;
  subHeadline: string;
  benefitsSection: string;
  featuresBreakdown: string;
  socialProofPlaceholder: string;
  pricingDisplay: string;
  callToAction: string;
}): string {
  const safe = {
    productName: escapeHtml(data.productName),
    price: escapeHtml(data.price),
    headline: escapeHtml(data.headline),
    subHeadline: escapeHtml(data.subHeadline),
    benefitsSection: escapeHtml(data.benefitsSection),
    featuresBreakdown: escapeHtml(data.featuresBreakdown),
    socialProofPlaceholder: escapeHtml(data.socialProofPlaceholder),
    pricingDisplay: escapeHtml(data.pricingDisplay),
    callToAction: escapeHtml(data.callToAction),
  };
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safe.productName} | Sales Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-base-300">
  <div class="max-w-4xl mx-auto py-12 px-4">
    <div class="flex flex-col gap-4 items-center mb-12">
      <h1 class="text-2xl md:text-4xl font-bold text-primary text-center line-clamp-1 font-poppins">${safe.headline}</h1>
      <p class="text-lg md:text-xl text-gray-500 font-semibold text-center">${safe.subHeadline}</p>
    </div>

    <div class="bg-base-100 rounded-2xl shadow-xl p-8 mb-8">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-6 text-center">✨ Benefits You Got</h2>
      <div class="max-w-none text-gray-500 font-medium text-sm md:text-base">${safe.benefitsSection}</div>
    </div>

    <div class="bg-base-100 rounded-2xl shadow-xl p-8 mb-8">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-6 text-center">⚙️ Features</h2>
      <div class="max-w-none text-gray-500 font-medium text-sm md:text-base">${safe.featuresBreakdown}</div>
    </div>

    <div class="bg-base-100 rounded-2xl shadow-xl p-8 mb-8">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-6 text-center">💬 Customer Testimonials</h2>
      <div class="max-w-none text-gray-500 font-medium text-sm md:text-base italic">${safe.socialProofPlaceholder}</div>
    </div>

    <div class="bg-base-100 rounded-2xl shadow-xl p-8 mb-8">
      <h2 class="text-xl md:text-2xl font-bold text-white mb-4 text-center">💰 Special Price</h2>
      <div class="text-2xl md:text-4xl font-bold text-warning mb-2 text-center">${safe.price}</div>
      <div class="max-w-none text-gray-500 font-medium text-sm md:text-base">${safe.pricingDisplay}</div>
    </div>

    <div class="text-center">
      <button class="bg-secondary hover:bg-secondary/70 text-white font-bold text-base md:text-lg py-4 px-12 rounded-full shadow-lg transition duration-300 transform hover:scale-105">
        ${safe.callToAction}
      </button>
    </div>

    <footer class="text-center text-gray-500 text-sm mt-12">
      © ${new Date().getFullYear()} ${safe.productName}. All rights reserved.
    </footer>
  </div>
</body>
</html>`;
}
