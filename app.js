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

        // Limpiar la lista antes de volver a renderizar (evita duplicados)
        const list = document.querySelector('#book-list');
        list.innerHTML = '';

        books.forEach((book) => UI.addBookToList(book));
    }

    static addBookToList(book) {
        const list = document.querySelector('#book-list');
        if (!list) return;

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
        const deleteBtn = el.closest('.delete');
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            if (row) row.remove();
        }
    }

    static updateBookForm(row) {
        document.querySelector('#title').value = row.children[0].textContent;
        document.querySelector('#author').value = row.children[1].textContent;
        document.querySelector('#isbn').value = row.children[2].textContent;

        // Guardar el ISBN original en data-editing
        document.querySelector('#book-form').setAttribute('data-editing', row.children[2].textContent);
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));

        const container = document.querySelector('.container');
        const form = document.querySelector('#book-form');
        if (!container || !form) return;

        container.insertBefore(div, form);

        // Eliminar solo esta alerta después de 3 segundos
        setTimeout(() => {
            if (div.parentElement) div.parentElement.removeChild(div);
        }, 3000);
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
            if (!Array.isArray(books)) books = [];
        } catch (error) {
            books = [];
        }
        return books;
    }

    static addBook(book) {
        const books = Store.getBooks();
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    // ✅ Corregido: permite actualizar aunque el ISBN cambie
    static updateBook(updatedBook, oldIsbn) {
        let books = Store.getBooks();
        const targetIsbn = oldIsbn ?? updatedBook.isbn;
        books = books.map(book => book.isbn === targetIsbn ? updatedBook : book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    static removeBook(isbn) {
        let books = Store.getBooks();
        books = books.filter(book => book.isbn !== isbn);
        localStorage.setItem('books', JSON.stringify(books));
    }
}

// ---------------- Events ----------------

// Event: Display Books
document.addEventListener('DOMContentLoaded', UI.displayBooks);

// Event: Add or Update Book
const form = document.querySelector('#book-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.querySelector('#title').value;
        const author = document.querySelector('#author').value;
        const isbn = document.querySelector('#isbn').value;

        if (title === '' || author === '' || isbn === '') {
            UI.showAlert('Please fill in all fields', 'danger');
            return;
        }

        const editingIsbn = form.getAttribute('data-editing');

        if (editingIsbn) {
            // ✅ Update existing book
            const updatedBook = new Book(title, author, isbn);
            Store.updateBook(updatedBook, editingIsbn);
            UI.showAlert('Book Updated', 'success');
            UI.displayBooks();
            UI.clearFields();
        } else {
            // Check duplicate ISBN
            const existing = Store.getBooks().some(b => b.isbn === isbn);
            if (existing) {
                UI.showAlert('ISBN already exists', 'danger');
                return;
            }

            // ✅ Add new book
            const book = new Book(title, author, isbn);
            Store.addBook(book);
            UI.showAlert('Book Added', 'success');
            UI.displayBooks();
            UI.clearFields();
        }
    });
}

// Event: Handle Edit and Delete Actions
const list = document.querySelector('#book-list');
if (list) {
    list.addEventListener('click', (e) => {
        // Delete
        const deleteBtn = e.target.closest('.delete');
        if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const isbn = row?.children[2]?.textContent;
            if (isbn) Store.removeBook(isbn);
            if (row) row.remove();
            UI.showAlert('Book Removed', 'success');
            return;
        }

        // Edit
        const updateBtn = e.target.closest('.update');
        if (updateBtn) {
            const row = updateBtn.closest('tr');
            UI.updateBookForm(row);
        }
    });
}
