import React, { useEffect, useRef } from 'react';
import { AdItem } from '../types';

interface AdsterraSlotProps {
  ad: AdItem;
  className?: string;
  slotLabel?: string;
}

export const AdsterraSlot: React.FC<AdsterraSlotProps> = ({ ad, className = '', slotLabel }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!ad || !ad.enabled) {
    return null;
  }

  // Handle external script execution safely if user pasted full script tags
  useEffect(() => {
    if (!containerRef.current || !ad.code) return;

    // Check if code contains script tags
    if (ad.code.includes('<script')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = ad.code;
      const scripts = tempDiv.querySelectorAll('script');

      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        containerRef.current?.appendChild(newScript);
      });
    }
  }, [ad.code]);

  const hasCode = ad.code && !ad.code.startsWith('<!--');

  return (
    <div
      id={`ad-slot-${ad.position || 'banner'}`}
      className={`relative my-4 overflow-hidden rounded-md border border-gray-200 bg-gray-100 p-2 text-center transition-all ${className}`}
    >
      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-gray-500">
        <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px]">বিজ্ঞাপন</span>
        <span className="text-[10px] text-gray-400">{slotLabel || ad.title || 'Adsterra Ad Slot'}</span>
      </div>

      {hasCode ? (
        <div
          ref={containerRef}
          className="min-h-[60px] flex items-center justify-center overflow-auto"
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-4 px-2 border border-dashed border-gray-300 rounded bg-white/70">
          <div className="text-xs font-semibold text-gray-700">{ad.title || 'বিজ্ঞাপন প্রদর্শনের স্থান'}</div>
          <p className="text-[11px] text-gray-400 mt-1">
            অ্যাডমিন প্যানেল থেকে আপনার Adsterra অথবা কাস্টম অ্যাড ব্যানার কোড যুক্ত করুন
          </p>
        </div>
      )}
    </div>
  );
};
