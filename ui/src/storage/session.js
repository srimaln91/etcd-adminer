class Session {
    Name;
    Endpoints;
    UserName;
    Password;

    constructor(name, endpoints, username, password){
        this.Name = name;
        this.Endpoints = endpoints;
        this.UserName = username;
        this.Password = password;
    }
}

class SessionStore {
    key = "sessions"
    activeSession = "activeSession"

    _getLocalSessions(){
        let data = localStorage.getItem(this.key);
        if (data === "") {
            throw new Error('Required');
        }
        let sessions = JSON.parse(data);
        return sessions;
    }

    _setLocalSessions(sessions){
        localStorage.setItem(this.key, JSON.stringify(sessions));
    }

    Get(name) {
        let sessions = this._getLocalSessions();
        return sessions[name];
    }

    GetAll(){
        return this._getLocalSessions();
    }

    Add(session) {
        let sessions = this._getLocalSessions();
        if (sessions === ""|| sessions == null) {
            sessions = {};
        }
        sessions[session.Name] = session;
        this._setLocalSessions(sessions);
    }

    Delete(session) {
        let sessions = this._getLocalSessions();
        delete sessions[session.Name];
        this._setLocalSessions(sessions);
    }

    SetActiveSession(session) {
        localStorage.setItem(this.activeSession, JSON.stringify(session));
    }

    GetActiveSession() {
        let data = localStorage.getItem(this.activeSession);
        if (data === "" || data === null) {
            return null
        }

        return JSON.parse(data);
    }
}

export {Session, SessionStore}