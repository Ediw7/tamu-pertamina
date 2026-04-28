import mongoose, { Schema, Document } from 'mongoose';

export interface IGuest extends Document {
  name: string;
  agency: string;
  purpose: string;
  phone: string;
  host: string;
  status: 'checked_in' | 'checked_out';
  check_in_time: Date;
  check_out_time?: Date;
  qr_code: string;
}

const GuestSchema: Schema = new Schema({
  name: { type: String, required: true },
  agency: { type: String, required: true },
  purpose: { type: String, required: true },
  phone: { type: String, required: true },
  host: { type: String, required: true },
  status: { type: String, enum: ['checked_in', 'checked_out'], default: 'checked_in' },
  check_in_time: { type: Date, default: Date.now },
  check_out_time: { type: Date },
  qr_code: { type: String, required: true, unique: true },
}, { timestamps: true });

// Check if model already exists to avoid recompilation error in Next.js hot-reloading
export default mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);
