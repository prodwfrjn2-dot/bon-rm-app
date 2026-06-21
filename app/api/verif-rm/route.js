import { getSheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(request) {
  try {
    const sheets = await getSheets();
    const body = await request.json();
    const { id_bon, field, jumlah_kirim, nama_verif, password } = body;

    // Cek password
    const usersRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Users!B2:B1000",
    });
    const passwords = (usersRes.data.values || []).map((row) => row[0]);
    if (!passwords.includes(password)) {
      return new Response(
        JSON.stringify({ success: false, error: "Password salah!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!jumlah_kirim || Number(jumlah_kirim) <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Jumlah kirim tidak valid!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cek total sudah terkirim untuk field ini
    const verifRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Verif_RM!A2:E10000",
    });
    const rows = verifRes.data.values || [];
    const existingRows = rows.filter((row) => row[0] === id_bon && row[1] === field);
    const totalSudahKirim = existingRows.reduce((sum, row) => sum + Number(row[2] || 0), 0);

    // Waktu Indonesia (WIB = UTC+7)
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibTime = new Date(now.getTime() + wibOffset);
    const jam_verif = wibTime.toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .slice(0, 19)
      .split(" ")
      .map((part, i) => {
        if (i === 0) {
          const [y, m, d] = part.split("-");
          return `${d}/${m}/${y}`;
        }
        return part;
      })
      .join(", ");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Verif_RM!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id_bon, field, Number(jumlah_kirim), nama_verif, jam_verif]],
      },
    });

    const totalBaru = totalSudahKirim + Number(jumlah_kirim);

    return new Response(
      JSON.stringify({ success: true, jam_verif, total_kirim: totalBaru }),
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
      range: "Verif_RM!A2:E10000",
    });

    const rows = response.data.values || [];
    const filtered = rows
      .filter((row) => row[0] === id_bon)
      .map((row) => ({
        id_bon: row[0] || "",
        field: row[1] || "",
        jumlah_kirim: row[2] || "",
        nama_verif: row[3] || "",
        jam_verif: row[4] || "",
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