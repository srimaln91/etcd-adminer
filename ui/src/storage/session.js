class Session {
    Name;
    Endpoints;
    BackEnd;
    UserName;
    Password;
    isActive;

    constructor(name, backend, endpoints, username, password) {
        this.Name = name;
        this.Endpoints = endpoints;
        this.BackEnd = backend
        this.UserName = username;
        this.Password = password;
    }
}

class ErrorNoSessionFound extends Error {}

class SessionStore {
    key = "sessions"

    _getLocalSessions() {
        let data = localStorage.getItem(this.key);
        if (data === "" || data === null) {
            return null;
        }
        let sessions = JSON.parse(data);
        return sessions;
    }

    _setLocalSessions(sessions) {
        localStorage.setItem(this.key, JSON.stringify(sessions));
    }

    Get(name) {
        let sessions = this._getLocalSessions();
        return sessions[name];
    }

    GetAll() {
        try {
            return this._getLocalSessions();
        } catch(e) {
            return null
        }
    }

    Add(session) {
        let sessions = this._getLocalSessions();
        if (sessions === "" || sessions == null) {
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
        let sessions = this._getLocalSessions();
        Object.keys(sessions).forEach((key) => {
            sessions[key].Name === session.Name ? sessions[key].isActive = true : sessions[key].isActive = false
        });

        console.log(sessions);
        this._setLocalSessions(sessions);
    }

    GetActiveSession() {
        try {
            let sessions = this._getLocalSessions();
            return Object.values(sessions).find((obj) => {
                return obj.isActive
            });
        } catch (e) {
            throw e;
        }
    }

    IsLocalSessionAvailable() {
        try {
            let sessions = this._getLocalSessions();

            if(sessions === null) {
                return false;
            }

            if (Object.keys(sessions).length <= 0) {
                return false;
            }
            return true
        } catch (error) {
            return false
        }
    }
}

export { Session, SessionStore }