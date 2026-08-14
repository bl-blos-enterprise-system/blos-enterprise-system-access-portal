import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "./supabase-config.js";

const { createClient } = globalThis.supabase || {};

const APP_VERSION = "2.3.0";
const STORAGE_PREFIX = "besPortalState_v1_7_0";
const MAX_BACKUP_BYTES = 1_000_000;
const CONFIG_READY =
  typeof createClient === "function" &&
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_PUBLISHABLE_KEY.length > 20 &&
  !SUPABASE_PUBLISHABLE_KEY.includes("__SUPABASE_");

const supabase = CONFIG_READY
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      db: {
        schema: "api",
      },
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;

const DEFAULT_TASKS = [
  {
    id: "inbound",
    title: "Validar recibos y ubicaciones de Inbound",
    area: "Inbound",
    priority: "Alta",
    time: "09:30",
    done: false,
  },
  {
    id: "inventory",
    title: "Ejecutar conteo cíclico y conciliar diferencias",
    area: "Inventarios",
    priority: "Alta",
    time: "11:00",
    done: false,
  },
  {
    id: "outbound",
    title: "Confirmar surtido y liberación de Outbound",
    area: "Outbound",
    priority: "Alta",
    time: "13:00",
    done: false,
  },
  {
    id: "racks",
    title: "Revisar movimientos pendientes en BL RACKS",
    area: "BL RACKS",
    priority: "Media",
    time: "15:00",
    done: false,
  },
  {
    id: "control",
    title: "Entregar evidencias a Mesa de Control",
    area: "Mesa de Control",
    priority: "Media",
    time: "16:30",
    done: false,
  },
  {
    id: "closing",
    title: "Completar cierre diario en SIGO-BL",
    area: "SIGO-BL",
    priority: "Alta",
    time: "18:00",
    done: false,
  },
];

const DEFAULT_LINKS = { SIGO_BL: "", BLOS: "", BL_RACKS: "", Odoo: "" };
const LINK_LABELS = {
  SIGO_BL: "SIGO-BL",
  BLOS: "BLOS",
  BL_RACKS: "BL RACKS",
  Odoo: "Odoo",
};
const TITLES = {
  dashboard: "Resumen operativo",
  mastermap: "Mapa Maestro BES",
  organization: "Organización y mando",
  processes: "Mapa de áreas y procesos",
  dataflow: "Gobernanza Odoo ↔ BL RACKS",
  governance: "Gobierno BES",
  tasks: "Agenda operativa",
  warehouse: "Almacenes BL1–BL5",
  documents: "Biblioteca documental",
  inventory: "Inventario consolidado",
  audit: "Auditoría",
  users: "Alta de usuarios",
  settings: "Configuración",
};
const MODULES = [
  "Gobierno BES",
  "BLOS Methodology",
  "SIGO-BL",
  "Operación Integral",
  "Odoo Enterprise",
  "BL RACKS",
  "Integración Odoo ↔ BL RACKS",
  "Business Intelligence",
  "Calidad y Auditoría",
  "Mejora Continua",
  "Universidad Best Linen",
  "Gestión del Talento",
  "Control Documental",
  "Dirección General",
];
const MODULE_RECOVERY = {
  1: { status: "Estructura integrada", detail: "Metodología rectora alineada con estrategia, procesos, personas, tecnología y mejora continua; desarrollo documental pendiente." },
  2: { status: "Estructura integrada", detail: "Modelo integral de gestión operativa incorporado como capa de ejecución; liberación documental pendiente." },
  3: { status: "Estructura integrada", detail: "Cadena de suministro y operación transversal mapeadas de Compras a Atención al Cliente." },
  4: { status: "Estructura integrada", detail: "Odoo definido como sistema maestro para compras e inventario dentro del mapa de información." },
  5: { status: "Estructura integrada", detail: "BL RACKS definido como sistema operativo para ETA, racks, recepción y trazabilidad." },
  6: { status: "Estructura integrada", detail: "Propiedad, validación y consumo de siete objetos de datos Odoo–BL RACKS documentados." },
  7: { status: "Estructura integrada", detail: "KPIs corporativos y departamentales incorporados al modelo; fuentes productivas pendientes." },
  8: { status: "Estructura integrada", detail: "Calidad, auditoría, evidencias y conciliaciones incorporadas como controles transversales." },
  9: { status: "Estructura integrada", detail: "5S, Kaizen, Ishikawa, 5 Porqués y mejora continua ubicados en la arquitectura." },
  10: { status: "Estructura integrada", detail: "Filosofía de aprendizaje y transformación de procesos incorporada al gobierno BES." },
  11: { status: "Estructura integrada", detail: "Jerarquía, gerencias, jefaturas, supervisiones y puestos especializados integrados; autorizaciones pendientes." },
  12: { status: "Estructura integrada", detail: "Código oficial, 17 tipos documentales, 10 secciones y formato gráfico obligatorio definidos." },
  13: { status: "Estructura integrada", detail: "Dirección General y Gerencia Senior ubicadas como máximo nivel de estrategia, rentabilidad y recursos." },
};
const GOVERNANCE_DOCS = [
  "Manual de Gobierno BES",
  "Constitución BES",
  "Arquitectura Empresarial",
  "BES CORE",
  "Manual de Identidad Documental",
  "Sistema de Codificación",
  "Política de Control Documental",
  "Roadmap Estratégico",
  "Matriz RACI",
  "Índice Maestro",
  "Glosario",
  "Presentación Ejecutiva",
  "Plantilla Word",
  "Plantilla PowerPoint",
  "Plantilla Excel",
];
const SECTIONS = [
  "00. Gobierno",
  "01. Manuales",
  "02. SOP",
  "03. PRO",
  "04. FOR",
  "05. WI",
  "06. POL",
  "07. STD",
  "08. CAP",
  "09. PPT",
  "10. A3",
  "11. KPI",
  "12. Dashboard",
  "13. Auditorías",
  "14. Riesgos",
  "15. Mejora Continua",
  "16. Diagramas",
  "17. Formatos Especiales",
  "18. Evidencias",
  "19. Plantillas",
  "20. Historial de Versiones",
  "21. README",
];
const GOV_STATUS = {
  pending: { label: "Pendiente", weight: 0 },
  draft: { label: "Borrador", weight: 0.35 },
  review: { label: "En revisión", weight: 0.7 },
  approved: { label: "Aprobado", weight: 1 },
};
const GOV_FLOW = ["pending", "draft", "review", "approved"];
const PRIVILEGED_ROLES = new Set([
  "owner",
  "admin",
  "platform_admin",
  "architect",
]);

let state = null;
let currentUser = null;
let accessContext = null;
let activeAccess = null;
let taskFilter = "all";
let authEvaluation = 0;
let enrollmentFactorId = null;
let challengeFactorId = null;
let managedUsers = [];
let managedUsersLoading = false;
let documentLibrary = null;
let inventorySnapshot = null;
let libraryLoading = null;
let documentSearch = "";
let documentPillarFilter = "all";
let publicDocumentSearch = "";
let publicPillarFilter = "all";

function select(selector) {
  return document.querySelector(selector);
}

function selectAll(selector) {
  return document.querySelectorAll(selector);
}

