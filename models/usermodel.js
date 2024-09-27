
let mongoose = require('mongoose')

let userschema = mongoose.Schema({
    name: {
        type : String,
        required : true,
        unique: true
    },
    password: {
        type : String,
        required : true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role : {
        type : String,
        enum : ["user" , "admin"],
        default : "user"
    }
},{ timestamps: true })

let usermodel = mongoose.model('users', userschema)

module.exports = usermodel
