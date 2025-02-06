import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);  // Track loading state
  const [error, setError] = useState('');  // Track error state

  // Fetch events from backend
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/events')
      .then((response) => {
        setEvents(response.data);
        setLoading(false);  // Set loading to false once data is fetched
      })
      .catch((error) => {
        console.log('Error fetching events:', error);
        setError('Error fetching events');
        setLoading(false);
      });
  }, []);

  // Handle email submission
  const handleEmailSubmit = (eventUrl) => {
    const email = prompt('Please enter your email:');
    
    if (email) {
      axios.post('http://localhost:5000/api/collect-email', { email, eventUrl })
        .then((response) => alert(response.data.message))
        .catch((error) => alert('Error sending email'));
    }
  };

  // Handle scraping of events
  const handleScrapeEvents = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/scrape-events')
      .then((response) => {
        alert(response.data.message);  // Show message after scraping
        setLoading(false);
      })
      .catch((error) => {
        alert('Error scraping events');
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Upcoming Events in Sydney</h1>
      {loading && <p>Loading events...</p>}
      {error && <p>{error}</p>}
      
      {/* Button to trigger the scraping process */}
      <button onClick={handleScrapeEvents} disabled={loading}>
        {loading ? 'Scraping...' : 'Scrape Events'}
      </button>

      {/* Display events */}
      {events.map((event, index) => (
        <div key={index} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <button onClick={() => handleEmailSubmit(event.link)}>Get Tickets</button>
        </div>
      ))}
    </div>
  );
};

export default EventList;
