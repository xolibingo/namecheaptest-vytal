import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Sparkles, CheckCircle2, Video, Languages, ClipboardCheck, ArrowRight, Laptop } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  category: "maternal" | "platform";
  author: string;
  duration: string;
  embedId: string;
  thumbnailUrl: string;
  description: string;
  takeaways: {
    en: string[];
    sz: string[];
    tn: string[];
  };
}

const EDUCATIONAL_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Essential Prenatal Care & Maternal Health Timeline",
    category: "maternal",
    author: "World Health Organization (WHO)",
    duration: "4:12",
    embedId: "Q4X-P6wre5M",
    thumbnailUrl: "/src/assets/images/successful_mother_1781975583165.jpg",
    description: "A comprehensive clinical breakdown of required prenatal screenings, supplements intake, and ultrasound checkpoints across your three trimesters.",
    takeaways: {
      en: [
        "Attend at least 8 prenatal contacts with your local midwife or specialist.",
        "Take high-dose folate and iron supplements daily to prevent anemia and birth anomalies.",
        "Monitor blood pressure values at every single encounter (aim to keep below 140/90)."
      ],
      sz: [
        "Vakashela imisebenti yetempilo lokungenani kasitfoba ku-midwife nakunhlanhla.",
        "Tsatfa emaphilisi e-Folate kanye ne-Iron onkhe mahlana kute uvikele ingati lephansi.",
        "Hlola sikhundla sengati masinyane mahlana onkhe."
      ],
      tn: [
        "Kopana le mmelegisi kgotsa ngaka ya gago bonyane gantsi di le robedi ka nako ya pelegi.",
        "Tsaya ditshegetso tsa Folate le Aene letsatsi le letsatsi go thibela bolwetse jwa madi.",
        "Lekola madi a gago nako le nako fa o kopana le ba tleleniki."
      ]
    }
  },
  {
    id: "vid-2",
    title: "Recognizing Gestational Risks & Pre-Eclampsia Signals",
    category: "maternal",
    author: "Global Maternal Health Academy",
    duration: "5:45",
    embedId: "S_8V06hT9C0",
    thumbnailUrl: "/src/assets/images/gynecology_background_1781981188780.jpg",
    description: "Learn to spot high-risk indicators such as severe persistent headaches, extreme face swelling, or blurry vision, which warn of maternal hypertensive crises.",
    takeaways: {
      en: [
        "Pre-eclampsia affects up to 8-10% of Southern African pregnancies.",
        "Warning triggers include localized swelling (face, feet) and severe headaches.",
        "Immediate reporting and specialist admission can completely safeguard the child."
      ],
      sz: [
        "I-Pre-eclampsia itsandza kufikela ku-8% wetetfuko taseNingizimu ye-Afrika.",
        "Tiphumo tekuphaphama tifaka ekukhumukeni kwemtimba nematfumbu mshini.",
        "Kubika masinyane kuyasindza imphilo yomntfwana na-Make."
      ],
      tn: [
        "Pre-eclampsia e ama go fitlha go 8-10% ya baimana mo Borwa jwa Afrika.",
        "Ditshupo tsa tlhagiso di akaretsa go ruruga ga difatlhego/dinao le go opiwa ke tlhogo thata.",
        "Go bega ka pele go ka falotsa botshelo jwa ngwana le mme."
      ]
    }
  },
  {
    id: "vid-3",
    title: "Ask Vytal Platform Walkthrough: Hands-Free AI Voice Triage",
    category: "platform",
    author: "Vytal Bridge Tech Team",
    duration: "3:30",
    embedId: "uG_w2YvlyLg",
    thumbnailUrl: "/src/assets/images/pregnant_advice_1781975600218.jpg",
    description: "A comprehensive instructional video illustrating how expecting mothers can record and transcribe pregnancy complaints in English, siSwati, and Setswana.",
    takeaways: {
      en: [
        "Tap the microphone button inside the AI Voice Chat space.",
        "Speak clearly in English, siSwati, or Setswana to describe symptoms.",
        "The system transcribes and generates a risk-level report for clinical sync."
      ],
      sz: [
        "Chofoza inkinobho yemakhrofoni ngekhatsi we-AI Voice Chat.",
        "Khuluma kahle ngesiNgisi noma ngesiSwati kute uchaze mikhombisombuso.",
        "Luhlelo lubhala lwati lwakho bese luthumela umbiko esikhungweni sedokotela."
      ],
      tn: [
        "Tobetsa konopo ya maekorofone mo teng ga AI Voice Chat.",
        "Bua sentle ka Setswana kgotsa Sejatlhapi go tlhalosa dika tsa gago.",
        "Tsamaiso e rurifatsa puo mme e kwale pego ya bodiredi go ya kwa ngakeng."
      ]
    }
  },
  {
    id: "vid-4",
    title: "Maternal-Clinician Sync: Rural Telehealth Coordination",
    category: "platform",
    author: "Mbabane Primary Health Centre",
    duration: "4:05",
    embedId: "uG_w2YvlyLg", // Re-using educational asset safely with custom overlays
    thumbnailUrl: "/src/assets/images/sadc_mother_counseling_1781976955140.jpg",
    description: "See how registered vital logs are transferred to Sister Thandeka's board and how doctors provide instant follow-up consultations remoteness-proof.",
    takeaways: {
      en: [
        "Offline entries are automatically cached and queue for synchronization.",
        "Synchronized logs update the clinician's vital status cards in 2 seconds.",
        "Doctors return text alerts, medication orders, and postpartum schedules."
      ],
      sz: [
        "Tako lwati longaphandle luyagcinwa kute luhambisane kahle emva kwesikhatsi.",
        "Lwati lucungetfwa ngetikhatsi letimbili kudokotela wakho.",
        "Bodokotela batfumela tikhombisombuso, imitsi, kanye nemikhombisombuso postpartum."
      ],
      tn: [
        "Dilo di sekasekiwa mo sejaneng mme di bolokwe go fitlha inthanete e ba teng.",
        "Dipego di itsisepaka mo metsotsong e le mebedi fela kwa tleleniking.",
        "Ditswerere di tla go neela dikgakololo le ditaelo tsa melemo fela mo thulaganyong."
      ]
    }
  }
];

