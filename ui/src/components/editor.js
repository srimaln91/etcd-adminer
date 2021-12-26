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

        this.onChange = this.onChange.bind(this);
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

    fetchKey(key){
        axios.get(`http://localhost:8086/api/keys?key=` + key, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            }
        })
            .then(res => {
                this.setState({
                    key: res.data.key,
                    value: res.data.value
                });
            })
    }

    componentDidUpdate(prevProps) {
        if (this.props.etcdKey !== prevProps.etcdKey) {
            this.fetchKey(this.props.etcdKey);
        }
    }

    componentDidMount() {
        this.fetchKey(this.props.etcdKey);
    }

    editorDidMount(editor, monaco) {
        editor.focus();
    }

    onChange(newValue, e) {
        this.setState({
            value: newValue
        })
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
                <Paper sx={{marginBottom: 1, paddingLeft: 2}}>
                    <p>Key: {this.state.key}</p>
                </Paper>
                <div>

                    <MonacoEditor
                        width="100%"
                        height="650"
                        language="javascript"
                        theme="vs-dark"
                        value={code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />

                    <div style={{ float: "right", paddingTop: "10px" }}>
                        <Button variant="contained" color="success" style={{marginRight:"10px"}}>
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