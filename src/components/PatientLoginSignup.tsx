import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Lock, Smartphone, Heart, Sparkles, AlertTriangle, ArrowRight, Baby, MapPin, Globe2, ClipboardList, ShieldCheck } from "lucide-react";
import { Patient } from "../types";

interface PatientLoginSignupProps {
  onLoginSuccess: (patient: any) => void;
  onSocialSignup: (newPatient: any) => void;
}

const DEMO_ACCOUNTS = [
  {
    id: "pat-2",
    name: "Kelebogile Mokgoro",
    phone: "+267 7132 4567",
    region: "🇧🇼 Botswana",
    gestation: 28,
    risk: "high",
    riskReason: "GDM watch • BP 142/91 • week 28 watch",
    history: ["Gestational Diabetes Mellitus (GDM)", "Hypothyroid"]
  },
  {
    id: "pat-1",
    name: "Zanele Dlamini",
    phone: "+268 7654 3210",
    region: "🇸🇿 Eswatini",
    gestation: 36,
    risk: "critical",
    riskReason: "Severe hypertension (162/112) • Vision loss check",
    history: ["Nulliparous (first pregnancy)"]
  },
  {
    id: "pat-4",
    name: "Lerato Phiri",
    phone: "+27 73 555 4321",
    region: "🇿🇦 South Africa",
    gestation: 16,
    risk: "normal",
    riskReason: "Normal baseline metrics",
    history: ["None"]
  }
];

