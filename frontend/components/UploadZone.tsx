"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onUpload: (file: File) => void;
  loading: boolean;
};

export default function UploadZone({ onUpload, loading }: Props) {
  // useRef lets us trigger the hidden file input programmatically
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center
                 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      {/* Hidden file input — triggered by clicking the div */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading ? (
        <div className="text-blue-600 font-medium animate-pulse">
          Processing your file...
        </div>
      ) : (
        <>
          <div className="text-4xl mb-3">📂</div>
          <p className="text-gray-700 font-medium text-lg">
            Drop your CSV or XLSX file here
          </p>
          <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          <Button className="mt-4" variant="outline">
            Choose File
          </Button>
        </>
      )}
    </div>
  );
}