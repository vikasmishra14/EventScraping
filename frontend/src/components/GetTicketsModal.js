import React, { useState } from "react";

const GetTicketsModal = ({ event, onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // For storing OTP entered by the user
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Email input, Step 2: OTP input

  const handleEmailSubmit = async (e) => {
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

      if (!response.ok) throw new Error("Failed to send email");

      // Move to the next step to enter OTP
      setStep(2);
    } catch (err) {
      setError("Error sending email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
  
    // Trim the OTP to remove any leading/trailing whitespaces
    const trimmedOtp = otp.trim();
  
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("https://eventscraping.onrender.com/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpEntered: trimmedOtp }),
      });
  
      if (!response.ok) throw new Error("Invalid OTP");
  
      // OTP is verified, redirect to the event's official page
      const data = await response.json();
      if (data.eventData) {
        window.location.href = event.link;
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Get Your Tickets</h3>
        <p>{step === 1 ? "Enter your email to receive the OTP" : "Enter the OTP sent to your email"}</p>
        <form onSubmit={step === 1 ? handleEmailSubmit : handleOtpSubmit}>
          {step === 1 ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : step === 1 ? "Send OTP" : "Verify OTP"}
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
