// ══════════════════════════════════════════════════════════════════════════
// PORTFOLIO ADMIN
// ══════════════════════════════════════════════════════════════════════════
// HOW THE SYSTEM WORKS:
//
//   /public/photos/     — all images shown in the photo gallery
//   /public/svgs/       — all SVG drawings used in project cards / modals
//   /public/cv/         — your CV PDF
//   /public/config.json — single file holding ALL metadata:
//                         photo names/captions/ordering, SVG project slots,
//                         project data, CV entries, site text
//
//   The admin lets you:
//     • Upload files to any folder (drag-and-drop or picker)
//     • Edit metadata for every photo and SVG inline
//     • Assign SVGs to project card/modal slots
//     • Create/edit/delete projects with full detail editing
//     • Edit all CV and site text
//     • Hit "Save to GitHub" — writes config.json via GitHub API
//
//   The frontend reads config.json on load — no hardcoded content.
//
// SETUP:
//   1. GitHub fine-grained token → only your repo → Contents read+write
//   2. In browser console: const t = btoa("github_pat_..."); 
//      console.log(t.slice(0,30), t.slice(30,60), t.slice(60))
//   3. Paste the 3 chunks into loadToken() below
//   4. Set GH.owner and GH.repo
//   5. Add admin.jsx to .gitignore (it contains your token)
// ══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useCallback } from "react";

// ── CHANGE THESE ──────────────────────────────────────────────────────────
const ADMIN_PASSWORD = "portfolio2025";

function loadToken() {
  console.log(import.meta.env.VITE_GH_TOKEN)
  return import.meta.env.VITE_GH_TOKEN || "";
}

const GH = {
  owner:  "teituroli",  // ← change
  repo:   "DKA",         // ← change
  branch: "main",
  token:  loadToken(),
};

const PATHS = {
  photos: "public/photos",
  svgs:   "public/svgs",
  cv:     "public/cv",
  config: "public/config.json",
};

