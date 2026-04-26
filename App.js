import { useState, useEffect, useRef, useCallback } from "react";

const THREAT_PATTERNS = {
  BRUTE_FORCE: {
    pattern: /failed (login|password|auth)|invalid credentials|authentication failure/i,
    severity: "HIGH",
    color: "#ff4444",
    icon: "🔴",
    description: "Brute Force Attack",
  },
  SQL_INJECTION: {
    pattern: /('|--|;|union\s+select|drop\s+table|insert\s+into|select\s+\*|1=1|or\s+1|xp_cmdshell)/i,
    severity: "CRITICAL",
    color: "#ff0066",
    icon: "💀",
    description: "SQL Injection Attempt",
  },
  XSS: {
    pattern: /(<script|javascript:|onerror=|onload=|alert\(|document\.cookie)/i,
    severity: "HIGH",
    color: "#ff6600",
    icon: "⚠️",
    description: "XSS Attack",
  },
  PORT_SCAN: {
    pattern: /port scan|nmap|masscan|syn flood|connection refused.*multiple/i,
    severity: "MEDIUM",
    color: "#ffaa00",
    icon: "🟡",
    description: "Port Scanning",
  },
  DDOS: {
    pattern: /ddos|flood|rate limit exceeded|too many requests|connection reset by peer/i,
    severity: "CRITICAL",
    color: "#cc00ff",
    icon: "💥",
    description: "DDoS Attempt",
  },
  PRIVILEGE_ESCALATION: {
    pattern: /sudo|privilege|escalat|root access|permission denied.*admin/i,
    severity: "HIGH",
    color: "#ff3399",
    icon: "🔺",
    description: "Privilege Escalation",
  },
  NORMAL: {
    pattern: null,
    severity: "INFO",
    color: "#00ff88",
    icon: "🟢",
    description: "Normal Activity",
  },
};

const SAMPLE_LOG_TEMPLATES = [
  { msg: "192.168.1.{ip} - Failed login attempt for user admin", type: "BRUTE_FORCE" },
  { msg: "192.168.1.{ip} - Failed login attempt for user root", type: "BRUTE_FORCE" },
  { msg: "10.0.0.{ip} - GET /login?user=admin'--&pass=x HTTP/1.1", type: "SQL_INJECTION" },
  { msg: "10.0.0.{ip} - POST /search?q=1' OR 1=1; DROP TABLE users--", type: "SQL_INJECTION" },
  { msg: "172.16.0.{ip} - GET /page?name=<script>alert(document.cookie)</script>", type: "XSS" },
  { msg: "192.168.0.{ip} - Connection refused on port 22,23,80,443,3306", type: "PORT_SCAN" },
  { msg: "10.10.0.{ip} - Rate limit exceeded: 5000 requests in 10 seconds", type: "DDOS" },
  { msg: "192.168.1.{ip} - sudo su - attempted by user guest", type: "PRIVILEGE_ESCALATION" },
  { msg: "192.168.1.{ip} - GET /dashboard HTTP/1.1 200 OK", type: "NORMAL" },
  { msg: "10.0.0.{ip} - User john logged in successfully", type: "NORMAL" },
  { msg: "192.168.2.{ip} - File /var/log/auth.log accessed", type: "NORMAL" },
  { msg: "172.16.{ip}.1 - Backup job completed successfully", type: "NORMAL" },
];

function generateLog() {
  const template = SAMPLE_LOG_TEMPLATES[Math.floor(Math.random() * SAMPLE_LOG_TEMPLATES.length)];
  const ip = Math.floor(Math.random() * 254) + 1;
  const msg = template.msg.replace("{ip}", ip);
  const now = new Date();
  const time = now.toTimeString().split(" ")[0];
  const date = now.toISOString().split("T")[0];
  return {
    id: Date.now() + Math.random(),
    raw: `[${date} ${time}] ${msg}`,
    message: msg,
    timestamp: `${time}`,
    type: template.type,
    ip: `192.168.${Math.floor(Math.random() * 10)}.${ip}`,
    ...THREAT_PATTERNS[template.type],
  };
}

function detectThreat(logLine) {
  for (const [type, config] of Object.entries(THREAT_PATTERNS)) {
    if (type === "NORMAL") continue;
    if (config.pattern && config.pattern.test(logLine)) {
      return { type, ...config };
    }
  }
  return { type: "NORMAL", ...THREAT_PATTERNS.NORMAL };
}

function MatrixBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = "01アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMN";
    function draw() {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#003311";
      ctx.font = "14px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.98 ? "#00ff88" : "#003311";
        ctx.fillText(char, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, zIndex: 0, opacity: 0.15 }} />;
}

function SeverityBadge({ severity, color }) {
  return (
    <span style={{
      background: color + "22",
      color: color,
      border: `1px solid ${color}44`,
      padding: "2px 10px",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1px",
      fontFamily: "monospace",
    }}>
      {severity}
    </span>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: "rgba(0,10,5,0.85)",
      border: `1px solid ${color}44`,
      borderTop: `3px solid ${color}`,
      borderRadius: "8px",
      padding: "18px 20px",
      flex: 1,
      minWidth: "140px",
      boxShadow: `0 0 20px ${color}11`,
    }}>
      <div style={{ color: "#556655", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px", fontFamily: "monospace" }}>
        {label}
      </div>
      <div style={{ color, fontSize: "32px", fontWeight: "900", fontFamily: "monospace", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ color: "#445544", fontSize: "11px", marginTop: "6px", fontFamily: "monospace" }}>{sub}</div>}
    </div>
  );
}

