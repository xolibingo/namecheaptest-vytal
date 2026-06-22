import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ShieldAlert, Sparkles, Gem, HelpCircle, HelpCircle as HelpIcon, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface Tier {
  id: "lula" | "premium" | "sadc";
  name: string;
  priceMonthly: number;
  currency: string;
  tagline: string;
  isPopular?: boolean;
  color: string;
  badgeBg: string;
  badgeTextColor: string;
  features: string[];
  omissions: string[];
}

const TIERS: Tier[] = [
  {
    id: "lula",
    name: "Lula Community",
    priceMonthly: 0,
    currency: "SZL",
    tagline: "Essential maternal care tools fully subsidized for everyone.",
    color: "border-[#D5E1DB]",
    badgeBg: "bg-emerald-50 text-emerald-800",
    badgeTextColor: "text-emerald-800",
    features: [
      "Ask Vytal AI Voice Diagnostics (English translation only)",
      "Essential offline blood pressure and symptoms logbook",
      "Manual SADC Fruit Size comparison indicators",
      "Baseline Weekly Milestones Checklist & Tips"
    ],
    omissions: [
      "Multilingual translation (siSwati & Setswana vocal assistance)",
      "Advanced Dual-Axis cardiovascular blood pressure Recharts trends",
      "Clinical high-priority alert dispatcher to local Mbabane hospitals",
      "Interactive pregnancy support group threads & topics alert",
      "Road to Health postpartum vaccine calendar notifications"
    ]
  },
  {
    id: "premium",
    name: "Vytal Premium",
    priceMonthly: 79,
    currency: "SZL",
    tagline: "Total peace-of-mind with offline multilingual voice and advanced analytics.",
    isPopular: true,
    color: "border-[#FF6FB1]",
    badgeBg: "bg-pink-50 text-[#E84FA0] border border-[#FF6FB1]/35",
    badgeTextColor: "text-[#E84FA0]",
    features: [
      "Ask Vytal AI Voice Diagnostics in English, siSwati & Setswana",
      "Advanced Dual-Axis cardiovascular blood pressure Recharts trends",
      "Full digital Weekly Milestones with premium celebrate GIF animations",
      "Mothers Peer network & interactive forum community",
      "Offline-first secure local database syncing (2-second connection recovery)",
      "Personalized daily hydration and nutrient logs"
    ],
    omissions: [
      "Direct auto-referral SMS override alerts to clinic emergency coordinators",
      "Priority triage queue on Sister Thandeka's board",
      "Private video-consultation room linkage"
    ]
  },
  {
    id: "sadc",
    name: "SADC Care Connect",
    priceMonthly: 199,
    currency: "SZL",
    tagline: "Full integration with clinical centers, insurance, and emergency ambulances.",
    color: "border-amber-400",
    badgeBg: "bg-amber-50 text-amber-800 border border-amber-300/50",
    badgeTextColor: "text-amber-800",
    features: [
      "All Premium capabilities included",
      "Direct auto-referral SMS override alerts to local Mbabane clinical networks",
      "Priority triage position with gold star badge on Sister Thandeka's board",
      "Full HIPAA & POPIA compliant secure health records vault",
      "Preloaded emergency VoIP VoIP dialers to SADC Air Dispatch & Ambulances",
      "Postpartum Road to Health vaccine tracking calendar notifications"
    ],
    omissions: []
  }
];

interface SubscriptionPackagesProps {
  currentPlan?: string;
  onUpgradePlan?: (planId: "lula" | "premium" | "sadc") => void;
  onClose?: () => void;
}

