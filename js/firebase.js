/**
 * TCIS Student Results and Report System
 * js/firebase.js - Firebase Initialization & Lightweight Data Layer
 */

// ==========================================
// 1. FIREBASE CONFIGURATION
// Configured for project: tcis-b5133
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAkegcM2lxooOBxachwiVZTD3CrnU57Y5w",
  authDomain: "tcis-b5133.firebaseapp.com",
  projectId: "tcis-b5133",
  storageBucket: "tcis-b5133.firebasestorage.app",
  messagingSenderId: "178505069120",
  appId: "1:178505069120:web:128d76eb717b1748a965a5",
  measurementId: "G-PP7DFQNR1G"
};

// Check if credentials are placeholders
const isConfigPlaceholder = (
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === "YOUR_FIREBASE_API_KEY" ||
  firebaseConfig.apiKey.includes("YOUR_")
);

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let isLiveFirebase = false;

// Attempt Firebase initialization if SDK is loaded and credentials are set
try {
  if (typeof firebase !== 'undefined' && !isConfigPlaceholder) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
    isLiveFirebase = true;
    console.log("TCIS: Firebase initialized in LIVE mode for project: " + firebaseConfig.projectId);
  }
} catch (err) {
  console.error("TCIS: Firebase Live initialization error:", err);
  isLiveFirebase = false;
}

// ==========================================
// 2. DEFAULT CONFIGURATION AND SUBJECT CATALOG TEMPLATES
// ==========================================
const DEFAULT_SETTINGS = {
  schoolName: "Temple Christian International School",
  schoolLogo: "tcis-logo.png", // Can store base64 or image URL
  schoolAddress: "P.O. Box CT 1234, Cantonments, Accra, Ghana",
  contactDetails: "Tel: +233 30 277 8899 | Email: info@tcis.edu.gh | Web: www.tcis.edu.gh",
  schoolMotto: "Excellence, Integrity and Christian Leadership",
  defaultAcademicYear: "2025/2026",
  defaultTerm: "Term 1",
  academicYears: ["2024/2025", "2025/2026", "2026/2027"],
  headteacherName: "Dr. Emmanuel Mensah (Headmaster)",
  reportFooter: "Official Terminal Report - Temple Christian International School. Any alteration invalidates this document.",
  categoryWeights: {
    exercise: 10,
    homework: 10,
    progressiveTest: 20,
    midTerm: 20,
    endOfTerm: 40
  }
};

