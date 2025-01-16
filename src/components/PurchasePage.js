import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PurchasePage.css";

const PurchasePage = ({ user }) => {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null); // State to track selected book
  const [orderStatus, setOrderStatus] = useState(""); // State to track order status

  // Fetch books for purchase
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/purchase-books/${user.username}`
        );
        
        setAvailableBooks(response.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        setFetchError("Failed to fetch books. Please try again later.");
      }
    };

    fetchBooks();
  }, [user]);

  // Handle Book Selection
  const handleSelectBook = (book) => {
    console.log("Book selected:", book); // Check if the book is selected
    setSelectedBook(book);
  };

  // Handle Book Purchase
  const handleBuyBook = async () => {
    if (!selectedBook) {
      setOrderStatus("Please select a book to buy.");
      return;
    }
  
    try {
      console.log("Sending purchase request for book:", selectedBook); // Check what is being sent
      const response = await axios.post(
        `http://localhost:5000/api/buy-book`, 
        {
          user: user.username,
          bookId: selectedBook._id,
        }
      );
      
      setOrderStatus("Your book order has been placed!");
    } catch (error) {
      console.error("Error purchasing book:", error);
      setOrderStatus("Failed to place your order. Please try again.");
    }
  };

  return (
    <div className="purchase-container">
      <div className="purchase-header">
        <h1>Available Books for Purchase</h1>
      </div>
      <div className="purchase-content">
        {fetchError && <p className="error">{fetchError}</p>}
        {availableBooks.length === 0 ? (
          <p>No books available for purchase.</p>
        ) : (
          <div className="books-grid">
            {availableBooks.map((book, index) => (
              <div key={index} className="book-item">
                {book.imageUrl && (
                  <img
                    src={`http://localhost:5000/${book.imageUrl}`} // Fixed template literal
                    alt={book.bookName}
                    className="book-image"
                  />
                )}
                <div className="book-details">
                  <h2>{book.bookName}</h2>
                  <p>
                    <strong>Year of Publish:</strong> {book.yearOfPublish}
                  </p>
                  <p>
                    <strong>Original Price:</strong> Rs.{book.originalPrice}
                  </p>
                  <p>
                    <strong>Sell Price:</strong> Rs.{book.sellPrice}
                  </p>
                  <p>
                    <strong>Location:</strong> {book.location}
                  </p>
                  {/* Add "Select" button */}
                  <button
                    onClick={() => handleSelectBook(book)}
                    className="select-book-button"
                  >
                    Select Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Buy Book" Button and Order Status */}
      <div className="purchase-action">
        <button onClick={handleBuyBook} className="buy-book-button">
          Buy Book
        </button>
        {orderStatus && <p className="order-status">{orderStatus}</p>}
      </div>
    </div>
  );
};

export default PurchasePage;