import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy-initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. Health & Config endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    apiKeyConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    timestamp: new Date().toISOString()
  });
});

// 2. Risk Evaluation Clinical Decision-Support Endpoint
app.post("/api/triage-risk", async (req: Request, res: Response): Promise<void> => {
  const { systolic, diastolic, pulse, temperature, weight, symptoms, medicalHistory, age, gestationalWeeks } = req.body;

  // 1. Rules-based fallback for low latency and safety/key redundancy
  let fallbackRisk: "normal" | "medium" | "high" | "critical" = "normal";
  let fallbackSignal = "Vitals are within range for gestational baseline.";
  const fallbackPrompts: string[] = ["Proceed with routine ANC (Antenatal Care) schedules."];
  const fallbackTips: string[] = ["Stay hydrated and maintain nutritional variety."];

  // Clinical Rules Triage
  const sys = Number(systolic) || 120;
  const dia = Number(diastolic) || 80;
  const pul = Number(pulse) || 80;
  const temp = Number(temperature) || 36.6;
  const weeks = Number(gestationalWeeks) || 20;
  const activeSymptoms: string[] = symptoms || [];
  const history: string[] = medicalHistory || [];

  // Severe hypertension or hypertensive urgency
  if (sys >= 160 || dia >= 110) {
    fallbackRisk = "critical";
    fallbackSignal = `Severe maternal hypertension (${sys}/${dia} mmHg) detected. Patient is at immediate risk of eclampsia.`;
    fallbackPrompts.push("IMMEDIATE crisis referral to emergency obstetrics.", "Prepare magnesium sulfate to control seizures.", "Re-evaluate urine protein.");
    fallbackTips.push("Seek emergency hospital care immediately.", "Do not eat or drink until checked by emergency nurse.");
  }
  // Mild/Moderate hypertension
  else if (sys >= 140 || dia >= 90) {
    fallbackRisk = "high";
    fallbackSignal = `Maternal hypertension (${sys}/${dia} mmHg) detected. Needs pre-eclampsia watch.`;
    fallbackPrompts.push("Admit or monitor closely within 24 hours.", "Check urine protein dips.", "Refer to doctor/obstetrician.");
    fallbackTips.push("Reduce salt and rest.", "Immediately report visual changes, severe headaches, or epigrastic pain.");
  }

  // Pre-eclampsia danger symptoms
  const hasSevereSymptom = activeSymptoms.some(s => 
    s.toLowerCase().includes("blurry vision") || 
    s.toLowerCase().includes("severe headache") || 
    s.toLowerCase().includes("swollen face") ||
    s.toLowerCase().includes("epigastric pain") ||
    s.toLowerCase().includes("bleeding")
  );

  if (hasSevereSymptom) {
    if (fallbackRisk === "normal") {
      fallbackRisk = "high";
      fallbackSignal = "Danger symptom check-in triggered eclampsia risk evaluation.";
    } else {
      fallbackRisk = "critical";
    }
    fallbackPrompts.push("Urgent clinician evaluation for pre-eclampsia/eclampsia cascade.", "Order obstetric blood panel.");
    fallbackTips.push("Report immediately to the nearest high-acuity labor ward.");
  }

  // Sepsis risk (High fever)
  if (temp >= 38.0) {
    fallbackRisk = "critical";
    fallbackSignal = `High maternal fever (${temp}°C) indicates potential focus of sepsis.`;
    fallbackPrompts.push("Review for uterine tenderness/foul discharge.", "Initiate broad-spectrum antibiotic workup.", "Check white blood count.");
    fallbackTips.push("Attend clinic immediately. Rapid infections can jeopardize the baby.");
  }

  // Fast Pulse
  if (pul >= 120) {
    if (fallbackRisk !== "critical") fallbackRisk = "high";
    fallbackSignal += ` Maternal tachycardia (${pul} bpm) requires analysis.`;
    fallbackPrompts.push("Check hemoglobin level for severe gestational anemia.", "Check for dehydration/shock.");
  }

  // Prior pre-eclampsia or GDM history
  if (history.some(h => h.toLowerCase().includes("eclampsia") || h.toLowerCase().includes("diabetes"))) {
    fallbackRisk = fallbackRisk === "normal" ? "medium" : fallbackRisk;
    fallbackSignal += " High-risk obstetrical history triggers close surveillance.";
    fallbackPrompts.push("Increase frequency of ANC check-ins.", "Initiate low-dose aspirin protocol if before 16 weeks.");
  }

  // Try calling Gemini to override/enhance with detailed contextual clinical explanation
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Analyze this Sub-Saharan African pregnancy profile and generate clinical decision support triage feedback.
Patient age: ${age} years.
Gestational age: ${weeks} weeks.
Blood pressure: ${sys}/${dia} mmHg.
Pulse: ${pul} bpm.
Temperature: ${temp} °C.
Weight: ${weight} kg.
Symptom check: [${activeSymptoms.join(", ")}].
Obstetrical background: [${history.join(", ")}].
Current standard rule evaluation classifies this profile at "${fallbackRisk}" risk level due to: "${fallbackSignal}".

Based on clinical guidelines for Low-Resource maternal care, produce a structured clinical analysis in JSON format. Do not prescribe treatments autonomously, frame it as guidelines for the clinician/nurse.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the Vytal Bridge AI Triager, a clinical decision support API. 
Analyze the mothers' clinical parameters and return a highly detailed risk-profile validation.
Categorize the riskLevel exactly as 'normal', 'medium', 'high', or 'critical'. Use clinical safety framing. 
Return response in JSON matching the specified schema. Output is purely advisory decision support.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { 
                type: Type.STRING, 
                description: "Must be 'normal', 'medium', 'high', 'critical' based on worst-case maternal risk triggers" 
              },
              drivingSignal: { 
                type: Type.STRING, 
                description: "Clear, concise direct clinical root-cause explanation in English" 
              },
              trimesterExplanation: {
                type: Type.STRING,
                description: "Extremely detailed trimester-specific explanation. Focus on fetal organogenesis, placental vascular tone, or late-stage cardiac strain depending on weeks."
              },
              confidenceLevel: {
                type: Type.INTEGER,
                description: "Confidence percentage of this mathematical triage from 0 to 100 based on readings quality and symptoms completeness"
              },
              riskBreakdown: {
                type: Type.ARRAY,
                description: "Detailed parameter-by-parameter analysis contributing to risk assessment",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    parameter: { type: Type.STRING, description: "e.g., 'Blood Pressure', 'Pulse', 'Temperature', 'Symptoms'" },
                    risk: { type: Type.STRING, description: "Must be 'normal', 'medium', 'high', or 'critical'" },
                    contribution: { type: Type.STRING, description: "Explicit reason why this vital is scored at this level" }
                  },
                  required: ["parameter", "risk", "contribution"]
                }
              },
              clinicalPrompts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of actionable steps or diagnostic checks for the clinic midwife or community health worker"
              },
              educationTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Empowering tips for the pregnant woman to manage or recognize symptoms at home"
              }
            },
            required: ["riskLevel", "drivingSignal", "trimesterExplanation", "confidenceLevel", "riskBreakdown", "clinicalPrompts", "educationTips"]
          }
        }
      });

      const responseText = response.text?.trim() || "";
      if (responseText) {
        const parsed = JSON.parse(responseText);
        res.json(parsed);
        return;
      }
    } catch (err) {
      console.error("Gemini triage error, using local fallback rules engine:", err);
    }
  }

  // Calculate detailed trimester variables for our robust fallback
  let trimesterExplanationP = "";
  if (weeks <= 12) {
    trimesterExplanationP = `Trimester 1 Focus (Week ${weeks}): Crucial embryonic development and organogenesis. Progesterone relaxes smooth muscles, often causing fatigue or nausea. Baseline blood pressure should be established to track trends.`;
  } else if (weeks <= 26) {
    trimesterExplanationP = `Trimester 2 Focus (Week ${weeks}): Plasma volume expands by 50%, initiating mild physiologic anemia. Gestational high blood pressure after week 20 can silently signal pre-eclampsia. Monitor weekly.`;
  } else {
    trimesterExplanationP = `Trimester 3 Focus (Week ${weeks}): Cardiac output rises drastically to support massive late-stage fetal growth. Heightened watch for sudden pre-eclampsia swells, fetal kick declines, and protein abnormalities remains essential.`;
  }

  let baseConfidence = 95;
  if (fallbackRisk === "critical") baseConfidence = 98;
  if (fallbackRisk === "high") baseConfidence = 92;
  if (fallbackRisk === "medium") baseConfidence = 87;

  const fallbackBreakdown = [
    {
      parameter: "Blood Pressure",
      risk: sys >= 160 || dia >= 110 ? "critical" : sys >= 140 || dia >= 90 ? "high" : "normal",
      contribution: sys >= 140 || dia >= 90 
        ? `Tension reading ${sys}/${dia} mmHg is elevated and triggers pre-eclampsia warnings.` 
        : `Reading ${sys}/${dia} mmHg sits safely within standard gestational parameters.`
    },
    {
      parameter: "Heart Rate",
      risk: pul >= 120 ? "high" : pul >= 100 ? "medium" : "normal",
      contribution: pul >= 100 
        ? `Maternal heart rate is elevated (${pul} bpm), check for hydration or gestational fever.` 
        : `Heart rate of ${pul} bpm shows standard active maternal pumping efficiency.`
    },
    {
      parameter: "Temperature",
      risk: temp >= 38.0 ? "critical" : temp >= 37.5 ? "medium" : "normal",
      contribution: temp >= 38.0 
        ? `High fever (${temp}°C) requires immediate antibiotic screening for uterine infection risks.` 
        : `Temperature of ${temp}°C is normal and stable.`
    },
    {
      parameter: "Symptoms Check",
      risk: hasSevereSymptom ? "critical" : "normal",
      contribution: hasSevereSymptom 
        ? "Warning symptoms (like vision spots or severe head pressure) are active." 
        : "No high-priority danger warning indicators are checked in today."
    }
  ];

  // Return fallback if Gemini is not configured or fails
  res.json({
    riskLevel: fallbackRisk,
    drivingSignal: fallbackSignal,
    trimesterExplanation: trimesterExplanationP,
    confidenceLevel: baseConfidence,
    riskBreakdown: fallbackBreakdown,
    clinicalPrompts: fallbackPrompts,
    educationTips: fallbackTips,
    ruleEngineFallback: !client
  });
});

