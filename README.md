# Nepal Engineering License Exam Preparation Platform - CSV Bulk Import Guide

This guide explains how to bulk import curriculum data (**Subjects**, **Chapters**, and **Questions**) into the PostgreSQL (Supabase) database using CSV files.

---

## 1. Database Relationship Hierarchy

The database follows a strict parent-child relationship hierarchy:

```
Faculty (ID: 1, 2, ...)
   └── Subject (foreignKey: facultyId)
          └── Chapter (foreignKey: subjectId)
                 └── Question (foreignKey: chapterId)
```

> [!IMPORTANT]
> **Import Order:** Always import in order:
> 1. Verify/Add **Faculties**
> 2. Import **Subjects** (requires existing `facultyId`)
> 3. Import **Chapters** (requires existing `subjectId`)
> 4. Import **Questions** (requires existing `chapterId`)

---

## 2. API Endpoints

| Resource | HTTP Method | Endpoint | Form-Data Key | Supported Extensions |
| :--- | :--- | :--- | :--- | :--- |
| **Subjects** | `POST` | `/api/import/subjects` | `file` or `csv` | `.csv` |
| **Chapters** | `POST` | `/api/import/chapters` | `file` or `csv` | `.csv` |
| **Questions** | `POST` | `/api/import/questions` | `file` or `csv` | `.csv` |

*(All endpoints are also available on root aliases: `/import/subjects`, `/import/chapters`, `/import/questions`)*

---

## 3. CSV File Formats & Column Specifications

### A. Subjects CSV (`subjects.csv`)

| Column Name | Required | Type | Description |
| :--- | :--- | :--- | :--- |
| `facultyId` | **Yes** | Integer | Existing ID of the parent Faculty (e.g. `1` for Civil) |
| `name` | **Yes** | String | Name of the subject (e.g. `Structural Analysis`) |
| `code` | No | String | Subject/course code (e.g. `CE501`) |
| `description` | No | String | Course overview and syllabus scope |

#### Example `subjects.csv`:
```csv
facultyId,name,code,description
1,Structural Analysis,CE501,Study of determinate and indeterminate structures beams and frames
1,Fluid Mechanics & Hydraulics,CE502,Principles of fluid statics dynamics pipe flow and open channel flow
1,Soil Mechanics & Foundation Engineering,CE503,Geotechnical engineering soil properties shear strength and bearing capacity
```

---

### B. Chapters CSV (`chapters.csv`)

| Column Name | Required | Type | Description |
| :--- | :--- | :--- | :--- |
| `subjectId` | **Yes** | Integer | Existing ID of the parent Subject |
| `chapterNumber` | No | Integer | Chapter sequence number (e.g. `1`, `2`, `3`) |
| `name` | **Yes** | String | Topic title (e.g. `Shear Force and Bending Moment`) |
| `description` | No | String | Unit topics, derivations, and formulas |

#### Example `chapters.csv`:
```csv
subjectId,chapterNumber,name,description
1,1,Shear Force and Bending Moment Diagrams,Static equilibrium and calculation of SFD and BMD for beams
1,2,Deflection of Beams,Moment area method and conjugate beam method
2,1,Fluid Properties and Hydrostatic Pressure,Density viscosity surface tension and pressure measurements
```

---

### C. Questions CSV (`questions.csv`)

| Column Name | Required | Type | Description |
| :--- | :--- | :--- | :--- |
| `chapterId` | **Yes** | Integer | Existing ID of the parent Chapter |
| `questionText` | **Yes** | String | Problem statement / MCQ question text |
| `optionA` | **Yes** | String | Option A choice text |
| `optionB` | **Yes** | String | Option B choice text |
| `optionC` | **Yes** | String | Option C choice text |
| `optionD` | **Yes** | String | Option D choice text |
| `correctAnswer` | **Yes** | Character | Correct key: `A`, `B`, `C`, or `D` |
| `explanation` | No | String | Step-by-step formula derivation / explanation |
| `difficulty` | No | String | `easy`, `medium`, or `hard` (default: `medium`) |

#### Example `questions.csv`:
```csv
chapterId,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,difficulty
1,"For a simply supported beam of length L carrying a central point load W, what is the maximum bending moment?",WL/2,WL/4,WL/8,WL/12,B,"The maximum bending moment occurs at mid-span and equals (W * L) / 4.",medium
1,"At the point of contraflexure in a continuous beam, which quantity is zero?",Shear force,Bending moment,Deflection,Slope,B,"A point of contraflexure is a location where bending moment changes sign and is zero.",easy
```

---

## 4. How to Upload CSV Files

### Method 1: Using Postman

1. Open Postman and set the request method to `POST`.
2. Enter the URL: `http://localhost:3000/api/import/subjects` (or `/chapters`, `/questions`).
3. Switch to the **Body** tab and select **form-data**.
4. In the `Key` field, type `file` (or `csv`), and hover over the right side of the key field to change type from **Text** to **File**.
5. Click **Select Files** and choose your `.csv` file.
6. Click **Send**.

---

### Method 2: Using `curl` (Terminal / Command Line)

#### Import Subjects:
```bash
curl -X POST http://localhost:3000/api/import/subjects \
  -F "file=@c:/Users/ASUS/Desktop/engineeringprep/backend/subjects.csv"
```

#### Import Chapters:
```bash
curl -X POST http://localhost:3000/api/import/chapters \
  -F "file=@c:/Users/ASUS/Desktop/engineeringprep/backend/chapters.csv"
```

#### Import Questions:
```bash
curl -X POST http://localhost:3000/api/import/questions \
  -F "file=@c:/Users/ASUS/Desktop/engineeringprep/backend/questions.csv"
```

---

## 5. Duplicate Prevention & Validation Rules

1. **Duplicate Prevention:**
   - **Subjects:** Skipped if a subject with the same `name` or `code` already exists under that `facultyId`.
   - **Chapters:** Skipped if a chapter with the same `name` or `chapterNumber` already exists under that `subjectId`.
   - **Questions:** Skipped if an identical `questionText` already exists under that `chapterId`.
2. **Foreign Key Integrity:** If a referenced `facultyId`, `subjectId`, or `chapterId` does not exist in the database, the row is recorded in `errors` with the row line number, and remaining valid rows continue importing.
3. **Response Summary:** The API returns a clear breakdown:
   ```json
   {
     "message": "Subject CSV import completed. Imported: 3, Skipped: 1, Errors: 0",
     "totalRows": 4,
     "importedCount": 3,
     "skippedCount": 1,
     "errorCount": 0,
     "imported": [...],
     "skipped": [...],
     "errors": [...]
   }
   ```
