import React, { useState, useEffect } from "react";
import { getAuditLogs, getActiveClinic } from "../lib/db";
import { AuditLog, SubscriptionModel, Clinic } from "../types";
import { 
  Building, 
  CreditCard, 
  Fingerprint, 
  History, 
  ShieldCheck, 
  Users, 
  CircleDollarSign, 
  Calculator, 
  CheckCircle,
  Clock,
  User,
  HeartCrack
} from "lucide-react";

export default function AdminPortal() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  // SaaS Calculator states
  const [calcTier, setCalcTier] = useState<"b2b" | "gov">("b2b");
  const [mothersCount, setMothersCount] = useState(250);
  const [governmentRate, setGovernmentRate] = useState(5.50); // $5.50 / pregnancy

  const b2bTiers = [
    {
      name: "Free Pilot",
      priceUSD: 0,
      priceZAR: 0,
      limits: "1 user • ~25 active mothers",
      features: ["Risk-ranked queue", "Manual vitals triage", "Local language timelines"]
    },
    {
      name: "Basic Clinic",
      priceUSD: 49,
      priceZAR: 880,
      limits: "3 users • up to 100 mothers",
      features: ["Risk flags escalation", "CHW list workflows", "Granular POPIA consent engine"]
    },
    {
      name: "Pro Health Centre",
      priceUSD: 199,
      priceZAR: 3600,
      limits: "Unlimited users • up to 500 mothers",
      features: ["Full AI risk triage engine", "Detailed facility trends & analytics", "SMS/USSD fallback simulation API"]
    },
    {
      name: "Enterprise Hospital",
      priceUSD: 1000,
      priceZAR: 18000,
      limits: "Unlimited everything • SLA",
      features: ["Data-residency controls", "Custom EHR system bridges", "De-identified dataset downloads"]
    }
  ];

  const fetchAdminContext = async () => {
    setLoading(true);
    try {
      const active = await getActiveClinic();
      setClinic(active);

      const logs = await getAuditLogs(active.id);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminContext();
  }, []);

  return (
    <div className="p-6 bg-white border border-bento-border rounded-2xl space-y-6 h-full overflow-y-auto shadow-sm" id="admin-saas-dashboard">
      <div>
        <h2 className="text-base font-bold text-bento-text uppercase tracking-wider flex items-center gap-1.5">
          <Fingerprint className="w-5 h-5 text-bento-green animate-pulse" /> SaaS Admin & Compliance Audit Hub
        </h2>
        <p className="text-xs text-bento-muted">Manage tenant accounts, subscription pricing layers, and auditable data registries for regional DPA guidelines.</p>
      </div>

      {/* Grid of contents: Left is pricing/calculator, Right is Audit logs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Column 1: B2B Tiers calc */}
        <section className="space-y-4" id="section-saas-contracts">
          <div className="flex gap-2 p-1.5 bg-bento-highlight rounded-xl border border-bento-border" id="admin-cal-toggles">
            <button 
              onClick={() => setCalcTier("b2b")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${calcTier === "b2b" ? "bg-white text-bento-green border border-bento-border shadow-xs" : "text-bento-muted hover:text-bento-text"}`}
            >
              Subscription Packages (B2B SaaS)
            </button>
            <button 
              onClick={() => setCalcTier("gov")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${calcTier === "gov" ? "bg-white text-bento-green border border-bento-border shadow-xs" : "text-bento-muted hover:text-bento-text"}`}
            >
              Government / Donor Calculator
            </button>
          </div>

          {calcTier === "b2b" ? (
            <div className="space-y-3">
              <h4 className="text-[10px] font-extrabold text-bento-muted uppercase tracking-widest">Subscription Tiers Map</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {b2bTiers.map((tier, idx) => (
                  <div key={idx} className="p-4 border border-bento-border bg-white rounded-2xl flex flex-col justify-between hover:bg-bento-highlight/45 shadow-xs hover:shadow-sm transition-all">
                    <div>
                      <div className="font-bold text-sm text-[#2D2D2D]">{tier.name}</div>
                      <div className="text-[10px] text-bento-muted mt-0.5 uppercase tracking-wider font-bold">{tier.limits}</div>
                      
                      <div className="mt-2 font-mono text-xl font-extrabold text-bento-green">
                        ${tier.priceUSD} <span className="text-xs text-bento-muted font-sans font-medium">/ mo</span>
                      </div>
                      <div className="text-[10px] text-bento-muted font-mono">~R{tier.priceZAR} / E{tier.priceZAR} ZAR/SZL</div>
                    </div>

                    <ul className="mt-4 space-y-1.5 text-[10px] text-bento-body border-t border-[#F1F0EA] pt-3 font-medium">
                      {tier.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-bento-sage shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 border border-bento-border bg-bento-highlight/10 rounded-2xl space-y-4 text-left">
              <h4 className="text-xs font-bold text-bento-green flex items-center gap-2 uppercase tracking-wider">
                <Calculator className="w-4 h-4" /> Regional Population Scale Contract Planner
              </h4>
              <p className="text-xs text-bento-muted leading-relaxed">For ministries of health (Eswatini MoH, South Africa National Department of Health NDOH) or donor funding agencies, pricing is calculated per active pregnancy rather than per clinic.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-bento-text">
                    <span>Target Expectant Mothers Count:</span>
                    <span className="text-bento-green font-mono font-extrabold text-sm">{mothersCount.toLocaleString()} pregnancies</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    step="100"
                    value={mothersCount}
                    onChange={(e) => setMothersCount(Number(e.target.value))}
                    className="w-full accent-bento-green mt-2 cursor-ew-resize"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-bento-text">
                    <span>Bid Rate per Pregnant Mother:</span>
                    <span className="text-bento-green font-mono font-extrabold text-sm">${governmentRate.toFixed(2)}/pregnancy</span>
                  </div>
                  <input 
                    type="range" 
                    min="3.00" 
                    max="8.00" 
                    step="0.50"
                    value={governmentRate}
                    onChange={(e) => setGovernmentRate(Number(e.target.value))}
                    className="w-full accent-bento-green mt-2 cursor-ew-resize"
                  />
                  <div className="text-[10px] text-bento-muted mt-1 leading-normal">SADC regional benchmark ranges: $3 to $8 per pregnancy including SMS notifications channels.</div>
                </div>

                <div className="p-4 bg-bento-green border border-bento-border text-white rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <h5 className="text-[9px] text-[#F1F0EA]/80 font-bold uppercase tracking-widest">Estimated Contract Value</h5>
                    <div className="text-2xl font-extrabold font-mono">${(mothersCount * governmentRate).toLocaleString()}</div>
                    <div className="text-[10px] text-[#F1F0EA]/70 font-mono">~R{(mothersCount * governmentRate * 18).toLocaleString()} ZAR</div>
                  </div>
                  <div className="p-3 bg-[#3D523D] rounded-xl text-white">
                    <CircleDollarSign className="w-6 h-6 text-bento-sage" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Column 2: POPIA / Regional DPA Live Audit Trails */}
        <section className="space-y-4" id="section-compliance-logs">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-extrabold text-bento-muted uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-4 h-4 text-bento-muted" /> POPIA & DPA Security Audit Trail
            </h4>
            <span className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest bg-bento-highlight border border-bento-border text-bento-muted rounded">Audited Logs</span>
          </div>

          <div className="border border-bento-border bg-bento-highlight/15 rounded-2xl h-[330px] overflow-y-auto p-4 space-y-3" id="audit-logs-display text-left">
            {loading ? (
              <div className="text-center py-12 text-xs text-bento-muted">Accessing security vault...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12 text-xs text-bento-muted">No regulatory auditable entries located.</div>
            ) : (
              auditLogs.map((log) => {
                const colorMap = 
                  log.action === "ENROLL_PATIENT" ? "bg-bento-sage/10 text-bento-green border border-bento-sage/20" :
                  log.action === "LOG_VITALS" ? "bg-bento-orange/10 text-bento-orange border border-bento-orange/20" :
                  "bg-bento-muted/10 text-bento-body border border-bento-border";

                return (
                  <div key={log.id} className="p-3 bg-white border border-bento-border rounded-xl space-y-1.5 shadow-xs text-left">
                    <div className="flex justify-between text-[10px] text-bento-muted font-mono">
                      <span className="flex items-center gap-1 font-bold"><User className="w-3 h-3 text-bento-muted shrink-0" /> {log.userEmail}</span>
                      <span className="flex items-center gap-1 font-bold"><Clock className="w-3 h-3 text-bento-muted shrink-0" /> {new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide ${colorMap}`}>
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-bento-muted font-bold">Ref: {log.resource}</span>
                    </div>

                    <p className="text-xs text-bento-body font-mono leading-relaxed mt-1 font-semibold">
                      {log.details}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
