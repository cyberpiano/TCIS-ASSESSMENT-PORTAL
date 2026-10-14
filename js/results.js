/**
 * TCIS Student Results and Report System
 * js/results.js - Assessment & Score Entry Module
 * Features:
 *  - Class Spreadsheet Grid Entry (whole class in a single table)
 *  - Real-time grading badge based on TCIS grading scheme for Progressive Test, Mid-term, etc.
 *  - Dynamic Exercise columns (Exercise 1, Exercise 2, + Add Exercise)
 *  - Teacher assignment scoping & Admin unrestricted grading
 *  - Single Student Entry fallback view
 */

const Results = {
  // Helper to determine if a student is enrolled in / takes a given subject
  studentTakesSubject(student, subjectName) {
    if (!student || !subjectName) return false;
    const target = subjectName.trim().toLowerCase();

    // If student has explicit enrolled subjects:
    if (Array.isArray(student.enrolledSubjects) && student.enrolledSubjects.length > 0) {
      return student.enrolledSubjects.some(sub => {
        const s = sub.trim().toLowerCase();
        if (s === target) return true;
        // Known aliases in TCIS catalog
        if (
          (target.includes("information") && s.includes("information")) ||
          (target === "ict" && (s.includes("information") || s === "ict")) ||
          (s === "ict" && (target.includes("information") || target === "ict"))
        ) return true;
        if (target.includes("art") && s.includes("art")) return true;
        if (target.includes("science") && s.includes("science")) return true;
        if (target.includes("math") && s.includes("math")) return true;
        return false;
      });
    }

    // If student has no explicit enrolled subjects list, check stream affinity
    const studentClass = (student.className || "").toLowerCase();
    const isScienceSubj = /physics|chemistry|biology|science|stem/.test(target);
    const isHumanitiesSubj = /history|geography|literature|sociology|humanities|government|religious/.test(target);

    if ((studentClass.includes("humanities") || studentClass.includes("arts")) && isScienceSubj) return false;
    if (studentClass.includes("science") && isHumanitiesSubj) return false;

    return true;
  },

  // Check if a teacher user is assigned to grade a specific subject, year group, and class
  isTeacherAuthorized(user, subject, yearGroup, className) {
    if (!user || user.role === "admin") return true;
    const assignments = user.teachingAssignments || [];
    if (assignments.length === 0) return false;

    return assignments.some(a => {
      // 1. Subject match with alias support
      const aSub = a.subjectName.trim().toLowerCase();
      const tSub = subject.trim().toLowerCase();
      let subMatch = (aSub === tSub);
      if (!subMatch) {
        if (
          (aSub.includes("information") && tSub.includes("information")) ||
          (aSub === "ict" && (tSub.includes("information") || tSub === "ict")) ||
          (tSub === "ict" && (aSub.includes("information") || aSub === "ict"))
        ) {
          subMatch = true;
        }
      }
      if (!subMatch) return false;

      // 2. Year group match
      if (a.yearGroup !== yearGroup) return false;

      // 3. Class match
      const aCls = (a.className || "All Classes").trim();
      const curCls = (className || "").trim();
      if (aCls === "All Classes" || aCls === "All Classes / Streams" || !curCls || curCls === "All Classes" || curCls === "All Classes / Streams") {
        return true;
      }
      return aCls === curCls ||
             aCls.toLowerCase().includes(curCls.toLowerCase()) ||
             curCls.toLowerCase().includes(aCls.toLowerCase()) ||
             (curCls === yearGroup);
    });
  },

  // Direct jumper used by Teacher Dashboard cards
  async loadSpecificClass(subject, yearGroup, className = "") {
    this.entryMode = "class";
    this.updateEntryModeUI();

    const subjectSelect = document.getElementById("resultsSubjectSelect");
    const ygSelect = document.getElementById("resultsYearGroup");
    const classSelect = document.getElementById("resultsClass");

    if (ygSelect) ygSelect.value = yearGroup;
    this.refreshSubjectDropdown();
    if (subjectSelect) subjectSelect.value = subject;
    this.onYearGroupChange();
    if (classSelect) {
      if (className) classSelect.value = className;
      else classSelect.value = "";
    }

    await this.loadClassSheet();
  },
  entryMode: "class", // "class" or "student"
  currentStudent: null,
  subjectEntries: [], // For single student mode
  overallComment: "",

  // Class Sheet Grid State
  classStudents: [],
  classGridRows: {}, // Map keyed by studentId
  exerciseColumns: [
    { id: "ex1", label: "Exercise 1", max: 20 },
    { id: "ex2", label: "Exercise 2", max: 20 }
  ],
  defaultMaxMarks: {
    progressiveTest1: 100,
    progressiveTest2: 100,
    midTerm: 100,
    endOfTerm: 100
  },

  STANDARD_SUBJECTS: [
    // Year 7–8
    "English Language",
    "Mathematics",
    "Combined Science",
    "French",
    "Information & Communication Technology",
    "Literature",
    "Art & Craft",
    "Global Perspectives",
    // Year 9 extras
    "Economics",
    "Accounting",
    "Business Studies",
    // Year 10–11
    "Extended Mathematics",
    "Coordinated Science",
    "Art and Design",
    "Add Mathematics",
    "Chemistry",
    "Physics",
    "Biology",
    "History",
    "Sociology",
    "Geography",
    // Year 12–13 extras
    "Pure Mathematics",
    "Statistics 1",
    "Information Technology",
    "Mechanics-1"
  ],

  ASSESSMENT_KEYS: [
    { key: "exercise", label: "Exercise", defaultMax: 20, weightKey: "exercise" },
    { key: "homework", label: "Homework", defaultMax: 10, weightKey: "homework" },
    { key: "progressiveTest", label: "Progressive Test", defaultMax: 100, weightKey: "progressiveTest" },
    { key: "midTerm", label: "Mid-Term Exam", defaultMax: 100, weightKey: "midTerm" },
    { key: "endOfTerm", label: "End-of-Term Exam", defaultMax: 100, weightKey: "endOfTerm" }
  ],

  async init() {
    if (window.Dashboard && window.Dashboard.syncAcademicYears && window.Dashboard.currentSettings) {
      window.Dashboard.syncAcademicYears(window.Dashboard.currentSettings);
    }
    this.setupDropdowns();
    this.setupEventListeners();
  },

  setEntryMode(mode) {
    this.entryMode = mode;
    const classBtn = document.getElementById("entryModeClassBtn");
    const studentBtn = document.getElementById("entryModeStudentBtn");
    const classWorkspace = document.getElementById("classSheetWorkspace");
    const studentWorkspace = document.getElementById("resultsEntrySection");
    const studentWrapper = document.getElementById("resultsSingleStudentWrapper");

    if (mode === "class") {
      if (classBtn) {
        classBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-white text-indigo-900 shadow-sm flex items-center";
      }
      if (studentBtn) {
        studentBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900 flex items-center";
      }
      if (classWorkspace) classWorkspace.classList.remove("hidden");
      if (studentWorkspace) studentWorkspace.classList.add("hidden");
      if (studentWrapper) studentWrapper.classList.add("hidden");
      this.loadClassSheet();
    } else {
      if (classBtn) {
        classBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition text-slate-600 hover:text-slate-900 flex items-center";
      }
      if (studentBtn) {
        studentBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition bg-white text-indigo-900 shadow-sm flex items-center";
      }
      if (classWorkspace) classWorkspace.classList.add("hidden");
      if (studentWrapper) studentWrapper.classList.remove("hidden");
      this.populateStudentDropdown();
    }
  },

  // Returns the set of year groups this user is allowed to see
  getAllowedYearGroups() {
    const user = window.Auth?.getCurrentUser();
    if (!user || user.role === "admin") return null; // null = all
    const assignments = user.teachingAssignments || [];
    const ygs = new Set(assignments.map(a => a.yearGroup));
    return ygs.size > 0 ? Array.from(ygs) : null;
  },

  // Returns the set of classes this user is allowed to see (optionally filtered by year group)
  getAllowedClasses(forYearGroup = null) {
    const user = window.Auth?.getCurrentUser();
    if (!user || user.role === "admin") return null; // null = all
    const assignments = user.teachingAssignments || [];
    const classes = new Set();
    assignments.forEach(a => {
      if (!forYearGroup || a.yearGroup === forYearGroup) {
        if (a.className && a.className !== "All Classes") classes.add(a.className);
      }
    });
    return classes.size > 0 ? Array.from(classes) : null;
  },

  async setupDropdowns() {
    const user = window.Auth?.getCurrentUser();
    const isAdmin = !user || user.role === "admin";

    // Store all subjects for filtering later
    this._allSubjects = await window.DB.getSubjects();

    // 1. Populate Subject Dropdown (filtered by current year group)
    this.refreshSubjectDropdown();

    // 2. Year Groups Dropdown
    const ygSelect = document.getElementById("resultsYearGroup");
    if (ygSelect && window.Students?.YEAR_GROUPS) {
      const allowedYgs = this.getAllowedYearGroups();
      const ygs = allowedYgs ? window.Students.YEAR_GROUPS.filter(yg => allowedYgs.includes(yg)) : window.Students.YEAR_GROUPS;
      ygSelect.innerHTML = `<option value="">Select Year Group</option>` +
        ygs.map(yg => `<option value="${yg}">${yg}</option>`).join("");

      if (allowedYgs && ygs.length === 1) {
        ygSelect.value = ygs[0];
      }
    }

    this.onYearGroupChange();
    this.populateStudentDropdown();
  },

  // Refresh the subject dropdown, optionally filtered by year group
  refreshSubjectDropdown() {
    const user = window.Auth?.getCurrentUser();
    const isAdmin = !user || user.role === "admin";
    const subjectSelect = document.getElementById("resultsSubjectSelect");
    if (!subjectSelect) return;

    const selectedYg = document.getElementById("resultsYearGroup")?.value || "";

    if (isAdmin) {
      let subjects = this._allSubjects || [];
      if (selectedYg) {
        subjects = subjects.filter(s => !s.yearGroups || s.yearGroups.includes(selectedYg));
      }
      subjectSelect.innerHTML = `<option value="">Select Subject to Grade...</option>` +
        subjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join("");
    } else {
      const assignments = user.teachingAssignments || [];
      let subjectNames = [...new Set(assignments.map(a => a.subjectName))];
      if (selectedYg) {
        // Filter to only assignments for the selected year group
        const allowedSubjectsForYg = new Set(
          assignments.filter(a => a.yearGroup === selectedYg).map(a => a.subjectName)
        );
        subjectNames = subjectNames.filter(s => allowedSubjectsForYg.has(s));
      }
      subjectSelect.innerHTML = `<option value="">Select Subject to Grade...</option>` +
        subjectNames.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
      if (subjectNames.length === 1) subjectSelect.value = subjectNames[0];
    }
  },

  setupEventListeners() {
    const ygSelect = document.getElementById("resultsYearGroup");
    const classSelect = document.getElementById("resultsClass");
    const subjectSelect = document.getElementById("resultsSubjectSelect");
    const studentSelect = document.getElementById("resultsStudentSelect");
    const yearSelect = document.getElementById("resultsAcademicYear");
    const termSelect = document.getElementById("resultsTerm");

    const reloadHandler = () => {
      if (this.entryMode === "class") {
        this.loadClassSheet();
      } else if (this.currentStudent) {
        this.loadStudentResults();
      }
    };

    if (ygSelect) {
      ygSelect.addEventListener("change", () => {
        this.refreshSubjectDropdown();
        this.onYearGroupChange();
        reloadHandler();
      });
    }

    if (classSelect) {
      classSelect.addEventListener("change", () => {
        this.populateStudentDropdown();
        reloadHandler();
      });
    }

    if (subjectSelect) {
      subjectSelect.addEventListener("change", reloadHandler);
    }

    if (yearSelect) yearSelect.addEventListener("change", reloadHandler);
    if (termSelect) termSelect.addEventListener("change", reloadHandler);

    if (studentSelect) {
      studentSelect.addEventListener("change", () => this.onStudentChange());
    }

    const addSubjectBtn = document.getElementById("addSubjectRowBtn");
    if (addSubjectBtn) {
      addSubjectBtn.addEventListener("click", () => this.addNewSubjectRow());
    }

    const saveAllBtn = document.getElementById("saveAllResultsBtn");
    if (saveAllBtn) {
      saveAllBtn.addEventListener("click", () => this.saveAllResults());
    }
  },

  onYearGroupChange() {
    const yg = document.getElementById("resultsYearGroup")?.value || "";
    const classSelect = document.getElementById("resultsClass");
    if (!classSelect) return;

    const allStudents = window.Students?.allStudents || [];
    const allowedClasses = this.getAllowedClasses(yg);

    const classes = new Set();
    allStudents.forEach(s => {
      if (!yg || s.yearGroup === yg) {
        if (s.className && s.className.trim()) {
          if (!allowedClasses || allowedClasses.includes(s.className.trim())) {
            classes.add(s.className.trim());
          }
        }
      }
    });

    let html = `<option value="">All Classes / Streams</option>`;
    Array.from(classes).sort().forEach(cls => {
      html += `<option value="${escapeHtml(cls)}">${escapeHtml(cls)}</option>`;
    });
    classSelect.innerHTML = html;

    if (allowedClasses && allowedClasses.length === 1) {
      classSelect.value = allowedClasses[0];
    }

    this.populateStudentDropdown();
  },

  populateStudentDropdown() {
    const studentSelect = document.getElementById("resultsStudentSelect");
    if (!studentSelect) return;

    const yg = document.getElementById("resultsYearGroup")?.value || "";
    const cls = document.getElementById("resultsClass")?.value || "";
    const allStudents = window.Students?.allStudents || [];

    const filtered = allStudents.filter(s => {
      return (!yg || s.yearGroup === yg) && (!cls || s.className === cls);
    });

    let html = `<option value="">Select Student...</option>`;
    filtered.forEach(s => {
      const idLabel = s.admissionNumber ? ` (${escapeHtml(s.admissionNumber)})` : "";
      html += `<option value="${s.id}">${escapeHtml(s.fullName)}${idLabel} - ${escapeHtml(s.yearGroup)}</option>`;
    });
    studentSelect.innerHTML = html;
  },

  // ==============================================================
  // CLASS SPREADSHEET GRID ENTRY MODULE
  // ==============================================================

  async loadClassSheet() {
    const academicYear = document.getElementById("resultsAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("resultsTerm")?.value || "Term 1";
    const subject = document.getElementById("resultsSubjectSelect")?.value || "";
    const yearGroup = document.getElementById("resultsYearGroup")?.value || "";
    const className = document.getElementById("resultsClass")?.value || "";

    const headerTitle = document.getElementById("classSheetSubjectHeader");
    const metaEl = document.getElementById("classSheetClassMeta");
    const badgeEl = document.getElementById("classSheetStudentCountBadge");
    const tbody = document.getElementById("classSheetTableBody");

    if (!subject || !yearGroup) {
      if (headerTitle) headerTitle.textContent = "Select Subject & Year Group to Grade";
      if (metaEl) metaEl.textContent = "Choose a Subject, Year Group, and Class above to load students.";
      if (badgeEl) badgeEl.textContent = "0 Enrolled Students";
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="15" class="text-center py-12 text-slate-400">
              <i class="fa-solid fa-chalkboard-user text-3xl mb-2 text-slate-300 block"></i>
              Please select a Subject and Year Group above to load students.
            </td>
          </tr>
        `;
      }
      return;
    }

    if (headerTitle) headerTitle.textContent = subject;
    const classLabel = className ? `Class: ${className}` : "All Classes";
    if (metaEl) metaEl.textContent = `${yearGroup} • ${classLabel} • ${academicYear} (${term})`;

    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="15" class="text-center py-10 text-slate-400">
            <i class="fa-solid fa-spinner fa-spin mr-2 text-indigo-600"></i> Loading class roster and saved marks...
          </td>
        </tr>
      `;
    }

    // A. Teacher Authorization Enforcement:
    const currentUser = window.Auth?.getCurrentUser();
    if (currentUser && currentUser.role === "teacher") {
      const isAuthorized = this.isTeacherAuthorized(currentUser, subject, yearGroup, className);
      if (!isAuthorized) {
        if (headerTitle) headerTitle.textContent = `${subject} (Restricted)`;
        if (metaEl) metaEl.textContent = `Access Restricted: You are not assigned to grade ${subject} in ${yearGroup} ${className || 'All Classes'}.`;
        if (badgeEl) badgeEl.textContent = "Access Restricted";
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="15" class="text-center py-12 text-rose-700 bg-rose-50/70 border border-rose-200 rounded-xl">
                <i class="fa-solid fa-lock text-3xl mb-2 text-rose-500 block"></i>
                <p class="font-bold text-sm">Class Gradebook Access Restricted</p>
                <p class="text-xs text-rose-600 mt-1 max-w-md mx-auto">
                  You are not assigned to teach <strong>${escapeHtml(subject)}</strong> in <strong>${escapeHtml(yearGroup)} ${escapeHtml(className || 'All Classes')}</strong>.
                  Teachers can only enter results for their officially assigned classes.
                </p>
              </td>
            </tr>
          `;
        }
        return;
      }
    }

    const allStudents = window.Students?.allStudents || await window.DB.getStudents();
    
    // B. Filter students by Year Group and Class
    let targetStudents = allStudents.filter(s => {
      const matchYg = s.yearGroup === yearGroup;
      let matchCls = true;
      if (className && className !== "All Classes" && className !== "All Classes / Streams") {
        matchCls = (s.className === className) ||
                   (s.className && className.includes(s.className)) ||
                   (s.className && s.className.includes(className)) ||
                   (s.className === yearGroup);
      }
      return matchYg && matchCls;
    });

    // C. STRICT SUBJECT ENROLLMENT:
    // When a teacher is assigned to a class, only students in the class that take this subject are loaded
    targetStudents = targetStudents.filter(s => this.studentTakesSubject(s, subject));

    targetStudents.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));
    this.classStudents = targetStudents;

    if (badgeEl) badgeEl.textContent = `${targetStudents.length} Student(s) Taking ${subject}`;

    if (targetStudents.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="15" class="text-center py-10 text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
              <i class="fa-solid fa-triangle-exclamation mr-2 text-amber-500 text-lg"></i>
              No students in <strong>${escapeHtml(yearGroup)} ${escapeHtml(className || 'All Classes')}</strong> are currently enrolled in <strong>${escapeHtml(subject)}</strong>.
            </td>
          </tr>
        `;
      }
      return;
    }

    // Fetch existing saved results for this subject, year, and term
    const existingResults = await window.DB.getResults({
      academicYear,
      term,
      subjectName: subject,
      yearGroup
    });

    const resultMap = new Map();
    existingResults.forEach(r => {
      resultMap.set(r.studentId, r);
    });

    // Initialize classGridRows
    this.classGridRows = {};
    targetStudents.forEach(st => {
      const saved = resultMap.get(st.id);
      
      const row = {
        studentId: st.id,
        studentName: st.fullName,
        admissionNumber: st.admissionNumber || "",
        yearGroup: st.yearGroup,
        className: st.className || "",
        exercises: {},
        progressiveTest1: { score: "", max: this.defaultMaxMarks.progressiveTest1 },
        progressiveTest2: { score: "", max: this.defaultMaxMarks.progressiveTest2 },
        midTerm: { score: "", max: this.defaultMaxMarks.midTerm },
        endOfTerm: { score: "", max: this.defaultMaxMarks.endOfTerm },
        teacherComment: saved?.teacherComment || ""
      };

      // Populate exercises
      this.exerciseColumns.forEach((col, idx) => {
        row.exercises[col.id] = { score: "", max: col.max };
      });

      if (saved) {
        // Load exercises if present
        if (saved.assessments?.exercises && Array.isArray(saved.assessments.exercises)) {
          saved.assessments.exercises.forEach((ex, idx) => {
            const colId = this.exerciseColumns[idx]?.id || `ex${idx+1}`;
            row.exercises[colId] = { score: ex.score ?? "", max: ex.max || 20 };
          });
        } else if (saved.assessments?.exercise) {
          row.exercises["ex1"] = { score: saved.assessments.exercise.score ?? "", max: saved.assessments.exercise.max || 20 };
        }

        // Load Progressive Test 1
        const pt1 = saved.assessments?.progressiveTest1 || saved.assessments?.progressiveTest;
        if (pt1) {
          row.progressiveTest1 = { score: pt1.score ?? "", max: (pt1.max && pt1.max !== 40) ? pt1.max : 100 };
        }

        // Load Progressive Test 2
        if (saved.assessments?.progressiveTest2) {
          row.progressiveTest2 = { score: saved.assessments.progressiveTest2.score ?? "", max: (saved.assessments.progressiveTest2.max && saved.assessments.progressiveTest2.max !== 40) ? saved.assessments.progressiveTest2.max : 100 };
        }

        // Load Mid-Term
        if (saved.assessments?.midTerm) {
          row.midTerm = { score: saved.assessments.midTerm.score ?? "", max: saved.assessments.midTerm.max || 100 };
        }

        // Load End of Term
        if (saved.assessments?.endOfTerm) {
          row.endOfTerm = { score: saved.assessments.endOfTerm.score ?? "", max: saved.assessments.endOfTerm.max || 100 };
        }
      }

      this.classGridRows[st.id] = row;
    });

    this.renderClassGridTable();
  },

  addClassExerciseColumn() {
    const nextIdx = this.exerciseColumns.length + 1;
    const newColId = `ex${nextIdx}`;
    this.exerciseColumns.push({
      id: newColId,
      label: `Exercise ${nextIdx}`,
      max: 20
    });

    // Add to all current student rows
    Object.values(this.classGridRows).forEach(row => {
      row.exercises[newColId] = { score: "", max: 20 };
    });

    this.renderClassGridTable();
    this.showToast(`Added ${this.exerciseColumns[this.exerciseColumns.length - 1].label} column to gradebook.`, "info");
  },

  renderClassGridTable() {
    const thead = document.getElementById("classSheetTableHead");
    const tbody = document.getElementById("classSheetTableBody");
    if (!thead || !tbody) return;

    // Build Table Header
    let exerciseHeadersHtml = this.exerciseColumns.map(col => `
      <th class="py-2.5 px-2 text-center min-w-[90px] border-r border-slate-700 bg-slate-800">
        ${escapeHtml(col.label)}
        <span class="block text-[9px] text-slate-300 font-normal">(/${col.max})</span>
      </th>
    `).join("");

    thead.innerHTML = `
      <tr>
        <th class="py-3 px-2 text-center w-10 border-r border-slate-700">#</th>
        <th class="py-3 px-3 text-left min-w-[170px] border-r border-slate-700">Student Name</th>
        ${exerciseHeadersHtml}
        <th class="py-2.5 px-2 text-center min-w-[115px] border-r border-indigo-900 bg-indigo-950">
          Prog. Test 1
          <span class="block text-[9px] text-indigo-300 font-normal">(/${this.defaultMaxMarks.progressiveTest1})</span>
        </th>
        <th class="py-2.5 px-2 text-center min-w-[115px] border-r border-indigo-900 bg-indigo-950">
          Prog. Test 2
          <span class="block text-[9px] text-indigo-300 font-normal">(/${this.defaultMaxMarks.progressiveTest2})</span>
        </th>
        <th class="py-2.5 px-2 text-center min-w-[115px] border-r border-blue-900 bg-blue-950">
          Mid-Term Exam
          <span class="block text-[9px] text-blue-300 font-normal">(/${this.defaultMaxMarks.midTerm})</span>
        </th>
        <th class="py-2.5 px-2 text-center min-w-[115px] border-r border-slate-700 bg-slate-800">
          End of Term
          <span class="block text-[9px] text-slate-300 font-normal">(/${this.defaultMaxMarks.endOfTerm})</span>
        </th>
        <th class="py-2.5 px-2 text-center min-w-[140px] border-r border-slate-700 bg-slate-900">
          Final % &amp; Grade
          <span class="block text-[9px] text-slate-400 font-normal">(30% Pre-avg + 70% Exam)</span>
        </th>
        <th class="py-3 px-3 text-left min-w-[140px] border-r border-slate-700">Teacher Remark</th>
        <th class="py-3 px-2 text-center w-16">Action</th>
      </tr>
    `;

    // Build Table Rows
    const filterQuery = (document.getElementById("classSheetSearchInput")?.value || "").trim().toLowerCase();

    tbody.innerHTML = this.classStudents.map((st, idx) => {
      const row = this.classGridRows[st.id];
      if (!row) return "";

      const matchName = st.fullName.toLowerCase().includes(filterQuery) ||
                        (st.admissionNumber && st.admissionNumber.toLowerCase().includes(filterQuery));
      if (filterQuery && !matchName) return "";

      const calc = this.calculateClassGridStudentSummary(row);

      // Exercise Inputs
      const exInputsHtml = this.exerciseColumns.map(col => {
        const field = row.exercises[col.id] || { score: "", max: col.max };
        return `
          <td class="py-2 px-1 text-center border-r border-slate-100 bg-slate-50/50">
            <input type="number" min="0" max="${col.max}" step="0.5"
              value="${field.score !== null && field.score !== undefined ? field.score : ''}"
              placeholder="—"
              oninput="Results.onClassGridExerciseChange('${st.id}', '${col.id}', this.value)"
              class="w-14 px-1.5 py-1 text-xs text-center font-semibold border border-slate-300 rounded focus:ring-1 focus:ring-indigo-700 bg-white" />
          </td>
        `;
      }).join("");

      // Real-time TCIS Grade Badges
      const prog1Badge = this.renderTCISMiniBadge(row.progressiveTest1.score, row.progressiveTest1.max);
      const prog2Badge = this.renderTCISMiniBadge(row.progressiveTest2.score, row.progressiveTest2.max);
      const midBadge = this.renderTCISMiniBadge(row.midTerm.score, row.midTerm.max);
      const endBadge = this.renderTCISMiniBadge(row.endOfTerm.score, row.endOfTerm.max);

      // Final Grade Badge
      let finalCellHtml = "";
      if (calc.hasScore) {
        finalCellHtml = `
          <div class="text-center">
            <span class="font-bold text-slate-900 text-xs block">${calc.finalPercentage !== null ? calc.finalPercentage.toFixed(1) + '%' : '—'}</span>
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${calc.gradeBadgeColor}">${calc.grade} (${calc.gradePoint !== null ? calc.gradePoint.toFixed(2) : '—'})</span>
          </div>
        `;
      } else {
        finalCellHtml = `<span class="text-slate-400 text-xs text-center block italic">Pending</span>`;
      }

      const admSub = st.admissionNumber ? `<span class="text-[10px] text-slate-400 block font-mono">${escapeHtml(st.admissionNumber)}</span>` : "";

      return `
        <tr id="row-student-${st.id}" class="hover:bg-indigo-50/30 transition text-xs border-b border-slate-100">
          <td class="py-2.5 px-2 text-center font-bold text-slate-400 border-r border-slate-100">${idx + 1}</td>
          <td class="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-100">
            ${escapeHtml(st.fullName)}
            ${admSub}
          </td>
          ${exInputsHtml}
          
          <!-- Progressive Test 1 -->
          <td class="py-2 px-1 text-center border-r border-slate-100 bg-indigo-50/20">
            <input type="number" min="0" max="${row.progressiveTest1.max}" step="0.5"
              value="${row.progressiveTest1.score !== null && row.progressiveTest1.score !== undefined ? row.progressiveTest1.score : ''}"
              placeholder="—"
              oninput="Results.onClassGridSingleScoreChange('${st.id}', 'progressiveTest1', this.value)"
              class="w-14 px-1.5 py-1 text-xs text-center font-bold border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-700 bg-white" />
            <div id="badge-prog1-${st.id}">${prog1Badge}</div>
          </td>

          <!-- Progressive Test 2 -->
          <td class="py-2 px-1 text-center border-r border-slate-100 bg-indigo-50/20">
            <input type="number" min="0" max="${row.progressiveTest2.max}" step="0.5"
              value="${row.progressiveTest2.score !== null && row.progressiveTest2.score !== undefined ? row.progressiveTest2.score : ''}"
              placeholder="—"
              oninput="Results.onClassGridSingleScoreChange('${st.id}', 'progressiveTest2', this.value)"
              class="w-14 px-1.5 py-1 text-xs text-center font-bold border border-indigo-300 rounded focus:ring-2 focus:ring-indigo-700 bg-white" />
            <div id="badge-prog2-${st.id}">${prog2Badge}</div>
          </td>

          <!-- Mid-Term Exam -->
          <td class="py-2 px-1 text-center border-r border-slate-100 bg-blue-50/20">
            <input type="number" min="0" max="${row.midTerm.max}" step="0.5"
              value="${row.midTerm.score !== null && row.midTerm.score !== undefined ? row.midTerm.score : ''}"
              placeholder="—"
              oninput="Results.onClassGridSingleScoreChange('${st.id}', 'midTerm', this.value)"
              class="w-14 px-1.5 py-1 text-xs text-center font-bold border border-blue-300 rounded focus:ring-2 focus:ring-blue-700 bg-white" />
            <div id="badge-mid-${st.id}">${midBadge}</div>
          </td>

          <!-- End of Term Exam -->
          <td class="py-2 px-1 text-center border-r border-slate-100 bg-slate-50/30">
            <input type="number" min="0" max="${row.endOfTerm.max}" step="0.5"
              value="${row.endOfTerm.score !== null && row.endOfTerm.score !== undefined ? row.endOfTerm.score : ''}"
              placeholder="—"
              oninput="Results.onClassGridSingleScoreChange('${st.id}', 'endOfTerm', this.value)"
              class="w-14 px-1.5 py-1 text-xs text-center font-bold border border-slate-300 rounded focus:ring-2 focus:ring-slate-700 bg-white" />
            <div id="badge-end-${st.id}">${endBadge}</div>
          </td>

          <!-- Final Grade Column -->
          <td id="final-cell-${st.id}" class="py-2 px-2 text-center border-r border-slate-100">
            ${finalCellHtml}
          </td>

          <!-- Remark Input -->
          <td class="py-2 px-2 border-r border-slate-100">
            <input type="text"
              value="${escapeHtml(row.teacherComment)}"
              placeholder="Remark..."
              oninput="Results.onClassGridCommentChange('${st.id}', this.value)"
              class="w-full px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-700" />
          </td>

          <!-- Row Action -->
          <td class="py-2 px-2 text-center">
            <button onclick="Results.saveSingleClassStudent('${st.id}')"
              id="btn-save-row-${st.id}"
              title="Save marks for this student"
              class="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition">
              <i class="fa-solid fa-floppy-disk text-sm"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  // Renders the small pill with Grade and GPA (e.g. C+ (2.67), A* (4.0), Ungraded (0.0))
  renderTCISMiniBadge(score, max) {
    if (score === "" || score === null || score === undefined) {
      return `<span class="text-[9px] text-slate-300 font-mono">—</span>`;
    }
    const scoreNum = parseFloat(score);
    const maxNum = parseFloat(max) || 100;
    if (isNaN(scoreNum) || scoreNum < 0 || maxNum <= 0) {
      return `<span class="text-[9px] text-slate-300 font-mono">—</span>`;
    }

    const pct = (scoreNum / maxNum) * 100;
    const gradeInfo = window.Reports?.getTCISGrade(pct);
    if (!gradeInfo) return `<span class="text-[9px] text-slate-400">—</span>`;

    let color = "bg-slate-100 text-slate-700";
    if (gradeInfo.grade === "A*" || gradeInfo.grade === "A") {
      color = "bg-emerald-100 text-emerald-800";
    } else if (gradeInfo.grade === "B+" || gradeInfo.grade === "B") {
      color = "bg-blue-100 text-blue-800";
    } else if (gradeInfo.grade === "C+" || gradeInfo.grade === "C") {
      color = "bg-indigo-100 text-indigo-800";
    } else if (gradeInfo.grade === "D") {
      color = "bg-amber-100 text-amber-800";
    } else {
      color = "bg-rose-100 text-rose-800";
    }

    const gpStr = window.Reports?.formatGradePoint ? window.Reports.formatGradePoint(gradeInfo.gradePoint) : (gradeInfo.gradePoint !== null ? gradeInfo.gradePoint.toFixed(1) : "0.0");
    return `<span class="inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-bold ${color}">${gradeInfo.grade} (${gpStr})</span>`;
  },

  onClassGridExerciseChange(studentId, exerciseId, val) {
    const row = this.classGridRows[studentId];
    if (!row) return;
    if (!row.exercises[exerciseId]) row.exercises[exerciseId] = { score: "", max: 20 };
    row.exercises[exerciseId].score = val;
    this.refreshClassGridStudentRow(studentId);
  },

  onClassGridSingleScoreChange(studentId, assessmentKey, val) {
    const row = this.classGridRows[studentId];
    if (!row) return;
    row[assessmentKey].score = val;

    // Update real-time mini badge
    let badgeId = `badge-prog1-${studentId}`;
    if (assessmentKey === "progressiveTest2") badgeId = `badge-prog2-${studentId}`;
    else if (assessmentKey === "midTerm") badgeId = `badge-mid-${studentId}`;
    else if (assessmentKey === "endOfTerm") badgeId = `badge-end-${studentId}`;

    const badgeEl = document.getElementById(badgeId);
    if (badgeEl) {
      badgeEl.innerHTML = this.renderTCISMiniBadge(val, row[assessmentKey].max);
    }

    this.refreshClassGridStudentRow(studentId);
  },

  onClassGridCommentChange(studentId, val) {
    const row = this.classGridRows[studentId];
    if (row) row.teacherComment = val;
  },

  refreshClassGridStudentRow(studentId) {
    const row = this.classGridRows[studentId];
    if (!row) return;

    const calc = this.calculateClassGridStudentSummary(row);
    const finalCell = document.getElementById(`final-cell-${studentId}`);
    if (finalCell) {
      if (calc.hasScore) {
        finalCell.innerHTML = `
          <div class="text-center">
            <span class="font-bold text-slate-900 text-xs block">${calc.finalPercentage !== null ? calc.finalPercentage.toFixed(1) + '%' : '—'}</span>
            <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${calc.gradeBadgeColor}">${calc.grade} (${calc.gradePoint !== null ? calc.gradePoint.toFixed(2) : '—'})</span>
          </div>
        `;
      } else {
        finalCell.innerHTML = `<span class="text-slate-400 text-xs text-center block italic">Pending</span>`;
      }
    }
  },

  calculateClassGridStudentSummary(row) {
    // Each individual assessment badge shows its OWN raw percentage (score/max × 100).
    // The "Final %" column uses the TCIS exam formula:
    //   Final = (avg of PT1%, PT2%, MidTerm%) × 30%  +  EndOfTerm% × 70%
    // If End-of-Term is not yet entered, we show the pre-assessment average as a running indicator.

    // Progressive Test 1 percentage
    const p1Score = (row.progressiveTest1 && row.progressiveTest1.score !== "" && !isNaN(parseFloat(row.progressiveTest1.score))) ? parseFloat(row.progressiveTest1.score) : null;
    const p1Max = (row.progressiveTest1 && parseFloat(row.progressiveTest1.max)) || 100;
    const p1Percent = p1Score !== null ? (p1Score / p1Max) * 100 : null;

    // Progressive Test 2 percentage
    const p2Score = (row.progressiveTest2 && row.progressiveTest2.score !== "" && !isNaN(parseFloat(row.progressiveTest2.score))) ? parseFloat(row.progressiveTest2.score) : null;
    const p2Max = (row.progressiveTest2 && parseFloat(row.progressiveTest2.max)) || 100;
    const p2Percent = p2Score !== null ? (p2Score / p2Max) * 100 : null;

    // Mid-Term percentage
    const midScore = (row.midTerm && row.midTerm.score !== "" && !isNaN(parseFloat(row.midTerm.score))) ? parseFloat(row.midTerm.score) : null;
    const midMax = (row.midTerm && parseFloat(row.midTerm.max)) || 100;
    const midPercent = midScore !== null ? (midScore / midMax) * 100 : null;

    // End-of-Term percentage
    const endScore = (row.endOfTerm && row.endOfTerm.score !== "" && !isNaN(parseFloat(row.endOfTerm.score))) ? parseFloat(row.endOfTerm.score) : null;
    const endMax = (row.endOfTerm && parseFloat(row.endOfTerm.max)) || 100;
    const endPercent = endScore !== null ? (endScore / endMax) * 100 : null;

    // Exercise percentage (informational, used in categoryPercentages only)
    let totalExScore = 0;
    let totalExMax = 0;
    let exCount = 0;
    Object.values(row.exercises || {}).forEach(ex => {
      if (ex.score !== "" && ex.score !== null && !isNaN(parseFloat(ex.score))) {
        totalExScore += parseFloat(ex.score);
        totalExMax += parseFloat(ex.max) || 20;
        exCount++;
      }
    });
    const exPercent = exCount > 0 && totalExMax > 0 ? (totalExScore / totalExMax) * 100 : null;

    const hasAnyScore = (p1Percent !== null || p2Percent !== null || midPercent !== null || endPercent !== null);

    if (!hasAnyScore) {
      return {
        hasScore: false,
        finalPercentage: null,
        grade: "—",
        gradePoint: null,
        gradeBadgeColor: "bg-slate-100 text-slate-700",
        categoryPercentages: {
          exercise: null,
          progressiveTest1: null,
          progressiveTest2: null,
          progressiveTest: null,
          midTerm: null,
          endOfTerm: null
        }
      };
    }

    // === TCIS EXAM FORMULA ===
    // Pre-assessment average = avg of whichever of PT1, PT2, MidTerm are entered
    const preScores = [p1Percent, p2Percent, midPercent].filter(v => v !== null);
    const preAvg = preScores.length > 0 ? preScores.reduce((a, b) => a + b, 0) / preScores.length : null;

    let finalPct;
    if (endPercent !== null && preAvg !== null) {
      // Full formula: 30% pre-assessment average + 70% end-of-term
      finalPct = (preAvg * 0.30) + (endPercent * 0.70);
    } else if (endPercent !== null) {
      // Only end-of-term entered — show it as the running indicator
      finalPct = endPercent;
    } else {
      // No end-of-term yet — show pre-assessment average as running indicator
      finalPct = preAvg;
    }

    const gradeInfo = window.Reports?.getTCISGrade(finalPct) || { grade: "—", gradePoint: 0 };

    let color = "bg-slate-100 text-slate-700";
    if (gradeInfo.grade === "A*" || gradeInfo.grade === "A") color = "bg-emerald-100 text-emerald-800";
    else if (gradeInfo.grade === "B+" || gradeInfo.grade === "B") color = "bg-blue-100 text-blue-800";
    else if (gradeInfo.grade === "C+" || gradeInfo.grade === "C") color = "bg-indigo-100 text-indigo-800";
    else if (gradeInfo.grade === "D") color = "bg-amber-100 text-amber-800";
    else color = "bg-rose-100 text-rose-800";

    return {
      hasScore: true,
      finalPercentage: finalPct,
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.gradePoint,
      gradeBadgeColor: color,
      categoryPercentages: {
        exercise: exPercent,
        progressiveTest1: p1Percent,
        progressiveTest2: p2Percent,
        progressiveTest: p1Percent,  // alias for legacy report lookup
        midTerm: midPercent,
        endOfTerm: endPercent
      }
    };
  },


  filterClassGridRows(query) {
    this.renderClassGridTable();
  },

  async saveSingleClassStudent(studentId) {
    const row = this.classGridRows[studentId];
    if (!row) return;

    const academicYear = document.getElementById("resultsAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("resultsTerm")?.value || "Term 1";
    const subject = document.getElementById("resultsSubjectSelect")?.value;

    if (!subject) {
      this.showToast("Please select a subject first.", "warning");
      return;
    }

    const btn = document.getElementById(`btn-save-row-${studentId}`);
    if (btn) btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-indigo-600 text-sm"></i>`;

    try {
      await this.saveRowRecord(row, academicYear, term, subject);
      if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600 text-sm"></i>`;
        setTimeout(() => {
          if (btn) btn.innerHTML = `<i class="fa-solid fa-floppy-disk text-sm"></i>`;
        }, 2000);
      }
      this.showToast(`Saved marks for ${row.studentName}.`, "success");
    } catch (err) {
      if (btn) btn.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>`;
      this.showToast(`Error saving: ${err.message}`, "error");
    }
  },

  async saveAllClassGridResults() {
    const academicYear = document.getElementById("resultsAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("resultsTerm")?.value || "Term 1";
    const subject = document.getElementById("resultsSubjectSelect")?.value;

    if (!subject) {
      this.showToast("Please select a subject to grade first.", "warning");
      return;
    }

    const rows = Object.values(this.classGridRows);
    if (rows.length === 0) {
      this.showToast("No students loaded in the gradebook.", "warning");
      return;
    }

    const saveBtn = document.getElementById("classSheetSaveAllBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Saving All Marks...`;
    }

    const statusEl = document.getElementById("classSheetSavedStatus");
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5 text-indigo-600"></i> Saving ${rows.length} student marks...`;

    try {
      let savedCount = 0;
      for (const row of rows) {
        await this.saveRowRecord(row, academicYear, term, subject);
        savedCount++;
      }

      this.showToast(`Successfully saved results for all ${savedCount} student(s) in ${subject}!`, "success");
      if (statusEl) {
        statusEl.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-600"></i> All ${savedCount} marks saved at ${new Date().toLocaleTimeString()}.`;
      }
    } catch (err) {
      console.error("Save class grid error:", err);
      this.showToast("Failed to save some results: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk mr-2"></i> Save All Class Marks`;
      }
    }
  },

  async saveRowRecord(row, academicYear, term, subject) {
    const calc = this.calculateClassGridStudentSummary(row);
    const user = window.Auth?.getCurrentUser();
    const createdBy = user ? user.email : "staff@tcis.edu";

    // Build exercises list safely
    const exercisesList = Object.entries(row.exercises || {}).map(([key, ex], idx) => ({
      name: `Exercise ${idx + 1}`,
      score: (ex && ex.score !== "" && ex.score !== null && !isNaN(parseFloat(ex.score))) ? parseFloat(ex.score) : null,
      max: (ex && parseFloat(ex.max)) || 20
    }));

    const catPct = calc.categoryPercentages || {};
    const exScore = (catPct.exercise !== null && catPct.exercise !== undefined) ? (catPct.exercise * 0.2) : null;
    const p1Score = (row.progressiveTest1 && row.progressiveTest1.score !== "" && !isNaN(parseFloat(row.progressiveTest1.score))) ? parseFloat(row.progressiveTest1.score) : null;
    const p2Score = (row.progressiveTest2 && row.progressiveTest2.score !== "" && !isNaN(parseFloat(row.progressiveTest2.score))) ? parseFloat(row.progressiveTest2.score) : null;
    const progScore = p1Score !== null ? p1Score : p2Score;
    const midScore = (row.midTerm && row.midTerm.score !== "" && !isNaN(parseFloat(row.midTerm.score))) ? parseFloat(row.midTerm.score) : null;
    const endScore = (row.endOfTerm && row.endOfTerm.score !== "" && !isNaN(parseFloat(row.endOfTerm.score))) ? parseFloat(row.endOfTerm.score) : null;

    const resultRecord = {
      studentId: row.studentId,
      admissionNumber: row.admissionNumber || "",
      studentName: row.studentName,
      yearGroup: row.yearGroup,
      className: row.className || "",
      subjectName: subject.trim(),
      academicYear,
      term,
      assessments: {
        exercise: {
          score: exScore,
          max: 20
        },
        exercises: exercisesList,
        progressiveTest1: {
          score: p1Score,
          max: (row.progressiveTest1 && parseFloat(row.progressiveTest1.max)) || 100
        },
        progressiveTest2: {
          score: p2Score,
          max: (row.progressiveTest2 && parseFloat(row.progressiveTest2.max)) || 100
        },
        progressiveTest: {
          score: progScore,
          max: (row.progressiveTest1 && parseFloat(row.progressiveTest1.max)) || 100
        },
        midTerm: {
          score: midScore,
          max: (row.midTerm && parseFloat(row.midTerm.max)) || 100
        },
        endOfTerm: {
          score: endScore,
          max: (row.endOfTerm && parseFloat(row.endOfTerm.max)) || 100
        }
      },
      categoryPercentages: calc.categoryPercentages || {},
      finalPercentage: calc.finalPercentage,
      grade: calc.grade !== "—" ? calc.grade : "Incomplete",
      gradePoint: calc.gradePoint,
      gradeDescription: calc.grade !== "—" ? (window.Reports?.getTCISGrade(calc.finalPercentage)?.description || "") : "Incomplete",
      teacherComment: row.teacherComment || "",
      createdBy
    };

    await window.DB.saveResult(resultRecord);
  },

  // ==============================================================
  // SINGLE STUDENT MODE (PRESERVED FOR INDIVIDUAL OVERVIEWS)
  // ==============================================================

  async onStudentChange() {
    const studentId = document.getElementById("resultsStudentSelect")?.value;
    if (!studentId) {
      this.currentStudent = null;
      this.subjectEntries = [];
      document.getElementById("resultsEntrySection")?.classList.add("hidden");
      return;
    }

    this.currentStudent = await window.DB.getStudentById(studentId);
    if (!this.currentStudent) return;

    document.getElementById("resultsEntrySection")?.classList.remove("hidden");
    await this.loadStudentResults();
  },

  async loadStudentResults() {
    if (!this.currentStudent) return;

    const academicYear = document.getElementById("resultsAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("resultsTerm")?.value || "Term 1";

    const nameEl = document.getElementById("resultsStudentHeaderName");
    const metaEl = document.getElementById("resultsStudentHeaderMeta");
    if (nameEl) nameEl.textContent = this.currentStudent.fullName;
    const admPrefix = this.currentStudent.admissionNumber ? `${this.currentStudent.admissionNumber} • ` : "";
    if (metaEl) metaEl.textContent = `${admPrefix}${this.currentStudent.yearGroup} • ${this.currentStudent.className || 'No Stream'} • ${academicYear} (${term})`;

    const existing = await window.DB.getResults({
      studentId: this.currentStudent.id,
      academicYear,
      term
    });

    this.subjectEntries = [];

    if (existing && existing.length > 0) {
      existing.forEach(r => {
        if (r.overallTeacherComment) {
          this.overallComment = r.overallTeacherComment;
        }
        this.subjectEntries.push({
          id: r.id,
          subjectName: r.subjectName,
          assessments: {
            exercise: { score: r.assessments?.exercise?.score ?? "", max: r.assessments?.exercise?.max ?? 20 },
            homework: { score: r.assessments?.homework?.score ?? "", max: r.assessments?.homework?.max ?? 10 },
            progressiveTest: { score: r.assessments?.progressiveTest?.score ?? (r.assessments?.progressiveTest1?.score ?? ""), max: (r.assessments?.progressiveTest?.max && r.assessments?.progressiveTest?.max !== 40) ? r.assessments?.progressiveTest?.max : 100 },
            midTerm: { score: r.assessments?.midTerm?.score ?? "", max: r.assessments?.midTerm?.max ?? 100 },
            endOfTerm: { score: r.assessments?.endOfTerm?.score ?? "", max: r.assessments?.endOfTerm?.max ?? 100 }
          },
          teacherComment: r.teacherComment || ""
        });
      });
    } else {
      this.overallComment = "";
      const enrolled = this.currentStudent.enrolledSubjects || ["Mathematics", "English Language"];
      enrolled.forEach(s => {
        this.subjectEntries.push(this.createEmptySubjectEntry(s));
      });
    }

    const overallInput = document.getElementById("resultsOverallComment");
    if (overallInput) overallInput.value = this.overallComment || "";

    this.renderSubjectRows();
  },

  createEmptySubjectEntry(subjectName = "") {
    return {
      subjectName,
      assessments: {
        exercise: { score: "", max: 20 },
        homework: { score: "", max: 10 },
        progressiveTest: { score: "", max: 100 },
        midTerm: { score: "", max: 100 },
        endOfTerm: { score: "", max: 100 }
      },
      teacherComment: ""
    };
  },

  addNewSubjectRow(presetName = "") {
    this.subjectEntries.push(this.createEmptySubjectEntry(presetName));
    this.renderSubjectRows();
  },

  removeSubjectRow(index) {
    if (this.subjectEntries.length <= 1) {
      this.showToast("At least one subject entry should be maintained.", "warning");
      return;
    }
    const entry = this.subjectEntries[index];
    if (entry.id) {
      if (confirm(`Remove subject "${entry.subjectName || 'this subject'}"? This will delete the saved record.`)) {
        window.DB.deleteResult(entry.id);
        this.subjectEntries.splice(index, 1);
        this.renderSubjectRows();
      }
    } else {
      this.subjectEntries.splice(index, 1);
      this.renderSubjectRows();
    }
  },

  calculateSubjectRow(entry) {
    const weights = window.Dashboard?.currentSettings?.categoryWeights || 
      (JSON.parse(localStorage.getItem("tcis_settings") || "{}").categoryWeights) || {
      exercise: 10, homework: 10, progressiveTest: 20, midTerm: 20, endOfTerm: 40
    };

    let hasIncomplete = false;
    let finalPercentage = 0;
    let totalActiveWeight = 0;
    const categoryPercentages = {};

    for (const cat of this.ASSESSMENT_KEYS) {
      const field = (entry.assessments && entry.assessments[cat.key]) ? entry.assessments[cat.key] : { score: "", max: cat.defaultMax || 100 };
      const rawScore = field.score;
      const rawMax = field.max;
      const weight = weights[cat.weightKey] !== undefined ? Number(weights[cat.weightKey]) : 0;

      // If category has 0% weight, it is not required for completion
      if (weight === 0) {
        if (rawScore !== "" && rawScore !== null && !isNaN(parseFloat(rawScore))) {
          categoryPercentages[cat.key] = (parseFloat(rawScore) / (parseFloat(rawMax) || 100)) * 100;
        } else {
          categoryPercentages[cat.key] = null;
        }
        continue;
      }

      totalActiveWeight += weight;

      if (rawScore === "" || rawScore === null || rawScore === undefined) {
        hasIncomplete = true;
        categoryPercentages[cat.key] = null;
        continue;
      }

      const scoreNum = parseFloat(rawScore);
      const maxNum = parseFloat(rawMax);

      if (isNaN(scoreNum) || isNaN(maxNum) || maxNum <= 0 || scoreNum < 0) {
        hasIncomplete = true;
        categoryPercentages[cat.key] = null;
        continue;
      }

      const catPercent = (scoreNum / maxNum) * 100;
      categoryPercentages[cat.key] = catPercent;
      finalPercentage += catPercent * (weight / 100);
    }

    if (totalActiveWeight > 0 && totalActiveWeight !== 100) {
      finalPercentage = (finalPercentage / (totalActiveWeight / 100));
    }

    if (hasIncomplete) {
      return {
        isIncomplete: true,
        finalPercentage: null,
        grade: "Incomplete",
        gradePoint: null,
        gradeDescription: "Incomplete",
        categoryPercentages
      };
    }

    const gradeInfo = window.Reports?.getTCISGrade(finalPercentage) || { grade: "Incomplete", gradePoint: null, description: "Incomplete" };
    return {
      isIncomplete: false,
      finalPercentage,
      grade: gradeInfo.grade,
      gradePoint: gradeInfo.gradePoint,
      gradeDescription: gradeInfo.description,
      categoryPercentages
    };
  },

  renderSubjectRows() {
    const container = document.getElementById("subjectRowsContainer");
    if (!container) return;

    if (this.subjectEntries.length === 0) {
      container.innerHTML = `<div class="text-center py-8 text-slate-400"><p>No subjects added yet.</p></div>`;
      return;
    }

    container.innerHTML = this.subjectEntries.map((entry, idx) => {
      const calc = this.calculateSubjectRow(entry);

      let scoreBadge = "";
      if (calc.isIncomplete) {
        scoreBadge = `<span class="px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-semibold text-xs inline-flex items-center"><i class="fa-solid fa-circle-exclamation mr-1"></i>Incomplete</span>`;
      } else {
        const gradeColor = calc.grade === "A*" || calc.grade === "A" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800";
        scoreBadge = `
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-900 text-sm">${calc.finalPercentage.toFixed(2)}%</span>
            <span class="px-2 py-0.5 rounded ${gradeColor} font-bold text-xs">${calc.grade} (${calc.gradePoint.toFixed(2)} GP)</span>
            <span class="text-xs text-slate-500 font-medium">(${calc.gradeDescription})</span>
          </div>
        `;
      }

      return `
        <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition mb-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center space-x-2 flex-grow max-w-md">
              <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">${idx + 1}</span>
              <input type="text" value="${escapeHtml(entry.subjectName)}"
                onchange="Results.updateSubjectName(${idx}, this.value)"
                placeholder="Subject Name"
                class="font-bold text-sm text-slate-800 px-2 py-1 border border-slate-200 rounded focus:border-indigo-600 w-full" />
            </div>
            <div class="flex items-center space-x-3">
              ${scoreBadge}
              <button onclick="Results.removeSubjectRow(${idx})" class="text-slate-400 hover:text-rose-600 p-1">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3">
            <!-- Exercise -->
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span class="block text-[10px] font-bold text-slate-600 uppercase">Exercise (10%)</span>
              <input type="number" min="0" max="${entry.assessments.exercise.max}" step="0.5"
                value="${entry.assessments.exercise.score}"
                oninput="Results.updateScore(${idx}, 'exercise', this.value)"
                class="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold" />
            </div>
            <!-- Homework -->
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span class="block text-[10px] font-bold text-slate-600 uppercase">Homework (10%)</span>
              <input type="number" min="0" max="${entry.assessments.homework.max}" step="0.5"
                value="${entry.assessments.homework.score}"
                oninput="Results.updateScore(${idx}, 'homework', this.value)"
                class="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold" />
            </div>
            <!-- Progressive Test -->
            <div class="bg-indigo-50/50 p-2 rounded-lg border border-indigo-200">
              <span class="block text-[10px] font-bold text-indigo-900 uppercase">Prog. Test (/100)</span>
              <input type="number" min="0" max="${entry.assessments.progressiveTest.max}" step="0.5"
                value="${entry.assessments.progressiveTest.score}"
                oninput="Results.updateScore(${idx}, 'progressiveTest', this.value)"
                class="w-full mt-1 px-2 py-1 text-xs border border-indigo-300 rounded text-center font-bold bg-white" />
            </div>
            <!-- Mid-Term -->
            <div class="bg-blue-50/50 p-2 rounded-lg border border-blue-200">
              <span class="block text-[10px] font-bold text-blue-900 uppercase">Mid-Term (20%)</span>
              <input type="number" min="0" max="${entry.assessments.midTerm.max}" step="0.5"
                value="${entry.assessments.midTerm.score}"
                oninput="Results.updateScore(${idx}, 'midTerm', this.value)"
                class="w-full mt-1 px-2 py-1 text-xs border border-blue-300 rounded text-center font-bold bg-white" />
            </div>
            <!-- End of Term -->
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200">
              <span class="block text-[10px] font-bold text-slate-600 uppercase">End-Term (40%)</span>
              <input type="number" min="0" max="${entry.assessments.endOfTerm.max}" step="0.5"
                value="${entry.assessments.endOfTerm.score}"
                oninput="Results.updateScore(${idx}, 'endOfTerm', this.value)"
                class="w-full mt-1 px-2 py-1 text-xs border border-slate-300 rounded text-center font-bold" />
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  updateSubjectName(index, val) {
    if (this.subjectEntries[index]) this.subjectEntries[index].subjectName = val;
  },

  updateScore(index, categoryKey, val) {
    if (!this.subjectEntries[index]) return;
    this.subjectEntries[index].assessments[categoryKey].score = val;
    this.renderSubjectRows();
  },

  setQuickOverallComment(commentText) {
    const input = document.getElementById("resultsOverallComment");
    if (input) {
      input.value = commentText;
      this.overallComment = commentText;
    }
  },

  async saveAllResults() {
    if (!this.currentStudent) {
      this.showToast("No student selected.", "warning");
      return;
    }

    const academicYear = document.getElementById("resultsAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("resultsTerm")?.value || "Term 1";
    const overallComment = document.getElementById("resultsOverallComment")?.value.trim() || "";
    const user = window.Auth?.getCurrentUser();
    const createdBy = user ? user.email : "staff@tcis.edu";

    const saveBtn = document.getElementById("saveAllResultsBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving Results...`;
    }

    try {
      for (const entry of this.subjectEntries) {
        if (!entry.subjectName || !entry.subjectName.trim()) continue;
        const calc = this.calculateSubjectRow(entry);

        const resultRecord = {
          studentId: this.currentStudent.id,
          admissionNumber: this.currentStudent.admissionNumber || "",
          studentName: this.currentStudent.fullName,
          yearGroup: this.currentStudent.yearGroup,
          className: this.currentStudent.className || "",
          subjectName: entry.subjectName.trim(),
          academicYear,
          term,
          assessments: {
            exercise: { score: (entry.assessments?.exercise?.score !== "" && entry.assessments?.exercise?.score !== null && entry.assessments?.exercise?.score !== undefined) ? parseFloat(entry.assessments.exercise.score) : null, max: parseFloat(entry.assessments?.exercise?.max || 20) },
            homework: { score: (entry.assessments?.homework?.score !== "" && entry.assessments?.homework?.score !== null && entry.assessments?.homework?.score !== undefined) ? parseFloat(entry.assessments.homework.score) : null, max: parseFloat(entry.assessments?.homework?.max || 10) },
            progressiveTest: { score: (entry.assessments?.progressiveTest?.score !== "" && entry.assessments?.progressiveTest?.score !== null && entry.assessments?.progressiveTest?.score !== undefined) ? parseFloat(entry.assessments.progressiveTest.score) : null, max: parseFloat(entry.assessments?.progressiveTest?.max || 100) },
            progressiveTest1: { score: (entry.assessments?.progressiveTest?.score !== "" && entry.assessments?.progressiveTest?.score !== null && entry.assessments?.progressiveTest?.score !== undefined) ? parseFloat(entry.assessments.progressiveTest.score) : null, max: parseFloat(entry.assessments?.progressiveTest?.max || 100) },
            midTerm: { score: (entry.assessments?.midTerm?.score !== "" && entry.assessments?.midTerm?.score !== null && entry.assessments?.midTerm?.score !== undefined) ? parseFloat(entry.assessments.midTerm.score) : null, max: parseFloat(entry.assessments?.midTerm?.max || 100) },
            endOfTerm: { score: (entry.assessments?.endOfTerm?.score !== "" && entry.assessments?.endOfTerm?.score !== null && entry.assessments?.endOfTerm?.score !== undefined) ? parseFloat(entry.assessments.endOfTerm.score) : null, max: parseFloat(entry.assessments?.endOfTerm?.max || 100) }
          },
          categoryPercentages: calc.categoryPercentages,
          finalPercentage: calc.finalPercentage,
          grade: calc.grade,
          gradePoint: calc.gradePoint,
          gradeDescription: calc.gradeDescription,
          teacherComment: entry.teacherComment || "",
          overallTeacherComment: overallComment,
          createdBy
        };

        await window.DB.saveResult(resultRecord);
      }

      this.showToast(`Saved results for ${this.currentStudent.fullName}!`, "success");
    } catch (err) {
      this.showToast("Failed to save results: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-floppy-disk mr-1.5"></i> Save All Results`;
      }
    }
  },

  showToast(message, type = "info") {
    if (window.Dashboard && window.Dashboard.showToast) {
      window.Dashboard.showToast(message, type);
    } else {
      alert(message);
    }
  }
};

window.Results = Results;
