import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth.js";
import { createExam } from "../examStore.js";
import { clearFormDraft, readFormDraft, saveFormDraft } from "../formDraft.js";

function CreateExamPage() {
  const username = getCurrentUser();
  const draftKey = `registroExamenDraft:create:${username}`;
  const [initialDraft] = useState(() => {
    try {
      const savedDraft = readFormDraft(draftKey, "creación del examen");
      if (!savedDraft) return { value: null, error: "" };
      if (
        typeof savedDraft.title !== "string" ||
        typeof savedDraft.description !== "string" ||
        !Array.isArray(savedDraft.questions) ||
        savedDraft.questions.length === 0 ||
        savedDraft.questions.some((question) =>
          !question ||
          typeof question.text !== "string" ||
          !["choice", "text"].includes(question.type) ||
          typeof question.options !== "string"
        )
      ) {
        throw new Error("El borrador de creación del examen no tiene un formato válido.");
      }

      const questions = savedDraft.questions.map((question, index) => ({
        clientId: Number.isInteger(question.clientId) ? question.clientId : index + 1,
        text: question.text,
        type: question.type,
        options: question.options
      }));
      return { value: { ...savedDraft, questions }, error: "" };
    } catch (loadError) {
      return { value: null, error: loadError.message };
    }
  });
  const [title, setTitle] = useState(initialDraft.value?.title ?? "");
  const [description, setDescription] = useState(initialDraft.value?.description ?? "");
  const [questions, setQuestions] = useState(initialDraft.value?.questions ?? [
    { clientId: 1, text: "", type: "choice", options: "" }
  ]);
  const [nextId, setNextId] = useState(() =>
    Math.max(1, ...(initialDraft.value?.questions ?? []).map((question) => question.clientId)) + 1
  );
  const [isDirty, setIsDirty] = useState(Boolean(initialDraft.value));
  const [draftMessage, setDraftMessage] = useState("");
  const [draftError, setDraftError] = useState(initialDraft.error);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDirty) return;
    try {
      saveFormDraft(draftKey, { title, description, questions }, "creación del examen");
      setDraftMessage("Borrador guardado automáticamente.");
      setDraftError("");
    } catch (saveError) {
      setDraftError(saveError.message);
    }
  }, [description, draftKey, isDirty, questions, title]);

  function updateQuestion(clientId, field, value) {
    setIsDirty(true);
    setQuestions((current) => current.map((question) =>
      question.clientId === clientId ? { ...question, [field]: value } : question
    ));
  }

  function addQuestion() {
    setIsDirty(true);
    setQuestions((current) => [...current, {
      clientId: nextId,
      text: "",
      type: "choice",
      options: ""
    }]);
    setNextId((current) => current + 1);
  }

  function removeQuestion(clientId) {
    setIsDirty(true);
    setQuestions((current) => current.filter((question) => question.clientId !== clientId));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("titulo") ?? "").trim();
    const cleanQuestions = questions.map((question) => ({
      ...question,
      text: question.text.trim(),
      options: question.options.split("\n").map((option) => option.trim()).filter(Boolean)
    }));

    if (!title) {
      setError("Escribe un título para el examen.");
      return;
    }
    if (cleanQuestions.some((question) => !question.text)) {
      setError("Escribe el enunciado de todas las preguntas.");
      return;
    }
    if (cleanQuestions.some((question) => question.type === "choice" && question.options.length < 2)) {
      setError("Cada pregunta de opción múltiple necesita al menos dos opciones.");
      return;
    }

    let exam;
    try {
      exam = createExam({
        title,
        description: String(formData.get("descripcion") ?? ""),
        questions: cleanQuestions
      }, username);
    } catch (saveError) {
      setError(saveError.message);
      return;
    }

    try {
      clearFormDraft(draftKey, "creación del examen");
    } catch (clearError) {
      navigate(`/examenes/${exam.id}/resultados`, {
        replace: true,
        state: { draftWarning: clearError.message }
      });
      return;
    }

    navigate(`/examenes/${exam.id}/resultados`, { replace: true });
  }

  return (
    <main className="page-shell narrow-shell">
      <p className="eyebrow">Nuevo formulario</p>
      <h1>Crear un examen</h1>
      <p>Las personas que usen este navegador con otra cuenta podrán encontrarlo en la comunidad.</p>

      <form className="editor-form" onSubmit={handleSubmit}>
        <label>
          Título del examen
          <input
            name="titulo"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setIsDirty(true);
            }}
            maxLength="100"
            placeholder="Ej. Fundamentos de ciencias"
            required
          />
        </label>
        <label>
          Descripción <span className="muted">(opcional)</span>
          <textarea
            name="descripcion"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setIsDirty(true);
            }}
            rows="3"
            maxLength="500"
            placeholder="¿De qué trata este examen?"
          />
        </label>

        <div className="section-heading question-heading">
          <h2>Preguntas</h2>
          <span>{questions.length}</span>
        </div>
        {questions.map((question, index) => (
          <fieldset className="question-editor" key={question.clientId}>
            <legend className="question-title">
              Pregunta {index + 1}
              {questions.length > 1 && (
                <button className="text-button danger-text" type="button" onClick={() => removeQuestion(question.clientId)}>
                  Quitar
                </button>
              )}
            </legend>
            <label>
              Enunciado
              <input
                value={question.text}
                onChange={(event) => updateQuestion(question.clientId, "text", event.target.value)}
                maxLength="300"
                required
              />
            </label>
            <label>
              Tipo de respuesta
              <select
                value={question.type}
                onChange={(event) => updateQuestion(question.clientId, "type", event.target.value)}
              >
                <option value="choice">Opción múltiple</option>
                <option value="text">Respuesta abierta</option>
              </select>
            </label>
            {question.type === "choice" && (
              <label>
                Opciones <span className="muted">(una por línea, mínimo dos)</span>
                <textarea
                  value={question.options}
                  onChange={(event) => updateQuestion(question.clientId, "options", event.target.value)}
                  rows="3"
                  placeholder={"Opción 1\nOpción 2"}
                  required
                />
              </label>
            )}
          </fieldset>
        ))}

        <button className="button-secondary" type="button" onClick={addQuestion}>+ Agregar pregunta</button>
        {error && <p className="notice error" role="alert">{error}</p>}
        {draftError && <p className="notice error" role="alert">{draftError}</p>}
        {draftMessage && <p className="muted" role="status">{draftMessage}</p>}
        <div className="form-actions">
          <button type="submit">Publicar examen</button>
        </div>
      </form>
    </main>
  );
}

export default CreateExamPage;
