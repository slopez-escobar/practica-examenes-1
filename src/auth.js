export const DEMO_CREDENTIALS = Object.freeze({
  username: "demo",
  password: "Examen123!"
});

const SESSION_KEY = "registroExamenAuth";
const USERS_KEY = "registroExamenUsers";

function readUsers() {
  const savedUsers = window.localStorage.getItem(USERS_KEY);
  const users = savedUsers ? JSON.parse(savedUsers) : [];

  if (!Array.isArray(users)) {
    throw new Error("No se pudieron leer las cuentas guardadas.");
  }

  return users;
}

export function getCurrentUser() {
  try {
    const username = window.localStorage.getItem(SESSION_KEY);
    return username === "1" ? DEMO_CREDENTIALS.username : username;
  } catch {
    return null;
  }
}

export function authenticateDemoUser(username, password) {
  try {
    const users = readUsers();
    const account = username === DEMO_CREDENTIALS.username
      ? { username: DEMO_CREDENTIALS.username, password: DEMO_CREDENTIALS.password }
      : users.find((user) => user.username === username);

    if (!account || account.password !== password) {
      return "invalid";
    }

    window.localStorage.setItem(SESSION_KEY, account.username);
    return "authenticated";
  } catch {
    return "storage-error";
  }
}

export function createUser(username, password) {
  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password) {
    return "invalid";
  }

  try {
    const users = readUsers();
    if (
      normalizedUsername.toLowerCase() === DEMO_CREDENTIALS.username ||
      users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase())
    ) {
      return "exists";
    }

    users.push({ username: normalizedUsername, password });
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.localStorage.setItem(SESSION_KEY, normalizedUsername);
    return "created";
  } catch {
    return "storage-error";
  }
}

export function signOut() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    return false;
  }
  return true;
}
