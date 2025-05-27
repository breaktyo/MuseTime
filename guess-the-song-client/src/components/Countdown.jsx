import React, { useEffect, useState } from 'react';

export default function Countdown({ seconds }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return <div className="text-2xl">Time Left: {time}s</div>;
}
