class SessionManager {
  constructor() {
    this.tokenKey = 'auth_token';
    this.lastActivityKey = 'last_activity';
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
  }

  setSession(token) {
    localStorage.setItem(this.tokenKey, token);
    this.updateLastActivity();
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  updateLastActivity() {
    localStorage.setItem(this.lastActivityKey, Date.now().toString());
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.lastActivityKey);
  }

  isSessionExpired() {
    const lastActivity = parseInt(localStorage.getItem(this.lastActivityKey));
    if (!lastActivity) return true;
    
    return Date.now() - lastActivity > this.sessionTimeout;
  }
}

export const sessionManager = new SessionManager(); 