/**
 * TCIS Student Results and Report System
 * js/reports.js - TCIS Grading Scale, Assessment-Specific Reports (Progressive Test & Mid-Term),
 * Terminal Report Generator, and jsPDF / Print Export Engine
 */

const Reports = {
  selectedStudent: null,
  currentStudentResults: [],
  currentReportSummary: null,

  // ==========================================
  // 1. OFFICIAL TCIS GRADING SCALE
  // ==========================================
  TCIS_SCALE_REFERENCE: [
    { grade: "A*", range: "95% - 100%", gpa: "4.00", remark: "Distinction" },
    { grade: "A", range: "80% - 94%", gpa: "3.67", remark: "Excellent" },
    { grade: "B+", range: "75% - 79%", gpa: "3.33", remark: "Very Good" },
    { grade: "B", range: "70% - 74%", gpa: "3.00", remark: "Good" },
    { grade: "C+", range: "65% - 69%", gpa: "2.67", remark: "Average" },
    { grade: "C", range: "60% - 64%", gpa: "2.33", remark: "Pass" },
    { grade: "D", range: "50% - 59%", gpa: "2.00", remark: "Credit" },
    { grade: "E", range: "45% - 49%", gpa: "1.67", remark: "Failed" },
    { grade: "F", range: "35% - 44%", gpa: "1.00", remark: "Failed" },
    { grade: "Ungraded", range: "0% - 34%", gpa: "0.00", remark: "Ungraded" }
  ],

  getTCISGrade(unroundedPercentage) {
    if (unroundedPercentage === null || unroundedPercentage === undefined || isNaN(unroundedPercentage)) {
      return {
        grade: "Incomplete",
        gradePoint: null,
        description: "Incomplete",
        isComplete: false
      };
    }

    const p = Number(unroundedPercentage);

    if (p >= 95.0) {
      return { grade: "A*", gradePoint: 4.00, description: "Distinction", isComplete: true };
    } else if (p >= 80.0) {
      return { grade: "A", gradePoint: 3.67, description: "Excellent", isComplete: true };
    } else if (p >= 75.0) {
      return { grade: "B+", gradePoint: 3.33, description: "Very Good", isComplete: true };
    } else if (p >= 70.0) {
      return { grade: "B", gradePoint: 3.00, description: "Good", isComplete: true };
    } else if (p >= 65.0) {
      return { grade: "C+", gradePoint: 2.67, description: "Average", isComplete: true };
    } else if (p >= 60.0) {
      return { grade: "C", gradePoint: 2.33, description: "Pass", isComplete: true };
    } else if (p >= 50.0) {
      return { grade: "D", gradePoint: 2.00, description: "Credit", isComplete: true };
    } else if (p >= 45.0) {
      return { grade: "E", gradePoint: 1.67, description: "Failed", isComplete: true };
    } else if (p >= 35.0) {
      return { grade: "F", gradePoint: 1.00, description: "Failed", isComplete: true };
    } else {
      return { grade: "Ungraded", gradePoint: 0.00, description: "Ungraded", isComplete: true };
    }
  },

  formatGradePoint(gp) {
    if (gp === null || gp === undefined || isNaN(gp)) return "0.0";
    const num = Number(gp);
    if (num % 1 === 0) return num.toFixed(1);
    return num.toFixed(2);
  },

  // ==========================================
  // 2. GPA & SUMMARY CALCULATION (FULL TERMINAL)
  // ==========================================
  calculateGPAAndSummary(resultsList) {
    const completedSubjects = [];
    const incompleteSubjects = [];

    const uniqueMap = new Map();
    resultsList.forEach(r => {
      const subjectName = (r.subjectName || "").trim().toLowerCase();
      if (!uniqueMap.has(subjectName)) {
        uniqueMap.set(subjectName, r);
      }
    });

    uniqueMap.forEach((r) => {
      if (r.finalPercentage !== null && r.finalPercentage !== undefined && !isNaN(r.finalPercentage) && r.grade !== "Incomplete" && r.gradePoint !== null && r.gradePoint !== undefined) {
        completedSubjects.push(r);
      } else {
        incompleteSubjects.push(r);
      }
    });

    const completedCount = completedSubjects.length;
    const incompleteCount = incompleteSubjects.length;

    let gpa = null;
    let averagePercentage = null;

    if (completedCount > 0) {
      const totalPoints = completedSubjects.reduce((acc, curr) => acc + Number(curr.gradePoint), 0);
      gpa = totalPoints / completedCount;

      const totalPercentage = completedSubjects.reduce((acc, curr) => acc + Number(curr.finalPercentage), 0);
      averagePercentage = totalPercentage / completedCount;
    }

    return {
      completedCount,
      incompleteCount,
      completedSubjects,
      incompleteSubjects,
      gpa: gpa !== null ? Number(gpa.toFixed(2)) : null,
      gpaFormatted: gpa !== null ? `${gpa.toFixed(2)} / 4.00` : "N/A",
      averagePercentage: averagePercentage !== null ? Number(averagePercentage.toFixed(2)) : null,
      averagePercentageFormatted: averagePercentage !== null ? `${averagePercentage.toFixed(2)}%` : "N/A"
    };
  },

  // ==========================================
  // 3. ASSESSMENT-SPECIFIC SUMMARY (PROGRESSIVE TEST & MID-TERM)
  // ==========================================
    getNormalizedProgPercent(r) {
    let p = r.categoryPercentages?.progressiveTest ?? r.categoryPercentages?.progressiveTest1 ?? null;
    if (p === null) {
      const pt = r.assessments?.progressiveTest1 || r.assessments?.progressiveTest;
      if (pt && pt.score !== null && pt.score !== undefined && pt.score !== "") {
        const raw = Number(pt.score);
        const max = (Number(pt.max) && Number(pt.max) !== 40) ? Number(pt.max) : 100;
        p = (raw / max) * 100;
      }
    }
    if (p !== null && !isNaN(p)) {
      if (p > 100 && p <= 250) p = p / 2.5;
      return p;
    }
    return null;
  },

  calculateAssessmentSpecificSummary(resultsList, mode = "progressive") {
    const scoredSubjects = [];
    const isMidterm = (mode === "midterm");
    const isProg2 = (mode === "progressive2");

    // Deduplicate by subject name
    const uniqueMap = new Map();
    resultsList.forEach(r => {
      const subjectName = (r.subjectName || "").trim();
      if (subjectName && !uniqueMap.has(subjectName.toLowerCase())) {
        uniqueMap.set(subjectName.toLowerCase(), r);
      }
    });

    uniqueMap.forEach((r) => {
      let scorePercent = null;

      if (isMidterm) {
        const midObj = r.assessments?.midTerm;
        if (midObj && midObj.score !== null && midObj.score !== undefined && midObj.score !== "") {
          const raw = Number(midObj.score);
          const max = Number(midObj.max) || 100;
          if (!isNaN(raw) && max > 0) scorePercent = (raw / max) * 100;
        } else if (r.categoryPercentages?.midTerm !== undefined && r.categoryPercentages?.midTerm !== null) {
          scorePercent = Number(r.categoryPercentages.midTerm);
        }
      } else if (isProg2) {
        const pt2Obj = r.assessments?.progressiveTest2;
        if (pt2Obj && pt2Obj.score !== null && pt2Obj.score !== undefined && pt2Obj.score !== "") {
          const raw = Number(pt2Obj.score);
          const rawMax = Number(pt2Obj.max);
          const max = (rawMax && rawMax !== 40) ? rawMax : 100;
          if (!isNaN(raw) && max > 0) scorePercent = (raw / max) * 100;
        } else if (r.categoryPercentages?.progressiveTest2 !== undefined && r.categoryPercentages?.progressiveTest2 !== null) {
          scorePercent = Number(r.categoryPercentages.progressiveTest2);
        }
      } else {
        // Progressive Test 1 (or general progressiveTest)
        const pt1Obj = r.assessments?.progressiveTest1 || r.assessments?.progressiveTest;
        if (pt1Obj && pt1Obj.score !== null && pt1Obj.score !== undefined && pt1Obj.score !== "") {
          const raw = Number(pt1Obj.score);
          const rawMax = Number(pt1Obj.max);
          // Always evaluate against 100 max
          const max = (rawMax && rawMax !== 40) ? rawMax : 100;
          if (!isNaN(raw) && max > 0) scorePercent = (raw / max) * 100;
        } else if (r.categoryPercentages?.progressiveTest1 !== undefined && r.categoryPercentages?.progressiveTest1 !== null) {
          scorePercent = Number(r.categoryPercentages.progressiveTest1);
        } else if (r.categoryPercentages?.progressiveTest !== undefined && r.categoryPercentages?.progressiveTest !== null) {
          scorePercent = Number(r.categoryPercentages.progressiveTest);
        }
      }

      // Self-heal any old records where percentage was calculated with / 40 (* 2.5)
      if (scorePercent !== null && !isNaN(scorePercent)) {
        if (scorePercent > 100 && scorePercent <= 250) {
          scorePercent = scorePercent / 2.5;
        }
        const gradeInfo = this.getTCISGrade(scorePercent);
        scoredSubjects.push({
          subjectName: r.subjectName,
          score: scorePercent,
          scoreFormatted: scorePercent.toFixed(2),
          grade: gradeInfo.grade,
          gpa: this.formatGradePoint(gradeInfo.gradePoint),
          rawGradePoint: gradeInfo.gradePoint !== null ? Number(gradeInfo.gradePoint) : 0
        });
      }
    });

    let overallGPA = 0;
    if (scoredSubjects.length > 0) {
      const totalPoints = scoredSubjects.reduce((acc, curr) => acc + curr.rawGradePoint, 0);
      overallGPA = totalPoints / scoredSubjects.length;
    }

    return {
      subjects: scoredSubjects,
      overallGPA: Number(overallGPA.toFixed(2)),
      gpaFormatted: overallGPA.toFixed(2),
      totalSubjects: scoredSubjects.length
    };
  },

  // ==========================================
  // 4. UI INITIALIZATION & EVENT HANDLERS
  // ==========================================
  async init() {
    this.setupDropdowns();
    this.setupEventListeners();
  },

  setupDropdowns() {
    const ygSelect = document.getElementById("reportYearGroupFilter");
    if (ygSelect && window.Students?.YEAR_GROUPS) {
      ygSelect.innerHTML = `<option value="">All Year Groups</option>` +
        window.Students.YEAR_GROUPS.map(yg => `<option value="${yg}">${yg}</option>`).join("");
    }
    this.populateStudentDropdown();
  },

  setupEventListeners() {
    const ygFilter = document.getElementById("reportYearGroupFilter");
    const classFilter = document.getElementById("reportClassFilter");
    const yearSelect = document.getElementById("reportAcademicYear");
    const termSelect = document.getElementById("reportTerm");
    const modeSelect = document.getElementById("reportModeSelect");
    const studentSelect = document.getElementById("reportStudentSelect");

    if (ygFilter) {
      ygFilter.addEventListener("change", () => {
        this.updateClassDropdown();
        this.populateStudentDropdown();
      });
    }

    if (classFilter) {
      classFilter.addEventListener("change", () => {
        this.populateStudentDropdown();
      });
    }

    if (yearSelect || termSelect || modeSelect) {
      const reloadHandler = () => {
        if (this.selectedStudent) this.loadReportForCurrentStudent();
      };
      if (yearSelect) yearSelect.addEventListener("change", reloadHandler);
      if (termSelect) termSelect.addEventListener("change", reloadHandler);
      if (modeSelect) modeSelect.addEventListener("change", reloadHandler);
    }

    if (studentSelect) {
      studentSelect.addEventListener("change", () => this.onStudentSelected());
    }

    const previewBtn = document.getElementById("previewReportBtn");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => this.loadReportForCurrentStudent());
    }

    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener("click", () => this.generateStudentPDF(true));
    }

    const printPdfBtn = document.getElementById("printPdfBtn");
    if (printPdfBtn) {
      printPdfBtn.addEventListener("click", () => this.printCurrentReport());
    }

    const bulkBtn = document.getElementById("generateBulkReportsBtn");
    if (bulkBtn) {
      bulkBtn.addEventListener("click", () => this.handleBulkReportGeneration());
    }
  },

  updateClassDropdown() {
    const classFilter = document.getElementById("reportClassFilter");
    if (!classFilter) return;

    const selectedYg = document.getElementById("reportYearGroupFilter")?.value || "";
    const allStudents = window.Students?.allStudents || [];
    const classes = new Set();

    allStudents.forEach(s => {
      if (!selectedYg || s.yearGroup === selectedYg) {
        if (s.className && s.className.trim()) classes.add(s.className.trim());
      }
    });

    let html = `<option value="">All Classes</option>`;
    Array.from(classes).sort().forEach(cls => {
      html += `<option value="${cls}">${cls}</option>`;
    });
    classFilter.innerHTML = html;
  },

  populateStudentDropdown() {
    const studentSelect = document.getElementById("reportStudentSelect");
    if (!studentSelect) return;

    const yg = document.getElementById("reportYearGroupFilter")?.value || "";
    const cls = document.getElementById("reportClassFilter")?.value || "";
    const allStudents = window.Students?.allStudents || [];

    const filtered = allStudents.filter(s => {
      return (!yg || s.yearGroup === yg) && (!cls || s.className === cls);
    });

    let html = `<option value="">Select a student to generate report...</option>`;
    filtered.forEach(s => {
      const idLabel = s.admissionNumber ? ` (${escapeHtml(s.admissionNumber)})` : "";
      html += `<option value="${s.id}">${escapeHtml(s.fullName)}${idLabel} - ${escapeHtml(s.yearGroup)}</option>`;
    });
    studentSelect.innerHTML = html;
  },

  async onStudentSelected() {
    const studentId = document.getElementById("reportStudentSelect")?.value;
    if (!studentId) {
      this.selectedStudent = null;
      this.currentStudentResults = [];
      this.currentReportSummary = null;
      document.getElementById("reportPreviewContainer")?.classList.add("hidden");
      return;
    }

    this.selectedStudent = await window.DB.getStudentById(studentId);
    await this.loadReportForCurrentStudent();
  },

  async loadReportForCurrentStudent() {
    if (!this.selectedStudent) return;

    const academicYear = document.getElementById("reportAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("reportTerm")?.value || "Term 1";

    const previewContainer = document.getElementById("reportPreviewContainer");
    if (previewContainer) previewContainer.classList.remove("hidden");

    const printableArea = document.getElementById("printableReportArea");
    if (printableArea) {
      printableArea.innerHTML = `<div class="text-center py-12 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Loading student assessment records...</p></div>`;
    }

    this.currentStudentResults = await window.DB.getResults({
      studentId: this.selectedStudent.id,
      academicYear,
      term
    });

    this.currentReportSummary = this.calculateGPAAndSummary(this.currentStudentResults);
    this.renderPreview(academicYear, term);
  },

  // ==========================================
  // 5. RENDER PREVIEW (DYNAMIC BASED ON MODE)
  // ==========================================
  renderPreview(academicYear, term) {
    const mode = document.getElementById("reportModeSelect")?.value || "progressive";
    const printableArea = document.getElementById("printableReportArea");
    if (!printableArea || !this.selectedStudent) return;

    if (mode === "progressive" || mode === "progressive2" || mode === "midterm") {
      this.renderSingleAssessmentPreview(printableArea, academicYear, term, mode);
    } else {
      this.renderFullTerminalPreview(printableArea, academicYear, term);
    }
  },

  // Render Progressive Test One / Two or MidTerm Report (Matching exact school PDF template)
  renderSingleAssessmentPreview(container, academicYear, term, mode) {
    const student = this.selectedStudent;
    const summary = this.calculateAssessmentSpecificSummary(this.currentStudentResults, mode);
    let reportTitle = "Progressive Test One Report";
    if (mode === "midterm") reportTitle = "MidTerm Report";
    else if (mode === "progressive2") reportTitle = "Progressive Test Two Report";

    const bannerSrc = window.REPORT_ASSETS?.banner || "tcis-header-banner.png";
    const signatureSrc = window.REPORT_ASSETS?.signature || "signature head of academics.jpg";

    let rowsHtml = "";
    if (summary.subjects.length === 0) {
      const modeLabel = mode === "midterm" ? "Mid-Term" : (mode === "progressive2" ? "Progressive Test 2" : "Progressive Test 1");
      rowsHtml = `
        <tr>
          <td colspan="4" class="py-8 px-4 text-center text-amber-700 bg-amber-50 border border-slate-300">
            <i class="fa-solid fa-circle-info mr-2"></i> No ${modeLabel} scores entered for ${escapeHtml(student.fullName)} in ${academicYear} ${term}.
          </td>
        </tr>
      `;
    } else {
      rowsHtml = summary.subjects.map(sub => `
        <tr class="border-b border-slate-300 text-xs">
          <td class="border border-slate-300 py-2.5 px-3 text-center text-slate-800 font-medium">${escapeHtml(sub.subjectName)}</td>
          <td class="border border-slate-300 py-2.5 px-3 text-center text-slate-800">${sub.scoreFormatted}</td>
          <td class="border border-slate-300 py-2.5 px-3 text-center font-semibold text-slate-900">${sub.grade}</td>
          <td class="border border-slate-300 py-2.5 px-3 text-center text-slate-800">${sub.gpa}</td>
        </tr>
      `).join("");
    }

    const gpaTableRowsHtml = this.TCIS_SCALE_REFERENCE.map(row => `
      <tr class="border-b border-slate-300 text-xs">
        <td class="border border-slate-300 py-1.5 px-3 text-center font-bold text-slate-800">${row.grade}</td>
        <td class="border border-slate-300 py-1.5 px-3 text-center text-slate-700">${row.range}</td>
        <td class="border border-slate-300 py-1.5 px-3 text-center text-slate-700">${row.gpa}</td>
        <td class="border border-slate-300 py-1.5 px-3 text-center text-slate-700">${row.remark}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div class="max-w-2xl mx-auto py-2 px-4 sm:px-6 text-slate-900 font-sans" style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <!-- School Crest Header Banner -->
        <div class="text-center mb-6 pt-2">
          <img src="${bannerSrc}" alt="TEMPLE CHRISTIAN INTERNATIONAL SCHOOL" class="h-20 max-w-full mx-auto object-contain" />
        </div>

        <!-- Student & Report Meta -->
        <div class="mb-5 text-center space-y-1">
          <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            ${reportTitle} for ${escapeHtml(student.fullName)}
          </h2>
          <p class="text-xs sm:text-sm font-semibold text-slate-800">
            Class/Year: ${escapeHtml(student.yearGroup || student.className || '—')}
          </p>
          <p class="text-xs sm:text-sm font-semibold text-slate-800">
            Term: ${escapeHtml(term)}
          </p>
        </div>

        <!-- Assessment Results Table -->
        <table class="w-full border-collapse border border-slate-300 text-xs mb-3 text-center">
          <thead>
            <tr class="font-bold border-b border-slate-300 bg-white">
              <th class="border border-slate-300 py-2.5 px-3 text-center">Subject</th>
              <th class="border border-slate-300 py-2.5 px-3 text-center">Score</th>
              <th class="border border-slate-300 py-2.5 px-3 text-center">Grade</th>
              <th class="border border-slate-300 py-2.5 px-3 text-center">GPA</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Overall GPA Summary -->
        <div class="font-bold text-sm text-slate-900 my-4 text-left">
          GPA: ${summary.gpaFormatted}
        </div>

        <!-- GPA Reference Scale Table -->
        <div class="text-left font-bold text-xs text-slate-900 mb-1.5">GPA Table</div>
        <table class="w-full border-collapse border border-slate-300 text-xs text-center mb-8">
          <thead>
            <tr class="font-bold border-b border-slate-300 bg-white">
              <th class="border border-slate-300 py-1.5 px-2 text-center">GRADE</th>
              <th class="border border-slate-300 py-1.5 px-2 text-center">PERCENTAGE RANGE</th>
              <th class="border border-slate-300 py-1.5 px-2 text-center">GRADE POINT RANGE</th>
              <th class="border border-slate-300 py-1.5 px-2 text-center">REMARKS</th>
            </tr>
          </thead>
          <tbody>
            ${gpaTableRowsHtml}
          </tbody>
        </table>

        <!-- Official Head of Academics Signature Block -->
        <div class="flex justify-end pt-2 pb-6">
          <div class="text-center w-56">
            <div class="h-12 flex items-center justify-center">
              <img src="${signatureSrc}" alt="Signature" class="max-h-12 max-w-full object-contain" />
            </div>
            <p class="text-slate-500 text-xs font-mono -mt-0.5 select-none tracking-normal">............................</p>
            <p class="text-xs font-bold text-slate-900 mt-1">Mr. Emmanuel Elikplim Godzo</p>
            <p class="text-[11px] font-medium text-slate-600">Head of Academics</p>
          </div>
        </div>

        <!-- Print Helper Button -->
        <div class="text-center pt-2 pb-2 no-print">
          <button onclick="Reports.printCurrentReport()" class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow transition">
            <i class="fa-solid fa-print mr-2"></i> Print Report
          </button>
        </div>

      </div>
    `;
  },

  // Render Full 5-Component Terminal Report
  renderFullTerminalPreview(container, academicYear, term) {
    const student = this.selectedStudent;
    const summary = this.currentReportSummary;
    const settings = window.Dashboard?.currentSettings || {};

    let tableRowsHtml = "";
    if (this.currentStudentResults.length === 0) {
      tableRowsHtml = `
        <tr>
          <td colspan="10" class="text-center py-8 text-amber-600 bg-amber-50">
            <i class="fa-solid fa-triangle-exclamation mr-2"></i>
            No subject assessment records found for ${escapeHtml(student.fullName)} in ${academicYear} ${term}.
          </td>
        </tr>
      `;
    } else {
      tableRowsHtml = this.currentStudentResults.map(r => {
        const finalScoreStr = r.finalPercentage !== undefined && r.finalPercentage !== null 
          ? `${r.finalPercentage.toFixed(2)}%` 
          : `<span class="text-amber-600 font-semibold">Incomplete</span>`;
        
        const gradeStr = r.grade || "Incomplete";
        const gpStr = r.gradePoint !== null && r.gradePoint !== undefined ? r.gradePoint.toFixed(2) : "—";
        const descStr = r.gradeDescription || "Incomplete";

        return `
          <tr class="border-b border-slate-200 hover:bg-slate-50 text-xs">
            <td class="px-3 py-2.5 font-semibold text-slate-800">${escapeHtml(r.subjectName)}</td>
            <td class="px-2 py-2.5 text-center text-slate-600">${r.categoryPercentages?.exercise !== undefined && r.categoryPercentages.exercise !== null ? r.categoryPercentages.exercise.toFixed(1) + '%' : '—'}</td>
            <td class="px-2 py-2.5 text-center text-slate-600">${r.categoryPercentages?.homework !== undefined && r.categoryPercentages.homework !== null ? r.categoryPercentages.homework.toFixed(1) + '%' : '—'}</td>
            <td class="px-2 py-2.5 text-center text-slate-600">${this.getNormalizedProgPercent(r) !== null ? this.getNormalizedProgPercent(r).toFixed(1) + '%' : '—'}</td>
            <td class="px-2 py-2.5 text-center text-slate-600">${r.categoryPercentages?.endOfTerm !== undefined && r.categoryPercentages.endOfTerm !== null ? r.categoryPercentages.endOfTerm.toFixed(1) + '%' : '—'}</td>
            <td class="px-2 py-2.5 text-center font-bold text-slate-900">${finalScoreStr}</td>
            <td class="px-2 py-2.5 text-center font-bold ${gradeStr === 'A*' || gradeStr === 'A' ? 'text-emerald-700' : 'text-blue-900'}">${gradeStr}</td>
            <td class="px-2 py-2.5 text-center font-semibold text-slate-700">${gpStr}</td>
            <td class="px-3 py-2.5 text-slate-700">${descStr}</td>
          </tr>
        `;
      }).join("");
    }

    const overallComment = this.currentStudentResults.find(r => r.overallTeacherComment && r.overallTeacherComment.trim())?.overallTeacherComment || "Good academic conduct and steady progress exhibited.";
    const headteacherComment = settings.headteacherName ? `Approved by ${settings.headteacherName}. Satisfactory effort shown.` : "Approved by the Headteacher.";

    container.innerHTML = `
      <div class="p-4 sm:p-6 text-slate-900">
        <!-- School Header -->
        <div class="border-b-2 border-tcis-gold pb-4 mb-4 text-center relative">
          <div class="flex items-center justify-center space-x-4 mb-2">
            <img src="tcis-crest.png" alt="TCIS Logo" class="h-16 w-auto object-contain shrink-0" onerror="this.onerror=null; this.src='tcis-logo.png';" />
            <div class="text-left">
              <h2 class="font-crest text-xl sm:text-2xl font-extrabold tracking-wide text-tcis-navy uppercase">
                ${escapeHtml(settings.schoolName || "TEMPLE CHRISTIAN INTERNATIONAL SCHOOL")}
              </h2>
              <p class="text-xs italic text-tcis-gold font-semibold">
                "${escapeHtml(settings.schoolMotto || "Excellence, Integrity and Christian Leadership")}"
              </p>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${escapeHtml(settings.schoolAddress || "Accra, Ghana")}
              </p>
            </div>
          </div>
          <div class="mt-2 inline-block bg-tcis-navy text-white text-xs uppercase tracking-widest font-bold py-1 px-4 rounded-md">
            STUDENT TERMINAL REPORT
          </div>
        </div>

        <!-- Student Metadata Box -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Student Full Name</span>
            <span class="font-bold text-slate-900 text-sm">${escapeHtml(student.fullName || "—")}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Admission Number</span>
            <span class="font-mono font-bold text-tcis-navy text-sm">${escapeHtml(student.admissionNumber || "—")}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Year Group &amp; Class</span>
            <span class="font-semibold text-slate-800">${escapeHtml(student.yearGroup || "—")}</span> &bull; 
            <span class="text-slate-600">${escapeHtml(student.className || "Standard")}</span>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-bold block">Academic Term</span>
            <span class="font-semibold text-slate-800">${escapeHtml(academicYear)}</span> (<span class="font-semibold text-blue-900">${escapeHtml(term)}</span>)
          </div>
          <div class="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
            <span>Date Issued: <strong class="text-slate-700">${new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
            <span>Official Document &bull; Temple Christian International School</span>
          </div>
        </div>

        <!-- Academic Results Table -->
        <div class="overflow-x-auto mb-5 border border-slate-200 rounded-lg">
          <table class="w-full text-left text-xs">
            <thead class="bg-tcis-navy text-white text-[11px] font-bold">
              <tr>
                <th class="py-2.5 px-3">Subject</th>
                <th class="py-2.5 px-2 text-center">Ex. (10%)</th>
                <th class="py-2.5 px-2 text-center">HW (10%)</th>
                <th class="py-2.5 px-2 text-center">Prog. (20%)</th>
                <th class="py-2.5 px-2 text-center">Mid (20%)</th>
                <th class="py-2.5 px-2 text-center">End (40%)</th>
                <th class="py-2.5 px-2 text-center">Final Score</th>
                <th class="py-2.5 px-2 text-center">Grade</th>
                <th class="py-2.5 px-2 text-center">GP</th>
                <th class="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-center">
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] uppercase font-bold text-slate-500 block">Overall Average</span>
            <span class="text-base font-extrabold text-tcis-navy">${summary.averagePercentageFormatted}</span>
          </div>
          <div class="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <span class="text-[10px] uppercase font-bold text-amber-800 block">Term GPA (Max 4.00)</span>
            <span class="text-base font-extrabold text-amber-900">${summary.gpaFormatted}</span>
          </div>
          <div class="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
            <span class="text-[10px] uppercase font-bold text-emerald-800 block">Completed Subjects</span>
            <span class="text-base font-extrabold text-emerald-900">${summary.completedCount} Subject(s)</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-[10px] uppercase font-bold text-slate-500 block">Incomplete Subjects</span>
            <span class="text-base font-extrabold text-slate-700">${summary.incompleteCount} Subject(s)</span>
          </div>
        </div>

        <!-- Remarks Section -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-2.5 text-xs">
          <div class="flex items-start">
            <span class="font-bold text-tcis-navy w-44 flex-shrink-0">Class Teacher's General Remark:</span>
            <span class="text-slate-700 italic">"${escapeHtml(overallComment)}"</span>
          </div>
          <div class="flex items-start">
            <span class="font-bold text-tcis-navy w-44 flex-shrink-0">Headteacher's Remark:</span>
            <span class="text-slate-700 italic">"${escapeHtml(headteacherComment)}"</span>
          </div>
        </div>

        <!-- Signatures Section -->
        <div class="grid grid-cols-3 gap-6 pt-6 mb-4 text-center text-xs">
          <div>
            <div class="border-b border-slate-400 pb-8 mb-1"></div>
            <span class="font-bold text-slate-700">Class Teacher's Signature</span>
          </div>
          <div>
            <div class="border-b border-slate-400 pb-8 mb-1"></div>
            <span class="font-bold text-slate-700">Headteacher's Signature &amp; Stamp</span>
          </div>
          <div>
            <div class="border-b border-slate-400 pb-8 mb-1"></div>
            <span class="font-bold text-slate-700">Parent / Guardian's Signature</span>
          </div>
        </div>

        <!-- Confidentiality & Footer -->
        <div class="border-t border-slate-200 pt-3 text-center text-[10px] text-slate-400">
          <span>${escapeHtml(settings.reportFooter || "Official Terminal Report - Temple Christian International School. Any alteration invalidates this document.")}</span>
        </div>
      </div>
    `;
  },

  // ==========================================
  // 6. JSPDF FORMAL REPORT GENERATOR
  // ==========================================
  async buildPDFDocument(student, academicYear, term, results, settings) {
    const mode = document.getElementById("reportModeSelect")?.value || "progressive";
    if (mode === "progressive" || mode === "progressive2" || mode === "midterm") {
      return this.buildSingleAssessmentPDFDocument(student, academicYear, term, results, settings, mode);
    } else {
      return this.buildFullTerminalPDFDocument(student, academicYear, term, results, settings);
    }
  },

  // Generates Exact A4 Portrait PDF for Progressive Test / Mid-Term Report
  buildSingleAssessmentPDFDocument(student, academicYear, term, results, settings, mode) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("jsPDF library not loaded. Please check your internet connection.");
    }

    const { jsPDF } = window.jspdf;
    // A4 Portrait: 210mm x 297mm
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const summary = this.calculateAssessmentSpecificSummary(results, mode);
    let reportTitle = "Progressive Test One Report";
    if (mode === "midterm") reportTitle = "MidTerm Report";
    else if (mode === "progressive2") reportTitle = "Progressive Test Two Report";

    // Header Banner Image
    const banner = window.REPORT_ASSETS?.banner;
    if (banner) {
      try {
        const bannerWidth = 88;
        const bannerHeight = 24.3;
        const bannerX = (210 - bannerWidth) / 2;
        doc.addImage(banner, "PNG", bannerX, 10, bannerWidth, bannerHeight);
      } catch (e) {
        console.warn("Banner addImage error:", e);
      }
    }

    // Title and Metadata
    let currentY = 41;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${reportTitle} for ${student.fullName || "Student"}`, 105, currentY, { align: "center" });

    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`Class/Year: ${student.yearGroup || student.className || "—"}`, 105, currentY, { align: "center" });

    currentY += 5.5;
    doc.text(`Term: ${term}`, 105, currentY, { align: "center" });

    // Results Table
    currentY += 4.5;
    const tableColumns = [
      { header: "Subject", dataKey: "subject" },
      { header: "Score", dataKey: "score" },
      { header: "Grade", dataKey: "grade" },
      { header: "GPA", dataKey: "gpa" }
    ];

    const tableRows = summary.subjects.map(s => ({
      subject: s.subjectName,
      score: s.scoreFormatted,
      grade: s.grade,
      gpa: s.gpa
    }));

    if (tableRows.length === 0) {
      const modeLabel = mode === "midterm" ? "Mid-Term" : "Progressive Test";
      tableRows.push({
        subject: `No ${modeLabel} scores entered`,
        score: "—",
        grade: "—",
        gpa: "—"
      });
    }

    doc.autoTable({
      startY: currentY,
      margin: { left: 16, right: 16 },
      head: [tableColumns.map(c => c.header)],
      body: tableRows.map(r => tableColumns.map(c => r[c.dataKey])),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 1.8,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        lineColor: [209, 213, 219],
        lineWidth: 0.2
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 9,
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "center",
        cellPadding: 2,
        lineColor: [209, 213, 219],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { cellWidth: 70, halign: "center" },
        1: { cellWidth: 36, halign: "center" },
        2: { cellWidth: 36, halign: "center" },
        3: { cellWidth: 36, halign: "center" }
      }
    });

    currentY = doc.lastAutoTable.finalY + 5.5;

    // Overall GPA Line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`GPA: ${summary.gpaFormatted}`, 16, currentY);

    // GPA Table Heading
    currentY += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("GPA Table", 16, currentY);

    currentY += 2;

    // GPA Reference Table
    const gpaRefHead = ["GRADE", "PERCENTAGE RANGE", "GRADE POINT RANGE", "REMARKS"];
    const gpaRefBody = this.TCIS_SCALE_REFERENCE.map(item => [
      item.grade,
      item.range,
      item.gpa,
      item.remark
    ]);

    doc.autoTable({
      startY: currentY,
      margin: { left: 16, right: 16 },
      head: [gpaRefHead],
      body: gpaRefBody,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 1.4,
        textColor: [0, 0, 0],
        halign: "center",
        valign: "middle",
        lineColor: [209, 213, 219],
        lineWidth: 0.2
      },
      headStyles: {
        fontStyle: "bold",
        fontSize: 8,
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "center",
        cellPadding: 1.6,
        lineColor: [209, 213, 219],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 50 },
        2: { cellWidth: 46 },
        3: { cellWidth: 46 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 6;

    // Head of Academics Signature Block (Right Aligned)
    const sigCenterX = 160;

    const signature = window.REPORT_ASSETS?.signature;
    if (signature) {
      try {
        doc.addImage(signature, "JPEG", sigCenterX - 14, currentY + 1, 28, 12);
      } catch (e) {
        try {
          doc.addImage(signature, "PNG", sigCenterX - 14, currentY + 1, 28, 12);
        } catch (err) {
          console.warn("Signature addImage error:", err);
        }
      }
    }

    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text("............................", sigCenterX, currentY + 14.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text("Mr. Emmanuel Elikplim Godzo", sigCenterX, currentY + 19, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text("Head of Academics", sigCenterX, currentY + 23.5, { align: "center" });

    return doc;
  },

  // Generates Landscape A4 Terminal Report (Full 5 Components)
  buildFullTerminalPDFDocument(student, academicYear, term, results, settings) {
    const { jsPDF } = window.jspdf;
    // A4 Landscape: 297mm x 210mm
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;

    const summary = this.calculateGPAAndSummary(results);

    // Decorative School Outer Border
    doc.setDrawColor(26, 43, 73);
    doc.setLineWidth(0.8);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
    doc.setDrawColor(197, 155, 39);
    doc.setLineWidth(0.3);
    doc.rect(margin + 1.2, margin + 1.2, pageWidth - (margin * 2) - 2.4, pageHeight - (margin * 2) - 2.4);

    let currentY = margin + 5;

    // School Crest / Logo
    let logoRendered = false;
    const banner = window.REPORT_ASSETS?.banner;
    if (banner) {
      try {
        doc.addImage(banner, "PNG", margin + 4, currentY - 1, 45, 12.5);
        logoRendered = true;
      } catch (e) {}
    }
    if (!logoRendered) {
      doc.setFillColor(26, 43, 73);
      doc.roundedRect(margin + 4, currentY, 18, 18, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("TCIS", margin + 13, currentY + 11, { align: "center" });
    }

    // School Header Text
    doc.setTextColor(26, 43, 73);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text((settings.schoolName || "TEMPLE CHRISTIAN INTERNATIONAL SCHOOL").toUpperCase(), pageWidth / 2, currentY + 5, { align: "center" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 155, 39);
    doc.text(`"${settings.schoolMotto || "Excellence, Integrity and Christian Leadership"}"`, pageWidth / 2, currentY + 9.5, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text(`${settings.schoolAddress || "Accra, Ghana"} | ${settings.contactDetails || ""}`, pageWidth / 2, currentY + 13.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 43, 73);
    doc.text(`STUDENT TERMINAL REPORT — ${academicYear.toUpperCase()} (${term.toUpperCase()})`, pageWidth / 2, currentY + 18, { align: "center" });

    currentY += 21;

    // Student Information Card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 4, currentY, pageWidth - (margin * 2) - 8, 14, 1.5, 1.5, "FD");

    doc.setFontSize(8.5);
    const col1 = margin + 8;
    const col2 = margin + 85;
    const col3 = margin + 165;
    const col4 = margin + 225;

    // Row 1
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Student Name:", col1, currentY + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(student.fullName || "—", col1 + 24, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Admission No:", col2, currentY + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text(student.admissionNumber || "—", col2 + 24, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Year Group:", col3, currentY + 5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(student.yearGroup || "—", col3 + 20, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Date:", col4, currentY + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(new Date().toLocaleDateString("en-GB"), col4 + 12, currentY + 5);

    // Row 2
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Class/Stream:", col1, currentY + 10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(student.className || "Standard", col1 + 24, currentY + 10.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Academic Year:", col2, currentY + 10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(academicYear, col2 + 24, currentY + 10.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Term:", col3, currentY + 10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(term, col3 + 20, currentY + 10.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("Status:", col4, currentY + 10.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(student.status === "Active" ? 16 : 100, student.status === "Active" ? 130 : 100, 50);
    doc.text(student.status || "Active", col4 + 12, currentY + 10.5);

    currentY += 17;

    // Academic Results Table (AutoTable)
    const tableColumns = [
      { header: "Subject", dataKey: "subject" },
      { header: "Exercise (10%)", dataKey: "exercise" },
      { header: "Homework (10%)", dataKey: "homework" },
      { header: "Prog. Test (20%)", dataKey: "prog" },
      { header: "Mid-Term (20%)", dataKey: "mid" },
      { header: "End-Term (40%)", dataKey: "end" },
      { header: "Final Score", dataKey: "final" },
      { header: "Grade", dataKey: "grade" },
      { header: "GP", dataKey: "gp" },
      { header: "Description", dataKey: "desc" }
    ];

    const tableRows = results.map(r => {
      const finalStr = r.finalPercentage !== undefined && r.finalPercentage !== null
        ? `${r.finalPercentage.toFixed(2)}%`
        : "Incomplete";
      const gpStr = r.gradePoint !== null && r.gradePoint !== undefined ? r.gradePoint.toFixed(2) : "—";

      return {
        subject: r.subjectName || "Subject",
        exercise: r.categoryPercentages?.exercise !== undefined && r.categoryPercentages.exercise !== null ? `${r.categoryPercentages.exercise.toFixed(1)}%` : "—",
        homework: r.categoryPercentages?.homework !== undefined && r.categoryPercentages.homework !== null ? `${r.categoryPercentages.homework.toFixed(1)}%` : "—",
        prog: r.categoryPercentages?.progressiveTest !== undefined && r.categoryPercentages.progressiveTest !== null ? `${r.categoryPercentages.progressiveTest.toFixed(1)}%` : (r.categoryPercentages?.progressiveTest1 !== undefined && r.categoryPercentages.progressiveTest1 !== null ? `${r.categoryPercentages.progressiveTest1.toFixed(1)}%` : "—"),
        mid: r.categoryPercentages?.midTerm !== undefined && r.categoryPercentages.midTerm !== null ? `${r.categoryPercentages.midTerm.toFixed(1)}%` : "—",
        end: r.categoryPercentages?.endOfTerm !== undefined && r.categoryPercentages.endOfTerm !== null ? `${r.categoryPercentages.endOfTerm.toFixed(1)}%` : "—",
        final: finalStr,
        grade: r.grade || "Incomplete",
        gp: gpStr,
        desc: r.gradeDescription || "Incomplete"
      };
    });

    doc.autoTable({
      startY: currentY,
      margin: { left: margin + 4, right: margin + 4 },
      head: [tableColumns.map(c => c.header)],
      body: tableRows.map(r => tableColumns.map(c => r[c.dataKey])),
      theme: "grid",
      headStyles: {
        fillColor: [26, 43, 73],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 1.8
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 1.6,
        textColor: [31, 41, 55],
        valign: "middle"
      },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold", cellWidth: 42 },
        1: { halign: "center", cellWidth: 23 },
        2: { halign: "center", cellWidth: 23 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "center", cellWidth: 24 },
        5: { halign: "center", cellWidth: 24 },
        6: { halign: "center", fontStyle: "bold", cellWidth: 22 },
        7: { halign: "center", fontStyle: "bold", cellWidth: 16 },
        8: { halign: "center", cellWidth: 16 },
        9: { halign: "left", cellWidth: 46 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    currentY = doc.lastAutoTable.finalY + 3.5;

    // Summary Statistics Cards
    const boxWidth = (pageWidth - (margin * 2) - 8 - 9) / 4;
    const boxHeight = 11;

    // Card 1: Overall Average
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin + 4, currentY, boxWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Overall Average", margin + 6, currentY + 3.5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text(summary.averagePercentageFormatted, margin + 6, currentY + 8.5);

    // Card 2: Term GPA
    const c2X = margin + 4 + boxWidth + 3;
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(c2X, currentY, boxWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(146, 64, 14);
    doc.text("Term GPA (Max 4.00)", c2X + 2, currentY + 3.5);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text(summary.gpaFormatted, c2X + 2, currentY + 8.5);

    // Card 3: Completed Subjects
    const c3X = c2X + boxWidth + 3;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(c3X, currentY, boxWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 101, 52);
    doc.text("Completed Subjects", c3X + 2, currentY + 3.5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text(`${summary.completedCount} Subject(s)`, c3X + 2, currentY + 8.5);

    // Card 4: Incomplete Subjects
    const c4X = c3X + boxWidth + 3;
    doc.setFillColor(summary.incompleteCount > 0 ? 254 : 248, summary.incompleteCount > 0 ? 242 : 250, summary.incompleteCount > 0 ? 242 : 252);
    doc.setDrawColor(summary.incompleteCount > 0 ? 254 : 226, summary.incompleteCount > 0 ? 202 : 232, summary.incompleteCount > 0 ? 202 : 240);
    doc.roundedRect(c4X, currentY, boxWidth, boxHeight, 1, 1, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(summary.incompleteCount > 0 ? 185 : 100, summary.incompleteCount > 0 ? 28 : 116, summary.incompleteCount > 0 ? 28 : 139);
    doc.text("Incomplete Subjects", c4X + 2, currentY + 3.5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(summary.incompleteCount > 0 ? 185 : 100, summary.incompleteCount > 0 ? 28 : 116, summary.incompleteCount > 0 ? 28 : 139);
    doc.text(`${summary.incompleteCount} Subject(s)`, c4X + 2, currentY + 8.5);

    currentY += boxHeight + 3.5;

    // Comments Section
    const teacherRemark = results.find(r => r.overallTeacherComment && r.overallTeacherComment.trim())?.overallTeacherComment || "Good academic conduct and steady progress exhibited.";
    const headmasterRemark = settings.headteacherName 
      ? `Promoted with commendable diligence. Approved by ${settings.headteacherName}.` 
      : "Promoted with commendable diligence and academic commitment.";

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin + 4, currentY, pageWidth - (margin * 2) - 8, 14, 1, 1, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text("Class Teacher's General Remark:", margin + 6, currentY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(teacherRemark, margin + 50, currentY + 4.5, { maxWidth: pageWidth - (margin * 2) - 60 });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 43, 73);
    doc.text("Headteacher's Remark:", margin + 6, currentY + 10.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(headmasterRemark, margin + 50, currentY + 10.5, { maxWidth: pageWidth - (margin * 2) - 60 });

    currentY += 16.5;

    // Official Signature Lines
    const sigColWidth = (pageWidth - (margin * 2) - 8) / 3;
    const sigY = currentY + 6;

    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(margin + 6, sigY, margin + 6 + sigColWidth - 12, sigY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("Class Teacher's Signature", margin + 6, sigY + 3.5);

    const s2X = margin + 4 + sigColWidth;
    doc.line(s2X + 2, sigY, s2X + sigColWidth - 10, sigY);
    doc.text("Headteacher's Signature / Stamp", s2X + 2, sigY + 3.5);

    const s3X = s2X + sigColWidth;
    doc.line(s3X + 2, sigY, s3X + sigColWidth - 10, sigY);
    doc.text("Parent / Guardian's Signature", s3X + 2, sigY + 3.5);

    // Document Footer
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    const footerText = `${settings.reportFooter || "Official Terminal Report - Temple Christian International School. Confidential."} | Generated: ${new Date().toLocaleString()}`;
    doc.text(footerText, pageWidth / 2, pageHeight - margin - 2, { align: "center" });

    return doc;
  },

  // ==========================================
  // 7. DOWNLOAD INDIVIDUAL REPORT PDF
  // ==========================================
  async generateStudentPDF(triggerDownload = true) {
    if (!this.selectedStudent) {
      this.showToast("Please select a student first.", "warning");
      return null;
    }

    const academicYear = document.getElementById("reportAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("reportTerm")?.value || "Term 1";
    const mode = document.getElementById("reportModeSelect")?.value || "progressive";
    const settings = window.Dashboard?.currentSettings || await window.DB.getSettings();

    try {
      const doc = await this.buildPDFDocument(
        this.selectedStudent,
        academicYear,
        term,
        this.currentStudentResults,
        settings
      );

      const safeName = (this.selectedStudent.fullName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
      const safeAdm = (this.selectedStudent.admissionNumber || "").replace(/[^a-zA-Z0-9]/g, "_");
      let modePrefix = "ProgressiveTest";
      if (mode === "midterm") modePrefix = "MidTerm";
      else if (mode === "progressive2") modePrefix = "ProgressiveTest2";
      else if (mode === "full") modePrefix = "TerminalReport";

      const fileName = `TCIS_${modePrefix}_${safeName}_${term.replace(/\s+/g, '')}.pdf`;

      if (triggerDownload) {
        doc.save(fileName);
        this.showToast(`Report downloaded: ${fileName}`, "success");
      }

      return { doc, fileName };
    } catch (err) {
      console.error("PDF generation failed:", err);
      this.showToast("PDF generation failed: " + err.message, "error");
      return null;
    }
  },

  // ==========================================
  // 8. PRINT CURRENT REPORT
  // ==========================================
  printCurrentReport() {
    if (!this.selectedStudent) {
      this.showToast("Please select a student and preview report first.", "warning");
      return;
    }

    const mode = document.getElementById("reportModeSelect")?.value || "progressive";
    let dynamicStyle = document.getElementById("dynamicPrintStyle");
    if (!dynamicStyle) {
      dynamicStyle = document.createElement("style");
      dynamicStyle.id = "dynamicPrintStyle";
      document.head.appendChild(dynamicStyle);
    }

    if (mode === "progressive" || mode === "progressive2" || mode === "midterm") {
      dynamicStyle.textContent = `@media print { @page { size: A4 portrait; margin: 8mm; } }`;
    } else {
      dynamicStyle.textContent = `@media print { @page { size: A4 landscape; margin: 8mm; } }`;
    }

    window.print();
  },

  // ==========================================
  // 9. BULK REPORT GENERATION (PACKAGED INTO ZIP)
  // ==========================================
  async handleBulkReportGeneration() {
    const yg = document.getElementById("reportYearGroupFilter")?.value || "";
    const cls = document.getElementById("reportClassFilter")?.value || "";
    const academicYear = document.getElementById("reportAcademicYear")?.value || "2025/2026";
    const term = document.getElementById("reportTerm")?.value || "Term 1";
    const mode = document.getElementById("reportModeSelect")?.value || "progressive";

    const allStudents = window.Students?.allStudents || await window.DB.getStudents();
    const targetStudents = allStudents.filter(s => {
      return (!yg || s.yearGroup === yg) && (!cls || s.className === cls);
    });

    if (targetStudents.length === 0) {
      this.showToast("No students found in the selected filter.", "warning");
      return;
    }

    let modeLabel = "Progressive Test Reports";
    if (mode === "midterm") modeLabel = "MidTerm Reports";
    else if (mode === "progressive2") modeLabel = "Progressive Test Two Reports";
    else if (mode === "full") modeLabel = "Terminal Reports";

    if (!confirm(`Generate ${modeLabel} for all ${targetStudents.length} students in ${yg || 'All Year Groups'} (${academicYear} ${term}) and download as a ZIP package?`)) {
      return;
    }

    const modal = document.getElementById("bulkProgressModal");
    const progressBar = document.getElementById("bulkProgressBar");
    const progressText = document.getElementById("bulkProgressText");

    if (modal) modal.classList.remove("hidden");

    try {
      const zip = typeof JSZip !== "undefined" ? new JSZip() : null;
      const settings = window.Dashboard?.currentSettings || await window.DB.getSettings();

      for (let i = 0; i < targetStudents.length; i++) {
        const student = targetStudents[i];
        const percent = Math.round(((i + 1) / targetStudents.length) * 100);

        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `Processing ${i + 1} of ${targetStudents.length}: ${student.fullName}...`;

        const results = await window.DB.getResults({
          studentId: student.id,
          academicYear,
          term
        });

        const doc = await this.buildPDFDocument(student, academicYear, term, results, settings);
        const pdfBlob = doc.output("blob");

        const safeName = (student.fullName || "Student").replace(/[^a-zA-Z0-9]/g, "_");
        const safeAdm = (student.admissionNumber || "").replace(/[^a-zA-Z0-9]/g, "_");
        let modePrefix = "ProgressiveTest";
        if (mode === "midterm") modePrefix = "MidTerm";
        else if (mode === "progressive2") modePrefix = "ProgressiveTest2";
        else if (mode === "full") modePrefix = "TerminalReport";
        const fileName = `${modePrefix}_${safeName}_${safeAdm}.pdf`;

        if (zip) {
          zip.file(fileName, pdfBlob);
        } else {
          doc.save(fileName);
        }
      }

      if (zip) {
        if (progressText) progressText.textContent = "Compressing reports into ZIP archive...";
        const content = await zip.generateAsync({ type: "blob" });
        let modePrefix = "ProgressiveTest";
        if (mode === "midterm") modePrefix = "MidTerm";
        else if (mode === "progressive2") modePrefix = "ProgressiveTest2";
        else if (mode === "full") modePrefix = "Terminal";
        const zipName = `TCIS_${modePrefix}_Reports_${(yg || 'All').replace(/\s+/g, '_')}_${term.replace(/\s+/g, '')}.zip`;

        if (window.saveAs) {
          window.saveAs(content, zipName);
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = zipName;
          link.click();
        }
        this.showToast(`Bulk reports downloaded successfully as ${zipName}!`, "success");
      }
    } catch (err) {
      console.error("Bulk generation error:", err);
      this.showToast("Bulk generation encountered an error: " + err.message, "error");
    } finally {
      if (modal) modal.classList.add("hidden");
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

window.Reports = Reports;
