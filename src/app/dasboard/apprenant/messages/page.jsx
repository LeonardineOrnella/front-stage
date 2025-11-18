"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApprenantMessages() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dasboard/apprenant/discussions');
  }, [router]);

  return null;
}
