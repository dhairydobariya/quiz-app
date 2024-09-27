`
# Quiz Application API

This API allows users to upload quizzes in CSV format, create, and manage quizzes. Below is the documentation for the CSV upload feature.

## Live Demo

The application is live and can be accessed at: [Quiz Application](https://quiz-app-2ht1.onrender.com)

---

## CSV Upload Feature

### Endpoint:
**POST /upload-quiz-csv**

### Description:
Uploads a CSV file containing quiz data. The file should have the following structure:

#### CSV Format:

| Quiz Title   | Quiz Description        | Question Text     | Answer Choice 1 | Answer Choice 2 | Answer Choice 3 | Answer Choice 4 | Correct Answer |
|--------------|-------------------------|-------------------|-----------------|-----------------|-----------------|-----------------|----------------|
| Math Quiz    | A basic math quiz        | What is 2 + 2?    | 2               | 3               | 4               | 5               | 4              |
| Math Quiz    | A basic math quiz        | What is 5 - 3?    | 1               | 2               | 3               | 4               | 2              |
| Science Quiz | Basic science concepts   | What is H2O?      | Water           | Oxygen          | Hydrogen        | Helium          | Water          |

### Request:
- **File:** The CSV file should be uploaded as part of the request (multipart/form-data).
  
### Response:

| Field           | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `message`       | Status of the upload process.                                               |
| `createdQuizzes`| List of quizzes that were successfully created.                             |
| `duplicateQuizzes` | List of quizzes that already existed and were not re-created.            |
| `updatedQuizzes`| List of quizzes that were updated with new questions.                       |
| `details`       | Provides summary information about created, duplicate, and updated quizzes. |

### Example Response:
\`\`\`json
{
  "message": "Quizzes upload completed!",
  "createdQuizzes": ["Math Quiz", "Science Quiz"],
  "duplicateQuizzes": ["General Knowledge Quiz"],
  "updatedQuizzes": ["Science Quiz"],
  "details": {
    "createdCount": 2,
    "duplicateCount": 1,
    "updatedCount": 1
  }
}
\`\`\`

### Errors:
If any error occurs during the upload, such as a missing field or malformed CSV, the API will return an error message:

#### Example Error Response:
\`\`\`json
{
  "message": "Error uploading quizzes",
  "error": "Some error message here"
}
\`\`\`

---

## CSV Template Download

A sample template CSV file can be downloaded from the application to ensure proper structure is followed when uploading quizzes.

### Endpoint:
**GET /download-csv-template**

### Description:
This endpoint provides a downloadable CSV file template that users can follow to upload their quizzes.

#### Sample CSV Template:
\`
Quiz Title,Quiz Description,Question Text,Answer Choice 1,Answer Choice 2,Answer Choice 3,Answer Choice 4,Correct Answer
Math Quiz,A basic math quiz,What is 2 + 2?,2,3,4,5,4
Math Quiz,A basic math quiz,What is 5 - 3?,1,2,3,4,2
Science Quiz,Basic science concepts,What is H2O?,Water,Oxygen,Hydrogen,Helium,Water
\`

---

## Postman Collection for Testing

A Postman testing file is included in the root folder of the repository. To test all routes, simply import this file into Postman:

1. Open Postman.
2. Go to **File > Import**.
3. Select the Postman collection JSON file from the root folder.
4. Once imported, you can test all routes available in this API, including the CSV upload and other quiz management features.

---

## How to Run the Project Locally

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Add environment variables:
Create a \`.env\` file with the necessary environment variables (e.g., MongoDB URI, JWT Secret).

4. Run the server:
\`\`\`bash
npm start
\`\`\`

5. Access the application on [http://localhost:4000](http://localhost:4000).

---

## Technologies Used

- Node.js
- Express.js
- MongoDB
- CSV Parsing: \`csv-parser\` for handling CSV uploads

---

### Note:
Make sure to upload the CSV files in the exact format described to avoid parsing errors during the quiz creation process.
`
