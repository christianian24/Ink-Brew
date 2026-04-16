"use client";

import { useState, useEffect } from "react";

export default function DelayedRender({
  children,
  delay = 150,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
