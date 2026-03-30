"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WhatsAppIcon = () => (
<svg viewBox="0 0 32 32" className="w-6 h-6 fill-current">
  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.668.749 5.163 2.052 7.307L2.5 29.5l6.34-1.503A13.917 13.917 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.807c-2.28 0-4.435-.644-6.287-1.764l-4.004.949.953-3.882A11.838 11.838 0 0 1 4.193 16c0-6.522 5.285-11.807 11.807-11.807 6.522 0 11.807 5.285 11.807 11.807 0 6.522-5.285 11.807-11.807 11.807zm6.65-8.583c-.365-.183-2.162-1.066-2.497-1.189-.335-.122-.579-.183-.822.183-.244.365-.944 1.188-1.157 1.432-.213.244-.426.274-.791.091-1.879-.942-3.116-1.603-4.321-3.679-.152-.262.152-.243.435-.808.061-.122.03-.228-.015-.319-.046-.091-.411-.99-.563-1.355-.149-.356-.301-.308-.426-.314-.112-.005-.24-.006-.365-.006-.125 0-.329.047-.502.235-.173.188-.659.644-.659 1.573 0 .929.677 1.826.772 1.954.094.128 1.332 2.035 3.228 2.854 1.298.56 1.805.6 2.457.502.723-.109 2.162-.883 2.466-1.735.304-.852.304-1.583.213-1.735-.091-.152-.335-.244-.7-.427z" />
</svg>
);

export function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center group">
       <Link
        href="https://wa.me/971563758229"
        target="_blank"
        className="bg-[#25D366] text-white p-3 rounded-r-xl shadow-lg hover:bg-[#128C7E] transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden"
        aria-label="Contact us on WhatsApp"
        style={{ boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)' }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        
        <div className="relative z-10">
             <WhatsAppIcon />
        </div>
        
        <div className="text-xs font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180 whitespace-nowrap pt-1 pb-1">
            WhatsApp Us
        </div>
      </Link>
    </div>
  );
}
