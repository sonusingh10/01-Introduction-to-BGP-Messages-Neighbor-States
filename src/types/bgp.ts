/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BgpMessageType = 'OPEN' | 'UPDATE' | 'NOTIFICATION' | 'KEEPALIVE' | 'ROUTE_REFRESH';

export type BgpStateName = 'Idle' | 'Connect' | 'Active' | 'OpenSent' | 'OpenConfirm' | 'Established';

export interface BgpMessageSpec {
  id: BgpMessageType;
  code: number;
  name: string;
  rfc: string;
  purpose: string;
  minSize: string;
  frequency: string;
  description: string;
  fields: {
    name: string;
    size: string;
    type: string;
    description: string;
    exampleValue: string;
  }[];
  hexDump: string;
  rfcNotes: string[];
}

export interface BgpStateSpec {
  name: BgpStateName;
  number: number;
  summary: string;
  detailedDescription: string;
  tcpStatus: string;
  messagesSent: string[];
  messagesReceived: string[];
  activeTimers: string[];
  nextPossibleStates: {
    target: BgpStateName;
    condition: string;
    isErrorPath?: boolean;
  }[];
  troubleshootingNote?: string;
}

export interface FsmStep {
  stepNumber: number;
  fromState: BgpStateName;
  toState: BgpStateName;
  event: string;
  messageType?: BgpMessageType;
  direction?: 'tx' | 'rx';
  technicalAction: string;
  rfcReference: string;
  logMessage: string;
}

export interface DiagnosticIssue {
  id: string;
  symptom: string;
  stuckState: BgpStateName | 'Flapping';
  rootCauses: {
    title: string;
    technicalExplanation: string;
    diagnosticCommand: string;
    remediation: string;
  }[];
}
