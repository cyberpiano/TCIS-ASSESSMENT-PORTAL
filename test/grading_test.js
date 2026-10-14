/**
 * Verification Test Suite for TCIS Grade Boundaries, Weighting, and GPA Calculations
 */

// Import / define grading scale function matching js/reports.js
function getTCISGrade(unroundedPercentage) {
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
}

function calculateSubjectScore(assessments, weights) {
  const keys = [
    { key: "exercise", weight: weights.exercise },
    { key: "homework", weight: weights.homework },
    { key: "progressiveTest", weight: weights.progressiveTest },
    { key: "midTerm", weight: weights.midTerm },
    { key: "endOfTerm", weight: weights.endOfTerm }
  ];

  let hasIncomplete = false;
  let finalPercentage = 0;
  const categoryPercentages = {};

  for (const item of keys) {
    const a = assessments[item.key];
    if (!a || a.score === null || a.score === undefined || a.score === "" || isNaN(a.score)) {
      hasIncomplete = true;
      categoryPercentages[item.key] = null;
      continue;
    }
    const scoreNum = parseFloat(a.score);
    const maxNum = parseFloat(a.max);
    if (isNaN(scoreNum) || isNaN(maxNum) || maxNum <= 0) {
      hasIncomplete = true;
      categoryPercentages[item.key] = null;
      continue;
    }
    const pct = (scoreNum / maxNum) * 100;
    categoryPercentages[item.key] = pct;
    finalPercentage += pct * (item.weight / 100);
  }

  if (hasIncomplete) {
    return { isIncomplete: true, finalPercentage: null, grade: "Incomplete", gradePoint: null, description: "Incomplete" };
  }

  const gradeInfo = getTCISGrade(finalPercentage);
  return {
    isIncomplete: false,
    finalPercentage,
    grade: gradeInfo.grade,
    gradePoint: gradeInfo.gradePoint,
    description: gradeInfo.description
  };
}

function calculateGPA(completedSubjects) {
  if (!completedSubjects || completedSubjects.length === 0) return null;
  const sum = completedSubjects.reduce((acc, curr) => acc + curr.gradePoint, 0);
  return Number((sum / completedSubjects.length).toFixed(2));
}

// ==========================================
// TEST EXECUTION
// ==========================================
let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

console.log("=== RUNNING TCIS GRADING BOUNDARY TESTS ===");

// 1. Distinction: 95% - 100%
assert(getTCISGrade(100).grade === "A*" && getTCISGrade(100).gradePoint === 4.00, "100% -> A*, 4.00");
assert(getTCISGrade(95.0).grade === "A*" && getTCISGrade(95.0).gradePoint === 4.00, "95.0% boundary -> A*, 4.00");
assert(getTCISGrade(94.99).grade === "A" && getTCISGrade(94.99).gradePoint === 3.67, "94.99% -> A, 3.67 (Must not round to 95%)");

// 2. Excellent: 80% - below 95%
assert(getTCISGrade(80.0).grade === "A" && getTCISGrade(80.0).gradePoint === 3.67, "80.0% boundary -> A, 3.67");
assert(getTCISGrade(79.99).grade === "B+" && getTCISGrade(79.99).gradePoint === 3.33, "79.99% -> B+, 3.33");

// 3. Very Good: 75% - below 80%
assert(getTCISGrade(75.0).grade === "B+" && getTCISGrade(75.0).gradePoint === 3.33, "75.0% boundary -> B+, 3.33");
assert(getTCISGrade(74.99).grade === "B" && getTCISGrade(74.99).gradePoint === 3.00, "74.99% -> B, 3.00");

// 4. Good: 70% - below 75%
assert(getTCISGrade(70.0).grade === "B" && getTCISGrade(70.0).gradePoint === 3.00, "70.0% boundary -> B, 3.00");
assert(getTCISGrade(69.99).grade === "C+" && getTCISGrade(69.99).gradePoint === 2.67, "69.99% -> C+, 2.67");

// 5. Average: 65% - below 70%
assert(getTCISGrade(65.0).grade === "C+" && getTCISGrade(65.0).gradePoint === 2.67, "65.0% boundary -> C+, 2.67");
assert(getTCISGrade(64.99).grade === "C" && getTCISGrade(64.99).gradePoint === 2.33, "64.99% -> C, 2.33");

