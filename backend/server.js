require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const otpStore = {};  
const cron = require("node-cron");
const puppeteer = require("puppeteer");
const Event = require("./models/Event");
const cors = require("cors"); 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

/**
 * Scrolls the page to load lazy-loaded content.
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Scrapes event data from Eventbrite.
 */
const scrapeEvents = async () => {
  try {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
      executablePath: process.env.CHROME_PATH || puppeteer.executablePath(),
    });
    
    const page = await browser.newPage();

    console.log("Navigating to Eventbrite...");
    await page.goto("https://www.eventbrite.com/d/australia--sydney/events/", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    console.log("Scrolling to load more events...");
    await autoScroll(page);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Allow extra time for images to load

    console.log("Extracting event details...");
    const events = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".discover-vertical-event-card")).map((eventElement) => {
        const title = eventElement.querySelector(".event-card-link")?.getAttribute("aria-label")?.trim() || "Unknown Title";
        const dateElement = eventElement.querySelector("p[class*='Typography_root']");
        const date = dateElement ? dateElement.textContent.trim() : "N/A";
        const location = eventElement.querySelector("[data-event-location]")?.getAttribute("data-event-location") || "Unknown Location";
        const link = eventElement.querySelector(".event-card-link")?.href || "#";
        const imgElement = eventElement.querySelector(".event-card-image");
        
        let imgSrc = imgElement?.getAttribute("data-src") || 
                     imgElement?.getAttribute("srcset")?.split(" ")[0] || 
                     imgElement?.src || "";

        return { title, date, location, link, imgSrc };
      });
    });

    console.log(`Extracted ${events.length} events`);

    if (events.length > 0) {
      console.log("Saving events to the database...");
      await Event.deleteMany();
      await Event.insertMany(events);
      console.log("Events saved successfully!");
    } else {
      console.log("⚠️ No events found. Check selectors.");
    } 
    await browser.close();
  } catch (error) {
    console.error("Scraping Error:", error);
  }
};

scrapeEvents(); // Initial scrape
cron.schedule("0 0 * * *", scrapeEvents); // Run daily

// Get events from the database
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});
// get event by id 

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;  
    // Check if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

 
 
 

app.post("/api/collect-email", async (req, res) => {
  const { email, eventUrl } = req.body;

  // Generate a 6-digit OTP
  const otp = Math.floor( Math.random() * 900000); 
  otpStore[email] = otp; // Store OTP in memory using the email as key  

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Event Ticket Request",
    text: `this is your otp: ${otp}`,  
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email sending failed:", error); // Log full error
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
});


app.post("/api/verify-otp", async (req, res) => {
  const { email, otpEntered } = req.body;
 
  const storedOtp = otpStore[email];

  if (!storedOtp) {
    return res.status(400).json({ message: "OTP not generated for this email." });
  }

  if (storedOtp.toString() === otpEntered.toString()) {
    // OTP is correct, now send event data
    const eventData = {
      eventName: "Awesome Event",
      date: "2025-05-01",
      location: "Event Location",
      price: "$50",
    };
    
    res.status(200).json({ message: "OTP verified successfully!", eventData });
  } else {
    return res.status(400).json({ message: "Invalid OTP!" });
  }
});




// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
