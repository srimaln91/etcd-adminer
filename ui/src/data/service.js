import axios from 'axios';
import { SessionStore } from '../storage/session';

export default class DataService {
    sessionStore;
    constructor(sessionStore) {
        this.sessionStore = new SessionStore();
    }

    GetConfig = () => {
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/getconfig`);

                if (response.status === 200) {
                    resolve(response.data);
                }
                reject(new Error("invalid response code"));
            } catch (err) {
                reject(err);
            }
        })
    }

    GetClusterInfo = () => {
        let activeSession = this.sessionStore.GetActiveSession()
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/clusterinfo`, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    },
                    timeout: 10000,
                })
                if (response.status === 200) {
                    resolve(response.data);
                } else {
                    reject(new Error("invalid response code"));
                }
            } catch (err) {
                reject(err);
            }
        })
    }

    TestConnection = (username, password, backend) => {
        // let activeSession = this.sessionStore.GetActiveSession()
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.post(`/api/auth`, null, {
                    auth: {
                        username: username,
                        password: password
                    },
                    headers: {
                        "X-Backend": backend
                    }
                });
                if (response.status === 200) {
                    // Successfulle authenticated
                    resolve(true);
                } else {
                    reject(new Error("Something went wrong!"));
                }
            } catch (error) {
                if (error.response.status === 403) {
                    // Authentication failed
                    resolve(false);
                }
                reject(error);
            }

        })
    }

    GetRoles = () => {
        let activeSession = this.sessionStore.GetActiveSession();
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/role`, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                })

                if (response.status === 200) {
                    resolve(response.data);
                }

                reject(new Error("invalid response received!"))

            } catch (error) {
                reject(error);
            }
        })
    }

    CreateUser = (userName, password, roles) => {

        let requestBody = {
            userName: userName,
            password: password,
            roles: roles
        }

        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = axios.post(`/api/users`, requestBody, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 201) {
                    resolve(true);
                }

                reject(new Error("Something went wrong!"));
            }
            catch (error) {
                reject(error);
            }
        })
    }

    FetchKey = (path) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/keys?key=` + path, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(response.data);
                }

                reject(new Error("Invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    PutKey = (key, value) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.put(`/api/keys`, {
                    key: key,
                    value: value
                }, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                })

                if (response.status === 200) {
                    resolve(true);
                }
                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    CreateNode = (path, isDirectory) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.post(`/api/directory`, {
                    path: path,
                    isDirectory: isDirectory
                }, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(response.data);
                }

                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    DeleteNode = (key, isDirectory) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.delete(`/api/keys`, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    },
                    data: {
                        key: key,
                        isDirectory: isDirectory
                    }
                });

                if (response.status === 200) {
                    resolve(true);
                }
                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    GetKeys = () => {
        let activeSession = this.sessionStore.GetActiveSession();
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/keys`, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    },
                });

                if (response.status === 200) {
                    resolve(response.data);
                }
                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    FetchUser = (username) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/users/` + username, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(response.data);
                }

                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    AssignRole = (user, role) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.post(`/api/users/` + user + `/role/` + role, null, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(true);
                }

                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    RemoveRole = (user, role) => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.delete(`/api/users/` + user + `/role/` + role, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                })

                if (response.status === 200) {
                    resolve(true);
                }

                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    GetUsers = () => {
        let activeSession = this.sessionStore.GetActiveSession();

        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.get(`/api/users`, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(response.data);
                }
                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

    DeleteUser = (user) => {
        let activeSession = this.sessionStore.GetActiveSession();
        return new Promise(async (resolve, reject) => {
            try {
                let response = await axios.delete(`/api/users/` + user, {
                    auth: {
                        username: activeSession.UserName,
                        password: activeSession.Password
                    },
                    headers: {
                        "X-Backend": activeSession.BackEnd
                    }
                });

                if (response.status === 200) {
                    resolve(true);
                }

                reject(new Error("invalid response code"));
            } catch (error) {
                reject(error);
            }
        })
    }

}