function ThreatBar({ label, count, max, color }) {
  const pct = max ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ color: "#88aa88", fontSize: "12px", fontFamily: "monospace" }}>{label}</span>
        <span style={{ color, fontSize: "12px", fontFamily: "monospace", fontWeight: "700" }}>{count}</span>
      </div>
      <div style={{ height: "6px", background: "#0a1a0a", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: "3px",
          transition: "width 0.5s ease",
          boxShadow: `0 0 8px ${color}`,
        }} />
      </div>
    </div>
  );
}

export default function CyberThreatDashboard() {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [running, setRunning] = useState(false);
  const [customLog, setCustomLog] = useState("");
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, blocked: 0 });
  const [threatCounts, setThreatCounts] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newAlert, setNewAlert] = useState(null);
  const logsEndRef = useRef(null);
  const intervalRef = useRef(null);

  const processLog = useCallback((logEntry) => {
    setLogs(prev => [logEntry, ...prev].slice(0, 200));
    if (logEntry.type !== "NORMAL") {
      const alert = { ...logEntry, id: Date.now() + Math.random(), time: new Date().toLocaleTimeString() };
      setAlerts(prev => [alert, ...prev].slice(0, 100));
      setNewAlert(alert);
      setTimeout(() => setNewAlert(null), 3000);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        critical: prev.critical + (logEntry.severity === "CRITICAL" ? 1 : 0),
        high: prev.high + (logEntry.severity === "HIGH" ? 1 : 0),
        medium: prev.medium + (logEntry.severity === "MEDIUM" ? 1 : 0),
        blocked: prev.blocked + (Math.random() > 0.3 ? 1 : 0),
      }));
      setThreatCounts(prev => ({ ...prev, [logEntry.description]: (prev[logEntry.description] || 0) + 1 }));
    }
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        processLog(generateLog());
      }, 800 + Math.random() * 1200);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, processLog]);

  const handleCustomLog = () => {
    if (!customLog.trim()) return;
    const detected = detectThreat(customLog);
    const entry = {
      id: Date.now(),
      raw: `[${new Date().toISOString().replace("T", " ").slice(0, 19)}] ${customLog}`,
      message: customLog,
      timestamp: new Date().toLocaleTimeString(),
      type: detected.type,
      ip: "MANUAL",
      ...detected,
    };
    processLog(entry);
    setCustomLog("");
  };

  const maxThreat = Math.max(...Object.values(threatCounts), 1);

  const tabs = ["dashboard", "live logs", "alerts", "analyzer"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000a05",
      color: "#00cc66",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      <MatrixBg />

      {/* Flash alert */}
      {newAlert && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          background: newAlert.color + "22",
          border: `2px solid ${newAlert.color}`,
          borderRadius: "8px",
          padding: "14px 20px",
          maxWidth: "360px",
          boxShadow: `0 0 30px ${newAlert.color}55`,
          animation: "slideIn 0.3s ease",
        }}>
          <div style={{ fontSize: "12px", color: newAlert.color, fontWeight: "700", marginBottom: "4px" }}>
            {newAlert.icon} THREAT DETECTED — {newAlert.severity}
          </div>
          <div style={{ fontSize: "11px", color: "#aaccaa" }}>{newAlert.description}</div>
          <div style={{ fontSize: "10px", color: "#557755", marginTop: "4px", wordBreak: "break-all" }}>
            {newAlert.message?.slice(0, 80)}...
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", borderBottom: "1px solid #003311", paddingBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "4px", color: "#00ff88" }}>
              ⚔ CYBERWATCH
            </div>
            <div style={{ fontSize: "11px", color: "#335533", letterSpacing: "3px" }}>
              REAL-TIME THREAT DETECTION SYSTEM v2.4.1
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: running ? "#00ff88" : "#ff4444",
              boxShadow: running ? "0 0 12px #00ff88" : "0 0 12px #ff4444",
              animation: running ? "pulse 1s infinite" : "none",
            }} />
            <span style={{ fontSize: "11px", color: running ? "#00ff88" : "#ff4444" }}>
              {running ? "MONITORING ACTIVE" : "SYSTEM IDLE"}
            </span>
            <button
              onClick={() => setRunning(r => !r)}
              style={{
                background: running ? "#ff000022" : "#00ff8822",
                border: `1px solid ${running ? "#ff4444" : "#00ff88"}`,
                color: running ? "#ff4444" : "#00ff88",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontWeight: "700",
                fontSize: "12px",
                letterSpacing: "1px",
              }}
            >
              {running ? "⏹ STOP" : "▶ START"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "#00ff8822" : "transparent",
                border: `1px solid ${activeTab === tab ? "#00ff88" : "#113311"}`,
                color: activeTab === tab ? "#00ff88" : "#335533",
                padding: "8px 18px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <StatCard label="THREATS DETECTED" value={stats.total} color="#ff4444" sub="since session start" />
              <StatCard label="CRITICAL" value={stats.critical} color="#ff0066" sub="immediate action needed" />
              <StatCard label="HIGH SEVERITY" value={stats.high} color="#ff6600" sub="review required" />
              <StatCard label="BLOCKED" value={stats.blocked} color="#00ff88" sub="auto-mitigated" />
              <StatCard label="LOGS ANALYZED" value={logs.length} color="#4488ff" sub="total entries" />
            </div>

            {/* Threat Breakdown */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: "300px", background: "rgba(0,10,5,0.85)", border: "1px solid #113311", borderRadius: "8px", padding: "20px" }}>
                <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "16px" }}>
                  ▸ THREAT DISTRIBUTION
                </div>
                {Object.keys(threatCounts).length === 0 ? (
                  <div style={{ color: "#334433", fontSize: "12px", textAlign: "center", padding: "20px" }}>
                    Start monitoring to see threat distribution
                  </div>
                ) : (
                  Object.entries(threatCounts).map(([desc, count]) => {
                    const match = Object.values(THREAT_PATTERNS).find(p => p.description === desc);
                    return (
                      <ThreatBar key={desc} label={desc} count={count} max={maxThreat} color={match?.color || "#00ff88"} />
                    );
                  })
                )}
              </div>

              {/* Recent Alerts */}
              <div style={{ flex: 1, minWidth: "280px", background: "rgba(0,10,5,0.85)", border: "1px solid #113311", borderRadius: "8px", padding: "20px", maxHeight: "280px", overflowY: "auto" }}>
                <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "16px" }}>
                  ▸ RECENT ALERTS
                </div>
                {alerts.slice(0, 10).map(a => (
                  <div key={a.id} style={{
                    borderLeft: `2px solid ${a.color}`,
                    paddingLeft: "10px",
                    marginBottom: "10px",
                  }}>
                    <div style={{ fontSize: "11px", color: a.color, fontWeight: "700" }}>{a.icon} {a.description}</div>
                    <div style={{ fontSize: "10px", color: "#446644" }}>{a.timestamp} — {a.ip}</div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div style={{ color: "#334433", fontSize: "11px" }}>No alerts yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Live Logs Tab */}
        {activeTab === "live logs" && (
          <div style={{
            background: "rgba(0,5,2,0.95)",
            border: "1px solid #113311",
            borderRadius: "8px",
            padding: "16px",
            height: "520px",
            overflowY: "auto",
            fontFamily: "monospace",
          }}>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "12px" }}>
              ▸ LIVE LOG STREAM — {logs.length} ENTRIES
            </div>
            {logs.length === 0 && (
              <div style={{ color: "#334433", fontSize: "12px", padding: "20px", textAlign: "center" }}>
                Press START to begin monitoring log files...
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} style={{
                display: "flex",
                gap: "12px",
                padding: "6px 8px",
                borderRadius: "4px",
                marginBottom: "3px",
                background: log.type !== "NORMAL" ? log.color + "08" : "transparent",
                borderLeft: `2px solid ${log.type !== "NORMAL" ? log.color : "#113311"}`,
                animation: "fadeIn 0.3s ease",
              }}>
                <span style={{ color: "#334433", minWidth: "80px", fontSize: "11px" }}>{log.timestamp}</span>
                <span style={{ fontSize: "11px" }}>{log.icon}</span>
                <span style={{ color: log.type !== "NORMAL" ? log.color : "#336633", fontSize: "11px", flex: 1, wordBreak: "break-all" }}>
                  {log.message}
                </span>
                {log.type !== "NORMAL" && <SeverityBadge severity={log.severity} color={log.color} />}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div style={{
            background: "rgba(0,5,2,0.95)",
            border: "1px solid #113311",
            borderRadius: "8px",
            padding: "16px",
            height: "520px",
            overflowY: "auto",
          }}>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "12px" }}>
              ▸ THREAT ALERTS — {alerts.length} TOTAL
            </div>
            {alerts.length === 0 && (
              <div style={{ color: "#334433", fontSize: "12px", padding: "40px", textAlign: "center" }}>
                No threats detected yet. Start monitoring.
              </div>
            )}
            {alerts.map((a, i) => (
              <div key={a.id} style={{
                background: a.color + "0d",
                border: `1px solid ${a.color}33`,
                borderLeft: `4px solid ${a.color}`,
                borderRadius: "6px",
                padding: "14px 16px",
                marginBottom: "10px",
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{a.icon}</span>
                    <span style={{ color: a.color, fontWeight: "700", fontSize: "13px" }}>{a.description}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <SeverityBadge severity={a.severity} color={a.color} />
                    <span style={{ color: "#335533", fontSize: "11px" }}>{a.timestamp}</span>
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#558855", fontFamily: "monospace", wordBreak: "break-all", background: "#000a0511", padding: "8px", borderRadius: "4px" }}>
                  {a.message}
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "16px" }}>
                  <span style={{ fontSize: "10px", color: "#446644" }}>IP: {a.ip}</span>
                  <span style={{ fontSize: "10px", color: "#446644" }}>TYPE: {a.type}</span>
                  <span style={{ fontSize: "10px", color: "#00cc66", marginLeft: "auto" }}>
                    {Math.random() > 0.5 ? "✓ AUTO-BLOCKED" : "⚠ REVIEW NEEDED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analyzer Tab */}
        {activeTab === "analyzer" && (
          <div>
            <div style={{ background: "rgba(0,10,5,0.85)", border: "1px solid #113311", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "14px" }}>
                ▸ MANUAL LOG ANALYZER — Paste any log line to detect threats
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  value={customLog}
                  onChange={e => setCustomLog(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCustomLog()}
                  placeholder="Paste a log line here... e.g: Failed login for user admin OR SELECT * FROM users WHERE 1=1"
                  style={{
                    flex: 1,
                    background: "#000a05",
                    border: "1px solid #224422",
                    borderRadius: "4px",
                    padding: "10px 14px",
                    color: "#00cc66",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleCustomLog}
                  style={{
                    background: "#00ff8822",
                    border: "1px solid #00ff88",
                    color: "#00ff88",
                    padding: "10px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontWeight: "700",
                    fontSize: "12px",
                  }}
                >
                  ANALYZE
                </button>
              </div>
            </div>

            {/* Pattern Reference */}
            <div style={{ background: "rgba(0,10,5,0.85)", border: "1px solid #113311", borderRadius: "8px", padding: "20px" }}>
              <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#446644", marginBottom: "14px" }}>
                ▸ DETECTION PATTERNS REFERENCE
              </div>
              {Object.entries(THREAT_PATTERNS).filter(([k]) => k !== "NORMAL").map(([key, p]) => (
                <div key={key} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  background: p.color + "08",
                  border: `1px solid ${p.color}22`,
                }}>
                  <span style={{ fontSize: "18px" }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ color: p.color, fontWeight: "700", fontSize: "12px" }}>{p.description}</span>
                      <SeverityBadge severity={p.severity} color={p.color} />
                    </div>
                    <div style={{ fontSize: "11px", color: "#446644", fontFamily: "monospace" }}>
                      Pattern: {p.pattern?.toString().slice(1, 80)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "10px", color: "#224422", letterSpacing: "2px" }}>
          CYBERWATCH THREAT DETECTION ENGINE — JAVA HACKATHON PROJECT — ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#000a05} ::-webkit-scrollbar-thumb{background:#113311;border-radius:2px}
      `}</style>
    </div>
  );
}
