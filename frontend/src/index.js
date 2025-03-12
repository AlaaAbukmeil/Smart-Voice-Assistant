import ReactDOM from 'react-dom/client';
import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';


export default function BasicButtons() {
    return (
        <Stack>
            <Button variant="outlined" startIcon={<KeyboardVoiceIcon />}></Button>
        </Stack>
    );
}
class App extends React.Component {
    render() {
        return (
            <BasicButtons></BasicButtons>
        )
    }
}

const root = ReactDOM.createRoot(document.querySelector('#app'));
root.render(<App />);