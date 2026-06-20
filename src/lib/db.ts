import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from "./firebase";
import { Patient, VitalsLog, ChatLog, AuditLog, Clinician, Clinic } from "../types";

// LocalStorage Persistence Keys
const PATIENTS_KEY = "vytal_patients";
const VITALS_KEY = "vytal_vitals";
const CHATS_KEY = "vytal_chats";
const AUDIT_LOGS_KEY = "vytal_audit_logs";
const CURRENT_CLINIC_KEY = "vytal_current_clinic";

// Standard pre-populated synthetic maternal monitoring cohort for the competition demo
const SYNTHETIC_CLINIC: Clinic = {
  id: "mbabane-primary",
  name: "Mbabane Maternal Health Centre",
  location: "Hhohho Region",
  country: "Eswatini",
  tier: "pro",
  createdAt: new Date("2026-01-10T08:00:00Z")
};

const SYNTHETIC_PATIENTS: Patient[] = [
  {
    id: "pat-1",
    clinicId: "mbabane-primary",
    name: "Zanele Dlamini",
    phoneNumber: "+268 7654 3210",
    age: 24,
    gestationalWeeks: 36,
    edd: "2026-07-13",
    medicalHistory: ["Nulliparous (first pregnancy)"],
    riskLevel: "critical",
    riskDrivingSignal: "Severe maternal hypertension (162/112 mmHg) accompanied by clinical indicators of blurry vision and headache triggers immediate pre-eclampsia threat.",
    consentGranted: true,
    consentVersion: "CONSENT-V1.2-SZ",
    createdAt: new Date("2026-05-15T09:30:00Z"),
    updatedAt: new Date("2026-06-15T10:00:00Z")
  },
  {
    id: "pat-2",
    clinicId: "mbabane-primary",
    name: "Kelebogile Mokgoro",
    phoneNumber: "+267 7132 4567",
    age: 31,
    gestationalWeeks: 28,
    edd: "2026-09-08",
    medicalHistory: ["Gestational Diabetes Mellitus (GDM)", "Hypothyroid"],
    riskLevel: "high",
    riskDrivingSignal: "Moderate maternal hypertension (142/91 mmHg) with noticeable facial swelling at week 28 requires active clinical pre-eclampsia watch and urine profiling.",
    consentGranted: true,
    consentVersion: "CONSENT-V1.2-BW",
    createdAt: new Date("2026-05-20T11:15:00Z"),
    updatedAt: new Date("2026-06-14T14:20:00Z")
  },
  {
    id: "pat-3",
    clinicId: "mbabane-primary",
    name: "Nokuthula Zulu",
    phoneNumber: "+27 82 555 0199",
    age: 28,
    gestationalWeeks: 32,
    edd: "2026-08-11",
    medicalHistory: ["Anemia", "Previous post-partum hemorrhage"],
    riskLevel: "critical",
    riskDrivingSignal: "High maternal fever (38.8°C) combined with fetal/maternal tachycardia (122 bpm) indicates uterine infection or systemic gestational sepsis.",
    consentGranted: true,
    consentVersion: "CONSENT-V1.2-ZA",
    createdAt: new Date("2026-05-28T08:00:00Z"),
    updatedAt: new Date("2026-06-15T11:45:00Z")
  },
  {
    id: "pat-4",
    clinicId: "mbabane-primary",
    name: "Lerato Phiri",
    phoneNumber: "+27 73 555 4321",
    age: 22,
    gestationalWeeks: 16,
    edd: "2026-11-28",
    medicalHistory: ["None"],
    riskLevel: "normal",
    riskDrivingSignal: "Vitals parameters are within baseline pregnancy ranges. General guidelines and routine prenatal vitamins advised.",
    consentGranted: true,
    consentVersion: "CONSENT-V1.2-ZA",
    createdAt: new Date("2026-06-01T14:00:00Z"),
    updatedAt: new Date("2026-06-15T09:00:00Z")
  },
  {
    id: "pat-5",
    clinicId: "mbabane-primary",
    name: "Thandi Mabaso",
    phoneNumber: "+27 81 444 9876",
    age: 34,
    gestationalWeeks: 24,
    edd: "2026-10-05",
    medicalHistory: ["Previous pregnancy affected by severe Pre-eclampsia at 32 weeks"],
    riskLevel: "medium",
    riskDrivingSignal: "Elevated baseline blood pressure (135/88 mmHg) in a mother with previous pre-eclampsia history requires elevated monitoring frequency.",
    consentGranted: true,
    consentVersion: "CONSENT-V1.2-ZA",
    createdAt: new Date("2026-06-05T10:30:00Z"),
    updatedAt: new Date("2026-06-15T08:15:00Z")
  }
];

