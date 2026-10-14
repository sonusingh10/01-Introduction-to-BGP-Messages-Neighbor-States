/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BgpMessageSpec, BgpStateSpec, DiagnosticIssue, FsmStep } from '../types/bgp';

export const BGP_MESSAGES: BgpMessageSpec[] = [
  {
    id: 'OPEN',
    code: 1,
    name: 'OPEN Message',
    rfc: 'RFC 4271 §4.1',
    purpose: 'Adjacency initialization & capability parameter negotiation',
    minSize: '29 octets',
    frequency: 'Sent once immediately upon successful TCP 3-way handshake',
    description:
      'The initial message transmitted by both BGP speakers after the underlying TCP port 179 connection is established. It establishes the identity of the peering router (Enterprise AS 65001 ↔ Cloudflare AS 13335) and defines baseline session timers and capabilities.',
    fields: [
      {
        name: 'Marker',
        size: '16 octets',
        type: 'Binary (all 1s)',
        description: 'Synchronization field, all bits set to 1 for message framing and compatibility.',
        exampleValue: 'ffffffffffffffffffffffffffffffff',
      },
      {
        name: 'Length',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Total message length including standard 19-octet BGP header (29 to 4096 bytes).',
        exampleValue: '0x003d (61 octets)',
      },
      {
        name: 'Type',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'Message code identifying this as an OPEN packet (Value: 1).',
        exampleValue: '0x01',
      },
      {
        name: 'Version',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'BGP protocol version number. Current standard is 4.',
        exampleValue: '0x04',
      },
      {
        name: 'My Autonomous System',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Autonomous System Number (ASN) of sending speaker.',
        exampleValue: '65001 (0xfde9)',
      },
      {
        name: 'Hold Time',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Proposed max seconds between successive messages before declaring peer dead. Default 90s.',
        exampleValue: '90 seconds (0x005a)',
      },
      {
        name: 'BGP Identifier',
        size: '4 octets',
        type: 'IPv4 Address format',
        description: 'Router ID (RID) uniquely identifying speaker. Must be nonzero and distinct.',
        exampleValue: '203.0.113.1 (0xcb007101)',
      },
      {
        name: 'Opt Parm Length',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'Total length in octets of the Optional Parameters field.',
        exampleValue: '32 octets (0x20)',
      },
      {
        name: 'Optional Parameters',
        size: 'Variable',
        type: 'TLV (Type-Length-Value)',
        description: 'Negotiates capabilities (RFC 5492): Multi-Protocol BGP (RFC 4760), 4-byte ASN (RFC 6793), Route Refresh (RFC 2918).',
        exampleValue: 'Capabilities: Multiprotocol IPv4 Unicast, 4-Octet AS 65001, Route Refresh',
      },
    ],
    hexDump:
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff\n' +
      '00 3d 01 04 fd e9 00 5a cb 00 71 01 20 02 06 01\n' +
      '04 00 01 00 01 02 06 41 04 00 00 fd e9 02 02 80\n' +
      '00 02 02 02 00',
    rfcNotes: [
      'The Hold Time is negotiated by taking the minimum value between local configuration and the peer’s received OPEN.',
      'A Hold Time value of zero (0) indicates the connection is not to be periodically monitored with Keepalive messages.',
      'If the BGP Identifier matches the local router’s ID, the connection must be rejected with a Bad BGP Identifier notification.',
    ],
  },
  {
    id: 'UPDATE',
    code: 2,
    name: 'UPDATE Message',
    rfc: 'RFC 4271 §4.3',
    purpose: 'Network reachability advertisement (NLRI) and route withdrawal',
    minSize: '23 octets',
    frequency: 'Triggered upon routing topology change or initial sync',
    description:
      'The workhorse of BGP. An UPDATE message either advertises a set of feasible routes that share identical path attributes, or withdraws multiple unfeasible routes from service. It can perform both actions in a single message.',
    fields: [
      {
        name: 'Marker & Header',
        size: '19 octets',
        type: 'Standard Header',
        description: '16-octet synchronization marker + 2-octet Length + 1-octet Type (2).',
        exampleValue: 'Type: 0x02',
      },
      {
        name: 'Withdrawn Routes Length',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Total octet length of unfeasible routes list. 0 if no routes are being withdrawn.',
        exampleValue: '0x0000 (0 octets)',
      },
      {
        name: 'Withdrawn Routes',
        size: 'Variable',
        type: 'List of (Length, Prefix)',
        description: 'IP prefixes that are no longer reachable and must be purged from the Adj-RIB-In.',
        exampleValue: 'None',
      },
      {
        name: 'Total Path Attribute Length',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Total octet length of the Path Attributes list for the advertised routes.',
        exampleValue: '0x002c (44 octets)',
      },
      {
        name: 'Path Attributes',
        size: 'Variable',
        type: 'List of Attribute TLVs',
        description: 'Well-known and optional attributes: ORIGIN (IGP/EGP/Incomplete), AS_PATH, NEXT_HOP, LOCAL_PREF, MED, COMMUNITY.',
        exampleValue: 'ORIGIN: IGP (0), AS_PATH: [65001 13335], NEXT_HOP: 203.0.113.1, MED: 100',
      },
      {
        name: 'NLRI (Network Reachability)',
        size: 'Variable',
        type: 'List of (Length, Prefix)',
        description: 'IP prefixes being advertised as reachable with the attributes described above.',
        exampleValue: '198.51.100.0/24, 192.0.2.0/24',
      },
    ],
    hexDump:
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff\n' +
      '00 4b 02 00 00 00 2c 40 01 01 00 40 02 0a 02 02\n' +
      '00 00 fd e9 00 00 34 17 40 03 04 cb 00 71 01 80\n' +
      '04 04 00 00 00 64 18 c6 33 64 18 c0 00 02',
    rfcNotes: [
      'ORIGIN, AS_PATH, and NEXT_HOP are Well-Known Mandatory attributes; every route advertisement must include them.',
      'AS_PATH prevents routing loops: if an eBGP router detects its own ASN in the AS_PATH attribute, it discards the update.',
      'A single UPDATE can advertise many prefixes as long as they all share the exact same path attributes.',
    ],
  },
  {
    id: 'KEEPALIVE',
    code: 4,
    name: 'KEEPALIVE Message',
    rfc: 'RFC 4271 §4.4',
    purpose: 'Session heartbeat & peer liveness verification',
    minSize: '19 octets (Exact)',
    frequency: 'Periodic, typically 1/3 of the negotiated Hold Time (e.g., every 30s)',
    description:
      'Sent periodically between peers to ensure the connection remains active when no UPDATE messages need to be sent. Consists solely of the 19-octet BGP header with zero payload bytes.',
    fields: [
      {
        name: 'Marker',
        size: '16 octets',
        type: 'Binary (all 1s)',
        description: 'Standard 16-byte synchronization field.',
        exampleValue: 'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff',
      },
      {
        name: 'Length',
        size: '2 octets',
        type: 'Unsigned 16-bit Int',
        description: 'Total message length. For KEEPALIVE, always exactly 19 octets.',
        exampleValue: '0x0013 (19)',
      },
      {
        name: 'Type',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'Message code identifying this as a KEEPALIVE packet (Value: 4).',
        exampleValue: '0x04',
      },
    ],
    hexDump:
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff\n' +
      '00 13 04',
    rfcNotes: [
      'KEEPALIVE messages carry zero message payload; parsing requires verifying Length == 19.',
      'If the Hold Timer expires prior to receiving a KEEPALIVE or UPDATE, the router transmits a NOTIFICATION and resets to Idle.',
      'Recommended Keepalive frequency is Hold Time / 3 (e.g. 30s for standard 90s hold time).',
    ],
  },
  {
    id: 'NOTIFICATION',
    code: 3,
    name: 'NOTIFICATION Message',
    rfc: 'RFC 4271 §4.5',
    purpose: 'Error reporting and immediate session termination',
    minSize: '21 octets',
    frequency: 'Triggered solely when an error or condition forces session closure',
    description:
      'Transmitted immediately when an unrecoverable condition occurs (e.g. bad message syntax, unhandled attribute, hold timer expiration, or administrative shutdown). The sending router immediately closes the TCP connection and transitions to the Idle state.',
    fields: [
      {
        name: 'Marker & Header',
        size: '19 octets',
        type: 'Standard Header',
        description: '16-octet marker + 2-octet Length + 1-octet Type (3).',
        exampleValue: 'Type: 0x03',
      },
      {
        name: 'Error Code',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'Primary category: 1=Message Header, 2=OPEN Message, 3=UPDATE Message, 4=Hold Timer Expired, 5=FSM Error, 6=Cease.',
        exampleValue: '0x02 (OPEN Message Error)',
      },
      {
        name: 'Error Subcode',
        size: '1 octet',
        type: 'Unsigned 8-bit Int',
        description: 'Specific diagnosis: e.g. for OPEN Error: 1=Unsupported Version, 2=Bad Peer AS, 3=Bad BGP ID, 4=Unsupported Optional Param, 5=Unacceptable Hold Time.',
        exampleValue: '0x02 (Bad Peer AS)',
      },
      {
        name: 'Data',
        size: 'Variable',
        type: 'Binary diagnostic payload',
        description: 'Optional variable-length diagnostic data assisting in troubleshooting (e.g. malformed attribute bytes or rejected AS).',
        exampleValue: '0xfd e9 (Rejected Autonomous System 65001)',
      },
    ],
    hexDump:
      'ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff ff\n' +
      '00 17 03 02 02 fd e9',
    rfcNotes: [
      'Sending or receiving a NOTIFICATION unconditionally resets the peer session to the Idle state.',
      'Error Code 6 (Cease) is widely deployed for graceful shutdown (RFC 8538) and administrative maintenance.',
      'Hold Timer Expired (Code 4) carries subcode 0 and indicates no packets were received within the negotiated window.',
    ],
  },
];

