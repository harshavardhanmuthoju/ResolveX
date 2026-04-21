const STORAGE_KEY = "resolvex-demo-state-v1";

const initialComplaints = [
  {
    id: 1001,
    studentName: "Aarav Nair",
    department: "Computer Science",
    title: "Lab systems are offline",
    description: "The software lab on block B has systems failing to boot, which is disrupting internal practical sessions.",
    status: "NOT_SEEN",
    remarks: "",
    createdAt: "2026-04-21 09:10",
    history: [
      {
        statusFrom: null,
        statusTo: "NOT_SEEN",
        actor: "System",
        at: "2026-04-21 09:10",
        remarks: "Complaint submitted by student."
      }
    ]
  },
  {
    id: 1002,
    studentName: "Aarav Nair",
    department: "Mechanical Engineering",
    title: "Workshop ventilation issue",
    description: "The workshop area ventilation is not functioning properly during afternoon lab sessions.",
    status: "IN_PROGRESS",
    remarks: "",
    createdAt: "2026-04-20 14:35",
    history: [
      {
        statusFrom: null,
        statusTo: "NOT_SEEN",
        actor: "System",
        at: "2026-04-20 14:35",
        remarks: "Complaint submitted by student."
      },
      {
        statusFrom: "NOT_SEEN",
        statusTo: "IN_PROGRESS",
        actor: "HOD - Mechanical Engineering",
        at: "2026-04-20 15:02",
        remarks: "Complaint opened and acknowledged."
      }
    ]
  },
  {
    id: 1003,
    studentName: "Nisha Varma",
    department: "Computer Science",
    title: "Projector not working in Seminar Hall 2",
    description: "The projector fails to display HDMI input during faculty presentations, causing repeated session delays.",
    status: "RESOLVED",
    remarks: "AV unit cable replaced and projector tested successfully.",
    createdAt: "2026-04-19 11:20",
    history: [
      {
        statusFrom: null,
        statusTo: "NOT_SEEN",
        actor: "System",
        at: "2026-04-19 11:20",
        remarks: "Complaint submitted by student."
      },
      {
        statusFrom: "NOT_SEEN",
        statusTo: "IN_PROGRESS",
        actor: "HOD - Computer Science",
        at: "2026-04-19 11:41",
        remarks: "Complaint opened and acknowledged."
      },
      {
        statusFrom: "IN_PROGRESS",
        statusTo: "RESOLVED",
        actor: "HOD - Computer Science",
        at: "2026-04-19 13:12",
        remarks: "AV unit cable replaced and projector tested successfully."
      }
    ]
  }
];

const state = {
  complaints: loadComplaints(),
  activeTab: "student",
  hodDepartment: "Computer Science",
  statusFilter: "ALL",
  selectedComplaintId: null
};

const refs = {
  studentPanel: document.getElementById("student-panel"),
  hodPanel: document.getElementById("hod-panel"),
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  complaintForm: document.getElementById("complaint-form"),
  studentList: document.getElementById("student-list"),
  studentCount: document.getElementById("student-count"),
  hodDepartment: document.getElementById("hod-department"),
  statusFilter: document.getElementById("status-filter"),
  hodSummary: document.getElementById("hod-summary"),
  hodList: document.getElementById("hod-list"),
  hodCount: document.getElementById("hod-count"),
  detailEmpty: document.getElementById("detail-empty"),
  detailPanel: document.getElementById("detail-panel"),
  detailTitle: document.getElementById("detail-title"),
  detailStatus: document.getElementById("detail-status"),
  detailMeta: document.getElementById("detail-meta"),
  detailDescription: document.getElementById("detail-description"),
  detailHistory: document.getElementById("detail-history"),
  closingRemarks: document.getElementById("closing-remarks"),
  resolveButton: document.getElementById("resolve-button"),
  rejectButton: document.getElementById("reject-button")
};

initialize();

function initialize() {
  bindEvents();
  render();
}

