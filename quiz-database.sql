CREATE DATABASE quiz_app;

USE quiz_app;

-- Quizzes Table
CREATE TABLE quizzes (
    id VARCHAR(100) PRIMARY KEY,
    duration INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id VARCHAR(100),
    question TEXT NOT NULL,
    opt1 TEXT,
    opt2 TEXT,
    opt3 TEXT,
    opt4 TEXT,
    correct_answer TEXT,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Users Table
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY
);

-- Answers Table
CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100),
    quiz_id VARCHAR(100),
    question_id INT,
    selected_option TEXT,
    score INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
