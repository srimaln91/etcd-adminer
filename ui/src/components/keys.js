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
        this.fetchKeys = this.fetchKeys.bind(this);
    }

    setActiveKey(key) {
        this.setState({
            activeKey: key
        })
    }

    createFile(path, content) {
        console.log(path + "-" + content);
    }

    createDirectory(path) {
        console.log(path);
    }

    deleteKey(node) {
        console.log("delete");
        console.log(node);
        axios.delete(`/api/keys`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            },
            data: {
                key: node.abspath,
                isDirectory: node.type === "directory"
            }
        }).then(res => {
            const data = res.data;
            console.log(data);
            this.fetchKeys();
        })
    }

    fetchKeys() {
        axios.get(`/api/keys`, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        }).then(res => {
            const keys = res.data;
            console.log(keys);
            this.setState({ keys: keys });
        })
    }

    componentDidMount() {
        this.fetchKeys();
    }

    render() {
        return (
            <React.Fragment>
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
                            <FSNavigator
                                keys={this.state.keys}
                                onKeyClick={this.setActiveKey}
                                fetchKeys={this.fetchKeys}
                                createFile={this.createFile}
                                createDirectory={this.createDirectory}
                                deleteKey={this.deleteKey}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8} lg={9}>
                        <EditorComponent etcdKey={this.state.activeKey} />
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: "40px" }}>
                            {/* <Orders /> */}
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        )
    }
}

export default KeysComponent;