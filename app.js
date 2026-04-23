const USERS_KEY = "resolvex-users-v4";
const COMPLAINTS_KEY = "resolvex-complaints-v4";
const SESSION_KEY = "resolvex-session-v4";
const ID_PATTERN = /^\d{2}B81A[A-Z0-9]{4}$/;

const systemUsers = [
  {
    role: "HOD",
    username: "cvrhod1",
    password: "Hod@CVR#2711",
    department: "CSE",
    name: "CVR HOD 1",
    institutionalId: "",
    email: "cvrhod1@cvr.ac.in",
    systemManaged: true
  },
  {
    role: "HOD",
    username: "cvrhod2",
    password: "Hod@CVR#4826",
    department: "ECE",
    name: "CVR HOD 2",
    institutionalId: "",
    email: "cvrhod2@cvr.ac.in",
    systemManaged: true
  },
  {
    role: "ADMIN",
    username: "cvr1",
    password: "Admin@CVR#3158",
    department: "Admin Office",
    name: "CVR Admin 1",
    institutionalId: "",
    email: "cvr1@cvr.ac.in",
    systemManaged: true
  },
  {
    role: "ADMIN",
    username: "cvr2",
    password: "Admin@CVR#9042",
    department: "Admin Office",
    name: "CVR Admin 2",
    institutionalId: "",
    email: "cvr2@cvr.ac.in",
    systemManaged: true
  }
];

const initialComplaints = [
  {
    id: 4001,
    studentName: "Rohit Kumar",
    username: "rohitk",
    institutionalId: "22B81A04H2",
    officialEmail: "22B81A04H2@cvr.ac.in",
    branch: "CSE",
    description: "Timetable clash between project review and lab session needs urgent rescheduling.",
    status: "RESOLVED",
    remarks: "Project review moved to Friday 2 PM after department coordination.",
    timestamp: "2026-04-23 10:05",
    history: [
      {
        from: null,
        to: "NOT_SEEN",
        actor: "System",
        at: "2026-04-23 10:05",
        note: "Complaint submitted and routed to CSE."
      },
      {
        from: "NOT_SEEN",
        to: "IN_PROGRESS",
        actor: "CVR HOD 1",
        at: "2026-04-23 10:20",
        note: "Complaint opened and acknowledged under Read and Solve."
      },
      {
        from: "IN_PROGRESS",
        to: "RESOLVED",
        actor: "CVR HOD 1",
        at: "2026-04-23 11:00",
        note: "Project review moved to Friday 2 PM after department coordination."
      }
    ]
  }
];

const state = {
  users: loadUsers(),
  complaints: loadComplaints(),
  session: loadSession(),
  filter: "ALL",
  selectedComplaintId: null
};

const refs = {
  registerForm: document.getElementById("register-form"),
  registerFeedback: document.getElementById("register-feedback"),
  loginForm: document.getElementById("login-form"),
  loginRole: document.getElementById("login-role"),
  loginFeedback: document.getElementById("login-feedback"),
  workspaceShell: document.getElementById("workspace-shell"),
  workspaceTitle: document.getElementById("workspace-title"),
  workspaceSubtitle: document.getElementById("workspace-subtitle"),
  sessionChip: document.getElementById("session-chip"),
  logoutBtn: document.getElementById("logout-btn"),
  studentWorkspace: document.getElementById("student-workspace"),
  hodWorkspace: document.getElementById("hod-workspace"),
  adminWorkspace: document.getElementById("admin-workspace"),
  studentProfile: document.getElementById("student-profile"),
  studentForm: document.getElementById("student-form"),
  studentBranch: document.getElementById("student-branch"),
  studentDescription: document.getElementById("student-description"),
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
  adminUsers: document.getElementById("admin-users"),
  adminCount: document.getElementById("admin-count"),
  adminComplaints: document.getElementById("admin-complaints")
};

init();

function init() {
  bindEvents();
  renderWorkspace();
  window.addEventListener("storage", handleStorageSync);
  window.setInterval(refreshLiveState, 4000);
}

