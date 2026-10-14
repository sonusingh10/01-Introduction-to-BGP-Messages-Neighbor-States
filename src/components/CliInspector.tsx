/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

export const CliInspector: React.FC = () => {
  const [platform, setPlatform] = useState<'cisco' | 'juniper'>('cisco');
  const [activeNeighbor, setActiveNeighbor] = useState<'peer1' | 'peer2' | 'peer3'>('peer1');

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#283231]">
      {/* Chapter Kicker */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">05</span>
          <span aria-hidden="true">·</span>
          <span>Terminal Telemetry</span>
          <span aria-hidden="true">·</span>
          <span>State/PfxRcd Column Rule</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF2EF]">
          Operational CLI Command Inspection
        </h2>
        <p className="mt-3 text-sm text-[#98A5A2] leading-relaxed">
          In production routing consoles, how do you verify whether a neighbor is in the Established state?
          Inspect the live terminal summary below and notice the critical counter behavior.
        </p>
      </div>

      {/* Terminal Frame */}
      <div className="rounded-xl border border-[#283231] bg-[#080B0C] shadow-2xl overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#283231] bg-[#101516] px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-[#98A5A2]">
            <Terminal className="h-4 w-4 text-[#D2F27C]" />
            <span className="text-[#EEF2EF]">edge-router-01.lon#</span>
            <span className="text-[#D2F27C]">
              {platform === 'cisco' ? 'show ip bgp summary' : 'show bgp summary'}
            </span>
          </div>

          {/* OS Switcher */}
          <div className="flex items-center gap-1 rounded bg-[#080B0C] p-1 border border-[#283231]">
            <button
              onClick={() => setPlatform('cisco')}
              className={`rounded px-2.5 py-0.5 text-xs font-mono transition-colors ${
                platform === 'cisco'
                  ? 'bg-[#151C1D] text-[#D2F27C] border border-[#283231]'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Cisco IOS-XE / Arista EOS
            </button>
            <button
              onClick={() => setPlatform('juniper')}
              className={`rounded px-2.5 py-0.5 text-xs font-mono transition-colors ${
                platform === 'juniper'
                  ? 'bg-[#151C1D] text-[#D2F27C] border border-[#283231]'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Juniper Junos OS
            </button>
          </div>
        </div>

        {/* Terminal Content Body */}
        <div className="p-4 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-[#EEF2EF]">
          {platform === 'cisco' ? (
            <div className="space-y-4">
              <div className="text-[#98A5A2]">
                BGP router identifier 10.254.1.1, local AS number 65001<br />
                BGP table version is 184, main routing table version 184<br />
                8 network entries using 1984 bytes of memory<br />
                12 path entries using 1632 bytes of memory<br />
              </div>

              <div className="text-[#98A5A2] border-b border-[#283231] pb-1 font-semibold text-[#EEF2EF]">
                Neighbor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;V&nbsp;&nbsp;&nbsp;&nbsp;AS&nbsp;MsgRcvd&nbsp;MsgSent&nbsp;&nbsp;&nbsp;TblVer&nbsp;&nbsp;InQ&nbsp;OutQ&nbsp;Up/Down&nbsp;&nbsp;State/PfxRcd
              </div>

              {/* Row 1: Established Peer */}
              <div className="group flex items-center justify-between rounded p-1 hover:bg-[#151C1D]/60 transition-colors">
                <span className="text-[#EEF2EF]">
                  203.0.113.2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4&nbsp;13335&nbsp;&nbsp;&nbsp;18942&nbsp;&nbsp;18939&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;184&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;04:12:49&nbsp;&nbsp;
                  <span className="text-[#D2F27C] font-bold">142</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-[#D2F27C] bg-[#D2F27C]/10 border border-[#D2F27C]/30 px-2 py-0.5 rounded">
                  ESTABLISHED (142 Prefixes)
                </span>
              </div>

              {/* Row 2: Stuck in Active Peer */}
              <div className="group flex items-center justify-between rounded p-1 hover:bg-[#151C1D]/60 transition-colors">
                <span className="text-[#EEF2EF]">
                  203.0.113.6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4&nbsp;15169&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;00:00:28&nbsp;&nbsp;
                  <span className="text-[#EF8A78] font-bold">Active</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-[#EF8A78] bg-[#EF8A78]/10 border border-[#EF8A78]/30 px-2 py-0.5 rounded">
                  DOWN (TCP Unreachable)
                </span>
              </div>

              {/* Row 3: Stuck in Idle Peer */}
              <div className="group flex items-center justify-between rounded p-1 hover:bg-[#151C1D]/60 transition-colors">
                <span className="text-[#EEF2EF]">
                  203.0.113.10&nbsp;&nbsp;&nbsp;&nbsp;4&nbsp;&nbsp;2914&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;never&nbsp;&nbsp;
                  <span className="text-[#98A5A2] font-bold">Idle (Admin)</span>
                </span>
                <span className="hidden sm:inline text-[11px] text-[#98A5A2] bg-[#151C1D] border border-[#283231] px-2 py-0.5 rounded">
                  SHUTDOWN
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-[#98A5A2]">
                Groups: 1 Peers: 3 Down peers: 2<br />
                Table&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tot Paths&nbsp;&nbsp;Act Paths&nbsp;&nbsp;Suppressed&nbsp;&nbsp;&nbsp;&nbsp;History Damp State&nbsp;Pending<br />
                inet.0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;142&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;142&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0<br />
              </div>

              <div className="text-[#98A5A2] border-b border-[#283231] pb-1 font-semibold text-[#EEF2EF]">
                Peer&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;InPkt&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OutPkt&nbsp;&nbsp;&nbsp;OutQ&nbsp;&nbsp;&nbsp;Flaps Last Up/Dwn State|#Active/Received/Accepted/Damped...
              </div>

              <div className="group flex items-center justify-between rounded p-1 hover:bg-[#151C1D]/60 transition-colors">
                <span className="text-[#EEF2EF]">
                  203.0.113.2&nbsp;&nbsp;&nbsp;13335&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18942&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18939&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;4:12:49&nbsp;
                  <span className="text-[#D2F27C] font-bold">Establ</span>&nbsp;inet.0: 142/142/142/0
                </span>
              </div>

              <div className="group flex items-center justify-between rounded p-1 hover:bg-[#151C1D]/60 transition-colors">
                <span className="text-[#EEF2EF]">
                  203.0.113.6&nbsp;&nbsp;&nbsp;15169&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;28&nbsp;
                  <span className="text-[#EF8A78] font-bold">Active</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Engineering Takeaway Strip */}
        <div className="border-t border-[#283231] bg-[#101516] p-4 flex items-start gap-3 text-xs text-[#98A5A2]">
          <Info className="h-4 w-4 text-[#D2F27C] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#EEF2EF] font-medium">The Network Engineer’s Golden Rule: </strong>
            In Cisco and Arista BGP summaries, when the session is healthy and <span className="text-[#D2F27C] font-mono">Established</span>, the <span className="text-[#EEF2EF] font-mono">State/PfxRcd</span> column displays an integer representing received prefixes (e.g., <span className="text-[#D2F27C] font-mono">142</span> or <span className="text-[#EEF2EF] font-mono">0</span>). If that column contains any English word—such as <span className="text-[#EF8A78] font-mono">Active</span>, <span className="text-[#EF8A78] font-mono">Idle</span>, or <span className="text-[#EF8A78] font-mono">Connect</span>—the peering session is DOWN.
          </div>
        </div>
      </div>
    </section>
  );
};
