/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DIAGNOSTIC_ISSUES } from '../data/bgpData';
import { Wrench, Copy, Check, ChevronRight, AlertCircle } from 'lucide-react';

export const DiagnosticMatrix: React.FC = () => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('stuck-active');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeIssue =
    DIAGNOSTIC_ISSUES.find((iss) => iss.id === selectedIssueId) || DIAGNOSTIC_ISSUES[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="troubleshooting" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#283231]">
      {/* Chapter Kicker */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">04</span>
          <span aria-hidden="true">·</span>
          <span>Field Engineering Triage</span>
          <span aria-hidden="true">·</span>
          <span>Adjacency Failure Analysis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF2EF]">
          BGP Neighbor Adjacency Diagnostics
        </h2>
        <p className="mt-3 text-sm text-[#98A5A2] leading-relaxed">
          Production network outages in BGP almost always present as peers stalled in either the Active or Idle states, or flapping uncontrollably. Here is the systematic root cause analysis procedure.
        </p>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Picker */}
        <div className="lg:col-span-4 space-y-2">
          {DIAGNOSTIC_ISSUES.map((issue) => {
            const isSelected = issue.id === selectedIssueId;
            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#D2F27C] bg-[#151C1D] shadow-[0_0_15px_rgba(210,242,124,0.06)]'
                    : 'border-[#283231] bg-[#101516] hover:bg-[#151C1D]/50'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      issue.stuckState === 'Active'
                        ? 'text-[#EF8A78] bg-[#EF8A78]/10'
                        : issue.stuckState === 'Idle'
                        ? 'text-[#98A5A2] bg-[#101516]'
                        : 'text-[#D2F27C] bg-[#D2F27C]/10'
                    }`}
                  >
                    State: {issue.stuckState}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 ${isSelected ? 'text-[#D2F27C]' : 'text-[#98A5A2]'}`} />
                </div>
                <div className="text-sm font-semibold text-[#EEF2EF] leading-snug">
                  {issue.symptom}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Root Causes & Remediation Blueprint */}
        <div className="lg:col-span-8 rounded-xl border border-[#283231] bg-[#101516] p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#283231] pb-4">
            <div>
              <span className="font-mono text-xs text-[#D2F27C]">Triage Blueprint</span>
              <h3 className="text-lg font-bold text-[#EEF2EF] mt-0.5">{activeIssue.symptom}</h3>
            </div>
            <span className="font-mono text-xs text-[#98A5A2]">
              {activeIssue.rootCauses.length} Primary Failure Modes
            </span>
          </div>

          <div className="space-y-6">
            {activeIssue.rootCauses.map((rc, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#283231] bg-[#151C1D] p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#101516] border border-[#283231] font-mono text-[11px] text-[#D2F27C]">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#EEF2EF]">{rc.title}</h4>
                </div>

                <p className="text-xs text-[#98A5A2] leading-relaxed pl-7">
                  {rc.technicalExplanation}
                </p>

                {/* Verification Command Box */}
                <div className="pl-7 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#98A5A2]">Verification Probe:</span>
                    <button
                      onClick={() => handleCopy(rc.diagnosticCommand)}
                      className="flex items-center gap-1 font-mono text-[11px] text-[#D2F27C] hover:underline"
                    >
                      {copiedCmd === rc.diagnosticCommand ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy CLI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded border border-[#283231] bg-[#080B0C] px-3 py-2 font-mono text-xs text-[#EEF2EF]">
                    <code>{rc.diagnosticCommand}</code>
                  </div>
                </div>

                {/* Remediation Note */}
                <div className="pl-7 pt-1">
                  <div className="rounded border border-[#D2F27C]/20 bg-[#D2F27C]/5 p-2.5 text-xs text-[#EEF2EF]">
                    <span className="font-mono text-[#D2F27C] font-semibold">Fix: </span>
                    <span className="text-[#98A5A2]">{rc.remediation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
