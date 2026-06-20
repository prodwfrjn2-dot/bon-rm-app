import { getSheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    const sheets = await getSheets();
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get("tanggal");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "BON_RM!A2:V10000",
    });

    const rows = response.data.values || [];

    const filtered = rows
      .filter((row) => {
        if (!tanggal || !row[2]) return false;
        const tglSheet = row[2];
        const [d, m, y] = tglSheet.split("/");
        const isoTgl = `${y}-${m?.padStart(2, "0")}-${d?.padStart(2, "0")}`;
        return isoTgl === tanggal;
      })
      .map((row) => ({
        id: row[0] || "",
        hari: row[1] || "",
        tanggal: row[2] || "",
        jam: row[3] || "",
        bagian: row[4] || "",
        pengorder: row[5] || "",
        line: row[6] || "",
        produk: row[7] || "",
        alt_adonan_putih: row[8] || "",
        bon_adonan_putih: row[9] || "",
        alt_adonan_pita: row[10] || "",
        bon_adonan_pita: row[11] || "",
        alt_cream: row[12] || "",
        bon_cream: row[13] || "",
        alt_adonan: row[14] || "",
        bon_adonan: row[15] || "",
        alt_cream_spreading: row[16] || "",
        bon_cream_spreading: row[17] || "",
        alt_cream_coating: row[18] || "",
        bon_cream_coating: row[19] || "",
        tujuan: row[20] || "",
        keterangan: row[21] || "",
      }));

    return new Response(JSON.stringify({ success: true, data: filtered }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}