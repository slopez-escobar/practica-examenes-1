import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getCurrentUser } from "../auth.js";
import { getExam, getSubmissions } from "../examStore.js";

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function ResultsPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const username = getCurrentUser();
  const location = useLocation();

  useEffect(() => {
    try {
      const savedExam = getExam(examId);
      setExam(savedExam);
      if (savedExam?.owner === username) {
        setSubmissions(getSubmissions(savedExam.id));
      }
    } catch (loadError) {
      setError(loadError.message);
    }
    setLoaded(true);
  }, [examId, username]);

  if (!loaded) return <main className="page-shell"><p>Cargando resultados…</p></main>;
  if (error) {
    return <main className="page-shell"><p className="notice error" role="alert">{error}</p><Link to="/examenes">Volver a exámenes</Link></main>;
  }
  if (!exam) {
    return <main className="page-shell"><h1>Examen no encontrado</h1><Link to="/examenes">Volver a exámenes</Link></main>;
  }
  if (exam.owner !== username) {
    return (
      <main className="page-shell narrow-shell">
        <h1>Resultados privados</h1>
        <p>Solo la persona que creó este examen puede consultar las respuestas.</p>
        <Link to="/examenes">Volver a exámenes</Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Resultados de tu examen</p>
          <h1>{exam.title}</h1>
          <p>Revisa las respuestas que enviaron otros usuarios.</p>
        </div>
        <span className="result-total">{submissions.length} {submissions.length === 1 ? "respuesta" : "respuestas"}</span>
      </section>
      {location.state?.draftWarning && (
        <p className="notice error" role="alert">
          El examen se publicó correctamente, pero {location.state.draftWarning}
        </p>
      )}
      {submissions.length === 0 ? (
        <div className="empty-state">
          <h2>Todavía no hay respuestas</h2>
          <p>Cuando alguien conteste el examen, sus respuestas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="response-list">
          {submissions.map((submission, submissionIndex) => (
            <article className="response-card" key={submission.id}>
              <header>
                <div>
                  <h2>Respuesta {submissionIndex + 1}</h2>
                  <p className="respondent-name">{submission.respondent}</p>
                </div>
                <time dateTime={submission.submittedAt}>{formatDate(submission.submittedAt)}</time>
              </header>
              <ol className="response-answers">
                {exam.questions.map((question) => {
                  const answer = submission.answers.find((item) => item.questionId === question.id);
                  return (
                    <li key={question.id}>
                      <h3>{question.text}</h3>
                      <p>{answer?.value || <span className="muted">Sin respuesta</span>}</p>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      )}
      <p className="storage-note">Los datos de esta demostración se conservan únicamente en este navegador.</p>
    </main>
  );
}

export default ResultsPage;
