import { getSheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(request) {
  try {
    const sheets = await getSheets();
    const body = await request.json();
    const {
      id, hari, tanggal, jam, bagian, pengorder, line, produk,
      alt_adonan_putih, bon_adonan_putih,
      alt_adonan_pita, bon_adonan_pita,
      alt_cream, bon_cream,
      alt_adonan, bon_adonan,
      alt_cream_spreading, bon_cream_spreading,
      alt_cream_coating, bon_cream_coating,
      tujuan, keterangan
    } = body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "BON_RM!A:V",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          id, hari, tanggal, jam, bagian, pengorder, line, produk,
          alt_adonan_putih || "", bon_adonan_putih || "",
          alt_adonan_pita || "", bon_adonan_pita || "",
          alt_cream || "", bon_cream || "",
          alt_adonan || "", bon_adonan || "",
          alt_cream_spreading || "", bon_cream_spreading || "",
          alt_cream_coating || "", bon_cream_coating || "",
          tujuan, keterangan || ""
        ]],
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: "BON RM berhasil disimpan!" }),
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
    const id = searchParams.get("id");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "BON_RM!A2:V10000",
    });

    const rows = response.data.values || [];
    const found = rows.find((row) => row[0] === id);

    if (!found) {
      return new Response(
        JSON.stringify({ success: false, error: "BON tidak ditemukan!" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: found[0] || "",
          hari: found[1] || "",
          tanggal: found[2] || "",
          jam: found[3] || "",
          bagian: found[4] || "",
          pengorder: found[5] || "",
          line: found[6] || "",
          produk: found[7] || "",
          alt_adonan_putih: found[8] || "",
          bon_adonan_putih: found[9] || "",
          alt_adonan_pita: found[10] || "",
          bon_adonan_pita: found[11] || "",
          alt_cream: found[12] || "",
          bon_cream: found[13] || "",
          alt_adonan: found[14] || "",
          bon_adonan: found[15] || "",
          alt_cream_spreading: found[16] || "",
          bon_cream_spreading: found[17] || "",
          alt_cream_coating: found[18] || "",
          bon_cream_coating: found[19] || "",
          tujuan: found[20] || "",
          keterangan: found[21] || "",
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}