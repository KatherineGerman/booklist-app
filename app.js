// Book Class: Represents a Book
class Book {
    constructor(title, author, isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }
}

// UI Class: Handle UI Tasks
class UI {
    static displayBooks() {
        const books = Store.getBooks();
        books.forEach((book) => UI.addBookToList(book));
    }

    static addBookToList(book) {
        const list = document.querySelector('#book-list');

        const row = document.createElement('tr');

        row.innerHTML = `
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.isbn}</td>
        <td><a href="#" class="btn btn-danger btn-sm delete">X</a></td>
        <td><a href="#" class="btn btn-info btn-sm update"><i class="fa fa-pencil" aria-hidden="true"></i></a></td>
        `;

        list.appendChild(row);
    }

    static deleteBook(el) {
        if (el.classList.contains('delete')) {
            el.parentElement.parentElement.remove();
        }
    }

    static updateBookForm(row) {
        document.querySelector('#title').value = row.children[0].textContent;
        document.querySelector('#author').value = row.children[1].textContent;
        document.querySelector('#isbn').value = row.children[2].textContent;

        // Set 'data-editing' attribute to track the book being edited by ISBN
        document.querySelector('#book-form').setAttribute('data-editing', row.children[2].textContent);
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#book-form');
        container.insertBefore(div, form);

        // Vanish in 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static clearFields() {
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
        document.querySelector('#isbn').value = '';
        document.querySelector('#book-form').removeAttribute('data-editing');
    }
}

// Store Class: Handles Storage
class Store {
    static getBooks() {
        let books;
        try {
            books = JSON.parse(localStorage.getItem('books')) || [];
            if (!Array.isArray(books)) {
                books = []; // If not an array, reset to an empty array
            }
        } catch (error) {
            books = []; // On parsing error, reset to an empty array
        }
        return books;
    }

    static addBook(book) {
        const books = Store.getBooks();
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    static updateBook(updatedBook) {
        let books = Store.getBooks();
        books = books.map(book => book.isbn === updatedBook.isbn ? updatedBook : book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    static removeBook(isbn) {
        let books = Store.getBooks();
        books = books.filter(book => book.isbn !== isbn);
        localStorage.setItem('books', JSON.stringify(books));
    }
}

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add a Book or Update an Existing Book
document.querySelector('#book-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent actual form submission

    const title = document.querySelector('#title').value;
    const author = document.querySelector('#author').value;
    const isbn = document.querySelector('#isbn').value;

    if (title === '' || author === '' || isbn === '') {
        UI.showAlert('Please fill in all fields', 'danger');
    } else {
        const editingIsbn = document.querySelector('#book-form').getAttribute('data-editing');

        if (editingIsbn) {
            // If we are updating an existing book
            const updatedBook = new Book(title, author, isbn);
            Store.updateBook(updatedBook);
            UI.showAlert('Book Updated', 'success');
        } else {
            // Adding a new book
            const book = new Book(title, author, isbn);
            UI.addBookToList(book);
            Store.addBook(book);
            UI.showAlert('Book Added', 'success');
        }

        // Clear fields and remove the editing attribute
        UI.clearFields();
        UI.displayBooks(); // Refresh the book list to reflect changes
    }
});

// Event: Handle Edit and Delete Actions
document.querySelector('#book-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        // Remove book from UI
        UI.deleteBook(e.target);

        // Remove book from store
        const isbn = e.target.parentElement.previousElementSibling.textContent;
        Store.removeBook(isbn);
        UI.showAlert('Book Removed', 'success');
    }

    if (e.target.closest('.update')) {
        const row = e.target.closest('tr');
        UI.updateBookForm(row); // Populate form with existing book data for editing
    }
});
