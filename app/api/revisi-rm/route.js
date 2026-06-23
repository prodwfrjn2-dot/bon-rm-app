import { getSheets, SHEET_ID } from "@/lib/googleSheets";

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

    const waktu = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Revisi_RM!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id_bon, field, nilai_lama, nilai_baru, nama_editor, waktu]],
      },
    });

    const bonRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "BON_RM!A2:V10000",
    });

    const rows = bonRes.data.values || [];
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

    const rowIdx = rows.findIndex((row) => row[0] === id_bon);
    if (rowIdx === -1) {
      return new Response(
        JSON.stringify({ success: false, error: "BON tidak ditemukan!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
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