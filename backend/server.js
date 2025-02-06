const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const Event = require('./models/Event');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

  

  const scrapeEvents = async () => {
    try {
      console.log("Starting Puppeteer...");  // Log the start of the scraping process
      const browser = await puppeteer.launch({ headless: true }); // Set headless: false to see the browser
      const page = await browser.newPage();
  
      // Go to the Eventbrite page
      console.log("Navigating to Eventbrite...");
      await page.goto('https://www.eventbrite.com/d/australia--sydney/events/', {
        waitUntil: 'domcontentloaded',
        timeout: 60000, // Increase timeout to ensure the page is loaded fully
      });
  
      console.log("Waiting for event cards or a general event container...");
      // Wait for a more general selector that ensures the event section is loaded
      await page.waitForSelector('.search-event-card', { timeout: 60000 }); // Modify this to the appropriate selector
  
      console.log("Extracting events...");
      // Extract event data
      const events = await page.evaluate(() => {
        const eventData = [];
        const eventElements = document.querySelectorAll('.search-event-card'); // Modify this to the appropriate selector
  
        eventElements.forEach(eventElement => {
          const title = eventElement.querySelector('.eds-text-bs--fixed')?.textContent.trim();
          const date = eventElement.querySelector('time')?.getAttribute('datetime');
          const location = eventElement.querySelector('.card-text--truncated')?.textContent.trim();
          const description = eventElement.querySelector('.eds-text-color--ui-700')?.textContent.trim();
          const link = eventElement.querySelector('a')?.getAttribute('href');
  
          if (title && date && location && description && link) {
            eventData.push({ title, date, location, description, link });
          }
        });
  
        return eventData;
      });
  
      console.log("Events extracted:", events);  // Log the events
  
      // Save events to the database
      console.log("Saving events to the database...");
      await Event.deleteMany(); // Clear the old events
      await Event.insertMany(events); // Save new events
      console.log('Events scraped and saved successfully!');
  
      await browser.close(); // Close the browser
    } catch (error) {
      console.error('Error scraping events:', error);
    }
  };
  
  // Scrape events immediately when starting the server
  scrapeEvents();
  
  // Set up cron job to scrape events every 24 hours (optional)
  cron.schedule('0 0 * * *', scrapeEvents);  // Run at midnight every day
  
// Route to get events from the database
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    console.log(events);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
});

// Route to handle email collection
app.post('/api/collect-email', async (req, res) => {
  const { email, eventUrl } = req.body;

  // Send confirmation email to the user
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',  // Replace with your email
      pass: 'your-email-password',   // Replace with your email password
    },
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Thank you for requesting tickets',
    text: `Thank you for your interest. Click here to get your tickets: ${eventUrl}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