function bindEvents() {
  refs.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      renderTabs();
    });
  });

  refs.complaintForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(refs.complaintForm);
    const studentName = formData.get("studentName").trim();
    const department = formData.get("department");
    const title = formData.get("title").trim();
    const description = formData.get("description").trim();

    const complaint = {
      id: nextComplaintId(),
      studentName,
      department,
      title,
      description,
      status: "NOT_SEEN",
      remarks: "",
      createdAt: formatNow(),
      history: [
        {
          statusFrom: null,
          statusTo: "NOT_SEEN",
          actor: "System",
          at: formatNow(),
          remarks: "Complaint submitted by student."
        }
      ]
    };

    state.complaints.unshift(complaint);
    state.selectedComplaintId = complaint.department === state.hodDepartment ? complaint.id : state.selectedComplaintId;
    persist();
    refs.complaintForm.reset();
    document.getElementById("student-name").value = studentName || "Aarav Nair";
    render();
  });

  refs.hodDepartment.addEventListener("change", (event) => {
    state.hodDepartment = event.target.value;
    state.selectedComplaintId = null;
    render();
  });

  refs.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    state.selectedComplaintId = null;
    render();
  });

  refs.resolveButton.addEventListener("click", () => finalizeComplaint("RESOLVED"));
  refs.rejectButton.addEventListener("click", () => finalizeComplaint("REJECTED"));
}

function render() {
  renderTabs();
  renderStudentList();
  renderHodSummary();
  renderHodList();
  renderDetailPanel();
}

function renderTabs() {
  refs.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  refs.studentPanel.classList.toggle("hidden", state.activeTab !== "student");
  refs.hodPanel.classList.toggle("hidden", state.activeTab !== "hod");
}

