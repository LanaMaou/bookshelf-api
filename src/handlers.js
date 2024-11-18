const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const id = nanoid(16);
  const { name, pageCount, readPage, ...insertData } = request.payload;

  if (name === undefined || name === '') {
    return h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      })
      .code(400);
  } else if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  const newBook = {
    ...insertData,
    id,
    name,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  return h
    .response({
      status: isSuccess ? 'success' : 'fail',
      message: isSuccess
        ? 'Buku berhasil ditambahkan'
        : 'Buku gagal ditambahkan',
      data: isSuccess ? { bookId: newBook.id } : undefined,
    })
    .code(isSuccess ? 201 : 500);
};

const getAllBooksHandler = (request) => {
  const filterBooks = () => {
    const { reading, finished, name } = request.query;
    if (books.length === 0) {
      return { books: [] };
    }

    if (reading !== undefined) {
      const isReading = reading === '1';
      return books.filter((book) => book.reading === isReading);
    }

    if (finished !== undefined) {
      const isFinished = finished === '1';
      return books.filter((book) => book.finished === isFinished);
    }

    if (name) {
      return books.filter((book) =>
        book.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    return books;
  };

  const mapBooksResponse = (books) =>
    books.map((book) => ({
      id: book.id,
      name: book.name,
      publisher: book.publisher,
    }));

  const filteredBooks = filterBooks();
  return {
    status: 'success',
    data: {
      books: mapBooksResponse(filteredBooks),
    },
  };
};

const getBookById = (request, h) => {
  const { id } = request.params;
  const book = books.find((book) => book.id === id);

  if (!book) {
    return h
      .response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      })
      .code(404);
  }

  return {
    status: 'success',
    data: { book },
  };
};

const editBookById = (request, h) => {
  const { id } = request.params;

  const { name, pageCount, readPage, ...updateData } = request.payload;

  const index = books.findIndex((book) => book.id === id);

  if (name === undefined || name === '') {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
      .code(400);
  } else if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  } else if (index === -1) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      .code(404);
  }

  books[index] = {
    ...books[index],
    ...updateData,
    name,
    pageCount,
    readPage,
    finished: pageCount === readPage,
    updatedAt: new Date().toISOString(),
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

const deleteBookById = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return h
      .response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      })
      .code(404);
  }

  books.splice(index, 1);
  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookById,
  editBookById,
  deleteBookById,
};
