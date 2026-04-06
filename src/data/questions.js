const questions = [
  // ── SECTION 4-A: CRUD ──────────────────────────────────────────────────────
  {
    id: 1,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "INSERT — Single Row",
    db: "amazon_db",
    question:
      "Insert a new customer named Test User from Mumbai with email test@example.com, phone 9000000000, loyalty tier Bronze, and today's joining date.",
    answer: `USE amazon_db;
INSERT INTO customers (full_name, email, phone, city, country, loyalty_tier, joined_date, gender)
VALUES ('Test User', 'test@example.com', '9000000000',
        'Mumbai', 'India', 'Bronze', CURDATE(), 'Male');`,
    hint: "CURDATE() inserts today's date automatically.",
    tags: ["INSERT", "CURDATE"],
  },
  {
    id: 2,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "INSERT — Multiple Rows",
    db: "amazon_db",
    question:
      "Add two product reviews in one query: a 5-star review for product 2 by customer 11, and a 4-star review for product 7 by customer 9.",
    answer: `INSERT INTO reviews (product_id, customer_id, rating, review_text, review_date)
VALUES
  (2, 11, 5, 'Samsung S24 is stunning!', CURDATE()),
  (7,  9, 4, 'HP Pavilion is good value.', CURDATE());`,
    hint: "Multiple rows in one INSERT saves round-trips to the DB.",
    tags: ["INSERT", "Multi-row"],
  },
  {
    id: 3,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "SELECT — All Data",
    db: "amazon_db",
    question: "Retrieve all details of every customer in the database.",
    answer: `SELECT * FROM customers;`,
    hint: "SELECT * retrieves every column from the table.",
    tags: ["SELECT"],
  },
  {
    id: 4,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "SELECT — Specific Columns",
    db: "amazon_db",
    question: "Display only the name, email, and city of all customers.",
    answer: `SELECT full_name, email, city
FROM customers;`,
    hint: "List only the columns you need instead of using SELECT *.",
    tags: ["SELECT"],
  },
  {
    id: 5,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "SELECT — WHERE Filter",
    db: "amazon_db",
    question: "Find all customers who belong to the Prime loyalty tier.",
    answer: `SELECT full_name, email, city
FROM customers
WHERE loyalty_tier = 'Prime';`,
    hint: "Use WHERE to filter rows by a condition.",
    tags: ["SELECT", "WHERE"],
  },
  {
    id: 6,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "UPDATE — Single Row",
    db: "amazon_db",
    question: "Upgrade the loyalty tier of the customer with ID 4 to Gold.",
    answer: `UPDATE customers
SET loyalty_tier = 'Gold'
WHERE customer_id = 4;`,
    hint: "Always use WHERE in UPDATE — without it, all rows get updated!",
    tags: ["UPDATE", "WHERE"],
  },
  {
    id: 7,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "UPDATE — Bulk Update",
    db: "amazon_db",
    question:
      "Apply a 10% price discount to all products in the Books category (category_id = 8).",
    answer: `UPDATE products
SET price = price * 0.90
WHERE category_id = 8;`,
    hint: "You can use arithmetic expressions in SET.",
    tags: ["UPDATE", "Bulk"],
  },
  {
    id: 8,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "DELETE — Safe Delete",
    db: "amazon_db",
    question: "Remove the customer whose email is test@example.com.",
    answer: `DELETE FROM customers
WHERE email = 'test@example.com';`,
    hint: "Always filter DELETE with WHERE — without it, all rows are deleted!",
    tags: ["DELETE", "WHERE"],
  },
  {
    id: 9,
    section: "4-A",
    sectionTitle: "CRUD",
    topic: "DELETE — Latest Record",
    db: "amazon_db",
    question: "Delete the most recently added review from the reviews table.",
    answer: `DELETE FROM reviews
WHERE review_id = (
  SELECT MAX(review_id)
  FROM (SELECT review_id FROM reviews) AS r
);`,
    hint: "MySQL requires a subquery wrapper to use a subquery in DELETE on the same table.",
    tags: ["DELETE", "Subquery", "MAX"],
  },

  // ── SECTION 4-B: FILTERING ─────────────────────────────────────────────────
  {
    id: 10,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "LIMIT",
    db: "amazon_db",
    question: "Retrieve the top 5 most expensive products.",
    answer: `SELECT product_name, price
FROM products
ORDER BY price DESC
LIMIT 5;`,
    hint: "LIMIT restricts the number of rows returned.",
    tags: ["LIMIT", "ORDER BY"],
  },
  {
    id: 11,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "LIMIT + OFFSET — Pagination",
    db: "amazon_db",
    question:
      "Fetch the next 5 expensive products after the first 5 (i.e., results 6 to 10 — page 2).",
    answer: `SELECT product_name, price
FROM products
ORDER BY price DESC
LIMIT 5 OFFSET 5;`,
    hint: "OFFSET 5 skips the first 5 rows. Pattern: LIMIT page_size OFFSET (page-1)*page_size.",
    tags: ["LIMIT", "OFFSET", "Pagination"],
  },
  {
    id: 12,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "DISTINCT — Single Column",
    db: "amazon_db",
    question: "List all unique cities where customers are located.",
    answer: `SELECT DISTINCT city
FROM customers;`,
    hint: "DISTINCT removes duplicate values from the result set.",
    tags: ["DISTINCT"],
  },
  {
    id: 13,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "DISTINCT — Multiple Columns",
    db: "amazon_db",
    question:
      "Find all unique combinations of city and country from the customers table.",
    answer: `SELECT DISTINCT city, country
FROM customers
ORDER BY city;`,
    hint: "DISTINCT on multiple columns returns unique row combinations.",
    tags: ["DISTINCT", "ORDER BY"],
  },
  {
    id: 14,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "ORDER BY — Single Column",
    db: "amazon_db",
    question: "Sort all products by price in ascending order.",
    answer: `SELECT product_name, price
FROM products
ORDER BY price ASC;`,
    hint: "ASC is the default sort direction.",
    tags: ["ORDER BY"],
  },
  {
    id: 15,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "ORDER BY — Multiple Columns",
    db: "amazon_db",
    question:
      "Sort customers by loyalty tier alphabetically, and within the same tier sort by customer name.",
    answer: `SELECT full_name, loyalty_tier, city
FROM customers
ORDER BY loyalty_tier ASC, full_name ASC;`,
    hint: "You can chain multiple ORDER BY columns separated by commas.",
    tags: ["ORDER BY"],
  },
  {
    id: 16,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "LIKE — Starts With (%)",
    db: "amazon_db",
    question: "Find products whose names start with the letter 'A'.",
    answer: `SELECT product_name
FROM products
WHERE product_name LIKE 'A%';`,
    hint: "% matches zero or more characters. 'A%' = starts with A.",
    tags: ["LIKE", "WHERE"],
  },
  {
    id: 17,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "LIKE — Contains (%word%)",
    db: "amazon_db",
    question: "Find all products whose name contains the word 'Pro'.",
    answer: `SELECT product_name
FROM products
WHERE product_name LIKE '%Pro%';`,
    hint: "'%Pro%' matches any string with 'Pro' anywhere in it.",
    tags: ["LIKE", "WHERE"],
  },
  {
    id: 18,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "LIKE — Exact Length Wildcard (_)",
    db: "amazon_db",
    question: "Find all brands that have exactly 4 characters.",
    answer: `SELECT DISTINCT brand
FROM products
WHERE brand LIKE '____';`,
    hint: "Each underscore _ matches exactly ONE character.",
    tags: ["LIKE", "DISTINCT"],
  },
  {
    id: 19,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "BETWEEN — Numeric Range",
    db: "amazon_db",
    question: "Find all products priced between Rs.500 and Rs.5000.",
    answer: `SELECT product_name, price
FROM products
WHERE price BETWEEN 500 AND 5000;`,
    hint: "BETWEEN is inclusive on both ends.",
    tags: ["BETWEEN", "WHERE"],
  },
  {
    id: 20,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "BETWEEN — Date Range",
    db: "amazon_db",
    question: "Retrieve all orders placed in Q1 2024 (January to March 2024).",
    answer: `SELECT order_id, order_date, total_amount
FROM orders
WHERE order_date BETWEEN '2024-01-01' AND '2024-03-31'
ORDER BY order_date;`,
    hint: "BETWEEN works on dates too — use ISO format 'YYYY-MM-DD'.",
    tags: ["BETWEEN", "Dates"],
  },
  {
    id: 21,
    section: "4-B",
    sectionTitle: "Filtering",
    topic: "ALIAS — Column and Table Alias",
    db: "amazon_db",
    question:
      "Display product name as 'Product', price as 'MRP (Rs.)', and seller name as 'Sold By' using table aliases.",
    answer: `SELECT p.product_name AS "Product",
       p.price        AS "MRP (Rs.)",
       s.seller_name  AS "Sold By"
FROM products p
JOIN sellers s ON p.seller_id = s.seller_id
ORDER BY p.price DESC;`,
    hint: "AS renames a column in output. Table aliases (p, s) shorten JOIN syntax.",
    tags: ["ALIAS", "AS", "JOIN"],
  },

  // ── SECTION 4-C: AGGREGATE FUNCTIONS ──────────────────────────────────────
  {
    id: 22,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "COUNT — Total Rows",
    db: "amazon_db",
    question: "Count the total number of customers in the database.",
    answer: `SELECT COUNT(*) AS total_customers
FROM customers;`,
    hint: "COUNT(*) counts all rows including NULLs.",
    tags: ["COUNT", "Aggregate"],
  },
  {
    id: 23,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "COUNT — With GROUP BY",
    db: "amazon_db",
    question: "Find how many products exist in each category.",
    answer: `SELECT c.category_name,
       COUNT(p.product_id) AS product_count
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY product_count DESC;`,
    hint: "Use LEFT JOIN to include categories with zero products.",
    tags: ["COUNT", "GROUP BY", "LEFT JOIN"],
  },
  {
    id: 24,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "SUM — Total Revenue",
    db: "amazon_db",
    question:
      "Calculate the total revenue generated from all Delivered orders.",
    answer: `SELECT SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'Delivered';`,
    hint: "SUM adds up all values in a column.",
    tags: ["SUM", "WHERE"],
  },
  {
    id: 25,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "SUM — Per Group",
    db: "amazon_db",
    question:
      "Find the total amount spent by each customer (only Delivered orders).",
    answer: `SELECT cu.full_name,
       SUM(o.total_amount) AS total_spent
FROM customers cu
JOIN orders o ON cu.customer_id = o.customer_id
WHERE o.status = 'Delivered'
GROUP BY cu.full_name
ORDER BY total_spent DESC;`,
    hint: "Combine SUM with GROUP BY to aggregate per customer.",
    tags: ["SUM", "GROUP BY", "JOIN"],
  },
  {
    id: 26,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "MIN and MAX",
    db: "amazon_db",
    question:
      "Find the cheapest and most expensive product in each category.",
    answer: `SELECT c.category_name,
       MIN(p.price) AS cheapest,
       MAX(p.price) AS most_expensive
FROM categories c
JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_name;`,
    hint: "MIN and MAX can be used together in the same SELECT.",
    tags: ["MIN", "MAX", "GROUP BY"],
  },
  {
    id: 27,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "AVG — Product Rating",
    db: "amazon_db",
    question:
      "Calculate the average customer rating for each product, along with how many reviews it has.",
    answer: `SELECT p.product_name,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.review_id)      AS review_count
FROM products p
JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.product_name
ORDER BY avg_rating DESC;`,
    hint: "Use ROUND(AVG(...), 2) for clean decimal output.",
    tags: ["AVG", "COUNT", "GROUP BY"],
  },
  {
    id: 28,
    section: "4-C",
    sectionTitle: "Aggregate Functions",
    topic: "AVG — Per Loyalty Tier",
    db: "amazon_db",
    question:
      "Find the average order value for each customer loyalty tier.",
    answer: `SELECT cu.loyalty_tier,
       ROUND(AVG(o.total_amount), 2) AS avg_order_value
FROM customers cu
JOIN orders o ON cu.customer_id = o.customer_id
GROUP BY cu.loyalty_tier
ORDER BY avg_order_value DESC;`,
    hint: "Join customers to orders, then group by loyalty tier.",
    tags: ["AVG", "GROUP BY", "JOIN"],
  },

  // ── SECTION 4-D: WINDOW FUNCTIONS ─────────────────────────────────────────
  {
    id: 29,
    section: "4-D",
    sectionTitle: "Window Functions",
    topic: "RANK() OVER PARTITION",
    db: "amazon_db",
    question:
      "Rank products by price within each category (highest price = rank 1).",
    answer: `SELECT p.product_name,
       c.category_name,
       p.price,
       RANK() OVER (
         PARTITION BY p.category_id
         ORDER BY p.price DESC
       ) AS price_rank
FROM products p
JOIN categories c ON p.category_id = c.category_id;`,
    hint: "RANK() skips numbers after ties. Use DENSE_RANK() to avoid gaps.",
    tags: ["RANK", "Window Functions", "PARTITION BY"],
  },
  {
    id: 30,
    section: "4-D",
    sectionTitle: "Window Functions",
    topic: "ROW_NUMBER() OVER PARTITION",
    db: "amazon_db",
    question:
      "Assign a sequential order number to each customer's orders sorted by order date.",
    answer: `SELECT cu.full_name,
       o.order_id,
       o.order_date,
       o.total_amount,
       ROW_NUMBER() OVER (
         PARTITION BY o.customer_id
         ORDER BY o.order_date
       ) AS order_seq
FROM orders o
JOIN customers cu ON o.customer_id = cu.customer_id;`,
    hint: "ROW_NUMBER() always gives unique numbers — no ties.",
    tags: ["ROW_NUMBER", "Window Functions", "PARTITION BY"],
  },
  {
    id: 31,
    section: "4-D",
    sectionTitle: "Window Functions",
    topic: "DENSE_RANK()",
    db: "amazon_db",
    question:
      "Rank sellers by number of products they sell — no gaps in ranking.",
    answer: `SELECT s.seller_name,
       COUNT(p.product_id) AS product_count,
       DENSE_RANK() OVER (
         ORDER BY COUNT(p.product_id) DESC
       ) AS rank_pos
FROM sellers s
JOIN products p ON s.seller_id = p.seller_id
GROUP BY s.seller_name;`,
    hint: "DENSE_RANK(): if two sellers tie at rank 1, the next is rank 2 (not 3).",
    tags: ["DENSE_RANK", "Window Functions"],
  },
  {
    id: 32,
    section: "4-D",
    sectionTitle: "Window Functions",
    topic: "Running Total with SUM OVER",
    db: "amazon_db",
    question:
      "Show cumulative (running) revenue from delivered orders over time.",
    answer: `SELECT order_id,
       order_date,
       total_amount,
       SUM(total_amount) OVER (
         ORDER BY order_date
       ) AS running_total
FROM orders
WHERE status = 'Delivered'
ORDER BY order_date;`,
    hint: "SUM() OVER (ORDER BY ...) creates a running total without GROUP BY.",
    tags: ["SUM OVER", "Running Total", "Window Functions"],
  },

  // ── SECTION 4-E: GROUP BY & HAVING ─────────────────────────────────────────
  {
    id: 33,
    section: "4-E",
    sectionTitle: "GROUP BY & HAVING",
    topic: "GROUP BY — Order Status Count",
    db: "amazon_db",
    question: "Count the number of orders for each order status.",
    answer: `SELECT status,
       COUNT(*) AS order_count
FROM orders
GROUP BY status;`,
    hint: "GROUP BY collapses rows with the same value into a single row.",
    tags: ["GROUP BY", "COUNT"],
  },
  {
    id: 34,
    section: "4-E",
    sectionTitle: "GROUP BY & HAVING",
    topic: "GROUP BY — Units Sold per Product",
    db: "amazon_db",
    question: "Find the total units sold for each product.",
    answer: `SELECT p.product_name,
       SUM(oi.quantity) AS units_sold
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name
ORDER BY units_sold DESC;`,
    hint: "SUM(quantity) with GROUP BY gives total units per product.",
    tags: ["GROUP BY", "SUM", "JOIN"],
  },
  {
    id: 35,
    section: "4-E",
    sectionTitle: "GROUP BY & HAVING",
    topic: "HAVING — Filter Aggregated Groups",
    db: "amazon_db",
    question: "Find categories that have more than 2 products listed.",
    answer: `SELECT c.category_name,
       COUNT(p.product_id) AS product_count
FROM categories c
JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_name
HAVING COUNT(p.product_id) > 2
ORDER BY product_count DESC;`,
    hint: "HAVING filters AFTER grouping; WHERE filters BEFORE grouping.",
    tags: ["HAVING", "GROUP BY", "COUNT"],
  },
  {
    id: 36,
    section: "4-E",
    sectionTitle: "GROUP BY & HAVING",
    topic: "HAVING — Aggregate Condition on Sellers",
    db: "amazon_db",
    question:
      "Find sellers whose average product price is greater than Rs.30,000.",
    answer: `SELECT s.seller_name,
       ROUND(AVG(p.price), 2) AS avg_price
FROM sellers s
JOIN products p ON s.seller_id = p.seller_id
GROUP BY s.seller_name
HAVING AVG(p.price) > 30000;`,
    hint: "Use HAVING with aggregate functions to filter after grouping.",
    tags: ["HAVING", "AVG", "GROUP BY"],
  },
  {
    id: 37,
    section: "4-E",
    sectionTitle: "GROUP BY & HAVING",
    topic: "HAVING — Customer Order Count",
    db: "amazon_db",
    question: "Find customers who have placed more than one order.",
    answer: `SELECT cu.full_name,
       COUNT(o.order_id) AS total_orders
FROM customers cu
JOIN orders o ON cu.customer_id = o.customer_id
GROUP BY cu.full_name
HAVING COUNT(o.order_id) > 1
ORDER BY total_orders DESC;`,
    hint: "HAVING COUNT(...) > 1 keeps only groups with multiple rows.",
    tags: ["HAVING", "COUNT", "GROUP BY"],
  },

  // ── SECTION 4-F: CASE WHEN ─────────────────────────────────────────────────
  {
    id: 38,
    section: "4-F",
    sectionTitle: "CASE WHEN",
    topic: "CASE — Price Segmentation",
    db: "amazon_db",
    question:
      "Categorize each product as Budget, Mid-range, Premium, or Flagship based on its price.",
    answer: `SELECT product_name, price,
       CASE
         WHEN price < 1000            THEN 'Budget'
         WHEN price BETWEEN 1000 AND 20000  THEN 'Mid-range'
         WHEN price BETWEEN 20001 AND 80000 THEN 'Premium'
         ELSE 'Flagship'
       END AS price_segment
FROM products
ORDER BY price;`,
    hint: "CASE evaluates conditions top-to-bottom; first TRUE wins.",
    tags: ["CASE WHEN", "Conditional"],
  },
  {
    id: 39,
    section: "4-F",
    sectionTitle: "CASE WHEN",
    topic: "CASE — Order Value Label",
    db: "amazon_db",
    question:
      "Label each order as High Value, Medium Value, or Low Value based on total amount.",
    answer: `SELECT order_id, total_amount,
       CASE
         WHEN total_amount > 100000 THEN 'High Value'
         WHEN total_amount > 20000  THEN 'Medium Value'
         ELSE 'Low Value'
       END AS order_tier
FROM orders;`,
    hint: "ELSE catches everything that doesn't match prior conditions.",
    tags: ["CASE WHEN", "Conditional"],
  },
  {
    id: 40,
    section: "4-F",
    sectionTitle: "CASE WHEN",
    topic: "CASE — Pivot: Order Status Counts in One Row",
    db: "amazon_db",
    question:
      "Show count of orders per status (Delivered, Shipped, Pending, Cancelled, Returned) all in a single row.",
    answer: `SELECT
  SUM(CASE WHEN status = 'Delivered'  THEN 1 ELSE 0 END) AS delivered,
  SUM(CASE WHEN status = 'Shipped'    THEN 1 ELSE 0 END) AS shipped,
  SUM(CASE WHEN status = 'Pending'    THEN 1 ELSE 0 END) AS pending,
  SUM(CASE WHEN status = 'Cancelled'  THEN 1 ELSE 0 END) AS cancelled,
  SUM(CASE WHEN status = 'Returned'   THEN 1 ELSE 0 END) AS returned
FROM orders;`,
    hint: "This is called a conditional aggregation pivot — very common in reports.",
    tags: ["CASE WHEN", "Pivot", "SUM"],
  },
  {
    id: 41,
    section: "4-F",
    sectionTitle: "CASE WHEN",
    topic: "CASE — Netflix: Content Quality Label",
    db: "netflix_db",
    question:
      "Classify Netflix content as Masterpiece, Excellent, Good, or Average based on IMDB score.",
    answer: `USE netflix_db;
SELECT title, imdb_score,
       CASE
         WHEN imdb_score >= 9.0 THEN 'Masterpiece'
         WHEN imdb_score >= 8.0 THEN 'Excellent'
         WHEN imdb_score >= 7.0 THEN 'Good'
         ELSE 'Average'
       END AS quality_label
FROM content
ORDER BY imdb_score DESC;`,
    hint: "Conditions are evaluated in order — highest threshold first.",
    tags: ["CASE WHEN", "Netflix"],
  },
  {
    id: 42,
    section: "4-F",
    sectionTitle: "CASE WHEN",
    topic: "CASE — Spotify: Stream Tier Badge",
    db: "spotify_db",
    question:
      "Classify each song as Diamond, Platinum, Gold, or Silver based on stream count.",
    answer: `USE spotify_db;
SELECT song_name,
       CASE
         WHEN streams_count >= 3000000000 THEN 'Diamond'
         WHEN streams_count >= 1000000000 THEN 'Platinum'
         WHEN streams_count >= 500000000  THEN 'Gold'
         ELSE 'Silver'
       END AS stream_tier
FROM songs
ORDER BY streams_count DESC;`,
    hint: "Large numeric thresholds work in CASE just like any comparison.",
    tags: ["CASE WHEN", "Spotify"],
  },

  // ── SECTION 4-G: JOINS ─────────────────────────────────────────────────────
  {
    id: 43,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "INNER JOIN — Products with Categories",
    db: "amazon_db",
    question:
      "Retrieve each product along with its category name. Only show products that have a category.",
    answer: `USE amazon_db;
SELECT p.product_name,
       c.category_name,
       p.price
FROM products p
INNER JOIN categories c ON p.category_id = c.category_id;`,
    hint: "INNER JOIN returns only rows with a match in BOTH tables.",
    tags: ["INNER JOIN"],
  },
  {
    id: 44,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "INNER JOIN — Orders with Customer Names",
    db: "amazon_db",
    question:
      "Display all orders along with the name of the customer who placed them.",
    answer: `SELECT o.order_id,
       cu.full_name,
       o.order_date,
       o.total_amount,
       o.status
FROM orders o
INNER JOIN customers cu ON o.customer_id = cu.customer_id
ORDER BY o.order_date DESC;`,
    hint: "Match orders to customers via the shared customer_id column.",
    tags: ["INNER JOIN"],
  },
  {
    id: 45,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "INNER JOIN — 3-Table: Order Line Items",
    db: "amazon_db",
    question:
      "List all order items with the order ID, product name, quantity, unit price, and line total.",
    answer: `SELECT o.order_id,
       p.product_name,
       oi.quantity,
       oi.unit_price,
       (oi.quantity * oi.unit_price) AS line_total
FROM order_items oi
INNER JOIN orders   o ON oi.order_id   = o.order_id
INNER JOIN products p ON oi.product_id = p.product_id;`,
    hint: "Chain multiple INNER JOINs to connect three tables.",
    tags: ["INNER JOIN", "Multi-table"],
  },
  {
    id: 46,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "LEFT JOIN — All Customers Including Those With No Orders",
    db: "amazon_db",
    question:
      "List all customers and their orders. Include customers who have never placed an order.",
    answer: `SELECT cu.full_name, cu.city,
       o.order_id, o.total_amount
FROM customers cu
LEFT JOIN orders o ON cu.customer_id = o.customer_id;`,
    hint: "LEFT JOIN keeps ALL rows from the left table; NULL fills unmatched right-side columns.",
    tags: ["LEFT JOIN"],
  },
  {
    id: 47,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "LEFT JOIN — Find Products Never Reviewed",
    db: "amazon_db",
    question:
      "Find products that have zero reviews (have never been reviewed by any customer).",
    answer: `SELECT p.product_name
FROM products p
LEFT JOIN reviews r ON p.product_id = r.product_id
WHERE r.review_id IS NULL;`,
    hint: "The IS NULL trick after a LEFT JOIN finds rows with NO match — very powerful!",
    tags: ["LEFT JOIN", "IS NULL"],
  },
  {
    id: 48,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "LEFT JOIN — Category Product Count (Including Empty)",
    db: "amazon_db",
    question:
      "Count how many products each category has, including categories with no products.",
    answer: `SELECT c.category_name,
       COUNT(p.product_id) AS product_count
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
GROUP BY c.category_name
ORDER BY product_count DESC;`,
    hint: "COUNT(p.product_id) returns 0 for unmatched categories (NULLs not counted).",
    tags: ["LEFT JOIN", "COUNT", "GROUP BY"],
  },
  {
    id: 49,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "RIGHT JOIN — All Sellers and Their Products",
    db: "amazon_db",
    question:
      "List all sellers and the products they sell. Include sellers with no products.",
    answer: `SELECT s.seller_name,
       p.product_name,
       p.price
FROM products p
RIGHT JOIN sellers s ON p.seller_id = s.seller_id;`,
    hint: "RIGHT JOIN keeps ALL rows from the right table (sellers here).",
    tags: ["RIGHT JOIN"],
  },
  {
    id: 50,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "SELF JOIN — Category Parent Lookup",
    db: "amazon_db",
    question:
      "Display each sub-category along with the name of its parent category.",
    answer: `SELECT child.category_name  AS sub_category,
       parent.category_name AS parent_category
FROM categories child
INNER JOIN categories parent ON child.parent_id = parent.category_id;`,
    hint: "A SELF JOIN joins a table to itself — useful for hierarchical/relational data.",
    tags: ["SELF JOIN", "Hierarchical"],
  },
  {
    id: 51,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "FULL OUTER JOIN — Emulated in MySQL",
    db: "amazon_db",
    question:
      "Retrieve all customers and all orders, including unmatched records from both sides.",
    answer: `SELECT cu.customer_id, cu.full_name,
       o.order_id, o.total_amount
FROM customers cu
LEFT JOIN orders o ON cu.customer_id = o.customer_id
UNION
SELECT cu.customer_id, cu.full_name,
       o.order_id, o.total_amount
FROM customers cu
RIGHT JOIN orders o ON cu.customer_id = o.customer_id;`,
    hint: "MySQL has no FULL OUTER JOIN — emulate it with LEFT JOIN UNION RIGHT JOIN.",
    tags: ["FULL OUTER JOIN", "UNION"],
  },
  {
    id: 52,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "Multi-Table JOIN — Complete Order Detail",
    db: "amazon_db",
    question:
      "Show full order breakdown: customer name, order status, product, category, quantity, and unit price.",
    answer: `SELECT cu.full_name,
       o.order_id,
       o.status,
       p.product_name,
       cat.category_name,
       oi.quantity,
       oi.unit_price
FROM order_items oi
JOIN orders     o   ON oi.order_id   = o.order_id
JOIN customers  cu  ON o.customer_id = cu.customer_id
JOIN products   p   ON oi.product_id = p.product_id
JOIN categories cat ON p.category_id = cat.category_id
ORDER BY o.order_id;`,
    hint: "Build the JOIN chain from the bridge table (order_items) outward.",
    tags: ["Multi-table JOIN"],
  },
  {
    id: 53,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "INNER JOIN — Netflix: Content with Directors",
    db: "netflix_db",
    question:
      "List Netflix content along with its director name and genre.",
    answer: `USE netflix_db;
SELECT c.title,
       c.content_type,
       d.director_name,
       g.genre_name
FROM content c
JOIN content_directors cd ON c.content_id  = cd.content_id
JOIN directors         d  ON cd.director_id = d.director_id
JOIN genres            g  ON c.genre_id     = g.genre_id;`,
    hint: "Use a junction table (content_directors) to resolve the many-to-many relationship.",
    tags: ["INNER JOIN", "Netflix", "Junction Table"],
  },
  {
    id: 54,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "LEFT JOIN — Netflix: Content With No Director Tagged",
    db: "netflix_db",
    question:
      "Find all Netflix titles that have no director associated in the database.",
    answer: `SELECT c.title, c.content_type
FROM content c
LEFT JOIN content_directors cd ON c.content_id = cd.content_id
WHERE cd.content_id IS NULL;`,
    hint: "IS NULL after a LEFT JOIN identifies unmatched records.",
    tags: ["LEFT JOIN", "IS NULL", "Netflix"],
  },
  {
    id: 55,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "INNER JOIN — Spotify: Songs with Artist and Album",
    db: "spotify_db",
    question:
      "Show song name, artist name, album name, duration, and stream count for all songs.",
    answer: `USE spotify_db;
SELECT ar.artist_name,
       al.album_name,
       so.song_name,
       so.duration_sec,
       so.streams_count
FROM songs    so
JOIN artists  ar ON so.artist_id = ar.artist_id
JOIN albums   al ON so.album_id  = al.album_id
ORDER BY so.streams_count DESC;`,
    hint: "Joining three tables provides a complete picture of each song.",
    tags: ["INNER JOIN", "Spotify"],
  },
  {
    id: 56,
    section: "4-G",
    sectionTitle: "JOINs",
    topic: "LEFT JOIN — Spotify: Songs Not in Any Playlist",
    db: "spotify_db",
    question: "Find songs that have not been added to any playlist.",
    answer: `SELECT so.song_name, ar.artist_name
FROM songs   so
JOIN artists ar ON so.artist_id = ar.artist_id
LEFT JOIN playlist_songs ps ON so.song_id = ps.song_id
WHERE ps.song_id IS NULL;`,
    hint: "Combine an INNER JOIN (for artist name) with a LEFT JOIN to find missing playlist entries.",
    tags: ["LEFT JOIN", "IS NULL", "Spotify"],
  },

  // ── SECTION 4-H: REAL-WORLD COMPETITIVE ───────────────────────────────────
  {
    id: 57,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Amazon — Top 5 Best-Selling Products",
    db: "amazon_db",
    question:
      "Find the top 5 products by total units sold (from delivered orders only), along with their total revenue.",
    answer: `USE amazon_db;
SELECT p.product_name, p.brand,
       SUM(oi.quantity)                   AS total_units_sold,
       SUM(oi.quantity * oi.unit_price)   AS total_revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
JOIN orders   o ON oi.order_id   = o.order_id
WHERE o.status = 'Delivered'
GROUP BY p.product_id, p.product_name, p.brand
ORDER BY total_units_sold DESC
LIMIT 5;`,
    hint: "Include the product_id in GROUP BY to handle products with the same name.",
    tags: ["Real-World", "Amazon", "SUM", "LIMIT"],
  },
  {
    id: 58,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Amazon — High-Spending Customers (Above Average)",
    db: "amazon_db",
    question:
      "Find customers who have spent more than the average customer spend.",
    answer: `SELECT cu.full_name,
       SUM(o.total_amount) AS total_spent
FROM customers cu
JOIN orders o ON cu.customer_id = o.customer_id
WHERE o.status = 'Delivered'
GROUP BY cu.customer_id, cu.full_name
HAVING SUM(o.total_amount) > (
  SELECT AVG(total_spent)
  FROM (
    SELECT SUM(total_amount) AS total_spent
    FROM orders WHERE status = 'Delivered'
    GROUP BY customer_id
  ) sub
)
ORDER BY total_spent DESC;`,
    hint: "Correlated subquery inside HAVING to compare against a computed average.",
    tags: ["Real-World", "Amazon", "Subquery", "HAVING"],
  },
  {
    id: 59,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Amazon — Month-wise Revenue Trend",
    db: "amazon_db",
    question:
      "Show total orders and revenue for each month (from delivered orders).",
    answer: `SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
       COUNT(order_id)       AS order_count,
       SUM(total_amount)     AS monthly_revenue
FROM orders
WHERE status = 'Delivered'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY month;`,
    hint: "DATE_FORMAT() extracts year-month. Useful for time-series analysis.",
    tags: ["Real-World", "Amazon", "DATE_FORMAT", "GROUP BY"],
  },
  {
    id: 60,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Amazon — Quality Products (Rating ≥ 4, Min 2 Reviews)",
    db: "amazon_db",
    question:
      "Find products with an average customer rating of at least 4 and at least 2 reviews.",
    answer: `SELECT p.product_name,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.review_id)      AS review_count
FROM products p
JOIN reviews r ON p.product_id = r.product_id
GROUP BY p.product_id, p.product_name
HAVING AVG(r.rating)    >= 4
   AND COUNT(r.review_id) >= 2
ORDER BY avg_rating DESC;`,
    hint: "Use multiple conditions in HAVING with AND.",
    tags: ["Real-World", "Amazon", "HAVING", "AVG"],
  },
  {
    id: 61,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Amazon — Seller Performance Dashboard",
    db: "amazon_db",
    question:
      "Generate a full seller report: products listed, average price, total revenue from delivered orders, average product rating.",
    answer: `SELECT s.seller_name,
       COUNT(DISTINCT p.product_id)       AS products_listed,
       ROUND(AVG(p.price), 2)             AS avg_price,
       SUM(oi.quantity * oi.unit_price)   AS gross_sales,
       ROUND(AVG(r.rating), 2)            AS avg_product_rating,
       s.rating                           AS seller_rating
FROM sellers s
LEFT JOIN products    p  ON s.seller_id  = p.seller_id
LEFT JOIN order_items oi ON p.product_id = oi.product_id
LEFT JOIN orders      o  ON oi.order_id  = o.order_id
  AND o.status = 'Delivered'
LEFT JOIN reviews     r  ON p.product_id = r.product_id
GROUP BY s.seller_id, s.seller_name, s.rating
ORDER BY gross_sales DESC;`,
    hint: "Put the status filter in the JOIN condition so sellers with no delivered orders still appear.",
    tags: ["Real-World", "Amazon", "Dashboard", "LEFT JOIN"],
  },
  {
    id: 62,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Netflix — Most Watched Content Globally",
    db: "netflix_db",
    question:
      "Find the top 10 most-watched Netflix titles along with average completion percentage.",
    answer: `USE netflix_db;
SELECT c.title,
       c.content_type,
       g.genre_name,
       COUNT(wh.watch_id)         AS total_watches,
       ROUND(AVG(wh.watch_pct), 1) AS avg_completion_pct
FROM content c
JOIN genres        g  ON c.genre_id   = g.genre_id
JOIN watch_history wh ON c.content_id = wh.content_id
GROUP BY c.content_id, c.title, c.content_type, g.genre_name
ORDER BY total_watches DESC
LIMIT 10;`,
    hint: "AVG(watch_pct) reveals engagement quality on top of raw watch count.",
    tags: ["Real-World", "Netflix", "AVG", "COUNT"],
  },
  {
    id: 63,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Netflix — Country-wise Content Pivot",
    db: "netflix_db",
    question:
      "Show number of Movies, Series, and Documentaries available per country in one row.",
    answer: `SELECT country,
  SUM(CASE WHEN content_type='Movie'         THEN 1 ELSE 0 END) AS movies,
  SUM(CASE WHEN content_type='Series'        THEN 1 ELSE 0 END) AS series,
  SUM(CASE WHEN content_type='Documentary'   THEN 1 ELSE 0 END) AS documentaries
FROM content
GROUP BY country
ORDER BY (movies + series + documentaries) DESC;`,
    hint: "This conditional aggregation pivot is a classic interview question.",
    tags: ["Real-World", "Netflix", "Pivot", "CASE WHEN"],
  },
  {
    id: 64,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Spotify — Top Songs by Global Streams",
    db: "spotify_db",
    question: "Rank the top 10 songs globally by total stream count.",
    answer: `USE spotify_db;
SELECT song_name,
       CONCAT(ROUND(streams_count / 1000000000, 2), 'B') AS streams,
       RANK() OVER (ORDER BY streams_count DESC)          AS global_rank
FROM songs
ORDER BY global_rank
LIMIT 10;`,
    hint: "CONCAT with ROUND formats large numbers readably (e.g., 3.14B).",
    tags: ["Real-World", "Spotify", "RANK", "CONCAT"],
  },
  {
    id: 65,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Spotify — Most Playlist-Featured Artist",
    db: "spotify_db",
    question: "Find which artist appears in the most playlists.",
    answer: `SELECT ar.artist_name,
       COUNT(DISTINCT ps.playlist_id) AS playlist_appearances
FROM artists       ar
JOIN songs         so ON ar.artist_id = so.artist_id
JOIN playlist_songs ps ON so.song_id  = ps.song_id
GROUP BY ar.artist_id, ar.artist_name
ORDER BY playlist_appearances DESC;`,
    hint: "COUNT(DISTINCT playlist_id) avoids counting the same playlist twice.",
    tags: ["Real-World", "Spotify", "COUNT DISTINCT"],
  },
  {
    id: 66,
    section: "4-H",
    sectionTitle: "Real-World Competitive",
    topic: "Spotify — Language-wise Stream Share %",
    db: "spotify_db",
    question:
      "Show total streams per language and what percentage of global streams each language accounts for.",
    answer: `SELECT language,
       SUM(streams_count) AS streams,
       ROUND(
         100.0 * SUM(streams_count) /
         (SELECT SUM(streams_count) FROM songs),
         2
       ) AS pct_share
FROM songs
GROUP BY language
ORDER BY streams DESC;`,
    hint: "Subquery in SELECT computes the global total for percentage calculation.",
    tags: ["Real-World", "Spotify", "Subquery", "Percentage"],
  },
];

module.exports = questions;
