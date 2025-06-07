-- Database initialization script for Group Travel Expense Manager
-- Run this script to create the required tables

CREATE TABLE IF NOT EXISTS travelers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    profile_picture LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency ENUM('TOMAN', 'USD', 'EUR', 'GBP') NOT NULL DEFAULT 'TOMAN',
    payer_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    receipts JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payer_id) REFERENCES travelers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expense_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id VARCHAR(36) NOT NULL,
    traveler_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (traveler_id) REFERENCES travelers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (expense_id, traveler_id)
);

CREATE TABLE IF NOT EXISTS manual_payments (
    id VARCHAR(36) PRIMARY KEY,
    payer_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency ENUM('TOMAN', 'USD', 'EUR', 'GBP') NOT NULL DEFAULT 'TOMAN',
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payer_id) REFERENCES travelers(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES travelers(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_expenses_payer ON expenses(payer_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expense_participants_expense ON expense_participants(expense_id);
CREATE INDEX idx_expense_participants_traveler ON expense_participants(traveler_id);
CREATE INDEX idx_manual_payments_payer ON manual_payments(payer_id);
CREATE INDEX idx_manual_payments_receiver ON manual_payments(receiver_id);