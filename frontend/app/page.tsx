"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import DataTable from "@/components/DataTable";

// This describes the shape of data coming back from your FastAPI
type DatasetResponse = {
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  dtypes: Record<string, string>;
  rows: Record<string, unknown>[];
};

export default function Home() {
  const [dataset, setDataset] = useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setDataset(data);
    } catch (err) {
      setError("Could not process file. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ARCX InsightX</h1>
          <p className="text-gray-500 mt-1">
            Upload a CSV or XLSX file to begin analysis
          </p>
        </div>

        {/* Upload area — always visible */}
        <UploadZone onUpload={handleUpload} loading={loading} />

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Dataset info + table — only visible after upload */}
        {dataset && (
          <div className="mt-8">
            <div className="mb-4 flex gap-6 text-sm text-gray-600">
              <span>📄 {dataset.filename}</span>
              <span>🔢 {dataset.row_count.toLocaleString()} rows</span>
              <span>📊 {dataset.column_count} columns</span>
            </div>
            <DataTable columns={dataset.columns} rows={dataset.rows} />
          </div>
        )}

      </div>
    </main>
  );
}