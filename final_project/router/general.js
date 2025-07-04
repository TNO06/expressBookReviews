const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/** ------------------ TASK 6: Register a new user ------------------ */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});


/** ------------------ TASK 1: Get the book list ------------------ */
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };
        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


/** ------------------ TASK 2: Get book details based on ISBN ------------------ */
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("Book not found with the given ISBN.");
                }
            });
        };

        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


/** ------------------ TASK 3: Get book details based on author ------------------ */
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const filteredBooks = [];
                for (let key in books) {
                    if (books[key].author === author) {
                        filteredBooks.push({ isbn: key, ...books[key] });
                    }
                }
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found by the given author.");
                }
            });
        };

        const booksByAuthor = await getBooksByAuthor(author);
        return res.status(200).json(booksByAuthor);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


/** ------------------ TASK 4: Get book details based on title ------------------ */
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const filteredBooks = [];
                for (let key in books) {
                    if (books[key].title === title) {
                        filteredBooks.push({ isbn: key, ...books[key] });
                    }
                }
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject("No books found with the given title.");
                }
            });
        };

        const booksByTitle = await getBooksByTitle(title);
        return res.status(200).json(booksByTitle);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});


/** ------------------ TASK 5: Get book review ------------------ */
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found with the given ISBN." });
    }
});

module.exports.general = public_users;
