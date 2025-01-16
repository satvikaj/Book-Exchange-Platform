import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobileNumber: user?.mobileNumber || "",
  });
  const [books, setBooks] = useState([]); // State to store books
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      window.location.href = "/"; // Redirect to login if no user
    }
  }, [user]);

  // Fetch books posted by the user
  useEffect(() => {
    if (user) {
      const fetchBooks = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/user-books/${user.username}`
          );
          setBooks(response.data || []);
        } catch (error) {
          console.error("Error fetching user books:", error);
          setError("Failed to fetch books. Please try again later.");
        }
      };
      fetchBooks();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage("");
    setError("");
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/${user.username}`,
        formData
      );
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user details:", error);
      setError("Failed to update profile. Please try again later.");
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber,
    });
    setError("");
  };

  // Delete a book
  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-book/${bookId}`);
      setBooks(books.filter((book) => book._id !== bookId)); // Remove the book from state
      setSuccessMessage("Book deleted successfully!");
    } catch (error) {
      console.error("Error deleting book:", error);
      setError("Failed to delete the book. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>User Profile</h2>
      </div>
      <div className="profile-content">
        {user && (
          <>
            <div className="profile-info">
              {isEditing ? (
                <div className="edit-form">
                  <label>
                    <strong>Username:</strong>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <strong>Email:</strong>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    <strong>Mobile Number:</strong>
                    <input
                      type="text"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                    />
                  </label>
                  <div className="edit-actions">
                    <button onClick={handleSaveClick}>Save</button>
                    <button onClick={handleCancelClick}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p>
                    <strong>Username:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Mobile Number:</strong> {user.mobileNumber}
                  </p>
                  <button onClick={handleEditClick}>Edit Profile</button>
                </>
              )}
            </div>

            <div className="user-books">
              <h3>Books for Sale</h3>
              {error && <p className="error">{error}</p>}
              {Array.isArray(books) && books.length === 0 ? (
                <p>No books posted for sale.</p>
              ) : (
                <div className="books-grid">
                  {books.map((book) => (
                    <div key={book._id} className="book-item">
                      {book.imageUrl && (
                        <img
                          src={`http://localhost:5000/${book.imageUrl}`}
                          alt={book.bookName}
                          className="book-image"
                        />
                      )}
                      <div className="book-details">
                        <h4>{book.bookName}</h4>
                        <p>
                          <strong>Year of Publish:</strong> {book.yearOfPublish}
                        </p>
                        <p>
                          <strong>Original Price:</strong> Rs.
                          {book.originalPrice}
                        </p>
                        <p>
                          <strong>Sell Price:</strong> Rs.{book.sellPrice}
                        </p>
                        <p>
                          <strong>Location:</strong> {book.location}
                        </p>
                      </div>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteBook(book._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {successMessage && <p className="success">{successMessage}</p>}
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;