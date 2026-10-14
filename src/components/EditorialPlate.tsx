/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, Network, Server, ArrowLeftRight, Activity, Globe, Building2, Cloud } from 'lucide-react';
import plateImg from '../assets/images/relatable_bgp_peering_plate_1791987109530.jpg';

interface EditorialPlateProps {
  reducedMotion: boolean;
}

interface PeeringScenario {
  id: string;
  name: string;
  tag: string;
  icon: typeof Building2;
  localRouter: {
    name: string;
    as: string;
    asName: string;
    ip: string;
    rid: string;
    interface: string;
  };
  remoteRouter: {
    name: string;
    as: string;
    asName: string;
    ip: string;
    rid: string;
    interface: string;
  };
  linkType: string;
  peeringSubnet: string;
  description: string;
}

const PEERING_SCENARIOS: PeeringScenario[] = [
  {
    id: 'enterprise-cloudflare',
    name: 'Enterprise Edge ↔ Cloudflare Global Transit',
    tag: 'eBGP Peering',
    icon: Building2,
    localRouter: {
      name: 'edge-gw-01.enterprise.net',
      as: 'AS 65001',
      asName: 'Enterprise Private ASN',
      ip: '203.0.113.1',
      rid: '10.254.1.1',
      interface: 'GigabitEthernet0/0/0',
    },
    remoteRouter: {
      name: 'cloudflare-lon01.anycast.net',
      as: 'AS 13335',
      asName: 'Cloudflare Global Network',
      ip: '203.0.113.2',
      rid: '1.1.1.1',
      interface: 'GigabitEthernet0/0/0',
    },
    linkType: '10G Dedicated Fiber Cross-Connect (Direct eBGP)',
    peeringSubnet: '203.0.113.0/30 (Point-to-Point)',
    description:
      'The classic enterprise multi-homed topology. The enterprise router advertises customer IP blocks via BGP to Cloudflare for DDoS protection and global Anycast routing.',
  },
  {
    id: 'ixp-peering',
    name: 'Public IXP Peering: Google ↔ NTT Tier-1',
    tag: 'IXP Exchange Fabric',
    icon: Globe,
    localRouter: {
      name: 'google-edge-01.lhr',
      as: 'AS 15169',
      asName: 'Google Global Cache',
      ip: '195.66.224.12',
      rid: '8.8.8.8',
      interface: 'TenGigabitEthernet1/1',
    },
    remoteRouter: {
      name: 'ntt-transit-01.lon',
      as: 'AS 2914',
      asName: 'NTT Global IP Network',
      ip: '195.66.224.45',
      rid: '129.250.0.1',
      interface: 'TenGigabitEthernet1/2',
    },
    linkType: '100G Shared IXP Peering Fabric (LINX / Equinix)',
    peeringSubnet: '195.66.224.0/24 (Shared Exchange LAN)',
    description:
      'Settlement-free bilateral peering at an Internet Exchange Point. High-capacity optical fabrics allow Tier-1 providers to exchange petabytes directly without transit transit fees.',
  },
  {
    id: 'hybrid-cloud',
    name: 'Hybrid Cloud: On-Prem Data Center ↔ AWS Direct Connect',
    tag: 'Private Cloud Cross-Connect',
    icon: Cloud,
    localRouter: {
      name: 'corp-dc-core01.ny',
      as: 'AS 64512',
      asName: 'On-Premises Data Center',
      ip: '169.254.100.1',
      rid: '172.16.0.1',
      interface: 'Port-Channel1.100',
    },
    remoteRouter: {
      name: 'aws-dx-gw.us-east-1',
      as: 'AS 16509',
      asName: 'Amazon Web Services',
      ip: '169.254.100.2',
      rid: '169.254.100.2',
      interface: 'VLAN-100',
    },
    linkType: 'AWS Direct Connect Private Virtual Interface (VIF)',
    peeringSubnet: '169.254.100.0/30 (Link-Local /30)',
    description:
      'Private cloud peering connecting internal enterprise VPC workloads with corporate headquarters, running eBGP over dedicated colocation cross-connects.',
  },
];

