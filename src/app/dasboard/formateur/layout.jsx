"use client";

import RequireRole from "@/components/backoOffice/RequireRole";

export default function FormateurLayout({ children }) {
  return (
    <RequireRole roles={["formateur","admin"]}>
      {children}
    </RequireRole>
  );
}


