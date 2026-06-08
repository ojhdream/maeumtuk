import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  MoreHorizontal,
  Moon,
  PencilLine,
  Plus,
  Sun,
  Sunset,
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

const autoWordRules = [
  { words: ["퇴근", "집에 오는 길", "집 가는 길", "버스", "지하철"], label: "퇴근길" },
  { words: ["바람", "공기", "날씨"], label: "바람" },
  { words: ["걸", "산책", "걷기"], label: "걷기" },
  { words: ["카페", "커피", "아메리카노"], label: "카페" },
  { words: ["친구", "대화", "만났다"], label: "친구" },
  { words: ["업무", "회의", "메일", "일"], label: "업무" },
  { words: ["답답", "막막", "숨막"], label: "답답" },
  { words: ["속상", "서운", "울컥"], label: "속상" },
  { words: ["떨림", "긴장", "두근"], label: "떨림" },
  { words: ["좋았다", "괜찮", "편했다", "가벼"], label: "가벼움" },
  { words: ["조용", "차분", "느슨"], label: "차분함" },
];

function normalizeWord(tag) {
  return tag.replace(/^#/, "");
}

function getLogKey(log) {
  return log.id || `${log.date}-${log.time}`;
}

function extractLeftWords(text) {
  const source = text.trim();
  if (!source) return [];

  const found = autoWordRules.filter((rule) => rule.words.some((word) => source.includes(word))).map((rule) => rule.label);
  return [...new Set(found)].slice(0, 4);
}

const emotionWords = new Set(["속상", "답답", "떨림", "가벼움", "차분함", "좋음", "묵직함", "느슨함"]);

function extractAutoTags(text) {
  return extractLeftWords(text).filter((word) => !emotionWords.has(normalizeWord(word))).slice(0, 4);
}

function getCurrentLogMeta() {
  const now = new Date();
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, "0");
  const hour12 = hour % 12 || 12;

  return {
    date: `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
    day: days[now.getDay()],
    greeting: getTimeGreeting(hour),
    hour,
    dot: getTimeDotColor(hour),
    time: `${hour < 12 ? "오전" : "오후"} ${hour12}:${minute}`,
  };
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
  if (hour >= 5 && hour < 10) return "#e6bd50";
  if (hour >= 10 && hour < 14) return "#f0bd3f";
  if (hour >= 14 && hour < 17) return "#de9c57";
  if (hour >= 17 && hour < 21) return "#c9794f";
  if (hour >= 21 || hour < 1) return "#78839a";
  return "#8c8798";
}

function getLogDotColor(item) {
  const hour = getHourFromTimeLabel(item.time);
  return hour === null ? item.dot : getTimeDotColor(hour);
}

function getMomentTitle(item) {
  const words = (item.tags || []).map(normalizeWord).filter(Boolean);
  if (words.length >= 2) return words.slice(0, 2).join(" ");
  if (words.length === 1) return words[0];

  const firstLine = item.text.split("\n")[0].trim();
  return firstLine.length > 10 ? `${firstLine.slice(0, 10)}...` : firstLine;
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

  return <Sun size={22} strokeWidth={1.8} className="text-[#f0bd3f]" />;
}

function AppHeader() {
  return (
    <header className="flex items-center justify-between px-6 pt-6">
      <div className="flex items-center gap-3">
        <div className="font-['SUIT'] text-[22px] font-semibold tracking-[-0.02em] text-[#2d2119]">마음툭</div>
        <div className="flex w-[38px] items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-[#cfc3b7]" />
          <span className="h-2 w-2 rounded-full bg-[#8fab62]" />
        </div>
      </div>
    </header>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "now", label: "지금", icon: <PencilLine size={20} strokeWidth={1.85} /> },
    { id: "log", label: "툭로그", icon: <FileText size={20} strokeWidth={1.85} /> },
    { id: "today", label: "요즘", icon: <Moon size={20} strokeWidth={1.85} /> },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 flex h-[calc(78px+env(safe-area-inset-bottom))] items-start justify-around border-t border-[#eee7de] bg-[#fffdf9]/92 pt-3 backdrop-blur-xl">
      {items.map((item) => {
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex min-h-[52px] w-20 flex-col items-center gap-1.5 text-[12px] transition ${
              active ? "text-[#4f6f3d]" : "text-[#827b73] hover:text-[#4b443d]"
            }`}
          >
            <div
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition ${
                active ? "bg-[#5f7f46] text-white shadow-[0_7px_16px_rgba(79,111,61,.16)]" : "text-[#777069]"
              }`}
            >
              {item.icon}
            </div>
            <span className="font-['Pretendard'] font-medium tracking-[-0.02em]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SaveOverlay() {
  return (
    <div className="maeumtuk-save-screen pointer-events-none absolute inset-0 z-50 grid place-items-center bg-[#fffaf4]/88 backdrop-blur-[3px]">
      <div className="maeumtuk-save-pop flex flex-col items-center">
        <div className="mb-5 flex w-[82px] items-center" aria-hidden="true">
          <span className="h-px flex-1 bg-[#c8baad]" />
          <span className="h-3 w-3 rounded-full bg-[#8fab62]" />
          <span className="h-px flex-1 bg-[#c8baad]" />
        </div>
        <p className="font-['SUIT'] text-[20px] font-semibold tracking-[-0.02em] text-[#2d2119]">툭, 남겨졌어요.</p>
        <p className="maeumtuk-save-sub mt-3 text-[13px] font-medium text-[#8b857e]">여기에 잠깐 머물러요.</p>
      </div>
    </div>
  );
}

function Phone({ children, tab, setTab, saveOverlayVisible }) {
  return (
    <div className="relative min-h-[100dvh] w-full max-w-[430px] overflow-hidden bg-[#f7f3ee] sm:h-[820px] sm:min-h-0 sm:w-[390px] sm:rounded-[26px] sm:shadow-[0_16px_55px_rgba(63,47,30,.08)] sm:ring-1 sm:ring-[#ebe2d8]">
      <div className="h-full min-h-[100dvh] overflow-y-auto pb-[calc(106px+env(safe-area-inset-bottom))] [scrollbar-width:none] sm:min-h-0 [&::-webkit-scrollbar]:hidden">{children}</div>
      <BottomNav tab={tab} setTab={setTab} />
      {saveOverlayVisible && <SaveOverlay />}
    </div>
  );
}

function MiniPhoto({ bg, size = "md" }) {
  const sizeClass = {
    md: "h-[64px] w-[64px] rounded-[10px]",
    lg: "h-[76px] w-[76px] rounded-[11px]",
  }[size];

  return <div className={`${sizeClass} shrink-0 shadow-inner ring-1 ring-black/[.03]`} style={{ background: bg }} />;
}

function EmptyState({ title, body }) {
  return (
    <section className="rounded-[13px] border border-[#eee6dc] bg-[#fffdf9] px-5 py-8 text-center shadow-[0_7px_18px_rgba(54,42,30,.03)]">
      <div className="mx-auto mb-5 flex w-[58px] items-center" aria-hidden="true">
        <span className="h-px flex-1 bg-[#cfc3b7]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#8fab62]" />
        <span className="h-px flex-1 bg-[#cfc3b7]" />
      </div>
      <h2 className="font-['SUIT'] text-[16px] font-semibold tracking-[-0.02em] text-[#2d2119]">{title}</h2>
      <p className="mx-auto mt-2 max-w-[230px] text-[13px] leading-6 text-[#817970]">{body}</p>
    </section>
  );
}

function NowTab({ todayLogs, onAddLog, showWritingExample, onHideWritingExample, onShowSaved }) {
  const [draft, setDraft] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [lengthNotice, setLengthNotice] = useState(false);
  const draftRef = useRef(null);
  const currentMeta = getCurrentLogMeta();
  const draftLength = draft.trim().length;
  const showLengthCount = draft.length >= 240;
  const isTooLong = draftLength > 300;
  const todayCount = todayLogs.length;
  const todayLabel = todayCount === 0 ? "비어 있음" : todayCount === 1 ? "첫 툭" : `${todayCount}툭`;

  const leaveTuk = () => {
    const text = draft.trim();
    if (!text && !photoAttached) return;
    if (text.length > 300) {
      setLengthNotice(true);
      return;
    }
    const leftWords = extractLeftWords(text);
    const autoTags = extractAutoTags(text);

    const nextLog = {
      id: `log-${Date.now()}`,
      date: currentMeta.date,
      day: currentMeta.day,
      time: currentMeta.time,
      text: text || "사진으로 남긴 툭",
      tags: autoTags,
      mood: leftWords.find((word) => ["속상", "답답", "떨림", "가벼움", "차분함"].includes(word)) || "남김",
      dot: currentMeta.dot,
      image: photoAttached ? "linear-gradient(135deg,#b7c9ba,#f3c66f 52%,#7d5a3e)" : null,
      note: "",
    };

    onAddLog(nextLog);
    onShowSaved();
    setLengthNotice(false);
    onHideWritingExample();
    window.setTimeout(() => {
      setDraft("");
      setPhotoAttached(false);
    }, 180);
  };

  return (
    <>
      <AppHeader />
      <main className="px-6 pt-8">
        <div className="mb-4 font-['Pretendard']">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center" aria-hidden="true">
              <TimeOfDayIcon hour={currentMeta.hour} />
            </span>
            <b className="font-['SUIT'] text-[20px] font-semibold tracking-[-0.02em] text-[#26201b]">
              {currentMeta.greeting}
            </b>
          </div>
          <p className="ml-[38px] mt-1 text-[12px] font-medium text-[#837b72]">
            {currentMeta.date} {currentMeta.day} · {currentMeta.time}
          </p>
        </div>

        {showWritingExample && !draft && (
          <section className="mb-3 rounded-[11px] bg-[#fff9f3] px-4 py-3.5 ring-1 ring-[#eee3d8]">
            <p className="whitespace-pre-line text-[14px] font-normal leading-6 text-[#514840]">
              커피 마셨는데도 졸리다. 왜지.
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#a18f82]">그냥, 이런 생각 하나.</span>
              <button
                onClick={onHideWritingExample}
                className="rounded-[7px] px-1.5 py-1 text-[10px] font-medium text-[#9b9188] hover:bg-[#f4eee8]"
              >
                그만 보기
              </button>
            </div>
          </section>
        )}

        <section className="relative rounded-[13px] border border-[#e1e8d8] bg-[#fffdf9] p-3 shadow-[0_7px_18px_rgba(54,42,30,.03)]">
          <div
            onClick={(event) => {
              if (event.target.closest("button")) return;
              draftRef.current?.focus();
            }}
            className="relative min-h-[142px] cursor-text rounded-[10px] bg-[#fbfcf7] px-3.5 pb-2.5 pt-3"
          >
            <div className="pointer-events-none absolute left-4 right-[18px] top-[54px] h-px bg-[#dfe8d3]/75" />
            <div className="pointer-events-none absolute left-[18px] right-4 top-[88px] h-px bg-[#e6eadb]/58" />
            <div className="pointer-events-none absolute left-4 right-[22px] top-[123px] h-px bg-[#e6eadb]/42" />
            <textarea
              ref={draftRef}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (lengthNotice) setLengthNotice(false);
              }}
              className="relative z-10 h-[118px] max-h-[230px] w-full resize-none overflow-y-auto bg-transparent font-['Pretendard'] text-[16px] leading-[34px] tracking-[-0.02em] text-[#272a22] outline-none placeholder:text-[#969e8f] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              placeholder={writeHints[0]}
            />
            {photoAttached && (
              <div className="mt-2 flex items-start gap-3">
                <div className="relative h-[64px] w-[64px] shrink-0 rounded-[10px] bg-[linear-gradient(135deg,#b7c9ba,#f3c66f_52%,#7d5a3e)] shadow-inner ring-1 ring-black/[.04]">
                  <button
                    onClick={() => setPhotoAttached(false)}
                    className="absolute -right-2.5 -top-2.5 grid h-8 w-8 place-items-center rounded-full bg-[#fffdf9] text-[#6c6259] shadow-[0_2px_8px_rgba(54,42,30,.12)] ring-1 ring-[#e8dfd5]"
                    aria-label="첨부 사진 삭제"
                  >
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-[#655f58]">
            <button
              onClick={() => setPhotoAttached(true)}
              className="inline-flex h-7 items-center gap-1.5 rounded-[8px] px-1.5 text-[12px] font-medium text-[#607454] hover:bg-[#eef4e8]"
              aria-label="사진 추가"
            >
              <Image size={16} strokeWidth={1.7} />
              사진
            </button>
            {showLengthCount && (
              <span className={`text-[12px] ${isTooLong ? "font-medium text-[#d46a45]" : "text-[#8b857e]"}`}>
                {draftLength} / 300
              </span>
            )}
          </div>
          {lengthNotice && (
            <p className="mt-2 px-1 text-[12px] font-medium text-[#c46b49]">조금 길어요. 툭은 300자 안쪽이 잘 읽혀요.</p>
          )}
        </section>

        <div className="mt-3 flex justify-end">
          <button
            onClick={leaveTuk}
            className="min-w-[132px] rounded-full border border-[rgba(79,111,61,0.18)] bg-[#4f6f3d] px-6 py-2.5 font-['SUIT'] text-[14px] font-semibold tracking-[-0.02em] text-[#fffdf9] shadow-[0_7px_16px_rgba(79,111,61,.13)] transition duration-150 hover:bg-[#486638] active:scale-[0.98] active:bg-[#425e34]"
          >
            툭 남기기
          </button>
        </div>

        <section className="mt-9">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['SUIT'] text-[16px] font-semibold tracking-[-0.02em] text-[#2b251f]">오늘의 툭</h2>
            <span className="text-[12px] font-medium text-[#8b857e]">{todayLabel}</span>
          </div>
          {todayLogs.length > 0 ? (
            <div className="space-y-3">
              {todayLogs.slice(0, 2).map((item) => (
                <RecentCard key={item.id || `${item.date}-${item.time}`} item={item} compact />
              ))}
            </div>
          ) : (
            <div className="rounded-[13px] border border-[#eee6dc] bg-[#fffdf9] px-4 py-5 text-[14px] text-[#817970] shadow-[0_7px_18px_rgba(54,42,30,.03)]">
              오늘은 아직 비어 있어요.
            </div>
          )}
        </section>
      </main>
    </>
  );
}

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
              className="inline-flex items-center gap-1 rounded-full bg-[#e6efdc] px-2 py-1 text-[11px] font-medium text-[#4f6b42]"
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
              className="h-[26px] w-[94px] rounded-full border border-[#d4dfca] bg-[#fffdf9] px-2.5 text-[11px] font-medium text-[#4f6b42] outline-none placeholder:text-[#98a18f]"
              placeholder="+ 태그 추가"
            />
          ) : (
            <button
              onClick={() => setAddingTag(true)}
              className="inline-flex h-[26px] items-center gap-1 rounded-full border border-dashed border-[#c8d8ba] px-2.5 text-[11px] font-medium text-[#5f744f] hover:bg-[#eef4e8]"
            >
              <Plus size={11} strokeWidth={2} />
              태그 추가
            </button>
          )}
          <button
            onClick={saveTags}
            className="ml-auto inline-flex h-[26px] items-center gap-1 rounded-[7px] px-2 text-[11px] font-medium text-[#5f744f] hover:bg-[#e9f0df]"
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
          <span key={tag} className="inline-flex items-center rounded-full bg-[#eef4e8] px-2 py-1 text-[11px] font-medium text-[#526f43]">
            {normalizeWord(tag)}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecentCard({ item, compact = false, showEnvelope = false, showManage = false, onUpdate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tagEditing, setTagEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editImage, setEditImage] = useState(item.image);

  const saveEdit = () => {
    const nextText = editText.trim();
    if (!nextText) return;
    const nextWords = extractLeftWords(nextText);
    onUpdate?.(item, {
      text: nextText,
      tags: item.tagsManaged ? item.tags : extractAutoTags(nextText),
      mood: nextWords.find((word) => ["속상", "답답", "떨림", "가벼움", "차분함"].includes(word)) || item.mood,
      image: editImage,
    });
    setEditing(false);
    setMenuOpen(false);
  };

  return (
    <article className="maeumtuk-log-card relative rounded-[13px] border border-[#eee4d9] bg-[#fffaf5] p-4 shadow-[0_7px_18px_rgba(54,42,30,.032)]">
      {showManage && (
        <button
          onClick={() => {
            setMenuOpen((open) => !open);
            setConfirmDelete(false);
          }}
          className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center rounded-[10px] text-[#8b857e] hover:bg-[#f5eee7]"
          aria-label="툭 관리"
        >
          <MoreHorizontal size={17} />
        </button>
      )}
      {showManage && menuOpen && (
        <div className="absolute right-3 top-11 z-20 w-[124px] rounded-[10px] border border-[#eee6dc] bg-[#fffdf9] p-1.5 text-[13px] shadow-[0_10px_24px_rgba(54,42,30,.08)]">
          <button
            onClick={() => {
              setEditText(item.text);
              setEditImage(item.image);
              setEditing(true);
              setTagEditing(false);
              setMenuOpen(false);
              setConfirmDelete(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
          >
            기록 수정
          </button>
          <button
            onClick={() => {
              setTagEditing(true);
              setEditing(false);
              setMenuOpen(false);
              setConfirmDelete(false);
            }}
            className="block w-full rounded-[8px] px-3 py-2 text-left text-[#4b443d] hover:bg-[#f5eee7]"
          >
            태그 관리
          </button>
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
      <div className="flex gap-3.5">
        <div className="min-w-0 flex-1 font-['Pretendard']">
          <div className="mb-2 flex items-center gap-1.5 pr-8 text-[12px] text-[#77716a]">
            <span className="h-2 w-2 rounded-full" style={{ background: getLogDotColor(item) }} />
            <span>{item.time}</span>
          </div>
          {editing ? (
            <div>
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                className="h-[112px] w-full resize-none rounded-[10px] border border-[#e7ded2] bg-[#fffaf4] p-3 text-[15px] leading-7 tracking-[-0.02em] text-[#211c17] outline-none"
              />
              <div className="mt-3 border-t border-[#f0e8df] pt-3">
                {editImage ? (
                  <div className="flex items-center gap-3">
                    <MiniPhoto bg={editImage} />
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setEditImage("linear-gradient(135deg,#c9d7e8,#f6c06c 52%,#7d5a3e)")}
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
                    onClick={() => setEditImage("linear-gradient(135deg,#b7c9ba,#f3c66f 52%,#7d5a3e)")}
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
          ) : (
            <p className="whitespace-pre-line text-[15px] font-normal leading-[27px] tracking-[-0.02em] text-[#2f2924]">{item.text}</p>
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
          {!editing && !confirmDelete && showManage && (
            <AutoTagEditor
              key={`${getLogKey(item)}-${tagEditing}`}
              item={item}
              onUpdate={onUpdate}
              editing={tagEditing}
              onDone={() => setTagEditing(false)}
            />
          )}
        </div>
        {!compact && !editing && item.image && (
          <div className="pt-7">
            <MiniPhoto bg={item.image} />
          </div>
        )}
      </div>
      {showEnvelope && <EnvelopeInteraction note={item.note} onChange={(nextNote) => onUpdate?.(item, { note: nextNote })} />}
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
    <div className="mt-3 border-t border-[#f3ede6] pt-2.5">
      {!open && !sent && (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex h-10 items-center gap-1 rounded-[9px] px-3 text-[11px] font-medium text-[#8b8279] hover:bg-[#f5eee7]"
        >
          <Plus size={13} strokeWidth={1.9} />
          툭더하기
        </button>
      )}
      {open && !sent && (
        <div className="rounded-[10px] border border-[#dfe8d5] bg-[#fbfcf7]/78 px-3 py-2.5">
          <div className="mb-0.5 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#5f744f]">그 후의 생각이나 이야기</p>
            <button
              onClick={() => {
                setMessage("");
                setOpen(false);
              }}
              className="grid h-7 w-7 place-items-center rounded-[8px] text-[#707f66] hover:bg-[#eef4e8]"
              aria-label="툭더하기 접기"
            >
              <ChevronUp size={15} strokeWidth={1.9} />
            </button>
          </div>
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
      {sent && (
        <div className="relative rounded-[10px] bg-[#f8fbf2] px-3.5 py-3 text-[13px] leading-6 text-[#3f4638]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-[#5f7f46]">툭더하기</p>
            {!editing && !confirmDelete && (
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="grid h-9 w-9 place-items-center rounded-[9px] text-[#707f66] hover:bg-[#eef4e8]"
                aria-label="툭더하기 관리"
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

function LogTab({ logItems, onUpdateLog, onDeleteLog }) {
  const [visibleCount, setVisibleCount] = useState(LOG_PAGE_SIZE);
  const [selectedTag, setSelectedTag] = useState("");
  const hasLogs = logItems.length > 0;
  const tagCounts = logItems.reduce((counts, item) => {
    (item.tags || []).forEach((tag) => {
      const word = normalizeWord(tag);
      counts[word] = (counts[word] || 0) + 1;
    });
    return counts;
  }, {});
  const frequentTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);
  const recentTags = [...new Set(logItems.flatMap((item) => (item.tags || []).map(normalizeWord)))].slice(0, 6);
  const filterTags = [...new Set([...frequentTags, ...recentTags])].slice(0, 5);
  const filteredLogs = selectedTag
    ? logItems.filter((item) => (item.tags || []).some((tag) => normalizeWord(tag) === selectedTag))
    : logItems;
  const visibleLogs = filteredLogs.slice(0, visibleCount);
  const hasMoreLogs = visibleCount < filteredLogs.length;
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

  return (
    <>
      <AppHeader />
      <main className="px-6 pt-8">
        <div className="mb-3">
          <h1 className="font-['SUIT'] text-[20px] font-semibold tracking-[-0.02em] text-[#2b251f]">툭로그</h1>
          <p className="mt-1 text-[12px] font-medium text-[#938a82]">마음을 지나간 순간들</p>
        </div>
        <section className="mb-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => {
                setSelectedTag("");
                setVisibleCount(LOG_PAGE_SIZE);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium ${
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
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  selectedTag === tag
                    ? "bg-[#5f7f46] text-[#fffdf9]"
                    : "border border-[#dfe8d3] bg-[#f1f5ec] text-[#68775f]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
        {hasLogs ? (
          filteredLogs.length > 0 ? (
          <div className="space-y-6">
            {groupedLogs.map((group) => (
              <section key={group.key}>
                <div className="mb-2.5 flex items-center gap-2 px-1">
                  <span className="font-['SUIT'] text-[13px] font-semibold tracking-[-0.01em] text-[#4d453e]">{group.date}</span>
                  <span className="text-[12px] font-medium text-[#8b857e]">{group.day}</span>
                  <span className="h-px flex-1 bg-[#eee6dc]" />
                  <span className="text-[11px] font-medium text-[#9a9188]">{group.items.length}툭</span>
                </div>
                <div className="space-y-2.5">
                  {group.items.map((item) => (
                    <RecentCard
                      key={getLogKey(item)}
                      item={item}
                      showEnvelope
                      showManage
                      onUpdate={onUpdateLog}
                      onDelete={onDeleteLog}
                    />
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
            <EmptyState title={`${selectedTag}이 남은 툭은 아직 없어요.`} body="다른 태그를 골라보거나 전체 기록으로 돌아가보세요." />
          )
        ) : (
          <EmptyState title="아직 남긴 툭이 없어요." body="문득 떠오른 말이나 장면을 지금 탭에서 짧게 남겨보세요." />
        )}
      </main>
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
        <b className="font-['SUIT'] text-[15px] font-semibold tracking-[-0.02em] text-[#2b251f]">{title}</b>
      </div>
      {children}
    </section>
  );
}

function WeeklyReflectionCard({ reflection }) {
  return (
    <section className="rounded-[13px] border border-[#eadfd4] bg-[#fffaf5] px-4 py-4 shadow-[0_7px_18px_rgba(54,42,30,.025)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <b className="font-['SUIT'] text-[16px] font-semibold tracking-[-0.02em] text-[#2b251f]">이번 주를 돌아보면</b>
        <span className="shrink-0 text-[10px] font-medium text-[#a18f82]">AI가 읽고 정리했어요</span>
      </div>
      <p className="whitespace-pre-line text-[14px] font-medium leading-7 tracking-[-0.01em] text-[#4a4038]">
        {reflection}
      </p>
    </section>
  );
}

function TodayTab({ logItems }) {
  const hasLogs = logItems.length > 0;
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState("current");
  const currentFrequentWords = [...new Set(logItems.flatMap((item) => item.tags || []).map(normalizeWord))]
    .filter((word) => !emotionWords.has(word))
    .slice(0, 6);
  const currentPhotoMoments = logItems.filter((item) => item.image).slice(0, 3);
  const currentContinuedStories = logItems.filter((item) => item.note).slice(0, 2).map((item) => item.note);
  const reviewPeriods = [
    {
      id: "current",
      label: "최근 7일",
      dates: "05.19 - 05.26",
      words: currentFrequentWords,
      moments: currentPhotoMoments,
      stories: currentContinuedStories,
      reflection:
        "이번 주에는 바람을 맞으며 걷던 순간과 조용히 집으로 돌아오던 시간을 자주 떠올렸네요. 누군가와 함께 있어도 말이 많지 않은 편안함이 오래 남은 것 같아요. 바로 답하기보다 잠깐 기다리며 마음을 가다듬는 순간도 보였어요. 바쁜 하루 사이에서 조금 느슨해질 틈을 찾고 있었던 것 같아요.",
    },
    {
      id: "previous-1",
      label: "1주 전",
      dates: "05.12 - 05.18",
      words: ["업무", "친구", "카페", "기다림"],
      moments: [
        { id: "past-1", image: "linear-gradient(135deg,#c8d5bf,#f4c36c 48%,#6b4325)", title: "오랜만의 카페" },
        { id: "past-2", image: "linear-gradient(135deg,#e7e0c9,#b6c4a3 45%,#6f7659)", title: "잠깐의 기다림" },
      ],
      stories: ["집에 와서도 그 느슨한 대화가 오래 남았다."],
      reflection:
        "이번 주에는 바로 답하기보다 조금 기다려보는 순간이 자주 보였어요. 오랜만에 만난 사람과 나눈 느슨한 시간이 오래 남은 것 같아요. 해야 할 일 사이에서도 잠깐 멈춰 마음을 정리하려 했던 것처럼 보였어요.",
    },
    {
      id: "previous-2",
      label: "2주 전",
      dates: "05.05 - 05.11",
      words: ["집", "산책", "하루", "정리"],
      moments: [
        { id: "past-3", image: "linear-gradient(135deg,#d8d0bf,#95b39d 52%,#6f7659)", title: "조용한 귀가" },
        { id: "past-4", image: "linear-gradient(135deg,#eadbb8,#725e48 48%,#f3a744)", title: "늦은 산책" },
      ],
      stories: [],
      reflection:
        "이번 주에는 하루를 마치고 집으로 돌아가는 시간이 자주 남았네요. 조금 버거운 날에도 씻고 눕거나 잠깐 걸으며 하루를 닫으려 했던 것 같아요. 특별한 해결보다 조용히 지나갈 시간을 필요로 했던 것처럼 보였어요.",
    },
  ];
  const selectedPeriod = reviewPeriods.find((period) => period.id === selectedPeriodId) || reviewPeriods[0];

  return (
    <>
      <AppHeader />
      <main className="px-6 pt-8 font-['Pretendard']">
        <div className="relative mb-5 flex items-center justify-between">
          <h1 className="font-['SUIT'] text-[20px] font-semibold tracking-[-0.02em] text-[#2b251f]">요즘</h1>
          <button
            onClick={() => setPeriodOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-[10px] border border-[#e6ddd3] bg-[#fffdf9] px-3 py-2 text-right"
          >
            <span>
              <span className="block text-[12px] font-semibold text-[#4d453e]">{selectedPeriod.label}</span>
              <span className="mt-0.5 block text-[10px] font-medium text-[#9a9188]">{selectedPeriod.dates}</span>
            </span>
            <ChevronDown size={14} className={`text-[#8b857e] transition ${periodOpen ? "rotate-180" : ""}`} />
          </button>
          {periodOpen && (
            <div className="absolute right-0 top-12 z-30 w-[176px] rounded-[11px] border border-[#eee6dc] bg-[#fffdf9] p-1.5 shadow-[0_12px_28px_rgba(54,42,30,.09)]">
              {reviewPeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => {
                    setSelectedPeriodId(period.id);
                    setPeriodOpen(false);
                  }}
                  className={`block w-full rounded-[8px] px-3 py-2 text-left ${
                    selectedPeriod.id === period.id ? "bg-[#f4eee8]" : "hover:bg-[#f8f4ef]"
                  }`}
                >
                  <span className="block text-[12px] font-semibold text-[#4d453e]">{period.label}</span>
                  <span className="mt-0.5 block text-[10px] font-medium text-[#9a9188]">{period.dates}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {hasLogs ? (
          <div className="space-y-3.5">
            <TodayCard title="자주 떠오른 것">
              <div className="flex flex-wrap gap-2">
                {selectedPeriod.words.map((word) => (
                  <Chip key={word}>{word}</Chip>
                ))}
              </div>
            </TodayCard>

            <TodayCard title="순간 모음">
              <div className="flex gap-3 overflow-hidden">
                {selectedPeriod.moments.map((item) => (
                  <div key={item.id || `${item.date}-${item.time}`} className="w-[76px] shrink-0">
                    <MiniPhoto bg={item.image} size="lg" />
                    <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-4 text-[#746d65]">{item.title || getMomentTitle(item)}</p>
                  </div>
                ))}
              </div>
            </TodayCard>

            {selectedPeriod.stories.length > 0 && (
              <TodayCard title="이어진 이야기">
                <div className="space-y-2">
                  {selectedPeriod.stories.map((story) => (
                    <p key={story} className="rounded-[9px] bg-[#f8f4ef] px-3.5 py-3 text-[13px] leading-6 text-[#514840]">
                      {story}
                    </p>
                  ))}
                </div>
              </TodayCard>
            )}

            <WeeklyReflectionCard reflection={selectedPeriod.reflection} />

          </div>
        ) : (
          <EmptyState title="아직 모인 조각이 없어요." body="툭이 몇 개 쌓이면 남은 말과 순간이 천천히 모여요." />
        )}
      </main>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("now");
  const [todayLogs, setTodayLogs] = useState(() => loadStoredAppState()?.todayLogs || initialTodayLogItems);
  const [allLogs, setAllLogs] = useState(() => loadStoredAppState()?.allLogs || initialLogItems);
  const [showWritingExample, setShowWritingExample] = useState(() => loadStoredAppState()?.showWritingExample ?? true);
  const [saveOverlayVisible, setSaveOverlayVisible] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        todayLogs,
        allLogs,
        showWritingExample,
      }),
    );
  }, [todayLogs, allLogs, showWritingExample]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const showSaveOverlay = () => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    setSaveOverlayVisible(true);
    saveTimerRef.current = window.setTimeout(() => {
      setSaveOverlayVisible(false);
    }, 950);
  };

  const addLog = (log) => {
    setTodayLogs((current) => [log, ...current]);
    setAllLogs((current) => [log, ...current]);
  };

  const updateLog = (target, changes) => {
    const targetKey = getLogKey(target);
    const applyUpdate = (log) => (getLogKey(log) === targetKey ? { ...log, ...changes } : log);

    setTodayLogs((current) => current.map(applyUpdate));
    setAllLogs((current) => current.map(applyUpdate));
  };

  const deleteLog = (target) => {
    const targetKey = getLogKey(target);
    const keepOtherLogs = (log) => getLogKey(log) !== targetKey;

    setTodayLogs((current) => current.filter(keepOtherLogs));
    setAllLogs((current) => current.filter(keepOtherLogs));
  };

  const screen = useMemo(
    () =>
      tab === "now" ? (
        <NowTab
          todayLogs={todayLogs}
          onAddLog={addLog}
          showWritingExample={showWritingExample}
          onHideWritingExample={() => setShowWritingExample(false)}
          onShowSaved={showSaveOverlay}
        />
      ) : tab === "log" ? (
        <LogTab logItems={allLogs} onUpdateLog={updateLog} onDeleteLog={deleteLog} />
      ) : (
        <TodayTab logItems={allLogs} />
      ),
    [tab, todayLogs, allLogs, showWritingExample],
  );

  return (
    <div className="min-h-screen bg-[#f7f3ee] p-0 font-['Pretendard'] text-[#211b16] sm:p-6">
      <div className="mx-auto flex max-w-[1260px] items-stretch justify-center gap-7 sm:items-start">
        <Phone tab={tab} setTab={setTab} saveOverlayVisible={saveOverlayVisible}>{screen}</Phone>
        <div className="hidden max-w-[520px] rounded-[18px] bg-[#fffdf9]/78 p-7 text-sm leading-7 text-[#4b443d] shadow-[0_7px_18px_rgba(54,42,30,.035)] ring-1 ring-[#eee7de] lg:block">
          <h2 className="mb-4 font-['SUIT'] text-lg font-semibold tracking-[-0.02em] text-[#2d2119]">마음툭 UI 메모</h2>
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