function bindEvents() {
  refs.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(refs.registerForm);

    const user = {
      role: "STUDENT",
      name: String(formData.get("name")).trim(),
      username: String(formData.get("username")).trim(),
      institutionalId: String(formData.get("institutionalId")).toUpperCase().trim(),
      email: String(formData.get("email")).trim().toLowerCase(),
      password: String(formData.get("password")).trim(),
      department: String(formData.get("department")).trim(),
      systemManaged: false
    };

    const validation = validateRegistration(user);
    if (validation) {
      refs.registerFeedback.textContent = validation;
      refs.registerFeedback.style.color = "#b63e3e";
      return;
    }

    state.users.push(user);
    saveUsers();
    refs.registerForm.reset();
    refs.registerFeedback.textContent = "Registration complete. You can log in now.";
    refs.registerFeedback.style.color = "#12805c";
  });

  refs.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(refs.loginForm);
    const role = String(formData.get("role"));
    const username = String(formData.get("username")).trim();
    const password = String(formData.get("password")).trim();
    const department = String(formData.get("department")).trim();

    const user = state.users.find((item) => {
      const usernameMatches = item.role === "STUDENT"
        ? item.username === username
        : item.username.toLowerCase() === username.toLowerCase();
      return item.role === role
        && usernameMatches
        && item.password === password
        && item.department.toLowerCase() === department.toLowerCase();
    });

    if (!user) {
      refs.loginFeedback.textContent = "Login failed. Check role, username, password, and typed department.";
      refs.loginFeedback.style.color = "#b63e3e";
      return;
    }

    state.session = {
      role: user.role,
      username: user.username,
      name: user.name,
      institutionalId: user.institutionalId,
      department: user.department,
      email: user.email
    };
    saveSession();
    refs.loginForm.reset();
    refs.loginFeedback.textContent = "Login successful.";
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
    const session = state.session;
    if (!session || session.role !== "STUDENT") {
      return;
    }

    const branch = refs.studentBranch.value.trim();
    const description = refs.studentDescription.value.trim();
    if (!branch || !description) {
      return;
    }

    const complaint = {
      id: nextId(),
      studentName: session.name,
      username: session.username,
      institutionalId: session.institutionalId,
      officialEmail: session.email,
      branch,
      description,
      status: "NOT_SEEN",
      remarks: "",
      timestamp: nowString(),
      history: [
        {
          from: null,
          to: "NOT_SEEN",
          actor: "System",
          at: nowString(),
          note: `Complaint submitted and routed to ${branch}.`
        }
      ]
    };

    state.complaints.unshift(complaint);
    saveComplaints();
    refs.studentForm.reset();
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

function validateRegistration(user) {
  if (!ID_PATTERN.test(user.institutionalId)) {
    return "Institutional ID must match XXB81AXXXX.";
  }

  if (!user.email.endsWith("@cvr.ac.in")) {
    return "Institute mail must use the @cvr.ac.in domain.";
  }

  const usernameExists = state.users.some((item) => item.username.toLowerCase() === user.username.toLowerCase());
  if (usernameExists) {
    return "Username already exists.";
  }

  const idExists = state.users.some((item) => item.institutionalId && item.institutionalId === user.institutionalId);
  if (idExists) {
    return "Institutional ID already exists.";
  }

  return "";
}

function renderWorkspace() {
  const session = state.session;
  refs.workspaceShell.classList.toggle("hidden", !session);
  refs.studentWorkspace.classList.add("hidden");
  refs.hodWorkspace.classList.add("hidden");
  refs.adminWorkspace.classList.add("hidden");

  if (!session) {
    refs.workspaceTitle.textContent = "ResolveX Workspace";
    refs.workspaceSubtitle.textContent = "Register if you are new, then log in with your role and department.";
    refs.sessionChip.textContent = "No active session";
    return;
  }

  refs.sessionChip.textContent = `${session.name} | ${session.role} | ${session.department}`;
  refs.workspaceSubtitle.textContent = `${session.email} is active. Department entered at login controls this workspace scope.`;

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
  renderAdminWorkspace();
}

function renderStudentWorkspace(session) {
  refs.studentProfile.innerHTML = `
    <strong>${escapeHtml(session.name)}</strong>
    <p><strong>Username:</strong> ${escapeHtml(session.username)}</p>
    <p><strong>Institutional ID:</strong> ${escapeHtml(session.institutionalId)}</p>
    <p><strong>Institute Mail:</strong> ${escapeHtml(session.email)}</p>
    <p><strong>Department:</strong> ${escapeHtml(session.department)}</p>
  `;

  const complaints = state.complaints.filter((item) => item.username === session.username);
  refs.studentCount.textContent = `${complaints.length} complaint${complaints.length === 1 ? "" : "s"}`;
  refs.studentComplaints.innerHTML = complaints.length
    ? complaints.map(renderStudentComplaintCard).join("")
    : emptyCard("No complaints yet", "After login, you only need to enter branch name and description to submit a complaint.");
}

