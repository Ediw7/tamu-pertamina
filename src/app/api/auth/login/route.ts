import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    await connectDB();

    // Auto-setup first admin account if none exist
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      console.log("No admins found, creating default admin...");
      await Admin.create({ username: "admin", password: "admin123" });
    }

    // Verify credentials
    const admin = await Admin.findOne({ username });
    
    if (admin) {
      // Use bcrypt to compare
      try {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
          return NextResponse.json({ success: true, message: "Login successful" });
        }
      } catch (bcryptErr) {
        // Fallback for plain text if bcrypt fails (ONLY for the transition phase)
        if (admin.password === password) {
          console.log("Legacy plain-text login detected, hashing password...");
          admin.password = password; // This will trigger the pre-save hash hook
          await admin.save();
          return NextResponse.json({ success: true, message: "Login successful (legacy)" });
        }
        throw bcryptErr;
      }
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error: any) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}
