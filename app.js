const COMPLAINTS_KEY = "resolvex-cvr-complaints-v3";
const CREDENTIALS_KEY = "resolvex-cvr-credentials-v1";
const SESSION_KEY = "resolvex-cvr-session-v1";
const ID_PATTERN = /^\d{2}B81A[A-Z0-9]{4}$/;

const defaultCredentials = [
  {
    role: "STUDENT",
    username: "21B81A0501",
    password: "student123",
    department: "CSE",
    name: "Harsha Vardhan",
    email: "21B81A0501@cvr.ac.in"
  },
  {
    role: "HOD",
    username: "raks",
    password: "raks123",
    department: "CSE",
    name: "Raks",
    email: "raks@cvr.ac.in",
    unit: "CVR1"
  },
  {
    role: "ADMIN",
    username: "cvrm",
    password: "cvrm123",
    department: "Admin Office",
    name: "CVR Management",
    email: "cvrm@cvr.ac.in",
    unit: "CVR2"
  }
];

const initialComplaints = [
  {
    id: 3001,
    studentName: "Harsha Vardhan",
    institutionalId: "21B81A0501",
    officialEmail: "21B81A0501@cvr.ac.in",
    category: "Laboratory",
    department: "CSE",
    description: "Systems in Lab-3 fail during compiler sessions and require repeated manual restarts.",
    status: "NOT_SEEN",
    remarks: "",
    timestamp: "2026-04-23 09:15",
    history: [
      {
        from: null,
        to: "NOT_SEEN",
        actor: "System",
        at: "2026-04-23 09:15",
        note: "Complaint submitted and routed to CSE."
      }
    ]
  },
  {
    id: 3002,
    studentName: "Harsha Vardhan",
    institutionalId: "21B81A0501",
    officialEmail: "21B81A0501@cvr.ac.in",
    category: "Infrastructure",
    department: "ECE",
    description: "Projector alignment in the communication lab is making board visibility poor during practical demonstrations.",
    status: "IN_PROGRESS",
    remarks: "",
    timestamp: "2026-04-22 12:05",
    history: [
      {
        from: null,
        to: "NOT_SEEN",
        actor: "System",
        at: "2026-04-22 12:05",
        note: "Complaint submitted and routed to ECE."
      },
      {
        from: "NOT_SEEN",
        to: "IN_PROGRESS",
        actor: "CVR Management",
        at: "2026-04-22 12:18",
        note: "Complaint opened and acknowledged."
      }
    ]
  },
  {
    id: 3003,
    studentName: "Rohit Kumar",
    institutionalId: "22B81A04H2",
    officialEmail: "22B81A04H2@cvr.ac.in",
    category: "Academic",
    department: "CSE",
    description: "Timetable clash between project review and lab session needs urgent rescheduling.",
    status: "RESOLVED",
    remarks: "Project review moved to Friday 2 PM after department coordination.",
    timestamp: "2026-04-21 11:10",
    history: [
      {
        from: null,
        to: "NOT_SEEN",
        actor: "System",
        at: "2026-04-21 11:10",
        note: "Complaint submitted and routed to CSE."
      },
      {
        from: "NOT_SEEN",
        to: "IN_PROGRESS",
        actor: "Raks",
        at: "2026-04-21 11:26",
        note: "Complaint opened and acknowledged under Read and Solve."
      },
      {
        from: "IN_PROGRESS",
        to: "RESOLVED",
        actor: "Raks",
        at: "2026-04-21 12:05",
        note: "Project review moved to Friday 2 PM after department coordination."
      }
    ]
  }
];

const state = {
  complaints: loadComplaints(),
  credentials: loadCredentials(),
  session: loadSession(),
  filter: "ALL",
  selectedComplaintId: null
};

