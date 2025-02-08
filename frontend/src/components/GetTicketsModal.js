import React, { useState } from "react";

const GetTicketsModal = ({ event, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://eventscraping.onrender.com/api/collect-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventUrl: event.link }),
      });
      console.log(response)

      if (!response.ok) throw new Error("Failed to send email");
      
      // Redirect to the event's official page
      window.location.href = event.link;
    } catch (err) {
      setError("Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Get Your Tickets</h3>
        <p>Enter your email to proceed to ticket booking.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Get Tickets"}
          </button>
          <button type="button" className="close-btn" onClick={onClose}>
            Close
          </button>
        </form>
      </div>
    </div>
  );
};

export default GetTicketsModal;
