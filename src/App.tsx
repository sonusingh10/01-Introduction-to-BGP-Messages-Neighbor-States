/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EditorialPlate } from './components/EditorialPlate';
import { MessageDissector } from './components/MessageDissector';
import { NeighborFsm } from './components/NeighborFsm';
import { AsPathVisualizer } from './components/AsPathVisualizer';
import { DiagnosticMatrix } from './components/DiagnosticMatrix';
import { CliInspector } from './components/CliInspector';
import { Footer } from './components/Footer';

export default function App() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Check system prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
      }
    }
  }, []);

  const handleToggleMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#EEF2EF] flex flex-col selection:bg-[#D2F27C]/20 selection:text-[#D2F27C]">
      {/* 7LayerX Top Bar Contract Header */}
      <Header
        reducedMotion={reducedMotion}
        onToggleMotion={handleToggleMotion}
      />

      <main className="flex-1">
        {/* Section 1: Hero Editorial Plate & Subtle Signal Tracing */}
        <EditorialPlate reducedMotion={reducedMotion} />

        {/* Section 2: The Four Fundamental BGP Messages & Header Dissector */}
        <MessageDissector />

        {/* Section 3: The Six Neighbor States & Interactive FSM Engine */}
        <NeighborFsm />

        {/* Section 4: D3 Multi-AS Route Propagation & AS_PATH Attribute Visualizer */}
        <AsPathVisualizer />

        {/* Section 5: Operational Diagnostics & Triage Blueprint */}
        <DiagnosticMatrix />

        {/* Section 6: Real-World CLI Console & State/PfxRcd Rule */}
        <CliInspector />
      </main>

      {/* 7LayerX Footer */}
      <Footer />
    </div>
  );
}
