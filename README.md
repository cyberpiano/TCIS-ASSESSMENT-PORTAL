# Temple Christian International School (TCIS)
## Student Results and Terminal Report System

A lightweight, functional web application built for Temple Christian International School to manage student records, enter continuous assessment marks across 5 weighted categories, calculate grades and term GPAs using the official TCIS scale, and generate printable A4 terminal reports (individual PDF and bulk ZIP packages).

---

## 1. Technology Stack

* **HTML5 & Vanilla JavaScript (ES6+)**: Pure client-side logic with no build tools or compilation steps.
* **Tailwind CSS (CDN)**: Institutional school palette (TCIS Navy `#1a2b49`, Accent Gold `#c59b27`, and clean slate surfaces).
* **Font Awesome 6 (CDN)**: Vector icons for intuitive navigation.
* **Firebase Authentication (Compat SDK v10)**: Secure session and role authentication.
* **Firebase Cloud Firestore (Compat SDK v10)**: Real-time cloud database storage.
* **jsPDF & jsPDF-AutoTable (CDN)**: High-resolution, vector-accurate A4 landscape terminal reports.
* **JSZip & FileSaver (CDN)**: One-click bulk PDF compilation and ZIP file download for classes.

---

## 2. Project File Structure

```text
├── index.html              # Branded login portal
├── dashboard.html          # Unified workspace for Teachers and Administrators
├── css/
│   └── style.css           # Custom styles (print stylesheets, scrollbars, brand fonts)
├── js/
│   ├── firebase.js         # Firebase configuration & data layer (with instant offline demo mode)
│   ├── auth.js             # Session handling, role authorization, and user provisioning
│   ├── dashboard.js        # Main dashboard controller, summary metrics, and activity feeds
│   ├── students.js         # Student registration, unique admission validation, search & filters
│   ├── results.js          # Assessment score entry (5 categories), live auto-weighting
│   ├── reports.js          # TCIS grading scale, GPA formula, and jsPDF A4 report generation
│   └── settings.js         # School settings, category weights validation, and staff accounts
├── test/
│   └── grading_test.js     # Automated test suite for all TCIS grade boundaries and GPA
├── firestore.rules         # Security rules enforcing active role-based Firestore access
└── README.md               # Setup and deployment documentation
```

---

## 3. Instant Testing & Offline / Demo Mode

The system includes a smart, zero-friction **Local Demo Layer**:
* When opened directly in any browser (even without an active Firebase project or internet connection), the application detects the placeholder keys in `js/firebase.js` and automatically activates the local demo store.
* **Preloaded Demo Accounts**:
  * **Administrator**: `admin@tcis.edu` &bull; Password: `Admin123!`
  * **Teacher**: `teacher@tcis.edu` &bull; Password: `Teacher123!`
* Both accounts can be populated with one click on the login screen via the **Admin Demo** and **Teacher Demo** quick-fill buttons.
* Preloaded with sample students in Year 7, Year 10, Year 11, and Year 12 with realistic assessment data.

---

## 4. Setting Up Live Firebase

Follow these steps to connect the application to your own production Firebase project:

### Step 4.1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `TCIS-Results-System`, and follow the prompts (Google Analytics can be disabled).

### Step 4.2: Enable Email/Password Authentication
1. In your Firebase project console, navigate to **Build** &rarr; **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.
5. *Note: Leave "Email link (passwordless sign-in)" disabled.*

### Step 4.3: Create Cloud Firestore Database
1. In the sidebar, navigate to **Build** &rarr; **Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your users (e.g. `europe-west1` or `us-central1`).
4. Select **Start in production mode** and click **Create**.

