"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const showDuration = 700;
    const fadeDuration = 200;

    setIsVisible(true);
    setIsFading(false);

    const showTimer = setTimeout(() => {
      setIsFading(true);
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        setIsFading(false);
      }, fadeDuration);
      return () => clearTimeout(fadeTimer);
    }, showDuration);

    return () => {
      clearTimeout(showTimer);
    };
  }, [pathname, searchParams?.toString()]);

  if (!isVisible) return null;

  return (
    <div className={`top-loader${isFading ? " is-fading" : ""}`} aria-live="polite" aria-label="Navegando">
      <span />
    </div>
  );
}
