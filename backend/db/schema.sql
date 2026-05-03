CREATE DATABASE IF NOT EXISTS flyticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flyticket;

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Generated columns allow enforcing the "same hour" uniqueness rule at DB level
CREATE TABLE IF NOT EXISTS flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flight_number VARCHAR(20) NOT NULL UNIQUE,
  departure_city_id INT NOT NULL,
  arrival_city_id INT NOT NULL,
  departure_time DATETIME NOT NULL,
  arrival_time DATETIME NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  seats_total INT NOT NULL DEFAULT 100,
  seats_available INT NOT NULL DEFAULT 100,
  -- Generated columns for hour-level uniqueness (MySQL 5.7+)
  departure_hour_slot VARCHAR(20) AS (DATE_FORMAT(departure_time, '%Y%m%d%H')) STORED,
  arrival_hour_slot VARCHAR(20) AS (DATE_FORMAT(arrival_time, '%Y%m%d%H')) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (departure_city_id) REFERENCES cities(id),
  FOREIGN KEY (arrival_city_id) REFERENCES cities(id),
  -- Business rule: no two flights from same city in same hour
  UNIQUE KEY uq_departure_slot (departure_city_id, departure_hour_slot),
  -- Business rule: no two flights arriving at same city in same hour
  UNIQUE KEY uq_arrival_slot (arrival_city_id, arrival_hour_slot)
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flight_id INT NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_surname VARCHAR(100) NOT NULL,
  passenger_email VARCHAR(255) NOT NULL,
  booking_reference VARCHAR(10) NOT NULL UNIQUE,
  booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
