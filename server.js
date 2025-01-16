const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();  // Load environment variables
const sendEmail = require("./emailService"); // Adjust the path as needed
// Adjust path if needed
const app = express();
const PORT = 5000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and JPG files are allowed."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Connect to MongoDB for user data
const userDB = mongoose.createConnection("mongodb://127.0.0.1:27017/userdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB for book data
const bookDB = mongoose.createConnection("mongodb://127.0.0.1:27017/bookdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  dob: { type: Date, required: true },
  
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  purchasedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }], // Add this line
});

const User = userDB.model("User", userSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  yearOfPublish: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true },
  location:{type:String,required: true},
  postedDate: { type: Date, default: Date.now },
  seller: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const Book = bookDB.model("Book", bookSchema);
const exchangeBookSchema = new mongoose.Schema({
  bookTitle: { type: String, required: true },
  exchanger: { type: String, required: true },
  location: { type: String, required: true },
  // Additional fields like image or bookId can be added as needed
});
const ExchangeBook = bookDB.model('ExchangeBook', exchangeBookSchema);

module.exports = ExchangeBook;
userDB.on('connected', () => console.log('Connected to userdb.'));
userDB.on('error', (err) => console.error('Error connecting to userdb:', err));

bookDB.on('connected', () => console.log('Connected to bookdb.'));
bookDB.on('error', (err) => console.error('Error connecting to bookdb:', err));

