import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Camera,
  Check,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronUp,
  FileText,
  Home,
  Image,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  Sprout,
  Sun,
  Sunset,
  UserRound,
  X,
} from "lucide-react";

const initialLogItems = [
  {
    date: "05.26",
    day: "화요일",
    time: "오후 7:18",
    text: "퇴근길 바람이 꽤 좋았다.\n괜히 한 정거장 먼저 내려서 걸었다.",
    tags: ["#퇴근길", "#바람", "#걷기"],
    mood: "가벼움",
    dot: "#ff7442",
    image: "linear-gradient(135deg,#a8b8e8,#f6a083 55%,#1d3048)",
    note: "걷고 나니 생각보다 머리가 조금 맑아졌다.",
  },
  {
    date: "05.24",
    day: "일요일",
    time: "오후 3:42",
    text: "오랜만에 친구랑 카페에 앉아 있었다.\n말이 많지 않아도 편했다.",
    tags: ["#친구", "#카페", "#느슨함"],
    mood: "좋음",
    dot: "#f6be4f",
    image: "linear-gradient(135deg,#c8d5bf,#f4c36c 48%,#6b4325)",
    note: "집에 와서도 그 느슨한 대화가 오래 남았다.",
  },
  {
    date: "05.22",
    day: "금요일",
    time: "오전 11:06",
    text: "작은 선택 하나.\n바로 답하지 않고 조금 기다렸다.",
    tags: ["#선택", "#업무", "#멈춤"],
    mood: "차분함",
    dot: "#79ae73",
    image: "linear-gradient(135deg,#e7e0c9,#b6c4a3 45%,#6f7659)",
    note: "바로 답하지 않으니 오히려 말이 덜 거칠어졌다.",
  },
  {
    date: "05.19",
    day: "화요일",
    time: "오후 9:30",
    text: "오늘 하루는 좀 버거웠다.\n그래도 씻고 누웠다.",
    tags: ["#하루", "#정리"],
    mood: "묵직함",
    dot: "#a17be8",
    image: "linear-gradient(135deg,#eadbb8,#725e48 48%,#f3a744)",
    note: "씻고 누운 뒤에는 생각보다 빨리 잠이 왔다.",
  },
];

const initialTodayLogItems = [
  {
    date: "05.27",
    day: "수요일",
    time: "오후 9:20",
    text: "집에 오는 길이 조용했다.\n오늘은 말을 많이 하지 않아도 괜찮았다.",
    tags: ["#퇴근길", "#조용함"],
    mood: "느슨함",
    dot: "#79ae73",
    image: "linear-gradient(135deg,#d8d0bf,#95b39d 52%,#6f7659)",
    note: "말을 덜 하니 하루가 조금 덜 소란스러웠다.",
  },
  {
    date: "05.27",
    day: "수요일",
    time: "오후 1:12",
    text: "점심 먹고 잠깐 밖에 나갔다.\n바람이 생각보다 시원했다.",
    tags: ["#점심", "#바람", "#잠깐"],
    mood: "가벼움",
    dot: "#ff7442",
    image: "linear-gradient(135deg,#c9d7e8,#f6c06c 52%,#7d5a3e)",
    note: "잠깐 나간 덕분에 오후가 조금 부드러워졌다.",
  },
];

function getRecentSampleLogs(currentMeta) {
  return [
    {
      id: "sample-now-1",
      sample: true,
      date: currentMeta.date,
      day: currentMeta.day,
      time: "오전 11:32",
      operationalKey: currentMeta.operationalKey,
      text: "커피가 정말 맛있었다.",
      tags: ["#소소한행복"],
      mood: "남김",
      dot: "#c6a46b",
      image: null,
      note: "",
    },
    {
      id: "sample-now-2",
      sample: true,
      date: currentMeta.date,
      day: currentMeta.day,
      time: "오전 10:08",
      operationalKey: currentMeta.operationalKey,
      text: "괜히 마음이 성숭성숭하다.",
      tags: ["#복잡한마음"],
      mood: "남김",
      dot: "#86a36f",
      image: null,
      note: "",
    },
    {
      id: "sample-now-3",
      sample: true,
      date: currentMeta.date,
      day: currentMeta.day,
      time: "오전 8:47",
      operationalKey: currentMeta.operationalKey,
      text: "아이 웃는 모습을 보니 마음이 따뜻해졌다.",
      tags: ["#고마운순간"],
      mood: "남김",
      dot: "#87a8bd",
      image: null,
      note: "",
    },
    {
      id: "sample-now-4",
      sample: true,
      date: currentMeta.date,
      day: currentMeta.day,
      time: "오전 7:21",
      operationalKey: currentMeta.operationalKey,
      text: "오늘 하루도 잘 보내고 싶다.",
      tags: ["#다짐"],
      mood: "남김",
      dot: "#9a846b",
      image: null,
      note: "",
    },
  ];
}

const tags = ["#퇴근길", "#바람", "#혼자있는시간", "#카페", "#생각정리", "#산책", "#소소한행복", "#고마운사람"];
const writeHints = ["지금을 스친 그 생각을 남겨보세요.", "지나가기 전에 툭.", "지금 머릿속에 있는 생각 하나."];
const LOG_PAGE_SIZE = 20;
const STORAGE_KEY = "maeumtuk:v1";

function loadStoredAppState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

const categoryTagRules = [
  { label: "가족", words: ["엄마", "아빠", "아이", "자녀", "육아", "유치원", "가족"] },
  { label: "일", words: ["회사", "일", "업무", "회의", "개발", "프로젝트", "출시", "코딩"] },
  { label: "건강", words: ["병원", "검사", "약", "운동", "잠", "피곤", "아프", "건강"] },
  { label: "관계", words: ["친구", "대화", "만남", "연락", "말", "사람", "세인이"] },
  { label: "취미", words: ["카페", "커피", "산책", "책", "영화", "음악", "여행"] },
  { label: "일상", words: ["집", "지하철", "버스", "퇴근", "출근", "밥", "점심", "저녁", "날씨"] },
];

const categoryTagLabels = new Set(categoryTagRules.map((rule) => rule.label));
const personalTagStopWords = new Set([
  "오늘",
  "어제",
  "내일",
  "지금",
  "조금",
  "너무",
  "그냥",
  "정말",
  "진짜",
  "완전",
  "약간",
  "뭔가",
  "계속",
  "다시",
  "그리고",
  "그래서",
  "하지만",
  "근데",
  "어떤",
  "무슨",
  "왜",
  "걸까",
  "일까",
  "뭘까",
  "아직",
  "벌써",
  "이런",
  "저런",
  "그런",
  "마음",
  "마음툭",
  "생각",
  "기분",
  "느낌",
  "하루",
  "아침",
  "오전",
  "오후",
  "저녁",
  "밤",
  "사람",
  "시간",
  "순간",
  "정도",
  "때문",
  "저장",
  "확인",
  "흐름",
  "작성",
  "입력",
  "테스트",
  "괜찮",
  "좋다",
  "좋았",
  "했다",
  "같다",
  "같았",
  "있다",
  "없다",
  "된다",
]);

function normalizeWord(tag) {
  return tag.replace(/^#/, "");
}

function getLogKey(log) {
  return log.id || `${log.date}-${log.time}`;
}

function stripKoreanParticle(word) {
  return word.replace(/(에게서|에게|한테|에서|으로|부터|까지|처럼|보다|이라도|이라서|이라면|이랑|하고|이며|이면|이다|였다|했다|한다|되어|됐다|이라|라고|와|과|은|는|이|가|을|를|에|도|만|로|랑)$/u, "");
}

function extractComparableWords(text) {
  return [...text.matchAll(/[가-힣A-Za-z0-9]{1,}/g)].map(([word]) => stripKoreanParticle(word.trim())).filter(Boolean);
}

function extractCategoryTags(text) {
  const source = text.trim();
  if (!source) return [];

  const sourceWords = new Set(extractComparableWords(source));
  const found = categoryTagRules
    .filter((rule) =>
      rule.words.some((word) => {
        if (word.length === 1) return sourceWords.has(word);
        return source.includes(word);
      }),
    )
    .map((rule) => rule.label);
  return [...new Set(found)];
}

function extractCandidateWords(text) {
  return extractComparableWords(text)
    .filter((word) => word.length >= 2)
    .filter((word) => !personalTagStopWords.has(word))
    .filter((word) => !categoryTagLabels.has(word));
}

function parseLogDate(item) {
  if (item.operationalKey) {
    const [year, month, day] = item.operationalKey.split("-").map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }

  if (item.createdAt) {
    const createdDate = new Date(item.createdAt);
    if (!Number.isNaN(createdDate.getTime())) return createdDate;
  }

  const match = item.date?.match(/^(\d{2})\.(\d{2})$/);
  if (!match) return null;

  const now = new Date();
  const parsed = new Date(now.getFullYear(), Number(match[1]) - 1, Number(match[2]));
  if (parsed.getTime() > now.getTime() + 1000 * 60 * 60 * 24) {
    parsed.setFullYear(parsed.getFullYear() - 1);
  }

  return parsed;
}

function getLogMonthMeta(item) {
  const date = parseLogDate(item) || new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return {
    key: `${year}-${String(month).padStart(2, "0")}`,
    label: `${year}년 ${month}월`,
  };
}

function getPersonalTagSet(logItems) {
  const now = new Date();
  const recentFrom = now.getTime() - 1000 * 60 * 60 * 24 * 30;
  const stats = new Map();

  logItems.forEach((item) => {
    const logDate = parseLogDate(item);
    const isRecent = !logDate || logDate.getTime() >= recentFrom;
    const words = new Set(extractCandidateWords(item.text || ""));

    words.forEach((word) => {
      const key = word.toLocaleLowerCase("ko-KR");
      const current = stats.get(key) || { label: word, total: 0, recent: 0 };
      current.total += 1;
      if (isRecent) current.recent += 1;
      if (word.length < current.label.length) current.label = word;
      stats.set(key, current);
    });
  });

  return new Set(
    [...stats.values()]
      .filter((item) => item.total >= 5 || item.recent >= 3)
      .sort((a, b) => b.total - a.total || b.recent - a.recent)
      .map((item) => item.label),
  );
}

function uniqueWords(words) {
  const seen = new Set();
  return words.filter((word) => {
    const normalized = normalizeWord(word).trim();
    if (!normalized) return false;
    const key = normalized.toLocaleLowerCase("ko-KR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractAutoTags(text) {
  // Auto tag generation is paused for the current MVP pass.
  // return extractCategoryTags(text).slice(0, 3);
  return [];
}

function getGeneratedTags(item, personalTagSet) {
  const candidates = extractCandidateWords(item.text || "");
  const personalTags = uniqueWords(candidates.filter((word) => personalTagSet.has(word)));
  const categoryTags = extractCategoryTags(item.text || "");
  return uniqueWords([...personalTags, ...categoryTags]).slice(0, 3);
}

function enrichLogsWithTags(logItems, personalTagSet = getPersonalTagSet(logItems)) {
  // Auto tag enrichment is paused. Keep manually stored tags only.
  return logItems;

  // return logItems.map((item) => {
  //   if (item.tagsManaged) {
  //     return { ...item, tags: uniqueWords(item.tags || []).slice(0, 6) };
  //   }
  //
  //   return { ...item, tags: getGeneratedTags(item, personalTagSet) };
  // });
}

function getCurrentLogMeta() {
  const now = new Date();
  const operationalDate = getOperationalDate(now);
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const hour12 = hour % 12 || 12;

  return {
    date: formatShortDate(operationalDate),
    displayDate: `${operationalDate.getMonth() + 1}월 ${operationalDate.getDate()}일`,
    day: days[operationalDate.getDay()],
    greeting: getTimeGreeting(hour),
    hour,
    dot: getTimeDotColor(hour),
    time: `${hour < 12 ? "오전" : "오후"} ${hour12}:${minute}`,
    operationalKey: formatOperationalKey(operationalDate),
  };
}

function getOperationalDate(source = new Date()) {
  const date = new Date(source);
  if (date.getHours() < 4) {
    date.setDate(date.getDate() - 1);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatShortDate(date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function formatOperationalKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCurrentOperationalKey() {
  return formatOperationalKey(getOperationalDate());
}

function isCurrentOperationalLog(log) {
  const currentKey = getCurrentOperationalKey();
  if (log.operationalKey) return log.operationalKey === currentKey;
  return log.date === formatShortDate(getOperationalDate());
}

function getHourFromTimeLabel(time) {
  const match = time.match(/(오전|오후)\s*(\d{1,2}):/);
  if (!match) return null;

  const period = match[1];
  const hour12 = Number(match[2]);
  if (period === "오전") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function getTimeDotColor(hour) {
  if (hour >= 5 && hour < 10) return "#f3a84f";
  if (hour >= 10 && hour < 14) return "#e96f55";
  if (hour >= 14 && hour < 17) return "#62a876";
  if (hour >= 17 && hour < 21) return "#5f83c6";
  if (hour >= 21 || hour < 1) return "#8b6fbd";
  return "#607789";
}

const flowDotColors = ["#f3a84f", "#e96f55", "#62a876", "#5f83c6", "#8b6fbd", "#607789"];

function getFlowDotColor(item, sequence = 0) {
  const source = `${item.id || ""}${item.date || ""}${item.time || ""}${item.text || ""}${sequence}`;
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 1)) % flowDotColors.length;
  }

  return flowDotColors[hash];
}

function getDailyWindStyle(key = "") {
  const source = key || formatOperationalKey(new Date());
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 3)) % 997;
  }

  return {
    "--wind-left": `${87 + (hash % 4)}px`,
    "--wind-top": `${24 + (Math.floor(hash / 5) % 4)}px`,
    "--wind-width": `${19 + (hash % 5)}px`,
    "--wind-rotate": `${-33 + (hash % 7)}deg`,
    "--wind-duration": `${4.1 + (hash % 6) * 0.18}s`,
    "--wind-delay": `${-((hash % 10) * 0.17)}s`,
  };
}

function getLogDotColor(item) {
  return getFlowDotColor(item);
}

const moodChipPalettes = [
  { bg: "#fff1e7", text: "#b9573f", border: "#f2c9b8" },
  { bg: "#eef6ea", text: "#4e7b4f", border: "#cfe1c7" },
  { bg: "#eaf3fb", text: "#386c9d", border: "#c7ddec" },
  { bg: "#f1ecfb", text: "#7255a6", border: "#d8ccec" },
  { bg: "#fff6d9", text: "#9a6f12", border: "#ecd58f" },
  { bg: "#f3f0eb", text: "#6f5b49", border: "#ddd2c6" },
];

function getMoodChipStyle(mood = "") {
  const source = mood || "남김";
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + source.charCodeAt(index) * (index + 5)) % moodChipPalettes.length;
  }

  const palette = moodChipPalettes[hash];
  return {
    backgroundColor: palette.bg,
    color: palette.text,
    borderColor: palette.border,
  };
}

function getMoodLabels(item) {
  const moods = Array.isArray(item.moods) ? item.moods : [];
  const legacyMood = item.mood && item.mood !== "남김" ? [item.mood] : [];
  return [...new Set([...moods, ...legacyMood].map((mood) => mood.trim()).filter(Boolean))].slice(0, 2);
}

function getNoteEntries(item) {
  const notes = Array.isArray(item.notes) ? item.notes : [];
  const legacyNote = item.note ? [item.note] : [];
  return [...legacyNote, ...notes].map((note) => String(note).trim()).filter(Boolean);
}

const defaultFrequencyOption = { key: "daily", icon: "📝", label: "일상기록" };

const frequencyOptions = [
  { key: "daily", icon: "📝", label: "일상기록" },
  { key: "cloudy", icon: "☁️", label: "흐림" },
  { key: "calm", icon: "🌿", label: "잔잔함" },
  { key: "clear", icon: "☀️", label: "맑음" },
];

const selectableFrequencyOptions = frequencyOptions.filter((option) => option.key !== defaultFrequencyOption.key);

