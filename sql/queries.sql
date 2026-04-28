-- Assumptions (PostgreSQL):
-- Table: customers
-- Columns: first_name (text), last_name (text), email (text), created_at (timestamptz)

-- 1) Retrieve the 10 most recently onboarded customers.
SELECT *
FROM customers
ORDER BY created_at DESC
LIMIT 10;

-- 2) Filter all customers with emails from @gmail.com.
SELECT *
FROM customers
WHERE email ILIKE '%@gmail.com';

-- 3) Show the number of customers created per month in 2025.
SELECT DATE_TRUNC('month', created_at) AS month,
       COUNT(*)                    AS customers_created
FROM customers
WHERE created_at >= TIMESTAMPTZ '2025-01-01'
  AND created_at <  TIMESTAMPTZ '2026-01-01'
GROUP BY 1
ORDER BY 1;

-- 4) Find all email addresses that appear more than once.
SELECT email,
       COUNT(*) AS occurrences
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY occurrences DESC, email ASC;

-- 5) Find all customers whose first name starts with “A”.
SELECT *
FROM customers
WHERE first_name ILIKE 'A%';

