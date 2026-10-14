/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BGP_MESSAGES } from '../data/bgpData';
import { BgpMessageType } from '../types/bgp';
import { FileCode, ShieldAlert, CheckCircle2, Binary, BookOpen } from 'lucide-react';

export const MessageDissector: React.FC = () => {
  const [selectedType, setSelectedType] = useState<BgpMessageType>('OPEN');
  const [activeTab, setActiveTab] = useState<'fields' | 'hex' | 'rfc'>('fields');

  const activeMsg = BGP_MESSAGES.find((m) => m.id === selectedType) || BGP_MESSAGES[0];

  return (
    <section id="messages" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#283231]">
      {/* Chapter Kicker */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">02</span>
          <span aria-hidden="true">·</span>
          <span>Protocol Data Units</span>
          <span aria-hidden="true">·</span>
          <span>19-Octet Framing Header</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF2EF]">
          The Four Fundamental BGP Messages
        </h2>
        <p className="mt-3 text-sm text-[#98A5A2] leading-relaxed">
          Every BGP packet begins with a standard 19-octet header containing a 16-octet synchronization marker, a 2-octet length, and a 1-octet type code. BGP multiplexes all control signaling, route propagation, and heartbeat verification across these four message types.
        </p>
      </div>

      {/* Universal 19-Octet Header Plate */}
      <div className="mb-8 rounded-lg border border-[#283231] bg-[#101516] p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs font-medium text-[#EEF2EF]">
            Universal BGP Header Structure (19 Octets)
          </span>
          <span className="font-mono text-xs text-[#98A5A2]">RFC 4271 §4.0</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono text-center">
          <div className="sm:col-span-8 rounded border border-[#283231] bg-[#151C1D] p-3 text-left">
            <div className="text-[11px] text-[#98A5A2]">Marker Field (16 Octets / 128 Bits)</div>
            <div className="mt-1 font-mono text-[#D2F27C] text-[11px] truncate">
              0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF 0xFF
            </div>
            <div className="text-[10px] text-[#98A5A2] mt-1">Synchronization &amp; message framing; all bits must be 1.</div>
          </div>
          <div className="sm:col-span-2 rounded border border-[#283231] bg-[#151C1D] p-3 text-left">
            <div className="text-[11px] text-[#98A5A2]">Length (2 Octets)</div>
            <div className="mt-1 font-mono text-[#EEF2EF] text-[11px]">19 to 4096</div>
            <div className="text-[10px] text-[#98A5A2] mt-1">Total packet length in bytes.</div>
          </div>
          <div className="sm:col-span-2 rounded border border-[#283231] bg-[#151C1D] p-3 text-left">
            <div className="text-[11px] text-[#98A5A2]">Type (1 Octet)</div>
            <div className="mt-1 font-mono text-[#A6C955] text-[11px]">1, 2, 3, or 4</div>
            <div className="text-[10px] text-[#98A5A2] mt-1">Identifies message payload.</div>
          </div>
        </div>
      </div>

      {/* Interactive Message Dissector Workspace */}
      <div className="rounded-xl border border-[#283231] bg-[#101516] overflow-hidden">
        {/* Message Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#283231] bg-[#151C1D]/60 p-2 sm:px-4">
          <div className="flex flex-wrap items-center gap-1">
            {BGP_MESSAGES.map((msg) => {
              const isSelected = msg.id === selectedType;
              const isNotif = msg.id === 'NOTIFICATION';
              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedType(msg.id)}
                  className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                    isSelected
                      ? isNotif
                        ? 'bg-[#EF8A78]/15 text-[#EF8A78] border border-[#EF8A78]/30 font-semibold'
                        : 'bg-[#151C1D] text-[#D2F27C] border border-[#283231] font-semibold'
                      : 'text-[#98A5A2] hover:text-[#EEF2EF]'
                  }`}
                >
                  <span className="opacity-60">Type {msg.code}:</span>
                  <span>{msg.id}</span>
                </button>
              );
            })}
          </div>

          {/* View Mode Tabs (Fields / Hex / RFC) */}
          <div className="mt-2 sm:mt-0 flex items-center gap-1 rounded bg-[#101516] p-1 border border-[#283231]">
            <button
              onClick={() => setActiveTab('fields')}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'fields'
                  ? 'bg-[#151C1D] text-[#D2F27C] border border-[#283231]'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Fields
            </button>
            <button
              onClick={() => setActiveTab('hex')}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'hex'
                  ? 'bg-[#151C1D] text-[#D2F27C] border border-[#283231]'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Hex Dump
            </button>
            <button
              onClick={() => setActiveTab('rfc')}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'rfc'
                  ? 'bg-[#151C1D] text-[#D2F27C] border border-[#283231]'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              RFC Invariants
            </button>
          </div>
        </div>

        {/* Selected Message Header Details */}
        <div className="p-4 sm:p-6 border-b border-[#283231] bg-[#101516]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2]">
                <span className="text-[#D2F27C]">Type 0x0{activeMsg.code}</span>
                <span aria-hidden="true">·</span>
                <span>{activeMsg.rfc}</span>
                <span aria-hidden="true">·</span>
                <span>Min Size: {activeMsg.minSize}</span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-[#EEF2EF]">{activeMsg.name}</h3>
              <p className="mt-1 text-xs sm:text-sm text-[#98A5A2] max-w-3xl">
                {activeMsg.description}
              </p>
            </div>
            <div className="rounded border border-[#283231] bg-[#151C1D] p-3 sm:text-right shrink-0">
              <span className="block text-[11px] font-mono text-[#98A5A2]">Transmission Cadence</span>
              <span className="text-xs font-medium text-[#EEF2EF]">{activeMsg.frequency}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Pane based on activeTab */}
        <div className="p-4 sm:p-6">
          {activeTab === 'fields' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#283231] font-mono text-[#98A5A2]">
                    <th className="pb-3 font-medium">Field Name</th>
                    <th className="pb-3 font-medium">Octet Size</th>
                    <th className="pb-3 font-medium">Data Type</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Wire Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283231]/60 font-sans">
                  {activeMsg.fields.map((f, i) => (
                    <tr key={i} className="hover:bg-[#151C1D]/40 transition-colors">
                      <td className="py-3 font-mono font-medium text-[#EEF2EF] whitespace-nowrap">
                        {f.name}
                      </td>
                      <td className="py-3 font-mono text-[#98A5A2] whitespace-nowrap tabular-nums">
                        {f.size}
                      </td>
                      <td className="py-3 font-mono text-[#A6C955] whitespace-nowrap">
                        {f.type}
                      </td>
                      <td className="py-3 text-[#98A5A2] max-w-md pr-4 leading-relaxed">
                        {f.description}
                      </td>
                      <td className="py-3 font-mono text-[#D2F27C] text-[11px] max-w-xs break-all">
                        {f.exampleValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'hex' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#98A5A2]">
                  Raw Captured Wire Bytecode (Hexadecimal Octets)
                </span>
                <span className="text-xs font-mono text-[#D2F27C]">
                  {activeMsg.name}
                </span>
              </div>
              <div className="rounded-lg border border-[#283231] bg-[#080B0C] p-4 font-mono text-xs text-[#EEF2EF] leading-relaxed overflow-x-auto">
                <pre>{activeMsg.hexDump}</pre>
              </div>
              <p className="text-xs text-[#98A5A2]">
                Tip: The first 16 bytes (<code className="text-[#D2F27C]">ff ff ... ff</code>) are the marker synchronization octets common to all BGP packets. Notice that KEEPALIVE ends immediately at byte 19 with length <code className="text-[#D2F27C]">00 13</code> and type <code className="text-[#D2F27C]">04</code>.
              </p>
            </div>
          )}

          {activeTab === 'rfc' && (
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#98A5A2] block mb-2">
                Mandatory Protocol Rules &amp; Engineering Invariants ({activeMsg.rfc})
              </span>
              {activeMsg.rfcNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-[#283231] bg-[#151C1D] p-3 text-xs text-[#EEF2EF]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#D2F27C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
