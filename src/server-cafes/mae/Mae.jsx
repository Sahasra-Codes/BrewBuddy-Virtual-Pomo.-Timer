import { useState, useEffect, useRef } from "react";
import "./Mae.css";

const COIN_KEY       = "universalCoins";
const FREE_DRINK_KEY = "maeFreeDrinkDate";
const NOTE_KEY       = "maeNoteText";
const CHECK_KEY      = "maeCheckItems";
const SPOTIFY_KEY    = "maeSpotifySrc";
const TIMER_KEY      = "maeTimerSettings";
const BG_KEY         = "maeBgYtId";

function getCoins()              { return parseInt(localStorage.getItem(COIN_KEY) || "0", 10); }
function addCoins(n)             { localStorage.setItem(COIN_KEY, Math.max(0, getCoins() + n)); }
function getTodayStr()           { return new Date().toDateString(); }
function hasUsedFreeDrinkToday() { return localStorage.getItem(FREE_DRINK_KEY) === getTodayStr(); }
function markFreeDrinkUsed()     { localStorage.setItem(FREE_DRINK_KEY, getTodayStr()); }
function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function extractYtId(input) {
  const e = input.match(/youtube\.com\/embed\/([\w-]+)/);
  if (e) return e[1];
  const w = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (w) return w[1];
  return null;
}

const PRESETS = [
  { label: "🏖️ Beach View",      id: "3yM-DNEgrbY" },
  { label: "🍹 Beachy Juice Bar", id: "vWLnhvaaX-U" },
  { label: "🌊 Seaside Cafe",     id: "gUbNlN_SqpE" },
  { label: "🏕️ Beach Campsite",  id: "vIlzvUsB6H0" },
  { label: "📚 Lofty Library",    id: "phRZKH1tQsQ" },
  { label: "☕ Cozy Cafe",        id: "oGtH8v0qVBc" },
];

const DRINKS = [
  "Pina Colada Purity – Coconut Pineapple Lime",
  "Fango Mai Tai Twist – Watermelon Strawberry",
  "Coral Reef Refresher – Watermelon & Grape",
  "Lagoon Limeade – Blue Curaçao Lemonade",
  "Mango Mai Tai Twist – Mango Passion Fruit",
  "Island Sunrise Blend – Orange Carrot Ginger",
];

const DEFAULT_SPOTIFY = "https://open.spotify.com/embed/playlist/6zCID88oNjNv9zx6puDHKj?utm_source=generator&theme=0";
const IMG_NORMAL  = "/maenormal.png";
const IMG_TALKING = "/maetalking.png";

const DEFAULT_CHECKS = [
  { id: 1, text: "Start a pomodoro session", done: false },
  { id: 2, text: "Take a 5 min break 🌊", done: false },
  { id: 3, text: "Drink some water 💧", done: false },
];