function defaultGovernance() {
  return Object.fromEntries(GOVERNANCE_DOCS.map((_, index) => [index, "pending"]));
}

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function profileFromContext(context, membership) {
  const profile = context?.profile ?? {};
  const name =
    profile.preferred_name ||
    profile.full_name ||
    currentUser?.email?.split("@")[0] ||
    "Usuario BES";
  return {
    name,
    role: roleLabel(membership),
  };
}

function createDefaultState(profile) {
  return {
    version: APP_VERSION,
    profile,
    lastPage: "dashboard",
    tasks: structuredClone(DEFAULT_TASKS),
    links: { ...DEFAULT_LINKS },
    governance: defaultGovernance(),
    audit: [],
    theme: "light",
  };
}

function loadState(userId, profile) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)));
    if (validStateShape(saved)) {
      return {
        ...saved,
        version: APP_VERSION,
        profile,
        lastPage: Object.hasOwn(TITLES, saved.lastPage) ? saved.lastPage : "dashboard",
        links: normalizeLinks(saved.links),
        governance: normalizeGovernance(saved.governance),
        audit: normalizeAudit(saved.audit, profile.name),
      };
    }
  } catch {
    // A damaged device-local record is isolated to this user and replaced.
  }
  return createDefaultState(profile);
}

function persist() {
  if (!currentUser?.id || !state) return;
  localStorage.setItem(storageKey(currentUser.id), JSON.stringify(state));
}

function logEvent(event) {
  if (!state) return;
  state.audit.unshift({
    at: new Date().toISOString(),
    user: state.profile.name,
    event,
  });
  state.audit = state.audit.slice(0, 100);
  persist();
  renderAudit();
}

function toast(message) {
  const element = select("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function isAllowedPortalUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

function normalizeLinks(links) {
  return Object.fromEntries(
    Object.keys(DEFAULT_LINKS).map((key) => {
      const value = typeof links?.[key] === "string" ? links[key].trim() : "";
      return [key, isAllowedPortalUrl(value) ? value : ""];
    }),
  );
}

function normalizeGovernance(governance) {
  return Object.fromEntries(
    GOVERNANCE_DOCS.map((_, index) => {
      const status = governance?.[index];
      return [index, GOV_FLOW.includes(status) ? status : "pending"];
    }),
  );
}

function normalizeAudit(entries, fallbackUser) {
  if (!Array.isArray(entries)) return [];
  return entries.slice(0, 100).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const at = new Date(entry.at);
    if (Number.isNaN(at.getTime())) return [];
    return [
      {
        at: at.toISOString(),
        user: String(entry.user ?? fallbackUser).slice(0, 120),
        event: String(entry.event ?? "").slice(0, 300),
      },
    ];
  });
}

function validStateShape(value) {
  return (
    value &&
    Array.isArray(value.tasks) &&
    value.tasks.every(
      (task) =>
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.done === "boolean",
    ) &&
    value.links &&
    typeof value.links === "object"
  );
}

function taskHTML(task) {
  return `<article class="task ${task.done ? "done" : ""}" data-id="${escapeHTML(task.id)}">
    <button class="check" aria-label="${task.done ? "Marcar pendiente" : "Marcar concluida"}">${task.done ? "✓" : ""}</button>
    <div>
      <div class="task-title">${escapeHTML(task.title)}</div>
      <div class="task-meta">
        <span class="tag">${escapeHTML(task.area)}</span>
        <span class="priority">Prioridad ${escapeHTML(task.priority)}</span>
      </div>
    </div>
    <time>${escapeHTML(task.time)}</time>
  </article>`;
}

function renderTasks() {
  const done = state.tasks.filter((task) => task.done).length;
  const total = state.tasks.length;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  select("#doneStat").textContent = `${done}/${total}`;
  select("#percentStat").textContent = `${percentage}% del plan diario`;
  select("#progressBar").style.width = `${percentage}%`;
  select("#welcomeCopy").textContent =
    done === total
      ? "Plan diario concluido. Excelente cierre."
      : `Tienes ${total - done} ${total - done === 1 ? "tarea pendiente" : "tareas pendientes"} para completar hoy.`;
  select("#taskListDashboard").innerHTML = state.tasks
    .slice(0, 4)
    .map(taskHTML)
    .join("");
  const filtered = state.tasks.filter(
    (task) =>
      taskFilter === "all" ||
      (taskFilter === "done" && task.done) ||
      (taskFilter === "pending" && !task.done),
  );
  select("#taskListFull").innerHTML = filtered.length
    ? filtered.map(taskHTML).join("")
    : '<div class="empty">No hay tareas en esta vista.</div>';
  selectAll(".task .check").forEach((button) => {
    button.onclick = () => toggleTask(button.closest(".task").dataset.id);
  });
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  persist();
  logEvent(`${task.done ? "Concluyó" : "Reabrió"}: ${task.title}`);
  renderTasks();
  toast(task.done ? "Tarea concluida" : "Tarea reabierta");
}

function renderLinks() {
  select("#quickLinks").innerHTML = Object.entries(LINK_LABELS)
    .map(([key, label]) => {
      const url = state.links[key];
      return `<a class="quick" href="${url ? escapeHTML(url) : "#"}" data-system="${key}" ${url ? 'target="_blank" rel="noopener noreferrer"' : ""}>
        <b>${label}</b>
        <small>${url ? "Abrir sistema" : "Configurar enlace"}</small>
      </a>`;
    })
    .join("");
  select("#linkFields").innerHTML = Object.entries(LINK_LABELS)
    .map(
      ([key, label]) =>
        `<div class="field">
          <label for="link_${key}">${label}</label>
          <input id="link_${key}" type="url" inputmode="url" placeholder="https://…" value="${escapeHTML(state.links[key] || "")}">
        </div>`,
    )
    .join("");
  selectAll(".quick").forEach((anchor) => {
    anchor.onclick = (event) => {
      if (!state.links[anchor.dataset.system]) {
        event.preventDefault();
        showPage("settings");
        toast("Configura primero este enlace");
      }
    };
  });
}

function saveLinks() {
  const candidate = Object.fromEntries(
    Object.keys(DEFAULT_LINKS).map((key) => [
      key,
      select(`#link_${key}`).value.trim(),
    ]),
  );
  const invalid = Object.entries(candidate).find(
    ([, value]) => !isAllowedPortalUrl(value),
  );
  if (invalid) {
    select(`#link_${invalid[0]}`).focus();
    toast("Usa HTTPS; HTTP solo se permite en localhost para pruebas");
    return;
  }
  state.links = candidate;
  persist();
  logEvent("Actualizó enlaces de sistemas");
  renderLinks();
  toast("Enlaces guardados");
}

function renderAudit() {
  const rows = select("#auditRows");
  const empty = select("#auditEmpty");
  rows.innerHTML = state.audit
    .map(
      (entry) =>
        `<tr><td>${new Date(entry.at).toLocaleString("es-MX")}</td><td>${escapeHTML(entry.user)}</td><td>${escapeHTML(entry.event)}</td></tr>`,
    )
    .join("");
  empty.classList.toggle("hidden", state.audit.length > 0);
}

