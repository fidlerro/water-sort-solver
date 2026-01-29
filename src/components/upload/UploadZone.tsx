import React, { useRef } from "react";
import Button from "../shared/Button";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  previewUrl?: string | null;
}

export default function UploadZone({
  onFileSelected,
  previewUrl,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="upload-zone">
      <h2 className="section-title">📸 Upload Screenshot</h2>
      <p className="muted">
        Tap to upload or drag a screenshot from your game.
      </p>
      <Button onClick={() => inputRef.current?.click()}>Select Image</Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
      {previewUrl && (
        <img
          className="upload-preview"
          src={previewUrl}
          alt="Screenshot preview"
        />
      )}
    </div>
  );
}
