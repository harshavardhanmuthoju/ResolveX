const STORAGE_KEY = "resolvex-cvr-demo-v2";
const ID_PATTERN = /^\d{2}B81A[A-Z0-9]{4}$/;

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
        actor: "CVR",
        at: "2026-04-22 12:18",
        note: "Complaint opened and acknowledged."
      }
    ]
  }
];

const state = {
  complaints: loadState(),
  panel: "student",
  hodName: "Raks",
  hodDepartment: "CSE",
  filter: "ALL",
  selectedComplaintId: null
};

const refs = {
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  studentPanel: document.getElementById("student-panel"),
  hodPanel: document.getElementById("hod-panel"),
  form: document.getElementById("student-form"),
  studentName: document.getElementById("student-name"),
  institutionalId: document.getElementById("institutional-id"),
  officialEmail: document.getElementById("official-email"),
  idHint: document.getElementById("id-hint"),
  studentComplaints: document.getElementById("student-complaints"),
  studentCount: document.getElementById("student-count"),
  hodName: document.getElementById("hod-name"),
  hodDepartment: document.getElementById("hod-department"),
  statusFilter: document.getElementById("status-filter"),
  summaryGrid: document.getElementById("summary-grid"),
  hodComplaints: document.getElementById("hod-complaints"),
  hodCount: document.getElementById("hod-count"),
  detailEmpty: document.getElementById("detail-empty"),
  detailView: document.getElementById("detail-view"),
  detailTitle: document.getElementById("detail-title"),
  detailStatus: document.getElementById("detail-status"),
  detailMeta: document.getElementById("detail-meta"),
  detailDescription: document.getElementById("detail-description"),
  detailHistory: document.getElementById("detail-history"),
  remarks: document.getElementById("hod-remarks"),
  resolveBtn: document.getElementById("resolve-btn"),
  rejectBtn: document.getElementById("reject-btn")
};

init();

function init() {
  bindEvents();
  syncOfficialEmail();
  render();
}

function bindEvents() {
  refs.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.panel = button.dataset.panel;
      renderPanels();
    });
  });

  refs.institutionalId.addEventListener("input", syncOfficialEmail);

  refs.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(refs.form);
    const institutionalId = String(formData.get("institutionalId")).toUpperCase().trim();

    if (!ID_PATTERN.test(institutionalId)) {
      refs.idHint.textContent = "Institutional ID must match XXB81AXXXX.";
      refs.idHint.style.color = "#b63e3e";
      return;
    }

    const complaint = {
      id: nextId(),
      studentName: String(formData.get("studentName")).trim(),
      institutionalId,
      officialEmail: `${institutionalId}@cvr.ac.in`,
      category: String(formData.get("category")),
      department: String(formData.get("department")),
      description: String(formData.get("description")).trim(),
      status: "NOT_SEEN",
      remarks: "",
      timestamp: nowString(),
      history: [
        {
          from: null,
          to: "NOT_SEEN",
          actor: "System",
          at: nowString(),
          note: `Complaint submitted and routed to ${String(formData.get("department"))}.`
        }
      ]
    };

    state.complaints.unshift(complaint);
    saveState();
    refs.form.reset();
    refs.studentName.value = complaint.studentName;
    refs.institutionalId.value = complaint.institutionalId;
    syncOfficialEmail();
    render();
  });

  refs.hodName.addEventListener("change", (event) => {
    state.hodName = event.target.value;
    render();
  });

  refs.hodDepartment.addEventListener("change", (event) => {
    state.hodDepartment = event.target.value;
    state.selectedComplaintId = null;
    render();
  });

  refs.statusFilter.addEventListener("change", (event) => {
    state.filter = event.target.value;
    state.selectedComplaintId = null;
    render();
  });

  refs.resolveBtn.addEventListener("click", () => finalizeComplaint("RESOLVED"));
  refs.rejectBtn.addEventListener("click", () => finalizeComplaint("REJECTED"));
}

