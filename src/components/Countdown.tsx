'use client';
import { useState, useEffect } from 'react';

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-3 sm:gap-6 text-center my-8">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col bg-neutral-900/50 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/10 w-20 sm:w-28 shadow-2xl">
          <span className="text-3xl sm:text-5xl font-serif font-bold text-white mb-2">{value.toString().padStart(2, '0')}</span>
          <span className="text-[9px] sm:text-xs uppercase tracking-[0.2em] text-amber-500 font-bold">{unit}</span>
        </div>
      ))}
    </div>
  );
}