import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Info, CheckCircle2, ChevronLeft, ChevronRight, Activity, Calendar, Compass, Sparkles } from "lucide-react";

interface WeeklyMilestonesProps {
  currentWeek: number;
  appLanguage: string;
}

interface MilestoneData {
  week: number;
  trimester: number;
  milestone: string;
  milestoneSiSwati?: string;
  milestoneSetswana?: string;
  milestoneIsiZulu?: string;
  maternalChanges: string;
  maternalChangesSiSwati?: string;
  maternalChangesSetswana?: string;
  maternalChangesIsiZulu?: string;
  sizeComparison: string;
  sizeComparisonLocal: string;
  lengthCm: number;
  weightG: number;
  clinicalChecklist: string[];
  wellnessTip: string;
}

// Complete rich week-by-week pregnancy database (1 to 40)
const MILESTONE_DATABASE: Record<number, MilestoneData> = {
  1: {
    week: 1,
    trimester: 1,
    milestone: "Your body is preparing for pregnancy. The uterine lining is building up to support the future fertilized egg.",
    milestoneSiSwati: "Umtimba wakho ulungiselela kuthwala. Lulwelwe lwesitfukutseli luyakha kute lusekele licandza lelifesitile.",
    milestoneSetswana: "Mmele wa gago o baakanyetsa boimana. Golo go bapa le popelo go a ipepela go tshegetsa lee la kamoso.",
    milestoneIsiZulu: "Umzimba wakho ulungiselela ukukhulelwa. Ulwelwesi lwesibeletho luyazakhela ukuze lusekele iqanda.",
    maternalChanges: "Hormonal shifts begin. You might feel early fatigue or light emotional sensitivity.",
    maternalChangesSiSwati: "Tingucuko temahomoni tiyacala. Ungase utfole kudziba noko kuthinteka kamoya.",
    maternalChangesSetswana: "Diphetogo tsa di-hormone di a simolola. O ka nna wa utlwa letsapa le bofefo jwa maikutlo.",
    maternalChangesIsiZulu: "Izinguquko zamahomoni ziyaqala. Ungase uzizwe ukhathele kalula noma ube nemizwa eguquguqukayo.",
    sizeComparison: "Tiny cellular blastocyst",
    sizeComparisonLocal: "Sesame Seed (Sesame)",
    lengthCm: 0.1,
    weightG: 0.01,
    clinicalChecklist: [
      "Begin daily Folic Acid supplementation (400mcg) immediately.",
      "Stay hydrated by drinking pure local water (2.5L+).",
      "Avoid unprescribed medications or local herbal mixtures without clinic consultation."
    ],
    wellnessTip: "A strong pregnancy starts with cellular health. Nutrient absorption is highly boosted when folic acid is taken daily."
  },
  4: {
    week: 4,
    trimester: 1,
    milestone: "Implantation is complete. The tiny embryo is split into two layers: the placenta and the child's cells.",
    milestoneSiSwati: "Kuhlanganiseka kucalile. Lo mbumbulu lomncane uhlukene kabili: placenta netitfako temntfwana.",
    milestoneSetswana: "Go ipapa ga embryo go feleletse. Embryo e e nnye e kgaogane gabedi ke placenta le disele tsa ngwana.",
    milestoneIsiZulu: "Ukufakwa kombeletho kuqedile. Umbungu omncane uhlukene kabili: i-placenta namaseli omntwana.",
    maternalChanges: "Missed period, morning sickness may start, with light uterine cramping as implantation stabilizes.",
    maternalChangesSiSwati: "Kulahlekelwa sikhatsi senyanga, kucala kwesicanucanu sasekuseni setitfukutseli.",
    maternalChangesSetswana: "Go tlolwa ke thulaganyo ya thobalano, go lwala mo mosong go a simolola.",
    maternalChangesIsiZulu: "Ukuphuthelwa yisikhathi somjikelezo, isicanucanu sasekuseni singase siqale.",
    sizeComparison: "Mustard seed",
    sizeComparisonLocal: "Sesame Seed (Linhlamvu)",
    lengthCm: 0.2,
    weightG: 0.1,
    clinicalChecklist: [
      "Book an initial clinic date at your local SADC Maternal Health Centre.",
      "Screen for prenatal health vitals (Baseline Blood Pressure check).",
      "Cut down processed sugars and maximize green leafy intake."
    ],
    wellnessTip: "Iron combined with vitamin C (from local oranges or lemons) increases folate absorption efficiently."
  },
  8: {
    week: 8,
    trimester: 1,
    milestone: "The baby's heart beats rapidly at 150 BPM. Embryonic tail fades and tiny webbed fingers and toes develop.",
    milestoneSiSwati: "Inhlitiyo yemntfwana ishaya ngemandla lacatshangwako. Tinwane netitfuko tiyacala kukhombisa sitsandvo.",
    milestoneSetswana: "Pelo ya ngwana e uba ka bonako e le 150 BPM. Monatla o a nyelela mme menwana e a tlhagelela.",
    milestoneIsiZulu: "Inhliziyo yomntwana ishaya ngokushesha okukhulu. Iminwe nezinzwane ezincane ziyaqala ukubonakala.",
    maternalChanges: "Increased blood volume causes frequent urination. Senses of smell and taste are highly heightened.",
    maternalChangesSiSwati: "Kwandza kwegazi kubangela kuya endlini lencane njalo. Sango lekunukelela linamandla khulu.",
    maternalChangesSetswana: "Madi a mantsi a dira go nna o fula kgapetsa-kgapetsa. Maikutlo a go nkga le go utlwa a a okotsega.",
    maternalChangesIsiZulu: "Ukwanda kwegazi kubangela ukuchama njalo. Umzwelo wokuhogela nowokunambitha ubukhali kakhulu.",
    sizeComparison: "Wild Raspberry",
    sizeComparisonLocal: "Wild Marula Fruit (Mganu)",
    lengthCm: 1.6,
    weightG: 1.2,
    clinicalChecklist: [
      "Confirm blood group, rhesus hazard index, and early HIV/Syphilis PMTCT protocol screens.",
      "Track blood pressure to catch any early baseline hyper-responsiveness.",
      "Take gentle 15-minute walks in the cool shade to relieve morning nausea."
    ],
    wellnessTip: "Frequent, small high-protein meals help settle the stomach and stabilize morning blood sugars."
  },
  12: {
    week: 12,
    trimester: 1,
    milestone: "Fetal systems are fully constructed. Fingers can open and close, and kidneys start producing urine.",
    milestoneSiSwati: "Tinhlelo temtimba temntfwana tiphelele. Tinwane tiyavuleka tiphindze tivaleke, nezinso ticala kusebentsa.",
    milestoneSetswana: "Ditsela tsotlhe tsa mmele dithubegile. Menwana e a bulega le go tswalega, dintho di ntsha moroto.",
    milestoneIsiZulu: "Izinhlelo zomzimba womntwana ziphelele. Iminwe iyavuleka futhi iyavaleka, izinso ziyaqala ukusebenza.",
    maternalChanges: "Placenta takes over control. Energy levels return as early morning sickness begins to wane.",
    maternalChangesSiSwati: "I-Placenta itsatsa kulawula. Umtimba ucala kutfola emandla njengobe sicanucanu sehlela phasi.",
    maternalChangesSetswana: "Placenta e tsaya taolo. Maatla a a boela ka gonne go lwala ga mosong go a fokotsega.",
    maternalChangesIsiZulu: "I-Placenta ithatha amandla okulawula. Amandla ayabuya njengoba isicanucanu sincipha.",
    sizeComparison: "Small Lime",
    sizeComparisonLocal: "Sour Plum / Wild Fig (Thinthane / Umkhumbru)",
    lengthCm: 5.4,
    weightG: 14.2,
    clinicalChecklist: [
      "Schedule first comprehensive clinical ultrasound appointment.",
      "Check maternal blood pressure: Normal range is below 120/80 mmHg.",
      "Hydrate with 3.0 liters of water daily to maintain amniotic volume."
    ],
    wellnessTip: "Hydration is crucial as baby's kidneys begin cycling amniotic fluid. Keep a clean water bottle nearby."
  },
  16: {
    week: 16,
    trimester: 2,
    milestone: "Baby's eyes blink and can perceive light through the eyelids. The circulatory system is fully active.",
    milestoneSiSwati: "Emanti emntfwana ayacwayiza futsi ayalubona lulwalwa ngaphandle. Luhlaka lwegazi lusebenta laphelele.",
    milestoneSetswana: "Matlho a ngwana a a bonya mme a kgona go lemoga lesedi. Tsamaiso ya madi e dira ka botshwerere.",
    milestoneIsiZulu: "Amehlo omntwana ayacwayiza futhi azwa ukukhanya. Uhlelo lwegazi lusebenza ngokugcwele njengamanje.",
    maternalChanges: "Your bump is visible now! Elevated estrogen levels might give you the radiant pregnancy glow.",
    maternalChangesSiSwati: "Sisu sakho sesiyabonakala! Emahormoni lakhulako akupha kukhanya lokihle kakhulu emtimbeni.",
    maternalChangesSetswana: "Mmele o a bonala jaanong! Diphetogo tsa estrogen di go fa go phatsima ga boimana jo bontle.",
    maternalChangesIsiZulu: "Isisu sakho sesiyabonakala! Amazinga e-estrogen enza isikhumba sakho sikhanye kahle sibe namandla.",
    sizeComparison: "Avocado fruit",
    sizeComparisonLocal: "Avocado (Ukotela)",
    lengthCm: 11.6,
    weightG: 100.0,
    clinicalChecklist: [
      "Ensure the daily intake of prenatal iron-folate (IFA) supplements.",
      "Screen blood pressure to establish mid-pregnancy normal parameters.",
      "Incorporate local calcium-rich foods like sour milk (Emasi/Madila) or morogo spinach."
    ],
    wellnessTip: "Iron prevents anemia which causes extreme maternal fatigue. Pair spinach with citrus fruits for optimal benefit."
  },
  20: {
    week: 20,
    trimester: 2,
    milestone: "The halfway mark! Baby is covered in protective vernix paste, and early kick movements are strong.",
    milestoneSiSwati: "Sikhatsi sasemkhatsini sifelele! Umntfwana unamatsele lulwelwe lwemafutsa ekuvikeleni sikhumba, futsi uyadvlala.",
    milestoneSetswana: "Sephatlo sa loeto se fitletswe! Ngwana o sireleditswe ka vernix e tshweu, mme ditite tsa dika di a utlwala.",
    maternalChanges: "Lower back support shifts. You can feel early fluttery fetal movements (quickening).",
    maternalChangesSiSwati: "Sikhundla semifanekiso siyashintsha. Ungativa kuncibilika nemsindvo wemtsetfo emtimbeni.",
    maternalChangesSetswana: "Leshapo la mokwatla le a fetoga. O ka utlwa ditsikitlo tsa bofefo tsa ngwana mo popelong.",
    maternalChangesIsiZulu: "Uhlangothi lwangemuva luyashintsha. Ungazizwa ukunyakaza kokuqala komntwana esiswini.",
    sizeComparison: "Fresh Mango",
    sizeComparisonLocal: "Large Mango (Mambomba / Mango)",
    lengthCm: 25.6,
    weightG: 300.0,
    clinicalChecklist: [
      "Screen for gestational diabetes risks between weeks 20-24.",
      "Ensure fetal heart diagnostic check is logged at the local clinic.",
      "Maximize iron-rich foods to prevent maternal gestational anemia."
    ],
    wellnessTip: "Sleep exclusively on your left side from now on to increase maternal-fetal oxygenated blood flow."
  },
  24: {
    week: 24,
    trimester: 2,
    milestone: "Lungs begin producing surfactant to keep lung sacs open. The brain is developing high-order neuron links.",
    milestoneSiSwati: "Emaphaphu emntfwana ayacala kusebentsa, futsi ingcondvo iyaphutfuma ekwakheni tindlela tetinzwa.",
    milestoneSetswana: "Makgwafo a simolola go dira surfactant go bulela ditsela tsa go hema. Boboko bo ikgolaganya ka disele.",
    maternalChanges: "Uterine expansion causes occasional skin itching or stretch marks across the expanding abdomen.",
    maternalChangesSiSwati: "Kuvuleka kwesisu kubangela kuphatfeka kahle noko unwayaikhumba ezindaweni temutimba.",
    maternalChangesSetswana: "Sisu se se okotsegang se ka nna sa go hula letlalo go baka go nna o fula letlalo.",
    maternalChangesIsiZulu: "Ukunwebeka kwesibeletho kubangela ukulunywa kwesikhumba esiswini esandayo.",
    sizeComparison: "Ear of Corn",
    sizeComparisonLocal: "Papaya (Liphaphasu / Phaphasu)",
    lengthCm: 30.0,
    weightG: 600.0,
    clinicalChecklist: [
      "Screen blood pressure carefully at every check-in to monitor pre-eclampsia.",
      "Check for sudden facial swelling or extreme visual headache flags.",
      "Perform regular pelvic floor exercises (Kegels) to strengthen local pelvic tissue."
    ],
    wellnessTip: "Pre-eclampsia screening saves lives. If you have extreme swelling in your hands or face, report instantly."
  },
  28: {
    week: 28,
    trimester: 3,
    milestone: "Third Trimester starts! Baby opens eyelids, blinks, develops sleep cycles, and can feel external voices clearly.",
    milestoneSiSwati: "Trimester yesitsatfu iyacala! Umntfwana unyakisa emehlo, uyacwayiza, futsi uva emavi ngalokucacile.",
    milestoneSetswana: "Kotara ya bofelo e a simolola! Ngwana o bula matlho, o lemoga thutha ya boroko, o utlwa lentswe sentle.",
    maternalChanges: "Increased rib and diaphragm compression leads to short-winded breathing. Fatigue spikes return.",
    maternalChangesSiSwati: "Ukusindzeka kwetimbambo kwenza kupfumula kube lukhuni kancane. Kudziba kuyabuya futsi.",
    maternalChangesSetswana: "Go pitlagana ga dikgopo le lokololo go baka letshogo la go hema sentle.",
    maternalChangesIsiZulu: "Ukucinana kwembambo kwenza kube nzima ukuphefumula kalula. Ukukhathala kuyaqala ukubuyela.",
    sizeComparison: "Butternut squash",
    sizeComparisonLocal: "Butternut Squash (Sikhumba / Butternut)",
    lengthCm: 37.6,
    weightG: 1050.0,
    clinicalChecklist: [
      "Begin tracking fetal kick counts daily. Highlight any hours with fewer than 10 kicks.",
      "Ensure you receive the Rh immunoglobulin injection if Rh-negative.",
      "Schedule clinic visits every 2 weeks from now until full delivery."
    ],
    wellnessTip: "Kick counts are baby's communication tool. Find a quiet hour, count 10 movements, and celebrate!"
  },
  32: {
    week: 32,
    trimester: 3,
    milestone: "Baby is packing on fat reserves rapidly to prepare for birth temperature control. Head-down position begins.",
    milestoneSiSwati: "Umntfwana utakhela emafutsa lamanyenti emtimbeni kute alawulele kushisa. Ucala kufulatsela asondzela phansi.",
    milestoneSetswana: "Ngwana o ikokotsetsa moko wa letlalo go ipaakanyetsa mogote wa mmele. Tlhogo e simolola go lebela tlase.",
    maternalChanges: "Braxton Hicks practice contractions intensify. Acid reflux and pelvic pressure increase significantly.",
    maternalChangesSiSwati: "Titfukutseli tekulingisa tendlala tiyandza. Kuvuleka kwesisu kulefeta umsindvo wesisu phasi.",
    maternalChangesSetswana: "Ditshikitlo tsa go ipaakanyetsa pelegi di a okotsega. Go baka go baba ga lentswe le go pitlagana ga pelegi.",
    maternalChangesIsiZulu: "Ukunyakaza kwe-Braxton Hicks kuyaqina. Umfutho esiswini phansi uyakhula kakhulu njengamanje.",
    sizeComparison: "Sweet Pumpkin",
    sizeComparisonLocal: "Sweet Melon (Spanspek / Likhabe)",
    lengthCm: 42.4,
    weightG: 1700.0,
    clinicalChecklist: [
      "Confirm the baby's position (cephalic presentation check at clinic).",
      "Avoid lying on your back entirely; maintain side-sleeping at night.",
      "Prepare your birth companion plan and regional clinical emergency numbers."
    ],
    wellnessTip: "Elevate your chest with local pillows at night to naturally reduce severe gestational acid reflux."
  },
  36: {
    week: 36,
    trimester: 3,
    milestone: "Baby's immune system expands as antibodies cross the placenta. Lungs and digestion are fully ready.",
    milestoneSiSwati: "Luhlelo lwekuvikela lwemtimba luyakhula. Lulwelwe netinhlelo tasekuphefumuleni tilungele kuthwala.",
    milestoneSetswana: "Tsamaiso ya mmele ya go lwantsha malwetse e a gola. Makgwafo a siame ka botlalo go phela.",
    maternalChanges: "The baby drops down into the pelvis, relieving rib pressure but creating extreme walking heaviness.",
    maternalChangesSiSwati: "Umntfwana usehlele phansi esitfukutselini, lowo wehlise kuphatfeka kwetimbambo kodvwa kusindza kuhamba.",
    maternalChangesSetswana: "Ngwana o tsenela mo peleging, go thitjibega ga dikgopo go a thotha mme go tsamaya go a nna boima.",
    maternalChangesIsiZulu: "Umntwana wehlela emgodleni womgogodla, lokho kunciphisa umfutho phezulu kodwa kusindza ukuhamba.",
    sizeComparison: "Romaine Lettuce",
    sizeComparisonLocal: "African Pumpkin (Selesele / Sitsandzi)",
    lengthCm: 47.4,
    weightG: 2600.0,
    clinicalChecklist: [
      "Undergo testing for Group B Streptococcus (GBS) at the regional health center.",
      "Screen blood pressure weekly to safeguard maternal life variables.",
      "Log your emergency medical kit and transport budget details."
    ],
    wellnessTip: "Now is the time to finalize your SADC local maternity referral clinic bag. Keep IDs and clinical cards clean."
  },
  40: {
    week: 40,
    trimester: 3,
    milestone: "Full term milestone! Your beautiful baby is fully formed and ready to enter the world. Watch for real labor signals.",
    milestoneSiSwati: "Sikhatsi selibanga sesifelele! Umntfwanakho ukhule kahle futsi ulungele kuphuma. Buka timphawu tekubeletha.",
    milestoneSetswana: "Sebaka sa nako e tletsego se fitletswe! Ngwana wa gago o siame sentle. Lebalela ditshupo tsa pelegi.",
    maternalChanges: "Cervical dilation begins. Contractions become regular, painful, and closely timed. Rest as much as possible.",
    maternalChangesSiSwati: "Kuvuleka kwesango kucalile. Titfukutseli tiyacala kuciniseka, tiphindze tilethe nehlungu lelinamatsele.",
    maternalChangesSetswana: "Molomo wa popelo o simolola go bulega. Ditshikitlo tsa pelegi di nna dikgopolo mme di tlisa botlhoko.",
    maternalChangesIsiZulu: "Ukuvuleka kwesibeletho kuyaqala. Izinhlungu zokubeletha ziyaqina futhi ziba seduze.",
    sizeComparison: "Large Watermelon",
    sizeComparisonLocal: "Watermelon (Likhabe / Melon)",
    lengthCm: 51.2,
    weightG: 3400.0,
    clinicalChecklist: [
      "Contact your prenatal companion or SADC Mbabane centre specialist.",
      "Check maternal vital signs including blood pressure and heart rate closely.",
      "Head to your designated clinic immediately if water breaks or contractions are 5 min apart."
    ],
    wellnessTip: "Focus on slow, rhythmic diaphragmatic breathing. You are fully capable and protected on this final phase."
  }
};

