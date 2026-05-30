require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("No MONGODB_URI found");
  process.exit(1);
}

// Minimal schemas for seeding
const VisitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  agency: { type: String, required: true },
  agency_address: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
}, { timestamps: true });

const GuestSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  purpose: { type: String, required: true },
  host: { type: String, required: true },
  ktp_image: { type: String, default: '' },
  status: { type: String, required: true },
  check_in_time: { type: Date },
  check_out_time: { type: Date },
  qr_code: { type: String, required: true },
}, { timestamps: true });

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);
const Guest = mongoose.models.Guest || mongoose.model('Guest', GuestSchema);

const names = ["Andi Saputra", "Budi Santoso", "Citra Kirana", "Dian Sastro", "Eko Yuli", "Fajar Alfian", "Gita Gutawa", "Hendra Setiawan", "Indra Wijaya", "Joko Anwar", "Kiki Amalia", "Lestari", "Mamat Alkatiri", "Nadine Chandrawinata", "Oka Antara", "Putri Marino", "Qory Sandioriva", "Rafi Ahmad", "Siti Nurhaliza", "Taufik Hidayat", "Umar Said", "Vina Panduwinata", "Wulan Guritno", "Xavier", "Yuni Shara", "Zaskia Mecca"];
const agencies = ["Universitas Diponegoro", "PT Pertamina", "Telkom Indonesia", "Bank Mandiri", "Gojek", "Tokopedia", "Shopee", "Grab", "Dinas Pendidikan", "Kementerian BUMN"];
const hosts = ["Bapak Budi (IT)", "Ibu Siti (HR)", "Pak Joko (Finance)", "Bu Rina (Operations)", "Bapak Ahmad (Security)"];
const purposes = ["Penelitian / Mahasiswa", "Meeting / Rapat", "Pengiriman Barang", "Kunjungan Kerja", "Interview"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Visitor.deleteMany({});
    await Guest.deleteMany({});
    console.log("Cleared existing data");

    const startDate = new Date(2026, 4, 1); // May 1, 2026
    const endDate = new Date(2026, 6, 30); // July 30, 2026

    const visitors = [];
    for (let i = 0; i < 25; i++) {
      const visitor = new Visitor({
        name: names[i % names.length] + (i > names.length ? ` ${i}` : ''),
        agency: agencies[randomInt(0, agencies.length - 1)],
        phone: `0812${randomInt(10000000, 99999999)}`,
      });
      await visitor.save();
      visitors.push(visitor);
    }

    const guests = [];
    for (let i = 0; i < 25; i++) {
      const checkIn = randomDate(startDate, endDate);
      const isCheckedOut = Math.random() > 0.2; // 80% chance they checked out
      let checkOut = null;
      
      if (isCheckedOut) {
        // Checkout between 30 mins and 5 hours later
        checkOut = new Date(checkIn.getTime() + randomInt(30 * 60000, 5 * 3600000));
      }

      const guest = new Guest({
        visitorId: visitors[i]._id,
        purpose: purposes[randomInt(0, purposes.length - 1)],
        host: hosts[randomInt(0, hosts.length - 1)],
        status: isCheckedOut ? 'CHECKED_OUT' : 'CHECKED_IN',
        check_in_time: checkIn,
        check_out_time: checkOut,
        qr_code: `SEED_QR_${i}_${Date.now()}`
      });
      await guest.save();
      guests.push(guest);
    }
    console.log("Seeded 25 new visitors and guests");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
