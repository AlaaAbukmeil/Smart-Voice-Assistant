import * as React from 'react';
import { useState } from 'react';

//import for dashboard
import { extendTheme } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SmartToyIcon from '@mui/icons-material/SmartToy';


//import for the button
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';





export default function RecordingButtons() {  // For connecting the onlick function and backend, user recording
  const [isRecording, setIsRecording] = useState(false);

  const handleButtonClick = () => {   // Connect the recording system
    setIsRecording((prev) => !prev);
  };

  return (
    <Stack>
      <Button
        variant="outlined"
        sx={{ width: '100%' }}
        startIcon={isRecording ? <RadioButtonCheckedIcon /> : <KeyboardVoiceIcon />}
        onClick={handleButtonClick}>
        {isRecording ? 'Recording...' : 'Start Recording'}
      </Button>
    </Stack>
  );
}

export default function BoxForChat() {  // For connecting with backend, get the data and show
  return (
    <Box component="section"
      sx={{
        width: '100%',
        border: '3px dashed grey'
      }}
    >
      Hello world!
    </Box>
  );
}


const NAVIGATION = [  // Dashboard item name
  {
    kind: 'header',
    title: 'Main items',
  },
  {
    segment: 'currentchatboard',
    title: 'Current chat board',
    icon: <ChatIcon />,
  },
  {
    segment: 'newchat',
    title: 'New chat',
    icon: <OpenInNewIcon />,
  },
  {
    kind: 'divider',
  },
  {
    segment: 'history',
    title: 'History',
    icon: <HistoryIcon />,
  },
];

function DashBoardContent({ pathname }) {   // Dashboard content
  // Conditionally render content based on the pathname
  let content;
  switch (pathname) {
    case '/currentchatboard':
      content = (
        <Box>
          <Typography><BoxForChat /></Typography>
          <br />
          <RecordingButtons />
        </Box>
      );
      break;
    case '/newchat':
      content = (
        <Box>
          <Typography variant="h4">New Caht</Typography>
          <Typography><BoxForChat /></Typography>
          <RecordingButtons />
        </Box>
      );
      break;
    case '/history':
      content = (
        <Box>
          <Typography variant="h4">history</Typography>
          <Typography>This is the content for the History page.</Typography>
        </Box>
      );
      break;
    default:
      content = (
        <Box>
          <Typography variant="h4">Hello, what can I help you?</Typography>
          <Typography>This is for CSCI3280 Group Project</Typography>
        </Box>
      );
  }

  return (
    <Box
      sx={{ py: 4, }}
    >
      {content}
    </Box>
  );
}

const demoTheme = extendTheme({     // Change the theme
  colorSchemes: { light: true, dark: true },
  colorSchemeSelector: 'class',
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath) {   // Set up the original page
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}


export default function DashboardLayoutBasic(props) {
  const router = useDemoRouter('/currentchatboard');

  return (
    <AppProvider
      branding={{
        logo:
          <SmartToyIcon
            sx={{
              top: '40px',
              fontSize: '35px',
              color: 'primary.main',
            }}
          />,
        title: 'Smart Voice Assistant',
      }}
      navigation={NAVIGATION}
      router={router}
      theme={demoTheme}
    >

      <DashboardLayout>
        <DashBoardContent pathname={router.pathname} />
      </DashboardLayout>

    </AppProvider>
  );
}
