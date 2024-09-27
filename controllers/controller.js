
let usermodel = require('../models/usermodel');
require('dotenv').config(); // Add this line at the top
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; 

// Default route
let defaults = (req, res) => {
    res.send("It's default routes");
};

// User Registration
let register = async (req, res) => {
    let { name, password, email , role } = req.body;
    if (!name || !password || !email) {
        return res.status(400).json({ message: 'Name, password, and email are required' });
    }
        
        
    try {   
     
        let hashedPassword = await bcrypt.hash(password, 10);

        
        let userdata = new usermodel({
            name,
            password: hashedPassword,
            email,
            role 
        });

       
        await userdata.save();
        res.json({ message: "User successfully registered" });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User Login
let login = async (req, res) => {
    let { name, password } = req.body;
    console.log("login detail" , req.body);
    
    try {
        
        let user = await usermodel.findOne({ name });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        let isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            
            const token = jwt.sign({ id: user._id, name: user.name, email: user.email  , role : user.role}, JWT_SECRET, { expiresIn: '1h' });

            
            res.cookie('token', token, { httpOnly: true, secure: true });

            return res.json({ message: "User successfully logged in", token: token });
        } else {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// User Logout
let logout = (req, res) => {
    res.clearCookie('token'); 
    res.json({ message: "User successfully logged out" });
};



module.exports = {
    defaults,
    register,
    login,
    logout,
};
