import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Focus,
  Globe2,
  Keyboard,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { categories, events } from "./data/events";

const MIN_YEAR = -4_600_000_000;
const MAX_YEAR = 2030;
const MIN_SPAN = 2;
const MAX_SPAN = MAX_YEAR - MIN_YEAR;
const ERA_JUMPS = [
  { label: "Earth", year: -4_540_000_000, span: 800_000_000 },
  { label: "Life", year: -3_700_000_000, span: 1_500_000_000 },
  { label: "Humans", year: -300_000, span: 500_000 },
  { label: "Agriculture", year: -10_000, span: 16_000 },
  { label: "Ancient", year: -1500, span: 3500 },
  { label: "Modern", year: 1750, span: 330 },
  { label: "Today", year: 2026, span: 90 },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function signedLog(year) {
  const sign = year < 0 ? -1 : 1;
  return sign * Math.log10(Math.abs(year) + 1);
}

function inverseSignedLog(value) {
  const sign = value < 0 ? -1 : 1;
  return sign * (10 ** Math.abs(value) - 1);
}

function yearToWorld(year) {
  const min = signedLog(MIN_YEAR);
  const max = signedLog(MAX_YEAR);
  return (signedLog(year) - min) / (max - min);
}

function worldToYear(position) {
  const min = signedLog(MIN_YEAR);
  const max = signedLog(MAX_YEAR);
  return inverseSignedLog(min + position * (max - min));
}

function formatYear(year, detailed = false) {
  const rounded = Math.round(year);
  if (rounded < -1_000_000_000) {
    return `${Math.abs(rounded / 1_000_000_000).toFixed(detailed ? 2 : 1)}B years ago`;
  }
  if (rounded < -1_000_000) {
    return `${Math.abs(rounded / 1_000_000).toFixed(detailed ? 2 : 1)}M years ago`;
  }
  if (rounded < -10_000) {
    return `${Math.abs(Math.round(rounded / 1000))}K years ago`;
  }
  if (rounded < 0) return `${Math.abs(rounded).toLocaleString()} BCE`;
  return `${rounded.toLocaleString()} CE`;
}

function formatDate(event) {
  if (!event.month) return formatYear(event.year, true);
  const date = new Date(Date.UTC(event.year > 0 ? event.year : 2000, event.month - 1, event.day || 1));
  const monthDay = date.toLocaleDateString("en-US", {
    month: "long",
    day: event.day ? "numeric" : undefined,
    timeZone: "UTC",
  });
  return `${monthDay}, ${formatYear(event.year, true)}`;
}

const EVENT_PLACEMENT = new Map(
  [...events]
    .sort((a, b) => a.year - b.year || String(a.id).localeCompare(String(b.id)))
    .map((event, index) => [
      event.id,
      {
        side: index % 2 === 0 ? "below" : "above",
        level: Math.floor(index / 2) % 3,
      },
    ]),
);

function stableEventPlacement(event) {
  return EVENT_PLACEMENT.get(event.id) || { side: "below", level: 0 };
}

function categoryIcon(category) {
  const map = {
    Origins: "◌",
    Science: "✦",
    Humanity: "◆",
    Culture: "◈",
    Civilization: "▣",
    Technology: "⌁",
    Politics: "◇",
    Religion: "✧",
    Exploration: "↑",
    Medicine: "+",
    Conflict: "×",
  };
  return map[category] || "•";
}

function TimelineEvent({ event, left, side, level, visible, selected, onSelect }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      className={`event-node ${side} ${selected ? "selected" : ""}`}
      style={{ left: `${left}%`, "--level": level }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerUp={(pointerEvent) => {
        pointerEvent.stopPropagation();
        onSelect(event);
      }}
      onClick={(event) => event.stopPropagation()}
      aria-label={`Open full details for ${event.title}, ${formatYear(event.year)}`}
    >
      <span className="event-connector" aria-hidden="true" />
      <span className="event-hit-area">
        <span className="event-dot" aria-hidden="true">
          <span className="event-icon">{categoryIcon(event.category)}</span>
        </span>
      </span>
      <span className="event-label">
        <strong>{event.title}</strong>
        <small>{formatYear(event.year)}</small>
      </span>
    </button>
  );
}

function App() {
  const timelineRef = useRef(null);
  const [view, setView] = useState({ center: 1950, span: 260 });
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [drag, setDrag] = useState(null);

  const start = view.center - view.span / 2;
  const end = view.center + view.span / 2;

  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      const categoryMatch = category === "All" || event.category === category;
      const haystack = [
        event.title,
        event.summary,
        event.description,
        event.category,
        event.location,
        ...(event.people || []),
        ...(event.tags || []),
      ]
        .join(" ")
        .toLowerCase();
      return categoryMatch && (!needle || haystack.includes(needle));
    });
  }, [category, query]);

  const visibleEvents = useMemo(
    () =>
      filteredEvents
        .filter((event) => event.year >= start && event.year <= end)
        .sort((a, b) => a.year - b.year),
    [filteredEvents, start, end],
  );

  const significanceFloor = useMemo(() => {
    if (view.span > 1_000_000_000) return 98;
    if (view.span > 10_000_000) return 95;
    if (view.span > 100_000) return 90;
    if (view.span > 10_000) return 85;
    if (view.span > 1_000) return 80;
    return 0;
  }, [view.span]);

  const ticks = useMemo(() => {
    const target =
      typeof window !== "undefined" && window.innerWidth <= 560 ? 5 : 10;
    const rough = view.span / target;
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(rough, 1)));
    const normalized = rough / magnitude;
    const step =
      normalized < 2 ? magnitude : normalized < 5 ? 2 * magnitude : 5 * magnitude;
    const first = Math.ceil(start / step) * step;
    const result = [];
    for (let year = first; year <= end && result.length < 30; year += step) {
      result.push(year);
    }
    return result;
  }, [start, end, view.span]);

  const setSafeView = (center, span) => {
    const safeSpan = clamp(span, MIN_SPAN, MAX_SPAN);
    const half = safeSpan / 2;
    setView({
      center: clamp(center, MIN_YEAR + half, MAX_YEAR - half),
      span: safeSpan,
    });
  };

  const zoom = (factor, anchorRatio = 0.5) => {
    const anchorYear = start + view.span * anchorRatio;
    const nextSpan = clamp(view.span * factor, MIN_SPAN, MAX_SPAN);
    const nextStart = anchorYear - nextSpan * anchorRatio;
    setSafeView(nextStart + nextSpan / 2, nextSpan);
  };

  const pan = (ratio) => {
    setSafeView(view.center + view.span * ratio, view.span);
  };

  const jumpTo = (year, span = Math.min(view.span, 200)) => {
    setSafeView(year, span);
  };

  const reset = () => {
    setView({ center: 1950, span: 260 });
    setCategory("All");
    setQuery("");
    setSelected(null);
  };

  const onWheel = (event) => {
    event.preventDefault();
    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (event.ctrlKey || Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      zoom(event.deltaY > 0 ? 1.22 : 0.82, ratio);
    } else {
      pan(event.deltaX / rect.width);
    }
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    setDrag({ x: event.clientX, center: view.center });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (!drag || !timelineRef.current) return;
    const width = timelineRef.current.getBoundingClientRect().width;
    const deltaRatio = (event.clientX - drag.x) / width;
    setSafeView(drag.center - deltaRatio * view.span, view.span);
  };

  const stopDrag = () => setDrag(null);

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) return;
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  });

  useEffect(() => {
    const onKey = (event) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
      if (event.key === "ArrowLeft") pan(-0.15);
      if (event.key === "ArrowRight") pan(0.15);
      if (event.key === "+" || event.key === "=") zoom(0.7);
      if (event.key === "-") zoom(1.4);
      if (event.key === "Escape") {
        setSelected(null);
        setShowHelp(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const searchResults = query
    ? filteredEvents.slice().sort((a, b) => b.significance - a.significance).slice(0, 6)
    : [];

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <button className="brand" onClick={reset} aria-label="Reset timeline">
          <span className="brand-mark"><Globe2 size={19} /></span>
          <span>
            <strong>Humanity's Calendar</strong>
            <small>THE HUMAN RECORD</small>
          </span>
        </button>

        <div className="search-wrap">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search an event, person, place..."
            aria-label="Search timeline"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    jumpTo(event.year, Math.max(20, Math.abs(event.year) * 0.015));
                    setSelected(event);
                    setQuery("");
                  }}
                >
                  <span>{categoryIcon(event.category)}</span>
                  <span>
                    <strong>{event.title}</strong>
                    <small>{formatYear(event.year)} · {event.category}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="top-actions">
          <button
            className={category !== "All" ? "active" : ""}
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button onClick={() => setShowHelp(true)} aria-label="Keyboard help">
            <Keyboard size={17} />
          </button>
        </div>
      </header>

      {showFilters && (
        <section className="filter-panel">
          <div>
            <span>Show</span>
            <strong>{filteredEvents.length} moments</strong>
          </div>
          <div className="filter-chips">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "selected" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="hero-meta">
        <div>
          <span className="eyebrow"><Sparkles size={13} /> EXPLORE HUMANITY</span>
          <h1>{formatYear(start)} <span>—</span> {formatYear(end)}</h1>
          <p>
            {visibleEvents.filter((event) => event.significance >= significanceFloor).length}
            {" "}significant moments in view
          </p>
        </div>
        <div className="era-jumps">
          {ERA_JUMPS.map((era) => (
            <button key={era.label} onClick={() => jumpTo(era.year, era.span)}>
              {era.label}
            </button>
          ))}
        </div>
      </section>

      <section
        className={`timeline-stage ${drag ? "dragging" : ""}`}
        ref={timelineRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onDoubleClick={(event) => {
          const rect = timelineRef.current.getBoundingClientRect();
          zoom(0.45, (event.clientX - rect.left) / rect.width);
        }}
      >
        <div className="grid-glow" />
        <div className="timeline-axis" />

        {ticks.map((tick) => {
          const left = ((tick - start) / view.span) * 100;
          return (
            <div className="tick" style={{ left: `${left}%` }} key={tick}>
              <span />
              <label>{formatYear(tick)}</label>
            </div>
          );
        })}

        {visibleEvents.map((event, index) => {
          const left = ((event.year - start) / view.span) * 100;
          const eventVisible =
            event.significance >= significanceFloor ||
            Boolean(query) ||
            category !== "All";
          const { side, level } = stableEventPlacement(event);
          return (
            <TimelineEvent
              key={event.id}
              event={event}
              left={left}
              side={side}
              level={level}
              visible={eventVisible}
              selected={selected?.id === event.id}
              onSelect={setSelected}
            />
          );
        })}

        {visibleEvents.filter((e) => e.significance >= significanceFloor).length === 0 && (
          <div className="empty-state">
            <Focus size={28} />
            <strong>No major moments at this scale</strong>
            <span>Zoom in or move through time to reveal more detail.</span>
          </div>
        )}

        <div className="timeline-hint">Drag to travel · Scroll to zoom · Double-click to focus</div>
      </section>

      <section className="control-dock">
        <button onClick={() => pan(-0.35)} aria-label="Move backward">
          <ChevronLeft size={19} />
        </button>
        <button onClick={() => zoom(1.45)} aria-label="Zoom out">
          <Minus size={18} />
        </button>
        <div className="zoom-readout">
          <span>{view.span < 10 ? view.span.toFixed(1) : Math.round(view.span).toLocaleString()}</span>
          <small>YEAR SPAN</small>
        </div>
        <button onClick={() => zoom(0.68)} aria-label="Zoom in">
          <Plus size={18} />
        </button>
        <button onClick={() => pan(0.35)} aria-label="Move forward">
          <ChevronRight size={19} />
        </button>
        <div className="dock-divider" />
        <button onClick={() => jumpTo(2026, 100)} title="Jump to today">
          <CalendarDays size={18} />
        </button>
        <button onClick={reset} title="Reset view">
          <RotateCcw size={17} />
        </button>
      </section>

      <section className="minimap" aria-label="Timeline minimap">
        <div className="minimap-line">
          {events
            .filter((event) => event.significance >= 94)
            .map((event) => (
              <button
                key={event.id}
                style={{ left: `${yearToWorld(event.year) * 100}%` }}
                onClick={() => jumpTo(event.year, Math.max(50, Math.abs(event.year) * 0.03))}
                title={event.title}
              />
            ))}
          <div
            className="minimap-window"
            style={{
              left: `${yearToWorld(start) * 100}%`,
              width: `${Math.max(0.8, (yearToWorld(end) - yearToWorld(start)) * 100)}%`,
            }}
          />
        </div>
        <div className="minimap-labels">
          <span>4.6B YEARS AGO</span>
          <span>HUMANITY</span>
          <span>NOW</span>
        </div>
      </section>

      {selected && (
        <>
          <button className="drawer-backdrop" onClick={() => setSelected(null)} aria-label="Close details" />
          <aside className="event-drawer">
            <div className="drawer-top">
              <button onClick={() => setSelected(null)}>
                <ArrowLeft size={17} /> Back to timeline
              </button>
              <button onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-visual">
              <span>{categoryIcon(selected.category)}</span>
              <div className="orbital-ring ring-one" />
              <div className="orbital-ring ring-two" />
            </div>

            <div className="drawer-content">
              <span className="category-badge">{selected.category}</span>
              <h2>{selected.title}</h2>
              <p className="event-date">{formatDate(selected)}</p>
              <p className="lead">{selected.summary}</p>
              <p>{selected.description}</p>

              <div className="significance-card">
                <div>
                  <span>Historical significance</span>
                  <strong>{selected.significance}<small>/100</small></strong>
                </div>
                <div className="score-track">
                  <span style={{ width: `${selected.significance}%` }} />
                </div>
              </div>

              <dl>
                <div>
                  <dt>Location</dt>
                  <dd>{selected.location}</dd>
                </div>
                {selected.people?.length > 0 && (
                  <div>
                    <dt>People</dt>
                    <dd>{selected.people.join(", ")}</dd>
                  </div>
                )}
                <div>
                  <dt>Keywords</dt>
                  <dd className="tag-list">
                    {selected.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </dd>
                </div>
              </dl>

              {selected.sourceUrl && (
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  View primary reference <ExternalLink size={15} />
                </a>
              )}
            </div>
          </aside>
        </>
      )}

      {showHelp && (
        <div className="modal-layer" onClick={() => setShowHelp(false)}>
          <section className="help-modal" onClick={(event) => event.stopPropagation()}>
            <div>
              <span className="eyebrow">NAVIGATION</span>
              <button onClick={() => setShowHelp(false)}><X size={18} /></button>
            </div>
            <h2>Move through time</h2>
            <div className="key-grid">
              <span><kbd>Scroll</kbd> Zoom around cursor</span>
              <span><kbd>Drag</kbd> Travel through time</span>
              <span><kbd>←</kbd><kbd>→</kbd> Move backward / forward</span>
              <span><kbd>+</kbd><kbd>−</kbd> Zoom in / out</span>
              <span><kbd>Esc</kbd> Close open panel</span>
              <span><kbd>Double click</kbd> Focus a moment</span>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
