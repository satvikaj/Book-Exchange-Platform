import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExchangePage.css';

const ExchangePage = ({ location, user }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    yearOfPublish: '',
    location: location,
    exchanger: user.username,
    image: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [exchangeBooks, setExchangeBooks] = useState([]);

  useEffect(() => {
    const fetchExchangeBooks = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exchange-books/${user.username}`);
        console.log("Fetched exchange books:", response.data);
        // Filter out the current user's books from the list
        const otherUsersBooks = response.data.filter(book => book.exchanger !== user.username);
        setExchangeBooks(otherUsersBooks);
      } catch (error) {
        console.error("Error fetching exchange books:", error.response?.data || error.message);
      }
    };

    fetchExchangeBooks();

    const timer = setTimeout(() => {
      if (formData.bookName) {
        fetchBookSuggestions(formData.bookName);
      }
    }, 300); // Debouncing API call by 300ms

    return () => clearTimeout(timer);
  }, [formData.bookName, user.username]);

  useEffect(() => {
    setFormData((prevData) => ({ ...prevData, location: location }));
  }, [location]);

  const fetchBookSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=YOUR_API_KEY`
      );

      if (response.data.items) {
        const books = response.data.items.map((item) => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          publishedDate: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.split('-')[0] : 'Unknown',
        }));

        setSuggestions(books.slice(0, 5)); // Limiting to top 5 suggestions
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setErrorMessage('No suggestions found for this book name');
      }
    } catch (error) {
      console.error('Error fetching book suggestions:', error);
      setErrorMessage('Failed to fetch suggestions. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      bookName: suggestion.title,
      yearOfPublish: suggestion.publishedDate,
    });
    setSelectedBookId(suggestion.id); // Set the selected book ID when suggestion is clicked
    setShowSuggestions(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedBookId || !formData.yearOfPublish || !formData.image) {
      setErrorMessage('Please complete all fields before submitting.');
      return;
    }

    const exchangeData = {
      bookTitle: formData.bookName,
      exchanger: user.username,
      location: formData.location,
    };

    console.log('Exchange data to be sent:', exchangeData);

    try {
      const response = await axios.post('http://localhost:5000/api/exchange-book', exchangeData);
      console.log('Response from server:', response.data);
      setSuccessMessage('Exchange request submitted successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error('Error posting exchange:', error.response?.data || error.message);
      setErrorMessage('Failed to post exchange. Please try again later.');
      setSuccessMessage('');
    }
  };

  // Handle exchange button click
// Example for updating the handleExchangeClick function
const handleExchangeClick = async (bookId) => {
    try {
      // Get the book from exchangeBooks list based on _id
      const book = exchangeBooks.find((b) => b._id.toString() === bookId);
  
      if (!book) {
        console.error("Book not found.");
        setErrorMessage('Book not found.');
        return;
      }
  
      const exchangeData = {
        bookId: book._id,  // Use MongoDB default _id
        exchanger: user.username,
        receiver: book.exchanger, // The user who posted the book for exchange
        location: book.location,
      };
  
      const response = await axios.post("http://localhost:5000/api/exchange-book-request", exchangeData);
      setSuccessMessage('Exchange request sent successfully!');
      setErrorMessage('');
    } catch (error) {
      console.error("Error sending exchange request:", error);
      setErrorMessage('Failed to send exchange request. Please try again later.');
      setSuccessMessage('');
    }
  };
   
  return (
    <div className="exchange-page">
      {/* Exchange Form Box */}
      <div className="exchange-form">
        <h2>Exchange Your Book</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Book Name:</label>
            <input
              type="text"
              name="bookName"
              value={formData.bookName}
              onChange={handleChange}
              required
            />
            {showSuggestions && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion.title} ({suggestion.authors} - {suggestion.publishedDate})
                  </li>
                ))}
                <li onClick={() => handleSuggestionClick({ title: formData.bookName, publishedDate: '', authors: '' })}>
                  {`Other: ${formData.bookName}`}
                </li>
              </ul>
            )}
          </div>
          <div>
            <label>Year of Publish:</label>
            <input
              type="number"
              name="yearOfPublish"
              value={formData.yearOfPublish}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled
            />
          </div>
          <div>
            <label>Image:</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
        {successMessage && <p className="success">{successMessage}</p>}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>

      {/* Books Available for Exchange Box */}
      <div className="exchange-list">
        <h3>Books Available for Exchange</h3>
        <ul>
          {exchangeBooks.length === 0 ? (
            <center><p>No books available for exchange.</p></center>
          ) : (
            exchangeBooks.map((book) => (
              <li key={book.bookId}>
                <b>Book Title: </b>{book.bookTitle}<br></br>
                <b>Location: </b> {book.location}
                <button 
                  className="exchange-button" 
                  onClick={() => handleExchangeClick(book.bookId)}>
                  Exchange
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ExchangePage;