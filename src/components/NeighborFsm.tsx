/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BGP_STATES, FSM_WALKTHROUGH_STEPS } from '../data/bgpData';
import { BgpStateName } from '../types/bgp';
import {
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Terminal,
  Activity,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const NeighborFsm: React.FC = () => {
  const [selectedStateIndex, setSelectedStateIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [autoPlaying, setAutoPlaying] = useState<boolean>(false);
  const [injectedFailure, setInjectedFailure] = useState<string | null>(null);
  const [eventLogs, setEventLogs] = useState<string[]>([
    '%BGP-5-ADJCHANGE: neighbor 198.51.100.2 initialized in Idle state',
  ]);

  const activeState = BGP_STATES[selectedStateIndex];
  const activeStep = FSM_WALKTHROUGH_STEPS[currentStepIndex];

  // Auto-play stepper
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= FSM_WALKTHROUGH_STEPS.length - 1) {
            setAutoPlaying(false);
            return prev;
          }
          const nextStep = prev + 1;
          const stepData = FSM_WALKTHROUGH_STEPS[nextStep];
          const stateIdx = BGP_STATES.findIndex((s) => s.name === stepData.toState);
          if (stateIdx !== -1) setSelectedStateIndex(stateIdx);
          setEventLogs((logs) => [stepData.logMessage, ...logs].slice(0, 8));
          return nextStep;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [autoPlaying]);

  const handleStepForward = () => {
    if (currentStepIndex < FSM_WALKTHROUGH_STEPS.length - 1) {
      const nextStep = currentStepIndex + 1;
      setCurrentStepIndex(nextStep);
      const stepData = FSM_WALKTHROUGH_STEPS[nextStep];
      const stateIdx = BGP_STATES.findIndex((s) => s.name === stepData.toState);
      if (stateIdx !== -1) setSelectedStateIndex(stateIdx);
      setEventLogs((logs) => [stepData.logMessage, ...logs].slice(0, 8));
      setInjectedFailure(null);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = currentStepIndex - 1;
      setCurrentStepIndex(prevStep);
      const stepData = FSM_WALKTHROUGH_STEPS[prevStep];
      const stateIdx = BGP_STATES.findIndex((s) => s.name === stepData.toState);
      if (stateIdx !== -1) setSelectedStateIndex(stateIdx);
      setInjectedFailure(null);
    }
  };

  const handleReset = () => {
    setAutoPlaying(false);
    setCurrentStepIndex(0);
    setSelectedStateIndex(0);
    setInjectedFailure(null);
    setEventLogs(['%BGP-5-ADJCHANGE: neighbor 203.0.113.2 initialized in Idle state']);
  };

  const injectFailure = (type: 'tcp-drop' | 'asn-mismatch' | 'hold-expire') => {
    setAutoPlaying(false);
    if (type === 'tcp-drop') {
      const activeIdx = BGP_STATES.findIndex((s) => s.name === 'Active');
      setSelectedStateIndex(activeIdx);
      setInjectedFailure('TCP SYN timed out: port 179 unreachable or filtered by ACL on 203.0.113.2.');
      setEventLogs((logs) => [
        '%TCP-6-TIMEOUT: Connection attempt to 203.0.113.2:179 failed [Connect -> Active loop]',
        ...logs,
      ].slice(0, 8));
    } else if (type === 'asn-mismatch') {
      const idleIdx = BGP_STATES.findIndex((s) => s.name === 'Idle');
      setSelectedStateIndex(idleIdx);
      setCurrentStepIndex(0);
      setInjectedFailure('NOTIFICATION: Bad Peer AS (Code 2, Subcode 2). Configured remote-as 13335 != peer actual AS 64599.');
      setEventLogs((logs) => [
        '%BGP-3-NOTIFICATION: sent to neighbor 203.0.113.2 (2/2: Bad Peer AS) [Session Reset to Idle]',
        ...logs,
      ].slice(0, 8));
    } else if (type === 'hold-expire') {
      const idleIdx = BGP_STATES.findIndex((s) => s.name === 'Idle');
      setSelectedStateIndex(idleIdx);
      setCurrentStepIndex(0);
      setInjectedFailure('Hold Timer Expired (90s): no KEEPALIVE received. Transmitted NOTIFICATION Code 4.');
      setEventLogs((logs) => [
        '%BGP-3-NOTIFICATION: neighbor 203.0.113.2 (4/0: Hold Timer Expired) [Tear-down -> Idle]',
        ...logs,
      ].slice(0, 8));
    }
  };

  return (
    <section id="fsm" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#283231]">
      {/* Chapter Kicker */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">03</span>
          <span aria-hidden="true">·</span>
          <span>Deterministic State Engine</span>
          <span aria-hidden="true">·</span>
          <span>RFC 4271 §8</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF2EF]">
          The Six BGP Neighbor States
        </h2>
        <p className="mt-3 text-sm text-[#98A5A2] leading-relaxed">
          Before two BGP routers can exchange routing tables, they must traverse a strict finite state machine.
          Each state validates an operational prerequisite: transport socket formation, identity verification, parameter negotiation, and mutual heartbeat acknowledgment.
        </p>
      </div>

      {/* Interactive FSM Navigation Bar & Pipeline Diagram */}
      <div className="mb-8 rounded-xl border border-[#283231] bg-[#101516] p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#D2F27C]" />
            <span className="font-mono text-xs font-medium text-[#EEF2EF]">
              Finite State Machine Progression Pipeline
            </span>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStepBack}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1.5 rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EEF2EF] disabled:opacity-40"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Step Back</span>
            </button>
            <button
              onClick={handleStepForward}
              disabled={currentStepIndex >= FSM_WALKTHROUGH_STEPS.length - 1}
              className="flex items-center gap-1.5 rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#D2F27C] hover:border-[#D2F27C]/40 disabled:opacity-40"
            >
              <span>Step Next</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              onClick={() => setAutoPlaying(!autoPlaying)}
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
                autoPlaying
                  ? 'border-[#D2F27C]/50 bg-[#D2F27C]/15 text-[#D2F27C]'
                  : 'border-[#283231] bg-[#151C1D] text-[#EEF2EF]'
              }`}
            >
              <Play className="h-3 w-3" />
              <span>{autoPlaying ? 'Pause Walk' : 'Auto Play'}</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EEF2EF]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 6-State Pipeline Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {BGP_STATES.map((st, idx) => {
            const isActive = selectedStateIndex === idx;
            const isTarget = activeStep.toState === st.name;
            return (
              <button
                key={st.name}
                onClick={() => {
                  setSelectedStateIndex(idx);
                  setAutoPlaying(false);
                }}
                className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'border-[#D2F27C] bg-[#151C1D] shadow-[0_0_15px_rgba(210,242,124,0.08)]'
                    : 'border-[#283231] bg-[#101516] hover:bg-[#151C1D]/60'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                  <span className={isActive ? 'text-[#D2F27C]' : 'text-[#98A5A2]'}>
                    State 0{st.number}
                  </span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D2F27C]" />
                  )}
                </div>
                <div className="font-bold text-sm text-[#EEF2EF]">{st.name}</div>
                <div className="mt-1 text-[11px] text-[#98A5A2] line-clamp-2 leading-tight">
                  {st.summary}
                </div>
              </button>
            );
          })}
        </div>

        {/* Failure Injection Drawer */}
        <div className="mt-4 pt-4 border-t border-[#283231] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#98A5A2] font-mono">
            <AlertTriangle className="h-3.5 w-3.5 text-[#EF8A78]" />
            <span>Simulate Anomaly:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => injectFailure('tcp-drop')}
              className="rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EF8A78] hover:border-[#EF8A78]/30 transition-colors"
            >
              TCP 179 Drop (Active loop)
            </button>
            <button
              onClick={() => injectFailure('asn-mismatch')}
              className="rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EF8A78] hover:border-[#EF8A78]/30 transition-colors"
            >
              Bad Remote AS (Reset to Idle)
            </button>
            <button
              onClick={() => injectFailure('hold-expire')}
              className="rounded border border-[#283231] bg-[#151C1D] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EF8A78] hover:border-[#EF8A78]/30 transition-colors"
            >
              Hold Timer Expire (Reset to Idle)
            </button>
          </div>
        </div>

        {/* Injected Failure Alert Banner */}
        {injectedFailure && (
          <div className="mt-3 rounded-md border border-[#EF8A78]/40 bg-[#EF8A78]/10 p-3 text-xs text-[#EEF2EF] flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#EF8A78] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#EF8A78]">Protocol Anomaly Triggered: </span>
              <span>{injectedFailure}</span>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Deep Inspection Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: State Dossier */}
        <div className="lg:col-span-7 rounded-xl border border-[#283231] bg-[#101516] p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[#283231] pb-4">
            <div>
              <span className="text-xs font-mono text-[#D2F27C]">
                State 0{activeState.number} / 06
              </span>
              <h3 className="text-2xl font-bold text-[#EEF2EF] mt-0.5">{activeState.name}</h3>
            </div>
            <div className="text-right">
              <span className="block text-[11px] font-mono text-[#98A5A2]">Transport Socket</span>
              <span className="font-mono text-xs font-medium text-[#D2F27C]">{activeState.tcpStatus}</span>
            </div>
          </div>

          <p className="text-sm text-[#98A5A2] leading-relaxed">
            {activeState.detailedDescription}
          </p>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded border border-[#283231] bg-[#151C1D] p-3">
              <div className="text-[11px] font-mono text-[#98A5A2] mb-1">Messages Transmitted</div>
              <div className="text-xs font-mono text-[#EEF2EF]">
                {activeState.messagesSent.join(', ')}
              </div>
            </div>
            <div className="rounded border border-[#283231] bg-[#151C1D] p-3">
              <div className="text-[11px] font-mono text-[#98A5A2] mb-1">Expected Messages Received</div>
              <div className="text-xs font-mono text-[#EEF2EF]">
                {activeState.messagesReceived.join(', ')}
              </div>
            </div>
          </div>

          {/* Active Timers */}
          <div className="rounded border border-[#283231] bg-[#151C1D] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#98A5A2] mb-1">
              <Clock className="h-3 w-3 text-[#A6C955]" />
              <span>Active Timers &amp; Thresholds</span>
            </div>
            <div className="text-xs font-mono text-[#D2F27C]">
              {activeState.activeTimers.join(' · ')}
            </div>
          </div>

          {/* Valid Next State Transitions */}
          <div>
            <span className="block text-xs font-mono text-[#98A5A2] mb-2">
              Valid Outbound State Transitions
            </span>
            <div className="space-y-2">
              {activeState.nextPossibleStates.map((tran, i) => (
                <div
                  key={i}
                  className={`rounded border p-2.5 text-xs flex items-start gap-2.5 ${
                    tran.isErrorPath
                      ? 'border-[#283231] bg-[#151C1D]/60 text-[#98A5A2]'
                      : 'border-[#283231] bg-[#151C1D] text-[#EEF2EF]'
                  }`}
                >
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                      tran.isErrorPath
                        ? 'text-[#EF8A78] bg-[#EF8A78]/10'
                        : 'text-[#D2F27C] bg-[#D2F27C]/10'
                    }`}
                  >
                    ➔ {tran.target}
                  </span>
                  <span className="leading-relaxed">{tran.condition}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Field Note */}
          {activeState.troubleshootingNote && (
            <div className="rounded-lg border border-[#283231] bg-[#151C1D] p-3 text-xs text-[#98A5A2] flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-[#D2F27C] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#EEF2EF] font-medium">Field Diagnostic Note: </strong>
                {activeState.troubleshootingNote}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Live Walkthrough & Router Syslog Console */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Step Walkthrough Box */}
          <div className="rounded-xl border border-[#283231] bg-[#101516] p-5">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <span className="text-[#D2F27C]">
                Simulation Step {activeStep.stepNumber} / {FSM_WALKTHROUGH_STEPS.length}
              </span>
              <span className="text-[#98A5A2]">{activeStep.rfcReference}</span>
            </div>
            <h4 className="text-base font-bold text-[#EEF2EF]">{activeStep.event}</h4>
            <div className="mt-2 text-xs font-mono flex items-center gap-2 text-[#98A5A2]">
              <span>Transition:</span>
              <span className="text-[#EEF2EF] font-semibold">{activeStep.fromState}</span>
              <span>➔</span>
              <span className="text-[#D2F27C] font-semibold">{activeStep.toState}</span>
            </div>
            <p className="mt-3 text-xs text-[#98A5A2] leading-relaxed border-t border-[#283231] pt-3">
              {activeStep.technicalAction}
            </p>
          </div>

          {/* Router Syslog Emulator */}
          <div className="rounded-xl border border-[#283231] bg-[#080B0C] p-4">
            <div className="flex items-center justify-between border-b border-[#283231] pb-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#EEF2EF]">
                <Terminal className="h-3.5 w-3.5 text-[#D2F27C]" />
                <span>Enterprise Edge Console (AS 65001)</span>
              </div>
              <span className="text-[10px] font-mono text-[#98A5A2]">Buffered Logging</span>
            </div>
            <div className="font-mono text-[11px] space-y-1.5 text-[#EEF2EF]/90 max-h-48 overflow-y-auto">
              {eventLogs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    log.includes('NOTIFICATION') || log.includes('TIMEOUT')
                      ? 'text-[#EF8A78]'
                      : log.includes('Up') || log.includes('Established')
                      ? 'text-[#D2F27C]'
                      : 'text-[#98A5A2]'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
