/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Clinic {
  id: string;
  name: string;
  location: string;
  country: "South Africa" | "Botswana" | "Eswatini";
  tier: "pilot" | "basic" | "pro" | "enterprise";
  createdAt: any;
}

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  phoneNumber: string;
  age: number;
  gestationalWeeks: number;
  edd: string; // Estimated due date
  medicalHistory: string[];
  riskLevel: "normal" | "medium" | "high" | "critical" | "low";
  riskDrivingSignal: string;
  consentGranted?: boolean;
  consentVersion: string;
  createdAt: any;
  updatedAt?: any;
}

export interface VitalsLog {
  id: string;
  patientId: string;
  systolic: number; // mmHg
  diastolic: number; // mmHg
  pulse: number; // bpm
  temperature: number; // Celsius
  weight: number; // kg
  symptoms?: string[];
  recordedBy: "nurse" | "CHW" | "patient" | "Self" | "Mbabane Nurse" | string;
  riskAlerts?: string[];
  createdAt: any;
  kickCount?: number;
  notes?: string;
}

export interface ChatLog {
  id: string;
  patientId: string;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  clinicId: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  timestamp: Date;
}

export interface Clinician {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "clinician" | "CHW";
  clinicId: string;
}

export interface SubscriptionModel {
  name: string;
  priceUSD: number;
  priceZAR: number;
  billingPeriod: "month" | "year";
  features: string[];
}

export interface PatientReport {
  id: string;
  patientId: string;
  patientName: string;
  gestationalWeeks: number;
  symptom: string;
  severity: "Normal" | "Monitor" | "Referral";
  description: string;
  voiceNoteSimulated: boolean;
  status: "pending" | "reviewed";
  clinicianNotes?: string;
  clinicianAction?: "Normal" | "Monitor" | "Refer to care";
  createdAt: string;
}

export type TopicCategory = "nausea" | "movement" | "appointments" | "nutrition" | "labor" | "general";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  gestationalWeeks: number;
  topic: TopicCategory;
  content: string;
  createdAt: string;
  reportCount: number;
  reported: boolean;
  reportedReason?: string;
  blockedUsers: string[]; // List of user IDs blocked by author or current user
  isModerated: boolean; // Flag if blocked/hidden by moderators
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reportCount: number;
  reported: boolean;
  reportedReason?: string;
  isModerated: boolean;
}

export interface SafetyAuditLog {
  id: string;
  timestamp: string;
  actor: string; // "Kelebogile Mokgoro" or "Sister Thandeka Kunene (Clinician)"
  action: "REPORT_POST" | "REPORT_COMMENT" | "BLOCK_USER" | "UNBLOCK_USER" | "APPEAL_SUBMIT" | "APPEAL_RESOLVE" | "SPAM_PREVENTED";
  targetId: string;
  targetType: "post" | "comment" | "user";
  details: string;
}

export interface ModerationAppeal {
  id: string;
  userId: string;
  userName: string;
  targetId: string;
  targetType: "post" | "comment" | "user";
  targetContent: string;
  reason: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  moderatorNotes?: string;
}

export interface TopicNotificationSettings {
  nausea: boolean;
  movement: boolean;
  appointments: boolean;
  nutrition: boolean;
  labor: boolean;
  general: boolean;
}

export interface MaternalMeeting {
  id: string;
  patientId: string;
  patientName: string;
  clinicianName: string;
  meetingUri: string;
  meetingCode: string;
  topic: string;
  scheduledFor: string;
  status: "upcoming" | "active" | "completed";
  createdAt: string;
}

export interface PostpartumTask {
  label: string;
  done: boolean;
}

export interface PostpartumVitals {
  bp: string;
  hr: number;
  temp: number;
  weight: number;
}

export interface PostpartumCheckup {
  id: string;
  patientId: string;
  patientName: string;
  day: string; // e.g. "Day 1 Postpartum", "Day 3 Postpartum"
  date: string;
  status: "completed" | "scheduled" | "missed";
  clinicianName: string;
  vitals: PostpartumVitals;
  lochiaStatus: string;
  breastfeedingStatus: string;
  neonatalJaundice: string;
  doctorNotes: string;
  tasks: PostpartumTask[];
}

export interface HospitalVisit {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  hospitalName: string;
  reason: string;
  clinicianName: string;
  diagnosis: string;
  notes: string;
  followUpDate?: string;
}