function showPage(id) {
  if (
    !state ||
    !currentUser ||
    select("#appView").classList.contains("hidden")
  ) {
    return;
  }
  if (!Object.hasOwn(TITLES, id)) return;
  if (id === "users" && !isOwner()) return;
  selectAll(".page").forEach((page) =>
    page.classList.toggle("active", page.id === id),
  );
  selectAll(".nav button").forEach((button) =>
    button.classList.toggle("active", button.dataset.page === id),
  );
  select("#pageTitle").textContent = TITLES[id];
  state.lastPage = id;
  persist();
  select("#sidebar").classList.remove("open");
  window.scrollTo(0, 0);
  if (id === "users") void loadManagedUsers();
  if (id === "documents" || id === "inventory") void loadDocumentLibrary();
}

function exportData() {
  const payload = {
    version: state.version,
    tasks: state.tasks,
    links: state.links,
    governance: state.governance,
    audit: state.audit,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `blos-enterprise-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  logEvent("Exportó un respaldo JSON");
  toast("Respaldo exportado");
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > MAX_BACKUP_BYTES) {
      throw new Error("El archivo supera el límite de 1 MB");
    }
    const imported = JSON.parse(await file.text());
    if (!validStateShape(imported)) {
      throw new Error("Estructura no compatible");
    }
    const normalizedLinks = normalizeLinks(imported.links);
    const hasRejectedLink = Object.keys(DEFAULT_LINKS).some(
      (key) =>
        String(imported.links?.[key] ?? "").trim() &&
        !normalizedLinks[key],
    );
    if (hasRejectedLink) {
      throw new Error("El respaldo contiene un enlace no permitido");
    }
    state = {
      ...state,
      version: APP_VERSION,
      tasks: imported.tasks.map((task) => ({
        id: String(task.id).slice(0, 80),
        title: String(task.title).slice(0, 240),
        area: String(task.area ?? "").slice(0, 100),
        priority: String(task.priority ?? "").slice(0, 40),
        time: String(task.time ?? "").slice(0, 20),
        done: Boolean(task.done),
      })),
      links: normalizedLinks,
      governance: normalizeGovernance(imported.governance),
      audit: normalizeAudit(imported.audit, state.profile.name),
    };
    persist();
    logEvent(`Importó respaldo: ${file.name}`);
    renderAll();
    toast("Respaldo importado");
  } catch (error) {
    toast(`No se pudo importar: ${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function cycleGovernance(index) {
  const current = state.governance[index] || "pending";
  const next = GOV_FLOW[(GOV_FLOW.indexOf(current) + 1) % GOV_FLOW.length];
  state.governance[index] = next;
  persist();
  logEvent(
    `Gobierno BES: ${GOVERNANCE_DOCS[index]} → ${GOV_STATUS[next].label}`,
  );
  renderArchitecture();
  toast(`Estado: ${GOV_STATUS[next].label}`);
}

function renderArchitecture() {
  select("#moduleGrid").innerHTML = MODULES.map((name, index) => {
    const libraryCount = documentLibrary?.documents?.filter(
      (document) => canonicalPillarIndex(document) === index,
    ).length;
    const recovered = MODULE_RECOVERY[index];
    const status = Number.isFinite(libraryCount)
      ? `${libraryCount} ${libraryCount === 1 ? "documento visible" : "documentos visibles"}`
      : index === 0
        ? "En construcción"
        : recovered?.status || "Pendiente";
    const detail =
      index === 0
        ? "Define las reglas, arquitectura, autoridad y control de BES."
        : recovered?.detail ||
          "Pendiente de Mapa del Pilar, gobierno y desarrollo documental.";
    const destination = index === 0 ? "governance" : "documents";
    const button =
      index === 0 || recovered
        ? `<button class="btn secondary" data-module-go="${destination}">${index === 0 ? "Abrir módulo" : "Ver evidencia"}</button>`
        : "";
    const cardClass = Number.isFinite(libraryCount)
      ? "structured"
      : index === 0
        ? "building"
        : recovered
          ? "structured"
          : "pending";
    return `<article class="card module-card ${cardClass}">
      <span class="module-code">Pilar ${String(index).padStart(2, "0")}</span>
      <h3>${name}</h3>
      <p>${detail}</p>
      <div class="module-state">
        <span class="state-pill ${cardClass}">${status}</span>
        <span class="release-no">No liberado</span>
      </div>
      ${button}
    </article>`;
  }).join("");
  selectAll("[data-module-go]").forEach((button) => {
    button.onclick = () => showPage(button.dataset.moduleGo);
  });

  const statuses = GOVERNANCE_DOCS.map(
    (_, index) => state.governance[index] || "pending",
  );
  const approved = statuses.filter((status) => status === "approved").length;
  const progress = Math.round(
    (statuses.reduce((sum, status) => sum + GOV_STATUS[status].weight, 0) /
      GOVERNANCE_DOCS.length) *
      100,
  );
  const gate =
    progress < 20
      ? "G0"
      : progress < 40
        ? "G1"
        : progress < 70
          ? "G2"
          : progress < 90
            ? "G3"
            : "G4";
  select("#govProgress").textContent = `${progress}%`;
  select("#govProgressBar").style.width = `${progress}%`;
  select("#govApproved").textContent = `${approved}/${GOVERNANCE_DOCS.length}`;
  select("#govGate").textContent = gate;
  select("#governanceDeliverables").innerHTML = GOVERNANCE_DOCS.map(
    (documentName, index) => {
      const status = state.governance[index] || "pending";
      return `<div class="deliverable" data-status="${status}">
        <i aria-hidden="true"></i>
        <div class="deliverable-main">
          <b>${documentName}</b>
          <small>Responsable: Gobierno BES · Evidencia requerida</small>
        </div>
        <button class="status-button" data-gov="${index}" aria-label="Cambiar estado de ${documentName}">${GOV_STATUS[status].label}</button>
      </div>`;
    },
  ).join("");
  selectAll("[data-gov]").forEach((button) => {
    button.onclick = () => cycleGovernance(Number(button.dataset.gov));
  });
  select("#folderTree").innerHTML = SECTIONS.map(
    (section) => `<span>${section}</span>`,
  ).join("");
}

function renderIdentity() {
  const name = state.profile.name;
  select("#userName").textContent = name;
  select("#userRole").textContent = state.profile.role;
  select("#userAvatar").textContent = name.trim().charAt(0).toUpperCase() || "B";
  select("#greetingName").textContent = name;
}

function syncOwnerControls() {
  const owner = isOwner();
  select("#usersNav").classList.toggle("hidden", !owner);
  if (!owner && select("#users").classList.contains("active")) {
    showPage("dashboard");
  }
}

function renderAll() {
  document.documentElement.dataset.theme = state.theme || "light";
  select("#today").textContent = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  renderIdentity();
  syncOwnerControls();
  renderTasks();
  renderLinks();
  renderAudit();
  renderArchitecture();
  renderDocumentLibrary();
  renderInventory();
}

const PILLAR_ALIASES = new Map([
  ["GOV", 0], ["BES", 0], ["BLOS", 1], ["SIGO", 2], ["SIGO-BL", 2],
  ["ALM", 3], ["INV", 3], ["INBOUND", 3], ["OUTBOUND", 3], ["TELAS", 3], ["PT", 3],
  ["ODOO", 4], ["BLR", 5], ["MDC", 6], ["BI", 7], ["AUD", 8], ["MC", 9],
  ["UBEL", 10], ["CH", 11], ["RH", 11], ["RRHH", 11], ["DOC", 12], ["DIR", 13],
]);

function canonicalPillarIndex(document) {
  const codeMatch = String(document?.code || "").match(/^BES-(\d{2})(?:-|$)/i);
  if (codeMatch) {
    const index = Number(codeMatch[1]);
    if (index >= 0 && index < MODULES.length) return index;
  }
  const domain = String(document?.pillar_code || "").toUpperCase();
  if (PILLAR_ALIASES.has(domain)) return PILLAR_ALIASES.get(domain);
  const text = `${document?.title || ""} ${document?.module || ""}`.toLowerCase();
  if (/odoo.*rack|rack.*odoo|mapa maestro de datos/.test(text)) return 6;
  if (/inventario|almac[eé]n|inbound|outbound|producto terminado|telas/.test(text)) return 3;
  if (/talento|puesto|perfil|recursos humanos|capital humano|raci/.test(text)) return 11;
  if (/auditor|calidad/.test(text)) return 8;
  if (/mejora|kaizen|5s/.test(text)) return 9;
  return 0;
}

function documentApproval(status) {
  if (status === "approved") {
    return { label: "APROBADO", className: "approved" };
  }
  if (status === "published") {
    return { label: "APROBADO Y PUBLICADO", className: "approved" };
  }
  if (["pending_approval", "review"].includes(status)) {
    return { label: "EN ESPERA DE APROBACIÓN", className: "pending" };
  }
  return { label: "BORRADOR", className: "draft" };
}

function libraryAssetUrl(assetId, action = "download") {
  const url = new URL(`${SUPABASE_URL}/functions/v1/bes-document-library`);
  url.searchParams.set("asset_id", assetId);
  url.searchParams.set("action", action);
  return url.toString();
}

async function fetchLibrary(url = `${SUPABASE_URL}/functions/v1/bes-document-library`) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("La sesión BES expiró.");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "x-client-info": `bes-access-portal/${APP_VERSION}`,
    },
  });
  if (!response.ok) throw new Error(`Biblioteca privada: error ${response.status}`);
  return response;
}

