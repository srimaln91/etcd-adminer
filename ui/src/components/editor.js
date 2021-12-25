import * as React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';


class EditorComponent extends React.Component {
    render() {
        return (

            <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 800,
                    }}
                >
            <div>

                <p>test</p>

                <div style={{ float: "right", padding: "5" }}>
                    <Button variant="contained" color="success">
                        Save
                    </Button>
                    <Button variant="outlined" color="error">
                        Discard
                    </Button>
                </div>
            </div>
            </Paper>
        )
    }
}

export default EditorComponent;