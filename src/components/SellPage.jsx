import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SellPage.css';

const SellPage = ({ location, user }) => {
  const [formData, setFormData] = useState({
    bookName: '',
    yearOfPublish: '',
    originalPrice: '',
    sellPrice: '',
    location: location, // Use the location prop
    seller: user.username, // Use the username from the user prop
    image: null, // Add image field
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.bookName) {
        fetchBookSuggestions(formData.bookName);
      }
    }, 300); // Debouncing API call by 300ms

    return () => clearTimeout(timer);
  }, [formData.bookName]);

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
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
          publishedDate: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.split('-')[0] : 'Unknown',
          originalPrice: item.saleInfo.listPrice ? item.saleInfo.listPrice.amount : '',
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

    // Validation for sell price
    if (name === 'sellPrice' && value >= formData.originalPrice) {
      setErrorMessage('Sell price should be less than the original price');
    } else {
      setErrorMessage('');
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({
      ...formData,
      bookName: suggestion.title,
      yearOfPublish: suggestion.publishedDate,
      originalPrice: suggestion.originalPrice || '', // Use fetched price or allow manual entry
    });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sellPrice >= formData.originalPrice) {
      setErrorMessage('Sell price should be less than the original price');
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/sell-book', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.message === 'Book posted successfully!') {
        setSuccessMessage('Book posted successfully!');
        setFormData({
          bookName: '',
          yearOfPublish: '',
          originalPrice: '',
          sellPrice: '',
          location: location, // Reset location from prop
          seller: user.username, // Reset seller from user prop
          image: null, // Reset image field
        });
        setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
      }
    } catch (error) {
      console.error('Error posting book:', error);
      setErrorMessage('Failed to post book. Please try again later.');
    }
  };

  return (
    <div className="sell-page">
      <h2>Sell Your Book</h2>
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
              <li onClick={() => handleSuggestionClick({ title: formData.bookName, publishedDate: '', authors: '', originalPrice: '' })}>
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
          <label>Original Price:</label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleChange}
            required
            placeholder="Enter original price if not fetched"
          />
        </div>
        <div>
          <label>Sell Price:</label>
          <input
            type="number"
            name="sellPrice"
            value={formData.sellPrice}
            onChange={handleChange}
            required
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            disabled // Disable manual editing of location
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
  );
};

export default SellPage;