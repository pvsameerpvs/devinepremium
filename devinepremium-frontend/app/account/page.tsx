"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AccountIndexPage() {
  useEffect(() => {
    redirect("/account/profile");
  }, []);

  return null;
}
