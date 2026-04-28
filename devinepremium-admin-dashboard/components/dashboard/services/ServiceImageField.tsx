"use client";

import Image from "next/image";

type ServiceImageFieldProps = {
  imageUrl: string;
  isUploading: boolean;
  onChange: (imageUrl: string) => void;
  onUpload: (file: File) => void;
};

export function ServiceImageField({
  imageUrl,
  isUploading,
  onChange,
  onUpload,
}: ServiceImageFieldProps) {
  return (
    <div className="grid gap-2 text-sm font-semibold text-slate-700">
      Service Image
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative h-16 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Service preview"
              width={96}
              height={64}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-[10px] text-slate-400">
              No Image
            </div>
          )}
        </div>

        <label className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-slate-100 px-6 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-200">
          {isUploading ? "Uploading..." : imageUrl ? "Change Image" : "Upload Image"}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) {
                onUpload(file);
              }
            }}
          />
        </label>

        {imageUrl && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
