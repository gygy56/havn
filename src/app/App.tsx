import { useState } from "react";
import {
  Home,
  ClipboardList,
  Users,
  Settings,
  Check,
  ChevronRight,
  Plus,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";

// ─── Brand tokens ──────────────────────────────────────────────────────────
const C = {
  navy: "#0E1117",
  chalk: "#F4F2EE",
  sage: "#8BBFB0",
  sand: "#C8BFA8",
  red: "#A93226",
  muted: "#9E9483",
  border: "rgba(200, 191, 168, 0.4)",
  white: "#ffffff",
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────
type Priority = "urgent" | "normal" | "low";
type ScreenId = "home" | "tasks" | "roommates" | "settings";

interface Task {
  id: number;
  name: string;
  room: string;
  dueDate: string;
  priority: Priority;
  done: boolean;
  assigneeId: number | null;
}

interface Roommate {
  id: number;
  name: string;
  initials: string;
  color: string;
  completed: number;
  pending: number;
}

// ─── Data ──────────────────────────────────────────────────────────────────
const ROOMMATES: Roommate[] = [
  { id: 1, name: "Lucas",  initials: "LB", color: "#8B9BB4", completed: 7, pending: 2 },
  { id: 2, name: "Maya",   initials: "MK", color: "#B4A88B", completed: 5, pending: 4 },
  { id: 3, name: "Owen",   initials: "OR", color: "#9BB48B", completed: 3, pending: 1 },
  { id: 4, name: "Priya",  initials: "PS", color: "#B48B9B", completed: 6, pending: 3 },
];

const INITIAL_TASKS: Task[] = [
  { id: 1, name: "Do the dishes",           room: "Kitchen",     dueDate: "Today, 8pm",    priority: "urgent", done: false, assigneeId: 1 },
  { id: 2, name: "Vacuum living room",       room: "Living room", dueDate: "Today, 6pm",    priority: "normal", done: false, assigneeId: 2 },
  { id: 3, name: "Clean bathroom mirror",    room: "Bathroom",    dueDate: "Today, 9pm",    priority: "low",    done: true,  assigneeId: 3 },
  { id: 4, name: "Take out recycling",       room: "General",     dueDate: "Tomorrow, 8am", priority: "normal", done: false, assigneeId: 4 },
  { id: 5, name: "Wipe kitchen counters",    room: "Kitchen",     dueDate: "Tomorrow, noon",priority: "low",    done: false, assigneeId: 1 },
  { id: 6, name: "Water the plants",         room: "Living room", dueDate: "Wed, Jun 25",   priority: "low",    done: false, assigneeId: null },
  { id: 7, name: "Replace shower curtain",   room: "Bathroom",    dueDate: "Fri, Jun 27",   priority: "normal", done: false, assigneeId: null },
];

const ROOMS = ["Kitchen", "Living room", "Bedroom", "Bathroom", "Garden", "General"];

// ─── Helpers ───────────────────────────────────────────────────────────────
function priorityBorderColor(p: Priority) {
  if (p === "urgent") return C.red;
  if (p === "normal") return C.sage;
  return "#B8B5AF";
}

// ─── Logo ──────────────────────────────────────────────────────────────────
function HavnLogo({ onDark = true }: { onDark?: boolean }) {
  const stroke = onDark ? C.chalk : C.navy;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="38" height="30" viewBox="0 0 38 30" fill="none">
        {/* House: left wall + peaked roof, open on right */}
        <path
          d="M3 27 L3 15 L15 4 L27 15 L27 21"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 27 L11 27" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        {/* Sage dot */}
        <circle cx="33" cy="22" r="5" fill={C.sage} />
      </svg>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 18,
          fontWeight: 500,
          color: stroke,
          letterSpacing: "-0.5px",
        }}
      >
        havn
      </span>
    </div>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────
function Avatar({
  initials,
  color,
  size = 28,
  ring = false,
}: {
  initials: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.35),
        fontWeight: 500,
        color: C.navy,
        fontFamily: "'DM Sans', sans-serif",
        flexShrink: 0,
        outline: ring ? `2.5px solid ${C.sage}` : "none",
        outlineOffset: 2,
        transition: "outline 0.15s",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Room Tag ──────────────────────────────────────────────────────────────
function RoomTag({ room }: { room: string }) {
  return (
    <span
      style={{
        backgroundColor: `${C.sand}2A`,
        color: C.navy,
        border: `0.5px solid ${C.sand}`,
        borderRadius: 8,
        padding: "2px 8px",
        fontSize: 11,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {room}
    </span>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  const assignee = ROOMMATES.find((r) => r.id === task.assigneeId);
  return (
    <div
      style={{
        backgroundColor: C.white,
        borderRadius: 12,
        border: `0.5px solid ${C.border}`,
        borderLeft: `3px solid ${priorityBorderColor(task.priority)}`,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `1.5px solid ${C.sage}`,
          backgroundColor: task.done ? C.sage : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          transition: "background-color 0.15s",
        }}
      >
        {task.done && <Check size={12} color={C.white} strokeWidth={2.5} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            color: task.done ? C.muted : C.navy,
            textDecoration: task.done ? "line-through" : "none",
            marginBottom: 5,
            fontWeight: 400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {task.name}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RoomTag room={task.room} />
          <span
            style={{
              fontSize: 11,
              color: C.muted,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {task.dueDate}
          </span>
        </div>
      </div>

      {/* Assignee avatar */}
      {assignee && <Avatar initials={assignee.initials} color={assignee.color} size={28} />}
    </div>
  );
}

// ─── iOS Status Bar ────────────────────────────────────────────────────────
function StatusBar({ dark = true }: { dark?: boolean }) {
  const fg = dark ? C.chalk : C.navy;
  const bg = dark ? C.navy : C.chalk;
  return (
    <div
      style={{
        height: 44,
        backgroundColor: bg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px 0 24px",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: fg,
        }}
      >
        9:41
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {/* Signal bars */}
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 11 }}>
          {[4, 6, 8, 10].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h,
                backgroundColor: i < 3 ? fg : `${fg}55`,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path
            d="M7.5 2.5C9.7 2.5 11.7 3.5 13 5.2L14.2 3.8C12.6 1.9 10.2 0.7 7.5 0.7C4.8 0.7 2.4 1.9 0.8 3.8L2 5.2C3.3 3.5 5.3 2.5 7.5 2.5Z"
            fill={fg}
          />
          <path
            d="M7.5 5.3C8.9 5.3 10.2 5.9 11.1 6.9L12.3 5.5C11.1 4.2 9.4 3.4 7.5 3.4C5.6 3.4 3.9 4.2 2.7 5.5L3.9 6.9C4.8 5.9 6.1 5.3 7.5 5.3Z"
            fill={fg}
          />
          <circle cx="7.5" cy="9.5" r="1.5" fill={fg} />
        </svg>
        {/* Battery */}
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div
            style={{
              width: 22,
              height: 11,
              borderRadius: 3,
              border: `1px solid ${fg}`,
              padding: "2px",
              display: "flex",
            }}
          >
            <div
              style={{
                flex: "0 0 72%",
                backgroundColor: fg,
                borderRadius: 1.5,
              }}
            />
          </div>
          <div
            style={{
              width: 2,
              height: 5,
              backgroundColor: `${fg}66`,
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 1: Home Dashboard ─────────────────────────────────────────────
function HomeScreen({ tasks, onToggle, onNavToTasks }: { tasks: Task[]; onToggle: (id: number) => void; onNavToTasks: () => void }) {
  const todayTasks = tasks.filter((t) => t.dueDate.startsWith("Today"));
  const doneCount = tasks.filter((t) => t.done).length;
  const todoCount = tasks.filter((t) => !t.done).length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && !t.done).length;

  return (
    <div style={{ height: "100%", overflowY: "auto", backgroundColor: C.chalk }}>
      {/* Dark header */}
      <div style={{ backgroundColor: C.navy, padding: "12px 16px 24px" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <HavnLogo onDark />
          <Avatar initials="LB" color="#8B9BB4" size={36} />
        </div>

        {/* Greeting */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 26,
            fontWeight: 400,
            color: C.chalk,
            letterSpacing: "-0.5px",
            marginBottom: 4,
          }}
        >
          Good morning, Lucas
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: C.sage,
          }}
        >
          3 tasks due today
        </p>

        {/* Summary cards */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 20,
            overflowX: "auto",
            paddingBottom: 2,
          }}
        >
          {[
            { label: "To do",  value: todoCount,   accent: C.sage,  underline: true },
            { label: "Done",   value: doneCount,   accent: C.sand,  underline: false },
            { label: "Urgent", value: urgentCount, accent: C.red,   underline: false },
          ].map(({ label, value, accent, underline }) => (
            <div
              key={label}
              style={{
                backgroundColor: "rgba(244,242,238,0.07)",
                border: "0.5px solid rgba(244,242,238,0.13)",
                borderRadius: 12,
                padding: "14px 20px",
                minWidth: 96,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 34,
                  fontWeight: 400,
                  color: C.chalk,
                  lineHeight: 1,
                  borderBottom: underline ? `2px solid ${accent}` : "none",
                  paddingBottom: underline ? 4 : 0,
                  display: "inline-block",
                  marginBottom: 6,
                }}
              >
                {value}
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: label === "Urgent" ? `${C.red}CC` : label === "Done" ? C.sand : C.chalk,
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's tasks */}
      <div style={{ padding: "22px 16px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 20,
              fontWeight: 400,
              color: C.navy,
              letterSpacing: "-0.5px",
            }}
          >
            {"Today's tasks"}
          </h2>
          <button
            onClick={onNavToTasks}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: C.muted,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            See all <ChevronRight size={13} strokeWidth={1.75} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {todayTasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} />
          ))}
          {todayTasks.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 16px",
                color: C.muted,
              }}
            >
              <Check
                size={24}
                color={C.sage}
                style={{ margin: "0 auto 10px" }}
              />
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  marginBottom: 12,
                }}
              >
                {"All done for today — great work!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: All Tasks ──────────────────────────────────────────────────
type FilterTab = "all" | "todo" | "done" | "urgent";

function TasksScreen({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: number) => void;
}) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [roomFilter, setRoomFilter] = useState<string | null>(null);
  const [roomsOpen, setRoomsOpen] = useState(true);

  const rooms = Array.from(new Set(INITIAL_TASKS.map((t) => t.room)));

  const filtered = tasks.filter((t) => {
    if (filter === "todo"   && t.done)                   return false;
    if (filter === "done"   && !t.done)                  return false;
    if (filter === "urgent" && t.priority !== "urgent")  return false;
    if (roomFilter && t.room !== roomFilter)             return false;
    return true;
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "todo",   label: "To do" },
    { id: "done",   label: "Done" },
    { id: "urgent", label: "Urgent" },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", backgroundColor: C.chalk }}>
      {/* Header */}
      <div style={{ backgroundColor: C.navy, padding: "12px 16px 20px" }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 26,
            fontWeight: 400,
            color: C.chalk,
            letterSpacing: "-0.5px",
          }}
        >
          All tasks
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: C.sand,
            marginTop: 3,
          }}
        >
          Monday, 22 June 2026
        </p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Filter pill tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {tabs.map(({ id, label }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: `0.5px solid ${active ? C.navy : C.border}`,
                  backgroundColor: active ? C.navy : "rgba(255,255,255,0.85)",
                  color: active ? C.chalk : C.muted,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "background-color 0.15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Room filter */}
        <div style={{ marginTop: 14, marginBottom: 14 }}>
          <button
            onClick={() => setRoomsOpen(!roomsOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              padding: 0,
              marginBottom: roomsOpen ? 10 : 0,
            }}
          >
            <ChevronDown
              size={13}
              style={{
                transform: roomsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.2s",
              }}
            />
            Filter by room
          </button>

          {roomsOpen && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button
                onClick={() => setRoomFilter(null)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 8,
                  border: `0.5px solid ${roomFilter === null ? C.sage : C.border}`,
                  backgroundColor: roomFilter === null ? `${C.sage}22` : "transparent",
                  color: roomFilter === null ? "#3a7a6e" : C.muted,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: roomFilter === null ? 500 : 400,
                }}
              >
                All rooms
              </button>
              {rooms.map((room) => {
                const count = tasks.filter((t) => t.room === room).length;
                const active = roomFilter === room;
                return (
                  <button
                    key={room}
                    onClick={() => setRoomFilter(active ? null : room)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 8,
                      border: `0.5px solid ${active ? C.sage : C.border}`,
                      backgroundColor: active ? `${C.sage}22` : "transparent",
                      color: active ? "#3a7a6e" : C.muted,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {room}
                    <span
                      style={{
                        backgroundColor: C.sage,
                        color: C.white,
                        borderRadius: 999,
                        padding: "0 5px",
                        fontSize: 10,
                        fontWeight: 600,
                        lineHeight: "16px",
                        display: "inline-block",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task list */}
      <div style={{ padding: "0 16px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} onToggle={onToggle} />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              backgroundColor: C.white,
              borderRadius: 12,
              border: `0.5px solid ${C.border}`,
              padding: "40px 16px",
              textAlign: "center",
            }}
          >
            <ClipboardList size={24} color={C.muted} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: C.muted,
              }}
            >
              No tasks match this filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen 3: Add Task Modal (bottom sheet) ──────────────────────────────
function AddTaskModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (t: Task) => void;
}) {
  const [name, setName]           = useState("");
  const [room, setRoom]           = useState("Kitchen");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [dueDate, setDueDate]     = useState("Today, 8pm");
  const [priority, setPriority]   = useState<Priority>("normal");

  const handleCreate = () => {
    if (!name.trim()) return;
    onAdd({
      id: Date.now(),
      name: name.trim(),
      room,
      dueDate,
      priority,
      done: false,
      assigneeId,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(14,17,23,0.55)",
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: C.chalk,
          borderRadius: "20px 20px 0 0",
          width: "100%",
          padding: "0 20px 40px",
          maxHeight: "88%",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 20px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: C.sand,
              opacity: 0.6,
            }}
          />
        </div>

        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 22,
              fontWeight: 400,
              color: C.navy,
              letterSpacing: "-0.5px",
            }}
          >
            New task
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.muted,
              display: "flex",
              padding: 4,
            }}
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Task name */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              display: "block",
              marginBottom: 7,
            }}
          >
            Task name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Do the dishes"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              backgroundColor: C.white,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              color: C.navy,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Room */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              display: "block",
              marginBottom: 7,
            }}
          >
            Room
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `0.5px solid ${C.border}`,
                borderRadius: 10,
                backgroundColor: C.white,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: C.navy,
                appearance: "none",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {ROOMS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color={C.muted}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Assign to */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              display: "block",
              marginBottom: 12,
            }}
          >
            Assign to
          </label>
          <div style={{ display: "flex", gap: 16 }}>
            {ROOMMATES.map((r) => (
              <button
                key={r.id}
                onClick={() => setAssigneeId(assigneeId === r.id ? null : r.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Avatar
                  initials={r.initials}
                  color={r.color}
                  size={42}
                  ring={assigneeId === r.id}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    color: assigneeId === r.id ? C.navy : C.muted,
                    fontWeight: assigneeId === r.id ? 500 : 400,
                  }}
                >
                  {r.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              display: "block",
              marginBottom: 7,
            }}
          >
            Due date
          </label>
          <button
            style={{
              width: "100%",
              padding: "12px 14px",
              border: `0.5px solid ${C.border}`,
              borderRadius: 10,
              backgroundColor: C.white,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              color: C.navy,
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <span>{dueDate}</span>
            <Calendar size={16} color={C.muted} strokeWidth={1.75} />
          </button>
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 28 }}>
          <label
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: C.muted,
              display: "block",
              marginBottom: 10,
            }}
          >
            Priority
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                { id: "low",    label: "Low",    borderColor: C.sand,  bgColor: `${C.sand}33`,  activeText: C.navy },
                { id: "normal", label: "Normal", borderColor: C.sage,  bgColor: `${C.sage}22`,  activeText: "#3a7a6e" },
                { id: "urgent", label: "Urgent", borderColor: C.red,   bgColor: `${C.red}18`,   activeText: C.red },
              ] as const
            ).map(({ id, label, borderColor, bgColor, activeText }) => {
              const active = priority === id;
              return (
                <button
                  key={id}
                  onClick={() => setPriority(id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 999,
                    border: `0.5px solid ${active ? borderColor : C.border}`,
                    backgroundColor: active ? bgColor : C.white,
                    color: active ? activeText : C.muted,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCreate}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 12,
            backgroundColor: C.navy,
            color: C.chalk,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 500,
            border: "none",
            cursor: name.trim() ? "pointer" : "not-allowed",
            opacity: name.trim() ? 1 : 0.45,
            transition: "opacity 0.15s",
          }}
        >
          Create task
        </button>
      </div>
    </div>
  );
}

// ─── Screen 4: Roommates ──────────────────────────────────────────────────
function RoommatesScreen({ tasks }: { tasks: Task[] }) {
  const unassigned = tasks.filter((t) => t.assigneeId === null && !t.done);
  const maxCompleted = Math.max(...ROOMMATES.map((r) => r.completed), 1);

  return (
    <div style={{ height: "100%", overflowY: "auto", backgroundColor: C.chalk }}>
      {/* Header */}
      <div style={{ backgroundColor: C.navy, padding: "12px 16px 24px" }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 26,
            fontWeight: 400,
            color: C.chalk,
            letterSpacing: "-0.5px",
          }}
        >
          Our home
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: C.sand,
            marginTop: 3,
          }}
        >
          Parkside Apartments, Unit 4B
        </p>
      </div>

      <div style={{ padding: "22px 16px 32px" }}>
        {/* This week heading */}
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 18,
            fontWeight: 400,
            color: C.navy,
            letterSpacing: "-0.5px",
            marginBottom: 14,
          }}
        >
          This week
        </h2>

        {/* Roommate rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...ROOMMATES]
            .sort((a, b) => b.completed - a.completed)
            .map((r, i) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: C.white,
                  borderRadius: 12,
                  border: `0.5px solid ${C.border}`,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: i === 0 ? C.sage : C.muted,
                    fontWeight: i === 0 ? 500 : 400,
                    width: 16,
                    flexShrink: 0,
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </span>

                <Avatar initials={r.initials} color={r.color} size={40} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          color: C.navy,
                          marginBottom: 2,
                        }}
                      >
                        {r.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          color: C.muted,
                        }}
                      >
                        {r.completed} tasks completed
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          color: C.muted,
                          marginBottom: 2,
                        }}
                      >
                        pending
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          color: C.navy,
                        }}
                      >
                        {r.pending}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: `${C.sand}44`,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(r.completed / maxCompleted) * 100}%`,
                        backgroundColor: C.sage,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Unassigned tasks */}
        <div style={{ marginTop: 32 }}>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18,
              fontWeight: 400,
              color: C.navy,
              letterSpacing: "-0.5px",
              marginBottom: 14,
            }}
          >
            Unassigned tasks
          </h2>

          {unassigned.length === 0 ? (
            <div
              style={{
                backgroundColor: C.white,
                borderRadius: 12,
                border: `0.5px solid ${C.border}`,
                padding: "32px 16px",
                textAlign: "center",
              }}
            >
              <Check
                size={20}
                color={C.sage}
                style={{ margin: "0 auto 8px" }}
              />
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: C.muted,
                }}
              >
                All tasks are assigned
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {unassigned.map((task) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: C.white,
                    borderRadius: 12,
                    border: `0.5px solid ${C.border}`,
                    borderLeft: `3px solid ${priorityBorderColor(task.priority)}`,
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        color: C.navy,
                        marginBottom: 5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.name}
                    </p>
                    <RoomTag room={task.room} />
                  </div>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      backgroundColor: `${C.sage}22`,
                      border: `0.5px solid ${C.sage}`,
                      color: "#3a7a6e",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Settings placeholder ──────────────────────────────────────────────────
function SettingsScreen() {
  const items = [
    { label: "Account & profile", sub: "Lucas Berg · lucas@havn.app" },
    { label: "Notifications",     sub: "Task reminders, due dates" },
    { label: "Home preferences",  sub: "Parkside Apartments, Unit 4B" },
    { label: "Privacy & data",    sub: "Manage your data" },
    { label: "About Havn",        sub: "Version 1.0.0" },
  ];
  return (
    <div style={{ height: "100%", overflowY: "auto", backgroundColor: C.chalk }}>
      <div style={{ backgroundColor: C.navy, padding: "12px 16px 24px" }}>
        <h1
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 26,
            fontWeight: 400,
            color: C.chalk,
            letterSpacing: "-0.5px",
          }}
        >
          Settings
        </h1>
      </div>

      {/* Profile card */}
      <div style={{ padding: "20px 16px 0" }}>
        <div
          style={{
            backgroundColor: C.white,
            borderRadius: 12,
            border: `0.5px solid ${C.border}`,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <Avatar initials="LB" color="#8B9BB4" size={48} />
          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: C.navy,
              }}
            >
              Lucas Berg
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
                color: C.muted,
                marginTop: 2,
              }}
            >
              lucas@havn.app
            </p>
          </div>
        </div>

        <div
          style={{
            backgroundColor: C.white,
            borderRadius: 12,
            border: `0.5px solid ${C.border}`,
            overflow: "hidden",
          }}
        >
          {items.map(({ label, sub }, i) => (
            <div
              key={label}
              style={{
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: i < items.length - 1 ? `0.5px solid ${C.border}` : "none",
                cursor: "pointer",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: C.navy,
                    marginBottom: 2,
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  {sub}
                </p>
              </div>
              <ChevronRight size={16} color={C.muted} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]       = useState<ScreenId>("home");
  const [tasks, setTasks]         = useState<Task[]>(INITIAL_TASKS);
  const [showModal, setShowModal] = useState(false);

  const toggleTask = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTask = (task: Task) =>
    setTasks((prev) => [task, ...prev]);

  const navItems: { id: ScreenId; label: string; Icon: React.FC<any> }[] = [
    { id: "home",      label: "Home",      Icon: Home },
    { id: "tasks",     label: "Tasks",     Icon: ClipboardList },
    { id: "roommates", label: "Roommates", Icon: Users },
    { id: "settings",  label: "Settings",  Icon: Settings },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#09090D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: 390,
          height: 844,
          position: "relative",
          borderRadius: 48,
          overflow: "hidden",
          backgroundColor: C.chalk,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Status bar */}
        <StatusBar dark />

        {/* Screen content */}
        <div
          style={{
            position: "absolute",
            top: 44,
            bottom: 80,
            left: 0,
            right: 0,
            overflow: "hidden",
          }}
        >
          {screen === "home" && (
            <HomeScreen
              tasks={tasks}
              onToggle={toggleTask}
              onNavToTasks={() => setScreen("tasks")}
            />
          )}
          {screen === "tasks" && (
            <TasksScreen tasks={tasks} onToggle={toggleTask} />
          )}
          {screen === "roommates" && <RoommatesScreen tasks={tasks} />}
          {screen === "settings"  && <SettingsScreen />}
        </div>

        {/* Floating Action Button — tasks screen only */}
        {screen === "tasks" && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: "absolute",
              bottom: 96,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: C.navy,
              border: `1px solid ${C.sage}`,
              color: C.sage,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 20,
            }}
          >
            <Plus size={22} strokeWidth={1.75} />
          </button>
        )}

        {/* Bottom navigation */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: C.white,
            borderTop: `0.5px solid ${C.border}`,
            display: "flex",
            alignItems: "flex-start",
            paddingTop: 12,
            zIndex: 30,
          }}
        >
          {navItems.map(({ id, label, Icon }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                onClick={() => setScreen(id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: active ? C.sage : "#AEADA6",
                  padding: 0,
                }}
              >
                <Icon size={22} strokeWidth={active ? 1.75 : 1.5} />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 10,
                    fontWeight: active ? 500 : 400,
                    letterSpacing: "0.2px",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add task modal */}
        {showModal && (
          <AddTaskModal onClose={() => setShowModal(false)} onAdd={addTask} />
        )}
      </div>
    </div>
  );
}
