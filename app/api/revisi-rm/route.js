import { getSheets, SHEET_ID } from "@/lib/googleSheets";
import { validasiBolehRevisi } from "@/lib/waktuHelper";

export async function POST(request) {
  try {
    const sheets = await getSheets();
    const body = await request.json();
    const { id_bon, field, nilai_lama, nilai_baru, nama_editor, password } = body;

    // Cek password revisi di kolom B
    const usersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Users!B2:B1000",
    });
    const passwords = (usersRes.data.values || []).map((row) => row[0]).filter(Boolean);
    if (!passwords.includes(password)) {
      return new Response(
        JSON.stringify({ success: false, error: "Password revisi salah!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ambil data BON untuk cek tanggal (batas jam revisi)
    const bonRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "BON_RM!A2:V10000",
    });
    const bonRows = bonRes.data.values || [];
    const rowIdx = bonRows.findIndex((row) => row[0] === id_bon);
    if (rowIdx === -1) {
      return new Response(
        JSON.stringify({ success: false, error: "BON tidak ditemukan!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    const bonRow = bonRows[rowIdx];
    const tanggalBon = bonRow[2]; // kolom C = tanggal

    // ATURAN 1: Revisi hanya boleh di hari yang sama & sebelum jam 20:00 WIB
    const cekWaktu = validasiBolehRevisi(tanggalBon);
    if (!cekWaktu.boleh) {
      return new Response(
        JSON.stringify({ success: false, error: cekWaktu.alasan }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // ATURAN 2: Field ALT tidak boleh direvisi sama sekali.
    if (field.startsWith("alt_")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Field ALT tidak dapat direvisi.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // ATURAN 3: Field BON (qty batch) boleh direvisi naik, tapi TIDAK BOLEH
    // diturunkan di bawah total qty yang sudah tercatat dikirim di Verif_RM.
    // Pemetaan field revisi (bon_...) ke field pengiriman (adonan_putih, dst)
    const fieldRevisiKeFieldKirim = {
      bon_adonan_putih: "adonan_putih",
      bon_adonan_pita: "adonan_pita",
      bon_cream: "cream",
      bon_adonan: "adonan",
      bon_cream_spreading: "cream_spreading",
      bon_cream_coating: "cream_coating",
    };
    const fieldKirimTerkait = fieldRevisiKeFieldKirim[field];

    if (fieldKirimTerkait) {
      const verifRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Verif_RM!A2:F10000",
      });
      const verifRows = verifRes.data.values || [];
      const totalSudahDikirim = verifRows
        .filter((row) => row[0] === id_bon && row[1] === fieldKirimTerkait)
        .reduce((sum, row) => sum + Number(row[2] || 0), 0);

      if (Number(nilai_baru) < totalSudahDikirim) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Qty tidak boleh dikurangi di bawah jumlah yang sudah dikirim (${totalSudahDikirim} batch).`,
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Revisi_RM!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id_bon, field, nilai_lama, nilai_baru, nama_editor, waktu]],
      },
    });

    const fieldMap = {
      alt_adonan_putih: "I", bon_adonan_putih: "J",
      alt_adonan_pita: "K", bon_adonan_pita: "L",
      alt_cream: "M", bon_cream: "N",
      alt_adonan: "O", bon_adonan: "P",
      alt_cream_spreading: "Q", bon_cream_spreading: "R",
      alt_cream_coating: "S", bon_cream_coating: "T",
    };

    const col = fieldMap[field];
    if (!col) {
      return new Response(
        JSON.stringify({ success: false, error: "Field tidak valid!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const rowNum = rowIdx + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `BON_RM!${col}${rowNum}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[nilai_baru]] },
    });

    return new Response(
      JSON.stringify({ success: true, waktu }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(request) {
  try {
    const sheets = await getSheets();
    const { searchParams } = new URL(request.url);
    const id_bon = searchParams.get("id_bon");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Revisi_RM!A2:F10000",
    });

    const rows = response.data.values || [];
    const filtered = rows
      .filter((row) => row[0] === id_bon)
      .map((row) => ({
        id_bon: row[0] || "",
        field: row[1] || "",
        nilai_lama: row[2] || "",
        nilai_baru: row[3] || "",
        nama_editor: row[4] || "",
        waktu: row[5] || "",
      }));

    return new Response(
      JSON.stringify({ success: true, data: filtered }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}