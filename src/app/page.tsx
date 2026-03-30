"use client";

import UploadZone from "@/components/UploadZone";
import ChatInterface from "@/components/ChatInterface";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [hasDocument, setHasDocument] = useState(false);

  if (status === "loading") {
    return <main className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></main>;
  }

  return (
    <main className="min-h-screen py-12 px-4 flex flex-col items-center relative">
      {/* Header with auth controls */}
      <div className="absolute top-0 right-0 p-4 w-full flex justify-end">
        <div className="flex items-center gap-4 glass-card px-4 py-2 rounded-full">
          <span className="text-sm text-slate-300 hidden md:block">{session?.user?.email}</span>
          <button 
            onClick={() => signOut()} 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="w-full max-w-5xl space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide backdrop-blur-sm">
            RAG PLATFORM
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
            AI Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Agent</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Upload your company knowledge base (PDF or TXT) and instantly get an AI assistant that answers questions <strong className="text-slate-200">strictly based on your documents</strong>.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!hasDocument ? (
             <motion.div
               key="upload"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.4 }}
               className="mt-16"
             >
               <UploadZone onUploadComplete={() => setHasDocument(true)} />
             </motion.div>
          ) : (
             <motion.div
               key="chat"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="mt-8"
             >
               <div className="flex justify-between items-center mb-6 pl-2">
                 <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   Active Session
                 </h2>
                 <button 
                   onClick={() => setHasDocument(false)}
                   className="text-sm text-slate-400 hover:text-white transition-colors"
                 >
                   Upload New Document
                 </button>
               </div>
               <ChatInterface />
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