export const BGP_STATES: BgpStateSpec[] = [
  {
    name: 'Idle',
    number: 1,
    summary: 'Initial state: BGP ignores incoming connection requests and allocates no peer resources.',
    detailedDescription:
      'In the Idle state, the router does not listen for incoming connections and allocates minimum resources for the peer. When an administrative Start event occurs (e.g., neighbor 203.0.113.2 configured and enabled), BGP initializes resources, starts the ConnectRetry timer, initiates a TCP connection to the neighbor, and shifts into the Connect state.',
    tcpStatus: 'Closed / Not Established',
    messagesSent: ['None'],
    messagesReceived: ['None (Ignored)'],
    activeTimers: ['ConnectRetry Timer (default 120s)'],
    nextPossibleStates: [
      {
        target: 'Connect',
        condition: 'Manual/Automatic BGP Start event occurs, starts TCP connect',
      },
      {
        target: 'Active',
        condition: 'ConnectRetry timer expires or configuration requires immediate active fallback',
      },
    ],
    troubleshootingNote:
      'If stuck in Idle, check if the peer interface (e.g. GigabitEthernet0/0/0) is down, an administrative shutdown is active, or there is no valid route in the RIB to reach 203.0.113.2.',
  },
  {
    name: 'Connect',
    number: 2,
    summary: 'Waiting for the TCP 3-way handshake to complete with the peer on port 179.',
    detailedDescription:
      'The router is actively waiting for TCP completion (SYN, SYN-ACK, ACK on TCP port 179). If the TCP handshake completes successfully, the router resets the ConnectRetry timer, constructs and sends its OPEN message, and moves to OpenSent. If the TCP connection fails or the ConnectRetry timer expires, the router transitions to the Active state.',
    tcpStatus: 'SYN_SENT / SYN_RCVD (In Progress)',
    messagesSent: ['TCP SYN (Transport Layer)'],
    messagesReceived: ['TCP SYN-ACK (Expected)'],
    activeTimers: ['ConnectRetry Timer'],
    nextPossibleStates: [
      {
        target: 'OpenSent',
        condition: 'TCP connection completes successfully; local router sends OPEN message',
      },
      {
        target: 'Active',
        condition: 'TCP connection attempt fails or ConnectRetry timer expires',
        isErrorPath: true,
      },
      {
        target: 'Idle',
        condition: 'Administrative Stop event or fatal resource error',
        isErrorPath: true,
      },
    ],
    troubleshootingNote:
      'A router cycling between Connect and Active usually means TCP port 179 packets are being dropped by a firewall, ACL, or an incorrect IP address is configured.',
  },
  {
    name: 'Active',
    number: 3,
    summary: 'TCP attempt failed; actively trying to re-establish or waiting for incoming connection.',
    detailedDescription:
      'In the Active state, the router continues attempting to establish a TCP session with the peer. If the ConnectRetry timer expires while in Active, BGP falls back to Connect and restarts the TCP connection. If TCP successfully establishes while in Active, it immediately sends an OPEN message and transitions to OpenSent.',
    tcpStatus: 'Retrying TCP handshake / Listening',
    messagesSent: ['TCP SYN retries'],
    messagesReceived: ['TCP RST or none'],
    activeTimers: ['ConnectRetry Timer'],
    nextPossibleStates: [
      {
        target: 'OpenSent',
        condition: 'TCP connection completes successfully; local router sends OPEN message',
      },
      {
        target: 'Connect',
        condition: 'ConnectRetry timer expires; initiates new TCP handshake',
      },
      {
        target: 'Idle',
        condition: 'Unrecoverable error, neighbor disabled, or maximum retries reached',
        isErrorPath: true,
      },
    ],
    troubleshootingNote:
      'Being stuck in the "Active" state is one of the most common BGP issues. Check for: access-list blocking TCP 179, incorrect neighbor IP, missing eBGP multihop for loopback peering, or update-source mismatch.',
  },
  {
    name: 'OpenSent',
    number: 4,
    summary: 'TCP is open; OPEN message sent, waiting for peer’s OPEN message.',
    detailedDescription:
      'TCP 3-way handshake is established. Local router (Enterprise AS 65001) has transmitted its OPEN message containing its BGP Version, AS number, Hold Time, and Router ID. The router is now waiting for Cloudflare (AS 13335) to send its reciprocal OPEN message. Upon receipt, it validates all fields.',
    tcpStatus: 'ESTABLISHED (TCP Port 179)',
    messagesSent: ['OPEN'],
    messagesReceived: ['OPEN (Awaiting)'],
    activeTimers: ['Hold Timer (Initial)', 'ConnectRetry Timer (Cleared)'],
    nextPossibleStates: [
      {
        target: 'OpenConfirm',
        condition: 'Valid OPEN received from peer; local router sends KEEPALIVE',
      },
      {
        target: 'Idle',
        condition: 'Invalid OPEN (ASN mismatch, bad version, hold time mismatch) triggers NOTIFICATION',
        isErrorPath: true,
      },
      {
        target: 'Active',
        condition: 'TCP connection drops prematurely before peer sends OPEN',
        isErrorPath: true,
      },
    ],
    troubleshootingNote:
      'If you bounce from OpenSent back to Idle, inspect your logs for NOTIFICATION: Bad Peer AS (wrong remote-as configured) or Bad BGP Identifier (duplicate Router-ID).',
  },
  {
    name: 'OpenConfirm',
    number: 5,
    summary: 'Mutual OPEN messages validated; waiting for peer’s KEEPALIVE confirmation.',
    detailedDescription:
      'Both routers have exchanged and verified each other’s OPEN messages. The local router has sent a KEEPALIVE to confirm the parameters and is waiting for the peer’s confirming KEEPALIVE. Once the peer’s KEEPALIVE is received, the session transitions to Established.',
    tcpStatus: 'ESTABLISHED (TCP Port 179)',
    messagesSent: ['KEEPALIVE'],
    messagesReceived: ['KEEPALIVE (Awaiting)'],
    activeTimers: ['Hold Timer', 'Keepalive Timer'],
    nextPossibleStates: [
      {
        target: 'Established',
        condition: 'Peer sends KEEPALIVE; mutual parameter agreement confirmed',
      },
      {
        target: 'Idle',
        condition: 'Hold Timer expires or NOTIFICATION received; tear down session',
        isErrorPath: true,
      },
    ],
    troubleshootingNote:
      'Rare to be permanently stuck in OpenConfirm; usually completes in milliseconds. If it fails, look for unidirectional packet drop or immediate hold timer expiration.',
  },
  {
    name: 'Established',
    number: 6,
    summary: 'Adjacency complete; peer exchange of UPDATE routing tables & periodic KEEPALIVEs.',
    detailedDescription:
      'The BGP peering session is fully operational. Routers exchange routing information via UPDATE messages, process incoming NLRIs, and periodically exchange KEEPALIVE messages according to the negotiated Hold Time. If a Hold Timer expires or a NOTIFICATION is received, the session immediately tears down to Idle.',
    tcpStatus: 'ESTABLISHED (Continuous Stream)',
    messagesSent: ['UPDATE', 'KEEPALIVE', 'ROUTE_REFRESH'],
    messagesReceived: ['UPDATE', 'KEEPALIVE', 'ROUTE_REFRESH'],
    activeTimers: ['Hold Timer (Resets on every packet)', 'Keepalive Timer (e.g. 30s)'],
    nextPossibleStates: [
      {
        target: 'Idle',
        condition: 'NOTIFICATION received/sent, Hold Timer expires, or administrative tear-down',
        isErrorPath: true,
      },
    ],
    troubleshootingNote:
      'In show ip bgp summary, the state column displays the prefix count (e.g. "142") instead of the word "Established". Any word in that column (like "Active" or "Idle") indicates the session is down.',
  },
];

