"use client";

import { useState } from "react";
import {
  confirmPayment,
  updateBuildStatus,
  publishWebsite,
  saveAdminNotes,
} from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  paymentStatus: string;
  buildStatus: string;
  websiteUrl: string | null;
  adminNotes: string | null;
}

export default function AdminOrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newBuildStatus, setNewBuildStatus] = useState(order.buildStatus);
  const [newWebsiteUrl, setNewWebsiteUrl] = useState(order.websiteUrl || "");
  const [notes, setNotes] = useState(order.adminNotes || "");

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await confirmPayment(order.id);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Terjadi kesalahan");
      return;
    }

    setSuccess("Pembayaran berhasil dikonfirmasi!");
    router.refresh();
  };

  const handleUpdateBuildStatus = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateBuildStatus(order.id, newBuildStatus);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Terjadi kesalahan");
      return;
    }

    setSuccess("Build status berhasil diupdate!");
    router.refresh();
  };

  const handlePublishWebsite = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await publishWebsite(order.id, newWebsiteUrl);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Terjadi kesalahan");
      return;
    }

    setSuccess("Website berhasil dipublish!");
    router.refresh();
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await saveAdminNotes(order.id, notes);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Terjadi kesalahan");
      return;
    }

    setSuccess("Catatan berhasil disimpan!");
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Actions</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Payment Confirmation */}
      {order.paymentStatus === "claimed" && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Konfirmasi Pembayaran
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Client sudah mengupload bukti pembayaran. Review bukti di atas,
            kemudian konfirmasi.
          </p>
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
          </button>
        </div>
      )}

      {/* Build Status Update */}
      {order.paymentStatus === "paid" && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Update Build Status
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Baru
              </label>
              <select
                value={newBuildStatus}
                onChange={(e) => setNewBuildStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="designing">Designing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <button
              onClick={handleUpdateBuildStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      )}

      {/* Publish Website */}
      {order.buildStatus === "done" && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Publish Website
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Masukkan URL website yang sudah dibuild (misal:
            https://klinik-sehat.nakespro.id)
          </p>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={newWebsiteUrl}
                onChange={(e) => setNewWebsiteUrl(e.target.value)}
                placeholder="https://nama.nakespro.id"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handlePublishWebsite}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish & Set Live"}
            </button>
          </div>
        </div>
      )}

      {/* Admin Notes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Admin Notes
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan internal untuk order ini..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        <button
          onClick={handleSaveNotes}
          disabled={loading}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan Catatan"}
        </button>
      </div>
    </div>
  );
}
