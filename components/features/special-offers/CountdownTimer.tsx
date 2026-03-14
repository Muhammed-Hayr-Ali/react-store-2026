// components/special-offers/CountdownTimer.tsx

"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiryTimestamp: string; // تاريخ الانتهاء بصيغة ISO string
}

export function CountdownTimer({ expiryTimestamp }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
    <div key={interval} className="flex flex-col items-center">
      <span className="text-2xl font-bold" suppressHydrationWarning>
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs uppercase">{interval}</span>
    </div>
  ));

  return (
    <div className="flex justify-center gap-4 text-center">
      {timerComponents}
    </div>
  );
}