async function fetchPublicCatalog() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/bes-public-catalog`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "x-client-info": `bes-access-portal/${APP_VERSION}`,
    },
  });
  if (!response.ok) throw new Error(`Biblioteca pública: error ${response.status}`);
  return response;
}

function assetLabel(asset) {
  if (asset.mime_type === "text/html") return "Ver HTML";
  if (asset.mime_type === "text/csv") return "Descargar CSV";
  if (asset.mime_type === "application/pdf") return "Ver PDF";
  if (asset.mime_type === "application/json") return "Descargar datos";
  return asset.label || "Descargar";
}

async function openLibraryAsset(asset, action = "download") {
  if (asset.public_url) {
    window.open(asset.public_url, "_blank", "noopener");
    return;
  }
  const placeholder = action === "view" ? window.open("", "_blank") : null;
  try {
    if (placeholder) {
      placeholder.document.title = "Cargando documento BES";
      placeholder.document.body.textContent = "Cargando documento seguro…";
    }
    const response = await fetchLibrary(libraryAssetUrl(asset.id, action));
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (action === "view") {
      if (placeholder) placeholder.location.replace(blobUrl);
      else window.open(blobUrl, "_blank", "noopener");
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } else {
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = asset.filename || "documento-bes";
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    }
    logEvent(`${action === "view" ? "Consultó" : "Descargó"} activo ${asset.filename}`);
  } catch (error) {
    if (placeholder) placeholder.close();
    toast(error.message || "No fue posible abrir el activo.");
  }
}

function bindAssetButtons(container = document) {
  container.querySelectorAll("[data-asset-id]").forEach((button) => {
    button.onclick = () => {
      const document = documentLibrary?.documents?.find((item) =>
        item.assets.some((asset) => asset.id === button.dataset.assetId),
      );
      const asset = document?.assets.find((item) => item.id === button.dataset.assetId);
      if (asset) void openLibraryAsset(asset, button.dataset.assetAction || "download");
    };
  });
}

function renderPublicLibrary() {
  const rows = select("#publicDocumentRows");
  const empty = select("#publicDocumentEmpty");
  if (!rows || !empty) return;
  if (!documentLibrary) {
    rows.innerHTML = "";
    empty.textContent = libraryLoading ? "Cargando biblioteca pública…" : "No fue posible cargar el catálogo público.";
    empty.classList.remove("hidden");
    return;
  }
  const documents = documentLibrary.documents.map((document) => ({ ...document, canonicalPillar: canonicalPillarIndex(document) }));
  const assetCount = documents.reduce((total, document) => total + document.assets.length, 0);
  const approvedCount = documents.filter((document) => document.approved_at && document.approved_by_user_id).length;
  select("#publicDocumentCount").textContent = String(documents.length);
  select("#publicAssetCount").textContent = String(assetCount);
  select("#publicApprovedCount").textContent = String(approvedCount);
  select("#publicPillarCount").textContent = `${new Set(documents.map((document) => document.canonicalPillar)).size}/14`;
  const pillarSelect = select("#publicPillarFilter");
  pillarSelect.innerHTML = '<option value="all">Todos los pilares</option>' + MODULES.map((name, index) => `<option value="${index}">Pilar ${String(index).padStart(2, "0")} · ${escapeHTML(name)}</option>`).join("");
  pillarSelect.value = publicPillarFilter;
  select("#publicPillarCatalog").innerHTML = MODULES.map((name, index) => {
    const count = documents.filter((document) => document.canonicalPillar === index).length;
    return `<button class="pillar-chip ${publicPillarFilter === String(index) ? "active" : ""}" type="button" data-public-pillar="${index}"><span>Pilar ${String(index).padStart(2, "0")}</span><b>${escapeHTML(name)}</b><small>${count} ${count === 1 ? "documento" : "documentos"}</small></button>`;
  }).join("");
  selectAll("[data-public-pillar]").forEach((button) => {
    button.onclick = () => {
      publicPillarFilter = button.dataset.publicPillar;
      renderPublicLibrary();
    };
  });
  const needle = publicDocumentSearch.trim().toLowerCase();
  const filtered = documents.filter((document) =>
    (publicPillarFilter === "all" || String(document.canonicalPillar) === publicPillarFilter) &&
    (!needle || `${document.code} ${document.title} ${document.purpose || ""}`.toLowerCase().includes(needle)),
  );
  rows.innerHTML = filtered.map((document) => {
    const approval = documentApproval(document.status);
    const actions = document.assets.map((asset) => {
      const action = asset.actions?.view ? "view" : "download";
      const href = asset.public_url || libraryAssetUrl(asset.id, action);
      return `<a class="btn secondary" href="${escapeHTML(href)}" target="_blank" rel="noopener">${escapeHTML(assetLabel(asset))}</a>`;
    }).join("");
    return `<tr><td><b>${escapeHTML(document.code)}</b></td><td class="document-title"><b>${escapeHTML(document.title)}</b><small>${escapeHTML(document.purpose || document.scope || "Documento controlado BES")}</small></td><td>Pilar ${String(document.canonicalPillar).padStart(2, "0")}<br><small>${escapeHTML(MODULES[document.canonicalPillar])}</small></td><td>${escapeHTML(document.current_version)}</td><td><span class="approval-badge ${approval.className}">${approval.label}</span></td><td><div class="document-actions">${actions || "Sin activo"}</div></td></tr>`;
  }).join("");
  empty.classList.toggle("hidden", filtered.length > 0);
  if (!filtered.length) empty.textContent = "No hay documentos para este filtro.";
}

function renderDocumentLibrary() {
  const rows = select("#documentRows");
  const empty = select("#documentEmpty");
  if (!rows || !empty) return;
  if (!documentLibrary) {
    rows.innerHTML = "";
    empty.textContent = libraryLoading ? "Cargando biblioteca privada…" : "La biblioteca se cargará al autenticar la sesión.";
    empty.classList.remove("hidden");
    return;
  }

  const documents = documentLibrary.documents.map((document) => ({
    ...document,
    canonicalPillar: canonicalPillarIndex(document),
  }));
  const assetCount = documents.reduce((total, document) => total + document.assets.length, 0);
  const approvedCount = documents.filter((document) => ["approved", "published"].includes(document.status)).length;
  select("#libraryDocumentCount").textContent = String(documents.length);
  select("#libraryAssetCount").textContent = String(assetCount);
  select("#libraryApprovedCount").textContent = String(approvedCount);
  select("#libraryPillarCount").textContent = `${new Set(documents.map((document) => document.canonicalPillar)).size}/14`;

  const pillarSelect = select("#documentPillarFilter");
  const selected = documentPillarFilter;
  pillarSelect.innerHTML = '<option value="all">Todos los pilares</option>' + MODULES.map(
    (name, index) => `<option value="${index}">Pilar ${String(index).padStart(2, "0")} · ${escapeHTML(name)}</option>`,
  ).join("");
  pillarSelect.value = selected;

  select("#pillarCatalog").innerHTML = MODULES.map((name, index) => {
    const count = documents.filter((document) => document.canonicalPillar === index).length;
    return `<button class="pillar-chip ${documentPillarFilter === String(index) ? "active" : ""}" type="button" data-pillar-filter="${index}"><span>Pilar ${String(index).padStart(2, "0")}</span><b>${escapeHTML(name)}</b><small>${count} ${count === 1 ? "documento" : "documentos"}</small></button>`;
  }).join("");
  selectAll("[data-pillar-filter]").forEach((button) => {
    button.onclick = () => {
      documentPillarFilter = button.dataset.pillarFilter;
      select("#documentPillarFilter").value = documentPillarFilter;
      renderDocumentLibrary();
    };
  });

  const needle = documentSearch.trim().toLowerCase();
  const filtered = documents.filter((document) =>
    (documentPillarFilter === "all" || String(document.canonicalPillar) === documentPillarFilter) &&
    (!needle || `${document.code} ${document.title} ${document.purpose || ""}`.toLowerCase().includes(needle)),
  );
  rows.innerHTML = filtered.map((document) => {
    const approval = documentApproval(document.status);
    const actions = document.assets.map((asset) => {
      const action = asset.actions?.view ? "view" : "download";
      return `<button class="btn secondary" type="button" data-asset-id="${escapeHTML(asset.id)}" data-asset-action="${action}">${escapeHTML(assetLabel(asset))}</button>`;
    }).join("");
    return `<tr><td><b>${escapeHTML(document.code)}</b></td><td class="document-title"><b>${escapeHTML(document.title)}</b><small>${escapeHTML(document.purpose || document.scope || "Documento controlado BES")}</small></td><td>Pilar ${String(document.canonicalPillar).padStart(2, "0")}<br><small>${escapeHTML(MODULES[document.canonicalPillar])}</small></td><td>${escapeHTML(document.current_version)}</td><td><span class="approval-badge ${approval.className}">${approval.label}</span></td><td><div class="document-actions">${actions || "Sin activo"}</div></td></tr>`;
  }).join("");
  empty.classList.toggle("hidden", filtered.length > 0);
  if (!filtered.length) empty.textContent = "No hay documentos para este filtro.";
  bindAssetButtons(select("#documents"));
}

function renderInventory() {
  const rows = select("#inventoryRows");
  const empty = select("#inventoryEmpty");
  if (!rows || !empty) return;
  if (!inventorySnapshot) {
    rows.innerHTML = "";
    empty.textContent = libraryLoading ? "Cargando inventario seguro…" : "El inventario se cargará desde la biblioteca autenticada.";
    empty.classList.remove("hidden");
    return;
  }
  const number = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 4 });
  select("#inventoryDate").textContent = new Date(`${inventorySnapshot.snapshot_date}T12:00:00`).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  select("#inventoryPairs").textContent = String(inventorySnapshot.sku_unit_pairs);
  select("#inventoryReconciliation").textContent = `Conciliación ${inventorySnapshot.reconciliation}`;
  select("#inventoryRowsCount").textContent = number.format(inventorySnapshot.source_rows);
  rows.innerHTML = inventorySnapshot.items.map((item) => `<tr><td><b>${escapeHTML(item.sku)}</b><small>${escapeHTML(item.product)}</small></td><td>${escapeHTML(item.unit)}</td><td>${number.format(item.quantity)}</td><td>${number.format(item.lines)}</td><td>${escapeHTML(item.locations.join(" · "))}</td></tr>`).join("");
  empty.classList.toggle("hidden", inventorySnapshot.items.length > 0);

  const inventoryDocument = documentLibrary?.documents?.find((document) => document.code === "BES-04-KDX-001");
  const visibleAssets = inventoryDocument?.assets || [];
  select("#inventoryActions").innerHTML = visibleAssets.map((asset) => {
    const action = asset.actions?.view ? "view" : "download";
    return `<button class="btn secondary" type="button" data-asset-id="${escapeHTML(asset.id)}" data-asset-action="${action}">${escapeHTML(assetLabel(asset))}</button>`;
  }).join("");
  bindAssetButtons(select("#inventory"));
}

async function loadDocumentLibrary({ force = false } = {}) {
  if (documentLibrary && !force) return documentLibrary;
  if (libraryLoading) return libraryLoading;
  libraryLoading = (async () => {
    try {
      const response = await fetchLibrary();
      documentLibrary = await response.json();
      const inventoryDocument = documentLibrary.documents?.find((document) => document.code === "BES-04-KDX-001");
      const dataAsset = inventoryDocument?.assets.find((asset) => asset.mime_type === "application/json");
      if (dataAsset) {
        const dataResponse = await fetchLibrary(libraryAssetUrl(dataAsset.id, "download"));
        inventorySnapshot = await dataResponse.json();
      } else {
        inventorySnapshot = null;
      }
      renderDocumentLibrary();
      renderPublicLibrary();
      renderInventory();
      renderArchitecture();
      return documentLibrary;
    } catch (error) {
      documentLibrary = null;
      inventorySnapshot = null;
      const message = error.message || "No fue posible cargar la biblioteca privada.";
      select("#documentEmpty").textContent = message;
      select("#inventoryEmpty").textContent = message;
      toast(message);
      return null;
    } finally {
      libraryLoading = null;
    }
  })();
  renderDocumentLibrary();
  renderPublicLibrary();
  renderInventory();
  return libraryLoading;
}

async function loadPublicCatalog({ force = false } = {}) {
  if (documentLibrary && !force) {
    renderPublicLibrary();
    return documentLibrary;
  }
  try {
    const response = await fetchPublicCatalog();
    documentLibrary = await response.json();
    renderPublicLibrary();
    return documentLibrary;
  } catch (error) {
    documentLibrary = null;
    renderPublicLibrary();
    select("#publicDocumentEmpty").textContent = error.message || "No fue posible cargar la biblioteca pública.";
    return null;
  }
}

function roleLabel(membership) {
  const labels = {
    owner: "Propietario y creador",
    admin: "Administrador de plataforma",
    platform_admin: "Administrador de plataforma",
    architect: "Arquitecto BES",
    manager: "Responsable de área",
    analyst: "Analista",
    auditor: "Auditor",
    operator: "Operador",
    viewer: "Consulta",
  };
  return labels[membership?.role_code] || membership?.role_code || "Usuario BES";
}

function membershipRoles(membership) {
  return new Set([
    membership?.role_code,
    ...(Array.isArray(membership?.additional_roles)
      ? membership.additional_roles
      : []),
  ]);
}

function requiresMfa(membership) {
  return [...membershipRoles(membership)].some((role) =>
    PRIVILEGED_ROLES.has(role),
  );
}

function isOwner(membership = activeAccess) {
  return membership?.role_code === "owner";
}

function pickActiveAccess(context) {
  const organizations = Array.isArray(context?.organizations)
    ? context.organizations
    : [];
  return (
    organizations.find(
      (organization) =>
        organization.status === "active" &&
        organization.membership_status === "active",
    ) || null
  );
}

function credentialExpired(membership) {
  if (!membership?.temporary_password_expires_at) return false;
  const expiresAt = Date.parse(membership.temporary_password_expires_at);
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function showAuthSurface(surface) {
  const surfaces = ["publicView", "loginView", "passwordView", "mfaView", "appView"];
  surfaces.forEach((id) => {
    select(`#${id}`).classList.toggle("hidden", id !== surface);
  });
}

