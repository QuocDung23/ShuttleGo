import { useState } from "react";

export function useOtpViewModel() {
  const [code, setCode] = useState("");

  return {
    code,
    isComplete: code.length === 6,
    updateCode: (value: string) =>
      setCode(value.replace(/\D/g, "").slice(0, 6)),
  };
}
