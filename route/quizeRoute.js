const express = require('express');
const quizController = require('../controllers/quizecontroller');
const upload = require('../multer/multer')
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const route = express.Router();

// Admin: Create a quiz
route.post('/quiz', authenticateUser, authorizeRoles('admin'), quizController.createQuiz);

// Users: Fetch all quizzes
route.get('/quiz', authenticateUser, quizController.getAllQuizzes);

// Users: Fetch a specific quiz by ID
route.get('/quiz/:id', authenticateUser, quizController.getQuizById);

// Users: Submit answers and get the score
route.post('/quiz/:id/submit', authenticateUser, authorizeRoles('user'), quizController.submitQuiz);

//bulk uploading quize question
route.post('/quiz/upload',authenticateUser, authorizeRoles('admin'), upload.single('file'), quizController.uploadQuizCSV);

route.get('/download-sample-csv' , quizController.downloadSampleCSV);

module.exports = route;