function setSecurityMessage(message, isError = false) {
  const element = select("#mfaView").classList.contains("hidden")
    ? select("#securityMessage")
    : select("#mfaMessage");
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function resetSensitiveForms() {
  select("#password").value = "";
  select("#currentPassword").value = "";
  select("#newPassword").value = "";
  select("#confirmPassword").value = "";
  select("#mfaCode").value = "";
  select("#mfaEnrollCode").value = "";
  select("#provisionUserForm")?.reset();
  select("#provisionUserResult")?.classList.add("hidden");
  if (select("#provisionedTemporaryPassword")) {
    select("#provisionedTemporaryPassword").textContent = "";
  }
  select("#mfaSetup").classList.add("hidden");
  select("#mfaChallenge").classList.add("hidden");
  select("#mfaEnrollIntro").classList.add("hidden");
  select("#mfaQr").removeAttribute("src");
  select("#mfaSecret").textContent = "";
  enrollmentFactorId = null;
  challengeFactorId = null;
}

function clearRuntimeIdentity() {
  currentUser = null;
  accessContext = null;
  activeAccess = null;
  state = null;
  managedUsers = [];
  managedUsersLoading = false;
  authEvaluation += 1;
}

async function fetchAccessContext() {
  const { data, error } = await supabase.rpc("get_my_access_context");
  if (error) throw error;
  if (!data?.authenticated) {
    throw new Error("La sesión no tiene un contexto de acceso válido.");
  }
  return data;
}

function translateAuthError(error) {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");
  const controlledMessages = {
    invalid_credentials: "Usuario o contraseña incorrectos.",
    account_disabled: "La cuenta está deshabilitada.",
    account_locked:
      "La cuenta está bloqueada temporalmente por intentos fallidos.",
    temporary_password_expired:
      "La contraseña temporal expiró. Solicita una nueva al propietario.",
    membership_required: "La identidad no tiene una membresía BES activa.",
    invalid_session: "La sesión expiró. Inicia sesión nuevamente.",
    identity_gateway_unavailable: "No fue posible consultar el directorio de usuarios. Inténtalo nuevamente.",
    owner_required: "Solo el propietario BES puede crear usuarios.",
    owner_or_admin_required: "Solo el propietario BES puede crear usuarios.",
    login_id_already_exists: "Ese usuario corporativo ya existe.",
    invalid_onboarding_request:
      "Revisa el usuario, nombre, puesto y rol solicitado.",
    password_policy_not_met:
      "La nueva contraseña no cumple la política BES.",
    current_password_invalid: "La contraseña temporal no es correcta.",
  };
  if (controlledMessages[code]) return controlledMessages[code];
  if (message.includes("invalid login credentials")) {
    return "Usuario o contraseña incorrectos.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirma tu correo antes de ingresar.";
  }
  if (message.includes("rate limit")) {
    return "Demasiados intentos. Espera unos minutos e inténtalo nuevamente.";
  }
  return "No fue posible completar el acceso. Inténtalo nuevamente.";
}

async function callBesEdge(functionName, payload, accessToken = "") {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${encodeURIComponent(functionName)}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
        "x-client-info": `bes-access-portal/${APP_VERSION}`,
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
    },
  );
  const text = await response.text();
  let result = {};
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = {};
  }
  if (!response.ok) {
    const error = new Error(
      result.message || result.error || `Error ${response.status}`,
    );
    error.code = result.error;
    error.status = response.status;
    error.details = result;
    throw error;
  }
  return result;
}

