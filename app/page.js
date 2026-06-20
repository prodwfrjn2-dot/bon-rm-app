"use client";
import { useState, useEffect } from "react";

const SUPERSTAR_SKU = ["WF001"]; // ganti dengan SKU produk Superstar yang sebenarnya

export default function Home() {
  const [bagian, setBagian] = useState("");
  const [produkList, setProdukList] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState("");
  const [selectedProdukNama, setSelectedProdukNama] = useState("");
  const [pengorder, setPengorder] = useState("");
  const [line, setLine] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");

  // Wafer Stick fields
  const [altAdonanPutih, setAltAdonanPutih] = useState("");
  const [bonAdonanPutih, setBonAdonanPutih] = useState("");
  const [altAdonanPita, setAltAdonanPita] = useState("");
  const [bonAdonanPita, setBonAdonanPita] = useState("");
  const [altCream, setAltCream] = useState("");
  const [bonCream, setBonCream] = useState("");

  // Wafer Flat fields
  const [altAdonan, setAltAdonan] = useState("");
  const [bonAdonan, setBonAdonan] = useState("");
  const [altCreamSpreading, setAltCreamSpreading] = useState("");
  const [bonCreamSpreading, setBonCreamSpreading] = useState("");
  const [altCreamCoating, setAltCreamCoating] = useState("");
  const [bonCreamCoating, setBonCreamCoating] = useState("");

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [history, setHistory] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [filterBagian, setFilterBagian] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isWaferStick = bagian === "Wafer Stick";
  const isWaferFlat = bagian === "Wafer Flat";
  const isSuperstar = selectedProduk.toUpperCase().includes("SUPERSTAR");

  useEffect(() => {
    if (!bagian) { setProdukList([]); setSelectedProduk(""); return; }
    fetch(`/api/produk-rm?bagian=${encodeURIComponent(bagian)}`)
  .then((r) => r.json())
  .then((d) => { setProdukList(d.data || []); setSelectedProduk(""); });

  useEffect(() => {
    fetchHistory(filterTanggal);
  }, [filterTanggal]);

  const fetchHistory = async (tanggal) => {
    setLoadingHistory(true);
    const res = await fetch(`/api/history-rm?tanggal=${tanggal}`);
    const data = await res.json();
    setHistory(data.data || []);
    setLoadingHistory(false);
  };

  const generateId = () => {
    const now = new Date();
    const tgl = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const prefix = bagian === "Wafer Stick" ? "WS" : "WF";
    return `${prefix}${tgl}-${rand}`;
  };

  const getHari = () => {
    const hari = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
    return hari[new Date().getDay()];
  };

  const resetForm = () => {
    setBagian(""); setSelectedProduk(""); setSelectedProdukNama("");
    setPengorder(""); setLine(""); setTujuan(""); setKeterangan("");
    setAltAdonanPutih(""); setBonAdonanPutih("");
    setAltAdonanPita(""); setBonAdonanPita("");
    setAltCream(""); setBonCream("");
    setAltAdonan(""); setBonAdonan("");
    setAltCreamSpreading(""); setBonCreamSpreading("");
    setAltCreamCoating(""); setBonCreamCoating("");
  };

  const handleSubmit = async () => {
    if (!bagian || !selectedProduk || !pengorder || !line || !tujuan) {
      setPesan("⚠️ Lengkapi semua field wajib!");
      return;
    }
    const now = new Date();
    setLoading(true); setPesan("");
    const res = await fetch("/api/bon-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: generateId(),
        hari: getHari(),
        tanggal: now.toLocaleDateString("id-ID"),
        jam: now.toLocaleTimeString("id-ID"),
        bagian, pengorder, line,
        produk: selectedProdukNama,
        alt_adonan_putih: altAdonanPutih,
        bon_adonan_putih: bonAdonanPutih,
        alt_adonan_pita: altAdonanPita,
        bon_adonan_pita: bonAdonanPita,
        alt_cream: altCream,
        bon_cream: bonCream,
        alt_adonan: altAdonan,
        bon_adonan: bonAdonan,
        alt_cream_spreading: altCreamSpreading,
        bon_cream_spreading: bonCreamSpreading,
        alt_cream_coating: altCreamCoating,
        bon_cream_coating: bonCreamCoating,
        tujuan, keterangan,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setPesan("✅ BON RM berhasil disimpan!");
      resetForm();
      fetchHistory(filterTanggal);
    } else {
      setPesan("❌ Gagal menyimpan: " + data.error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Form BON RM */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
            📦 BON RM WAFER MI JAYANTI 2
          </h1>

          <div className="flex flex-col gap-3 mb-4">
            {/* Bagian */}
            <div>
              <label className="block text-sm font-medium mb-1">Bagian</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={bagian} onChange={(e) => { setBagian(e.target.value); setSelectedProduk(""); }}>
                <option value="">-- Pilih Bagian --</option>
                <option value="Wafer Flat">Wafer Flat</option>
                <option value="Wafer Stick">Wafer Stick</option>
              </select>
            </div>

            {/* Pengorder & Line */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Pengorder</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama pengorder" value={pengorder} onChange={(e) => setPengorder(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Line</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="No. Line" value={line} onChange={(e) => setLine(e.target.value)} />
              </div>
            </div>

            {/* Produk */}
            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedProduk} onChange={(e) => { setSelectedProduk(e.target.value); setSelectedProdukNama(produkList.find((p) => p.sku === e.target.value)?.nama || ""); }} disabled={!bagian}>
                <option value="">{bagian ? "-- Pilih Produk --" : "-- Pilih Bagian Dulu --"}</option>
                {produkList.map((p) => (<option key={p.sku} value={p.sku}>{p.nama}</option>))}
              </select>
            </div>

            {/* Wafer Stick Fields */}
            {isWaferStick && (
              <div className="border rounded-lg p-3 space-y-3 bg-blue-50">
                <p className="text-xs font-semibold text-blue-700">🔵 Wafer Stick</p>
                <div>
                  <label className="block text-xs font-medium mb-1">Adonan Putih</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altAdonanPutih} onChange={(e) => setAltAdonanPutih(e.target.value)} />
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonAdonanPutih} onChange={(e) => setBonAdonanPutih(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Adonan Pita</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altAdonanPita} onChange={(e) => setAltAdonanPita(e.target.value)} />
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonAdonanPita} onChange={(e) => setBonAdonanPita(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Cream</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altCream} onChange={(e) => setAltCream(e.target.value)} />
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonCream} onChange={(e) => setBonCream(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Wafer Flat Fields */}
            {isWaferFlat && (
              <div className="border rounded-lg p-3 space-y-3 bg-green-50">
                <p className="text-xs font-semibold text-green-700">🟢 Wafer Flat</p>
                <div>
                  <label className="block text-xs font-medium mb-1">Adonan</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altAdonan} onChange={(e) => setAltAdonan(e.target.value)} />
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonAdonan} onChange={(e) => setBonAdonan(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Cream Spreading</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altCreamSpreading} onChange={(e) => setAltCreamSpreading(e.target.value)} />
                    <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonCreamSpreading} onChange={(e) => setBonCreamSpreading(e.target.value)} />
                  </div>
                </div>
                {/* Cream Coating hanya untuk Superstar */}
                {isSuperstar && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Cream Coating</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="ALT" value={altCreamCoating} onChange={(e) => setAltCreamCoating(e.target.value)} />
                      <input type="number" className="border rounded-lg px-3 py-2 text-sm" placeholder="BON (batch)" value={bonCreamCoating} onChange={(e) => setBonCreamCoating(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tujuan & Keterangan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tujuan</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={tujuan} onChange={(e) => setTujuan(e.target.value)}>
                  <option value="">-- Pilih Tujuan --</option>
                  <option value="Ekspor">Ekspor</option>
                  <option value="Lokal">Lokal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Keterangan</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Opsional" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
            </div>
          </div>

          {pesan && <div className="mb-3 p-3 rounded-lg bg-blue-50 text-blue-800 font-medium text-sm">{pesan}</div>}
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-base">
            {loading ? "Menyimpan..." : "💾 Simpan BON RM"}
          </button>
        </div>

        {/* History BON RM */}
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg md:text-xl font-bold">📊 History BON RM</h2>
            <div className="flex gap-2 flex-wrap">
              <select className="flex-1 border rounded-lg px-2 py-2 text-sm" value={filterBagian} onChange={(e) => setFilterBagian(e.target.value)}>
                <option value="">Semua Bagian</option>
                <option value="Wafer Flat">Wafer Flat</option>
                <option value="Wafer Stick">Wafer Stick</option>
              </select>
              <input type="date" className="flex-1 border rounded-lg px-2 py-2 text-sm" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
            </div>
          </div>

          {loadingHistory ? (
            <p className="text-center text-gray-400 py-4 text-sm">Memuat data...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">Tidak ada data untuk tanggal ini.</p>
          ) : (
            <div className="space-y-3">
              {history
                .filter((row) => filterBagian === "" || row.bagian === filterBagian)
                .map((row, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium flex justify-between">
                      <span>{row.bagian} · Line {row.line} · {row.pengorder}</span>
                      <span>{row.tanggal} {row.jam}</span>
                    </div>
                    <div className="px-3 py-1 bg-gray-50 text-xs text-gray-600 font-medium">{row.produk}</div>
                    <div className="px-3 py-2 text-xs space-y-1">
                      {/* Wafer Stick */}
                      {row.bagian === "Wafer Stick" && (
                        <>
                          {row.bon_adonan_putih && <div className="flex justify-between"><span>Adonan Putih (ALT {row.alt_adonan_putih})</span><span className="font-bold">{row.bon_adonan_putih} batch</span></div>}
                          {row.bon_adonan_pita && <div className="flex justify-between"><span>Adonan Pita (ALT {row.alt_adonan_pita})</span><span className="font-bold">{row.bon_adonan_pita} batch</span></div>}
                          {row.bon_cream && <div className="flex justify-between"><span>Cream (ALT {row.alt_cream})</span><span className="font-bold">{row.bon_cream} batch</span></div>}
                        </>
                      )}
                      {/* Wafer Flat */}
                      {row.bagian === "Wafer Flat" && (
                        <>
                          {row.bon_adonan && <div className="flex justify-between"><span>Adonan (ALT {row.alt_adonan})</span><span className="font-bold">{row.bon_adonan} batch</span></div>}
                          {row.bon_cream_spreading && <div className="flex justify-between"><span>Cream Spreading (ALT {row.alt_cream_spreading})</span><span className="font-bold">{row.bon_cream_spreading} batch</span></div>}
                          {row.bon_cream_coating && <div className="flex justify-between"><span>Cream Coating (ALT {row.alt_cream_coating})</span><span className="font-bold">{row.bon_cream_coating} batch</span></div>}
                        </>
                      )}
                      <div className="flex justify-between text-gray-500 pt-1 border-t">
                        <span>Tujuan: {row.tujuan}</span>
                        {row.keterangan && <span>Ket: {row.keterangan}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}