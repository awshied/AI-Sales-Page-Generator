import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import dbConnect from "@/src/lib/dbConnect";
import GeneratedContent from "@/src/models/GeneratedContent";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildPrompt(data: {
  contentType: string;
  topic: string;
  keywords: string;
  targetAudience: string;
  tone: string;
}) {
  const contentTypeMap: Record<string, string> = {
    blog: "blog article",
    social_media: "social media post",
    email: "marketing email",
    ad_copy: "advertisement copy",
    product_desc: "product description",
  };

  const toneMap: Record<string, string> = {
    formal: "formal and professional",
    casual: "casual and conversational, like talking to a friend",
    persuasive: "persuasive and compelling",
    humorous: "humorous and funny",
    inspirational: "inspirational and motivating",
    professional: "professional and credible",
  };

  return `You are a professional content writer. Create a ${contentTypeMap[data.contentType] || data.contentType} about: "${data.topic}".

Requirements:
- Keywords to include: ${data.keywords}
- Target audience: ${data.targetAudience}
- Tone: ${toneMap[data.tone] || data.tone}
- Language: Indonesian (Bahasa Indonesia)

Additional instructions:
1. Write in Indonesian language (Bahasa Indonesia) that is proper and natural
2. Make the content engaging, informative, and suitable for the target audience
3. Length should be appropriate for the content type
4. For social media posts, include relevant hashtags (max 3)
5. For marketing emails, include an attention-grabbing subject line at the beginning
6. Do not add any explanations or commentary outside the content

Generate the content directly without any extra text.`;
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

    const { contentType, topic, keywords, targetAudience, tone } = body;
    if (!contentType || !topic || !keywords || !targetAudience || !tone) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt({
      contentType,
      topic,
      keywords,
      targetAudience,
      tone,
    });

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
        topP: 0.95,
        topK: 40,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputContent = response.text();

    if (!outputContent) {
      return NextResponse.json(
        { message: "Failed to generate content, please try again." },
        { status: 500 },
      );
    }

    await dbConnect();
    const generated = await GeneratedContent.create({
      userId: session.user.id,
      contentType,
      topic,
      keywords,
      targetAudience,
      tone,
      outputContent,
    });

    return NextResponse.json({
      message: "Content generated successfully.",
      data: {
        id: generated._id,
        contentType: generated.contentType,
        topic: generated.topic,
        keywords: generated.keywords,
        targetAudience: generated.targetAudience,
        tone: generated.tone,
        outputContent: generated.outputContent,
        createdAt: generated.createdAt,
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