// 6. Pass: 60% - below 65%
assert(getTCISGrade(60.0).grade === "C" && getTCISGrade(60.0).gradePoint === 2.33, "60.0% boundary -> C, 2.33");
assert(getTCISGrade(59.99).grade === "D" && getTCISGrade(59.99).gradePoint === 2.00, "59.99% -> D, 2.00");

// 7. Credit: 50% - below 60%
assert(getTCISGrade(50.0).grade === "D" && getTCISGrade(50.0).gradePoint === 2.00, "50.0% boundary -> D, 2.00");
assert(getTCISGrade(49.99).grade === "E" && getTCISGrade(49.99).gradePoint === 1.67, "49.99% -> E, 1.67");

// 8. Failed: 45% - below 50%
assert(getTCISGrade(45.0).grade === "E" && getTCISGrade(45.0).gradePoint === 1.67, "45.0% boundary -> E, 1.67");
assert(getTCISGrade(44.99).grade === "F" && getTCISGrade(44.99).gradePoint === 1.00, "44.99% -> F, 1.00");

// 9. Failed: 35% - below 45%
assert(getTCISGrade(35.0).grade === "F" && getTCISGrade(35.0).gradePoint === 1.00, "35.0% boundary -> F, 1.00");
assert(getTCISGrade(34.99).grade === "Ungraded" && getTCISGrade(34.99).gradePoint === 0.00, "34.99% -> Ungraded, 0.00");

// 10. Ungraded: below 35%
assert(getTCISGrade(0.0).grade === "Ungraded" && getTCISGrade(0.0).gradePoint === 0.00, "0.0% -> Ungraded, 0.00");

console.log("\n=== RUNNING WEIGHTED SUBJECT SCORE TESTS ===");
const weights = { exercise: 10, homework: 10, progressiveTest: 20, midTerm: 20, endOfTerm: 40 };

// Example from Section 7 specification:
// Exercise: 90%, Homework: 80%, Progressive: 85%, Mid-Term: 75%, End-of-Term: 80%
// Final: (90*0.1) + (80*0.1) + (85*0.2) + (75*0.2) + (80*0.4) = 9 + 8 + 17 + 15 + 32 = 81% -> A, 3.67, Excellent
const specExample = calculateSubjectScore({
  exercise: { score: 18, max: 20 },      // 90%
  homework: { score: 8, max: 10 },       // 80%
  progressiveTest: { score: 34, max: 40 }, // 85%
  midTerm: { score: 75, max: 100 },      // 75%
  endOfTerm: { score: 80, max: 100 }     // 80%
}, weights);

assert(Math.abs(specExample.finalPercentage - 81.0) < 0.001, "Final percentage is 81.0%");
assert(specExample.grade === "A", "81.0% grade is A");
assert(specExample.gradePoint === 3.67, "81.0% grade point is 3.67");
assert(specExample.description === "Excellent", "81.0% description is Excellent");

console.log("\n=== RUNNING INCOMPLETE SUBJECT TEST ===");
// When a category is missing:
const incompleteExample = calculateSubjectScore({
  exercise: { score: 18, max: 20 },
  homework: { score: 8, max: 10 },
  progressiveTest: { score: "", max: 40 }, // MISSING
  midTerm: { score: 75, max: 100 },
  endOfTerm: { score: 80, max: 100 }
}, weights);

assert(incompleteExample.isIncomplete === true, "Subject marked Incomplete when category is missing");
assert(incompleteExample.finalPercentage === null, "Final percentage is null (not silently zero)");
assert(incompleteExample.grade === "Incomplete", "Official grade is not generated for incomplete assessment");

console.log("\n=== RUNNING GPA CALCULATION TEST ===");
// Example from Section 8 specification:
// Math A* (4.00), English A (3.67), Biology B+ (3.33), Chemistry B (3.00)
// GPA = (4.00 + 3.67 + 3.33 + 3.00) / 4 = 14.00 / 4 = 3.50
const gpaResult = calculateGPA([
  { gradePoint: 4.00 },
  { gradePoint: 3.67 },
  { gradePoint: 3.33 },
  { gradePoint: 3.00 }
]);
assert(gpaResult === 3.50, `GPA calculated is 3.50 (got: ${gpaResult})`);

console.log(`\n==========================================`);
console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
console.log(`==========================================`);

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
