"use client";

import { useState } from "react";
import { createReport } from "@/app/actions/reports";
import { useRouter } from "next/navigation";
import { Plus, Trash2, FileText } from "lucide-react";

interface ReportItem {
  name: string;
  qty: number;
  price: number;
}

export default function LaporanFormClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [patientName, setPatientName] = useState("");
  const [patientWaNumber, setPatientWaNumber] = useState("");
  const [actionDate, setActionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [actionType, setActionType] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [items, setItems] = useState<ReportItem[]>([
    { name: "", qty: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");

  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlanning, setSoapPlanning] = useState("");

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const updateItem = (index: number, field: keyof ReportItem, value: string | number) => {
    const updated = [...items];
    if (field === "name") {
      updated[index] = { ...updated[index], name: value as string };
    } else if (field === "qty") {
      updated[index] = { ...updated[index], qty: Math.max(1, Number(value) || 1) };
    } else if (field === "price") {
      updated[index] = { ...updated[index], price: Math.max(0, Number(value) || 0) };
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!patientName.trim() || patientName.trim().length < 2) {
      return "Nama pasien minimal 2 karakter";
    }
    if (!/^628\d{9,12}$/.test(patientWaNumber)) {
      return "Format nomor WA harus 628xxx (9-12 digit)";
    }
    if (!actionDate) {
      return "Tanggal tindakan wajib diisi";
    }
    if (!actionType.trim()) {
      return "Jenis tindakan wajib diisi";
    }
    if (items.some((item) => !item.name.trim())) {
      return "Semua item harus memiliki nama";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Filter item yang valid (punya nama)
    const validItems = items.filter((item) => item.name.trim());

    if (validItems.length === 0) {
      setError("Minimal 1 item biaya");
      return;
    }

    setLoading(true);

    try {
      const result = await createReport({
        patientName: patientName.trim(),
        patientWaNumber,
        actionDate,
        actionType: actionType.trim(),
        actionDescription: actionDescription.trim() || undefined,
        items: validItems,
        notes: notes.trim() || undefined,
        soapSubjective: soapSubjective.trim() || undefined,
        soapObjective: soapObjective.trim() || undefined,
        soapAssessment: soapAssessment.trim() || undefined,
        soapPlanning: soapPlanning.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error || "Terjadi kesalahan");
        setLoading(false);
        return;
      }

      router.push("/dashboard/laporan");
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
      setLoading(false);
    }
  };

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Data Pasien */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">
          Data Pasien
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Nama Pasien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Nomor WhatsApp Pasien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={patientWaNumber}
              onChange={(e) => setPatientWaNumber(e.target.value)}
              placeholder="628123456789"
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Format: 628xxx (tanpa tanda + atau 0)
            </p>
          </div>
        </div>
      </div>

      {/* Detail Tindakan */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">
          Detail Tindakan
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Tanggal Tindakan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
                Jenis Tindakan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                placeholder="Contoh: Konsultasi, Pemeriksaan Fisik"
                className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                maxLength={100}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5">
              Deskripsi / Keterangan
            </label>
            <textarea
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              placeholder="Opsional — deskripsi tindakan yang dilakukan..."
              rows={3}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              {actionDescription.length}/1000 karakter
            </p>
          </div>
        </div>
      </div>

      {/* Laporan SOAP */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-5 border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
              Laporan SOAP
              <span className="text-xs font-normal text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">Opsional</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Dokumentasi rekam medis pasien terstruktur</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subjektif */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">S</span>
              Subjektif (S)
            </label>
            <textarea
              value={soapSubjective}
              onChange={(e) => setSoapSubjective(e.target.value)}
              placeholder="Keluhan utama pasien, keluhan penyerta, riwayat penyakit sekarang..."
              rows={4}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-neutral-400">Anamnesis & Keluhan</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {soapSubjective.length}/2000
              </span>
            </div>
          </div>

          {/* Objektif */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">O</span>
              Objektif (O)
            </label>
            <textarea
              value={soapObjective}
              onChange={(e) => setSoapObjective(e.target.value)}
              placeholder="Hasil pemeriksaan fisik, tanda-tanda vital (tensi, nadi, suhu), laboratorium, radiologi..."
              rows={4}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-neutral-400">Pemeriksaan Fisik & Klinis</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {soapObjective.length}/2000
              </span>
            </div>
          </div>

          {/* Assessment */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">A</span>
              Asesmen / Diagnosis (A)
            </label>
            <textarea
              value={soapAssessment}
              onChange={(e) => setSoapAssessment(e.target.value)}
              placeholder="Diagnosis utama (kerja), diagnosis sekunder/banding, kesimpulan pemeriksaan..."
              rows={4}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-neutral-400">Diagnosis & Analisis</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {soapAssessment.length}/2000
              </span>
            </div>
          </div>

          {/* Planning */}
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">P</span>
              Perencanaan / Planning (P)
            </label>
            <textarea
              value={soapPlanning}
              onChange={(e) => setSoapPlanning(e.target.value)}
              placeholder="Terapi, resep obat, tindakan medis lanjutan, edukasi pasien, rujukan..."
              rows={4}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-neutral-400">Tindakan & Rencana Lanjut</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {soapPlanning.length}/2000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rincian Biaya (Line Items) */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">
          Rincian Biaya
        </h2>

        {/* Items */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end"
            >
              {/* Nama Item */}
              <div className="col-span-12 sm:col-span-5">
                {index === 0 && (
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Nama Item
                  </label>
                )}
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Contoh: Konsultasi Umum"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                  maxLength={100}
                />
              </div>
              {/* Qty */}
              <div className="col-span-4 sm:col-span-2">
                {index === 0 && (
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Qty
                  </label>
                )}
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateItem(index, "qty", e.target.value)}
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm text-center"
                />
              </div>
              {/* Harga */}
              <div className="col-span-4 sm:col-span-3">
                {index === 0 && (
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Harga (Rp)
                  </label>
                )}
                <input
                  type="number"
                  min={0}
                  value={item.price || ""}
                  onChange={(e) => updateItem(index, "price", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
                />
              </div>
              {/* Subtotal + Hapus */}
              <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
                <span className="flex-1 text-sm font-medium text-neutral-700 truncate">
                  {item.name && item.price > 0
                    ? rupiah(item.qty * item.price)
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Hapus item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-dashed border-neutral-300 rounded-xl text-sm font-medium text-neutral-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <Plus size={16} />
          Tambah Item
        </button>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-500">Total Biaya</span>
          <span className="text-2xl font-bold text-neutral-900">
            {rupiah(totalAmount)}
          </span>
        </div>
      </div>

      {/* Catatan */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">
          Catatan Tambahan
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opsional — catatan untuk pasien, instruksi pembayaran, dll..."
          rows={3}
          className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-neutral-500 mt-1.5">
          {notes.length}/1000 karakter
        </p>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              <FileText size={18} />
              Buat Laporan & Invoice
            </>
          )}
        </button>
      </div>
    </form>
  );
}
