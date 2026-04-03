"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function UploadZone({ onUploadComplete }: { onUploadComplete: (chunks: string[]) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus("idle");
    setMessage("Processing documents...");

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setUploadStatus("success");
      setMessage(`Successfully processed ${file.name}`);
      onUploadComplete(data.chunks || []);
    } catch (error) {
      setUploadStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to process document");
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "glass-card p-8 border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden group",
          isDragActive ? "border-primary bg-primary/10" : "border-slate-600 hover:border-primary/50 hover:bg-slate-800/60",
          isUploading && "pointer-events-none opacity-80"
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {!isUploading && uploadStatus === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-slate-700/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-200">
                  Drop your knowledge base here
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Supports any document type (PDF, CSV, MD, TXT, etc.)
                </p>
              </div>
            </motion.div>
          )}

          {isUploading && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-300 font-medium animate-pulse">
                {message}
              </p>
            </motion.div>
          )}

          {!isUploading && uploadStatus === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-2" />
              <p className="text-emerald-400 font-medium">Ready to Chat!</p>
              <p className="text-sm text-slate-400">{message}</p>
            </motion.div>
          )}

          {!isUploading && uploadStatus === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2"
            >
              <AlertCircle className="w-12 h-12 text-rose-400 mb-2" />
              <p className="text-rose-400 font-medium">Upload Failed</p>
              <p className="text-sm text-slate-400">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
