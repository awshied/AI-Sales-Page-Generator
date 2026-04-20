import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import dbConnect from "@/src/lib/dbConnect";
import GeneratedSales from "@/src/models/GeneratedSales";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search") || "";
    await dbConnect();

    const query: Record<string, unknown> = { userId: session.user.id };
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { productName: { $regex: escapedSearch, $options: "i" } },
        { headline: { $regex: escapedSearch, $options: "i" } },
        { productDescription: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const histories = await GeneratedSales.find(query)
      .select("_id productName productDescription headline price createdAt")
      .sort({ createdAt: -1 })
      .limit(100);
    return NextResponse.json({
      message: "History fetched successfully.",
      data: histories,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
