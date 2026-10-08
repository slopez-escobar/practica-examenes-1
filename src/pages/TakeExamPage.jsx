import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../auth.js";
import { getExam, hasResponded, submitExam } from "../examStore.js";
import { clearFormDraft, readFormDraft, saveFormDraft } from "../formDraft.js";

function TakeExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [draftError, setDraftError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [answers, setAnswers] = useState({});
  const [draftReady, setDraftReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const username = getCurrentUser();
  const draftKey = `registroExamenDraft:answer:${username}:${examId}`;
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedExam = getExam(examId);
      setExam(savedExam);
      if (savedExam) {
        const responded = hasResponded(savedExam.id, username);
        setAlreadyResponded(responded);
        if (!responded) {
          try {
            const savedAnswers = readFormDraft(draftKey, "respuesta del examen");
            if (savedAnswers !== null) {
              if (
                typeof savedAnswers !== "object" ||
                Array.isArray(savedAnswers) ||
                Object.values(savedAnswers).some((value) => typeof value !== "string")
              ) {
                throw new Error("El borrador de respuesta del examen no tiene un formato válido.");
              }
              const restoredAnswers = Object.fromEntries(
                savedExam.questions
                  .filter((question) => Object.hasOwn(savedAnswers, question.id))
                  .map((question) => [question.id, savedAnswers[question.id]])
              );
              setAnswers(restoredAnswers);
              setIsDirty(true);
            }
          } catch (draftLoadError) {
            setDraftError(draftLoadError.message);
          }
        }
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setDraftReady(true);
      setLoaded(true);
    }
  }, [draftKey, examId, username]);

  useEffect(() => {
    if (!exam || !draftReady || !isDirty || complete || alreadyResponded) return;
    try {
      saveFormDraft(draftKey, answers, "respuesta del examen");
      setDraftMessage("Borrador guardado automáticamente.");
      setDraftError("");
    } catch (saveError) {
      setDraftError(saveError.message);
    }
  }, [alreadyResponded, answers, complete, draftKey, draftReady, exam, isDirty]);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const answers = exam.questions.map((question) => ({
      questionId: question.id,
      value: String(formData.get(question.id) ?? "").trim()
    }));
    if (answers.some((answer) => !answer.value)) {
      setError("Completa todas las respuestas antes de enviar.");
      return;
    }

    try {
      submitExam(exam, username, answers);
    } catch (submitError) {
      setError(submitError.message);
      return;
    }

    setAlreadyResponded(true);
    setComplete(true);
    try {
      clearFormDraft(draftKey, "respuesta del examen");
      setDraftError("");
    } catch (clearError) {
      setDraftError(clearError.message);
    }
  }

  if (!loaded) return <main className="page-shell"><p>Cargando examen…</p></main>;
  if (error && !exam) {
    return <main className="page-shell"><p className="notice error" role="alert">{error}</p><Link to="/examenes">Volver a exámenes</Link></main>;
  }
  if (!exam) {
    return <main className="page-shell"><h1>Examen no encontrado</h1><Link to="/examenes">Volver a exámenes</Link></main>;
  }

  if (exam.owner === username) {
    return (
      <main className="page-shell narrow-shell">
        <p className="eyebrow">Examen propio</p>
        <h1>{exam.title}</h1>
        <p>Este examen lo creaste tú. Comparte el acceso con otros usuarios y revisa sus respuestas aquí:</p>
        <Link className="button-link" to={`/examenes/${exam.id}/resultados`}>Ver resultados</Link>
      </main>
    );
  }

  if (complete || alreadyResponded) {
    return (
      <main className="page-shell narrow-shell">
        <div className="success-panel" role="status">
          <span className="success-icon" aria-hidden="true">✓</span>
          <h1>{complete ? "¡Respuesta enviada!" : "Ya respondiste este examen"}</h1>
          <p>{complete ? "Tus respuestas quedaron registradas para que las revise quien creó el examen." : "Solo se permite un envío por usuario."}</p>
          <Link className="button-link" to="/examenes">Volver a exámenes</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell narrow-shell">
      <p className="eyebrow">Examen de {exam.owner}</p>
      <h1>{exam.title}</h1>
      {exam.description && <p className="exam-description">{exam.description}</p>}
      <p className="muted">Tus respuestas serán visibles para quien creó este examen.</p>
      <form className="editor-form" onSubmit={handleSubmit}>
        {exam.questions.map((question, index) => (
          <fieldset className="answer-question" key={question.id}>
            <legend>{index + 1}. {question.text}</legend>
            {question.type === "choice" ? question.options.map((option, optionIndex) => (
              <label className="radio-option" key={`${question.id}-${optionIndex}`}>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
                    setIsDirty(true);
                  }}
                  required
                />
                <span>{option}</span>
              </label>
            )) : (
              <textarea
                name={question.id}
                value={answers[question.id] ?? ""}
                onChange={(event) => {
                  setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
                  setIsDirty(true);
                }}
                rows="3"
                maxLength="1000"
                required
                aria-label={`Respuesta para: ${question.text}`}
              />
            )}
          </fieldset>
        ))}
        {error && <p className="notice error" role="alert">{error}</p>}
        {draftError && <p className="notice error" role="alert">{draftError}</p>}
        {draftMessage && <p className="muted" role="status">{draftMessage}</p>}
        <button type="submit">Enviar respuestas</button>
      </form>
    </main>
  );
}

export default TakeExamPage;
