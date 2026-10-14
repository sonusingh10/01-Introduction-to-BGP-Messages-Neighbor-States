/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Play,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export interface AsNode extends d3.SimulationNodeDatum {
  id: string;
  asn: number;
  name: string;
  tier: 'Origin' | 'Transit Tier-1' | 'Cloud / IXP' | 'Destination';
  role: string;
  routerId: string;
  defaultX: number;
  defaultY: number;
  prefixesHeld?: string[];
}

export interface AsLink extends d3.SimulationLinkDatum<AsNode> {
  source: string | AsNode;
  target: string | AsNode;
  id: string;
  latency: string;
  capacity: string;
  isPrimary?: boolean;
}

const NODES_DATA: AsNode[] = [
  {
    id: 'AS65001',
    asn: 65001,
    name: 'Enterprise DC',
    tier: 'Origin',
    role: 'Originating Autonomous System',
    routerId: '10.254.1.1',
    defaultX: 120,
    defaultY: 260,
    prefixesHeld: ['203.0.113.0/24'],
  },
  {
    id: 'AS13335',
    asn: 13335,
    name: 'Cloudflare Transit',
    tier: 'Cloud / IXP',
    role: 'Upstream Transit & Anycast',
    routerId: '1.1.1.1',
    defaultX: 360,
    defaultY: 150,
  },
  {
    id: 'AS6939',
    asn: 6939,
    name: 'Hurricane Electric',
    tier: 'Cloud / IXP',
    role: 'Secondary Upstream ISP',
    routerId: '184.105.0.1',
    defaultX: 360,
    defaultY: 370,
  },
  {
    id: 'AS2914',
    asn: 2914,
    name: 'NTT Global Tier-1',
    tier: 'Transit Tier-1',
    role: 'Global Backbone Tier-1',
    routerId: '129.250.0.1',
    defaultX: 620,
    defaultY: 150,
  },
  {
    id: 'AS3356',
    asn: 3356,
    name: 'Lumen (Level 3)',
    tier: 'Transit Tier-1',
    role: 'Global Backbone Tier-1',
    routerId: '4.69.0.1',
    defaultX: 620,
    defaultY: 370,
  },
  {
    id: 'AS64512',
    asn: 64512,
    name: 'Destination AS',
    tier: 'Destination',
    role: 'Receiving Autonomous System',
    routerId: '192.0.2.1',
    defaultX: 860,
    defaultY: 260,
  },
];

const LINKS_DATA: AsLink[] = [
  { source: 'AS65001', target: 'AS13335', id: 'l1', latency: '2ms', capacity: '100 Gbps', isPrimary: true },
  { source: 'AS65001', target: 'AS6939', id: 'l2', latency: '4ms', capacity: '10 Gbps', isPrimary: false },
  { source: 'AS13335', target: 'AS2914', id: 'l3', latency: '12ms', capacity: '400 Gbps', isPrimary: true },
  { source: 'AS6939', target: 'AS3356', id: 'l4', latency: '15ms', capacity: '100 Gbps', isPrimary: false },
  { source: 'AS2914', target: 'AS64512', id: 'l5', latency: '8ms', capacity: '100 Gbps', isPrimary: true },
  { source: 'AS3356', target: 'AS64512', id: 'l6', latency: '14ms', capacity: '40 Gbps', isPrimary: false },
  // Cross-link
  { source: 'AS2914', target: 'AS3356', id: 'l7', latency: '6ms', capacity: '400 Gbps', isPrimary: false },
];