// Simple interpolation helper for non-predefined weeks to ensure continuous experience
const getInterpolatedMilestone = (week: number): MilestoneData => {
  if (MILESTONE_DATABASE[week]) {
    return MILESTONE_DATABASE[week];
  }

  // Find nearest lower and upper weeks
  const predefinedWeeks = Object.keys(MILESTONE_DATABASE).map(Number).sort((a, b) => a - b);
  let lowerWeek = 1;
  let upperWeek = 40;

  for (let i = 0; i < predefinedWeeks.length; i++) {
    const w = predefinedWeeks[i];
    if (w <= week) {
      lowerWeek = w;
    }
    if (w >= week) {
      upperWeek = w;
      break;
    }
  }

  const baseData = MILESTONE_DATABASE[lowerWeek] || MILESTONE_DATABASE[1];
  const targetData = MILESTONE_DATABASE[upperWeek] || MILESTONE_DATABASE[40];

  // Simple linear sizing estimation
  const ratio = lowerWeek === upperWeek ? 0 : (week - lowerWeek) / (upperWeek - lowerWeek);
  const lengthCm = Number((baseData.lengthCm + (targetData.lengthCm - baseData.lengthCm) * ratio).toFixed(1));
  const weightG = Math.round(baseData.weightG + (targetData.weightG - baseData.weightG) * ratio);

  // Dynamic descriptions for interpolated weeks
  const isTrimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;

  return {
    week,
    trimester: isTrimester,
    milestone: `Fetal growth is advancing steadily in Week ${week}. Sensory receptors are maturing, organs are strengthening, and baby is adapting.`,
    milestoneSiSwati: `Kukhula kwemntfwana kuchubeka ngendlela lephelele eVikini ${week}. Tinzwa tiyaphutfuma, timtimba tiyacina, nemntfwana uyatshila.`,
    milestoneSetswana: `Kgolo ya ngwana e tswelela sentle mo Bekeng ${week}. Dirwe tsa mmele le megatla e a nonofa mme ngwana o a tlwaela.`,
    milestoneIsiZulu: `Ukukhula komntwana kuqhubeka kahle eVikini ${week}. Izinzwa ziyaqina, izitho zomzimba ziyakhula futhi umntwana uyazivumelanisa.`,
    maternalChanges: `Maternal hormonal stabilization. Ensure you take frequent, micro rest periods to support expanding weight parameters.`,
    maternalChangesSiSwati: `Kuthula kwetinhlelo temtimba. Buka lesatfukutseli sikhombisa kukhulu kwekugcwala ukhumule umtimba ngebunyenti.`,
    maternalChangesSetswana: `Mmele o a tlwaela dichemi. Itshikitla ka go itshikhinya go thusa letlalo mme o tseye dinako tsa go ikhutsa.`,
    maternalChangesIsiZulu: `Ukuzinza kwama-hormone omzimba. Qiniseka ukuthi uthola izikhathi ezincane zokuphumula ukuze usekele isisindo esikhulayo.`,
    sizeComparison: week <= 13 ? "Plum size fruit" : week <= 26 ? "Sweet Potato" : "SADC Butternut size",
    sizeComparisonLocal: week <= 13 ? "Sour Plum (Thinthane)" : week <= 26 ? "Mango (Mambomba)" : "Butternut (Butternut)",
    lengthCm,
    weightG,
    clinicalChecklist: [
      `Maintain daily intake of SADC regional clinic Iron and Folate dietary pills.`,
      `Monitor blood pressure levels closely; stay within 120/80 boundaries.`,
      `Track kicks regularly; keep well-stocked on fresh local fruits and vegetables.`
    ],
    wellnessTip: `Steady progression supports maternal stamina. Stay active with light movements and keep an elegant posture.`
  };
};