const refs = {
  loginForm: document.getElementById("login-form"),
  loginRole: document.getElementById("login-role"),
  loginUsername: document.getElementById("login-username"),
  loginPassword: document.getElementById("login-password"),
  loginDepartment: document.getElementById("login-department"),
  loginFeedback: document.getElementById("login-feedback"),
  credentialCards: document.getElementById("credential-cards"),
  workspaceShell: document.getElementById("workspace-shell"),
  workspaceTitle: document.getElementById("workspace-title"),
  workspaceSubtitle: document.getElementById("workspace-subtitle"),
  sessionChip: document.getElementById("session-chip"),
  logoutBtn: document.getElementById("logout-btn"),
  studentWorkspace: document.getElementById("student-workspace"),
  hodWorkspace: document.getElementById("hod-workspace"),
  adminWorkspace: document.getElementById("admin-workspace"),
  studentForm: document.getElementById("student-form"),
  studentName: document.getElementById("student-name"),
  institutionalId: document.getElementById("institutional-id"),
  officialEmail: document.getElementById("official-email"),
  idHint: document.getElementById("id-hint"),
  studentCount: document.getElementById("student-count"),
  studentComplaints: document.getElementById("student-complaints"),
  hodDisplayName: document.getElementById("hod-display-name"),
  hodDepartment: document.getElementById("hod-department"),
  statusFilter: document.getElementById("status-filter"),
  summaryGrid: document.getElementById("summary-grid"),
  hodCount: document.getElementById("hod-count"),
  hodComplaints: document.getElementById("hod-complaints"),
  detailEmpty: document.getElementById("detail-empty"),
  detailView: document.getElementById("detail-view"),
  detailTitle: document.getElementById("detail-title"),
  detailStatus: document.getElementById("detail-status"),
  detailMeta: document.getElementById("detail-meta"),
  detailDescription: document.getElementById("detail-description"),
  detailHistory: document.getElementById("detail-history"),
  remarks: document.getElementById("hod-remarks"),
  resolveBtn: document.getElementById("resolve-btn"),
  rejectBtn: document.getElementById("reject-btn"),
  adminSummary: document.getElementById("admin-summary"),
  adminCredentials: document.getElementById("admin-credentials"),
  adminCount: document.getElementById("admin-count"),
  adminComplaints: document.getElementById("admin-complaints")
};

init();

function init() {
  bindEvents();
  renderCredentialCards();
  applyLoginDefaults();
  renderWorkspace();
}

function bindEvents() {
  refs.loginRole.addEventListener("change", applyLoginDefaults);

  refs.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const role = refs.loginRole.value;
    const username = refs.loginUsername.value.trim();
    const password = refs.loginPassword.value.trim();
    const department = refs.loginDepartment.value;

    const match = state.credentials.find((item) => {
      if (item.role !== role) {
        return false;
      }

      if (role === "STUDENT") {
        return item.username.toUpperCase() === username.toUpperCase()
          && item.password === password
          && item.department === department;
      }

      return item.username.toLowerCase() === username.toLowerCase()
        && item.password === password
        && item.department === department;
    });

    if (!match) {
      refs.loginFeedback.textContent = "Login failed. Check role, username, password, and department.";
      refs.loginFeedback.style.color = "#b63e3e";
      return;
    }

    state.session = {
      role: match.role,
      username: match.username,
      name: match.name,
      department: match.department,
      email: match.email
    };
    saveSession();
    refs.loginFeedback.textContent = "Login successful. Workspace unlocked.";
    refs.loginFeedback.style.color = "#12805c";
    state.selectedComplaintId = null;
    renderWorkspace();
  });

  refs.logoutBtn.addEventListener("click", () => {
    state.session = null;
    state.selectedComplaintId = null;
    saveSession();
    renderWorkspace();
  });

  refs.studentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.session || state.session.role !== "STUDENT") {
      return;
    }

    const complaint = {
      id: nextId(),
      studentName: refs.studentName.value.trim(),
      institutionalId: refs.institutionalId.value.trim(),
      officialEmail: refs.officialEmail.value.trim(),
      category: document.getElementById("category").value,
      department: document.getElementById("department").value,
      description: document.getElementById("description").value.trim(),
      status: "NOT_SEEN",
      remarks: "",
      timestamp: nowString(),
      history: [
        {
          from: null,
          to: "NOT_SEEN",
          actor: "System",
          at: nowString(),
          note: `Complaint submitted and routed to ${document.getElementById("department").value}.`
        }
      ]
    };

    state.complaints.unshift(complaint);
    saveComplaints();
    document.getElementById("description").value = "";
    renderWorkspace();
  });

  refs.statusFilter.addEventListener("change", () => {
    state.filter = refs.statusFilter.value;
    state.selectedComplaintId = null;
    renderWorkspace();
  });

  refs.resolveBtn.addEventListener("click", () => finalizeComplaint("RESOLVED"));
  refs.rejectBtn.addEventListener("click", () => finalizeComplaint("REJECTED"));
}

