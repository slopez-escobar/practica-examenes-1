import { beforeEach, describe, expect, it } from "vitest";
import { createExam, getExam, getExams, getSubmissions, hasResponded, submitExam } from "./examStore.js";

describe("exam store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("crea un examen con las preguntas normalizadas", () => {
    const exam = createExam({
      title: "  Matemáticas  ",
      description: "  Descubre tus habilidades  ",
      questions: [
        {
          text: "  ¿Cuál es 2 + 2?  ",
          type: "choice",
          options: ["  3  ", "  4  ", "  5  "]
        }
      ]
    }, "alice");

    expect(exam).toMatchObject({
      owner: "alice",
      title: "Matemáticas",
      description: "Descubre tus habilidades",
      questions: [
        {
          text: "¿Cuál es 2 + 2?",
          type: "choice",
          options: ["3", "4", "5"]
        }
      ]
    });
    expect(getExams()).toHaveLength(1);
    expect(getExam(exam.id)).toEqual(exam);
  });

  it("guarda y consulta las respuestas de cada estudiante por examen", () => {
    const exam = createExam({
      title: "Historia",
      description: "Historia del arte",
      questions: [{ text: "¿Qué año fue la primera guerra mundial?", type: "text", options: [] }]
    }, "teacher");

    const submission = submitExam(exam, "bob", { 0: "1914" });

    expect(submission.examId).toBe(exam.id);
    expect(getSubmissions(exam.id)).toHaveLength(1);
    expect(hasResponded(exam.id, "bob")).toBe(true);
    expect(hasResponded(exam.id, "alice")).toBe(false);
  });

  it("impide enviar el mismo examen dos veces por el mismo estudiante", () => {
    const exam = createExam({
      title: "Biología",
      description: "Células",
      questions: [{ text: "¿Qué es una célula?", type: "text", options: [] }]
    }, "teacher");

    submitExam(exam, "carol", { 0: "Unidad básica" });

    expect(() => submitExam(exam, "carol", { 0: "Otra respuesta" })).toThrow(
      "Ya enviaste tus respuestas a este examen."
    );
  });
});
