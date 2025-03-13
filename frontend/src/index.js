import ReactDOM from 'react-dom/client';
import * as React from 'react';

//import for dashboard
import { extendTheme, styled } from '@mui/material/styles';
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


export default function BasicButtons() {
  return (
    <Stack>
      <Button variant="outlined" sx={{ width: '100%' }} startIcon={<KeyboardVoiceIcon />}></Button>
    </Stack>
  );
}



const NAVIGATION = [
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

function DashBoardContent({ pathname }) {
  // Conditionally render content based on the pathname
  let content;
  switch (pathname) {
    case '/currentchatboard':
      content = (
        <Box>
          <Typography variant="h4">Hello</Typography>
          <Typography>This is the content for the current page.</Typography>
        </Box>
      );
      break;
    case '/newchat':
      content = (
        <Box>
          <Typography variant="h4">New Caht</Typography>
          <Typography>This is the content for the New Chat page.</Typography>
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
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {content}
    </Box>
  );
}

const demoTheme = extendTheme({
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

function useDemoRouter(initialPath) {
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

const Skeleton = styled('div')(({ theme, height }) => ({
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  height,
  content: '" "',
}));

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
