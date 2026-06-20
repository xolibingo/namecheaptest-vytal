import React, { useState, useEffect } from "react";
import { Patient, VitalsLog, Clinician, PatientReport, MaternalMeeting, PostpartumCheckup, HospitalVisit } from "../types";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Activity, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  UserCheck, 
  MapPin, 
  Phone, 
  Clock, 
  FileText, 
  UserPlus, 
  CheckCircle2, 
  ShieldAlert, 
  Heart,
  CalendarDays,
  Smile,
  LogOut,
  Download,
  Eye,
  EyeOff,
  ArrowRight,
  Video // To show Google Meet meetings beautifully!
} from "lucide-react";
import { signInWithGoogleMeet, createGoogleMeetSpace } from "../lib/firebase";

interface ClinicianPortalProps {
  currentClinician: Clinician;
  onLogout: () => void;
  sharedReports: PatientReport[];
  onReviewReport: (reportId: string, action: "Normal" | "Monitor" | "Refer to care", notes: string) => void;
  communityPosts: any[];
  communityComments: any[];
  safetyAuditLogs: any[];
  moderationAppeals: any[];
  onResolveAppeal: (appealId: string, resolution: "approved" | "rejected", notes: string) => void;
  onToggleModeratePost: (postId: string, isComment?: boolean) => void;
  maternalMeetings: MaternalMeeting[];
  onScheduleMeeting: (patientId: string, patientName: string, topic: string, scheduledFor: string, meetingUri: string, meetingCode: string) => void;
  isOfflineMode?: boolean;
  onToggleOfflineMode?: () => void;
  postpartumCheckups?: PostpartumCheckup[];
  onUpdatePostpartumCheckup?: (updated: PostpartumCheckup) => void;
  hospitalVisits?: HospitalVisit[];
  onAddHospitalVisit?: (newVisit: HospitalVisit) => void;
}

