const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Check if the user with the given username and password exists
const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from request URL
    const isbn = req.params.isbn;
    const book = books[isbn];  // Access the book object by ISBN

    // Check if the book exists
    if (book) {
        // Extract the review from request body
        const review = req.body.review;
        const username = req.session.authorization.username;  // Assuming you're using session to store user data

        // Check if the review content is provided
        if (review) {
            // Save the review under the username in the reviews object
            book.reviews[username] = review;
            res.status(200).send(`Review for book with ISBN: ${isbn} added/updated successfully.`);
        } else {
            res.status(400).send("Review content is missing.");
        }
    } else {
        // Respond if the book with the specified ISBN is not found
        res.status(404).send("Invalid ISBN! Book not found.");
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) =>{
    // Extract the isbn from the request URL
    const isbn = req.params.isbn;

    // Check if the book with the given ISBN exists
    if (books[isbn]) {
        // Check if there are reviews for the book
        if (Object.keys(books[isbn].reviews).length > 0) {
            // Delete the review by resetting the reviews object
            books[isbn].reviews = {};

            // Send a success response
            return res.status(200).json({ message: `Reviews for book with ISBN: ${isbn} have been deleted.` });
        } else {
            // If no reviews found
            return res.status(404).json({ message: "No reviews found for this book." });
        }
    } else {
        // If the book is not found
        return res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