function syncOfficialEmail() {
  const value = refs.institutionalId.value.toUpperCase().trim();
  refs.institutionalId.value = value;
  refs.officialEmail.value = value ? `${value}@cvr.ac.in` : "";
  refs.idHint.textContent = ID_PATTERN.test(value)
    ? "Institutional ID accepted."
    : "Format: XXB81AXXXX";
  refs.idHint.style.color = ID_PATTERN.test(value) ? "#12805c" : "";
}

function render() {
  renderPanels();
  renderStudentComplaints();
  renderSummary();
  renderHodComplaints();
  renderDetail();
}

function renderPanels() {
  refs.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === state.panel);
  });
  refs.studentPanel.classList.toggle("hidden", state.panel !== "student");
  refs.hodPanel.classList.toggle("hidden", state.panel !== "hod");
}

function renderStudentComplaints() {
  const activeId = refs.institutionalId.value.toUpperCase().trim();
  const complaints = state.complaints.filter((item) => item.institutionalId === activeId);
  refs.studentCount.textContent = `${complaints.length} complaint${complaints.length === 1 ? "" : "s"}`;

  if (!complaints.length) {
    refs.studentComplaints.innerHTML = emptyCard("No complaints yet", "Submit a complaint to start your ResolveX history.");
    return;
  }

  refs.studentComplaints.innerHTML = complaints.map(renderComplaintCard).join("");
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

function renderSummary() {
  refs.hodName.value = state.hodName;
  refs.hodDepartment.value = state.hodDepartment;
  refs.statusFilter.value = state.filter;

  const deptComplaints = state.complaints.filter((item) => item.department === state.hodDepartment);
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
}

function renderHodComplaints() {
  const visible = state.complaints.filter((item) => {
    if (item.department !== state.hodDepartment) {
      return false;
    }
    if (state.filter !== "ALL" && item.status !== state.filter) {
      return false;
    }
    return true;
  });

  refs.hodCount.textContent = `${visible.length} visible`;

  if (!visible.length) {
    refs.hodComplaints.innerHTML = emptyCard("No departmental matches", "Adjust the department or status filter to continue.");
    return;
  }

  refs.hodComplaints.innerHTML = visible.map((item) => `
    <article class="queue-item ${item.id === state.selectedComplaintId ? "selected" : ""}" data-id="${item.id}">
      <div class="queue-top">
        <h5>${escapeHtml(item.studentName)}</h5>
        <span class="status-pill ${statusClass(item.status)}">${statusLabel(item.status)}</span>
      </div>
      <p><strong>Institutional ID:</strong> ${escapeHtml(item.institutionalId)}</p>
      <p><strong>Category:</strong> ${escapeHtml(item.category)}</p>
    </article>
  `).join("");

  Array.from(refs.hodComplaints.querySelectorAll("[data-id]")).forEach((node) => {
    node.addEventListener("click", () => openComplaint(Number(node.dataset.id)));
  });
}

function openComplaint(id) {
  state.selectedComplaintId = id;
  const complaint = state.complaints.find((item) => item.id === id);
  if (complaint && complaint.status === "NOT_SEEN") {
    complaint.history.push({
      from: "NOT_SEEN",
      to: "IN_PROGRESS",
      actor: state.hodName,
      at: nowString(),
      note: "Complaint opened and acknowledged under Read and Solve."
    });
    complaint.status = "IN_PROGRESS";
    saveState();
  }
  render();
}

function renderDetail() {
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
  refs.resolveBtn.disabled = closed;
  refs.rejectBtn.disabled = closed;
}

function finalizeComplaint(nextStatus) {
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
    actor: state.hodName,
    at: nowString(),
    note: remarks
  });
  complaint.status = nextStatus;
  saveState();
  render();
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

function emptyCard(title, copy) {
  return `<article class="history-item"><strong>${title}</strong><p>${copy}</p></article>`;
}

function loadState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(initialComplaints);
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(initialComplaints);
  } catch {
    return structuredClone(initialComplaints);
  }
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.complaints));
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