const SYNTHETIC_VITALS: { [patientId: string]: VitalsLog[] } = {
  "pat-1": [
    {
      id: "v-1-1",
      patientId: "pat-1",
      systolic: 122,
      diastolic: 80,
      pulse: 78,
      temperature: 36.5,
      weight: 71.0,
      symptoms: [],
      recordedBy: "nurse",
      riskAlerts: [],
      createdAt: new Date("2026-05-15T09:30:00Z")
    },
    {
      id: "v-1-2",
      patientId: "pat-1",
      systolic: 138,
      diastolic: 88,
      pulse: 82,
      temperature: 36.6,
      weight: 72.8,
      symptoms: ["Mild swelling of ankles"],
      recordedBy: "CHW",
      riskAlerts: ["Rising gestational blood pressure trend noted"],
      createdAt: new Date("2026-06-01T10:15:00Z")
    },
    {
      id: "v-1-3",
      patientId: "pat-1",
      systolic: 162,
      diastolic: 112,
      pulse: 94,
      temperature: 36.8,
      weight: 74.0,
      symptoms: ["Blurry vision", "Severe headache"],
      recordedBy: "nurse",
      riskAlerts: ["Eclampsia watch", "Hypertensive Urgency"],
      createdAt: new Date("2026-06-15T10:00:00Z")
    }
  ],
  "pat-2": [
    {
      id: "v-2-1",
      patientId: "pat-2",
      systolic: 120,
      diastolic: 78,
      pulse: 80,
      temperature: 36.7,
      weight: 79.5,
      symptoms: [],
      recordedBy: "nurse",
      riskAlerts: [],
      createdAt: new Date("2026-05-20T11:15:00Z")
    },
    {
      id: "v-2-2",
      patientId: "pat-2",
      systolic: 142,
      diastolic: 91,
      pulse: 85,
      temperature: 37.1,
      weight: 81.2,
      symptoms: ["Swelling of face", "Swelling of fingers"],
      recordedBy: "patient",
      riskAlerts: ["Mild/Moderate Pre-eclampsia Watch"],
      createdAt: new Date("2026-06-14T14:20:00Z")
    }
  ],
  "pat-3": [
    {
      id: "v-3-1",
      patientId: "pat-3",
      systolic: 112,
      diastolic: 70,
      pulse: 82,
      temperature: 36.6,
      weight: 66.5,
      symptoms: [],
      recordedBy: "nurse",
      createdAt: new Date("2026-05-28T08:00:00Z"),
      riskAlerts: []
    },
    {
      id: "v-3-2",
      patientId: "pat-3",
      systolic: 110,
      diastolic: 72,
      pulse: 122,
      temperature: 38.8,
      weight: 68.0,
      symptoms: ["Fever", "Pelvic pressure / pain"],
      recordedBy: "CHW",
      riskAlerts: ["Gestational Sepsis Suspected", "Hyperthermia alert"],
      createdAt: new Date("2026-06-15T11:45:00Z")
    }
  ]
};

const SYNTHETIC_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-1",
    clinicId: "mbabane-primary",
    userId: "user-1",
    userEmail: "advisor.nurse@vytalbridge.org",
    action: "ENROLL_PATIENT",
    resource: "pat-1",
    details: "Enrolled Zanele Dlamini under clinical pre-eclampsia watch protocols, secured granular POPIA consent",
    timestamp: new Date("2026-05-15T09:30:00Z")
  },
  {
    id: "aud-2",
    clinicId: "mbabane-primary",
    userId: "user-1",
    userEmail: "advisor.nurse@vytalbridge.org",
    action: "READ_PATIENT_PHI",
    resource: "pat-1",
    details: "Accessed pregnancy metrics during scheduled 32-week home-visit check-in",
    timestamp: new Date("2026-06-15T10:00:00Z")
  }
];

