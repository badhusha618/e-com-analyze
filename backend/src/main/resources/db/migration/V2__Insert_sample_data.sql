-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Fashion and apparel'),
('Home & Garden', 'Home improvement and gardening supplies'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Books', 'Books and educational materials');

-- Insert sample vendors
INSERT INTO vendors (name, email, phone) VALUES
('TechCorp Electronics', 'contact@techcorp.com', '+1-555-0101'),
('Fashion Forward', 'info@fashionforward.com', '+1-555-0102'),
('Home & Garden Co', 'sales@homeandgarden.com', '+1-555-0103'),
('Sports Central', 'team@sportscentral.com', '+1-555-0104');

-- Insert sample products
INSERT INTO products (name, sku, price, cost_price, inventory, category_id, vendor_id) VALUES
('iPhone 15 Pro', 'APL-IPH15-PRO-256', 999.99, 699.99, 50, 1, 1),
('Samsung Galaxy Watch', 'SAM-GW-6-44MM', 299.99, 199.99, 75, 1, 1),
('Designer Jeans', 'FF-JEANS-SLIM-32', 89.99, 39.99, 120, 2, 2),
('Garden Tool Set', 'HG-TOOLS-SET-PRO', 45.99, 24.99, 35, 3, 3),
('Running Shoes', 'SC-SHOES-RUN-10', 129.99, 79.99, 85, 4, 4);

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john.doe@email.com', '+1-555-1001'),
('Jane', 'Smith', 'jane.smith@email.com', '+1-555-1002'),
('Bob', 'Johnson', 'bob.johnson@email.com', '+1-555-1003');

-- Insert sample orders
INSERT INTO orders (customer_id, total_amount, status, order_date) VALUES
(1, 1299.98, 'completed', '2024-01-15 10:30:00'),
(2, 89.99, 'shipped', '2024-01-16 14:45:00'),
(3, 429.98, 'processing', '2024-01-17 09:15:00');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 999.99),
(1, 2, 1, 299.99),
(2, 3, 1, 89.99),
(3, 2, 1, 299.99),
(3, 5, 1, 129.99);

-- Insert sample reviews
INSERT INTO reviews (product_id, customer_id, rating, content, review_date) VALUES
(1, 1, 5, 'Excellent phone! Very fast and great camera quality.', '2024-01-20 16:30:00'),
(2, 2, 4, 'Good smartwatch, battery life could be better.', '2024-01-21 11:20:00'),
(3, 3, 3, 'Jeans are okay, fit is not perfect.', '2024-01-22 13:45:00');

-- Insert sample marketing campaigns
INSERT INTO marketing_campaigns (name, channel, budget, spent, impressions, clicks, conversions, start_date, end_date) VALUES
('January Electronics Sale', 'email', 5000.00, 3500.00, 50000, 2500, 125, '2024-01-01 00:00:00', '2024-01-31 23:59:59'),
('Winter Fashion Campaign', 'social', 3000.00, 2800.00, 75000, 1800, 90, '2024-01-15 00:00:00', '2024-02-15 23:59:59');

-- Insert sample alerts
INSERT INTO alerts (type, title, message, severity, is_read, metadata) VALUES
('inventory', 'Low Stock Alert', 'Garden Tool Set is running low on inventory (5 units remaining)', 'high', false, '{"productId": 4, "currentStock": 5}'),
('performance', 'Sales Target Warning', 'Monthly sales target is behind by 15%', 'medium', false, '{"targetDeficit": 15}'),
('review', 'New Customer Review', 'New 5-star review received for iPhone 15 Pro', 'low', true, '{"productId": 1, "rating": 5}');

-- Insert sample sales metrics
INSERT INTO sales_metrics (date, total_sales, total_orders, average_order_value, return_rate, new_customers) VALUES
('2024-01-15 00:00:00', 12999.85, 45, 288.89, 0.0250, 8),
('2024-01-16 00:00:00', 8750.23, 32, 273.44, 0.0300, 5),
('2024-01-17 00:00:00', 15432.67, 56, 275.58, 0.0200, 12);

-- Insert sample user (password is 'password123')
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@example.com', '$2a$10$rOzJc.3P2wZg0K9V5M2mBu7jL5oCpOFj8Lp9Bb8Hv8uQ3zQ0uP9Ge', 'Admin', 'User', 'ADMIN'),
('manager', 'manager@example.com', '$2a$10$rOzJc.3P2wZg0K9V5M2mBu7jL5oCpOFj8Lp9Bb8Hv8uQ3zQ0uP9Ge', 'Manager', 'User', 'USER');