### Step 4.4: Deploy Firestore Security Rules
1. In the Firestore Database section, open the **Rules** tab.
2. Replace all existing contents with the code from [`firestore.rules`](file:///c:/Users/Dell/Desktop/EXAMINATION%20RESULTS/firestore.rules):
3. Click **Publish**.

### Step 4.5: Obtain Firebase Web Configuration
1. In the Firebase Console, click the gear icon &rarr; **Project settings**.
2. In the **General** tab, scroll down to **Your apps** and click the **Web icon (`</>`)**.
3. Register the app name (e.g., `TCIS Web Portal`).
4. The configuration is already saved into [`js/firebase.js`](file:///c:/Users/Dell/Desktop/EXAMINATION%20RESULTS/js/firebase.js):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAkegcM2lxooOBxachwiVZTD3CrnU57Y5w",
  authDomain: "tcis-b5133.firebaseapp.com",
  projectId: "tcis-b5133",
  storageBucket: "tcis-b5133.firebasestorage.app",
  messagingSenderId: "178505069120",
  appId: "1:178505069120:web:128d76eb717b1748a965a5",
  measurementId: "G-PP7DFQNR1G"
};
```

---

## 5. Secure Provisioning of the Initial Administrator

To prevent public self-registration while ensuring no administrative passwords are hardcoded:

1. In the Firebase Console, go to **Authentication** &rarr; **Users** &rarr; **Add user**.
2. Enter your primary administrator email (e.g. `headmaster@tcis.edu`) and a strong temporary password.
3. Copy the generated **User UID** string.
4. Go to **Firestore Database** &rarr; **Start collection**:
   * Collection ID: `users`
   * Document ID: *(Paste the User UID copied from Authentication)*
   * Fields:
     * `email` (string): `headmaster@tcis.edu`
     * `displayName` (string): `Headmaster Dr. E. Mensah`
     * `role` (string): `admin`
     * `active` (boolean): `true`
     * `createdAt` (string): `2026-10-13T12:00:00Z`
5. Click **Save**.
6. The administrator can now log in at `index.html`. Once logged in, the administrator can create all subsequent teachers and administrators directly through the **Settings &rarr; Staff Account Management** interface without touching the Firebase console.

---

## 6. Official TCIS Grading Scale & Formulae

The system implements the exact official TCIS scale:

| Grade | Percentage Range | Grade Point | Description |
| :--- | :--- | :---: | :--- |
| **A\*** | 95.00% – 100.00% | 4.00 | Distinction |
| **A** | 80.00% – below 95.00% | 3.67 | Excellent |
| **B+** | 75.00% – below 80.00% | 3.33 | Very Good |
| **B** | 70.00% – below 75.00% | 3.00 | Good |
| **C+** | 65.00% – below 70.00% | 2.67 | Average |
| **C** | 60.00% – below 65.00% | 2.33 | Pass |
| **D** | 50.00% – below 60.00% | 2.00 | Credit |
| **E** | 45.00% – below 50.00% | 1.67 | Failed |
| **F** | 35.00% – below 45.00% | 1.00 | Failed |
| **Ungraded** | 0.00% – below 35.00% | 0.00 | Ungraded |

### Key Academic Rules:
1. **Unrounded Grade Determination**: The grade is calculated directly against the unrounded percentage (e.g. $79.99\%$ yields **B+**, not **A**).
2. **5-Category Weighting**:
   * Exercise: $10\%$
   * Homework: $10\%$
   * Progressive Test: $20\%$
   * Mid-Term Examination: $20\%$
   * End-of-Term Examination: $40\%$
   $$\text{Final Subject Score} = \sum (\text{Category Percentage} \times \text{Weight})$$
3. **Incomplete Assessments**: If any required category is left blank or unrecorded, the subject is flagged as **Incomplete**. It is never treated as zero, and no official grade point is assigned.
4. **Term GPA Formula**:
   $$\text{Term GPA} = \frac{\sum \text{Grade Points of Completed Subjects}}{\text{Total Number of Completed Subjects}}$$
   * Incomplete subjects are excluded from the GPA computation and reported separately.

---

## 7. How to Test & Verify

### Running Automated Test Suite:
Run the unit test runner in terminal or PowerShell:
```powershell
node "test/grading_test.js"
```
All 28 boundary tests, weighted calculations, and GPA calculations will verify with zero failures.

### In-Browser Testing:
1. Open `index.html` in Chrome, Edge, Firefox, or Safari.
2. Click **Admin Demo** and sign in.
3. Navigate to **Students**: Add a new student, verify duplicate admission number warning, or search by name.
4. Navigate to **Enter Results**: Select Year Group, Class, and Student. Enter marks across Exercise, Homework, Progressive Test, Mid-Term, and End-of-Term. Verify that the score badges update live.
5. Navigate to **Generate Reports**: Select a student to preview their terminal report. Click **Download PDF** for the official A4 document or **Bulk Class Export (ZIP)** to download all class reports packaged in a single ZIP.
6. Open **Settings** (Admin only): Adjust category weights and confirm that the system enforces the $100\%$ sum validation.

---

## 8. Deployment Options

Because this is a pure client-side application with zero backend server dependencies, it can be hosted on any static hosting platform:

### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project, set public directory to current folder, do not configure as SPA rewrite
firebase deploy --only hosting
```

### Option B: GitHub Pages
1. Push this directory to a GitHub repository.
2. In repository settings, navigate to **Pages** and choose the `main` branch.

### Option C: Netlify / Vercel
Simply drag and drop the project folder directly into the Netlify dashboard.