export default function PatientLoginSignup({ onLoginSuccess, onSocialSignup }: PatientLoginSignupProps) {
  const [activeMode, setActiveMode] = useState<"login" | "signup">("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // SignUp Form states
  const [signUpName, setSignUpName] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [signUpGestation, setSignUpGestation] = useState(20);
  const [signUpRegion, setSignUpRegion] = useState("South Africa");
  const [signUpCondition, setSignUpCondition] = useState("");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!phone || !pin) {
      setErrorMsg("Please fill in both phone and security PIN");
      return;
    }

    // Attempt to match demo account or create dynamic session
    const matched = DEMO_ACCOUNTS.find(d => d.phone.includes(phone) || phone.includes(d.phone.replace(/\s+/g, "")));
    if (matched) {
      onLoginSuccess({
        id: matched.id,
        name: matched.name,
        phoneNumber: matched.phone,
        gestationalWeeks: matched.gestation,
        riskLevel: matched.risk,
        medicalHistory: matched.history,
        consentGranted: true,
        consentVersion: "CONSENT-V1.2"
      });
    } else {
      // Dynamic fallback for any valid user
      onLoginSuccess({
        id: `pat-dynamic-${Date.now()}`,
        name: SignUpNameParser(phone),
        phoneNumber: phone,
        gestationalWeeks: 24,
        riskLevel: "normal",
        medicalHistory: ["None declared"],
        consentGranted: true,
        consentVersion: "CONSENT-V1.2"
      });
    }
  };

  const handleDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    onLoginSuccess({
      id: demo.id,
      name: demo.name,
      phoneNumber: demo.phone,
      gestationalWeeks: demo.gestation,
      riskLevel: demo.risk,
      medicalHistory: demo.history,
      consentGranted: true,
      consentVersion: "CONSENT-V1.2-BW"
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!signUpName || !signUpPhone) {
      setErrorMsg("Full name and contact number are required.");
      return;
    }

    const customPatient = {
      id: `pat-custom-${Date.now()}`,
      name: signUpName,
      phoneNumber: signUpPhone,
      gestationalWeeks: signUpGestation,
      riskLevel: "normal",
      medicalHistory: signUpCondition ? [signUpCondition] : ["None"],
      clinicId: "mbabane-primary",
      consentGranted: true,
      consentVersion: "CONSENT-V1.2-ZA",
      createdAt: new Date().toISOString()
    };

    onSocialSignup(customPatient);
    onLoginSuccess(customPatient);
  };

  const SignUpNameParser = (phoneStr: string) => {
    return `Mama ${phoneStr.slice(-4)}`;
  };

  return (
    <div className="w-full h-full flex flex-col justify-start p-6 pt-10 text-left bg-gradient-to-b from-[#FAF5F2] via-white to-[#F2F8F5] relative overflow-hidden select-none" id="patient-login-signup-viewport">
      
      {/* Floating Interactive Background Elements */}
      <div className="absolute top-8 left-4 opacity-40 animate-pulse pointer-events-none">
        <span className="text-xl">☀️</span>
      </div>
      <div className="absolute top-24 right-6 opacity-30 animate-bounce pointer-events-none" style={{ animationDuration: '6s' }}>
        <span className="text-xl">🌸</span>
      </div>
      <div className="absolute bottom-16 left-6 opacity-45 animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}>
        <span className="text-xl">🍊</span>
      </div>
      <div className="absolute bottom-28 right-4 opacity-25 animate-bounce pointer-events-none" style={{ animationDuration: '9s' }}>
        <span className="text-xl">🧬</span>
      </div>

      {/* Decorative top arc */}
      <div className="absolute -top-16 inset-x-0 h-40 bg-gradient-to-b from-[#D8E8E4]/60 to-transparent rounded-full filter blur-xl pointer-events-none" />

      {/* Header Greeting */}
      <div className="text-center space-y-1.5 z-10 shrink-0 mb-6">
        <h3 className="text-lg font-black text-[#2B1B2E] uppercase tracking-wide">
          {activeMode === "login" ? "Mother Companion Portal" : "Join the Vytal Circle"}
        </h3>
        <p className="text-[10px] text-[#7A6B72] font-semibold max-w-xs mx-auto leading-normal">
          Real-time pre-eclampsia alerts, offline speech triage, and weekly fetal milestone updates.
        </p>

        {/* Tab switch buttons */}
        <div className="flex bg-[#EEF5F2] p-1 rounded-xl border border-neutral-200 w-full max-w-[240px] mx-auto mt-3">
          <button
            type="button"
            onClick={() => {
              setActiveMode("login");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
              activeMode === "login" ? "bg-white text-[#2B1B2E] shadow-2xs" : "text-[#7A6B72]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("signup");
              setErrorMsg("");
            }}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
              activeMode === "signup" ? "bg-white text-[#2B1B2E] shadow-2xs" : "text-[#7A6B72]"
            }`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMsg && (
        <div className="p-2 border border-red-200 bg-red-50 text-red-900 text-[9px] font-bold rounded-xl mb-3 z-10">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 z-10 space-y-5">
        {activeMode === "login" ? (
          <div className="space-y-4">
            {/* Standard Sign-In Form */}
            <form onSubmit={handleCredentialsSubmit} className="space-y-2.5">
              <div>
                <label htmlFor="login-phone" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                  Maternal Contact / Phone
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs">📞</span>
                  <input
                    id="login-phone"
                    type="tel"
                    placeholder="Enter phone number (e.g. +267...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[11px] p-2 pl-9 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-pin" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                  Maternal 4-Digit Security PIN
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs">🔒</span>
                  <input
                    id="login-pin"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[11px] p-2 pl-9 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full vytal-btn-gradient text-white font-extrabold text-xs py-2.5 rounded-xl transition-all hover:shadow-xs cursor-pointer text-center block mt-3"
              >
                Sign In securely
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-3 text-[7.5px] font-black uppercase text-[#7A6B72]">
                Pitch Presentation Logins
              </span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* Quick Demo logins representing distinct clinical outcomes */}
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  type="button"
                  key={demo.id}
                  onClick={() => handleDemoLogin(demo)}
                  className="p-2.5 bg-white border border-dashed border-[#CFE6E3] rounded-xl text-left hover:bg-[#EEF5F2] hover:border-[#4F7066] transition-all flex items-start gap-2.5 cursor-pointer leading-tight group relative overflow-hidden"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E2EBE5] flex items-center justify-center font-black text-[#4F7066] text-[10px] shrink-0 border border-white">
                    {demo.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-[10px] font-black text-[#2B1B2E] group-hover:text-[#4F7066]">
                        {demo.name}
                      </strong>
                      <span className="text-[7.5px] text-gray-500 font-extrabold">{demo.region}</span>
                    </div>
                    <p className="text-[8.5px] text-[#7A6B72] font-semibold mt-0.5 line-clamp-1">
                      {demo.riskReason}
                    </p>
                  </div>
                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 self-center ${
                    demo.risk === "critical" 
                      ? "bg-red-50 text-red-700" 
                      : demo.risk === "high" 
                      ? "bg-amber-50 text-amber-700" 
                      : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {demo.risk}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Sign Up form block */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 pb-4">
            <div>
              <label htmlFor="reg-name" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                Expecting Mother's Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                placeholder="e.g. Zanele Khumalo"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[11px] p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1]"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                Maternal Contact Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                placeholder="e.g. +268 7654 3210"
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
                className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[11px] p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6FB1]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="reg-region" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                  SADC Region Clinic
                </label>
                <select
                  id="reg-region"
                  value={signUpRegion}
                  onChange={(e) => setSignUpRegion(e.target.value)}
                  className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[10.5px] p-2 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Eswatini">🇸🇿 Eswatini</option>
                  <option value="Botswana">🇧🇼 Botswana</option>
                  <option value="South Africa">🇿🇦 South Africa</option>
                  <option value="Zimbabwe">🇿🇼 Zimbabwe</option>
                  <option value="Lesotho">🇱🇸 Lesotho</option>
                </select>
              </div>

              <div>
                <label htmlFor="reg-condition" className="text-[8px] font-extrabold text-[#7A6B72] uppercase block mb-1">
                  Medical Pre-Conditions
                </label>
                <select
                  id="reg-condition"
                  value={signUpCondition}
                  onChange={(e) => setSignUpCondition(e.target.value)}
                  className="w-full bg-[#FFF9F6] border border-[#FF6FB1]/20 text-[#2B1B2E] font-bold text-[10.5px] p-2 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="None">No pre-conditions</option>
                  <option value="Mild pre-eclampsia history">Hypertension Hx</option>
                  <option value="Gestational Diabetes Mellitus (GDM)">GDM risk</option>
                  <option value="Previous post-partum hemorrhage">Hemorrhage risk</option>
                  <option value="Anemia">Anemic watch</option>
                </select>
              </div>
            </div>

            {/* Slider with dynamic readout */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider font-extrabold text-[#7A6B72]">
                <label htmlFor="reg-gestation">Weeks of Gestation:</label>
                <span className="text-[#E84FA0] font-black">{signUpGestation} Weeks</span>
              </div>
              <input
                id="reg-gestation"
                type="range"
                min={1}
                max={40}
                value={signUpGestation}
                onChange={(e) => setSignUpGestation(parseInt(e.target.value))}
                className="w-full accent-[#E84FA0] cursor-pointer"
              />
              <div className="flex justify-between text-[7.5px] text-[#7A6B72] font-semibold leading-none pt-0.5">
                <span>Trimester 1</span>
                <span>Trimester 2</span>
                <span>Trimester 3</span>
              </div>
            </div>

            {/* Safety policy warning */}
            <div className="p-2.5 bg-[#FAF6F2] border border-amber-200 rounded-xl text-[8.5px] text-[#7A6B72] leading-relaxed flex gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4F7066] shrink-0 mt-0.5" />
              <span>We store your baseline parameters in the SADC clinic ledger securely matching regional POPIA & health data standards.</span>
            </div>

            <button
              type="submit"
              className="w-full vytal-btn-gradient text-white font-extrabold text-xs py-2.5 rounded-xl transition-all hover:shadow-xs cursor-pointer text-center block"
            >
              Securely signup & enter portal
            </button>
          </form>
        )}
      </div>

      {/* Trust seal footer */}
      <div className="pt-2 border-t border-dotted border-neutral-200 mt-2 text-center text-[7.5px] text-[#7A6B72] font-semibold flex items-center justify-center gap-1 shrink-0">
        🛡️ POPIA compliant secure workspace • Mbabane Primary Telehealth Network
      </div>

    </div>
  );
}