async function evaluateSession(session) {
  const evaluation = ++authEvaluation;
  if (!session?.user) {
    clearRuntimeIdentity();
    resetSensitiveForms();
    showAuthSurface("publicView");
    return;
  }

  currentUser = session.user;
  try {
    const context = await fetchAccessContext();
    if (evaluation !== authEvaluation) return;
    const membership = pickActiveAccess(context);
    if (!context.profile?.active || !membership) {
      throw new Error("Tu perfil BES no está activo o no tiene una membresía válida.");
    }

    accessContext = context;
    activeAccess = membership;
    state = loadState(
      currentUser.id,
      profileFromContext(accessContext, activeAccess),
    );

    if (membership.must_change_password) {
      if (credentialExpired(membership)) {
        throw new Error(
          "Tu contraseña temporal venció. Solicita al propietario una nueva credencial de primer acceso.",
        );
      }
      if (!["temporary", "reset_required"].includes(membership.credential_state)) {
        throw new Error("La credencial BES requiere revisión antes de continuar.");
      }
      select("#passwordAccountName").textContent = state.profile.name;
      setSecurityMessage(
        "Define una contraseña personal antes de utilizar cualquier módulo.",
      );
      showAuthSurface("passwordView");
      return;
    }

    if (
      membership.credential_state !== "active" ||
      membership.access_ready !== true
    ) {
      throw new Error(
        "La credencial BES está bloqueada, inactiva o todavía no está autorizada.",
      );
    }

    if (requiresMfa(membership)) {
      await routePrivilegedMfa(evaluation);
      return;
    }

    enterPortal();
  } catch (error) {
    if (evaluation !== authEvaluation) return;
    clearRuntimeIdentity();
    showAuthSurface("loginView");
    select("#loginError").textContent =
      error.message ||
      "Tu perfil todavía no cuenta con acceso activo a esta plataforma.";
    await supabase.auth.signOut({ scope: "local" });
  }
}

