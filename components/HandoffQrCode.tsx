'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type HandoffQrCodeProps = {
  path: string;
  size?: number;
  className?: string;
  imageClassName?: string;
};

export function HandoffQrCode({ path, size = 180, className = '', imageClassName = '' }: HandoffQrCodeProps) {
  const [qrUrl, setQrUrl] = useState('');
  const [qrValue, setQrValue] = useState(path);

  useEffect(() => {
    setQrValue(new URL(path, window.location.origin).toString());
  }, [path]);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size,
      color: {
        dark: '#111111',
        light: '#fff7ed',
      },
    }).then((dataUrl) => {
      if (!cancelled) setQrUrl(dataUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [qrValue, size]);

  return (
    <div className={`rounded-3xl border border-white/70 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ${className}`}>
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="Scannable BorrowBoard handoff QR code"
          width={size}
          height={size}
          className={`block h-auto max-w-full rounded-2xl ${imageClassName}`}
        />
      ) : (
        <div
          className="grid animate-pulse grid-cols-5 gap-1 rounded-2xl bg-amber-50 p-3"
          style={{ width: size, height: size }}
          aria-label="Generating QR code"
        >
          {Array.from({ length: 25 }).map((_, index) => (
            <span key={index} className={index % 3 === 0 ? 'rounded bg-stone-900' : 'rounded bg-amber-100'} />
          ))}
        </div>
      )}
      <p className="sr-only">{qrValue}</p>
    </div>
  );
}
