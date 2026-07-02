// lib/waktuHelper.js
// Helper untuk menentukan shift pengiriman & validasi batas waktu revisi.
// Semua perhitungan menggunakan waktu WIB (Asia/Jakarta), tidak bergantung
// pada timezone server, supaya konsisten di mana pun aplikasi di-deploy.

/**
 * Mengambil tanggal & jam saat ini dalam WIB sebagai object terpisah,
 * supaya mudah dibandingkan tanpa terpengaruh timezone server.
 */
export function getWaktuWIBSekarang() {
  const now = new Date();
  // en-CA -> format YYYY-MM-DD, memudahkan perbandingan tanggal
  const tanggalISO = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const jamStr = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Jakarta",
    hour12: false,
  }); // format HH:MM:SS
  const [jam, menit, detik] = jamStr.split(":").map(Number);
  return { tanggalISO, jam, menit, detik, totalMenit: jam * 60 + menit };
}

/**
 * Menentukan shift berdasarkan jam WIB saat ini.
 * Shift 1: 07:00 - 15:00
 * Shift 2: 15:00 - 23:00
 * Shift 3: 23:00 - 07:00 (lintas hari)
 */
export function getShiftSekarang() {
  const { totalMenit } = getWaktuWIBSekarang();
  const S1_START = 7 * 60;   // 07:00
  const S2_START = 15 * 60;  // 15:00
  const S3_START = 23 * 60;  // 23:00

  if (totalMenit >= S1_START && totalMenit < S2_START) return "Shift 1";
  if (totalMenit >= S2_START && totalMenit < S3_START) return "Shift 2";
  return "Shift 3"; // 23:00 - 07:00
}

/**
 * Mengubah string tanggal format "DD/MM/YYYY" (format toLocaleDateString("id-ID"))
 * menjadi "YYYY-MM-DD" agar bisa dibandingkan dengan tanggalISO.
 */
export function tanggalIdKeISO(tanggalId) {
  if (!tanggalId) return null;
  const parts = tanggalId.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Batas jam kunci bon: 20:00 WIB. Dipakai bersama untuk Revisi & Catat Pengiriman.
const BATAS_LOCK_MENIT = 20 * 60; // 20:00

/**
 * Validasi apakah bon dengan tanggal tertentu (format id-ID: DD/MM/YYYY)
 * masih dalam jendela waktu aktif (belum lewat jam 20:00 WIB di hari yang sama).
 * Dipakai untuk MENGUNCI BON SECARA TOTAL setelah jam 20:00 — berlaku baik
 * untuk aksi Revisi maupun Catat Pengiriman (verif).
 *
 * Mengembalikan { boleh: boolean, alasan?: string }
 */
export function validasiBonMasihAktif(tanggalBonId) {
  const { tanggalISO, totalMenit } = getWaktuWIBSekarang();

  const tanggalBonISO = tanggalIdKeISO(tanggalBonId);
  if (!tanggalBonISO) {
    return { boleh: false, alasan: "Format tanggal BON tidak valid." };
  }

  if (tanggalBonISO !== tanggalISO) {
    return {
      boleh: false,
      alasan: "BON ini sudah lewat hari, tidak bisa direvisi atau dicatat pengirimannya lagi.",
    };
  }

  if (totalMenit >= BATAS_LOCK_MENIT) {
    return {
      boleh: false,
      alasan: "Sudah lewat jam 20:00 WIB, BON hari ini terkunci (tidak bisa direvisi maupun dicatat pengirimannya).",
    };
  }

  return { boleh: true };
}

// Alias lama dipertahankan supaya kompatibel jika masih dipakai di tempat lain.
export const validasiBolehRevisi = validasiBonMasihAktif;

/**
 * Field "bon_*" adalah quantity (jumlah batch) — boleh direvisi naik meski
 * sudah pernah dikirim, tapi tidak boleh diturunkan di bawah nilai saat ini.
 * Field "alt_*" bukan quantity, tetap full-lock begitu ada pengiriman tercatat.
 */
export function isFieldQuantity(fieldName) {
  return typeof fieldName === "string" && fieldName.startsWith("bon_");
}