const DEFAULT_SUBJECTS = [
  {
    "id": "subj_eng",
    "name": "English Language",
    "code": "ENG",
    "category": "Year 7-13",
    "department": "Languages",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_math",
    "name": "Mathematics",
    "code": "MATH",
    "category": "Year 7-9",
    "department": "Mathematics",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9"
    ]
  },
  {
    "id": "subj_combined_sci",
    "name": "Combined Science",
    "code": "CSCI",
    "category": "Year 7-9",
    "department": "Sciences",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9"
    ]
  },
  {
    "id": "subj_french",
    "name": "French",
    "code": "FREN",
    "category": "Year 7-13",
    "department": "Languages",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_ict",
    "name": "Information & Communication Technology",
    "code": "ICT",
    "category": "Year 7-11",
    "department": "Information Technology",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9",
      "Year 10",
      "Year 11"
    ]
  },
  {
    "id": "subj_lit",
    "name": "Literature",
    "code": "LIT",
    "category": "Year 7-13",
    "department": "Languages",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_art_craft",
    "name": "Art & Craft",
    "code": "ART",
    "category": "Year 7-9",
    "department": "Creative Arts",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9"
    ]
  },
  {
    "id": "subj_global_persp",
    "name": "Global Perspectives",
    "code": "GP",
    "category": "Year 7-9",
    "department": "Humanities",
    "yearGroups": [
      "Year 7",
      "Year 8",
      "Year 9"
    ]
  },
  {
    "id": "subj_econ",
    "name": "Economics",
    "code": "ECON",
    "category": "Year 9-13",
    "department": "Business Studies",
    "yearGroups": [
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_acct",
    "name": "Accounting",
    "code": "ACCT",
    "category": "Year 9-13",
    "department": "Business Studies",
    "yearGroups": [
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_bus",
    "name": "Business Studies",
    "code": "BUS",
    "category": "Year 9-13",
    "department": "Business Studies",
    "yearGroups": [
      "Year 9",
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_ext_math",
    "name": "Extended Mathematics",
    "code": "EMATH",
    "category": "Year 10-11",
    "department": "Mathematics",
    "yearGroups": [
      "Year 10",
      "Year 11"
    ]
  },
  {
    "id": "subj_coord_sci",
    "name": "Coordinated Science",
    "code": "CDSCI",
    "category": "Year 10-11",
    "department": "Sciences",
    "yearGroups": [
      "Year 10",
      "Year 11"
    ]
  },
  {
    "id": "subj_art_design",
    "name": "Art and Design",
    "code": "ARTD",
    "category": "Year 10-13",
    "department": "Creative Arts",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_add_math",
    "name": "Add Mathematics",
    "code": "AMATH",
    "category": "Year 10-11",
    "department": "Mathematics",
    "yearGroups": [
      "Year 10",
      "Year 11"
    ]
  },
  {
    "id": "subj_chem",
    "name": "Chemistry",
    "code": "CHEM",
    "category": "Year 10-13",
    "department": "Sciences",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_phy",
    "name": "Physics",
    "code": "PHY",
    "category": "Year 10-13",
    "department": "Sciences",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_bio",
    "name": "Biology",
    "code": "BIO",
    "category": "Year 10-13",
    "department": "Sciences",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_hist",
    "name": "History",
    "code": "HIST",
    "category": "Year 10-13",
    "department": "Humanities",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_soc",
    "name": "Sociology",
    "code": "SOC",
    "category": "Year 10-13",
    "department": "Humanities",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_geog",
    "name": "Geography",
    "code": "GEOG",
    "category": "Year 10-13",
    "department": "Humanities",
    "yearGroups": [
      "Year 10",
      "Year 11",
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_pure_math",
    "name": "Pure Mathematics",
    "code": "PMATH",
    "category": "Year 12-13",
    "department": "Mathematics",
    "yearGroups": [
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_stats1",
    "name": "Statistics 1",
    "code": "STAT1",
    "category": "Year 12-13",
    "department": "Mathematics",
    "yearGroups": [
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_it",
    "name": "Information Technology",
    "code": "IT",
    "category": "Year 12-13",
    "department": "Information Technology",
    "yearGroups": [
      "Year 12",
      "Year 13"
    ]
  },
  {
    "id": "subj_mech1",
    "name": "Mechanics-1",
    "code": "MECH1",
    "category": "Year 12-13",
    "department": "Mathematics",
    "yearGroups": [
      "Year 12",
      "Year 13"
    ]
  }
];

const SEED_USERS = {
  "admin_uid_001": {
    uid: "admin_uid_001",
    email: "admin@tcis.edu",
    displayName: "Admin Administrator",
    role: "admin",
    active: true,
    createdAt: new Date().toISOString()
  },
  "teacher_uid_002": {
    uid: "teacher_uid_002",
    email: "teacher@tcis.edu",
    displayName: "Mr. Kwesi Arthur (Senior Tutor)",
    role: "teacher",
    active: true,
    teachingAssignments: [
      {
        subjectName: "Information and Communication Technology (ICT)",
        yearGroup: "Year 10",
        className: "Year 10 Alpha"
      },
      {
        subjectName: "Computer Science",
        yearGroup: "Year 10",
        className: "Year 10 Alpha"
      }
    ],
    createdAt: new Date().toISOString()
  }
};

const SEED_STUDENTS = [
  {
    "id": "std_001",
    "admissionNumber": "TCIS/2026/001",
    "fullName": "Adeline Adjokatse",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_002",
    "admissionNumber": "TCIS/2026/002",
    "fullName": "Divine Ezeh",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_003",
    "admissionNumber": "TCIS/2026/003",
    "fullName": "Flynt Nii Aryee Okine",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_004",
    "admissionNumber": "TCIS/2026/004",
    "fullName": "Gabrielle Awuradjoa Pomaa Badu",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_005",
    "admissionNumber": "TCIS/2026/005",
    "fullName": "Gillian Naa Shika Narh",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_006",
    "admissionNumber": "TCIS/2026/006",
    "fullName": "Golda Dogbatse",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_007",
    "admissionNumber": "TCIS/2026/007",
    "fullName": "Jerome Bediako - Poku",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_008",
    "admissionNumber": "TCIS/2026/008",
    "fullName": "Jessica Esther Sekyi",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_009",
    "admissionNumber": "TCIS/2026/009",
    "fullName": "Kandice Elizabeth Nana Araba Nyankom Addo",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_010",
    "admissionNumber": "TCIS/2026/010",
    "fullName": "Kayla-Palmer Boadiwaa Asamoah",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_011",
    "admissionNumber": "TCIS/2026/011",
    "fullName": "Kofi Bannerman",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_012",
    "admissionNumber": "TCIS/2026/012",
    "fullName": "Kofi Quayson",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_013",
    "admissionNumber": "TCIS/2026/013",
    "fullName": "Mannel Timothy Abekah",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_014",
    "admissionNumber": "TCIS/2026/014",
    "fullName": "Nana Yaw Nusianu Bediako",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_015",
    "admissionNumber": "TCIS/2026/015",
    "fullName": "Nhyiraba Esi Afedzi Hayford",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_016",
    "admissionNumber": "TCIS/2026/016",
    "fullName": "Nyameye Abena Manfoa Koramoah",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_017",
    "admissionNumber": "TCIS/2026/017",
    "fullName": "Tayviah Edlyn Akpene",
    "yearGroup": "Year 7",
    "className": "Year 7",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_018",
    "admissionNumber": "TCIS/2026/018",
    "fullName": "Angelina Oppong",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_019",
    "admissionNumber": "TCIS/2026/019",
    "fullName": "Ayeyi Forson",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_020",
    "admissionNumber": "TCIS/2026/020",
    "fullName": "Brandon N.B. Gaisie",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_021",
    "admissionNumber": "TCIS/2026/021",
    "fullName": "Casey Bediako-Poku",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_022",
    "admissionNumber": "TCIS/2026/022",
    "fullName": "Duke Troy Appah Danquah",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_023",
    "admissionNumber": "TCIS/2026/023",
    "fullName": "Gideon Titi Okyere",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_024",
    "admissionNumber": "TCIS/2026/024",
    "fullName": "Inaaya Kasim Ibrahim-Khash",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_025",
    "admissionNumber": "TCIS/2026/025",
    "fullName": "Jaleesa Arthur",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_026",
    "admissionNumber": "TCIS/2026/026",
    "fullName": "Jasmine Nyarko",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_027",
    "admissionNumber": "TCIS/2026/027",
    "fullName": "Jason Klutse",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.226Z",
    "updatedAt": "2026-10-13T23:13:40.226Z"
  },
  {
    "id": "std_028",
    "admissionNumber": "TCIS/2026/028",
    "fullName": "Jessica Kafui Amenya",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_029",
    "admissionNumber": "TCIS/2026/029",
    "fullName": "Kevin Sarfo Asare",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_030",
    "admissionNumber": "TCIS/2026/030",
    "fullName": "Maame Akua S. Osei-Anim",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_031",
    "admissionNumber": "TCIS/2026/031",
    "fullName": "Marcel Asenso",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_032",
    "admissionNumber": "TCIS/2026/032",
    "fullName": "Marvin Genego",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_033",
    "admissionNumber": "TCIS/2026/033",
    "fullName": "Naveed Sampah Mahama",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_034",
    "admissionNumber": "TCIS/2026/034",
    "fullName": "Nhyira Bimpomaa Ofori-Atta",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_035",
    "admissionNumber": "TCIS/2026/035",
    "fullName": "Olivia Azilah",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_036",
    "admissionNumber": "TCIS/2026/036",
    "fullName": "Paa Kwadwo Odame Antwi",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_037",
    "admissionNumber": "TCIS/2026/037",
    "fullName": "Parousia N. Bentum",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_038",
    "admissionNumber": "TCIS/2026/038",
    "fullName": "Pearl Agyei Sarbeng",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_039",
    "admissionNumber": "TCIS/2026/039",
    "fullName": "Sundiata Tamid Issaka",
    "yearGroup": "Year 8",
    "className": "Year 8",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_040",
    "admissionNumber": "TCIS/2026/040",
    "fullName": "Akosua Kane Acheampong",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_041",
    "admissionNumber": "TCIS/2026/041",
    "fullName": "Bill Boss Baiden",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_042",
    "admissionNumber": "TCIS/2026/042",
    "fullName": "Carolla Nyameye-Agyeiwah Osei-Agyekum",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_043",
    "admissionNumber": "TCIS/2026/043",
    "fullName": "Catherine Williams",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_044",
    "admissionNumber": "TCIS/2026/044",
    "fullName": "Christen Papa Yaw Darko Gyasi",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_045",
    "admissionNumber": "TCIS/2026/045",
    "fullName": "David Kwasi-Atta Antwi",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_046",
    "admissionNumber": "TCIS/2026/046",
    "fullName": "Edward Nii Addo Coleman",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_047",
    "admissionNumber": "TCIS/2026/047",
    "fullName": "Eliana Arthur",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_048",
    "admissionNumber": "TCIS/2026/048",
    "fullName": "Emmanuel Malike Bimpeh",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_049",
    "admissionNumber": "TCIS/2026/049",
    "fullName": "Ian Genego",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_050",
    "admissionNumber": "TCIS/2026/050",
    "fullName": "Jeremy John Jenkins",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_051",
    "admissionNumber": "TCIS/2026/051",
    "fullName": "Jornada Lamptey",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_052",
    "admissionNumber": "TCIS/2026/052",
    "fullName": "Judith Dede Narteh",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_053",
    "admissionNumber": "TCIS/2026/053",
    "fullName": "Maame Yaa Antwi",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_054",
    "admissionNumber": "TCIS/2026/054",
    "fullName": "Malachi Atta-Krah",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_055",
    "admissionNumber": "TCIS/2026/055",
    "fullName": "Maame Adwoa Ohemaa Adjei",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_056",
    "admissionNumber": "TCIS/2026/056",
    "fullName": "Nana Kofi Twum Adjei-Ampofo",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_057",
    "admissionNumber": "TCIS/2026/057",
    "fullName": "Nhyira Hayford",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_058",
    "admissionNumber": "TCIS/2026/058",
    "fullName": "Prince Enaifoghe",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_059",
    "admissionNumber": "TCIS/2026/059",
    "fullName": "Roy N.A. Okine",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_060",
    "admissionNumber": "TCIS/2026/060",
    "fullName": "Senam Marie Dogbe",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_061",
    "admissionNumber": "TCIS/2026/061",
    "fullName": "Sessime Monique Awo Fesu",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_062",
    "admissionNumber": "TCIS/2026/062",
    "fullName": "Ziva Eyako Adzo Horgli",
    "yearGroup": "Year 9",
    "className": "Year 9",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Mathematics",
      "Combined Science",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Art & Craft",
      "Global Perspectives",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_063",
    "admissionNumber": "TCIS/2026/063",
    "fullName": "Abena Asor Opoku",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_064",
    "admissionNumber": "TCIS/2026/064",
    "fullName": "Anthony Felix Arthur",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "French",
      "English Language",
      "Extended Mathematics",
      "Information & Communication Technology",
      "Biology",
      "Chemistry",
      "Physics",
      "Add Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:46.798Z"
  },
  {
    "id": "std_065",
    "admissionNumber": "TCIS/2026/065",
    "fullName": "Arielle Ewurama Asantewaa Barnafo",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Art and Design",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_066",
    "admissionNumber": "TCIS/2026/066",
    "fullName": "Bessie E. Ali",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_067",
    "admissionNumber": "TCIS/2026/067",
    "fullName": "Bethelle Baaba Baiden",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "French",
      "Information & Communication Technology",
      "English Language",
      "Extended Mathematics",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_068",
    "admissionNumber": "TCIS/2026/068",
    "fullName": "Blessing Enaifoghe",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_069",
    "admissionNumber": "TCIS/2026/069",
    "fullName": "Caleb Bimpeh",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "French",
      "English Language",
      "Information & Communication Technology",
      "Extended Mathematics",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "Economics"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_070",
    "admissionNumber": "TCIS/2026/070",
    "fullName": "Calista E. Acolatse",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_071",
    "admissionNumber": "TCIS/2026/071",
    "fullName": "Carlisa Edumadzie",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_072",
    "admissionNumber": "TCIS/2026/072",
    "fullName": "Casey Afi Kuwornu",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Geography",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_073",
    "admissionNumber": "TCIS/2026/073",
    "fullName": "Cayla Kodua Addison",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Art and Design",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_074",
    "admissionNumber": "TCIS/2026/074",
    "fullName": "Charles Sarkodie Dwumfuor Williams",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "Extended Mathematics",
      "Economics",
      "Information & Communication Technology",
      "French",
      "English Language"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_075",
    "admissionNumber": "TCIS/2026/075",
    "fullName": "Colin Joseph Boye-Doku",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Economics",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "French",
      "Information & Communication Technology",
      "English Language",
      "Extended Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_076",
    "admissionNumber": "TCIS/2026/076",
    "fullName": "Daniel Kafui Kwabena Kudjoe",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Biology",
      "English Language",
      "Extended Mathematics",
      "Geography",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_077",
    "admissionNumber": "TCIS/2026/077",
    "fullName": "Ebube Counselor Ihejirika",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_078",
    "admissionNumber": "TCIS/2026/078",
    "fullName": "Elija Moore",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_079",
    "admissionNumber": "TCIS/2026/079",
    "fullName": "Elinam Kpesese",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_080",
    "admissionNumber": "TCIS/2026/080",
    "fullName": "Elisha Moore",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_081",
    "admissionNumber": "TCIS/2026/081",
    "fullName": "Emmanuella Okocha",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_082",
    "admissionNumber": "TCIS/2026/082",
    "fullName": "Esther Akosua Nyamekye Ulzen",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_083",
    "admissionNumber": "TCIS/2026/083",
    "fullName": "Gerald Badu",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_084",
    "admissionNumber": "TCIS/2026/084",
    "fullName": "Heulwynne Nketsia",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_085",
    "admissionNumber": "TCIS/2026/085",
    "fullName": "Iain Lamptey",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_086",
    "admissionNumber": "TCIS/2026/086",
    "fullName": "Ikeoluwa Angel Hassan",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Information & Communication Technology",
      "French",
      "English Language",
      "Physics",
      "Add Mathematics",
      "Extended Mathematics",
      "Chemistry"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_087",
    "admissionNumber": "TCIS/2026/087",
    "fullName": "Joella Maame Kowbiaba Amoah",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_088",
    "admissionNumber": "TCIS/2026/088",
    "fullName": "Josiah Tsekpo",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_089",
    "admissionNumber": "TCIS/2026/089",
    "fullName": "Joy - Michelle Teye - Murdock",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Biology",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_090",
    "admissionNumber": "TCIS/2026/090",
    "fullName": "Kwadwo Antwi Owusu Amrado",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_091",
    "admissionNumber": "TCIS/2026/091",
    "fullName": "Kwame Addo-Ntim Oppong-Ntim",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_092",
    "admissionNumber": "TCIS/2026/092",
    "fullName": "Kyla Essilfie",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_093",
    "admissionNumber": "TCIS/2026/093",
    "fullName": "Kymia Molly E.Y. Gligbe",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_094",
    "admissionNumber": "TCIS/2026/094",
    "fullName": "Lillian M. Williams",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_095",
    "admissionNumber": "TCIS/2026/095",
    "fullName": "Michelle Mensah-Onumah",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_096",
    "admissionNumber": "TCIS/2026/096",
    "fullName": "Nana Danso Kissiedu",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "Geography",
      "Economics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_097",
    "admissionNumber": "TCIS/2026/097",
    "fullName": "Nana Kwadwo Owusu Adom Acheampong",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_098",
    "admissionNumber": "TCIS/2026/098",
    "fullName": "Nana Kwame Adjei",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_099",
    "admissionNumber": "TCIS/2026/099",
    "fullName": "Nanette Etornam Quarshie",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_100",
    "admissionNumber": "TCIS/2026/100",
    "fullName": "Neriah Adzakloe",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_101",
    "admissionNumber": "TCIS/2026/101",
    "fullName": "Nutifafa Kwame Anani",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_102",
    "admissionNumber": "TCIS/2026/102",
    "fullName": "Nuerki Tamatey Nuer",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_103",
    "admissionNumber": "TCIS/2026/103",
    "fullName": "Paul Kweku Smart",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_104",
    "admissionNumber": "TCIS/2026/104",
    "fullName": "Percival Annan",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_105",
    "admissionNumber": "TCIS/2026/105",
    "fullName": "Persia Kiiki Narh",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Economics",
      "Geography",
      "Chemistry",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_106",
    "admissionNumber": "TCIS/2026/106",
    "fullName": "Phoebe Ewurakua Eshun",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_107",
    "admissionNumber": "TCIS/2026/107",
    "fullName": "Renata Ronny Dzifa Fiator",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_108",
    "admissionNumber": "TCIS/2026/108",
    "fullName": "Selorm Caleb Kwabla Kpodoh",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Physics",
      "Biology",
      "Chemistry",
      "Economics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_109",
    "admissionNumber": "TCIS/2026/109",
    "fullName": "Selorm Silas Kwaku Segbawu",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_110",
    "admissionNumber": "TCIS/2026/110",
    "fullName": "Shamsiyah Ibrahim Nyameasem",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "French",
      "Information & Communication Technology",
      "English Language",
      "Extended Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_111",
    "admissionNumber": "TCIS/2026/111",
    "fullName": "Sunneycci Kwame Assan",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Physics",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_112",
    "admissionNumber": "TCIS/2026/112",
    "fullName": "Utein Daan Kuna Lardy Awudu",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_113",
    "admissionNumber": "TCIS/2026/113",
    "fullName": "Whitney Oduraa Sarpong",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Chemistry",
      "Physics",
      "Extended Mathematics",
      "English Language",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_114",
    "admissionNumber": "TCIS/2026/114",
    "fullName": "Yaeshawn Kwame Asamoah Gyimah",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Biology",
      "Physics",
      "Add Mathematics",
      "Geography",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_115",
    "admissionNumber": "TCIS/2026/115",
    "fullName": "Yvana Korkomaz",
    "yearGroup": "Year 10",
    "className": "Year 10",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Geography",
      "Chemistry",
      "Biology",
      "Add Mathematics",
      "English Language",
      "French",
      "Extended Mathematics",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_116",
    "admissionNumber": "TCIS/2026/116",
    "fullName": "Adiel N.S. Nti",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_117",
    "admissionNumber": "TCIS/2026/117",
    "fullName": "Afia Yawson Asare Bediako",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_118",
    "admissionNumber": "TCIS/2026/118",
    "fullName": "Annata A.N. Augustino",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Literature",
      "Economics",
      "Extended Mathematics",
      "Geography",
      "Coordinated Science",
      "English Language",
      "Information & Communication Technology",
      "French"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_119",
    "admissionNumber": "TCIS/2026/119",
    "fullName": "Aseye Atimpo",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_120",
    "admissionNumber": "TCIS/2026/120",
    "fullName": "Basilisa N.E. Afang",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Economics",
      "Business Studies",
      "Accounting",
      "Extended Mathematics",
      "Coordinated Science",
      "French",
      "English Language",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_121",
    "admissionNumber": "TCIS/2026/121",
    "fullName": "Bohyeba K. Fordjour",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_122",
    "admissionNumber": "TCIS/2026/122",
    "fullName": "Caleb I. Nuhu",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Coordinated Science",
      "French",
      "Information & Communication Technology",
      "Economics",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_123",
    "admissionNumber": "TCIS/2026/123",
    "fullName": "Cassandra Fafa Dzisenu",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_124",
    "admissionNumber": "TCIS/2026/124",
    "fullName": "Christine Benedict",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_125",
    "admissionNumber": "TCIS/2026/125",
    "fullName": "Christodia Dedo Odjidja-Tetteh",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_126",
    "admissionNumber": "TCIS/2026/126",
    "fullName": "Danielle Lois Baidoo",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_127",
    "admissionNumber": "TCIS/2026/127",
    "fullName": "Desiree Oreoluwa Olatunji",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_128",
    "admissionNumber": "TCIS/2026/128",
    "fullName": "Efua Akowuah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Economics",
      "Geography",
      "Coordinated Science",
      "Extended Mathematics",
      "English Language",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_129",
    "admissionNumber": "TCIS/2026/129",
    "fullName": "Enuonyam K. Owusu",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Geography",
      "Economics",
      "Information & Communication Technology",
      "Coordinated Science",
      "Extended Mathematics",
      "French",
      "English Language"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_130",
    "admissionNumber": "TCIS/2026/130",
    "fullName": "Enyonam J.B. Kpesese",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_131",
    "admissionNumber": "TCIS/2026/131",
    "fullName": "Eric Abiti",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_132",
    "admissionNumber": "TCIS/2026/132",
    "fullName": "Eva Boye-Ampah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_133",
    "admissionNumber": "TCIS/2026/133",
    "fullName": "Ewurama Yeboah Osei-Anim",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Economics",
      "Accounting",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Coordinated Science",
      "Extended Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_134",
    "admissionNumber": "TCIS/2026/134",
    "fullName": "Hicky Akua Forjoe",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_135",
    "admissionNumber": "TCIS/2026/135",
    "fullName": "Imani Annewetey",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_136",
    "admissionNumber": "TCIS/2026/136",
    "fullName": "Isabel Fafali Esi Amenya",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "French",
      "Economics",
      "Business Studies",
      "Accounting",
      "Information & Communication Technology",
      "Coordinated Science",
      "Art and Design"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_137",
    "admissionNumber": "TCIS/2026/137",
    "fullName": "Israel Atta-Krah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Coordinated Science",
      "Economics",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_138",
    "admissionNumber": "TCIS/2026/138",
    "fullName": "Jason Adjei Kyere-Duodu",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "Coordinated Science",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Economics",
      "Business Studies",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_139",
    "admissionNumber": "TCIS/2026/139",
    "fullName": "Jason Agyei Sarbeng",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "Coordinated Science",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Economics",
      "Accounting",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_140",
    "admissionNumber": "TCIS/2026/140",
    "fullName": "Jayden Essilfie",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_141",
    "admissionNumber": "TCIS/2026/141",
    "fullName": "Jayden K. Sagoe",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_142",
    "admissionNumber": "TCIS/2026/142",
    "fullName": "Jeanine Araba Ketua Amoah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_143",
    "admissionNumber": "TCIS/2026/143",
    "fullName": "Jennifer Amuah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_144",
    "admissionNumber": "TCIS/2026/144",
    "fullName": "Jerusha Nyarko",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_145",
    "admissionNumber": "TCIS/2026/145",
    "fullName": "Joel Andrew Amuah",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_146",
    "admissionNumber": "TCIS/2026/146",
    "fullName": "Joel S.K. Geraldo",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_147",
    "admissionNumber": "TCIS/2026/147",
    "fullName": "Jordan Narh",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_148",
    "admissionNumber": "TCIS/2026/148",
    "fullName": "Jorge M.O.E. Afang",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Coordinated Science",
      "French",
      "Information & Communication Technology",
      "Economics",
      "Business Studies",
      "Accounting"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_149",
    "admissionNumber": "TCIS/2026/149",
    "fullName": "Joseph Kelly Nyamekye Allen",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Business Studies",
      "Economics",
      "Accounting",
      "Information & Communication Technology",
      "French"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_150",
    "admissionNumber": "TCIS/2026/150",
    "fullName": "Jude Nunya Aikins",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Information & Communication Technology",
      "French",
      "Economics",
      "Geography",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_151",
    "admissionNumber": "TCIS/2026/151",
    "fullName": "Marvelyn Nhyirama Amakyewa Sam",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_152",
    "admissionNumber": "TCIS/2026/152",
    "fullName": "Michael Fiifi Eshun",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_153",
    "admissionNumber": "TCIS/2026/153",
    "fullName": "Michelle N.A.K. Orchill",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Information & Communication Technology",
      "Coordinated Science",
      "French",
      "Geography",
      "Economics",
      "Sociology"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_154",
    "admissionNumber": "TCIS/2026/154",
    "fullName": "Naana Atta-Krah Biney",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_155",
    "admissionNumber": "TCIS/2026/155",
    "fullName": "Nana Ayisha Seidu",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_156",
    "admissionNumber": "TCIS/2026/156",
    "fullName": "Nana Boatemaa Danquah-Boateng",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Coordinated Science",
      "Economics",
      "Literature",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_157",
    "admissionNumber": "TCIS/2026/157",
    "fullName": "Nana Nyarkoa Antwi",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Economics",
      "Add Mathematics",
      "English Language",
      "Coordinated Science",
      "French",
      "Information & Communication Technology",
      "Extended Mathematics",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_158",
    "admissionNumber": "TCIS/2026/158",
    "fullName": "Nathan Joel Tetteh",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_159",
    "admissionNumber": "TCIS/2026/159",
    "fullName": "Nii Addo Calys-Tagoe",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Economics",
      "Accounting",
      "Extended Mathematics",
      "French",
      "Information & Communication Technology",
      "Coordinated Science",
      "English Language"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_160",
    "admissionNumber": "TCIS/2026/160",
    "fullName": "Nkunim Atta Dadzie Mends",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Coordinated Science",
      "French",
      "Information & Communication Technology",
      "Business Studies",
      "Economics",
      "Accounting"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_161",
    "admissionNumber": "TCIS/2026/161",
    "fullName": "Obengfuor Nana Aduhene Kuranche",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.227Z",
    "updatedAt": "2026-10-13T23:13:40.227Z"
  },
  {
    "id": "std_162",
    "admissionNumber": "TCIS/2026/162",
    "fullName": "Pippa Nunana Ekpe",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_163",
    "admissionNumber": "TCIS/2026/163",
    "fullName": "Princess Selikem Prent",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Economics",
      "Accounting",
      "English Language",
      "Coordinated Science",
      "Extended Mathematics",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_164",
    "admissionNumber": "TCIS/2026/164",
    "fullName": "Richard Egboro",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Coordinated Science",
      "Accounting",
      "Economics",
      "Business Studies",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_165",
    "admissionNumber": "TCIS/2026/165",
    "fullName": "Roshelle Fasoranti",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_166",
    "admissionNumber": "TCIS/2026/166",
    "fullName": "Rozelle Fasoranti",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_167",
    "admissionNumber": "TCIS/2026/167",
    "fullName": "Ruweid Abdul Mu-Akhir",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_168",
    "admissionNumber": "TCIS/2026/168",
    "fullName": "Salem Winloma Abeliwine",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "French",
      "Information & Communication Technology",
      "Coordinated Science",
      "Economics",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_169",
    "admissionNumber": "TCIS/2026/169",
    "fullName": "Samuel N. Bentum",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Coordinated Science",
      "Information & Communication Technology",
      "French",
      "Accounting",
      "Economics",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_170",
    "admissionNumber": "TCIS/2026/170",
    "fullName": "Theron Eliklim John Akumatey-Tetteh",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Information & Communication Technology",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Extended Mathematics",
      "Coordinated Science",
      "Art and Design",
      "Add Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_171",
    "admissionNumber": "TCIS/2026/171",
    "fullName": "Yawa Xolali Yovogan",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Extended Mathematics",
      "English Language",
      "Economics",
      "Coordinated Science",
      "Literature",
      "Geography",
      "French",
      "Information & Communication Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_172",
    "admissionNumber": "TCIS/2026/172",
    "fullName": "Zaneta C. Arthur",
    "yearGroup": "Year 11",
    "className": "Year 11",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Sociology",
      "Literature",
      "Art and Design",
      "French",
      "Information & Communication Technology",
      "English Language",
      "Coordinated Science",
      "Extended Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_173",
    "admissionNumber": "TCIS/2026/173",
    "fullName": "Amber-Leeza Fafa Yawa Ata",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_174",
    "admissionNumber": "TCIS/2026/174",
    "fullName": "Caleb Nii Odartey Addison",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_175",
    "admissionNumber": "TCIS/2026/175",
    "fullName": "Adjoa Mawena Addison",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_176",
    "admissionNumber": "TCIS/2026/176",
    "fullName": "Amy-Ann Elesi",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_177",
    "admissionNumber": "TCIS/2026/177",
    "fullName": "Andres Abedu - Kennedy",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_178",
    "admissionNumber": "TCIS/2026/178",
    "fullName": "Blessing Egboro",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_179",
    "admissionNumber": "TCIS/2026/179",
    "fullName": "Britney Baiswa Buxton",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_180",
    "admissionNumber": "TCIS/2026/180",
    "fullName": "Deborah Pinamang Antwi",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_181",
    "admissionNumber": "TCIS/2026/181",
    "fullName": "Daryl Fiifi Pentsil",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_182",
    "admissionNumber": "TCIS/2026/182",
    "fullName": "Edward Anthony Osei",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_183",
    "admissionNumber": "TCIS/2026/183",
    "fullName": "Eugenia Lartey",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_184",
    "admissionNumber": "TCIS/2026/184",
    "fullName": "Jason Adzakloe",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_185",
    "admissionNumber": "TCIS/2026/185",
    "fullName": "Jermain Gyamfi A. Kyeremeh",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_186",
    "admissionNumber": "TCIS/2026/186",
    "fullName": "Joshua Edem Dorleson",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_187",
    "admissionNumber": "TCIS/2026/187",
    "fullName": "Kaelem Kojo Kuhne",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_188",
    "admissionNumber": "TCIS/2026/188",
    "fullName": "Keziah Kissiwaa Edumadzie",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_189",
    "admissionNumber": "TCIS/2026/189",
    "fullName": "Kimberlyn Kromah",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_190",
    "admissionNumber": "TCIS/2026/190",
    "fullName": "Kirk Tamakloe",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_191",
    "admissionNumber": "TCIS/2026/191",
    "fullName": "Klenam Asante",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_192",
    "admissionNumber": "TCIS/2026/192",
    "fullName": "MacDamien Mawuko Kobla Segbawu",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_193",
    "admissionNumber": "TCIS/2026/193",
    "fullName": "Maame Ama Dansowaa Osae",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_194",
    "admissionNumber": "TCIS/2026/194",
    "fullName": "Maame Yaa Kissiwah Osae",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_195",
    "admissionNumber": "TCIS/2026/195",
    "fullName": "Melchizedek K.D Williams",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_196",
    "admissionNumber": "TCIS/2026/196",
    "fullName": "Michael Nana Yaw Oppong",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_197",
    "admissionNumber": "TCIS/2026/197",
    "fullName": "Micheal Louis Guerrieri",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_198",
    "admissionNumber": "TCIS/2026/198",
    "fullName": "Nana-Nhyira Ato Forson",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_199",
    "admissionNumber": "TCIS/2026/199",
    "fullName": "Ruweidatu Abdul Mu-Akhir",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_200",
    "admissionNumber": "TCIS/2026/200",
    "fullName": "Sebastian Williams",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_201",
    "admissionNumber": "TCIS/2026/201",
    "fullName": "Selorm Kimathi Dogbne",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_202",
    "admissionNumber": "TCIS/2026/202",
    "fullName": "Valerie Claret Ato-Sam",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_203",
    "admissionNumber": "TCIS/2026/203",
    "fullName": "Zoe Sefakor Borlu",
    "yearGroup": "Year 12",
    "className": "Year 12",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-13T23:13:40.228Z"
  },
  {
    "id": "std_204",
    "admissionNumber": "TCIS/2026/204",
    "fullName": "Aaron Asenso Addo",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Accounting",
      "Economics",
      "Information Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_205",
    "admissionNumber": "TCIS/2026/205",
    "fullName": "Afia Nyamedo Nwaya Famiah",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Information Technology",
      "English Language"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_206",
    "admissionNumber": "TCIS/2026/206",
    "fullName": "Allison E.A.A. Honugah",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "History",
      "Literature",
      "Economics",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_207",
    "admissionNumber": "TCIS/2026/207",
    "fullName": "Alvin Tamakloe",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Information Technology",
      "Accounting",
      "Economics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_208",
    "admissionNumber": "TCIS/2026/208",
    "fullName": "Alvine Hammond",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Information Technology",
      "Geography",
      "Physics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_209",
    "admissionNumber": "TCIS/2026/209",
    "fullName": "Anna Adjabeng",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Physics",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_210",
    "admissionNumber": "TCIS/2026/210",
    "fullName": "Anna Winyam Zefo Kere",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Physics",
      "Chemistry",
      "Statistics 1",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_211",
    "admissionNumber": "TCIS/2026/211",
    "fullName": "Bryan Adzakloe",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Geography",
      "Information Technology",
      "Economics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_212",
    "admissionNumber": "TCIS/2026/212",
    "fullName": "Bryanna Adjei-Sowatey",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Biology",
      "Chemistry"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_213",
    "admissionNumber": "TCIS/2026/213",
    "fullName": "Caleb S.K. Ireland",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Chemistry",
      "Information Technology",
      "Pure Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_214",
    "admissionNumber": "TCIS/2026/214",
    "fullName": "Cyril Edem Temda",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "History",
      "Information Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_215",
    "admissionNumber": "TCIS/2026/215",
    "fullName": "David Amable",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Physics",
      "Chemistry"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_216",
    "admissionNumber": "TCIS/2026/216",
    "fullName": "Dionne McCaesar",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Information Technology",
      "French",
      "Economics",
      "Literature"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_217",
    "admissionNumber": "TCIS/2026/217",
    "fullName": "Einstein Harrison",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Accounting",
      "Business Studies",
      "Economics",
      "Pure Mathematics"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_218",
    "admissionNumber": "TCIS/2026/218",
    "fullName": "Franklin Okoronkwo",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Economics",
      "Information Technology",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_219",
    "admissionNumber": "TCIS/2026/219",
    "fullName": "Gabriel Eshun",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Chemistry",
      "Physics",
      "Statistics 1",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_220",
    "admissionNumber": "TCIS/2026/220",
    "fullName": "Jimil Brobbey",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Physics",
      "Chemistry"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_221",
    "admissionNumber": "TCIS/2026/221",
    "fullName": "Kwaku Owusu Boateng",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Chemistry",
      "Physics",
      "Biology",
      "Statistics 1",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_222",
    "admissionNumber": "TCIS/2026/222",
    "fullName": "Martina Mawudoku",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Literature",
      "Information Technology",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_223",
    "admissionNumber": "TCIS/2026/223",
    "fullName": "Michael Mawuli Abiti",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Physics",
      "English Language",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_224",
    "admissionNumber": "TCIS/2026/224",
    "fullName": "Michelle Eyram Temda",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Information Technology",
      "Business Studies",
      "Sociology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_225",
    "admissionNumber": "TCIS/2026/225",
    "fullName": "Naa Aku Abrahams",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Physics",
      "Information Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_226",
    "admissionNumber": "TCIS/2026/226",
    "fullName": "Nali Haba Zulaiha",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Sociology",
      "Literature",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_227",
    "admissionNumber": "TCIS/2026/227",
    "fullName": "Nana Kwabena Afreh",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Art and Design",
      "Geography"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_228",
    "admissionNumber": "TCIS/2026/228",
    "fullName": "Nana Kwaku Darko",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "Business Studies",
      "History"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_229",
    "admissionNumber": "TCIS/2026/229",
    "fullName": "Natasha Mensah-Onumah",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Literature",
      "Information Technology",
      "Business Studies"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_230",
    "admissionNumber": "TCIS/2026/230",
    "fullName": "Papa Afriyie B. Akyeampong",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Sociology",
      "Geography",
      "History"
    ],
    "createdAt": "2026-10-13T23:13:40.228Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_231",
    "admissionNumber": "TCIS/2026/231",
    "fullName": "Petra-Josie Kuwornu",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "English Language",
      "French",
      "Literature",
      "Economics",
      "Accounting",
      "Business Studies",
      "Art and Design",
      "Chemistry",
      "Physics",
      "Biology",
      "History",
      "Sociology",
      "Geography",
      "Pure Mathematics",
      "Statistics 1",
      "Information Technology",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.229Z",
    "updatedAt": "2026-10-13T23:13:40.229Z"
  },
  {
    "id": "std_232",
    "admissionNumber": "TCIS/2026/232",
    "fullName": "Praise Odionyenfe",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Physics",
      "Information Technology",
      "Statistics 1",
      "Mechanics-1"
    ],
    "createdAt": "2026-10-13T23:13:40.229Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_233",
    "admissionNumber": "TCIS/2026/233",
    "fullName": "Shalom Onajite",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Business Studies",
      "Information Technology",
      "Sociology"
    ],
    "createdAt": "2026-10-13T23:13:40.229Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  },
  {
    "id": "std_234",
    "admissionNumber": "TCIS/2026/234",
    "fullName": "Theodore Odartey France",
    "yearGroup": "Year 13",
    "className": "Year 13",
    "academicYear": "2025/2026",
    "status": "Active",
    "enrolledSubjects": [
      "Pure Mathematics",
      "Statistics 1",
      "Mechanics-1",
      "Physics",
      "Information Technology"
    ],
    "createdAt": "2026-10-13T23:13:40.229Z",
    "updatedAt": "2026-10-14T16:13:47.014Z"
  }
];

const SEED_RESULTS = [];

// Clean up any old demo mode flags
try {
  localStorage.removeItem("tcis_mode");
  localStorage.removeItem("tcis_demo_prefill");
} catch (e) {}

// Initialize default school configuration if not present
function initializeLocalStorageSeed() {
  if (!localStorage.getItem("tcis_settings")) {
    localStorage.setItem("tcis_settings", JSON.stringify(DEFAULT_SETTINGS));
  }
}
initializeLocalStorageSeed();

// ==========================================
// 3. UNIFIED DATA ACCESS LAYER (DB API)
// Provides clean, unified Promise-based operations
// that work smoothly with both Live Firestore and LocalStorage
// ==========================================
const DB = {
  isLive: () => isLiveFirebase,
  getProjectId: () => firebaseConfig.projectId,

  // Subjects Management
  async getSubjects() {
    if (isLiveFirebase) {
      try {
        const snap = await firestoreDb.collection("subjects").get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          return list;
        }
      } catch (err) {
        console.warn("Firestore error getting subjects, using fallback:", err);
      }
    }
    const raw = localStorage.getItem("tcis_subjects");
    return raw ? JSON.parse(raw) : DEFAULT_SUBJECTS;
  },

  async saveSubject(subjectData) {
    if (!subjectData.id) {
      const safeId = "subj_" + subjectData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
      subjectData.id = safeId;
    }
    const now = new Date().toISOString();
    subjectData.updatedAt = now;
    if (!subjectData.createdAt) subjectData.createdAt = now;

    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("subjects").doc(subjectData.id).set(subjectData, { merge: true });
      } catch (err) {
        console.warn("Firestore error saving subject:", err);
      }
    }

    let subjects = await this.getSubjects();
    const idx = subjects.findIndex(s => s.id === subjectData.id);
    if (idx >= 0) {
      subjects[idx] = subjectData;
    } else {
      subjects.push(subjectData);
    }
    localStorage.setItem("tcis_subjects", JSON.stringify(subjects));
    return subjectData;
  },

  async deleteSubject(id) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("subjects").doc(id).delete();
      } catch (err) {
        console.warn("Firestore error deleting subject:", err);
      }
    }
    let subjects = await this.getSubjects();
    subjects = subjects.filter(s => s.id !== id);
    localStorage.setItem("tcis_subjects", JSON.stringify(subjects));
    return true;
  },

  async seedDefaultSubjectsToFirestore() {
    for (const sub of DEFAULT_SUBJECTS) {
      await this.saveSubject(sub);
    }
    return DEFAULT_SUBJECTS;
  },

  async saveTeacherAssignments(uid, assignments) {
    const profile = await this.getUserProfile(uid);
    if (!profile) throw new Error("User profile not found.");
    profile.teachingAssignments = assignments;
    profile.updatedAt = new Date().toISOString();
    await this.saveUserProfile(profile);
    return profile;
  },

  // Settings
  async getSettings() {
    if (isLiveFirebase) {
      try {
        const doc = await firestoreDb.collection("settings").doc("schoolProfile").get();
        if (doc.exists) {
          const merged = { ...DEFAULT_SETTINGS, ...doc.data() };
          try { localStorage.setItem("tcis_settings", JSON.stringify(merged)); } catch(e) {}
          return merged;
        }
      } catch (err) {
        console.warn("Error fetching Firestore settings, using fallback:", err);
      }
    }
    const raw = localStorage.getItem("tcis_settings");
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
  },

  async saveSettings(data) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("settings").doc("schoolProfile").set(data, { merge: true });
      } catch (err) {
        console.warn("Firestore saveSettings warning:", err);
      }
    }
    localStorage.setItem("tcis_settings", JSON.stringify(data));
    return data;
  },

  // Students
  async getStudents() {
    let list = null;
    if (isLiveFirebase) {
      try {
        const snap = await firestoreDb.collection("students").get();
        if (!snap.empty) {
          list = [];
          snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore error getting students, falling back to local:", err);
      }
    }
    if (!list || list.length === 0) {
      const raw = localStorage.getItem("tcis_students");
      list = raw ? JSON.parse(raw) : [...SEED_STUDENTS];
    }

    // Always enforce the official enrolledSubjects from SEED_STUDENTS for every student
    if (list && Array.isArray(list)) {
      SEED_STUDENTS.forEach(seed => {
        const target = list.find(s => s.id === seed.id || (s.admissionNumber && s.admissionNumber === seed.admissionNumber));
        if (target && Array.isArray(seed.enrolledSubjects)) {
          target.enrolledSubjects = [...seed.enrolledSubjects];
        }
      });
      try {
        localStorage.setItem("tcis_students", JSON.stringify(list));
      } catch (e) {}
    }

    return list;
  },

  async getStudentById(id) {
    const students = await this.getStudents();
    return students.find(s => s.id === id) || null;
  },

  async checkAdmissionExists(admissionNumber, excludeId = null) {
    const students = await this.getStudents();
    return students.some(s => 
      s.admissionNumber && 
      s.admissionNumber.trim().toLowerCase() === admissionNumber.trim().toLowerCase() && 
      s.id !== excludeId
    );
  },

  async saveStudent(studentData) {
    const isNew = !studentData.id;
    const now = new Date().toISOString();

    if (isNew) {
      studentData.id = "std_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      studentData.createdAt = now;
    }
    studentData.updatedAt = now;

    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("students").doc(studentData.id).set(studentData, { merge: true });
      } catch (err) {
        console.warn("Firestore error saving student:", err);
      }
    }

    const students = await this.getStudents();
    const idx = students.findIndex(s => s.id === studentData.id);
    if (idx >= 0) {
      students[idx] = studentData;
    } else {
      students.unshift(studentData);
    }
    localStorage.setItem("tcis_students", JSON.stringify(students));
    return studentData;
  },

  async deleteStudent(id) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("students").doc(id).delete();
      } catch (err) {
        console.warn("Firestore error deleting student:", err);
      }
    }
    let students = await this.getStudents();
    students = students.filter(s => s.id !== id);
    localStorage.setItem("tcis_students", JSON.stringify(students));

    // Also remove associated results
    let results = await this.getResults();
    results = results.filter(r => r.studentId !== id);
    localStorage.setItem("tcis_results", JSON.stringify(results));
    return true;
  },

  async syncOfficialSubjectAssignments() {
    const raw = localStorage.getItem("tcis_students");
    let students = raw ? JSON.parse(raw) : null;
    let modified = false;

    if (students && Array.isArray(students)) {
      SEED_STUDENTS.forEach(seed => {
        const found = students.find(s => s.id === seed.id);
        if (found && Array.isArray(seed.enrolledSubjects)) {
          found.enrolledSubjects = [...seed.enrolledSubjects];
          found.updatedAt = new Date().toISOString();
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem("tcis_students", JSON.stringify(students));
      }
    }

    if (isLiveFirebase && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        let ops = 0;
        for (const seed of SEED_STUDENTS) {
          if (seed.enrolledSubjects && seed.enrolledSubjects.length > 0) {
            const ref = firestoreDb.collection("students").doc(seed.id);
            batch.set(ref, { enrolledSubjects: seed.enrolledSubjects, updatedAt: new Date().toISOString() }, { merge: true });
            ops++;
            if (ops >= 450) {
              await batch.commit();
              ops = 0;
            }
          }
        }
        if (ops > 0) {
          await batch.commit();
        }
        console.log("TCIS: Synced official enrolledSubjects to live Firestore.");
      } catch (e) {
        console.warn("Firestore sync official subjects warning:", e);
      }
    }
  },

  // Results
  async getResults(filters = {}) {
    let list = [];
    if (isLiveFirebase) {
      try {
        let query = firestoreDb.collection("results");
        if (filters.studentId) query = query.where("studentId", "==", filters.studentId);
        if (filters.academicYear) query = query.where("academicYear", "==", filters.academicYear);
        if (filters.term) query = query.where("term", "==", filters.term);
        const snap = await query.get();
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore error fetching results, using local:", err);
      }
    }

    // Always merge Firestore and localStorage by docId
    const raw = localStorage.getItem("tcis_results");
    const localList = raw ? JSON.parse(raw) : [];
    const mergedMap = new Map();
    localList.forEach(r => { if (r.id) mergedMap.set(r.id, r); });
    list.forEach(r => { if (r.id) mergedMap.set(r.id, r); });

    // Update localStorage cache with the merged set so local is always fresh
    if (list.length > 0) {
      try {
        localStorage.setItem("tcis_results", JSON.stringify(Array.from(mergedMap.values())));
      } catch (e) {}
    }

    let resultList = Array.from(mergedMap.values());

    // Apply client filters if needed
    if (filters.studentId) resultList = resultList.filter(r => r.studentId === filters.studentId);
    if (filters.academicYear) resultList = resultList.filter(r => r.academicYear === filters.academicYear);
    if (filters.term) resultList = resultList.filter(r => r.term === filters.term);
    if (filters.yearGroup) resultList = resultList.filter(r => r.yearGroup === filters.yearGroup);
    if (filters.className) resultList = resultList.filter(r => r.className === filters.className);
    if (filters.subjectName) resultList = resultList.filter(r => (r.subjectName || "").trim().toLowerCase() === filters.subjectName.trim().toLowerCase());

    return resultList;
  },

  async saveResult(resultData) {
    const now = new Date().toISOString();
    // Unique deterministic document ID with NO slashes or spaces for Firestore compatibility
    const safeYear = (resultData.academicYear || "2025-2026").trim().replace(/[\/\s]/g, "-");
    const safeTerm = (resultData.term || "Term_1").trim().replace(/[\/\s]/g, "_");
    const safeSubject = (resultData.subjectName || "Subject").trim().replace(/[\/\s]/g, "_");
    const safeStudentId = (resultData.studentId || "student").trim().replace(/[\/\s]/g, "_");
    const docId = `res_${safeStudentId}_${safeYear}_${safeTerm}_${safeSubject}`;
    resultData.id = docId;
    resultData.updatedAt = now;

    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("results").doc(docId).set(resultData, { merge: true });
        console.log("TCIS: Successfully saved result to Firestore:", docId);
      } catch (err) {
        console.warn("Firestore error saving result:", err);
      }
    }

    // Read from localStorage for the merge step
    const raw = localStorage.getItem("tcis_results");
    const results = raw ? JSON.parse(raw) : [];
    const idx = results.findIndex(r => r.id === docId);
    if (idx >= 0) {
      results[idx] = resultData;
    } else {
      results.push(resultData);
    }
    localStorage.setItem("tcis_results", JSON.stringify(results));
    return resultData;
  },

  async deleteResult(docId) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("results").doc(docId).delete();
      } catch (err) {
        console.warn("Firestore error deleting result:", err);
      }
    }
    let results = await this.getResults();
    results = results.filter(r => r.id !== docId);
    localStorage.setItem("tcis_results", JSON.stringify(results));
    return true;
  },

  async clearAllResults() {
    let deletedCount = 0;
    if (isLiveFirebase && firestoreDb) {
      try {
        const snap = await firestoreDb.collection("results").get();
        deletedCount = snap.size;
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = firestoreDb.batch();
          const chunk = docs.slice(i, i + 400);
          chunk.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
        console.log(`TCIS: Cleared ${deletedCount} results documents from Firestore.`);
      } catch (err) {
        console.warn("Firestore error clearing results:", err);
      }
    }
    localStorage.removeItem("tcis_results");
    localStorage.setItem("tcis_results", JSON.stringify([]));
    return deletedCount;
  },

  // Users (for Authentication & Role management)
  async getUserProfile(uid) {
    if (isLiveFirebase) {
      try {
        const doc = await firestoreDb.collection("users").doc(uid).get();
        if (doc.exists) return { uid: doc.id, ...doc.data() };
      } catch (err) {
        console.warn("Firestore error fetching user profile:", err);
      }
    }
    const raw = localStorage.getItem("tcis_users");
    const users = raw ? JSON.parse(raw) : {};
    return users[uid] || null;
  },

  async getAllUsers() {
    if (isLiveFirebase) {
      try {
        const snap = await firestoreDb.collection("users").get();
        const list = [];
        snap.forEach(doc => list.push({ uid: doc.id, ...doc.data() }));
        return list;
      } catch (err) {
        console.warn("Firestore error fetching users:", err);
      }
    }
    const raw = localStorage.getItem("tcis_users");
    const users = raw ? JSON.parse(raw) : {};
    return Object.values(users);
  },

  async deleteUserProfile(uid) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("users").doc(uid).delete();
      } catch (err) {
        console.warn("Firestore error deleting user profile:", err);
      }
    }
    const raw = localStorage.getItem("tcis_users");
    const users = raw ? JSON.parse(raw) : {};
    delete users[uid];
    localStorage.setItem("tcis_users", JSON.stringify(users));
    return true;
  },

  async saveUserProfile(user) {
    if (isLiveFirebase) {
      try {
        await firestoreDb.collection("users").doc(user.uid).set(user, { merge: true });
      } catch (err) {
        console.warn("Firestore error saving user:", err);
      }
    }
    const raw = localStorage.getItem("tcis_users");
    const users = raw ? JSON.parse(raw) : {};
    users[user.uid] = user;
    localStorage.setItem("tcis_users", JSON.stringify(users));
    return user;
  }
};

window.DB = DB;
window.firebaseAuth = firebaseAuth;
window.firestoreDb = firestoreDb;