// ── GITHUB HELPERS ────────────────────────────────────────────────────────
async function ghFetch(path, opts = {}) {
  const res = await fetch(
    `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${path}`,
    {
      ...opts,
      headers: {
        Authorization: `Bearer ${GH.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opts.headers || {}),
      },
    }
  );
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || `GitHub ${res.status}`);
  }
  return res.json();
}

async function listFolder(folder) {
  try {
    const files = await ghFetch(folder);
    return Array.isArray(files)
      ? files.filter(f => f.type === "file" && !f.name.startsWith("."))
      : [];
  } catch { return []; }
}

async function getFileSha(path) {
  try { return (await ghFetch(path)).sha; }
  catch { return null; }
}

async function putFile(path, base64Content, message) {
  const sha = await getFileSha(path);
  const body = { message, content: base64Content, branch: GH.branch };
  if (sha) body.sha = sha;
  return ghFetch(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteGhFile(path, sha) {
  return ghFetch(path, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `admin: delete ${path.split("/").pop()}`,
      sha, branch: GH.branch,
    }),
  });
}

async function loadConfig() {
  try {
    const f = await ghFetch(PATHS.config);
    return JSON.parse(atob(f.content.replace(/\n/g, "")));
  } catch {
    return { site: {}, photos: [], svgs: [], projects: [], cv: { education: [], exhibitions: [], experience: [], tools: [] } };
  }
}

async function saveConfig(cfg) {
  const json = JSON.stringify(cfg, null, 2);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  await putFile(PATHS.config, encoded, "admin: update config.json");
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const rawUrl = (folder, filename) =>
  `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${folder}/${filename}`;

// ════════════════════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════════════════════
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --bone:#F0EBE1;--bone2:#E6E0D4;--bone3:#DDD7CC;
  --dark:#181714;--mid:#5C564E;--light:#9B9188;
  --amber:#C4A87A;--green:#6A9E6E;--red:#A85252;
  --line:rgba(24,23,20,0.1);
  --serif:'DM Serif Display',serif;
  --mono:'Courier New',monospace;
  --body:'Cormorant Garamond',serif;
}
body{background:var(--bone);color:var(--dark);font-family:var(--body);min-height:100vh;}

.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
.login-wrap::before{content:'';position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:72px 72px;}
.login-box{position:relative;width:380px;padding:52px 44px;border:1px solid var(--line);background:var(--bone);}
.login-title{font-family:var(--serif);font-size:2rem;font-style:italic;margin-bottom:6px;}
.login-sub{font-family:var(--mono);font-size:.44rem;letter-spacing:.3em;text-transform:uppercase;color:var(--light);margin-bottom:44px;}

.f-label{display:block;font-family:var(--mono);font-size:.42rem;letter-spacing:.28em;text-transform:uppercase;color:var(--light);margin-bottom:8px;}
.f-input,.f-textarea,.f-select{width:100%;background:var(--bone2);border:1px solid var(--line);padding:10px 14px;font-family:var(--mono);font-size:.6rem;letter-spacing:.06em;color:var(--dark);outline:none;transition:border-color .25s;appearance:none;}
.f-textarea{resize:vertical;min-height:90px;line-height:1.7;font-family:var(--body);font-size:.9rem;letter-spacing:0;}
.f-input:focus,.f-textarea:focus,.f-select:focus{border-color:var(--dark);}
.f-input.err{border-color:var(--red);}
.f-row{margin-bottom:16px;}
.f-row.cols2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.f-row.cols3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.f-field{display:flex;flex-direction:column;}

.btn{padding:10px 18px;font-family:var(--mono);font-size:.44rem;letter-spacing:.24em;text-transform:uppercase;cursor:pointer;border:1px solid transparent;transition:all .22s;display:inline-flex;align-items:center;gap:8px;}
.btn-primary{background:var(--dark);color:var(--bone);border-color:var(--dark);}
.btn-primary:hover{background:#2a2825;}
.btn-primary:disabled{opacity:.4;cursor:default;}
.btn-secondary{background:transparent;color:var(--mid);border-color:var(--line);}
.btn-secondary:hover{border-color:var(--dark);color:var(--dark);}
.btn-danger{background:var(--red);color:var(--bone);border-color:var(--red);}
.btn-danger:hover{background:#8c3d3d;}
.btn-sm{padding:6px 12px;font-size:.38rem;letter-spacing:.2em;}
.btn-icon{padding:5px 8px;font-size:.65rem;border-color:var(--line);background:transparent;color:var(--mid);}
.btn-icon:hover{border-color:var(--dark);color:var(--dark);}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}

.shell{min-height:100vh;display:flex;flex-direction:column;}
.topbar{position:sticky;top:0;z-index:200;background:var(--dark);color:var(--bone);padding:18px 36px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(240,235,225,.07);}
.topbar-title{font-family:var(--mono);font-size:.52rem;letter-spacing:.28em;text-transform:uppercase;}
.topbar-right{display:flex;align-items:center;gap:18px;}
.topbar-right button,.topbar-right a{font-family:var(--mono);font-size:.42rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(240,235,225,.4);background:none;border:none;cursor:pointer;text-decoration:none;transition:color .22s;}
.topbar-right button:hover,.topbar-right a:hover{color:var(--bone);}
.repo-pill{font-family:var(--mono);font-size:.38rem;letter-spacing:.12em;background:rgba(240,235,225,.07);padding:5px 11px;color:rgba(196,168,122,.75);display:flex;align-items:center;gap:6px;}
.repo-dot{width:5px;height:5px;border-radius:50%;background:var(--green);flex-shrink:0;}
.repo-dot.off{background:var(--red);}

.body-wrap{display:flex;flex:1;}

.sidebar{width:205px;flex-shrink:0;background:var(--bone2);border-right:1px solid var(--line);padding:28px 0;position:sticky;top:57px;height:calc(100vh - 57px);overflow-y:auto;}
.sidebar-group-label{font-family:var(--mono);font-size:.37rem;letter-spacing:.32em;text-transform:uppercase;color:var(--light);padding:0 22px;margin-bottom:6px;margin-top:22px;}
.sidebar-item{display:flex;align-items:center;justify-content:space-between;padding:10px 22px;cursor:pointer;font-family:var(--mono);font-size:.44rem;letter-spacing:.15em;text-transform:uppercase;color:var(--mid);transition:all .18s;border-left:2px solid transparent;}
.sidebar-item:hover{color:var(--dark);background:rgba(24,23,20,.04);}
.sidebar-item.active{color:var(--dark);background:rgba(24,23,20,.06);border-left-color:var(--amber);}
.sidebar-badge{font-size:.34rem;background:var(--bone3);padding:2px 6px;color:var(--light);letter-spacing:.06em;}

.main{flex:1;padding:40px 48px;max-width:1060px;}
.section-head{margin-bottom:32px;}
.section-title{font-family:var(--serif);font-size:1.85rem;font-style:italic;font-weight:400;margin-bottom:4px;}
.section-sub{font-family:var(--mono);font-size:.41rem;letter-spacing:.22em;text-transform:uppercase;color:var(--light);}

.save-bar{position:sticky;bottom:0;z-index:100;background:var(--dark);padding:15px 48px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(240,235,225,.08);}
.save-bar-status{font-family:var(--mono);font-size:.4rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(240,235,225,.3);}
.save-bar-status.dirty{color:var(--amber);}

.divider{height:1px;background:var(--line);margin:28px 0;}

.dropzone{border:1px dashed rgba(24,23,20,.2);padding:40px 28px;text-align:center;transition:all .3s;background:var(--bone2);margin-bottom:24px;}
.dropzone.over{border-color:var(--amber);background:rgba(196,168,122,.06);}
.dropzone p{font-family:var(--mono);font-size:.44rem;letter-spacing:.18em;text-transform:uppercase;color:var(--light);margin-bottom:16px;}
.dropzone-types{font-family:var(--mono);font-size:.36rem;letter-spacing:.12em;text-transform:uppercase;color:var(--light);margin-top:10px;}

.q-item{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);}
.q-thumb{width:48px;height:38px;flex-shrink:0;overflow:hidden;background:var(--bone3);display:flex;align-items:center;justify-content:center;}
.q-thumb img{width:100%;height:100%;object-fit:cover;}
.q-name{font-family:var(--mono);font-size:.46rem;letter-spacing:.07em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;}
.q-size{font-family:var(--mono);font-size:.34rem;letter-spacing:.1em;text-transform:uppercase;color:var(--light);margin-top:2px;}
.q-bar-wrap{width:90px;height:2px;background:var(--line);flex-shrink:0;}
.q-bar{height:100%;background:var(--amber);transition:width .3s;}
.q-status{font-family:var(--mono);font-size:.36rem;letter-spacing:.12em;text-transform:uppercase;width:46px;text-align:right;flex-shrink:0;}
.q-status.ok{color:var(--green);}.q-status.err{color:var(--red);}.q-status.pending{color:var(--light);}

.file-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:3px;margin-top:8px;}
.file-tile{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--bone3);cursor:pointer;}
.file-tile img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s;}
.file-tile:hover img{transform:scale(1.05);}
.tile-overlay{position:absolute;inset:0;background:linear-gradient(transparent 40%,rgba(24,23,20,.68));opacity:0;transition:opacity .28s;display:flex;flex-direction:column;justify-content:flex-end;padding:8px 9px 7px;}
.file-tile:hover .tile-overlay{opacity:1;}
.tile-name{font-family:var(--mono);font-size:.36rem;letter-spacing:.08em;color:var(--bone);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tile-del{position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(24,23,20,.55);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--bone);opacity:0;transition:opacity .25s,background .18s;}
.file-tile:hover .tile-del{opacity:1;}
.tile-del:hover{background:var(--red);}

.meta-card{background:var(--bone2);border:1px solid var(--line);padding:16px 18px;}
.meta-thumb{width:100%;height:76px;object-fit:cover;margin-bottom:11px;background:var(--bone3);display:block;}
.meta-filename{font-family:var(--mono);font-size:.38rem;letter-spacing:.13em;text-transform:uppercase;color:var(--amber);margin-bottom:10px;}
.meta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:3px;margin-top:4px;}

.accordion{border:1px solid var(--line);margin-bottom:4px;}
.acc-head{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;cursor:pointer;background:var(--bone2);transition:background .18s;user-select:none;}
.acc-head:hover{background:var(--bone3);}
.acc-htitle{font-family:var(--serif);font-size:.98rem;}
.acc-hmeta{font-family:var(--mono);font-size:.38rem;letter-spacing:.12em;text-transform:uppercase;color:var(--light);display:flex;gap:10px;margin-top:2px;}
.acc-chevron{font-family:var(--mono);font-size:.48rem;color:var(--light);transition:transform .18s;flex-shrink:0;margin-left:12px;}
.acc-chevron.open{transform:rotate(90deg);}
.acc-body{padding:18px 18px 22px;background:var(--bone);border-top:1px solid var(--line);}

.tag-wrap{display:flex;flex-wrap:wrap;gap:5px;padding:7px 11px;background:var(--bone2);border:1px solid var(--line);min-height:40px;align-items:center;transition:border-color .22s;}
.tag-wrap.focus{border-color:var(--dark);}
.tag-pill{font-family:var(--mono);font-size:.38rem;letter-spacing:.12em;text-transform:uppercase;padding:3px 9px;background:var(--bone3);color:var(--mid);display:flex;align-items:center;gap:5px;}
.tag-pill button{background:none;border:none;cursor:pointer;color:var(--light);font-size:.55rem;line-height:1;padding:0;}
.tag-pill button:hover{color:var(--red);}
.tag-input-el{border:none;outline:none;background:transparent;font-family:var(--mono);font-size:.48rem;letter-spacing:.06em;color:var(--dark);flex:1;min-width:70px;}

.specs-table{width:100%;border-collapse:collapse;margin-bottom:8px;}
.specs-table td{padding:7px 10px;border:1px solid var(--line);}
.specs-table td:first-child{width:36%;background:var(--bone2);}
.specs-table input{width:100%;background:transparent;border:none;outline:none;font-family:var(--mono);font-size:.48rem;letter-spacing:.07em;color:var(--dark);}
.add-spec{display:flex;gap:7px;margin-top:6px;}

.warn-box{background:rgba(168,82,82,.07);border:1px solid rgba(168,82,82,.2);padding:18px 22px;margin-bottom:24px;}
.warn-box h4{font-family:var(--mono);font-size:.44rem;letter-spacing:.2em;text-transform:uppercase;color:var(--red);margin-bottom:7px;}
.warn-box p{font-family:var(--mono);font-size:.4rem;letter-spacing:.09em;color:var(--mid);line-height:1.9;}
.warn-box code{background:var(--bone2);padding:1px 5px;font-size:.38rem;}

.empty-msg{font-family:var(--mono);font-size:.42rem;letter-spacing:.16em;text-transform:uppercase;color:var(--light);padding:28px 0;}

.toast-stack{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:5px;pointer-events:none;}
.toast{font-family:var(--mono);font-size:.42rem;letter-spacing:.14em;text-transform:uppercase;padding:10px 16px;background:var(--dark);color:var(--bone);border-left:3px solid var(--amber);animation:tIn .22s ease;}
.toast.ok{border-left-color:var(--green);}.toast.err{border-left-color:var(--red);}
@keyframes tIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}

@media(max-width:768px){.sidebar{display:none;}.main{padding:24px 18px;}.topbar{padding:15px 18px;}}
`;

// ════════════════════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "ok") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, add };
}

function Field({ label, children, style }) {
  return (
    <div className="f-field" style={style}>
      <label className="f-label">{label}</label>
      {children}
    </div>
  );
}

function TagInput({ value = [], onChange, placeholder = "Add…" }) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div className={`tag-wrap ${focused ? "focus" : ""}`}>
      {value.map(t => (
        <span className="tag-pill" key={t}>
          {t}
          <button type="button" onClick={() => onChange(value.filter(x => x !== t))}>×</button>
        </span>
      ))}
      <input className="tag-input-el" value={draft}
        placeholder={value.length === 0 ? placeholder : ""}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); commit(); }}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
      />
    </div>
  );
}