// Initialize local arrays in LocalStorage if they do not exist
export function initLocalStorageDb() {
  if (!localStorage.getItem(CURRENT_CLINIC_KEY)) {
    localStorage.setItem(CURRENT_CLINIC_KEY, JSON.stringify(SYNTHETIC_HEALTH_CENTRE));
  }
  if (!localStorage.getItem(PATIENTS_KEY)) {
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(SYNTHETIC_PATIENTS));
  }
  if (!localStorage.getItem(VITALS_KEY)) {
    const flatVitals: VitalsLog[] = [];
    Object.values(SYNTHETIC_VITALS).forEach(arr => flatVitals.push(...arr));
    localStorage.setItem(VITALS_KEY, JSON.stringify(flatVitals));
  }
  if (!localStorage.getItem(CHATS_KEY)) {
    localStorage.setItem(CHATS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(SYNTHETIC_AUDIT_LOGS));
  }
}

// Fallback constant for types
export const SYNTHETIC_HEALTH_CENTRE: Clinic = { ...SYNTHETIC_CLINIC };

// Execute init immediately
initLocalStorageDb();

// ----------------------------------------------------
// DATABASE API LAYER (Firestore transparent sync with Local Fallback)
// ----------------------------------------------------

export async function getActiveClinic(): Promise<Clinic> {
  const localClinic = JSON.parse(localStorage.getItem(CURRENT_CLINIC_KEY) || "null") || SYNTHETIC_HEALTH_CENTRE;
  if (!isFirebaseConfigured) {
    return localClinic;
  }
  try {
    const cRef = doc(db, "clinics", localClinic.id);
    const snap = await getDoc(cRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name,
        location: data.location,
        country: data.country,
        tier: data.tier,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    } else {
      // Bootstrap clinic in remote Firestore
      const newClinic = {
        ...localClinic,
        createdAt: Timestamp.fromDate(new Date(localClinic.createdAt))
      };
      await setDoc(cRef, newClinic);
      return localClinic;
    }
  } catch (error) {
    console.warn("Firestore integration not accessible, using cached clinic context", error);
    return localClinic;
  }
}

export async function getPatients(clinicId: string): Promise<Patient[]> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    return all.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt)
    }));
  }

  const pCol = "patients";
  try {
    // Return all patients for the dashboard
    const qSnapshot = await getDocs(collection(db, pCol));
    const list: Patient[] = [];
    qSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        clinicId: data.clinicId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        age: Number(data.age),
        gestationalWeeks: Number(data.gestationalWeeks),
        edd: data.edd,
        medicalHistory: data.medicalHistory || [],
        riskLevel: data.riskLevel,
        riskDrivingSignal: data.riskDrivingSignal || "",
        consentGranted: !!data.consentGranted,
        consentVersion: data.consentVersion || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pCol);
    return [];
  }
}

