import * as React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MonacoEditor from 'react-monaco-editor';
import axios from 'axios';

class EditorComponent extends React.Component {

    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            key: "",
            value: '// Please select a key',
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (props.etcdKey !== state.key) {
            return {
                key: props.etcdKey,
            };
        }

        // Return null if the state hasn't changed
        return null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.etcdKey != prevProps.etcdKey) {
            axios.get(`http://localhost:8086/api/keys?key=` + this.props.etcdKey, {
            auth: {
                username: 'root',
                password: 'root@123'
            }
        })
            .then(res => {
                this.setState({
                    key: res.data.key,
                    value: res.data.value
                });
            })
        }
    }

    componentDidMount() {
        axios.get(`http://localhost:8086/api/keys?key=` + this.props.etcdKey, {
            auth: {
                username: 'root',
                password: 'root@123'
            }
        })
            .then(res => {
                this.setState({
                    key: res.data.key,
                    value: res.data.value
                });
            })
    }

    editorDidMount(editor, monaco) {
        editor.focus();
    }

    onChange(newValue, e) {
        console.log('onChange', newValue, e);
    }

    render() {
        const code = this.state.value;
        const options = {
            selectOnLineNumbers: true
        };

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

                    <MonacoEditor
                        width="100%"
                        height="700"
                        language="javascript"
                        theme="vs-dark"
                        value={code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />

                    <div style={{ float: "right", padding: "10px" }}>
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