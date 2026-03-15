import { useState, useEffect, useRef } from "react";
import "./Cradles.css";

const COIN_KEY = "universalCoins";
function getCoins() { return parseInt(localStorage.getItem(COIN_KEY) || "0", 10); }
function addCoins(n) { localStorage.setItem(COIN_KEY, getCoins() + n); }

// Extract YouTube video ID from full embed src or watch URL
function extractYtId(input) {
  // Already an embed src like https://www.youtube.com/embed/XXXX?si=...
  const embedMatch = input.match(/youtube\.com\/embed\/([\w-]+)/);
  if (embedMatch) return embedMatch[1];
  // Watch URL
  const watchMatch = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (watchMatch) return watchMatch[1];
  return null;
}

// Preset lofi BG options
const PRESETS = [
  {
    label: "Lofi Cafe 🍵",
    id: "W5FI97ovWog",
  },
  {
    label: "Study Beats 📖",
    id: "7ccH8u8fj8Y",
  },
];

const DRINKS = [
  "Ceremonial Matcha + Strawberry Cold Foam",
  "Tiramisu Mocha Latte + Tiramisu Slice",
  "Dreamy Unicorn Frappe + Dried Strawberry Chunks",
  "Taro Matcha Overload + Brown Sugar Boba",
];

export default function Cradles() {
  const welcomeText = "Hello! Welcome to Misty Cafe. Since you are a new customer, it's on the house~ But you can earn coins by studying and order drinks through the menu.";
  const afterPassText = "Now we can start ur timer, feel free to change it however u want, and press the button bottom left for assistance.";
  const notEnoughCoinsText = "You need at least 1 coin to order a drink! Study for a minute first~ ☕";

  const [displayedText, setDisplayedText] = useState("");
  const [chatText, setChatText] = useState(welcomeText);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState("");
  const [drinkChosen, setDrinkChosen] = useState(false); // free drink done
  const [menuOpenedAfterFree, setMenuOpenedAfterFree] = useState(false); // subsequent orders

  // Timer
  const [timerVisible, setTimerVisible] = useState(false);
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempWork, setTempWork] = useState(25);
  const [tempBreak, setTempBreak] = useState(5);

  // Coins
  const [coins, setCoins] = useState(getCoins());
  const coinIntervalRef = useRef(null);

  // BG
  const [ytId, setYtId] = useState("");
  const [bgVideoUrl, setBgVideoUrl] = useState("");
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [ytInput, setYtInput] = useState("");
  const fileInputRef = useRef(null);

  // Draggable + resizable timer
  const [timerPos, setTimerPos] = useState({ x: 30, y: null });
  const [timerSize, setTimerSize] = useState({ w: 280, h: 220 });
  const dragging = useRef(false);
  const dragOffset = useRef({});
  const resizing = useRef(false);
  const resizeStart = useRef({});
  const timerRef = useRef(null);

  // Progress ring
  const totalSeconds = isBreak ? breakMin * 60 : workMin * 60;
  const progress = secondsLeft / totalSeconds;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * progress;

  // Typing effect
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + chatText.charAt(i));
      i++;
      if (i === chatText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [chatText]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsBreak((b) => !b);
          return isBreak ? workMin * 60 : breakMin * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRunning, isBreak, workMin, breakMin]);

  // Coin earning — 1 per minute while focus running
  useEffect(() => {
    if (isRunning && !isBreak) {
      coinIntervalRef.current = setInterval(() => {
        addCoins(1);
        setCoins(getCoins());
      }, 60000);
    } else {
      clearInterval(coinIntervalRef.current);
    }
    return () => clearInterval(coinIntervalRef.current);
  }, [isRunning, isBreak]);

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleConfirmSettings = () => {
    setWorkMin(tempWork);
    setBreakMin(tempBreak);
    setSecondsLeft(tempWork * 60);
    setIsRunning(false);
    setIsBreak(false);
    setShowSettings(false);
  };

  // Free drink (first visit)
  const handleChooseFreeDrink = () => {
    if (!selectedDrink) return alert("Pick a drink first!");
    setChatText(`Enjoy your ${selectedDrink}! 🍵 ${afterPassText}`);
    setShowMenu(false);
    setDrinkChosen(true);
    setTimerVisible(true);
    setSelectedDrink("");
  };

  const handlePassDrink = () => {
    setChatText(afterPassText);
    setShowMenu(false);
    setDrinkChosen(true);
    setTimerVisible(true);
  };

  // Open menu AFTER free drink — requires coins
  const handleOpenMenuAfterFree = () => {
    const c = getCoins();
    if (c < 1) {
      setChatText(notEnoughCoinsText);
      return;
    }
    setMenuOpenedAfterFree(true);
    setShowMenu(true);
    setSelectedDrink("");
  };

  // Confirm paid drink order (costs 1 coin)
  const handleConfirmPaidDrink = () => {
    if (!selectedDrink) return alert("Pick a drink first!");
    const c = getCoins();
    if (c < 1) {
      setChatText(notEnoughCoinsText);
      setShowMenu(false);
      return;
    }
    addCoins(-1);
    setCoins(getCoins());
    setChatText(`Here's your ${selectedDrink}! Enjoy~ ☕ Keep studying!`);
    setShowMenu(false);
    setMenuOpenedAfterFree(false);
    setSelectedDrink("");
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setYtId("");
    setBgVideoUrl(URL.createObjectURL(file));
    setShowBgPanel(false);
  };

  const handleSetYt = () => {
    const id = extractYtId(ytInput);
    if (!id) return alert("Couldn't find a YouTube video ID in that link. Try pasting the full URL or embed src.");
    setYtId(id);
    setBgVideoUrl("");
    setYtInput("");
    setShowBgPanel(false);
  };

  const handlePreset = (id) => {
    setYtId(id);
    setBgVideoUrl("");
    setShowBgPanel(false);
  };

  const clearBg = () => {
    setYtId("");
    setBgVideoUrl("");
    setShowBgPanel(false);
  };

  // Drag
  const onDragStart = (e) => {
    if (
      e.target.classList.contains("resize-handle") ||
      e.target.closest(".timer-controls") ||
      e.target.closest(".timer-settings")
    ) return;
    dragging.current = true;
    const rect = timerRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  };

  const onResizeStart = (e) => {
    resizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, ...timerSize };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current) {
        setTimerPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
      }
      if (resizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        setTimerSize({ w: Math.max(220, resizeStart.current.w + dx), h: Math.max(180, resizeStart.current.h + dy) });
      }
    };
    const onUp = () => { dragging.current = false; resizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const timerStyle = {
    width: timerSize.w,
    minHeight: timerSize.h,
    position: "fixed",
    left: timerPos.x,
    ...(timerPos.y !== null ? { top: timerPos.y } : { bottom: 30 }),
  };

  const ytEmbedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1`
    : null;

  return (
    <div className="cradles-page">

      {/* YouTube BG iframe */}
      {ytEmbedSrc && (
        <iframe
          className="vid-bg"
          src={ytEmbedSrc}
          title="bg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}

      {/* Uploaded video BG */}
      {bgVideoUrl && !ytId && (
        <video className="vid-bg" src={bgVideoUrl} autoPlay loop muted playsInline />
      )}

      {/* Coins HUD */}
      <div className="coins-hud">
        <span className="coin-icon">🪙</span>
        <span className="coin-count">{coins}</span>
        <span className="coin-label">coins</span>
      </div>

      {/* BG Button */}
      <button className="bg-btn" onClick={() => setShowBgPanel((v) => !v)} title="Change background">🎬</button>

      {showBgPanel && (
        <div className="bg-panel">
          <div className="bg-panel-title">✨ Background</div>

          {/* Presets */}
          <div className="bg-presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={`bg-preset-btn ${ytId === p.id ? "active" : ""}`}
                onClick={() => handlePreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="bg-divider">or paste a link</div>

          {/* Custom YouTube link */}
          <input
            className="bg-input"
            type="text"
            placeholder="YouTube URL or embed src..."
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
          />
          <button className="bg-upload-btn" onClick={handleSetYt}>▶ Set YouTube</button>

          <div className="bg-divider">or upload a file</div>
          <button className="bg-upload-btn" onClick={() => fileInputRef.current.click()}>📁 Upload Video</button>
          <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoUpload} />

          {(ytId || bgVideoUrl) && (
            <button className="bg-clear-btn" onClick={clearBg}>✕ Clear BG</button>
          )}
        </div>
      )}

      {/* Character */}
      <div className="cradles-char"><img src="" alt="" /></div>

      {/* Chat bubble */}
      <div className="chat-bubble">
        <div className="chat-name">Cradles ☕</div>
        <p>{displayedText}<span className="cursor">|</span></p>
      </div>

      {/* Initial free drink buttons */}
      {!drinkChosen && (
        <div className="button-row">
          <button className="menu-button" onClick={() => setShowMenu(true)}>☕ Choose Drink</button>
          <button className="menu-button pass-btn" onClick={handlePassDrink}>Pass for now</button>
        </div>
      )}

      {/* Order again button (after free drink, costs 1 coin) */}
      {drinkChosen && timerVisible && (
        <div className="button-row">
          <button className="menu-button order-btn" onClick={handleOpenMenuAfterFree}>
            🧾 Order Drink {coins < 1 ? "(need 1 🪙)" : "(1 🪙)"}
          </button>
        </div>
      )}

      {/* Menu Modal */}
      {showMenu && (
        <div className="menu-overlay" onClick={() => { setShowMenu(false); setMenuOpenedAfterFree(false); }}>
          <div className="menu-modal" onClick={(e) => e.stopPropagation()}>
            <button className="menu-close" onClick={() => { setShowMenu(false); setMenuOpenedAfterFree(false); }}>✕</button>
            <img src="menucradles.png" alt="Misty Cafe Menu" className="misty-menu-image" />
            <div className="menu-select-row">
              <select className="drink-dropdown" value={selectedDrink} onChange={(e) => setSelectedDrink(e.target.value)}>
                <option value="">— pick your drink —</option>
                {DRINKS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {selectedDrink && (
                <button
                  className="menu-button confirm-button"
                  onClick={menuOpenedAfterFree ? handleConfirmPaidDrink : handleChooseFreeDrink}
                >
                  {menuOpenedAfterFree ? "✓ Order (1 🪙)" : "✓ Confirm (free!)"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timer */}
      {timerVisible && (
        <div
          className={`timer-box ${isBreak ? "break-mode" : "focus-mode"}`}
          ref={timerRef}
          style={timerStyle}
          onMouseDown={onDragStart}
        >
          <div className="timer-mode-label">{isBreak ? "☕ break time" : "📚 focus mode"}</div>

          <div className="timer-ring-wrap">
            <svg width="130" height="130" className="timer-ring">
              <circle cx="65" cy="65" r={radius} className="ring-bg" />
              <circle
                cx="65" cy="65" r={radius}
                className="ring-fg"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset="0"
                transform="rotate(-90 65 65)"
              />
            </svg>
            <div className="timer-time">{fmt(secondsLeft)}</div>
          </div>

          <div className="timer-controls">
            <button className="t-btn" onClick={() => setIsRunning((r) => !r)}>
              {isRunning ? "⏸" : "▶"}
            </button>
            <button className="t-btn" onClick={() => { setIsRunning(false); setIsBreak(false); setSecondsLeft(workMin * 60); }}>↺</button>
            <button className="t-btn" onClick={() => { setShowSettings((v) => !v); setTempWork(workMin); setTempBreak(breakMin); }}>⚙</button>
          </div>

          {showSettings && (
            <div className="timer-settings">
              <label><span>Focus</span><input type="number" min="1" max="120" value={tempWork} onChange={(e) => setTempWork(+e.target.value)} /><span>min</span></label>
              <label><span>Break</span><input type="number" min="1" max="60" value={tempBreak} onChange={(e) => setTempBreak(+e.target.value)} /><span>min</span></label>
              <button className="save-btn" onClick={handleConfirmSettings}>Save ✓</button>
            </div>
          )}

          <div className="resize-handle" onMouseDown={onResizeStart}>⤡</div>
        </div>
      )}
    </div>
  );
}