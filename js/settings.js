/**
 * TCIS Student Results and Report System
 * js/settings.js - School Configuration, Subjects Catalog & Teacher Assignments Module
 */

const Settings = {
  currentSettings: null,
  allSubjects: [],
  currentAssigningTeacherUid: null,

  // ==========================================
  // STAFF / TEACHER ACCOUNT MANAGEMENT MODULE
  // ==========================================

  async openEditUserModal(uid) {
    const profile = await window.DB.getUserProfile(uid);
    if (!profile) {
      this.showToast("User profile not found.", "error");
      return;
    }

    document.getElementById("editUserUid").value = profile.uid || uid;
    document.getElementById("editUserName").value = profile.displayName || "";
    document.getElementById("editUserEmail").value = profile.email || "";
    document.getElementById("editUserRole").value = profile.role || "teacher";
    document.getElementById("editUserStatus").value = profile.active !== false ? "active" : "inactive";

    const modal = document.getElementById("editUserModal");
    if (modal) modal.classList.remove("hidden");
  },

  closeEditUserModal() {
    const modal = document.getElementById("editUserModal");
    if (modal) modal.classList.add("hidden");
  },

  async handleSaveEditedUser(e) {
    e.preventDefault();
    const uid = document.getElementById("editUserUid").value;
    const displayName = document.getElementById("editUserName").value.trim();
    const email = document.getElementById("editUserEmail").value.trim().toLowerCase();
    const role = document.getElementById("editUserRole").value;
    const active = document.getElementById("editUserStatus").value === "active";

    if (!displayName || !email) {
      this.showToast("Name and email are required.", "warning");
      return;
    }

    const saveBtn = document.getElementById("saveEditedUserBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Saving...`;
    }

    try {
      const profile = (await window.DB.getUserProfile(uid)) || {};
      profile.uid = uid;
      profile.displayName = displayName;
      profile.email = email;
      profile.role = role;
      profile.active = active;
      profile.updatedAt = new Date().toISOString();

      await window.DB.saveUserProfile(profile);

      // Keep current active session in sync if admin is editing themselves
      const currentLoggedIn = window.Auth?.getCurrentUser();
      if (currentLoggedIn && currentLoggedIn.uid === uid) {
        currentLoggedIn.displayName = displayName;
        currentLoggedIn.email = email;
        currentLoggedIn.role = role;
        window.Auth.setSession(currentLoggedIn);
      }

      this.showToast(`Account for ${displayName} updated successfully.`, "success");
      this.closeEditUserModal();
      await this.loadStaffUsersList();
    } catch (err) {
      console.error("Error updating user account:", err);
      this.showToast("Failed to save changes: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Save Changes";
      }
    }
  },

  // Password Management
  async openChangePasswordModal(uid) {
    const profile = await window.DB.getUserProfile(uid);
    if (!profile) {
      this.showToast("User profile not found.", "error");
      return;
    }

    document.getElementById("changePasswordUid").value = profile.uid || uid;
    document.getElementById("changePasswordEmail").value = profile.email || "";
    
    const userLabel = document.getElementById("changePasswordModalUser");
    if (userLabel) {
      userLabel.textContent = `${profile.displayName || "Staff Member"} (${profile.email})`;
    }

    document.getElementById("changeUserPassword").value = "";
    document.getElementById("changeUserPasswordConfirm").value = "";

    const modal = document.getElementById("changePasswordModal");
    if (modal) modal.classList.remove("hidden");
  },

  closeChangePasswordModal() {
    const modal = document.getElementById("changePasswordModal");
    if (modal) modal.classList.add("hidden");
  },

  generateRandomPassword() {
    const randNum = Math.floor(100 + Math.random() * 900);
    const generated = `Tcis#${new Date().getFullYear()}!${randNum}`;
    const passInput = document.getElementById("changeUserPassword");
    const confirmInput = document.getElementById("changeUserPasswordConfirm");
    if (passInput) passInput.value = generated;
    if (confirmInput) confirmInput.value = generated;
    this.showToast("Generated new temporary password!", "info");
  },

  async handleSaveNewPassword(e) {
    e.preventDefault();
    const uid = document.getElementById("changePasswordUid").value;
    const email = document.getElementById("changePasswordEmail").value;
    const newPass = document.getElementById("changeUserPassword").value;
    const confirmPass = document.getElementById("changeUserPasswordConfirm").value;
    const sendEmail = document.getElementById("changePasswordSendEmail")?.checked || false;

    if (!newPass || newPass.length < 6) {
      this.showToast("Password must be at least 6 characters long.", "warning");
      return;
    }
    if (newPass !== confirmPass) {
      this.showToast("Passwords do not match. Please re-enter.", "warning");
      return;
    }

    const saveBtn = document.getElementById("savePasswordBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Updating...`;
    }

    try {
      await window.Auth.adminSetUserPassword(uid, newPass, sendEmail);
      this.showToast(`Password for ${email} updated successfully! Teacher can now log in.`, "success");
      this.closeChangePasswordModal();
    } catch (err) {
      console.error("Error setting password:", err);
      this.showToast("Failed to update password: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = "Update Password";
      }
    }
  },

  async sendPasswordResetLinkDirectly() {
    const email = document.getElementById("changePasswordEmail").value;
    if (!email) return;

    try {
      await window.Auth.sendPasswordResetLink(email);
      this.showToast(`Official password reset email link dispatched to ${email}!`, "success");
    } catch (err) {
      this.showToast("Could not send reset link: " + err.message, "error");
    }
  },

  // Account Deletion
  _userToDeleteUid: null,

  async confirmDeleteUser(uid) {
    const currentLoggedIn = window.Auth?.getCurrentUser();
    if (currentLoggedIn && currentLoggedIn.uid === uid) {
      this.showToast("You cannot delete your own active administrator account.", "error");
      return;
    }

    const profile = await window.DB.getUserProfile(uid);
    if (!profile) {
      this.showToast("User profile not found.", "error");
      return;
    }

    this._userToDeleteUid = uid;
    const detailsEl = document.getElementById("deleteUserConfirmDetails");
    if (detailsEl) {
      detailsEl.innerHTML = `Are you sure you want to permanently delete <strong>${escapeHtml(profile.displayName || 'Staff')}</strong> (<span class="font-mono">${escapeHtml(profile.email)}</span>)?`;
    }

    const modal = document.getElementById("deleteUserConfirmModal");
    if (modal) modal.classList.remove("hidden");
  },

  closeDeleteUserModal() {
    const modal = document.getElementById("deleteUserConfirmModal");
    if (modal) modal.classList.add("hidden");
    this._userToDeleteUid = null;
  },

  async handleDeleteUser() {
    if (!this._userToDeleteUid) return;

    const btn = document.getElementById("confirmDeleteUserBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1.5"></i> Deleting...`;
    }

    try {
      await window.DB.deleteUserProfile(this._userToDeleteUid);
      this.showToast("Teacher account and assignments removed successfully.", "success");
      this.closeDeleteUserModal();
      await this.loadStaffUsersList();
    } catch (err) {
      console.error("Error deleting user account:", err);
      this.showToast("Failed to delete account: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-trash-can mr-1.5"></i> Yes, Remove Account`;
      }
    }
  },

  async init() {
    await this.loadSettingsIntoForm();
    this.setupEventListeners();
    await this.loadSubjectsList();
    await this.loadStaffUsersList();
  },

  setupEventListeners() {
    const settingsForm = document.getElementById("schoolSettingsForm");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => this.handleSaveSchoolSettings(e));
    }

    // Weight change listeners for live total calculation
    const weightInputs = ["weightExercise", "weightHomework", "weightProgressive", "weightMidTerm", "weightEndOfTerm"];
    weightInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => this.updateWeightTotalDisplay());
      }
    });

    // Logo file uploader
    const logoFile = document.getElementById("schoolLogoFile");
    if (logoFile) {
      logoFile.addEventListener("change", (e) => this.handleLogoUpload(e));
    }

    // Create user form
    const createUserForm = document.getElementById("createUserModalForm");
    if (createUserForm) {
      createUserForm.addEventListener("submit", (e) => this.handleCreateUser(e));
    }

    // Subject modal form
    const subjectForm = document.getElementById("subjectModalForm");
    if (subjectForm) {
      subjectForm.addEventListener("submit", (e) => this.handleSaveSubject(e));
    }

    // Teacher assignment year group change -> update classes
    const assignYg = document.getElementById("assignYearGroup");
    if (assignYg) {
      assignYg.addEventListener("change", () => this.updateAssignClassOptions());
    }
  },

  async loadSettingsIntoForm() {
    try {
      this.currentSettings = await window.DB.getSettings();
      const s = this.currentSettings;

      document.getElementById("settingSchoolName").value = s.schoolName || "";
      document.getElementById("settingSchoolMotto").value = s.schoolMotto || "";
      document.getElementById("settingSchoolAddress").value = s.schoolAddress || "";
      document.getElementById("settingContactDetails").value = s.contactDetails || "";
      document.getElementById("settingHeadteacherName").value = s.headteacherName || "";
      document.getElementById("settingDefaultYear").value = s.defaultAcademicYear || "2025/2026";
      document.getElementById("settingDefaultTerm").value = s.defaultTerm || "Term 1";
      document.getElementById("settingReportFooter").value = s.reportFooter || "";

      // Weights
      const w = s.categoryWeights || { exercise: 10, homework: 10, progressiveTest: 20, midTerm: 20, endOfTerm: 40 };
      document.getElementById("weightExercise").value = w.exercise ?? 10;
      document.getElementById("weightHomework").value = w.homework ?? 10;
      document.getElementById("weightProgressive").value = w.progressiveTest ?? 20;
      document.getElementById("weightMidTerm").value = w.midTerm ?? 20;
      document.getElementById("weightEndOfTerm").value = w.endOfTerm ?? 40;

      this.updateWeightTotalDisplay();

      // Logo preview
      const previewImg = document.getElementById("schoolLogoPreview");
      if (previewImg && s.schoolLogo) {
        previewImg.src = s.schoolLogo;
        previewImg.classList.remove("hidden");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  },

  updateWeightTotalDisplay() {
    const ex = parseFloat(document.getElementById("weightExercise")?.value || 0);
    const hw = parseFloat(document.getElementById("weightHomework")?.value || 0);
    const pr = parseFloat(document.getElementById("weightProgressive")?.value || 0);
    const mt = parseFloat(document.getElementById("weightMidTerm")?.value || 0);
    const et = parseFloat(document.getElementById("weightEndOfTerm")?.value || 0);

    const total = ex + hw + pr + mt + et;
    const badge = document.getElementById("weightTotalBadge");

    if (badge) {
      badge.textContent = `Total: ${total}%`;
      if (total === 100) {
        badge.className = "text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800";
      } else {
        badge.className = "text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800";
      }
    }
  },

  handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.showToast("Please upload an image file (PNG, JPG, or SVG).", "warning");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.showToast("Logo file size must be less than 2MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const preview = document.getElementById("schoolLogoPreview");
      if (preview) {
        preview.src = base64;
        preview.classList.remove("hidden");
      }
      this.currentSettings.schoolLogo = base64;
    };
    reader.readAsDataURL(file);
  },

  async handleSaveSchoolSettings(e) {
    e.preventDefault();

    if (!window.Auth.isAdmin()) {
      this.showToast("Administrative permissions required to modify school configuration.", "error");
      return;
    }

    const ex = parseFloat(document.getElementById("weightExercise").value || 0);
    const hw = parseFloat(document.getElementById("weightHomework").value || 0);
    const pr = parseFloat(document.getElementById("weightProgressive").value || 0);
    const mt = parseFloat(document.getElementById("weightMidTerm").value || 0);
    const et = parseFloat(document.getElementById("weightEndOfTerm").value || 0);

    const totalWeight = ex + hw + pr + mt + et;

    // Validate 100% total rule
    if (Math.abs(totalWeight - 100) > 0.001) {
      this.showToast(`Category weights must total exactly 100%. Current total: ${totalWeight}%.`, "error");
      return;
    }

    const updated = {
      schoolName: document.getElementById("settingSchoolName").value.trim(),
      schoolMotto: document.getElementById("settingSchoolMotto").value.trim(),
      schoolAddress: document.getElementById("settingSchoolAddress").value.trim(),
      contactDetails: document.getElementById("settingContactDetails").value.trim(),
      headteacherName: document.getElementById("settingHeadteacherName").value.trim(),
      defaultAcademicYear: document.getElementById("settingDefaultYear").value.trim(),
      defaultTerm: document.getElementById("settingDefaultTerm").value,
      reportFooter: document.getElementById("settingReportFooter").value.trim(),
      schoolLogo: this.currentSettings?.schoolLogo || "tcis-logo.png",
      categoryWeights: {
        exercise: ex,
        homework: hw,
        progressiveTest: pr,
        midTerm: mt,
        endOfTerm: et
      }
    };

    const saveBtn = document.getElementById("saveSettingsBtn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving...`;
    }

    try {
      await window.DB.saveSettings(updated);
      this.currentSettings = updated;
      if (window.Dashboard) {
        window.Dashboard.currentSettings = updated;
        window.Dashboard.applySettingsToUI();
      }
      this.showToast("School settings and assessment weights saved successfully!", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      this.showToast("Failed to save settings: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>Save Configuration`;
      }
    }
  },

  // ==========================================
  // SUBJECTS CATALOG MANAGEMENT
  // ==========================================
  async loadSubjectsList() {
    const listEl = document.getElementById("subjectsTableBody");
    const countBadge = document.getElementById("subjectsCountBadge");
    if (!listEl) return;

    try {
      this.allSubjects = await window.DB.getSubjects();
      if (countBadge) {
        countBadge.textContent = `${this.allSubjects.length} subjects registered`;
      }

      if (!this.allSubjects || this.allSubjects.length === 0) {
        listEl.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-6 text-slate-400">
              No subjects registered yet. Click "Add Subject" or "Seed Standard Subjects".
            </td>
          </tr>
        `;
        return;
      }

      listEl.innerHTML = this.allSubjects.map(sub => `
        <tr class="border-b border-slate-100 text-xs hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-semibold text-slate-900">${escapeHtml(sub.name)}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-teal-800">${escapeHtml(sub.code || "—")}</td>
          <td class="py-2.5 px-3">
            <span class="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-800 border border-blue-200 text-[11px]">${escapeHtml(sub.category || "All Classes")}</span>
          </td>
          <td class="py-2.5 px-3 text-slate-600">
            <span class="px-2 py-0.5 rounded bg-slate-100 font-medium">${escapeHtml(sub.department || "General")}</span>
          </td>
          <td class="py-2.5 px-3 text-right space-x-1">
            <button onclick="Settings.openEditSubjectModal('${sub.id}')" 
              class="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition" title="Edit Subject">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button onclick="Settings.deleteSubject('${sub.id}')" 
              class="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition" title="Delete Subject">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `).join("");
    } catch (err) {
      console.error("Error loading subjects list:", err);
    }
  },

  openAddSubjectModal() {
    const modal = document.getElementById("subjectModal");
    const form = document.getElementById("subjectModalForm");
    const title = document.getElementById("subjectModalTitle");
    const idInput = document.getElementById("subjectFormId");
    const catInput = document.getElementById("subjectFormCategory");
    if (form) form.reset();
    if (idInput) idInput.value = "";
    if (catInput) catInput.value = "";
    if (title) title.textContent = "Add New Subject";
    if (modal) modal.classList.remove("hidden");
  },

  openEditSubjectModal(id) {
    const sub = this.allSubjects.find(s => s.id === id);
    if (!sub) return;

    const modal = document.getElementById("subjectModal");
    const title = document.getElementById("subjectModalTitle");
    const idInput = document.getElementById("subjectFormId");
    const nameInput = document.getElementById("subjectFormName");
    const codeInput = document.getElementById("subjectFormCode");
    const catInput = document.getElementById("subjectFormCategory");
    const deptInput = document.getElementById("subjectFormDept");

    if (title) title.textContent = "Edit Subject";
    if (idInput) idInput.value = sub.id;
    if (nameInput) nameInput.value = sub.name || "";
    if (codeInput) codeInput.value = sub.code || "";
    if (catInput) catInput.value = sub.category || "";
    if (deptInput) deptInput.value = sub.department || "";

    if (modal) modal.classList.remove("hidden");
  },

  closeAddSubjectModal() {
    const modal = document.getElementById("subjectModal");
    if (modal) modal.classList.add("hidden");
  },

  closeSubjectModal() {
    this.closeAddSubjectModal();
  },

  async handleSaveSubject(e) {
    e.preventDefault();
    const id = document.getElementById("subjectFormId")?.value;
    const name = document.getElementById("subjectFormName").value.trim();
    const code = document.getElementById("subjectFormCode").value.trim().toUpperCase();
    const category = document.getElementById("subjectFormCategory")?.value.trim() || "";
    const dept = document.getElementById("subjectFormDept").value.trim();

    if (!name) {
      this.showToast("Subject name is required.", "warning");
      return;
    }

    try {
      const existing = id ? this.allSubjects.find(s => s.id === id) : null;
      const payload = {
        name,
        code,
        category: category || (existing ? existing.category : "General"),
        department: dept || "General",
        yearGroups: existing && existing.yearGroups ? existing.yearGroups : []
      };
      if (id) {
        payload.id = id;
      }
      await window.DB.saveSubject(payload);
      this.showToast(id ? `Subject "${name}" updated successfully.` : `Subject "${name}" added successfully.`, "success");
      this.closeAddSubjectModal();
      await this.loadSubjectsList();
    } catch (err) {
      this.showToast("Failed to save subject: " + err.message, "error");
    }
  },

  async deleteSubject(id) {
    const sub = this.allSubjects.find(s => s.id === id);
    if (!sub) return;

    if (!confirm(`Are you sure you want to remove subject "${sub.name}" from the curriculum?`)) {
      return;
    }

    try {
      await window.DB.deleteSubject(id);
      this.showToast(`Subject "${sub.name}" deleted.`, "info");
      await this.loadSubjectsList();
    } catch (err) {
      this.showToast("Failed to delete subject: " + err.message, "error");
    }
  },

  async seedStandardSubjects() {
    if (!confirm("Populate standard TCIS subjects (Mathematics, English, Sciences, ICT, etc.) into the database?")) {
      return;
    }
    try {
      await window.DB.seedDefaultSubjectsToFirestore();
      this.showToast("Standard subjects seeded successfully!", "success");
      await this.loadSubjectsList();
    } catch (err) {
      this.showToast("Error seeding subjects: " + err.message, "error");
    }
  },

  // ==========================================
  // STAFF USERS & TEACHER ASSIGNMENTS
  // ==========================================
  async loadStaffUsersList() {
    const listEl = document.getElementById("staffUsersTableBody");
    if (!listEl) return;

    try {
      const users = await window.DB.getAllUsers();
      if (!users || users.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">No staff accounts registered.</td></tr>`;
        return;
      }

      listEl.innerHTML = users.map(u => {
        const roleBadge = u.role === "admin"
          ? `<span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Admin</span>`
          : `<span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Teacher</span>`;

        const statusBadge = u.active
          ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full inline-block"></span>Active</span>`
          : `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><span class="w-1.5 h-1.5 mr-1.5 bg-rose-500 rounded-full inline-block"></span>Deactivated</span>`;

        // Teaching assignments count button
        let assignInfo = "";
        if (u.role === "teacher") {
          const count = (u.teachingAssignments && Array.isArray(u.teachingAssignments)) ? u.teachingAssignments.length : 0;
          assignInfo = `
            <div class="mt-1">
              <button onclick="Settings.openAssignTeacherModal('${u.uid}')" 
                class="px-2 py-0.5 text-[11px] rounded font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition">
                <i class="fa-solid fa-chalkboard-user mr-1 text-indigo-600"></i> ${count} Class Assignment${count === 1 ? '' : 's'}
              </button>
            </div>
          `;
        }

        return `
          <tr class="border-b border-slate-100 text-xs hover:bg-slate-50 transition">
            <td class="py-2.5 px-3 font-semibold text-slate-800">
              ${escapeHtml(u.displayName || "Staff Member")}
              ${assignInfo}
            </td>
            <td class="py-2.5 px-3 font-mono text-slate-600">${escapeHtml(u.email)}</td>
            <td class="py-2.5 px-3">${roleBadge}</td>
            <td class="py-2.5 px-3">${statusBadge}</td>
            <td class="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
              ${u.role === "teacher" ? `
                <button onclick="Settings.openAssignTeacherModal('${u.uid}')"
                  class="p-1.5 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded transition" title="Assign Subjects & Classes">
                  <i class="fa-solid fa-chalkboard-user text-sm"></i>
                </button>
              ` : ''}
              <button onclick="Settings.openEditUserModal('${u.uid}')" 
                class="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition" title="Manage / Edit Account">
                <i class="fa-solid fa-user-pen text-sm"></i>
              </button>
              <button onclick="Settings.openChangePasswordModal('${u.uid}')" 
                class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition" title="Change Password">
                <i class="fa-solid fa-key text-sm"></i>
              </button>
              <button onclick="Settings.toggleUserStatus('${u.uid}')" 
                class="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition" title="${u.active ? 'Deactivate Account' : 'Activate Account'}">
                ${u.active ? '<i class="fa-solid fa-user-slash text-sm text-slate-400 hover:text-rose-600"></i>' : '<i class="fa-solid fa-user-check text-sm text-emerald-600"></i>'}
              </button>
              <button onclick="Settings.confirmDeleteUser('${u.uid}')" 
                class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition" title="Delete Teacher Account">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </td>
          </tr>
        `;
      }).join("");
    } catch (err) {
      console.warn("Could not load users list:", err);
    }

    // Also populate the teacher assignments list card
    const taBody = document.getElementById("teacherAssignmentsListBody");
    if (taBody) {
      try {
        const users = await window.DB.getAllUsers();
        const teachers = users.filter(u => u.role === "teacher");
        if (teachers.length === 0) {
          taBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400">No teacher accounts found. Add staff accounts above first.</td></tr>`;
        } else {
          taBody.innerHTML = teachers.map(t => {
            const count = (t.teachingAssignments && Array.isArray(t.teachingAssignments)) ? t.teachingAssignments.length : 0;
            const summary = count > 0
              ? t.teachingAssignments.map(a => `<span class="inline-flex items-center bg-indigo-50 text-indigo-900 text-[11px] font-semibold px-2 py-1 rounded mr-1 mb-1 border border-indigo-200"><i class="fa-solid fa-chalkboard text-[10px] text-indigo-600 mr-1.5"></i>${escapeHtml(a.subjectName)} <span class="text-indigo-600 font-normal ml-1">(${escapeHtml(a.yearGroup)} &bull; ${escapeHtml(a.className || "All Classes")})</span></span>`).join("")
              : `<span class="text-slate-400 text-xs italic">No assignments yet</span>`;
            return `
              <tr class="border-b border-slate-100 text-xs hover:bg-slate-50 transition">
                <td class="py-2.5 px-3 font-semibold text-slate-800">${escapeHtml(t.displayName || "Teacher")}</td>
                <td class="py-2.5 px-3 font-mono text-slate-600">${escapeHtml(t.email)}</td>
                <td class="py-2.5 px-3">${summary}</td>
                <td class="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                  <button onclick="Settings.openAssignTeacherModal('${t.uid}')"
                    class="px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-[11px] font-bold rounded-lg shadow transition" title="Assign Classes">
                    <i class="fa-solid fa-chalkboard-user mr-1"></i> Classes
                  </button>
                  <button onclick="Settings.openEditUserModal('${t.uid}')"
                    class="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition" title="Edit Teacher Account">
                    <i class="fa-solid fa-user-pen text-sm"></i>
                  </button>
                  <button onclick="Settings.openChangePasswordModal('${t.uid}')"
                    class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition" title="Change Password">
                    <i class="fa-solid fa-key text-sm"></i>
                  </button>
                  <button onclick="Settings.confirmDeleteUser('${t.uid}')"
                    class="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition" title="Remove Teacher Account">
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </td>
              </tr>`;
          }).join("");
        }
      } catch (err) {
        console.warn("Error populating teacher assignments list:", err);
      }
    }
  },

  openCreateUserModal() {
    const modal = document.getElementById("createUserModal");
    const form = document.getElementById("createUserModalForm");
    if (form) form.reset();
    if (modal) modal.classList.remove("hidden");
  },

  closeCreateUserModal() {
    const modal = document.getElementById("createUserModal");
    if (modal) modal.classList.add("hidden");
  },

  async handleCreateUser(e) {
    e.preventDefault();

    const name = document.getElementById("newUserName").value.trim();
    const email = document.getElementById("newUserEmail").value.trim();
    const pass = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;

    if (!name || !email || !pass || !role) {
      this.showToast("All fields are required.", "warning");
      return;
    }

    if (pass.length < 6) {
      this.showToast("Password must be at least 6 characters long.", "warning");
      return;
    }

    const btn = document.getElementById("submitCreateUserBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>Creating Account...`;
    }

    try {
      await window.Auth.createUserAccount(email, pass, name, role);
      this.showToast(`User account created successfully for ${email}!`, "success");
      this.closeCreateUserModal();
      await this.loadStaffUsersList();
    } catch (err) {
      this.showToast("Failed to create user: " + err.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i>Create Account`;
      }
    }
  },

  async toggleUserStatus(uid) {
    const currentUser = window.Auth.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      this.showToast("You cannot deactivate your own administrative account.", "warning");
      return;
    }

    const profile = await window.DB.getUserProfile(uid);
    if (!profile) return;

    profile.active = !profile.active;
    await window.DB.saveUserProfile(profile);
    this.showToast(`Account for ${profile.email} is now ${profile.active ? 'active' : 'deactivated'}.`, "info");
    await this.loadStaffUsersList();
  },

  // ==========================================
  // TEACHER ASSIGNMENT MODAL LOGIC
  // ==========================================
  async openAssignTeacherModal(teacherUid) {
    this.currentAssigningTeacherUid = teacherUid;
    const profile = await window.DB.getUserProfile(teacherUid);
    if (!profile) return;

    const modal = document.getElementById("assignTeacherModal");
    const nameEl = document.getElementById("assignTeacherModalName");
    if (nameEl) nameEl.textContent = `${profile.displayName} (${profile.email})`;

    // Populate Subjects Dropdown
    const subjectSelect = document.getElementById("assignSubject");
    if (subjectSelect) {
      const subjects = await window.DB.getSubjects();
      subjectSelect.innerHTML = `<option value="">Select Subject...</option>` +
        subjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join("");
    }

    // Populate Year Group Filter
    const ygFilter = document.getElementById("assignYearGroupFilter");
    if (ygFilter && window.Students?.YEAR_GROUPS) {
      ygFilter.innerHTML = `<option value="ALL">All Year Groups (Year 7 – 13)</option>` +
        window.Students.YEAR_GROUPS.map(yg => `<option value="${yg}">${yg}</option>`).join("");
      ygFilter.value = "ALL";
    }
    const ygSelect = document.getElementById("assignYearGroup");
    if (ygSelect && window.Students?.YEAR_GROUPS) {
      ygSelect.innerHTML = `<option value="">Select Year Group...</option>` +
        window.Students.YEAR_GROUPS.map(yg => `<option value="${yg}">${yg}</option>`).join("");
    }

    this.updateAssignClassOptions();
    this.renderCurrentAssignmentsList(profile.teachingAssignments || []);

    if (modal) modal.classList.remove("hidden");
  },

  closeAssignTeacherModal() {
    const modal = document.getElementById("assignTeacherModal");
    if (modal) modal.classList.add("hidden");
    this.currentAssigningTeacherUid = null;
  },

  // Cache for custom added streams in current session
  _customStreamsByYg: {},

  addCustomStreamCheckbox() {
    const input = document.getElementById("assignCustomStreamInput");
    const ygSelect = document.getElementById("assignCustomStreamYg");
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    const selectedYg = ygSelect?.value || document.getElementById("assignYearGroupFilter")?.value || "Year 13";
    if (!selectedYg || selectedYg === "all" || selectedYg === "junior" || selectedYg === "senior") {
      this.showToast("Please choose a specific Year Group for this custom stream.", "warning");
      return;
    }
    if (!this._customStreamsByYg[selectedYg]) {
      this._customStreamsByYg[selectedYg] = new Set();
    }
    this._customStreamsByYg[selectedYg].add(val);
    input.value = "";
    this.updateAssignClassOptions(val, selectedYg);
    this.showToast(`Added "${val}" to class / stream options for ${selectedYg}.`, "info");
  },

  filterAssignClassDisplay(filterValue) {
    const groups = document.querySelectorAll(".assign-yg-group");
    groups.forEach(g => {
      const yg = g.getAttribute("data-yg");
      let visible = true;
      if (filterValue === "all") {
        visible = true;
      } else if (filterValue === "junior") {
        visible = ["Year 7", "Year 8", "Year 9"].includes(yg);
      } else if (filterValue === "senior") {
        visible = ["Year 10", "Year 11", "Year 12", "Year 13"].includes(yg);
      } else {
        visible = yg === filterValue;
      }
      if (visible) g.classList.remove("hidden");
      else g.classList.add("hidden");
    });
  },

  selectCohortPreset(preset) {
    const checkboxes = document.querySelectorAll(".assign-class-checkbox");
    if (preset === "all" || preset === "cohorts") {
      checkboxes.forEach(cb => {
        if (cb.value === "All Classes") cb.checked = true;
      });
    } else if (preset === "junior") {
      checkboxes.forEach(cb => {
        const yg = cb.getAttribute("data-year-group");
        if (["Year 7", "Year 8", "Year 9"].includes(yg) && cb.value === "All Classes") {
          cb.checked = true;
        }
      });
    } else if (preset === "senior") {
      checkboxes.forEach(cb => {
        const yg = cb.getAttribute("data-year-group");
        if (["Year 10", "Year 11", "Year 12", "Year 13"].includes(yg) && cb.value === "All Classes") {
          cb.checked = true;
        }
      });
    } else if (preset === "science") {
      checkboxes.forEach(cb => {
        const val = cb.value.toLowerCase();
        if (val.includes("science")) {
          cb.checked = true;
        }
      });
    } else if (preset === "humanities") {
      checkboxes.forEach(cb => {
        const val = cb.value.toLowerCase();
        if (val.includes("humanities") || val.includes("arts")) {
          cb.checked = true;
        }
      });
    }
    this.updateAssignSelectedCount();
  },

  toggleSingleYearGroup(yg) {
    const checkboxes = document.querySelectorAll(`.assign-class-checkbox[data-year-group="${yg}"]`);
    if (checkboxes.length === 0) return;
    const anyUnchecked = Array.from(checkboxes).some(cb => !cb.checked);
    checkboxes.forEach(cb => { cb.checked = anyUnchecked; });
    this.updateAssignSelectedCount();
  },

  updateAssignClassOptions(autoCheckStream = null, autoCheckYg = null) {
    const container = document.getElementById("assignClassCheckboxContainer");
    if (!container) return;

    // Preserve previously checked boxes
    const previouslyChecked = new Set();
    document.querySelectorAll(".assign-class-checkbox:checked").forEach(cb => {
      previouslyChecked.add(`${cb.getAttribute("data-year-group")}:::${cb.value.trim()}`);
    });
    if (autoCheckStream && autoCheckYg) {
      previouslyChecked.add(`${autoCheckYg}:::${autoCheckStream.trim()}`);
    }

    const allStudents = window.Students?.allStudents || [];
    const yearGroups = window.Students?.YEAR_GROUPS || [
      "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"
    ];

    let fullHtml = "";

    yearGroups.forEach(yg => {
      const isSenior = ["Year 10", "Year 11", "Year 12", "Year 13"].includes(yg);
      const cohortSub = isSenior ? "Senior High / Examination" : "Lower Secondary";

      // 1. Gather student classes for this year group
      const classSet = new Set();
      allStudents.forEach(s => {
        if (s.yearGroup === yg && s.className && s.className.trim()) {
          classSet.add(s.className.trim());
        }
      });

      // 2. Standard streams (Only Science & Humanities in TCIS senior cohorts; no mock alpha/beta)
      const standardStreams = isSenior
        ? [
            { name: `${yg} Science`, tag: "Science Stream" },
            { name: `${yg} Humanities`, tag: "Humanities Stream" }
          ]
        : [];

      // 3. User custom added streams
      if (this._customStreamsByYg && this._customStreamsByYg[yg]) {
        this._customStreamsByYg[yg].forEach(cs => {
          standardStreams.push({ name: cs, tag: "Custom Stream" });
        });
      }

      // Build options map
      const optionsMap = new Map();
      optionsMap.set("All Classes", {
        value: "All Classes",
        title: `All Classes / Entire ${yg}`,
        subtitle: "Unrestricted cohort access",
        badge: "Whole Year",
        isPrimary: true
      });

      optionsMap.set(yg, {
        value: yg,
        title: `${yg} (General / Main)`,
        subtitle: "Main cohort class",
        badge: "Main Class",
        isPrimary: false
      });

      classSet.forEach(cls => {
        if (cls !== yg && cls !== "All Classes") {
          optionsMap.set(cls, {
            value: cls,
            title: cls,
            subtitle: "Registered student stream",
            badge: "Student Stream",
            isPrimary: false
          });
        }
      });

      standardStreams.forEach(st => {
        if (!optionsMap.has(st.name)) {
          optionsMap.set(st.name, {
            value: st.name,
            title: st.name,
            subtitle: st.tag,
            badge: st.tag,
            isPrimary: false
          });
        }
      });

      const optionsList = Array.from(optionsMap.values());

      fullHtml += `
        <div class="assign-yg-group border border-slate-200/90 rounded-xl p-3 bg-slate-50/60 transition shadow-xs" data-yg="${yg}">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div class="flex items-center space-x-2">
              <span class="font-extrabold text-xs text-indigo-950 flex items-center">
                <i class="fa-solid fa-graduation-cap text-indigo-600 mr-1.5 text-xs"></i>
                ${yg}
              </span>
              <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">${cohortSub}</span>
            </div>
            <button type="button" onclick="Settings.toggleSingleYearGroup('${yg}')" 
              class="text-[10px] text-indigo-700 hover:text-indigo-900 font-bold underline">
              Toggle All ${yg}
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      `;

      optionsList.forEach(opt => {
        const key = `${yg}:::${opt.value}`;
        const isChecked = previouslyChecked.has(key);
        const bgClass = opt.isPrimary
          ? "bg-indigo-50 border-indigo-300 hover:bg-indigo-100 text-indigo-950 font-semibold"
          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";

        fullHtml += `
          <label class="flex items-start p-2 rounded-lg border cursor-pointer transition select-none shadow-xs ${bgClass}">
            <input type="checkbox" value="${escapeHtml(opt.value)}" data-year-group="${yg}"
              ${isChecked ? "checked" : ""}
              onchange="Settings.updateAssignSelectedCount()"
              class="assign-class-checkbox mt-0.5 mr-2 h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-600 cursor-pointer shrink-0" />
            <div class="flex-grow min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[11px] font-bold truncate text-slate-900">${escapeHtml(opt.title)}</span>
                <span class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded ${opt.isPrimary ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-600'} shrink-0">${escapeHtml(opt.badge)}</span>
              </div>
              <p class="text-[10px] text-slate-500 truncate mt-0.5">${escapeHtml(opt.subtitle)}</p>
            </div>
          </label>
        `;
      });

      fullHtml += `
          </div>
        </div>
      `;
    });

    container.innerHTML = fullHtml;
    
    // Apply current filter selection
    const currentFilter = document.getElementById("assignYearGroupFilter")?.value || "all";
    this.filterAssignClassDisplay(currentFilter);
    this.updateAssignSelectedCount();
  },

  updateAssignSelectedCount() {
    const checked = document.querySelectorAll(".assign-class-checkbox:checked");
    const countBadge = document.getElementById("assignClassSelectedBadge");
    if (countBadge) {
      countBadge.textContent = `${checked.length} class${checked.length === 1 ? '' : 'es'} selected`;
      if (checked.length > 0) {
        countBadge.className = "text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200";
      } else {
        countBadge.className = "text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200";
      }
    }

    const inlineBtnText = document.getElementById("assignTeacherModalInlineBtnText");
    const footerBtnText = document.getElementById("assignTeacherModalFooterBtnText");
    const label = checked.length > 0
      ? `Assign ${checked.length} Selected Class${checked.length === 1 ? '' : 'es'} to Teacher`
      : "Assign Selected Classes to Teacher";
    if (inlineBtnText) inlineBtnText.textContent = label;
    if (footerBtnText) footerBtnText.textContent = label;
  },

  toggleSelectAllAssignClasses(forceState = null) {
    const visibleCheckboxes = Array.from(document.querySelectorAll(".assign-class-checkbox")).filter(cb => {
      const group = cb.closest(".assign-yg-group");
      return !group || !group.classList.contains("hidden");
    });
    if (visibleCheckboxes.length === 0) return;
    const shouldCheck = forceState !== null ? forceState : visibleCheckboxes.some(cb => !cb.checked);
    visibleCheckboxes.forEach(cb => { cb.checked = shouldCheck; });
    this.updateAssignSelectedCount();
  },

  renderCurrentAssignmentsList(assignments) {
    const tableBody = document.getElementById("teacherAssignmentsTableBody");
    const countBadge = document.getElementById("assignTeacherCurrentCountBadge");
    if (!tableBody) return;

    if (countBadge) {
      countBadge.textContent = `${assignments?.length || 0} active teaching assignment${assignments?.length === 1 ? '' : 's'}`;
    }

    if (!assignments || assignments.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-6 text-slate-400">
            <i class="fa-solid fa-chalkboard-user text-2xl mb-1 text-slate-300 block"></i>
            No teaching assignments yet for this teacher.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = assignments.map((a, idx) => `
      <tr class="border-b border-slate-100 text-xs hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-semibold text-slate-800 flex items-center">
          <i class="fa-solid fa-book-open text-indigo-600 mr-2 text-xs"></i>
          ${escapeHtml(a.subjectName)}
        </td>
        <td class="py-2.5 px-3 font-medium text-indigo-900">
          <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">${escapeHtml(a.yearGroup)}</span>
        </td>
        <td class="py-2.5 px-3 text-slate-700">
          <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-semibold">${escapeHtml(a.className || "All Classes")}</span>
        </td>
        <td class="py-2.5 px-3 text-right">
          <button onclick="Settings.handleRemoveTeacherAssignment(${idx})" 
            class="text-rose-600 hover:text-rose-800 p-1.5 rounded hover:bg-rose-50 transition" title="Remove Assignment">
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </td>
      </tr>
    `).join("");
  },

  async handleAddTeacherAssignment() {
    if (!this.currentAssigningTeacherUid) return;

    const subject = document.getElementById("assignSubject")?.value;
    if (!subject) {
      this.showToast("Please select a Subject to assign.", "warning");
      return;
    }

    const checkedBoxes = Array.from(document.querySelectorAll(".assign-class-checkbox:checked"));
    if (checkedBoxes.length === 0) {
      this.showToast("Please check at least one Class / Stream checkbox.", "warning");
      return;
    }

    const profile = await window.DB.getUserProfile(this.currentAssigningTeacherUid);
    if (!profile) return;

    const currentAssignments = profile.teachingAssignments || [];
    let addedCount = 0;
    const addedSummaries = [];

    checkedBoxes.forEach(cb => {
      const yearGroup = cb.getAttribute("data-year-group");
      const className = cb.value.trim();
      const exists = currentAssignments.some(a => 
        a.subjectName === subject && 
        a.yearGroup === yearGroup && 
        a.className === className
      );

      if (!exists) {
        currentAssignments.push({
          subjectName: subject,
          yearGroup: yearGroup,
          className: className
        });
        addedCount++;
        addedSummaries.push(`${yearGroup} (${className})`);
      }
    });

    if (addedCount === 0) {
      this.showToast(`Selected class(es) are already assigned to this teacher for ${subject}.`, "info");
      return;
    }

    try {
      await window.DB.saveTeacherAssignments(this.currentAssigningTeacherUid, currentAssignments);
      
      // Keep active session in sync if this is the logged-in user
      const currentLoggedIn = window.Auth?.getCurrentUser();
      if (currentLoggedIn && currentLoggedIn.uid === this.currentAssigningTeacherUid) {
        currentLoggedIn.teachingAssignments = currentAssignments;
        window.Auth.setSession(currentLoggedIn);
      }

      this.showToast(`Successfully assigned ${subject} to ${addedCount} class(es): ${addedSummaries.join(', ')}.`, "success");
      this.renderCurrentAssignmentsList(currentAssignments);
      await this.loadStaffUsersList();
      
      // Uncheck all checkboxes and reset badge
      this.toggleSelectAllAssignClasses(false);
    } catch (err) {
      this.showToast("Failed to save assignments: " + err.message, "error");
    }
  },

  async handleRemoveTeacherAssignment(index) {
    if (!this.currentAssigningTeacherUid) return;

    const profile = await window.DB.getUserProfile(this.currentAssigningTeacherUid);
    if (!profile) return;

    const assignments = profile.teachingAssignments || [];
    assignments.splice(index, 1);

    try {
      await window.DB.saveTeacherAssignments(this.currentAssigningTeacherUid, assignments);
      
      // Keep active session in sync if this is the logged-in user
      const currentLoggedIn = window.Auth?.getCurrentUser();
      if (currentLoggedIn && currentLoggedIn.uid === this.currentAssigningTeacherUid) {
        currentLoggedIn.teachingAssignments = assignments;
        window.Auth.setSession(currentLoggedIn);
      }

      this.showToast("Assignment removed successfully.", "info");
      this.renderCurrentAssignmentsList(assignments);
      await this.loadStaffUsersList();
    } catch (err) {
      this.showToast("Failed to update assignments: " + err.message, "error");
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

window.Settings = Settings;
