import React from 'react';

export default function Tabla({ headers, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#1E90FF]/10 text-[#1E90FF] uppercase text-xs tracking-[0.2em]">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="p-4 border-b border-white/5 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {children}
        </tbody>
      </table>
    </div>
  );
}