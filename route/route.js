let express = require("express")
let controll = require("../controllers/controller")
let route = express.Router()

route.get('/' , controll.defaults )
route.post('/register' ,controll.register)
route.post('/login' , controll.login)
route.get('/logout',controll.logout)


module.exports = route 