export const FSM_WALKTHROUGH_STEPS: FsmStep[] = [
  {
    stepNumber: 1,
    fromState: 'Idle',
    toState: 'Connect',
    event: 'BGP Start Event (neighbor 203.0.113.2 remote-as 13335 enabled)',
    direction: 'tx',
    technicalAction:
      'Enterprise Edge (AS 65001) allocates neighbor resources, initializes ConnectRetry timer (120s), and initiates TCP connection to Cloudflare 203.0.113.2:179.',
    rfcReference: 'RFC 4271 §8.2.2.1',
    logMessage: '%BGP-5-ADJCHANGE: neighbor 203.0.113.2 state changed from Idle to Connect',
  },
  {
    stepNumber: 2,
    fromState: 'Connect',
    toState: 'OpenSent',
    event: 'TCP 3-Way Handshake Completes (SYN, SYN-ACK, ACK on Port 179)',
    messageType: 'OPEN',
    direction: 'tx',
    technicalAction:
      'TCP socket 203.0.113.1:49152 <-> 203.0.113.2:179 is ESTABLISHED. Enterprise router constructs OPEN message (Version 4, My AS 65001, Hold Time 90s, RID 203.0.113.1) and transmits it to Cloudflare.',
    rfcReference: 'RFC 4271 §8.2.2.2',
    logMessage: '%BGP-5-ADJCHANGE: neighbor 203.0.113.2 state changed from Connect to OpenSent [Tx: OPEN len=61]',
  },
  {
    stepNumber: 3,
    fromState: 'OpenSent',
    toState: 'OpenConfirm',
    event: 'Receive OPEN Message from Cloudflare (AS 13335)',
    messageType: 'OPEN',
    direction: 'rx',
    technicalAction:
      'Enterprise router parses incoming OPEN from Cloudflare. Checks version (4 == 4), remote-as (13335 == configured), BGP ID (1.1.1.1 != local). Negotiates Hold Time = min(90, 180) = 90s. Sends KEEPALIVE to confirm.',
    rfcReference: 'RFC 4271 §8.2.2.4',
    logMessage: '%BGP-5-ADJCHANGE: neighbor 203.0.113.2 state changed from OpenSent to OpenConfirm [Rx: OPEN, Tx: KEEPALIVE]',
  },
  {
    stepNumber: 4,
    fromState: 'OpenConfirm',
    toState: 'Established',
    event: 'Receive KEEPALIVE Message from Cloudflare',
    messageType: 'KEEPALIVE',
    direction: 'rx',
    technicalAction:
      'Enterprise router receives KEEPALIVE from Cloudflare acknowledging parameters. Hold timer is reset to negotiated 90s. Session is declared fully operational. Route exchange begins.',
    rfcReference: 'RFC 4271 §8.2.2.5',
    logMessage: '%BGP-5-ADJCHANGE: neighbor 203.0.113.2 Up (state changed from OpenConfirm to Established)',
  },
  {
    stepNumber: 5,
    fromState: 'Established',
    toState: 'Established',
    event: 'Initial UPDATE Exchange (Routing Tables Transferred)',
    messageType: 'UPDATE',
    direction: 'tx',
    technicalAction:
      'Enterprise router advertises customer prefix 198.51.100.0/24 with AS_PATH [65001], NEXT_HOP 203.0.113.1. Cloudflare installs route in Global Routing Table.',
    rfcReference: 'RFC 4271 §4.3',
    logMessage: '%BGP-4-UPDATE: neighbor 203.0.113.2 received 142 NLRI prefixes, 0 withdrawn',
  },
  {
    stepNumber: 6,
    fromState: 'Established',
    toState: 'Established',
    event: 'Periodic Keepalive Pulse (30s interval)',
    messageType: 'KEEPALIVE',
    direction: 'tx',
    technicalAction:
      'KeepaliveTimer expires on Enterprise router. A 19-octet KEEPALIVE is transmitted to refresh Cloudflare’s Hold Timer and ensure path liveliness.',
    rfcReference: 'RFC 4271 §4.4',
    logMessage: '%BGP-7-KEEPALIVE: sent KEEPALIVE to neighbor 203.0.113.2',
  },
];