// 3. Educational AI Companion Chat Endpoint (with Local Language Adaptations)
app.post("/api/chat-companion", async (req: Request, res: Response) => {
  const { messages, language, gestationalWeeks, history, symptoms } = req.body;

  const resolvedLang = language || "English";
  const weeksStr = gestationalWeeks ? `at week ${gestationalWeeks} of pregnancy` : "pregnant";
  const historyStr = history && history.length ? `with medical history parameters: [${history.join(", ")}]` : "";
  const symptomsStr = symptoms && symptoms.length ? `currently experiencing symptoms: [${symptoms.join(", ")}]` : "";

  const systemPrompt = `You are the Vytal Bridge AI Companion, an empathetic maternal health support system optimized specifically for mothers in Sub-Saharan Africa. 
You communicate, console, and guide clinical-safety conversations.
The user is a mother ${weeksStr} ${historyStr} ${symptomsStr}.
The client is asking for reassurance and educational wisdom.

STRICT CLINICAL BOUNDARY MAP:
- You are a reassuring educational companion. You cannot diagnose or prescribe medicines.
- Always translate medical definitions into comforting, easily understood, low-literacy-friendly terms.
- Language Context: Answer strictly in **${resolvedLang}** (whether English, siSwati, isiZulu, or Setswana).
- If danger red-flags are detected or mentioned (severe headache, blurry vision, severe face swelling, rapid breathing, blood/bleeding, water breaking early, chest pains, decreased kick counts), you must immediately insert a highly highlighted alert box telling her to visit her nurse at the clinic.

Keep responses friendly, warm, cultural, and direct. Keep spacing clean, utilizing simple bullet points.`;

  const client = getGeminiClient();
  if (client) {
    try {
      // Structure the messages for Gemini
      const apiMessages = (messages || []).map((m: any) => ({
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.text }],
      }));

      // Append default greeting if empty
      if (!apiMessages.length) {
        apiMessages.push({ role: "user", parts: [{ text: "Hello! Please introduce yourself." }] });
      }

      // Add System prompt and call generateContent (which is correct for the modern @google/genai SDK)
      const lastMessage = apiMessages[apiMessages.length - 1];
      const previousHistory = apiMessages.slice(0, -1);

      // Map dialogue to Gemini contents format
      const contents = [
        ...previousHistory,
        lastMessage
      ];

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "";
      res.json({ text: responseText, language: resolvedLang });
      return;
    } catch (err: any) {
      console.error("Gemini Companion chat error:", err);
      res.status(500).json({ error: err.message || "Gemini service encountered an issue." });
      return;
    }
  }

  // Local rule-based offline chatbot simulation if Gemini is not available
  const userText = messages && messages.length ? messages[messages.length - 1].text.toLowerCase() : "";
  let answer = "";

  if (resolvedLang === "siSwati") {
    answer = "Sawubona umama! Ndiyajabula kakhulu ukhubona lapha. Gcina impilo yakho nengane yakho ngokuvakashela ikliniki.";
    if (userText.includes("headache") || userText.includes("kuhlungu") || userText.includes("vitals")) {
      answer += " **KUBALULEKILE:** Uma unekhanda elibuhlungu kakhulu noma ubone kufiphala emehlweni, vakashela emtholampilo ngesikhathi kunesimo esiphuthumayo (Pre-eclampsia safety).";
    }
  } else if (resolvedLang === "isiZulu") {
    answer = "Ngiyakwamukela mama! Ngibonga ukulungela kwakho ukugcina ingane iphephile. Gcina izikhumbuzo zekliniki ziseduze.";
    if (userText.includes("bp") || userText.includes("hypertension") || userText.includes("vision")) {
      answer += " **ISAZISO SOKUPHEPHA:** Uma umfutho wegazi ukhuphuka kakhulu, vakashela umtholampilo oseduze masinyane.";
    }
  } else if (resolvedLang === "Setswana") {
    answer = "Dumela mma! Ke go ema nokeng mo mosepeleng o wa boimana. O tlhoka go nwa metse le go ikhutsa.";
    if (userText.includes("pregnant") || userText.includes("danger")) {
      answer += " **TLHAGISO:** Fa o ikutlwa o sa tsoga sentle, o bona meriti mo matlhong, lematla go ya kwa kliniking go ya go tlhatlhobja.";
    }
  } else {
    answer = "Hello mama! I am your Vytal Bridge Educational Companion. Let's make sure you and your bundle of joy are healthy throughout these nine months.";
    if (userText.includes("pre-eclampsia") || userText.includes("bp") || userText.includes("headache") || userText.includes("vision")) {
      answer += "\n\n⚠️ **WARNING DANGER SIGNS:** Based on your description, severe headaches or vision blurring can indicate high blood pressure risk. Please contact your local community health worker or nurse at the clinic today.";
    } else {
      answer += "\n\nRemember to eat iron-rich foods (spinach, beans) and attend all ANC scheduled check-ups! What can I help you with today?";
    }
  }

  res.json({
    text: answer,
    language: resolvedLang,
    simulated: true,
    warning: "Running offline-simulation because process.env.GEMINI_API_KEY is not configured."
  });
});

// ----------------------------------------------------
// VITE OR STATIC FILE INTEGRATION
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing: send everything else to index.html
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vytal Bridge Server running on http://localhost:${PORT}`);
  });
}

startServer();