// Signup Endpoint
app.post("/api/signup", async (req, res) => {
  const { username, email, password, dob, mobileNumber } = req.body;

  if (!username || !email || !password || !dob || !mobileNumber) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const newUser = new User({ username, email, password, dob: new Date(dob), mobileNumber });
    await newUser.save();
    res.json({ message: "Signup successful! You can now log in." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login Endpoint
app.post("/api/login", async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/email and password are required." });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username/email or password." });
    }

    const { password: userPassword, ...userData } = user.toObject();
    res.json({
      message: "Login successful!",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
  const { identifier, dob } = req.body;

  if (!identifier || !dob) {
    return res.status(400).json({ message: "Username/email and date of birth are required." });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user || new Date(user.dob).getTime() !== new Date(dob).getTime()) {
      return res.status(400).json({ message: "Invalid username/email or date of birth." });
    }

    res.json({ message: "Verification successful! You can reset your password." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Reset Password Endpoint
app.post("/api/reset-password", async (req, res) => {
  const { identifier, newPassword } = req.body;

  if (!identifier || !newPassword) {
    return res.status(400).json({ message: "Username/email and new password are required." });
  }

  try {
    const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Sell Book Endpoint
// Sell Book Endpoint
app.post("/api/sell-book", upload.single("image"), async (req, res) => {
  const { bookName, yearOfPublish, originalPrice, sellPrice, location, seller } = req.body;

  if (!bookName || !yearOfPublish || !originalPrice || !sellPrice || !location || !seller) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (sellPrice >= originalPrice) {
    return res.status(400).json({ message: "Sell price should be less than the original price." });
  }

  const imageUrl = req.file ? req.file.path : null;

  try {
    const newBook = new Book({
      bookName,
      yearOfPublish,
      originalPrice,
      sellPrice,
      location,
      seller,
      imageUrl,
    });

    await newBook.save();

    const user = await User.findOne({ username: seller });
    if (user) {
      user.books.push(newBook._id);
      await user.save();
    }

    res.json({ message: "Book posted successfully!" });
  } catch (error) {
    console.error("Error posting book:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Fetch User Books Endpoint
app.get("/api/user-books/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const books = await Book.find({ seller: username });
    res.json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    res.status(500).json({ message: "Failed to fetch books. Please try again later." });
  }
});
// Fetch All Books for Sale
app.get("/api/books-for-sale", async (req, res) => {
  try {
    const books = await Book.find(); // Fetch all books
    res.json(books);
  } catch (error) {
    console.error("Error fetching books for sale:", error);
    res.status(500).json({ message: "Failed to fetch books. Please try again later." });
  }
});
// Fetch books available for purchase (posted by other users)
app.get("/api/purchase-books/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch books that are not posted by the current user
    const books = await Book.find({ seller: { $ne: username } }); // Exclude books posted by the current user
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Failed to fetch books. Please try again later." });
  }
});
// Node.js/Express example
app.put('/api/user/:username', async (req, res) => {
  const { username } = req.params;
  const { email, mobileNumber } = req.body;

  try {
    // Update user details in the database
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { email, mobileNumber },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Purchase Book Endpoint (Backend)
app.post("/api/buy-book", async (req, res) => {
  const { user, bookId } = req.body;

  // Input validation
  if (!user || !bookId) {
    return res.status(400).json({ message: "User and Book ID are required." });
  }

  try {
    // Step 1: Fetch the book by ID
    const book = await Book.findById(bookId);
    if (!book) {
      console.error(`Book not found: ${bookId}`);
      return res.status(404).json({ message: "Book not found." });
    }
    
    console.log("Book found:", book);

    // Step 2: Fetch the buyer (user)
    const userData = await User.findOne({ username: user });
    if (!userData) {
      console.error(`User not found: ${user}`);
      return res.status(404).json({ message: "User not found." });
    }
    console.log("User found:", userData);

    // Step 3: Fetch the seller
    const seller = await User.findOne({ username: book.seller });
    if (!seller) {
      console.error(`Seller not found for book: ${bookId}`);
      return res.status(404).json({ message: "Seller not found for the book." });
    }
    console.log("Seller found:", seller);

    // Step 4: Add the book to the user's purchasedBooks array
    userData.purchasedBooks = userData.purchasedBooks || [];
    userData.purchasedBooks.push(bookId);
    await userData.save();
    console.log("Book added to user's purchasedBooks array.");

    // Step 5: Prepare email content
    const sellerEmailText = `
      Hello, ${seller.username}!
      
      You have sold the following book:
      
      - ${book.bookName}
      
      Buyer details:
      Name: ${userData.username}
      Phone: ${userData.mobileNumber}
      
      Thank you for using our platform!
    `;

    const buyerEmailText = `
      Hello, ${userData.username}!
      
      You have successfully purchased the following book:
      
      - ${book.bookName}
      
      Seller details:
      Name: ${seller.username}
      Phone: ${seller.mobileNumber}
      
      Thank you for your purchase!
    `;

    // Step 6: Send emails
    await sendEmail(seller.email, "Book Sale Notification", sellerEmailText);
    await sendEmail(userData.email, "Purchase Confirmation", buyerEmailText);
    console.log("Emails sent to both buyer and seller.");

    // Step 7: Send response back to client
    res.json({ message: "Book purchase successful! Emails sent." });

  } catch (error) {
    console.error("Error processing purchase:", error.stack || error.message);
    res.status(500).json({ message: "Failed to purchase book. Please try again." });
  }
});
app.post('/api/exchange-book-request', async (req, res) => {
  const { bookId, exchanger, receiver, location } = req.body;

  // Validate the bookId format
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid bookId format' });
  }

  try {
    // Convert bookId to ObjectId
    const bookObjectId = mongoose.Types.ObjectId(bookId);

    // Create the exchange request
    const exchangeRequest = new Exchange({
      bookId: bookObjectId,
      exchanger,
      receiver,
      location,
    });

    await exchangeRequest.save();

    // Respond with success message
    res.status(200).json({ message: 'Exchange request submitted successfully!' });
  } catch (error) {
    console.error('Error submitting exchange request:', error);
    res.status(500).json({ message: 'Error submitting exchange request.' });
  }
});

app.post('/api/exchange-book', async (req, res) => {
  const { bookTitle, exchanger, location } = req.body;

  try {
    // Validate input
    if (!bookTitle || !exchanger || !location) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create a new exchange book entry
    const newExchangeBook = new ExchangeBook({
      bookTitle,
      exchanger,
      location,
    });

    await newExchangeBook.save();
    return res.status(201).json({ message: 'Exchange request created successfully.' });
  } catch (error) {
    console.error('Error creating exchange book:', error);
    return res.status(500).json({ error: 'Failed to create exchange request.' });
  }
});
// Route to fetch exchange books for a specific user
app.get('/api/exchange-books/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Fetch exchange requests where the current user is not the exchanger
    const exchangeBooks = await ExchangeBook.find({ exchanger: { $ne: username } });

    // Check if any books are found
    if (exchangeBooks.length === 0) {
      return res.status(404).json({ message: 'No books available for exchange.' });
    }

    res.json(exchangeBooks);
  } catch (error) {
    console.error('Error fetching exchange books:', error);
    res.status(500).json({ error: 'Failed to fetch exchange books. Please try again later.' });
  }
});
// Delete Book Endpoint
app.delete("/api/delete-book/:bookId", async (req, res) => {
  const { bookId } = req.params;

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const seller = await User.findOne({ username: book.seller });
    if (seller) {
      // Remove book ID from the user's books array
      seller.books = seller.books.filter((id) => id.toString() !== bookId);
      await seller.save();
    }

    // Delete the book from the database
    await Book.findByIdAndDelete(bookId);

    res.json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Failed to delete book. Please try again." });
  }
});
// Catch-All for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});