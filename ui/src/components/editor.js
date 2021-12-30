import * as React from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import MonacoEditor from 'react-monaco-editor';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import axios from 'axios';

class EditorComponent extends React.Component {

    constructor(props) {
        super(props);
        console.log(this.props);
        this.state = {
            key: "",
            value: '// Please select a key',
            remoteKey: {}
        }

        this.onChange = this.onChange.bind(this);
        this.discard = this.discard.bind(this);
        this.save = this.save.bind(this);
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
        axios.get(`/api/keys?key=` + key, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        })
            .then(res => {
                this.setState({
                    key: res.data.key,
                    value: res.data.value,
                    remoteKey: res.data
                });
            })
    }

    discard(){
        this.fetchKey(this.props.etcdKey)
    }

    save(){
        axios.put(`/api/keys`, {
            key: this.state.key,
            value: this.state.value
        }, {
            auth: {
                username: localStorage.getItem("user"),
                password: localStorage.getItem("password")
            },
            headers: {
                "X-Endpoints": localStorage.getItem("endpoints")
            }
        })
            .then(res => {
                alert("saved " + res.data.revision);
            }).catch(err => {
                console.error(err);
            })
    }

    componentDidUpdate(prevProps) {
        if (this.props.etcdKey !== prevProps.etcdKey) {
            this.fetchKey(this.props.etcdKey);
        }
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

        const Item = styled(Paper)(({ theme }) => ({
            ...theme.typography.body2,
            padding: theme.spacing(1),
            textAlign: 'center',
            color: theme.palette.text.secondary,
          }));

        return (

            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 800,
                }}
            >
                <Paper sx={{marginBottom: 1, padding: 2}}>
                    <Stack direction="row" spacing={2}>
                        <Item>Key: {this.state.key}</Item>
                        <Item>Create Revision: {this.state.remoteKey.createRevision} </Item>
                        <Item>Mod Revision: {this.state.remoteKey.modRevision}</Item>
                        <Item>Version: {this.state.remoteKey.version}</Item>
                        <Item>Lease: { this.state.remoteKey.lease === 0 ? "None": this.state.remoteKey.lease }</Item>
                    </Stack>
                </Paper>
                <div>

                    <MonacoEditor
                        width="100%"
                        height="650"
                        language="yaml"
                        theme="vs-dark"
                        value={code}
                        options={options}
                        onChange={this.onChange}
                        editorDidMount={this.editorDidMount}
                    />

                    <div style={{ float: "right", paddingTop: "10px" }}>
                        <Button variant="contained" color="success" style={{marginRight:"10px"}} onClick={this.save}>
                            Save
                        </Button>
                        <Button variant="contained" color="error" onClick={this.discard}>
                            Discard
                        </Button>
                    </div>
                </div>
            </Paper>
        )
    }
}

export default EditorComponent;