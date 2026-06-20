import React, { useState } from "react";
import { 
  Smartphone, 
  Send, 
  Hash, 
  Smartphone as PhoneIcon, 
  BellRing, 
  AlertOctagon, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from "lucide-react";

export default function SmsFallbackPortal() {
  const [phoneMode, setPhoneMode] = useState<"sms" | "ussd">("sms");
  const [phoneNumber, setPhoneNumber] = useState("+268 7604 1234");
  
  // SMS States
  const [smsInput, setSmsInput] = useState("");
  const [smsHistory, setSmsHistory] = useState<{ sender: "user" | "system"; text: string; time: string }[]>([
    {
      sender: "system",
      text: "Welcome to Vytal Bridge SMS. Reply with [vitals systolic/diastolic pulse temperature weight symptoms] to log pregnancy updates (e.g., 'vitals 135/85 82 36.6 68 headache').",
      time: "09:00 AM"
    }
  ]);

  // USSD States
  const [ussdDialCode, setUssdDialCode] = useState("*120*748#");
  const [ussdSessionActive, setUssdSessionActive] = useState(false);
  const [ussdScreen, setUssdScreen] = useState("");
  const [ussdSelection, setUssdSelection] = useState("");
  const [ussdLog, setUssdLog] = useState<string[]>([]);

  // SMS Submission handler
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const userInput = smsInput;
    setSmsInput("");

    const newHist = [...smsHistory, { sender: "user" as const, text: userInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setSmsHistory(newHist);

    // Call dynamic evaluation endpoint with fallback rules parsing
    setTimeout(() => {
      let sysReply = "";
      const textLower = userInput.toLowerCase();

      if (textLower.startsWith("vitals")) {
        // Parse "vitals systolic/diastolic pulse temp weight symptoms"
        // e.g. "vitals 160/110 94 36.8 74 headache, blurred vision"
        const clean = textLower.replace("vitals", "").trim();
        const parts = clean.split(" ");
        
        const bp = parts[0] || "120/80";
        const systolic = Number(bp.split("/")[0]) || 120;
        const diastolic = Number(bp.split("/")[1]) || 80;
        const pulse = Number(parts[1]) || 80;
        const sysSymptoms = parts.slice(4).join(" ");

        if (systolic >= 140 || diastolic >= 90) {
          sysReply = `⚠️ Vytal Bridge ALERT: High BP detected (${systolic}/${diastolic} mmHg). Clinical risk is elevated. If you experience severe headaches or blurry vision, please immediately report to Mbabane Clinical Centre. A community worker has been notified.`;
        } else if (sysSymptoms.includes("headache") || sysSymptoms.includes("vision")) {
          sysReply = "⚠️ Vytal Bridge WARNING: Gestational headache or vision changes reported. This can indicate silent pre-eclampsia. Please visit your clinic nurse today for a BP screening.";
        } else {
          sysReply = "✅ Vytal Bridge: Vitals processed. Your reading is normal. Continue with nutrition guidelines. Reply 'HELP' anytime.";
        }
      } else if (textLower.includes("help")) {
        sysReply = "Vytal Bridge SMS Menu:\n- Reply 'vitals BP pulse temp weight symptoms' to submit readings.\n- Reply 'status' to view your current triage risk levels.";
      } else if (textLower.includes("status")) {
        sysReply = "Vytal Bridge Status: Risk level: NORMAL. Gestational week: 24. Next scheduled clinical midwife visit is on 20 June 2026. Keep hydrated!";
      } else {
        sysReply = "Unknown command. Reply 'HELP' to explore available interactive options, or submit vitals like: 'vitals 120/80 78 36.5 70 none'";
      }

      setSmsHistory(prev => [...prev, { sender: "system", text: sysReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 800);
  };

  // USSD Session Handler
  const handleDialUssd = () => {
    if (ussdDialCode !== "*120*748#") {
      alert("Please use the official Vytal Bridge dial code: *120*748#");
      return;
    }
    setUssdSessionActive(true);
    setUssdScreen("Vytal Bridge USSD Triage:\n1. Log Blood Pressure\n2. View Pregnancy Progress\n3. Request CHW Emergency Visit\n\nReply with option [1-3]:");
    setUssdLog(["Dialed *120*748#... Connecting... Connection OK"]);
  };

  const handleUssdSubmit = (val: string) => {
    const input = val.trim();
    setUssdSelection("");
    const newLogs = [...ussdLog, `> Sent: ${input}`];

    let nextScreen = "";
    if (ussdScreen.includes("Vytal Bridge USSD Triage")) {
      if (input === "1") {
        nextScreen = "Log BP (Systolic/Diastolic)\ne.g. reply '135/88':";
      } else if (input === "2") {
        nextScreen = "Pregnancy status: Week 28 (Third Trimester).\nClinic ANC check-in due in 5 days.\n\nReply '0' for Back:";
      } else if (input === "3") {
        nextScreen = "⚠️ CHW SOS Requested.\nYour location Hhohho Zone 4 has been dispatched to CHW Sibongile Vilakati.\n\nReply '9' to exit:";
      } else {
        nextScreen = "Invalid selection.\n1. Log BP\n2. View Progress\n3. SOS\n\nReply [1-3]:";
      }
    } else if (ussdScreen.includes("Log BP")) {
      const parts = input.split("/");
      const sys = Number(parts[0]) || 120;
      const dia = Number(parts[1]) || 80;

      if (sys >= 140 || dia >= 90) {
        nextScreen = `⚠️ Danger: BP ${sys}/${dia} is elevated.\nCHW immediate visit activated.\nRest on your left side.\n\nReply '0' for main menu:`;
      } else {
        nextScreen = `✅ Success: BP ${sys}/${dia} recorded.\nKeep doing regular physical exercise.\n\nReply '0' for main menu:`;
      }
    } else if (input === "0" || input === "9") {
      if (input === "9") {
        setUssdSessionActive(false);
        return;
      }
      nextScreen = "Vytal Bridge USSD Triage:\n1. Log BP\n2. View Pregnancy Progress\n3. Request CHW Emergency Visit\n\nReply with option [1-3]:";
    } else {
      nextScreen = "Session timed out or command not parsed.\n\nDial *120*748# to restart.";
      setUssdSessionActive(false);
    }

    setUssdScreen(nextScreen);
    setUssdLog([...newLogs, `Received Screen: ${nextScreen.split("\n")[0]}`]);
  };

  return (
    <div className="p-6 bg-white border border-bento-border rounded-2xl shadow-sm space-y-6" id="sms-usd-simulator">
      <div>
        <h2 className="text-base font-bold text-bento-text uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-5 h-5 text-bento-green" /> Rural USSD & SMS Fallback Engine
        </h2>
        <p className="text-xs text-bento-muted">Offline-capable SADC village channel. Simulates pregnant patient interactions using simple feature phones without internet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Interactive Feature Phone Frame */}
        <div className="flex flex-col items-center">
          <div className="relative w-72 h-[520px] bg-[#1E1E1C] rounded-[3rem] border-8 border-[#3A3A36] shadow-xl p-4 flex flex-col pt-10 pb-10">
            {/* Phone speaker speaker */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-[#2D2D2A] rounded-full"></div>
            
            {/* Phone screen screen */}
            <div className="flex-1 bg-black rounded-lg p-3 text-[#5B8C5A] font-mono text-[11px] overflow-y-auto space-y-4 flex flex-col border border-[#3A3A36]" id="simulator-phone-canvas">
              {phoneMode === "sms" ? (
                <>
                  <div className="flex justify-between items-center bg-[#121210] pb-1.5 border-b border-[#2D2D2A] shrink-0 text-[10px] text-bento-muted">
                    <span>SMS fallback mode</span>
                    <span>94% Bat</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 mt-2 text-left" id="sms-text-container">
                    {smsHistory.map((sms, i) => (
                      <div 
                        key={i} 
                        className={`p-2.5 rounded-xl max-w-[85%] ${
                          sms.sender === "user" 
                            ? "bg-bento-green text-white ml-auto text-left" 
                            : "bg-[#121210] border border-[#2D2D2A] text-bento-sage"
                        }`}
                      >
                        <p>{sms.text}</p>
                        <span className="text-[8px] text-bento-muted mt-1 block">{sms.time}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendSms} className="flex gap-1.5 mt-auto shrink-0 border-t border-[#2D2D2A] pt-1.5">
                    <input 
                      type="text" 
                      placeholder="vitals 155/102 90..."
                      value={smsInput}
                      onChange={(e) => setSmsInput(e.target.value)}
                      className="flex-1 text-[11px] p-2 bg-[#121210] text-[#5B8C5A] border border-[#2D2D2A] outline-none rounded focus:border-bento-sage font-mono"
                    />
                    <button 
                      type="submit"
                      className="p-2 bg-bento-green hover:bg-[#3D523D] text-white rounded font-bold cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center bg-[#121210] pb-1.5 border-b border-[#2D2D2A] shrink-0 text-[10px] text-bento-muted">
                    <span>USSD interactive</span>
                    <span>10:30 AM</span>
                  </div>

                  {!ussdSessionActive ? (
                    <div className="my-auto text-center space-y-3">
                      <Hash className="w-8 h-8 text-bento-green mx-auto animate-pulse" />
                      <div className="text-bento-muted text-xs font-bold uppercase tracking-wider">Dial USSD pregnancy channel</div>
                      <input 
                        type="text" 
                        value={ussdDialCode}
                        onChange={(e) => setUssdDialCode(e.target.value)}
                        className="text-center font-bold text-lg p-1.5 bg-[#121210] text-bento-sage border border-[#2D2D2A] outline-none rounded w-full font-mono"
                      />
                      <button 
                        onClick={handleDialUssd}
                        className="bg-bento-green hover:bg-[#3D523D] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        Dial
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full bg-[#121210] p-2 rounded border border-[#2D2D2A] text-left">
                      <div className="flex-1 whitespace-pre-wrap leading-relaxed text-bento-sage">
                        {ussdScreen}
                      </div>

                      <div className="flex gap-1.5 border-t border-[#2D2D2A] pt-2 mt-2">
                        <input 
                          type="text" 
                          placeholder="e.g. 1"
                          value={ussdSelection}
                          onChange={(e) => setUssdSelection(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUssdSubmit(ussdSelection)}
                          className="flex-1 text-[11px] p-1 bg-black text-[#5B8C5A] border border-[#2D2D2A] outline-none rounded font-mono"
                        />
                        <button 
                          onClick={() => handleUssdSubmit(ussdSelection)}
                          className="bg-bento-green text-white px-2.5 py-1 text-xs rounded cursor-pointer font-bold"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Home button button */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border border-[#3A3A36] bg-[#121210] hover:bg-[#2D2D2A] active:scale-95 cursor-pointer"></div>
          </div>
        </div>

        {/* Right Column: Information, presets, and terminal output */}
        <div className="space-y-4 text-left">
          <div className="flex gap-2" id="channel-tabs">
            <button 
              onClick={() => setPhoneMode("sms")}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${phoneMode === "sms" ? "bg-bento-highlight border-bento-border text-bento-green shadow-xs" : "bg-white border-bento-border text-bento-muted hover:bg-bento-highlight/30"}`}
            >
              SMS Command Presets
            </button>
            <button 
              onClick={() => setPhoneMode("ussd")}
              className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${phoneMode === "ussd" ? "bg-bento-highlight border-bento-border text-bento-green shadow-xs" : "bg-white border-bento-border text-bento-muted hover:bg-bento-highlight/30"}`}
            >
              Dial-In USSD Testing
            </button>
          </div>

          {phoneMode === "sms" ? (
            <div className="space-y-4 p-4 border border-bento-border rounded-2xl bg-white shadow-xs">
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-bento-muted">Quick Test Templates</h3>
              <p className="text-xs text-bento-muted">Click a message string below to automatically insert it into the SMS phone console, then tap Send.</p>

              <div className="space-y-2 font-mono text-[11px]">
                <button 
                  onClick={() => setSmsInput("vitals 122/80 80 36.6 70 normal")}
                  className="w-full text-left p-3 border border-bento-border bg-white rounded-xl hover:bg-bento-highlight/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="text-bento-green font-bold">vitals 122/80 (Normal Reading)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bento-muted" />
                </button>

                <button 
                  onClick={() => setSmsInput("vitals 162/112 94 36.8 74 headache")}
                  className="w-full text-left p-3 border border-bento-red/10 bg-bento-red/[0.03] rounded-xl hover:bg-bento-red/[0.06] transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="text-bento-red font-bold">vitals 162/112 (Severe Pre-Eclampsia Watch)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bento-red animate-pulse" />
                </button>

                <button 
                  onClick={() => setSmsInput("status")}
                  className="w-full text-left p-3 border border-bento-border bg-white rounded-xl hover:bg-bento-highlight/30 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="text-bento-text font-bold">status (Check maternal clinic schedule)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-bento-muted" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-bento-border rounded-2xl bg-white shadow-xs">
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-bento-muted">USSD Session State Console</h3>
              <p className="text-xs text-bento-muted">Live system logs generated by the SADC regional USSD gateway.</p>

              <div className="p-3 bg-black text-[#fff] font-mono text-[11px] rounded-xl h-44 overflow-y-auto space-y-1.5 border border-[#2D2D2A]">
                {ussdLog.length === 0 ? (
                  <div className="text-bento-muted italic">Dial *120*748# inside the phone screen to log gateway events.</div>
                ) : (
                  ussdLog.map((logLine, idx) => (
                    <div key={idx} className="text-bento-sage font-medium">
                      {logLine}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-bento-highlight/60 border border-bento-border rounded-2xl">
            <h4 className="text-xs font-bold text-bento-text flex items-center gap-1.5"><BellRing className="w-4 h-4 text-bento-green" /> SMS Broadcast Gateway</h4>
            <p className="text-[11px] text-bento-body mt-1 leading-relaxed">
              Vytal Bridge integrates with bulk carrier SADC SMS gateways to route urgent hazard pings to community midwives instantly upon receiving high-triage texts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