export const DIAGNOSTIC_ISSUES: DiagnosticIssue[] = [
  {
    id: 'stuck-active',
    symptom: 'Neighbor state continuously oscillates between Connect and Active',
    stuckState: 'Active',
    rootCauses: [
      {
        title: 'TCP Port 179 Filtered by Access-List or Firewall',
        technicalExplanation:
          'BGP runs over TCP port 179. If an intermediate firewall, cloud security group, or router CoPP / ACL drops TCP SYN packets or does not permit bidirectional TCP 179 traffic, the 3-way handshake times out, moving the state from Connect to Active.',
        diagnosticCommand: 'telnet 203.0.113.2 179  // or nc -zv 203.0.113.2 179',
        remediation:
          'Ensure firewall rules explicitly permit TCP port 179 in both directions (source port > 1024 to destination 179, and vice versa).',
      },
      {
        title: 'Missing or Insufficient eBGP Multihop',
        technicalExplanation:
          'eBGP peers that are not directly connected (e.g. peering using loopback interfaces) send IP packets with TTL=1 by default. The next-hop router decrements TTL to 0 and drops the packet with ICMP Time Exceeded.',
        diagnosticCommand: 'show ip bgp neighbors 203.0.113.2 | include External BGP neighbor',
        remediation:
          'Configure "neighbor 203.0.113.2 ebgp-multihop 2" (or set proper TTL-security hop count) and verify update-source loopback0.',
      },
      {
        title: 'Update-Source Interface Mismatch',
        technicalExplanation:
          'If the enterprise expects peering from 203.0.113.1 (Gi0/0/0) but initiates TCP from another physical interface, the peer drops the SYN packet because it does not match the configured neighbor IP.',
        diagnosticCommand: 'debug ip tcp transactions // check incoming connection source IP',
        remediation:
          'Add "neighbor 203.0.113.2 update-source GigabitEthernet0/0/0" on the initiating router.',
      },
    ],
  },
  {
    id: 'stuck-idle',
    symptom: 'Neighbor remains in Idle state with zero connection attempts',
    stuckState: 'Idle',
    rootCauses: [
      {
        title: 'No Route to Neighbor IP Address in the RIB',
        technicalExplanation:
          'BGP will not initiate a TCP handshake if there is no valid routing entry in the Routing Information Base (RIB) to reach 203.0.113.2.',
        diagnosticCommand: 'show ip route 203.0.113.2',
        remediation:
          'Verify connected interface GigabitEthernet0/0/0 is UP/UP or static route provides reachability.',
      },
      {
        title: 'Neighbor Administratively Shut Down',
        technicalExplanation:
          'The peer configuration has been disabled with "neighbor <ip> shutdown" or peer maintenance mode.',
        diagnosticCommand: 'show run | section router bgp',
        remediation:
          'Execute "no neighbor 203.0.113.2 shutdown" under the BGP router configuration process.',
      },
    ],
  },
  {
    id: 'session-flapping',
    symptom: 'Session reaches Established, then drops to Idle every 90-180 seconds',
    stuckState: 'Flapping',
    rootCauses: [
      {
        title: 'Path MTU Black Hole on Large UPDATE Packets',
        technicalExplanation:
          'TCP connection and small KEEPALIVE (19B) and OPEN (61B) packets succeed, so the session reaches Established. However, when BGP transmits large UPDATE packets (often up to 1500 bytes or jumbo frames) with the Don’t Fragment (DF) bit set, an intermediate link with a smaller MTU drops them without generating ICMP Fragmentation Needed.',
        diagnosticCommand: 'ping 203.0.113.2 size 1500 df-bit',
        remediation:
          'Enable Path MTU Discovery with "ip tcp path-mtu-discovery" or clamp MSS / harmonize interface MTUs across the link.',
      },
      {
        title: 'CPU Starvation or Aggressive Control Plane Policing (CoPP)',
        technicalExplanation:
          'High router control-plane CPU utilization or strict rate-limiting in CoPP causes received KEEPALIVE packets to be dropped in queue. The negotiated Hold Timer (typically 90s) expires, triggering error code 4 (Hold Timer Expired).',
        diagnosticCommand: 'show log | include %BGP-3-NOTIFICATION.*Hold Timer Expired',
        remediation:
          'Inspect CPU processes, increase BGP process scheduling priority, or adjust CoPP policies for BGP TCP traffic.',
      },
    ],
  },
];
