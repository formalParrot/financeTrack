DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,         -- This is your "Login"
  type TEXT CHECK(type IN ('Income', 'Expense')) NOT NULL,
  amount REAL NOT NULL,
  item TEXT NOT NULL,             -- The "Reason"
  date TEXT NOT NULL
);
