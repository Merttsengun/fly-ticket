FlyTicket Project Specification (Vanilla JS Edition)
1. Project Overview
Project Name: FlyTicket.  

Goal: Full-stack airline booking system.  

Deadline: 26/05/2025.  

2. Updated Tech Stack
Frontend: Plain HTML5, CSS3, and Vanilla JavaScript (No frameworks).  

Backend: Node.js + Express.  

Database: PostgreSQL/MySQL (Relational).  

3. Frontend Structure & Pages
Claude, please create the following pages using a clean and modular folder structure:  

Home Page (index.html): Flight search form (From/To dropdowns, Date picker) and results area.  

Flight Detail Page (booking.html): Passenger information form (Name, Surname, Email).  

Confirmation Page (success.html): Success message with ticket details.  

Admin Login (admin-login.html): Simple form for admin access.  

Admin Dashboard (admin-panel.html): Tables for managing flights and viewing bookings.  

4. Backend & Business Logic (Priority)
Validate these rules strictly on the backend:  

Single Runway Rule (Updated): Her şehirde tek bir havalimanı ve tek bir pist olduğu varsayılır. Bir şehirde herhangi bir aktivite (kalkış VEYA iniş) gerçekleştiğinde, aynı şehirde başka bir aktivitenin (kalkış veya iniş) gerçekleşebilmesi için en az 60 dakika geçmiş olmalıdır.

  Reddedilen Durumlar:
  - Yeni uçuşun kalkış şehrinde, kalkış saatine ±60 dk içinde başka bir kalkış veya iniş varsa → RED
  - Yeni uçuşun varış şehrinde, varış saatine ±60 dk içinde başka bir kalkış veya iniş varsa → RED

  Uygulama: POST /api/flights ve PUT /api/flights/:id endpoint'lerinde her iki şehir için
  ABS(TIMESTAMPDIFF(MINUTE, existing_time, new_time)) < 60 sorgusu ile kontrol edilir.  

Data Integrity: Use Foreign Keys for City-to-Flight and Flight-to-Ticket relations.  

5. Implementation Guide for Claude Code
Step 1: Initialize the Node.js/Express server and DB connection.

Step 2: Seed the database with the 81 cities of Türkiye.  

Step 3: Create the API endpoints (GET/POST for flights and tickets).  

Step 4: Build the HTML/CSS templates. Use fetch() API in JavaScript to connect the frontend to your backend endpoints.

Step 5: Implement the Admin CRUD and Login logic (Password hashing is required).