export default function Mae() {
  const welcomeMsg = "Hey hey! Welcome to the Elixir Juice Bar 🌊 The sun's out, vibes are immaculate. First drink's totally on me, just pick whatever calls to you~";
  const passMsg    = "No worries! Come back tomorrow for your free drink. Let's start that timer and get in the zone~ 🍹";
  const alreadyMsg = "Welcome back! Your free drink resets tomorrow. You can still order with coins though~ 🌊";
  const notEnough  = "You'll need at least 1 coin! Study a bit first then come back~ 🍍";
  const afterFree  = "Coming right up! Now let's get that timer going, you've got this 🌴";

  const [chatText, setChatText]           = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTalking, setIsTalking]         = useState(false);
  const talkIntervalRef                   = useRef(null);
  const [charImg, setCharImg]             = useState(IMG_NORMAL);

  const freeDrinkUsedInit               = hasUsedFreeDrinkToday();
  const [drinkChosen, setDrinkChosen]   = useState(freeDrinkUsedInit);
  const [showMenu, setShowMenu]         = useState(false);
  const [selectedDrink, setSelectedDrink] = useState("");
  const [menuMode, setMenuMode]         = useState("free");
  const [timerVisible, setTimerVisible] = useState(freeDrinkUsedInit);

  const [coins, setCoins]   = useState(getCoins);
  const coinIntervalRef     = useRef(null);
  const minuteAccRef        = useRef(0);

  const savedTimer = loadJSON(TIMER_KEY, { workMin: 25, breakMin: 5 });
  const [workMin, setWorkMin]           = useState(savedTimer.workMin);
  const [breakMin, setBreakMin]         = useState(savedTimer.breakMin);
  const [secondsLeft, setSecondsLeft]   = useState(savedTimer.workMin * 60);
  const [isRunning, setIsRunning]       = useState(false);
  const [isBreak, setIsBreak]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempWork, setTempWork]         = useState(savedTimer.workMin);
  const [tempBreak, setTempBreak]       = useState(savedTimer.breakMin);

  const [ytId, setYtId]               = useState(() => localStorage.getItem(BG_KEY) || "");
  const [bgVideoUrl, setBgVideoUrl]   = useState("");
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [ytInput, setYtInput]         = useState("");
  const fileInputRef                  = useRef(null);

  const [spotifySrc, setSpotifySrc]     = useState(() => localStorage.getItem(SPOTIFY_KEY) || DEFAULT_SPOTIFY);
  const [showSpotify, setShowSpotify]   = useState(false);
  const [spotifyInput, setSpotifyInput] = useState("");

  const [showNotes, setShowNotes]       = useState(false);
  const [noteText, setNoteText]         = useState(() => localStorage.getItem(NOTE_KEY) || "");
  const [checkItems, setCheckItems]     = useState(() => loadJSON(CHECK_KEY, DEFAULT_CHECKS));
  const [newCheckText, setNewCheckText] = useState("");

  useEffect(() => { localStorage.setItem(NOTE_KEY, noteText); }, [noteText]);
  useEffect(() => { localStorage.setItem(CHECK_KEY, JSON.stringify(checkItems)); }, [checkItems]);
  useEffect(() => { localStorage.setItem(SPOTIFY_KEY, spotifySrc); }, [spotifySrc]);
  useEffect(() => { localStorage.setItem(BG_KEY, ytId); }, [ytId]);

  const toggleCheck  = id => setCheckItems(p => p.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const removeCheck  = id => setCheckItems(p => p.filter(i => i.id !== id));
  const addCheckItem = () => {
    if (!newCheckText.trim()) return;
    setCheckItems(p => [...p, { id: Date.now(), text: newCheckText.trim(), done: false }]);
    setNewCheckText("");
  };

  const [timerPos, setTimerPos]   = useState({ x: window.innerWidth - 340, y: 80 });
  const [timerSize, setTimerSize] = useState({ w: 280, h: 220 });
  const dragging    = useRef(false); const dragOffset  = useRef({});
  const resizing    = useRef(false); const resizeStart = useRef({});
  const timerRef    = useRef(null);

  const totalSeconds  = isBreak ? breakMin * 60 : workMin * 60;
  const progress      = secondsLeft / totalSeconds;
  const radius        = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash    = circumference * progress;

  useEffect(() => { setChatText(freeDrinkUsedInit ? alreadyMsg : welcomeMsg); }, []);

  useEffect(() => {
    if (!chatText) return;
    setDisplayedText(""); setIsTalking(true); setCharImg(IMG_TALKING);
    let i = 0;
    talkIntervalRef.current = setInterval(() => setCharImg(p => p === IMG_NORMAL ? IMG_TALKING : IMG_NORMAL), 200);
    const typing = setInterval(() => {
      setDisplayedText(p => p + chatText.charAt(i)); i++;
      if (i >= chatText.length) { clearInterval(typing); clearInterval(talkIntervalRef.current); setIsTalking(false); setCharImg(IMG_NORMAL); }
    }, 30);
    return () => { clearInterval(typing); clearInterval(talkIntervalRef.current); };
  }, [chatText]);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { setIsBreak(b => !b); return isBreak ? workMin * 60 : breakMin * 60; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, isBreak, workMin, breakMin]);

  useEffect(() => {
    if (isRunning && !isBreak) {
      coinIntervalRef.current = setInterval(() => {
        minuteAccRef.current += 1;
        if (minuteAccRef.current >= 10) { minuteAccRef.current = 0; addCoins(1); setCoins(getCoins()); }
      }, 60000);
    } else { clearInterval(coinIntervalRef.current); }
    return () => clearInterval(coinIntervalRef.current);
  }, [isRunning, isBreak]);

  const fmt = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  const handleChooseFreeDrink = () => {
    if (!selectedDrink) return alert("Pick a drink first!");
    markFreeDrinkUsed();
    setChatText(`One ${selectedDrink} coming right up! 🌊 ${afterFree}`);
    setShowMenu(false); setDrinkChosen(true); setTimerVisible(true); setSelectedDrink("");
  };
  const handlePass = () => { markFreeDrinkUsed(); setChatText(passMsg); setShowMenu(false); setDrinkChosen(true); setTimerVisible(true); };
  const handleOpenPaidMenu = () => { if (getCoins() < 1) { setChatText(notEnough); return; } setMenuMode("paid"); setShowMenu(true); };
  const handleConfirmPaid = () => {
    if (!selectedDrink) return alert("Pick a drink first!");
    if (getCoins() < 1) { setChatText(notEnough); setShowMenu(false); return; }
    addCoins(-1); setCoins(getCoins());
    setChatText(`${selectedDrink} on its way! Stay focused~ 🍹`);
    setShowMenu(false); setSelectedDrink("");
  };
  const handleSetYt = () => { const id = extractYtId(ytInput); if (!id) return alert("Couldn't find a YouTube video ID."); setYtId(id); setBgVideoUrl(""); setYtInput(""); setShowBgPanel(false); };
  const handlePreset = id => { setYtId(id); setBgVideoUrl(""); setShowBgPanel(false); };
  const clearBg = () => { setYtId(""); setBgVideoUrl(""); setShowBgPanel(false); };
  const handleVideoUpload = e => { const file = e.target.files[0]; if (!file) return; setYtId(""); setBgVideoUrl(URL.createObjectURL(file)); setShowBgPanel(false); };
  const handleSetSpotify = () => {
    let url = spotifyInput.trim();
    const m = url.match(/src="([^"]+)"/); if (m) url = m[1];
    if (url.includes("open.spotify.com/") && !url.includes("/embed/")) url = url.replace("open.spotify.com/", "open.spotify.com/embed/");
    if (url) { setSpotifySrc(url); setSpotifyInput(""); }
  };

  const onDragStart = e => {
    if (e.target.classList.contains("resize-handle") || e.target.closest(".timer-controls") || e.target.closest(".timer-settings")) return;
    dragging.current = true;
    const rect = timerRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };
  const onResizeStart = e => { resizing.current = true; resizeStart.current = { x: e.clientX, y: e.clientY, ...timerSize }; e.preventDefault(); e.stopPropagation(); };
  useEffect(() => {
    const onMove = e => {
      if (dragging.current) setTimerPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      if (resizing.current) setTimerSize({ w: Math.max(220, resizeStart.current.w + e.clientX - resizeStart.current.x), h: Math.max(180, resizeStart.current.h + e.clientY - resizeStart.current.y) });
    };
    const onUp = () => { dragging.current = false; resizing.current = false; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const timerStyle = { width: timerSize.w, minHeight: timerSize.h, position: "fixed", left: timerPos.x, top: timerPos.y };
  const ytEmbedSrc = ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1` : null;

  return (
    <div className="mae-page">
      {ytEmbedSrc && <iframe className="vid-bg" src={ytEmbedSrc} title="bg" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
      {bgVideoUrl && !ytId && <video className="vid-bg" src={bgVideoUrl} autoPlay loop muted playsInline />}
      <div className="coins-hud"><span className="coin-icon">🍍</span><span className="coin-count">{coins}</span><span className="coin-label">coins</span></div>
      <div className="toolbar">
        <button className={`tool-btn ${showBgPanel?"active":""}`} onClick={()=>{setShowBgPanel(v=>!v);setShowSpotify(false);setShowNotes(false);}}>🎬</button>
        <button className={`tool-btn ${showSpotify?"active":""}`} onClick={()=>{setShowSpotify(v=>!v);setShowBgPanel(false);setShowNotes(false);}}>🎵</button>
        <button className={`tool-btn ${showNotes?"active":""}`} onClick={()=>{setShowNotes(v=>!v);setShowBgPanel(false);setShowSpotify(false);}}>📝</button>
      </div>
      <div className="panel-container">
        {showBgPanel && (<div className="bg-panel"><div className="bg-panel-title">🎬 Background</div><div className="bg-presets">{PRESETS.map(p=><button key={p.id} className={`bg-preset-btn ${ytId===p.id?"active":""}`} onClick={()=>handlePreset(p.id)}>{p.label}</button>)}</div><div className="bg-divider">or paste a link</div><input className="bg-input" type="text" placeholder="YouTube URL..." value={ytInput} onChange={e=>setYtInput(e.target.value)} /><button className="bg-upload-btn" onClick={handleSetYt}>▶ Set YouTube</button><div className="bg-divider">or upload a file</div><button className="bg-upload-btn" onClick={()=>fileInputRef.current.click()}>📁 Upload Video</button><input ref={fileInputRef} type="file" accept="video/*" style={{display:"none"}} onChange={handleVideoUpload} />{(ytId||bgVideoUrl)&&<button className="bg-clear-btn" onClick={clearBg}>✕ Clear BG</button>}</div>)}
        {showSpotify && (<div className="spotify-panel"><div className="bg-panel-title">🎵 Music Settings</div><div className="bg-divider">paste your embed link</div><input className="bg-input" type="text" placeholder="Paste Spotify EMBED LINK..." value={spotifyInput} onChange={e=>setSpotifyInput(e.target.value)} /><button className="bg-upload-btn" onClick={handleSetSpotify}>▶ Update Playlist</button></div>)}
        {showNotes && (<div className="notes-panel"><div className="bg-panel-title">📝 Study Notes</div><textarea className="notes-textarea" placeholder="jot something down..." value={noteText} onChange={e=>setNoteText(e.target.value)} /><div className="bg-panel-title" style={{marginTop:"6px"}}>✅ To-Do</div><div className="checklist">{checkItems.map(item=>(<div key={item.id} className={`check-item ${item.done?"done":""}`}><button className="check-box" onClick={()=>toggleCheck(item.id)}>{item.done?"✓":""}</button><span className="check-label">{item.text}</span><button className="check-remove" onClick={()=>removeCheck(item.id)}>×</button></div>))}</div><div className="check-add-row"><input className="bg-input" type="text" placeholder="add a task..." value={newCheckText} onChange={e=>setNewCheckText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCheckItem()} /><button className="check-add-btn" onClick={addCheckItem}>+</button></div></div>)}
      </div>
      <div className="spotify-persistent"><iframe title="spotify" style={{borderRadius:"14px",display:"block"}} src={spotifySrc} width="280" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /></div>
      <div className="mae-char"><img src={charImg} alt="Mae" className={isTalking?"char-talking":""} /></div>
      <div className="chat-bubble"><div className="chat-name">Mae 🌊</div><p>{displayedText}<span className="cursor">|</span></p></div>
      {!drinkChosen && (<div className="button-row"><button className="menu-button" onClick={()=>{setMenuMode("free");setShowMenu(true);}}>🍹 Choose Drink</button><button className="menu-button pass-btn" onClick={handlePass}>Pass for now</button></div>)}
      {drinkChosen&&timerVisible&&(<div className="button-row"><button className="menu-button order-btn" onClick={handleOpenPaidMenu}>🧾 Order Drink {coins<1?"(need 1 🍍)":"(1 🍍)"}</button></div>)}
      {showMenu && (<div className="menu-overlay" onClick={()=>setShowMenu(false)}><div className="menu-modal" onClick={e=>e.stopPropagation()}><button className="menu-close" onClick={()=>setShowMenu(false)}>✕</button><img src="maemenu.png" alt="Elixir Juice Bar Menu" className="misty-menu-image" /><div className="menu-select-row"><select className="drink-dropdown" value={selectedDrink} onChange={e=>setSelectedDrink(e.target.value)}><option value="">— choose your drink —</option>{DRINKS.map(d=><option key={d} value={d}>{d}</option>)}</select>{selectedDrink&&(<button className="menu-button confirm-button" onClick={menuMode==="free"?handleChooseFreeDrink:handleConfirmPaid}>{menuMode==="free"?"✓ Confirm (free!)":"✓ Order (1 🍍)"}</button>)}</div></div></div>)}
      {timerVisible && (
        <div className={`timer-box ${isBreak?"break-mode":"focus-mode"}`} ref={timerRef} style={timerStyle} onMouseDown={onDragStart}>
          <div className="timer-mode-label">{isBreak?"🌊 break time":"📚 focus mode"}</div>
          <div className="timer-ring-wrap"><svg width="130" height="130" className="timer-ring"><circle cx="65" cy="65" r={radius} className="ring-bg" /><circle cx="65" cy="65" r={radius} className="ring-fg" strokeDasharray={`${strokeDash} ${circumference}`} strokeDashoffset="0" transform="rotate(-90 65 65)" /></svg><div className="timer-time">{fmt(secondsLeft)}</div></div>
          <div className="timer-controls"><button className="t-btn" onClick={()=>setIsRunning(r=>!r)}>{isRunning?"⏸":"▶"}</button><button className="t-btn" onClick={()=>{setIsRunning(false);setIsBreak(false);setSecondsLeft(workMin*60);}}>↺</button><button className="t-btn" onClick={()=>{setShowSettings(v=>!v);setTempWork(workMin);setTempBreak(breakMin);}}>⚙</button></div>
          {showSettings && (<div className="timer-settings"><label><span>Focus</span><input type="number" min="1" max="120" value={tempWork} onChange={e=>setTempWork(+e.target.value)} /><span>min</span></label><label><span>Break</span><input type="number" min="1" max="60" value={tempBreak} onChange={e=>setTempBreak(+e.target.value)} /><span>min</span></label><button className="save-btn" onClick={()=>{setWorkMin(tempWork);setBreakMin(tempBreak);localStorage.setItem(TIMER_KEY,JSON.stringify({workMin:tempWork,breakMin:tempBreak}));setSecondsLeft(tempWork*60);setIsRunning(false);setIsBreak(false);setShowSettings(false);}}>Save ✓</button></div>)}
          <div className="timer-coin-hint">🍍 +1 coin every 10 min of focus</div>
          <div className="resize-handle" onMouseDown={onResizeStart}>⤡</div>
        </div>
      )}
    </div>
  );
}