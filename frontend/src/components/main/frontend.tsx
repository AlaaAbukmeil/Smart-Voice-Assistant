import React, { useState, useEffect } from "react";
import AudioRecorder from "./main";

const VoiceAssistant = () => {
  const [chatHistory, setChatHistory] = useState<any>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem("voiceAssistantHistory");
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    // Check user's preferred color scheme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("voiceAssistantHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Function to add new message to chat history
  const addMessageToHistory = (message: any, isUser = true): any => {
    const newMessage = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      isUser,
    };
    setChatHistory((prevHistory: any) => [...prevHistory, newMessage]);
  };

  // Clear chat history
  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      setChatHistory([]);
    }
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`voice-assistant ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <header>
        <h1>Voice Assistant</h1>
        <div className="header-controls">
          <button className="icon-button" onClick={toggleDarkMode}>
            {isDarkMode ? "🌞" : "🌙"}
          </button>
          <button className="icon-button" onClick={clearHistory} title="Clear History">
            🗑️
          </button>
        </div>
      </header>

      <main>
        <section className="recorder-section">
          <AudioRecorderWrapper addMessageToHistory={addMessageToHistory} />
        </section>

        <section className="history-section">
          <h2>Conversation History</h2>
          {chatHistory.length === 0 ? (
            <p className="empty-history">No conversation history yet. Start by recording a message!</p>
          ) : (
            <div className="chat-container">
              {chatHistory.map((message: any) => (
                <div key={message.id} className={`chat-message ${message.isUser ? "user-message" : "assistant-message"}`}>
                  <div className="message-avatar">{message.isUser ? "👤" : "🤖"}</div>
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <p>© {new Date().getFullYear()} Voice Assistant - Your personal AI helper</p>
      </footer>
    </div>
  );
};

// Wrapper for AudioRecorder to handle communication with the chat history
const AudioRecorderWrapper = ({ addMessageToHistory }: any) => {
  // This is a wrapper around your existing AudioRecorder component
  // that will add transcriptions to the chat history

  const handleTranscriptionUpdate = (transcription: any) => {
    if (transcription) {
      addMessageToHistory(transcription, true); // Add user message

      // Simulate assistant response (in a real app, this would come from your backend)
      setTimeout(() => {
        addMessageToHistory("I've received your message and processed it.", false);
      }, 1000);
    }
  };

  return (
    <div className="recorder-wrapper">
      <AudioRecorder onTranscriptionUpdate={handleTranscriptionUpdate} />
    </div>
  );
};

export default VoiceAssistant;
