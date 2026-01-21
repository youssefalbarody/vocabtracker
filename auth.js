;(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    users: 'vocabUsers',
    currentUser: 'currentUser',
    loggedInFlag: 'vocabUserLoggedIn',
    userData: 'userData',
  };

  const readUsers = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.users);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeUsers = (users) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  };

  const normalizeEmail = (email) => (email || '').trim().toLowerCase();

  const findUserByEmail = (email) => {
    const target = normalizeEmail(email);
    if (!target) return null;
    const users = readUsers();
    return users.find((u) => normalizeEmail(u.email) === target) || null;
  };

  const registerUser = (payload) => {
    const firstName = (payload.firstName || '').trim();
    const lastName = (payload.lastName || '').trim();
    const email = (payload.email || '').trim();
    const password = payload.password || '';

    if (!firstName || !lastName || !email || !password) {
      return { success: false, reason: 'missing_fields' };
    }

    if (findUserByEmail(email)) {
      return { success: false, reason: 'email_exists' };
    }

    const users = readUsers();
    const now = new Date().toISOString();

    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password,
      createdAt: now,
    };

    const updated = [...users, user];
    const stored = writeUsers(updated);
    if (!stored) {
      return { success: false, reason: 'storage_failed' };
    }

    return { success: true, user };
  };

  const authenticate = (email, password) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return { success: false, reason: 'missing_fields' };
    }

    const user = findUserByEmail(normalizedEmail);
    if (!user) {
      return { success: false, reason: 'email_not_found' };
    }

    if (user.password !== password) {
      return { success: false, reason: 'wrong_password' };
    }

    return { success: true, user };
  };

  const setCurrentUser = (user) => {
    if (!user || !user.email) return;

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt,
    };

    try {
      window.sessionStorage.removeItem('guestMode');
      window.localStorage.setItem(
        STORAGE_KEYS.currentUser,
        JSON.stringify(safeUser)
      );
      window.localStorage.setItem(STORAGE_KEYS.loggedInFlag, 'true');
      window.localStorage.setItem(
        STORAGE_KEYS.userData,
        JSON.stringify({
          firstName: safeUser.firstName,
          lastName: safeUser.lastName,
          email: safeUser.email,
          createdAt: safeUser.createdAt,
        })
      );
    } catch {
    }
  };

  const clearCurrentUser = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.currentUser);
      window.localStorage.removeItem(STORAGE_KEYS.loggedInFlag);
      window.localStorage.removeItem(STORAGE_KEYS.userData);
      window.sessionStorage.removeItem('guestMode');
    } catch {
    }
  };

  const logout = () => {
    clearCurrentUser();
    window.location.href = 'index.html';
  };

  window.Auth = {
    readUsers,
    writeUsers,
    findUserByEmail,
    registerUser,
    authenticate,
    setCurrentUser,
    clearCurrentUser,
    logout,
  };
})(window);

