/**
 * TCIS Student Results and Report System
 * js/students.js - Student Management Module
 */

const Students = {
  allStudents: [],
  filteredStudents: [],
  currentEditingId: null,

  YEAR_GROUPS: [
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Year 13"
  ],

  async init() {
    this.populateYearGroupDropdowns();
    await this.loadStudents();
    this.setupEventListeners();
  },

  populateYearGroupDropdowns() {
    const filterSelect = document.getElementById("studentYearGroupFilter");
    const formSelect = document.getElementById("studentFormYearGroup");
    const linkingFilter = document.getElementById("linkingYearGroupFilter");

    const optionsHtml = this.YEAR_GROUPS.map(yg => `<option value="${yg}">${yg}</option>`).join("");

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="">All Year Groups</option>` + optionsHtml;
    }
    if (formSelect) {
      formSelect.innerHTML = `<option value="">Select Year Group</option>` + optionsHtml;
    }
    if (linkingFilter) {
      linkingFilter.innerHTML = `<option value="">All Year Groups</option>` + optionsHtml;
    }
  },

  setupEventListeners() {
    const searchInput = document.getElementById("studentSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.applyFilters());
    }

    const yearFilter = document.getElementById("studentYearGroupFilter");
    if (yearFilter) {
      yearFilter.addEventListener("change", () => {
        this.updateClassFilterOptions();
        this.applyFilters();
      });
    }

    const classFilter = document.getElementById("studentClassFilter");
    if (classFilter) {
      classFilter.addEventListener("change", () => this.applyFilters());
    }

    const statusFilter = document.getElementById("studentStatusFilter");
    if (statusFilter) {
      statusFilter.addEventListener("change", () => this.applyFilters());
    }

    // Subject Linking filter listeners
    const linkingYg = document.getElementById("linkingYearGroupFilter");
    if (linkingYg) {
      linkingYg.addEventListener("change", () => {
        this.updateLinkingClassFilterOptions();
        this.renderSubjectLinkingTable();
      });
    }

    const linkingCls = document.getElementById("linkingClassFilter");
    if (linkingCls) {
      linkingCls.addEventListener("change", () => this.renderSubjectLinkingTable());
    }

    const linkingSearch = document.getElementById("linkingSearchInput");
    if (linkingSearch) {
      linkingSearch.addEventListener("input", () => this.renderSubjectLinkingTable());
    }

    const studentForm = document.getElementById("studentModalForm");
    if (studentForm) {
      studentForm.addEventListener("submit", (e) => this.handleSaveStudent(e));
    }

    const modalYgSelect = document.getElementById("studentFormYearGroup");
    if (modalYgSelect) {
      modalYgSelect.addEventListener("change", () => {
        const checked = Array.from(document.querySelectorAll("input[name='enrolledSubjectCheckbox']:checked")).map(cb => cb.value);
        this.renderEnrolledSubjectsSelector(checked);
      });
    }
  },

  async loadSubjectLinkingView() {
    if (!this.allStudents || this.allStudents.length === 0) {
      await this.loadStudents();
    }
    this.updateLinkingClassFilterOptions();
    this.renderSubjectLinkingTable();
  },

  updateLinkingClassFilterOptions() {
    const classFilter = document.getElementById("linkingClassFilter");
    if (!classFilter) return;

    const selectedYear = document.getElementById("linkingYearGroupFilter")?.value || "";
    const classes = new Set();

    this.allStudents.forEach(s => {
      if (!selectedYear || s.yearGroup === selectedYear) {
        if (s.className && s.className.trim()) {
          classes.add(s.className.trim());
        }
      }
    });

    const currentVal = classFilter.value;
    let html = `<option value="">All Classes / Streams</option>`;
    Array.from(classes).sort().forEach(cls => {
      html += `<option value="${cls}" ${cls === currentVal ? "selected" : ""}>${cls}</option>`;
    });
    classFilter.innerHTML = html;
  },

  renderSubjectLinkingTable() {
    const tbody = document.getElementById("linkingStudentsTableBody");
    const countBadge = document.getElementById("linkingCountBadge");
    if (!tbody) return;

    const yg = document.getElementById("linkingYearGroupFilter")?.value || "";
    const cls = document.getElementById("linkingClassFilter")?.value || "";
    const query = (document.getElementById("linkingSearchInput")?.value || "").toLowerCase().trim();

    const filtered = this.allStudents.filter(s => {
      const matchYg = !yg || s.yearGroup === yg;
      const matchCls = !cls || s.className === cls;
      const matchQuery = !query ||
        (s.fullName && s.fullName.toLowerCase().includes(query)) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query));
      return matchYg && matchCls && matchQuery;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${this.allStudents.length} students`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400">No students match current filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const subjects = s.enrolledSubjects || [];
      const chips = subjects.length > 0
        ? subjects.map(sub => `<span class="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 mr-1 mb-1">${escapeHtml(sub)}</span>`).join("")
        : `<span class="text-amber-600 text-xs italic">No subjects linked yet</span>`;

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="px-4 py-3 font-semibold text-slate-900">${escapeHtml(s.fullName)}</td>
          <td class="px-4 py-3 font-medium text-slate-600">${escapeHtml(s.yearGroup)}</td>
          <td class="px-4 py-3 text-slate-600">${escapeHtml(s.className || "—")}</td>
          <td class="px-4 py-3 max-w-md">${chips}</td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <button onclick="Students.openEditModal('${s.id}')"
              class="px-3 py-1.5 bg-tcis-navy hover:bg-tcis-navy-light text-white rounded-lg text-xs font-semibold shadow transition">
              <i class="fa-solid fa-pen-to-square mr-1"></i> Edit Subjects
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  async loadStudents() {
    try {
      this.allStudents = await window.DB.getStudents();
      this.updateClassFilterOptions();
      this.applyFilters();
      if (window.Dashboard) {
        window.Dashboard.updateDashboardStats();
      }
    } catch (err) {
      console.error("Error loading students:", err);
      this.showToast("Failed to load students: " + err.message, "error");
    }
  },

  updateClassFilterOptions() {
    const classFilter = document.getElementById("studentClassFilter");
    if (!classFilter) return;

    const selectedYear = document.getElementById("studentYearGroupFilter")?.value || "";
    const classes = new Set();

    this.allStudents.forEach(s => {
      if (!selectedYear || s.yearGroup === selectedYear) {
        if (s.className && s.className.trim()) {
          classes.add(s.className.trim());
        }
      }
    });

    const currentVal = classFilter.value;
    let html = `<option value="">All Classes / Streams</option>`;
    Array.from(classes).sort().forEach(cls => {
      html += `<option value="${cls}" ${cls === currentVal ? "selected" : ""}>${cls}</option>`;
    });
    classFilter.innerHTML = html;
  },

  applyFilters() {
    const query = (document.getElementById("studentSearchInput")?.value || "").toLowerCase().trim();
    const yearGroup = document.getElementById("studentYearGroupFilter")?.value || "";
    const className = document.getElementById("studentClassFilter")?.value || "";
    const status = document.getElementById("studentStatusFilter")?.value || "";

    this.filteredStudents = this.allStudents.filter(s => {
      const matchesQuery = !query || 
        (s.fullName && s.fullName.toLowerCase().includes(query)) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(query)) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(query));

      const matchesYear = !yearGroup || s.yearGroup === yearGroup;
      const matchesClass = !className || s.className === className;
      const matchesStatus = !status || s.status === status;

      return matchesQuery && matchesYear && matchesClass && matchesStatus;
    });

    this.renderStudentsTable();
  },

  renderStudentsTable() {
    const tbody = document.getElementById("studentsTableBody");
    const countBadge = document.getElementById("studentsCountBadge");

    if (countBadge) {
      countBadge.textContent = `${this.filteredStudents.length} of ${this.allStudents.length} students`;
    }

    if (!tbody) return;

    if (this.filteredStudents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-12 text-slate-400">
            <i class="fa-solid fa-user-graduate text-4xl mb-3 text-slate-300 block"></i>
            <p class="font-medium">No student records found matching the criteria.</p>
            <p class="text-sm mt-1">Try clearing filters or click "Add Student" to create a new profile.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredStudents.map(student => {
      const statusBadge = student.status === "Active" 
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
             <span class="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full"></span>Active
           </span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
             <span class="w-1.5 h-1.5 mr-1.5 bg-slate-400 rounded-full"></span>Inactive
           </span>`;

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="px-4 py-3 font-mono text-sm font-semibold text-slate-800">
            ${escapeHtml(student.admissionNumber || "—")}
          </td>
          <td class="px-4 py-3 font-medium text-slate-900">
            ${escapeHtml(student.fullName)}
            <div class="text-[11px] text-slate-500 mt-0.5">
              <i class="fa-solid fa-book-open mr-1 text-slate-400"></i>${(student.enrolledSubjects && student.enrolledSubjects.length) ? student.enrolledSubjects.length + ' Enrolled Subject(s)' : '<span class="text-amber-600">No subjects linked</span>'}
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            <span class="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium text-xs">
              ${escapeHtml(student.yearGroup)}
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${escapeHtml(student.className || "—")}
          </td>
          <td class="px-4 py-3 text-sm text-slate-600">
            ${escapeHtml(student.academicYear || "—")}
          </td>
          <td class="px-4 py-3 text-sm">
            ${statusBadge}
          </td>
          <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
            <button onclick="Students.viewStudentDetails('${student.id}')" 
              class="p-1.5 text-blue-700 hover:bg-blue-100 rounded transition" title="View Academic Records">
              <i class="fa-solid fa-eye text-sm"></i>
            </button>
            <button onclick="Students.enterResultsForStudent('${student.id}')" 
              class="p-1.5 text-amber-700 hover:bg-amber-100 rounded transition" title="Enter Term Results">
              <i class="fa-solid fa-pen-to-square text-sm"></i>
            </button>
            <button onclick="Students.openEditModal('${student.id}')" 
              class="p-1.5 text-slate-700 hover:bg-slate-200 rounded transition" title="Edit Student">
              <i class="fa-solid fa-pencil text-sm"></i>
            </button>
            <button onclick="Students.confirmDeleteStudent('${student.id}')" 
              class="p-1.5 text-rose-600 hover:bg-rose-100 rounded transition" title="Delete Student">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  async openAddModal() {
    this.currentEditingId = null;
    const modalTitle = document.getElementById("studentModalTitle");
    const form = document.getElementById("studentModalForm");
    if (modalTitle) modalTitle.textContent = "Add New Student";
    if (form) form.reset();

    const academicYearInput = document.getElementById("studentFormAcademicYear");
    if (academicYearInput && window.Dashboard?.currentSettings) {
      academicYearInput.value = window.Dashboard.currentSettings.defaultAcademicYear || "2025/2026";
    }

    await this.renderEnrolledSubjectsSelector([]);

    const modal = document.getElementById("studentModal");
    if (modal) modal.classList.remove("hidden");
  },

  async openEditModal(studentId) {
    this.currentEditingId = studentId;
    const student = this.allStudents.find(s => s.id === studentId);
    if (!student) return;

    const modalTitle = document.getElementById("studentModalTitle");
    if (modalTitle) modalTitle.textContent = "Edit Student Profile";

    const admissionInput = document.getElementById("studentFormAdmission");
    if (admissionInput) admissionInput.value = student.admissionNumber || "";

    document.getElementById("studentFormFullName").value = student.fullName || "";
    document.getElementById("studentFormYearGroup").value = student.yearGroup || "";
    document.getElementById("studentFormClassName").value = student.className || "";
    document.getElementById("studentFormAcademicYear").value = student.academicYear || "";
    document.getElementById("studentFormStatus").value = student.status || "Active";
    document.getElementById("studentFormDOB").value = student.dateOfBirth || "";
    document.getElementById("studentFormGuardian").value = student.guardianName || "";

    await this.renderEnrolledSubjectsSelector(student.enrolledSubjects || []);

    const modal = document.getElementById("studentModal");
    if (modal) modal.classList.remove("hidden");
  },

  async renderEnrolledSubjectsSelector(selectedSubjects = []) {
    const grid = document.getElementById("subjectsCheckboxGrid");
    if (!grid) return;

    let allSubjects = await window.DB.getSubjects();
    if (!allSubjects || allSubjects.length === 0) {
      grid.innerHTML = `<p class="text-xs text-amber-600 col-span-2">No school subjects found. Add subjects in Settings first.</p>`;
      return;
    }

    const selectedYg = document.getElementById("studentFormYearGroup")?.value || "";
    if (selectedYg) {
      allSubjects = allSubjects.filter(sub => !sub.yearGroups || sub.yearGroups.includes(selectedYg));
    }

    grid.innerHTML = allSubjects.map(sub => {
      const isChecked = selectedSubjects.includes(sub.name);
      return `
        <label class="flex items-center p-2 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 cursor-pointer text-xs transition">
          <input type="checkbox" name="enrolledSubjectCheckbox" value="${escapeHtml(sub.name)}"
            ${isChecked ? 'checked' : ''}
            class="rounded text-teal-700 focus:ring-teal-600 h-3.5 w-3.5 mr-2" />
          <span class="font-medium text-slate-800">${escapeHtml(sub.name)}</span>
        </label>
      `;
    }).join("");
  },

  selectAllEnrolledSubjects(selectAll = true) {
    const checkboxes = document.querySelectorAll("input[name='enrolledSubjectCheckbox']");
    checkboxes.forEach(cb => cb.checked = selectAll);
  },

  closeModal() {
    const modal = document.getElementById("studentModal");
    if (modal) modal.classList.add("hidden");
    this.currentEditingId = null;
  },

  async handleSaveStudent(e) {
    e.preventDefault();

    const fullName = document.getElementById("studentFormFullName").value.trim();
    const yearGroup = document.getElementById("studentFormYearGroup").value;
    const className = document.getElementById("studentFormClassName").value.trim();
    const academicYear = document.getElementById("studentFormAcademicYear").value.trim();
    const status = document.getElementById("studentFormStatus").value;
    const dateOfBirth = document.getElementById("studentFormDOB").value;
    const guardianName = document.getElementById("studentFormGuardian").value.trim();

    // Validations: Full name, Year group, Academic year
    if (!fullName || !yearGroup || !academicYear) {
      this.showToast("Please complete all required fields (*).", "warning");
      return;
    }

    // Collect checked enrolled subjects
    const checkedBoxes = document.querySelectorAll("input[name='enrolledSubjectCheckbox']:checked");
    const enrolledSubjects = Array.from(checkedBoxes).map(cb => cb.value);

    // Keep existing admission number if editing, or leave clean/empty
    let admissionNumber = "";
    if (this.currentEditingId) {
      const existing = this.allStudents.find(s => s.id === this.currentEditingId);
      if (existing && existing.admissionNumber) {
        admissionNumber = existing.admissionNumber;
      }
    }

    const studentData = {
      fullName,
      yearGroup,
      className,
      academicYear,
      status,
      dateOfBirth,
      guardianName,
      enrolledSubjects
    };

    if (admissionNumber) {
      studentData.admissionNumber = admissionNumber;
    }

    if (this.currentEditingId) {
      studentData.id = this.currentEditingId;
    }

    const saveBtn = document.getElementById("saveStudentBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving...`;
    }

    try {
      await window.DB.saveStudent(studentData);
      this.showToast(this.currentEditingId ? "Student profile updated successfully." : "New student registered successfully.", "success");
      this.closeModal();
      await this.loadStudents();
    } catch (err) {
      console.error("Error saving student:", err);
      this.showToast("Failed to save student: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>Save Student`;
      }
    }
  },

  async confirmDeleteStudent(studentId) {
    const student = this.allStudents.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete student "${student.fullName}" (${student.admissionNumber})? This will also remove associated term results.`)) {
      return;
    }

    try {
      await window.DB.deleteStudent(studentId);
      this.showToast("Student deleted successfully.", "success");
      await this.loadStudents();
    } catch (err) {
      this.showToast("Failed to delete student: " + err.message, "error");
    }
  },

  async viewStudentDetails(studentId) {
    const student = this.allStudents.find(s => s.id === studentId);
    if (!student) return;

    const modal = document.getElementById("studentDetailsModal");
    const content = document.getElementById("studentDetailsContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-blue-800"></i>
        <p class="text-sm text-slate-500 mt-2">Loading academic records...</p>
      </div>
    `;
    modal.classList.remove("hidden");

    // Fetch student's results
    const results = await window.DB.getResults({ studentId });
    
    // Group results by Academic Year and Term
    const termGroups = {};
    results.forEach(r => {
      const key = `${r.academicYear} - ${r.term}`;
      if (!termGroups[key]) termGroups[key] = [];
      termGroups[key].push(r);
    });

    let resultsHtml = "";
    if (Object.keys(termGroups).length === 0) {
      resultsHtml = `
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center text-amber-800 text-sm mt-4">
          <i class="fa-solid fa-triangle-exclamation mr-1.5"></i>
          No assessment results entered yet for this student.
        </div>
      `;
    } else {
      resultsHtml = Object.keys(termGroups).map(termKey => {
        const termResults = termGroups[termKey];
        const rows = termResults.map(r => `
          <tr class="border-b border-slate-100 text-sm">
            <td class="py-2 px-3 font-medium text-slate-800">${escapeHtml(r.subjectName)}</td>
            <td class="py-2 px-3 text-center">${r.categoryPercentages?.exercise !== undefined ? r.categoryPercentages.exercise.toFixed(1) + '%' : '—'}</td>
            <td class="py-2 px-3 text-center">${r.categoryPercentages?.homework !== undefined ? r.categoryPercentages.homework.toFixed(1) + '%' : '—'}</td>
            <td class="py-2 px-3 text-center">${r.categoryPercentages?.progressiveTest !== undefined ? r.categoryPercentages.progressiveTest.toFixed(1) + '%' : '—'}</td>
            <td class="py-2 px-3 text-center">${r.categoryPercentages?.midTerm !== undefined ? r.categoryPercentages.midTerm.toFixed(1) + '%' : '—'}</td>
            <td class="py-2 px-3 text-center">${r.categoryPercentages?.endOfTerm !== undefined ? r.categoryPercentages.endOfTerm.toFixed(1) + '%' : '—'}</td>
            <td class="py-2 px-3 text-center font-bold text-slate-900">${r.finalPercentage !== undefined ? r.finalPercentage.toFixed(2) + '%' : 'Incomplete'}</td>
            <td class="py-2 px-3 text-center font-bold ${r.grade === 'A*' || r.grade === 'A' ? 'text-emerald-700' : 'text-blue-900'}">${r.grade || '—'}</td>
            <td class="py-2 px-3 text-center font-semibold text-slate-700">${r.gradePoint !== undefined ? r.gradePoint.toFixed(2) : '—'}</td>
          </tr>
        `).join("");

        return `
          <div class="mt-6 border border-slate-200 rounded-lg overflow-hidden">
            <div class="bg-slate-100 px-4 py-2 font-semibold text-sm text-slate-800 flex justify-between items-center">
              <span><i class="fa-solid fa-calendar-alt text-amber-600 mr-2"></i>${termKey}</span>
              <button onclick="Students.generateReportFromDetails('${student.id}', '${termResults[0].academicYear}', '${termResults[0].term}')" 
                class="px-2.5 py-1 text-xs bg-blue-800 hover:bg-blue-900 text-white rounded font-medium shadow-sm">
                <i class="fa-solid fa-file-pdf mr-1"></i>Generate Report
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 text-xs text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="py-2 px-3">Subject</th>
                    <th class="py-2 px-3 text-center">Ex.</th>
                    <th class="py-2 px-3 text-center">HW</th>
                    <th class="py-2 px-3 text-center">Prog.</th>
                    <th class="py-2 px-3 text-center">Mid</th>
                    <th class="py-2 px-3 text-center">End</th>
                    <th class="py-2 px-3 text-center">Final</th>
                    <th class="py-2 px-3 text-center">Grade</th>
                    <th class="py-2 px-3 text-center">GP</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        `;
      }).join("");
    }

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
        <div>
          <p class="text-xs text-slate-500 font-medium">Full Name</p>
          <p class="font-bold text-slate-900 text-base">${escapeHtml(student.fullName)}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Admission Number</p>
          <p class="font-mono font-bold text-blue-900">${escapeHtml(student.admissionNumber)}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Year Group & Class</p>
          <p class="font-medium text-slate-800">${escapeHtml(student.yearGroup)} &bull; ${escapeHtml(student.className || 'No Stream')}</p>
        </div>
        <div>
          <p class="text-xs text-slate-500 font-medium">Guardian / Contact</p>
          <p class="font-medium text-slate-800">${escapeHtml(student.guardianName || 'Not specified')}</p>
        </div>
      </div>

      <div class="mt-4">
        <h4 class="font-bold text-slate-900 text-sm flex items-center">
          <i class="fa-solid fa-graduation-cap text-blue-900 mr-2"></i>Academic History
        </h4>
        ${resultsHtml}
      </div>
    `;
  },

  closeDetailsModal() {
    const modal = document.getElementById("studentDetailsModal");
    if (modal) modal.classList.add("hidden");
  },

  enterResultsForStudent(studentId) {
    const student = this.allStudents.find(s => s.id === studentId);
    if (!student) return;

    // Switch view to Results
    window.Dashboard.switchSection("results");

    // Pre-populate selection
    setTimeout(() => {
      const yearSelect = document.getElementById("resultsAcademicYear");
      const termSelect = document.getElementById("resultsTerm");
      const ygSelect = document.getElementById("resultsYearGroup");

      if (yearSelect && student.academicYear) yearSelect.value = student.academicYear;
      if (ygSelect && student.yearGroup) {
        ygSelect.value = student.yearGroup;
        window.Results.onYearGroupChange();
      }

      setTimeout(() => {
        const studentSelect = document.getElementById("resultsStudentSelect");
        if (studentSelect) {
          studentSelect.value = student.id;
          window.Results.onStudentChange();
        }
      }, 50);
    }, 50);
  },

  generateReportFromDetails(studentId, academicYear, term) {
    this.closeDetailsModal();
    window.Dashboard.switchSection("reports");
    setTimeout(() => {
      const yr = document.getElementById("reportAcademicYear");
      const tm = document.getElementById("reportTerm");
      const std = document.getElementById("reportStudentSelect");
      if (yr) yr.value = academicYear;
      if (tm) tm.value = term;
      if (std) {
        std.value = studentId;
        window.Reports.onStudentSelected();
      }
    }, 50);
  },

  showToast(message, type = "info") {
    if (window.Dashboard && window.Dashboard.showToast) {
      window.Dashboard.showToast(message, type);
    } else {
      alert(message);
    }
  }
};

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.Students = Students;
window.escapeHtml = escapeHtml;
