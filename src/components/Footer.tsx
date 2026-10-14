/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#283231] bg-[#080B0C] text-[#98A5A2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-sm font-bold text-[#EEF2EF]">
            <span className="font-mono text-xs text-[#D2F27C]">7L</span>
            <span>7LayerX</span>
          </div>
          <p className="font-mono text-xs text-[#98A5A2]">
            Trace the signal. Understand the system. Share the knowledge.
          </p>
        </div>

        {/* Technical Standards Bibliography */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-[#98A5A2]">
          <span className="text-[#EEF2EF]">Standards:</span>
          <span className="hover:text-[#EEF2EF] transition-colors">RFC 4271 (BGP-4)</span>
          <span className="hover:text-[#EEF2EF] transition-colors">RFC 4760 (MP-BGP)</span>
          <span className="hover:text-[#EEF2EF] transition-colors">RFC 6793 (4-Byte ASN)</span>
          <span className="hover:text-[#EEF2EF] transition-colors">RFC 8538 (Graceful Restart)</span>
        </div>

        <div className="font-mono text-xs text-[#98A5A2]">
          Layer 3 &amp; Inter-Domain Engineering
        </div>
      </div>
    </footer>
  );
};
