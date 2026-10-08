import { beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_CREDENTIALS,
  authenticateDemoUser,
  createUser,
  getCurrentUser,
  signOut
} from "./auth.js";

const LOCAL_STORAGE_KEYS = {
  session: "registroExamenAuth",
  users: "registroExamenUsers"
};

describe("auth helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("autentica al usuario de demostración con las credenciales correctas", () => {
    expect(authenticateDemoUser(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password)).toBe("authenticated");
    expect(getCurrentUser()).toBe(DEMO_CREDENTIALS.username);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.session)).toBe(DEMO_CREDENTIALS.username);
  });

  it("rechaza credenciales inválidas o desconocidas", () => {
    expect(authenticateDemoUser("demo", "error")).toBe("invalid");
    expect(authenticateDemoUser("usuario-que-no-existe", DEMO_CREDENTIALS.password)).toBe("invalid");
  });

  it("crea un usuario nuevo y guarda la sesión actual", () => {
    const result = createUser("ana", "Password123!");

    expect(result).toBe("created");
    expect(getCurrentUser()).toBe("ana");

    const savedUsers = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEYS.users));
    expect(savedUsers).toEqual([{ username: "ana", password: "Password123!" }]);
  });

  it("no permite crear usuarios duplicados ni vacíos", () => {
    expect(createUser("   ", "Password123!")).toBe("invalid");
    expect(createUser(DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password)).toBe("exists");

    createUser("Ana", "Password123!");
    expect(createUser("ana", "Password123!")).toBe("exists");
  });

  it("obtiene el usuario activo incluso cuando la sesión se guarda con el indicador demo", () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.session, "1");
    expect(getCurrentUser()).toBe(DEMO_CREDENTIALS.username);
  });

  it("cierra la sesión del usuario actual", () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS.session, "ana");

    expect(signOut()).toBe(true);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEYS.session)).toBeNull();
  });
});
