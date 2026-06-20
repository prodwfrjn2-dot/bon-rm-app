import { getSheets, SHEET_ID } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    const sheets = await getSheets();
    const { searchParams } = new URL(request.url);
    const bagian = searchParams.get("bagian");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Produk_RM!A2:C100",
    });

    const rows = response.data.values || [];
    let produk = rows.map((row) => ({
      sku: row[0] || "",
      nama: row[1] || "",
      bagian: row[2] || "",
    }));

    if (bagian) {
      produk = produk.filter((p) => p.bagian.trim() === bagian.trim());
    }

    return new Response(JSON.stringify({ success: true, data: produk }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}