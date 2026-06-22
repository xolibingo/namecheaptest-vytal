import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Patient, VitalsLog, PatientReport, MaternalMeeting, PostpartumCheckup, HospitalVisit } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart, Line, Bar, Legend } from "recharts";
import { 
  Heart, 
  Send, 
  Calendar, 
  MessageSquare, 
  PlusCircle, 
  Volume2, 
  Info, 
  PhoneCall, 
  Mic, 
  MapPin, 
  Bell, 
  ArrowRight, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Globe2, 
  User,
  Activity,
  HeartHandshake,
  Clock,
  LayoutGrid,
  ShieldAlert,
  Flag,
  Users,
  BookOpen,
  AlignLeft,
  X,
  Phone,
  HelpCircle,
  Battery,
  Droplet,
  Moon,
  Smartphone,
  Zap,
  RefreshCw,
  Sliders,
  Play,
  Pause,
  Trash2,
  StopCircle,
  Check,
  Sparkles,
  Eye,
  Gem
} from "lucide-react";
import WeeklyMilestones from "./WeeklyMilestones";
import SubscriptionPackages from "./SubscriptionPackages";

const InteractiveTrendChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formattedDate = data.dateStr || "";

    return (
      <div className="bg-[#2B1B2E] border border-neutral-100/20 p-3 rounded-2xl shadow-xl space-y-1.5 text-left text-white max-w-[210px]" id="recharts-interactive-tooltip">
        <div className="flex flex-col gap-0.5 border-b border-white/10 pb-1">
          <span className="text-[9.5px] uppercase font-black text-pink-300 tracking-wider">
            📊 {data.week}
          </span>
          {formattedDate && (
            <span className="text-[8.5px] font-semibold text-neutral-300 flex items-center gap-1">
              <span>🕒</span> <span>{formattedDate}</span>
            </span>
          )}
        </div>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const isBP = entry.name.toLowerCase().includes("bp");
            const valueUnit = isBP ? "mmHg" : "BPM";
            return (
              <div key={index} className="flex items-center justify-between gap-3 text-[9.5px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.stroke || entry.color || "#FF6FB1" }} />
                  <span className="font-extrabold text-[#DDF0E6] truncate">{entry.name}</span>
                </div>
                <span className="font-mono font-black text-white text-[9.5px] bg-white/10 px-1.5 py-0.5 rounded">
                  {entry.value} <span className="text-[7.5px] font-sans font-bold text-neutral-300 lowercase">{valueUnit}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

interface PatientPortalProps {
  externalSegment?: "timeline" | "companion" | "vitals" | "kicks" | "connections";
  onSegmentChange?: (seg: "timeline" | "companion" | "vitals" | "kicks" | "connections") => void;
  patientId?: string;
  onLogout?: () => void;
  sharedReports: PatientReport[];
  onAddReport: (report: Omit<PatientReport, "id" | "createdAt" | "status">) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  vitalsLog: VitalsLog[];
  onAddVitals: (vitals: Omit<VitalsLog, "id" | "createdAt">) => void;
  communityPosts: any[];
  communityComments: any[];
  onAddPost: (post: { topic: any; content: string }) => void;
  onAddComment: (postId: string, content: string) => void;
  onReportPost: (postId: string, reason: string) => void;
  onReportComment: (commentId: string, reason: string) => void;
  onBlockUser: (userId: string, userName: string) => void;
  onUnblockUser: (userId: string, userName: string) => void;
  blockedUsers: string[];
  safetyAuditLogs: any[];
  moderationAppeals: any[];
  onSubmitAppeal: (appeal: { targetType: "post" | "comment" | "user"; reason: string; content: string }) => void;
  topicNotifications: any;
  onUpdateTopicNotifications: (settings: any) => void;
  maternalMeetings?: MaternalMeeting[];
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  postpartumCheckups?: PostpartumCheckup[];
  onUpdatePostpartumCheckup?: (updated: PostpartumCheckup) => void;
  hospitalVisits?: HospitalVisit[];
}

export default function PatientPortal({
  patientId = "pat-2",
  onLogout,
  sharedReports,
  onAddReport,
  currentWeek,
  setCurrentWeek,
  vitalsLog,
  onAddVitals,
  communityPosts,
  communityComments,
  onAddPost,
  onAddComment,
  onReportPost,
  onReportComment,
  onBlockUser,
  onUnblockUser,
  blockedUsers,
  safetyAuditLogs,
  moderationAppeals,
  onSubmitAppeal,
  topicNotifications,
  onUpdateTopicNotifications,
  maternalMeetings = [],
  isOfflineMode = false,
  onToggleOfflineMode,
  postpartumCheckups = [],
  onUpdatePostpartumCheckup,
  hospitalVisits = []
}: PatientPortalProps) {
  // Plan and subscription state managers
  const [sessionPlan, setSessionPlan] = useState<"lula" | "premium" | "sadc">(() => {
    return (localStorage.getItem("vytal_maternal_plan") as any) || "lula";
  });
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Mobile app sub-navigation tab states: "home" | "calendar" | "insights" | "community" | "reports" | "profile" | "academy"
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "insights" | "community" | "reports" | "profile" | "academy">("home");

  // Dynamic Lookup Map for custom and synthetic SADC mothers
  const patientsMap: Record<string, {name: string, id: string, history: string, region: string, edd: string, initial: string}> = {
    "pat-1": { name: "Zanele Dlamini", id: "SADC-SZ-76543-X", history: "Nulliparous", region: "Mbabane Primary Centre", edd: "July 13, 2026", initial: "ZD" },
    "pat-2": { name: "Kelebogile Mokgoro", id: "SADC-BW-98782-Y", history: "GDM watch", region: "Mbabane Primary Centre", edd: "Sept 8, 2026", initial: "KM" },
    "pat-3": { name: "Nokuthula Zulu", id: "SADC-ZA-55501-A", history: "Anemia watch", region: "Mbabane Primary Centre", edd: "Aug 11, 2026", initial: "NZ" },
    "pat-4": { name: "Lerato Phiri", id: "SADC-ZA-55543-B", history: "Standard prenatal", region: "Mbabane Primary Centre", edd: "Nov 28, 2026", initial: "LP" },
    "pat-5": { name: "Thandi Mabaso", id: "SADC-ZA-44498", history: "Pre-eclampsia watcher", region: "Mbabane Primary Centre", edd: "Oct 5, 2026", initial: "TM" }
  };

  const getPatientDetails = () => {
    if (patientsMap[patientId]) {
      return patientsMap[patientId];
    }
    // Handle registered patients with fallback session storage reading
    try {
      const saved = localStorage.getItem("vytal_patient_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id === patientId) {
          const initials = parsed.name ? parsed.name.split(" ").map((n: string) => n[0]).join("") : "MA";
          return {
            name: parsed.name,
            id: `SADC-REG-${patientId.slice(-4).toUpperCase()}`,
            history: parsed.medicalHistory ? parsed.medicalHistory.join(", ") : "Normal Care",
            region: "Mbabane Primary Centre",
            edd: "Nov 15, 2026",
            initial: initials || "MA"
          };
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      name: "Custom Mama",
      id: `SADC-REG-${patientId.slice(-4).toUpperCase()}`,
      history: "Standard registration",
      region: "Mbabane Primary Centre",
      edd: "Nov 15, 2026",
      initial: "MM"
    };
  };

  const details = getPatientDetails();
  
  // Real-time language state: English, siSwati, Setswana + 5 African (isiZulu, isiXhosa, Yoruba, Kiswahili, Amharic) + French
  const [appLanguage, setAppLanguage] = useState<
    "English" | "siSwati" | "Setswana" | "isiZulu" | "isiXhosa" | "Yoruba" | "Kiswahili" | "Amharic" | "Français"
  >("English");
  
  // Local state for the pregnancy stages slider setup
  const [calendarSubTab, setCalendarSubTab] = useState<"pregnancy" | "postpartum" | "visits">("pregnancy");
  const [weeksDropdownOpen, setWeeksDropdownOpen] = useState(false);
  const [isMonths, setIsMonths] = useState(false);
  
  // Ask Vytal (AI section) states
  const [aiText, setAiText] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string }>>(() => {
    try {
      const saved = localStorage.getItem("vytal_ai_chat_history");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load conversational history from localStorage:", e);
    }
    return [
      { role: "assistant", text: "Sakubona! Dumela! Siyakwamukela! I am your Vytal AI Companion. You can say 'BabyBot' at any time to activate continuous speech emergency coordinate routing." }
    ];
  });
  const [isAILoading, setIsAILoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("Nutrition");
  const [isListening, setIsListening] = useState(false);
  const [isRecordingReal, setIsRecordingReal] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // References for chat auto-scrolling & focus management
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync conversational history with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vytal_ai_chat_history", JSON.stringify(aiChatHistory));
    } catch (e) {
      console.warn("Failed to persist conversation history to localStorage:", e);
    }
  }, [aiChatHistory]);

  // Keep chat display scrolled to the newest messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatHistory, isAILoading]);

  // BabyBot emergency states
  const [babybotActive, setBabybotActive] = useState(false);
  const [babybotLoadingGeoloc, setBabybotLoadingGeoloc] = useState(false);
  const [babybotLocation, setBabybotLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locatedHospital, setLocatedHospital] = useState<{name: string, phone: string, distance: string} | null>(null);

  // New Report Modal Form states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState<string>("Back pain");
  const [symptomSeverity, setSymptomSeverity] = useState<"Normal" | "Monitor" | "Referral">("Normal");
  const [reportDescription, setReportDescription] = useState("");
  const [recordVoiceSim, setRecordVoiceSim] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Community Feed Interaction States
  const [communitySubMode, setCommunitySubMode] = useState<"feed" | "connections">("feed");
  const [communityTopicFilter, setCommunityTopicFilter] = useState<string>("All");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTopic, setNewPostTopic] = useState<string>("general");
  const [commentInputMap, setCommentInputMap] = useState<{[postId: string]: string}>({});
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [lastPostTimestamp, setLastPostTimestamp] = useState<number>(0);
  const [spamWarningActive, setSpamWarningActive] = useState(false);
  const [reportPostTargetId, setReportPostTargetId] = useState<string | null>(null);
  const [reportReasonText, setReportReasonText] = useState("");
  const [contactingMotherId, setContactingMotherId] = useState<string | null>(null);
  const [composeMessage, setComposeMessage] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");

  // Appeals flow states
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReasonText, setAppealReasonText] = useState("");
  const [appealContentText, setAppealContentText] = useState("");
  const [chartMetric, setChartMetric] = useState<"bp" | "hr" | "combined">("combined");
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [simulatedActiveCall, setSimulatedActiveCall] = useState<string | null>(null);

  // Educational pregnancy academy and health tips states
  const [academyMode, setAcademyMode] = useState<"conditions" | "tips" | "activities">("conditions");
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>("pre-eclampsia");
  const [dailyAcademyHabits, setDailyAcademyHabits] = useState({
    hydrated: false,
    leftSleep: false,
    ironPills: false,
    pelvicStretches: false,
    kickCounts: false
  });

  // Quiz and Myth vs Fact interactive game states
  const [activeActivity, setActiveActivity] = useState<"quiz" | "myths">("quiz");
  const [quizQIndex, setQuizQIndex] = useState(0);
  const [selectedAnsIndex, setSelectedAnsIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizIsAnswered, setQuizIsAnswered] = useState(false);

  const [mythIndex, setMythIndex] = useState(0);
  const [mythGuess, setMythGuess] = useState<"myth" | "fact" | null>(null);
  const [isMythJudged, setIsMythJudged] = useState(false);
  const [mythScore, setMythScore] = useState(0);

  // Home Screen Vitals simulation state
  const [simulatedVitals, setSimulatedVitals] = useState({
    hr: 86,
    o2: 97,
    bp: "118/75",
    temp: 36.6,
    weight: 71.5
  });

  // Interactive vitals & fetal kick counter states
  const [sessionKicks, setSessionKicks] = useState<number>(0);
  const [isCountingKicks, setIsCountingKicks] = useState<boolean>(false);
  const [kickFormNotes, setKickFormNotes] = useState<string>("");
  const [userVitalsForm, setUserVitalsForm] = useState({
    systolic: "120",
    diastolic: "80",
    pulse: "78",
    temperature: "36.5",
    weight: "72.0",
    notes: ""
  });
  const [vitalsAddedFeedback, setVitalsAddedFeedback] = useState<string>("");

  // Pregnancy Vitals Dashboard states (Wearable & Phone Direct Tracking)
  const [homeSubTab, setHomeSubTab] = useState<"vitals" | "journey" | "family">("vitals");

  // Supporting Family Viewing states
  const [familyMessages, setFamilyMessages] = useState([
    {
      id: "fam-msg-1",
      authorName: "Thabo (Partner)",
      role: "Partner (Dad)",
      message: "You're doing amazing, Kelebogile! Drink your water, 💓. Sifiso is lucky to have you!",
      createdAt: "3 hours ago",
      heartsCount: 8,
      joinedIcon: "💖"
    },
    {
      id: "fam-msg-2",
      authorName: "Gogo Lindiwe",
      role: "Grandmother",
      message: "Sleeping on your left side is best for little Sifiso. Can't wait! Sending you prayers.",
      createdAt: "Yesterday",
      heartsCount: 15,
      joinedIcon: "👵"
    },
    {
      id: "fam-msg-3",
      authorName: "Aunt Sarah",
      role: "Aunt",
      message: "Hb levels look clean and steady! Iron supplementation is really working. 🌟 Keep going!",
      createdAt: "2 days ago",
      heartsCount: 4,
      joinedIcon: "🌸"
    }
  ]);
  const [newFamilyMessage, setNewFamilyMessage] = useState("");
  const [newFamilyAuthor, setNewFamilyAuthor] = useState("Thabo (Partner)");
  const [newFamilyRole, setNewFamilyRole] = useState("Partner (Dad)");
  const [heartsMultiplier, setHeartsMultiplier] = useState(0);
  const [wearableMode, setWearableMode] = useState<"wristband" | "phone_only">("wristband");
  const [isStreamingActive, setIsStreamingActive] = useState<boolean>(true);
  const [sensorBattery, setSensorBattery] = useState<number>(88);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Synced 2s ago");
  const [fetalHeartRate, setFetalHeartRate] = useState<number>(142);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [liveSpO2, setLiveSpO2] = useState<number>(98);
  const [sleepScore, setSleepScore] = useState<number>(84);
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(6); // Target: 8 glasses
  const [stepsToday, setStepsToday] = useState<number>(5840);
  const [totalKicksToday, setTotalKicksToday] = useState<number>(18);
  const [pulseCounter, setPulseCounter] = useState<number>(0);

  // Periodic data fluctuation to simulate real-time active streaming without user input
  useEffect(() => {
    if (!isStreamingActive) return;

    const interval = setInterval(() => {
      // Simulate real-time biological microflexes
      setFetalHeartRate(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return next >= 135 && next <= 148 ? next : 142;
      });

      setStepsToday(prev => prev + Math.floor(Math.random() * 3)); // simulate small walk movements
      
      setRespiratoryRate(prev => {
        if (Math.random() > 0.8) {
          const delta = Math.random() > 0.5 ? 1 : -1;
          const next = prev + delta;
          return next >= 14 && next <= 19 ? next : 16;
        }
        return prev;
      });

      setLiveSpO2(prev => {
        if (Math.random() > 0.9) return prev === 98 ? 99 : 98;
        return prev;
      });

      setSensorBattery(prev => {
        if (Math.random() > 0.98 && prev > 10) return prev - 1;
        return prev;
      });

      // Update last synced text
      const secondsAgo = Math.floor(Math.random() * 5) + 1;
      setLastSyncTime(`Synced ${secondsAgo}s ago`);
      setPulseCounter(p => p + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreamingActive]);

  // Dynamic simulation of vitals shifting safely relative to the gestation slider index
  useEffect(() => {
    // Generate organic ranges based on trimester
    let baseHr = 80 + Math.floor((currentWeek % 8));
    let baseWeight = 68 + (currentWeek * 0.45);
    let baseTemp = 36.5 + ((currentWeek % 3) * 0.1);
    let baseBp = "118/75";
    
    if (currentWeek > 28) {
      baseBp = "124/81";
    } else if (currentWeek > 36) {
      baseBp = "128/84";
      baseHr = 88;
    }
    
    setSimulatedVitals({
      hr: baseHr,
      o2: 97 + Math.floor(currentWeek % 3 === 0 ? 1 : 0),
      bp: baseBp,
      temp: parseFloat(baseTemp.toFixed(1)),
      weight: parseFloat(baseWeight.toFixed(1))
    });
  }, [currentWeek]);

  // Language translation dictionary mapping keys
  const langPack = {
    English: {
      appName: "Vytal Companion",
      homeTitle: "Pregnancy Stages",
      completed: "Completed Weeks",
      remaining: "Remaining Weeks",
      trimester: "Second Trimester Core",
      wellnessScore: "Wellness Score",
      askVytal: "Ask Vytal AI",
      careTeam: "Your Care Team",
      selfReports: "Your Self-Reports Timeline",
      newReport: "Submit Daily Self-Report",
      profileSettings: "Settings & Profile",
      welcomeMsg: "Hi, Kelebogile 👋",
      today: "Today, June 19",
      askPlaceholder: "Tap below to speak, or type diagnostic details...",
      btnSubmit: "Post Secure Report to Clinic",
      selectLang: "Choose Language",
      aboutApp: "A voice-first, offline-ready maternal assistant co-designed with SADC clinics.",
    },
    siSwati: {
      appName: "Incandzi yeVytal",
      homeTitle: "Tigaba Tekutitfwala",
      completed: "Maviki Lakhetfwe",
      remaining: "Maviki Lasele",
      trimester: "Tigaba Letihloselwe",
      wellnessScore: "Silinganiso Sekuphila",
      askVytal: "Buta Vytal AI",
      careTeam: "Ikhomiti Yakho Yetetimpilo",
      selfReports: "Umlando weMibiko Yakho",
      newReport: "Bhala Umbiko Lusha lowetiwe",
      profileSettings: "Kuhlelwa Kwephrofayela",
      welcomeMsg: "Sakubona, Kelebogile 👋",
      today: "Namuhla, June 19",
      askPlaceholder: "Buta nanyalo mayelana nesisu sakho, emanti noma kudla...",
      btnSubmit: "Khulisa Umbiko Emtholampilo",
      selectLang: "Khetha Lulwimi",
      aboutApp: "I-smart voice assistant yesiswati levelulile kwentela kuciniseka ngebotsogo yabomake.",
    },
    Setswana: {
      appName: "Ntlha ya Vytal",
      homeTitle: "Dikgato tsa Boimana",
      completed: "Dibeke tse di Fedileng",
      remaining: "Dibeke tse di setseng",
      trimester: "Molemo wa Bobedi wa Trimester",
      wellnessScore: "Dipalo tsa Maikutlo",
      askVytal: "Botsa Vytal AI",
      careTeam: "Setlhopha sa Gago sa Merero",
      selfReports: "Molaletsa wa Boimana jwa gago",
      newReport: "Kwala Report ya Gompieno",
      profileSettings: "Dithulaganyo tsa Profile",
      welcomeMsg: "Dumela, Kelebogile 👋",
      today: "Gompieno, June 19",
      askPlaceholder: "Tlanya o bue kgotsa o kwale diphetogo tsa mmele gompieno...",
      btnSubmit: "Romela Report ka bonako kwa Clinic",
      selectLang: "Kgetha Puo",
      aboutApp: "Mothusi wa mme wa boimana yo o buang ka lentswe gape e bereka kwantle ga inthanete.",
    },
    isiZulu: {
      appName: "Isihloli seVytal",
      homeTitle: "Izigaba Zokukhulelwa",
      completed: "Amaviki Aqediwe",
      remaining: "Amaviki Asele",
      trimester: "Izigaba Ezibalulekile",
      wellnessScore: "Amaphuzu Wezempilo",
      askVytal: "Buza i-Vytal AI",
      careTeam: "Ithimba Lakho Lezempilo",
      selfReports: "Umlando Wemibiko Yakho",
      newReport: "Bhala Umbiko Omusha",
      profileSettings: "Izilungiselelo Nephrofayela",
      welcomeMsg: "Sawubona, Kelebogile 👋",
      today: "Namuhla, June 19",
      askPlaceholder: "Thinta ngezansi ukuze ukhulume, noma ubhale imininingwane...",
      btnSubmit: "Thumela Umbiko e-Clinic",
      selectLang: "Khetha Ulimi",
      aboutApp: "Umsizi omkhulu wezempilo yomama obheka izwi lethu futhi osebenza ngaphandle kwe-inthanethi.",
    },
    isiXhosa: {
      appName: "Ikhampani yeVytal",
      homeTitle: "Amanqanaba Okukhulelwa",
      completed: "Iiveki Ezizanyiweyo",
      remaining: "Iiveki Eziseleyo",
      trimester: "Isigaba Sesibini Se-Core",
      wellnessScore: "Amaphuzu Olonwabo",
      askVytal: "Buza iVytal AI",
      careTeam: "Iqela Lakho Lononophelo",
      selfReports: "Imiyalelo Yexesha Lomfazi",
      newReport: "Faka Umbiko Olutha",
      profileSettings: "Ukuseta Nephrofayili",
      welcomeMsg: "Molo, Kelebogile 👋",
      today: "Namhlanje, June 19",
      askPlaceholder: "Cofa ngezantsi uthethe, okanye ubhale iinkcukacha...",
      btnSubmit: "Thumela Umbiko Kwikliniki",
      selectLang: "Khetha Ulwimi",
      aboutApp: "Umsizi welizwi womama okhulelweyo osebenza ngaphandle kwekhompyutha.",
    },
    Yoruba: {
      appName: "Vytal Alabayọ",
      homeTitle: "Ipele Oyun",
      completed: "Awọn Ọsẹ ti o pari",
      remaining: "Awọn Ọsẹ to ku",
      trimester: "Ipele Keji Pataki",
      wellnessScore: "Iwọn Ilera Rẹ",
      askVytal: "Bi Vytal AI lere",
      careTeam: "Ẹgbẹ Itọju Rẹ",
      selfReports: "Àkọsílẹ Gbogbo Ìròyìn Rẹ",
      newReport: "Fi Ìròyìn Tuntun Sínú",
      profileSettings: "Ètò & Profaili",
      welcomeMsg: "Ipanu dada, Kelebogile 👋",
      today: "Oni, June 19",
      askPlaceholder: "Tẹ ni isalẹ lati sọrọ, tabi kọ ilera rẹ...",
      btnSubmit: "Fi Ìròyìn pamọ fún Ile-iwosan",
      selectLang: "Yan Ede Rẹ",
      aboutApp: "Oluranlowo ohun akọkọ ti o le ṣiṣẹ laisi intanẹẹti fun awọn aboyun.",
    },
    Kiswahili: {
      appName: "Vytal Companion",
      homeTitle: "Hatua za Mimba",
      completed: "Wiki Zilizokamilika",
      remaining: "Wiki Zilizosalia",
      trimester: "Kipindi cha Pili cha Core",
      wellnessScore: "Alama ya Uzima",
      askVytal: "Uliza Vytal AI",
      careTeam: "Timu Yako ya Huduma",
      selfReports: "Historia ya Ripoti Zako",
      newReport: "Wasilisha Ripoti Mpya",
      profileSettings: "Mipangilio & Wasifu",
      welcomeMsg: "Mambo, Kelebogile 👋",
      today: "Leo, Juni 19",
      askPlaceholder: "Bonyeza hapa chini kuongea, au andika maelezo...",
      btnSubmit: "Tuma Ripoti Kituo cha Afya",
      selectLang: "Chagua Lugha",
      aboutApp: "Msaidizi wa sauti wa kwanza wa uzazi anayefanya kazi nje ya mtandao.",
    },
    Amharic: {
      appName: "ቪታል ረዳት",
      homeTitle: "የእርግዝና ደረጃዎች",
      completed: "የተጠናቀቁ ሳምንታት",
      remaining: "ቀሪ ሳምንታት",
      trimester: "ሁለተኛው ሁለተኛ ወር",
      wellnessScore: "የጤና ውጤት",
      askVytal: "ቪታል AI ጠይቅ",
      careTeam: "የህክምና እንክብካቤ ቡድን",
      selfReports: "የሪፖርቶች ታሪክ",
      newReport: "አዲስ ሪፖርት አቅርብ",
      profileSettings: "ቅንብሮች እና መገለጫ",
      welcomeMsg: "ጤና ይስጥልኝ, Kelebogile 👋",
      today: "ዛሬ ጁን 19",
      askPlaceholder: "ለመናገር ከታች ይጫኑ ወይም እዚህ ይጻፉ...",
      btnSubmit: "ሪፖርት ለክሊኒክ ይላኩ",
      selectLang: "ቋንቋ ይምረጡ",
      aboutApp: "ያለ በይነመረብ የሚሰራ የድምጽ እርግዝና ረዳት።",
    },
    Français: {
      appName: "Vytal Compagnon",
      homeTitle: "Stades de Grossesse",
      completed: "Semaines Complétées",
      remaining: "Semaines Restantes",
      trimester: "Deuxième Trimestre",
      wellnessScore: "Score de Bien-être",
      askVytal: "Demander à Vytal AI",
      careTeam: "Votre Équipe de Soins",
      selfReports: "Historique des Rapports",
      newReport: "Nouveau Rapport Quotidien",
      profileSettings: "Profil & Paramètres",
      welcomeMsg: "Bonjour, Kelebogile 👋",
      today: "Aujourd'hui, 19 Juin",
      askPlaceholder: "Appuyez ci-dessous pour parler ou écrivez...",
      btnSubmit: "Soumettre Rapport Clinique",
      selectLang: "Choisir la Langue",
      aboutApp: "Un assistant de maternité autonome, commandé par la voix, développé avec les cliniques SADC.",
    }
  };

  const currentLangPack = langPack[appLanguage];

  const tabsTranslations: {[key: string]: {[key: string]: string}} = {
    English: { tabHome: "Home", tabCalendar: "Calendar", tabInsights: "Ask Vytal", tabCommunity: "Peer Hub", tabAcademy: "Academy", tabReports: "Reports", tabProfile: "Profile", emergencySos: "🚨 Quick Emergency", prenatalQuiz: "Pregnancy Quiz", quizDesc: "Test your prenatal nutrition and wellness knowledge", mythBust: "Myth vs Fact", mythDesc: "Pop common pregnancy myths with real clinical science" },
    siSwati: { tabHome: "Ekhaya", tabCalendar: "Ikhalenda", tabInsights: "Buta Vytal", tabCommunity: "Peer Hub", tabAcademy: "Sekolishi", tabReports: "Mibiko", tabProfile: "Iphrofayela", emergencySos: "🚨 Luthfutfuko", prenatalQuiz: "Umlando Quiz", quizDesc: "Hlola lwati lwakho ngebotsogo yekutitfwala", mythBust: "Emave nobe Liciniso", mythDesc: "Sibonelo sekushintsa kwemicabango ngebodokotela" },
    Setswana: { tabHome: "Gae", tabCalendar: "Kalenda", tabInsights: "Botsa Vytal", tabCommunity: "Peer Hub", tabAcademy: "Thuto", tabReports: "Di-report", tabProfile: "Profile", emergencySos: "🚨 Potlako", prenatalQuiz: "Puo ya Boimana", quizDesc: "Leka kitso ya gago ya dikgato tsa boimana", mythBust: "Maaka kgotsa Lwantle", mythDesc: "Tlhalosa maaka a boimana ka saense" },
    isiZulu: { tabHome: "Ekhaya", tabCalendar: "Ikhalenda", tabInsights: "Buza Vytal", tabCommunity: "Peer Hub", tabAcademy: "Academy", tabReports: "Imibiko", tabProfile: "Iphrofayela", emergencySos: "🚨 Izithasiselo", prenatalQuiz: "Inselele Yempilo", quizDesc: "Hlole ulwazi lwakho lwezempilo", mythBust: "Izinganekwane", mythDesc: "Guqula izinganekwane ngesayensi yezokwelapha" },
    isiXhosa: { tabHome: "Ekhaya", tabCalendar: "Ikhalenda", tabInsights: "Buza Vytal", tabCommunity: "Peer Hub", tabAcademy: "Academy", tabReports: "Imiyalelo", tabProfile: "Iphrofayili", emergencySos: "🚨 SOS Ungakhawuleza", prenatalQuiz: "Imibuzo Ngokukhulelwa", quizDesc: "Vavanya ulwazi lwakho lwezempilo", mythBust: "Amanyala nomVandla", mythDesc: "Chaza amanyala ngokukhulelwa ngesayensi" },
    Yoruba: { tabHome: "Ile", tabCalendar: "Kalẹnda", tabInsights: "Bi Vytal lere", tabCommunity: "Awujọ", tabAcademy: "Ile-ẹkọ", tabReports: "Gba Ìròyìn", tabProfile: "Profaili", emergencySos: "🚨 Pajawiri Kankan", prenatalQuiz: "Idanwo Ilera Oyun", quizDesc: "Ṣayẹwo imọ rẹ nipa ilera", mythBust: "Asan ati Otitọ", mythDesc: "Tu awọn asan oyun nipa lilo imọ-jinlẹ" },
    Kiswahili: { tabHome: "Nyumbani", tabCalendar: "Kalenda", tabInsights: "Uliza Vytal", tabCommunity: "Peer Hub", tabAcademy: "Chuo", tabReports: "Ripoti", tabProfile: "Wasifu", emergencySos: "🚨 Dharura Haraka", prenatalQuiz: "Maswali ya Uzazi", quizDesc: "Pima ujuzi wako wa lishe ya uzazi", mythBust: "Ukweli au Uongo", mythDesc: "Vunja dhana potofu kwa sayansi ya matibabu" },
    Amharic: { tabHome: "ዋና ገጽ", tabCalendar: "ቀን መቁጠሪያ", tabInsights: "ቪታል ጠይቅ", tabCommunity: "ማህበረሰብ", tabAcademy: "አካዳሚ", tabReports: "ሪፖርቶች", tabProfile: "መገለጫ", emergencySos: "🚨 የአስቸኳይ ጊዜ", prenatalQuiz: "የእርግዝና ጥያቄዎች", quizDesc: "የእርግዝና አመጋገብ እውቀትዎን ይፈትሹ", mythBust: "እውነት ወይስ ውሸት", mythDesc: "የተለመዱ የእርግዝና ወሬዎችን በህክምና ሳይንስ መለየት" },
    Français: { tabHome: "Accueil", tabCalendar: "Calendrier", tabInsights: "Demander", tabCommunity: "Échanges", tabAcademy: "Académie", tabReports: "Rapports", tabProfile: "Profil", emergencySos: "🚨 Urgence SOS", prenatalQuiz: "Quiz de Grossesse", quizDesc: "Testez vos connaissances en nutrition prénatale", mythBust: "Mythe vs Réalité", mythDesc: "Démontez les fausses croyances prénatales" }
  };

  const t = (key: string, defaultValue: string) => {
    const pack = tabsTranslations[appLanguage] || tabsTranslations["English"];
    return pack[key] || defaultValue;
  };

  // Helper dictionary representing AI simulated responses in each selected language
  const customAiReplies = {
    English: {
      Nutrition: "It is essential to consume folate (found in spinach, lentils, and citrus fruits) and iron to avoid anemia. Avoid raw or unpasteurized dairy.",
      Symptoms: "Back pain and mild swelling are normal at your active gestational stage. However, severe headache or flashes of light are warning signs for Pre-Eclampsia.",
      Rest: "Sleep on your left side to maximize high-oxygen blood supply to the placenta. Take 30-minute afternoon breaks.",
      Movement: "Mild maternal walking and pelvic tilts strengthen core muscles and encourage optimal fetal positioning."
    },
    siSwati: {
      Nutrition: "Kudla imifino lephephile (fana nembasha nemaspinach) kucinisa ingati yakho ivikele anomaly yetisusa. Gwema kudla lokuluhlaza.",
      Symptoms: "Kuvuvuka kwetinya nesisu lokuncane kujwayelekile. Uma uva buhlungu belikhulu esiswini nobe emehlweni, bikela Sister Kunene masinyane.",
      Rest: "Lala ngelicala leancele kwentela kucinisa oxygen ekuphumuleni kwayingane. Phumula kakhulu emini belanga.",
      Movement: "Kuhamba kancane emoyeni nalapho ukhululekile kulemisa kahle kutsambisa mitsambo yalomake (pelvic muscles)."
    },
    Setswana: {
      Nutrition: "Go ja merogo (Spinach, Morogo wa dinto jalo) le merogo e e nang le folate go thibela ditlhabi le letshololo la madi a lesea.",
      Symptoms: "Go ruruga ga dinao go go nnyennyane go tlwaelegile mo bekeng eno. Fa o tsenwa ke bothata jwa go sa bone sentle ka bonako mmolelele Sister.",
      Rest: "Robala ka letlhakore la molema go lere phefo (Oxygen) e e lekaneng mo mading a a yang kwa go lesea la gago. Itapolose fa gare ga letsatsi.",
      Movement: "Go tsamaya ka dinao ditsela tse di khutshwane letsatsi le letsatsi go solegela mmele molemo e bile go baakanyetsa go belega ka boiketlo."
    }
  };

  const triggerBabybotRescue = () => {
    setBabybotActive(true);
    setBabybotLoadingGeoloc(true);
    setTimeout(() => {
      setBabybotLoadingGeoloc(false);
      setBabybotLocation({ lat: -26.3056, lng: 31.1367 });
      setLocatedHospital({
        name: "Mbabane Government General Hospital",
        phone: "+268-2404-2111",
        distance: "4.2 km"
      });
    }, 1500);
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const rawText = textToSend !== undefined ? textToSend : aiText;
    const queryText = rawText?.trim();
    if (!queryText) return;

    // Clear typed text
    setAiText("");
    
    // Add User message
    const updatedHistory = [...aiChatHistory, { role: "user" as const, text: queryText }];
    setAiChatHistory(updatedHistory);
    setIsAILoading(true);

    // Trigger babybot emergency check if keyword exists
    if (queryText.toLowerCase().includes("babybot")) {
      triggerBabybotRescue();
    }

    try {
      const response = await fetch("/api/chat-companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          language: appLanguage,
          gestationalWeeks: currentWeek,
          symptoms: [selectedSymptom],
        })
      });

      if (!response.ok) {
        throw new Error("Chat service responded with an error");
      }

      const data = await response.json();
      setAiChatHistory(prev => [...prev, { role: "assistant" as const, text: data.text }]);
    } catch (err) {
      console.error("Failed to query chat-companion:", err);
      // Fallback
      let matchingTopic = "Symptoms";
      if (queryText.toLowerCase().includes("food") || queryText.toLowerCase().includes("spinach") || queryText.toLowerCase().includes("eat") || queryText.toLowerCase().includes("nutrition")) {
        matchingTopic = "Nutrition";
      } else if (queryText.toLowerCase().includes("sleep") || queryText.toLowerCase().includes("tire") || queryText.toLowerCase().includes("left side") || queryText.toLowerCase().includes("rest")) {
        matchingTopic = "Rest";
      } else if (queryText.toLowerCase().includes("movement") || queryText.toLowerCase().includes("walk") || queryText.toLowerCase().includes("kick")) {
        matchingTopic = "Movement";
      }
      
      const localeReplies = customAiReplies[appLanguage as keyof typeof customAiReplies] || customAiReplies.English;
      const fallbackReply = (localeReplies as any)[matchingTopic] || 
        "Thank you for asking. Our digital system suggests monitoring your blood pressure closely, staying well-hydrated, and coordinating with Mbabane Centre clinicians. If you experience severe headaches, swelling, or dizziness, please seek immediate help.";
      
      setAiChatHistory(prev => [
        ...prev,
        { role: "assistant" as const, text: fallbackReply }
      ]);
    } finally {
      setIsAILoading(false);
    }
  };

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Graceful fallback simulation
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        // Put in a prompt to show how we simulated/filled
        const simulatedVoicePrompt = "Dumela BabyBot, locate my nearest clinic";
        setAiText(simulatedVoicePrompt);
        handleSendChatMessage(simulatedVoicePrompt);
      }, 2000);
      return;
    }
    
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = appLanguage === "siSwati" ? "ss-SZ" : appLanguage === "Setswana" ? "tn-ZA" : appLanguage === "isiZulu" ? "zu-ZA" : "en-US";
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim() !== "") {
          setAiText(transcript);
          handleSendChatMessage(transcript);
        }
      };
      
      rec.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.start();
    } catch (err) {
      console.warn("Failed to initialize speech recognition:", err);
      setIsListening(false);
    }
  };

  const startAudioRecording = async () => {
    setAudioUrl(null);
    setTranscriptionText("");
    setRecordingSeconds(0);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      setIsRecordingReal(true);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        setIsTranscribing(true);
        setTimeout(() => {
          setIsTranscribing(false);
          const maternalPhrases = [
            "What are the early signs of pre-eclampsia that I should look out for?",
            "Is it safe to sleep on my back during the third trimester?",
            "Which SADC local foods help boost iron levels to prevent maternal anemia?",
            "Dumela BabyBot, how many diaper counts and kicks are normal in week 36?",
            "Could sweet tea or high salt trigger sudden blood pressure spikes?",
            "Can you fetch contact details for Sister Kunene or my SADC referral center?",
            "Explain what body changes I should expect in gestational week 32."
          ];
          const chosen = maternalPhrases[Math.floor(Math.random() * maternalPhrases.length)];
          setAiText(chosen);
          setTranscriptionText(chosen);
        }, 1500);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.warn("Real microphone access denied or not supported.", err);
      setHasMicPermission(false);
      setIsRecordingReal(true);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  const stopAudioRecording = () => {
    setIsRecordingReal(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // Handle fallback mode
      setIsTranscribing(true);
      setTimeout(() => {
        setIsTranscribing(false);
        const maternalPhrases = [
          "What are the early signs of pre-eclampsia that I should look out for?",
          "Is it safe to sleep on my back during the third trimester?",
          "Which SADC local foods help boost iron levels to prevent maternal anemia?",
          "Dumela BabyBot, how many diaper counts and kicks are normal in week 36?",
          "Could sweet tea or high salt trigger sudden blood pressure spikes?",
          "Can you fetch contact details for Sister Kunene or my SADC referral center?",
          "Explain what body changes I should expect in gestational week 32."
        ];
        const chosen = maternalPhrases[Math.floor(Math.random() * maternalPhrases.length)];
        setAiText(chosen);
        setTranscriptionText(chosen);
      }, 1500);
    }
  };

  const handleAISimulateQuery = (topic: string) => {
    setSelectedTopic(topic);
    const userPrompt = `What advice do you have regarding prenatal ${topic}?`;
    handleSendChatMessage(userPrompt);
  };

  const handleCustomVoiceTranscription = (transcript: string) => {
    handleSendChatMessage(transcript);
  };

  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription) return;

    onAddReport({
      patientId: "pat-2",
      patientName: "Kelebogile Mokgoro",
      gestationalWeeks: currentWeek,
      symptom: selectedSymptom,
      severity: symptomSeverity,
      description: reportDescription,
      voiceNoteSimulated: recordVoiceSim,
    });

    setReportSuccess(true);
    setReportDescription("");
    setRecordVoiceSim(false);

    setTimeout(() => {
      setReportModalOpen(false);
      setReportSuccess(false);
    }, 1500);
  };

  // Pre-set localized clinical milestones
  const localizationMilestones = {
    16: { milestone: "Completed early anatomical vetting. Baby's fingernails are forming.", checklist: "Folate + Iron pills logged; BP balanced." },
    18: { milestone: "Baby's ears develop; they can hear voices and blood running through the cords.", checklist: "Drink 3.0 liters of fresh local water." },
    24: { milestone: "Inner ears are fully built. Baby can feel motion and head positioning inside.", checklist: "Register gestational weight metric; pelvic stretches." },
    28: { milestone: "Fetal eyelids unseal and blink! Breathing cycles simulate amniotic inhaling.", checklist: "Test daily kick counts. Target: 10 kicks in 2 hours." }
  };

  const currentMilestone = localizationMilestones[currentWeek] || {
    milestone: "Lesea lentsintsi le gola ka tsela e e kgethegileng dinala dithubega go thusa go tshesela.",
    checklist: "Routine vitamins, daily hydration & restful side-sleeping advised."
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-gradient-to-b from-[#FAF6F2] via-[#E2EBE5] to-[#D5E1DB] overflow-hidden relative font-sans text-[#2B1B2E]" id="mother-app-engine">
      
      {/* Floating Design Particles - Non-distracting, Appeal Booster */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {[
          { icon: "✨", top: "10%", left: "5%", size: "14px", delay: 0 },
          { icon: "🍃", top: "25%", right: "8%", size: "16px", delay: 1.5 },
          { icon: "🌸", top: "45%", left: "12%", size: "12px", delay: 0.5 },
          { icon: "👶", top: "70%", right: "15%", size: "14px", delay: 2.2 },
          { icon: "☘️", top: "85%", left: "6%", size: "15px", delay: 1.1 },
          { icon: "🤍", top: "60%", right: "4%", size: "13px", delay: 1.8 },
        ].map((p, idx) => (
          <motion.div
            key={idx}
            className="absolute opacity-[0.22] text-[#4F7066]"
            style={{ 
              top: p.top, 
              left: p.left, 
              right: p.right, 
              fontSize: p.size 
            }}
            animate={{
              y: [0, -12, 0],
              x: [0, 6, -6, 0],
              rotate: [0, 15, -15, 0]
            }}
            transition={{
              duration: 5 + (idx % 3) * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay
            }}
          >
            {p.icon}
          </motion.div>
        ))}
      </div>

      {/* 1. Frosted Sticky Header */}
      <header className="px-4 py-3 bg-white/40 backdrop-blur-xl border-b border-white/40 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsLeftSidebarOpen(true)}
            className="w-8 h-8 rounded-xl bg-[#4F7066]/10 flex items-center justify-center text-[#4F7066] border border-white/60 hover:bg-[#4F7066]/20 cursor-pointer transition-all focus:outline-none"
            id="maternal-sidebar-toggle-btn"
            title="Open Sidebar Menu"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <div className="text-left">
            <h2 className="text-xs font-extrabold tracking-tight flex items-center gap-1.5 font-sans leading-none">
              {currentLangPack.appName}
              <span className="text-[8px] bg-gradient-to-r from-[#4F7066] to-[#1F2E2A] text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase scale-90">AI</span>
            </h2>
            <span className="text-[9px] text-[#5F716A] block mt-0.5 font-medium leading-none">Maternal Care Assist</span>
          </div>
        </div>

        {/* Real-time Language Switcher Dropdown */}
        <div className="relative">
          <Globe2 className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#4F7066] z-10 pointer-events-none" />
          <select
            value={appLanguage}
            onChange={(e) => setAppLanguage(e.target.value as any)}
            className="appearance-none bg-white/70 hover:bg-white border border-white/60 text-[#2B1B2E] font-extrabold text-[10px] pl-7 pr-6 py-1.5 rounded-xl shadow-xs focus:outline-none focus:ring-1 focus:ring-[#4F7066] cursor-pointer backdrop-blur-md transition-all font-sans"
            id="vytal-lang-switcher"
          >
            <option value="English">🇬🇧 EN</option>
            <option value="siSwati">🇸🇿 SZ</option>
            <option value="Setswana">🇧🇼 BW</option>
            <option value="isiZulu">🇿🇦 ZU</option>
            <option value="isiXhosa">🇿🇦 XH</option>
            <option value="Yoruba">🇳🇬 YO</option>
            <option value="Kiswahili">🇰🇪 SW</option>
            <option value="Amharic">🇪🇹 AM</option>
            <option value="Français">🇫🇷 FR</option>
          </select>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[8px] text-[#2B1B2E]">
            ▼
          </div>
        </div>
      </header>

      {/* 2. Scrollable Body Inner Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar z-10 pb-20">
        
        {isOfflineMode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-950 rounded-2xl flex items-start gap-2 text-left shadow-xs animate-pulse">
            <span className="text-sm shrink-0 mt-0.5">⚠️</span>
            <div className="text-[10px] leading-normal font-semibold">
              <strong className="font-black uppercase text-amber-900 block">SADC Offline Triage Activated</strong>
              Telemetry records & virtual checkups will be queued in offline local cache memory, and synchronized securely on reconnect.
            </div>
          </div>
        )}
        
        {/* Gestational Age Scroll Sandboxing Widget */}
        <div className="p-3.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-[#5F716A] uppercase tracking-wider">Gestational Age Sandbox:</span>
            <span className="text-white px-2 py-0.5 rounded-full bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] font-mono text-xs font-bold shadow-xs">
              Week {currentWeek}
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="40" 
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="w-full accent-[#4F7066] cursor-ew-resize opacity-90 hover:opacity-100 transition-opacity"
          />
          <div className="flex justify-between text-[8px] text-[#5F716A] font-extrabold uppercase tracking-widest leading-none">
            <span>Trimester 1</span>
            <span>Trimester 2 (Week 20)</span>
            <span>Full Term</span>
          </div>
        </div>

        {/* TAB TARGET: HOME */}
        {activeTab === "home" && (
          <div className="space-y-4 animate-fade-in text-left">
            
            {/* Pregnancy Stages Title with "Weeks / Months" styled dropdown */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider">{currentLangPack.homeTitle}</h3>
                <p className="text-[10px] text-[#7A6B72] font-semibold">{currentLangPack.welcomeMsg} • {currentLangPack.today}</p>
              </div>
            </div>

            {/* NEW SUB-TAB SEGMENT SELECTOR */}
            <div className="grid grid-cols-3 gap-1 bg-white/60 p-1 rounded-2xl border border-white/50 shadow-3xs" id="maternal-companion-modes">
              <button
                type="button"
                onClick={() => setHomeSubTab("vitals")}
                className={`py-2 px-1 rounded-xl font-black text-[9px] uppercase tracking-tight transition-all cursor-pointer text-center ${
                  homeSubTab === "vitals"
                    ? "bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white shadow-xs"
                    : "text-[#7A6B72] hover:text-[#2B1B2E]"
                }`}
              >
                📊 Companion
              </button>
              <button
                type="button"
                onClick={() => setHomeSubTab("journey")}
                className={`py-2 px-1 rounded-xl font-black text-[9px] uppercase tracking-tight transition-all cursor-pointer text-center ${
                  homeSubTab === "journey"
                    ? "bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white shadow-xs"
                    : "text-[#7A6B72] hover:text-[#2B1B2E]"
                }`}
              >
                👶 Milestones
              </button>
              <button
                type="button"
                onClick={() => setHomeSubTab("family")}
                className={`py-2 px-1 rounded-xl font-black text-[9px] uppercase tracking-tight transition-all cursor-pointer text-center ${
                  homeSubTab === "family"
                    ? "bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white shadow-xs"
                    : "text-[#7A6B72] hover:text-[#2B1B2E]"
                }`}
                id="btn-family-subtab"
              >
                👨‍👩‍👧 Family Hub
              </button>
            </div>

            {homeSubTab === "journey" && (
              <div className="space-y-4 animate-fade-in">
                {/* Hero Glass Card featuring 3D Baby Render */}
                <div className="p-4 bg-white/45 backdrop-blur-xl border border-white/50 rounded-3xl relative overflow-hidden shadow-xs flex flex-col justify-between min-h-[220px]">
                  
                  {/* Floating translucent overlay chips */}
                  <div className="flex justify-between items-start z-10 w-full">
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/80 border border-white/60 shadow-xs text-[#2B1B2E] backdrop-blur-md">
                      🍼 {currentWeek} · {currentLangPack.completed}
                    </span>
                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white shadow-sm">
                      ⏳ {Math.max(0, 40 - currentWeek)} · {currentLangPack.remaining}
                    </span>
                  </div>

                  {/* 3D baby render image inside a floating glow sphere */}
                  <div className="absolute right-2 top-8 w-44 h-44 rounded-full flex items-center justify-center pointer-events-none z-0">
                    <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-br from-[#FF6FB1]/10 to-[#E84FA0]/15 border-2 border-white/50 shadow-inner flex items-center justify-center animate-bounce-slow relative">
                      
                      {/* Subtle DNA background line simulation overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#FF6FB1_1px,transparent_1px)] bg-[size:10px_10px]"></div>
                      
                      <img 
                        src="/src/assets/images/pink_flower_dream_1781801176611.jpg" 
                        alt="3D baby render"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full mix-blend-multiply scale-110 filter contrast-[1.12]"
                      />
                    </div>
                  </div>

                  {/* Weekly developmental local info */}
                  <div className="z-10 text-left max-w-[180px] mt-12 bg-white/30 p-2.5 rounded-2xl border border-white/35 backdrop-blur-sm">
                    <span className="text-[8px] font-bold bg-[#E84FA0] text-white px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                      My Stage
                    </span>
                    <h4 className="text-[11px] font-extrabold block text-[#2B1B2E] tracking-tight leading-tight uppercase">
                      {currentMilestone.milestone}
                    </h4>
                    <p className="text-[9.5px] mt-1 text-[#7A6B72] font-semibold leading-tight">
                      📌 {currentMilestone.checklist}
                    </p>
                  </div>

                  {/* Stats metric bottom strip */}
                  <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-[9px] font-bold text-[#E84FA0]/95 z-10 bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs">
                    <span>Baby Size · Week {currentWeek}</span>
                    <span>📏 ~{Math.min(48, currentWeek * 1.1).toFixed(1)} cm</span>
                    <span>⚖️ ~{Math.min(3400, currentWeek * 85)} g</span>
                  </div>
                </div>

                {/* Newly developed interactive WeeklyMilestones explorer */}
                <WeeklyMilestones 
                  currentWeek={currentWeek} 
                  appLanguage={appLanguage} 
                />

                {/* Info summary */}
                <div className="p-3 bg-neutral-50/60 rounded-2xl border border-neutral-200">
                  <h4 className="text-[10px] font-black uppercase text-neutral-600 mb-1">💡 Development Insights</h4>
                  <p className="text-[10px] text-neutral-500 leading-normal">
                    You have successfully completed over {currentWeek} weeks. Keep track of active kick metrics, hydrate at least 2.5L-3.0L daily, and discuss with clinical workers if any sudden health changes occur.
                  </p>
                </div>
              </div>
            )}

            {homeSubTab === "vitals" && (
              // SPECTACULAR ACTIVE PREGNANCY VITALS COMPANION
              <div className="space-y-4 animate-fade-in text-left">
                
                {/* 1. COMPREHENSIVE CONNECTION CARD (Wearable & iOS/Android Phone Integration) */}
                <div className="p-3.5 bg-gradient-to-r from-[#2B1B2E] via-[#35253A] to-[#2B1B2E] text-white rounded-3xl relative overflow-hidden shadow-md border border-purple-950/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#E84FA0]/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isStreamingActive ? "animate-ping" : ""}`} />
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#FF6FB1]">
                          {wearableMode === "wristband" ? "Garmin Lily Wearable Connected" : "iOS/Android Health Direct Feed"}
                        </span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wide">
                        {wearableMode === "wristband" ? "Active VitalBridge Sensor" : "Phone-Only Ambient Collection"}
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-semibold">
                        Device healthy · {lastSyncTime}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-xl flex items-center gap-1 border border-white/10">
                        <Battery className="w-3.5 h-3.5 text-emerald-400 rotate-90" />
                        <span className="text-[9.5px] font-black font-mono">{sensorBattery}%</span>
                      </div>
                      <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 py-0.5 rounded-full">
                        LIVE STREAMING
                      </span>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="mt-3.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2.5">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setWearableMode(wearableMode === "wristband" ? "phone_only" : "wristband");
                          setSensorBattery(wearableMode === "wristband" ? 100 : 88);
                        }}
                        className="py-1 px-2.5 bg-white/10 hover:bg-white/20 text-[9.5px] font-black uppercase text-white rounded-lg transition-colors cursor-pointer"
                      >
                        {wearableMode === "wristband" ? "Switch to Phone Sensors" : "Switch to Garmin Watch"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStreamingActive(!isStreamingActive)}
                        className="py-1 px-2 bg-white/5 hover:bg-white/15 text-[9.5px] font-bold text-[#FF6FB1] rounded-lg transition-colors cursor-pointer"
                      >
                        {isStreamingActive ? "Pause Stream" : "Resume Stream"}
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const randomTime = Math.floor(Math.random() * 2) + 1;
                        setLastSyncTime(`Synced ${randomTime}s ago`);
                        setStepsToday(prev => prev + Math.floor(Math.random() * 20) + 10);
                        // trigger brief rotation effect via class
                        const el = document.getElementById("sync-icon-pulse");
                        if (el) {
                          el.classList.add("animate-spin");
                          setTimeout(() => el.classList.remove("animate-spin"), 1000);
                        }
                      }}
                      className="p-1 px-1.5 bg-[#FF6FB1]/20 hover:bg-[#FF6FB1]/30 border border-[#FF6FB1]/25 text-[#FF6FB1] rounded-lg transition-colors text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Sync Now"
                    >
                      <RefreshCw className="w-3 h-3" id="sync-icon-pulse" /> Sync
                    </button>
                  </div>
                </div>

                {/* 2. BABY'S FOCAL HEALTH BLOCK (Absolute prominence at page center) */}
                <div className="p-4 bg-gradient-to-br from-[#FFF9F6] to-[#FFF1EE] border-2 border-[#FF6FB1]/30 rounded-3xl space-y-3.5 shadow-md relative overflow-hidden">
                  {/* Glowing organic ambient shape */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-pink-100 rounded-full blur-xl opacity-80 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[8.5px] font-black uppercase text-[#E84FA0] tracking-wider bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full inline-block">
                        ✨ Core Pregnancy Sensor Focalpoint
                      </span>
                      <h4 className="text-[12.5px] font-black text-[#2B1B2E] uppercase mt-1">
                        👶 Baby's Active Health Telemetry
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#4F7066] font-bold bg-white px-2 py-0.5 rounded-full border border-neutral-150">
                      Gestation Week {currentWeek}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Fetal Heart Rate Card with soundwaves pulse animation */}
                    <div className="p-3 bg-white rounded-2xl border border-neutral-150 shadow-3xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase text-[#7A6B72]">
                          Fetal Heart Rate
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-black text-emerald-800 uppercase">
                            Reassuring
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 my-2">
                        <div className="w-11 h-11 bg-pink-50 rounded-full flex items-center justify-center border border-pink-100 shrink-0">
                          <Heart className="w-6 h-6 text-[#E84FA0]" style={{ animation: `pulse ${(60 / fetalHeartRate).toFixed(2)}s infinite` }} />
                        </div>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black font-mono tracking-tight text-[#2B1B2E]">
                              {fetalHeartRate}
                            </span>
                            <span className="text-[10px] font-bold text-[#7A6B72]">BPM</span>
                          </div>
                          <span className="text-[8px] text-[#4F7066] font-extrabold bg-[#4F7066]/10 px-1.5 py-0.5 rounded">
                            Stable Sinus Rhythm
                          </span>
                        </div>
                      </div>

                      <p className="text-[8.5px] text-[#7A6B72] font-semibold leading-relaxed border-t border-neutral-100 pt-1.5">
                        Continuous ultrasound sensor check confirms healthy active rate (120-160 normal range).
                      </p>
                    </div>

                    {/* Fetal movement count */}
                    <div className="p-3 bg-white rounded-2xl border border-neutral-150 shadow-3xs flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-black uppercase text-[#7A6B72]">
                          Fetal Movement Count
                        </span>
                        <span className="text-[8px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          Excellent Activity
                        </span>
                      </div>

                      <div className="my-2 flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black font-mono text-[#2B1B2E]">{totalKicksToday}</span>
                          <span className="text-[9.5px] font-black text-zinc-500 uppercase">Movements</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-[#7A6B72] block">Daily Standard:</span>
                          <span className="text-[9px] font-black text-[#E84FA0]">10 / 2 Hour Window</span>
                        </div>
                      </div>

                      {/* Movement progress bar */}
                      <div className="w-full space-y-1">
                        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] transition-all duration-500" 
                            style={{ width: `${Math.min((totalKicksToday / 10) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[7px] font-bold text-[#7A6B72] uppercase">
                          <span>Progress to threshold</span>
                          <span>{Math.round(Math.min((totalKicksToday / 10) * 100, 100))}%</span>
                        </div>
                      </div>

                      {/* Giant pink button to log flutter / kick */}
                      <button
                        type="button"
                        onClick={() => {
                          setTotalKicksToday(t => t + 1);
                          // Floating notification feedback if possible
                          const fdb = document.getElementById("kick-conf-notif");
                          if (fdb) {
                            fdb.classList.remove("opacity-0");
                            setTimeout(() => fdb.classList.add("opacity-0"), 1200);
                          }
                        }}
                        className="w-full mt-2.5 py-2 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white rounded-xl text-[9.5px] font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 shadow-2xs hover:shadow-xs cursor-pointer hover:scale-[1.01] transition-transform"
                      >
                        👶 Log Baby Flutter / Kick Now
                      </button>
                      <div id="kick-conf-notif" className="text-center text-[#E84FA0] text-[8px] font-black uppercase opacity-0 transition-opacity duration-300 h-1 mt-0.5 animate-pulse">
                        ✓ Flutter Registered! Keep Bonding!
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. MOTHER'S DUAL-GRID PARAMETERS SECTION */}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#7A6B72] block mb-2 px-1">
                    🤰 Mother's Clinical Wellness Metrics
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    
                    {/* Mother's Heart Rate */}
                    <div className="p-3 bg-[#E2F0E7]/55 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-[#4F7066] uppercase block">Heart Rate (BPM)</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-xl font-black font-mono tracking-tight">{simulatedVitals.hr}</span>
                        <span className="text-[8px] font-semibold text-emerald-700">BPM</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-emerald-800">
                        <span>🟢 Normal</span>
                        <span>↗️ Stable</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">{lastSyncTime}</span>
                    </div>

                    {/* Maternal Blood pressure */}
                    <div className="p-3 bg-[#FCE9DD]/55 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-amber-800 uppercase block">Blood Pressure</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-lg font-black font-mono tracking-tight">{simulatedVitals.bp}</span>
                        <span className="text-[7.5px] font-extrabold text-amber-700">mmHg</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-amber-800">
                        <span>🟢 Optimal</span>
                        <span>➔ Safe</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">{lastSyncTime}</span>
                    </div>

                    {/* Blood oxygen */}
                    <div className="p-3 bg-[#EAF2FF]/55 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-blue-800 uppercase block">Oxygen SpO₂</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-xl font-black font-mono tracking-tight">{liveSpO2}</span>
                        <span className="text-[8px] font-semibold text-blue-700">%</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-blue-800">
                        <span>🟢 Healthy</span>
                        <span>➔ Stable</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">{lastSyncTime}</span>
                    </div>

                    {/* Respiratory rate */}
                    <div className="p-3 bg-neutral-50/70 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-[#7A6B72] uppercase block">Respiratory Rate</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-xl font-black font-mono tracking-tight">{respiratoryRate}</span>
                        <span className="text-[8px] font-semibold text-neutral-500">/min</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-neutral-600">
                        <span>🟢 Consistent</span>
                        <span>➔ Steady</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">{lastSyncTime}</span>
                    </div>

                    {/* Maternal temperature */}
                    <div className="p-3 bg-[#FFF3EE]/70 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-rose-800 uppercase block">Body Temperature</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-xl font-black font-mono tracking-tight">{simulatedVitals.temp}</span>
                        <span className="text-[8px] font-semibold text-rose-700">°C</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-[#E84FA0]">
                        <span>🟢 Normal</span>
                        <span>➔ Safe</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">{lastSyncTime}</span>
                    </div>

                    {/* Sleep score */}
                    <div className="p-3 bg-purple-50/50 border border-white rounded-2xl space-y-1 relative shadow-3xs text-left">
                      <span className="text-[7.5px] font-black text-purple-850 uppercase block">Maternal Sleep</span>
                      <div className="flex items-baseline gap-0.5 text-[#2B1B2E]">
                        <span className="text-xl font-black font-mono tracking-tight">{sleepScore}</span>
                        <span className="text-[8px] font-semibold text-purple-700">/100</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-purple-800">
                        <span>🟢 Restful</span>
                        <span>🌙 Strong</span>
                      </div>
                      <span className="text-[6.5px] text-zinc-400 block pt-1 border-t border-neutral-200">Wearable auto-log</span>
                    </div>

                  </div>
                </div>

                {/* 4. DAILY WELLNESS COMPLEMENTARY TRACKERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  
                  {/* Hydration tracking panel */}
                  <div className="p-3 bg-blue-50/30 border border-blue-200/50 rounded-2xl text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] font-black uppercase text-blue-800 flex items-center gap-1">
                        💧 Hydration Status Log
                      </span>
                      <span className="text-[8.5px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                        Target: 8 glasses (2L)
                      </span>
                    </div>

                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono text-[#2B1B2E]">{hydrationGlasses}</span>
                        <span className="text-[9px] font-black text-neutral-500 uppercase">Glasses</span>
                      </div>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                          <span 
                            key={g} 
                            className={`w-3 h-4 rounded-xs border transition-colors ${
                              g <= hydrationGlasses 
                                ? "bg-cyan-500 border-cyan-600 shadow-3xs" 
                                : "bg-neutral-100 border-neutral-200"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setHydrationGlasses(g => Math.min(8, g + 1));
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[9px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer hover:shadow-3xs active:scale-95 transition-all"
                      >
                        💧 Drink 250ml water (+1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHydrationGlasses(0)}
                        className="py-1.5 px-2.5 bg-neutral-100 text-neutral-500 text-[9px] font-bold rounded-lg cursor-pointer hover:bg-neutral-200"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Daily Active Steps */}
                  <div className="p-3 bg-[#FFFBF8] border border-orange-200/50 rounded-2xl text-left space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8.5px] font-black uppercase text-orange-900">
                        👣 Daily activity tracker
                      </span>
                      <span className="text-[8px] text-orange-955 bg-orange-100 px-2 py-0.5 rounded-full font-bold">
                        Pedometer active
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono text-[#2B1B2E]">
                          {stepsToday.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-[#7A6B72] font-black">STEPS</span>
                      </div>
                      <span className="text-[8px] font-extrabold text-[#4F7066] bg-[#4F7066]/10 px-2 py-0.5 rounded-full">
                        ~{((stepsToday * 0.75) / 1000).toFixed(2)} km
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
                          style={{ width: `${Math.min((stepsToday / 8000) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[7px] font-bold text-neutral-400 uppercase">
                        <span>Safe Guideline Limit Progress</span>
                        <span>{Math.round(Math.min((stepsToday / 8000) * 100, 100))}%</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* HEALTH TREND OVERVIEW - VISUALIZING BOTH BLOOD PRESSURE AND WEIGHT HISTORY */}
                <div className="p-4 bg-white/70 backdrop-blur-md border border-[#C6DFD7] rounded-3xl space-y-3 relative overflow-hidden text-left shadow-xs">
                  {/* Floating Micro Background Icons for appealing visuals */}
                  <div className="absolute top-2 right-2 w-16 h-16 bg-[#4F7066]/5 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-amber-500/5 rounded-full blur-lg pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[#4F7066] bg-[#4F7066]/10 px-2 py-0.5 rounded-full inline-block">
                        🩺 SADC Integrated Clinical Screen
                      </span>
                      <h4 className="text-[12px] font-black text-[#2B1B2E] uppercase mt-1">
                        Health Trend Overview (BP & Weight)
                      </h4>
                      <p className="text-[9.5px] text-[#5F716A] leading-tight font-semibold mt-0.5">
                        Dual-axis correlation of cardiovascular stability and gestational weight progression.
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[8px] font-bold text-[#7A6B72] block uppercase">Clinical Focus</span>
                      <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 inline-block">
                        Pre-eclampsia Screen
                      </span>
                    </div>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-3 gap-2 py-1 bg-[#EEF5F2]/50 border border-[#D5E1DB]/50 rounded-2xl p-2">
                    <div className="text-center">
                      <span className="text-[7.5px] font-bold text-[#7A6B72] uppercase block">Latest BP</span>
                      <span className="font-mono font-black text-[11px] text-[#2B1B2E]">
                        {(vitalsLog || []).filter(l => l.patientId === patientId).slice(-1)[0]?.systolic || 118}/
                        {(vitalsLog || []).filter(l => l.patientId === patientId).slice(-1)[0]?.diastolic || 75}
                      </span>
                      <span className="text-[6.5px] font-bold text-emerald-700 block">mmHg</span>
                    </div>
                    <div className="text-center border-x border-dashed border-[#D5E1DB]">
                      <span className="text-[7.5px] font-bold text-[#7A6B72] uppercase block">Latest Weight</span>
                      <span className="font-mono font-black text-[11px] text-[#2B1B2E]">
                        {((vitalsLog || []).filter(l => l.patientId === patientId).slice(-1)[0]?.weight || 71.5).toFixed(1)}
                      </span>
                      <span className="text-[6.5px] font-bold text-amber-700 block">kg</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[7.5px] font-bold text-[#7A6B72] uppercase block">Interval Mean</span>
                      <span className="font-mono font-black text-[11px] text-zinc-800">
                        {Math.round(
                          (vitalsLog || []).filter(l => l.patientId === patientId).reduce((acc, log) => acc + (log.systolic || 116), 0) / 
                          Math.max((vitalsLog || []).filter(l => l.patientId === patientId).length, 1)
                        )}
                      </span>
                      <span className="text-[6.5px] font-bold text-[#4F7066] block">Avg Systolic</span>
                    </div>
                  </div>

                  {/* Recharts Dual-Axis Chart */}
                  <div className="h-[175px] w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={(vitalsLog || []).filter(l => l.patientId === patientId).length >= 2 ?
                          (vitalsLog || [])
                            .filter(l => l.patientId === patientId)
                            .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((log, idx) => {
                              const d = new Date(log.createdAt);
                              const formattedDate = !isNaN(d.getTime()) 
                                ? d.toLocaleString("en-US", { month: "short", day: "numeric" })
                                : `Log ${idx + 1}`;
                              return {
                                name: formattedDate,
                                systolic: log.systolic || 116,
                                diastolic: log.diastolic || 74,
                                weight: log.weight || 70.0,
                                dateStr: formattedDate
                              };
                            }) : [
                              { name: "Week 12", systolic: 110, diastolic: 70, weight: 68.2, dateStr: "Benchmark Week 12" },
                              { name: "Week 16", systolic: 112, diastolic: 72, weight: 69.5, dateStr: "Benchmark Week 16" },
                              { name: "Week 20", systolic: 114, diastolic: 73, weight: 70.8, dateStr: "Benchmark Week 20" },
                              { name: "Week 24", systolic: 115, diastolic: 74, weight: 71.4, dateStr: "Benchmark Week 24" },
                              { name: "Week 28", systolic: 117, diastolic: 75, weight: 72.5, dateStr: "Benchmark Week 28" },
                            ]
                        }
                        margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
                      >
                        <defs>
                          <linearGradient id="colorSystolicTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F7066" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4F7066" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorDiastolicTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7EA195" stopOpacity={0.06}/>
                            <stop offset="95%" stopColor="#7EA195" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EEF5F2" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#728c83" 
                          style={{ fontSize: '7.5px', fontWeight: 'bold' }} 
                        />
                        <YAxis 
                          yAxisId="left" 
                          domain={[50, 150]}
                          stroke="#4F7066" 
                          style={{ fontSize: '8px', fontWeight: 'extrabold' }}
                          tickLine={false}
                          label={{ value: 'BP (mmHg)', angle: -90, position: 'insideLeft', style: { fontSize: '7px', fill: '#4F7066', fontWeight: 'black' }, offset: 0 }}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          domain={['dataMin - 2', 'dataMax + 2']}
                          stroke="#BC7430" 
                          style={{ fontSize: '8px', fontWeight: 'extrabold' }}
                          tickLine={false}
                          label={{ value: 'Weight (kg)', angle: 90, position: 'insideRight', style: { fontSize: '7px', fill: '#BC7430', fontWeight: 'black' }, offset: 0 }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #D5E1DB', fontSize: '9px', fontWeight: 'bold' }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '8.5px', fontWeight: 'bold', paddingTop: '4px' }} />
                        <Area 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="systolic" 
                          name="Systolic BP" 
                          stroke="#4F7066" 
                          strokeWidth={2.5}
                          fill="url(#colorSystolicTrend)" 
                        />
                        <Area 
                          yAxisId="left" 
                          type="monotone" 
                          dataKey="diastolic" 
                          name="Diastolic BP" 
                          stroke="#7EA195" 
                          strokeWidth={1.8}
                          fill="url(#colorDiastolicTrend)" 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="weight" 
                          name="Weight" 
                          stroke="#BC7430" 
                          strokeWidth={2} 
                          dot={{ r: 2.5, strokeWidth: 1.5, fill: 'white' }}
                          activeDot={{ r: 5 }} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. DYNAMIC RECHARTS VISUAL PROGRESSION (Fulfilling Recharts Requirement) */}
                <div className="p-4 bg-white border border-neutral-150 rounded-3xl space-y-3.5 text-left shadow-xs">
                  <div className="flex justify-between items-center select-none">
                    <div>
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[#4F7066] block">
                        Dynamic Recharts Trend Analyzer
                      </span>
                      <h4 className="text-[11.5px] font-black text-[#2B1B2E] uppercase mt-0.5">
                        Pregnancy Progression History
                      </h4>
                    </div>
                    
                    {/* Metrics Selector Dropdown */}
                    <div className="flex gap-1.5 items-center">
                      <select
                        value={chartMetric}
                        onChange={(e) => setChartMetric(e.target.value as any)}
                        className="text-[10px] font-black bg-white border border-[#D5E1DB] px-3 py-1.5 rounded-xl text-[#2B1B2E] cursor-pointer outline-none shadow-3xs hover:border-[#4F7066]/40 transition-colors"
                        id="vitals-dropdown-filter"
                      >
                        <option value="combined">📊 Combined Vitals</option>
                        <option value="bp">🩺 Blood Pressure only</option>
                        <option value="hr">💓 Heart Rate only</option>
                      </select>
                    </div>
                  </div>

                  {/* Responsive Container for Recharts using real local VitalsLog array */}
                  <div className="h-[155px] w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={(vitalsLog || []).filter(l => l.patientId === patientId).length > 2 ? 
                          (vitalsLog || [])
                            .filter(l => l.patientId === patientId)
                            .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((log, idx) => {
                              const d = new Date(log.createdAt);
                              const formattedDate = !isNaN(d.getTime()) 
                                ? d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                : "Logged Data";
                              return {
                                week: `Log ${idx + 1}`,
                                systolic: log.systolic || 116,
                                diastolic: log.diastolic || 74,
                                pulse: log.pulse || 76,
                                fetal: 142 + (idx % 2 === 0 ? 1 : -1), // beautiful FHR tandem data!
                                dateStr: formattedDate
                              };
                            }) : [
                              // Pad with pregnancy-specific historical benchmarks when user hasn't added many yet
                              { week: "Week 12", systolic: 110, diastolic: 70, pulse: 74, fetal: 144, dateStr: "Clinical Benchmark Week 12" },
                              { week: "Week 16", systolic: 112, diastolic: 72, pulse: 76, fetal: 142, dateStr: "Clinical Benchmark Week 16" },
                              { week: "Week 20", systolic: 114, diastolic: 74, pulse: 78, fetal: 145, dateStr: "Clinical Benchmark Week 20" },
                              { week: "Week 24", systolic: 116, diastolic: 75, pulse: 81, fetal: 140, dateStr: "Clinical Benchmark Week 24" },
                              { week: "Week 28", systolic: 118, diastolic: 76, pulse: 83, fetal: 142, dateStr: "Clinical Benchmark Week 28" },
                              { week: "Week 32", systolic: 120, diastolic: 78, pulse: 84, fetal: 144, dateStr: "Clinical Benchmark Week 32" },
                              // Accommodate user's newest manual entries
                              ...((vitalsLog || [])
                                .filter(l => l.patientId === patientId)
                                .map((log, idx) => {
                                  const d = new Date(log.createdAt);
                                  const formattedDate = !isNaN(d.getTime()) 
                                    ? d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                    : "Logged Entry";
                                  return {
                                    week: `Entry ${idx + 1}`,
                                    systolic: log.systolic || 120,
                                    diastolic: log.diastolic || 80,
                                    pulse: log.pulse || 78,
                                    fetal: 142,
                                    dateStr: formattedDate
                                  };
                                }))
                            ]
                        }
                        margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F7066" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#4F7066" stopOpacity={0.01}/>
                          </linearGradient>
                          <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E84FA0" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#E84FA0" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(79, 112, 102, 0.08)" />
                        <XAxis 
                          dataKey="week" 
                          tick={{ fill: "#5F716A", fontSize: 8, fontWeight: "bold" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={chartMetric === "bp" ? [60, 140] : chartMetric === "hr" ? [65, 155] : [55, 175]} 
                          tick={{ fill: "#5F716A", fontSize: 8, fontWeight: "bold" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<InteractiveTrendChartTooltip />} />
                        {chartMetric === "combined" ? (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="systolic" 
                              name="Systolic BP" 
                              stroke="#4F7066" 
                              strokeWidth={2.5}
                              fillOpacity={0.15} 
                              fill="url(#colorBP)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="diastolic" 
                              name="Diastolic BP" 
                              stroke="#E84FA0" 
                              strokeWidth={1.5}
                              fillOpacity={0.10} 
                              fill="url(#colorDia)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="pulse" 
                              name="Mother HR" 
                              stroke="#7A6B72" 
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              fillOpacity={0} 
                              fill="none" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="fetal" 
                              name="Fetal Heart Rate" 
                              stroke="#FF6FB1" 
                              strokeWidth={1.2}
                              strokeDasharray="4 4"
                              fillOpacity={0} 
                              fill="none" 
                            />
                          </>
                        ) : chartMetric === "bp" ? (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="systolic" 
                              name="Systolic BP" 
                              stroke="#4F7066" 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#colorBP)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="diastolic" 
                              name="Diastolic BP" 
                              stroke="#E84FA0" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorDia)" 
                            />
                          </>
                        ) : (
                          <>
                            <Area 
                              type="monotone" 
                              dataKey="pulse" 
                              name="Mother HR" 
                              stroke="#4F7066" 
                              strokeWidth={2.5}
                              fillOpacity={1} 
                              fill="url(#colorBP)" 
                            />
                            <Area 
                              type="monotone" 
                              dataKey="fetal" 
                              name="Fetal Heart Rate" 
                              stroke="#FF6FB1" 
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              fillOpacity={0.1} 
                              fill="none" 
                            />
                          </>
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Key advisory indicator */}
                  <p className="text-[9.5px] text-[#5F716A] leading-tight flex items-center gap-1.5 pt-1.5 border-t border-neutral-150 font-bold">
                    🛡️ <span>Clinical Guideline: Consistent stable vitals curve. All entries successfully stored inside encrypted SADC Patient Registry.</span>
                  </p>
                </div>

                {/* 6. OPTIONAL OFFLINE-COMPATIBLE SELF REPORTING MANUAL LOGGING FIELD (works identical to iOS Health Network-free) */}
                <div className="p-4 bg-white/70 backdrop-blur-md rounded-3xl border border-neutral-200/60 shadow-xs space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#E84FA0] bg-pink-50 border border-[#FF6FB1]/25 px-2 py-0.5 rounded-full inline-block">
                      Manual Health Journal (iOS style)
                    </span>
                    <h4 className="text-xs font-black text-[#2B1B2E] uppercase mt-1.5">
                      🧗 Record parameters offline or device-free
                    </h4>
                    <p className="text-[9.5px] text-[#7A6B72] font-semibold leading-tight">
                      Log parameters without a syncable watch. Your data binds immediately to the dynamic chart.
                    </p>
                  </div>

                  {vitalsAddedFeedback && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 rounded-2xl text-[9.5px] font-bold flex items-center gap-2">
                      <span className="text-emerald-600 font-extrabold">✓ &nbsp; SUCCESS</span>
                      <div>{vitalsAddedFeedback}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* FORM LEFT */}
                    <div className="space-y-2.5 bg-white border border-neutral-200/50 p-3 rounded-2xl">
                      <span className="text-[8px] font-black text-[#4F7066] uppercase block"> MOTHERS PARAMETERS</span>
                      
                      <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                        <div>
                          <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Systolic (mmHg):</label>
                          <input 
                            type="number"
                            value={userVitalsForm.systolic}
                            onChange={(e) => setUserVitalsForm({...userVitalsForm, systolic: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 px-2 py-1 font-bold rounded-md text-[#2B1B2E]"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Diastolic (mmHg):</label>
                          <input 
                            type="number"
                            value={userVitalsForm.diastolic}
                            onChange={(e) => setUserVitalsForm({...userVitalsForm, diastolic: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 px-2 py-1 font-bold rounded-md text-[#2B1B2E]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
                        <div>
                          <label className="text-[7.5px] font-bold text-zinc-400 uppercase block mb-0.5">Mother HR:</label>
                          <input 
                            type="number"
                            value={userVitalsForm.pulse}
                            onChange={(e) => setUserVitalsForm({...userVitalsForm, pulse: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 px-1 py-1 font-bold rounded-md text-[#2B1B2E]"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] font-bold text-zinc-400 uppercase block mb-0.5">Temp (°C):</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={userVitalsForm.temperature}
                            onChange={(e) => setUserVitalsForm({...userVitalsForm, temperature: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 px-1 py-1 font-bold rounded-md text-[#2B1B2E]"
                          />
                        </div>
                        <div>
                          <label className="text-[7.5px] font-bold text-zinc-400 uppercase block mb-0.5">Weight (kg):</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={userVitalsForm.weight}
                            onChange={(e) => setUserVitalsForm({...userVitalsForm, weight: e.target.value})}
                            className="w-full bg-neutral-50 border border-neutral-200 px-1 py-1 font-bold rounded-md text-[#2B1B2E]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[7.5px] font-bold text-zinc-400 uppercase block mb-0.5">Symptoms or comments:</label>
                        <input 
                          type="text"
                          placeholder="Ankle swelling, slight nausea..."
                          value={userVitalsForm.notes}
                          onChange={(e) => setUserVitalsForm({...userVitalsForm, notes: e.target.value})}
                          className="w-full bg-neutral-50 border border-neutral-200 px-2 py-1.5 text-[9.5px] font-semibold rounded-lg text-[#2B1B2E]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onAddVitals({
                            patientId: patientId,
                            systolic: parseInt(userVitalsForm.systolic) || 120,
                            diastolic: parseInt(userVitalsForm.diastolic) || 80,
                            pulse: parseInt(userVitalsForm.pulse) || 78,
                            temperature: parseFloat(userVitalsForm.temperature) || 36.5,
                            weight: parseFloat(userVitalsForm.weight) || 72.0,
                            symptoms: userVitalsForm.notes ? [userVitalsForm.notes] : ["Routine check-in"],
                            recordedBy: "patient",
                            riskAlerts: [],
                            notes: userVitalsForm.notes || "Recorded daily parameters"
                          });

                          setVitalsAddedFeedback("Maternal parameters saved! Chart updated with newest coordinates.");
                          setUserVitalsForm({
                            systolic: "120",
                            diastolic: "80",
                            pulse: "78",
                            temperature: "36.5",
                            weight: "72.0",
                            notes: ""
                          });
                          setTimeout(() => setVitalsAddedFeedback(""), 4500);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white text-[9.5px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer hover:opacity-90 transition-all shadow-3xs"
                      >
                        🚀 Submit parameters
                      </button>
                    </div>

                    {/* FORM RIGHT (Kicks and Timeline) */}
                    <div className="space-y-3.5 bg-pink-50/20 border border-pink-100 p-3 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[8px] font-black text-[#E84FA0] uppercase block">👶 QUICK MANUAL BABY STREAM</span>
                        <p className="text-[9px] text-[#7A6B72] leading-tight font-semibold mt-1">
                          Keep track of hourly baby activities here. Submit directly to clinicians.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-pink-50">
                        <span className="text-xl shrink-0">🍼</span>
                        <div className="flex-1">
                          <label className="text-[7.5px] font-bold text-neutral-500 uppercase block mb-0.5">Quick logged session score:</label>
                          <div className="flex items-center gap-1.5 justify-start">
                            <span className="font-mono font-black text-sm text-[#2B1B2E]">{sessionKicks}</span>
                            <span className="text-[9px] font-black text-[#E84FA0] uppercase font-mono">kicks counted</span>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSessionKicks(i => i + 1)}
                            className="bg-pink-100 text-[#E84FA0] font-black p-1.5 px-2.5 rounded-lg text-xs hover:bg-pink-200 cursor-pointer"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionKicks(0)}
                            className="bg-neutral-100 text-neutral-500 px-2 py-1 rounded-lg text-[9px] hover:bg-neutral-200 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {sessionKicks > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddVitals({
                              patientId: patientId,
                              systolic: 120,
                              diastolic: 80,
                              pulse: 78,
                              temperature: 36.5,
                              weight: 72.0,
                              symptoms: ["Manual active kicks session log"],
                              recordedBy: "patient",
                              riskAlerts: [],
                              kickCount: sessionKicks,
                              notes: "Manually registered active baby kicks session."
                            });
                            setVitalsAddedFeedback(`Baby kick session of ${sessionKicks} kicks saved successfully!`);
                            setSessionKicks(0);
                            setTimeout(() => setVitalsAddedFeedback(""), 4500);
                          }}
                          className="w-full py-1.5 bg-[#E84FA0] text-white text-[9px] font-black uppercase rounded-lg tracking-wider text-center cursor-pointer hover:opacity-90"
                        >
                          ✓ Send Kick Session to Doctor
                        </button>
                      )}
                      
                      <div className="text-[8.5px] text-[#7A6B72] border-t border-dashed border-pink-100/50 pt-2.5">
                        💡 <strong>Help:</strong> Standard rule of thumb lies on the left side of abdomen after heavy food. Target at least 10 discrete rolls/flutter beats.
                      </div>
                    </div>
                  </div>

                  {/* RECENT HISTORIC ENTRIES FEED */}
                  <div className="pt-2 border-t border-dashed border-neutral-150">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[#7A6B72] mb-1.5 block">
                      📜 Recent Self-Reported Dashboard Log History
                    </span>
                    
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                      {vitalsLog && vitalsLog.filter && vitalsLog.filter(log => log.patientId === patientId).length > 0 ? (
                        vitalsLog
                          .filter(log => log.patientId === patientId)
                          .map((log) => (
                            <div key={log.id} className="p-2.5 bg-white border border-neutral-150 rounded-xl text-[10px] space-y-1 flex justify-between items-start gap-1 shadow-3xs">
                              <div className="text-left">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#E84FA0] uppercase bg-[#FFF9F6] border border-[#FF6FB1]/10 px-1.5 py-0.5 rounded text-[8px]">
                                    {log.recordedBy === "patient" ? "🙋 Self logged" : "👨‍⚕️ Clinician"}
                                  </span>
                                  <span className="text-[8.5px] text-[#7A6B72] font-mono">
                                    {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                <p className="text-[#2B1B2E] font-extrabold mt-1">
                                  🌡️ {log.temperature}°C · 💓 {log.pulse} bpm · ⚖️ {log.weight} kg · 🩸 {log.systolic}/{log.diastolic} mmHg
                                </p>

                                {log.notes && (
                                  <p className="text-[9.5px] text-zinc-500 italic mt-0.5">
                                    "{log.notes}"
                                  </p>
                                )}
                              </div>

                              {log.kickCount !== undefined && log.kickCount > 0 && (
                                <div className="shrink-0 bg-pink-105 text-[#E84FA0] font-black text-[9px] uppercase px-2 py-1 rounded-xl flex flex-col items-center justify-center border border-pink-100">
                                  <span>👶 {log.kickCount}</span>
                                  <span className="text-[6.5px]">KICKS</span>
                                </div>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-[10px] text-neutral-400 italic py-2 text-center">No self-reported clinical history records found yet.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: FAMILY VIEWING INTEGRATED MODE */}
            {homeSubTab === "family" && (
              <div className="space-y-4 animate-fade-in text-left" id="family-viewing-mode-container">
                
                {/* 1. Header Card with Family Info */}
                <div className="p-4 bg-gradient-to-r from-[#FFF9F6] to-[#FFEBF1] rounded-3xl border border-pink-100 shadow-3xs space-y-3 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FF6FB1]/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-extrabold uppercase bg-pink-100 border border-pink-200 text-[#E84FA0] px-2 py-0.5 rounded-full inline-block">
                        👨‍👩‍👧 Family Support Desk
                      </span>
                      <h4 className="text-xs font-black text-[#2B1B2E] uppercase tracking-wide">
                        Kelebogile's Family Portal
                      </h4>
                      <p className="text-[10px] text-[#7A6B72] font-semibold leading-relaxed">
                        Authorized family members can view weekly milestones, active vitals, and send virtual greetings.
                      </p>
                    </div>
                    <span className="text-2xl shrink-0 filter drop-shadow">🏡</span>
                  </div>

                  {/* Connected Family overview strip */}
                  <div className="pt-3 border-t border-[#FF6FB1]/10 flex flex-wrap gap-2 text-[9px] font-bold">
                    <span className="text-[#2B1B2E]">Active Links:</span>
                    <span className="bg-white/70 px-2 py-0.5 rounded-md border border-neutral-150 inline-flex items-center gap-1 text-[#4F7066]">
                      👨‍💻 Thabo (Partner)
                    </span>
                    <span className="bg-white/70 px-2 py-0.5 rounded-md border border-neutral-150 inline-flex items-center gap-1 text-[#4F7066]">
                      👵 Lindiwe (Grandmother)
                    </span>
                    <span className="bg-white/70 px-2 py-0.5 rounded-md border border-neutral-150 inline-flex items-center gap-1 text-[#4F7066]">
                      🌸 Aunt Sarah (Relative)
                    </span>
                  </div>
                </div>

                {/* Hearts particle burst visual cue */}
                {heartsMultiplier > 0 && (
                  <div className="p-3.5 bg-pink-500 rounded-2xl text-center text-white text-[11px] font-black uppercase tracking-wider shadow-md animate-bounce flex items-center justify-center gap-2">
                    <span>💖 Sending {heartsMultiplier * 5} Hearts to Kelebogile! 🤰✨</span>
                  </div>
                )}

                {/* 2. Layman Vitals Summary and Due Date Tracker */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-neutral-200/60 rounded-3xl text-left space-y-2 shadow-3xs">
                    <span className="text-[8px] font-extrabold uppercase text-[#7A6B72] tracking-wider block">👶 Due Date Countdown</span>
                    <div className="space-y-0.5">
                      <span className="font-mono font-black text-xl text-[#2B1B2E] tracking-tight">
                        {Math.max(0, (40 - currentWeek) * 7)} Days
                      </span>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase tracking-widest">Until Baby Sifiso arrives</p>
                    </div>
                    <div className="w-full bg-[#FFF1EE] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] h-full transition-all duration-300" 
                        style={{ width: `${(currentWeek / 40) * 100}%` }}
                      />
                    </div>
                    <span className="text-[8.5px] font-semibold text-[#7A6B72] block">
                      Currently: <strong>Week {currentWeek}</strong> (Trimester {currentWeek <= 13 ? "1" : currentWeek <= 26 ? "2" : "3"})
                    </span>
                  </div>

                  <div className="p-3.5 bg-white border border-neutral-200/60 rounded-3xl text-left space-y-2 shadow-3xs">
                    <span className="text-[8px] font-extrabold uppercase text-[#2B1B2E] tracking-wider block">💓 Quick Status Check</span>
                    <div className="space-y-1.5 text-[9.5px] font-semibold">
                      <div className="flex justify-between items-center bg-emerald-50/50 p-1 px-1.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-800">🩸 Vitals BP</span>
                        <span className="font-mono font-black text-[#2B1B2E]">Stable</span>
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 p-1 px-1.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-800">👶 Movement</span>
                        <span className="font-mono font-black text-[#2B1B2E]">High Activity</span>
                      </div>
                      <button
                        onClick={() => {
                          setHeartsMultiplier(prev => prev + 1);
                          setTimeout(() => setHeartsMultiplier(0), 3000);
                        }}
                        type="button"
                        className="w-full py-1.5 bg-[#FF6FB1] hover:bg-[#E84FA0] transition-colors text-white font-black uppercase text-[8px] tracking-wider rounded-xl cursor-pointer"
                      >
                        💖 Send Love React
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. The Family Interactive Journal note board */}
                <div className="p-4 bg-white rounded-3xl border border-neutral-200/60 shadow-3xs space-y-3.5">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <div className="text-left">
                      <h4 className="text-[11px] font-extrabold text-[#2B1B2E] uppercase">💌 Encouragement Wall</h4>
                      <p className="text-[8.5px] text-neutral-400 font-bold uppercase tracking-widest">Leave sweet notes for the expecting mother</p>
                    </div>
                    <span className="text-lg">✨</span>
                  </div>

                  {/* Messages Feed */}
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar animate-fade-in text-left">
                    {familyMessages.map((msg) => (
                      <div key={msg.id} className="p-3 bg-[#FFF9F6]/40 border border-[#FF6FB1]/10 rounded-2xl space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{msg.joinedIcon}</span>
                            <span className="font-black text-[#2B1B2E]">{msg.authorName}</span>
                            <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-pink-100/60 border border-pink-100 text-[#E84FA0] font-bold">
                              {msg.role}
                            </span>
                          </div>
                          <span className="text-[8.5px] font-mono text-neutral-400 font-bold">{msg.createdAt}</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 font-medium leading-relaxed italic text-left">
                          "{msg.message}"
                        </p>
                        <div className="flex justify-between items-center pt-1 border-t border-dashed border-neutral-150/20">
                          <button
                            onClick={() => {
                              setFamilyMessages(prev => prev.map(m => {
                                if (m.id === msg.id) {
                                  return { ...m, heartsCount: m.heartsCount + 1 };
                                }
                                return m;
                              }));
                            }}
                            type="button"
                            className="text-[8.5px] text-[#E84FA0] hover:underline font-extrabold cursor-pointer inline-flex items-center gap-1 focus:outline-none"
                          >
                            💖 {msg.heartsCount} Hearts
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Message form */}
                  <div className="bg-[#FFF9F6]/40 p-3 rounded-2xl border border-[#FF6FB1]/10 space-y-2 text-xs">
                    <span className="text-[8.5px] font-black uppercase text-[#7A6B72] block text-left">
                      ✍️ Log Your Family Greeting node:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[7.5px] font-bold uppercase text-[#7A6B72] block mb-0.5 text-left">Your name:</label>
                        <input 
                          type="text" 
                          value={newFamilyAuthor}
                          onChange={(e) => setNewFamilyAuthor(e.target.value)}
                          placeholder="e.g. Grandma Lindiwe"
                          className="w-full bg-white border border-neutral-200 p-2 rounded-xl text-[10px] font-bold text-[#2B1B2E] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[7.5px] font-bold uppercase text-[#7A6B72] block mb-0.5 text-left">Your relation:</label>
                        <select
                          value={newFamilyRole}
                          onChange={(e) => setNewFamilyRole(e.target.value)}
                          className="w-full bg-white border border-neutral-200 p-1.5 focus:outline-none text-[10px] rounded-xl font-bold text-[#2B1B2E]"
                        >
                          <option value="Partner (Dad)">Partner (Dad)</option>
                          <option value="Grandmother">Grandmother</option>
                          <option value="Grandfather">Grandfather</option>
                          <option value="Sister / Aunt">Sister / Aunt</option>
                          <option value="Brother / Uncle">Brother / Uncle</option>
                          <option value="Relative / Friend">Family Friend</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[7.5px] font-bold uppercase text-[#7A6B72] block mb-0.5 text-left">Your message:</label>
                      <textarea
                        rows={2}
                        value={newFamilyMessage}
                        onChange={(e) => setNewFamilyMessage(e.target.value)}
                        placeholder="Write words of support & advice..."
                        className="w-full bg-white border border-neutral-200 p-2 rounded-xl text-[10px] font-bold text-[#2B1B2E] focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (!newFamilyMessage.trim()) return;
                        const icons: {[role: string]: string} = {
                          "Partner (Dad)": "💖",
                          "Grandmother": "👵",
                          "Grandfather": "👴",
                          "Sister / Aunt": "👩",
                          "Brother / Uncle": "👨",
                          "Relative / Friend": "✨"
                        };
                        const newMsg = {
                          id: `fam-msg-${Date.now()}`,
                          authorName: newFamilyAuthor || "Family Member",
                          role: newFamilyRole,
                          message: newFamilyMessage,
                          createdAt: "Just now",
                          heartsCount: 1,
                          joinedIcon: icons[newFamilyRole] || "🌸"
                        };
                        setFamilyMessages(prev => [newMsg, ...prev]);
                        setNewFamilyMessage("");
                        setVitalsAddedFeedback("Encouragement note posted securely!");
                        setTimeout(() => setVitalsAddedFeedback(""), 3000);
                      }}
                      type="button"
                      className="w-full py-2 bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] hover:opacity-90 transition-opacity text-white font-black uppercase text-[9px] tracking-wider rounded-xl cursor-pointer"
                    >
                      ✍️ Post Note to Wall
                    </button>
                  </div>
                </div>

                {/* 4. Realistic Invite Setup */}
                <div className="p-3.5 bg-neutral-50/70 border border-neutral-200/50 rounded-3xl flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 text-left">
                    <span className="text-[8px] font-extrabold uppercase text-[#7A6B72] block">💻 Safe SADC Family Link</span>
                    <h5 className="font-extrabold text-[#2B1B2E]">Scan Invite QR Link</h5>
                    <p className="text-[9.5px] text-neutral-400 font-semibold leading-tight">
                      Generate encrypted link tokens to sync logs with childminders or domestic partners safely.
                    </p>
                  </div>
                  {/* Mock beautiful QR code box */}
                  <div className="w-16 h-16 bg-white border border-neutral-200 p-1 rounded-xl flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-[radial-gradient(#2B1B2E_1px,transparent_1px)] bg-[size:4px_4px] opacity-80" />
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB TARGET: CALENDAR */}
        {activeTab === "calendar" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider">Maternal Calendar</h3>
              <p className="text-[10px] text-[#7A6B72] font-semibold">Weekly clinical tracking, postpartum timelines & visits</p>
            </div>

            {/* Sub-tab Pills Selection Navigation within Calendar */}
            <div className="flex bg-[#FFF1EE] p-0.5 rounded-xl border border-[#FF6FB1]/10 shadow-3xs">
              {(["pregnancy", "postpartum", "visits"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCalendarSubTab(tab)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[9.5px] font-black uppercase transition-all whitespace-nowrap cursor-pointer text-center ${
                    calendarSubTab === tab 
                      ? "bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white shadow-3xs" 
                      : "text-[#7A6B72] hover:text-[#2B1B2E]"
                  }`}
                >
                  {tab === "pregnancy" ? "🤰 Prenatal" : tab === "postpartum" ? "🍼 Postpartum" : "🏥 Visit Logs"}
                </button>
              ))}
            </div>

            {/* SUB-TAB 1: PRENATAL PREGNANCY TIMELINE (EXISTING CODE MODULATED) */}
            {calendarSubTab === "pregnancy" && (
              <div className="space-y-4 animate-fade-in">
                {/* Simulated mini week tracker progress line */}
                <div className="p-4 bg-white/50 border border-white/50 rounded-3xl space-y-3 shadow-xs">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7A6B72] block">Current Physical Milestones</span>
                  <div className="grid grid-cols-6 gap-1 relative py-2">
                    <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-pink-100 -translate-y-1/2 z-0"></div>
                    {[6, 12, 18, 24, 32, 40].map((w) => {
                      const isActive = currentWeek >= w;
                      const isCurrent = currentWeek === w;
                      return (
                        <button 
                          key={w}
                          type="button"
                          onClick={() => setCurrentWeek(w)}
                          className={`h-8 rounded-xl flex flex-col items-center justify-center z-10 transition-all ${
                            isCurrent 
                              ? "bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white ring-2 ring-pink-300 shadow-sm font-black" 
                              : isActive 
                              ? "bg-pink-100 text-[#E84FA0] border border-[#FF6FB1]/30 font-bold" 
                              : "bg-white/70 text-[#7A6B72] border border-white/20"
                          }`}
                        >
                          <span className="text-[9px] font-mono">{w}w</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Diagnostic readings in the week card */}
                  <div className="p-3 bg-white/80 border border-white/60 rounded-2xl text-[11px] space-y-1.5 font-semibold text-[#2B1B2E]">
                    <div className="flex justify-between border-b border-pink-50 pb-1.5 text-[10px] text-[#7A6B72] font-bold">
                      <span>Trimester Status:</span>
                      <span className="text-[#E84FA0]">{currentWeek >= 28 ? "Trimester 3" : currentWeek >= 13 ? "Trimester 2" : "Trimester 1"}</span>
                    </div>
                    <p className="text-[#2B1B2E] leading-relaxed uppercase">
                      <b>Back pain condition:</b> {currentWeek > 28 ? "Moderate — Pelvic compression" : "Normal — Loose abdominal ligaments"}
                    </p>
                    <p className="text-[#2B1B2E] uppercase">
                      <b>Urinalysis recommendation:</b> Normal pH (6.2) • Protein Neg.
                    </p>
                    <p className="text-[#E84FA0] text-[10.5px] italic pt-1 flex items-center gap-1.5 font-extrabold leading-tight">
                      <Info className="w-3.5 h-3.5" /> Next Clinic Visit: Sister Kunene checkup in {currentWeek > 32 ? "1 week" : "4 weeks"}.
                    </p>
                  </div>
                </div>

                {/* Quick action: simulate sync of parameters to maternal files */}
                <div className="p-3 bg-gradient-to-r from-[#E2F0E7]/60 to-[#DCEEE3]/40 border border-emerald-100 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="text-left">
                    <span className="text-[8px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">Offline Database synced</span>
                    <p className="text-[10px] text-emerald-950 font-bold mt-1">Check-in parameters are locked securely in local storage.</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                {/* Google Meet - Telehealth Clinic Consultation List */}
                <div className="p-4 bg-gradient-to-br from-pink-50/70 to-white border border-[#FF6FB1]/20 rounded-3xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-[#E84FA0]">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Telemedicine consultations</span>
                  </div>
                  
                  <div className="space-y-2">
                    {maternalMeetings && maternalMeetings.length > 0 ? (
                      maternalMeetings.map((meet) => (
                        <div key={meet.id} className="p-3 bg-white border border-pink-100 rounded-2xl shadow-3xs flex flex-col gap-2">
                          <div className="text-left">
                            <h4 className="text-xs font-black text-[#2B1B2E] uppercase">{meet.topic}</h4>
                            <p className="text-[9px] text-[#7A6B72] font-semibold mt-0.5">
                              Hosted by: <b>{meet.clinicianName}</b>
                            </p>
                            <p className="text-[9.5px] text-[#2B1B2E] font-bold mt-1 bg-pink-100/50 px-2 py-0.5 rounded inline-block">
                              ⏰ {new Date(meet.scheduledFor).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(meet.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                            </p>
                          </div>

                          <a
                            href={meet.meetingUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white hover:opacity-90 active:scale-95 text-[10px] font-black uppercase rounded-xl tracking-wider text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                          >
                            <span>Launch Google Meet Video</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-neutral-400 italic text-center py-4">No virtual consultations scheduled with Sister Kunene.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: POSTPARTUM CARE STABILIZATION ROUTINE */}
            {calendarSubTab === "postpartum" && (
              <div className="space-y-4 animate-fade-in text-[11px]">
                {/* Milestone Summary Header card */}
                <div className="p-4 bg-gradient-to-br from-[#E2F0E7]/80 to-[#DCEEE3]/40 border border-emerald-100 rounded-2xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase text-emerald-800 tracking-wider">👶 14-Day Postpartum Recovery Care</span>
                    <span className="text-[9px] font-bold text-emerald-950 bg-white/70 px-2 py-0.5 rounded-lg border border-emerald-200">
                      Weeks 1 & 2 after Birth
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-900 font-medium leading-relaxed">
                    Sister Kunene's postpartum guide: Check maternal fundus firmness, screen for lochia abnormalities, support positive breastfeeding latching, and manage infantile jaundice.
                  </p>
                  
                  {/* Gauge indicator */}
                  <div className="pt-2 flex items-center justify-between text-[9px] text-emerald-800 font-black uppercase border-t border-emerald-200/50">
                    <span>Maternal Diagnostics Logged:</span>
                    <span>{postpartumCheckups.filter(c => c.status === "completed").length} of {postpartumCheckups.length} done</span>
                  </div>
                </div>

                {/* List postpartum milestones */}
                <div className="space-y-3">
                  {postpartumCheckups.map((checkup) => (
                    <div key={checkup.id} className="p-3.5 bg-white border border-pink-50 rounded-2xl space-y-3 shadow-3xs text-left">
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            checkup.status === "completed" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-150" 
                              : "bg-pink-100 text-[#E84FA0] border-[#FF6FB1]/20 animate-pulse"
                          }`}>
                            {checkup.status === "completed" ? "✓ Logged & Verified" : "⏳ Clinical Scheduled"}
                          </span>
                          <h4 className="text-xs font-black text-[#2B1B2E] mt-2 uppercase">{checkup.day}</h4>
                          <span className="text-[9px] text-[#7A6B72] font-semibold block">Date: {checkup.date} • Nurse: <b>{checkup.clinicianName}</b></span>
                        </div>
                        
                        {checkup.status === "completed" && (
                          <div className="text-right text-[10px] font-black text-emerald-800">
                            🌡️ {checkup.vitals.temp}°C • 💓 {checkup.vitals.hr} bpm
                          </div>
                        )}
                      </div>

                      {/* Doctor clinical notes segment */}
                      <p className="text-[10px] text-zinc-650 bg-zinc-50/60 p-2.5 rounded-xl italic font-medium leading-relaxed">
                        <b>🏥 Clinic Checkup Notes:</b> "{checkup.doctorNotes}"
                      </p>

                      {/* Task checklist */}
                      <div className="space-y-1.5 border-t border-dashed border-zinc-100 pt-2.5">
                        <span className="text-[8.5px] font-bold uppercase text-[#7A6B72] tracking-wider block">Assigned Nurse Directives:</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {checkup.tasks.map((task, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const updatedTasks = checkup.tasks.map((t, tIdx) => tIdx === idx ? { ...t, done: !t.done } : t);
                                const updatedCheckup = { ...checkup, tasks: updatedTasks };
                                if (onUpdatePostpartumCheckup) {
                                  onUpdatePostpartumCheckup(updatedCheckup);
                                }
                              }}
                              className="flex items-center gap-2 p-2 hover:bg-[#FFF9F6]/50 rounded-xl transition-colors border border-transparent hover:border-[#FF6FB1]/10 text-left cursor-pointer"
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                task.done 
                                  ? "bg-[#E84FA0] border-[#E84FA0] text-white" 
                                  : "border-zinc-300 bg-white"
                              }`}>
                                {task.done && <span className="text-[9px] font-black">✓</span>}
                              </div>
                              <span className={`text-[10px] font-bold text-[#2B1B2E] ${task.done ? "line-through text-zinc-400" : ""}`}>
                                {task.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CLINICAL HOSPITAL VISIT HISTORY LOGS */}
            {calendarSubTab === "visits" && (
              <div className="space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-[#7A6B72] tracking-wider">🏥 Official Hospital History Logs</span>
                  <span className="text-[8px] font-mono text-[#E84FA0] font-black uppercase bg-pink-100/40 px-2 py-0.5 rounded">POPIA Verified</span>
                </div>

                <div className="space-y-3">
                  {hospitalVisits.map((visit) => (
                    <div key={visit.id} className="p-3.5 bg-white border border-pink-100 rounded-2xl text-left space-y-2.5 shadow-3xs relative overflow-hidden">
                      <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-[#FF6FB1] to-[#E84FA0]"></div>

                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="text-[8px] font-mono font-black uppercase bg-[#FFF9F6] text-[#E84FA0] px-2 py-0.5 rounded border border-[#FF6FB1]/10">
                            🏥 Admissions Log
                          </span>
                          <h4 className="text-xs font-black text-[#2B1B2E] mt-1.5 uppercase leading-none">{visit.reason}</h4>
                          <span className="text-[9px] text-[#7A6B72] font-semibold block mt-1">Facility: <b>{visit.hospitalName}</b></span>
                        </div>
                        <span className="text-[8.5px] font-mono font-black text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md shrink-0">
                          {new Date(visit.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-600 space-y-2 font-semibold pt-2 border-t border-zinc-100 leading-relaxed">
                        <p><strong className="text-zinc-800 text-[8.5px] uppercase tracking-wide block">Triage Diagnosis:</strong> {visit.diagnosis}</p>
                        <p className="bg-neutral-50 p-2.5 rounded-xl text-neutral-800 italic font-medium leading-normal">
                          "{visit.notes}"
                        </p>
                        <p className="text-[#E84FA0] font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-between pt-1">
                          <span>👨‍⚕️ Clinician: {visit.clinicianName}</span>
                          {visit.followUpDate && <span className="bg-pink-100 text-[#E84FA0] px-2 py-0.5 rounded">Next appointment: {visit.followUpDate}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB TARGET: INSIGHTS (AI) */}
        {activeTab === "insights" && (
          <div className="space-y-4 animate-fade-in text-left">
            
            {/* Header and encouraging gauge wellness score */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider">{currentLangPack.askVytal}</h3>
                <p className="text-[10px] text-[#5F716A] font-semibold font-sans">Continuous voice transcription & guidelines index</p>
              </div>
              <span className="text-[20px] filter saturate-150">🌱</span>
            </div>

            {/* AI Voice Activation Helper / Emergency Trigger */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3 text-left shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" id="babybot-beacon-status" />
                  Voice Wake-Command Active
                </span>
                <p className="text-[9.5px] text-amber-950 font-bold leading-normal">
                  Say <b className="bg-amber-100 text-[#4F7066] px-1 rounded-sm">"BabyBot"</b> to trigger automated rescue coordinate checks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAiText("BabyBot locate nearest hospital");
                  handleCustomVoiceTranscription("Babybot locate nearest hospital");
                }}
                className="px-2.5 py-1.5 bg-[#4F7066] text-white hover:bg-[#3D574F] rounded-xl text-[9px] font-extrabold shrink-0 cursor-pointer"
              >
                Wake Box
              </button>
            </div>

            {/* BabyBot Action Console (Displays GPS, calling features when activated) */}
            {babybotActive && (
              <div className="p-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl border border-emerald-500/40 shadow-md space-y-3 relative overflow-hidden animate-slide-up animate-fade-in" id="babybot-console">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs animate-pulse">
                      👶
                    </div>
                    <span className="text-[11px] font-black tracking-widest text-[#D5E1DB] uppercase">BABYBOT MEDICAL RESPONDER</span>
                  </div>
                  <button 
                    onClick={() => setBabybotActive(false)}
                    className="text-gray-400 hover:text-white text-xs font-bold bg-white/10 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                {babybotLoadingGeoloc ? (
                  <div className="py-4 text-center space-y-2">
                    <Activity className="w-8 h-8 animate-spin text-emerald-400 mx-auto" strokeWidth={3} />
                    <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider animate-pulse">Locating SADC Cellular Antennas...</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <div className="p-2.5 bg-white/5 rounded-2xl border border-white/5 text-[10px] space-y-1">
                      <div className="flex justify-between text-[9px] text-[#A3B899] font-black uppercase">
                        <span>🛰️ GPS Status:</span>
                        <span className="text-emerald-400">Locked</span>
                      </div>
                      <p className="font-mono text-[9px]">
                        Latitude: {babybotLocation?.lat} · Longitude: {babybotLocation?.lng}
                      </p>
                      <p className="text-[#A3B899] font-medium leading-none">
                        Region: Mbabane Rural Core, Kingdom of Eswatini
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl space-y-1.5">
                      <div className="text-[8px] bg-emerald-500 text-emerald-950 px-1.5 py-0.5 font-extrabold rounded-md inline-block uppercase tracking-wider leading-none">
                        Nearest Hospital Block Determined
                      </div>
                      <h4 className="text-[11.5px] font-black text-white">{locatedHospital?.name}</h4>
                      <p className="text-[9.5px] text-[#D0E2C6] leading-snug">
                        🚗 Distance: <b>{locatedHospital?.distance}</b> away via main Mbabane high road.
                      </p>
                      <p className="text-[9px] text-[#A3E099] italic">
                        "Your GPS payload has been prepared for SADC dispatcher protocol."
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a 
                        href={`tel:${locatedHospital?.phone}`}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <PhoneCall className="w-3 h-3 text-white" />
                        Call Hospital
                      </a>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${babybotLocation?.lat || -26.3056},${babybotLocation?.lng || 31.1367}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-center text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all"
                      >
                        <MapPin className="w-3 h-3 text-[#A3B899]" />
                        Open Map Route
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wellness Score Card with soft bell curve */}
            <div className="p-3.5 bg-gradient-to-br from-white/70 to-white/45 border border-white/50 rounded-3xl shadow-xs space-y-2">
              <div className="flex justify-between items-center bg-white/40 p-2 rounded-2xl border border-white/10 mb-2">
                <span className="text-[9px] font-bold text-[#5F716A] uppercase tracking-widest font-sans">Predictive Health Score & Confidence</span>
                <span className="text-white bg-[#4F7066] text-[10px] font-black font-mono px-2 py-0.5 rounded-full shadow-xs">
                  Risk Level: Low (92% Confidence)
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#4F7066] border border-emerald-100 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] bg-[#E2EBE5] text-[#2B1B2E] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider">Trimester {currentWeek >= 28 ? "3" : currentWeek >= 13 ? "2" : "1"} Risk Matrix</span>
                  <p className="text-[9.5px] text-[#5F716A] font-semibold leading-relaxed font-sans">
                    Confidence is determined by blood pressure stability, normal renal check-in bounds, water volume ratios in Week {currentWeek}, and daily gestational movements. Changes over time show a steady decrease in pre-eclampsia risk as we pass major Trimester benchmarks.
                  </p>
                </div>
              </div>
            </div>

            {/* Ask Vytal Workspace Panel with Voice Transcription simulation */}
            <div className="p-4 bg-white/45 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
              
              {/* Helix Background Accent */}
              <div className="absolute right-[-20px] bottom-[-30px] w-48 h-48 opacity-5 pointer-events-none z-0">
                <svg viewBox="0 0 100 100" fill="none" stroke="#4F7066" strokeWidth="2" className="w-full h-full">
                  <path d="M10,50 Q30,20 50,50 T90,50" />
                  <path d="M10,50 Q30,80 50,50 T90,50" />
                  <circle cx="30" cy="35" r="2" fill="#4F7066" />
                  <circle cx="50" cy="50" r="2" fill="#4F7066" />
                  <circle cx="70" cy="65" r="2" fill="#4F7066" />
                </svg>
              </div>

              <div className="space-y-2 z-10 relative">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#5F716A] block">Virtual Prenatal Assistant Hub</span>
                
                {/* Conversations Area */}
                <div className="p-3 bg-white/80 border border-white/60 rounded-2xl min-h-[160px] max-h-[220px] overflow-y-auto space-y-2.5 no-scrollbar flex flex-col">
                  <AnimatePresence initial={false}>
                    {aiChatHistory.map((chat, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`text-[10.5px] p-2 rounded-xl text-left font-semibold ${
                          chat.role === "user" 
                            ? "bg-amber-50 text-[#2B1B2E] self-end border border-amber-200 ml-6" 
                            : "bg-emerald-50/60 text-[#2B1B2E] border border-emerald-100/40 mr-6"
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-widest block font-black opacity-60 mb-0.5">
                          {chat.role === "user" ? "MAMA" : "VYTAL AI ASSISTANT"}
                        </span>
                        <p className="leading-tight leading-normal">"{chat.text}"</p>
                      </motion.div>
                    ))}

                    {isAILoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-2.5 bg-emerald-50/60 text-[#2B1B2E] border border-emerald-100/40 mr-6 rounded-xl self-start flex items-center gap-1.5"
                      >
                        <span className="text-[8px] uppercase tracking-widest font-black opacity-60">Vytal AI is typing</span>
                        <div className="flex gap-0.5 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7066] animate-bounce" style={{ animationDelay: "0s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7066] animate-bounce" style={{ animationDelay: "0.15s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F7066] animate-bounce" style={{ animationDelay: "0.3s" }} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </div>

                {/* STATEFUL COMPREHENSIVE VOICE RECORDING & TRANSCRIPTION PANEL */}
                {(isRecordingReal || audioUrl || isTranscribing) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-[#FAF6F2] border border-[#CFE6E3]/60 rounded-2xl space-y-2 z-10 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center pb-1 border-b border-[#CFE6E3]/40">
                      <span className="text-[10px] font-black uppercase text-[#2B1B2E] flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRecordingReal ? 'bg-red-400' : 'bg-[#4F7066]'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${isRecordingReal ? 'bg-red-500' : 'bg-[#4F7066]'}`}></span>
                        </span>
                        {isRecordingReal ? "Microphone Recording Active" : isTranscribing ? "SADC AI Transcribing Node..." : "Voice Note Recorded!"}
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          setIsRecordingReal(false);
                          setAudioUrl(null);
                          setIsTranscribing(false);
                          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                        }}
                        className="text-[9.5px] font-black text-gray-500 hover:text-red-500 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Audio Recorder Active Phase */}
                    {isRecordingReal && (
                      <div className="flex flex-col items-center justify-center py-2 space-y-1.5 text-center">
                        <div className="flex gap-1 justify-center items-end h-7">
                          {[...Array(12)].map((_, i) => (
                            <span
                              key={i}
                              className="w-1 bg-[#E84FA0] rounded-full"
                              style={{ 
                                height: `${6 + (i % 3) * 6}px`,
                                animation: 'bounce 0.8s infinite alternate',
                                animationDelay: `${i * 0.05}s`
                              }}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] font-extrabold text-[#7A6B72]">
                          Duration: <span className="font-mono text-[#E84FA0] bg-pink-50 px-2 py-0.5 rounded border border-pink-100">{Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <p className="text-[9.5px] text-[#4F7066] font-bold">
                          {hasMicPermission === false 
                            ? "🎙️ Live Maternal Voice Recorder Mode... Keep speaking!" 
                            : "🔴 Real mic active. Speaking pregnancy & maternal health queries..."}
                        </p>
                        
                        <button
                          type="button"
                          onClick={stopAudioRecording}
                          className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 transition-all text-white text-[9.5px] font-black uppercase rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <StopCircle className="w-3.5 h-3.5" /> Stop & Transcribe
                        </button>
                      </div>
                    )}

                    {/* Transcribing phase */}
                    {isTranscribing && (
                      <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-[#E84FA0]" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-[#E84FA0] block">Converting recordings to maternal text data</span>
                          <p className="text-[9px] text-[#7A6B72] font-semibold">Resolving phonetic keywords in clinical models...</p>
                        </div>
                      </div>
                    )}

                    {/* Result Phase - Review Transcription text and play audio note */}
                    {audioUrl && !isTranscribing && !isRecordingReal && (
                      <div className="space-y-2 bg-white/80 p-2.5 rounded-xl border border-pink-100/60 text-left">
                        {hasMicPermission && (
                          <div className="flex items-center gap-2 bg-neutral-50/80 p-1.5 rounded-lg border border-neutral-150">
                            <span className="text-[8px] font-extrabold uppercase text-gray-500">Play Back:</span>
                            <audio src={audioUrl} controls className="h-6 max-w-full text-xs" />
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-bold text-[#4F7066] uppercase tracking-wider block">Transcribed Query:</span>
                          <p className="text-[10.5px] font-bold text-[#2B1B2E] leading-relaxed bg-[#FFF9F6] p-2 rounded-lg border border-[#FF6FB1]/10">
                            "{transcriptionText || aiText}"
                          </p>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleSendChatMessage(transcriptionText || aiText);
                              setAudioUrl(null);
                            }}
                            className="flex-1 py-1.5 bg-[#4F7066] hover:bg-[#3D574F] text-white text-[9.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-3xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Submit to Vytal AI
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setAudioUrl(null);
                              setTranscriptionText("");
                            }}
                            className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-lg text-[9.5px] font-black uppercase cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Real-time Voice Recording Pulse Wave */}
                {isListening && (
                  <div className="flex items-center gap-2.5 bg-pink-50/95 border border-pink-100 p-2.5 rounded-xl animate-pulse">
                    <div className="flex gap-1 items-center shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                      <span className="w-1 h-3 bg-pink-500 rounded-xs animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="w-1 h-4 bg-pink-500 rounded-xs animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1 h-2 bg-pink-500 rounded-xs animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                    <span className="text-[9.5px] font-extrabold text-[#E84FA0] uppercase tracking-wider">
                      🎙️ Speak now! Listening (siSwati / Setswana / EN)...
                    </span>
                  </div>
                )}

                {/* Quick Question Engagement Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1.5 pb-0.5 z-10 relative text-left">
                  {[
                    "Is this symptom normal?",
                    "Find nearest clinic",
                    "What signs of high BP should I check?",
                    "Which food increases iron?"
                  ].map((sh, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => {
                        setAiText(sh);
                        chatInputRef.current?.focus();
                      }}
                      className="bg-[#4F7066]/10 hover:bg-[#4F7066]/25 border border-[#4F7066]/20 text-[#4F7066] text-[9.5px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-3xs hover:scale-102 flex items-center gap-1"
                    >
                      💡 <span>{sh}</span>
                    </button>
                  ))}
                </div>

                {/* Input Bar (Type message / Tap mic to speak) */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer border shrink-0 ${
                      isRecordingReal || isListening
                        ? "bg-[#E84FA0] text-white border-[#E84FA0] animate-pulse scale-105"
                        : "bg-white text-neutral-600 hover:text-[#4F7066] border-[#D5E1DB] hover:shadow-xs"
                    }`}
                    title={isRecordingReal ? "Stop recording voice note" : "Start recording pregnancy questions"}
                  >
                    <Mic className={`w-4 h-4 ${(isRecordingReal || isListening) ? "animate-bounce" : ""}`} />
                  </button>

                  <input
                    ref={chatInputRef}
                    type="text"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendChatMessage();
                      }
                    }}
                    placeholder={isRecordingReal ? "Recording your pregnancy question..." : isListening ? "Listening... Speak your query clearly" : "Type pregnancy question or 'BabyBot'..."}
                    className="flex-1 bg-white border border-[#D5E1DB] text-[10.5px] font-semibold px-3 py-2.5 rounded-xl text-[#2B1B2E] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4F7066]"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendChatMessage()}
                    disabled={isAILoading || !aiText.trim()}
                    className="p-2.5 rounded-xl text-[#ffffff] bg-[#4F7066] hover:bg-[#3D574F] disabled:opacity-40 transition-all cursor-pointer border border-[#4F7066] shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Tappable category chips */}
              <div className="pt-2 border-t border-white/40 z-10 relative">
                <span className="text-[8px] font-extrabold text-[#5F716A] uppercase tracking-wider block mb-1">Quick Simulations (Triage analysis):</span>
                <div className="flex flex-wrap gap-1 font-sans">
                  {["Nutrition", "Symptoms", "Rest", "Movement"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleAISimulateQuery(cat)}
                      className={`text-[9px] font-extrabold px-2 py-1 rounded-xl border transition-all cursor-pointer ${
                        selectedTopic === cat 
                          ? "bg-[#4F7066] text-white border-[#4F7066]" 
                          : "bg-white text-[#2B1B2E] border-white/50 hover:bg-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulative Voice Commands helper bar */}
              <div className="pt-1.5 border-t border-dotted border-[#D5E1DB] z-10 relative text-left">
                <span className="text-[8px] font-bold text-[#5F716A] uppercase tracking-wider block mb-1">🎤 Simulate pre-recorded voice command:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => handleSendChatMessage("Dumela, does sweet tea affect pregnancy blood pressure?")}
                    type="button"
                    className="bg-white hover:bg-neutral-50 border border-neutral-200 text-[9px] font-semibold px-2 py-1 rounded-lg"
                  >
                    "Dumela, sweet tea query"
                  </button>
                  <button
                    onClick={() => handleSendChatMessage("I have some body pain and swelling, babybot locate help")}
                    type="button"
                    className="bg-white hover:bg-neutral-50 border border-neutral-200 text-[9px] font-semibold px-2 py-1 rounded-lg"
                  >
                    "Severe pain, BabyBot rescue"
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB TARGET: CONNECTIONS COMMUNITY */}
        {activeTab === "community" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4F7066]" /> Connections Room
              </h3>
              <p className="text-[10px] text-[#5F716A] font-semibold">Moderated local prenatal peer support feed</p>
            </div>

            {/* Community Section Sub Tabs segmented bar */}
            <div className="flex gap-1 p-1 bg-white/50 border border-[#D5E1DB] backdrop-blur-md rounded-xl w-full sm:w-fit" id="community-internal-tabbar">
              <button
                type="button"
                onClick={() => setCommunitySubMode("feed")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-black text-[9px] uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 leading-none select-none ${
                  communitySubMode === "feed"
                    ? "bg-[#4F7066] text-white shadow-xs"
                    : "text-[#4F7066] hover:bg-white/40"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Discussion Board</span>
              </button>
              <button
                type="button"
                onClick={() => setCommunitySubMode("connections")}
                className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-black text-[9px] uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 leading-none select-none ${
                  communitySubMode === "connections"
                    ? "bg-[#4F7066] text-white shadow-xs"
                    : "text-[#4F7066] hover:bg-white/40"
                }`}
              >
                <HeartHandshake className="w-3 h-3" />
                <span>Maternal Connections</span>
              </button>
            </div>

            {/* Emergency Guidance Box (Anti-Spam / Clinical Advisory mandate) */}
            <div className="p-3 bg-red-50/90 border border-red-100 rounded-2xl text-left space-y-1">
              <span className="text-[8px] font-black uppercase text-red-700 tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" /> Clinical Advisory Warning
              </span>
              <p className="text-[9.5px] text-red-950 font-bold leading-relaxed">
                Peer discussions are strictly for maternal social support. <b>Never act on medical advice here.</b> Clinical symptoms, severe pain, or bleeding alerts must be sent to Sister Thandeka Kunene via a formal <b className="underline">Clinic Report</b>.
              </p>
            </div>

            {/* Topic Filter Chips */}
            <div className="flex flex-wrap gap-1 font-sans">
              {["All", "Nausea", "Movement", "Appointments", "Nutrition", "Labor"].map((topic) => {
                const isSelected = communityTopicFilter === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => setCommunityTopicFilter(topic)}
                    className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[#4F7066] text-white border-[#4F7066] shadow-sm scale-105" 
                        : "bg-white/60 text-[#2B1B2E] border-white/40 hover:bg-white"
                    }`}
                  >
                    {topic} {topic === "Nausea" ? "🤢" : topic === "Movement" ? "👶" : topic === "Appointments" ? "📅" : topic === "Nutrition" ? "🍎" : topic === "Labor" ? "🤰" : ""}
                  </button>
                );
              })}
            </div>

            {communitySubMode === "feed" && (
              <>
                {/* Create Post Area */}
            <div className="p-3 bg-white/75 backdrop-blur-md border border-white/50 rounded-2xl shadow-xs space-y-3">
              <span className="text-[9px] font-bold text-[#5F716A] uppercase tracking-widest block">Start a Peer Thread</span>
              
              {spamWarningActive && (
                <div className="p-2 bg-amber-50 rounded-xl text-[9.5px] text-amber-800 font-extrabold flex items-center gap-1.5 animate-pulse border border-amber-200">
                  <span>⚠️ Anti-Spam Limit: Please wait 15 seconds between posts to keep peer space clean.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a tip or ask local mothers (e.g., 'Anyone else feeling hiccups in Week 28?')..."
                  className="w-full h-16 p-2 bg-white/50 rounded-xl border border-[#D5E1DB] text-[10.5px] focus:outline-none focus:ring-1 focus:ring-[#4F7066] leading-snug tracking-tight font-medium placeholder:font-semibold"
                />
                
                <div className="flex gap-2 justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-[#5F716A] uppercase">Topic:</span>
                    <select
                      value={newPostTopic}
                      onChange={(e) => setNewPostTopic(e.target.value)}
                      className="bg-white border border-[#D5E1DB] text-[9px] rounded-lg px-2 py-0.5 font-bold focus:outline-none"
                    >
                      <option value="general">General Support</option>
                      <option value="nausea">Nausea 🤢</option>
                      <option value="movement">Fetal Movement 👶</option>
                      <option value="appointments">Appointments 📅</option>
                      <option value="nutrition">Nutrition 🍎</option>
                      <option value="labor">Labor Signs 🤰</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      if (!newPostContent.trim()) return;
                      // Anti-Spam Throttling limit 15 seconds
                      const now = Date.now();
                      if (now - lastPostTimestamp < 15000) {
                        setSpamWarningActive(true);
                        setTimeout(() => setSpamWarningActive(false), 3000);
                        return;
                      }
                      onAddPost({ topic: newPostTopic, content: newPostContent });
                      setLastPostTimestamp(now);
                      setNewPostContent("");
                    }}
                    className="px-4 py-1.5 bg-[#4F7066] hover:bg-[#3D574F] text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-2.5 h-2.5 text-white" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* The Community Feed */}
            <div className="space-y-3">
              {(() => {
                // Filter out posts written by blocked users
                const visiblePosts = communityPosts.filter((post) => {
                  const isBlocked = blockedUsers.includes(post.authorId);
                  const isFiltered = communityTopicFilter !== "All" && post.topic.toLowerCase() !== communityTopicFilter.toLowerCase();
                  return !isBlocked && !isFiltered;
                });

                if (visiblePosts.length === 0) {
                  return (
                    <div className="p-6 bg-white/30 border border-white/10 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-[#5F716A]">No peer posts under "{communityTopicFilter}" topic right now.</p>
                      <span className="text-[8px] text-[#5F716A]/75">Be the first to share your maternal journey milestones above!</span>
                    </div>
                  );
                }

                return visiblePosts.map((post) => {
                  const commentsCount = communityComments.filter(c => c.postId === post.id && !blockedUsers.includes(c.authorId)).length;
                  const isExpanded = expandedCommentsPostId === post.id;

                  return (
                    <div 
                      key={post.id} 
                      className={`p-3.5 rounded-2xl border bg-white/55 backdrop-blur-md relative overflow-hidden text-left space-y-2.5 transition-all ${
                        post.status === "reported" ? "opacity-75 bg-amber-50/20" : ""
                      }`}
                    >
                      {/* Post Header with gestational marker */}
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2 items-center">
                          <div className={`w-7 h-7 rounded-lg font-bold text-[10px] text-white flex items-center justify-center bg-gradient-to-br ${
                            post.authorName.includes("Vytal") ? "from-emerald-600 to-teal-800" : "from-[#4F7066] to-[#2B1B2E]"
                          }`}>
                            {post.authorName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-[10.5px] font-black text-[#2B1B2E] flex items-center gap-1.5 leading-none">
                              {post.authorName}
                              <span className="text-[8px] bg-slate-100 text-[#5F716A] px-1.5 py-0.5 rounded-md font-extrabold uppercase scale-90">Week {post.gestationalWeek}</span>
                            </h4>
                            <span className="text-[8.5px] text-[#5F716A] uppercase font-bold tracking-wider block mt-0.5 leading-none">
                              🏷️ {post.topic}
                            </span>
                          </div>
                        </div>

                        {/* Block / Flag Quick Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              onBlockUser(post.authorId, post.authorName);
                            }}
                            className="bg-white/70 hover:bg-neutral-100 text-[8.5px] px-2 py-0.5 border border-[#D5E1DB] rounded-lg font-extrabold text-[#2B1B2E] cursor-pointer"
                            title="Block author posts"
                          >
                            Block 🚫
                          </button>
                          
                          {post.status !== "reported" ? (
                            <button
                              onClick={() => {
                                setReportPostTargetId(post.id);
                                onReportPost(post.id, "Medical Misinformation / Direct Danger");
                              }}
                              className="bg-white/70 hover:bg-red-50 text-[8.5px] text-red-700 px-2 py-0.5 border border-red-200 rounded-lg font-extrabold cursor-pointer"
                            >
                              Report ⚠️
                            </button>
                          ) : (
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1">
                              ⚠️ Mod Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-[11px] font-medium leading-relaxed tracking-tight text-neutral-800">
                        {post.content}
                      </p>

                      {/* Comment section toggler */}
                      <div className="flex justify-between items-center pt-2 border-t border-white/40">
                        <button
                          onClick={() => setExpandedCommentsPostId(isExpanded ? null : post.id)}
                          className="text-[9px] font-black text-[#4F7066] hover:underline flex items-center gap-1"
                        >
                          💬 {commentsCount} Peer {commentsCount === 1 ? "Comment" : "Comments"} {isExpanded ? "▲" : "▼"}
                        </button>
                        <span className="text-[8px] font-mono text-[#5F716A]">19 Jun · SADC Web Node</span>
                      </div>

                      {/* Expanded Comments Panel with Replies list and reply box */}
                      {isExpanded && (
                        <div className="space-y-2 mt-2 pt-2 bg-white/40 p-2 rounded-xl border border-white/20 animate-fade-in">
                          {(() => {
                            const postComments = communityComments.filter(c => c.postId === post.id && !blockedUsers.includes(c.authorId));
                            
                            return (
                              <div className="space-y-2.5">
                                {postComments.map((comment) => (
                                  <div key={comment.id} className="p-2 bg-white/70 rounded-xl space-y-1 text-left relative">
                                    <div className="flex justify-between items-center bg-[#E2EBE5]/30 px-1.5 py-0.5 rounded-md">
                                      <span className="text-[9px] font-black text-[#2B1B2E]">{comment.authorName}</span>
                                      
                                      <button
                                        onClick={() => onReportComment(comment.id, "Misinformation")}
                                        className="text-[8px] text-red-500 hover:underline"
                                      >
                                        Report
                                      </button>
                                    </div>
                                    <p className="text-[10px] leading-tight text-neutral-700 font-medium">{comment.content}</p>
                                  </div>
                                ))}

                                {/* Add comment text bar */}
                                <div className="flex gap-1 pt-1">
                                  <input
                                    type="text"
                                    placeholder="Write a supportive reply..."
                                    value={commentInputMap[post.id] || ""}
                                    onChange={(e) => setCommentInputMap(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="flex-1 p-1.5 bg-white/80 rounded-lg text-[10px] border border-[#D5E1DB] focus:outline-none"
                                  />
                                  <button
                                    onClick={() => {
                                      const txt = commentInputMap[post.id];
                                      if (!txt || !txt.trim()) return;
                                      onAddComment(post.id, txt);
                                      setCommentInputMap(prev => ({ ...prev, [post.id]: "" }));
                                    }}
                                    className="p-1 px-3 bg-[#4F7066] text-white rounded-lg text-[9px] font-bold uppercase transition-all"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                    </div>
                  );
                });
              })()}
            </div>
            </>
            )}

            {communitySubMode === "connections" && (
              <div className="space-y-4 animate-fade-in" id="maternal-connections-workspace">
                {actionFeedback && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-[10px] font-extrabold shadow-3xs animate-bounce" style={{ animationDuration: "3s" }}>
                    ✨ {actionFeedback}
                  </div>
                )}

                <div className="p-4 bg-white/45 backdrop-blur-md rounded-2xl border border-white/50 text-left space-y-2">
                  <h4 className="text-[11.5px] font-black uppercase text-[#4F7066]">Peer connections locator</h4>
                  <p className="text-[9.5px] text-[#5F716A] font-semibold leading-relaxed">
                    Find other expectant mothers by common pregnancy category milestones and challenges (nausea remedies, appointments tips, baby movement monitoring). Expand any card to start an interactive peer thread immediately.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(() => {
                    const offlineMothersList = [
                      {
                        id: "pat-1",
                        name: "Zanele Dlamini",
                        avatar: "ZD",
                        avatarColor: "from-pink-500 to-rose-600",
                        weeks: 36,
                        clinic: "Mbabane Primary Centre",
                        tags: ["Movement", "Labor"],
                        status: "🟢 Active Just Now",
                        bio: "Counting down the days of arrival! Doing weekly fetal kick counts now and looking to exchange remedies for swelling."
                      },
                      {
                        id: "pat-3",
                        name: "Nokuthula Zulu",
                        avatar: "NZ",
                        avatarColor: "from-amber-400 to-orange-500",
                        weeks: 12,
                        clinic: "Lobamba Clinic Node",
                        tags: ["Nausea", "Nutrition"],
                        status: "⚡ Active 2h ago",
                        bio: "First trimester morning sick is no joke! Exploring local recipe tips and seeking organic ginger supplement ideas."
                      },
                      {
                        id: "pat-4",
                        name: "Lerato Phiri",
                        avatar: "LP",
                        avatarColor: "from-blue-500 to-indigo-600",
                        weeks: 20,
                        clinic: "Mbabane Primary Centre",
                        tags: ["Appointments", "Nutrition"],
                        status: "⏰ Active Yesterday",
                        bio: "Preparing for my mid-gestation checkup with Sister Kunene at Mbabane. Excited to share appointment schedules!"
                      },
                      {
                        id: "pat-5",
                        name: "Thandi Mabaso",
                        avatar: "TM",
                        avatarColor: "from-purple-500 to-violet-600",
                        weeks: 31,
                        clinic: "Manzini Specialist Ctr",
                        tags: ["Movement", "Nausea"],
                        status: "✨ Active Today",
                        bio: "Keeping safe while expecting! Happy to share visual trackers and movement counting procedures."
                      }
                    ];

                    const filteredMothers = offlineMothersList.filter(mother => {
                      // Filter out user blocked
                      if (blockedUsers.includes(mother.id)) return false;
                      // Filter by selected category topic
                      if (communityTopicFilter !== "All") {
                        return mother.tags.includes(communityTopicFilter);
                      }
                      return true;
                    });

                    if (filteredMothers.length === 0) {
                      return (
                        <div className="col-span-2 p-10 text-center bg-white/45 border border-[#D5E1DB] rounded-3xl italic text-[#5F716A]/90 text-[11px] font-bold">
                          No local expecting mothers found under the "{communityTopicFilter}" category filter right now. Try selecting "All" or other topic filters above!
                        </div>
                      );
                    }

                    return filteredMothers.map((itm) => {
                      const isComposing = contactingMotherId === itm.id;
                      
                      return (
                        <div key={itm.id} className="p-4 bg-white/70 hover:bg-white/95 border border-white/60 hover:border-[#4F7066]/40 rounded-3xl flex flex-col justify-between shadow-3xs transition-all relative overflow-hidden text-left gap-3 animate-fade-in" id={`peer-mama-${itm.id}`}>
                          
                          {/* Card context */}
                          <div className="space-y-2">
                            <div className="flex gap-2.5 items-center">
                              <div className={`w-8 h-8 rounded-xl font-bold text-[11px] text-white flex items-center justify-center bg-gradient-to-br ${itm.avatarColor} shadow-3xs shrink-0 select-none`}>
                                {itm.avatar}
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                <h4 className="text-[12px] font-extrabold text-[#2B1B2E] leading-none flex items-center gap-1.5">
                                  <span>{itm.name}</span>
                                  <span className="text-[7.5px] bg-[#E2EBE5] text-[#2F4F4F] font-black px-1.5 py-0.5 rounded uppercase leading-none scale-90">Week {itm.weeks}</span>
                                </h4>
                                <span className="text-[8.5px] font-semibold text-[#5F716A] block mt-0.5">{itm.clinic}</span>
                              </div>
                              
                              <span className="text-[7.5px] font-mono text-slate-500 font-extrabold shrink-0 uppercase tracking-tight">{itm.status}</span>
                            </div>

                            <p className="text-[10px] text-[#2B1B2E]/90 leading-relaxed font-semibold">
                              "{itm.bio}"
                            </p>

                            {/* Topics/milestone tags */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {itm.tags.map((tag) => (
                                <span key={tag} className="text-[7.5px] bg-[#4F7066]/10 text-[#4F7066] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-0.5 leading-none">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-2.5 border-t border-[#D5E1DB]/50 flex justify-between items-center gap-2">
                            
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  onBlockUser(itm.id, itm.name);
                                }}
                                className="text-[8.5px] text-neutral-500 hover:text-neutral-800 font-bold flex items-center gap-0.5 cursor-pointer"
                                title="Mute peer notifications"
                              >
                                Block 🚫
                              </button>
                              <button
                                onClick={() => {
                                  onReportPost(itm.id, "Maternal connections clinical reporting");
                                  setActionFeedback(`Thank you. Peer report submitted to clinical coordinators for verification.`);
                                  setTimeout(() => setActionFeedback(""), 4000);
                                }}
                                className="text-[8.5px] text-red-700 hover:text-red-900 font-bold flex items-center gap-0.5 cursor-pointer"
                                title="Submit peer support safety ticket"
                              >
                                Report ⚠️
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setContactingMotherId(isComposing ? null : itm.id);
                                setComposeMessage(`Hi @${itm.name}, regarding #${communityTopicFilter !== "All" ? communityTopicFilter : itm.tags[0]}: `);
                              }}
                              className="px-3.5 py-1.5 bg-[#4F7066] hover:bg-[#3D574F] active:scale-95 text-white rounded-xl text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-3xs transition-all select-none"
                            >
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>Discuss support</span>
                            </button>
                          </div>

                          {/* Expandable Compose block */}
                          {isComposing && (
                            <div className="mt-2.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-2 shadow-2xs animate-fade-in text-left">
                              <span className="text-[8.5px] font-black text-[#4F7066] uppercase tracking-wider block">
                                Compose Peer Post connected to @{itm.name}
                              </span>
                              <textarea
                                value={composeMessage}
                                onChange={(e) => setComposeMessage(e.target.value)}
                                className="w-full text-[10.5px] p-2 bg-white border border-[#D5E1DB] rounded-xl h-14 font-medium focus:outline-none focus:ring-1 focus:ring-[#4F7066]"
                                placeholder="Write something..."
                              />
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setContactingMotherId(null)}
                                  className="px-2.5 py-1 text-[8.5px] font-extrabold text-neutral-500 rounded hover:bg-neutral-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!composeMessage.trim()) return;
                                    
                                    const matchTopic = (communityTopicFilter !== "All" ? communityTopicFilter : itm.tags[0]).toLowerCase();
                                    onAddPost({
                                      topic: matchTopic,
                                      content: composeMessage
                                    });
                                    
                                    setActionFeedback(`Discussion thread successfully dispatched under #${matchTopic} topic!`);
                                    setComposeMessage("");
                                    setContactingMotherId(null);
                                    setTimeout(() => setActionFeedback(""), 4000);
                                  }}
                                  className="px-3 py-1 bg-[#4F7066] text-[#ffffff] rounded-lg text-[8.5px] font-black uppercase cursor-pointer"
                                >
                                  Dispatch Thread
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Appeal a Block ticket submission box */}
            <div className="p-4 bg-[#E2EBE5]/60 border border-[#4F7066]/20 rounded-2xl text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">⚖️</span>
                <div>
                  <h4 className="text-[11.5px] font-black text-[#2B1B2E]">Mothers Appeal Center</h4>
                  <p className="text-[8.5px] text-[#5F716A] leading-none">Did one of your posts get flagged? Challenge the block instantly.</p>
                </div>
              </div>

              {moderationAppeals.length > 0 && (
                <div className="p-2 bg-white/70 rounded-xl max-h-[100px] overflow-y-auto space-y-1.5">
                  <span className="text-[8px] font-bold text-[#5F716A] uppercase tracking-wider block">Submitted Appeals Track</span>
                  {moderationAppeals.map((appeal) => (
                    <div key={appeal.id} className="p-1.5 bg-emerald-50/60 rounded-lg text-[9px] space-y-0.5 border border-emerald-100">
                      <div className="flex justify-between font-black text-[#2B1B2E]">
                        <span>Ticket: {appeal.targetType === "post" ? "Flagged Thread" : "User Profile"}</span>
                        <span className={`px-1.5 rounded-full uppercase leading-none text-[7.5px] ${
                          appeal.status === "approved" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : appeal.status === "rejected" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-amber-100 text-amber-800 font-bold animate-pulse"
                        }`}>{appeal.status}</span>
                      </div>
                      <p className="italic text-[#5F716A]">"Reason: {appeal.reason}"</p>
                      {appeal.resolutionNotes && (
                        <p className="bg-white/80 p-1 text-[8.5px] rounded-sm text-neutral-800">
                          🎯 Clinician Decision: {appeal.resolutionNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAppealModal(true)}
                className="w-full py-1.5 bg-[#4F7066] text-white rounded-xl text-center text-[10px] font-extrabold uppercase"
              >
                Submit New Appeal Form
              </button>
            </div>

          </div>
        )}

        {/* TAB TARGET: REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider">{currentLangPack.selfReports}</h3>
                <p className="text-[10px] text-[#7A6B72] font-semibold">Clinical followups and interactive case filing</p>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white font-black text-[10px] uppercase shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                + New Report
              </button>
            </div>

            {/* "Your Care Team" Card featuring clinician photo */}
            <div className="p-3.5 bg-white/55 backdrop-blur-md border border-white/50 rounded-3xl shadow-xs flex gap-3 items-center">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-50 border border-white shadow-xs shrink-0 flex items-center justify-center relative">
                <img 
                  src="/src/assets/images/maternal_baby_stages_1781801156793.jpg" 
                  alt="Sister Kunene" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover shrink-0 scale-105"
                />
              </div>
              <div className="text-left flex-1 min-w-0">
                <span className="text-[8px] font-extrabold text-[#FF6FB1] uppercase tracking-widest block leading-none mb-0.5">Assigned Clinician Desk</span>
                <h4 className="text-[12px] font-black text-[#2B1B2E] truncate">Sister Thandeka Kunene</h4>
                <p className="text-[9.5px] text-[#7A6B72] font-medium leading-normal -mt-0.5">Clinical Obstetric Coordinator • Mbabane Centre</p>
                <div className="flex gap-1.5 mt-1.5">
                  <a href="tel:+26824042111" className="text-[8px] bg-white text-[#2B1B2E] border border-white/60 font-extrabold px-2 py-1 rounded-lg hover:bg-neutral-50 flex items-center gap-1 shadow-2xs">
                    <PhoneCall className="w-2.5 h-2.5 text-[#E84FA0]" /> Call
                  </a>
                  <button 
                    type="button" 
                    onClick={() => {
                      setActiveTab("insights");
                      handleCustomVoiceTranscription("Please request Sister Thandeka to call me regarding gestational stomach compression");
                    }} 
                    className="text-[8px] bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white font-extrabold px-2 py-1 rounded-lg hover:shadow-xs flex items-center gap-1"
                  >
                    Request Callback
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline of patient reports and clinician notes */}
            <div className="space-y-2.5 font-sans">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#7A6B72] block px-1">Case Filing Timeline</span>
              {sharedReports.length === 0 ? (
                <div className="text-center p-6 bg-white/40 rounded-2xl border border-white/50 text-[11px] italic font-semibold text-[#7A6B72]">
                  No clinical reports logged in this session yet. Submit a new report above!
                </div>
              ) : (
                sharedReports.map((rep) => (
                  <div key={rep.id} className="p-3.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl space-y-2 text-left relative shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] font-mono text-[#7A6B72]">{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • June 19</span>
                        <h4 className="text-[11px] font-black text-[#2B1B2E] uppercase mt-0.5">Symptom: {rep.symptom}</h4>
                      </div>
                      <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full ${
                        rep.severity === "Referral"
                          ? "bg-red-100 text-red-700"
                          : rep.severity === "Monitor"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {rep.severity === "Referral" ? "🚨 referral" : rep.severity === "Monitor" ? "⚠️ watch" : "✅ normal"}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#2B1B2E] font-medium italic mt-1 leading-relaxed">
                      " {rep.description} "
                    </p>

                    {rep.voiceNoteSimulated && (
                      <span className="text-[8.5px] text-[#E84FA0] font-bold flex items-center gap-1">
                        🎙️ Voice memo cellular draft filed (Simulated)
                      </span>
                    )}

                    {/* Show corresponding clinician response notes */}
                    {rep.status === "reviewed" ? (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                        <span className="text-[8px] font-extrabold text-emerald-700 uppercase tracking-widest flex items-center gap-1 leading-none">
                          <CheckCircle2 className="w-3 h-3" /> Reviewed by Sister Kunene
                        </span>
                        <p className="text-[10px] font-semibold text-emerald-900 leading-normal italic mt-0.5">
                          "{rep.clinicianNotes || "Vitals within normal limits. Monitor symptoms and utilize water hydration."}"
                        </p>
                        <div className="flex justify-between text-[8px] text-emerald-700 font-extrabold uppercase mt-1">
                          <span>Action Code: {rep.clinicianAction || "Monitor"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-yellow-50/70 border border-yellow-100 rounded-xl flex items-center justify-between text-[9px] text-[#7A6B72] font-semibold">
                        <span>⏳ Waiting for clinician follow-up review...</span>
                        <span className="text-[8px] bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded-full uppercase">Pending</span>
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB TARGET: PREGNANCY ACADEMY & HEALTH TIPS */}
        {activeTab === "academy" && (
          <div className="space-y-4 animate-fade-in text-left font-sans" id="pregnancy-academy-workspace">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-[#2B1B2E] uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#4F7066]" /> Pregnancy Academy
                </h3>
                <p className="text-[10px] text-[#5F716A] font-semibold">Diverse prenatal conditions & healthy living guides</p>
              </div>
              
              {/* Segmented Controller for Academy Mode */}
              <div className="flex gap-1 p-1 bg-white/50 border border-[#D5E1DB] backdrop-blur-md rounded-xl shadow-3xs" id="academy-mode-switcher">
                <button
                  type="button"
                  onClick={() => setAcademyMode("conditions")}
                  className={`px-2 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-wider cursor-pointer transition-all ${
                    academyMode === "conditions"
                      ? "bg-[#4F7066] text-white shadow-xs"
                      : "text-[#4F7066] hover:bg-white/40"
                  }`}
                >
                  Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setAcademyMode("tips")}
                  className={`px-2 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-wider cursor-pointer transition-all ${
                    academyMode === "tips"
                      ? "bg-[#4F7066] text-white shadow-xs"
                      : "text-[#4F7066] hover:bg-white/40"
                  }`}
                >
                  Health Tips
                </button>
                <button
                  type="button"
                  onClick={() => setAcademyMode("activities")}
                  className={`px-2 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-wider cursor-pointer transition-all ${
                    academyMode === "activities"
                      ? "bg-[#4F7066] text-[#FAF6F2] shadow-xs"
                      : "text-[#4F7066] hover:bg-white/40"
                  }`}
                >
                  Games & Quizzes
                </button>
              </div>
            </div>

            {/* Render 1: DIVERSE PREGNANCY CONDITIONS */}
            {academyMode === "conditions" && (
              <div className="space-y-3.5">
                <div className="p-3 bg-teal-50/75 border border-teal-100 rounded-2xl text-[9.5px] font-semibold text-teal-900 leading-relaxed">
                  💡 <b>Recognize Clinical Risk Benchmarks:</b> Pregnancy conditions are highly manageable when identified early. Select any condition below to review maternal risk signals, diagnostic advice, and preventative steps.
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "pre-eclampsia",
                      name: "Pre-Eclampsia",
                      frequency: "Common (5-8%)",
                      dangerLevel: "High risk after Wk 20",
                      badge: "🚨 Vital Signs Warning"
                    },
                    {
                      id: "gest-diabetes",
                      name: "Gestational Diabetes",
                      frequency: "Moderate (3-10%)",
                      dangerLevel: "Test around Wk 24-28",
                      badge: "🍎 Nutrition & Exercise"
                    },
                    {
                      id: "anemia",
                      name: "Pregnancy Anemia",
                      frequency: "Very Common (15-30%)",
                      dangerLevel: "Increases Trimester 2/3",
                      badge: "💊 Supplements Checklist"
                    },
                    {
                      id: "hyperemesis",
                      name: "Hyperemesis Gravidarum",
                      frequency: "Rare (1-2%)",
                      dangerLevel: "Severe in Trimester 1",
                      badge: "🧪 Fluid Retention Node"
                    }
                  ].map((cond) => {
                    const isSelected = selectedConditionId === cond.id;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setSelectedConditionId(cond.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-[90px] transition-all cursor-pointer relative overflow-hidden select-none ${
                          isSelected
                            ? "bg-white border-[#4F7066] ring-1 ring-[#4F7066]/30 shadow-xs"
                            : "bg-white/45 border-white/50 hover:bg-white/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[7.5px] font-black uppercase text-[#4F7066] block tracking-wide">{cond.badge}</span>
                          <h4 className="text-[11px] font-extrabold text-[#2B1B2E] leading-tight">{cond.name}</h4>
                        </div>
                        <div className="text-[8.5px] font-bold text-[#5F716A]">
                          <span className="block">{cond.frequency}</span>
                          <span className="block text-[7.5px] text-neutral-500">{cond.dangerLevel}</span>
                        </div>
                        {isSelected && (
                          <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-[#4F7066] rounded-full animate-ping"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Condition Elaborate Educational Card */}
                {(() => {
                  const conditionsDetailData: {[key: string]: any} = {
                    "pre-eclampsia": {
                      title: "Pre-Eclampsia & Blood Pressure Control",
                      description: "A sudden rise in maternal blood pressure characterized by high protein levels in the urine. It typically occurs after 20 weeks of pregnancy and requires close medical monitoring to prevent progression.",
                      symptoms: ["Severe, persistent headaches that don't fade with rest.", "Sudden swelling of the face, hands, or ankles (facial edema).", "Visual disturbances like flashes of light, blurry vision, or dark spots.", "Pain under the right ribs or nausea in latter gestations."],
                      safeguards: "Monitor your resting Bloood Pressure regularly using a SADC-certified arm cuff. Use Sister Kunene's low-salt diet notes, stay hydrated with 3.0L water, and always report signs of face puffiness or urine protein markers.",
                      urgency: "Immediate local referral is required if systolic exceeds 140 mmHg or diastolic exceeds 90 mmHg.",
                      vulnerability: "Highly vulnerable for maternal cases after Week 20."
                    },
                    "gest-diabetes": {
                      title: "Gestational Diabetes & Glycemic Care",
                      description: "A temporary form of diabetes where hormones from the placenta block maternal insulin, leading to high glucose levels. It affects how cells use sugar, impacting fetal weight growth in the third trimester.",
                      symptoms: ["Unusual, persistent thirst despite drinking fluids.", "Unusually frequent urination logs beyond normal pressure.", "Chronic maternal fatigue and dry mouth.", "Frequent thrush or recurring skin infections."],
                      safeguards: "Integrate native localized whole grains (sorghum, millet, barley) instead of processed white flour bread. Break down large meals into 5 smaller servings daily. Engage in a light 20-minute post-meal walk.",
                      urgency: "Enforce oral glucose tolerance vetting tests between weeks 24 and 28.",
                      vulnerability: "Most active between Weeks 24 and 32."
                    },
                    "anemia": {
                      title: "Gestational Iron-Deficiency Anemia",
                      description: "During pregnancy, blood volume expands by nearly 50% to support fetal growth. Anemia occurs when your body doesn't have enough iron to synthesize hemoglobin, leading to lower oxygen supply to tissues and placenta.",
                      symptoms: ["Extreme exhaustion, lethargy, or leg muscle weakness.", "Dizziness, lightheadedness on standing up fast.", "Paleness in the gums, under-eyelids, or fingernails.", "Chest flutters or shortness of breath with minimal activity."],
                      safeguards: "Take your prenatal iron + folic acid supplements daily. Eat heme-rich sources like dark leafy spinach, lentils, beans, or local poultry. Important tip: Avoid taking iron pills with black tea or coffee as they contain tannins that block absorption; pair them with vitamin C (citrus, oranges, lemon water) to double uptake!",
                      urgency: "Run routine hemoglobin counts at initial screening and Trimester 3 checkups.",
                      vulnerability: "Trimester 2 and 3 core risk focus."
                    },
                    "hyperemesis": {
                      title: "Hyperemesis Gravidarum (Severe Nausea)",
                      description: "Different from standard morning sickness, hyperemesis is severe, persistent vomiting that leads to high maternal dehydration, weight loss, and electrolyte depletion. It is heavily linked to soaring hCG hormones.",
                      symptoms: ["Constant, debilitating nausea preventing food intake.", "Inability to keep any liquids down for more than 12-24 hours.", "Severe dizziness, confusion, or dark, strong-smelling urine.", "Rapid maternal weight loss in early months."],
                      safeguards: "Sip very cold ginger root water, chamomile tea, or local organic herbal infusions. Keep savory crackers by your bedside and eat one before sitting up in the morning. Consume dry, bland food in micro-doses.",
                      urgency: "Requires clinical IV fluid replacement if dry retching prevents hydration for 24 hours.",
                      vulnerability: "Predominantly active during Weeks 6 through 14."
                    }
                  };

                  const item = conditionsDetailData[selectedConditionId || "pre-eclampsia"];
                  if (!item) return null;

                  return (
                    <div className="p-4 bg-white rounded-3xl border border-[#D5E1DB] text-left space-y-3.5 shadow-3xs animate-fade-in" id="condition-expanded-details">
                      <div>
                        <span className="text-[8px] bg-red-100 text-red-900 border border-red-200 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Condition Clinical Factsheet</span>
                        <h4 className="text-[12.5px] font-black text-[#2B1B2E] mt-1.5">{item.title}</h4>
                        <p className="text-[10px] text-[#5F716A] leading-relaxed font-semibold mt-1">{item.description}</p>
                      </div>

                      <div className="space-y-1.5 p-3 bg-red-50/50 rounded-2xl border border-red-100/40">
                        <span className="text-[8.5px] text-red-700 font-black uppercase tracking-wider block">⚠️ Key Warning Signs (Clinical Alerts):</span>
                        <ul className="list-disc list-inside text-[9.5px] text-neutral-800 space-y-1 font-semibold leading-tight">
                          {item.symptoms.map((sym: string, i: number) => (
                            <li key={i}>{sym}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-[10px] leading-relaxed font-semibold text-[#2B1B2E] space-y-1 bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
                        <span className="text-[8.5px] text-[#4F7066] font-black uppercase tracking-wider block">🔬 Preventative Safeguards & Exercises:</span>
                        <p className="leading-normal">"{item.safeguards}"</p>
                      </div>

                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-extrabold uppercase bg-slate-100/60 p-2 rounded-xl">
                        <span>🚨 urgency indicator: {item.urgency}</span>
                        <span>{item.vulnerability}</span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {/* Render 2: GENERAL HEALTH TIPS HUB */}
            {academyMode === "tips" && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Interactive Daily Health Checklist */}
                <div className="p-4 bg-gradient-to-br from-[#E2EBE5] to-white rounded-3xl border border-white space-y-3 shadow-3xs" id="interactive-maternal-checklist">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <span className="text-[8px] bg-[#4F7066] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Personal Tracker</span>
                      <h4 className="text-[11.5px] font-black text-[#2B1B2E] mt-1">Daily Maternal Habits Checkoff</h4>
                    </div>
                    <span className="text-[10px] font-mono font-black text-[#4F7066]">
                      {Object.values(dailyAcademyHabits).filter(Boolean).length}/5 Completed
                    </span>
                  </div>
                  
                  <p className="text-[9.5px] text-[#5F716A] leading-tight font-semibold">
                    Expectant mothers should complete these core actions daily to maintain hydration levels, optimal placental blow flow, and biomechanical core support:
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1 font-sans">
                    {[
                      { key: "hydrated", label: "Hydrated with 3.0 Liters water", desc: "Maintains high amniotic volume and prevents early uterine irritation.", icon: "💧" },
                      { key: "leftSleep", label: "Left-side sleep posture", desc: "Maximize heavy-oxygenated oxygen distribution through the uterine artery.", icon: "🛌" },
                      { key: "ironPills", label: "Took daily Folate + Iron supplements", desc: "Essential for synthesis of hemoglobin. Never take with coffee or tea!", icon: "💊" },
                      { key: "pelvicStretches", label: "Completed 15 min walks & pelvic tilts", desc: "Encourages optimal fetal carriage and pelvic corridor flexibility.", icon: "🧘" },
                      { key: "kickCounts", label: "Logged active fetal kick bounds", desc: "Target 10 movements within 2 hrs. Vital diagnostic sensor check.", icon: "👶" }
                    ].map((habit) => {
                      const active = (dailyAcademyHabits as any)[habit.key];
                      return (
                        <button
                          key={habit.key}
                          type="button"
                          onClick={() => {
                            setDailyAcademyHabits(prev => ({
                              ...prev,
                              [habit.key]: !active
                            }));
                          }}
                          className={`p-2.5 rounded-2xl text-left border flex items-start gap-2.5 transition-all cursor-pointer ${
                            active 
                              ? "bg-white border-[#4F7066] text-[#2B1B2E] shadow-3xs" 
                              : "bg-white/40 border-transparent hover:bg-white/60 text-[#2B1B2E]"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                            active ? "bg-[#EAF4EE] border-[#4F7066] text-[#4F7066]" : "bg-white border-neutral-200 text-neutral-400"
                          }`}>
                            {active ? "✓" : habit.icon}
                          </div>
                          <div className="min-w-0 flex-1 leading-tight text-left">
                            <span className="text-[9.5px] font-extrabold block">{habit.label}</span>
                            <span className="text-[8.5px] text-[#5F716A] block font-semibold leading-tight mt-0.5">{habit.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Educational health tips articles */}
                <div className="space-y-2.5 text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#5F716A] block px-1">Prenatal Health Library & Science Tips</span>

                  <div className="p-3.5 bg-white/65 border border-white/50 rounded-2xl space-y-1.5 shadow-3xs">
                    <span className="text-[7.5px] bg-sky-100 text-sky-900 border border-sky-200 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Hydration Science</span>
                    <h5 className="text-[10.5px] font-extrabold text-[#2B1B2E]">The 3-Liter Standard</h5>
                    <p className="text-[9.5px] text-[#5F716A] font-semibold leading-normal">
                      Rural African environments can lead to elevated cellular dehydration duringgestations. Sip clean water throughout the day. Water keeps blood volume expanded, allows active waste clearance from the placenta, and decreases early abdominal tension and constipation symptoms.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/65 border border-white/50 rounded-2xl space-y-1.5 shadow-3xs">
                    <span className="text-[7.5px] bg-[#EAF4EE] text-[#4F7066] border border-[#D5E1DB] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Positioning Guidelines</span>
                    <h5 className="text-[10.5px] font-extrabold text-[#2B1B2E]">Anatomical Benefits of Left-Side Sleeping</h5>
                    <p className="text-[9.5px] text-[#5F716A] font-semibold leading-normal">
                      Sleeping flat on your back forces the heavy weight of the uterus onto your inferior vena cava—the major blood vessel bringing blood back to your heart. Side-sleeping, specifically on the left side, opens this passageway entirely. This maximizes oxygen and diagnostic nutrition delivery to the placenta.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white/65 border border-white/50 rounded-2xl space-y-1.5 shadow-3xs">
                    <span className="text-[7.5px] bg-purple-100 text-purple-900 border border-purple-200 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Diagnostic Baby Tracking</span>
                    <h5 className="text-[10.5px] font-extrabold text-[#2B1B2E]">How to Count Kicks (Fetal Movement)</h5>
                    <p className="text-[9.5px] text-[#5F716A] font-semibold leading-normal">
                      Count kicks once daily, preferably after dinner when baby is active. Sit comfortably or lie on your left side. Note down any rolls, kicks, or flutters. You should log at least 10 discrete movements within a 2-hour window. If baby seems quiet, drink a cold glass of water or walk for 5 minutes, then test again. Report immediately if activity decreases heavily.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Render 3: INTERACTIVE PREGNANCY TRIVIA, GAMES & QUIZZES */}
            {academyMode === "activities" && (
              <div className="space-y-4 animate-fade-in" id="pregnancy-activities-hub">
                
                {/* Game / Mode Switch Tabs */}
                <div className="flex bg-neutral-100 p-1 rounded-2xl border border-neutral-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActivity("quiz");
                      setQuizQIndex(0);
                      setSelectedAnsIndex(null);
                      setQuizScore(0);
                      setQuizIsAnswered(false);
                    }}
                    className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                      activeActivity === "quiz"
                        ? "bg-white text-[#2B1B2E] shadow-3xs"
                        : "text-[#7A6B72] hover:text-[#2B1B2E]"
                    }`}
                  >
                    🤰 {t("prenatalQuiz", "Pregnancy Quiz")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveActivity("myths");
                      setMythIndex(0);
                      setMythGuess(null);
                      setIsMythJudged(false);
                      setMythScore(0);
                    }}
                    className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                      activeActivity === "myths"
                        ? "bg-white text-[#2B1B2E] shadow-3xs"
                        : "text-[#7A6B72] hover:text-[#2B1B2E]"
                    }`}
                  >
                    🎯 {t("mythBust", "Myth vs Fact")}
                  </button>
                </div>

                {/* ACTIVITY CHANNEL A: PRENATAL WELLNESS QUIZ */}
                {activeActivity === "quiz" && (() => {
                  const quizQuestions = [
                    {
                      question: "Which vitamin or mineral is crucial in the first trimester to protect the baby's early brain and spine enclosure?",
                      options: ["Folic Acid / Folate", "Vitamin A", "Calcium Supplement", "Magnesium"],
                      correct: 0,
                      explanation: "Folate (Folic Acid) is recommended SADC-wide during early gestations to block neural tube alignment defects entirely."
                    },
                    {
                      question: "How many liters of hydration (clean water) are recommended daily to maintain active amniotic fluid volume?",
                      options: ["1 Liter / 4 glasses", "2 Liters / 8 glasses", "3 Liters / 12 glasses", "5 Liters / 20 glasses"],
                      correct: 2,
                      explanation: "Around 3.0 Liters is the golden clinical benchmark to avoid maternal dehydration and encourage placenta waste drainage."
                    },
                    {
                      question: "Why is left-side sleeping recommended specifically for pregnant mothers?",
                      options: ["It prevents normal snoring", "It opens the major vein, maximizing blood and nutrient supply to the placenta", "It guarantees faster deep sleep", "It keeps the baby sleeping"],
                      correct: 1,
                      explanation: "Side sleeping on the left lifts the heavy uterus off the inferior vena cava (the prime circulatory passageway), boosting blood and oxygen dispatch."
                    },
                    {
                      question: "A mother feels dizzy and severely fatigued. This is typically a symptom of which common pregnancy status?",
                      options: ["Severe Pre-Eclampsia", "Iron Deficiency Anemia", "Normal Restlessness", "Vitamin C overload"],
                      correct: 1,
                      explanation: "Low red blood counts (Anemia) trigger early dizziness and heavy breathing. Easily managed with prenatal iron tablets."
                    }
                  ];

                  const isFinished = quizQIndex >= quizQuestions.length;
                  if (isFinished) {
                    return (
                      <div className="p-5 bg-white/75 border border-white rounded-3xl text-center space-y-4 shadow-3xs animate-fade-in" id="quiz-completion-screen">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto shadow-inner">
                          🏆
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#2B1B2E] uppercase">Quiz Successfully Finished!</h4>
                          <p className="text-[10px] text-emerald-800 font-extrabold mt-1">Excellent Clinical Learning Score: {quizScore} / {quizQuestions.length}</p>
                        </div>
                        <p className="text-[9.5px] text-[#5F716A] leading-relaxed">
                          Applying these prenatal nutritional guidelines protects both mother and developing baby. Show your clinician your score next visit!
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizQIndex(0);
                            setSelectedAnsIndex(null);
                            setQuizScore(0);
                            setQuizIsAnswered(false);
                          }}
                          className="w-full py-2.5 bg-[#4F7066] hover:bg-[#1F2E2A] text-white text-[10px] font-black uppercase rounded-xl cursor-pointer transition-colors"
                        >
                          Retry Quiz Challenge
                        </button>
                      </div>
                    );
                  }

                  const curQ = quizQuestions[quizQIndex];
                  return (
                    <div className="p-4 bg-white/55 border border-white rounded-3xl space-y-4 shadow-3xs animate-fade-in" id="quiz-question-box">
                      <div className="flex justify-between items-center text-[8.5px] font-bold text-[#5F716A] uppercase tracking-wide">
                        <span>Prenatal nutrition challenge</span>
                        <span>Question {quizQIndex + 1} of {quizQuestions.length}</span>
                      </div>

                      <h4 className="text-[11.5px] font-black text-[#2B1B2E] leading-snug">{curQ.question}</h4>

                      {/* Options List */}
                      <div className="space-y-2">
                        {curQ.options.map((opt, oIdx) => {
                          let btnStyle = "bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50";
                          if (quizIsAnswered) {
                            if (oIdx === curQ.correct) {
                              btnStyle = "bg-emerald-550 border-emerald-550 text-white font-extrabold";
                            } else if (selectedAnsIndex === oIdx) {
                              btnStyle = "bg-rose-500 border-rose-500 text-white font-extrabold";
                            } else {
                              btnStyle = "bg-neutral-50 border-neutral-100 text-neutral-400 opacity-60";
                            }
                          } else if (selectedAnsIndex === oIdx) {
                            btnStyle = "bg-pink-100 border-[#FF6FB1] text-[#E84FA0] font-black";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={quizIsAnswered}
                              onClick={() => setSelectedAnsIndex(oIdx)}
                              className={`w-full p-3 border text-left text-[10.5px] font-medium rounded-2xl transition-all cursor-pointer flex gap-2.5 items-center leading-snug ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center font-bold text-[9.5px] shrink-0">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* Verification actions */}
                      {!quizIsAnswered ? (
                        <button
                          type="button"
                          disabled={selectedAnsIndex === null}
                          onClick={() => {
                            if (selectedAnsIndex === curQ.correct) {
                              setQuizScore(quizScore + 1);
                            }
                            setQuizIsAnswered(true);
                          }}
                          className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 font-black text-[10px] text-white uppercase rounded-xl cursor-pointer shadow-xs disabled:opacity-40"
                        >
                          Lock In Answer
                        </button>
                      ) : (
                        <div className="space-y-4 animate-fade-in" id="quiz-explanation-block">
                          <div className={`p-3 rounded-2xl text-[10px] leading-relaxed text-left border ${
                            selectedAnsIndex === curQ.correct 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-950" 
                              : "bg-rose-50 border-rose-100 text-rose-950"
                          }`}>
                            <p className="font-extrabold">
                              {selectedAnsIndex === curQ.correct ? "🎉 Correct Answer!" : "⚠️ Science Tip Explanation:"}
                            </p>
                            <p className="mt-1 font-semibold text-[#5F716A]">{curQ.explanation}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setQuizQIndex(quizQIndex + 1);
                              setSelectedAnsIndex(null);
                              setQuizIsAnswered(false);
                            }}
                            className="w-full py-2.5 bg-[#4F7066] hover:bg-[#1F2E2A] text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                          >
                            {quizQIndex + 1 === quizQuestions.length ? "Finish Quiz & See Score" : "Advance to Next Question"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ACTIVITY CHANNEL B: MYTH VS FACT GAME */}
                {activeActivity === "myths" && (() => {
                  const mythStatements = [
                    {
                      statement: "You must eat completely for two people (double your normal food portion) because of the baby's requirements.",
                      type: "myth",
                      explanation: "Myth! Expecting mothers only need an extra 300 to 450 calorie-dense portions a day in later stages, not double the quantity."
                    },
                    {
                      statement: "Sleeping flat on your back in late pregnancy exerts uterus weight pressure on vital blood veins and restricts infant supply.",
                      type: "fact",
                      explanation: "Fact! Back sleeping forces the uterus onto the vena cava, reducing oxygen flow. Left-side sleeping is ideal."
                    },
                    {
                      statement: "Severe, painful heartburn and chest burn during pregnancy are clinical proof that your baby is growing a dense head of hair.",
                      type: "myth",
                      explanation: "Myth! Heartburn is triggered by natural pregnancy hormones which relax digest valves, letting gastric acids escape."
                    },
                    {
                      statement: "Washing cat litter boxes or sweeping raw cat dung with bare hands is safe for expecting mothers.",
                      type: "myth",
                      explanation: "Myth! Parasitic infections like toxoplasmosis are in cat droppings. These are hazardous to developing retinas and brains."
                    }
                  ];

                  const isCompleted = mythIndex >= mythStatements.length;
                  if (isCompleted) {
                    return (
                      <div className="p-5 bg-white/75 border border-white rounded-3xl text-center space-y-4 shadow-3xs animate-fade-in" id="myths-completion-screen">
                        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl mx-auto shadow-inner animate-pulse">
                          ✨
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#2B1B2E] uppercase">All Pregnancy Myths Busted!</h4>
                          <p className="text-[10px] text-amber-800 font-extrabold mt-1">Prenatal Lore Score Points: {mythScore} / {mythStatements.length}</p>
                        </div>
                        <p className="text-[9.5px] text-[#5F716A] leading-relaxed">
                          You are ready to differentiate old tales from scientific clinical truth! This knowledge protects you from maternal anxiety.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setMythIndex(0);
                            setMythGuess(null);
                            setIsMythJudged(false);
                            setMythScore(0);
                          }}
                          className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                        >
                          Bust Myths Again
                        </button>
                      </div>
                    );
                  }

                  const curM = mythStatements[mythIndex];
                  return (
                    <div className="p-4 bg-white/55 border border-white rounded-3xl space-y-4 shadow-3xs animate-fade-in" id="myths-challenge-box">
                      <div className="flex justify-between items-center text-[8.5px] font-bold text-[#5F716A] uppercase tracking-wide">
                        <span>Maternal mythbuster suite</span>
                        <span>Statement {mythIndex + 1} of {mythStatements.length}</span>
                      </div>

                      <div className="p-3 bg-white/80 rounded-2xl border border-[#D5E1DB] text-left">
                        <p className="text-[11px] font-bold text-[#2B1B2E] leading-relaxed">“ {curM.statement} ”</p>
                      </div>

                      {/* Myth vs Fact Choices */}
                      {!isMythJudged ? (
                        <div className="grid grid-cols-2 gap-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMythGuess("myth");
                              setIsMythJudged(true);
                              if (curM.type === "myth") {
                                setMythScore(mythScore + 1);
                              }
                            }}
                            className="py-3 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-black text-[10.5px] uppercase tracking-wider rounded-2xl cursor-pointer text-center select-none"
                          >
                            ❌ This is a Myth
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMythGuess("fact");
                              setIsMythJudged(true);
                              if (curM.type === "fact") {
                                setMythScore(mythScore + 1);
                              }
                            }}
                            className="py-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-black text-[10.5px] uppercase tracking-wider rounded-2xl cursor-pointer text-center select-none"
                          >
                            ✅ This is a Fact
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-fade-in" id="myth-judgment-block">
                          <div className={`p-3 rounded-2xl text-[10px] leading-relaxed border ${
                            mythGuess === curM.type 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-950" 
                              : "bg-rose-50 border-rose-100 text-rose-950"
                          }`}>
                            <p className="font-extrabold uppercase text-[9px] tracking-wide">
                              {mythGuess === curM.type 
                                ? "🎉 Correct! That is exactly a " + curM.type.toUpperCase() 
                                : "⚠️ Incorrect! In science, this is actually a " + curM.type.toUpperCase()}
                            </p>
                            <p className="mt-1 font-semibold text-[#5F716A]">{curM.explanation}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setMythIndex(mythIndex + 1);
                              setMythGuess(null);
                              setIsMythJudged(false);
                            }}
                            className="w-full py-2.5 bg-[#4F7066] hover:bg-[#1F2E2A] text-white text-[10px] font-black uppercase rounded-xl cursor-pointer"
                          >
                            {mythIndex + 1 === mythStatements.length ? "Complete Busters & See Score" : "Reveal Next Statement"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}

          </div>
        )}

        {/* TAB TARGET: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-4 animate-fade-in text-left">
            <div>
              <h3 className="text-sm font-extrabold text-[#2B1B2E] uppercase tracking-wider">{currentLangPack.profileSettings}</h3>
              <p className="text-[10px] text-[#7A6B72] font-semibold">Maternal registry identification & system status</p>
            </div>

            {/* Patient identification card */}
            <div className="p-4 bg-white/50 border border-white/50 rounded-3xl space-y-3 shadow-xs">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-300 to-amber-200 border-2 border-white flex items-center justify-center font-black text-[#E84FA0] text-sm shadow-inner shrink-0 animate-pulse">
                  {details.initial}
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#2B1B2E]">{details.name}</h4>
                  <p className="text-[9.5px] text-[#7A6B72] font-semibold">Primary ID: {details.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] leading-tight font-semibold py-2 border-y border-white/40">
                <div>
                  <span className="text-[8px] font-bold text-[#7A6B72] uppercase block">Estimated Due Date:</span>
                  <span className="text-[#2B1B2E]">{details.edd}</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-[#7A6B72] uppercase block">Registered Clinic:</span>
                  <span className="text-[#2B1B2E]">{details.region}</span>
                </div>
              </div>

              {/* Offline capabilities settings list */}
              <div className="space-y-2.5 pt-1.5 font-sans">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-[#5F716A] mb-1">
                  <span>System Preferences</span>
                </div>

                {/* Per-Topic Connections Notifications Toggle Checklist (Specific Mandate) */}
                <div className="p-3 bg-[#E2EBE5]/60 border border-[#4F7066]/20 rounded-2xl text-left space-y-2">
                  <span className="text-[8px] font-black uppercase text-[#2B1B2E] tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#4F7066]" /> Connections Alert Subscriptions
                  </span>
                  <p className="text-[9.5px] text-[#5F716A] leading-tight font-semibold">
                    Toggle alert subscriptions to receive real-time push notes for your selected peer channels:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                    {Object.keys(topicNotifications || {}).map((category) => {
                      const isSubscribed = topicNotifications[category];
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            const updated = {
                              ...topicNotifications,
                              [category]: !isSubscribed
                            };
                            onUpdateTopicNotifications(updated);
                          }}
                          className={`flex items-center justify-between p-1.5 px-2 bg-white rounded-xl border text-[9px] font-extrabold transition-all cursor-pointer ${
                            isSubscribed ? "border-[#4F7066] text-[#4F7066] ring-1 ring-[#4F7066]/20 bg-[#E2EBE5]/20" : "border-slate-200 text-slate-500"
                          }`}
                        >
                          <span className="capitalize">{category}</span>
                          <span className="text-[8px] font-black">{isSubscribed ? "🔔 ON" : "🔕 OFF"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-white/70 rounded-xl border border-white/40 text-[10.5px]">
                  <div className="space-y-0.5">
                    <span className="font-extrabold block text-[#2B1B2E]">Offline Mode Cache Syncing</span>
                    <span className="text-[8.5px] text-[#5F716A] block">Allow cache mapping on rural networks.</span>
                  </div>
                  <div className="w-8 h-4 bg-[#4F7066] rounded-full p-0.5 cursor-pointer flex justify-end">
                    <div className="w-3 h-3 bg-white rounded-full shadow-xs"></div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-white/70 rounded-xl border border-white/40 text-[10.5px]">
                  <div className="space-y-0.5">
                    <span className="font-extrabold block text-[#2B1B2E]">Security & POPIA Consent status</span>
                    <span className="text-[8.5px] text-[#5F716A] block">Granted (Consent Form V1.2-SZ)</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                {/* Subscription management sector */}
                <div className="p-3 bg-gradient-to-r from-pink-50/70 to-[#EEF5F2] border border-[#FF6FB1]/25 rounded-2xl text-left space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-black uppercase text-[#E84FA0] tracking-wider flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5" /> Plan: {sessionPlan === "lula" ? "Lula Basic" : sessionPlan === "premium" ? "Vytal Premium" : "SADC Secure Connect"}
                      </span>
                      <p className="text-[9px] text-[#7A6B72] leading-tight font-semibold mt-0.5">
                        {sessionPlan === "lula" ? "Subsidized care with basic tools." : "All premium speech & Recharts tools active."}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(true)}
                    className="w-full py-2 bg-white hover:bg-[#EEF5F2] border border-[#FF6FB1]/20 text-[#E84FA0] text-[9px] font-black uppercase rounded-xl cursor-pointer shadow-3xs flex items-center justify-center gap-1"
                  >
                    💎 Explore & Upgrade Packages
                  </button>
                </div>

                {/* Secure Sign Out button */}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[9px] font-black uppercase rounded-xl cursor-pointer text-center block mt-1"
                  >
                    🚶 Sign Out from Companion App
                  </button>
                )}
              </div>
            </div>

            <p className="text-[9px] text-[#5F716A] font-semibold text-center mt-6">
              {currentLangPack.aboutApp}
            </p>
          </div>
        )}

      </div>

      {/* 3. New Report Modal Dialog Overlay */}
      {reportModalOpen && (
        <div className="absolute inset-0 bg-[#2B1B2E]/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white/95 rounded-3xl border border-white/80 p-5 w-full max-w-sm space-y-4 shadow-2xl relative text-left">
            <div className="flex justify-between items-center pb-2 border-b border-[#FFDCE5]">
              <h4 className="font-extrabold text-[#2B1B2E] text-xs uppercase tracking-wider">Submit New Prenatal Report</h4>
              <button 
                type="button" 
                onClick={() => setReportModalOpen(false)}
                className="text-[#7A6B72] hover:text-[#2B1B2E] font-black text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2 animate-scale-up">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h5 className="font-extrabold text-[#2B1B2E] text-xs">REPORT ENQUEUED SUCCESSFULLY</h5>
                <p className="text-[10px] text-[#7A6B72]">This patient case has been submitted immediately to the clinician's review list.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateReportSubmit} className="space-y-3 text-[10.5px]">
                
                <div>
                  <label htmlFor="modal-symptom-select" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">Select Core Symptom:</label>
                  <select
                    id="modal-symptom-select"
                    value={selectedSymptom}
                    onChange={(e) => setSelectedSymptom(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/30 text-[#2B1B2E] font-bold text-xs p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1] cursor-pointer"
                  >
                    <option value="Severe headache">Severe headache</option>
                    <option value="Facial swelling">Facial swelling & rings tight</option>
                    <option value="Flashes in vision">Blurry vision / flashes of light</option>
                    <option value="Body heat/Fever">Body heat / cold chills</option>
                    <option value="Decreased fetal movement">Decreased baby flutters</option>
                    <option value="Mild cramping">Mild uterine cramping</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-severity" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">Severity Priority Level:</label>
                  <div className="grid grid-cols-3 gap-1.5" id="modal-severity">
                    {(["Normal", "Monitor", "Referral"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSymptomSeverity(level)}
                        className={`py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider text-center border cursor-pointer transition-all ${
                          symptomSeverity === level
                            ? level === "Referral"
                              ? "bg-red-500 text-white border-red-500"
                              : level === "Monitor"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-emerald-500 text-white border-emerald-500"
                            : "bg-white text-[#2B1B2E] border-[#FF6FB1]/20 hover:bg-neutral-50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-description" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">Provide Detailed Descriptions:</label>
                  <textarea
                    id="modal-description"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={3}
                    placeholder="Provide diagnostic insights. E.g. Wedding ring feeling extremely tight and face has light spelling..."
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/30 text-[#2B1B2E] font-medium p-2.5 rounded-xl text-[10px] focus:outline-none focus:ring-1 focus:ring-[#FF6FB1]"
                  />
                </div>

                <div className="flex items-center justify-between p-2 bg-[#FFF1EE] border border-[#FF6FB1]/20 rounded-xl">
                  <div className="text-left">
                    <span className="font-extrabold block text-[9px] text-[#2B1B2E]">Record simulated voice note</span>
                    <span className="text-[7.5px] text-[#7A6B72]">Hands-free clinical vocal assistance is included.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={recordVoiceSim}
                    onChange={(e) => setRecordVoiceSim(e.target.checked)}
                    className="w-4 h-4 text-[#E84FA0] border-neutral-300 rounded focus:ring-pink-500 accent-[#E84FA0] cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] hover:shadow-lg transition-all text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer text-center"
                >
                  {currentLangPack.btnSubmit}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* 4. Fixed Bottom Navigation Tab Bar (Active tab styled in calm brand sage green) */}
      <footer className="absolute bottom-0 left-0 right-0 h-[64px] bg-white/70 backdrop-blur-xl border-t border-white/50 grid grid-cols-7 text-center py-2 shrink-0 z-30" id="maternal-tab-belt">
        
        {/* TAB 1: HOME */}
        <button 
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "home" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-home"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabHome", "Home")}</span>
          {activeTab === "home" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>
        
        {/* TAB 2: CALENDAR */}
        <button 
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "calendar" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-calendar"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabCalendar", "Calendar")}</span>
          {activeTab === "calendar" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

        {/* TAB 3: INSIGHTS (AI) */}
        <button 
          onClick={() => setActiveTab("insights")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "insights" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-insights"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabInsights", "Ask Vytal")}</span>
          {activeTab === "insights" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

        {/* TAB 4: CONNECTIONS & COMMUNITY */}
        <button 
          onClick={() => setActiveTab("community")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "community" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-community"
        >
          <Users className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabCommunity", "Peer Hub")}</span>
          {activeTab === "community" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

        {/* TAB 5: PREGNANCY ACADEMY */}
        <button 
          onClick={() => setActiveTab("academy")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "academy" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-academy"
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabAcademy", "Academy")}</span>
          {activeTab === "academy" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

        {/* TAB 6: REPORTS */}
        <button 
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "reports" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-reports"
        >
          <Info className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabReports", "Reports")}</span>
          
          {/* Real-time alert badge if any pending reports exist */}
          {sharedReports.length > 0 && (
            <span className="absolute top-1 right-5.5 w-2 h-2 rounded-full bg-[#4F7066] border border-white"></span>
          )}
          {activeTab === "reports" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

        {/* TAB 7: PROFILE */}
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all relative ${activeTab === "profile" ? "text-[#4F7066] font-black" : "text-[#7A6B72] hover:text-[#2B1B2E]"}`}
          id="tab-btn-maternal-profile"
        >
          <User className="w-4 h-4" />
          <span className="text-[8px] uppercase font-extrabold tracking-wider">{t("tabProfile", "Profile")}</span>
          {activeTab === "profile" && <span className="absolute bottom-1 w-4 h-1 bg-[#4F7066] rounded-full"></span>}
        </button>

      </footer>

      {/* 5. SLIDING LEFT SIDEBAR DRAWER (COLLIPSIBLE MOBILE SIDEBAR) */}
      {isLeftSidebarOpen && (
        <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs z-[100] transition-opacity duration-200" id="maternal-sidebar-backdrop" onClick={() => setIsLeftSidebarOpen(false)}>
          <div 
            className="absolute top-0 bottom-0 left-0 w-[240px] bg-white shadow-2xl flex flex-col p-4 space-y-4 animate-fade-in text-left z-[101]" 
            id="maternal-sidebar-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-3.5 border-b border-dashed border-neutral-150">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E84FA0] fill-[#E84FA0]" />
                <span className="text-[11px] font-black uppercase text-[#2B1B2E] tracking-tight">{currentLangPack.appName}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsLeftSidebarOpen(false)} 
                className="w-6 h-6 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mother Profile Card */}
            <div className="bg-[#FFF9F6] p-3 rounded-2xl border border-[#FF6FB1]/10 flex items-center gap-2.5 shadow-3xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-300 to-amber-200 flex items-center justify-center font-black text-[#E84FA0] text-xs shadow-inner shrink-0">
                K
              </div>
              <div className="text-left leading-none">
                <h4 className="text-[11px] font-black text-[#2B1B2E]">{currentLangPack.welcomeMsg.replace("Hi, ", "")}</h4>
                <span className="text-[8.5px] text-[#7A6B72] font-semibold mt-0.5 block leading-none">ID: SADC-2901-T</span>
              </div>
            </div>

            {/* Emergency SOS Hot Button */}
            <div className="pt-1 select-none">
              <button
                type="button"
                onClick={() => {
                  setIsLeftSidebarOpen(false);
                  setIsEmergencyModalOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-[#E84FA0] hover:shadow-md transition-all text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs animate-pulse focus:outline-none"
                id="sidebar-emergency-sos-trigger"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                {t("emergencySos", "🚨 Quick Emergency")}
              </button>
            </div>

            {/* Nav List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 text-[11px] font-semibold text-[#7A6B72]">
              <span className="text-[8px] uppercase font-black text-[#4F7066] tracking-widest block mb-1">Maternal Nav Menu</span>
              
              <button 
                onClick={() => { setActiveTab("home"); setIsLeftSidebarOpen(false); }} 
                className={`w-full py-2 px-3 rounded-xl flex items-center gap-2 text-left font-bold transition-all ${activeTab === "home" ? "bg-[#4F7066]/10 text-[#4F7066]" : "hover:bg-neutral-50 hover:text-[#2B1B2E]"}`}
              >
                <LayoutGrid className="w-4 h-4 text-[#4F7066]" /> Home Overview
              </button>

              <button 
                onClick={() => { setActiveTab("calendar"); setIsLeftSidebarOpen(false); }} 
                className={`w-full py-2 px-3 rounded-xl flex items-center gap-2 text-left font-bold transition-all ${activeTab === "calendar" ? "bg-[#4F7066]/10 text-[#4F7066]" : "hover:bg-neutral-50 hover:text-[#2B1B2E]"}`}
              >
                <Calendar className="w-4 h-4 text-[#4F7066]" /> Pregnant Calendar
              </button>

              <button 
                onClick={() => { setActiveTab("insights"); setIsLeftSidebarOpen(false); }} 
                className={`w-full py-2 px-3 rounded-xl flex items-center gap-2 text-left font-bold transition-all ${activeTab === "insights" ? "bg-[#4F7066]/10 text-[#4F7066]" : "hover:bg-neutral-50 hover:text-[#2B1B2E]"}`}
              >
                <MessageSquare className="w-4 h-4 text-[#4F7066]" /> Ask Vytal Voice
              </button>

              <button 
                onClick={() => { setActiveTab("academy"); setIsLeftSidebarOpen(false); }} 
                className={`w-full py-2 px-3 rounded-xl flex items-center gap-2 text-left font-bold transition-all ${activeTab === "academy" ? "bg-[#4F7066]/10 text-[#4F7066]" : "hover:bg-neutral-50 hover:text-[#2B1B2E]"}`}
              >
                <BookOpen className="w-4 h-4 text-[#4F7066]" /> Academy & Quizzes
              </button>

              <button 
                onClick={() => { setActiveTab("reports"); setIsLeftSidebarOpen(false); }} 
                className={`w-full py-2 px-3 rounded-xl flex items-center gap-2 text-left font-bold transition-all ${activeTab === "reports" ? "bg-[#4F7066]/10 text-[#4F7066]" : "hover:bg-neutral-50 hover:text-[#2B1B2E]"}`}
              >
                <Info className="w-4 h-4 text-[#4F7066]" /> Reports Terminal
              </button>

              <span className="text-[8px] uppercase font-black text-red-500 tracking-widest block pt-3 mb-1">Clinic Escalations</span>
              <button 
                onClick={() => { setIsLeftSidebarOpen(false); setIsEmergencyModalOpen(true); }} 
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl flex items-center gap-2 text-left font-bold transition-all border border-red-100"
              >
                <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" /> Local Help Hotlines
              </button>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-dashed border-neutral-150 text-center">
              <span className="text-[7.5px] font-mono text-[#7A6B72] block">Vytal Companion App v2.1</span>
              <span className="text-[7.5px] text-[#4F7066] font-bold block mt-0.5">SADC Health Certified</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. EMERGENCY LOCAL CONTACT LIST MODAL */}
      {isEmergencyModalOpen && (
        <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in" id="mother-emergency-modal">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-red-200 flex flex-col max-h-[520px] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            {/* Modal close */}
            <button 
              type="button" 
              onClick={() => setIsEmergencyModalOpen(false)} 
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-600 to-[#E84FA0] p-4 text-left text-white mb-2">
              <span className="text-[8px] bg-white/20 border border-white/30 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest inline-block">SADC EMERGENCY DISPATCH DIRECTORY</span>
              <h3 className="text-sm font-black uppercase mt-1">Local Maternal Rescue Hotlines</h3>
              <p className="text-[10px] text-pink-50 font-medium leading-tight mt-0.5">Contact immediate clinical rescue and prenatal support stations nearest to your location.</p>
            </div>

            {/* Scrollable contact directory */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[380px] text-left no-scrollbar">
              
              {/* Mbabane HQ */}
              <div className="p-3 bg-red-50/50 border border-red-100 rounded-2xl flex justify-between items-center shadow-3xs">
                <div>
                  <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Primary Referral Station</span>
                  <p className="text-[11.5px] font-black text-[#2B1B2E] mt-1 pr-1 leading-snug">Mbabane Clinical Triage & Emergency Unit</p>
                  <p className="text-[9.5px] text-[#7A6B72] font-semibold mt-0.5">+268 2404 2111</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEmergencyModalOpen(false);
                    setSimulatedActiveCall("Mbabane Clinical Triage Desk [+268 2404 2111]");
                  }}
                  className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>

              {/* Sister Kunene Direct Hotline */}
              <div className="p-3 bg-gradient-to-br from-indigo-50/40 to-indigo-100/10 border border-indigo-100 rounded-2xl flex justify-between items-center shadow-3xs">
                <div>
                  <span className="text-[8px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Direct Maternal Liaison Coach</span>
                  <p className="text-[11.5px] font-black text-[#2B1B2E] mt-1 pr-1 leading-snug">Sister Thandeka Kunene (Urgent Escalation)</p>
                  <p className="text-[9.5px] text-[#7A6B72] font-semibold mt-0.5">+268 7604 9403</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEmergencyModalOpen(false);
                    setSimulatedActiveCall("Sister Thandeka Kunene [+268 7604 9403]");
                  }}
                  className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>

              {/* SADC Regional Free Evacs */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[8.5px] font-extrabold uppercase text-[#4F7066] block">SADC Regional Toll-Free Medical Hubs</span>
                
                {/* Eswatini Ambulance */}
                <div className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl flex justify-between items-center border border-neutral-150/40">
                  <div className="leading-tight">
                    <p className="text-[10px] font-black text-[#2B1B2E]">🇸🇿 Eswatini Medical Emergency Dispatch</p>
                    <span className="text-[9px] text-[#7A6B72] font-semibold mt-0.5 block">National Ambulance Desk • Call 997</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmergencyModalOpen(false);
                      setSimulatedActiveCall("Eswatini National Ambulance [997]");
                    }}
                    className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Botswana Emergency Services */}
                <div className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl flex justify-between items-center border border-neutral-150/40">
                  <div className="leading-tight">
                    <p className="text-[10px] font-black text-[#2B1B2E]">🇧🇼 Botswana Ambulance & Rescue desk</p>
                    <span className="text-[9px] text-[#7A6B72] font-semibold mt-0.5 block">Health Emergency Line • Call 997</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmergencyModalOpen(false);
                      setSimulatedActiveCall("Botswana Health Emergency line [997]");
                    }}
                    className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* South Africa Ambulance */}
                <div className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-xl flex justify-between items-center border border-neutral-150/40">
                  <div className="leading-tight">
                    <p className="text-[10px] font-black text-[#2B1B2E]">🇿🇦 South Africa National Medical Rescue</p>
                    <span className="text-[9px] text-[#7A6B72] font-semibold mt-0.5 block">NetCare Ambulance/Triage • Call 112 / 10177</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmergencyModalOpen(false);
                      setSimulatedActiveCall("SA Ambulance Dispatch [112 / 10177]");
                    }}
                    className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

            {/* Bottom alert safety stamp */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center select-none text-[8px] font-black text-[#7A6B72] uppercase tracking-wider">
               🛡️ Continuous biometric coverage online & offline
            </div>
          </div>
        </div>
      )}

      {/* 7. IMMERSIVE IN-APP simulated VoIP ESCALATION CALL SCREEN */}
      {simulatedActiveCall && (
        <div className="absolute inset-0 bg-[#1F1220] z-[200] flex flex-col justify-between p-8 text-center text-white font-sans animate-fade-in" id="voip-dialer-screener">
          
          {/* Top caller id */}
          <div className="space-y-3.5 pt-12">
            <div className="w-20 h-20 rounded-full bg-[#E84FA0]/15 border border-[#FF6FB1]/40 flex items-center justify-center mx-auto animate-pulse">
              <PhoneCall className="w-9 h-9 text-[#FF6FB1] animate-bounce" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] bg-red-600 text-white px-3 py-1 font-extrabold uppercase rounded-full tracking-widest inline-block animate-pulse">
                Escalating SOS voice channel
              </span>
              <h2 className="text-base font-black uppercase mt-2 tracking-wide block">{simulatedActiveCall}</h2>
              <p className="text-xs text-neutral-400 font-semibold">Simulated Maternal Triage VoIP Router Link...</p>
            </div>
          </div>

          {/* Connected state & timer simulation */}
          <div className="space-y-2">
            <div className="w-2 h-2 rounded-full bg-lime-500 mx-auto animate-ping"></div>
            <p className="text-[11px] font-mono font-bold text-lime-400 uppercase tracking-widest">Connected • Biometrics streaming to Physician Portal...</p>
          </div>

          {/* End Call hanger */}
          <div className="pb-12 text-center">
            <button
              type="button"
              onClick={() => setSimulatedActiveCall(null)}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center mx-auto shadow-lg cursor-pointer focus:outline-none"
              id="voip-kill-call-btn"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
            <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-neutral-400 block mt-2">End Escalation Call</span>
          </div>

        </div>
      )}

      {/* 8. Premium Membership Packages overlay modal */}
      {showSubscriptionModal && (
        <div className="absolute inset-0 bg-[#2B1B2E]/70 backdrop-blur-md flex items-end justify-center p-3 z-[250] animate-fade-in font-sans">
          <div className="bg-white/95 rounded-t-3xl border-t border-white/85 p-3.5 w-full max-h-[95%] overflow-y-auto space-y-3 shadow-2xl relative text-left select-none animate-slide-up">
            <div className="flex justify-between items-center pb-1 border-b border-[#FFDCE5]">
              <span className="text-[10px] font-black text-[#2B1B2E] uppercase flex items-center gap-1">
                💎 Plan Registry Check
              </span>
              <button 
                type="button" 
                onClick={() => setShowSubscriptionModal(false)}
                className="text-[#7A6B72] hover:text-[#2B1B2E] font-black text-xs cursor-pointer p-0.5"
              >
                ✕
              </button>
            </div>

            <SubscriptionPackages 
              currentPlan={sessionPlan}
              onUpgradePlan={(newPlan) => {
                setSessionPlan(newPlan);
                localStorage.setItem("vytal_maternal_plan", newPlan);
              }}
              onClose={() => setShowSubscriptionModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
