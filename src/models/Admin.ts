import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Pre-save hook versi modern (tanpa next() untuk async function)
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}

export default mongoose.model("Admin", adminSchema);