export default function WeeklyMilestones({ currentWeek, appLanguage }: WeeklyMilestonesProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [activeSegment, setActiveSegment] = useState<"fetal" | "maternal" | "checklist">("fetal");

  // Keep selected week synchronized when the parent shifts current week
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  const activeMilestone = getInterpolatedMilestone(selectedWeek);

  // Handle local translations based on selected app language
  const getLocalizedField = (data: MilestoneData, field: "milestone" | "changes") => {
    if (appLanguage === "siSwati") {
      const translation = field === "milestone" ? data.milestoneSiSwati : data.maternalChangesSiSwati;
      if (translation) return translation;
    }
    if (appLanguage === "Setswana") {
      const translation = field === "milestone" ? data.milestoneSetswana : data.maternalChangesSetswana;
      if (translation) return translation;
    }
    if (appLanguage === "isiZulu") {
      const translation = field === "milestone" ? data.milestoneIsiZulu : data.maternalChangesIsiZulu;
      if (translation) return translation;
    }
    return field === "milestone" ? data.milestone : data.maternalChanges;
  };

  const trimesterTitle = (tri: number) => {
    if (appLanguage === "siSwati") return `Sitfuko ${tri}`;
    if (appLanguage === "Setswana") return `Kotara ${tri}`;
    if (appLanguage === "isiZulu") return `Isikhawu ${tri}`;
    return `Trimester ${tri}`;
  };

  // Safe boundaries for selecting pregnancy weeks
  const adjustWeek = (amount: number) => {
    setSelectedWeek(prev => Math.min(40, Math.max(1, prev + amount)));
  };

  // Localized title & UI text translations
  const labels = {
    English: {
      weeklyTitle: "Pregnancy Weekly Milestones",
      weeklyDesc: "Explore your child's expected anatomical landmarks and SADC wellness recommendations.",
      myCurrentWeek: "My Actual Week",
      size: "Size (Height)",
      weight: "Weight (Mass)",
      comparative: "SADC Sized Companion",
      fetalHeader: "👶 Fetal Development",
      maternalHeader: "🤰 Maternal Body Changes",
      checklistHeader: "📋 Clinic & Care Guide",
      tipHeader: "💡 Regional Clinical Tip",
      currentLabel: "Current",
      btnReset: "Reset to Week",
      fetalLength: "Fetal Length",
      fetalWeight: "Fetal Mass",
      completedLabel: "Completed Progress",
      remLabel: "Weeks Remaining"
    },
    siSwati: {
      weeklyTitle: "Lokwenteka Maviki Onkhe",
      weeklyDesc: "Hlola tinyatfuko tekuphutfuma kwemntfwana nemikhombisombuso yetitfuko baseMbabane.",
      myCurrentWeek: "Livi Libhaliswe",
      size: "Kukhula (Ubukhulu)",
      weight: "Sikhundla (Sisisindvo)",
      comparative: "Ukufaniswa Kwesitselo Sasekhaya",
      fetalHeader: "👶 Kukhula Kwemntfwana",
      maternalHeader: "🤰 Tingucuko Temtimba",
      checklistHeader: "📋 Luhla lwasetiClinic",
      tipHeader: "💡 Tip yeMphelo loPhakeme",
      currentLabel: "Lokukhona",
      btnReset: "Buyela eVikini",
      fetalLength: "Budze beMntfwana",
      fetalWeight: "Sisisindvo semntfwana",
      completedLabel: "Intfutfuko lefeziwe",
      remLabel: "Maviki lasele"
    },
    Setswana: {
      weeklyTitle: "Dikgato tsa Pelegi tsa Beke le Beke",
      weeklyDesc: "Ithute ka dikgato tsa kgolo ya mmejana le dikeletso tsa boitekanelo tsa SADC.",
      myCurrentWeek: "Beke ya me ya mmatota",
      size: "Boemo (Boleele)",
      weight: "Boima (Sisisindvo)",
      comparative: "Tekanyetso ya Maungo a Selegae",
      fetalHeader: "👶 Kgolo ya Mmejana",
      maternalHeader: "🤰 Diphetogo tsa Mmele",
      checklistHeader: "📋 Kaedi ya Tleleniki le Tlhokomelo",
      tipHeader: "💡 Malebela a Boitekanelo",
      currentLabel: "Mo klong",
      btnReset: "Buyela kwa Bekeng",
      fetalLength: "Boleele jwa ngwana",
      fetalWeight: "Boima jwa ngwana",
      completedLabel: "Tatelano e e feletseng",
      remLabel: "Dibeke tse di setseng"
    },
    isiZulu: {
      weeklyTitle: "Imilando Yesonto Ngesonto",
      weeklyDesc: "Hlola intuthuko yomntwana nezincomo zezempilo ezivela esikhungweni sokubeletha.",
      myCurrentWeek: "Isonto Lami Lemvelo",
      size: "Ubukhulu (Bude)",
      weight: "Isisindo (Ubunzima)",
      comparative: "Isilinganiso Sesithelo Sasendaweni",
      fetalHeader: "👶 Ukukhula Komntwana",
      maternalHeader: "🤰 Izinguquko Zomzimba",
      checklistHeader: "📋 Umhlahlandlela We-Clinic",
      tipHeader: "💡 Ithiphu Lokuzivikela",
      currentLabel: "Yamanje",
      btnReset: "Buyela Esontweni",
      fetalLength: "Ubude Bomntwana",
      fetalWeight: "Isisindo Somntwana",
      completedLabel: "Intuthuko Eqediwe",
      remLabel: "Amasonto Asele"
    }
  };

  const trans = labels[appLanguage as keyof typeof labels] || labels.English;

  return (
    <div className="bg-white/40 border border-[#CFE6E3]/60 backdrop-blur-md rounded-3xl p-4 text-left shadow-xs space-y-4" id="weekly-milestone-panel">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-black uppercase text-[#2B1B2E] tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E84FA0] animate-pulse" />
            {trans.weeklyTitle}
          </h3>
          <p className="text-[10px] text-[#7A6B72] font-semibold">
            {trans.weeklyDesc}
          </p>
        </div>

        {/* Reset badge if navigating other weeks */}
        {selectedWeek !== currentWeek && (
          <button
            type="button"
            onClick={() => setSelectedWeek(currentWeek)}
            className="text-[9px] font-black bg-pink-50 hover:bg-pink-100 text-[#E84FA0] border border-[#FF6FB1]/30 rounded-full px-3 py-1 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
          >
            🔄 {trans.btnReset} {currentWeek}
          </button>
        )}
      </div>

      {/* Week Selector Carousel */}
      <div className="flex items-center gap-2 bg-[#FAF6F2]/80 border border-[#CFE6E3]/40 p-2 rounded-2xl">
        <button
          type="button"
          onClick={() => adjustWeek(-1)}
          disabled={selectedWeek === 1}
          className="p-1 px-1.5 hover:bg-white text-[#2B1B2E] disabled:opacity-30 rounded-xl transition-all cursor-pointer border border-[#EBEBEB]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal scroll indicators */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex gap-1.5 justify-between py-1 px-0.5">
          {Array.from({ length: 9 }).map((_, i) => {
            // Display 9 concentric weeks surrounding the selected week beautifully
            let wk = selectedWeek - 4 + i;
            if (wk < 1) wk = 1 + (4 - selectedWeek) - (4 - selectedWeek) + i; // adjust starting bound
            if (wk > 40) wk = 40 - 8 + i; // adjust end bound
            wk = Math.max(1, Math.min(40, wk));

            const isCurrentMaternalWeek = wk === currentWeek;
            const isChosen = wk === selectedWeek;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedWeek(wk)}
                className={`w-8 h-8 rounded-full text-[10px] font-black shrink-0 transition-all flex items-center justify-center relative cursor-pointer ${
                  isChosen
                    ? "bg-gradient-to-r from-[#4F7066] to-[#2B1B2E] text-white shadow-xs scale-110"
                    : isCurrentMaternalWeek
                    ? "border-2 border-[#E84FA0] text-[#E84FA0] bg-pink-50/50"
                    : "bg-white hover:bg-neutral-50 border border-neutral-150 text-neutral-600"
                }`}
              >
                {wk}
                {isCurrentMaternalWeek && !isChosen && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#E84FA0] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => adjustWeek(1)}
          disabled={selectedWeek === 40}
          className="p-1 px-1.5 hover:bg-white text-[#2B1B2E] disabled:opacity-30 rounded-xl transition-all cursor-pointer border border-[#EBEBEB]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Week Display & Metric Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Left Interactive Panel: Fetal Image/Comparative fruit comparison */}
        <div className="md:col-span-4 bg-[#FF6FB1]/5 border border-[#FF6FB1]/10 rounded-2xl p-3 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="absolute top-1 right-2 bg-[#E84FA0] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            {trimesterTitle(activeMilestone.trimester)}
          </div>

          <div className="space-y-1">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#7A6B72] block">
              Week {selectedWeek} Landmark
            </span>
            <span className="text-[10px] font-bold text-[#E84FA0]">
              {selectedWeek === currentWeek ? `✨ ${trans.currentLabel} Actual Week` : "📅 Previewing Stage"}
            </span>
          </div>

          {/* SADC Fruit size comparative preview */}
          <div className="my-3 flex flex-col items-center justify-center relative">
            <div className="w-24 h-24 rounded-full bg-white/70 border border-[#FFF3F7] shadow-3xs flex items-center justify-center animate-bounce-slow overflow-hidden">
              <span className="text-3xl filter saturate-150 drop-shadow-xs">
                {selectedWeek <= 5 ? "🌱" :
                 selectedWeek <= 10 ? "🍒" :
                 selectedWeek <= 15 ? "🥑" :
                 selectedWeek <= 20 ? "🥭" :
                 selectedWeek <= 25 ? "🍍" :
                 selectedWeek <= 30 ? "🥔" :
                 selectedWeek <= 35 ? "🍈" : "🍉"}
              </span>
            </div>
            <div className="mt-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-pink-100 max-w-full">
              <span className="text-[8px] font-extrabold uppercase text-[#7A6B72] block">
                {trans.comparative}
              </span>
              <span className="text-[10px] font-black text-[#2B1B2E] leading-tight">
                {activeMilestone.sizeComparisonLocal}
              </span>
            </div>
          </div>

          {/* Precision Metrics */}
          <div className="bg-white/60 p-2.5 rounded-xl border border-white/50 space-y-1.5 shadow-3xs">
            <div className="flex justify-between items-center text-[9px]">
              <span className="text-gray-500 font-bold">{trans.size}</span>
              <span className="font-mono font-extrabold text-neutral-800">{activeMilestone.lengthCm} cm</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1">
              <div 
                className="bg-[#4F7066] h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (activeMilestone.lengthCm / 52) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] pt-1">
              <span className="text-gray-500 font-bold">{trans.weight}</span>
              <span className="font-mono font-extrabold text-neutral-800">{activeMilestone.weightG} g</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-1">
              <div 
                className="bg-[#E84FA0] h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (activeMilestone.weightG / 3500) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Tabbed Panel: Clinical expected milestones, bodily symptoms, checklist */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white border border-[#EBEBEB] rounded-2xl p-3.5 space-y-3 shadow-3xs">
          
          {/* Segment Selector for clean view */}
          <div className="grid grid-cols-3 gap-1 bg-[#FAF6F2] p-0.5 rounded-xl border border-neutral-150">
            {[
              { id: "fetal", label: trans.fetalHeader },
              { id: "maternal", label: trans.maternalHeader },
              { id: "checklist", label: trans.checklistHeader }
            ].map(seg => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setActiveSegment(seg.id as any)}
                className={`py-1.5 px-1 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all cursor-pointer text-center ${
                  activeSegment === seg.id
                    ? "bg-white text-[#2B1B2E] shadow-3xs border border-[#CFE6E3]/35"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>

          {/* Interactive Segment Content Box */}
          <div className="flex-1 min-h-[105px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {activeSegment === "fetal" && (
                <motion.div
                  key="fetal"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5 text-left"
                >
                  <span className="text-[8px] font-black text-[#5F716A] uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-[#E84FA0]" /> Fetal Anatomy Progress landmarks
                  </span>
                  <p className="text-[11px] font-bold text-[#2B1B2E] leading-normal bg-neutral-50/50 p-2 rounded-xl border border-neutral-150/40">
                    "{getLocalizedField(activeMilestone, "milestone")}"
                  </p>
                </motion.div>
              )}

              {activeSegment === "maternal" && (
                <motion.div
                  key="maternal"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5 text-left"
                >
                  <span className="text-[8px] font-black text-[#5F716A] uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-2.5 h-2.5 text-[#4F7066]" /> Expected body shifts & indicators
                  </span>
                  <p className="text-[11px] font-bold text-[#2B1B2E] leading-normal bg-neutral-50/50 p-2 rounded-xl border border-neutral-150/40">
                    "{getLocalizedField(activeMilestone, "changes")}"
                  </p>
                </motion.div>
              )}

              {activeSegment === "checklist" && (
                <motion.div
                  key="checklist"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5 text-left"
                >
                  <span className="text-[8px] font-black text-[#5F716A] uppercase tracking-wider block">
                    📋 Checklists recommended by SADC Clinicians
                  </span>
                  <div className="space-y-1">
                    {activeMilestone.clinicalChecklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[10.5px] font-bold text-[#2B1B2E] leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7066] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Regional Clinical tip strip */}
          <div className="pt-2 border-t border-dashed border-[#CFE6E3] bg-[#FAF6F2]/30 p-2 rounded-xl border border-neutral-150/40 text-left">
            <span className="text-[8px] font-black uppercase text-[#E84FA0] tracking-wider block mb-0.5">
              💡 {trans.tipHeader}
            </span>
            <p className="text-[10px] text-[#2B1B2E] leading-normal font-semibold">
              {activeMilestone.wellnessTip}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