export default function ClinicianPortal({ 
  currentClinician, 
  onLogout,
  sharedReports,
  onReviewReport,
  communityPosts,
  communityComments,
  safetyAuditLogs,
  moderationAppeals,
  onResolveAppeal,
  onToggleModeratePost,
  maternalMeetings = [],
  onScheduleMeeting,
  isOfflineMode = false,
  onToggleOfflineMode,
  postpartumCheckups = [],
  onUpdatePostpartumCheckup,
  hospitalVisits = [],
  onAddHospitalVisit
}: ClinicianPortalProps) {
  
  // SADC Patient Cohort Registry
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "pat-1",
      name: "Zanele Dlamini",
      phoneNumber: "+268 7612 9081",
      age: 26,
      gestationalWeeks: 36,
      edd: "2026-07-15",
      riskLevel: "high",
      clinicId: "mbabane-primary",
      medicalHistory: ["Prior gestational hypertension in 2024", "Asthma"],
      riskDrivingSignal: "Clinical elevated baseline BP 142/91",
      consentVersion: "v1.2-SZ",
      createdAt: new Date().toISOString()
    },
    {
      id: "pat-2",
      name: "Kelebogile Mokgoro",
      phoneNumber: "+268 7914 2231",
      age: 31,
      gestationalWeeks: 28,
      edd: "2026-09-08",
      riskLevel: "medium",
      clinicId: "mbabane-primary",
      medicalHistory: ["Nulliparous", "Mild anemia diagnosed week 14"],
      riskDrivingSignal: "Under evaluation. Active home alerts toggled.",
      consentVersion: "v1.2-SZ",
      createdAt: new Date().toISOString()
    },
    {
      id: "pat-3",
      name: "Nokuthula Zulu",
      phoneNumber: "+27 82 345 6789",
      age: 23,
      gestationalWeeks: 12,
      edd: "2026-12-25",
      riskLevel: "low",
      clinicId: "mbabane-primary",
      medicalHistory: ["None registered"],
      riskDrivingSignal: "Baseline healthy profile",
      consentVersion: "v1.2-ZA",
      createdAt: new Date().toISOString()
    },
    {
      id: "pat-4",
      name: "Lerato Phiri",
      phoneNumber: "+268 7644 1122",
      age: 29,
      gestationalWeeks: 20,
      edd: "2026-11-02",
      riskLevel: "low",
      clinicId: "mbabane-primary",
      medicalHistory: ["None registered"],
      riskDrivingSignal: "Baseline healthy registry",
      consentVersion: "v1.2-SZ",
      createdAt: new Date().toISOString()
    },
    {
      id: "pat-5",
      name: "Thandi Mabaso",
      phoneNumber: "+27 83 987 6543",
      age: 34,
      gestationalWeeks: 31,
      edd: "2026-08-20",
      riskLevel: "high",
      clinicId: "mbabane-primary",
      medicalHistory: ["Chronic pre-pregnancy obesity", "Prior preeclampsia in second pregnancy"],
      riskDrivingSignal: "Severe Pre-Eclampsia vulnerability markers",
      consentVersion: "v1.2-ZA",
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>("pat-2");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [chartTab, setChartTab] = useState<"BP" | "HR" | "Temp" | "Weight">("BP");
  const [activePortalTab, setActivePortalTab] = useState<"dashboard" | "telehealth">("dashboard");
  const [reportChartToggles, setReportChartToggles] = useState<{[key: string]: "BP" | "Weight"}>({});

  // Clinical Response states
  const [selectedAlertId, setSelectedAlertId] = useState<string>("");
  const [clinicianAction, setClinicianAction] = useState<"Normal" | "Monitor" | "Refer to care">("Monitor");
  const [clinicianNotes, setClinicianNotes] = useState("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Google Meet scheduling states
  const [meetTopic, setMeetTopic] = useState("");
  const [meetScheduledTime, setMeetScheduledTime] = useState("");
  const [isGeneratingMeetCode, setIsGeneratingMeetCode] = useState(false);
  const [googleMeetError, setGoogleMeetError] = useState("");
  const [showMeetSuccess, setShowMeetSuccess] = useState(false);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState("");
  const [schedPatientId, setSchedPatientId] = useState<string>("pat-2");

  useEffect(() => {
    let pObj = activePatient;
    if (activePortalTab === "telehealth") {
      pObj = patients.find(p => p.id === schedPatientId) || patients[1];
    }
    if (pObj) {
      setMeetTopic(`Prenatal Sync: ${pObj.name} (Gestation Week ${pObj.gestationalWeeks})`);
      
      const oneHourAhead = new Date(Date.now() + 3600000);
      setMeetScheduledTime(oneHourAhead.toISOString().slice(0, 16));
    }
  }, [selectedPatientId, schedPatientId, activePortalTab]);

  // Select active patient details
  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[1];

  // Simulated synthetic historical vitals logs for patient trend diagnostics
  const [vitalsHistory, setVitalsHistory] = useState<VitalsLog[]>([
    { id: "log-1", patientId: "pat-2", systolic: 110, diastolic: 70, pulse: 78, temperature: 36.4, weight: 68.0, recordedBy: "Self", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 4).toISOString() }, // 4 weeks ago
    { id: "log-2", patientId: "pat-2", systolic: 112, diastolic: 72, pulse: 80, temperature: 36.5, weight: 69.2, recordedBy: "Mbabane Nurse", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 3).toISOString() }, // 3 weeks ago
    { id: "log-3", patientId: "pat-2", systolic: 115, diastolic: 74, pulse: 82, temperature: 36.6, weight: 70.1, recordedBy: "Self", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 2).toISOString() }, // 2 weeks ago
    { id: "log-4", patientId: "pat-2", systolic: 118, diastolic: 75, pulse: 86, temperature: 36.7, weight: 71.5, recordedBy: "Self", createdAt: new Date().toISOString() } // Today
  ]);

  // Adjust vitals history in real time on active patient choice to avoid static logs
  useEffect(() => {
    const isHighRisk = activePatient?.riskLevel === "high";
    const bpMult = isHighRisk ? 1.2 : 1.0;
    
    setVitalsHistory([
      { id: "h-1", patientId: activePatient.id, systolic: Math.round(110 * bpMult), diastolic: Math.round(70 * bpMult), pulse: 78, temperature: 36.4, weight: 68.0, recordedBy: "Self", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 3).toISOString() },
      { id: "h-2", patientId: activePatient.id, systolic: Math.round(112 * bpMult), diastolic: Math.round(72 * bpMult), pulse: 82, temperature: 36.5, weight: 69.4, recordedBy: "CHW", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 2).toISOString() },
      { id: "h-3", patientId: activePatient.id, systolic: Math.round(115 * bpMult), diastolic: Math.round(74 * bpMult), pulse: 85, temperature: 36.6, weight: 70.5, recordedBy: "Self", createdAt: new Date(Date.now() - 3600000 * 24 * 7 * 1).toISOString() },
      { id: "h-4", patientId: activePatient.id, systolic: Math.round(118 * bpMult), diastolic: Math.round(75 * bpMult), pulse: 88, temperature: 36.7, weight: 71.5, recordedBy: "Self", createdAt: new Date().toISOString() }
    ]);
  }, [selectedPatientId]);

  // Handle clinical review feedback
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId) return;

    onReviewReport(selectedAlertId, clinicianAction, clinicianNotes);
    setReviewSuccessMsg("✅ Clinical review registered successfully. Instructions dispatched back to patient.");
    setClinicianNotes("");
    
    setTimeout(() => {
      setReviewSuccessMsg("");
      setSelectedAlertId("");
    }, 2000);
  };

  // Google Meet Telehealth Space Scheduler
  const handleCreateMeetCall = async () => {
    setIsGeneratingMeetCode(true);
    setGoogleMeetError("");
    setShowMeetSuccess(false);

    try {
      const pObj = activePortalTab === "telehealth"
        ? (patients.find(p => p.id === schedPatientId) || patients[1])
        : activePatient;

      if (!pObj) {
        throw new Error("No valid patient selected for consultation.");
      }

      // 1. Authenticate with Google Workspace (Meet Scopes)
      const authResponse = await signInWithGoogleMeet();
      
      // 2. Call Google Meet Spaces REST API
      const meetSpace = await createGoogleMeetSpace();

      // 3. Dispatch to synced database
      onScheduleMeeting(
        pObj.id,
        pObj.name,
        meetTopic,
        new Date(meetScheduledTime).toISOString(),
        meetSpace.meetingUri,
        meetSpace.meetingCode
      );

      setLastGeneratedUrl(meetSpace.meetingUri);
      setShowMeetSuccess(true);
    } catch (err: any) {
      console.error(err);
      setGoogleMeetError(err.message || "Failed to authenticate or generate Google Meet space.");
    } finally {
      setIsGeneratingMeetCode(false);
    }
  };

  // Filter cohort list matching search query and risk rating
  const filteredCohort = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phoneNumber.includes(searchQuery);
    const matchRisk = filterRisk === "all" || p.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  // Calculate pending reviews length
  const pendingAlerts = sharedReports.filter(r => r.status === "pending");

  // Generate chart data for Recharts
  const chartData = vitalsHistory.map(log => ({
    date: new Date(log.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    "Systolic BP": log.systolic,
    "Diastolic BP": log.diastolic,
    "Heart Rate (bpm)": log.pulse,
    "Body Temp (°C)": log.temperature,
    "Weight (kg)": log.weight
  }));

  // Recharts custom tick styles
  const chartStyles = {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontSize: "10px",
    fill: "#7A6B72"
  };

  // Helper to generate custom, realistic pregnancy trend data (BP & Weight over gestational weeks) for any patient report
  const getPatientTrendData = (patientId: string, currentWeeks: number) => {
    const pat = patients.find(p => p.id === patientId) || patients[1];
    const isHighBP = pat.riskLevel === "high";
    const isHighWeight = pat.id === "pat-5";
    
    const numPoints = 5;
    const dataPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
      // Linear scaling of gestational weeks up to currentWeeks
      const wk = Math.max(4, Math.round((currentWeeks / (numPoints - 1)) * i));
      
      const baseWeight = isHighWeight ? 90 : 64;
      const weightGain = (wk * 0.32) + (i * 0.15); // gentle weight increase
      const weight = Math.round((baseWeight + weightGain) * 10) / 10;
      
      let systolic = 114;
      let diastolic = 74;
      
      if (pat.riskLevel === "high") {
        systolic = Math.round(118 + (wk * 0.65) + (i * 1.2));
        diastolic = Math.round(76 + (wk * 0.42) + (i * 0.8));
      } else if (pat.riskLevel === "medium") {
        systolic = Math.round(115 + (wk * 0.22) + (i * 0.4));
        diastolic = Math.round(74 + (wk * 0.14) + (i * 0.2));
      } else {
        // Normal
        systolic = Math.round(112 + Math.sin(i * 1.5) * 2);
        diastolic = Math.round(72 + Math.cos(i * 1.5) * 1.5);
      }
      
      dataPoints.push({
        week: `Wk ${wk}`,
        "Systolic BP": systolic,
        "Diastolic BP": diastolic,
        "Weight (kg)": weight
      });
    }
    return dataPoints;
  };

  const renderReportTrendChart = (reportId: string, patientId: string, gestationalWeeks: number) => {
    const data = getPatientTrendData(patientId, gestationalWeeks);
    const activeToggle = reportChartToggles[reportId] || "BP";
    
    const setToggle = (toggleVal: "BP" | "Weight") => {
      setReportChartToggles(prev => ({
        ...prev,
        [reportId]: toggleVal
      }));
    };

    return (
      <div className="mt-3 p-3 bg-white border border-[#CFE6E3]/60 rounded-2xl space-y-2.5 text-left shadow-2xs" id={`report-trend-chart-box-${reportId}`}>
        <div className="flex justify-between items-center bg-[#FFF9F6] p-2 rounded-xl border border-neutral-150/20">
          <div className="space-y-0.5">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#4F7066] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF6FB1]" /> Maternal Pregnancy Trend Charts
            </span>
            <p className="text-[8.5px] font-semibold text-[#7A6B72] leading-none">Interactive Recharts visualization over gestation course</p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-white border border-neutral-200 p-0.5 rounded-lg shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToggle("BP");
              }}
              className={`text-[8.5px] px-2 py-1 rounded font-black uppercase cursor-pointer transition-all ${
                activeToggle === "BP"
                  ? "bg-[#4F7066] text-white"
                  : "text-[#7A6B72] hover:text-[#2B1B2E]"
              }`}
            >
              BP Trend
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToggle("Weight");
              }}
              className={`text-[8.5px] px-2 py-1 rounded font-black uppercase cursor-pointer transition-all ${
                activeToggle === "Weight"
                  ? "bg-[#4F7066] text-white"
                  : "text-[#7A6B72] hover:text-[#2B1B2E]"
              }`}
            >
              Weight Gain
            </button>
          </div>
        </div>

        {/* Small, clean chart wrapper */}
        <div className="h-32 w-full relative" id={`report-chart-${reportId}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE9" />
              <XAxis dataKey="week" tick={chartStyles} />
              <YAxis tick={chartStyles} />
              <Tooltip
                contentStyle={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '9.5px',
                  borderRadius: '12px',
                  border: '1px solid #EAEBEA',
                  background: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
                }}
              />
              <Legend wrapperStyle={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '8.5px', marginTop: 2 }} />
              
              {activeToggle === "BP" ? (
                <>
                  <Line type="monotone" dataKey="Systolic BP" stroke="#E84FA0" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Diastolic BP" stroke="#FF6FB1" strokeWidth={1.8} dot={{ r: 2 }} />
                </>
              ) : (
                <Line type="monotone" dataKey="Weight (kg)" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in font-sans text-[#2B1B2E]" id="clinician-portal-root">
      
      {/* Clinician Hub Top Header Band */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-xl p-5 rounded-3xl" id="clinician-dashboard-header">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-100 border-2 border-white shadow-xs shrink-0 flex items-center justify-center relative">
            <img 
              src="/src/assets/images/maternal_baby_stages_1781801156793.jpg" 
              alt="Clinician Avatar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover shrink-0"
            />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black tracking-tight uppercase text-emerald-950">Welcome, {currentClinician.name}</h1>
            <p className="text-xs text-[#7A6B72] font-semibold leading-normal">
              🌐 Authorized Prenatal Obstetric Specialist • Registry Clinic: <b>Mbabane Maternal Health Centre</b>
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          type="button"
          className="px-4 py-2 text-xs font-black bg-white hover:bg-neutral-50 text-[#E84FA0] border border-[#FF6FB1]/20 rounded-xl flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4 text-[#FF6FB1]" />
          <span>Exit Workspace</span>
        </button>
      </div>

      {/* Clinician Portal Tabs Selection Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-100/80 border border-neutral-200/50 rounded-2xl w-full sm:w-fit self-start font-sans shadow-2xs" id="clinician-portal-tabs-selector">
        <button
          type="button"
          onClick={() => setActivePortalTab("dashboard")}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer transition-all flex items-center gap-2 select-none ${
            activePortalTab === "dashboard"
              ? "bg-[#FF6FB1] text-white shadow-sm font-extrabold shadow-3xs"
              : "text-[#2B1B2E]/80 hover:bg-white"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Pregnancy Cohort Registry</span>
        </button>
        <button
          type="button"
          onClick={() => setActivePortalTab("telehealth")}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer transition-all flex items-center gap-2 select-none relative ${
            activePortalTab === "telehealth"
              ? "bg-[#FF6FB1] text-white shadow-sm font-extrabold shadow-3xs"
              : "text-[#2B1B2E]/80 hover:bg-white"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Telehealth Consultation Hub</span>
          {maternalMeetings.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E84FA0] text-[8px] font-black text-white shrink-0">
              {maternalMeetings.length}
            </span>
          )}
        </button>
      </div>

      {activePortalTab === "dashboard" && (
        <>
          {/* Overview stats metric cards panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="cohort-clinical-metrics">
        
        {/* Total Active Patients */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-left flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-[#7A6B72] uppercase tracking-wider block">Active Cohort</span>
            <span className="text-2xl font-black font-mono block text-emerald-950">{patients.length}</span>
            <span className="text-[10px] text-emerald-800 font-bold block">SADC Regional Node</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Reports Awaiting Review */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-left flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-[#7A6B72] uppercase tracking-wider block">Reviews Pending</span>
            <span className={`text-2xl font-black font-mono block ${pendingAlerts.length > 0 ? "text-[#E84FA0] animate-pulse" : "text-emerald-950"}`}>
              {pendingAlerts.length}
            </span>
            <span className="text-[10px] text-[#7A6B72] font-medium block">Awaiting Physician Triage</span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pendingAlerts.length > 0 ? "bg-red-50 text-red-500 border-red-100 animate-pulse" : "bg-neutral-50 text-neutral-400 border-neutral-100"}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Severe Priority Alarms */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-left flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-[#7A6B72] uppercase tracking-wider block">Urgent Action</span>
            <span className="text-2xl font-black font-mono block text-red-600">
              {sharedReports.filter(r => r.severity === "Referral" && r.status === "pending").length}
            </span>
            <span className="text-[10px] text-red-500 font-extrabold block">Immediate Clinic Escorts</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
            <ShieldAlert className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Appointments Scheduled Today */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm text-left flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-[#7A6B72] uppercase tracking-wider block">Visits Today</span>
            <span className="text-2xl font-black font-mono block text-emerald-950">2</span>
            <span className="text-[10px] text-[#7A6B72] font-medium block">1 Video Consult scheduled</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ALERTS SECTION: Live Patient self-reports needing prompt clinician advice */}
      {pendingAlerts.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-red-50/50 to-white/60 backdrop-blur-xl border-2 border-red-200 shadow-lg rounded-3xl text-left space-y-4" id="live-triage-alarm-deck">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider">CRITICAL ACTIONS REQUIRED • PENDING ALERTS AWAITING TRIAGE RESPONSE ({pendingAlerts.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAlerts.map((rep) => (
              <div
                key={rep.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedPatientId(rep.patientId);
                  setSelectedAlertId(rep.id);
                  setClinicianAction(rep.severity === "Referral" ? "Refer to care" : "Monitor");
                  setClinicianNotes(`Based on your Week ${rep.gestationalWeeks} symptom of ${rep.symptom}, we recommend...`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedPatientId(rep.patientId);
                    setSelectedAlertId(rep.id);
                    setClinicianAction(rep.severity === "Referral" ? "Refer to care" : "Monitor");
                    setClinicianNotes(`Based on your Week ${rep.gestationalWeeks} symptom of ${rep.symptom}, we recommend...`);
                  }
                }}
                className={`p-4 bg-white/90 hover:bg-neutral-50 rounded-2xl border text-left scale-100 hover:scale-[1.01] transition-all cursor-pointer block w-full space-y-2 select-none ${
                  selectedAlertId === rep.id 
                    ? "ring-2 ring-[#FF6FB1] border-[#FF6FB1]" 
                    : rep.severity === "Referral" 
                    ? "border-red-300 shadow-sm" 
                    : "border-amber-300 shadow-xs"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#2B1B2E] uppercase">{rep.patientName}</h3>
                    <span className="text-[9px] text-[#7A6B72] font-semibold">Gestation Age: <b>Week {rep.gestationalWeeks}</b></span>
                  </div>
                  <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    rep.severity === "Referral" ? "bg-red-100 text-red-700 animate-pulse" : "bg-amber-100 text-amber-700"
                  }`}>
                    {rep.severity === "Referral" ? "🚨 referral request" : "⚠️ watch alert"}
                  </span>
                </div>

                <div className="text-[10.5px] font-semibold text-[#2B1B2E] space-y-1">
                  <p className="uppercase"><b className="text-[#7A6B72]">SYMPTOM:</b> {rep.symptom}</p>
                  <p className="italic font-medium leading-relaxed bg-[#FFF9F6] p-2 rounded-xl text-[10px] text-neutral-800 border border-neutral-100">
                    "{rep.description}"
                  </p>
                </div>

                {selectedAlertId === rep.id && (
                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    {renderReportTrendChart(rep.id, rep.patientId, rep.gestationalWeeks)}
                  </div>
                )}

                <div className="flex justify-between items-center text-[8.5px] font-bold text-[#E84FA0] pt-2 border-t border-dashed border-neutral-100 leading-none">
                  <span>🎙️ {rep.voiceNoteSimulated ? "VOICE NOTE ENCRYPTED ATTACHMENT" : "TEXT-ONLY SIMULATION"}</span>
                  <span className="text-neutral-500">
                    {selectedAlertId === rep.id ? "Selected for clinical review" : "Click to view trends & review"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main workspaces split view layout: Left search + cohort, Right active patient details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="clinician-split-panel">
        
        {/* LEFT COLUMN: Regional Cohort Search and Listing */}
        <div className="lg:col-span-4 bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl p-4 space-y-4 text-left shadow-xs">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E]">Maternal Cohort List</h2>
            <p className="text-[10px] text-[#7A6B72] font-semibold leading-normal">Mbabane Regional Pregnancy Register</p>
          </div>

          {/* Search bar inputs */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search patients by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFF9F6] border border-[#CFE6E3]/40 text-xs pl-9 pr-4 py-2.5 rounded-xl text-[#2B1B2E] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Risk Level filter chips */}
          <div className="flex gap-1 bg-[#FFF9F6] p-0.5 rounded-lg border border-neutral-100">
            {["all", "high", "medium", "low"].map((rk) => (
              <button
                key={rk}
                type="button"
                onClick={() => setFilterRisk(rk)}
                className={`text-[9px] font-extrabold uppercase py-1 px-2 flex-1 rounded-md cursor-pointer transition-all ${
                  filterRisk === rk 
                    ? rk === "high"
                      ? "bg-red-500 text-white font-black"
                      : rk === "medium"
                      ? "bg-amber-500 text-white font-black"
                      : rk === "low"
                      ? "bg-emerald-500 text-white font-black"
                      : "bg-[#2B1B2E] text-white font-black"
                    : "text-[#7A6B72] hover:text-[#2B1B2E]"
                }`}
              >
                {rk}
              </button>
            ))}
          </div>

          {/* Cohort list results */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar">
            {filteredCohort.length === 0 ? (
              <p className="text-center italic py-10 font-semibold text-neutral-400 text-xs">No matching regional maternal registers found.</p>
            ) : (
              filteredCohort.map((pat) => {
                const isActive = pat.id === selectedPatientId;
                const totalPendingReports = sharedReports.filter(r => r.patientId === pat.id && r.status === "pending").length;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setSelectedPatientId(pat.id)}
                    className={`p-3 rounded-2xl w-full text-left flex items-center justify-between border transition-all cursor-pointer ${
                      isActive 
                        ? "bg-gradient-to-r from-emerald-50 to-white/70 border-emerald-400 shadow-md scale-[1.01]" 
                        : "bg-white/70 hover:bg-white border-white/40 shadow-xs"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#2B1B2E] truncate">{pat.name}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          pat.riskLevel === "high" 
                            ? "bg-red-500" 
                            : pat.riskLevel === "medium" 
                            ? "bg-amber-500" 
                            : "bg-emerald-500"
                        }`} title={`Risk Rating: ${pat.riskLevel.toUpperCase()}`}></span>
                      </div>
                      <div className="flex justify-between text-[9.5px] text-[#7A6B72] font-semibold">
                        <span>GA: <b>Week {pat.gestationalWeeks}</b></span>
                        <span className="truncate">EDD: {pat.edd}</span>
                      </div>
                    </div>

                    {/* Pending Reports Alert badging counts */}
                    {totalPendingReports > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-[#E84FA0] text-white font-extrabold font-mono text-[10px] flex items-center justify-center animate-pulse shadow-xs">
                        {totalPendingReports}
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    )}

                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Selected Case Details */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Case Header */}
          <div className="p-5 bg-white/50 backdrop-blur-md rounded-3xl border border-[#CFE6E3]/60 text-left space-y-4 shadow-xs" id="interactive-patient-dossier">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/40">
              <div className="space-y-1">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#E84FA0] bg-pink-100/60 border border-[#FF6FB1]/20 px-2.5 py-0.5 rounded-full inline-block">
                  active prenatal index
                </span>
                <h3 className="text-lg font-black tracking-tight text-emerald-950 uppercase">{activePatient.name}</h3>
                <p className="text-xs text-[#7A6B72] font-semibold">
                  🧑‍🧑‍🧒 Age: <b>{activePatient.age} Years</b> • Gestation Span: <b>Week {activePatient.gestationalWeeks}</b> • Due: <b>{activePatient.edd}</b>
                </p>
              </div>

              <div className="flex gap-2 font-mono">
                <span className="text-[10px] bg-white text-emerald-950 font-bold px-2.5 py-1.5 rounded-xl border border-white/50 shadow-2xs flex items-center gap-1.5">
                  🛡️ POPIA Status: <b className="text-emerald-700">GRANTED</b>
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl uppercase text-white shadow-3xs ${
                  activePatient.riskLevel === "high" 
                    ? "bg-red-500 animate-pulse" 
                    : activePatient.riskLevel === "medium" 
                    ? "bg-amber-500" 
                    : "bg-emerald-500"
                }`}>
                  Risk Rating: {activePatient.riskLevel}
                </span>
              </div>
            </div>

            {/* Obstetric History information row */}
            <div className="p-3 bg-[#FFF9F6] border border-neutral-100 rounded-2xl text-[11px] leading-relaxed">
              <span className="text-[8.5px] font-bold text-[#7A6B72] uppercase block tracking-wider mb-0.5">Clinical History & Comorbidities</span>
              {activePatient.medicalHistory.map((m, i) => (
                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold bg-neutral-100 text-neutral-800 border border-neutral-200 mr-1.5 mb-1.5">
                  📌 {m}
                </span>
              ))}
              <p className="text-[10px] text-red-700 font-extrabold uppercase tracking-tight mt-1">
                🚨 driving diagnosis: {activePatient.riskDrivingSignal}
              </p>
            </div>
          </div>

          {/* 2. Physical Condition History Interactive Charts Panel (BP, HR, Temp, Weight) */}
          <div className="p-5 bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl text-left space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E]">Antenatal Trend Diagnostics Chart</h3>
                <span className="text-[9.5px] text-[#7A6B72] font-semibold">Continuous physical home telemetry history</span>
              </div>

              {/* 4 Interactive chart selector tabs */}
              <div className="flex bg-[#FFF9F6] p-0.5 rounded-xl border border-neutral-100 flex-wrap shrink-0">
                {(["BP", "HR", "Temp", "Weight"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setChartTab(t)}
                    className={`text-[9.5px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      chartTab === t 
                        ? "bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white shadow-3xs" 
                        : "text-[#7A6B72] hover:text-[#2B1B2E]"
                    }`}
                  >
                    {t === "BP" ? "Blood Pressure" : t === "HR" ? "Pulse (HR)" : t === "Temp" ? "Temp (°C)" : "Weight (kg)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts chart render box */}
            <div className="h-64 bg-white/80 border border-neutral-100 p-4 rounded-2xl relative shadow-xs" id="maternal-recharts-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE9" />
                  <XAxis dataKey="date" tick={chartStyles} />
                  <YAxis tick={chartStyles} />
                  <Tooltip 
                    contentStyle={{ 
                      fontFamily: '"Plus Jakarta Sans", sans-serif', 
                      fontSize: '11px', 
                      borderRadius: '16px', 
                      border: '1px solid #FFF',
                      background: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
                    }} 
                  />
                  <Legend wrapperStyle={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: '10px' }} />
                  
                  {chartTab === "BP" && (
                    <>
                      <Line type="monotone" dataKey="Systolic BP" stroke="#E84FA0" strokeWidth={3.5} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Diastolic BP" stroke="#FF6FB1" strokeWidth={2.5} />
                    </>
                  )}
                  {chartTab === "HR" && (
                    <Line type="monotone" dataKey="Heart Rate (bpm)" stroke="#10B981" strokeWidth={3.5} activeDot={{ r: 8 }} />
                  )}
                  {chartTab === "Temp" && (
                    <Line type="monotone" dataKey="Body Temp (°C)" stroke="#F59E0B" strokeWidth={3.5} activeDot={{ r: 8 }} />
                  )}
                  {chartTab === "Weight" && (
                    <Line type="monotone" dataKey="Weight (kg)" stroke="#3B82F6" strokeWidth={3.5} activeDot={{ r: 8 }} />
                  )}

                </LineChart>
              </ResponsiveContainer>
              
              {/* Educational clinical annotation text under the chart */}
              <div className="absolute bottom-2 right-4 text-[7.5px] font-mono text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 pointer-events-none">
                POPIA secure data node encryption active
              </div>
            </div>
          </div>

          {/* == NEW: POSTPARTUM CARE & HOSPITAL VISIT HISTORY PANEL == */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* A. Postpartum Care Tracking */}
            <div className="p-5 bg-white border border-[#E84FA0]/15 rounded-3xl text-left space-y-4 shadow-xs">
              <div>
                <span className="text-[8px] font-black uppercase text-[#E84FA0] bg-pink-50 border border-[#FF6FB1]/20 px-2 py-0.5 rounded-full">
                  Postnatal Care Portal
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E] mt-1.5">
                  🍼 14-Day Postpartum Checklist & Diagnostics
                </h3>
                <p className="text-[10px] text-[#7A6B72] font-semibold">
                  Monitor patient wellness milestones, bleeding indicators, and breastfeeding latch
                </p>
              </div>

              {/* Status checklist of milestones for active patient */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {postpartumCheckups.map((checkup) => {
                  return (
                    <div key={checkup.id} className="p-3.5 bg-neutral-50/70 border border-neutral-200/50 rounded-2xl space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-[#2B1B2E] uppercase">{checkup.day}</span>
                        <select 
                          value={checkup.status} 
                          onChange={(e) => {
                            if (onUpdatePostpartumCheckup) {
                              onUpdatePostpartumCheckup({ ...checkup, status: e.target.value as any });
                            }
                          }}
                          className="bg-white border border-neutral-200 p-1 text-[9px] font-extrabold rounded-lg cursor-pointer text-[#2B1B2E]"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="missed">Missed</option>
                        </select>
                      </div>

                      <div className="text-[10px] space-y-1.5 leading-normal">
                        <div>
                          <label className="text-[8px] font-bold text-[#7A6B72] uppercase block mb-0.5">Clinical Evaluation Notes:</label>
                          <textarea 
                            value={checkup.doctorNotes}
                            onChange={(e) => {
                              if (onUpdatePostpartumCheckup) {
                                onUpdatePostpartumCheckup({ ...checkup, doctorNotes: e.target.value });
                              }
                            }}
                            rows={2}
                            placeholder="Type evaluation results..."
                            className="w-full bg-white border border-neutral-150 p-2 text-[10px] rounded-lg text-[#2B1B2E] font-semibold focus:outline-none focus:ring-1 focus:ring-pink-300"
                          />
                        </div>

                        {checkup.status === "completed" && (
                          <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-xl border border-neutral-100">
                            <div>
                              <span className="text-[7.5px] font-bold text-[#7A6B72] uppercase">Systolic/Diastolic BP:</span>
                              <input 
                                type="text" 
                                value={checkup.vitals.bp} 
                                onChange={(e) => {
                                  if (onUpdatePostpartumCheckup) {
                                    onUpdatePostpartumCheckup({ 
                                      ...checkup, 
                                      vitals: { ...checkup.vitals, bp: e.target.value } 
                                    });
                                  }
                                }}
                                className="w-full bg-neutral-50 p-1 text-[9.5px] font-bold rounded"
                              />
                            </div>
                            <div>
                              <span className="text-[7.5px] font-bold text-[#7A6B72] uppercase">Newborn Jaundice Status:</span>
                              <input 
                                type="text" 
                                value={checkup.neonatalJaundice} 
                                onChange={(e) => {
                                  if (onUpdatePostpartumCheckup) {
                                    onUpdatePostpartumCheckup({ ...checkup, neonatalJaundice: e.target.value });
                                  }
                                }}
                                className="w-full bg-neutral-50 p-1 text-[9.5px] font-bold rounded"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B. Hospital Visits and Registration Card */}
            <div className="p-5 bg-white border border-[#4F7066]/15 rounded-3xl text-left space-y-4 shadow-xs">
              <div>
                <span className="text-[8px] font-black uppercase text-[#4F7066] bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full">
                  Admission Timeline Registry
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E] mt-1.5">
                  🏥 Hospital Admittance History
                </h3>
                <p className="text-[10px] text-[#7A6B72] font-semibold">
                  Comprehensive hospital visit logs, diagnostic details, and physician advice
                </p>
              </div>

              {/* History list stream */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border-b border-dashed border-neutral-100 pb-3">
                {hospitalVisits.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 italic py-6 text-center">No clinical hospital visit logs recorded.</p>
                ) : (
                  hospitalVisits.map((visit) => (
                    <div key={visit.id} className="p-3 bg-neutral-50/70 border border-neutral-150 rounded-2xl text-[10px] space-y-1">
                      <div className="flex justify-between items-start font-black">
                        <span className="text-[#2B1B2E] uppercase">{visit.reason}</span>
                        <span className="text-[8.5px] text-[#7A6B72]">{visit.date}</span>
                      </div>
                      <p className="text-zinc-500 font-semibold">Location: <b>{visit.hospitalName}</b> • Clinician: <b>{visit.clinicianName}</b></p>
                      <p className="text-zinc-700 bg-white p-1.5 rounded-lg border border-neutral-100 italic">"diagnosis: {visit.diagnosis}. {visit.notes}"</p>
                    </div>
                  ))
                )}
              </div>

              {/* Form to log a new diagnostic hospital visit */}
              <div className="bg-[#FFF9F6] p-3 rounded-2xl border border-pink-100/40 space-y-2 text-[10px]" id="clinician-visit-log-form">
                <span className="text-[8px] font-black uppercase tracking-wider text-[#E84FA0] block">Log Hospital Admission Visit:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Visit Intake Reason:</label>
                    <input 
                      type="text" 
                      id="cli-visit-reason"
                      placeholder="e.g. Iron Deficiency check"
                      className="w-full bg-white border border-neutral-200 p-1.5 font-bold rounded-lg text-[#2B1B2E]"
                    />
                  </div>
                  <div>
                    <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Clinical Facility:</label>
                    <input 
                      type="text" 
                      id="cli-visit-hospital"
                      defaultValue="Mbabane General Hospital"
                      className="w-full bg-white border border-neutral-200 p-1.5 font-bold rounded-lg text-[#2B1B2E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Clinician Name:</label>
                    <input 
                      type="text" 
                      id="cli-visit-provider"
                      defaultValue={currentClinician.name}
                      className="w-full bg-white border border-neutral-200 p-1.5 font-bold rounded-lg text-[#2B1B2E]"
                    />
                  </div>
                  <div>
                    <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Diagnosis / Result:</label>
                    <input 
                      type="text" 
                      id="cli-visit-diag"
                      placeholder="e.g. Mild anemia (Hb 11.4)"
                      className="w-full bg-white border border-neutral-200 p-1.5 font-bold rounded-lg text-[#2B1B2E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[7.5px] font-bold text-zinc-500 uppercase block mb-0.5">Clinical Notes & Prescriptions:</label>
                  <textarea 
                    id="cli-visit-notes"
                    rows={1}
                    placeholder="Enter care guidelines..."
                    className="w-full bg-white border border-neutral-200 p-1.5 font-semibold rounded-lg text-[#2B1B2E] text-[10px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const reason = (document.getElementById("cli-visit-reason") as HTMLInputElement)?.value || "Routine Prenatal consultation";
                    const hospital = (document.getElementById("cli-visit-hospital") as HTMLInputElement)?.value || "Mbabane General Hospital";
                    const clin = (document.getElementById("cli-visit-provider") as HTMLInputElement)?.value || currentClinician.name;
                    const diag = (document.getElementById("cli-visit-diag") as HTMLInputElement)?.value || "Pregnancy wellness normal";
                    const notes = (document.getElementById("cli-visit-notes") as HTMLTextAreaElement)?.value || "Advised patient to keep tracking daily kicking count.";
                    
                    const newLog: HospitalVisit = {
                      id: `visit-${Date.now()}`,
                      patientId: activePatient.id,
                      patientName: activePatient.name,
                      date: new Date().toISOString().split('T')[0],
                      hospitalName: hospital,
                      reason: reason,
                      clinicianName: clin,
                      diagnosis: diag,
                      notes: notes,
                      followUpDate: "2026-07-15"
                    };

                    if (onAddHospitalVisit) {
                      onAddHospitalVisit(newLog);
                    }

                    // Reset fields
                    if (document.getElementById("cli-visit-reason")) {
                      (document.getElementById("cli-visit-reason") as HTMLInputElement).value = "";
                    }
                    if (document.getElementById("cli-visit-diag")) {
                      (document.getElementById("cli-visit-diag") as HTMLInputElement).value = "";
                    }
                    if (document.getElementById("cli-visit-notes")) {
                      (document.getElementById("cli-visit-notes") as HTMLTextAreaElement).value = "";
                    }
                  }}
                  className="w-full py-1.5 bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white rounded-lg text-[9px] font-black uppercase tracking-wider text-center cursor-pointer hover:opacity-95"
                >
                  Log Diagnostic Hospital visit
                </button>
              </div>
            </div>

          </div>

          {/* 3. Google Meet Clinical Telehealth Workspace */}
          <div className="p-5 bg-gradient-to-br from-[#FFF9F6] to-white border border-[#FF6FB1]/20 rounded-3xl text-left space-y-4 shadow-sm" id="google-meet-telehealth-workspace">
            <div className="flex items-center justify-between border-b border-[#FF6FB1]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E]">Google Meet Telehealth Center</h3>
                  <p className="text-[10px] text-[#7A6B72] font-semibold">Schedule and conduct remote video prenatal diagnostics</p>
                </div>
              </div>
              <span className="text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                🟢 API ACTIVE
              </span>
            </div>

            {googleMeetError && (
              <div className="p-3 bg-red-100 text-red-800 rounded-2xl text-[10.5px] font-bold">
                ⚠️ {googleMeetError}
              </div>
            )}

            {showMeetSuccess && (
              <div className="p-3.5 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-[11px] font-bold space-y-1.5 animate-bounce" style={{ animationIterationCount: 1, animationDuration: '2s' }}>
                <p>🎉 secure meeting space launched successfully!</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-emerald-800">{lastGeneratedUrl}</span>
                  <a href={lastGeneratedUrl} target="_blank" rel="noopener noreferrer" className="underline text-pink-600 hover:text-pink-800 font-black">TEST LINK</a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Form panel */}
              <div className="space-y-3 bg-white/40 p-4 rounded-2xl border border-neutral-100">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[#FF6FB1] block">Book New Consultation</span>
                
                <div>
                  <label htmlFor="meet-topic-val" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Consultation Title / Goal:</label>
                  <input
                    id="meet-topic-val"
                    type="text"
                    value={meetTopic}
                    onChange={(e) => setMeetTopic(e.target.value)}
                    placeholder="e.g. Pre-eclampsia Warning Sign Review"
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/10 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label htmlFor="meet-time-val" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Scheduled Sync Time:</label>
                  <input
                    id="meet-time-val"
                    type="datetime-local"
                    value={meetScheduledTime}
                    onChange={(e) => setMeetScheduledTime(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/10 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>

                <button
                  type="button"
                  disabled={isGeneratingMeetCode}
                  onClick={handleCreateMeetCall}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white hover:shadow-md transition-all text-[11px] font-black uppercase rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingMeetCode ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authorizing Meet space...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Authenticate & Create Google Meet</span>
                    </>
                  )}
                </button>
              </div>

              {/* History list panel */}
              <div className="space-y-3 bg-white/40 p-4 rounded-2xl border border-neutral-100 flex flex-col justify-between">
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-[#7A6B72] block mb-2">Scheduled Sync Sessions for {activePatient.name}</span>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {maternalMeetings.filter(m => m.patientId === activePatient.id).length === 0 ? (
                      <p className="text-[10px] text-neutral-400 italic font-semibold text-center py-6">No telehealth syncs scheduled. Use the form to initiate.</p>
                    ) : (
                      maternalMeetings.filter(m => m.patientId === activePatient.id).map(m => (
                        <div key={m.id} className="p-2.5 bg-white border border-neutral-100 rounded-xl flex items-center justify-between gap-1.5 shadow-3xs hover:border-[#FF6FB1]/35 transition-colors">
                          <div className="min-w-0 text-left">
                            <h4 className="text-[10.5px] font-black text-[#2B1B2E] truncate uppercase">{m.topic}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] text-[#7A6B72] font-semibold mt-0.5">
                              <CalendarDays className="w-3 h-3 text-[#FF6FB1]" />
                              <span>{new Date(m.scheduledFor).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(m.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                            </div>
                          </div>
                          
                          <a
                            href={m.meetingUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 text-[9px] font-black bg-[#E84FA0] text-white rounded-lg hover:bg-[#FF6FB1] transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-3xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>LAUNCH</span>
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 text-[9px] text-[#7A6B72] font-medium leading-normal">
                  💡 Meetings are tracked inside our maternal data node and automatically appear inside the patient's companion app for offline/online synchronization.
                </div>
              </div>
            </div>
          </div>

          {/* 4. Clinical Feedback Response Action Box */}
          <div className="p-5 bg-white/45 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl text-left space-y-4 shadow-sm" id="post-review-action-box">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#2B1B2E]">Dispatched Case Feedback & Directives</h3>
              <p className="text-[10px] text-[#7A6B72] font-semibold leading-normal">
                Post diagnostic evaluations and clinical instructions back to the mother's timeline
              </p>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl text-[11px] font-bold animate-pulse">
                {reviewSuccessMsg}
              </div>
            )}

            {/* Form list inputs */}
            <form onSubmit={handleSubmitReview} className="space-y-4 text-[11px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Pick report to review */}
                <div>
                  <label htmlFor="select-report-review" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Select Case Incident Report:</label>
                  <select
                    id="select-report-review"
                    value={selectedAlertId}
                    onChange={(e) => {
                      setSelectedAlertId(e.target.value);
                      const report = sharedReports.find(r => r.id === e.target.value);
                      if (report) {
                        setClinicianAction(report.severity === "Referral" ? "Refer to care" : "Monitor");
                        setClinicianNotes(`Regarding your symptom of ${report.symptom} submitted at GA Week ${report.gestationalWeeks}, we recommend...`);
                      }
                    }}
                    className="w-full bg-[#FFF9F6] border border-[#CFE6E3]/40 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Choose Awaiting Report (Select to activate review) --</option>
                    {sharedReports.filter(r => r.patientId === activePatient.id).map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.status.toUpperCase()}] {r.symptom} (Week {r.gestationalWeeks} GA)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Action instructions */}
                <div>
                  <label htmlFor="select-triage-action" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Obstetric Triage Action Plan:</label>
                  <div className="grid grid-cols-3 gap-1.5" id="select-triage-action">
                    {(["Normal", "Monitor", "Refer to care"] as const).map((act) => (
                      <button
                        key={act}
                        type="button"
                        disabled={!selectedAlertId}
                        onClick={() => setClinicianAction(act)}
                        className={`py-2 rounded-xl font-bold text-[9px] uppercase text-center border cursor-pointer transition-all ${
                          !selectedAlertId 
                            ? "opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200 text-neutral-400"
                            : clinicianAction === act
                            ? act === "Refer to care"
                              ? "bg-red-500 text-white border-red-500 font-extrabold shadow-sm"
                              : act === "Monitor"
                              ? "bg-amber-500 text-white border-amber-500 font-extrabold shadow-sm"
                              : "bg-emerald-500 text-white border-emerald-500 font-extrabold shadow-sm"
                            : "bg-white text-[#2B1B2E] border-[#CFE6E3]/30 hover:bg-neutral-50"
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {(() => {
                const activeSelectedReport = sharedReports.find((r) => r.id === selectedAlertId);
                if (!activeSelectedReport) return null;
                return (
                  <div className="space-y-1.5 p-3.5 bg-neutral-50 border border-neutral-200/40 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-[#2B1B2E] block">
                      📈 Active Report Trends: {activeSelectedReport.patientName} (GA Week {activeSelectedReport.gestationalWeeks})
                    </span>
                    {renderReportTrendChart(activeSelectedReport.id, activeSelectedReport.patientId, activeSelectedReport.gestationalWeeks)}
                  </div>
                );
              })()}

              {/* Text note description area */}
              <div>
                <label htmlFor="clinician-review-text" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Physician Prescriptions & Guidelines:</label>
                <textarea
                  id="clinician-review-text"
                  disabled={!selectedAlertId}
                  value={clinicianNotes}
                  onChange={(e) => setClinicianNotes(e.target.value)}
                  rows={3}
                  placeholder="Type clear medical advices. Keep instructions localized and action-oriented..."
                  className="w-full bg-[#FFF9F6] border border-[#CFE6E3]/40 text-xs p-3 rounded-2xl text-[#2B1B2E] font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={!selectedAlertId || !clinicianNotes}
                className="w-full py-3 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white hover:shadow-md transition-all text-xs font-black uppercase rounded-2xl cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Clinical Directives (Update Patient Companion)
              </button>

            </form>
          </div>

        </div>

      </div>
      </>
      )}

      {activePortalTab === "telehealth" && (
        <div className="space-y-6 animate-fade-in text-left font-sans" id="telehealth-hub-desk">
          {/* Header Banner */}
          <div className="p-5 bg-gradient-to-br from-[#FFF9F6] to-white border border-[#FF6FB1]/20 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm" id="telehealth-hub-header-card">
            <div>
              <span className="text-[9px] font-black text-[#E84FA0] uppercase tracking-widest block">Telehealth Synchronization Center</span>
              <h2 className="text-sm font-black text-[#2B1B2E] uppercase mt-0.5">Google Meet Virtual Diagnostic Desks</h2>
              <p className="text-[10px] text-[#7A6B72] font-semibold leading-normal">
                Establish direct interactive digital links with pregnant regional patients for maternal triage synchronization.
              </p>
            </div>
            <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-center shrink-0">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Workspace status</span>
              <span className="text-xl font-black font-mono text-emerald-950 block leading-tight">{maternalMeetings.length}</span>
              <span className="text-[7.5px] font-extrabold text-[#7A6B72] block uppercase">Scheduled Syncs</span>
            </div>
          </div>

          {/* Core Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDE: Book Remote Consultation Form */}
            <div className="lg:col-span-4 bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FF6FB1] block">Book remote consultation</span>
                <h3 className="text-xs font-black text-[#2B1B2E] uppercase">Dispatch Google Meet Room</h3>
              </div>

              {googleMeetError && (
                <div className="p-3 bg-red-100 text-red-800 rounded-2xl text-[10.5px] font-bold">
                  ⚠️ {googleMeetError}
                </div>
              )}

              {showMeetSuccess && (
                <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-[10.5px] font-extrabold space-y-1">
                  <p>🎉 secure telehealth space scheduled!</p>
                  <p className="text-[9.5px] font-mono break-all bg-white/80 p-1.5 rounded">{lastGeneratedUrl}</p>
                </div>
              )}

              <div className="space-y-3 text-[11px]">
                {/* 1. Select Patient */}
                <div>
                  <label htmlFor="select-sched-patient" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Select Maternal Patient from Registry:</label>
                  <select
                    id="select-sched-patient"
                    value={schedPatientId}
                    onChange={(e) => setSchedPatientId(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#CFE6E3]/40 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1] cursor-pointer"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (GA Week {p.gestationalWeeks} • {p.riskLevel.toUpperCase()} RISK)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Topic/Consultation Title */}
                <div>
                  <label htmlFor="hub-meet-topic" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Consultation Goal & Title:</label>
                  <input
                    id="hub-meet-topic"
                    type="text"
                    value={meetTopic}
                    onChange={(e) => setMeetTopic(e.target.value)}
                    placeholder="e.g. Pre-eclampsia checkup"
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/10 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>

                {/* 3. Scheduled Time */}
                <div>
                  <label htmlFor="hub-meet-time" className="text-[8.5px] font-extrabold uppercase block text-[#7A6B72] mb-1">Scheduled Session Time:</label>
                  <input
                    id="hub-meet-time"
                    type="datetime-local"
                    value={meetScheduledTime}
                    onChange={(e) => setMeetScheduledTime(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/10 text-[#2B1B2E] font-bold text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-400"
                  />
                </div>

                {/* 4. Action Trigger */}
                <button
                  type="button"
                  disabled={isGeneratingMeetCode}
                  onClick={handleCreateMeetCall}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white hover:shadow-md transition-all text-[11px] font-black uppercase rounded-xl cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingMeetCode ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating secure space...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Authenticate & Book Consultation</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-100 text-[9px] text-[#7A6B72] font-semibold leading-relaxed">
                💡 Sync sessions propagate immediately to the maternal companion application for both offline local reference or remote digital launching.
              </div>
            </div>

            {/* RIGHT SIDE: Table/List of scheduled consultation meetings, sorted ascending */}
            <div className="lg:col-span-8 bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#FF6FB1] block">Synchronized clinical sessions</span>
                  <h3 className="text-xs font-black text-[#2B1B2E] uppercase">All Maternal Telehealth Syncs</h3>
                </div>
                <span className="text-[9.5px] font-mono text-[#7A6B72] font-black uppercase bg-[#FFF9F6] border border-neutral-100 px-2 py-1 rounded-lg">
                  🗓️ Scheduled Ascending
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {maternalMeetings.length === 0 ? (
                  <div className="p-12 text-center bg-white/50 rounded-2xl border border-neutral-100 italic font-semibold text-[11px] text-[#7A6B72]">
                    No prenatal consultations scheduled. Initiate a secure Google Meet space using the booking console on the left.
                  </div>
                ) : (
                  [...maternalMeetings]
                    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                    .map((itm) => {
                      const patientObj = patients.find(p => p.id === itm.patientId);
                      const risk = patientObj ? patientObj.riskLevel : "low";
                      
                      const meetDate = new Date(itm.scheduledFor);
                      const now = new Date();
                      const diffMs = meetDate.getTime() - now.getTime();
                      const diffMins = Math.round(diffMs / 60000);
                      
                      let statusText = "";
                      let statusBadgeStyle = "";
                      
                      if (diffMins > -45 && diffMins < 15) {
                        statusText = "🟢 LIVE NOW";
                        statusBadgeStyle = "bg-red-500 text-white animate-pulse font-extrabold";
                      } else if (diffMins <= -45) {
                        statusText = "🔄 COMPLETED";
                        statusBadgeStyle = "bg-neutral-200 text-neutral-600 font-bold";
                      } else {
                        const days = Math.floor(diffMins / 1440);
                        const hours = Math.floor((diffMins % 1440) / 60);
                        const mins = diffMins % 60;
                        if (days > 0) {
                          statusText = `🕐 UPCOMING (In ${days}d ${hours}h)`;
                        } else if (hours > 0) {
                          statusText = `🕐 UPCOMING (In ${hours}h ${mins}m)`;
                        } else {
                          statusText = `🕐 UPCOMING (In ${mins}m)`;
                        }
                        statusBadgeStyle = "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold";
                      }

                      return (
                        <div key={itm.id} className="p-4 bg-white border border-neutral-100 hover:border-[#FF6FB1]/40 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-all">
                          
                          <div className="space-y-2 text-left min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11.5px] font-black text-[#2B1B2E] uppercase">{itm.topic}</span>
                              <span className={`text-[8.5px] px-2 py-0.5 rounded-full uppercase scale-95 leading-none ${statusBadgeStyle}`}>
                                {statusText}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[9.5px] font-semibold text-[#7A6B72] leading-none">
                              <span>Maternal Patient: <b className="text-[#2B1B2E]">{itm.patientName}</b></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-200"></span>
                              <span>Gestation: <b>Week {patientObj ? patientObj.gestationalWeeks : 28} GA</b></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-neutral-200"></span>
                              <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase ${
                                risk === "high" 
                                  ? "bg-red-100 text-red-700 font-extrabold" 
                                  : risk === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}>
                                {risk} RISK
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] bg-[#FFF9F6] p-2 rounded-xl text-neutral-800 font-bold border border-[#FF6FB1]/10 w-fit">
                              <CalendarDays className="w-3.5 h-3.5 text-[#E84FA0]" />
                              <span>
                                {meetDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {meetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                            <a
                              href={itm.meetingUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 md:w-36 py-2 px-3 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] text-white hover:opacity-95 text-[9.5px] font-black uppercase rounded-lg text-center flex items-center justify-center gap-1 shadow-3xs cursor-pointer select-none"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>LAUNCH MEET</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPatientId(itm.patientId);
                                setActivePortalTab("dashboard");
                              }}
                              className="flex-1 md:w-36 py-2 px-3 bg-white border border-neutral-200 hover:bg-neutral-50 text-[9.5px] font-black text-[#2B1B2E] uppercase rounded-lg text-center flex items-center justify-center gap-1 shadow-3xs cursor-pointer select-none"
                            >
                              <Activity className="w-3.5 h-3.5 text-[#4F7066]" />
                              <span>TRIAGE PANELS</span>
                            </button>
                          </div>

                        </div>
                      );
                    })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