export default function SubscriptionPackages({ 
  currentPlan = "lula", 
  onUpgradePlan, 
  onClose 
}: SubscriptionPackagesProps) {
  const [activePlanId, setActivePlanId] = useState<"lula" | "premium" | "sadc">(currentPlan as any);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeTier = TIERS.find(t => t.id === activePlanId) || TIERS[0];

  const handleUpgradeClick = (id: "lula" | "premium" | "sadc") => {
    setSuccessMsg(null);
    if (onUpgradePlan) {
      onUpgradePlan(id);
    }
    setSuccessMsg(`Plan upgraded successfully! 💎 You now have full access to ${TIERS.find(t => t.id === id)?.name} features.`);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-[#C6DFD7] rounded-3xl p-5 text-left shadow-xl space-y-5" id="subscription-tiers-panel">
      
      {/* Header and billing cycle selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-100 pb-3">
        <div>
          <span className="text-[8.5px] font-black uppercase text-[#E84FA0] bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full tracking-wide inline-flex items-center gap-1">
            <Gem className="w-3 h-3 text-[#E84FA0]" /> SADC Maternal Membership Tiers
          </span>
          <h3 className="text-sm font-black text-[#2B1B2E] mt-1.5 uppercase">Explore Subscription Packages</h3>
          <p className="text-[9.5px] text-[#7A6B72] font-semibold leading-none">Compare health benefits, clinician sync speed, and tools.</p>
        </div>

        {/* Billing cycle slider */}
        <div className="flex bg-[#FAF6F2] p-0.5 border border-neutral-200 rounded-xl shrink-0 self-stretch sm:self-auto justify-between">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-2.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer text-center ${
              billingCycle === "monthly" ? "bg-white text-[#2B1B2E] shadow-3xs" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annually")}
            className={`px-2.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer text-center flex items-center gap-1 ${
              billingCycle === "annually" ? "bg-white text-[#2B1B2E] shadow-3xs" : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Annually <span className="text-[7px] text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded font-black">-20%</span>
          </button>
        </div>
      </div>

      {/* Grid of Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
        {TIERS.map((tier) => {
          const isSelectedPlan = tier.id === currentPlan;
          const isActivePreview = tier.id === activePlanId;
          const calculatedPrice = billingCycle === "monthly" 
            ? tier.priceMonthly 
            : Math.round(tier.priceMonthly * 12 * 0.8);

          return (
            <div 
              key={tier.id}
              onClick={() => setActivePlanId(tier.id)}
              className={`p-4 bg-white/70 border-2 rounded-2xl flex flex-col justify-between space-y-4 transition-all relative cursor-pointer hover:shadow-xs ${
                isActivePreview 
                  ? `${tier.id === "lula" ? "border-[#4F7066]" : tier.id === "premium" ? "border-[#E84FA0]" : "border-amber-400"} shadow-sm bg-stone-50/10` 
                  : "border-slate-150 hover:border-slate-350"
              }`}
            >
              {isSelectedPlan && (
                <span className="absolute -top-2.5 right-4 bg-[#4F7066] text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full shadow-3xs">
                  Active Plan
                </span>
              )}
              {tier.isPopular && (
                <span className="absolute -top-2.5 left-4 bg-[#E84FA0] text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full shadow-3xs">
                  Most Popular
                </span>
              )}

              <div className="space-y-2">
                <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded inline-block ${tier.badgeBg}`}>
                  {tier.id === "lula" ? "Subsidized" : tier.id === "premium" ? "Specialist" : "Institutional"}
                </span>
                <h4 className="text-[12px] font-black uppercase text-[#2B1B2E]">{tier.name}</h4>
                <p className="text-[9.5px] text-[#7A6B72] font-semibold leading-tight line-clamp-2 min-h-[24px]">
                  {tier.tagline}
                </p>

                {/* Price Display */}
                <div className="pt-1.5 flex items-baseline gap-1 select-none">
                  <span className="font-mono text-base font-black text-[#2B1B2E]">
                    {calculatedPrice === 0 ? "FREE" : `${calculatedPrice} ${tier.currency}`}
                  </span>
                  {calculatedPrice > 0 && (
                    <span className="text-[8px] text-[#7A6B72] font-semibold">
                      / {billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick visual check indicator */}
              <div className="w-full h-1 bg-neutral-150 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${tier.id === "lula" ? "bg-[#4F7066]" : tier.id === "premium" ? "bg-[#E84FA0]" : "bg-amber-400"}`}
                  style={{ width: tier.id === "lula" ? "40%" : tier.id === "premium" ? "75%" : "100%" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Notification Message Area */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold rounded-xl text-[10px] flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Selection Details & Comparison Chest */}
      <div className="p-4 bg-white/95 border border-[#C6DFD7] rounded-2xl text-left space-y-3.5 relative overflow-hidden shadow-2xs">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4F7066]/5 to-transparent rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <span className="text-[9px] font-black uppercase text-[#2B1B2E]">
            Included Benefits for {activeTier.name}
          </span>
          <span className="text-[8px] font-bold text-[#7A6B72]">
            {activeTier.features.length} Features unlocked
          </span>
        </div>

        {/* Benefits lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
          
          {/* Active Features */}
          <div className="space-y-1.5">
            <span className="text-[8.5px] font-black uppercase text-[#4F7066] tracking-wider block">
              ✓ What you get:
            </span>
            <ul className="space-y-1.5">
              {activeTier.features.map((feat, idx) => (
                <li key={idx} className="text-[10px] font-bold text-[#2B1B2E] flex items-start gap-1.5 leading-snug">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Locked/Omitted features */}
          <div className="space-y-1.5">
            <span className="text-[8.5px] font-black uppercase text-amber-700 tracking-wider block">
              {activeTier.omissions.length > 0 ? "⚠️ Locked / Upgraded Features:" : "✨ All features unlocked"}
            </span>
            
            {activeTier.omissions.length > 0 ? (
              <ul className="space-y-1.5 opacity-65">
                {activeTier.omissions.map((omit, idx) => (
                  <li key={idx} className="text-[10px] font-semibold text-[#7A6B72] flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full shrink-0 mt-1.5" />
                    <span>{omit}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="bg-amber-50/50 border border-amber-200 p-2.5 rounded-xl text-[9px] font-semibold text-amber-950 flex gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>You have unlocked the absolute maximum support tier. Thank you!</span>
              </div>
            )}
          </div>

        </div>

        {/* CTA Upgrade Form Button */}
        <div className="pt-2 border-t border-dashed border-neutral-100 flex gap-2">
          {activePlanId !== currentPlan ? (
            <button
              type="button"
              onClick={() => handleUpgradeClick(activePlanId)}
              className="vytal-btn-gradient flex-1 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-[0.98] text-center flex items-center justify-center gap-1.5"
            >
              <span>Subscribe & Secure Upgraded Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="bg-neutral-100 text-neutral-400 flex-1 font-extrabold text-xs py-3 rounded-xl text-center cursor-not-allowed border border-neutral-200"
            >
              Plan is active on this session
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-[#C6DFD7] text-[#2B1B2E] font-black text-xs px-4 rounded-xl cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              Keep Existing Plan
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
}
