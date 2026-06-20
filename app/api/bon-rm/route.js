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