import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -z-10" />
      
      <div className="glass-card max-w-sm w-full p-8 md:p-10 space-y-8 text-center relative overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="space-y-3">
          <div className="inline-block p-3 bg-slate-800/80 rounded-full mb-2 border border-slate-700">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Access Portal</h1>
          <p className="text-slate-400 text-sm md:text-base px-2">Sign in to access your secure RAG agent platform</p>
        </div>
        
        <LoginButton />
      </div>
    </div>
  );
}