async function routePrivilegedMfa(evaluation) {
  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError) throw assuranceError;
  if (evaluation !== authEvaluation) return;
  if (assurance.currentLevel === "aal2") {
    enterPortal();
    return;
  }

  const { data: factors, error: factorsError } =
    await supabase.auth.mfa.listFactors();
  if (factorsError) throw factorsError;
  if (evaluation !== authEvaluation) return;
  const totpFactors = factors.totp || [];
  const verifiedFactor = totpFactors.find(
    (factor) => factor.status === "verified",
  );
  if (!verifiedFactor) {
    const incompleteFactors = totpFactors.filter(
      (factor) => factor.status === "unverified",
    );
    for (const factor of incompleteFactors) {
      const { error: cleanupError } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });
      if (cleanupError) throw cleanupError;
    }
  }
  showAuthSurface("mfaView");
  select("#mfaRoleDescription").textContent = state.profile.role;
  if (verifiedFactor) {
    challengeFactorId = verifiedFactor.id;
    select("#mfaChallenge").classList.remove("hidden");
    select("#mfaEnrollIntro").classList.add("hidden");
    setSecurityMessage(
      "Ingresa el código de seis dígitos de tu aplicación autenticadora.",
    );
  } else {
    select("#mfaChallenge").classList.add("hidden");
    select("#mfaEnrollIntro").classList.remove("hidden");
    setSecurityMessage(
      "Tu rol requiere una segunda verificación. Configúrala ahora para proteger la plataforma.",
    );
  }
}

async function startMfaEnrollment() {
  const button = select("#mfaEnrollBtn");
  button.disabled = true;
  setSecurityMessage("Preparando tu autenticador…");
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "BLOS Enterprise System",
    });
    if (error) throw error;
    enrollmentFactorId = data.id;
    const qrCode = data.totp?.qr_code || "";
    if (!/^data:image\/(?:svg\+xml|png);/i.test(qrCode)) {
      throw new Error("Supabase no devolvió un código QR válido.");
    }
    select("#mfaQr").src = qrCode;
    select("#mfaSecret").textContent = data.totp?.secret || "";
    select("#mfaEnrollIntro").classList.add("hidden");
    select("#mfaSetup").classList.remove("hidden");
    setSecurityMessage(
      "Escanea el código QR y confirma con el código de seis dígitos.",
    );
    select("#mfaEnrollCode").focus();
  } catch {
    setSecurityMessage(
      "No fue posible iniciar la configuración MFA. Cierra sesión e inténtalo nuevamente.",
      true,
    );
  } finally {
    button.disabled = false;
  }
}

async function verifyMfaFactor(factorId, code, input) {
  if (!factorId || !/^\d{6}$/.test(code)) {
    setSecurityMessage("Ingresa un código válido de seis dígitos.", true);
    input.focus();
    return;
  }
  try {
    setSecurityMessage("Verificando código…");
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (error) throw error;
    input.value = "";
    select("#mfaQr").removeAttribute("src");
    select("#mfaSecret").textContent = "";
    select("#mfaSetup").classList.add("hidden");
    select("#mfaChallenge").classList.add("hidden");
    enrollmentFactorId = null;
    challengeFactorId = null;
    const { data } = await supabase.auth.getSession();
    await evaluateSession(data.session);
  } catch {
    setSecurityMessage(
      "El código no fue aceptado o expiró. Genera uno nuevo e inténtalo otra vez.",
      true,
    );
    input.select();
  }
}

async function changePassword(event) {
  event.preventDefault();
  const currentPassword = select("#currentPassword").value;
  const newPassword = select("#newPassword").value;
  const confirmation = select("#confirmPassword").value;
  const meetsPolicy =
    newPassword.length >= 14 &&
    newPassword.length <= 72 &&
    /[a-z]/.test(newPassword) &&
    /[A-Z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword) &&
    !/\s/.test(newPassword);
  if (!meetsPolicy) {
    setSecurityMessage(
      "La contraseña debe tener 14–72 caracteres, mayúscula, minúscula, número y símbolo, sin espacios.",
      true,
    );
    return;
  }
  if (newPassword !== confirmation) {
    setSecurityMessage("Las contraseñas no coinciden.", true);
    return;
  }
  const button = select("#passwordSubmit");
  button.disabled = true;
  try {
    setSecurityMessage("Actualizando tu contraseña…");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw Object.assign(new Error("La sesión expiró."), {
        code: "invalid_session",
      });
    }
    await callBesEdge(
      "bes-activate",
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmation,
      },
      session.access_token,
    );
    await signOut();
    select("#loginError").classList.add("success");
    select("#loginError").textContent =
      "Cuenta activada. Ingresa con tu nueva contraseña.";
  } catch (error) {
    setSecurityMessage(
      translateAuthError(error),
      true,
    );
  } finally {
    button.disabled = false;
  }
}

function enterPortal() {
  renderAll();
  showAuthSurface("appView");
  const destination =
    Object.hasOwn(TITLES, state.lastPage) &&
    (state.lastPage !== "users" || isOwner())
      ? state.lastPage
      : "dashboard";
  showPage(destination);
  if (isOwner()) void loadManagedUsers();
  void loadDocumentLibrary();
}

async function signIn(event) {
  event.preventDefault();
  if (!supabase) return;
  const button = select("#loginSubmit");
  const loginId = select("#email").value.trim();
  const password = select("#password").value;
  button.disabled = true;
  select("#loginError").classList.remove("success");
  select("#loginError").textContent = "";
  try {
    const result = await callBesEdge("bes-auth", {
      organization: "BEST-LINEN",
      login_id: loginId,
      password,
    });
    const { data, error } = await supabase.auth.setSession({
      access_token: result.data.access_token,
      refresh_token: result.data.refresh_token,
    });
    select("#password").value = "";
    if (error) throw error;
    await evaluateSession(data.session);
  } catch (error) {
    select("#password").value = "";
    select("#loginError").textContent = translateAuthError(error);
  } finally {
    button.disabled = false;
  }
}

function formatUserDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("es-MX");
}

function managedCredentialLabel(user) {
  if (user.membership_status !== "active") return "Membresía inactiva";
  const labels = {
    active: "Activa",
    temporary: "Pendiente de activación",
    reset_required: "Cambio requerido",
    locked: "Bloqueada",
    disabled: "Deshabilitada",
  };
  return labels[user.credential_state] || user.credential_state || "Sin estado";
}

function renderManagedUsers() {
  const rows = select("#managedUsersRows");
  const empty = select("#managedUsersEmpty");
  const count = select("#managedUsersCount");
  if (!rows || !empty || !count) return;
  count.textContent = managedUsers.length === 1 ? "1 usuario" : String(managedUsers.length) + " usuarios";
  rows.innerHTML = managedUsers.map((user) => {
    const active = user.membership_status === "active" && user.credential_state === "active";
    return '<tr>' +
      '<td><b>' + escapeHTML(user.login_id || "—") + '</b></td>' +
      '<td>' + escapeHTML(user.full_name || user.preferred_name || "—") + '</td>' +
      '<td>' + escapeHTML(roleLabel(user)) + '</td>' +
      '<td><span class="user-state ' + (active ? "active" : "pending") + '">' + escapeHTML(managedCredentialLabel(user)) + '</span></td>' +
      '<td>' + (user.must_change_password ? "Pendiente" : "Completado") + '</td>' +
      '<td>' + escapeHTML(formatUserDate(user.created_at)) + '</td>' +
      '<td>' + escapeHTML(formatUserDate(user.last_login_at)) + '</td>' +
      '</tr>';
  }).join("");
  empty.classList.toggle("hidden", managedUsers.length > 0);
  if (!managedUsers.length) empty.textContent = "No hay usuarios registrados en esta organización.";
}

