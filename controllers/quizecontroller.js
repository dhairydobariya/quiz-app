const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const quizmodel = require('../models/quizmodel');
const usermodel = require('../models/usermodel');

// Admin: Create a new quiz
let createQuiz = async (req, res) => {
    const { title, description, questions } = req.body;
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can create quizzes.' });
    }
    
    if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ message: 'Title and questions are required.' });
    }
    
    try {
        const newQuiz = new quizmodel({ title, description, questions , createdBy : req.user.id , createdByName : req.user.name });
        await newQuiz.save();
        res.status(201).json({ message: 'Quiz created successfully.', quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz.', error: error.message });
    }
};

// Users: Get all quizzes
let getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await quizmodel.find();
        res.json({ quizzes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes.', error: error.message });
    }
};

// Users: Get quiz by ID
let getQuizById = async (req, res) => {
    try {
        const quiz = await quizmodel.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        res.json({ quiz });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quiz.', error: error.message });
    }
};

// Users: Submit quiz and calculate score
const submitQuiz = async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;  // User's answers in the format: { "0": "A", "1": "B", ... }

    try {
        const quiz = await quizmodel.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        const totalQuestions = quiz.questions.length;

        // Store details of user's answers and correct answers
        const resultDetails = quiz.questions.map((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question.correctAnswer;
            
            // Check if user's answer is correct and increment score
            if (userAnswer === correctAnswer) {
                score += 1;
            }

            return {
                questionText: question.questionText,
                userAnswer: userAnswer || 'No answer',  // If no answer provided
                correctAnswer: correctAnswer,
                isCorrect: userAnswer === correctAnswer
            };
        });

        // Prepare the result with user's score and detailed feedback
        const result = {
            score,
            totalQuestions,
            percentage: (score / totalQuestions) * 100,
            details: resultDetails  // Detailed info about each question
        };

        res.json({
            message: 'Quiz submitted successfully',
            result
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const uploadQuizCSV = async (req, res) => {
    const results = [];
    const quizzes = {}; // To collect quizzes
    const createdQuizzes = []; // Array to store successfully created quizzes
    const duplicateQuizzes = []; // Array to store duplicates
    const updatedQuizzes = []; // Array to store quizzes that were updated

    fs.createReadStream(req.file.path) // Assuming the CSV file is sent in the request
        .pipe(csv())
        .on('data', (data) => {
            console.log("Row Data:", data); // Log each row of data
            results.push(data);
        })
        .on('end', async () => {
            console.log("CSV Data:", results); // Log the parsed CSV data

            results.forEach(row => {
                const { 'Quiz Title': title, 'Quiz Description': description, 'Question Text': questionText, 
                        'Answer Choice 1': answerChoice1, 'Answer Choice 2': answerChoice2, 
                        'Answer Choice 3': answerChoice3, 'Answer Choice 4': answerChoice4, 
                        'Correct Answer': correctAnswer } = row;

                // Create a quiz object with the necessary details
                if (!quizzes[title]) {
                    quizzes[title] = {
                        title: title.trim(), // Trim to remove any extra spaces
                        description: description.trim(),
                        questions: []
                    };
                }

                // Push question details into the quiz's questions array
                quizzes[title].questions.push({
                    questionText: questionText.trim(),
                    answerChoices: [
                        answerChoice1.trim(),
                        answerChoice2.trim(),
                        answerChoice3.trim(),
                        answerChoice4.trim()
                    ],
                    correctAnswer: correctAnswer.trim() // Use the provided correct answer directly
                });
            });

            // Process each quiz
            for (const quiz of Object.values(quizzes)) {
                try {
                    let existingQuiz = await quizmodel.findOne({ title: quiz.title });

                    if (!existingQuiz) {
                        // Create a new quiz if it doesn't exist
                        existingQuiz = new quizmodel({
                            title: quiz.title,
                            description: quiz.description,
                            questions: quiz.questions,
                            createdBy: req.user._id,        // User ID from the request
                            createdByName: req.user.name    // User name from the request
                        });

                        await existingQuiz.save(); // Save the quiz to the database
                        createdQuizzes.push(existingQuiz.title); // Add to created quizzes list
                        console.log(`Quiz created: ${existingQuiz.title}`);
                    } else {
                        duplicateQuizzes.push(existingQuiz.title); // Add to duplicate quizzes list
                        console.log(`Quiz already exists: ${existingQuiz.title}, checking for new questions.`);
                        let isUpdated = false; // Flag to track if any new questions were added

                        // Check for new questions
                        for (const newQuestion of quiz.questions) {
                            const questionExists = existingQuiz.questions.some(existingQuestion => 
                                existingQuestion.questionText === newQuestion.questionText
                            );

                            if (!questionExists) {
                                existingQuiz.questions.push(newQuestion); // Add new question to existing quiz
                                console.log(`Added new question to quiz: ${existingQuiz.title} - ${newQuestion.questionText}`);
                                isUpdated = true; // Mark as updated
                            } else {
                                console.log(`Question already exists in quiz: ${existingQuiz.title} - ${newQuestion.questionText}`);
                            }
                        }

                        // Save updated quiz if any new questions were added
                        if (isUpdated) {
                            await existingQuiz.save();
                            updatedQuizzes.push(existingQuiz.title); // Add to updated quizzes list
                        }
                    }
                } catch (error) {
                    console.error("Error saving quiz:", error); // Log any errors during save
                    return res.status(500).json({ message: 'Error uploading quizzes', error: error.message });
                }
            }

            // Prepare the response including created, duplicate, and updated quizzes
            res.json({
                message: "Quizzes upload completed!",
                createdQuizzes,
                duplicateQuizzes,
                updatedQuizzes,
                details: {
                    createdCount: createdQuizzes.length,
                    duplicateCount: duplicateQuizzes.length,
                    updatedCount: updatedQuizzes.length
                }
            });
        })
        .on('error', (error) => {
            console.error("Error reading CSV file:", error); // Log CSV reading errors
            return res.status(500).json({ message: 'Error reading CSV file', error: error.message });
        });
};

const downloadSampleCSV = (req, res) => {
    // Define the headers and sample data based on the new structure
    const headers = ['Quiz Title', 'Quiz Description', 'Question Text', 'Answer Choice 1', 'Answer Choice 2', 'Answer Choice 3', 'Answer Choice 4', 'Correct Answer'];
    const sampleData = [
        ['Math Quiz', 'A basic math quiz', 'What is 2 + 2?', '2', '3', '4', '5', '4'],
        ['Math Quiz', 'A basic math quiz', 'What is 5 - 3?', '1', '2', '3', '4', '2'],
        ['Science Quiz', 'Basic science concepts', 'What is H2O?', 'Water', 'Oxygen', 'Hydrogen', 'Helium', 'Water'],
    ];

    // Create CSV content
    let csvContent = headers.join(',') + '\n'; // Add headers

    // Append each row of sample data
    sampleData.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    // Set the file path for the CSV
    const filename = 'sample_quiz_template.csv';
    const tempFilePath = path.join(__dirname, '..', filename); // Adjust path if necessary

    // Write the CSV content to a file
    fs.writeFile(tempFilePath, csvContent, (err) => {
        if (err) {
            console.error('Error writing CSV file:', err);
            return res.status(500).json({ message: 'Error generating CSV file', error: err.message });
        }

        console.log(`CSV file created at: ${tempFilePath}`);

        // Send the CSV file as a download
        res.download(tempFilePath, filename, (downloadErr) => {
            if (downloadErr) {
                console.error('Error during download:', downloadErr);
                return res.status(500).json({ message: 'Error downloading CSV file', error: downloadErr.message });
            }

            // Optionally delete the temporary file after download
            fs.unlink(tempFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temporary CSV file:', unlinkErr);
                }
            });
        });
    });
};



module.exports = { createQuiz, getAllQuizzes, getQuizById, submitQuiz , uploadQuizCSV  , downloadSampleCSV};
