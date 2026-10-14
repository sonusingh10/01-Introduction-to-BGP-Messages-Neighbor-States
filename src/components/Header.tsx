/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, EyeOff, Radio } from 'lucide-react';

interface HeaderProps {
  reducedMotion: boolean;
  onToggleMotion: () => void;
}

export const Header: React.FC<HeaderProps> = ({ reducedMotion, onToggleMotion }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#283231] bg-[#080B0C]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          className="group flex items-center gap-2.5 whitespace-nowrap shrink-0 text-base font-semibold tracking-tight text-[#EEF2EF] transition-colors hover:text-[#D2F27C]"
        >
          <span className="font-mono text-xs tracking-wider text-[#D2F27C]">7L</span>
          <span className="font-sans font-bold">7LayerX</span>
          <span className="hidden sm:inline font-mono text-[11px] font-normal text-[#98A5A2]">
            / Systems Architecture
          </span>
        </a>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#98A5A2]">
          <a
            href="#architecture"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#EEF2EF]"
          >
            Architecture
          </a>
          <a
            href="#messages"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#EEF2EF]"
          >
            4 Core Messages
          </a>
          <a
            href="#fsm"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#EEF2EF]"
          >
            Neighbor FSM
          </a>
          <a
            href="#aspath"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#EEF2EF]"
          >
            AS_PATH Graph
          </a>
          <a
            href="#troubleshooting"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#EEF2EF]"
          >
            Diagnostics
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action Control (Motion / Still Toggle) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMotion}
            aria-pressed={reducedMotion}
            title={reducedMotion ? 'Enable subtle signal animations' : 'Pause animations (Reduced Motion)'}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap shrink-0 ${
              reducedMotion
                ? 'border-[#283231] bg-[#101516] text-[#98A5A2] hover:text-[#EEF2EF]'
                : 'border-[#283231] bg-[#151C1D] text-[#D2F27C] hover:border-[#D2F27C]/40'
            }`}
          >
            {reducedMotion ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Motion: Off</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-[#D2F27C]" />
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D2F27C]" />
                  </span>
                  Signal Live
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
