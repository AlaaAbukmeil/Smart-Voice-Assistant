import * as React from 'react'; // Import React
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client

function MyButton({ title }: { title: string }) {
  return (
    <button>{title}</button>
  );
}

export default function MyApp() {
  return (
    <div>
      <h1>Smart Voice Assistant</h1>
      <MyButton title="Press me to start recording" />
    </div>
  );
}

// Get the root element
const container = document.getElementById('root');

// Create a root and render your MyApp component
const root = createRoot(container);
root.render(<MyApp />);