import React, { useState, useRef, useEffect } from "react";
import { baseUrl, baseUrlWOS } from "../../common/cookie";

//import icon
import ChatIcon from '@mui/icons-material/Chat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HomeIcon from '@mui/icons-material/Home';


//
import { createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import path from "path";
import { AppProvider } from '@toolpad/core'
import { AppBar, Toolbar, IconButton, Typography, Button, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { ThemeProvider } from "styled-components";
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode




const PageDesign: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [responseAudioUrl, setResponseAudioUrl] = useState<any>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [themeMode, setThemeMode] = useState('light'); // State to track theme mode

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  const [activePage, setActivePage] = useState<'main' | 'newChat' | 'history'>('main'); // State to track active page


  // Clean up resources
  const cleanupResources = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return cleanupResources;
  }, []);

  const startRecording = async () => {
    // Reset state
    setError(null);
    setTranscription(null);
    setAudioURL(null);
    audioChunksRef.current = [];

    // Clean up previous resources
    cleanupResources();

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Determine supported MIME type
      const mimeTypes = ["audio/webm", "audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"];

      let mimeType = "";
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      if (!mimeType) {
        throw new Error("No supported audio MIME type found on your browser");
      }

      console.log(`Using MIME type: ${mimeType}`);

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      // When recording stops
      mediaRecorder.addEventListener("stop", () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        console.log(`Recording complete: ${(audioBlob.size / 1024).toFixed(2)} KB`);
        console.log(`Format: ${mimeType}`);
      });

      // Start recording
      mediaRecorder.start(100); // Collect data in chunks of 100ms
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(`Microphone error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop tracks but keep URL for playback
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const sendToBackend = async () => {
    if (audioChunksRef.current.length === 0 || !audioURL) {
      setError("No audio recorded");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a blob with the original mime type
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      // Determine file extension from MIME type
      let fileExtension = ".webm";
      if (mimeType.includes("mp4")) fileExtension = ".mp4";
      if (mimeType.includes("ogg")) fileExtension = ".ogg";

      // Create FormData with original format
      const formData = new FormData();
      const timestamp = new Date().getTime();
      const filename = `recording-${timestamp}${fileExtension}`;

      formData.append("audio", audioBlob, filename);

      // Add metadata about the recording
      formData.append("mimeType", mimeType);
      formData.append("fileSize", audioBlob.size.toString());

      console.log(`Sending original ${mimeType} audio: ${(audioBlob.size / 1024).toFixed(2)} KB`);
      console.log(`Filename: ${filename}`);

      // Send to backend
      const response = await fetch(`${baseUrl}audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Server response:", result);

      if (result.transcription) {
        setTranscription(result.transcription);

        // Check if we have an audio URL in the response
        if (result.url_audio) {
          const fullAudioUrl = result.url_audio;
          console.log("Received MP3 audio URL from server:", fullAudioUrl);
          const fullUrl = `${baseUrlWOS}${fullAudioUrl}`

          setResponseAudioUrl(fullUrl);
          playMP3Audio(fullUrl);

        }
      } else if (result.message) {
        setTranscription(`Server message: ${result.message}`);
      } else {
        setTranscription("No transcription returned from server");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
      setError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function specifically for playing MP3 audio
  // Function specifically for playing MP3 audio
  const playMP3Audio = (fullUrl: string) => {
    // Check if the URL is a relative path (starts with /)
    // If it is, prepend the baseUrl

    console.log("Playing MP3 audio from URL:", fullUrl);

    // Create a new audio element optimized for MP3
    const audioElement: any = new Audio();

    // Set proper MIME type for MP3
    audioElement.type = "audio/mpeg";

    // Log loading states
    audioElement.addEventListener("loadstart", () => {
      console.log("MP3 audio loading started");
    });

    audioElement.addEventListener("canplay", () => {
      console.log("MP3 audio can start playing");
    });

    audioElement.addEventListener("canplaythrough", () => {
      console.log("MP3 audio can play through");
    });

    audioElement.addEventListener("playing", () => {
      console.log("MP3 audio is playing");
    });

    audioElement.addEventListener("ended", () => {
      console.log("MP3 audio playback completed");
    });

    audioElement.addEventListener("error", (e: Event) => {
      console.error("Error loading MP3 audio:", e);
      console.error("Audio error code:", audioElement.error?.code);
      console.error("Audio error message:", audioElement.error?.message);
      setError(`Failed to load MP3 audio: ${audioElement.error?.message || "Unknown error"}`);
    });

    // Set the source and load the audio
    audioElement.src = fullUrl;
    audioElement.load();

    // Try to play the audio
    audioElement.play().catch((err: Error) => {
      console.error("Failed to play MP3 audio:", err);
      setError(`MP3 playback error: ${err.message}`);
    });
  };

  const Sidebar = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Button
          variant={'contained'} // Highlight active button
          startIcon={<HomeIcon />}
          onClick={() => setActivePage('main')}
        >
          Main
        </Button>
        <Button
          variant={'contained'} // Highlight active button
          startIcon={<ChatIcon />}
          onClick={() => setActivePage('newChat')}
        >
          New Chat
        </Button>
        <Button
          variant={'contained'} // Highlight active button
          startIcon={<HistoryIcon />}
          onClick={() => setActivePage('history')}
        >
          History
        </Button>
      </Box>
    );
  };

  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2', // Blue
      },
      background: {
        default: '#ffffff', // White
        paper: '#f5f5f5', // Light gray
      },
      text: {
        primary: '#000000', // Black text
        secondary: 'rgba(0, 0, 0, 0.7)', // Slightly transparent black text
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9', // Light blue
      },
      background: {
        default: '#121212', // Dark gray
        paper: '#1e1e1e', // Slightly lighter dark gray
      },
      text: {
        primary: '#ffffff', // White text
        secondary: 'rgba(255, 255, 255, 0.7)', // Slightly transparent white text
      },
    },
  });

  const MainPage = () => {
    return (
      <div>
        <h1>Main Page</h1>
        <p>Welcome to the Smart Voice Assistant!</p>
        

        <div className="audio-recorder">

          <h2>Audio Recorder</h2>

          <div className="controls">
            {!isRecording ? <button onClick={startRecording}>Start Recording</button> : <button onClick={stopRecording}>Stop Recording</button>}

            <button onClick={sendToBackend} disabled={audioChunksRef.current.length === 0}>
              Send to Server
            </button>
          </div>

          {audioURL && (
            <div className="audio-playback">
              <h3>Recording Preview:</h3>
              <audio src={audioURL} controls />
            </div>
          )}
          {responseAudioUrl && (
            <div className="mp3-player">
              <h3>Response Audio:</h3>
              <audio ref={audioRef} src={responseAudioUrl} controls preload="auto" onPlay={() => setIsAudioPlaying(true)} onPause={() => setIsAudioPlaying(false)} onEnded={() => setIsAudioPlaying(false)} />
            </div>
          )}
          {transcription && (
            <div className="transcription">
              <h3>Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>
        <p></p>
      </div>
    );
  };
  
  
  const NewChatPage = () => {
    return (
      <div>
        <h2>New Chat Page</h2>
        <p>This is the new chat page. Start a new conversation here.</p>
      </div>
    );
  };
  
  const HistoryPage = () => {
    return (
      <div>
        <h2>History Page</h2>
        <p>View your chat history here.</p>
      </div>
    );
  };
  

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <main style={{ backgroundColor: themeMode === 'light' ? '#ffffff' : '#121212', minHeight: '100vh' }}>
        <div>
          <AppBar position="static" >
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu">
                <SmartToyIcon />
              </IconButton>
              <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                Smart Voice Assistant
              </Typography>
              <Sidebar />
              <IconButton color="inherit" onClick={toggleTheme}>
                {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
        </div>
        <div className="container-fluid">
          {activePage === 'main' && <MainPage />}
          {activePage === 'newChat' && <NewChatPage />}
          {activePage === 'history' && <HistoryPage />}
        </div>
      </main>
    </ThemeProvider>
  );
};

export default PageDesign;