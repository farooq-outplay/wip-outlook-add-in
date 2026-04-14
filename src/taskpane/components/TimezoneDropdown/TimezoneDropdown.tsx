import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import "./TimezoneDropdown.css";

interface TzOption {
  key: string;  // IANA name, e.g. "Europe/Brussels"
  text: string; // display name from API (may equal key)
}

interface Props {
  options: TzOption[];
  value: string;         // currently selected IANA key
  onChange: (ianaKey: string) => void;
  placeholder?: string;
  className?: string;
}

/** Return UTC offset string like "(UTC+01:00)" for a given IANA timezone. */
function getUtcOffset(iana: string): string {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "shortOffset",
    }).formatToParts(now);

    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    if (tzPart === "GMT") return "(UTC+00:00)";

    const match = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return "(UTC+00:00)";
    const sign = match[1];
    const hours = match[2].padStart(2, "0");
    const mins = (match[3] ?? "00").padStart(2, "0");
    return `(UTC${sign}${hours}:${mins})`;
  } catch {
    return "(UTC+00:00)";
  }
}

/** Format an IANA key as "(UTC+01:00) Europe/Brussels". */
function formatTzLabel(iana: string): string {
  return `${getUtcOffset(iana)} ${iana}`;
}

const TimezoneDropdown: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Select timezone...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLLIElement>(null);

  /** Recompute portal panel position from trigger's bounding rect. */
  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  // Open / close
  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      if (prev) {
        setSearch("");
        return false;
      }
      updatePanelPosition();
      return true;
    });
  }, [updatePanelPosition]);

  // Keep panel aligned on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePanelPosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updatePanelPosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (open && selectedRef.current) {
      setTimeout(() => selectedRef.current?.scrollIntoView({ block: "nearest" }), 50);
    }
  }, [open]);

  const handleSelect = useCallback(
    (key: string) => {
      onChange(key);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  // Filter: match offset string OR iana path segments
  const filtered = search.trim()
    ? options.filter((opt) => {
        const label = formatTzLabel(opt.key).toLowerCase();
        const q = search.trim().toLowerCase();
        return label.includes(q) || opt.key.toLowerCase().includes(q);
      })
    : options;

  const displayLabel = value ? formatTzLabel(value) : "";

  const panel = (
    <div ref={panelRef} className="tz-panel" style={panelStyle} role="dialog">
      <div className="tz-search-wrapper">
        <input
          ref={searchRef}
          type="text"
          className="tz-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder=""
          aria-label="Search timezones"
        />
      </div>
      <ul className="tz-list" role="listbox" aria-label="Timezones">
        {filtered.length === 0 ? (
          <li className="tz-no-results">No matches</li>
        ) : (
          filtered.map((opt) => {
            const isSelected = opt.key === value;
            return (
              <li
                key={opt.key}
                ref={isSelected ? selectedRef : null}
                role="option"
                aria-selected={isSelected}
                className={`tz-option ${isSelected ? "tz-option--selected" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur on InlineEditField container
                  handleSelect(opt.key);
                }}
              >
                {formatTzLabel(opt.key)}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );

  return (
    <div className={`tz-dropdown ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        className={`tz-trigger ${open ? "tz-trigger--open" : ""}`}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="tz-trigger-label">
          {displayLabel || <span className="tz-placeholder">{placeholder}</span>}
        </span>
        <span className={`tz-chevron ${open ? "tz-chevron--up" : ""}`}>▲</span>
      </button>

      {open && ReactDOM.createPortal(panel, document.body)}
    </div>
  );
};

export default TimezoneDropdown;