async function loadManagedUsers() {
  if (!isOwner() || managedUsersLoading) return;
  const refreshButton = select("#refreshUsers");
  const empty = select("#managedUsersEmpty");
  managedUsersLoading = true;
  if (refreshButton) refreshButton.disabled = true;
  if (empty && !managedUsers.length) {
    empty.classList.remove("hidden");
    empty.textContent = "Cargando usuarios registrados…";
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw Object.assign(new Error("La sesión expiró."), { code: "invalid_session" });
    }
    const result = await callBesEdge(
      "bes-admin-users",
      { action: "list", organization: activeAccess.organization_code || "BEST-LINEN" },
      session.access_token,
    );
    managedUsers = Array.isArray(result.data?.users) ? result.data.users : [];
    renderManagedUsers();
  } catch (error) {
    if (empty) {
      empty.classList.remove("hidden");
      empty.textContent = translateAuthError(error);
    }
  } finally {
    managedUsersLoading = false;
    if (refreshButton) refreshButton.disabled = false;
  }
}

async function provisionUser(event) {
  event.preventDefault();
  if (!isOwner()) {
    select("#provisionUserMessage").textContent =
      "Solo el propietario BES puede crear usuarios.";
    return;
  }
  const button = select("#provisionUserSubmit");
  const message = select("#provisionUserMessage");
  const resultView = select("#provisionUserResult");
  button.disabled = true;
  message.textContent = "";
  resultView.classList.add("hidden");
  select("#provisionedTemporaryPassword").textContent = "";
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw Object.assign(new Error("La sesión expiró."), {
        code: "invalid_session",
      });
    }
    const result = await callBesEdge(
      "bes-admin-users",
      {
        organization: activeAccess.organization_code || "BEST-LINEN",
        login_id: select("#newLoginId").value.trim(),
        employee_code: select("#newEmployeeCode").value.trim(),
        full_name: select("#newFullName").value.trim(),
        preferred_name: select("#newPreferredName").value.trim(),
        job_title: select("#newJobTitle").value.trim(),
        role_code: select("#newRoleCode").value,
        additional_roles: [],
        expires_in_hours: Number(select("#newExpiryHours").value),
      },
      session.access_token,
    );
    const provisioned = result.data || {};
    select("#provisionedLoginId").textContent =
      `Usuario: ${provisioned.login_id || "—"}`;
    select("#provisionedTemporaryPassword").textContent =
      provisioned.temporary_password || "";
    select("#provisionedExpiry").textContent =
      `Vence: ${provisioned.temporary_password_expires_at ? new Date(provisioned.temporary_password_expires_at).toLocaleString("es-MX") : "—"}`;
    resultView.classList.remove("hidden");
    select("#provisionUserForm").reset();
    logEvent(`Creó el usuario controlado ${provisioned.login_id || ""}`);
    await loadManagedUsers();
    toast("Usuario creado; entrega la credencial por canales separados");
  } catch (error) {
    message.textContent = translateAuthError(error);
  } finally {
    button.disabled = false;
  }
}

async function signOut() {
  if (state) logEvent("Cerró sesión");
  resetSensitiveForms();
  clearRuntimeIdentity();
  showAuthSurface("publicView");
  if (supabase) {
    await supabase.auth.signOut({ scope: "local" });
  }
}

function bindEvents() {
  select("#openLogin").onclick = () => showAuthSurface("loginView");
  select("#loginForm").addEventListener("submit", signIn);
  select("#demoProfiles").onclick = () =>
    toast("Los accesos se asignan de forma individual por área y puesto");
  select("#logout").onclick = signOut;
  select("#passwordLogout").onclick = signOut;
  select("#mfaLogout").onclick = signOut;
  select("#passwordForm").addEventListener("submit", changePassword);
  select("#provisionUserForm").addEventListener("submit", provisionUser);
  select("#refreshUsers").onclick = () => void loadManagedUsers();
  select("#mfaEnrollBtn").onclick = startMfaEnrollment;
  select("#mfaSetupForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = select("#mfaEnrollCode");
    void verifyMfaFactor(enrollmentFactorId, input.value.trim(), input);
  });
  select("#mfaChallengeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = select("#mfaCode");
    void verifyMfaFactor(challengeFactorId, input.value.trim(), input);
  });
  selectAll(".nav button").forEach((button) => {
    button.onclick = () => showPage(button.dataset.page);
  });
  selectAll("[data-go]").forEach((button) => {
    button.onclick = () => showPage(button.dataset.go);
  });
  select("#menuBtn").onclick = () => select("#sidebar").classList.toggle("open");
  select("#themeBtn").onclick = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = state.theme;
    persist();
    toast(`Tema ${state.theme === "dark" ? "oscuro" : "claro"}`);
  };
  select("#saveLinks").onclick = saveLinks;
  selectAll("#exportBtn,#exportTop").forEach((button) => {
    button.onclick = exportData;
  });
  select("#importInput").addEventListener("change", importData);
  [
    ["filterAll", "all"],
    ["filterPending", "pending"],
    ["filterDone", "done"],
  ].forEach(([id, filter]) => {
    select(`#${id}`).onclick = () => {
      taskFilter = filter;
      renderTasks();
      selectAll("#filterAll,#filterPending,#filterDone").forEach((button) => {
        button.className = "btn secondary";
      });
      select(`#${id}`).className = "btn";
    };
  });
  select("#resetGovernance").onclick = () => {
    state.governance = defaultGovernance();
    persist();
    logEvent("Restableció seguimiento de Gobierno BES");
    renderArchitecture();
    toast("Seguimiento restablecido");
  };
  select("#documentSearch").addEventListener("input", (event) => {
    documentSearch = event.target.value;
    renderDocumentLibrary();
  });
  select("#documentPillarFilter").addEventListener("change", (event) => {
    documentPillarFilter = event.target.value;
    renderDocumentLibrary();
  });
  select("#refreshLibrary").onclick = () => void loadDocumentLibrary({ force: true });
  select("#publicDocumentSearch").addEventListener("input", (event) => {
    publicDocumentSearch = event.target.value;
    renderPublicLibrary();
  });
  select("#publicPillarFilter").addEventListener("change", (event) => {
    publicPillarFilter = event.target.value;
    renderPublicLibrary();
  });
  select("#publicRefreshLibrary").onclick = () => void loadPublicCatalog({ force: true });
}

async function initialize() {
  bindEvents();
  selectAll("[data-app-version]").forEach((element) => {
    element.textContent = APP_VERSION;
  });
  if (!CONFIG_READY) {
    select("#loginSubmit").disabled = true;
    select("#runtimeNotice").classList.remove("hidden");
    select("#loginError").textContent =
      "La conexión segura todavía no tiene una clave publicable configurada.";
    return;
  }
  select("#runtimeNotice").classList.add("hidden");
  await loadPublicCatalog();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) await evaluateSession(session);
  else showAuthSurface("publicView");
  supabase.auth.onAuthStateChange((_event, nextSession) => {
    window.setTimeout(() => {
      void evaluateSession(nextSession);
    }, 0);
  });
}

void initialize();
