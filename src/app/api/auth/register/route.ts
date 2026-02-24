import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { handleApiError } from "@/lib/http/api-error";
import User from "@/lib/models/user.model";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const payload = registerSchema.parse(body);
    const { confirmPassword: _confirmPassword, ...parsedUserData } = payload;
    void _confirmPassword;
    const userData = {
      ...parsedUserData,
      firstname: parsedUserData.firstname.trim().toLowerCase(),
      lastname: parsedUserData.lastname.trim().toLowerCase(),
      email: parsedUserData.email.trim().toLowerCase(),
      username: parsedUserData.username.trim().toLowerCase(),
    };

    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { ok: false, message: "Email or username already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role: "client",
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Registration successful",
        data: {
          user: {
            id: user._id.toString(),
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            country: user.country,
            phone: user.phone,
            role: user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