function applyLoginDefaults() {
  const role = refs.loginRole.value;
  const defaults = {
    STUDENT: { username: "21B81A0501", password: "student123", department: "CSE" },
    HOD: { username: "raks", password: "raks123", department: "CSE" },
    ADMIN: { username: "cvrm", password: "cvrm123", department: "Admin Office" }
  };

  refs.loginUsername.value = defaults[role].username;
  refs.loginPassword.value = defaults[role].password;
  refs.loginDepartment.value = defaults[role].department;
  refs.loginFeedback.textContent = "Use the stored demo credentials below.";
  refs.loginFeedback.style.color = "";
}

function renderCredentialCards() {
  refs.credentialCards.innerHTML = state.credentials.map((item) => `
    <article class="info-card">
      <h3>${escapeHtml(item.role)} Access</h3>
      <p><strong>Name:</strong> ${escapeHtml(item.name)}</p>
      <p><strong>Username:</strong> ${escapeHtml(item.username)}</p>
      <p><strong>Password:</strong> ${escapeHtml(item.password)}</p>
      <p><strong>Department:</strong> ${escapeHtml(item.department)}</p>
      <p><strong>Email:</strong> ${escapeHtml(item.email)}</p>
    </article>
  `).join("");
}

function renderWorkspace() {
  const session = state.session;
  refs.workspaceShell.classList.toggle("hidden", !session);
  refs.studentWorkspace.classList.add("hidden");
  refs.hodWorkspace.classList.add("hidden");
  refs.adminWorkspace.classList.add("hidden");

  if (!session) {
    refs.workspaceTitle.textContent = "ResolveX Dashboard";
    refs.workspaceSubtitle.textContent = "Login with one of the stored accounts to open the correct workspace.";
    refs.sessionChip.textContent = "No active session";
    return;
  }

  refs.sessionChip.textContent = `${session.name} | ${session.role} | ${session.department}`;
  refs.workspaceSubtitle.textContent = `${session.email} is active. Department entered at login controls the visible workspace scope.`;

  if (session.role === "STUDENT") {
    refs.workspaceTitle.textContent = "Student Complaint Workspace";
    refs.studentWorkspace.classList.remove("hidden");
    renderStudentWorkspace(session);
    return;
  }

  if (session.role === "HOD") {
    refs.workspaceTitle.textContent = "HOD Department Workspace";
    refs.hodWorkspace.classList.remove("hidden");
    renderHodWorkspace(session);
    return;
  }

  refs.workspaceTitle.textContent = "Admin Oversight Workspace";
  refs.adminWorkspace.classList.remove("hidden");
  renderAdminWorkspace(session);
}

function renderStudentWorkspace(session) {
  refs.studentName.value = session.name;
  refs.institutionalId.value = session.username.toUpperCase();
  refs.officialEmail.value = session.email;
  refs.idHint.textContent = ID_PATTERN.test(session.username.toUpperCase()) ? "Institutional ID accepted." : "Format: XXB81AXXXX";
  refs.idHint.style.color = "#12805c";

  const complaints = state.complaints.filter((item) => item.institutionalId === session.username.toUpperCase());
  refs.studentCount.textContent = `${complaints.length} complaint${complaints.length === 1 ? "" : "s"}`;
  refs.studentComplaints.innerHTML = complaints.length
    ? complaints.map(renderComplaintCard).join("")
    : emptyCard("No complaints yet", "Submit a complaint to start your ResolveX history.");
}

