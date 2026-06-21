import { getSheets, SHEET_ID } from "@/lib/googleSheets";

export async function POST(request) {
  try {
    const sheets = await getSheets();
    const body = await request.json();
    const { id_bon, nama_verif, password } = body;

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

    // Cek sudah diverif belum
    const verifRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Verif_RM!A2:C10000",
    });
    const rows = verifRes.data.values || [];
    const sudahVerif = rows.find((row) => row[0] === id_bon);
    if (sudahVerif) {
      return new Response(
        JSON.stringify({ success: false, error: "BON ini sudah diverifikasi!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const jam_verif = new Date().toLocaleString("id-ID");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Verif_RM!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id_bon, nama_verif, jam_verif]],
      },
    });

    return new Response(
      JSON.stringify({ success: true, jam_verif }),
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
      range: "Verif_RM!A2:C10000",
    });

    const rows = response.data.values || [];
    const found = rows.find((row) => row[0] === id_bon);

    return new Response(
      JSON.stringify({
        success: true,
        sudah_verif: !!found,
        nama_verif: found?.[1] || "",
        jam_verif: found?.[2] || "",
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