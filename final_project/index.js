const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken; // Get the access token from the session
        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (err) {
                return res.status(403).json({ message: "User not authenticated" });
            }
            req.user = user; // Attach user info to the request object
            next(); // Proceed to the next middleware/route handler
        });
    } else {
        return res.status(403).json({ message: "User not authenticated" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