function SpecsEditor({ specs = {}, onChange }) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const entries = Object.entries(specs);

  const updateEntry = (oldKey, key, val) => {
    const next = {};
    for (const [k, v] of Object.entries(specs))
      next[k === oldKey ? key : k] = k === oldKey ? val : v;
    onChange(next);
  };

  return (
    <div>
      {entries.length > 0 && (
        <table className="specs-table">
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k}>
                <td><input value={k} onChange={e => updateEntry(k, e.target.value, v)} /></td>
                <td><input value={v} onChange={e => updateEntry(k, k, e.target.value)} /></td>
                <td style={{ width: 32, background: "transparent", padding: "4px" }}>
                  <button className="btn btn-icon btn-sm" type="button"
                    onClick={() => { const n = { ...specs }; delete n[k]; onChange(n); }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="add-spec">
        <input className="f-input" style={{ flex: 1 }} placeholder="Label"
          value={newKey} onChange={e => setNewKey(e.target.value)} />
        <input className="f-input" style={{ flex: 2 }} placeholder="Value"
          value={newVal} onChange={e => setNewVal(e.target.value)} />
        <button type="button" className="btn btn-secondary btn-sm"
          onClick={() => { if (!newKey.trim()) return; onChange({ ...specs, [newKey.trim()]: newVal.trim() }); setNewKey(""); setNewVal(""); }}>
          Add
        </button>
      </div>
    </div>
  );
}

function Accordion({ title, meta, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className="acc-head" onClick={() => setOpen(o => !o)}>
        <div>
          <div className="acc-htitle">{title}</div>
          {meta?.length > 0 && <div className="acc-hmeta">{meta.map((m, i) => <span key={i}>{m}</span>)}</div>}
        </div>
        <span className={`acc-chevron ${open ? "open" : ""}`}>›</span>
      </div>
      {open && <div className="acc-body">{children}</div>}
    </div>
  );
}

// File uploader with drag-drop
function Uploader({ folder, accept, label, toast, onDone }) {
  const [queue, setQueue] = useState([]);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const addFiles = files => setQueue(q => [
    ...q,
    ...Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2), file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      progress: 0, status: "pending",
    }))
  ]);

  const upload = async () => {
    for (const item of queue.filter(x => x.status === "pending")) {
      setQueue(q => q.map(x => x.id === item.id ? { ...x, status: "uploading", progress: 20 } : x));
      try {
        const b64 = await fileToBase64(item.file);
        setQueue(q => q.map(x => x.id === item.id ? { ...x, progress: 60 } : x));
        const sha = await getFileSha(`${folder}/${item.file.name}`);
        const body = { message: `admin: upload ${item.file.name}`, content: b64, branch: GH.branch };
        if (sha) body.sha = sha;
        await ghFetch(`${folder}/${item.file.name}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        setQueue(q => q.map(x => x.id === item.id ? { ...x, progress: 100, status: "ok" } : x));
        toast(`Uploaded ${item.file.name}`, "ok");
        onDone?.();
      } catch (e) {
        setQueue(q => q.map(x => x.id === item.id ? { ...x, status: "err" } : x));
        toast(`Failed: ${item.file.name} — ${e.message}`, "err");
      }
    }
  };

  const pending = queue.filter(x => x.status === "pending").length;

  return (
    <div>
      <div className={`dropzone ${dragging ? "over" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}>
        <p>Drop {label} here, or</p>
        <button type="button" className="btn btn-secondary btn-sm"
          onClick={() => ref.current?.click()}>Choose files</button>
        <input ref={ref} type="file" multiple accept={accept} style={{ display: "none" }}
          onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
        <p className="dropzone-types">Accepted: {accept}</p>
      </div>

      {queue.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {queue.map(item => (
            <div className="q-item" key={item.id}>
              <div className="q-thumb">
                {item.preview
                  ? <img src={item.preview} alt="" />
                  : <span style={{ fontFamily: "var(--mono)", fontSize: ".38rem", color: "var(--light)" }}>SVG</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="q-name">{item.file.name}</div>
                <div className="q-size">{(item.file.size / 1024).toFixed(1)} KB</div>
              </div>
              {item.status === "uploading" &&
                <div className="q-bar-wrap"><div className="q-bar" style={{ width: item.progress + "%" }} /></div>}
              <div className={`q-status ${item.status}`}>
                {item.status === "ok" ? "✓" : item.status === "err" ? "✗" : item.status === "uploading" ? "…" : "—"}
              </div>
              {item.status !== "uploading" &&
                <button type="button" className="btn btn-icon btn-sm"
                  onClick={() => setQueue(q => q.filter(x => x.id !== item.id))}>×</button>}
            </div>
          ))}
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-primary btn-sm"
              disabled={pending === 0} onClick={upload}>
              Upload {pending} file{pending !== 1 ? "s" : ""}
            </button>
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={() => setQueue(q => q.filter(x => x.status === "pending"))}>
              Clear done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PHOTOS SECTION
// Files in repo + metadata from config.photos
// Every file gets a metadata card; config is the source of truth for names etc.
// ════════════════════════════════════════════════════════════════════════════
function PhotosSection({ config, setConfig, toast, projects }) {
  const [repoFiles, setRepoFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    listFolder(PATHS.photos).then(f => { setRepoFiles(f); setLoading(false); });
  }, [refresh]);

  const photoMeta = config.photos || [];

  const getMeta = (filename) =>
    photoMeta.find(p => p.filename === filename) ?? {
      filename,
      displayName: filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
      year: String(new Date().getFullYear()),
      category: "", project: "", caption: "", order: 999,
    };

  const updateMeta = (filename, patch) => {
    setConfig(c => {
      const existing = c.photos.find(p => p.filename === filename);
      return {
        ...c,
        photos: existing
          ? c.photos.map(p => p.filename === filename ? { ...p, ...patch } : p)
          : [...c.photos, { ...getMeta(filename), ...patch }],
      };
    });
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.name} from the repo?`)) return;
    try {
      await deleteGhFile(`${PATHS.photos}/${file.name}`, file.sha);
      setConfig(c => ({ ...c, photos: c.photos.filter(p => p.filename !== file.name) }));
      toast(`Deleted ${file.name}`, "ok");
      setRefresh(r => r + 1);
    } catch (e) { toast(`Delete failed: ${e.message}`, "err"); }
  };

  const sorted = [...repoFiles].sort((a, b) => (getMeta(a.name).order ?? 999) - (getMeta(b.name).order ?? 999));

  return (
    <div>
      <div className="section-head">
        <h2 className="section-title">Photos</h2>
        <p className="section-sub">
          {repoFiles.length} file{repoFiles.length !== 1 ? "s" : ""} in /public/photos/
          — edit display info below each image, then Save to GitHub
        </p>
      </div>

      <Uploader folder={PATHS.photos} accept="image/jpeg,image/png,image/webp,image/gif"
        label="photos" toast={toast} onDone={() => setRefresh(r => r + 1)} />

      {loading
        ? <p className="empty-msg">Loading files…</p>
        : sorted.length === 0
          ? <p className="empty-msg">No photos yet — upload some above</p>
          : (
            <div className="meta-grid">
              {sorted.map(file => {
                const meta = getMeta(file.name);
                return (
                  <div className="meta-card" key={file.sha}>
                    <img className="meta-thumb" src={rawUrl(PATHS.photos, file.name)} alt={file.name} loading="lazy" />
                    <div className="meta-filename">{file.name}</div>

                    <div className="f-row" style={{ marginBottom: 10 }}>
                      <Field label="Display name">
                        <input className="f-input" value={meta.displayName}
                          onChange={e => updateMeta(file.name, { displayName: e.target.value })} />
                      </Field>
                    </div>
                    <div className="f-row cols2" style={{ marginBottom: 10 }}>
                      <Field label="Year">
                        <input className="f-input" value={meta.year}
                          onChange={e => updateMeta(file.name, { year: e.target.value })} />
                      </Field>
                      <Field label="Order ↕">
                        <input className="f-input" type="number" value={meta.order}
                          onChange={e => updateMeta(file.name, { order: parseInt(e.target.value) || 999 })} />
                      </Field>
                    </div>
                    <div className="f-row" style={{ marginBottom: 10 }}>
                      <Field label="Category">
                        <input className="f-input" placeholder="Furniture / Installation…" value={meta.category}
                          onChange={e => updateMeta(file.name, { category: e.target.value })} />
                      </Field>
                    </div>
                    <div className="f-row" style={{ marginBottom: 10 }}>
                      <Field label="Linked project">
                        <select className="f-select" value={meta.project}
                          onChange={e => updateMeta(file.name, { project: e.target.value })}>
                          <option value="">— none —</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="f-row" style={{ marginBottom: 12 }}>
                      <Field label="Caption">
                        <input className="f-input" placeholder="Short caption…" value={meta.caption}
                          onChange={e => updateMeta(file.name, { caption: e.target.value })} />
                      </Field>
                    </div>
                    <button type="button" className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(file)}>Delete file</button>
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SVGs SECTION
// ════════════════════════════════════════════════════════════════════════════
function SVGsSection({ config, setConfig, toast, projects }) {
  const [repoFiles, setRepoFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    listFolder(PATHS.svgs).then(f => { setRepoFiles(f); setLoading(false); });
  }, [refresh]);

  const svgMeta = config.svgs || [];

  const getMeta = (filename) =>
    svgMeta.find(s => s.filename === filename) ?? {
      filename,
      displayName: filename.replace(".svg", "").replace(/[-_]/g, " "),
      project: "", slot: "card",
    };

  const assign = (filename, projectId, slot) => {
    setConfig(c => {
      const existing = c.svgs.find(s => s.filename === filename);
      const updatedSvgs = existing
        ? c.svgs.map(s => s.filename === filename ? { ...s, project: projectId, slot } : s)
        : [...c.svgs, { ...getMeta(filename), project: projectId, slot }];

      // Also update the project's cardSvg / modalSvg reference
      const updatedProjects = c.projects.map(p => {
        if (p.id !== projectId) return p;
        return slot === "card"
          ? { ...p, cardSvg: filename }
          : { ...p, modalSvg: filename };
      });

      return { ...c, svgs: updatedSvgs, projects: updatedProjects };
    });
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.name}?`)) return;
    try {
      await deleteGhFile(`${PATHS.svgs}/${file.name}`, file.sha);
      setConfig(c => ({ ...c, svgs: c.svgs.filter(s => s.filename !== file.name) }));
      toast(`Deleted ${file.name}`, "ok");
      setRefresh(r => r + 1);
    } catch (e) { toast(`Delete failed: ${e.message}`, "err"); }
  };

  return (
    <div>
      <div className="section-head">
        <h2 className="section-title">SVG Drawings</h2>
        <p className="section-sub">
          Upload SVGs, then assign each one to a project card or modal slot
        </p>
      </div>

      <Uploader folder={PATHS.svgs} accept=".svg,image/svg+xml"
        label="SVG files" toast={toast} onDone={() => setRefresh(r => r + 1)} />

      {loading
        ? <p className="empty-msg">Loading…</p>
        : repoFiles.length === 0
          ? <p className="empty-msg">No SVGs yet</p>
          : (
            <div className="meta-grid">
              {repoFiles.map(file => {
                const meta = getMeta(file.name);
                const linked = projects.find(p => p.id === meta.project);
                return (
                  <div className="meta-card" key={file.sha}>
                    {/* SVG preview */}
                    <div style={{ width: "100%", height: 76, background: "var(--bone3)", marginBottom: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
                      <img src={rawUrl(PATHS.svgs, file.name)} alt={file.name}
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                    <div className="meta-filename">{file.name}</div>

                    <div className="f-row" style={{ marginBottom: 10 }}>
                      <Field label="Display name">
                        <input className="f-input" value={meta.displayName}
                          onChange={e => setConfig(c => ({
                            ...c, svgs: c.svgs.find(s => s.filename === file.name)
                              ? c.svgs.map(s => s.filename === file.name ? { ...s, displayName: e.target.value } : s)
                              : [...c.svgs, { ...getMeta(file.name), displayName: e.target.value }]
                          }))} />
                      </Field>
                    </div>
                    <div className="f-row cols2" style={{ marginBottom: 10 }}>
                      <Field label="Project">
                        <select className="f-select" value={meta.project}
                          onChange={e => assign(file.name, e.target.value, meta.slot)}>
                          <option value="">— none —</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                      </Field>
                      <Field label="Slot">
                        <select className="f-select" value={meta.slot}
                          onChange={e => assign(file.name, meta.project, e.target.value)}>
                          <option value="card">Card drawing</option>
                          <option value="modal">Modal drawing</option>
                        </select>
                      </Field>
                    </div>

                    {linked && (
                      <div style={{ fontFamily: "var(--mono)", fontSize: ".36rem", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>
                        → {linked.title} · {meta.slot}
                      </div>
                    )}

                    <button type="button" className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(file)}>Delete</button>
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROJECTS SECTION
// ════════════════════════════════════════════════════════════════════════════
function ProjectsSection({ config, setConfig, toast }) {
  const projects = config.projects || [];
  const svgFiles = (config.svgs || []).map(s => s.filename);

  const update = (id, patch) =>
    setConfig(c => ({ ...c, projects: c.projects.map(p => p.id === id ? { ...p, ...patch } : p) }));

  const remove = (id) => {
    if (!confirm("Remove this project from config?")) return;
    setConfig(c => ({ ...c, projects: c.projects.filter(p => p.id !== id) }));
  };

  const addNew = () => {
    const id = "project-" + Date.now();
    setConfig(c => ({
      ...c,
      projects: [...c.projects, {
        id, title: "New Project",
        year: String(new Date().getFullYear()),
        material: "", blurb: "", description: "",
        cardSvg: null, modalSvg: null,
        cardBg: "#D6C9AF", specs: {}, order: c.projects.length + 1,
      }],
    }));
  };

  const sorted = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div>
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="section-title">Projects</h2>
          <p className="section-sub">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={addNew}>+ New project</button>
      </div>

      {sorted.length === 0 && <p className="empty-msg">No projects yet</p>}

      {sorted.map(p => (
        <Accordion key={p.id} title={p.title || "Untitled"} meta={[p.year, p.material].filter(Boolean)}>
          <div className="f-row cols2">
            <Field label="Title">
              <input className="f-input" value={p.title}
                onChange={e => update(p.id, { title: e.target.value })} />
            </Field>
            <Field label="Year">
              <input className="f-input" value={p.year}
                onChange={e => update(p.id, { year: e.target.value })} />
            </Field>
          </div>
          <div className="f-row">
            <Field label="Material">
              <input className="f-input" placeholder="e.g. Beech / Steel Cable" value={p.material}
                onChange={e => update(p.id, { material: e.target.value })} />
            </Field>
          </div>
          <div className="f-row">
            <Field label="Short blurb (card)">
              <input className="f-input" value={p.blurb}
                onChange={e => update(p.id, { blurb: e.target.value })} />
            </Field>
          </div>
          <div className="f-row">
            <Field label="Full description (modal)">
              <textarea className="f-textarea" value={p.description}
                onChange={e => update(p.id, { description: e.target.value })} />
            </Field>
          </div>
          <div className="f-row cols3">
            <Field label="Card SVG">
              <select className="f-select" value={p.cardSvg || ""}
                onChange={e => update(p.id, { cardSvg: e.target.value || null })}>
                <option value="">— none —</option>
                {svgFiles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Modal SVG">
              <select className="f-select" value={p.modalSvg || ""}
                onChange={e => update(p.id, { modalSvg: e.target.value || null })}>
                <option value="">— none —</option>
                {svgFiles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Card background">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={p.cardBg || "#D6C9AF"}
                  onChange={e => update(p.id, { cardBg: e.target.value })}
                  style={{ width: 38, height: 38, border: "1px solid var(--line)", cursor: "pointer", padding: 2, background: "none" }} />
                <input className="f-input" value={p.cardBg}
                  onChange={e => update(p.id, { cardBg: e.target.value })} style={{ flex: 1 }} />
              </div>
            </Field>
          </div>
          <div className="f-row">
            <Field label="Specs (label / value pairs)">
              <SpecsEditor specs={p.specs} onChange={specs => update(p.id, { specs })} />
            </Field>
          </div>
          <div className="f-row cols2">
            <Field label="Display order">
              <input className="f-input" type="number" value={p.order}
                onChange={e => update(p.id, { order: parseInt(e.target.value) || 0 })} />
            </Field>
            <Field label="Internal ID">
              <input className="f-input" value={p.id}
                style={{ color: "var(--light)" }}
                onChange={e => update(p.id, { id: e.target.value })} />
            </Field>
          </div>
          <div className="divider" />
          <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(p.id)}>
            Remove project
          </button>
        </Accordion>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CV & SITE SECTION
// ════════════════════════════════════════════════════════════════════════════
function CVSection({ config, setConfig, toast }) {
  const cv = config.cv || { education: [], exhibitions: [], experience: [], tools: [] };
  const site = config.site || {};
  const [cvFiles, setCvFiles] = useState([]);
  const [cvRefresh, setCvRefresh] = useState(0);

  useEffect(() => {
    listFolder(PATHS.cv).then(setCvFiles);
  }, [cvRefresh]);

  const updateSite = patch => setConfig(c => ({ ...c, site: { ...c.site, ...patch } }));
  const updateCv = (key, val) => setConfig(c => ({ ...c, cv: { ...c.cv, [key]: val } }));

  const entryList = (label, key) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <label className="f-label" style={{ marginBottom: 0 }}>{label}</label>
        <button type="button" className="btn btn-secondary btn-sm"
          onClick={() => updateCv(key, [...(cv[key] || []), { year: "", title: "", institution: "" }])}>
          + Add
        </button>
      </div>
      {(cv[key] || []).map((entry, i) => (
        <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "center" }}>
          <input className="f-input" style={{ width: 88, flexShrink: 0 }} placeholder="Year"
            value={entry.year} onChange={e => updateCv(key, cv[key].map((x, j) => j === i ? { ...x, year: e.target.value } : x))} />
          <input className="f-input" placeholder="Title" value={entry.title}
            onChange={e => updateCv(key, cv[key].map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
          <input className="f-input" placeholder="Institution" value={entry.institution}
            onChange={e => updateCv(key, cv[key].map((x, j) => j === i ? { ...x, institution: e.target.value } : x))} />
          <button type="button" className="btn btn-icon btn-sm"
            onClick={() => updateCv(key, cv[key].filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="section-head">
        <h2 className="section-title">CV & Site</h2>
        <p className="section-sub">All text content, CV data, and downloadable CV file</p>
      </div>

      <Accordion title="Site information" defaultOpen>
        <div className="f-row cols2">
          <Field label="Your name">
            <input className="f-input" value={site.name || ""}
              onChange={e => updateSite({ name: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="f-input" type="email" value={site.email || ""}
              onChange={e => updateSite({ email: e.target.value })} />
          </Field>
        </div>
        <div className="f-row cols2">
          <Field label="Tagline">
            <input className="f-input" value={site.tagline || ""}
              onChange={e => updateSite({ tagline: e.target.value })} />
          </Field>
          <Field label="School / institution">
            <input className="f-input" value={site.school || ""}
              onChange={e => updateSite({ school: e.target.value })} />
          </Field>
        </div>
        <div className="f-row">
          <Field label="Manifesto text (line breaks with Enter)">
            <textarea className="f-textarea" value={site.manifesto || ""}
              onChange={e => updateSite({ manifesto: e.target.value })} />
          </Field>
        </div>
        <div className="f-row">
          <Field label="Accent words (shown in amber in manifesto)">
            <TagInput value={site.manifestoAccents || []}
              onChange={v => updateSite({ manifestoAccents: v })} placeholder="Add word…" />
          </Field>
        </div>
      </Accordion>

      <div className="divider" />

      <Accordion title="CV file (PDF)">
        <p style={{ fontFamily: "var(--mono)", fontSize: ".4rem", letterSpacing: ".1em", color: "var(--mid)", marginBottom: 16, lineHeight: 1.9 }}>
          Upload your PDF, then select it as the active CV below.
        </p>
        <Uploader folder={PATHS.cv} accept=".pdf" label="CV PDF" toast={toast}
          onDone={() => setCvRefresh(r => r + 1)} />
        <Field label="Active CV file (shown as download link)">
          <select className="f-select" value={site.cvFile || ""}
            onChange={e => updateSite({ cvFile: e.target.value })}>
            <option value="">— select —</option>
            {cvFiles.map(f => <option key={f.sha} value={`/cv/${f.name}`}>{f.name}</option>)}
          </select>
        </Field>
      </Accordion>

      <div className="divider" />

      <Accordion title="Education">{entryList("Education", "education")}</Accordion>
      <Accordion title="Exhibitions">{entryList("Exhibitions", "exhibitions")}</Accordion>
      <Accordion title="Experience">{entryList("Experience", "experience")}</Accordion>
      <Accordion title="Tools & skills">
        <Field label="Tools">
          <TagInput value={cv.tools || []} onChange={v => updateCv("tools", v)} placeholder="Add tool…" />
        </Field>
      </Accordion>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT ADMIN
// ════════════════════════════════════════════════════════════════════════════
export default function Admin({ onExit }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [section, setSection] = useState("photos");
  const [config, setConfig] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, add: toast } = useToast();
  const tokenOk = !!GH.token;

  const updateConfig = useCallback(fn => {
    setConfig(c => {
      const next = typeof fn === "function" ? fn(c) : fn;
      setDirty(true);
      return next;
    });
  }, []);

  useEffect(() => {
    if (authed && !config) loadConfig().then(setConfig);
  }, [authed, config]);

  const handleSave = async () => {
    if (!tokenOk) { toast("Token not configured", "err"); return; }
    setSaving(true);
    try {
      await saveConfig(config);
      setDirty(false);
      toast("Saved config.json to repo", "ok");
    } catch (e) {
      toast(`Save failed: ${e.message}`, "err");
    } finally { setSaving(false); }
  };

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwErr(false); }
    else { setPwErr(true); setPw(""); }
  };

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (!authed) return (
    <>
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-box">
          <h1 className="login-title">Admin</h1>
          <p className="login-sub">Portfolio CMS</p>
          <div style={{ marginBottom: 18 }}>
            <label className="f-label">Password</label>
            <input className={`f-input ${pwErr ? "err" : ""}`} type="password" value={pw} autoFocus
              onChange={e => { setPw(e.target.value); setPwErr(false); }}
              onKeyDown={e => e.key === "Enter" && tryLogin()} />
            {pwErr && <p style={{ fontFamily: "var(--mono)", fontSize: ".4rem", letterSpacing: ".16em", color: "var(--red)", textTransform: "uppercase", marginTop: 7 }}>Incorrect</p>}
          </div>
          <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={tryLogin}>Enter</button>
          {onExit && <button type="button" className="btn btn-secondary" style={{ width: "100%", marginTop: 7 }} onClick={onExit}>← Back to portfolio</button>}
        </div>
      </div>
    </>
  );

  if (!config) return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: ".48rem", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--light)" }}>Loading config…</p>
      </div>
    </>
  );

  // ── SHELL ────────────────────────────────────────────────────────────────
  const nav = [
    { group: "Media",   items: [{ key: "photos", label: "Photos", count: (config.photos || []).length }, { key: "svgs", label: "SVG Files", count: (config.svgs || []).length }] },
    { group: "Content", items: [{ key: "projects", label: "Projects", count: (config.projects || []).length }, { key: "cv", label: "CV & Site" }] },
  ];

  const sharedProps = { config, setConfig: updateConfig, toast, projects: config.projects || [] };

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div className="topbar-title">Admin</div>
            <div className="repo-pill">
              <div className={`repo-dot ${tokenOk ? "" : "off"}`} />
              {GH.owner}/{GH.repo}
            </div>
          </div>
          <div className="topbar-right">
            {onExit && <a href="#" onClick={e => { e.preventDefault(); onExit(); }}>← Portfolio</a>}
            <button type="button" onClick={() => setAuthed(false)}>Log out</button>
          </div>
        </div>

        <div className="body-wrap">
          {/* Sidebar */}
          <div className="sidebar">
            {nav.map(group => (
              <div key={group.group}>
                <div className="sidebar-group-label">{group.group}</div>
                {group.items.map(item => (
                  <div key={item.key}
                    className={`sidebar-item ${section === item.key ? "active" : ""}`}
                    onClick={() => setSection(item.key)}>
                    {item.label}
                    {item.count != null && <span className="sidebar-badge">{item.count}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Content + save bar */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="main">
              {!tokenOk && (
                <div className="warn-box">
                  <h4>⚠ Token not configured</h4>
                  <p>
                    Open <code>admin.jsx</code>, find <code>loadToken()</code>, paste your base64 chunks into <code>t1</code> / <code>t2</code> / <code>t3</code>.<br />
                    Also set <code>GH.owner</code> and <code>GH.repo</code>. Then add <code>admin.jsx</code> to <code>.gitignore</code>.
                  </p>
                </div>
              )}
              {section === "photos"   && <PhotosSection   {...sharedProps} />}
              {section === "svgs"     && <SVGsSection     {...sharedProps} />}
              {section === "projects" && <ProjectsSection {...sharedProps} />}
              {section === "cv"       && <CVSection       {...sharedProps} />}
            </div>

            <div className="save-bar">
              <p className={`save-bar-status ${dirty ? "dirty" : ""}`}>
                {dirty ? "● Unsaved changes" : "✓ All saved"}
              </p>
              <div className="btn-row">
                {dirty && (
                  <button type="button" className="btn btn-secondary btn-sm"
                    onClick={() => { loadConfig().then(c => { setConfig(c); setDirty(false); }); }}>
                    Discard
                  </button>
                )}
                <button type="button" className="btn btn-primary btn-sm"
                  disabled={!dirty || saving} onClick={handleSave}>
                  {saving ? "Saving…" : "Save to GitHub"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </>
  );
}