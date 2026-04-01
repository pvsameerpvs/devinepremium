"use client";

import { useEffect, useState } from "react";

export function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <a
      href="https://wa.me/971501234567" // Placeholder number, it should be the actual business number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="h-8 w-8 fill-current"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-32 0-63.1-8.6-90.5-24.8l-6.5-3.8-67.3 17.7 18-65.6-4.2-6.7c-17.7-28.4-27.1-61.1-27.1-94.8 0-101.4 82.5-183.8 183.9-183.8 54.1 0 104.9 21.1 143.2 59.4 38.3 38.3 59.4 89.2 59.4 143.3 0 101.5-82.6 183.9-183.9 183.9zM324.5 277.1c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.8-8.7-2.8-12.4 2.8-3.7 5.5-14.2 17.9-17.4 21.6-3.2 3.7-6.4 4.1-11.9 1.4-5.5-2.8-23.3-8.6-44.4-27.5-16.5-14.7-27.6-32.9-30.8-38.4-3.2-5.5-.3-8.5 2.5-11.3 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.4-29.9-17-40.9-4.5-10.8-9.1-9.3-12.4-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.6 1.4-14.7 6.9-5.1 5.5-19.3 18.8-19.3 45.9s19.8 53.2 22.5 56.9c2.8 3.7 38.8 59.3 94 83.1 13.1 5.6 23.4 9 31.4 11.5 13.2 4.2 25.2 3.6 34.7 2.2 10.6-1.6 32.6-13.3 37.2-26.2 4.6-12.9 4.6-23.9 3.2-26.2-1.3-2.3-5-3.7-10.5-6.5z" />
      </svg>
    </a>
  );
}