const frequencyGuideMap = {
  cloudy: {
    name: "흐린 마음 바라보기",
    body: "조금 흐린 마음도\n그대로 잠시 바라봅니다.",
    selfTalk: "선명하지 않아도 괜찮아요.",
  },
  calm: {
    name: "잠시 머물기",
    body: "마음속에 머무는\n잔잔한 순간을 음미해봅니다.",
    selfTalk: "무리하지 말고 이 속도 그대로.",
  },
  clear: {
    name: "맑은 마음 담아두기",
    body: "맑게 지나간 순간을\n조용히 마음에 담아둡니다.",
    selfTalk: "오늘의 맑음을 오래 간직해도 좋아요.",
  },
};

function getFrequencyOption(item) {
  if (!item) return null;
  const legacyFrequencyMap = {
    heavy: "cloudy",
    flow: "calm",
    spark: "clear",
    무거움: "cloudy",
    흘러감: "calm",
    반짝임: "clear",
  };
  const normalizedKey = legacyFrequencyMap[item.frequencyKey] || item.frequencyKey;
  const normalizedLabel = legacyFrequencyMap[item.frequency] || item.frequency;
  return frequencyOptions.find((option) => option.key === normalizedKey || option.label === normalizedLabel) || null;
}

const frequencyToneMap = {
  cloudy: { bg: "#eef0f7", text: "#536274", border: "#d8deec" },
  calm: { bg: "#eef6ed", text: "#4d7b55", border: "#d4e7d2" },
  clear: { bg: "#fff7d1", text: "#9a7412", border: "#efd989" },
};

function getFrequencyTone(item) {
  const frequency = getFrequencyOption(item);
  return frequency ? frequencyToneMap[frequency.key] : null;
}

function getMoodPositionLabel(item) {
  const rawKey = item?.frequencyKey || item?.frequency || "";
  const rawLabel = item?.frequency || "";
  const option = getFrequencyOption(item);
  const key = rawKey || option?.key || "";
  const label = rawLabel || option?.label || "";

  if (!item || key === "daily" || label === defaultFrequencyOption.label) return "";

  const labelMap = {
    cloudy: "☁️ 흐린 쪽",
    heavy: "🌧 무거운 쪽",
    calm: "🌿 잔잔한 쪽",
    flow: "🌤 맑아지는 쪽",
    clear: "☀️ 맑은 쪽",
    spark: "☀️ 맑은 쪽",
  };

  return labelMap[key] || (option && option.key !== "daily" ? labelMap[option.key] : "") || "";
}

function getMoodPositionMessage(positionIndex) {
  const messages = [
    "지금 내 마음은 흐린 쪽에 머물러 있어요.",
    "지금 내 마음은 조금 무거운 곳에 있어요.",
    "지금 내 마음은 잔잔한 곳에 머물러 있어요.",
    "지금 내 마음은 맑아지는 길 위에 있어요.",
    "지금 내 마음은 햇살 가까이에 있어요.",
  ];
  const safeIndex = Math.max(0, Math.min(messages.length - 1, positionIndex));
  return messages[safeIndex];
}

function getMomentTitle(item) {
  const words = (item.tags || []).map(normalizeWord).filter(Boolean);
  if (words.length >= 2) return words.slice(0, 2).join(" ");
  if (words.length === 1) return words[0];

  const firstLine = item.text.split("\n")[0].trim();
  return firstLine.length > 10 ? `${firstLine.slice(0, 10)}...` : firstLine;
}

function readImageFile(file, onLoad, onError) {
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== "string") return;

    const image = new window.Image();
    image.onload = () => {
      const maxSide = 1280;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        onError?.("사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요.");
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      onLoad(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => onError?.("사진을 불러오지 못했어요. 다른 사진으로 다시 시도해 주세요.");
    image.src = reader.result;
  };
  reader.onerror = () => onError?.("사진을 읽지 못했어요. 다시 시도해 주세요.");
  reader.readAsDataURL(file);
}

function getImageBackground(image) {
  if (!image) return undefined;
  if (image.startsWith("data:") || image.startsWith("blob:") || image.startsWith("http")) {
    return `center / cover no-repeat url("${image}")`;
  }

  return image;
}

function getTimeGreeting(hour) {
  if (hour >= 5 && hour < 10) return "아침이 천천히 오네요.";
  if (hour >= 10 && hour < 14) return "점심 무렵이네요.";
  if (hour >= 14 && hour < 17) return "오후가 천천히 가네요.";
  if (hour >= 17 && hour < 21) return "저녁빛이 내려앉네요.";
  if (hour >= 21 || hour < 1) return "밤이 꽤 깊었네요.";
  return "새벽이 조용하네요.";
}

