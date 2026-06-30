"use client";

import { useEffect } from "react";

export function TokenInjector({ token }: { token: string }) {
  useEffect(() => {
    if (token) {
      localStorage.setItem("clinic_jwt", token);
    }
  }, [token]);

  return null; // Renders completely invisibly
}