function renderStudentComplaintCard(item) {
  return `
    <article class="queue-item">
      <div class="queue-top">
        <h5>${escapeHtml(item.branch)}</h5>
        <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <p><strong>ID:</strong> #${item.id}</p>
      <p>${escapeHtml(item.description)}</p>
      ${item.remarks ? `<p><strong>Remarks:</strong> ${escapeHtml(item.remarks)}</p>` : ""}
      <div class="stack">
        ${item.history.slice().reverse().map(renderHistoryItem).join("")}
      </div>
    </article>
  `;
}

function renderHodWorkspace(session) {
  refs.hodDisplayName.value = session.name;
  refs.hodDepartment.value = session.department;
  refs.statusFilter.value = state.filter;

  const deptComplaints = state.complaints.filter((item) => item.branch.toLowerCase() === session.department.toLowerCase());
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
          <p><strong>Branch:</strong> ${escapeHtml(item.branch)}</p>
          <p><strong>Institutional ID:</strong> ${escapeHtml(item.institutionalId)}</p>
        </article>
      `).join("")
    : emptyCard("No complaints for this department", "This queue updates as new complaints are submitted.");

  Array.from(refs.hodComplaints.querySelectorAll("[data-id]")).forEach((node) => {
    node.addEventListener("click", () => openComplaint(Number(node.dataset.id), session));
  });

  renderDetail(session);
}

function renderAdminWorkspace() {
  refs.adminSummary.innerHTML = Object.entries(aggregateDepartmentCounts()).map(([department, count]) => `
    <article class="admin-stat">
      <strong>${escapeHtml(department)}</strong>
      <p>${count} complaint${count === 1 ? "" : "s"}</p>
    </article>
  `).join("");

  refs.adminUsers.innerHTML = state.users.map((user) => `
    <article class="user-item">
      <div class="queue-top">
        <strong>${escapeHtml(user.name)}</strong>
        <span class="badge ${user.role === "ADMIN" ? "admin-badge" : user.role === "HOD" ? "accent" : ""}">${escapeHtml(user.role)}</span>
      </div>
      <p><strong>Username:</strong> ${escapeHtml(user.username)}</p>
      ${user.institutionalId ? `<p><strong>Institutional ID:</strong> ${escapeHtml(user.institutionalId)}</p>` : ""}
      <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
      <p><strong>Department:</strong> ${escapeHtml(user.department)}</p>
    </article>
  `).join("");

  refs.adminCount.textContent = `${state.complaints.length} total`;
  refs.adminComplaints.innerHTML = state.complaints.map((item) => `
    <article class="queue-item">
      <div class="queue-top">
        <h5>${escapeHtml(item.studentName)} | ${escapeHtml(item.branch)}</h5>
        <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <p><strong>Institutional ID:</strong> ${escapeHtml(item.institutionalId)}</p>
      <p>${escapeHtml(item.description)}</p>
      ${item.remarks ? `<p><strong>Remarks:</strong> ${escapeHtml(item.remarks)}</p>` : ""}
    </article>
  `).join("");
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
  refs.detailTitle.textContent = `${complaint.branch} Complaint`;
  refs.detailStatus.className = `badge status-badge ${statusClass(complaint.status)}`;
  refs.detailStatus.textContent = statusLabel(complaint.status);
  refs.detailMeta.innerHTML = `
    <span><strong>ID:</strong> #${complaint.id}</span>
    <span><strong>Branch:</strong> ${escapeHtml(complaint.branch)}</span>
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

function handleStorageSync(event) {
  if (![USERS_KEY, COMPLAINTS_KEY, SESSION_KEY].includes(event.key)) {
    return;
  }
  refreshLiveState();
}

function refreshLiveState() {
  state.users = loadUsers();
  state.complaints = loadComplaints();
  state.session = loadSession();
  renderWorkspace();
}

function loadUsers() {
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(systemUsers));
    return structuredClone(systemUsers);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(systemUsers);
  } catch {
    return structuredClone(systemUsers);
  }
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

function saveUsers() {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
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

function aggregateDepartmentCounts() {
  return state.complaints.reduce((acc, complaint) => {
    acc[complaint.branch] = (acc[complaint.branch] || 0) + 1;
    return acc;
  }, {});
}

function nextId() {
  return Math.max(...state.complaints.map((item) => item.id), 4000) + 1;
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
