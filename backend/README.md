# Nepal Engineering License Exam Preparation Platform - CSV Bulk Import Guide

This guide explains how to bulk import curriculum data (**Subjects**, **Chapters**, and **Questions**) into the PostgreSQL (Supabase) database using CSV files.

---

## 1. Database Relationship Hierarchy

```
Faculty (ID: 1, 2, ...)
   └── Subject (foreignKey: facultyId)
          └── Chapter (foreignKey: subjectId)
                 └── Question (foreignKey: chapterId)
```

---

## 2. API Endpoints

| Resource | HTTP Method | Endpoint | Form-Data Key | Supported Extensions |
| :--- | :--- | :--- | :--- | :--- |
| **Subjects** | `POST` | `/api/import/subjects` | `file` or `csv` | `.csv` |
| **Chapters** | `POST` | `/api/import/chapters` | `file` or `csv` | `.csv` |
| **Questions** | `POST` | `/api/import/questions` | `file` or `csv` | `.csv` |

---

## 3. CSV File Formats

### A. Subjects (`subjects.csv`)
Columns: `facultyId,name,code,description`
```csv
facultyId,name,code,description
1,Structural Analysis,CE501,Study of determinate and indeterminate structures beams and frames
1,Fluid Mechanics & Hydraulics,CE502,Principles of fluid statics dynamics pipe flow and open channel flow
```

### B. Chapters (`chapters.csv`)
Columns: `subjectId,chapterNumber,name,description`
```csv
subjectId,chapterNumber,name,description
1,1,Shear Force and Bending Moment Diagrams,Calculation of SFD and BMD for beams
1,2,Deflection of Beams,Moment area method and conjugate beam method
```

### C. Questions (`questions.csv`)
Columns: `chapterId,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty`
```csv
chapterId,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty
1,"For a simply supported beam of length L carrying a central point load W, what is the maximum bending moment?",WL/2,WL/4,WL/8,WL/12,B,"The maximum bending moment occurs at mid-span and equals (W * L) / 4.",medium
```

---

## 4. How to Upload CSV Files

### Using `curl`:
```bash
curl -X POST http://localhost:3000/api/import/subjects -F "file=@./subjects.csv"
curl -X POST http://localhost:3000/api/import/chapters -F "file=@./chapters.csv"
curl -X POST http://localhost:3000/api/import/questions -F "file=@./questions.csv"
```
