import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    await connectDB();

    // Auto-setup first admin account if none exist
    // Password will be automatically hashed by Admin model pre-save hook
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ username: "admin", password: "admin123" });
    }

    // Verify credentials
    const admin = await Admin.findOne({ username });
    
    if (admin) {
      // Use bcrypt to compare the hashed password
      const isMatch = await bcrypt.compare(password, admin.password);
      
      if (isMatch) {
        return NextResponse.json({ success: true, message: "Login successful" });
      }
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
