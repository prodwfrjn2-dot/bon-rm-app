"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [bagian, setBagian] = useState("");
  const [produkList, setProdukList] = useState([]);
  const [selectedProduk, setSelectedProduk] = useState("");
  const [pengorder, setPengorder] = useState("");
  const [line, setLine] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [altAdonanPutih, setAltAdonanPutih] = useState("");
  const [bonAdonanPutih, setBonAdonanPutih] = useState("");
  const [altAdonanPita, setAltAdonanPita] = useState("");
  const [bonAdonanPita, setBonAdonanPita] = useState("");
  const [altCream, setAltCream] = useState("");
  const [bonCream, setBonCream] = useState("");
  const [altAdonan, setAltAdonan] = useState("");
  const [bonAdonan, setBonAdonan] = useState("");
  const [altCreamSpreading, setAltCreamSpreading] = useState("");
  const [bonCreamSpreading, setBonCreamSpreading] = useState("");
  const [altCreamCoating, setAltCreamCoating] = useState("");
  const [bonCreamCoating, setBonCreamCoating] = useState("");

  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");
  const [history, setHistory] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [filterBagian, setFilterBagian] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modal Revisi
  const [modalRevisi, setModalRevisi] = useState(null);
  const [revisiField, setRevisiField] = useState("");
  const [revisiNilaiLama, setRevisiNilaiLama] = useState("");
  const [revisiNilaiBaru, setRevisiNilaiBaru] = useState("");
  const [revisiNama, setRevisiNama] = useState("");
  const [revisiPassword, setRevisiPassword] = useState("");
  const [revisiLoading, setRevisiLoading] = useState(false);
  const [revisiPesan, setRevisiPesan] = useState("");
  const [riwayatRevisi, setRiwayatRevisi] = useState({});

  // Modal Verifikasi
  const [modalVerif, setModalVerif] = useState(null);
  const [verifNama, setVerifNama] = useState("");
  const [verifPassword, setVerifPassword] = useState("");
  const [verifLoading, setVerifLoading] = useState(false);
  const [verifPesan, setVerifPesan] = useState("");
  const [statusVerif, setStatusVerif] = useState({});

  const isWaferStick = bagian === "Wafer Stick";
  const isWaferFlat = bagian === "Wafer Flat";
  const isSuperstar = selectedProduk.toUpperCase().includes("SUPERSTAR");

  useEffect(() => {
    if (!bagian) { setProdukList([]); setSelectedProduk(""); return; }
    fetch(`/api/produk-rm?bagian=${encodeURIComponent(bagian)}`)
      .then((r) => r.json())
      .then((d) => { setProdukList(d.data || []); setSelectedProduk(""); });
  }, [bagian]);

  useEffect(() => {
    fetchHistory(filterTanggal);
  }, [filterTanggal]);

  const fetchHistory = async (tanggal) => {
    setLoadingHistory(true);
    const res = await fetch(`/api/history-rm?tanggal=${tanggal}`);
    const data = await res.json();
    const rows = data.data || [];
    setHistory(rows);
    setLoadingHistory(false);
    rows.forEach((row) => {
      fetchStatusVerif(row.id);
    });
  };

  const fetchStatusVerif = async (id_bon) => {
    const res = await fetch(`/api/verif-rm?id_bon=${id_bon}`);
    const data = await res.json();
    setStatusVerif((prev) => ({ ...prev, [id_bon]: data }));
  };

  const fetchRiwayatRevisi = async (id_bon) => {
    const res = await fetch(`/api/revisi-rm?id_bon=${id_bon}`);
    const data = await res.json();
    setRiwayatRevisi((prev) => ({ ...prev, [id_bon]: data.data || [] }));
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
    setBagian(""); setSelectedProduk("");
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
      setPesan("⚠️ Lengkapi semua field wajib!"); return;
    }
    const now = new Date();
    setLoading(true); setPesan("");
    const res = await fetch("/api/bon-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: generateId(), hari: getHari(),
        tanggal: now.toLocaleDateString("id-ID"),
        jam: now.toLocaleTimeString("id-ID"),
        bagian, pengorder, line, produk: selectedProduk,
        alt_adonan_putih: altAdonanPutih, bon_adonan_putih: bonAdonanPutih,
        alt_adonan_pita: altAdonanPita, bon_adonan_pita: bonAdonanPita,
        alt_cream: altCream, bon_cream: bonCream,
        alt_adonan: altAdonan, bon_adonan: bonAdonan,
        alt_cream_spreading: altCreamSpreading, bon_cream_spreading: bonCreamSpreading,
        alt_cream_coating: altCreamCoating, bon_cream_coating: bonCreamCoating,
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

  const getFieldLabel = (field) => {
    const labels = {
      alt_adonan_putih: "ALT Adonan Putih", bon_adonan_putih: "BON Adonan Putih",
      alt_adonan_pita: "ALT Adonan Pita", bon_adonan_pita: "BON Adonan Pita",
      alt_cream: "ALT Cream", bon_cream: "BON Cream",
      alt_adonan: "ALT Adonan", bon_adonan: "BON Adonan",
      alt_cream_spreading: "ALT Cream Spreading", bon_cream_spreading: "BON Cream Spreading",
      alt_cream_coating: "ALT Cream Coating", bon_cream_coating: "BON Cream Coating",
    };
    return labels[field] || field;
  };

  const handleOpenRevisi = (row) => {
    setModalRevisi(row);
    setRevisiField("");
    setRevisiNilaiLama("");
    setRevisiNilaiBaru("");
    setRevisiNama("");
    setRevisiPassword("");
    setRevisiPesan("");
    fetchRiwayatRevisi(row.id);
  };

  const handleRevisiFieldChange = (field) => {
    setRevisiField(field);
    const fieldMap = {
      alt_adonan_putih: modalRevisi.alt_adonan_putih,
      bon_adonan_putih: modalRevisi.bon_adonan_putih,
      alt_adonan_pita: modalRevisi.alt_adonan_pita,
      bon_adonan_pita: modalRevisi.bon_adonan_pita,
      alt_cream: modalRevisi.alt_cream,
      bon_cream: modalRevisi.bon_cream,
      alt_adonan: modalRevisi.alt_adonan,
      bon_adonan: modalRevisi.bon_adonan,
      alt_cream_spreading: modalRevisi.alt_cream_spreading,
      bon_cream_spreading: modalRevisi.bon_cream_spreading,
      alt_cream_coating: modalRevisi.alt_cream_coating,
      bon_cream_coating: modalRevisi.bon_cream_coating,
    };
    setRevisiNilaiLama(fieldMap[field] || "");
    setRevisiNilaiBaru("");
  };

  const handleRevisi = async () => {
    if (!revisiField) { setRevisiPesan("⚠️ Pilih field yang ingin direvisi!"); return; }
    if (!revisiNilaiBaru) { setRevisiPesan("⚠️ Masukkan nilai baru!"); return; }
    if (!revisiNama.trim()) { setRevisiPesan("⚠️ Nama editor wajib diisi!"); return; }
    if (!revisiPassword) { setRevisiPesan("⚠️ Password wajib diisi!"); return; }
    setRevisiLoading(true); setRevisiPesan("");
    const res = await fetch("/api/revisi-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_bon: modalRevisi.id,
        field: revisiField,
        nilai_lama: revisiNilaiLama,
        nilai_baru: revisiNilaiBaru,
        nama_editor: revisiNama,
        password: revisiPassword,
      }),
    });
    const data = await res.json();
    setRevisiLoading(false);
    if (data.success) {
      setRevisiPesan(`✅ Berhasil direvisi pada ${data.waktu}`);
      fetchRiwayatRevisi(modalRevisi.id);
      fetchHistory(filterTanggal);
      setTimeout(() => { setModalRevisi(null); }, 1500);
    } else {
      setRevisiPesan("❌ " + data.error);
    }
  };

  const handleOpenVerif = (row) => {
    setModalVerif(row);
    setVerifNama("");
    setVerifPassword("");
    setVerifPesan("");
  };

  const handleVerif = async () => {
    if (!verifNama.trim()) { setVerifPesan("⚠️ Nama wajib diisi!"); return; }
    if (!verifPassword) { setVerifPesan("⚠️ Password wajib diisi!"); return; }
    setVerifLoading(true); setVerifPesan("");
    const res = await fetch("/api/verif-rm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_bon: modalVerif.id,
        nama_verif: verifNama,
        password: verifPassword,
      }),
    });
    const data = await res.json();
    setVerifLoading(false);
    if (data.success) {
      setVerifPesan(`✅ Terverifikasi pada ${data.jam_verif}`);
      fetchStatusVerif(modalVerif.id);
      setTimeout(() => { setModalVerif(null); setVerifNama(""); setVerifPassword(""); setVerifPesan(""); }, 1500);
    } else {
      setVerifPesan("❌ " + data.error);
    }
  };

  const getRevisiFields = (bagian, produk) => {
    const isStick = bagian === "Wafer Stick";
    const isFlat = bagian === "Wafer Flat";
    const isSuperstarProduk = produk?.toUpperCase().includes("SUPERSTAR");
    if (isStick) return [
      { value: "alt_adonan_putih", label: "ALT Adonan Putih" },
      { value: "bon_adonan_putih", label: "BON Adonan Putih" },
      { value: "alt_adonan_pita", label: "ALT Adonan Pita" },
      { value: "bon_adonan_pita", label: "BON Adonan Pita" },
      { value: "alt_cream", label: "ALT Cream" },
      { value: "bon_cream", label: "BON Cream" },
    ];
    if (isFlat) {
      const fields = [
        { value: "alt_adonan", label: "ALT Adonan" },
        { value: "bon_adonan", label: "BON Adonan" },
        { value: "alt_cream_spreading", label: "ALT Cream Spreading" },
        { value: "bon_cream_spreading", label: "BON Cream Spreading" },
      ];
      if (isSuperstarProduk) {
        fields.push({ value: "alt_cream_coating", label: "ALT Cream Coating" });
        fields.push({ value: "bon_cream_coating", label: "BON Cream Coating" });
      }
      return fields;
    }
    return [];
  };

  const handleDownloadPDF = () => {
    const filtered = history.filter((row) => filterBagian === "" || row.bagian === filterBagian);
    const tanggalFormatted = new Date(filterTanggal).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });

    let html = `
      <html><head><title>BON RM ${tanggalFormatted}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
        h2 { font-size: 14px; margin-bottom: 4px; }
        .subtitle { color: #666; margin-bottom: 16px; font-size: 11px; }
        .group { margin-bottom: 16px; page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden; }
        .group-header { background: #1d4ed8; color: white; padding: 6px 10px; font-weight: bold; display: flex; justify-content: space-between; }
        .produk { background: #f3f4f6; padding: 4px 10px; font-size: 10px; color: #444; }
        .row { display: flex; justify-content: space-between; padding: 3px 10px; border-bottom: 1px solid #f3f4f6; }
        .footer { padding: 4px 10px; color: #666; font-size: 10px; background: #f9fafb; }
        .verif { padding: 4px 10px; color: #16a34a; font-size: 10px; background: #f0fdf4; }
      </style></head><body>
      <h2>📦 Laporan BON RM - ${tanggalFormatted}</h2>
      <div class="subtitle">Dicetak pada: ${new Date().toLocaleString("id-ID")}</div>
    `;

    filtered.forEach((row) => {
      const verif = statusVerif[row.id];
      html += `
        <div class="group">
          <div class="group-header">
            <span>${row.bagian} · Line ${row.line} · ${row.pengorder}</span>
            <span>${row.tanggal} ${row.jam}</span>
          </div>
          <div class="produk">${row.produk} · ID: ${row.id}</div>
      `;
      if (row.bagian === "Wafer Stick") {
        if (row.bon_adonan_putih) html += `<div class="row"><span>Adonan Putih (ALT ${row.alt_adonan_putih})</span><span>${row.bon_adonan_putih} batch</span></div>`;
        if (row.bon_adonan_pita) html += `<div class="row"><span>Adonan Pita (ALT ${row.alt_adonan_pita})</span><span>${row.bon_adonan_pita} batch</span></div>`;
        if (row.bon_cream) html += `<div class="row"><span>Cream (ALT ${row.alt_cream})</span><span>${row.bon_cream} batch</span></div>`;
      }
      if (row.bagian === "Wafer Flat") {
        if (row.bon_adonan) html += `<div class="row"><span>Adonan (ALT ${row.alt_adonan})</span><span>${row.bon_adonan} batch</span></div>`;
        if (row.bon_cream_spreading) html += `<div class="row"><span>Cream Spreading (ALT ${row.alt_cream_spreading})</span><span>${row.bon_cream_spreading} batch</span></div>`;
        if (row.bon_cream_coating) html += `<div class="row"><span>Cream Coating (ALT ${row.alt_cream_coating})</span><span>${row.bon_cream_coating} batch</span></div>`;
      }
      html += `<div class="footer">Tujuan: ${row.tujuan}${row.keterangan ? " · Ket: " + row.keterangan : ""}</div>`;
      if (verif?.sudah_verif) {
        html += `<div class="verif">✓ Terverifikasi oleh ${verif.nama_verif} pada ${verif.jam_verif}</div>`;
      }
      html += `</div>`;
    });

    html += `</body></html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const handleDownloadExcel = () => {
    const filtered = history.filter((row) => filterBagian === "" || row.bagian === filterBagian);
    const headers = [
      "ID", "HARI", "TANGGAL", "JAM", "BAGIAN", "PENGORDER", "LINE", "PRODUK",
      "ALT ADONAN PUTIH", "BON ADONAN PUTIH", "ALT ADONAN PITA", "BON ADONAN PITA",
      "ALT CREAM", "BON CREAM", "ALT ADONAN", "BON ADONAN",
      "ALT CREAM SPREADING", "BON CREAM SPREADING", "ALT CREAM COATING", "BON CREAM COATING",
      "TUJUAN", "KETERANGAN", "STATUS VERIF", "NAMA VERIF", "JAM VERIF"
    ];

    const rows = filtered.map((row) => {
      const verif = statusVerif[row.id];
      return [
        row.id, row.hari, row.tanggal, row.jam, row.bagian, row.pengorder, row.line, row.produk,
        row.alt_adonan_putih, row.bon_adonan_putih,
        row.alt_adonan_pita, row.bon_adonan_pita,
        row.alt_cream, row.bon_cream,
        row.alt_adonan, row.bon_adonan,
        row.alt_cream_spreading, row.bon_cream_spreading,
        row.alt_cream_coating, row.bon_cream_coating,
        row.tujuan, row.keterangan,
        verif?.sudah_verif ? "Sudah" : "Belum",
        verif?.nama_verif || "",
        verif?.jam_verif || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BON_RM_${filterTanggal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <div>
              <label className="block text-sm font-medium mb-1">Bagian</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={bagian} onChange={(e) => { setBagian(e.target.value); setSelectedProduk(""); }}>
                <option value="">-- Pilih Bagian --</option>
                <option value="Wafer Flat">Wafer Flat</option>
                <option value="Wafer Stick">Wafer Stick</option>
              </select>
            </div>
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
            <div>
              <label className="block text-sm font-medium mb-1">Produk</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedProduk} onChange={(e) => setSelectedProduk(e.target.value)} disabled={!bagian}>
                <option value="">{bagian ? "-- Pilih Produk --" : "-- Pilih Bagian Dulu --"}</option>
                {produkList.map((p, i) => (<option key={i} value={p.nama}>{p.nama}</option>))}
              </select>
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tujuan</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={tujuan} onChange={(e) => setTujuan(e.target.value)}>
                  <option value="">-- Pilih Tujuan --</option>
                  <option value="Lokal">Lokal</option>
                  <option value="Ekspor">Ekspor</option>
                  <option value="Lokal Ekspor">Lokal Ekspor</option>
                  <option value="Thailand">Thailand</option>
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
              {history.length > 0 && (
                <>
                  <button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-3 py-2 rounded-lg whitespace-nowrap">📄 PDF</button>
                  <button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-3 py-2 rounded-lg whitespace-nowrap">📊 Excel</button>
                </>
              )}
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
                .map((row, i) => {
                  const verif = statusVerif[row.id];
                  return (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium flex justify-between">
                        <span>{row.bagian} · Line {row.line} · {row.pengorder}</span>
                        <span>{row.tanggal} {row.jam}</span>
                      </div>
                      <div className="px-3 py-1 bg-gray-50 text-xs text-gray-500">{row.id}</div>
                      <div className="px-3 py-1 bg-gray-50 text-xs text-gray-600 font-medium">{row.produk}</div>
                      <div className="px-3 py-2 text-xs space-y-1">
                        {row.bagian === "Wafer Stick" && (
                          <>
                            {row.bon_adonan_putih && <div className="flex justify-between"><span>Adonan Putih (ALT {row.alt_adonan_putih})</span><span className="font-bold">{row.bon_adonan_putih} batch</span></div>}
                            {row.bon_adonan_pita && <div className="flex justify-between"><span>Adonan Pita (ALT {row.alt_adonan_pita})</span><span className="font-bold">{row.bon_adonan_pita} batch</span></div>}
                            {row.bon_cream && <div className="flex justify-between"><span>Cream (ALT {row.alt_cream})</span><span className="font-bold">{row.bon_cream} batch</span></div>}
                          </>
                        )}
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

                      {/* Tombol Revisi & Verifikasi */}
                      <div className="px-3 py-2 bg-gray-50 border-t flex gap-2">
                        <button onClick={() => handleOpenRevisi(row)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-2 rounded-lg">✏️ Revisi</button>
                        {verif?.sudah_verif ? (
                          <div className="flex-1 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                            ✅ <span className="font-semibold">{verif.nama_verif}</span>
                            <br /><span className="text-gray-400">{verif.jam_verif}</span>
                          </div>
                        ) : (
                          <button onClick={() => handleOpenVerif(row)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg">✅ Verifikasi</button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Revisi */}
      {modalRevisi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-1">✏️ Revisi BON RM</h3>
            <p className="text-xs text-gray-500 mb-4">ID: {modalRevisi.id} · {modalRevisi.produk}</p>

            {(riwayatRevisi[modalRevisi.id] || []).length > 0 && (
              <div className="mb-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Riwayat Revisi:</p>
                <div className="space-y-1">
                  {(riwayatRevisi[modalRevisi.id] || []).map((r, i) => (
                    <div key={i} className="text-xs text-gray-600">
                      <span className="font-medium">{getFieldLabel(r.field)}</span>: {r.nilai_lama} → {r.nilai_baru} — {r.nama_editor}
                      <span className="text-gray-400 ml-1">{r.waktu}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Field yang direvisi</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={revisiField} onChange={(e) => handleRevisiFieldChange(e.target.value)}>
                  <option value="">-- Pilih Field --</option>
                  {getRevisiFields(modalRevisi.bagian, modalRevisi.produk).map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              {revisiField && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nilai Lama</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" value={revisiNilaiLama} readOnly />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Nilai Baru</label>
                <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Masukkan nilai baru" value={revisiNilaiBaru} onChange={(e) => setRevisiNilaiBaru(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Editor</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama lengkap" value={revisiNama} onChange={(e) => setRevisiNama(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" value={revisiPassword} onChange={(e) => setRevisiPassword(e.target.value)} />
              </div>
            </div>

            {revisiPesan && <div className="mb-3 p-2 rounded-lg bg-blue-50 text-blue-800 text-sm">{revisiPesan}</div>}
            <div className="flex gap-2">
              <button onClick={() => setModalRevisi(null)} className="flex-1 border rounded-xl py-2 text-sm text-gray-600">Batal</button>
              <button onClick={handleRevisi} disabled={revisiLoading} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl py-2 text-sm">
                {revisiLoading ? "Menyimpan..." : "✏️ Simpan Revisi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Verifikasi */}
      {modalVerif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-1">✅ Verifikasi Pengiriman</h3>
            <p className="text-xs text-gray-500 mb-1">ID: {modalVerif.id}</p>
            <p className="text-sm font-medium mb-4">{modalVerif.produk}</p>
            <div className="space-y-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nama lengkap" value={verifNama} onChange={(e) => setVerifNama(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Password" value={verifPassword} onChange={(e) => setVerifPassword(e.target.value)} />
              </div>
            </div>
            {verifPesan && <div className="mb-3 p-2 rounded-lg bg-blue-50 text-blue-800 text-sm">{verifPesan}</div>}
            <div className="flex gap-2">
              <button onClick={() => { setModalVerif(null); setVerifNama(""); setVerifPassword(""); setVerifPesan(""); }} className="flex-1 border rounded-xl py-2 text-sm text-gray-600">Batal</button>
              <button onClick={handleVerif} disabled={verifLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-2 text-sm">
                {verifLoading ? "Menyimpan..." : "✅ Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}