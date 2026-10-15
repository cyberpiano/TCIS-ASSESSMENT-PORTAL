/**
 * TCIS Student Results and Report System
 * js/dashboard.js - Main Dashboard Navigation, Summary Metrics & UI State
 */

const Dashboard = {
  currentUser: null,
  currentSettings: null,
  activeSection: "dashboard",

  async init() {
    // 1. Auth Guard
    this.currentUser = window.Auth.requireAuth();
    if (!this.currentUser) return;

    // 2. Load School Configuration
    this.currentSettings = await window.DB.getSettings();
    this.applySettingsToUI();

    // 2b. One-time production results cleanup for clean slate
    if (!localStorage.getItem("tcis_prod_results_cleared_v1")) {
      try {
        await window.DB.clearAllResults();
        localStorage.setItem("tcis_prod_results_cleared_v1", "true");
        console.log("TCIS: Production cleanup executed - all test results cleared.");
      } catch (err) {
        console.warn("Production results cleanup:", err);
      }
    }

    // 2c. One-time sync of official student subject assignments
    if (!localStorage.getItem("tcis_student_subjects_synced_v1")) {
      try {
        await window.DB.syncOfficialSubjectAssignments();
        localStorage.setItem("tcis_student_subjects_synced_v1", "true");
        console.log("TCIS: Official student subject assignments synchronized.");
      } catch (err) {
        console.warn("Student subjects sync error:", err);
      }
    }

    // 3. Setup Navigation & Layout
    this.setupSidebar();
    this.setupUserUI();

    // 4. Initialize Submodules
    if (window.Students) await window.Students.init();
    if (window.Results) await window.Results.init();
    if (window.Reports) await window.Reports.init();
    if (window.Settings && window.Auth.isAdmin()) await window.Settings.init();

    // Ensure all dropdowns are synchronized with active settings
    this.syncAcademicYears(this.currentSettings);

    // 5. Auto-seed subjects if none exist yet (first run)
    if (window.DB && window.Auth.isAdmin()) {
      const existing = await window.DB.getSubjects();
      if (!existing || existing.length === 0) {
        await window.DB.seedDefaultSubjectsToFirestore();
        console.log("TCIS: Default subjects seeded.");
      }
    }

    // 6. Update Metrics & Activity
    await this.updateDashboardStats();
    await this.loadRecentActivity();

    console.log("TCIS Dashboard initialized successfully.");
  },

  applySettingsToUI() {
    const s = this.currentSettings || {};
    const schoolNameEls = document.querySelectorAll(".school-name-text");
    schoolNameEls.forEach(el => {
      el.textContent = s.schoolName || "Temple Christian International School";
    });

    const mottoEls = document.querySelectorAll(".school-motto-text");
    mottoEls.forEach(el => {
      el.textContent = s.schoolMotto || "Excellence, Integrity and Christian Leadership";
    });

    this.syncAcademicYears(s);
  },

  syncAcademicYears(settings) {
    const s = settings || this.currentSettings || {};
    const defaultYear = (s.defaultAcademicYear || "2025/2026").trim();
    const defaultTerm = (s.defaultTerm || "Term 1").trim();

    // Collect all academic years
    let years = Array.isArray(s.academicYears) ? [...s.academicYears] : [];
    if (!years.includes("2024/2025")) years.push("2024/2025");
    if (!years.includes("2025/2026")) years.push("2025/2026");
    if (defaultYear && !years.includes(defaultYear)) years.push(defaultYear);

    // Clean, trim, and deduplicate
    years = Array.from(new Set(years.map(y => String(y).trim()).filter(Boolean)));

    // Sort descending (newest first, e.g. 2026/2027, 2025/2026, 2024/2025)
    years.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, "").slice(0, 4), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, "").slice(0, 4), 10) || 0;
      if (numA !== numB) return numB - numA;
      return b.localeCompare(a);
    });

    const escape = (str) => {
      return String(str || "").replace(/[<>&'"]/g, c => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&#39;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    // 1. Result Entry Academic Year dropdown
    const resultsYearSelect = document.getElementById("resultsAcademicYear");
    if (resultsYearSelect) {
      const currentVal = resultsYearSelect.value;
      resultsYearSelect.innerHTML = years.map(y => `<option value="${escape(y)}">${escape(y)}</option>`).join("");
      if (currentVal && years.includes(currentVal)) {
        resultsYearSelect.value = currentVal;
      } else {
        resultsYearSelect.value = defaultYear;
      }
    }

    // 2. Result Entry Term dropdown
    const resultsTermSelect = document.getElementById("resultsTerm");
    if (resultsTermSelect && defaultTerm && !resultsTermSelect.value) {
      resultsTermSelect.value = defaultTerm;
    }

    // 3. Report Academic Year dropdown
    const reportYearSelect = document.getElementById("reportAcademicYear");
    if (reportYearSelect) {
      const currentVal = reportYearSelect.value;
      reportYearSelect.innerHTML = years.map(y => `<option value="${escape(y)}">${escape(y)}</option>`).join("");
      if (currentVal && years.includes(currentVal)) {
        reportYearSelect.value = currentVal;
      } else {
        reportYearSelect.value = defaultYear;
      }
    }

    // 4. Report Term dropdown
    const reportTermSelect = document.getElementById("reportTerm");
    if (reportTermSelect && defaultTerm && !reportTermSelect.value) {
      reportTermSelect.value = defaultTerm;
    }

    // 5. Excel Export Academic Year dropdown
    const exportYearSelect = document.getElementById("exportAcademicYear");
    if (exportYearSelect) {
      const currentVal = exportYearSelect.value;
      exportYearSelect.innerHTML = `<option value="ALL">All Academic Years</option>` +
        years.map(y => `<option value="${escape(y)}">${escape(y)}</option>`).join("");
      if (currentVal && (currentVal === "ALL" || years.includes(currentVal))) {
        exportYearSelect.value = currentVal;
      } else {
        exportYearSelect.value = defaultYear;
      }
    }

    // 6. Student Registration Form Academic Year (if present)
    const studentFormYear = document.getElementById("studentFormAcademicYear");
    if (studentFormYear) {
      const currentVal = studentFormYear.value;
      studentFormYear.innerHTML = years.map(y => `<option value="${escape(y)}">${escape(y)}</option>`).join("");
      if (currentVal && years.includes(currentVal)) {
        studentFormYear.value = currentVal;
      } else {
        studentFormYear.value = defaultYear;
      }
    }

    // 7. Render chips in Settings page
    this.renderSettingsAcademicYearsChips(years, defaultYear);
  },

  renderSettingsAcademicYearsChips(years, defaultYear) {
    const container = document.getElementById("settingsAcademicYearsList");
    if (!container) return;

    const escape = (str) => {
      return String(str || "").replace(/[<>&'"]/g, c => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&#39;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    let html = "";
    years.forEach(y => {
      const isActive = (y === defaultYear);
      if (isActive) {
        html += `
          <span class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-tcis-navy text-white shadow-sm border border-tcis-navy">
            <i class="fa-solid fa-calendar-check mr-1.5 text-tcis-gold"></i>
            ${escape(y)}
            <span class="ml-1.5 px-1.5 py-0.5 text-[9px] bg-tcis-gold text-tcis-navy-dark rounded font-black uppercase tracking-wider">Active</span>
          </span>
        `;
      } else {
        html += `
          <button type="button" onclick="Settings.selectDefaultAcademicYear('${escape(y)}')"
            title="Click to make ${escape(y)} active"
            class="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:border-tcis-navy hover:text-tcis-navy transition shadow-sm">
            <i class="fa-regular fa-calendar mr-1.5 text-slate-400"></i>
            ${escape(y)}
          </button>
        `;
      }
    });

    container.innerHTML = html;
  },

  setupUserUI() {
    const user = this.currentUser;
    const nameEl = document.getElementById("headerUserName");
    const roleEl = document.getElementById("headerUserRole");

    if (nameEl) nameEl.textContent = user.displayName || user.email;
    if (roleEl) {
      if (user.role === "admin") {
        roleEl.innerHTML = `<span class="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">Administrator</span>`;
      } else {
        roleEl.innerHTML = `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">Teacher</span>`;
      }
    }

    // Connection mode indicator badge
    const modeBadge = document.getElementById("dataModeBadge");
    if (modeBadge) {
      modeBadge.className = "hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200";
      modeBadge.innerHTML = `
        <span class="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Live Cloud Database Connected
      `;
    }

    // Role-based visibility for Admin-only nav tabs and action buttons
    const isAdmin = window.Auth.isAdmin();
    const adminNavIds = ["navSettings", "navSubjectLinking", "navTeachers", "navSubjectsCatalog", "navReports", "bannerGenerateReportsBtn"];
    adminNavIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (isAdmin) {
          el.classList.remove("hidden");
          el.style.display = "";
        } else {
          el.classList.add("hidden");
          el.style.display = "none";
        }
      }
    });

    // Enforce reports page removal for teachers
    const reportsSection = document.getElementById("section-reports");
    if (reportsSection) {
      if (isAdmin) {
        reportsSection.style.display = "";
      } else {
        reportsSection.classList.add("hidden");
        reportsSection.style.display = "none";
        if (this.activeSection === "reports") {
          this.switchSection("dashboard");
        }
      }
    }
  },

  setupSidebar() {
    // Sidebar navigation buttons
    const navButtons = document.querySelectorAll("[data-nav-target]");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-nav-target");
        this.switchSection(target);
        // On mobile, close sidebar after clicking
        this.closeMobileSidebar();
      });
    });

    // Mobile sidebar toggle
    const toggleBtn = document.getElementById("mobileSidebarToggle");
    const backdrop = document.getElementById("mobileSidebarBackdrop");
    const sidebar = document.getElementById("sidebarNav");

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        if (backdrop) backdrop.classList.toggle("hidden");
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeMobileSidebar());
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to log out of the TCIS System?")) {
          window.Auth.logout();
        }
      });
    }
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById("sidebarNav");
    const backdrop = document.getElementById("mobileSidebarBackdrop");
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
  },

  switchSection(sectionId) {
    const adminOnlySections = ["settings", "subject-linking", "teachers", "subjects-catalog", "reports"];
    if (adminOnlySections.includes(sectionId) && !window.Auth.isAdmin()) {
      if (sectionId === "reports") {
        this.showToast("Access restricted: Only Administrators can generate reports.", "warning");
      } else {
        this.showToast("Access restricted: Administrator role required.", "error");
      }
      this.switchSection("dashboard");
      return;
    }

    this.activeSection = sectionId;

    // Hide all sections
    const sections = document.querySelectorAll(".app-section");
    sections.forEach(sec => sec.classList.add("hidden"));

    // Show active section
    const activeSec = document.getElementById(`section-${sectionId}`);
    if (activeSec) {
      activeSec.classList.remove("hidden");
    }

    // Update active nav styling
    const navButtons = document.querySelectorAll("[data-nav-target]");
    navButtons.forEach(btn => {
      const target = btn.getAttribute("data-nav-target");
      if (target === sectionId) {
        btn.classList.add("bg-[#0f1b2f]", "text-[#c59b27]", "border-l-4", "border-[#c59b27]");
        btn.classList.remove("text-slate-300", "hover:bg-[#2c3e60]");
      } else {
        btn.classList.remove("bg-[#0f1b2f]", "text-[#c59b27]", "border-l-4", "border-[#c59b27]");
        btn.classList.add("text-slate-300", "hover:bg-[#2c3e60]");
      }
    });

    // Refresh context data if switching to specific sections
    if (sectionId === "dashboard") {
      this.updateDashboardStats();
      this.loadRecentActivity();
    } else if (sectionId === "students" && window.Students) {
      window.Students.loadStudents();
    } else if (sectionId === "subject-linking" && window.Students) {
      window.Students.loadSubjectLinkingView();
    } else if (sectionId === "teachers" && window.Settings) {
      window.Settings.loadStaffUsersList();
    } else if (sectionId === "subjects-catalog" && window.Settings) {
      window.Settings.loadSubjectsList();
    } else if (sectionId === "reports" && window.Reports) {
      window.Reports.setupDropdowns();
    } else if (sectionId === "results" && window.Results) {
      window.Results.setupDropdowns();
    }
  },

  async updateDashboardStats() {
    try {
      const students = await window.DB.getStudents();
      const settings = this.currentSettings || await window.DB.getSettings();
      const currentYear = settings.defaultAcademicYear || "2025/2026";
      const currentTerm = settings.defaultTerm || "Term 1";

      const results = await window.DB.getResults({
        academicYear: currentYear,
        term: currentTerm
      });

      // 1. Total Students
      const totalStudentsEl = document.getElementById("statTotalStudents");
      if (totalStudentsEl) totalStudentsEl.textContent = students.length;

      // 2. Total Classes / Year Groups
      const classSet = new Set();
      students.forEach(s => {
        if (s.className && s.className.trim()) classSet.add(s.className.trim());
        else if (s.yearGroup) classSet.add(s.yearGroup.trim());
      });
      const totalClassesEl = document.getElementById("statTotalClasses");
      if (totalClassesEl) totalClassesEl.textContent = classSet.size || 0;

      // 3. Results Entered This Term
      const totalResultsEl = document.getElementById("statResultsEntered");
      if (totalResultsEl) totalResultsEl.textContent = results.length;

      // 4. Reports Ready / Generated This Term
      // Count distinct students who have completed assessment records this term
      const completedStudentIds = new Set();
      results.forEach(r => {
        if (r.finalPercentage !== null && r.finalPercentage !== undefined && r.grade !== "Incomplete") {
          completedStudentIds.add(r.studentId);
        }
      });
      const totalReportsEl = document.getElementById("statReportsGenerated");
      if (totalReportsEl) totalReportsEl.textContent = completedStudentIds.size;

      // Render Teacher specific dashboard classes card if role is teacher
      const currentUser = window.Auth?.getCurrentUser();
      if (currentUser && currentUser.role === "teacher") {
        await this.renderTeacherDashboard(currentUser, students, results);
        
        // Personalize dashboard stats for the teacher
        const myAssignments = currentUser.teachingAssignments || [];
        if (totalClassesEl) totalClassesEl.textContent = myAssignments.length;
        
        // Count distinct students in teacher's assigned classes who take the assigned subjects
        const myStudents = students.filter(s => {
          return myAssignments.some(a => {
            const matchYg = s.yearGroup === a.yearGroup;
            const cls = a.className || "All Classes";
            const matchCls = cls === "All Classes" || cls === "All Classes / Streams" || 
              s.className === cls || 
              (s.className && cls.includes(s.className)) ||
              (s.className && s.className.includes(cls)) ||
              s.className === a.yearGroup;
            const takesSub = window.Results?.studentTakesSubject 
              ? window.Results.studentTakesSubject(s, a.subjectName)
              : (!s.enrolledSubjects || s.enrolledSubjects.length === 0 || s.enrolledSubjects.includes(a.subjectName));
            return matchYg && matchCls && takesSub;
          });
        });
        if (totalStudentsEl) totalStudentsEl.textContent = myStudents.length;

        // Count results recorded by this teacher's assigned subjects
        const myResults = results.filter(r => 
          myAssignments.some(a => a.subjectName === r.subjectName && a.yearGroup === r.yearGroup)
        );
        if (totalResultsEl) totalResultsEl.textContent = myResults.length;
      } else {
        const teacherCard = document.getElementById("teacherDashboardClassesCard");
        if (teacherCard) teacherCard.classList.add("hidden");
      }

    } catch (err) {
      console.warn("Error updating dashboard statistics:", err);
    }
  },

  async renderTeacherDashboard(user, allStudents, allResults) {
    const card = document.getElementById("teacherDashboardClassesCard");
    const grid = document.getElementById("teacherAssignedClassesGrid");
    const countBadge = document.getElementById("teacherAssignedClassesCountBadge");
    if (!card || !grid) return;

    card.classList.remove("hidden");
    const assignments = user.teachingAssignments || [];
    if (countBadge) {
      countBadge.textContent = `${assignments.length} Assigned Class${assignments.length === 1 ? '' : 'es'}`;
    }

    if (assignments.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <i class="fa-solid fa-chalkboard-user text-3xl mb-2 text-slate-300 block"></i>
          <p class="text-xs font-semibold text-slate-700">No teaching classes assigned yet.</p>
          <p class="text-[11px] text-slate-400 mt-1">Please contact your academic administrator to assign you subjects and classes.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = assignments.map(a => {
      // Find students enrolled in this class/stream
      const enrolledCount = allStudents.filter(s => {
        const matchYg = s.yearGroup === a.yearGroup;
        const cls = a.className || "All Classes";
        const matchCls = cls === "All Classes" || cls === "All Classes / Streams" || 
          s.className === cls || 
          (s.className && cls.includes(s.className)) ||
          (s.className && s.className.includes(cls)) ||
          s.className === a.yearGroup;
        const takesSubj = window.Results?.studentTakesSubject 
          ? window.Results.studentTakesSubject(s, a.subjectName) 
          : (!s.enrolledSubjects || s.enrolledSubjects.length === 0 || s.enrolledSubjects.includes(a.subjectName));
        return matchYg && matchCls && takesSubj;
      }).length;

      // Find marks recorded for this subject & cohort
      const enteredCount = allResults.filter(r => 
        r.subjectName === a.subjectName && 
        r.yearGroup === a.yearGroup
      ).length;

      return `
        <div class="bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                ${escapeHtml(a.yearGroup)}
              </span>
              <span class="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[140px]" title="${escapeHtml(a.className || "All Classes")}">
                ${escapeHtml(a.className || "All Classes")}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 mb-1 flex items-center">
              <i class="fa-solid fa-book-open text-indigo-700 mr-2 text-xs shrink-0"></i>
              <span class="truncate" title="${escapeHtml(a.subjectName)}">${escapeHtml(a.subjectName)}</span>
            </h4>
            <p class="text-xs text-slate-500 mt-2 flex items-center">
              <i class="fa-solid fa-users text-slate-400 mr-1.5 text-xs"></i>
              <span>${enrolledCount} student${enrolledCount === 1 ? '' : 's'} enrolled</span>
            </p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              ${enteredCount} marks recorded
            </span>
            <button onclick="Dashboard.jumpToClassGrading('${escapeHtml(a.subjectName)}', '${escapeHtml(a.yearGroup)}', '${escapeHtml(a.className || '')}')"
              class="px-3.5 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition flex items-center group">
              <span>Enter Scores</span>
              <i class="fa-solid fa-arrow-right ml-1.5 text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  jumpToClassGrading(subjectName, yearGroup, className) {
    this.switchSection('results');
    setTimeout(() => {
      if (window.Results) {
        window.Results.loadSpecificClass(subjectName, yearGroup, className);
      }
    }, 80);
  },

  async loadRecentActivity() {
    const tableBody = document.getElementById("recentActivityTableBody");
    if (!tableBody) return;

    try {
      const allResults = await window.DB.getResults();
      if (!allResults || allResults.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-8 text-slate-400">
              <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 text-slate-300 block"></i>
              No recent assessment activity recorded.
            </td>
          </tr>
        `;
        return;
      }

      // Sort by updatedAt descending
      const sorted = [...allResults].sort((a, b) => {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }).slice(0, 7);

      tableBody.innerHTML = sorted.map(r => {
        const timeAgo = r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
        const gradeColor = r.grade === "A*" || r.grade === "A" ? "text-emerald-700 bg-emerald-50" : "text-blue-900 bg-blue-50";

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
            <td class="py-2.5 px-3 font-semibold text-slate-800">${escapeHtml(r.studentName || 'Student')}</td>
            <td class="py-2.5 px-3 text-slate-600">${escapeHtml(r.subjectName || 'Subject')}</td>
            <td class="py-2.5 px-3 font-medium text-slate-700">${r.finalPercentage !== undefined && r.finalPercentage !== null ? r.finalPercentage.toFixed(2) + '%' : 'Incomplete'}</td>
            <td class="py-2.5 px-3">
              <span class="px-2 py-0.5 rounded font-bold ${gradeColor}">${r.grade || '—'}</span>
            </td>
            <td class="py-2.5 px-3 text-right text-slate-400 font-mono">${timeAgo}</td>
          </tr>
        `;
      }).join("");

    } catch (err) {
      console.warn("Could not load recent activity:", err);
    }
  },

  showToast(message, type = "info") {
    const toast = document.getElementById("appToast");
    const toastText = document.getElementById("appToastText");
    const toastIcon = document.getElementById("appToastIcon");
    if (!toast || !toastText) return;

    toastText.textContent = message;

    // Reset styles
    toast.className = "fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100";

    if (type === "success") {
      toast.classList.add("bg-emerald-900", "text-white");
      if (toastIcon) toastIcon.className = "fa-solid fa-circle-check text-emerald-400 mr-3 text-lg";
    } else if (type === "error") {
      toast.classList.add("bg-rose-900", "text-white");
      if (toastIcon) toastIcon.className = "fa-solid fa-circle-exclamation text-rose-400 mr-3 text-lg";
    } else if (type === "warning") {
      toast.classList.add("bg-amber-900", "text-white");
      if (toastIcon) toastIcon.className = "fa-solid fa-triangle-exclamation text-amber-400 mr-3 text-lg";
    } else {
      toast.classList.add("bg-slate-900", "text-white");
      if (toastIcon) toastIcon.className = "fa-solid fa-circle-info text-blue-400 mr-3 text-lg";
    }

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 4000);

    toast.classList.remove("hidden");
  }
};

window.Dashboard = Dashboard;

// Auto-run when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  Dashboard.init();
});
