"use client";

import * as React from "react";

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export default function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={
        "transition-opacity duration-700 ease-out " +
        (visible ? "opacity-100" : "opacity-0") +
        (className ? ` ${className}` : "")
      }
      style={{ transitionDelay: `${delay * 1000}ms` }}
    >
      {children}
    </div>
  );
}