function renderHodWorkspace(session) {
  refs.hodDisplayName.value = session.name;
  refs.hodDepartment.value = session.department;
  refs.statusFilter.value = state.filter;

  const deptComplaints = state.complaints.filter((item) => item.department === session.department);
  const visible = deptComplaints.filter((item) => state.filter === "ALL" || item.status === state.filter);
  const counts = {
    total: deptComplaints.length,
    notSeen: deptComplaints.filter((item) => item.status === "NOT_SEEN").length,
    inProgress: deptComplaints.filter((item) => item.status === "IN_PROGRESS").length,
    closed: deptComplaints.filter((item) => item.status === "RESOLVED" || item.status === "REJECTED").length
  };

  refs.summaryGrid.innerHTML = `
    <article class="summary-item"><strong>${counts.total}</strong><span>Total Queue</span></article>
    <article class="summary-item"><strong>${counts.notSeen}</strong><span>Not Seen</span></article>
    <article class="summary-item"><strong>${counts.inProgress}</strong><span>In Progress</span></article>
    <article class="summary-item"><strong>${counts.closed}</strong><span>Closed</span></article>
  `;

  refs.hodCount.textContent = `${visible.length} visible`;
  refs.hodComplaints.innerHTML = visible.length
    ? visible.map((item) => `
        <article class="queue-item selectable ${item.id === state.selectedComplaintId ? "selected" : ""}" data-id="${item.id}">
          <div class="queue-top">
            <h5>${escapeHtml(item.studentName)}</h5>
            <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
          </div>
          <p><strong>Institutional ID:</strong> ${escapeHtml(item.institutionalId)}</p>
          <p><strong>Category:</strong> ${escapeHtml(item.category)}</p>
        </article>
      `).join("")
    : emptyCard("No departmental matches", "Adjust the status filter to continue.");

  Array.from(refs.hodComplaints.querySelectorAll("[data-id]")).forEach((node) => {
    node.addEventListener("click", () => openComplaint(Number(node.dataset.id), session));
  });

  renderDetail(session, false);
}

