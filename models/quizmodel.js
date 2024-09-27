const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    answerChoices: [
        {
            type: String,
            required: true
        }
    ],
    correctAnswer: {
        type: String,
        required: true
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    questions: [questionSchema],  // Array of questions

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdByName: {  
        type: String,
        required: true
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