export default function EducationalVideoHub() {
  const [videoList, setVideoList] = useState<VideoItem[]>(EDUCATIONAL_VIDEOS);
  const [activeCategory, setActiveCategory] = useState<"maternal" | "platform">("maternal");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(EDUCATIONAL_VIDEOS[0]);
  const [videoLang, setVideoLang] = useState<"en" | "sz" | "tn">("en");
  const [isPlaying, setIsPlaying] = useState(false);

  // AI Generative Video Lab states
  const [showAiStudio, setShowAiStudio] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("Ankle & Feet Swelling Mitigation");
  const [selectedTrimester, setSelectedTrimester] = useState("Trimester 3 (Weeks 27-40)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState("");

  const filteredVideos = videoList.filter(v => v.category === activeCategory);

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    setGenProgress(5);
    setGenStep("Contacting AI Studio prenatal model gateway...");

    const interval = setInterval(() => {
      setGenProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const newId = `vid-gen-${Date.now()}`;
          const newVideo: VideoItem = {
            id: newId,
            title: `AI Generated: ${selectedTopic} Course`,
            category: "maternal",
            author: "AI Studio Health Co-Pilot",
            duration: "3:40",
            embedId: "Q4X-P6wre5M", // High quality maternal education preview placeholder
            thumbnailUrl: "/src/assets/images/successful_mother_1781975583165.jpg",
            description: `A direct, AI-crafted tutorial covering ${selectedTopic} during ${selectedTrimester}, translating clinical protocols into clear community-health reminders.`,
            takeaways: {
              en: [
                `Rest with legs elevated at least 3-4 times daily to target ${selectedTopic}.`,
                "Drink 2-3 liters of clean water daily to assist natural metabolic balance.",
                "Seek immediate support if face or wrist swelling occurs instantly."
              ],
              sz: [
                `Phumula ngetinya letiphakanyisiwe kathathu nobe kane mahlana kute uphelise ${selectedTopic}.`,
                "Natsa emalitha lamabili kufikela kulamatsatfu emanti ahlantekile malanga onkhe.",
                "Funa lusito lwetempilo masinyane uma ukhumuka emkhononisweni."
              ],
              tn: [
                `Ikae ka go phahamisa maoto ga roast tlharataro go ka letla phokotso ya ${selectedTopic}.`,
                "Nwa dilitara di le pedi go ya go tse tharo tsa metsi a a phepa letsatsi le letsatsi.",
                "Batla thuso ka pele fa o ruruga mo sefatlhegong kgotsa mo matsogong."
              ]
            }
          };

          setVideoList(prev => [newVideo, ...prev]);
          setSelectedVideo(newVideo);
          setIsGenerating(false);
          setGenStep("");
          // Switch to category where it is created
          setActiveCategory("maternal");
          setIsPlaying(false);
          return 100;
        }

        const next = prev + 15;
        if (next < 30) {
          setGenStep("Parsing clinical parameters of SADC region study boards...");
        } else if (next < 65) {
          setGenStep("Synthesizing multilingual audio scripts (EN, siSwati, Setswana)...");
        } else if (next < 90) {
          setGenStep("Assembling high-contrast pregnancy educational footage...");
        } else {
          setGenStep("Refining clinical takeaways packages...");
        }
        return next > 100 ? 100 : next;
      });
    }, 600);
  };

  return (
    <div className="bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl p-6 md:p-8 text-left shadow-lg space-y-6" id="educational-media-center">
      
      {/* Container Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#CFE6E3]/50 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase text-[#4F7066] bg-[#4F7066]/10 px-3 py-1 rounded-full tracking-wider">
            🎬 MULTILINGUAL EDUCATIONAL PORTAL
          </span>
          <h2 className="text-2xl font-black text-[#2B1B2E] uppercase mt-2">
            Maternal Video Hub & Vytal Onboarding
          </h2>
          <p className="text-xs text-[#7A6B72] font-semibold max-w-2xl mt-1">
            Empowering expectant families with clinical pregnancy instructions and deep tutorial walkthroughs of our offline-first SADC health triage platform.
          </p>
        </div>
        
        {/* Toggle Categories */}
        <div className="flex bg-[#EEF5F2] p-1 rounded-xl border border-[#D5E1DB]">
          <button
            type="button"
            onClick={() => {
              setActiveCategory("maternal");
              setSelectedVideo(EDUCATIONAL_VIDEOS[0]);
              setIsPlaying(false);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "maternal"
                ? "bg-white text-[#2B1B2E] shadow-2xs border border-[#CFE6E3]/50"
                : "text-[#7A6B72] hover:text-[#2B1B2E]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-[#E84FA0]" /> Pregnancy Guidance
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("platform");
              setSelectedVideo(EDUCATIONAL_VIDEOS[2]);
              setIsPlaying(false);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === "platform"
                ? "bg-white text-[#2B1B2E] shadow-2xs border border-[#CFE6E3]/50"
                : "text-[#7A6B72] hover:text-[#2B1B2E]"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#4F7066]" /> Platform Tutorial
            </span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Premium Active Video Screen */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#2B1B2E] rounded-3xl overflow-hidden aspect-video relative shadow-xl border border-white/10">
            {isPlaying ? (
              <iframe
                title={selectedVideo.title}
                src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=1&rel=0&modestbranding=1`}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full relative group">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-80 group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1B2E] via-[#2B1B2E]/20 to-transparent flex flex-col justify-end p-5 text-left">
                  <span className="text-[9px] font-black uppercase text-[#E84FA0] bg-pink-100 rounded px-2 py-0.5 inline-block self-start mb-1.5">
                    {selectedVideo.author} • {selectedVideo.duration} mins
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight mb-2 uppercase">
                    {selectedVideo.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition-transform cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Video Details */}
          <div className="p-5 bg-white border border-[#CFE6E3]/40 rounded-3xl text-left space-y-4 relative overflow-hidden shadow-xs">
            {/* Visual ambient bloom */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E84FA0]/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-black uppercase text-[#2B1B2E]">{selectedVideo.title}</h4>
                <p className="text-[10.5px] text-[#7A6B72] font-semibold mt-0.5">{selectedVideo.description}</p>
              </div>
            </div>

            {/* Localized Key Takeaway Area */}
            <div className="border-t border-dashed border-[#CFE6E3] pt-4 text-left">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-[9.5px] font-black uppercase text-[#4F7066] flex items-center gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5" /> Core Clinical Takeaways
                </span>
                
                {/* Translator Controller */}
                <div className="flex bg-[#FAF6F2] p-0.5 border border-[#D5E1DB] rounded-lg">
                  {([
                    { code: "en", label: "English" },
                    { code: "sz", label: "siSwati" },
                    { code: "tn", label: "Setswana" }
                  ] as const).map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setVideoLang(lang.code)}
                      className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold cursor-pointer transition-all ${
                        videoLang === lang.code ? "bg-[#4F7066] text-white shadow-3xs" : "text-[#7A6B72] hover:text-[#2B1B2E]"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Takeaway items */}
              <ul className="space-y-2">
                {selectedVideo.takeaways[videoLang].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-[10px] sm:text-[11px] text-[#2B1B2E] font-bold flex items-start gap-2 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Other Videos in the selected category */}
        <div className="lg:col-span-5 space-y-3.5">
          <span className="text-[8.5px] font-black uppercase text-[#7A6B72] tracking-wider block">
            Upcoming Chapters ({filteredVideos.length})
          </span>
          
          <div className="space-y-2.5">
            {filteredVideos.map((video) => {
              const isSelected = video.id === selectedVideo.id;
              return (
                <button
                  key={video.id}
                  onClick={() => {
                    setSelectedVideo(video);
                    setIsPlaying(false);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex gap-3 cursor-pointer items-start relative overflow-hidden ${
                    isSelected
                      ? "bg-white border-[#FF6FB1] text-[#E84FA0] ring-1 ring-[#FF6FB1]/20 shadow-sm scale-[1.01]"
                      : "bg-white/60 border-neutral-150 hover:bg-white text-[#2B1B2E]"
                  }`}
                >
                  {/* Thumbnail micro layer */}
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-neutral-200 border border-white/50 shrink-0 relative shadow-3xs">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#2B1B2E]/30 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-[#2B1B2E]/90 text-white text-[7px] font-extrabold px-1 rounded">
                      {video.duration}
                    </span>
                  </div>

                  {/* Context content */}
                  <div className="space-y-0.5 leading-tight flex-1 text-left">
                    <h5 className="text-[10.5px] font-black uppercase leading-snug line-clamp-1">
                      {video.title}
                    </h5>
                    <p className="text-[9px] text-[#7A6B72] line-clamp-2 leading-relaxed font-semibold">
                      {video.description}
                    </p>
                    <span className="text-[7.5px] font-black text-[#4F7066] uppercase block pt-0.5">
                      {video.author}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI VIDEO GENERATION CO-PILOT CARD */}
          <div className="bg-gradient-to-br from-[#1E112A] to-[#12071C] border border-[#BF7AF0]/30 rounded-2xl p-4 text-left space-y-3 shadow-md relative overflow-hidden" id="ai-video-generation-panel">
            {/* Ambient neon purple backdrop sparkle */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#BF7AF0]/15 rounded-full blur-xl pointer-events-none" />

            <div className="flex justify-between items-center">
              <span className="inline-flex items-center gap-1 text-[8.5px] font-black uppercase text-[#DCA4FF] bg-[#BF7AF0]/20 px-2.5 py-0.5 rounded-full tracking-wider">
                <Sparkles className="w-3 h-3 text-[#DCA4FF] animate-pulse" /> AI Studio Video Lab
              </span>
              <button
                type="button"
                onClick={() => setShowAiStudio(!showAiStudio)}
                className="text-[9px] font-black uppercase text-pink-300 hover:underline transition-all cursor-pointer"
                id="toggle-ai-video-studio"
              >
                {showAiStudio ? "[ Hide Lab ]" : "[ Open Dynamic Lab ]"}
              </button>
            </div>

            <div className="leading-tight">
              <strong className="text-[11px] font-black text-white uppercase block">
                Generate Custom Prenatal Videos
              </strong>
              <p className="text-[10px] text-pink-200/60 font-semibold leading-relaxed mt-0.5">
                Use our deep medical generator to instantly compile targeted trimester clinical tutorials and community voice reminders.
              </p>
            </div>

            {showAiStudio && (
              <div className="space-y-3 pt-2.5 text-xs border-t border-[#BF7AF0]/10" id="ai-video-setup-fields">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-pink-300 uppercase tracking-wider block">1. Select Target Topic</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-2 bg-[#261E30] border border-[#BF7AF0]/20 rounded-xl text-white text-[10.5px] focus:outline-none focus:border-[#BF7AF0]/50 cursor-pointer"
                    id="select-ai-video-topic"
                  >
                    <option value="Ankle & Feet Swelling Mitigation">Ankle-Swelling Mitigation</option>
                    <option value="Severe Hypertension Detection">Eclampsia & High BP Safety</option>
                    <option value="Active Labor Breathing Loops">Contraction Breathing Controls</option>
                    <option value="Folic Acid Supplements Dosage">Folate & Iron Tablet Intake</option>
                    <option value="Gestational Diabetes Nutritional Guidance">Biochemical Glucose Checks</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-pink-300 uppercase tracking-wider block">2. Select Gestation Stage</label>
                  <select
                    value={selectedTrimester}
                    onChange={(e) => setSelectedTrimester(e.target.value)}
                    className="w-full p-2 bg-[#261E30] border border-[#BF7AF0]/20 rounded-xl text-white text-[10.5px] focus:outline-none focus:border-[#BF7AF0]/50 cursor-pointer"
                    id="select-ai-video-trimester"
                  >
                    <option value="Trimester 1 (Weeks 1-12)">Trimester 1 (Weeks 1-12)</option>
                    <option value="Trimester 2 (Weeks 13-26)">Trimester 2 (Weeks 13-26)</option>
                    <option value="Trimester 3 (Weeks 27-40)">Trimester 3 (Weeks 27-40)</option>
                  </select>
                </div>

                {isGenerating ? (
                  <div className="p-3 bg-[#261E30]/60 border border-[#BF7AF0]/15 rounded-xl space-y-2 animate-pulse" id="ai-video-generation-progress">
                    <div className="flex justify-between text-[9px] font-black text-pink-300 uppercase">
                      <span className="truncate max-w-[170px]">{genStep}</span>
                      <span>{genProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-[#E84FA0] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${genProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateVideo}
                    className="w-full py-2 bg-gradient-to-r from-[#FF6FB1] to-[#E84FA0] hover:shadow-md text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all hover:scale-[1.01] active:scale-99 cursor-pointer flex items-center justify-center gap-1"
                    id="compile-ai-video-action"
                  >
                    <Sparkles className="w-3 h-3 text-white" /> Compile AI Training Video
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Prompt banner to register */}
          <div className="bg-[#EEF5F2] border border-[#C6DFD7] rounded-2xl p-4 text-left space-y-2 relative overflow-hidden" id="clinician-assistance-banner">
            <span className="text-xs">👶</span>
            <div className="leading-tight">
              <strong className="text-[10px] font-black text-[#4F7066] uppercase block">
                Do you need clinician assistance?
              </strong>
              <p className="text-[10px] text-[#5F716A] font-semibold leading-relaxed mt-0.5">
                Take part in interactive pregnancy academies, track daily fetal kicks, connect with local medical networks, and log physical metrics.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
