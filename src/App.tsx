import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Cell
} from "recharts";
import PatientPortal from "./components/PatientPortal";
import ClinicianPortal from "./components/ClinicianPortal";
import EducationalVideoHub from "./components/EducationalVideoHub";
import PatientLoginSignup from "./components/PatientLoginSignup";
import AiDiagnosticsLab from "./components/AiDiagnosticsLab";
import { Clinician, Patient, PatientReport, VitalsLog, MaternalMeeting, PostpartumCheckup, HospitalVisit } from "./types";
import { isFirebaseConfigured, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { collection, onSnapshot, setDoc, doc, getDocs } from "firebase/firestore";

// Import local SADC maternal health images for guaranteed production Vite bundling and loading
import imgMaternalBabyStages from "./assets/images/maternal_baby_stages_1781801156793.jpg";
import imgPinkFlowerDream from "./assets/images/pink_flower_dream_1781801176611.jpg";
import imgSuccessfulMother from "./assets/images/successful_mother_1781975583165.jpg";
import imgPregnantAdvice from "./assets/images/pregnant_advice_1781975600218.jpg";
import imgSadcMotherCounseling from "./assets/images/sadc_mother_counseling_1781976955140.jpg";
import imgMaternalPeerCircle from "./assets/images/maternal_peer_circle_1781976969029.jpg";
import imgGynecologyBackground from "./assets/images/gynecology_background_1781981188780.jpg";
import { 
  Stethoscope, 
  Globe, 
  Globe2,
  Heart, 
  Lock, 
  Smartphone, 
  Sparkles, 
  ActivitySquare, 
  AlertTriangle,
  Menu,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  PhoneCall,
  Download,
  Info,
  HelpCircle,
  Phone,
  X
} from "lucide-react";

// Interactive regional African & rare pregnancy conditions database for awareness raising
const awarenessConditions = [
  {
    id: "pre-eclampsia",
    name: "Pre-Eclampsia / Eclampsia",
    icon: "🩸",
    prevalence: "Affects 8-10% of gestations in Sub-Saharan Africa. One of the leading direct causes of maternal mortality in Southern African clinics.",
    desc: "A rapid-onset pregnancy complication characterized by high blood pressure, protein in urine, and sudden swollen limbs. Left untreated, it can transition into life-threatening eclampsia (seizures).",
    signals: [
      "Severe persistent headache that won't go away",
      "Sudden swelling (edema) in face, hands, and feet",
      "Visual disturbances or blurring/spots",
      "Upper abdominal pain or nausea"
    ],
    precautions: [
      "Check blood pressure regularly (aim for under 140/90 mmHg)",
      "Reduce excess processed salts and stay thoroughly hydrated",
      "Attend every scheduled prenatal clinic screening session",
      "Consult a doctor early if sudden weight gain occurs"
    ],
    howVytalHelps: "Vytal's offline triage engine checks entered pressures. Any systolic value over 140 or diastolic over 90 triggers an immediate system alert, automatically creating a high-priority report for Dr. Masuku's portal."
  },
  {
    id: "diabetes",
    name: "Gestational Diabetes (GDM)",
    icon: "🍬",
    prevalence: "Frequently under-reported, affecting up to 7-14% of African mothers, rising significantly with urban dietary changes.",
    desc: "High blood glucose levels that develop during pregnancy. Can trigger excessive fetal birthweight, complex delivery procedures, and neonatal hypoglycemia.",
    signals: [
      "Unusual or continuous excessive thirst",
      "Unusually frequent urination (especially during late hours)",
      "Heavy physical fatigue or blurred vision",
      "Recurrent minor skin or vaginal infections"
    ],
    precautions: [
      "Log visual or metric blood sugar counts weekly",
      "Focus on low-glycemic, fiber-rich local grains",
      "Engage in safe, low-impact exercise (e.g., 20 min morning walks)",
      "Receive glucose screening between weeks 24 and 28"
    ],
    howVytalHelps: "Secure biometric tracking charts blood sugars and tags anomalies. It suggests non-medical dietary guides from the Academy and notifies the community support system for remote reassurance."
  },
  {
    id: "anemia",
    name: "Iron Deficiency Anemia",
    icon: "🥗",
    prevalence: "Prevalent in up to 40% of pregnancies across remote SADC communities, causing increased risk of postpartum bleeding (hemorrhage).",
    desc: "A condition where red blood cell count drops dangerously due to low dietary iron, locking oxygen supply to the child and leaving mothers severely weak.",
    signals: [
      "Severe fatigue, weakness, or lethargy",
      "Pale eyelids, gums, skin, or nail beds",
      "Dizziness, lightheadedness, or fast breathing",
      "Unusual cravings for ice or dirt (pica)"
    ],
    precautions: [
      "Incorporate iron-rich meals (spinach, beans, eggs, lean meats)",
      "Take daily prescribed prenatal iron & folic acid (IFA) supplements",
      "Vitamin C (e.g. oranges) boosts iron absorbed from vegetarian meals",
      "Avoid drinking coffee/tea with food, as they block iron absorption"
    ],
    howVytalHelps: "Ask Vytal's voice triage interprets vocal fatigue complaints. The Academy provides interactive guidelines on localized nutritional ingredients and triggers routine iron-intake reminders."
  },
  {
    id: "ppcm",
    name: "Peripartum Cardiomyopathy (PPCM)",
    icon: "🫀",
    prevalence: "Rare worldwide, but significantly more prevalent in Sub-Saharan African women (~1 in 1,000 live births), with genetic and geographic risk factors.",
    desc: "An idiopathic, rare form of heart muscle weakness that develops in the final month of pregnancy or first 5 months postpartum. Symptoms overlap with standard end-of-pregnancy signs, making awareness crucial.",
    signals: [
      "Extreme shortness of breath, especially when lying completely flat",
      "Severe nighttime coughing or chest tight sensation",
      "Rapid, fluttery resting heart rate (palpitations)",
      "Excessive swelling in lower legs and ankles"
    ],
    precautions: [
      "Track pulse metrics during times of rest (resting heart rate should stay stable)",
      "Avoid sleeping completely flat if breathing feels heavily restricted",
      "Do not shrug off extreme breathing distress in week 36+ as 'normal pregnancy heavy breathing'",
      "Consult a doctor early if sudden weight gain or heart flutters postpartum"
    ],
    howVytalHelps: "If resting heart rate logs exceed clinical boundaries (e.g., above 100 bpm), Vytal flags it under 'Extreme Caution' and enqueues immediate warning indicators on the Clinician's master board."
  },
  {
    id: "afe",
    name: "Amniotic Fluid Embolism (AFE)",
    icon: "⚠️",
    prevalence: "Extremely rare (1 in 40,000 births) but highly fatal global emergency, demanding instantaneous hospital dispatch.",
    desc: "An unpredictable, rapid clinical emergency where amniotic fluid leaks into the maternal bloodstream during late labor, causing severe rapid cardiorespiratory distress.",
    signals: [
      "Sudden, massive drop in breathing capacity",
      "Rapid blood pressure collapse or severe bluish fingers (hypoxia)",
      "Uncontrolled shivering, anxiety, or state of panic during early labor",
      "Sudden fetal heart tone drops"
    ],
    precautions: [
      "Labor must occur in professional clinics or referral institutions with resuscitation kits",
      "Ensure clinicians are prepared for immediate high-oxygen delivery setups",
      "Identify high-risk indicators (e.g., advanced maternal age or placental complications)",
      "Know your regional referral emergency ambulance dispatch coordinates"
    ],
    howVytalHelps: "Provides quick single-click SADC Ambulance or Mbabane Dispatch VoIP dialers, streaming biometric history logs as doctors race to provide emergency advanced life support."
  }
];

const PARADIGM_SHIFT_DATA = [
  {
    metric: "Pre-Eclampsia Mortality (%)",
    traditional: 68,
    vytalBridge: 12,
    desc: "Proactive BP tracking prevents progression to severe gestational seizures"
  },
  {
    metric: "Delayed Referral Emergencies (%)",
    traditional: 82,
    vytalBridge: 14,
    desc: "Early telemetry bypasses the traditional clinic administrative bottleneck"
  },
  {
    metric: "Unmonitored Early Miscarriage (%)",
    traditional: 45,
    vytalBridge: 8,
    desc: "First trimester subchorionic scans allow early clinic stabilization"
  },
  {
    metric: "Remote High-Risk Detection (%)",
    traditional: 18,
    vytalBridge: 94,
    desc: "Decentralized digital checklists flag high-risk cases in remote villages"
  }
];

export default function App() {
  // Navigation Routing Mode: "landing" | "patient" | "clinician" | "ai-lab"
  const [activeSurface, setActiveSurface] = useState<"landing" | "patient" | "clinician" | "ai-lab">("landing");
  
  // Unified Global Language Selection for full system synchronization
  const [globalLanguage, setGlobalLanguage] = useState<string>("English");
  
  // Track regional awareness interactive sub-selection
  const [activeAwarenessId, setActiveAwarenessId] = useState<string>("pre-eclampsia");

  // Gestational index sandbox sync state
  const [currentWeek, setCurrentWeek] = useState<number>(18);
  
  // Secure logged in clinician session (Sister Thandeka)
  const [sessionClinician, setSessionClinician] = useState<Clinician | null>(null);

  // Secure logged in patient session (Mother)
  const [sessionPatient, setSessionPatient] = useState<Patient | null>(() => {
    try {
      const saved = localStorage.getItem("vytal_patient_session");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse patient session:", e);
    }
    return null;
  });

  const handlePatientLogin = (patient: Patient) => {
    setSessionPatient(patient);
    localStorage.setItem("vytal_patient_session", JSON.stringify(patient));
    if (patient.gestationalWeeks) {
      setCurrentWeek(patient.gestationalWeeks);
    }
  };

  const handlePatientLogout = () => {
    setSessionPatient(null);
    localStorage.removeItem("vytal_patient_session");
  };

  const handleUssdSubmit = (inputValue: string) => {
    const code = inputValue.trim();
    setUssdError("");

    if (!code) return;

    if (!ussdSessionActive) {
      if (code === "*120*375#" || code === "*120*0#" || code === "*375#" || code === "*0#") {
        setUssdSessionActive(true);
        setUssdMenuState("main");
        setUssdInputVal("");
      } else {
        setUssdError("Invalid network channel. Dial *120*375# or *375# to establish SADC wireless hookup.");
      }
      return;
    }

    if (code === "0") {
      if (ussdMenuState === "main") {
        setUssdSessionActive(false);
        setUssdMenuState("dial");
      } else if (
        ussdMenuState === "trimester" ||
        ussdMenuState === "conditions" ||
        ussdMenuState === "emergency" ||
        ussdMenuState === "clinic"
      ) {
        setUssdMenuState("main");
      } else if (ussdMenuState.startsWith("details_tri")) {
        setUssdMenuState("trimester");
      } else if (ussdMenuState.startsWith("details_cond")) {
        setUssdMenuState("conditions");
      } else if (ussdMenuState === "sos_triggered") {
        setUssdSessionActive(false);
        setUssdMenuState("dial");
      }
      setUssdInputVal("");
      return;
    }

    if (ussdMenuState === "main") {
      if (code === "1") {
        setUssdMenuState("trimester");
      } else if (code === "2") {
        setUssdMenuState("conditions");
      } else if (code === "3") {
        setUssdMenuState("emergency");
      } else if (code === "4") {
        setUssdMenuState("clinic");
      } else {
        setUssdError("Invalid entry. Press 1, 2, 3, 4, or 0.");
      }
    } else if (ussdMenuState === "trimester") {
      if (code === "1") {
        setUssdMenuState("details_tri1");
      } else if (code === "2") {
        setUssdMenuState("details_tri2");
      } else if (code === "3") {
        setUssdMenuState("details_tri3");
      } else {
        setUssdError("Invalid trimester option. Press 1, 2, 3, or 0.");
      }
    } else if (ussdMenuState === "conditions") {
      if (code === "1") {
        setUssdMenuState("details_cond1");
      } else if (code === "2") {
        setUssdMenuState("details_cond2");
      } else if (code === "3") {
        setUssdMenuState("details_cond3");
      } else if (code === "4") {
        setUssdMenuState("details_cond4");
      } else {
        setUssdError("Invalid condition select. Press 1-4, or 0.");
      }
    } else if (ussdMenuState === "emergency") {
      if (code === "1" || code === "2" || code === "3") {
        setUssdMenuState("sos_triggered");
        const alertNames = ["Pre-Eclampsia Seizure", "Remote Hemorrhage Emergency", "Heavy Persistent Maternal Fever"];
        const selectedLabel = alertNames[parseInt(code) - 1] || "Emergency Call";

        // Push immediate biometric warning to showcase in both patient and sister portals!
        setVitalsLog(prev => [
          ...prev,
          {
            id: `v-ussd-${Date.now()}`,
            patientId: "demo-patient",
            pulse: 125,
            recordedBy: "patient",
            createdAt: new Date().toISOString(),
            systolic: 170,
            diastolic: 115,
            temperature: 39.2,
            weight: 68,
            notes: `🚨 CRITICAL USSD EMERGENCY SOS Broadcast: [${selectedLabel}] triggered offline via SADC *120*375#`
          }
        ]);
      } else {
        setUssdError("Invalid SOS option. Choose 1, 2, 3, or 0.");
      }
    } else if (ussdMenuState === "sos_triggered") {
      setUssdSessionActive(false);
      setUssdMenuState("dial");
    } else {
      setUssdError("Menu terminal is active. Press 0 to go back.");
    }
    setUssdInputVal("");
  };
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [showQuickContactsModal, setShowQuickContactsModal] = useState(false);

  // SMS Share Knowledge modal states
  const [smsModalData, setSmsModalData] = useState<{ isOpen: boolean; title: string; text: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // USSD Pregnancy Companion Simulator states
  const [ussdSessionActive, setUssdSessionActive] = useState<boolean>(false);
  const [ussdMenuState, setUssdMenuState] = useState<string>("dial"); // "dial" | "main" | "trimester" | "conditions" | "emergency" | "clinic" | "details_tri1" ...
  const [ussdInputVal, setUssdInputVal] = useState<string>("");
  const [ussdError, setUssdError] = useState<string>("");

  // Offline-first simulation state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Postpartum Checkups State (for Mama's first two weeks postpartum)
  const [postpartumCheckups, setPostpartumCheckups] = useState<PostpartumCheckup[]>([
    {
      id: "ppc-1",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      day: "Day 1 Postpartum Diagnostic",
      date: "2026-06-18",
      status: "completed",
      clinicianName: "Sister Thandeka Kunene",
      vitals: { bp: "115/72", hr: 78, temp: 36.5, weight: 70.2 },
      lochiaStatus: "Normal/Moderate",
      breastfeedingStatus: "Established with assist",
      neonatalJaundice: "Absent",
      doctorNotes: "Lochia flow normal, fundus firm and well-contracted. Mother is walking comfortably. Baby Sifiso breastfeeding nicely.",
      tasks: [
        { label: "Check physical fundus firmness", done: true },
        { label: "Initiate immediate direct latch", done: true },
        { label: "Review red flag warning signs (hemorrhage)", done: true }
      ]
    },
    {
      id: "ppc-2",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      day: "Day 3 Vital Checkup & Screening",
      date: "2026-06-20",
      status: "completed",
      clinicianName: "Sister Thandeka Kunene",
      vitals: { bp: "118/75", hr: 82, temp: 36.6, weight: 70.0 },
      lochiaStatus: "Normal / Serosa",
      breastfeedingStatus: "Active",
      neonatalJaundice: "Mild (Monitor)",
      doctorNotes: "Regular check completed. Mild newborn jaundice noted, instructed mother on morning sunlight therapy. Follow-up scheduled.",
      tasks: [
        { label: "Measure blood pressure & maternal temp", done: true },
        { label: "Screen newborn for bilirubin / jaundice signs", done: true },
        { label: "Counsel on emotional wellness (baby blues)", done: true }
      ]
    },
    {
      id: "ppc-3",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      day: "Day 7 Wound & Infant Review",
      date: "2026-06-25",
      status: "scheduled",
      clinicianName: "Dr. Thabo Masuku",
      vitals: { bp: "", hr: 0, temp: 0, weight: 0 },
      lochiaStatus: "Pending evaluation",
      breastfeedingStatus: "Pending evaluation",
      neonatalJaundice: "Pending evaluation",
      doctorNotes: "To check: postpartum maternal wound healing, neonatal weight progression, breastfeeding latch posture.",
      tasks: [
        { label: "Examine perineal/cesarean wound healing", done: false },
        { label: "Weigh baby & confirm weight progression", done: false },
        { label: "Review infantile sleep safe environments", done: false }
      ]
    },
    {
      id: "ppc-4",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      day: "Day 14 Immunization & Family Sync",
      date: "2026-07-02",
      status: "scheduled",
      clinicianName: "Sister Thandeka Kunene",
      vitals: { bp: "", hr: 0, temp: 0, weight: 0 },
      lochiaStatus: "Pending evaluation",
      breastfeedingStatus: "Pending evaluation",
      neonatalJaundice: "Pending evaluation",
      doctorNotes: "Ensure first vaccine cycle (BCG/OPV) is recorded in Road to Health card.",
      tasks: [
        { label: "Deliver infantile immunization batch #1", done: false },
        { label: "Assess maternal physical recovery index", done: false },
        { label: "Hold family planning / contraceptive sync", done: false }
      ]
    }
  ]);

  // Hospital Visits State
  const [hospitalVisits, setHospitalVisits] = useState<HospitalVisit[]>([
    {
      id: "visit-1",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      date: "2026-04-10",
      hospitalName: "Mbabane Primary Maternal Health Centre",
      reason: "Initial Prenatal Intake & Ultrasound",
      clinicianName: "Sister Thandeka Kunene",
      diagnosis: "Gestation confirmed (12 weeks) • Mild morning fatigue",
      notes: "Baseline lab tests completed: Hb 11.2 g/dL (mild anemia screen), HIV negative, Rh positive. Prescribed standard daily prenatal iron and folic acid supplements.",
      followUpDate: "2026-05-10"
    },
    {
      id: "visit-2",
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      date: "2026-05-14",
      hospitalName: "Mbabane General Hospital",
      reason: "Anemia Follow-up & Gestational Diabetes Screening",
      clinicianName: "Dr. Thabo Masuku",
      diagnosis: "Mild Iron Deficiency Anemia • Normal Glucose Curve",
      notes: "Hb raised slightly to 11.6 g/dL. Glucose tolerance test fasting level: 4.8 mmol/L (well within safe bounds). Reinforced dietary diversity with local iron-rich foods.",
      followUpDate: "2026-06-15"
    }
  ]);

  const handleAddHospitalVisit = (newVisit: HospitalVisit) => {
    setHospitalVisits(prev => [newVisit, ...prev]);
  };

  const handleUpdatePostpartumCheckup = (updated: PostpartumCheckup) => {
    setPostpartumCheckups(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Shared Reports State stored in LocalStorage for cross-surface syncing
  const [sharedReports, setSharedReports] = useState<PatientReport[]>([]);
  const [maternalMeetings, setMaternalMeetings] = useState<MaternalMeeting[]>([]);

  // Community & Safety States
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityComments, setCommunityComments] = useState<any[]>([]);
  const [safetyAuditLogs, setSafetyAuditLogs] = useState<any[]>([]);
  const [moderationAppeals, setModerationAppeals] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [topicNotifications, setTopicNotifications] = useState({
    nausea: true,
    movement: true,
    appointments: true,
    nutrition: false,
    labor: true,
    general: true
  });

  // Local storage keys
  const REPORTS_STORAGE_KEY = "vytal_shared_reports_v1";
  const WEEK_STORAGE_KEY = "vytal_current_week_v1";
  const POSTS_STORAGE_KEY = "vytal_posts_v1";
  const COMMENTS_STORAGE_KEY = "vytal_comments_v1";
  const AUDIT_STORAGE_KEY = "vytal_audit_v1";
  const APPEALS_STORAGE_KEY = "vytal_appeals_v1";
  const BLOCKED_STORAGE_KEY = "vytal_blocked_v1";
  const NOTIF_STORAGE_KEY = "vytal_notif_v1";
  const MEETINGS_STORAGE_KEY = "vytal_meetings_v1";

  // Feed in clinical vitals list
  const [vitalsLog, setVitalsLog] = useState<VitalsLog[]>([
    {
      id: "v-pre-1",
      patientId: "pat-2",
      systolic: 112,
      diastolic: 72,
      pulse: 78,
      temperature: 36.4,
      weight: 69.5,
      recordedBy: "Self",
      createdAt: new Date(Date.now() - 3600000 * 24 * 28).toISOString() // 28 days ago
    },
    {
      id: "v-pre-2",
      patientId: "pat-2",
      systolic: 114,
      diastolic: 73,
      pulse: 80,
      temperature: 36.5,
      weight: 70.0,
      recordedBy: "Self",
      createdAt: new Date(Date.now() - 3600000 * 24 * 21).toISOString() // 21 days ago
    },
    {
      id: "v-pre-3",
      patientId: "pat-2",
      systolic: 115,
      diastolic: 74,
      pulse: 82,
      temperature: 36.5,
      weight: 70.6,
      recordedBy: "Self",
      createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString() // 14 days ago
    },
    {
      id: "v-pre-4",
      patientId: "pat-2",
      systolic: 116,
      diastolic: 75,
      pulse: 84,
      temperature: 36.6,
      weight: 71.0,
      recordedBy: "Self",
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString() // 7 days ago
    },
    {
      id: "v-1",
      patientId: "pat-2",
      systolic: 118,
      diastolic: 75,
      pulse: 86,
      temperature: 36.6,
      weight: 71.5,
      recordedBy: "Self",
      createdAt: new Date().toISOString()
    }
  ]);

  // General audit helper
  const addAuditLog = (action: string, targetId: string, targetType: "post" | "comment" | "user", details: string, actor: string = "Kelebogile Mokgoro (Patient)") => {
    const newEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      targetId,
      targetType,
      details
    };
    setSafetyAuditLogs(prev => {
      const updated = [newEntry, ...prev];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Load and pre-populate initial states on startup
  useEffect(() => {
    // 1. Get current gestational week sandbox value
    const savedWeek = localStorage.getItem(WEEK_STORAGE_KEY);
    if (savedWeek) {
      setCurrentWeek(Number(savedWeek));
    }

    // 2. Get saved reports or load beautiful mock reports for active presentation
    const savedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (savedReports) {
      try {
        setSharedReports(JSON.parse(savedReports));
      } catch (e) {
        loadMockInitialReports();
      }
    } else {
      loadMockInitialReports();
    }

    // 3. Load Community Posts
    const savedPosts = localStorage.getItem(POSTS_STORAGE_KEY);
    if (savedPosts) {
      setCommunityPosts(JSON.parse(savedPosts));
    } else {
      const initialPosts = [
        {
          id: "pos-1",
          authorId: "pat-3",
          authorName: "Nokuthula Zulu",
          gestationalWeeks: 12,
          topic: "nausea",
          content: "Sakubona bomake! Experiencing heavy morning sickness this week. What natural remedies do you use? Is rooibos tea safe?",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          reportCount: 0,
          reported: false,
          blockedUsers: [],
          isModerated: false
        },
        {
          id: "pos-2",
          authorId: "pat-5",
          authorName: "Thandi Mabaso",
          gestationalWeeks: 31,
          topic: "movement",
          content: "Dumela! My baby's flutters are intense around 8 PM. This is my 3rd pregnancy, but it still feels so magical. Anyone else in trimester 3 enjoying kick counts?",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          reportCount: 0,
          reported: false,
          blockedUsers: [],
          isModerated: false
        },
        {
          id: "pos-3",
          authorId: "pat-1",
          authorName: "Zanele Dlamini",
          gestationalWeeks: 36,
          topic: "appointments",
          content: "Just had my regular urine and blood pressure check at Mbabane Medical Centre. The queues are slightly long today, but the midwives are incredibly helpful!",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          reportCount: 0,
          reported: false,
          blockedUsers: [],
          isModerated: false
        }
      ];
      setCommunityPosts(initialPosts);
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(initialPosts));
    }

    // 4. Load Community Comments
    const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedComments) {
      setCommunityComments(JSON.parse(savedComments));
    } else {
      const initialComments = [
        {
          id: "com-1",
          postId: "pos-1",
          authorId: "pat-2",
          authorName: "Kelebogile Mokgoro",
          content: "Ginger tea worked wonders for me in trimester 1! Rooibos is wonderful and caffeine-free too.",
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          reportCount: 0,
          reported: false,
          isModerated: false
        },
        {
          id: "com-2",
          postId: "pos-2",
          authorId: "pat-2",
          authorName: "Kelebogile Mokgoro",
          content: "Yes! 28 weeks here, counting 10 kicks is such a lovely bonding time every evening.",
          createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
          reportCount: 0,
          reported: false,
          isModerated: false
        }
      ];
      setCommunityComments(initialComments);
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(initialComments));
    }

    // 5. Load safety audit logs
    const savedAudits = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (savedAudits) {
      setSafetyAuditLogs(JSON.parse(savedAudits));
    } else {
      const initialAudits = [
        {
          id: "aud-1",
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          actor: "System Safeguard",
          action: "UNBLOCK_USER",
          targetId: "pat-2",
          targetType: "user",
          details: "Maternal peer support network initialization complete. Automated anti-spam safeguards armed."
        }
      ];
      setSafetyAuditLogs(initialAudits);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initialAudits));
    }

    // 6. Load moderation appeals
    const savedAppeals = localStorage.getItem(APPEALS_STORAGE_KEY);
    if (savedAppeals) {
      setModerationAppeals(JSON.parse(savedAppeals));
    } else {
      const initialAppeals = [
        {
          id: "app-1",
          userId: "pat-1",
          userName: "Zanele Dlamini",
          targetId: "pos-revoked-0",
          targetType: "post",
          targetContent: "Recommend specific unapproved medical injections on the forum.",
          reason: "I was only repeating what a pharmacist mentioned to me. I now understand that Vytal peer spaces require clinical coordination directly.",
          timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
          status: "pending"
        }
      ];
      setModerationAppeals(initialAppeals);
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(initialAppeals));
    }

    // 7. Load blocked users list
    const savedBlocked = localStorage.getItem(BLOCKED_STORAGE_KEY);
    if (savedBlocked) {
      setBlockedUsers(JSON.parse(savedBlocked));
    }

    // 8. Load topic notification settings
    const savedNotifs = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (savedNotifs) {
      setTopicNotifications(JSON.parse(savedNotifs));
    }

    // 9. Load maternal telemedicine meetings
    const savedMeetings = localStorage.getItem(MEETINGS_STORAGE_KEY);
    if (savedMeetings) {
      try {
        setMaternalMeetings(JSON.parse(savedMeetings));
      } catch (e) {
        setMaternalMeetings([]);
      }
    } else {
      const initialMeetings: MaternalMeeting[] = [
        {
          id: "meet-01",
          patientId: "pat-2",
          patientName: "Kelebogile Mokgoro",
          clinicianName: "Sister Thandeka Kunene",
          meetingUri: "https://meet.google.com/abc-defg-hij",
          meetingCode: "abc-defg-hij",
          topic: "Pre-eclampsia Risk & Vitals Review",
          scheduledFor: new Date(Date.now() + 3600000 * 2).toISOString(), // in 2 hours
          status: "upcoming",
          createdAt: new Date().toISOString()
        }
      ];
      setMaternalMeetings(initialMeetings);
      localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(initialMeetings));
    }
  }, []);

  // Synchronize scheduled Maternal Meetings with Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    try {
      const unsubscribe = onSnapshot(collection(db, "meetings"), (snapshot) => {
        const remoteMeetings: MaternalMeeting[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          remoteMeetings.push({
            id: docSnap.id,
            patientId: data.patientId,
            patientName: data.patientName,
            clinicianName: data.clinicianName,
            meetingUri: data.meetingUri,
            meetingCode: data.meetingCode,
            topic: data.topic,
            scheduledFor: data.scheduledFor,
            status: data.status,
            createdAt: data.createdAt
          });
        });
        if (remoteMeetings.length > 0) {
          setMaternalMeetings(remoteMeetings);
          localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(remoteMeetings));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, "meetings");
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up real-time meetings collection listener:", error);
    }
  }, []);

  const loadMockInitialReports = () => {
    const initialReports: PatientReport[] = [
      {
        id: "rep-1",
        patientId: "pat-2",
        patientName: "Kelebogile Mokgoro",
        gestationalWeeks: 28,
        symptom: "Severe headache",
        severity: "Monitor",
        description: "I have been experiencing a dull headache for 2 days now, and my fingers are swollen. Recorded this symptom through Ask Vytal. Please follow up.",
        voiceNoteSimulated: true,
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 2.5).toISOString() // 2.5 hours ago
      },
      {
        id: "rep-2",
        patientId: "pat-1",
        patientName: "Zanele Dlamini",
        gestationalWeeks: 36,
        symptom: "Flashes in vision",
        severity: "Referral",
        description: "Seeing small sparkle spots when looking around. My self-recorded Blood pressure reading was 158/110.",
        voiceNoteSimulated: false,
        status: "reviewed",
        clinicianNotes: "Please report directly to Mbabane Primary Centre immediately! Blurry vision combined with high blood pressure is a key warning sign of severe pre-eclampsia.",
        clinicianAction: "Refer to care",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
      }
    ];
    setSharedReports(initialReports);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(initialReports));
  };

  // Community action handlers
  const handleAddPost = (post: { topic: any; content: string }) => {
    const newPost = {
      id: `pos-${Date.now()}`,
      authorId: "pat-2",
      authorName: "Kelebogile Mokgoro",
      gestationalWeeks: currentWeek,
      topic: post.topic,
      content: post.content,
      createdAt: new Date().toISOString(),
      reportCount: 0,
      reported: false,
      blockedUsers: [],
      isModerated: false
    };

    setCommunityPosts(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("REPORT_POST", newPost.id, "post", `Post created on topic ${post.topic}: "${post.content.substring(0, 30)}..."`);
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `com-${Date.now()}`,
      postId,
      authorId: "pat-2",
      authorName: "Kelebogile Mokgoro",
      content,
      createdAt: new Date().toISOString(),
      reportCount: 0,
      reported: false,
      isModerated: false
    };

    setCommunityComments(prev => {
      const updated = [...prev, newComment];
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("REPORT_COMMENT", newComment.id, "comment", `Comment added to post #${postId}: "${content.substring(0, 30)}..."`);
  };

  const handleReportPost = (postId: string, reason: string) => {
    setCommunityPosts(prev => {
      const updated = prev.map(p => {
        if (p.id === postId) {
          const reportCount = (p.reportCount || 0) + 1;
          return { ...p, reported: true, reportCount, reportedReason: reason };
        }
        return p;
      });
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("REPORT_POST", postId, "post", `Reported post with reason: "${reason}"`);
  };

  const handleReportComment = (commentId: string, reason: string) => {
    setCommunityComments(prev => {
      const updated = prev.map(c => {
        if (c.id === commentId) {
          const reportCount = (c.reportCount || 0) + 1;
          return { ...c, reported: true, reportCount, reportedReason: reason };
        }
        return c;
      });
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("REPORT_COMMENT", commentId, "comment", `Reported comment with reason: "${reason}"`);
  };

  const handleBlockUser = (userId: string, userName: string) => {
    setBlockedUsers(prev => {
      if (prev.includes(userId)) return prev;
      const updated = [...prev, userId];
      localStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("BLOCK_USER", userId, "user", `User blocked: "${userName}"`);
  };

  const handleUnblockUser = (userId: string, userName: string) => {
    setBlockedUsers(prev => {
      const updated = prev.filter(uid => uid !== userId);
      localStorage.setItem(BLOCKED_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("UNBLOCK_USER", userId, "user", `User unblocked: "${userName}"`);
  };

  const handleSubmitAppeal = (appealData: { targetType: "post" | "comment" | "user"; reason: string; content: string }) => {
    const newAppeal = {
      id: `app-${Date.now()}`,
      userId: "pat-2",
      userName: "Kelebogile Mokgoro",
      targetId: `item-${Date.now()}`,
      targetType: appealData.targetType,
      targetContent: appealData.content,
      reason: appealData.reason,
      timestamp: new Date().toISOString(),
      status: "pending" as const
    };

    setModerationAppeals(prev => {
      const updated = [newAppeal, ...prev];
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("APPEAL_SUBMIT", newAppeal.id, "user", `Appeal filed for ${appealData.targetType}: "${appealData.reason.substring(0, 30)}..."`);
  };

  const handleResolveAppeal = (appealId: string, status: "approved" | "rejected", moderatorNotes: string) => {
    const actorName = sessionClinician ? `${sessionClinician.name} (Clinician)` : "Sister Thandeka Kunene (Clinician)";
    
    setModerationAppeals(prev => {
      const updated = prev.map(app => {
        if (app.id === appealId) {
          return { ...app, status, moderatorNotes };
        }
        return app;
      });
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    addAuditLog("APPEAL_RESOLVE", appealId, "user", `Appeal resolved to ${status.toUpperCase()}. Notes: "${moderatorNotes}"`, actorName);
  };

  const handleToggleModeratePost = (postId: string, isComment: boolean = false) => {
    const actorName = sessionClinician ? `${sessionClinician.name} (Clinician)` : "Sister Thandeka Kunene (Clinician)";
    
    if (isComment) {
      setCommunityComments(prev => {
        const updated = prev.map(c => {
          if (c.id === postId) {
            const nextModerateState = !c.isModerated;
            addAuditLog(nextModerateState ? "REPORT_COMMENT" : "UNBLOCK_USER", c.id, "comment", `Comment moderated status set to ${nextModerateState}`, actorName);
            return { ...c, isModerated: nextModerateState };
          }
          return c;
        });
        localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      setCommunityPosts(prev => {
        const updated = prev.map(p => {
          if (p.id === postId) {
            const nextModerateState = !p.isModerated;
            addAuditLog(nextModerateState ? "REPORT_POST" : "UNBLOCK_USER", p.id, "post", `Post moderated status set to ${nextModerateState}`, actorName);
            return { ...p, isModerated: nextModerateState };
          }
          return p;
        });
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleUpdateTopicNotifications = (levels: any) => {
    setTopicNotifications(levels);
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(levels));
  };

  // Schedule a real telehealth clinic session with Google Meet
  const handleScheduleMeeting = async (patientId: string, patientName: string, topic: string, scheduledFor: string, meetingUri: string, meetingCode: string) => {
    const newMeeting: MaternalMeeting = {
      id: `meet-${Date.now()}`,
      patientId,
      patientName,
      clinicianName: sessionClinician?.name || "Sister Thandeka Kunene",
      meetingUri,
      meetingCode,
      topic,
      scheduledFor,
      status: "upcoming",
      createdAt: new Date().toISOString()
    };

    const updated = [newMeeting, ...maternalMeetings];
    setMaternalMeetings(updated);
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(updated));

    // Upload to Firebase if available
    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "meetings", newMeeting.id), newMeeting);
      } catch (error) {
        console.error("Error uploading telehealth meeting to Firebase:", error);
      }
    }
  };

  // Safe week sandboxing sync writer
  const handleSetCurrentWeek = (week: number) => {
    setCurrentWeek(week);
    localStorage.setItem(WEEK_STORAGE_KEY, String(week));
  };

  // Add reports submitted from Mother App (Surface B)
  const handleAddReport = (reportData: Omit<PatientReport, "id" | "createdAt" | "status">) => {
    const newReport: PatientReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    const updated = [newReport, ...sharedReports];
    setSharedReports(updated);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  };

  // Review reports annotated from Clinic Workspace (Surface C)
  const handleReviewReport = (reportId: string, action: "Normal" | "Monitor" | "Refer to care", notes: string) => {
    const updated = sharedReports.map(rep => {
      if (rep.id === reportId) {
        return {
          ...rep,
          status: "reviewed" as const,
          clinicianAction: action,
          clinicianNotes: notes
        };
      }
      return rep;
    });
    
    setSharedReports(updated);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));
  };

  // 1-Click bypass login bypass for clinical assessors
  const handleBypassClinicianLogin = (role: "clinician" | "admin" | "CHW") => {
    const clinicianAccount: Clinician = {
      uid: "cli-st-01",
      email: "thandeka.kunene@vytalbridge.org",
      name: "Sister Thandeka Kunene",
      role: role,
      clinicId: "mbabane-primary"
    };
    setSessionClinician(clinicianAccount);
    setLoginError(null);
  };

  const handleManualLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    setShouldShake(false);

    setTimeout(() => {
      setIsLoggingIn(false);
      if (loginEmail.endsWith("@vytalbridge.org")) {
        handleBypassClinicianLogin("clinician");
      } else {
        setLoginError("Invalid regional credential node. Use the 1-Click bypass for clinical review demonstrations.");
        setShouldShake(true);
        // Reset shouldShake after animation finishes
        setTimeout(() => setShouldShake(false), 500);
      }
    }, 1200);
  };

  const handleLogout = () => {
    setSessionClinician(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF1EA] via-[#F8D7E0] to-[#DCEEE3] flex flex-col text-[#2B1B2E] font-sans selection:bg-pink-200">
      
      {/* 1. Global SADC SADC System indicator bar */}
      <div className="bg-[#2B1B2E] text-white text-[10px] px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          {isOfflineMode ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6FB1] animate-ping"></span>
          )}
          <span className="font-semibold uppercase tracking-wider">
            {isOfflineMode 
              ? "⚠️ Offline Mode Simulating: Local Sync Registry Enabled (Offline Queue Monitoring Active)"
              : "Maternal Telehealth Node Sync Active: Mbabane, Eswatini"
            }
          </span>
        </div>
        <div className="flex items-center gap-4 font-bold">
          <button 
            type="button"
            onClick={() => setIsOfflineMode(prev => !prev)}
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1.5 ${
              isOfflineMode 
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30"
            }`}
            title="Toggle offline-first sandbox database simulation"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOfflineMode ? "bg-amber-400" : "bg-emerald-400"}`}></span>
            <span>{isOfflineMode ? "OFFLINE ACTIVE" : "GO OFFLINE"}</span>
          </button>
          <span className="opacity-80">🛡️ SADC DP-POPIA COMPLIANT</span>
          <span className="opacity-80">📡 LOCAL CACHE ACTIVE</span>
        </div>
      </div>

      {/* 2. Primary Layout Switcher floating navigational bar (Vytal Bridge Showcase Portal) */}
      <nav className="glass-panel-heavy sticky top-0 px-6 py-3.5 flex flex-wrap gap-4 items-center justify-between z-40 shadow-xs border-b border-white/30">
        
        {/* Brand logo details */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FF6FB1] to-[#E84FA0] rounded-2xl flex items-center justify-center text-white shadow-md">
            <ActivitySquare className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-black tracking-tighter leading-none text-[#2B1B2E] uppercase">
              Vytal<span className="text-[#FF6FB1]">Bridge</span>
            </h1>
            <span className="text-[10px] text-[#7A6B72] font-semibold block mt-0.5">Maternal Early-Warning Triage</span>
          </div>
        </div>

        {/* Center pill selectors */}
        <div className="flex bg-[#FFF1EE] p-0.5 rounded-xl border border-white/40 shadow-inner">
          <button
            onClick={() => setActiveSurface("landing")}
            className={`flex items-center gap-1 bg-transparent py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${activeSurface === "landing" ? "vytal-btn-gradient text-white shadow-md scale-102" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Marketing Page</span>
          </button>
          
          <button
            onClick={() => setActiveSurface("patient")}
            className={`flex items-center gap-1 bg-transparent py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${activeSurface === "patient" ? "vytal-btn-gradient text-white shadow-md scale-102" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mother App</span>
          </button>

          <button
            onClick={() => setActiveSurface("clinician")}
            className={`flex items-center gap-1 bg-transparent py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${activeSurface === "clinician" ? "vytal-btn-gradient text-white shadow-md scale-102" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Doctor Hub</span>
          </button>

          <button
            onClick={() => setActiveSurface("ai-lab")}
            className={`flex items-center gap-1.5 bg-transparent py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${activeSurface === "ai-lab" ? "vytal-btn-gradient text-white shadow-md scale-102" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span className="hidden sm:inline">AI Diagnostics & Voice Lab</span>
          </button>
        </div>

        {/* Callouts & Global Language Toggle Sync */}
        <div className="flex items-center gap-3">
          {/* Universal Language Triage Select dropdown for full workspace sync */}
          <div className="flex items-center gap-1.5 bg-[#FFF2F0] border border-[#FF6FB1]/20 px-2.5 py-1.5 rounded-xl text-neutral-800">
            <Globe2 className="w-3.5 h-3.5 text-[#E84FA0] shrink-0" />
            <select
              value={globalLanguage}
              onChange={(e) => setGlobalLanguage(e.target.value)}
              className="bg-transparent text-[11px] font-extrabold outline-none cursor-pointer text-[#2B1B2E]"
            >
              <option value="English">🇬🇧 English</option>
              <option value="siSwati">🇸🇿 siSwati</option>
              <option value="Setswana">🇧🇼 Setswana</option>
              <option value="isiZulu">🇿🇦 isiZulu</option>
              <option value="isiXhosa">🇿🇦 isiXhosa</option>
              <option value="Yoruba">🇳🇬 Yoruba</option>
              <option value="Kiswahili">🇰🇪 Kiswahili</option>
              <option value="Amharic">🇪🇹 Amharic</option>
              <option value="Français">🇫🇷 Français</option>
              <option value="Português">🇵🇹 Português</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className="text-right text-[9.5px] font-semibold leading-none">
              <span className="text-[#7A6B72]">Regional Coordinator:</span>
              <span className="block font-black text-[#2B1B2E]">Sister Thandeka Kunene</span>
            </div>
            <span className="text-xl filter saturate-120">🩺</span>
          </div>
        </div>
      </nav>

      {/* 3. Surface Mapping Engine Rendered Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto pb-24">
        
        {/* ====================================================
            SURFACE A: MARKETING PORTAL
            ==================================================== */}
        {activeSurface === "landing" && (
          <div className="space-y-16 animate-fade-in text-left font-sans">
            
            {/* Beautiful Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
              
              <div className="lg:col-span-7 space-y-6">
                
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-pink-100 text-[#E84FA0] px-3.5 py-1 rounded-full border border-[#FF6FB1]/20 shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#FF6FB1] animate-spin" style={{ animationDuration: '4s' }} /> Built for expecting mothers in Africa
                </span>

                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#2B1B2E] uppercase leading-none">
                  Every mother deserves a <span className="text-[#E84FA0]">trusted health</span> companion.
                </h1>

                <p className="text-base text-[#7A6B72] leading-relaxed max-w-xl font-medium">
                  Empowering maternal care across African communities with offline-first, multilingual voice triage, unified physical milestone tracking, and linked clinician oversight.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setActiveSurface("patient")}
                    className="vytal-btn-gradient text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl cursor-pointer hover:shadow-lg transition-all scale-100 hover:scale-[1.02] flex items-center gap-1.5 shadow-md"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Demo Patient Companion App</span>
                  </button>

                  <button
                    onClick={() => setActiveSurface("clinician")}
                    className="bg-white/80 border border-[#FF6FB1]/30 text-[#E84FA0] font-extrabold text-sm px-6 py-3.5 rounded-2xl cursor-pointer hover:bg-white transition-all shadow-xs"
                  >
                    Medical Clinician Portal
                  </button>
                </div>

                {/* Chips trust row */}
                <div className="flex flex-wrap gap-2.5 pt-4">
                  {["Voice-first Guidance", "Works Completely Offline", "Regional DPA Compliant", "African Languages Integrated"].map((ch) => (
                    <span 
                      key={ch} 
                      className="text-[10px] font-black text-[#2B1B2E] bg-white/50 backdrop-blur-md px-3.5 py-2 border border-white/50 rounded-xl shadow-3xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E84FA0]" />
                      <span>{ch}</span>
                    </span>
                  ))}
                </div>

              </div>

              {/* Right column: glowing framed clinician photo block */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="p-4 bg-white/40 border border-white/50 rounded-3xl backdrop-blur-xl relative shadow-md w-full max-w-sm">
                  
                  {/* Decorative glowing sphere background */}
                  <div className="absolute inset-x-0 bottom-1/2 translate-y-1/2 w-48 h-48 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] opacity-10 rounded-full blur-2xl filter z-0 mx-auto"></div>

                  <div className="rounded-2xl overflow-hidden bg-emerald-50 border border-white/60 shadow-xs h-96 relative z-10 flex items-center justify-center">
                    <img 
                      src={imgMaternalBabyStages} 
                      alt="Clinician Telehealth"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover scale-105"
                    />
                  </div>

                  {/* Absolute overlaid clinical metrics widget */}
                  <div className="absolute -bottom-4 left-6 right-6 bg-white/95 backdrop-blur-sm p-3 border border-white rounded-2xl shadow-lg z-20 text-left space-y-1">
                    <span className="text-[8px] font-bold text-[#E84FA0] uppercase block">Platform Doctor Coverage</span>
                    <h4 className="text-xs font-black text-[#2B1B2E] tracking-tight truncate leading-none uppercase">Assigned Clinic Center</h4>
                    <p className="text-[9.5px] text-[#7A6B72] font-semibold leading-normal">Mbabane Primary Maternal Health Centre, Eswatini</p>
                  </div>

                </div>
              </div>

            </div>

            {/* THE SILENT MATERNAL CRISIS & SYSTEMIC TRANSFORMATION HUB */}
            <div className="bg-[#FFF8F6] border-2 border-[#E84FA0]/15 rounded-[32px] p-6 md:p-10 space-y-8 shadow-md" id="maternal-complications-crisis-panel">
              <div className="max-w-3xl space-y-3 text-left">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-[#E84FA0] bg-[#E84FA0]/8 px-3.5 py-1.5 rounded-full tracking-widest">
                  🚨 THE SYSTEMIC CRITICAL REPORT
                </span>
                <h2 className="text-3xl font-black text-[#2B1B2E] uppercase tracking-tight leading-none">
                  Breaking the Loop: Why Traditional Systems Fail Expecting Mothers
                </h2>
                <p className="text-xs text-[#7A6B72] font-semibold leading-relaxed">
                  Every year, thousands of maternal complications and preventable miscarriages across the SADC region go unaddressed. Traditional hospital structures rely on retrospective appointments and manual paperwork—creating a critical diagnostic bottleneck where early warning signs are missed entirely.
                </p>
              </div>

              {/* Hard Statistics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-white border border-[#CFE6E3] p-5.5 rounded-2xl text-left space-y-2.5 shadow-3xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-xl opacity-40"></div>
                  <span className="text-[9px] font-extrabold uppercase text-[#7A6B72] tracking-wider block">Preventable Losses</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-4xl font-black text-[#E84FA0]">65% - 70%</strong>
                  </div>
                  <p className="text-[11px] text-[#2B1B2E] font-bold leading-normal">
                    of maternal deaths caused by severe Pre-Eclampsia and associated eclampsia spasms are **entirely preventable** with early, proactive blood pressure and protein telemetry.
                  </p>
                </div>

                <div className="bg-white border border-[#CFE6E3] p-5.5 rounded-2xl text-left space-y-2.5 shadow-3xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full blur-xl opacity-40"></div>
                  <span className="text-[9px] font-extrabold uppercase text-[#7A6B72] tracking-wider block">First Trimester Loss</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-4xl font-black text-[#2B1B2E]">45%</strong>
                  </div>
                  <p className="text-[11px] text-[#2B1B2E] font-bold leading-normal">
                    of premature miscarriages and ectopic pregnancies could be mitigated if warning parameters (e.g. sudden subchorionic hemorrhaging) were identified in the early weeks.
                  </p>
                </div>

                <div className="bg-white border border-[#CFE6E3] p-5.5 rounded-2xl text-left space-y-2.5 shadow-3xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-xl opacity-40"></div>
                  <span className="text-[9px] font-extrabold uppercase text-[#7A6B72] tracking-wider block">The Referral Bottleneck</span>
                  <div className="flex items-baseline gap-1">
                    <strong className="text-4xl font-black text-[#4F7066]">12+ Hours</strong>
                  </div>
                  <p className="text-[11px] text-[#2B1B2E] font-bold leading-normal">
                    is the average transport and administrative wait time in traditional rural referral systems, turning treatable prenatal complications into active medical emergencies.
                  </p>
                </div>
              </div>

              {/* Recharts Paradigm Shift Chart */}
              <div className="bg-white border border-[#CFE6E3] p-6 rounded-3xl space-y-4 shadow-sm text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#CFE6E3]/40 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase text-[#E84FA0] bg-[#E84FA0]/10 px-2.5 py-1 rounded-full tracking-widest">
                      📊 DATA JUSTIFICATION HUB
                    </span>
                    <h3 className="text-lg font-black text-[#2B1B2E] uppercase mt-1">
                      Traditional Hospital Loop vs. Vytal Telemetry Model
                    </h3>
                    <p className="text-[11px] text-[#7A6B72] font-semibold mt-0.5">
                      Visualizing the structural paradigm shift in prenatal survival and clinical responsiveness indicators.
                    </p>
                  </div>
                  <div className="text-[8px] font-mono font-black text-[#4F7066] uppercase bg-[#CFE6E3]/30 px-2 py-1 rounded border border-[#CFE6E3]/60">
                    SADC CLINICAL PROXY STATS
                  </div>
                </div>

                <div className="h-80 w-full" id="maternal-paradigm-recharts-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={PARADIGM_SHIFT_DATA}
                      margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="metric"
                        stroke="#4F7066"
                        fontSize={10}
                        fontWeight={800}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="#4F7066"
                        fontSize={10}
                        fontWeight={800}
                        tickLine={false}
                        axisLine={false}
                        dx={-5}
                      />
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#2B1B2E] text-white p-3.5 rounded-2xl border border-neutral-800 shadow-xl max-w-xs text-xs space-y-1.5">
                                <strong className="font-black text-[#E84FA0] uppercase block text-[10px] tracking-wider">
                                  {data.metric}
                                </strong>
                                <div className="flex justify-between items-center text-[11px] font-bold border-b border-white/10 pb-1.5 mb-1.5">
                                  <span className="text-neutral-400">Traditional:</span>
                                  <span className="text-rose-400">{data.traditional}%</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold border-b border-white/10 pb-1.5 mb-1.5">
                                  <span className="text-neutral-400">Vytal Bridge:</span>
                                  <span className="text-emerald-400">{data.vytalBridge}%</span>
                                </div>
                                <p className="text-[9.5px] text-pink-100/70 font-semibold italic leading-relaxed">
                                  {data.desc}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <RechartsLegend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                      />
                      <Bar
                        name="Traditional System (Reactive)"
                        dataKey="traditional"
                        fill="#7A6B72"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                      />
                      <Bar
                        name="Vytal Bridge Platform (Proactive)"
                        dataKey="vytalBridge"
                        fill="#E84FA0"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* The Systemic Loop breakdown */}
              <div className="bg-white/90 border border-pink-100 rounded-2xl p-5.5 space-y-4">
                <h4 className="text-xs font-black uppercase text-[#2B1B2E] tracking-wider flex items-center gap-1.5 text-left">
                  🔄 The Traditional System Loop of Failure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-[#7A6B72] text-left">
                  <div className="p-3 bg-[#FCF8F5] rounded-xl border border-neutral-100 space-y-1">
                    <span className="text-[#E84FA0] font-black">01. SILENT SYMPTOM</span>
                    <p className="text-[10px] leading-relaxed">Mother experiences early, mild pre-eclampsia symptoms in a remote village, but lacks tools to measure or understand them.</p>
                  </div>
                  <div className="p-3 bg-[#FCF8F5] rounded-xl border border-neutral-100 space-y-1">
                    <span className="text-[#E84FA0] font-black">02. DELAYED APPOINTMENT</span>
                    <p className="text-[10px] leading-relaxed">Booking at general district hospital takes weeks. No remote clinic possesses specialized 2D ultrasound capabilities.</p>
                  </div>
                  <div className="p-3 bg-[#FCF8F5] rounded-xl border border-neutral-100 space-y-1">
                    <span className="text-[#E84FA0] font-black">03. ACTIVE EMERGENCY</span>
                    <p className="text-[10px] leading-relaxed">Symptoms worsen rapidly into gestational seizures. Rural referral protocols lead to immediate long ambulance journeys.</p>
                  </div>
                  <div className="p-3 bg-[#FCF8F5] rounded-xl border border-neutral-100 space-y-1">
                    <span className="text-[#4F7066] font-black">04. SYSTEMIC RISE</span>
                    <p className="text-[10px] leading-relaxed">The outcome results in traumatic losses, causing maternal and miscarriage mortality statistics across SADC to rise further.</p>
                  </div>
                </div>
              </div>

              {/* Defining the Paradigm Shift (Narrative Change) */}
              <div className="space-y-4 text-left">
                <span className="text-[9px] font-black uppercase text-[#4F7066] tracking-wider block border-b border-[#CFE6E3] pb-2">
                  🌟 HOW VYTAL BRIDGE REDEFINES THE PRENATAL NARRATIVE
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Narrative for Nurses & Mothers */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-extrabold text-[#2B1B2E] uppercase flex items-center gap-1.5">
                        👩‍⚕️ For the Nurses: From Reactive Chaos to Proactive Calm
                      </h4>
                      <p className="text-[11.5px] text-[#7A6B72] font-semibold leading-relaxed">
                        Instead of managing sudden, critical late-stage complications in understaffed emergency rooms, nurses are armed with **real-time triage dashboards**. Early telemetric alerts flag asymptomatic high-risk patients weeks in advance, enabling focused outpatient interventions and structured specialist coordination.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-extrabold text-[#2B1B2E] uppercase flex items-center gap-1.5">
                        🤰 For the Mothers: Reclaiming Agency and Lifelines
                      </h4>
                      <p className="text-[11.5px] text-[#7A6B72] font-semibold leading-relaxed">
                        Mothers are no longer left in isolation, guessing if their swelling or headaches are normal. With voice-first symptom assessments and instant local USSD advice, they reclaim control over their bodies. They are backed by an active safety net that advises them precisely when to seek clinical attendance.
                      </p>
                    </div>
                  </div>

                  {/* Narrative for Families & The Nation */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-extrabold text-[#2B1B2E] uppercase flex items-center gap-1.5">
                        🏡 For the Families: Safeguarding Generations & Hope
                      </h4>
                      <p className="text-[11.5px] text-[#7A6B72] font-semibold leading-relaxed">
                        Avoidable maternal deaths and unexpected miscarriages tear families and communities apart. Vytal Bridge preserves the integrity of these families, ensuring that the journey of bringing new life into the world is defined by security, celebratory support, and clinical confidence rather than tragic loss.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <h4 className="text-sm font-extrabold text-[#2B1B2E] uppercase flex items-center gap-1.5">
                        🇿🇦 For the Nation: A Stronger, Healthier Future
                      </h4>
                      <p className="text-[11.5px] text-[#7A6B72] font-semibold leading-relaxed">
                        By integrating decentralized telemedicine, Vytal Bridge elevates public health indicators, lowers maternal mortality ratios, and relieves pressure on tertiary hospitals. It establishes a resilient prenatal infrastructure that fosters a healthy, thriving population from the very first trimester.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* How it Works cards info */}
            <div className="space-y-6 pt-8">
              <div className="text-center space-y-1 max-w-sm mx-auto">
                <h2 className="text-xs font-black text-[#E84FA0] uppercase tracking-widest">Interactive Operational Channels</h2>
                <h3 className="text-xl font-black text-[#2B1B2E] uppercase">How Vytal Bridge Operates</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Channel 1 */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-100 to-amber-100 flex items-center justify-center font-bold text-sm text-[#E84FA0] shadow-3xs">
                    01
                  </div>
                  <h4 className="font-extrabold text-sm uppercase text-[#2B1B2E]">Speak Your Symptoms</h4>
                  <p className="text-xs text-[#7A6B72] font-semibold leading-relaxed">
                    Mothers can discuss physical symptoms or ask medical inquiries hands-free using Ask Vytal. Voice recognition parses English, siSwati, and Setswana inputs instantly.
                  </p>
                </div>

                {/* Channel 2 */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-100 to-amber-100 flex items-center justify-center font-bold text-sm text-[#E84FA0] shadow-3xs">
                    02
                  </div>
                  <h4 className="font-extrabold text-sm uppercase text-[#2B1B2E]">Instant Triaged Evaluation</h4>
                  <p className="text-xs text-[#7A6B72] font-semibold leading-relaxed">
                    A local offline diagnostic system classifies clinical parameters into risk ratings and generates trimester-specific guidelines on the spot.
                  </p>
                </div>

                {/* Channel 3 */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-100 to-amber-100 flex items-center justify-center font-bold text-sm text-[#E84FA0] shadow-3xs">
                    03
                  </div>
                  <h4 className="font-extrabold text-sm uppercase text-[#2B1B2E]">Clinician Follow-ups</h4>
                  <p className="text-xs text-[#7A6B72] font-semibold leading-relaxed">
                    Once synced, case reports appear as critical triage alerts on Clinician Workspace. Specialists review trends and return clinical instructions directly.
                  </p>
                </div>

              </div>
            </div>

            {/* Comprehensive Feature Grid */}
            <div className="p-6 bg-white/35 backdrop-blur-xl border border-white/50 rounded-3xl space-y-6">
              <div className="text-left">
                <span className="text-[8px] font-bold text-[#E84FA0] uppercase block">SADC Maternal Health Suite</span>
                <h3 className="text-lg font-black text-[#2B1B2E] uppercase">Core Platform Features</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Weekly Pregnancy stages", desc: "Interactive trimester timeline showcasing size parameters and critical biochemical milestones." },
                  { title: "Clinical Recharts trends", desc: "Detailed timeline of maternal pulse, blood pressure, coretemperature, and weight over time." },
                  { title: "Multilingual Speech Assist", desc: "Voice transcription supporting three official Southern African languages: English, siSwati, and Setswana." },
                  { title: "Secure Case Reports Flow", desc: "Interactive cross-surface reporting enqueuing warnings, alerts, and clinician-provided advice notes." },
                  { title: "Consent and POPIA Safety", desc: "Fully monitored consent registry that locks data security protocols under SADC privacy legislation guidelines." },
                  { title: "Offline Synced Fallbacks", desc: "Fully functioning LocalStorage database fallbacks for remote clinics with poor coverage." }
                ].map((feat, index) => (
                  <div key={index} className="p-4 bg-white/60 border border-white/50 rounded-2xl text-left space-y-1.5 shadow-3xs hover:bg-white transition-colors">
                    <span className="text-xs font-extrabold uppercase text-[#2B1B2E]">{feat.title}</span>
                    <p className="text-[11px] text-[#7A6B72] font-semibold leading-normal">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SADC TELECOM OFFLINE USSD COMPANION SIMULATOR */}
            <div className="p-6 bg-gradient-to-b from-[#142622] to-[#0D1815] border border-emerald-900 rounded-3xl text-left space-y-6 shadow-xl relative overflow-hidden" id="sadc-ussd-simulator-panel">
              {/* Decorative top green laser accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/20"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left info column */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-950/80 text-emerald-400 px-3 py-1 rounded-full border border-emerald-800/40 tracking-wider">
                    📶 ZERO-DATA TELECOM ACCESS CHANNEL
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase leading-tight tracking-tight">
                    SADC USSD Offline Pregnancy Companion
                  </h3>
                  <p className="text-xs text-emerald-100/75 leading-relaxed font-semibold">
                    In deep remote rural regions or informal clinics where cellular internet packages are highly unaffordable or cellular networks drop entirely, Southern African mothers use GSM USSD codes. 
                  </p>
                  
                  <div className="p-4 bg-emerald-950/40 border border-[#4F7066]/20 rounded-2xl space-y-2 text-xs">
                    <strong className="text-emerald-400 text-[10px] uppercase block tracking-wider font-extrabold flex items-center gap-1.5">
                      💡 Quick SADC Dialer Codes:
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-200/90 font-mono">
                      <div className="p-2 bg-[#142622] rounded-xl border border-emerald-900/40">
                        <span className="text-emerald-400 font-extrabold select-all block">*120*375#</span>
                        <span className="text-[9px] text-[#7A6B72] block mt-0.5">Primary Education Info & SOS</span>
                      </div>
                      <div className="p-2 bg-[#142622] rounded-xl border border-emerald-900/40">
                        <span className="text-emerald-400 font-extrabold select-all block">*120*0#</span>
                        <span className="text-[9px] text-[#7A6B72] block mt-0.5">Alternative Clinic Syncing</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#7A6B72] leading-tight font-semibold italic">
                    💡 Click on the phone buttons or type in codes on the screen to simulate real-time pregnancy lookups, emergency dispatch notifications, and trimester details.
                  </p>
                </div>

                {/* Right phone mockup column */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-68 p-4 bg-gradient-to-b from-[#222E2B] to-[#141C1A] border-4 border-neutral-800 rounded-[36px] shadow-2xl relative select-none">
                    
                    {/* Ear speaker detail */}
                    <div className="w-12 h-1.5 bg-neutral-700 rounded-full mx-auto mb-3.5 border-t border-black"></div>

                    {/* LCD SCREEN */}
                    <div className="bg-[#1C2A20] border-4 border-[#0F1611] rounded-2xl p-3 h-56 flex flex-col justify-between shadow-inner relative overflow-hidden font-mono text-[10.5px] text-[#55E755] leading-normal uppercase">
                      {/* Ambient screen grid lines */}
                      <div className="absolute inset-0 bg-radial from-transparent to-black/10 pointer-events-none"></div>

                      <div className="space-y-1 z-10 text-left">
                        {ussdMenuState === "dial" && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] opacity-70 pb-0.5 border-b border-[#55E755]/20">
                              <span>📶 SADC TEL</span>
                              <span>12:00</span>
                            </div>
                            <p className="text-[#A5FFA5] font-black leading-tight text-center mt-2">Vytal Telecom SADC</p>
                            <p className="text-[9px] opacity-80 text-center leading-tight">Dial USSD to Connect Wireless Gateway:</p>
                            <p className="text-xs text-center text-white bg-[#0F1611]/60 py-1.5 rounded-lg border border-[#55E755]/10 mt-2 font-bold animate-pulse">
                              {ussdInputVal || "*120*375#"}
                            </p>
                            <span className="text-[8.5px] opacity-50 block text-center mt-1">Press CALL to initialize connection</span>
                          </div>
                        )}

                        {ussdMenuState === "main" && (
                          <div className="space-y-1">
                            <span className="text-[9px] opacity-65 block">SADC Vytal Web Gateway:</span>
                            <p className="text-white font-bold pb-0.5 border-b border-[#55E755]/20">1. Trimester milestones</p>
                            <p className="text-white font-bold">2. Condition warning flags</p>
                            <p className="text-white font-bold">3. Emergency SOS Broadcast</p>
                            <p className="text-white font-bold">4. Primary clinic clock</p>
                            <div className="text-[9.5px] text-[#A5FFA5] font-extrabold mt-1">
                              Select [1-4] & SEND: {ussdInputVal}
                            </div>
                          </div>
                        )}

                        {ussdMenuState === "trimester" && (
                          <div className="space-y-1">
                            <span className="text-[9px] opacity-65 block">Select Gestation Stage:</span>
                            <p className="text-white">1. Weeks 1-12 (T1)</p>
                            <p className="text-white">2. Weeks 13-26 (T2)</p>
                            <p className="text-white">3. Weeks 27-40 (T3)</p>
                            <div className="text-[9.5px] text-[#A5FFA5] mt-1">
                              Option [1-3] or 0. Back: {ussdInputVal}
                            </div>
                          </div>
                        )}

                        {ussdMenuState === "conditions" && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] opacity-65 block">SADC Awareness Registry:</span>
                            <p className="text-white">1. Pre-eclampsia/Seizures</p>
                            <p className="text-white">2. Gestational Diabetes</p>
                            <p className="text-white">3. Iron Anemia Risk</p>
                            <p className="text-white">4. Peripartum Heart</p>
                            <div className="text-[9.5px] text-[#A5FFA5] mt-0.5">
                              Select option (or 0. Back): {ussdInputVal}
                            </div>
                          </div>
                        )}

                        {ussdMenuState === "details_tri1" && (
                          <div className="space-y-1 text-[#A5FFA5]">
                            <p className="text-white font-bold border-b border-[#55E755]/20 select-none">Trimester 1 milestones</p>
                            <p className="text-[9.5px] leading-relaxed">Organs grow. Heart pulse registers by week 6. Attend clinic fast.</p>
                            <p className="text-[9px] opacity-75 mt-2">Press 0. Go back</p>
                          </div>
                        )}

                        {ussdMenuState === "details_tri2" && (
                          <div className="space-y-1 text-[#A5FFA5]">
                            <p className="text-white font-bold border-b border-[#55E755]/20 select-none">Trimester 2 milestones</p>
                            <p className="text-[9.5px] leading-relaxed">Muscles form. Keep track of gestational sugar spikes weekly.</p>
                            <p className="text-[9px] opacity-75 mt-2">Press 0. Go back</p>
                          </div>
                        )}

                        {ussdMenuState === "details_tri3" && (
                          <div className="space-y-1 text-[#A5FFA5]">
                            <p className="text-white font-bold border-b border-[#55E755]/20 select-none">Trimester 3 milestones</p>
                            <p className="text-[9.5px] leading-relaxed font-bold">Lungs mature. Count baby physical kick signals daily!</p>
                            <p className="text-[9.5px] opacity-75 mt-2">Press 0. Go back</p>
                          </div>
                        )}

                        {ussdMenuState === "details_cond1" && (
                          <div className="space-y-0.5 text-[#55E755]">
                            <p className="text-white font-bold border-b border-[#55E755]/20">Pre-Eclampsia Signs</p>
                            <p className="text-[9.5px] leading-tight font-semibold">🚨 Persistent headache, blurry sight, upper belly cramps, sudden hands swelling.</p>
                            <p className="text-[9px] opacity-75 mt-1">Press 0. Return</p>
                          </div>
                        )}

                        {ussdMenuState === "details_cond2" && (
                          <div className="space-y-0.5 text-[#55E755]">
                            <p className="text-white font-bold border-b border-[#55E755]/20">gestational diabetes</p>
                            <p className="text-[9.5px] leading-tight font-semibold">🚨 Continuous thirst, fast urination. Exercise 20 min daily.</p>
                            <p className="text-[9px] opacity-75 mt-1">Press 0. Return</p>
                          </div>
                        )}

                        {ussdMenuState === "details_cond3" && (
                          <div className="space-y-0.5 text-[#55E755]">
                            <p className="text-white font-bold border-b border-[#55E755]/20">Anemia warning</p>
                            <p className="text-[9.5px] leading-tight font-semibold">🚨 Pale gums, severe weakness, fast breathing. Avoid coffee.</p>
                            <p className="text-[9px] opacity-75 mt-1">Press 0. Return</p>
                          </div>
                        )}

                        {ussdMenuState === "details_cond4" && (
                          <div className="space-y-0.5 text-[#55E755]">
                            <p className="text-white font-bold border-b border-[#55E755]/20">PPCM warnings</p>
                            <p className="text-[9.5px] leading-tight font-semibold">🚨 Intense breath blocks when lying flat, coughing, fast palpitations.</p>
                            <p className="text-[9px] opacity-75 mt-1">Press 0. Return</p>
                          </div>
                        )}

                        {ussdMenuState === "emergency" && (
                          <div className="space-y-1">
                            <span className="text-[9px] opacity-60 text-rose-400 block font-bold">⚠️ SADC EMERGENCY DISPATCH:</span>
                            <p className="text-white">1. Blood Pressure / Seizure</p>
                            <p className="text-white">2. Heavy Bleeding</p>
                            <p className="text-white">3. Fever / Shivering</p>
                            <div className="text-[9.5px] text-rose-400 font-extrabold mt-1">
                              Select SOS [1-3] (or 0. Cancel): {ussdInputVal}
                            </div>
                          </div>
                        )}

                        {ussdMenuState === "clinic" && (
                          <div className="space-y-1 text-[#A5FFA5]">
                            <p className="text-white font-bold border-b border-[#55E755]/20">Mbabane Clinic</p>
                            <p className="text-[9px] leading-relaxed">Hrs: Mon-Fri 08h00-17h00</p>
                            <p className="text-[9px] leading-relaxed">Supervisor: Sister Kunene</p>
                            <p className="text-[9px] leading-relaxed">Hotline: +268 2404 2111</p>
                            <p className="text-[9px] opacity-75 mt-1">Press 0. Go back</p>
                          </div>
                        )}

                        {ussdMenuState === "sos_triggered" && (
                          <div className="space-y-1 text-rose-400 font-bold">
                            <p className="text-white border-b border-rose-500/20 text-center animate-pulse">📢 SOS DISPATCHED!</p>
                            <p className="text-[9.5px] leading-normal text-slate-100">Sister Thandeka notified. Dr. Masuku flagged. Biometric logs generated instantly.</p>
                            <p className="text-[9px] text-[#A5FFA5] mt-1 text-center">Press 0 to exit terminal</p>
                          </div>
                        )}
                      </div>

                      {/* Display input errors or connection confirmations */}
                      <div className="text-[8.5px] font-bold text-slate-300 border-t border-[#55E755]/10 pt-1 flex justify-between select-none">
                        <span className="text-rose-400 max-w-[120px] truncate">{ussdError}</span>
                        <span className="opacity-60">{ussdSessionActive ? "Sync Active" : "No Signal"}</span>
                      </div>
                    </div>

                    {/* PHYSICAL BUTTON LAYER */}
                    <div className="mt-4 grid grid-cols-3 gap-2.5 px-0.5 pb-0.5">
                      
                      {/* Interactive Dialer navigation actions */}
                      <button
                        type="button"
                        onClick={() => {
                          setUssdInputVal("");
                          setUssdError("");
                        }}
                        className="py-1.5 bg-[#B84040] hover:bg-rose-900 text-white text-[9px] font-black tracking-wider rounded-lg border-b-2 border-rose-950 active:translate-y-0.5 transition-all text-center cursor-pointer"
                      >
                        CLEAR
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (ussdInputVal.length > 0) {
                            setUssdInputVal(ussdInputVal.slice(0, -1));
                          }
                        }}
                        className="py-1.5 bg-neutral-600 hover:bg-neutral-700 text-neutral-100 text-[9px] font-black tracking-wider rounded-lg border-b-2 border-neutral-800 active:translate-y-0.5 transition-all text-center cursor-pointer"
                      >
                        DEL
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!ussdInputVal) {
                            // Quick fill for easier testing
                            setUssdInputVal("*120*375#");
                          } else {
                            handleUssdSubmit(ussdInputVal);
                          }
                        }}
                        className="py-1.5 bg-[#3B7A57] hover:bg-emerald-950 text-white text-[9px] font-black tracking-wider rounded-lg border-b-2 border-emerald-900 active:translate-y-0.5 transition-all text-center cursor-pointer"
                      >
                        {ussdSessionActive ? "SEND" : "CALL"}
                      </button>

                      {/* Numeric values */}
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((btn) => {
                        return (
                          <button
                            key={btn}
                            type="button"
                            onClick={() => {
                              if (ussdInputVal.length < 12) {
                                setUssdInputVal(ussdInputVal + btn);
                              }
                            }}
                            className="p-2.5 bg-[#2E3C38] hover:bg-[#3C514B] text-slate-100 text-xs font-extrabold select-none rounded-xl border-b-2 border-[#1E2724] active:translate-y-0.5 transition-all text-center cursor-pointer flex flex-col items-center justify-center"
                          >
                            <span>{btn}</span>
                          </button>
                        );
                      })}

                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 1. COMPREHENSIVE AFRICAN & RARE PREGNANCY CONDITIONS AWARENESS HUB */}
            <div className="p-6 bg-[#FCF8F5] border border-pink-200/50 rounded-3xl space-y-6 shadow-xs animate-fade-in" id="african-maternal-awareness-panel">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-pink-100 pb-4">
                <div className="text-left">
                  <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full tracking-wider">
                    SADC CLINICAL CAMPAIGN
                  </span>
                  <h3 className="text-xl font-black text-[#2B1B2E] uppercase mt-1.5">
                    African & Rare Pregnancy Conditions Awareness Hub
                  </h3>
                  <p className="text-xs text-[#7A6B72] font-medium leading-relaxed mt-0.5 max-w-2xl">
                    Every mother deserves access to life-saving clinical knowledge. Explore regional prevalence, critical warning signs, and precautions for high-risk and rare pregnancy disorders.
                  </p>
                </div>
                
                {/* Visual stats mini board */}
                <div className="p-3 bg-white border border-pink-100 rounded-2xl shadow-3xs flex items-center gap-2.5 shrink-0 self-stretch md:self-auto text-left">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
                    ⚠️
                  </div>
                  <div className="leading-none">
                    <p className="text-[14px] font-black text-[#2B1B2E]">Over 30%</p>
                    <span className="text-[8.5px] text-[#7A6B72] font-semibold block mt-0.5">SADC gestations carry hidden risks</span>
                  </div>
                </div>
              </div>

              {/* Functional interactive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left hand vertical condition selectors */}
                <div className="lg:col-span-4 flex flex-col gap-1.5 font-sans">
                  <span className="text-[8.5px] font-extrabold uppercase text-[#4F7066] tracking-widest text-left mb-1 block">
                    Select a Condition to Examine
                  </span>
                  {(() => {
                    return awarenessConditions.map((cond) => {
                      const isSelected = cond.id === activeAwarenessId;
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => setActiveAwarenessId(cond.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-white border-[#FF6FB1] text-[#E84FA0] shadow-xs scale-[1.01]"
                              : "bg-white/60 border-neutral-150 hover:bg-white text-[#2B1B2E]"
                          }`}
                        >
                          <span className="w-8 h-8 rounded-xl bg-neutral-100 border border-white/60 flex items-center justify-center text-base shrink-0 shadow-3xs">
                            {cond.icon}
                          </span>
                          <div className="leading-tight text-left">
                            <p className="text-[11px] font-black leading-tight">{cond.name}</p>
                            <span className="text-[8px] text-[#7A6B72] font-semibold mt-0.5 line-clamp-1 block">
                              {cond.id === "ppcm" || cond.id === "afe" ? "Rare Disorder" : "Regional Prevalence"}
                            </span>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Right hand expanding details board */}
                <div className="lg:col-span-8 bg-white border border-pink-100 rounded-3xl p-5 md:p-6 space-y-4 text-left shadow-3xs relative overflow-hidden">
                  
                  {/* Visual ambient pink gradient element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6FB1]/5 to-transparent rounded-full pointer-events-none"></div>

                  {(() => {
                    const activeAwarenessCond = awarenessConditions.find(c => c.id === activeAwarenessId) || awarenessConditions[0];
                    return (
                      <motion.div
                        key={activeAwarenessCond.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="space-y-4"
                      >
                        {/* Active selected heading and statistics */}
                        <div className="space-y-1.5 relative z-10 border-b border-dashed border-neutral-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{activeAwarenessCond.icon}</span>
                            <h4 className="text-base font-extrabold uppercase text-[#2B1B2E] leading-none">
                              {activeAwarenessCond.name}
                            </h4>
                          </div>
                          <div className="bg-rose-50/50 border border-rose-100/40 p-2.5 rounded-xl text-[9.5px] leading-relaxed text-rose-950 font-semibold flex gap-2">
                            <span className="text-rose-600 font-extrabold text-xs shrink-0 mt-0.5">⚕️</span>
                            <div>
                              <strong className="text-rose-900">Regional Impact Factor: </strong>
                              {activeAwarenessCond.prevalence}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#5F716A] leading-relaxed font-semibold">
                          {activeAwarenessCond.desc}
                        </p>

                        {/* Red flags and precautions nested details columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          
                          {/* Red warning signals panel */}
                          <div className="p-4 bg-rose-50/20 border border-rose-100 rounded-2xl space-y-2">
                            <span className="text-[9px] font-black uppercase text-rose-700 tracking-wider flex items-center gap-1">
                              🚨 Warning red flags
                            </span>
                            <ul className="space-y-1.5">
                              {activeAwarenessCond.signals.map((sig, sIdx) => (
                                <li key={sIdx} className="text-[10px] text-[#2B1B2E] font-semibold flex items-start gap-1.5 leading-snug">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                                  <span>{sig}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Green precautions panel */}
                          <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-2xl space-y-2">
                            <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                              🛡️ Clinical Precautions
                            </span>
                            <ul className="space-y-1.5">
                              {activeAwarenessCond.precautions.map((prec, pIdx) => (
                                <li key={pIdx} className="text-[10px] text-[#2B1B2E] font-semibold flex items-start gap-1.5 leading-snug">
                                  <span className="text-emerald-700 font-extrabold text-[10px] shrink-0 mt-0.5">✓</span>
                                  <span>{prec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        {/* Share Knowledge Button for SMS copy/sending */}
                        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between p-4 bg-gradient-to-r from-pink-50/50 to-amber-50/30 border border-[#FF6FB1]/20 rounded-2xl">
                          <div className="text-left">
                            <h5 className="text-[11px] font-black uppercase text-[#2B1B2E] tracking-tight">Support Network Broadcast</h5>
                            <p className="text-[9px] text-[#7A6B72] font-semibold leading-tight mt-0.5">
                              Generate an SMS-ready health tip of {activeAwarenessCond.name} for your friends, family or community care contacts.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const smsText = `🤰 VYTAL CARE SUMMARY: ${activeAwarenessCond.name.toUpperCase()}\n\n🚨 WARNING RED FLAGS:\n${activeAwarenessCond.signals.map(s => `• ${s}`).join('\n')}\n\n🛡️ CLINICAL PRECAUTIONS:\n${activeAwarenessCond.precautions.map(p => `• ${p}`).join('\n')}\n\nSent via Vytal Companion App - Empowering SADC Maternal Safety.`;
                              setSmsModalData({
                                isOpen: true,
                                title: activeAwarenessCond.name,
                                text: smsText
                              });
                              setIsCopied(false);
                            }}
                            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#E84FA0] to-[#FF6FB1] hover:from-[#d63e8f] hover:to-[#e25d9b] text-white text-[10px] font-extrabold uppercase rounded-xl cursor-pointer shadow-3xs flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-98"
                          >
                            💬 Share Knowledge
                          </button>
                        </div>

                        {/* Action box: How Vytal empowers clinicians and patients to react */}
                        <div className="bg-[#FFF9F6] border border-[#FF6FB1]/20 p-3.5 rounded-2xl flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-sm shrink-0">
                            🔗
                          </div>
                          <div className="leading-tight text-left">
                            <strong className="text-[10px] uppercase font-black tracking-wider text-[#E84FA0] block">
                              How Vytal Bridges The Gap:
                            </strong>
                            <p className="text-[10px] text-[#7A6B72] font-semibold leading-normal mt-0.5">
                              {activeAwarenessCond.howVytalHelps}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                </div>

              </div>
            </div>

            {/* 2. MATERNAL SUCCESS STORIES & TESTIMONIALS SECTION */}
            <div className="space-y-6 pt-6" id="maternal-testimonials-section">
              <div className="text-center space-y-1">
                <span className="text-[9px] font-black text-[#E84FA0] uppercase tracking-widest block">
                  REAL STORIES, REAL SAVED LIVES
                </span>
                <h3 className="text-xl font-black text-[#2B1B2E] uppercase">
                  Testimonials from our SADC Mothers
                </h3>
                <p className="text-xs text-[#7A6B72] max-w-lg mx-auto font-semibold leading-relaxed">
                  Discover how our offline-first voice triage, connected medical networks, and interactive pregnancy education protect pregnant lives across remote communities.
                </p>
              </div>

              {/* Elegant dual horizontal testimonials layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Success Story A */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs text-left relative overflow-hidden group hover:bg-white transition-all">
                  <div className="space-y-4">
                    {/* Mother pregnancy picture block */}
                    <div className="h-60 rounded-2xl overflow-hidden bg-rose-50 border border-white/60 relative shadow-3xs">
                      <img 
                        src={imgSuccessfulMother} 
                        alt="Siphelele Mamba holding baby"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                      />
                      <div className="absolute top-3 left-3 bg-[#2B1B2E]/90 text-white text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <span>🇸🇿</span> PIGGS Peak, ESWATINI • SUCCESS STORY
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-[#2B1B2E] leading-snug">
                        “ Swollen Ankles & Early Triage Alerts Saved My Baby's Life ”
                      </h4>
                      <p className="text-[11px] text-[#7A6B72] font-semibold leading-relaxed italic">
                        "In my 32nd week of pregnancy, my ankles swelled up excessively overnight. I was tempted to ignore it, but I logged the physical changes inside Ask Vytal. The platform raised an immediate alert for Pre-Eclampsia and automatically synchronized it with the clinical database. Dr. Masuku called me within an hour. They admitted me early, controlled my high blood pressure, and delivered a healthy baby girl. Waiting even two context-less days could have been fatal."
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-neutral-200/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-xs text-emerald-800">
                      SM
                    </div>
                    <div className="leading-none text-left font-sans">
                      <p className="text-[10px] font-extrabold text-[#2B1B2E]">Siphelele Mamba, 29</p>
                      <span className="text-[8.5px] text-[#7A6B72] font-extrabold block mt-0.5">Primary Referral Patient • Mother of Baby Temswati</span>
                    </div>
                  </div>
                </div>

                {/* Success Story B */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs text-left relative overflow-hidden group hover:bg-white transition-all">
                  <div className="space-y-4">
                    {/* Mother pregnancy picture block */}
                    <div className="h-60 rounded-2xl overflow-hidden bg-rose-50 border border-white/60 relative shadow-3xs">
                      <img 
                        src={imgPregnantAdvice} 
                        alt="Lerato Molefe looking at app screen"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                      />
                      <div className="absolute top-3 left-3 bg-[#2B1B2E]/90 text-white text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <span>🇧🇼</span> LOBATSE, BOTSWANA • CLINICAL CONNECTION
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-[#2B1B2E] leading-snug">
                        “ Empowered by Loving Peers & Seamless Specialist Support ”
                      </h4>
                      <p className="text-[11px] text-[#7A6B72] font-semibold leading-relaxed italic">
                        "Experiencing Gestational Diabetes in a remote village felt deeply isolating. Vytal kept me safe by instantly allowing me to synchronize weekly blood glucose readings with Lobatse General Clinic. Sister Thandeka could review my trends, while the Peer Hub connected me with local diet boards. Winning nutritional quizzes in the Academy of maternal habits made my daily routine feel like a celebration instead of high-risk medical anxiety."
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-neutral-200/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E84FA0]/10 flex items-center justify-center font-black text-xs text-[#E84FA0]">
                      LM
                    </div>
                    <div className="leading-none text-left font-sans">
                      <p className="text-[10px] font-extrabold text-[#2B1B2E]">Lerato Molefe, 34</p>
                      <span className="text-[8.5px] text-[#7A6B72] font-extrabold block mt-0.5">Remote SADC Health Partner • Mother of Baby Tuelo</span>
                    </div>
                  </div>
                </div>

                {/* Success Story C */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs text-left relative overflow-hidden group hover:bg-white transition-all">
                  <div className="space-y-4">
                    {/* Mother pregnancy picture block */}
                    <div className="h-60 rounded-2xl overflow-hidden bg-rose-50 border border-white/60 relative shadow-3xs">
                      <img 
                        src={imgSadcMotherCounseling} 
                        alt="Nonhle Khumalo looking at newborn"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                      />
                      <div className="absolute top-3 left-3 bg-[#2B1B2E]/90 text-white text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <span>🇸🇿</span> MBABANE, ESWATINI • CLINICAL EXTREME CAUTION SAVED
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-[#2B1B2E] leading-snug">
                        “ Extreme Caution & Fast Doctor Referral for Rare Heart Condition ”
                      </h4>
                      <p className="text-[11px] text-[#7A6B72] font-semibold leading-relaxed italic">
                        "During my final month, I had short, fast breathing that I assumed was just normal late pregnancy fatigue. As I logged my symptoms in Vytal, the system flagged a warning context for PPCM (Peripartum cardiomyopathy) and marked my status as 'Extreme Caution'. It prompted me to perform an immediate emergency consult. The clinic’s specialist received my card instantly. They initiated cardiovascular therapies right away, preventing heart failure. This platform literal saved my life!"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-neutral-200/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-black text-xs text-rose-800">
                      NK
                    </div>
                    <div className="leading-none text-left font-sans">
                      <p className="text-[10px] font-extrabold text-[#2B1B2E]">Nonhle Khumalo, 31</p>
                      <span className="text-[8.5px] text-[#7A6B72] font-extrabold block mt-0.5">High-Risk Ambulatory Referral • Mother of Baby Sifiso</span>
                    </div>
                  </div>
                </div>

                {/* Success Story D */}
                <div className="p-5 bg-white/40 border border-white/50 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs text-left relative overflow-hidden group hover:bg-white transition-all">
                  <div className="space-y-4">
                    {/* Mother pregnancy picture block */}
                    <div className="h-60 rounded-2xl overflow-hidden bg-rose-50 border border-white/60 relative shadow-3xs">
                      <img 
                        src={imgMaternalPeerCircle} 
                        alt="Tendai Moyo with supportive mothers support circle"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                      />
                      <div className="absolute top-3 left-3 bg-[#2B1B2E]/90 text-white text-[8px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <span>🇿🇼</span> BULAWAYO, ZIMBABWE • REGIONAL PEER HUB
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase text-[#2B1B2E] leading-snug">
                        “ Thriving within a Supportive Community & Secure Clinic Loops ”
                      </h4>
                      <p className="text-[11px] text-[#7A6B72] font-semibold leading-relaxed italic">
                        "Living so far from any metropolitan hospital meant my family was deeply worried about rare pregnancy complications or sudden labor issues. The maternal peer support group inside Vytal became my absolute daily guide. We shared real caution advice and kept our diagnostic health cards synced. The platform seamlessly bridged us with doctors, so we always knew we had an emergency safety net. I felt incredibly secure and supported throughout!"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-dashed border-neutral-200/50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-black text-xs text-teal-800">
                      TM
                    </div>
                    <div className="leading-none text-left font-sans">
                      <p className="text-[10px] font-extrabold text-[#2B1B2E]">Tendai Moyo, 26</p>
                      <span className="text-[8.5px] text-[#7A6B72] font-extrabold block mt-0.5">Bulawayo Mothers Group Lead • Mother of Baby Farai</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Educational pregnancy and platform video guides */}
            <EducationalVideoHub />

          </div>
        )}

        {/* ====================================================
            SURFACE B: PATIENT COMPANION APP (MOBILE MOCKUP SHELL)
            ==================================================== */}
        {activeSurface === "patient" && (
          <div className="flex flex-col items-center justify-center space-y-6 pt-4">
            
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase text-[#E84FA0] bg-pink-100/60 border border-[#FF6FB1]/20 px-3.5 py-1 rounded-full">
                DEVICE SIMULATOR VIEW (MOBILE-FIRST SCALE)
              </span>
              <h2 className="text-xl font-black text-[#2B1B2E] uppercase">Vytal Companion App</h2>
              <p className="text-xs text-[#7A6B72] font-medium max-w-sm leading-normal mx-auto">
                Scroll the gestation slider, submit mock reports in the **Reports** tab, and toggle languages instantaneously.
              </p>
            </div>

            {/* Smartphone device container frame */}
            <div className="w-[395px] h-[720px] rounded-[48px] border-[10px] border-[#2B1B2E] bg-white overflow-hidden shadow-2xl relative flex flex-col scale-[0.98]">
              
              {/* Dynamic camera notch mockup */}
              <div className="absolute top-2 inset-x-0 w-28 h-5 bg-[#2B1B2E] rounded-full mx-auto z-50 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] mr-3"></span>
                <span className="w-1 h-1 rounded-full bg-[#101010]"></span>
              </div>

              {/* Status bar mock details */}
              <div className="h-7 bg-[#FFF9F6] text-[#2B1B2E] text-[10px] uppercase font-bold tracking-widest px-8 pt-2 flex justify-between shrink-0 select-none z-30">
                <span>09:41</span>
                <div className="flex gap-1">
                  <span>📶 SADC</span>
                  <span>🔋 98%</span>
                </div>
              </div>

              {/* Inner Portal App */}
              <div className="flex-1 overflow-hidden relative pb-1">
                {sessionPatient ? (
                  <PatientPortal 
                    patientId={sessionPatient.id}
                    onLogout={handlePatientLogout}
                    sharedReports={sharedReports}
                    onAddReport={handleAddReport}
                    currentWeek={currentWeek}
                    setCurrentWeek={handleSetCurrentWeek}
                    vitalsLog={vitalsLog}
                    onAddVitals={(v) => setVitalsLog([ ...vitalsLog, { ...v, id: `v-${Date.now()}`, createdAt: new Date().toISOString() }])}
                    communityPosts={communityPosts}
                    communityComments={communityComments}
                    onAddPost={handleAddPost}
                    onAddComment={handleAddComment}
                    onReportPost={handleReportPost}
                    onReportComment={handleReportComment}
                    onBlockUser={handleBlockUser}
                    onUnblockUser={handleUnblockUser}
                    blockedUsers={blockedUsers}
                    safetyAuditLogs={safetyAuditLogs}
                    moderationAppeals={moderationAppeals}
                    onSubmitAppeal={handleSubmitAppeal}
                    topicNotifications={topicNotifications}
                    onUpdateTopicNotifications={handleUpdateTopicNotifications}
                    maternalMeetings={maternalMeetings}
                    isOfflineMode={isOfflineMode}
                    onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
                    postpartumCheckups={postpartumCheckups}
                    onUpdatePostpartumCheckup={handleUpdatePostpartumCheckup}
                    hospitalVisits={hospitalVisits}
                    appLanguage={globalLanguage}
                    onLanguageChange={setGlobalLanguage}
                  />
                ) : (
                  <PatientLoginSignup 
                    onLoginSuccess={handlePatientLogin}
                    onSocialSignup={(newPat) => {
                      // Save new patient into local arrays if registered
                    }}
                  />
                )}
              </div>

              {/* Virtual Home Button Indicator line bottom */}
              <div className="h-5 bg-white/80 border-t border-neutral-100 flex items-center justify-center shrink-0 z-30 relative py-1.5">
                <div className="w-24 h-1 bg-neutral-300 rounded-full cursor-pointer"></div>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            SURFACE C: CLINICIAN DASHBOARD WORKSPACE
            ==================================================== */}
        {activeSurface === "clinician" && (
          <div 
            className="space-y-6 p-6 md:p-10 rounded-3xl border border-[#CFE6E3]/60 shadow-xl min-h-screen relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(244, 248, 246, 0.91), rgba(244, 248, 246, 0.91)), url('${imgGynecologyBackground}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed"
            }}
          >
            
            {sessionClinician ? (
              <ClinicianPortal 
                currentClinician={sessionClinician}
                onLogout={handleLogout}
                sharedReports={sharedReports}
                onReviewReport={handleReviewReport}
                communityPosts={communityPosts}
                communityComments={communityComments}
                safetyAuditLogs={safetyAuditLogs}
                moderationAppeals={moderationAppeals}
                onResolveAppeal={handleResolveAppeal}
                onToggleModeratePost={handleToggleModeratePost}
                maternalMeetings={maternalMeetings}
                onScheduleMeeting={handleScheduleMeeting}
                isOfflineMode={isOfflineMode}
                onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
                postpartumCheckups={postpartumCheckups}
                onUpdatePostpartumCheckup={handleUpdatePostpartumCheckup}
                hospitalVisits={hospitalVisits}
                onAddHospitalVisit={handleAddHospitalVisit}
                externalLanguage={globalLanguage}
                onLanguageChange={setGlobalLanguage}
              />
            ) : (
              // Secure login bypass dialogue
              <motion.div 
                className={`max-w-md mx-auto bg-white/60 border border-white p-8 rounded-3xl backdrop-blur-xl shadow-lg mt-12 text-left space-y-6 ${shouldShake ? "animate-shake" : ""}`} 
                id="doctor-auth-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-pink-100 text-[#E84FA0] border border-[#FF6FB1]/35 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="text-sm font-black text-[#2B1B2E] uppercase tracking-wider">Clinician Workspace Locked</h2>
                  <p className="text-xs text-[#7A6B72] font-semibold leading-relaxed">
                    Authorized clinical logs and maternal health records are monitored under South African SADC registry oversight laws.
                  </p>
                </div>

                <form onSubmit={handleManualLoginSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label htmlFor="clinician-email" className="text-[8.5px] font-black uppercase text-[#7A6B72] block mb-1">Maternity Credential Email Node:</label>
                    <input 
                      id="clinician-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. thandeka.kunene@vytalbridge.org"
                      className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 p-2.5 rounded-xl text-xs font-bold text-[#2B1B2E] focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="clinician-pass" className="text-[8.5px] font-black uppercase text-[#7A6B72] block mb-1">Pin Code Identification:</label>
                    <input 
                      id="clinician-pass"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 p-2.5 rounded-xl text-xs font-bold text-[#2B1B2E] focus:outline-none focus:ring-1 focus:ring-pink-400"
                    />
                  </div>

                  {loginError && (
                    <p className="text-[9.5px] text-red-600 font-extrabold pb-1">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] hover:shadow-lg transition-all text-white font-black uppercase text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="login-spinner">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying Session...</span>
                      </>
                    ) : (
                      "Authorize Node Login"
                    )}
                  </button>
                </form>

                <div className="pt-1 group">
                  <button
                    type="button"
                    onClick={() => setShowQuickContactsModal(true)}
                    className="w-full py-2.5 px-5 bg-pink-50 hover:bg-pink-100 hover:shadow-lg hover:shadow-pink-200 hover:scale-105 border border-pink-200/60 text-[#E84FA0] text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer animate-pulse hover:animate-none group-hover:rotate-3 transition-transform duration-300 ease-out flex items-center justify-center gap-2 focus:outline-none shadow-3xs"
                    id="btn-quick-admin-contacts"
                    title="Emergency support for clinic access issues"
                  >
                    <Phone className="w-3.5 h-3.5" /> Show Support Contacts
                  </button>
                </div>

                <div className="text-center pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPinModal(true)}
                    className="text-xs text-[#E84FA0] hover:underline font-extrabold cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
                    id="link-forgot-pin"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Forgot your credentials or PIN?
                  </button>
                </div>

                {/* Pre-configured Demo Account Bypass options */}
                <div className="pt-4 border-t border-dashed border-neutral-200 text-center space-y-2.5">
                  <span className="text-[8.5px] font-bold text-[#7A6B72] uppercase tracking-wider block">Bypass Lock Screen for Investors:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBypassClinicianLogin("clinician")}
                      type="button"
                      className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 transition-all text-white font-extrabold text-[10px] uppercase rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Sister Thandeka (Demo)</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        )}

        {/* ====================================================
            SURFACE D: AI DIAGNOSTICS & VOICE LAB WORKSPACE
            ==================================================== */}
        {activeSurface === "ai-lab" && (
          <div className="bg-[#FAF8F6] p-6 md:p-10 rounded-3xl border border-[#CFE6E3]/60 shadow-xl min-h-screen relative overflow-hidden">
            <AiDiagnosticsLab />
          </div>
        )}

      </main>

      {/* 4. Global SADC privacy footer */}
      <footer className="w-full py-6 bg-[#2B1B2E] text-white text-xs border-t border-white/5 z-30 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[#7A6B72]">
          <div className="text-left">
            <h4 className="font-extrabold text-[#E2F0E7] uppercase tracking-wider text-[11px]">Vytal Bridge Maternal Infrastructure</h4>
            <span className="text-[10px] block mt-0.5 font-medium leading-relaxed">Continuous clinical triage reporting & AI prenatal companions.</span>
          </div>
          <div className="flex gap-4 mb-2 font-bold text-[10px] text-[#AFA2A7] leading-tight">
            <span>SADC Health Standards Compliance</span>
            <span>•</span>
            <span>POPIA & GDPR Certified Enclave</span>
          </div>
        </div>
      </footer>

      {/* Quick Emergency Admin Contacts Modal */}
      {showQuickContactsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[999]" id="quick-contacts-modal-overlay">
          <div className="bg-white border-2 border-[#FF6FB1]/30 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-4 text-left animate-fade-in" id="quick-contacts-modal-box">
            <button
              type="button"
              onClick={() => setShowQuickContactsModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer transition-all focus:outline-none"
              id="close-quick-contacts-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
              <div className="w-10 h-10 bg-[#FF6FB1]/10 rounded-xl flex items-center justify-center text-[#FF6FB1]">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-[#2B1B2E] uppercase">Direct Support Contacts</h4>
                <p className="text-[10px] text-pink-700 font-extrabold font-sans">Mbabane HQ Recovery Hotline</p>
              </div>
            </div>

            <div className="space-y-4 py-2 text-xs text-[#2B1B2E] font-semibold">
              <p className="text-[#5F716A] leading-relaxed">
                For quick reference, here are the SADC-certified administrator support lines to fetch credentials or reset security pin entries:
              </p>

              <div className="p-4 bg-[#FFF9F6] border border-[#FF6FB1]/15 rounded-2xl space-y-3">
                <div className="flex gap-3 items-center">
                  <span className="text-lg leading-none">📞</span>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-[#7A6B72]">Hotline Terminal Call</p>
                    <a href="tel:+26824042111" className="text-[#E84FA0] hover:underline text-xs font-black">+268 2404 2111</a>
                  </div>
                </div>

                <div className="flex gap-3 items-center pt-2 border-t border-dashed border-pink-100">
                  <span className="text-lg leading-none">✉️</span>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-[#7A6B72]">Support Dispatch E-Mail</p>
                    <a href="mailto:recovery@vytalbridge.org" className="text-[#E84FA0] hover:underline text-xs font-black">recovery@vytalbridge.org</a>
                  </div>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-[#7A6B72] italic bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                ⚠️ Maternal registry databases operate strictly under clinical safety audits. Always verify your credential identifiers with Sister Kunene when asking for security changes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowQuickContactsModal(false)}
              className="w-full py-2.5 bg-[#4F7066] hover:bg-[#1F2E2A] text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-xs"
              id="confirm-quick-contacts-close"
            >
              Close Quick Reference
            </button>
          </div>
        </div>
      )}

      {/* Clinician and Mother PIN Recovery Modal */}
      {showForgotPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[999]" id="forgot-pin-modal-overlay">
          <div className="bg-white border-2 border-[#FF6FB1]/30 max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative p-6 space-y-4 text-left animate-fade-in" id="forgot-pin-modal-box">
            <button
              type="button"
              onClick={() => setShowForgotPinModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer transition-all focus:outline-none"
              id="close-forgot-pin-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
              <div className="w-10 h-10 bg-[#FF6FB1]/10 rounded-xl flex items-center justify-center text-[#FF6FB1]">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-[#2B1B2E] uppercase">PIN & Login Recovery Setup</h4>
                <p className="text-[10px] text-pink-700 font-extrabold font-sans">Maternal Health Directory Security Access</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-[#2B1B2E] font-medium leading-relaxed">
              <p>
                To maintain compliance with SADC privacy directives and <b>POPIA data safety standards</b>, clinicians and patient PINs cannot be reset directly online by end-users.
              </p>
              
              <div className="p-3.5 bg-[#FFF9F6] border border-[#FF6FB1]/15 rounded-2xl space-y-2">
                <span className="text-[9px] font-black uppercase text-[#E84FA0] block">Official Administrative Actions Required:</span>
                
                <div className="space-y-2 text-[11px] font-semibold text-[#5F716A]">
                  <div className="flex gap-2">
                    <span className="text-base leading-none">🏢</span>
                    <div>
                      <p className="text-[#2B1B2E] font-black leading-none">Central Administrative Office</p>
                      <p className="text-[10px] mt-0.5">Vytal Bridge Registry Desk, Mbabane HQ</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-base leading-none">📞</span>
                    <div>
                      <p className="text-[#2B1B2E] font-black leading-none">Hotline Terminal Call</p>
                      <a href="tel:+26824042111" className="text-[#E84FA0] hover:underline text-[10.5px] font-black">+268 2404 2111</a>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-base leading-none">✉️</span>
                    <div>
                      <p className="text-[#2B1B2E] font-black leading-none">Support Dispatch E-Mail</p>
                      <a href="mailto:recovery@vytalbridge.org" className="text-[#E84FA0] hover:underline text-[10.5px] font-black">recovery@vytalbridge.org</a>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-[#7A6B72] italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/50">
                ⚠️ Mothers may also request a credential and PIN lookup directly in person from the head nurse or clinic supervisor (e.g., Sister Kunene) during their biometric wellness appointments.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotPinModal(false)}
              className="w-full py-2.5 bg-[#4F7066] hover:bg-[#1F2E2A] text-white text-[11px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-xs"
              id="confirm-forgot-pin-close"
            >
              Acknowledged & Return
            </button>
          </div>
        </div>
      )}

      {/* SMS Share Knowledge Modal */}
      {smsModalData && smsModalData.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[999]" id="sms-share-modal-overlay">
          <div className="bg-white border-2 border-[#FF6FB1]/30 max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative p-5 space-y-4 text-left animate-fade-in" id="sms-share-modal-box">
            <button
              type="button"
              onClick={() => setSmsModalData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer transition-all focus:outline-none"
              id="close-sms-share-modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-pink-50 p-2.5 rounded-2xl border border-pink-100">
              <div className="w-10 h-10 bg-[#FF6FB1]/10 rounded-xl flex items-center justify-center text-[#FF6FB1] text-lg font-bold">
                📱
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-[#2B1B2E] uppercase">SMS Broadcast Packager</h4>
                <p className="text-[10px] text-pink-700 font-extrabold font-sans">Condition: {smsModalData.title}</p>
              </div>
            </div>

            <p className="text-[11px] text-[#7A6B72] font-semibold leading-normal">
              Copy the SMS-ready summary of <b>Warning Red Flags</b> and <b>Clinical Precautions</b> below. You can send it directly to your partner, family members, or neighborhood support coordinators to keep them informed!
            </p>

            <div className="relative">
              <textarea
                readOnly
                value={smsModalData.text}
                className="w-full h-48 p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-[10.5px] text-neutral-800 font-mono focus:outline-none select-all leading-normal resize-none"
                id="sms-textarea-preview"
              />
              <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(smsModalData.text);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-3xs transition-all ${
                    isCopied 
                      ? "bg-emerald-600 text-white" 
                      : "bg-[#2B1B2E] text-white hover:bg-black"
                  }`}
                  id="sms-copy-button"
                >
                  {isCopied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <a
                href={`sms:?&body=${encodeURIComponent(smsModalData.text)}`}
                className="py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider text-center rounded-xl cursor-pointer shadow-3xs transition-all flex items-center justify-center gap-1"
                id="sms-href-link"
              >
                📥 Send Native SMS
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(smsModalData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-[10px] font-black uppercase tracking-wider text-center rounded-xl cursor-pointer shadow-3xs transition-all flex items-center justify-center gap-1"
                id="whatsapp-href-link"
              >
                💬 WhatsApp Broadcast
              </a>
            </div>

            <button
              type="button"
              onClick={() => setSmsModalData(null)}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all"
              id="close-sms-modal-action"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