export const EditorialPlate: React.FC<EditorialPlateProps> = ({ reducedMotion }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('enterprise-cloudflare');
  const [activeSignalType, setActiveSignalType] = useState<'OPEN' | 'UPDATE' | 'KEEPALIVE' | 'NOTIFICATION'>('OPEN');
  const [inspectedElement, setInspectedElement] = useState<'link' | 'local' | 'remote' | 'tcp'>('link');

  const currentScenario =
    PEERING_SCENARIOS.find((s) => s.id === selectedScenarioId) || PEERING_SCENARIOS[0];

  const getSignalDetails = () => {
    switch (activeSignalType) {
      case 'OPEN':
        return {
          title: 'OPEN Message (Type 1)',
          color: '#D2F27C',
          badgeColor: 'text-[#D2F27C] border-[#D2F27C]/30 bg-[#D2F27C]/5',
          desc: `Negotiating ASN parameters (${currentScenario.localRouter.as} ↔ ${currentScenario.remoteRouter.as}), BGP Identifiers (${currentScenario.localRouter.rid} & ${currentScenario.remoteRouter.rid}), and Hold Time (90s).`,
          port: 'TCP 179 ➔ 179',
          size: '61 Octets',
        };
      case 'UPDATE':
        return {
          title: 'UPDATE Message (Type 2)',
          color: '#A6C955',
          badgeColor: 'text-[#A6C955] border-[#A6C955]/30 bg-[#A6C955]/5',
          desc: `Announcing IP prefix reachability: local routes advertised with AS_PATH [${currentScenario.localRouter.as.replace('AS ', '')}] and NEXT_HOP ${currentScenario.localRouter.ip}.`,
          port: 'TCP 179 Stream',
          size: '44+ Octets',
        };
      case 'KEEPALIVE':
        return {
          title: 'KEEPALIVE Message (Type 4)',
          color: '#D2F27C',
          badgeColor: 'text-[#D2F27C] border-[#D2F27C]/30 bg-[#D2F27C]/5',
          desc: 'Periodic 19-octet liveness heartbeat sent every 30 seconds (1/3 of Hold Time) when no updates are flowing.',
          port: 'Interval: 30s',
          size: '19 Octets',
        };
      case 'NOTIFICATION':
        return {
          title: 'NOTIFICATION Message (Type 3)',
          color: '#EF8A78',
          badgeColor: 'text-[#EF8A78] border-[#EF8A78]/30 bg-[#EF8A78]/10',
          desc: 'Error signaling & immediate teardown. Closes TCP socket and transitions both peers unconditionally back to Idle.',
          port: 'Teardown Trigger',
          size: '23 Octets',
        };
    }
  };

  const signal = getSignalDetails();

  return (
    <section id="architecture" className="relative mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      {/* Editorial Chapter Header */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">01</span>
          <span aria-hidden="true">·</span>
          <span>Layer 3 Inter-Domain Substrate</span>
          <span aria-hidden="true">·</span>
          <span>Autonomous System Peering</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#EEF2EF] [text-wrap:balance]">
          Introduction to BGP Messages &amp; Neighbor States
        </h1>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#98A5A2]">
          Border Gateway Protocol (RFC 4271) binds independent Autonomous Systems across the globe.
          Explore the real-world peering topology below to trace state transitions, inspect live packet handshakes, and verify neighbor formation over reliable TCP port 179.
        </p>
      </div>

      {/* Relatable Scenario Switcher Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-xs text-[#98A5A2] flex items-center gap-1.5">
          <ArrowLeftRight className="h-3.5 w-3.5 text-[#D2F27C]" />
          <span>Select Relatable Peering Scenario:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {PEERING_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'border-[#D2F27C] bg-[#151C1D] text-[#D2F27C] shadow-sm font-semibold'
                    : 'border-[#283231] bg-[#101516] text-[#98A5A2] hover:text-[#EEF2EF]'
                }`}
              >
                <span>{sc.tag}</span>
                <span className="text-[10px] opacity-70">
                  ({sc.localRouter.as} ↔ {sc.remoteRouter.as})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Architectural Container: Layered Peering Topology Stage */}
      <div className="relative overflow-hidden rounded-xl border border-[#283231] bg-[#101516] shadow-2xl">
        {/* Top Status & Scenario Info Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#283231] bg-[#151C1D]/80 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Network className="h-4 w-4 text-[#D2F27C]" />
            <span className="font-mono text-xs font-medium text-[#EEF2EF]">
              {currentScenario.name}
            </span>
            <span className="text-xs text-[#98A5A2] hidden md:inline">
              · Subnet: {currentScenario.peeringSubnet}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#D2F27C] bg-[#D2F27C]/10 border border-[#D2F27C]/30 px-2 py-0.5 rounded">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D2F27C]" />
              BGP Session: ESTABLISHED
            </span>
          </div>
        </div>

        {/* The Visual Graphic Stage */}
        <div className="relative aspect-[16/9] w-full max-h-[580px] overflow-hidden bg-[#080B0C]">
          {/* Base Technical Image: Relatable Router Chassis & Optical Interconnect */}
          <img
            src={plateImg}
            alt="7LayerX BGP Autonomous System Peering Topology Diagram"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center transition-opacity duration-700"
          />

          {/* Dark scrim overlay with subtle radial gradient */}
          <div className="pointer-events-none absolute inset-0 bg-radial-[at_center_center] from-transparent via-[#080B0C]/40 to-[#080B0C]/85" />

          {/* Hairline Grid Accent Rules */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#283231_1px,transparent_1px),linear-gradient(to_bottom,#283231_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

          {/* Subtle Lime Light Sweep (Restrained, loopable, toggled by reduced motion) */}
          {!reducedMotion && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="animate-signal-sweep h-[120%] w-full bg-gradient-to-b from-transparent via-[#D2F27C]/[0.04] to-transparent" />
            </div>
          )}

          {/* Precision SVG Technical Overlay for Relatable Router Nodes, Interface IPs, and Peering Paths */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 1000 562"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Fine coordinate rule markers */}
            <line x1="60" y1="40" x2="940" y2="40" stroke="#283231" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="60" y1="520" x2="940" y2="520" stroke="#283231" strokeWidth="1" strokeDasharray="4 4" />

            {/* Left Node: Local Autonomous System (Router A) */}
            <g className="transition-all duration-300">
              <rect x="70" y="110" width="280" height="150" rx="10" fill="#101516" stroke="#283231" strokeWidth="1.5" />
              <rect x="70" y="110" width="280" height="28" rx="8" fill="#151C1D" />
              <circle cx="92" cy="124" r="4" fill="#D2F27C" />
              <text x="108" y="128" fill="#EEF2EF" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="600">
                {currentScenario.localRouter.as} · {currentScenario.localRouter.asName}
              </text>
              <text x="86" y="160" fill="#EEF2EF" fontSize="13" fontFamily="Plus Jakarta Sans" fontWeight="700">
                {currentScenario.localRouter.name}
              </text>
              <text x="86" y="184" fill="#98A5A2" fontSize="11" fontFamily="IBM Plex Mono">
                Router ID: <tspan fill="#D2F27C">{currentScenario.localRouter.rid}</tspan>
              </text>
              <text x="86" y="206" fill="#98A5A2" fontSize="11" fontFamily="IBM Plex Mono">
                Interface: {currentScenario.localRouter.interface}
              </text>
              <text x="86" y="232" fill="#D2F27C" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">
                IP: {currentScenario.localRouter.ip}
              </text>
            </g>

            {/* Right Node: Remote Autonomous System (Router B) */}
            <g className="transition-all duration-300">
              <rect x="650" y="110" width="280" height="150" rx="10" fill="#101516" stroke="#283231" strokeWidth="1.5" />
              <rect x="650" y="110" width="280" height="28" rx="8" fill="#151C1D" />
              <circle cx="672" cy="124" r="4" fill="#D2F27C" />
              <text x="688" y="128" fill="#EEF2EF" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="600">
                {currentScenario.remoteRouter.as} · {currentScenario.remoteRouter.asName}
              </text>
              <text x="666" y="160" fill="#EEF2EF" fontSize="13" fontFamily="Plus Jakarta Sans" fontWeight="700">
                {currentScenario.remoteRouter.name}
              </text>
              <text x="666" y="184" fill="#98A5A2" fontSize="11" fontFamily="IBM Plex Mono">
                Router ID: <tspan fill="#D2F27C">{currentScenario.remoteRouter.rid}</tspan>
              </text>
              <text x="666" y="206" fill="#98A5A2" fontSize="11" fontFamily="IBM Plex Mono">
                Interface: {currentScenario.remoteRouter.interface}
              </text>
              <text x="666" y="232" fill="#D2F27C" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">
                IP: {currentScenario.remoteRouter.ip}
              </text>
            </g>

            {/* Inter-AS Optical Fiber Peering Link */}
            <path
              d="M 350 185 L 650 185"
              stroke="#283231"
              strokeWidth="4"
            />
            <path
              d="M 350 185 L 650 185"
              stroke={activeSignalType === 'NOTIFICATION' ? '#EF8A78' : '#D2F27C'}
              strokeWidth="1.5"
              opacity="0.3"
            />

            {/* Animated Signal Flow along the Interconnect */}
            {!reducedMotion ? (
              <path
                d="M 350 185 L 650 185"
                stroke={activeSignalType === 'NOTIFICATION' ? '#EF8A78' : '#D2F27C'}
                strokeWidth="2.5"
                strokeDasharray="8 12"
                className="animate-signal-flow opacity-90"
              />
            ) : (
              <path
                d="M 350 185 L 650 185"
                stroke={activeSignalType === 'NOTIFICATION' ? '#EF8A78' : '#D2F27C'}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            )}

            {/* Center Peering Point Badge (TCP 179 Socket) */}
            <g>
              <rect x="420" y="160" width="160" height="50" rx="8" fill="#101516" stroke="#283231" strokeWidth="1.5" />
              <text x="500" y="181" textAnchor="middle" fill="#EEF2EF" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="600">
                TCP Port 179 Pipe
              </text>
              <text x="500" y="198" textAnchor="middle" fill="#98A5A2" fontSize="10" fontFamily="IBM Plex Mono">
                eBGP Subnet: /30
              </text>
            </g>

            {/* Bottom Autonomous System Demarcation Line */}
            <line x1="500" y1="40" x2="500" y2="150" stroke="#283231" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="500" y1="220" x2="500" y2="520" stroke="#283231" strokeWidth="1" strokeDasharray="3 3" />
            <text x="500" y="240" textAnchor="middle" fill="#98A5A2" fontSize="9" fontFamily="IBM Plex Mono">
              AS BOUNDARY DEMARCATION
            </text>
          </svg>

          {/* Interactive Floating Signal Probe Panel */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md rounded-lg border border-[#283231] bg-[#101516]/95 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#98A5A2]">
                Active Signal Inspection
              </span>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded border ${signal.badgeColor}`}>
                {signal.size}
              </span>
            </div>

            <div className="text-sm font-semibold text-[#EEF2EF]">{signal.title}</div>
            <p className="mt-1 text-xs text-[#98A5A2] leading-relaxed">
              {signal.desc}
            </p>

            {/* Signal Selector Buttons */}
            <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#283231]">
              {(['OPEN', 'UPDATE', 'KEEPALIVE', 'NOTIFICATION'] as const).map((msg) => (
                <button
                  key={msg}
                  onClick={() => setActiveSignalType(msg)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    activeSignalType === msg
                      ? msg === 'NOTIFICATION'
                        ? 'bg-[#EF8A78]/20 text-[#EF8A78] border border-[#EF8A78]/40'
                        : 'bg-[#D2F27C]/20 text-[#D2F27C] border border-[#D2F27C]/40'
                      : 'bg-[#151C1D] text-[#98A5A2] hover:text-[#EEF2EF] border border-[#283231]'
                  }`}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Top-Right Telemetry Data Point */}
          <div className="hidden sm:block absolute top-4 right-4 rounded-md border border-[#283231] bg-[#101516]/90 px-3 py-2 font-mono text-[11px] text-[#98A5A2] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#EEF2EF]">Transport:</span>
              <span className="text-[#D2F27C]">TCP 179</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[#EEF2EF]">Hold Time:</span>
              <span className="tabular-nums">90s / Keepalive 30s</span>
            </div>
          </div>
        </div>

        {/* Bottom Technical Strip: The 3 Core Peering Tenets */}
        <div className="grid grid-cols-1 divide-y divide-[#283231] border-t border-[#283231] bg-[#101516] sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D2F27C] mb-1">
              <Server className="h-3.5 w-3.5" />
              <span>Direct Link Peering (/30 Subnet)</span>
            </div>
            <p className="text-xs text-[#98A5A2] leading-relaxed">
              Standard eBGP sessions run directly between interfaces on a /30 or /31 subnet with default TTL=1. Packets must not traverse intermediate hops without eBGP multihop.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A6C955] mb-1">
              <Network className="h-3.5 w-3.5" />
              <span>Independent AS Governance</span>
            </div>
            <p className="text-xs text-[#98A5A2] leading-relaxed">
              Each router maintains its own routing policy, local preference, and filters. Peering allows exchanging routes without relinquishing internal routing control.
            </p>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#D2F27C] mb-1">
              <Activity className="h-3.5 w-3.5" />
              <span>Loop-Free Path Vector</span>
            </div>
            <p className="text-xs text-[#98A5A2] leading-relaxed">
              When {currentScenario.localRouter.as} prepends its ASN to the AS_PATH, any router receiving the update that sees its own ASN will silently drop it, guaranteeing loop freedom.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