export const AsPathVisualizer: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Simulation Controls State
  const [selectedPathMode, setSelectedPathMode] = useState<'primary' | 'backup' | 'prepending' | 'loop'>('primary');
  const [prependCount, setPrependCount] = useState<number>(2);
  const [activeHopIndex, setActiveHopIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<AsNode | null>(NODES_DATA[0]);

  // Define paths based on mode
  const currentPathSequence = useMemo(() => {
    switch (selectedPathMode) {
      case 'primary':
        return [
          { asn: 65001, id: 'AS65001', name: 'Enterprise DC', linkId: 'l1' },
          { asn: 13335, id: 'AS13335', name: 'Cloudflare', linkId: 'l3' },
          { asn: 2914, id: 'AS2914', name: 'NTT Tier-1', linkId: 'l5' },
          { asn: 64512, id: 'AS64512', name: 'Destination AS', linkId: null },
        ];
      case 'backup':
        return [
          { asn: 65001, id: 'AS65001', name: 'Enterprise DC', linkId: 'l2' },
          { asn: 6939, id: 'AS6939', name: 'Hurricane Electric', linkId: 'l4' },
          { asn: 3356, id: 'AS3356', name: 'Lumen Tier-1', linkId: 'l6' },
          { asn: 64512, id: 'AS64512', name: 'Destination AS', linkId: null },
        ];
      case 'prepending':
        return [
          { asn: 65001, id: 'AS65001', name: 'Enterprise DC (Prepending Active)', linkId: 'l2' },
          { asn: 6939, id: 'AS6939', name: 'Hurricane Electric', linkId: 'l4' },
          { asn: 3356, id: 'AS3356', name: 'Lumen Tier-1', linkId: 'l6' },
          { asn: 64512, id: 'AS64512', name: 'Destination AS', linkId: null },
        ];
      case 'loop':
        return [
          { asn: 65001, id: 'AS65001', name: 'Enterprise DC', linkId: 'l1' },
          { asn: 13335, id: 'AS13335', name: 'Cloudflare', linkId: 'l3' },
          { asn: 2914, id: 'AS2914', name: 'NTT Tier-1', linkId: 'l7' },
          { asn: 3356, id: 'AS3356', name: 'Lumen Tier-1', linkId: 'l4' },
          { asn: 6939, id: 'AS6939', name: 'Hurricane Electric', linkId: 'l2' },
          { asn: 65001, id: 'AS65001', name: 'Enterprise DC (LOOP DETECTED)', linkId: null, isLoopNode: true },
        ];
    }
  }, [selectedPathMode]);

  // Compute live AS_PATH attribute array for current hop
  const currentAsPathArray = useMemo(() => {
    const sequenceSoFar = currentPathSequence.slice(0, activeHopIndex + 1);
    const asList: number[] = [];

    sequenceSoFar.forEach((step, idx) => {
      if (idx === 0) {
        // Origin node
        if (selectedPathMode === 'prepending') {
          // Prepend extra copies of 65001
          for (let p = 0; p < prependCount + 1; p++) {
            asList.unshift(step.asn);
          }
        } else {
          asList.unshift(step.asn);
        }
      } else {
        // At each eBGP boundary, the sending/receiving AS is prepended
        asList.unshift(step.asn);
      }
    });

    return asList;
  }, [currentPathSequence, activeHopIndex, selectedPathMode, prependCount]);

  const hasLoop = selectedPathMode === 'loop' && activeHopIndex === currentPathSequence.length - 1;

  // Auto-play animation timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveHopIndex((prev) => {
          if (prev >= currentPathSequence.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentPathSequence.length]);

  // D3 Visualization Render
  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1000;
    const height = 520;
    const svg = d3.select(svgRef.current);

    svg.selectAll('*').remove();

    // Create container group for D3 zoom
    const g = svg.append('g').attr('class', 'main-container');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial transform center
    svg.call(zoom.transform, d3.zoomIdentity.translate(20, 20).scale(0.95));

    // Defs for gradients, markers, and glows
    const defs = g.append('defs');

    // Marker for arrowheads
    defs
      .append('marker')
      .attr('id', 'arrow-lime')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#D2F27C');

    defs
      .append('marker')
      .attr('id', 'arrow-coral')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#EF8A78');

    // Subtle background grid
    const gridG = g.append('g').attr('class', 'grid').attr('opacity', 0.15);
    for (let x = 0; x <= width; x += 50) {
      gridG
        .append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', '#283231')
        .attr('stroke-width', 1);
    }
    for (let y = 0; y <= height; y += 50) {
      gridG
        .append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', '#283231')
        .attr('stroke-width', 1);
    }

    // Node map lookup for links
    const nodeMap = new Map<string, AsNode>();
    NODES_DATA.forEach((n) => nodeMap.set(n.id, n));

    // Render Links
    const linksGroup = g.append('g').attr('class', 'links');

    LINKS_DATA.forEach((link) => {
      const src = nodeMap.get(link.source as string)!;
      const tgt = nodeMap.get(link.target as string)!;

      // Check if this link is part of the currently active path sequence
      const isHopActive = currentPathSequence.slice(0, activeHopIndex).some((step, idx) => {
        const nextStep = currentPathSequence[idx + 1];
        if (!nextStep) return false;
        return (
          (step.id === src.id && nextStep.id === tgt.id) ||
          (step.id === tgt.id && nextStep.id === src.id)
        );
      });

      // Base link line
      linksGroup
        .append('line')
        .attr('x1', src.defaultX)
        .attr('y1', src.defaultY)
        .attr('x2', tgt.defaultX)
        .attr('y2', tgt.defaultY)
        .attr('stroke', isHopActive ? (hasLoop ? '#EF8A78' : '#D2F27C') : '#283231')
        .attr('stroke-width', isHopActive ? 3 : 1.5)
        .attr('stroke-dasharray', isHopActive ? 'none' : '4 4')
        .attr('opacity', isHopActive ? 0.9 : 0.4);

      // Animated packet pulse on active link
      if (isHopActive) {
        linksGroup
          .append('circle')
          .attr('r', 4)
          .attr('fill', hasLoop ? '#EF8A78' : '#D2F27C')
          .append('animateMotion')
          .attr('path', `M${src.defaultX},${src.defaultY} L${tgt.defaultX},${tgt.defaultY}`)
          .attr('dur', '1.6s')
          .attr('repeatCount', 'indefinite');
      }

      // Link latency & bandwidth text label
      const midX = (src.defaultX + tgt.defaultX) / 2;
      const midY = (src.defaultY + tgt.defaultY) / 2 - 8;

      linksGroup
        .append('text')
        .attr('x', midX)
        .attr('y', midY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#98A5A2')
        .attr('font-size', '9px')
        .attr('font-family', 'IBM Plex Mono')
        .text(`${link.capacity}`);
    });

    // Render Nodes Group
    const nodesGroup = g.append('g').attr('class', 'nodes');

    NODES_DATA.forEach((node) => {
      const isCurrentHop = currentPathSequence[activeHopIndex]?.id === node.id;
      const isTraversed = currentPathSequence.slice(0, activeHopIndex + 1).some((s) => s.id === node.id);
      const isLoopTerminal = hasLoop && node.id === 'AS65001' && activeHopIndex === currentPathSequence.length - 1;

      const nodeG = nodesGroup
        .append('g')
        .attr('transform', `translate(${node.defaultX},${node.defaultY})`)
        .attr('class', 'cursor-pointer')
        .on('click', () => setSelectedNode(node));

      // Glow circle when active
      if (isCurrentHop) {
        nodeG
          .append('circle')
          .attr('r', 46)
          .attr('fill', isLoopTerminal ? '#EF8A78' : '#D2F27C')
          .attr('opacity', 0.12)
          .attr('class', 'animate-pulse');
      }

      // Outer Card Box
      nodeG
        .append('rect')
        .attr('x', -70)
        .attr('y', -38)
        .attr('width', 140)
        .attr('height', 76)
        .attr('rx', 8)
        .attr('fill', isCurrentHop ? '#151C1D' : '#101516')
        .attr('stroke', isLoopTerminal ? '#EF8A78' : isCurrentHop ? '#D2F27C' : isTraversed ? '#A6C955' : '#283231')
        .attr('stroke-width', isCurrentHop ? 2 : 1)
        .attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))');

      // Top Tag Bar
      nodeG
        .append('rect')
        .attr('x', -70)
        .attr('y', -38)
        .attr('width', 140)
        .attr('height', 20)
        .attr('rx', 6)
        .attr('fill', '#151C1D');

      // ASN Label
      nodeG
        .append('text')
        .attr('x', -58)
        .attr('y', -24)
        .attr('fill', isLoopTerminal ? '#EF8A78' : isCurrentHop ? '#D2F27C' : '#EEF2EF')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('font-family', 'IBM Plex Mono')
        .text(`AS ${node.asn}`);

      // Tier badge text
      nodeG
        .append('text')
        .attr('x', 58)
        .attr('y', -24)
        .attr('text-anchor', 'end')
        .attr('fill', '#98A5A2')
        .attr('font-size', '8px')
        .attr('font-family', 'IBM Plex Mono')
        .text(node.tier === 'Transit Tier-1' ? 'Tier-1' : node.tier);

      // Friendly Name
      nodeG
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('fill', '#EEF2EF')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .attr('font-family', 'Plus Jakarta Sans')
        .text(node.name);

      // Router ID / IP Subtext
      nodeG
        .append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#98A5A2')
        .attr('font-size', '9.5px')
        .attr('font-family', 'IBM Plex Mono')
        .text(`RID: ${node.routerId}`);

      // Hop indicator badge
      if (isTraversed) {
        const hopOrder = currentPathSequence.findIndex((s) => s.id === node.id);
        nodeG
          .append('circle')
          .attr('cx', 64)
          .attr('cy', -32)
          .attr('r', 8)
          .attr('fill', isLoopTerminal ? '#EF8A78' : '#D2F27C');

        nodeG
          .append('text')
          .attr('x', 64)
          .attr('y', -29)
          .attr('text-anchor', 'middle')
          .attr('fill', '#080B0C')
          .attr('font-size', '8.5px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'IBM Plex Mono')
          .text(hopOrder + 1);
      }
    });
  }, [currentPathSequence, activeHopIndex, hasLoop]);

  return (
    <section id="aspath" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-[#283231]">
      {/* Chapter Kicker */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2] mb-3">
          <span className="text-[#D2F27C]">06</span>
          <span aria-hidden="true">·</span>
          <span>Path Vector &amp; Loop Prevention</span>
          <span aria-hidden="true">·</span>
          <span>RFC 4271 §5.1.2</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EEF2EF]">
          BGP Route Propagation &amp; AS_PATH Visualizer
        </h2>
        <p className="mt-3 text-sm text-[#98A5A2] leading-relaxed">
          The <span className="font-mono text-[#D2F27C]">AS_PATH</span> attribute is the core path-vector mechanism of BGP.
          As an UPDATE traverses each Autonomous System boundary, each eBGP speaker prepends its own ASN to the path.
          Inspect how routes propagate across multi-tier topologies, how AS prepending steers traffic, and how loops are autonomously prevented.
        </p>
      </div>

      {/* Main Interactive D3 Stage Container */}
      <div className="rounded-xl border border-[#283231] bg-[#101516] shadow-2xl overflow-hidden">
        {/* Scenario & Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#283231] bg-[#151C1D]/80 p-4">
          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-[#98A5A2] mr-1 hidden sm:inline">Scenario:</span>
            <button
              onClick={() => {
                setSelectedPathMode('primary');
                setActiveHopIndex(0);
                setIsPlaying(false);
              }}
              className={`rounded px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                selectedPathMode === 'primary'
                  ? 'bg-[#101516] text-[#D2F27C] border border-[#D2F27C]/40 font-semibold'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Primary Transit (Shortest AS_PATH)
            </button>

            <button
              onClick={() => {
                setSelectedPathMode('backup');
                setActiveHopIndex(0);
                setIsPlaying(false);
              }}
              className={`rounded px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                selectedPathMode === 'backup'
                  ? 'bg-[#101516] text-[#D2F27C] border border-[#D2F27C]/40 font-semibold'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Secondary Transit (Alternative)
            </button>

            <button
              onClick={() => {
                setSelectedPathMode('prepending');
                setActiveHopIndex(0);
                setIsPlaying(false);
              }}
              className={`rounded px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                selectedPathMode === 'prepending'
                  ? 'bg-[#101516] text-[#D2F27C] border border-[#D2F27C]/40 font-semibold'
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              AS-Path Prepending (Traffic Engineering)
            </button>

            <button
              onClick={() => {
                setSelectedPathMode('loop');
                setActiveHopIndex(0);
                setIsPlaying(false);
              }}
              className={`rounded px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
                selectedPathMode === 'loop'
                  ? 'bg-[#EF8A78]/15 text-[#EF8A78] border border-[#EF8A78]/40 font-semibold'
                  : 'text-[#98A5A2] hover:text-[#EF8A78]'
              }`}
            >
              Simulate Routing Loop
            </button>
          </div>

          {/* Stepper & Playback controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveHopIndex((p) => Math.max(0, p - 1))}
              disabled={activeHopIndex === 0}
              className="rounded border border-[#283231] bg-[#101516] px-2.5 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EEF2EF] disabled:opacity-30"
            >
              Step Back
            </button>

            <button
              onClick={() =>
                setActiveHopIndex((p) => Math.min(currentPathSequence.length - 1, p + 1))
              }
              disabled={activeHopIndex >= currentPathSequence.length - 1}
              className="rounded border border-[#283231] bg-[#101516] px-2.5 py-1 text-xs font-mono text-[#D2F27C] hover:border-[#D2F27C]/40 disabled:opacity-30"
            >
              Step Hop
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 rounded border px-3 py-1 text-xs font-mono transition-colors ${
                isPlaying
                  ? 'border-[#D2F27C]/50 bg-[#D2F27C]/15 text-[#D2F27C]'
                  : 'border-[#283231] bg-[#101516] text-[#EEF2EF]'
              }`}
            >
              <Play className="h-3 w-3" />
              <span>{isPlaying ? 'Pause' : 'Propagate Route'}</span>
            </button>

            <button
              onClick={() => {
                setActiveHopIndex(0);
                setIsPlaying(false);
              }}
              className="rounded border border-[#283231] bg-[#101516] px-2 py-1 text-xs font-mono text-[#98A5A2] hover:text-[#EEF2EF]"
              title="Reset Path"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live AS_PATH Header Banner */}
        <div className="border-b border-[#283231] bg-[#080B0C] px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-[#98A5A2]">Advertised Prefix:</span>
            <span className="font-mono text-xs font-semibold text-[#EEF2EF] bg-[#151C1D] border border-[#283231] px-2 py-0.5 rounded">
              203.0.113.0/24
            </span>
            <span className="text-xs font-mono text-[#98A5A2]">·</span>
            <span className="text-xs font-mono text-[#98A5A2]">Current Hop:</span>
            <span className="font-mono text-xs text-[#D2F27C]">
              {activeHopIndex + 1} of {currentPathSequence.length} (At{' '}
              {currentPathSequence[activeHopIndex]?.name})
            </span>
          </div>

          {/* AS Prepend Slider if in prepending mode */}
          {selectedPathMode === 'prepending' && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#D2F27C]">
              <span>Prepend Multiplier:</span>
              <div className="flex items-center gap-1 bg-[#101516] border border-[#283231] rounded px-2 py-0.5">
                {[1, 2, 3].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setPrependCount(val);
                      setActiveHopIndex(0);
                    }}
                    className={`px-1.5 py-0.5 rounded ${
                      prependCount === val ? 'bg-[#D2F27C] text-[#080B0C] font-bold' : 'text-[#98A5A2]'
                    }`}
                  >
                    +{val}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* D3 SVG Interactive Canvas */}
        <div ref={containerRef} className="relative w-full aspect-[16/9] max-h-[520px] bg-[#080B0C] overflow-hidden">
          <svg ref={svgRef} className="h-full w-full" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" />

          {/* Zoom Instruction Hint */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-[#98A5A2] bg-[#101516]/80 px-2 py-1 rounded border border-[#283231] backdrop-blur-sm pointer-events-none">
            Pan &amp; scroll to zoom · Click any AS node for BGP RIB table
          </div>

          {/* Loop Warning Overlay if loop simulated */}
          {hasLoop && (
            <div className="absolute top-4 right-4 max-w-sm rounded-lg border border-[#EF8A78]/50 bg-[#EF8A78]/15 p-3.5 text-xs text-[#EEF2EF] backdrop-blur-md shadow-xl">
              <div className="flex items-center gap-2 font-mono font-bold text-[#EF8A78] mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span>RFC 4271 LOOP PREVENTION TRIGGERED</span>
              </div>
              <p className="leading-relaxed text-[11px] text-[#EEF2EF]/90">
                Router at <strong>AS 65001</strong> inspected the incoming UPDATE’s <code className="text-[#EF8A78]">AS_PATH</code> attribute and discovered its own ASN in the list.
                The route is silently discarded to protect the global routing fabric from black holes and loops.
              </p>
            </div>
          )}
        </div>

        {/* Real-Time AS_PATH Dissector Bar */}
        <div className="border-t border-[#283231] bg-[#101516] p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-[#98A5A2] uppercase tracking-wider">
                RFC 4271 BGP Update · AS_PATH Wire Attribute (Type 0x02)
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="text-[#98A5A2]">AS_SEQUENCE:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentAsPathArray.map((asn, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center rounded border px-2.5 py-1 text-xs font-semibold ${
                        idx === 0
                          ? 'border-[#D2F27C] bg-[#D2F27C]/15 text-[#D2F27C]'
                          : hasLoop && asn === 65001
                          ? 'border-[#EF8A78] bg-[#EF8A78]/20 text-[#EF8A78]'
                          : 'border-[#283231] bg-[#151C1D] text-[#EEF2EF]'
                      }`}
                    >
                      <span>AS {asn}</span>
                      {idx === 0 && (
                        <span className="ml-1.5 text-[9px] text-[#D2F27C] opacity-80">(Head/Latest)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded border border-[#283231] bg-[#151C1D] px-3 py-1.5 font-mono text-xs text-right">
                <span className="block text-[10px] text-[#98A5A2]">Path Length / Hop Count</span>
                <span className="text-sm font-bold text-[#D2F27C] tabular-nums">
                  {currentAsPathArray.length} AS Hops
                </span>
              </div>
            </div>
          </div>

          {/* Deep Engineering Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="rounded border border-[#283231] bg-[#151C1D] p-3 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[#D2F27C] mb-1">
                <GitBranch className="h-3.5 w-3.5" />
                <span>AS_PATH Prepending Mechanism</span>
              </div>
              <p className="text-[#98A5A2] leading-relaxed">
                Notice that new Autonomous Systems prepend to the <strong>left</strong> of the array. When BGP routers compare equal-weight paths, the path with fewer ASNs wins.
              </p>
            </div>

            <div className="rounded border border-[#283231] bg-[#151C1D] p-3 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[#A6C955] mb-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Deterministic Loop Prevention</span>
              </div>
              <p className="text-[#98A5A2] leading-relaxed">
                Every BGP router scans the inbound <code className="text-[#EEF2EF]">AS_PATH</code>. If its own local ASN appears anywhere in the list, the UPDATE is discarded without tearing down the session.
              </p>
            </div>

            <div className="rounded border border-[#283231] bg-[#151C1D] p-3 text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[#D2F27C] mb-1">
                <Layers className="h-3.5 w-3.5" />
                <span>Segment Encoding (AS_SEQUENCE)</span>
              </div>
              <p className="text-[#98A5A2] leading-relaxed">
                Encoded as Type 2 (AS_SEQUENCE), with a 1-byte segment length count followed by 2-byte or 4-byte ASN integers (RFC 6793).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="mt-6 rounded-xl border border-[#283231] bg-[#101516] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#283231] pb-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#151C1D] border border-[#283231] flex items-center justify-center font-mono text-xs font-bold text-[#D2F27C]">
                {selectedNode.asn}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#EEF2EF]">{selectedNode.name}</h4>
                <div className="text-xs font-mono text-[#98A5A2]">
                  {selectedNode.role} · {selectedNode.tier}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-[#98A5A2]">
              Router ID: <span className="text-[#D2F27C]">{selectedNode.routerId}</span>
            </div>
          </div>

          <div className="text-xs text-[#98A5A2] leading-relaxed">
            <strong className="text-[#EEF2EF]">BGP Routing Information Base (RIB) Action: </strong>
            {selectedNode.tier === 'Origin' ? (
              <span>
                Originates the network prefix <code className="text-[#D2F27C]">203.0.113.0/24</code> using the <code className="text-[#EEF2EF]">network</code> statement. Initializes <code className="text-[#D2F27C]">AS_PATH: [65001]</code> and advertises it via eBGP to upstream peers.
              </span>
            ) : selectedNode.tier === 'Destination' ? (
              <span>
                Evaluates incoming BGP paths from upstream Tier-1 providers. Selects the primary path because its AS_PATH length is shorter than the alternative path, installing the best route into the forwarding table (FIB).
              </span>
            ) : (
              <span>
                Acts as an intermediate transit provider. Re-advertises prefix <code className="text-[#D2F27C]">203.0.113.0/24</code> to downstream neighbors after prepending ASN <code className="text-[#D2F27C]">{selectedNode.asn}</code> to the left of the AS_PATH.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