function renderStudentList() {
  const studentName = document.getElementById("student-name").value.trim() || "Aarav Nair";
  const complaints = state.complaints.filter((item) => item.studentName === studentName);
  refs.studentCount.textContent = `${complaints.length} complaint${complaints.length === 1 ? "" : "s"}`;

  if (complaints.length === 0) {
    refs.studentList.innerHTML = emptyState("No complaints yet", "Submit a complaint to start tracking its department-wise progress.");
    return;
  }

  refs.studentList.innerHTML = complaints
    .map((item) => `
      <article class="complaint-item">
        <div class="item-topline">
          <h5>${escapeHtml(item.title)}</h5>
          <span class="status-pill ${statusClass(item.status)}">${labelStatus(item.status)}</span>
        </div>
        <div class="meta-row">
          <span>Dept: ${escapeHtml(item.department)}</span>
          <span>ID: #${item.id}</span>
          <span>${item.createdAt}</span>
        </div>
        <p class="detail-description">${escapeHtml(item.description)}</p>
        <div class="history-list">
          ${item.history.slice().reverse().map(renderHistoryItem).join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderHodSummary() {
  const complaints = state.complaints.filter((item) => item.department === state.hodDepartment);
  const counts = {
    total: complaints.length,
    notSeen: complaints.filter((item) => item.status === "NOT_SEEN").length,
    inProgress: complaints.filter((item) => item.status === "IN_PROGRESS").length,
    resolved: complaints.filter((item) => item.status === "RESOLVED").length,
    rejected: complaints.filter((item) => item.status === "REJECTED").length
  };

  refs.hodSummary.innerHTML = `
    <article class="summary-card">
      <strong>${counts.total}</strong>
      <span>Total</span>
    </article>
    <article class="summary-card">
      <strong>${counts.notSeen}</strong>
      <span>Not Seen</span>
    </article>
    <article class="summary-card">
      <strong>${counts.inProgress}</strong>
      <span>In Progress</span>
    </article>
    <article class="summary-card">
      <strong>${counts.resolved + counts.rejected}</strong>
      <span>Closed</span>
    </article>
  `;
}

function renderHodList() {
  refs.hodDepartment.value = state.hodDepartment;
  refs.statusFilter.value = state.statusFilter;

  const complaints = filteredHodComplaints();
  refs.hodCount.textContent = `${complaints.length} visible`;

  if (complaints.length === 0) {
    refs.hodList.innerHTML = emptyState("No matching complaints", "Try a different department or status filter.");
    return;
  }

  refs.hodList.innerHTML = complaints
    .map((item) => `
      <article class="complaint-item ${item.id === state.selectedComplaintId ? "active" : ""}" data-complaint-id="${item.id}">
        <div class="item-topline">
          <h5>${escapeHtml(item.title)}</h5>
          <span class="status-pill ${statusClass(item.status)}">${labelStatus(item.status)}</span>
        </div>
        <div class="meta-row">
          <span>Student: ${escapeHtml(item.studentName)}</span>
          <span>ID: #${item.id}</span>
          <span>${item.createdAt}</span>
        </div>
      </article>
    `)
    .join("");

  Array.from(refs.hodList.querySelectorAll("[data-complaint-id]")).forEach((node) => {
    node.addEventListener("click", () => openComplaint(Number(node.dataset.complaintId)));
  });
}

function renderDetailPanel() {
  const complaint = state.complaints.find((item) => item.id === state.selectedComplaintId);

  if (!complaint) {
    refs.detailEmpty.classList.remove("hidden");
    refs.detailPanel.classList.add("hidden");
    refs.closingRemarks.value = "";
    return;
  }

  refs.detailEmpty.classList.add("hidden");
  refs.detailPanel.classList.remove("hidden");

  refs.detailTitle.textContent = complaint.title;
  refs.detailStatus.className = `badge status-badge ${statusClass(complaint.status)}`;
  refs.detailStatus.textContent = labelStatus(complaint.status);
  refs.detailDescription.textContent = complaint.description;
  refs.detailMeta.innerHTML = `
    <span><strong>Complaint ID:</strong> #${complaint.id}</span>
    <span><strong>Department:</strong> ${escapeHtml(complaint.department)}</span>
    <span><strong>Student:</strong> ${escapeHtml(complaint.studentName)}</span>
    <span><strong>Submitted:</strong> ${complaint.createdAt}</span>
  `;
  refs.detailHistory.innerHTML = complaint.history.slice().reverse().map(renderHistoryItem).join("");
  refs.resolveButton.disabled = complaint.status === "RESOLVED" || complaint.status === "REJECTED";
  refs.rejectButton.disabled = complaint.status === "RESOLVED" || complaint.status === "REJECTED";

  if (complaint.remarks && !refs.closingRemarks.value) {
    refs.closingRemarks.value = complaint.remarks;
  }
}

function openComplaint(id) {
  state.selectedComplaintId = id;
  const complaint = state.complaints.find((item) => item.id === id);

  if (complaint && complaint.status === "NOT_SEEN") {
    updateComplaintStatus(complaint, "IN_PROGRESS", `HOD - ${complaint.department}`, "Complaint opened and acknowledged.");
  }

  render();
}

function finalizeComplaint(nextStatus) {
  const complaint = state.complaints.find((item) => item.id === state.selectedComplaintId);
  if (!complaint) {
    return;
  }

  if (complaint.status === "RESOLVED" || complaint.status === "REJECTED") {
    return;
  }

  const remarks = refs.closingRemarks.value.trim();
  if (!remarks) {
    window.alert("Closing remarks are required before resolving or rejecting a complaint.");
    return;
  }

  complaint.remarks = remarks;
  updateComplaintStatus(complaint, nextStatus, `HOD - ${complaint.department}`, remarks);
  render();
}

function updateComplaintStatus(complaint, nextStatus, actor, remarks) {
  const previousStatus = complaint.status;
  complaint.status = nextStatus;
  complaint.history.push({
    statusFrom: previousStatus,
    statusTo: nextStatus,
    actor,
    at: formatNow(),
    remarks
  });
  persist();
}

function filteredHodComplaints() {
  return state.complaints.filter((item) => {
    if (item.department !== state.hodDepartment) {
      return false;
    }

    if (state.statusFilter !== "ALL" && item.status !== state.statusFilter) {
      return false;
    }

    return true;
  });
}

function renderHistoryItem(entry) {
  const title = entry.statusFrom
    ? `${labelStatus(entry.statusFrom)} -> ${labelStatus(entry.statusTo)}`
    : labelStatus(entry.statusTo);

  return `
    <article class="history-item">
      <div class="history-topline">
        <h5>${title}</h5>
        <span>${entry.at}</span>
      </div>
      <p>${escapeHtml(entry.actor)}${entry.remarks ? ` | ${escapeHtml(entry.remarks)}` : ""}</p>
    </article>
  `;
}

function emptyState(title, description) {
  return `
    <article class="history-item">
      <h5>${title}</h5>
      <p>${description}</p>
    </article>
  `;
}

function nextComplaintId() {
  return Math.max(...state.complaints.map((item) => item.id), 1000) + 1;
}

function loadComplaints() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return structuredClone(initialComplaints);
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : structuredClone(initialComplaints);
  } catch (error) {
    return structuredClone(initialComplaints);
  }
}

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.complaints));
}

function labelStatus(status) {
  const labels = {
    NOT_SEEN: "Not Seen",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected"
  };
  return labels[status] || status;
}

function statusClass(status) {
  const classes = {
    NOT_SEEN: "not-seen",
    IN_PROGRESS: "in-progress",
    RESOLVED: "resolved",
    REJECTED: "rejected"
  };
  return classes[status] || "";
}

function formatNow() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
