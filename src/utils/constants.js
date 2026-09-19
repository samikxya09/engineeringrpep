// Centralized constants for Nepal Engineering License Exam Preparation Platform

export const APP_NAME = "Nepal Engineering License Prep";
export const API_BASE_URL = "http://localhost:3000";

// Nepal Engineering Council (NEC) Disciplines
export const ENGINEERING_FACULTIES = [
  {
    id: "civil",
    name: "Civil Engineering",
    code: "CE",
    description: "Structural, Geotechnical, Water Resources, Transportation & Environmental Engineering",
    totalQuestions: 100,
    duration: "2 Hours",
    passingMarks: 50,
  },
  {
    id: "computer",
    name: "Computer / IT Engineering",
    code: "CT/IT",
    description: "Data Structures, Algorithms, Software Engineering, DBMS, OS, Networks & AI",
    totalQuestions: 100,
    duration: "2 Hours",
    passingMarks: 50,
  },
  {
    id: "electrical",
    name: "Electrical Engineering",
    code: "EE",
    description: "Power Systems, Electrical Machines, Control Systems, Power Electronics & Protection",
    totalQuestions: 100,
    duration: "2 Hours",
    passingMarks: 50,
  },
  {
    id: "mechanical",
    name: "Mechanical Engineering",
    code: "ME",
    description: "Thermodynamics, Fluid Mechanics, Machine Design, Heat Transfer & Manufacturing",
    totalQuestions: 100,
    duration: "2 Hours",
    passingMarks: 50,
  },
  {
    id: "electronics",
    name: "Electronics & Communication",
    code: "EC",
    description: "Signals & Systems, Digital Communication, Microprocessors, Embedded Systems & VLSI",
    totalQuestions: 100,
    duration: "2 Hours",
    passingMarks: 50,
  },
];

// Key Features
export const PLATFORM_FEATURES = [
  {
    title: "NEC Syllabus-Aligned",
    description: "Comprehensive question banks modeled strictly on the official Nepal Engineering Council syllabus.",
    icon: "BookOpen",
  },
  {
    title: "Timed Mock Exams",
    description: "Simulate real exam pressure with 100-mark full length tests and instant score evaluation.",
    icon: "Timer",
  },
  {
    title: "Chapter-Wise Practice",
    description: "Master individual subjects with detailed question explanations and formula hints.",
    icon: "Target",
  },
  {
    title: "Performance Analytics",
    description: "Track your accuracy, strong areas, and weak topics to focus your preparation effectively.",
    icon: "BarChart3",
  },
];