export async function addPatient(patient: Omit<Patient, "createdAt" | "updatedAt">): Promise<Patient> {
  const fullPatient: Patient = {
    ...patient,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    all.push(fullPatient);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(all));
    return fullPatient;
  }

  const path = "patients";
  try {
    const docRef = doc(db, "patients", patient.id);
    await setDoc(docRef, {
      ...fullPatient,
      createdAt: Timestamp.fromDate(fullPatient.createdAt),
      updatedAt: Timestamp.fromDate(fullPatient.updatedAt)
    });
    return fullPatient;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${patient.id}`);
    throw error;
  }
}

export async function updatePatient(patient: Patient): Promise<Patient> {
  const updated = {
    ...patient,
    updatedAt: new Date()
  };

  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    const idx = all.findIndex((p: any) => p.id === patient.id);
    if (idx !== -1) {
      all[idx] = updated;
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(all));
    }
    return updated;
  }

  const path = `patients/${patient.id}`;
  try {
    const docRef = doc(db, "patients", patient.id);
    await setDoc(docRef, {
      ...updated,
      createdAt: Timestamp.fromDate(new Date(patient.createdAt)),
      updatedAt: Timestamp.fromDate(updated.updatedAt)
    }, { merge: true });
    return updated;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export async function getVitalsLogs(patientId: string): Promise<VitalsLog[]> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(VITALS_KEY) || "[]");
    return all
      .filter((v: any) => v.patientId === patientId)
      .map((v: any) => ({ ...v, createdAt: new Date(v.createdAt) }))
      .sort((a: VitalsLog, b: VitalsLog) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const path = `patients/${patientId}/vitals`;
  try {
    const list: VitalsLog[] = [];
    const qSnapshot = await getDocs(collection(db, "patients", patientId, "vitals"));
    qSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        patientId,
        systolic: Number(data.systolic),
        diastolic: Number(data.diastolic),
        pulse: Number(data.pulse),
        temperature: Number(data.temperature),
        weight: Number(data.weight),
        symptoms: data.symptoms || [],
        recordedBy: data.recordedBy,
        riskAlerts: data.riskAlerts || [],
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addVitalsLog(vitals: VitalsLog): Promise<VitalsLog> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(VITALS_KEY) || "[]");
    all.push(vitals);
    localStorage.setItem(VITALS_KEY, JSON.stringify(all));
    return vitals;
  }

  const path = `patients/${vitals.patientId}/vitals/${vitals.id}`;
  try {
    const docRef = doc(db, "patients", vitals.patientId, "vitals", vitals.id);
    await setDoc(docRef, {
      ...vitals,
      createdAt: Timestamp.fromDate(new Date(vitals.createdAt))
    });
    return vitals;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getChatHistory(patientId: string): Promise<ChatLog[]> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
    return all
      .filter((c: any) => c.patientId === patientId)
      .map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) }))
      .sort((a: ChatLog, b: ChatLog) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  const path = `patients/${patientId}/chats`;
  try {
    const list: ChatLog[] = [];
    const qSnapshot = await getDocs(collection(db, "patients", patientId, "chats"));
    qSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        patientId,
        role: data.role,
        text: data.text,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    });
    return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function addChatMessage(msg: ChatLog): Promise<ChatLog> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
    all.push(msg);
    localStorage.setItem(CHATS_KEY, JSON.stringify(all));
    return msg;
  }

  const path = `patients/${msg.patientId}/chats/${msg.id}`;
  try {
    const docRef = doc(db, "patients", msg.patientId, "chats", msg.id);
    await setDoc(docRef, {
      ...msg,
      createdAt: Timestamp.fromDate(new Date(msg.createdAt))
    });
    return msg;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getAuditLogs(clinicId: string): Promise<AuditLog[]> {
  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
    return all
      .map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }))
      .sort((a: AuditLog, b: AuditLog) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  const path = "auditLogs";
  try {
    const list: AuditLog[] = [];
    const qSnapshot = await getDocs(collection(db, path));
    qSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        clinicId: data.clinicId,
        userId: data.userId,
        userEmail: data.userEmail,
        action: data.action,
        resource: data.resource,
        details: data.details,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function logAuditEvent(
  clinicId: string, 
  userId: string, 
  userEmail: string, 
  action: string, 
  resource: string, 
  details: string
): Promise<AuditLog> {
  const audit: AuditLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    clinicId,
    userId,
    userEmail,
    action,
    resource,
    details,
    timestamp: new Date()
  };

  if (!isFirebaseConfigured) {
    const all = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
    all.push(audit);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(all));
    return audit;
  }

  const path = `auditLogs/${audit.id}`;
  try {
    const docRef = doc(db, "auditLogs", audit.id);
    await setDoc(docRef, {
      ...audit,
      timestamp: Timestamp.fromDate(audit.timestamp)
    });
    return audit;
  } catch (error) {
    // Catch-all
    console.error("Failed writing audit entry inside rules boundary:", error);
    return audit;
  }
}
