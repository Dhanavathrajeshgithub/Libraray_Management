# Library Management System - Viva Questions and Answers

## 1. What is a Library Management System?

**Answer:** A Library Management System is a software solution used to manage books, users, borrowing records, returns, fines, and administrative activities in a library.

## 2. What is the main objective of this project?

**Answer:** The main objective of this project is to automate library operations and make book tracking easier for both users and administrators.

## 3. Why is this project useful?

**Answer:** It reduces manual work, saves time, improves record accuracy, and provides a better user experience for borrowing and returning books.

## 4. What are the major modules of this project?

**Answer:** The project includes user management, authentication, book management, borrowing and returning modules, fine calculation, password recovery, and admin dashboard features.

## 5. What role does the backend play in this project?

**Answer:** The backend handles data processing, authentication, database operations, book transactions, validation, and communication with the frontend.

## 6. What role does the frontend play in this project?

**Answer:** The frontend provides the user interface for registration, login, viewing books, borrowing and returning books, and managing library operations.

## 7. Which database is used in this project?

**Answer:** MongoDB is used as the database to store information about users, books, borrow records, and other relevant details.

## 8. How are users authenticated in the system?

**Answer:** Users are authenticated using email or username and password, along with JWT-based authentication and secure cookies.

## 9. What is the purpose of OTP verification?

**Answer:** OTP verification confirms the authenticity of the user’s email and protects the system from fake or unauthorized registrations.

## 10. How is a new book added to the system?

**Answer:** An admin adds a book by providing details such as title, author, description, price, and quantity. The backend saves this information in the database.

## 11. How does the borrow process work?

**Answer:** When a user borrows a book, the system checks whether the book exists, whether it is available, and whether the user is eligible to borrow it. If the conditions are satisfied, the borrow record is created and the book quantity is decreased.

## 12. What happens when a user returns a book?

**Answer:** The return process updates the borrow record, marks the book as returned, calculates a fine if applicable, and increases the available quantity of the book.

## 13. What is the purpose of the fine calculation feature?

**Answer:** The fine calculation feature charges a user if they return a book after the due date, promoting responsible usage and timely returns.

## 14. How is password recovery implemented?

**Answer:** The system sends a reset link to the user’s email, and the user can create a new password through that link.

## 15. What is the role of an admin in this project?

**Answer:** An admin manages books, users, and borrowing activities and can view important statistics through the dashboard.

## 16. What is the significance of the admin dashboard?

**Answer:** The dashboard gives the admin a quick summary of key metrics such as the number of users, books, borrowed books, and returned books.

## 17. What are the advantages of using Express.js in this project?

**Answer:** Express.js simplifies backend development by providing routing, middleware support, and an easy way to build APIs.

## 18. Why is React used in the frontend?

**Answer:** React is used because it allows the development of a dynamic and responsive user interface with reusable components.

## 19. How does the system ensure data security?

**Answer:** The system uses password hashing, secure token-based authentication, validated requests, and protected routes to improve security.

## 20. What is the importance of middleware in this project?

**Answer:** Middleware helps handle tasks such as authentication, error handling, request validation, and rate limiting in a structured way.

## 21. What is the purpose of the models folder?

**Answer:** The models folder defines the schema and structure of data for users, books, and borrow records in the database.

## 22. What is the purpose of the controllers folder?

**Answer:** The controllers contain the logic for processing requests and returning responses for different features.

## 23. What is the purpose of the routes folder?

**Answer:** The routes folder defines the API endpoints for the application so that the frontend can interact with the backend.

## 24. What challenges might occur in this project?

**Answer:** Challenges may include handling invalid requests, managing book availability, calculating fines correctly, and ensuring secure authentication.

## 25. How can this project be improved in the future?

**Answer:** The project can be improved by adding online payment for fines, QR code-based book scanning, notifications, analytics, and advanced search filters.
