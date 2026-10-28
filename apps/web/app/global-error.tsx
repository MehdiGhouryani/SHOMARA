'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2>خطایی رخ داده است</h2>
          <button onClick={() => reset()}>تلاش مجدد</button>
        </div>
      </body>
    </html>
  );
}
