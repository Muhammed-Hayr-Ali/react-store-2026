"use client";

import { motion } from "framer-motion";

export default function ComingSoonPage() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden relative selection:bg-emerald-500/30 font-urbanist">
      {/* Fixed Background with Vibrant Marketplace Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Energetic Retail Blobs - More Visible */}
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 80, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-500/30 rounded-full blur-[140px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, -70, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-15%] right-[-10%] w-[65%] h-[65%] bg-orange-500/25 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[5%] w-[40%] h-[50%] bg-lime-400/20 rounded-full blur-[120px]" 
        />
        
        {/* Premium Grain Texture */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
      </div>
      
      <div className="z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-8 md:gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 md:space-y-7"
        >
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-widest text-sky-400 uppercase backdrop-blur-2xl">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Launching Soon
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9]">
            <span className="inline-block py-2 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Something
            </span>
            <br />
            <span className="inline-block py-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-orange-400 to-lime-400 animate-gradient-x italic font-serif">
               Extraordinary
            </span>
          </h1>
          
        

          <p className="text-lg md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed px-6">
            Marketna is crafting a digital <span className="text-white font-medium italic">Masterpiece</span>. <br />
            The wait will be worth the beauty.
          </p>
        </motion.div>

        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-px w-48 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" 
        />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-sm font-black uppercase tracking-[0.5em] text-white/50">
            Marketna Marketplace
          </p>
          <div className="flex gap-4">
            {[0, 150, 300].map((delay) => (
              <motion.div 
                key={delay}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: delay / 1000 }}
                className="w-2 h-2 rounded-full bg-gradient-to-tr from-sky-500 to-orange-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Subtle Animated Frame */}
      <motion.div 
        initial={{ opacity: 0, inset: "2rem" }}
        animate={{ opacity: 1, inset: "1rem" }}
        transition={{ duration: 1.5 }}
        className="fixed pointer-events-none border border-white/5 rounded-[3rem] z-20" 
      />
    </main>
  );
}
