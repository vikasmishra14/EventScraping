import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GetTicketsModal from "./GetTicketsModal";

const EventDetails = () => {
  const { id } = useParams();
const [event,setEvents]=useState([]);
const [loading , setLoading]=useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  useEffect(()=>{

    const fetchEvents = async () => {
        setLoading(true);
      try {
        const response = await fetch(`https://eventscraping.onrender.com/api/events/${id}`);
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
  }, [id]);
  return (
    <div className="event-container">
      {loading ? (
        <div className="loader"></div> // Animation while loading
      ) : (
        <div className="event-list"> 
            <div className="event-card">
              <img src={event.imgSrc} alt={event.title} className="event-image" />
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
          
        </div>
      )}

      {selectedEvent && (
        <GetTicketsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default EventDetails;
