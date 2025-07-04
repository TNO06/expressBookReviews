const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid (i.e., does not already exist)
const isValid = (username) => {
  return !users.some(user => user.username === username);
}

// Check if username and password match an existing user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // Create JWT and store in session
  const accessToken = jwt.sign({ username: username }, 'access', { expiresIn: 3600 });
  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({ message: "User successfully logged in." });
});

// Task 8: Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Add or update the user's review
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/updated." });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in." });
  }

  if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found." });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
