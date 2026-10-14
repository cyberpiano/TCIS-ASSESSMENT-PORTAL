/**
 * TCIS Student Results and Report System
 * js/auth.js - Authentication & Session Management
 */

const Auth = {
  SESSION_KEY: "tcis_active_session",

  // Get current active session
  getCurrentUser() {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Save session
  setSession(userProfile) {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(userProfile));
  },

  // Clear session
  clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  // Check if current user has admin role
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === "admin";
  },

  // Login with Email and Password
  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. LIVE FIREBASE LOGIN
    if (window.DB && window.DB.isLive() && window.firebaseAuth) {
      try {
        const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(cleanEmail, password);
        const uid = userCredential.user.uid;
        
        // Fetch profile from Firestore
        let profile = await window.DB.getUserProfile(uid);

        // ─── FIRST-TIME SETUP ──────────────────────────────────────────────
        // If the user was created in Firebase Auth Console but has no Firestore
        // profile yet, auto-create one so they can log in immediately.
        if (!profile) {
          const now = new Date().toISOString();
          profile = {
            uid,
            email: cleanEmail,
            displayName: userCredential.user.displayName || cleanEmail.split("@")[0],
            role: "admin",   // First account defaults to admin; can be changed later in Settings
            active: true,
            teachingAssignments: [],
            createdAt: now,
            updatedAt: now
          };
          await window.DB.saveUserProfile(profile);
          console.log("TCIS: Auto-created Firestore profile for first-time admin:", uid);
        }
        // ──────────────────────────────────────────────────────────────────

        if (!profile.active) {
          await window.firebaseAuth.signOut();
          throw new Error("Your account has been deactivated. Please contact your administrator.");
        }
        if (profile.role !== "admin" && profile.role !== "teacher") {
          await window.firebaseAuth.signOut();
          throw new Error("Unauthorized role. Access denied.");
        }

        const sessionUser = {
          uid: profile.uid || uid,
          email: profile.email || cleanEmail,
          displayName: profile.displayName || userCredential.user.displayName || "Staff Member",
          role: profile.role,
          active: true,
          teachingAssignments: profile.teachingAssignments || []
        };

        this.setSession(sessionUser);
        return sessionUser;
      } catch (err) {
        // Fallback: Check if an administrator set an administrative password for this user
        try {
          const allUsers = await window.DB.getAllUsers();
          const matchedUser = allUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
          if (matchedUser && matchedUser.adminAssignedPassword && matchedUser.adminAssignedPassword === password) {
            if (!matchedUser.active) {
              throw new Error("Your account has been deactivated. Please contact your administrator.");
            }
            const sessionUser = {
              uid: matchedUser.uid,
              email: matchedUser.email,
              displayName: matchedUser.displayName || "Staff Member",
              role: matchedUser.role,
              active: true,
              teachingAssignments: matchedUser.teachingAssignments || []
            };
            this.setSession(sessionUser);
            return sessionUser;
          }
        } catch (subErr) {
          if (subErr.message && subErr.message.includes("deactivated")) throw subErr;
        }

        let msg = err.message || "Authentication failed.";
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          msg = "Invalid email address or password. Please check your credentials and try again.";
        } else if (err.code === "auth/too-many-requests") {
          msg = "Access temporarily blocked due to many failed attempts. Try again later.";
        } else if (err.code === "auth/network-request-failed") {
          msg = "Network error. Check your internet connection and try again.";
        }
        throw new Error(msg);
      }
    }

    // Fallback if live Firebase Auth is temporarily disconnected
    try {
      const allUsers = await window.DB.getAllUsers();
      const matchedUser = allUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (matchedUser && matchedUser.adminAssignedPassword && matchedUser.adminAssignedPassword === password) {
        if (!matchedUser.active) {
          throw new Error("Your account has been deactivated. Please contact your administrator.");
        }
        const sessionUser = {
          uid: matchedUser.uid,
          email: matchedUser.email,
          displayName: matchedUser.displayName || "Staff Member",
          role: matchedUser.role,
          active: true,
          teachingAssignments: matchedUser.teachingAssignments || []
        };
        this.setSession(sessionUser);
        return sessionUser;
      }
    } catch (localErr) {
      if (localErr.message && localErr.message.includes("deactivated")) throw localErr;
    }

    // If Firebase Auth is unavailable
    throw new Error("Cannot connect to Firebase Authentication. Please check your internet connection.");
  },

  // Logout
  async logout() {
    this.clearSession();
    if (window.DB && window.DB.isLive() && window.firebaseAuth) {
      try {
        await window.firebaseAuth.signOut();
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
    window.location.href = "index.html";
  },

  // Route protection check for dashboard.html
  requireAuth() {
    const user = this.getCurrentUser();
    if (!user || !user.active) {
      this.clearSession();
      window.location.href = "index.html";
      return null;
    }
    return user;
  },

  // Admin user creation utility
  async createUserAccount(email, password, displayName, role) {
    if (!this.isAdmin()) {
      throw new Error("Only authorized administrators can provision user accounts.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    // LIVE FIREBASE: Create user using secondary app instance so admin remains logged in
    if (window.DB && window.DB.isLive() && typeof firebase !== 'undefined') {
      let secondaryApp = null;
      try {
        const appName = "SecondaryApp_" + Date.now();
        secondaryApp = firebase.initializeApp(firebaseConfig, appName);
        const secAuth = secondaryApp.auth();

        const userCred = await secAuth.createUserWithEmailAndPassword(cleanEmail, password);
        const uid = userCred.user.uid;

        // Clean up secondary auth session
        await secAuth.signOut();

        const profile = {
          uid,
          email: cleanEmail,
          displayName: displayName.trim(),
          role: role,
          active: true,
          teachingAssignments: [],
          createdAt: now,
          updatedAt: now
        };

        await window.DB.saveUserProfile(profile);
        return profile;
      } catch (err) {
        throw new Error(err.message || "Failed to create Firebase user account.");
      } finally {
        if (secondaryApp) {
          secondaryApp.delete().catch(() => {});
        }
      }
    }

    throw new Error("Firebase Authentication is not available. Please ensure Firebase is initialized.");
  },
  // Admin: Directly update or reset a user's password
  async adminSetUserPassword(uid, newPassword, sendEmail = false) {
    if (!this.isAdmin()) {
      throw new Error("Only authorized administrators can reset user passwords.");
    }
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const profile = await window.DB.getUserProfile(uid);
    if (!profile) {
      throw new Error("User account not found.");
    }

    const now = new Date().toISOString();
    profile.adminAssignedPassword = newPassword;
    profile.passwordUpdatedAt = now;
    profile.updatedAt = now;

    await window.DB.saveUserProfile(profile);

    // If requested, also dispatch a Firebase official password reset email
    if (sendEmail && window.firebaseAuth && profile.email) {
      try {
        await window.firebaseAuth.sendPasswordResetEmail(profile.email);
      } catch (emailErr) {
        console.warn("Could not send password reset email:", emailErr);
      }
    }

    return profile;
  },

  // Admin: Send official Firebase password reset link to user's email
  async sendPasswordResetLink(email) {
    if (!this.isAdmin()) {
      throw new Error("Only authorized administrators can request password reset links.");
    }
    if (!window.firebaseAuth) {
      throw new Error("Firebase Authentication is not available.");
    }
    const cleanEmail = email.trim().toLowerCase();
    await window.firebaseAuth.sendPasswordResetEmail(cleanEmail);
    return true;
  }
};

window.Auth = Auth;
