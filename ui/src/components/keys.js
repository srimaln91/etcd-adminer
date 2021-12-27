import * as React from 'react';

import FSNavigator from './tree';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import EditorComponent from './editor';
import axios from 'axios';

class KeysComponent extends React.Component {

    constructor() {
        super()
        this.state = {
            activeKey: "/",
            keys: {
                id: 'root',
                name: 'Parent',
            }
        }

        this.setActiveKey = this.setActiveKey.bind(this);
    }

    setActiveKey(key) {
        console.log(key);
        this.setState({
            activeKey: key
        })
    }

    componentDidMount() {
        axios.get(`/api/keys`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        })
            .then(res => {
                const keys = res.data;
                this.setState({ keys: keys });
            })
    }

    render() {
        return (
            <Grid container spacing={3}>

                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: 800,
                        }}
                    >
                        <FSNavigator keys={this.state.keys} onKeyClick={this.setActiveKey} />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8} lg={9}>
                    <EditorComponent etcdKey={this.state.activeKey} />
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height:"40px" }}>
                        {/* <Orders /> */}
                    </Paper>
                </Grid>
            </Grid>
        )
    }
}

export default KeysComponent;