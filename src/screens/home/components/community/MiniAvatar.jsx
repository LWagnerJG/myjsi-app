import React from 'react';

export const MiniAvatar = ({ src, name, dark, size = 28 }) => (
  <div
    className="rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden text-[0.6875rem] font-bold"
    style={{ width: size, height: size, backgroundColor: dark ? '#444' : '#E3E0D8' }}
  >
    {src
      ? <img src={src} alt={name} className="w-full h-full object-cover" />
      : <span style={{ color: dark ? '#aaa' : '#888' }}>{(name || '?')[0]}</span>}
  </div>
);
