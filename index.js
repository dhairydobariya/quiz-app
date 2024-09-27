let express = require("express")
let app = express()

let port = process.env.PORT || 4000

let route = require('./route/route')
let quizeroute = require('./route/quizeRoute')

let bodyparser = require('body-parser')

let mongoose =  require('./db/database')

let cookieparser = require('cookie-parser')

require('dotenv').config();


app.use(bodyparser.urlencoded({extended : true}))
app.use(express.json());
app.use(cookieparser())
app.use('/' , route)
app.use('/',quizeroute)

app.listen(port , (req ,res) => {
    console.log(`port successfully run on ${port}`)
})
 
// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});