function TimeOfDayIcon({ hour }) {
  if (hour >= 18 && hour < 21) {
    return <Sunset size={22} strokeWidth={1.8} className="text-[#d69a46]" />;
  }

  if (hour >= 21 || hour < 5) {
    return <Moon size={22} strokeWidth={1.8} className="text-[#738099]" />;
  }

  return <Sun size={22} strokeWidth={1.8} className="text-[#b89a62]" />;
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "recent", label: "오늘", icon: <Home size={21} strokeWidth={1.85} /> },
    { id: "log", label: "툭로그", icon: <FileText size={21} strokeWidth={1.85} /> },
    { id: "today", label: "요즘", icon: <BarChart3 size={21} strokeWidth={1.85} /> },
    { id: "settings", label: "나", icon: <UserRound size={21} strokeWidth={1.85} /> },
  ];

  return (
    <nav className="maeumtuk-bottom-nav absolute bottom-0 left-0 right-0 grid grid-cols-4">
      {items.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`maeumtuk-bottom-nav-item ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="maeumtuk-bottom-nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="maeumtuk-bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function getResponseTukMessage(count, { totalCount, isLatest = false } = {}) {
  if (isLatest && totalCount >= 7 && totalCount % 7 === 0) return "🌙 이번 주를 돌아볼 조각이 모였어요.";
  if (count === 1) return "🍃 첫 툭이 남겨졌어요.";
  if (count === 2) return "🌱 이런 생각도 툭이에요.";
  if (count === 3) return "☁️ 정리 안 된 마음도 남았어요.";
  if (count === 5) return "🍊 벌써 다섯 번째 툭이네요.";
  if (count === 10) return "☁️ 자주 보이는 생각이 생겼어요.";
  if (count === 15) return "🌱 요즘의 이야기가 모였어요.";
  const messages = ["🍃 툭, 여기에 남겨졌어요.", "🌱 지금의 조각이 남았어요.", "☁️ 말 안 된 마음도 남았어요.", "🍊 마음 하나가 놓였어요."];
  return messages[Math.abs(count) % messages.length];
}

function ResponseTuk({ children, typing = false }) {
  const characters = Array.from(String(children));
  const [visibleCount, setVisibleCount] = useState(typing ? 0 : characters.length);

  useEffect(() => {
    if (!typing) {
      setVisibleCount(characters.length);
      return undefined;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisibleCount(characters.length);
      return undefined;
    }

    setVisibleCount(0);
    let intervalId;
    const startTimer = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setVisibleCount((count) => {
          if (count >= characters.length) {
            window.clearInterval(intervalId);
            return count;
          }
          return count + 1;
        });
      }, 58);
    }, 900);

    return () => {
      window.clearTimeout(startTimer);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [children, typing]);

  const isTyping = typing && visibleCount < characters.length;

  return (
    <div className="mt-2.5 font-['SUIT'] text-[14px] font-semibold leading-6 tracking-[-0.02em] text-[#6f6a5f]">
      <span>{characters.slice(0, visibleCount).join("")}</span>
      {isTyping && <span className="maeumtuk-response-caret ml-0.5 inline-block h-[15px] w-px align-[-2px] bg-[#9b927f]" aria-hidden="true" />}
    </div>
  );
}

function SaveOverlay({ message, showSubtext = false, onDismiss, onAddWord }) {
  return (
    <div
      onClick={onDismiss}
      className="maeumtuk-save-screen absolute inset-0 z-50 grid w-full place-items-center bg-[rgba(250,248,245,.94)] px-8 text-center backdrop-blur-[2px]"
      role="presentation"
    >
      <section className="maeumtuk-save-pop flex flex-col items-center" onClick={(event) => event.stopPropagation()}>
        <div className="maeumtuk-save-symbol mb-5 flex w-[78px] items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-[#b9aa9c]" />
          <span className="h-3 w-3 rounded-full bg-[#e4bd46]" />
          <span className="h-px flex-1 bg-[#b9aa9c]" />
        </div>
        <p className="maeumtuk-save-title font-['Pretendard'] text-[21px] font-semibold tracking-[-0.02em] text-[#2c251f]">{message}</p>
        {showSubtext && <p className="maeumtuk-save-sub mt-3 text-[14px] font-medium tracking-[-0.02em] text-[#817970]">작은 마음 하나가 놓였어요.</p>}
        {onAddWord && (
          <div className="maeumtuk-save-sub mt-5 rounded-[14px] border border-[#e2d7cc] bg-[#f7f1eb]/92 px-4 py-3 shadow-[0_10px_28px_rgba(73,59,47,.08)]">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#4a4037]">마음 한마디 더 남겨볼까요?</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={onAddWord} className="h-9 rounded-full bg-[#6e5d4c] px-4 text-[13px] font-semibold text-[#fffdf9]">
                남기기
              </button>
              <button type="button" onClick={onDismiss} className="h-9 rounded-full px-3 text-[13px] font-medium text-[#766d64]">
                그냥 두기
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FrequencyGuideOverlay({ item, onClose }) {
  const frequency = getFrequencyOption(item);
  const guide = frequency ? frequencyGuideMap[frequency.key] : null;
  if (!frequency || !guide) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(250,248,245,.96)] px-5 py-6 backdrop-blur-[2px]">
      <section className="max-h-full w-full overflow-y-auto rounded-[26px] border border-[#e9ded3] bg-[#fffaf4] px-5 py-5 shadow-[0_18px_48px_rgba(54,42,30,0.13)]">
        <div className="mb-4">
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-[#8a8178]">
            {frequency.icon} {frequency.label} · {guide.name}
          </p>
          <p className="mt-4 whitespace-pre-line text-[20px] font-semibold leading-8 tracking-[-0.055em] text-[#102747]">
            {guide.body}
          </p>
        </div>

        <div className="rounded-[18px] border border-[#e7ddd3] bg-[#fffdf9] px-4 py-4">
          <p className="mb-2 text-[12px] font-semibold tracking-[-0.02em] text-[#9a9289]">남겨둔 원본 글</p>
          <p className="whitespace-pre-line text-[16px] font-normal leading-7 tracking-[-0.03em] text-[#29241f]">
            {item.text}
          </p>
        </div>

        <div className="mt-4 rounded-[18px] bg-[#f4efe8] px-4 py-4">
          <p className="mb-2 text-[12px] font-semibold tracking-[-0.02em] text-[#8a8178]">나에게 해줄 말</p>
          <p className="text-[16px] font-semibold leading-7 tracking-[-0.035em] text-[#4a4037]">
            {guide.selfTalk}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-[16px] bg-[#102747] text-[15px] font-semibold tracking-[-0.03em] text-white"
          >
            이 마음 그대로 안아주기
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-[14px] text-[14px] font-semibold tracking-[-0.03em] text-[#776d64]"
          >
            그냥 닫기
          </button>
        </div>
      </section>
    </div>
  );
}

function useVisibleViewportHeight() {
  useEffect(() => {
    const setViewportHeight = () => {
      const viewport = window.visualViewport;
      const layoutHeight = window.innerHeight;
      const visibleHeight = viewport?.height || layoutHeight;
      const keyboardOpen = viewport ? layoutHeight - visibleHeight > 120 : false;

      document.documentElement.style.setProperty("--maeumtuk-vh", `${layoutHeight}px`);
      document.documentElement.style.setProperty("--maeumtuk-visible-vh", `${visibleHeight}px`);
      document.documentElement.classList.toggle("maeumtuk-keyboard-open", keyboardOpen);
    };

    setViewportHeight();
    window.visualViewport?.addEventListener("resize", setViewportHeight);
    window.visualViewport?.addEventListener("scroll", setViewportHeight);
    window.addEventListener("focusin", setViewportHeight);
    window.addEventListener("focusout", setViewportHeight);
    window.addEventListener("resize", setViewportHeight);

    return () => {
      document.documentElement.classList.remove("maeumtuk-keyboard-open");
      window.visualViewport?.removeEventListener("resize", setViewportHeight);
      window.visualViewport?.removeEventListener("scroll", setViewportHeight);
      window.removeEventListener("focusin", setViewportHeight);
      window.removeEventListener("focusout", setViewportHeight);
      window.removeEventListener("resize", setViewportHeight);
    };
  }, []);
}

function Phone({ children, tab, setTab, hideNav = false, overlay = null }) {
  return (
    <div className="maeumtuk-phone relative h-[var(--maeumtuk-vh,100dvh)] max-h-[var(--maeumtuk-vh,100dvh)] w-full max-w-[430px] overflow-hidden sm:h-[min(820px,calc(var(--maeumtuk-vh,100dvh)-48px))] sm:max-h-[820px] sm:w-[390px]">
      <div className={`maeumtuk-scroll h-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${hideNav ? "maeumtuk-scroll-without-nav" : "maeumtuk-scroll-with-nav"}`}>{children}</div>
      {!hideNav && <BottomNav tab={tab} setTab={setTab} />}
      {overlay}
      {/* 저장 완료 전체 화면 애니메이션은 추후 재검토를 위해 보존합니다. */}
      {/* {saveOverlayVisible && <SaveOverlay message={saveOverlayMessage} />} */}
    </div>
  );
}

function MiniPhoto({ bg, size = "md" }) {
  const [expanded, setExpanded] = useState(false);
  const sizeClass = {
    md: "h-[64px] w-[64px] rounded-[10px]",
    lg: "h-[76px] w-[76px] rounded-[11px]",
  }[size];
  const isPhotoSource = typeof bg === "string" && /^(data:|blob:|https?:)/.test(bg);

  useEffect(() => {
    if (!expanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [expanded]);

  const viewer = expanded ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#171512]/90 px-3 pb-[calc(18px+env(safe-area-inset-bottom))] pt-[calc(64px+env(safe-area-inset-top))] backdrop-blur-[2px]"
      onClick={() => setExpanded(false)}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
    >
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="fixed right-4 top-[calc(12px+env(safe-area-inset-top))] grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15 backdrop-blur-sm"
        aria-label="사진 닫기"
      >
        <X size={23} strokeWidth={1.8} />
      </button>
      {isPhotoSource ? (
        <img
          src={bg}
          alt="확대된 기록 사진"
          className="max-h-full max-w-full rounded-[10px] object-contain shadow-[0_20px_60px_rgba(0,0,0,.35)]"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <div
          className="h-[min(72vh,620px)] w-full max-w-[720px] rounded-[10px] bg-contain bg-center bg-no-repeat shadow-[0_20px_60px_rgba(0,0,0,.35)]"
          style={{ backgroundImage: getImageBackground(bg)?.replace("center / cover no-repeat ", "") }}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={`${sizeClass} shrink-0 shadow-inner ring-1 ring-black/[.03]`}
        style={{ background: getImageBackground(bg) }}
        aria-label="사진 크게 보기"
      />
      {viewer && createPortal(viewer, document.body)}
    </>
  );
}

function EmptyState({ title, body }) {
  return (
    <section className="rounded-[13px] border border-[#eee6dc] bg-[#fffdf9] px-5 py-8 text-center shadow-[0_7px_18px_rgba(54,42,30,.03)]">
      <div className="mx-auto mb-5 flex w-[58px] items-center" aria-hidden="true">
        <span className="h-px flex-1 bg-[#cfc3b7]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#b89a62]" />
        <span className="h-px flex-1 bg-[#cfc3b7]" />
      </div>
      <h2 className="font-['Pretendard'] text-[16px] font-semibold tracking-[-0.02em] text-[#2d2119]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[230px] text-[13px] leading-6 text-[#817970]">{body}</p>
    </section>
  );
}

function RecordEditScreen({ item, onClose, onSave }) {
  const [text, setText] = useState(item.text || "");
  const [image, setImage] = useState(item.image || null);
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef(null);
  const canSave = Boolean(text.trim() || image);

  const save = () => {
    if (!canSave) return;
    onSave(item, {
      text: text.trim() || "사진으로 남긴 툭",
      image,
      tags: item.tags || [],
      mood: item.mood || "남김",
    });
  };

  return (
    <section className="min-h-full bg-[#faf8f5] px-5 pb-10 pt-6 font-['Pretendard']">
      <div className="flex h-11 items-center justify-between">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-[10px] text-[#655d56] hover:bg-[#eee8e1]" aria-label="수정 취소">
          <X size={20} strokeWidth={1.8} />
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-[#2b251f]">기록 수정</h1>
        <button
          onClick={save}
          disabled={!canSave}
          className={`h-9 rounded-[9px] px-3.5 text-[13px] font-semibold ${
            canSave ? "bg-[#ef875c] text-white" : "bg-[#eee7e0] text-[#b0a69d]"
          }`}
        >
          저장
        </button>
      </div>

      <div className="mt-6 border-t border-[#e9dfd5] pt-5">
        <p className="mb-3 text-[12px] font-medium text-[#938a82]">{item.date} {item.day} · {item.time}</p>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoFocus
          className="maeumtuk-reading-text min-h-[210px] w-full resize-none bg-transparent text-[#29241f] outline-none placeholder:text-[#aaa198]"
          placeholder="그때의 생각을 다시 적어보세요."
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          setImageError("");
          readImageFile(event.target.files?.[0], setImage, setImageError);
          event.target.value = "";
        }}
      />
      <div className="mt-4 border-t border-[#e9dfd5] pt-4">
        {image ? (
          <div className="flex items-center gap-3">
            <MiniPhoto bg={image} size="lg" />
            <div className="flex gap-1.5">
              <button onClick={() => imageInputRef.current?.click()} className="h-10 rounded-[9px] border border-[#e2d8cd] bg-[#fffdf9] px-3 text-[12px] font-medium text-[#5d554d]">
                사진 바꾸기
              </button>
              <button onClick={() => setImage(null)} className="h-10 rounded-[9px] px-3 text-[12px] font-medium text-[#b65b43]">
                지우기
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => imageInputRef.current?.click()} className="flex h-10 items-center gap-2 rounded-[9px] text-[13px] font-medium text-[#647856]">
            <Image size={17} strokeWidth={1.8} />
            사진 추가
          </button>
        )}
        {imageError && <p className="mt-2 text-[12px] font-medium text-[#bd6649]">{imageError}</p>}
      </div>
    </section>
  );
}

function RecordAddSheet({ item, emotionOptions, initialMode = "menu", onAddEmotion, onClose, onUpdate }) {
  const [mode, setMode] = useState(initialMode);
  const [selectedMoods, setSelectedMoods] = useState(getMoodLabels(item));
  const [customEmotion, setCustomEmotion] = useState("");
  const [note, setNote] = useState("");

  const toggleEmotion = (emotion) => {
    const nextEmotion = emotion.trim();
    if (!nextEmotion) return;

    setSelectedMoods((current) => {
      if (current.includes(nextEmotion)) return current.filter((mood) => mood !== nextEmotion);
      onAddEmotion(nextEmotion);
      return [...current, nextEmotion].slice(0, 2);
    });
    setCustomEmotion("");
  };

  const saveEmotion = () => {
    if (selectedMoods.length === 0) return;
    onUpdate(item, { mood: selectedMoods[0], moods: selectedMoods });
    onClose();
  };

  const saveNote = () => {
    const nextNote = note.trim();
    if (!nextNote) return;
    onUpdate(item, { notes: [...(item.notes || []), nextNote] });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end bg-[#2b241f]/28 backdrop-blur-[1px]" onClick={onClose}>
      <section
        className="w-full rounded-t-[20px] bg-[#fffdf9] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_44px_rgba(44,34,26,.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[#d8d0c8]" />

        {mode === "menu" && (
          <>
            <div className="mb-4 px-1">
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#2b251f]">마음 한마디 더 남기기</h2>
              <p className="mt-1 text-[12px] font-medium text-[#91887f]">이름을 붙이거나, 생각을 조금 더 이어둘 수 있어요.</p>
            </div>
            <div className="space-y-2">
              <button onClick={() => setMode("emotion")} className="flex w-full items-center gap-3 rounded-[12px] bg-[#f5f1ec] px-4 py-4 text-left">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#edf3e8] text-[#628052]">
                  <Sprout size={19} strokeWidth={1.8} />
                </span>
                <span>
                  <b className="block text-[15px] font-semibold text-[#3c352f]">내 마음대로 이름 붙이기</b>
                  <span className="mt-0.5 block text-[12px] text-[#8b8279]">속상해, 화남, 피곤함처럼 2개까지</span>
                </span>
              </button>
              <button onClick={() => setMode("note")} className="flex w-full items-center gap-3 rounded-[12px] bg-[#fff4ed] px-4 py-4 text-left">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#ffe9dc] text-[#cf724e]">
                  <Plus size={19} strokeWidth={1.9} />
                </span>
                <span>
                  <b className="block text-[15px] font-semibold text-[#3c352f]">툭 하나 더</b>
                  <span className="mt-0.5 block text-[12px] text-[#8b8279]">그 후의 생각이나 이야기를 이어 쓰기</span>
                </span>
              </button>
            </div>
          </>
        )}

        {mode === "emotion" && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#2b251f]">내 마음대로 이름 붙이기</h2>
                <p className="mt-1 text-[12px] text-[#91887f]">속상해, 화남, 피곤함처럼 2개까지 붙일 수 있어요.</p>
              </div>
              <button onClick={() => setMode("menu")} className="h-9 rounded-[9px] px-2 text-[12px] font-medium text-[#746d65]">뒤로</button>
            </div>
            <div className="mb-3 flex items-center justify-between rounded-[11px] bg-[#f8f3ed] px-3 py-2 text-[12px] font-medium text-[#6f655b]">
              <span>{selectedMoods.length > 0 ? selectedMoods.join(" · ") : "아직 붙인 이름이 없어요."}</span>
              <span>{selectedMoods.length}/2</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionOptions.map((emotion) => {
                const selected = selectedMoods.includes(emotion);
                const disabled = !selected && selectedMoods.length >= 2;
                return (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    disabled={disabled}
                    className={`rounded-full border px-3 py-2 text-[13px] font-medium transition ${
                      selected
                        ? "border-[#102747] bg-[#102747] text-white"
                        : disabled
                          ? "border-[#e6ddd3] bg-[#f7f2ec] text-[#b4aaa0]"
                          : "border-[#ded2c6] bg-[#f4efe9] text-[#5c5045]"
                    }`}
                  >
                    {emotion}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={customEmotion}
                onChange={(event) => setCustomEmotion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") toggleEmotion(customEmotion);
                }}
                className="h-11 min-w-0 flex-1 rounded-[10px] border border-[#e5dbd0] bg-white px-3 text-[14px] outline-none focus:border-[#c8b5a4]"
                placeholder="내 마음대로 이름 붙이기"
                autoFocus
              />
              <button
                onClick={() => toggleEmotion(customEmotion)}
                disabled={!customEmotion.trim() || (!selectedMoods.includes(customEmotion.trim()) && selectedMoods.length >= 2)}
                className="h-11 rounded-[10px] bg-[#6e5d4c] px-4 text-[13px] font-semibold text-white disabled:bg-[#d8d0c8]"
              >
                추가
              </button>
            </div>
            <button
              onClick={saveEmotion}
              disabled={selectedMoods.length === 0}
              className="mt-4 h-11 w-full rounded-[12px] bg-[#f6c400] text-[14px] font-semibold text-[#061c36] disabled:bg-[#e8dfd2] disabled:text-[#91887f]"
            >
              남기기
            </button>
          </>
        )}

        {mode === "note" && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-[#2b251f]">툭 하나 더</h2>
                <p className="mt-1 text-[12px] text-[#91887f]">떠오를 때마다 이어서 남길 수 있어요.</p>
              </div>
              <button onClick={() => setMode("menu")} className="h-9 rounded-[9px] px-2 text-[12px] font-medium text-[#746d65]">뒤로</button>
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-[112px] w-full resize-none rounded-[11px] border border-[#eadfd4] bg-[#fffaf5] p-3 text-[15px] leading-6 outline-none focus:border-[#ddbca9]"
              placeholder="지금 다시 떠오르는 생각은?"
              autoFocus
            />
            <button onClick={saveNote} disabled={!note.trim()} className="mt-3 h-11 w-full rounded-[10px] bg-[#ef875c] text-[14px] font-semibold text-white disabled:opacity-35">
              남기기
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function NowFlowItem({ item, sequence, isLatest = false, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dotColor = getFlowDotColor(item, sequence);
  const isSample = Boolean(item.sample);
  const moodLabels = getMoodLabels(item);
  const frequency = getFrequencyOption(item);
  const frequencyTone = getFrequencyTone(item);
  const noteEntries = getNoteEntries(item);
  const hasNote = noteEntries.length > 0;
  const previewTags = [...moodLabels, ...(item.tags || []).map(normalizeWord)]
    .map((tag) => tag?.trim())
    .filter(Boolean)
    .filter((tag, index, tags) => tags.indexOf(tag) === index)
    .slice(0, 3);
  return (
    <article
      className={`maeumtuk-now-row relative mb-2.5 rounded-[18px] border border-[#ece7de] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.025)] last:mb-0 ${
        menuOpen ? "z-30" : ""
      } ${
        isLatest ? "maeumtuk-now-settle" : ""
      }`}
    >
      {!isSample && (
        <button
          onClick={() => {
            setMenuOpen((open) => !open);
            setConfirmDelete(false);
          }}
          className="absolute right-1 top-3 grid h-8 w-8 place-items-center rounded-full text-[#8f877e] transition hover:bg-[#f5f0ea]"
          aria-label="오늘 툭 관리"
        >
          <MoreHorizontal size={16} />
        </button>
      )}
      {!isSample && menuOpen && (
        <div className="absolute right-2 top-10 z-20 w-[112px] rounded-[10px] border border-[#eee6dc] bg-[#fffdf9] p-1.5 text-[13px] shadow-[0_10px_24px_rgba(54,42,30,.08)]">
          <button
            onClick={() => {
              onEdit?.(item);
              setMenuOpen(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
          >
            수정
          </button>
          <button
            onClick={() => {
              setConfirmDelete(true);
              setMenuOpen(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#b65b43] hover:bg-[#fff1ea]"
          >
            삭제
          </button>
        </div>
      )}
      <div className={`relative pl-[24px] font-['Pretendard'] ${isSample ? "pr-1" : "pr-10"}`}>
        <span
          aria-hidden="true"
          className="absolute left-[3px] top-[10px] h-2 w-2 rounded-full ring-2 ring-white shadow-[0_1px_5px_rgba(43,35,28,0.16)]"
          style={{ background: dotColor }}
        />
        <span
          aria-hidden="true"
          className="hidden"
        />
        <time className="flex h-[23px] items-center gap-2 text-[12px] font-medium leading-[23px] tracking-[-0.02em] text-[#766c63]">
          <span>{item.time}</span>
          {frequency && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[-0.03em]"
              style={{
                backgroundColor: frequencyTone?.bg || "#f7f3ef",
                color: frequencyTone?.text || "#7e746b",
              }}
            >
              <span aria-hidden="true">{frequency.icon}</span>
              {frequency.label}
            </span>
          )}
        </time>
        <div className="mt-1 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="maeumtuk-now-preview whitespace-pre-line font-['Pretendard'] text-[15px] font-normal leading-[25px] tracking-[-0.02em] text-[#151f2a]">
              {item.text}
            </p>
            {previewTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[12px] font-medium leading-5 tracking-[-0.02em] text-[#766c63]/75">
                {previewTags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
            {hasNote && (
              <p className="mt-1.5 text-[12px] font-medium leading-5 tracking-[-0.02em] text-[#7e746b]">
                ↳ 이어진 생각 {noteEntries.length}개
              </p>
            )}
          </div>
          {item.image && (
            <div className="maeumtuk-now-thumbnail h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] border border-[#ece7de] bg-[#f8f8f5] shadow-[0_6px_14px_rgba(54,42,30,0.04)]">
              <div className="h-full w-full" style={{ background: getImageBackground(item.image) }} />
            </div>
          )}
        </div>
      </div>
      <div className="pl-[24px]">
        {!isSample && confirmDelete && (
          <div className="mt-3 rounded-[10px] bg-[#fff5ee] p-3 text-[13px] text-[#4a3d34]">
            <p className="mb-2">이 툭을 지울까요?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} className="h-9 rounded-[8px] px-3 text-[12px] font-medium text-[#746d65]">
                취소
              </button>
              <button onClick={() => onDelete?.(item)} className="h-9 rounded-[8px] bg-[#b65b43] px-3 text-[12px] font-semibold text-white">
                지우기
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

const nowNoteGuideOptions = [
  "지금 스쳐 지나가는 생각,\n기억, 걱정, 발견한 것 하나.\n\n형식 없이 툭.",
];

const DOODLE_COLOR = "#20324B";
const DOODLE_WIDTH = 3;

function DoodleCanvas({ strokes, setStrokes, onPreviewChange }) {
  const canvasRef = useRef(null);
  const activeStrokeRef = useRef(null);

  const drawStrokes = (nextStrokes = strokes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineCap = "round";
    context.lineJoin = "round";

    nextStrokes.forEach((stroke) => {
      if (!stroke.points?.length) return;
      context.strokeStyle = stroke.color || DOODLE_COLOR;
      context.lineWidth = stroke.width || DOODLE_WIDTH;
      context.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      });
      if (stroke.points.length === 1) {
        const point = stroke.points[0];
        context.lineTo(point.x + 0.1, point.y + 0.1);
      }
      context.stroke();
    });
  };

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
  };

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onPreviewChange?.(canvas.toDataURL("image/png"));
  };

  useEffect(() => {
    drawStrokes(strokes);
    window.requestAnimationFrame(updatePreview);
  }, [strokes]);

  useEffect(() => {
    const handleResize = () => drawStrokes(strokes);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [strokes]);

  const handlePointerDown = (event) => {
    const point = getPoint(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    activeStrokeRef.current = {
      color: DOODLE_COLOR,
      width: DOODLE_WIDTH,
      points: [point],
    };
    drawStrokes([...strokes, activeStrokeRef.current]);
  };

  const handlePointerMove = (event) => {
    if (!activeStrokeRef.current) return;
    const point = getPoint(event);
    if (!point) return;
    event.preventDefault();
    activeStrokeRef.current.points.push(point);
    drawStrokes([...strokes, activeStrokeRef.current]);
  };

  const finishStroke = (event) => {
    if (!activeStrokeRef.current) return;
    event?.preventDefault?.();
    const finishedStroke = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (finishedStroke.points.length > 0) {
      setStrokes((current) => [...current, finishedStroke]);
      window.requestAnimationFrame(updatePreview);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full touch-none"
      aria-label="낙서툭 그리기 영역"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishStroke}
      onPointerCancel={finishStroke}
      onPointerLeave={finishStroke}
    />
  );
}

function getSevenDayFragment(logItems = []) {
  const datedLogs = logItems
    .map((item) => ({ item, date: parseLogDate(item) }))
    .filter(({ date }) => date && !Number.isNaN(date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (datedLogs.length === 0) return null;

  const today = getOperationalDate();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoKey = formatOperationalKey(sevenDaysAgo);
  const exactFragment = datedLogs
    .filter(({ date }) => formatOperationalKey(date) === sevenDaysAgoKey)
    .at(-1);

  if (exactFragment) {
    return {
      title: "7일 전 조각",
      item: exactFragment.item,
    };
  }

  const oldest = datedLogs[0];
  if (oldest.date.getTime() > sevenDaysAgo.getTime()) {
    return {
      title: "첫 조각",
      item: oldest.item,
    };
  }

  return null;
}

function NowTab({
  todayLogs,
  logItems = [],
  onAddLog,
  onAddDetails,
  onEditLog,
  onDeleteLog,
  onHideWritingExample,
  onShowSaved,
  composerOpen,
  onComposerOpenChange,
  emotionOptions = baseEmotionOptions,
  onAddEmotion,
}) {
  const noteGuide = useMemo(() => nowNoteGuideOptions[Math.floor(Math.random() * nowNoteGuideOptions.length)], []);
  const minDraftHeight = 76;
  const maxDraftHeight = 240;
  const [draft, setDraft] = useState("");
  const [photoData, setPhotoData] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [lengthNotice, setLengthNotice] = useState(false);
  const [emptyNotice, setEmptyNotice] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [typedNoteGuide, setTypedNoteGuide] = useState("");
  const [draftMoods, setDraftMoods] = useState([]);
  const [moodPickerOpen, setMoodPickerOpen] = useState(false);
  const [customDraftMood, setCustomDraftMood] = useState("");
  const [selectedFrequencyKey, setSelectedFrequencyKey] = useState("");
  const [frequencyPickerOpen, setFrequencyPickerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("text");
  const [mindSpaceOpen, setMindSpaceOpen] = useState(false);
  const [mindSpaceCount, setMindSpaceCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [doodleStrokes, setDoodleStrokes] = useState([]);
  const [doodleCaption, setDoodleCaption] = useState("");
  const [doodlePreviewImage, setDoodlePreviewImage] = useState("");
  const draftRef = useRef(null);
  const photoInputRef = useRef(null);
  const currentMeta = getCurrentLogMeta();
  const todayCount = todayLogs.length;
  const displayTodayLogs = todayLogs.slice(0, 2);
  const hasDoodle = doodleStrokes.length > 0;
  const canLeaveTuk = composerMode === "sketch"
    ? Boolean(hasDoodle || doodleCaption.trim())
    : Boolean(draft.trim() || photoData);
  const moodOptions = emotionOptions;
  const hasSelectedFrequency = Boolean(selectedFrequencyKey);
  const selectedFrequency = frequencyOptions.find((option) => option.key === selectedFrequencyKey);
  const sevenDayFragment = getSevenDayFragment(logItems);
  const selectedPositionIndex = Math.max(
    0,
    selectableFrequencyOptions.findIndex((option) => option.key === selectedFrequencyKey),
  );
  const moodPositionIndex = selectedFrequencyKey ? selectedPositionIndex : Math.min(1, selectableFrequencyOptions.length - 1);
  const moodPositionLeft = selectableFrequencyOptions.length > 1
    ? `${(moodPositionIndex / (selectableFrequencyOptions.length - 1)) * 100}%`
    : "50%";
  const moodPositionMessage = getMoodPositionMessage(selectedFrequencyKey ? selectedPositionIndex * 2 : 2);

  useEffect(() => {
    let index = 0;
    let timer;

    const typeNextCharacter = () => {
      index += 1;
      setTypedNoteGuide(noteGuide.slice(0, index));
      if (index >= noteGuide.length) return;
      timer = window.setTimeout(typeNextCharacter, 130);
    };

    setTypedNoteGuide("");
    timer = window.setTimeout(typeNextCharacter, 220);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [noteGuide]);

  useEffect(() => {
    const input = draftRef.current;
    if (!input) return;

    const baseHeight = mindSpaceOpen ? 220 : minDraftHeight;
    input.style.height = `${baseHeight}px`;
    input.style.height = `${Math.min(Math.max(input.scrollHeight, baseHeight), maxDraftHeight)}px`;
  }, [draft, mindSpaceOpen]);

  useEffect(() => {
    if (!composerOpen) return;
    if (composerMode !== "text") return;
    const focusTimer = window.setTimeout(() => draftRef.current?.focus(), 120);
    return () => window.clearTimeout(focusTimer);
  }, [composerOpen, composerMode]);

  const leaveTuk = () => {
    if (isLeaving) return;
    const text = draft.trim();
    const caption = doodleCaption.trim();
    const isDoodleMode = composerMode === "sketch";
    if (isDoodleMode ? !hasDoodle && !caption : !text && !photoData) {
      setEmptyNotice(true);
      if (!isDoodleMode) draftRef.current?.focus();
      return;
    }
    if (!isDoodleMode && text.length > 300) {
      setLengthNotice(true);
      setEmptyNotice(false);
      return;
    }
    const nextLog = {
      id: `log-${Date.now()}`,
      date: currentMeta.date,
      day: currentMeta.day,
      time: currentMeta.time,
      operationalKey: currentMeta.operationalKey,
      createdAt: new Date().toISOString(),
      text: text || "사진으로 남긴 툭",
      tags: [],
      mood: draftMoods[0] || "남김",
      moods: draftMoods,
      frequencyKey: selectedFrequencyKey,
      frequency: selectedFrequency?.label || "",
      dot: currentMeta.dot,
      image: photoData,
      note: "",
      notes: [],
    };
    if (isDoodleMode) {
      nextLog.type = "doodle";
      nextLog.text = caption || "낙서툭";
      nextLog.caption = caption;
      nextLog.strokes = doodleStrokes;
      nextLog.previewImage = doodlePreviewImage;
      nextLog.doodle = {
        type: "doodle",
        strokes: doodleStrokes,
        caption,
        previewImage: doodlePreviewImage,
      };
      nextLog.image = "";
    } else {
      nextLog.type = "text";
    }

    setIsLeaving(true);
    setLengthNotice(false);
    setEmptyNotice(false);
    onHideWritingExample?.();
    window.setTimeout(() => {
      onAddLog(nextLog);
      onShowSaved?.(todayCount + 1, nextLog);
      setDraft("");
      setPhotoData(null);
      setDraftMoods([]);
      setMoodPickerOpen(false);
      setCustomDraftMood("");
      setSelectedFrequencyKey("");
      setFrequencyPickerOpen(false);
      setComposerMode("text");
      setDoodleStrokes([]);
      setDoodleCaption("");
      setDoodlePreviewImage("");
      setMindSpaceOpen(false);
      setMindSpaceCount(0);
      setMoreOpen(false);
      setIsLeaving(false);
      onComposerOpenChange?.(false);
    }, 260);
  };

  const toggleDraftMood = (mood) => {
    const nextMood = mood.trim();
    if (!nextMood) return;

    setDraftMoods((current) => {
      if (current.includes(nextMood)) return current.filter((item) => item !== nextMood);
      onAddEmotion?.(nextMood);
      return [...current, nextMood].slice(0, 2);
    });
    setCustomDraftMood("");
  };

  const toggleFrequency = (key) => {
    setSelectedFrequencyKey((current) => {
      if (current === key) {
        setMoodPickerOpen(false);
        setDraftMoods([]);
        setCustomDraftMood("");
        return "";
      }
      return key;
    });
  };

  if (composerOpen) {
    return (
      <main className="maeumtuk-composer-screen flex h-full min-h-0 flex-col px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-[22px]">
        <header className="mb-[34px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onComposerOpenChange?.(false)}
            className="grid h-10 w-10 place-items-center rounded-full text-[30px] leading-none text-[#333] transition hover:bg-[#f1ebe4]"
            aria-label="작성창 닫기"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white text-[18px] font-bold text-[#333] shadow-[0_10px_26px_rgba(32,50,75,0.07)]"
              aria-label="작성 옵션"
            >
              •••
            </button>
            <button
              type="button"
              className="h-[38px] rounded-full bg-white px-4 text-[14px] font-bold tracking-[-0.03em] text-[#333] shadow-[0_10px_26px_rgba(32,50,75,0.07)]"
            >
              임시저장
            </button>
          </div>
        </header>

        <div className="mb-[18px]">
          <h1 className="m-0 text-[24px] font-bold leading-[1.35] tracking-[-0.05em] text-[#242424]">
            마음에 스친 것을
            <br />
            툭 남겨보세요.
          </h1>
          <p className="mt-1.5 text-[14px] font-normal leading-[1.5] tracking-[-0.03em] text-[#7b7d80]">
            글이 아니어도 괜찮아요. 낙서 한 줄도 좋아요.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-[18px] bg-white p-1.5 shadow-[0_8px_24px_rgba(32,50,75,0.06)]">
          {[
            { key: "text", label: "글" },
            { key: "sketch", label: "낙서툭" },
          ].map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setComposerMode(mode.key)}
              className={`h-11 rounded-[14px] text-[14px] font-extrabold tracking-[-0.03em] transition ${
                composerMode === mode.key
                  ? "bg-[#fff4cc] text-[#20324b]"
                  : "text-[#777] hover:bg-[#faf7ef]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            setPhotoError("");
            readImageFile(event.target.files?.[0], setPhotoData, setPhotoError);
            event.target.value = "";
          }}
        />

        <section
          className={`rounded-[22px] border border-[#e9e2d9] bg-white p-4 shadow-[0_10px_26px_rgba(32,50,75,0.06)] transition duration-300 ${
            isLeaving ? "translate-y-0.5 opacity-55" : ""
          }`}
        >
          {composerMode === "sketch" && (
            <div>
              <div className="relative h-[275px] overflow-hidden rounded-[19px] bg-[#fcfaf5] p-3 shadow-[inset_0_0_0_1px_rgba(233,230,222,0.9)]">
                {doodleStrokes.length === 0 && (
                  <p className="pointer-events-none absolute left-5 top-5 z-[1] whitespace-pre-line text-[17px] font-normal leading-[1.6] tracking-[-0.03em] text-[#aeb1b5]">
                    말로 잘 안 잡히는 마음은
                    <br />
                    선 하나로 남겨도 괜찮아요.
                  </p>
                )}
                <DoodleCanvas
                  strokes={doodleStrokes}
                  setStrokes={(updater) => {
                    setDoodleStrokes(updater);
                    if (emptyNotice) setEmptyNotice(false);
                  }}
                  onPreviewChange={setDoodlePreviewImage}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setDoodleStrokes((current) => current.slice(0, -1))}
                  disabled={doodleStrokes.length === 0}
                  className="h-10 rounded-full border border-[#e9e6de] bg-white px-4 text-[13px] font-bold tracking-[-0.03em] text-[#20324b] shadow-[0_6px_16px_rgba(32,50,75,0.04)] disabled:text-[#b8b8b8]"
                >
                  되돌리기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDoodleStrokes([]);
                    setDoodlePreviewImage("");
                  }}
                  className="h-10 rounded-full border border-[#e9e6de] bg-white px-4 text-[13px] font-bold tracking-[-0.03em] text-[#6f675c] shadow-[0_6px_16px_rgba(32,50,75,0.04)]"
                >
                  새 종이 꺼내기
                </button>
              </div>
              <div className="mt-3 rounded-[14px] bg-[#f8f8f8] px-3">
                <input
                  value={doodleCaption}
                  onChange={(event) => {
                    setDoodleCaption(event.target.value);
                    if (emptyNotice) setEmptyNotice(false);
                  }}
                  className="h-12 w-full bg-transparent text-[15px] font-normal tracking-[-0.02em] text-[#2e2e2e] outline-none placeholder:text-[#aeb1b5]"
                  placeholder="말로 남길 수 있다면, 한 줄만."
                />
              </div>
            </div>
          )}
          <div className={`relative overflow-hidden rounded-[18px] bg-[#fcfaf5] p-4 transition-[min-height] duration-[3000ms] ease-in-out ${composerMode === "sketch" ? "hidden" : ""} ${
            mindSpaceOpen ? "min-h-[300px]" : "min-h-[236px]"
          }`}>
            <div className="relative">
              <textarea
                ref={draftRef}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (lengthNotice) setLengthNotice(false);
                  if (emptyNotice) setEmptyNotice(false);
                }}
                className="maeumtuk-reading-text maeumtuk-draft-input relative z-[1] min-h-[76px] max-h-[300px] w-full resize-none overflow-y-auto bg-transparent p-0 text-[#2e2e2e] outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                placeholder=""
                aria-label="지금 이 순간의 마음 작성"
                maxLength={301}
                rows={6}
              />
              {!draft && (
                <p
                  aria-hidden="true"
                  className="maeumtuk-reading-text composer-guide pointer-events-none absolute inset-x-0 top-0 text-[#aeb1b5] transition-opacity duration-200"
                >
                  {noteGuide}
                </p>
              )}
            </div>
          </div>

          <div className={`mt-3 rounded-[16px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(32,50,75,0.045)] ${composerMode === "sketch" ? "hidden" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <strong className="text-[15px] font-extrabold tracking-[-0.03em] text-[#7b927d]">🌱 마음 여백</strong>
              <span className="text-[12px] font-normal tracking-[-0.02em] text-[#999]">{mindSpaceCount}번</span>
            </div>
            <div
              className={`overflow-hidden text-center text-[12px] font-normal leading-[1.7] tracking-[-0.02em] text-[#7a746c] transition-all duration-700 ${
                mindSpaceOpen ? "mt-3 h-12 opacity-100" : "mt-0 h-0 opacity-0"
              }`}
            >
              잠시 자판에서 손을 떼고,
              <br />
              방금 적은 마음을 바라봐요.
            </div>
            <button
              type="button"
              onClick={() => {
                draftRef.current?.blur();
                setMindSpaceOpen((open) => {
                  const nextOpen = !open;
                  if (nextOpen) setMindSpaceCount((count) => count + 1);
                  return nextOpen;
                });
              }}
              className={`mt-3 h-11 w-full rounded-[12px] text-[13px] font-extrabold tracking-[-0.03em] transition ${
                mindSpaceOpen ? "bg-[#7b927d] text-white" : "bg-[#eef3ee] text-[#20324b]"
              }`}
            >
              {mindSpaceOpen ? "여백 접기" : "마음 여백"}
            </button>
          </div>

          {composerMode !== "sketch" && photoData && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative">
                <MiniPhoto bg={photoData} />
                <button
                  type="button"
                  onClick={() => setPhotoData(null)}
                  className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#fffdf9] text-[#6c6259] shadow-[0_2px_8px_rgba(54,42,30,.12)] ring-1 ring-[#e8dfd5]"
                  aria-label="첨부 사진 삭제"
                >
                  <X size={10} strokeWidth={2} />
                </button>
              </div>
              <span className="text-[12px] font-medium text-[#91887f]">사진이 함께 남겨져요.</span>
            </div>
          )}

          <div className={`mt-3 ${composerMode === "sketch" ? "hidden" : ""}`}>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="h-11 w-full rounded-[14px] bg-white text-[14px] font-extrabold tracking-[-0.03em] text-[#7b927d] shadow-[0_8px_24px_rgba(32,50,75,0.045)]"
              aria-expanded={moreOpen}
            >
              {moreOpen ? "− 더 남기기" : "+ 더 남기기"}
            </button>

            {moreOpen && (
              <div className="mt-3 rounded-[16px] bg-white p-4 shadow-[0_8px_24px_rgba(32,50,75,0.045)]">
                <div className="text-[15px] font-extrabold tracking-[-0.03em] text-[#2e2e2e]">내 마음의 위치</div>
                <div className="mt-1 text-[13px] font-normal tracking-[-0.02em] text-[#8b8b8b]">오늘탭에서 이어진 위치예요.</div>
                <div className="relative mx-3 mb-4 mt-6 h-[3px] rounded-full bg-[#ddd9d3]">
                  <span
                    className="absolute top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b927d] shadow-[0_0_0_6px_rgba(123,146,125,0.14)] transition-all duration-300"
                    style={{ left: moodPositionLeft }}
                    aria-hidden="true"
                  />
                  {selectableFrequencyOptions.map((option) => {
                    const index = selectableFrequencyOptions.findIndex((item) => item.key === option.key);
                    const left = selectableFrequencyOptions.length > 1
                      ? `${(index / (selectableFrequencyOptions.length - 1)) * 100}%`
                      : "50%";
                    return (
                      <button
                        type="button"
                        key={option.key}
                        onClick={() => toggleFrequency(option.key)}
                        className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ left }}
                        aria-label={`${option.label} 위치 선택`}
                      >
                        <span className="sr-only">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[13px] font-bold tracking-[-0.03em] text-[#77746e]">
                  {selectableFrequencyOptions.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      onClick={() => toggleFrequency(option.key)}
                      className={`rounded-full px-0.5 transition ${
                        selectedFrequencyKey === option.key ? "text-[#7b927d]" : "text-[#77746e]"
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 rounded-[13px] bg-[#eef3ee] px-3 py-2 text-center text-[12px] font-semibold leading-5 tracking-[-0.03em] text-[#526957]">
                  {moodPositionMessage}
                </p>

                <div className="mt-4 rounded-[14px] bg-[#f8f8f8] px-3">
                  <input
                    value={customDraftMood}
                    onChange={(event) => setCustomDraftMood(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") toggleDraftMood(customDraftMood);
                    }}
                    onBlur={() => {
                      if (customDraftMood.trim()) toggleDraftMood(customDraftMood);
                    }}
                    className="h-12 w-full bg-transparent text-[15px] font-normal tracking-[-0.02em] text-[#2e2e2e] outline-none placeholder:text-[#aeb1b5]"
                    placeholder="마음 이름 붙이기 (선택)"
                  />
                </div>
                {draftMoods.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-medium text-[#7b927d]">
                    {draftMoods.map((mood) => (
                      <button type="button" key={mood} onClick={() => toggleDraftMood(mood)}>
                        #{mood}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {(lengthNotice || photoError || emptyNotice) && (
          <p className="mt-2 px-1 text-[12px] font-medium text-[#c46b49]">
            {photoError || (emptyNotice ? "마음을 먼저 적어주세요." : "조금 길어요. 300자 안쪽이 잘 읽혀요.")}
          </p>
        )}

        <div className="maeumtuk-composer-actions mt-3 flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className={`grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#81776e] shadow-[0_8px_24px_rgba(32,50,75,0.05)] transition hover:bg-[#f1ece5] ${composerMode === "sketch" ? "invisible pointer-events-none" : ""}`}
            aria-label="사진 추가"
          >
            <Image size={20} strokeWidth={1.65} />
          </button>
          <button
            type="button"
            onClick={leaveTuk}
            disabled={isLeaving}
            aria-disabled={!canLeaveTuk}
            className="h-12 rounded-full bg-[#20324b] px-9 text-[16px] font-extrabold tracking-[-0.03em] text-white shadow-[0_12px_32px_rgba(32,50,75,0.12)] transition disabled:opacity-45"
          >
            툭 남기기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col px-5 pb-10 pt-5">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="text-[16px] font-semibold tracking-[-0.04em] text-[#102747]">마음툭</span>
            <span className="flex w-[36px] items-center" aria-hidden="true">
              <span className="h-px flex-1 bg-[#d0c5b8]" />
              <span className="h-2 w-2 rounded-full bg-[#f6c400]" />
            </span>
          </div>
          <p className="text-[13px] font-medium tracking-[-0.03em] text-[#8b8b8b]">
            {currentMeta.displayDate} {currentMeta.day}
          </p>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full text-[#7f766e] transition hover:bg-[#f3ede7]"
          aria-label="알림"
        >
          <Bell size={19} strokeWidth={1.65} />
        </button>
      </header>

      <section className="mb-4">
        <h1 className="mb-4 text-[28px] font-extrabold leading-[1.22] tracking-[-0.06em] text-[#3f423f]">
          지금 스친 것은?
        </h1>
        <div className="flex items-center gap-3.5 rounded-[22px] border border-[#e9e7e2]/75 bg-[#fcfaf5]/75 px-4 py-4 shadow-[0_8px_24px_rgba(20,28,38,0.045)]">
          <div className="relative h-[58px] w-[74px] shrink-0">
            <span className="absolute right-1 top-1 h-10 w-10 rounded-full bg-[#ffc82e]/20" aria-hidden="true" />
            <img
              src="/now-hero.png"
              alt=""
              className="relative z-[1] h-full w-full select-none object-contain opacity-95 mix-blend-multiply"
              draggable="false"
            />
          </div>
          <p className="whitespace-pre-line text-[13px] font-medium leading-[1.5] tracking-[-0.03em] text-[#777]">
            <strong className="mb-1 block text-[15px] font-bold text-[#343434]">문득.</strong>
            {"말문이 막혀도 괜찮아요.\n지금 스친 것 하나면 충분해요."}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => onComposerOpenChange?.(true)}
        className="mb-5 flex w-full items-center justify-between rounded-[20px] bg-[linear-gradient(135deg,#fff8d7,#f6cf5a)] p-5 text-left shadow-[0_10px_26px_rgba(32,50,75,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(32,50,75,0.09)]"
      >
        <span>
          <span className="block text-[18px] font-bold tracking-[-0.04em] text-[#20324b]">툭 남기기</span>
          <span className="mt-1.5 block text-[13px] font-medium tracking-[-0.03em] text-[#6b6258]">
            글이나 낙서로 남겨보세요.
          </span>
        </span>
        <span className="text-[25px] leading-none text-[#6b6258]" aria-hidden="true">✎</span>
      </button>

      <section className="mb-5 rounded-[19px] border border-[rgba(0,0,0,0.025)] bg-white px-[18px] py-[18px] shadow-[0_10px_26px_rgba(32,50,75,0.07)]">
        <div className="mb-[18px] flex items-center justify-between">
          <h2 className="text-[16px] font-bold tracking-[-0.04em] text-[#383838]">오늘 내 마음의 위치</h2>
          <span className="text-[12px] font-medium tracking-[-0.03em] text-[#99958e]">작성창으로 이어져요</span>
        </div>
        <div className="relative mx-3 mb-4 mt-7 h-[3px] rounded-full bg-[#ddd9d3]">
          <span
            className="absolute top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7b927d] shadow-[0_0_0_6px_rgba(123,146,125,0.14)] transition-all duration-300"
            style={{ left: moodPositionLeft }}
            aria-hidden="true"
          />
          {selectableFrequencyOptions.map((option) => {
            const index = selectableFrequencyOptions.findIndex((item) => item.key === option.key);
            const left = selectableFrequencyOptions.length > 1
              ? `${(index / (selectableFrequencyOptions.length - 1)) * 100}%`
              : "50%";
            return (
              <button
                type="button"
                key={option.key}
                onClick={() => toggleFrequency(option.key)}
                className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left }}
                aria-label={`${option.label} 위치 선택`}
              >
                <span className="sr-only">{option.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[12px] font-bold tracking-[-0.03em] text-[#77746e]">
          {selectableFrequencyOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              onClick={() => toggleFrequency(option.key)}
              className={`rounded-full px-0.5 transition ${
                selectedFrequencyKey === option.key ? "text-[#7b927d]" : "text-[#77746e]"
              }`}
            >
              {option.label} {option.icon}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-[13px] bg-[#eef3ee] px-3 py-2 text-center text-[12px] font-semibold leading-5 tracking-[-0.03em] text-[#526957]">
          {moodPositionMessage}
        </p>
      </section>

      {sevenDayFragment && (
        <section className="mb-6 rounded-[19px] border border-dashed border-[#d8d2c9] bg-[#fcfaf5]/75 px-[18px] py-[18px]">
          <h2 className="mb-2.5 text-[14px] font-extrabold tracking-[-0.03em] text-[#5e665e]">
            ⏳ {sevenDayFragment.title === "7일 전 조각" ? "7일 전 당신이 남겨둔 조각" : "가장 먼저 남겨둔 조각"}
          </h2>
          <blockquote className="maeumtuk-now-preview m-0 whitespace-pre-line text-[16px] font-medium italic leading-[1.7] tracking-[-0.03em] text-[#606060]">
            “{sevenDayFragment.item.text}”
          </blockquote>
        </section>
      )}

      {displayTodayLogs.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between px-0.5">
            <h2 className="text-[18px] font-extrabold tracking-[-0.04em] text-[#20324b]">오늘의 툭</h2>
            <button
              type="button"
              className="text-[14px] font-medium tracking-[-0.03em] text-[#85888c]"
            >
              모두 보기 ›
            </button>
          </div>
          <div className="space-y-2.5">
            {displayTodayLogs.map((item, index) => (
              <NowFlowItem
                key={item.id || `${item.date}-${item.time}`}
                item={item}
                sequence={displayTodayLogs.length - index}
                isLatest={index === 0}
                onEdit={onEditLog}
                onDelete={onDeleteLog}
              />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}

const baseEmotionOptions = ["심난함", "복잡함", "화남", "찌질함", "떨림", "서운함", "불안", "억울함", "질투", "시기"];

function AutoTagEditor({ item, onUpdate, editing, onDone }) {
  const [nextTags, setNextTags] = useState(item.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [addingTag, setAddingTag] = useState(false);

  const addTag = () => {
    const nextTag = normalizeWord(tagInput.trim());
    if (!nextTag || nextTags.some((tag) => normalizeWord(tag) === nextTag)) return false;
    setNextTags((current) => [...current, nextTag].slice(0, 6));
    setTagInput("");
    setAddingTag(false);
    return true;
  };

  const saveTags = () => {
    onUpdate?.(item, { tags: nextTags, tagsManaged: true });
    onDone();
  };

  if (editing) {
    return (
      <div className="mt-2.5 rounded-[9px] bg-[#f4f7ef]/72 px-1 py-1.5">
        <div className="flex flex-wrap gap-1.5">
          {nextTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setNextTags((current) => current.filter((itemTag) => itemTag !== tag))}
              className="inline-flex items-center gap-1 rounded-full bg-[#e6efdc] px-2.5 py-1 text-[12px] font-medium text-[#4f6b42]"
              aria-label={`${normalizeWord(tag)} 삭제`}
            >
              {normalizeWord(tag)}
              <X size={11} strokeWidth={2} />
            </button>
          ))}
          {addingTag ? (
            <input
              autoFocus
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
                if (event.key === "Escape") {
                  setTagInput("");
                  setAddingTag(false);
                }
              }}
              onBlur={() => {
                if (!tagInput.trim()) setAddingTag(false);
              }}
              className="h-[28px] w-[104px] rounded-full border border-[#d4dfca] bg-[#fffdf9] px-2.5 text-[12px] font-medium text-[#4f6b42] outline-none placeholder:text-[#98a18f]"
              placeholder="+ 태그 추가"
            />
          ) : (
            <button
              onClick={() => setAddingTag(true)}
              className="inline-flex h-[28px] items-center gap-1 rounded-full border border-dashed border-[#c8d8ba] px-2.5 text-[12px] font-medium text-[#5f744f] hover:bg-[#eef4e8]"
            >
              <Plus size={11} strokeWidth={2} />
              태그 추가
            </button>
          )}
          <button
            onClick={saveTags}
            className="ml-auto inline-flex h-[28px] items-center gap-1 rounded-[7px] px-2 text-[12px] font-medium text-[#5f744f] hover:bg-[#e9f0df]"
          >
            <Check size={12} strokeWidth={2} />
            완료
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5">
      <div className="flex flex-wrap gap-1.5">
        {(item.tags || []).map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-full bg-[#eef4e8] px-2.5 py-1 text-[12px] font-medium text-[#526f43]">
            {normalizeWord(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecentCard({
  item,
  compact = false,
  showEnvelope = false,
  showManage = false,
  onAddDetails,
  onEdit,
  onUpdate,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tagEditing, setTagEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editImage, setEditImage] = useState(item.image);
  const editImageInputRef = useRef(null);
  const moodLabels = getMoodLabels(item);
  const frequency = getFrequencyOption(item);
  const frequencyTone = getFrequencyTone(item);
  const hasEmotion = moodLabels.length > 0;
  const noteEntries = getNoteEntries(item);
  const hasNote = noteEntries.length > 0;
  const hasAfterData = hasEmotion || hasNote;
  const moodPositionLabel = getMoodPositionLabel(item);
  const isDoodle = item.type === "doodle" || item.doodle?.type === "doodle";
  const doodlePreview = item.previewImage || item.doodle?.previewImage || "";
  const doodleCaption = String(item.caption || item.doodle?.caption || "").trim();

  const saveEdit = () => {
    const nextText = editText.trim();
    if (!nextText) return;
    onUpdate?.(item, {
      text: nextText,
      tags: item.tags || [],
      mood: item.mood || "남김",
      moods: getMoodLabels(item),
      frequencyKey: item.frequencyKey || "",
      frequency: item.frequency || "",
      image: editImage,
    });
    setEditing(false);
    setMenuOpen(false);
  };

  return (
    <article className="maeumtuk-log-card relative border-b border-[#efefef] py-0 pb-6 pl-[30px] pr-1 last:border-b-0">
      {showManage && (
        <button
          onClick={() => {
            setMenuOpen((open) => !open);
            setConfirmDelete(false);
          }}
          className="absolute right-0 top-0 z-10 grid h-8 w-8 place-items-center rounded-full text-[#aaa] transition hover:bg-[#f5f2ec]"
          aria-label="툭 관리"
        >
          <MoreHorizontal size={17} />
        </button>
      )}
      {showManage && menuOpen && (
        <div className="absolute right-1 top-9 z-20 w-[124px] rounded-[12px] border border-[#E9E6DE] bg-white p-1.5 text-[13px] shadow-[0_10px_24px_rgba(32,50,75,.10)]">
          <button
            onClick={() => {
              onEdit?.(item);
              setTagEditing(false);
              setMenuOpen(false);
              setConfirmDelete(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
          >
            기록 수정
          </button>
          {/* Tag management is paused while auto tags are hidden from Tuklog. */}
          {/* <button
            onClick={() => {
              setTagEditing(true);
              setEditing(false);
              setMenuOpen(false);
              setConfirmDelete(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
          >
            태그 관리
          </button> */}
          <button
            onClick={() => {
              setConfirmDelete(true);
              setTagEditing(false);
              setMenuOpen(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#b65b43] hover:bg-[#fff1ea]"
          >
            삭제
          </button>
        </div>
      )}
      <div className="font-['Pretendard']">
        <div className="mb-[10px] flex items-center gap-1.5 pr-10 text-[13px] font-bold tracking-[-0.02em] text-[#8B8B8B]">
          <span
            className="absolute left-1 top-[7px] h-[9px] w-[9px] rounded-full shadow-[0_0_0_5px_rgba(123,146,125,0.12)]"
            style={{ background: getLogDotColor(item) }}
          />
          <span>{item.time}</span>
          {isDoodle && <span aria-hidden="true">·</span>}
          {isDoodle && <span>낙서툭</span>}
          {moodPositionLabel && <span aria-hidden="true">·</span>}
          {moodPositionLabel && <span>{moodPositionLabel}</span>}
        </div>
        <div>
          {editing ? (
            <div>
              <input
                ref={editImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  readImageFile(event.target.files?.[0], setEditImage);
                  event.target.value = "";
                }}
              />
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="maeumtuk-reading-text h-[112px] w-full resize-none rounded-[10px] border border-[#e7ded2] bg-[#fffaf4] p-3 text-[#211c17] outline-none"
              />
              <div className="mt-3 border-t border-[#f0e8df] pt-3">
                {editImage ? (
                  <div className="flex items-center gap-3">
                    <MiniPhoto bg={editImage} />
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => editImageInputRef.current?.click()}
                        className="h-10 rounded-[8px] border border-[#e7ded2] bg-[#fffdf9] px-3 text-[12px] font-medium text-[#5d554d]"
                      >
                        사진 바꾸기
                      </button>
                      <button onClick={() => setEditImage(null)} className="h-10 rounded-[8px] px-3 text-left text-[12px] font-medium text-[#b65b43]">
                        사진 지우기
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => editImageInputRef.current?.click()}
                    className="flex h-10 items-center gap-1.5 rounded-[9px] border border-[#e7ded2] bg-[#fffdf9] px-3 text-[12px] font-medium text-[#5d554d]"
                  >
                    <Image size={15} strokeWidth={1.8} />
                    사진 추가
                  </button>
                )}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditText(item.text);
                    setEditImage(item.image);
                    setEditing(false);
                  }}
                  className="h-10 rounded-[8px] px-3 text-[12px] font-medium text-[#746d65] hover:bg-[#f5eee7]"
                >
                  취소
                </button>
                <button onClick={saveEdit} className="h-10 rounded-[8px] bg-[#4f6f3d] px-3 text-[12px] font-semibold text-white">
                  저장
                </button>
              </div>
            </div>
          ) : isDoodle ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-[16px] border border-[#ece7de] bg-[#fcfaf5]">
                {doodlePreview ? (
                  <img src={doodlePreview} alt="낙서툭 미리보기" className="h-[120px] w-full object-contain" />
                ) : (
                  <div className="grid h-[120px] place-items-center text-[13px] font-medium text-[#8B8B8B]">낙서 미리보기</div>
                )}
              </div>
              {doodleCaption && (
                <p className="maeumtuk-reading-text text-[#2E2E2E]">
                  {doodleCaption}
                </p>
              )}
            </div>
          ) : (
            <p className="maeumtuk-reading-text text-[#242424]">{item.text}</p>
          )}
          {confirmDelete && (
            <div className="mt-3 rounded-[10px] bg-[#fff5ee] p-3 text-[13px] text-[#4a3d34]">
              <p className="mb-2">이 툭을 지울까요?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(false)} className="h-10 rounded-[8px] px-3 text-[12px] font-medium text-[#746d65]">
                  취소
                </button>
                <button onClick={() => onDelete?.(item)} className="h-10 rounded-[8px] bg-[#b65b43] px-3 text-[12px] font-semibold text-white">
                  지우기
                </button>
              </div>
            </div>
          )}
          {/* Tuklog tag display/editor is paused for now. */}
          {/* {!editing && !confirmDelete && showManage && tagEditing && (
            <AutoTagEditor
              key={`${getLogKey(item)}-${tagEditing}`}
              item={item}
              onUpdate={onUpdate}
              editing={tagEditing}
              onDone={() => setTagEditing(false)}
            />
          )} */}
        {!compact && !editing && !isDoodle && item.image && (
          <div className="mt-3">
            <MiniPhoto bg={item.image} />
          </div>
        )}
        {!editing && !confirmDelete && (hasAfterData || showEnvelope) && (
          <div className="mt-[13px] space-y-3">
            <div className="flex min-h-7 items-center justify-between gap-3">
              {hasEmotion && (
                <div className="flex flex-wrap gap-1.5">
                  {moodLabels.map((mood) => (
                    <span
                      key={mood}
                      className="inline-flex shrink-0 rounded-full border border-[#E9E6DE] bg-[rgba(252,250,245,.75)] px-[11px] py-[7px] text-[12px] font-medium text-[#777]"
                    >
                      🏷 {mood}
                    </span>
                  ))}
                </div>
              )}
              {showEnvelope && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onAddDetails?.(item);
                  }}
                  className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-[#20324B] transition duration-200 hover:bg-[#f5f2ec] active:scale-[0.98]"
                  aria-label="이 기록에 마음이나 생각 더하기"
                >
                  <span>오늘 다시 적어보기 →</span>
                </button>
              )}
            </div>
            {hasNote && (
              <div className="space-y-1.5 border-l border-[#d3c7ba] pl-3">
                {noteEntries.map((note, index) => (
                  <div key={`${note}-${index}`} className="rounded-[10px] border border-[#e8ded4] bg-[#f8f3ee] px-3 py-2.5 text-[13px] leading-6 text-[#4c4036]">
                    <span className="mb-1 block text-[11px] font-semibold text-[#9a8f84]">이어쓰기 {index + 1}</span>
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </article>
  );
}

function EnvelopeInteraction({ note, onChange }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(Boolean(note));
  const [message, setMessage] = useState(note || "");
  const [editMessage, setEditMessage] = useState(note || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setSent(Boolean(note));
    setMessage(note || "");
    setEditMessage(note || "");
  }, [note]);

  const sendMessage = () => {
    const nextMessage = message.trim();
    if (!nextMessage) return;
    setMessage(nextMessage);
    setEditMessage(nextMessage);
    setSent(true);
    setOpen(false);
    onChange?.(nextMessage);
  };

  const saveEdit = () => {
    const nextMessage = editMessage.trim();
    if (!nextMessage) return;
    setMessage(nextMessage);
    setEditing(false);
    setMenuOpen(false);
    onChange?.(nextMessage);
  };

  const deleteMessage = () => {
    setMessage("");
    setEditMessage("");
    setSent(false);
    setOpen(false);
    setEditing(false);
    setConfirmDelete(false);
    setMenuOpen(false);
    onChange?.("");
  };

  return (
    <div className="mt-2.5">
      {!open && !sent && (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex h-8 items-center gap-1 rounded-[8px] px-2.5 text-[12px] font-medium text-[#81786f] hover:bg-[#f5eee7]"
        >
          <ChevronDown size={13} strokeWidth={1.9} />
          툭 하나 더
        </button>
      )}
      {open && !sent && (
        <div className="rounded-[10px] border border-[#dfe8d5] bg-[#fbfcf7] px-3 py-2.5">
          <div className="mb-1 flex items-center">
            <button onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5f744f]">
              <ChevronUp size={13} strokeWidth={1.9} />
              툭 하나 더
            </button>
          </div>
          <p className="mb-1.5 text-[12px] font-medium text-[#8b8279]">그때와 지금은 어떤가요?</p>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="h-7 max-h-[74px] w-full resize-none overflow-y-auto bg-transparent text-[13px] leading-7 text-[#2a2e24] outline-none placeholder:text-[#9ca494] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            placeholder="짧게 덧붙여요."
          />
          <div className="mt-1.5 flex justify-end">
            <button
              onClick={sendMessage}
              className="rounded-[8px] border border-[rgba(79,111,61,0.14)] bg-[rgba(79,111,61,0.09)] px-2.5 py-1 text-[12px] font-semibold text-[#4f6f3d] hover:bg-[rgba(79,111,61,0.14)]"
            >
              남기기
            </button>
          </div>
        </div>
      )}
      {sent && !open && (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex h-8 items-center gap-1 rounded-[8px] px-2.5 text-[12px] font-semibold text-[#5f744f] hover:bg-[#eef4e8]"
        >
          <ChevronDown size={13} strokeWidth={1.9} />
          🌱 이어진 생각 1개
        </button>
      )}
      {sent && open && (
        <div className="relative rounded-[10px] bg-[#f8fbf2] px-3 py-2.5 text-[13px] leading-6 text-[#3f4638]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <button onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5f7f46]">
              <ChevronUp size={13} strokeWidth={1.9} />
              🌱 이어진 생각 1개
            </button>
            {!editing && !confirmDelete && (
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="grid h-9 w-9 place-items-center rounded-[9px] text-[#707f66] hover:bg-[#eef4e8]"
                aria-label="이어진 생각 관리"
              >
                <MoreHorizontal size={16} />
              </button>
            )}
          </div>
          {menuOpen && (
            <div className="absolute right-3 top-10 z-20 w-[112px] rounded-[10px] border border-[#f0dccf] bg-[#fffdf9] p-1.5 text-[13px] shadow-[0_10px_24px_rgba(54,42,30,.08)]">
              <button
                onClick={() => {
                  setEditMessage(message || note || "");
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
              >
                수정
              </button>
              <button
                onClick={() => {
                  setConfirmDelete(true);
                  setMenuOpen(false);
                }}
                className="block w-full rounded-[8px] px-3 py-2 text-left text-[#b65b43] hover:bg-[#fff1ea]"
              >
                삭제
              </button>
            </div>
          )}
          {editing ? (
            <div>
              <textarea
                value={editMessage}
                onChange={(event) => setEditMessage(event.target.value)}
                className="h-[86px] w-full resize-none rounded-[9px] border border-[#e7ded2] bg-[#fffaf4] p-3 text-[13px] leading-6 text-[#2a2521] outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditMessage(message);
                    setEditing(false);
                  }}
                  className="h-10 rounded-[8px] px-3 text-[12px] font-medium text-[#746d65]"
                >
                  취소
                </button>
                <button onClick={saveEdit} className="h-10 rounded-[8px] bg-[#4f6f3d] px-3 text-[12px] font-semibold text-white">
                  저장
                </button>
              </div>
            </div>
          ) : confirmDelete ? (
            <div>
              <p className="mb-2">이 덧붙임을 지울까요?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(false)} className="h-10 rounded-[8px] px-3 text-[12px] font-medium text-[#746d65]">
                  취소
                </button>
                <button onClick={deleteMessage} className="h-10 rounded-[8px] bg-[#b65b43] px-3 text-[12px] font-semibold text-white">
                  지우기
                </button>
              </div>
            </div>
          ) : (
            <p>{message || note || "조금 지나서 떠오른 생각을 덧붙여도 좋아요."}</p>
          )}
        </div>
      )}
    </div>
  );
}

function LogTab({ logItems, initialSearchQuery = "", onAddDetails, onEditLog, onUpdateLog, onDeleteLog }) {
  const [visibleCount, setVisibleCount] = useState(LOG_PAGE_SIZE);
  const [selectedTag, setSelectedTag] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [pendingMonth, setPendingMonth] = useState("");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const searchInputRef = useRef(null);
  const monthSectionRefs = useRef(new Map());
  const hasLogs = logItems.length > 0;
  // Tuklog tag filters are paused for now.
  // const tagCounts = logItems.reduce((counts, item) => {
  //   (item.tags || []).forEach((tag) => {
  //     const word = normalizeWord(tag);
  //     counts[word] = (counts[word] || 0) + 1;
  //   });
  //   return counts;
  // }, {});
  // const frequentTags = Object.entries(tagCounts)
  //   .sort((a, b) => b[1] - a[1])
  //   .slice(0, 6)
  //   .map(([tag]) => tag);
  // const recentTags = [...new Set(logItems.flatMap((item) => (item.tags || []).map(normalizeWord)))].slice(0, 6);
  // const filterTags = [...new Set([...frequentTags, ...recentTags])].slice(0, 5);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ko-KR");
  const filteredLogs = normalizedQuery
    ? logItems.filter((item) => {
        const searchableText = [item.text, item.caption, item.doodle?.caption, item.note, ...(item.notes || []), item.mood, ...(item.moods || []), item.frequency, item.date, item.day, item.time, ...(item.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("ko-KR");
        return searchableText.includes(normalizedQuery);
      })
    : logItems;
  const visibleLogs = filteredLogs.slice(0, visibleCount);
  const hasMoreLogs = visibleCount < filteredLogs.length;
  const monthOptions = filteredLogs.reduce((months, item) => {
    const month = getLogMonthMeta(item);
    const existing = months.find((entry) => entry.key === month.key);
    if (existing) existing.count += 1;
    else months.push({ ...month, count: 1 });
    return months;
  }, []);
  const activeMonth = monthOptions.some((month) => month.key === selectedMonth) ? selectedMonth : monthOptions[0]?.key || "";
  const activeMonthLabel = monthOptions.find((month) => month.key === activeMonth)?.label || "기록 월 선택";
  // const resultLabel = selectedTag ? `${selectedTag}와 함께한 순간 ${filteredLogs.length}개` : `전체 툭 ${filteredLogs.length}개`;
  const groupedLogs = visibleLogs.reduce((groups, item) => {
    const key = `${item.date}-${item.day}`;
    const existing = groups.find((group) => group.key === key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ key, date: item.date, day: item.day, items: [item] });
    }

    return groups;
  }, []);
  const monthGroups = groupedLogs.reduce((months, dayGroup) => {
    const month = getLogMonthMeta(dayGroup.items[0]);
    const existing = months.find((entry) => entry.key === month.key);

    if (existing) {
      existing.days.push(dayGroup);
    } else {
      months.push({ ...month, days: [dayGroup] });
    }

    return months;
  }, []);
  const latestVisibleLogKey = visibleLogs[0] ? getLogKey(visibleLogs[0]) : "";

  const moveToMonth = (monthKey) => {
    setSelectedMonth(monthKey);
    setMonthPickerOpen(false);
    const targetIndex = filteredLogs.findIndex((item) => getLogMonthMeta(item).key === monthKey);
    if (targetIndex < 0) return;

    setVisibleCount((count) => Math.max(count, targetIndex + LOG_PAGE_SIZE));
    setPendingMonth(monthKey);
  };

  useEffect(() => {
    setVisibleCount(LOG_PAGE_SIZE);
  }, [searchQuery]);

  useEffect(() => {
    const nextQuery = initialSearchQuery.trim();
    if (!nextQuery) return;
    setSearchQuery(nextQuery);
    setSearchOpen(true);
    setVisibleCount(LOG_PAGE_SIZE);
  }, [initialSearchQuery]);

  useEffect(() => {
    if (!searchOpen) return;
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [searchOpen]);

  useEffect(() => {
    if (!pendingMonth) return;
    const frame = window.requestAnimationFrame(() => {
      const section = monthSectionRefs.current.get(pendingMonth);
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingMonth("");
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingMonth, visibleCount]);

  useEffect(() => {
    if (!monthPickerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event) => {
      if (event.key === "Escape") setMonthPickerOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [monthPickerOpen]);

  return (
    <>
      <main className="px-5 pt-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-end gap-3">
              <h1 className="font-['Pretendard'] text-[24px] font-bold tracking-[-0.045em] text-[#20324B]">툭로그</h1>
              <span className="relative mb-0.5 block h-[34px] w-[58px] overflow-hidden" aria-hidden="true">
                <img
                  src="/now-hero.png"
                  alt=""
                  className="-ml-[14px] h-[34px] w-[82px] max-w-none object-contain object-left opacity-82 mix-blend-multiply"
                  draggable="false"
                />
              </span>
            </div>
            <p className="mt-2 text-[14px] font-medium tracking-[-0.03em] text-[#777]">마음을 지나간 순간들</p>
          </div>
          <button
            onClick={() => {
              if (searchOpen) setSearchQuery("");
              setSearchOpen((open) => !open);
            }}
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-[9px] transition ${
              searchOpen ? "bg-[#f1ebe5] text-[#514940]" : "text-[#766f68] hover:bg-[#f3eee8]"
            }`}
            aria-label={searchOpen ? "검색 닫기" : "툭로그 검색"}
          >
            {searchOpen ? <X size={17} strokeWidth={1.9} /> : <Search size={17} strokeWidth={1.9} />}
          </button>
        </div>
        {searchOpen && (
          <section className="mb-4">
            <div className="flex h-11 items-center gap-2 rounded-[11px] border border-[#e5dbd0] bg-[#fffdf9] px-3 shadow-[0_4px_12px_rgba(54,42,30,.025)]">
              <Search size={16} strokeWidth={1.8} className="shrink-0 text-[#8a8178]" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent font-['Pretendard'] text-[14px] font-medium text-[#302a25] outline-none placeholder:text-[#aaa198]"
                placeholder="기록 속 단어를 찾아보세요"
                aria-label="툭로그 검색어"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#91887f] hover:bg-[#f3ece5]"
                  aria-label="검색어 지우기"
                >
                  <X size={14} strokeWidth={1.9} />
                </button>
              )}
            </div>
            {normalizedQuery && <p className="mt-2 px-1 text-[12px] font-medium text-[#91887f]">{filteredLogs.length}개의 툭을 찾았어요.</p>}
          </section>
        )}
        {monthOptions.length > 0 && (
          <div className="mb-[22px] flex justify-end">
            <button
              type="button"
              onClick={() => setMonthPickerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E9E6DE] bg-[#FCFAF5] px-4 py-3 text-[#20324B] shadow-[0_6px_18px_rgba(32,50,75,.04)] transition duration-200 hover:bg-white active:scale-[0.99]"
              aria-label="기록 월 펼치기"
            >
              <BookOpen size={15} strokeWidth={1.8} aria-hidden="true" />
              <span className="font-['Pretendard'] text-[15px] font-extrabold tracking-[-0.02em]">{activeMonthLabel}</span>
              <ChevronDown size={14} strokeWidth={1.9} className="text-[#999]" />
            </button>
          </div>
        )}
        {/* Tuklog tag filter chips are paused while auto tags are disabled. */}
        {/* <section className="mb-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => {
                setSelectedTag("");
                setVisibleCount(LOG_PAGE_SIZE);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                selectedTag === "" ? "bg-[#5f7f46] text-white" : "border border-[#dfe8d3] bg-[#f1f5ec] text-[#68775f]"
              }`}
            >
              전체
            </button>
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTag(tag);
                  setVisibleCount(LOG_PAGE_SIZE);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ${
                  selectedTag === tag
                    ? "bg-[#5f7f46] text-[#fffdf9]"
                    : "border border-[#dfe8d3] bg-[#f1f5ec] text-[#68775f]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {hasLogs && <p className="mt-2 px-1 text-[12px] font-medium text-[#9a9188]">{resultLabel}</p>}
        </section> */}
        {hasLogs ? (
          filteredLogs.length > 0 ? (
          <div className="space-y-8">
            {monthGroups.map((month) => (
              <section
                key={month.key}
                ref={(node) => {
                  if (node) monthSectionRefs.current.set(month.key, node);
                  else monthSectionRefs.current.delete(month.key);
                }}
                className="scroll-mt-5"
              >
                {month.key !== activeMonth && (
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="shrink-0 font-['Pretendard'] text-[17px] font-semibold tracking-[-0.02em] text-[#332c26]">{month.label}</h2>
                    <span className="h-px flex-1 bg-[#e9dfd5]" />
                  </div>
                )}
                <div className="space-y-[34px]">
                  {month.days.map((group) => (
                    <section key={group.key}>
                      <div className="mb-[18px] flex items-center justify-between gap-3 border-b border-[#E9E6DE] px-0.5 pb-3">
                        <span className="h-[22px] w-1.5 translate-y-1 rounded-full bg-[#7B927D]" aria-hidden="true" />
                        <div className="flex min-w-0 flex-1 items-baseline gap-2">
                          <span className="font-['Pretendard'] text-[20px] font-extrabold tracking-[-0.04em] text-[#20324B]">{group.date}</span>
                          <span className="text-[13px] font-semibold text-[#888]">{group.day}</span>
                        </div>
                        <span className="ml-auto text-[13px] font-extrabold text-[#8c8c8c]">{group.items.length}툭</span>
                      </div>
                      <div className="space-y-[22px]">
                        {group.items.map((item) => (
                          <RecentCard
                            key={getLogKey(item)}
                            item={item}
                            showEnvelope={getLogKey(item) === latestVisibleLogKey}
                            showManage
                            onAddDetails={onAddDetails}
                            onEdit={onEditLog}
                            onUpdate={onUpdateLog}
                            onDelete={onDeleteLog}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ))}
            {hasMoreLogs && (
              <button
                onClick={() => setVisibleCount((count) => count + LOG_PAGE_SIZE)}
                className="mx-auto block h-11 rounded-[10px] border border-[#e7ded2] bg-[#fffdf9] px-4 text-[13px] font-medium text-[#5d554d] shadow-[0_6px_16px_rgba(54,42,30,.025)] hover:bg-[#f8f4ef]"
              >
                이전 툭 더 보기
              </button>
            )}
          </div>
          ) : (
            <EmptyState
              title={normalizedQuery ? `“${searchQuery.trim()}”이 담긴 툭을 찾지 못했어요.` : `${selectedTag}이 남은 툭은 아직 없어요.`}
              body={normalizedQuery ? "다른 단어로 다시 찾아보세요." : "다른 태그를 골라보거나 전체 기록으로 돌아가보세요."}
            />
          )
        ) : (
          <EmptyState title="아직 남긴 툭이 없어요." body="문득 떠오른 말이나 장면을 지금 탭에서 짧게 남겨보세요." />
        )}
      </main>
      {monthPickerOpen && createPortal(
        <div
          className="fixed inset-0 z-[9998] flex items-end justify-center bg-[#2b241f]/34 backdrop-blur-[1px]"
          onClick={() => setMonthPickerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="월별 기록 펼치기"
        >
          <section
            className="w-full max-w-[430px] rounded-t-[20px] bg-[#fffdf9] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_44px_rgba(44,34,26,.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[#d8d0c8]" />
            <div className="mb-4 flex items-center gap-3 px-1">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2eee7] text-[#6e7762]">
                <BookOpen size={19} strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="font-['Pretendard'] text-[17px] font-semibold tracking-[-0.02em] text-[#2b251f]">기록이 있는 달</h2>
                <p className="mt-0.5 text-[12px] font-medium text-[#91887f]">펼쳐볼 달을 골라보세요.</p>
              </div>
            </div>
            <div className="max-h-[min(52vh,420px)] overflow-y-auto rounded-[12px] border border-[#eee5dc] bg-[#fffaf6] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {monthOptions.map((month) => {
                const selected = month.key === activeMonth;
                return (
                  <button
                    key={month.key}
                    type="button"
                    onClick={() => moveToMonth(month.key)}
                    className={`flex min-h-12 w-full items-center justify-between rounded-[9px] px-3.5 py-2.5 text-left transition ${
                      selected ? "bg-[#eef3e9]" : "hover:bg-[#f5efe9]"
                    }`}
                  >
                    <span className={`text-[14px] font-semibold ${selected ? "text-[#526d45]" : "text-[#443d36]"}`}>{month.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#9a9188]">{month.count}툭</span>
                      <span className={`grid h-6 w-6 place-items-center ${selected ? "text-[#688355]" : "text-transparent"}`}>
                        <Check size={15} strokeWidth={2} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

function Chip({ children }) {
  return <span className="rounded-full bg-[#f3eee8] px-3 py-1.5 text-[13px] font-medium text-[#3d3731]">{children}</span>;
}

function TodayCard({ title, children }) {
  return (
    <section className="rounded-[13px] border border-[#eee6dc] bg-[#fffdf9] p-4 shadow-[0_7px_18px_rgba(54,42,30,.03)]">
      <div className="mb-3">
        <b className="font-['Pretendard'] text-[15px] font-semibold tracking-[-0.02em] text-[#2b251f]">{title}</b>
      </div>
      {children}
    </section>
  );
}

function WeeklyReflectionCard({ reflection }) {
  return (
    <section className="rounded-[13px] border border-[#eadfd4] bg-[#fffaf5] px-4 py-4 shadow-[0_7px_18px_rgba(54,42,30,.025)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <b className="font-['Pretendard'] text-[16px] font-semibold tracking-[-0.02em] text-[#2b251f]">이번 주를 돌아보면</b>
        <span className="shrink-0 text-[11px] font-medium text-[#a18f82]">AI가 읽고 정리했어요</span>
      </div>
      <p className="whitespace-pre-line text-[14px] font-medium leading-7 tracking-[-0.01em] text-[#4a4038]">
        {reflection}
      </p>
    </section>
  );
}

function getCreatedLogDate(item) {
  if (item.createdAt) {
    const created = new Date(item.createdAt);
    if (!Number.isNaN(created.getTime())) return created;
  }

  return parseLogDate(item);
}

function getRecentSevenDayLogs(logItems) {
  const now = new Date();
  const recentFrom = now.getTime() - 1000 * 60 * 60 * 24 * 7;

  return logItems
    .map((item) => ({ item, createdDate: getCreatedLogDate(item) }))
    .filter(({ createdDate }) => createdDate && createdDate.getTime() >= recentFrom && createdDate.getTime() <= now.getTime())
    .sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
}

function getTimeBucketLabel(date) {
  const hour = date.getHours();
  if (hour < 6) return { key: "dawn", icon: "🌘", label: "새벽 0~6시에 자주 남겼어요." };
  if (hour < 12) return { key: "morning", icon: "☀️", label: "오전 6~12시에 자주 남겼어요." };
  if (hour < 18) return { key: "afternoon", icon: "🌤️", label: "오후 12~6시에 자주 남겼어요." };
  if (hour < 22) return { key: "evening", icon: "🌆", label: "저녁 6~10시에 자주 남겼어요." };
  return { key: "night", icon: "🌙", label: "밤 10~12시에 자주 남겼어요." };
}

function getFrequentTimeBucket(recentLogs) {
  const counts = new Map();

  recentLogs.forEach(({ createdDate }) => {
    const bucket = getTimeBucketLabel(createdDate);
    const current = counts.get(bucket.key) || { ...bucket, count: 0 };
    current.count += 1;
    counts.set(bucket.key, current);
  });

  return [...counts.values()].sort((a, b) => b.count - a.count)[0] || null;
}

function getFrequentTopics(recentLogs) {
  const counts = new Map();
  const weakTopicWords = new Set([
    ...personalTagStopWords,
    "테스트",
    "테스트입니다",
    "입니다",
    "있어요",
    "없어요",
    "했다",
    "하면",
    "해서",
    "하는",
    "하고",
    "된다",
    "안돼",
    "아니",
    "남김",
    "진짜",
    "너무",
    "어떤",
    "그냥",
    "오늘",
    "요즘",
    "걸까",
    "마라",
    "괴롭히지",
    "으아",
  ]);

  recentLogs.forEach(({ item }) => {
    const words = [
      ...extractCandidateWords(item.text || ""),
      ...extractCandidateWords(item.caption || ""),
      ...extractCandidateWords(item.doodle?.caption || ""),
      ...(item.tags || []).map(normalizeWord),
      ...getMoodLabels(item),
    ]
      .map(stripKoreanParticle)
      .map((word) => word.replace(/[.!,?…]+$/g, ""))
      .filter((word) => word.length >= 2)
      .filter((word) => !/(하지|하지마|하지마라|마라|했다|한다)$/.test(word))
      .filter((word) => !personalTagStopWords.has(word))
      .filter((word) => !/^\d+$/.test(word))
      .filter((word) => !/[ㅋㅎㅠㅜㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅌㅍ]{2,}/.test(word))
      .filter((word) => !weakTopicWords.has(word))
      .filter((word) => !categoryTagLabels.has(word));

    new Set(words).forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko-KR"))
    .map(([word, count]) => ({ word, count }))
    .slice(0, 3);
}

function TodayStatLine({ label, children, subtle = false }) {
  return (
    <section className="border-t border-[#e8dece] py-5">
      {label && <p className="mb-3 text-[13px] font-semibold tracking-[-0.02em] text-[#6b6257]">{label}</p>}
      <div className={`font-['Pretendard'] tracking-[-0.035em] text-[#20201e] ${subtle ? "text-[15px] font-medium leading-6" : "text-[17px] font-semibold leading-7"}`}>
        {children}
      </div>
    </section>
  );
}

function TodayTopicList({ topics, onTopicSelect }) {
  return (
    <section className="rounded-[20px] border border-[#E9E6DE] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(32,50,75,.07)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <strong className="text-[16px] font-semibold tracking-[-0.03em] text-[#383838]">자주 떠오른 것</strong>
        <span className="text-[12px] font-medium text-[#999]">최근 7일</span>
      </div>
      {topics.length > 0 ? (
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {topics.slice(0, 3).map((topic) => (
            <button
              type="button"
              key={topic.word}
              onClick={() => onTopicSelect?.(topic.word)}
              className="group inline-flex items-baseline text-left transition active:scale-[0.99]"
            >
              <span className="text-[22px] font-black leading-[1.2] tracking-[-0.055em] text-[#222] group-hover:text-[#20324B]">
                {topic.word}
              </span>
              <small className="ml-1 text-[15px] font-extrabold tracking-[-0.02em] text-[#8c8c8c]">{topic.count}툭</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[15px] font-medium leading-6 tracking-[-0.03em] text-[#8a8177]">아직 자주 보이는 단어가 많지 않아요.</p>
      )}
    </section>
  );
}

const todayTopicColors = ["#7B927D", "#F6CF5A", "#9BB8CF"];

function getRecentCalendarDays(recentLogs, topics) {
  const today = getOperationalDate();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: formatOperationalKey(date),
      day: date.getDate(),
      dots: [],
    };
  });

  const logsByDay = recentLogs.reduce((map, entry) => {
    const key = formatOperationalKey(entry.createdDate);
    const list = map.get(key) || [];
    list.push(entry.item);
    map.set(key, list);
    return map;
  }, new Map());

  return days.map((day) => {
    const dayItems = logsByDay.get(day.key) || [];
    const haystack = dayItems
      .map((item) => [item.text, item.caption, item.doodle?.caption, ...(item.tags || []), ...getMoodLabels(item)].filter(Boolean).join(" "))
      .join(" ");

    return {
      ...day,
      dots: topics
        .map((topic, index) => (haystack.includes(topic.word) ? { word: topic.word, color: todayTopicColors[index] } : null))
        .filter(Boolean),
    };
  });
}

function getMoodFlowItems(recentLogs) {
  return [...recentLogs]
    .reverse()
    .map(({ item }) => getMoodPositionLabel(item).trim().split(" ")[0])
    .filter(Boolean)
    .slice(-5);
}

function getWeekPiece(recentLogs, logItems) {
  const source = (recentLogs.length > 0 ? recentLogs.map(({ item }) => item) : logItems).filter(Boolean);
  if (source.length === 0) return null;

  const score = (item) => {
    const text = [item.text, item.caption, item.doodle?.caption].filter(Boolean).join(" ");
    const moodScore = getMoodLabels(item).length > 0 ? 100000 : 0;
    const openedScore = item.openedAt || item.viewedAt || item.lastOpenedAt ? 50000 : 0;
    return moodScore + openedScore + text.length;
  };

  return [...source].sort((a, b) => score(b) - score(a) || getCreatedLogDate(b) - getCreatedLogDate(a))[0];
}

function getWeekPieceText(item) {
  if (!item) return "";
  const text = String(item.caption || item.doodle?.caption || item.text || "").trim();
  if (!text && (item.type === "doodle" || item.doodle?.type === "doodle")) return "말보다 먼저 남은 선이 있어요.";
  return text.length > 86 ? `${text.slice(0, 86)}...` : text;
}

function TodayTab({ logItems, onTopicSelect }) {
  const recentLogs = getRecentSevenDayLogs(logItems);
  const recentCount = recentLogs.length;
  const frequentTime = getFrequentTimeBucket(recentLogs);
  const frequentTopics = getFrequentTopics(recentLogs);
  const calendarDays = getRecentCalendarDays(recentLogs, frequentTopics);
  const moodFlowItems = getMoodFlowItems(recentLogs);
  const weekPiece = getWeekPiece(recentLogs, logItems);
  const weekPieceText = getWeekPieceText(weekPiece);
  const weekPiecePreview = weekPiece?.previewImage || weekPiece?.doodle?.previewImage || "";
  const weekPieceImage = weekPiece?.image || "";
  const hasAnyLogs = logItems.length > 0;

  return (
    <main className="px-[22px] pb-10 pt-6 font-['Pretendard']">
      <header className="mb-6">
        <h1 className="font-['Pretendard'] text-[34px] font-bold leading-[1.15] tracking-[-0.065em] text-[#20324B]">요즘</h1>
        <p className="mt-2 text-[15px] font-medium leading-[1.55] tracking-[-0.03em] text-[#777]">
          최근 7일,<br />
          마음이 자주 머문 곳.
        </p>
      </header>

      {!hasAnyLogs ? (
        <section className="rounded-[24px] border border-[#E9E6DE] bg-[#FCFAF5] px-5 py-8 text-center shadow-[0_10px_26px_rgba(32,50,75,.07)]">
          <p className="whitespace-pre-line text-[18px] font-semibold leading-[1.55] tracking-[-0.04em] text-[#20324B]">
            아직 요즘을 보여줄 만큼{"\n"}남겨진 툭이 없어요.
          </p>
          <button type="button" className="mt-5 rounded-full bg-[#20324B] px-5 py-3 text-[14px] font-bold text-white">
            첫 툭 남기기
          </button>
        </section>
      ) : (
        <div className="space-y-5">
          {recentCount < 3 && (
            <section className="rounded-[18px] border border-[#E9E6DE] bg-[#FCFAF5] px-4 py-4 text-[14px] font-medium leading-6 tracking-[-0.03em] text-[#777]">
              아직 최근 7일의 흐름은 옅어요. 남겨진 조각부터 천천히 보여드릴게요.
            </section>
          )}

          <TodayTopicList topics={frequentTopics} onTopicSelect={onTopicSelect} />

          {frequentTopics.length > 0 && (
            <section className="rounded-[20px] border border-[#E9E6DE] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(32,50,75,.07)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <strong className="text-[16px] font-semibold tracking-[-0.03em] text-[#383838]">마음 캘린더</strong>
                <span className="text-[12px] font-medium text-[#999]">단어가 남긴 흔적</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {frequentTopics.map((topic, index) => (
                  <span key={topic.word} className="inline-flex items-center gap-1 rounded-full border border-[#eee] bg-[#fafafa] px-2.5 py-1.5 text-[13px] font-medium text-[#6c6c6c]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: todayTopicColors[index] }} />
                    {topic.word}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => (
                  <div key={day.key} className="flex h-10 flex-col items-center justify-center rounded-[10px] bg-[#FAFAFA] text-[11px] font-medium text-[#777]">
                    <b className="text-[12px] font-extrabold text-[#343434]">{day.day}</b>
                    <span className="mt-[3px] flex min-h-[5px] gap-0.5">
                      {day.dots.map((dot) => (
                        <i key={dot.word} className="block h-[5px] w-[5px] rounded-full" style={{ backgroundColor: dot.color }} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-[20px] border border-[#E9E6DE] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(32,50,75,.07)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <strong className="text-[16px] font-semibold tracking-[-0.03em] text-[#383838]">이번 주</strong>
              <span className="text-[12px] font-medium text-[#999]">가볍게만</span>
            </div>
            <p className="text-[17px] font-medium leading-[1.55] tracking-[-0.035em] text-[#555]">
              {recentCount > 0 ? `${recentCount}번 툭했어요.` : "최근 7일에 남겨진 툭은 아직 없어요."}
            </p>
            {frequentTime && (
              <p className="mt-3 flex items-start gap-3 text-[17px] font-semibold leading-[1.5] tracking-[-0.035em] text-[#555]">
                <span className="text-[21px]" aria-hidden="true">
                  {frequentTime.icon}
                </span>
                <span>{frequentTime.label}</span>
              </p>
            )}
          </section>

          {moodFlowItems.length > 0 && (
            <section className="rounded-[20px] border border-[#E9E6DE] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(32,50,75,.07)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <strong className="text-[16px] font-semibold tracking-[-0.03em] text-[#383838]">내 마음의 흐름</strong>
                <span className="text-[12px] font-medium text-[#999]">최근 위치</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[22px]">
                {moodFlowItems.map((icon, index) => (
                  <Fragment key={`${icon}-${index}`}>
                    <span>{icon}</span>
                    {index < moodFlowItems.length - 1 && <span className="h-0.5 flex-1 rounded-full bg-[#ddd]" aria-hidden="true" />}
                  </Fragment>
                ))}
              </div>
            </section>
          )}

          {weekPiece && (
            <section className="rounded-[20px] border border-[#E9E6DE] bg-white px-5 py-5 shadow-[0_10px_26px_rgba(32,50,75,.07)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <strong className="text-[16px] font-semibold tracking-[-0.03em] text-[#383838]">이번 주의 조각</strong>
                <span className="text-[12px] font-medium text-[#999]">다시 보기</span>
              </div>
              <div className="flex gap-3">
                {(weekPiecePreview || weekPieceImage) && (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border border-[#E9E6DE] bg-[#FCFAF5]">
                    {weekPiecePreview ? (
                      <img src={weekPiecePreview} alt="낙서툭 미리보기" className="h-full w-full object-contain" />
                    ) : (
                      <div className="h-full w-full" style={{ background: getImageBackground(weekPieceImage) }} />
                    )}
                  </div>
                )}
                <p className="flex-1 text-[15px] leading-[1.65] tracking-[-0.02em] text-[#555]">“{weekPieceText}”</p>
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

function SettingsRow({ title, body, value, danger = false }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 border-b border-[#E9E6DE] px-1 py-4 text-left last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[15px] font-semibold leading-[1.4] tracking-[-0.02em] ${danger ? "text-[#B65B43]" : "text-[#20324B]"}`}>{title}</p>
        {body && <p className="mt-1 text-[12px] font-normal leading-[1.5] tracking-[-0.01em] text-[#8B8B8B]">{body}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {value && <span className="text-[13px] font-medium tracking-[-0.01em] text-[#8B8B8B]">{value}</span>}
        <span className="text-[20px] font-light leading-none text-[#B8B8B8]" aria-hidden="true">›</span>
      </div>
    </button>
  );
}

function SettingsSection({ title, children }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 px-1 text-[13px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#8B8B8B]">{title}</h2>
      <div className="rounded-[20px] border border-[#E9E6DE] bg-[#FCFAF5] px-4 shadow-[0_8px_24px_rgba(32,50,75,0.06)]">
        {children}
      </div>
    </section>
  );
}

function SettingsTab({ logItems }) {
  const doodleCount = logItems.filter((item) => item.type === "doodle" || item.doodle?.type === "doodle").length;
  const mindSpaceCount = logItems.reduce((sum, item) => sum + (Number(item.mindSpaceCount) || Number(item.mindSpace) || 0), 0);

  return (
    <main className="px-[22px] pb-10 pt-6 font-['Pretendard']">
      <header className="mb-6">
        <h1 className="text-[34px] font-bold leading-[1.2] tracking-[-0.055em] text-[#20324B]">나</h1>
        <p className="mt-2 text-[15px] font-normal leading-[1.6] tracking-[-0.01em] text-[#8B8B8B]">내 기록과 앱 설정을 관리해요.</p>
      </header>

      <section className="rounded-[20px] border border-[#E9E6DE] bg-[#FCFAF5] px-5 py-5 shadow-[0_8px_24px_rgba(32,50,75,0.06)]">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[18px] font-semibold text-[#20324B] shadow-[inset_0_0_0_1px_#E9E6DE]">
            do
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-[#20324B]">dreaming oh</p>
            <p className="mt-0.5 truncate text-[13px] font-normal leading-[1.5] tracking-[-0.01em] text-[#8B8B8B]">ojhdream@gmail.com</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#7B927D] shadow-[inset_0_0_0_1px_#E9E6DE]">
          <Check size={13} strokeWidth={2} />
          자동 저장 중
        </div>
      </section>

      <SettingsSection title="내 기록">
        <div className="grid grid-cols-3 divide-x divide-[#E9E6DE] py-4">
          <div className="px-2 text-center">
            <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#20324B]">{logItems.length}</p>
            <p className="mt-1 text-[12px] font-normal text-[#8B8B8B]">전체 툭</p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#20324B]">{doodleCount}</p>
            <p className="mt-1 text-[12px] font-normal text-[#8B8B8B]">낙서 수</p>
          </div>
          <div className="px-2 text-center">
            <p className="text-[20px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#20324B]">{mindSpaceCount}</p>
            <p className="mt-1 text-[12px] font-normal text-[#8B8B8B]">마음 여백</p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="설정">
        <SettingsRow title="매일 알림" value="꺼짐" />
        <SettingsRow title="잠금" value="사용 안 함" />
        <SettingsRow title="화면" value="기본" />
      </SettingsSection>

      <SettingsSection title="데이터">
        <SettingsRow title="데이터 내보내기" body="PDF, TXT, Markdown으로 저장" />
        <SettingsRow title="계정 삭제" danger />
      </SettingsSection>

      <SettingsSection title="정보">
        <SettingsRow title="피드백" />
        <SettingsRow title="개인정보 처리방침" />
        <SettingsRow title="이용약관" />
        <SettingsRow title="버전 정보" value="MVP v1" />
      </SettingsSection>
    </main>
  );
}

export default function App() {
  useVisibleViewportHeight();
  const storedAppState = loadStoredAppState();

  const [tab, setTab] = useState("recent");
  const [composerOpen, setComposerOpen] = useState(false);
  const [allLogs, setAllLogs] = useState(() => storedAppState?.allLogs || [...initialTodayLogItems, ...initialLogItems]);
  const [showWritingExample, setShowWritingExample] = useState(() => storedAppState?.showWritingExample ?? true);
  const [customEmotions, setCustomEmotions] = useState(() => storedAppState?.customEmotions || []);
  const [editTarget, setEditTarget] = useState(null);
  const [addTarget, setAddTarget] = useState(null);
  const [addInitialMode, setAddInitialMode] = useState("menu");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [storageError, setStorageError] = useState("");
  const [saveOverlayVisible, setSaveOverlayVisible] = useState(false);
  const [saveOverlayMessage, setSaveOverlayMessage] = useState("툭, 남겨졌어요.");
  const [saveOverlaySubtext, setSaveOverlaySubtext] = useState(false);
  const [frequencyGuideTarget, setFrequencyGuideTarget] = useState(null);
  const saveTimerRef = useRef(null);
  const todayLogs = allLogs.filter(isCurrentOperationalLog);

  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (tab !== "recent") {
      setComposerOpen(false);
    }
  }, [tab]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          allLogs,
          showWritingExample,
          customEmotions,
        }),
      );
      window.setTimeout(() => setStorageError(""), 0);
    } catch {
      window.setTimeout(
        () => setStorageError("저장 공간이 부족해 사진을 보관하지 못했어요. 기존 사진을 줄이거나 삭제해 주세요."),
        0,
      );
    }
  }, [allLogs, showWritingExample, customEmotions]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const showSaveOverlay = (nextTodayCount, savedLog = null) => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    const savedFrequency = getFrequencyOption(savedLog);
    if (savedFrequency && savedFrequency.key !== defaultFrequencyOption.key) {
      setSaveOverlayVisible(false);
      setFrequencyGuideTarget(savedLog);
      saveTimerRef.current = null;
      return;
    }

    setFrequencyGuideTarget(null);
    setSaveOverlayMessage(nextTodayCount === 1 ? "첫 툭이 남겨졌어요." : "툭, 남겨졌어요.");
    setSaveOverlaySubtext(nextTodayCount === 1);
    setSaveOverlayVisible(true);
    saveTimerRef.current = window.setTimeout(() => {
      setSaveOverlayVisible(false);
      saveTimerRef.current = null;
    }, 2100);
  };

  const dismissSaveOverlay = () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;
    setSaveOverlayVisible(false);
  };

  const closeFrequencyGuide = () => {
    setFrequencyGuideTarget(null);
    setComposerOpen(false);
    setTab("recent");
  };

  const addLog = (log) => {
    setAllLogs((current) => [log, ...current]);
  };

  const updateLog = (target, changes) => {
    const targetKey = getLogKey(target);
    const applyUpdate = (log) => (getLogKey(log) === targetKey ? { ...log, ...changes } : log);

    setAllLogs((current) => current.map(applyUpdate));
  };

  const saveEditedLog = (target, changes) => {
    updateLog(target, changes);
    setEditTarget(null);
  };

  const deleteLog = (target) => {
    const targetKey = getLogKey(target);
    const keepOtherLogs = (log) => getLogKey(log) !== targetKey;

    setAllLogs((current) => current.filter(keepOtherLogs));
  };

  const addCustomEmotion = (emotion) => {
    const nextEmotion = emotion.trim();
    if (!nextEmotion) return;
    setCustomEmotions((current) => [nextEmotion, ...current.filter((item) => item !== nextEmotion)].slice(0, 12));
  };

  const openLogWithQuery = (query) => {
    setLogSearchQuery(query);
    setComposerOpen(false);
    setTab("log");
  };

  const personalTagSet = useMemo(() => getPersonalTagSet(allLogs), [allLogs]);
  const taggedAllLogs = useMemo(() => enrichLogsWithTags(allLogs, personalTagSet), [allLogs, personalTagSet]);
  const taggedTodayLogs = useMemo(() => enrichLogsWithTags(todayLogs, personalTagSet), [todayLogs, personalTagSet]);
  const screen = useMemo(
    () =>
      tab === "recent" ? (
        <NowTab
          todayLogs={taggedTodayLogs}
          logItems={taggedAllLogs}
          totalLogCount={taggedAllLogs.length}
          onAddLog={addLog}
          onAddDetails={setAddTarget}
          onEditLog={setEditTarget}
          onDeleteLog={deleteLog}
          showWritingExample={showWritingExample}
          onHideWritingExample={() => setShowWritingExample(false)}
          onShowSaved={showSaveOverlay}
          composerOpen={composerOpen}
          onComposerOpenChange={setComposerOpen}
          emotionOptions={[...new Set([...baseEmotionOptions, ...customEmotions])]}
          onAddEmotion={addCustomEmotion}
        />
      ) : tab === "log" ? (
        <LogTab
          logItems={taggedAllLogs}
          initialSearchQuery={logSearchQuery}
          onAddDetails={setAddTarget}
          onEditLog={setEditTarget}
          onUpdateLog={updateLog}
          onDeleteLog={deleteLog}
        />
      ) : tab === "settings" ? (
        <SettingsTab logItems={taggedAllLogs} />
      ) : (
        <TodayTab logItems={taggedAllLogs} onTopicSelect={openLogWithQuery} />
      ),
    [tab, taggedTodayLogs, taggedAllLogs, showWritingExample, customEmotions, composerOpen, logSearchQuery],
  );

  const activeScreen = editTarget ? (
    <RecordEditScreen item={editTarget} onClose={() => setEditTarget(null)} onSave={saveEditedLog} />
  ) : (
    screen
  );

  const addSheet = addTarget ? (
    <RecordAddSheet
      item={addTarget}
      emotionOptions={[...new Set([...baseEmotionOptions, ...customEmotions])]}
      initialMode={addInitialMode}
      onAddEmotion={addCustomEmotion}
      onClose={() => {
        setAddTarget(null);
        setAddInitialMode("menu");
      }}
      onUpdate={updateLog}
    />
  ) : null;

  return (
    <div className="h-[var(--maeumtuk-vh,100dvh)] overflow-hidden bg-[#fcfcfa] p-0 font-['Pretendard'] text-[#102747] sm:p-6">
      <div className="mx-auto flex h-full max-w-[1260px] items-stretch justify-center gap-7 sm:items-start">
        <Phone
          tab={tab}
          setTab={setTab}
          hideNav={Boolean(editTarget) || composerOpen}
          overlay={
            addSheet ||
            (frequencyGuideTarget ? (
              <FrequencyGuideOverlay item={frequencyGuideTarget} onClose={closeFrequencyGuide} />
            ) : null) ||
            (saveOverlayVisible ? (
              <SaveOverlay
                message={saveOverlayMessage}
                showSubtext={saveOverlaySubtext}
                onDismiss={dismissSaveOverlay}
              />
            ) : null)
          }
        >
          {storageError && !editTarget && (
            <div className="mx-6 mt-3 rounded-[10px] border border-[#f0d4c8] bg-[#fff4ee] px-3 py-2 text-[12px] font-medium leading-5 text-[#a6533c]">
              {storageError}
            </div>
          )}
          {activeScreen}
        </Phone>
        <div className="hidden max-w-[520px] rounded-[18px] bg-[#fffdf9]/78 p-7 text-sm leading-7 text-[#4b443d] shadow-[0_7px_18px_rgba(54,42,30,.035)] ring-1 ring-[#eee7de] lg:block">
          <h2 className="mb-4 font-['Pretendard'] text-lg font-semibold tracking-[-0.02em] text-[#2d2119]">마음툭 UI 메모</h2>
          <p>
            하단 탭은 <b>지금 · 툭로그 · 요즘</b> 3개로 고정하고, 작성창과 로그 카드가 먼저 보이도록 밀도를 정리했습니다.
          </p>
          <p className="mt-4">
            감정은 분석 요소가 아니라 기록 뒤에 남은 말로 조용히 정리됩니다. 툭로그 카드 안에서 바로 <b>툭더하기</b>로 이후 생각이나 결과를 덧붙일 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
