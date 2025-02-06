Event Scraping Web App
Objective

The goal of this project is to create a website that:

    Lists all events happening in a specific city (Sydney, Australia).
    Automatically scrapes event data from Eventbrite, a public event platform.
    Displays the events beautifully on a website with details such as event name, date, location, and description.
    Includes a “GET TICKETS” button where users can submit their email address and be redirected to the event page.

The script will run every 24 hours to fetch updated event details.
Features

    Automated Event Scraping: The script fetches event details from Eventbrite using web scraping techniques.
    User Interaction: When a user clicks the "Get Tickets" button, they can submit their email address and be redirected to the event’s ticketing page.
    Daily Updates: The event list is refreshed every 24 hours with the latest data using a cron job.
    Responsive Design: The events are displayed in a beautiful, user-friendly format on the frontend.

Technologies Used

    Backend: Node.js, Express.js
    Web Scraping/API Integration: Eventbrite (using Puppeteer for scraping)
    Database: MongoDB
    Email Service: Nodemailer (for sending confirmation emails)
    Frontend: HTML, CSS, JavaScript
    Scheduler: Cron job to update events daily
