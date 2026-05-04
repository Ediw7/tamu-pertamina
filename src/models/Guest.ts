import mongoose, { Schema, Document } from 'mongoose';
import './Visitor';

export interface IGuest extends Document {
  visitorId: mongoose.Types.ObjectId;
  purpose: string;
  host: string;
  ktp_image?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT';
  check_in_time: Date;
  check_out_time?: Date;
  qr_code: string;
}

const GuestSchema: Schema = new Schema({
  visitorId: { type: Schema.Types.ObjectId, ref: 'Visitor', required: true },
  purpose: {
    type: String,
    required: true
  },
  host: { type: String, required: true },
  ktp_image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['CHECKED_IN', 'CHECKED_OUT'],
    default: 'CHECKED_IN',
    required: true
  },
  check_in_time: { type: Date, default: Date.now },
  check_out_time: { type: Date },
  qr_code: { type: String, required: true, unique: true },
}, { timestamps: true });

const Guest = mongoose.models.Guest || mongoose.model<IGuest>('Guest', GuestSchema);
export default Guest;
