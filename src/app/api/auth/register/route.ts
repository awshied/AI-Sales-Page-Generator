import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect";
import User from "@/src/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "At least 6 characters needed to create a password." },
        { status: 400 },
      );
    }

    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return NextResponse.json(
    //     { message: "Email has been registered." },
    //     { status: 400 },
    //   );
    // }

    // const hashedPassword = await bcrypt.hash(password, 10);

    // const user = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    // });
    const hashedPassword = await bcrypt.hash(password, 10);

    const normalizedEmail = email.toLowerCase().trim();

    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json(
          { message: "Email has been registered." },
          { status: 400 },
        );
      }
      throw err;
    }

    return NextResponse.json(
      {
        message: "Registration successfully.",
        user: { id: user._id, name: user.name, email: user.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 },
    );
  }
}
