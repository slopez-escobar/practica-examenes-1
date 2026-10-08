import { beforeEach, describe, expect, it } from "vitest";
import { clearFormDraft, readFormDraft, saveFormDraft } from "./formDraft.js";

describe("form draft helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda, recupera y borra un borrador de formulario", () => {
    const draft = { title: "Examen de matemáticas", questions: [{ text: "¿Cuál es 2 + 2?" }] };

    saveFormDraft("draft:exam", draft, "examen");
    expect(readFormDraft("draft:exam", "examen")).toEqual(draft);

    clearFormDraft("draft:exam", "examen");
    expect(readFormDraft("draft:exam", "examen")).toBeNull();
  });

  it("lanza un error al recuperar un borrador con JSON inválido", () => {
    window.localStorage.setItem("draft:invalid", "{no-es-json");

    expect(() => readFormDraft("draft:invalid", "prueba")).toThrow(
      "El borrador de prueba no tiene un formato válido."
    );
  });

});