function renderAdminWorkspace() {
  const countsByDepartment = aggregateDepartmentCounts();
  refs.adminSummary.innerHTML = Object.entries(countsByDepartment).map(([department, count]) => `
    <article class="admin-stat">
      <strong>${escapeHtml(department)}</strong>
      <p>${count} complaint${count === 1 ? "" : "s"}</p>
    </article>
  `).join("");

  refs.adminCredentials.innerHTML = state.credentials.map((item) => `
    <article class="credential-item">
      <div class="queue-top">
        <strong>${escapeHtml(item.name)}</strong>
        <span class="badge ${item.role === "ADMIN" ? "admin-badge" : item.role === "HOD" ? "accent" : ""}">${escapeHtml(item.role)}</span>
      </div>
      <p><strong>Username:</strong> ${escapeHtml(item.username)}</p>
      <p><strong>Password:</strong> ${escapeHtml(item.password)}</p>
      <p><strong>Department:</strong> ${escapeHtml(item.department)}</p>
    </article>
  `).join("");

  refs.adminCount.textContent = `${state.complaints.length} total`;
  refs.adminComplaints.innerHTML = state.complaints.map((item) => `
    <article class="queue-item">
      <div class="queue-top">
        <h5>${escapeHtml(item.studentName)} | ${escapeHtml(item.department)}</h5>
        <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <p><strong>Institutional ID:</strong> ${escapeHtml(item.institutionalId)}</p>
      <p><strong>Category:</strong> ${escapeHtml(item.category)}</p>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join("");
}

function renderComplaintCard(item) {
  return `
    <article class="queue-item">
      <div class="queue-top">
        <h5>${escapeHtml(item.category)} | ${escapeHtml(item.department)}</h5>
        <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <p><strong>ID:</strong> #${item.id} | <strong>Email:</strong> ${escapeHtml(item.officialEmail)}</p>
      <p>${escapeHtml(item.description)}</p>
      <div class="stack">
        ${item.history.slice().reverse().map(renderHistoryItem).join("")}
      </div>
    </article>
  `;
}

function openComplaint(id, session) {
  state.selectedComplaintId = id;
  const complaint = state.complaints.find((item) => item.id === id);
  if (complaint && complaint.status === "NOT_SEEN") {
    complaint.history.push({
      from: "NOT_SEEN",
      to: "IN_PROGRESS",
      actor: session.name,
      at: nowString(),
      note: "Complaint opened and acknowledged under Read and Solve."
    });
    complaint.status = "IN_PROGRESS";
    saveComplaints();
  }
  renderWorkspace();
}

function renderDetail(session) {
  const complaint = state.complaints.find((item) => item.id === state.selectedComplaintId);
  if (!complaint) {
    refs.detailEmpty.classList.remove("hidden");
    refs.detailView.classList.add("hidden");
    refs.remarks.value = "";
    return;
  }

  refs.detailEmpty.classList.add("hidden");
  refs.detailView.classList.remove("hidden");
  refs.detailTitle.textContent = `${complaint.category} Complaint`;
  refs.detailStatus.className = `badge status-badge ${statusClass(complaint.status)}`;
  refs.detailStatus.textContent = statusLabel(complaint.status);
  refs.detailMeta.innerHTML = `
    <span><strong>ID:</strong> #${complaint.id}</span>
    <span><strong>Department:</strong> ${escapeHtml(complaint.department)}</span>
    <span><strong>Student:</strong> ${escapeHtml(complaint.studentName)}</span>
    <span><strong>Email:</strong> ${escapeHtml(complaint.officialEmail)}</span>
    <span><strong>Institutional ID:</strong> ${escapeHtml(complaint.institutionalId)}</span>
    <span><strong>Submitted:</strong> ${complaint.timestamp}</span>
  `;
  refs.detailDescription.textContent = complaint.description;
  refs.detailHistory.innerHTML = complaint.history.slice().reverse().map(renderHistoryItem).join("");
  refs.remarks.value = complaint.remarks || "";
  const closed = complaint.status === "RESOLVED" || complaint.status === "REJECTED";
  refs.resolveBtn.disabled = closed || !session;
  refs.rejectBtn.disabled = closed || !session;
}

function finalizeComplaint(nextStatus) {
  const session = state.session;
  if (!session || (session.role !== "HOD" && session.role !== "ADMIN")) {
    return;
  }

  const complaint = state.complaints.find((item) => item.id === state.selectedComplaintId);
  if (!complaint) {
    return;
  }

  const remarks = refs.remarks.value.trim();
  if (!remarks) {
    window.alert("Closing remarks are mandatory before resolving or rejecting a complaint.");
    return;
  }

  complaint.remarks = remarks;
  complaint.history.push({
    from: complaint.status,
    to: nextStatus,
    actor: session.name,
    at: nowString(),
    note: remarks
  });
  complaint.status = nextStatus;
  saveComplaints();
  renderWorkspace();
}

function renderHistoryItem(item) {
  const title = item.from ? `${statusLabel(item.from)} -> ${statusLabel(item.to)}` : statusLabel(item.to);
  return `
    <article class="history-item">
      <div class="queue-top">
        <strong>${title}</strong>
        <span>${item.at}</span>
      </div>
      <p>${escapeHtml(item.actor)} | ${escapeHtml(item.note)}</p>
    </article>
  `;
}

function aggregateDepartmentCounts() {
  return state.complaints.reduce((acc, complaint) => {
    acc[complaint.department] = (acc[complaint.department] || 0) + 1;
    return acc;
  }, {});
}

function loadComplaints() {
  const raw = window.localStorage.getItem(COMPLAINTS_KEY);
  if (!raw) {
    window.localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(initialComplaints));
    return structuredClone(initialComplaints);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(initialComplaints);
  } catch {
    return structuredClone(initialComplaints);
  }
}

function loadCredentials() {
  const raw = window.localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) {
    window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(defaultCredentials));
    return structuredClone(defaultCredentials);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(defaultCredentials);
  } catch {
    return structuredClone(defaultCredentials);
  }
}

function loadSession() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveComplaints() {
  window.localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(state.complaints));
}

function saveSession() {
  if (!state.session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function nextId() {
  return Math.max(...state.complaints.map((item) => item.id), 3000) + 1;
}

function nowString() {
  const d = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(status) {
  return {
    NOT_SEEN: "Not Seen",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected"
  }[status];
}

function statusClass(status) {
  return {
    NOT_SEEN: "not-seen",
    IN_PROGRESS: "in-progress",
    RESOLVED: "resolved",
    REJECTED: "rejected"
  }[status];
}

function emptyCard(title, copy) {
  return `<article class="history-item"><strong>${title}</strong><p>${copy}</p></article>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
