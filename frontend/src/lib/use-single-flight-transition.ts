"use client";

import { useRef, useState, useTransition } from "react";

export function useSingleFlightTransition() {
  const inFlightRef = useRef(false);
  const [isInFlight, setIsInFlight] = useState(false);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setIsInFlight(true);
    startTransition(async () => {
      try {
        await action();
      } finally {
        inFlightRef.current = false;
        setIsInFlight(false);
      }
    });
  }

  return {
    isRunning: isPending || isInFlight,
    run
  };
}
