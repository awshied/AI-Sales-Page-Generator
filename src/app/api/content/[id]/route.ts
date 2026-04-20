import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import dbConnect from "@/src/lib/dbConnect";
import GeneratedSales from "@/src/models/GeneratedSales";
import mongoose from "mongoose";

// Get a Sales Page By Id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const sales = await GeneratedSales.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!sales) {
      return NextResponse.json(
        { message: "Sales page not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: sales });
  } catch (error) {
    console.error("GET method error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Delete a Sales Page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 },
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const deleted = await GeneratedSales.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { message: "Sales page not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Sales page deleted successfully." });
  } catch (error) {
    console.error("DELETE method error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
