export type Mood = {
  id: string;
  label: string;
  tone: "calm" | "warm" | "deep" | "bright";
};

export const MOODS: Mood[] = [
  { id: "calm", label: "هادئ", tone: "calm" },
  { id: "grateful", label: "ممتنّ", tone: "bright" },
  { id: "tired", label: "متعب", tone: "warm" },
  { id: "anxious", label: "قلِق", tone: "deep" },
  { id: "stressed", label: "متوتر", tone: "deep" },
  { id: "sad", label: "حزين", tone: "warm" },
  { id: "hopeful", label: "متفائل", tone: "bright" },
  { id: "overwhelmed", label: "مُثقَل", tone: "deep" },
];

export type Ayah = {
  id: string;
  text: string;
  ref: string;
  theme: string;
};

export const AYAHS: Ayah[] = [
  {
    id: "sharh-6",
    text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    ref: "الشرح: ٦",
    theme: "الفرَج بعد الضيق",
  },
  {
    id: "rad-28",
    text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    ref: "الرعد: ٢٨",
    theme: "طمأنينة القلب",
  },
  {
    id: "talaq-3",
    text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    ref: "الطلاق: ٣",
    theme: "التوكل",
  },
  {
    id: "imran-173",
    text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    ref: "آل عمران: ١٧٣",
    theme: "الكفاية والثقة",
  },
  {
    id: "baqarah-286",
    text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    ref: "البقرة: ٢٨٦",
    theme: "رحمة التكليف",
  },
  {
    id: "duha-5",
    text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
    ref: "الضحى: ٥",
    theme: "الأمل",
  },
];

export type Dua = {
  id: string;
  text: string;
  source: string;
  theme: string;
};

export const DUAS: Dua[] = [
  {
    id: "hamm-hazn",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    source: "رواه البخاري",
    theme: "همّ وحزن",
  },
  {
    id: "hasbi",
    text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    source: "رواه أبو داود",
    theme: "تثبيت وكفاية",
  },
  {
    id: "yusra",
    text: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    source: "رواه ابن حبان",
    theme: "تيسير الأمور",
  },
  {
    id: "rida",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    source: "رواه أحمد",
    theme: "رضا وسكينة",
  },
];

export type Dhikr = {
  id: string;
  text: string;
  count: string;
  benefit: string;
};

export const ADHKAR: Dhikr[] = [
  {
    id: "subhan-bihamdihi",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    count: "١٠٠ مرة",
    benefit: "حُطّت خطاياه ولو كانت مثل زبد البحر",
  },
  {
    id: "lahawla",
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    count: "متى شئت",
    benefit: "كنزٌ من كنوز الجنة",
  },
  {
    id: "istighfar",
    text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    count: "مئة مرة",
    benefit: "من لزِم الاستغفار جعل الله له من كل ضيقٍ مخرجًا",
  },
  {
    id: "tahlil",
    text: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    count: "١٠ مرات",
    benefit: "حِرز من الشيطان حتى يُمسي",
  },
];

export function greetingForHour(hour: number): string {
  if (hour < 4) return "ليلة هانئة";
  if (hour < 12) return "صباحُ الخير";
  if (hour < 17) return "نهارٌ مبارك";
  if (hour < 20) return "مساءُ الخير";
  return "ليلةٌ مباركة";
}

export function dateLabelArabic(date: Date): string {
  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

export function arabicNumber(n: number): string {
  const map: Record<string, string> = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  };
  return String(n)
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

export const COMPANION_OPENERS = [
  "السلام عليكم. أنا هنا معك. كيف حالك الآن؟",
  "أهلاً بك. خذ نفساً عميقاً، وأخبرني ما الذي يشغلك.",
  "حضورك هنا خطوة طيّبة. ما الذي تحتاجه الآن؟",
];
