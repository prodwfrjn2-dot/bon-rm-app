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

/**
 * Validasi apakah bon dengan tanggal tertentu (format id-ID: DD/MM/YYYY)
 * masih boleh direvisi:
 * - Harus di hari yang sama dengan hari ini (WIB)
 * - Jam sekarang harus sebelum 20:00 WIB
 *
 * Mengembalikan { boleh: boolean, alasan?: string }
 */
export function validasiBolehRevisi(tanggalBonId) {
  const { tanggalISO, totalMenit } = getWaktuWIBSekarang();
  const BATAS_REVISI_MENIT = 20 * 60; // 20:00

  const tanggalBonISO = tanggalIdKeISO(tanggalBonId);
  if (!tanggalBonISO) {
    return { boleh: false, alasan: "Format tanggal BON tidak valid." };
  }

  if (tanggalBonISO !== tanggalISO) {
    return {
      boleh: false,
      alasan: "Revisi hanya bisa dilakukan pada hari yang sama dengan tanggal BON.",
    };
  }

  if (totalMenit >= BATAS_REVISI_MENIT) {
    return {
      boleh: false,
      alasan: "Batas waktu revisi (20:00 WIB) sudah lewat.",
    };
  }

  return { boleh: true };
}