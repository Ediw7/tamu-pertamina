import mongoose, { Schema, Document } from 'mongoose';

export interface IVisitor extends Document {
  name: string;
  agency: string;
  phone: string; // Unique identifier for visitor
}

const VisitorSchema: Schema = new Schema({
  name: { type: String, required: true },
  agency: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);
