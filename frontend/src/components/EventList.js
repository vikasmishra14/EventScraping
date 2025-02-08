import React, { useEffect, useState } from "react";
import GetTicketsModal from "./GetTicketsModal"; // Import modal component
import "./EventList.css";
import { useNavigate } from "react-router-dom";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate=useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("https://eventscraping.onrender.com/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCardClick = (id) => {
    console.log(id);
    navigate(`/events/${id}`); // Remove the colon (:)
  };
  
  return (
    <div className="event-container">
      {loading ? (
        <div className="loader"></div> // Animation while loading
      ) : (
        <div className="event-list">
          {events.map((event, index) => (
            <div className="event-card" key={index}>
              <img src={event.imgSrc} alt={event.title} className="event-image"  onClick={()=>handleCardClick(event._id)}  />
              <div className="event-info">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-location">{event.location}</p>
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-link">
                  View Details
                </a>
                <button className="get-tickets-btn" onClick={() => setSelectedEvent(event)}>
                  Get Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <GetTicketsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default EventList;
