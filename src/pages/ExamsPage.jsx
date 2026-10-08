import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../auth.js";
import { getExams, getSubmissions } from "../examStore.js";

function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");
  const username = getCurrentUser();

  useEffect(() => {
    try {
      const savedExams = getExams();
      setExams(savedExams);
      setResponses(Object.fromEntries(savedExams.map((exam) => [
        exam.id,
        getSubmissions(exam.id).length
      ])));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  const ownExams = exams.filter((exam) => exam.owner === username);
  const sharedExams = exams.filter((exam) => exam.owner !== username);

  function renderExam(exam, isOwner) {
    return (
      <article className="exam-card" key={exam.id}>
        <div className="exam-card-heading">
          <div>
            <h3>{exam.title}</h3>
            <p className="muted">{isOwner ? "Creado por ti" : `Creado por ${exam.owner}`}</p>
          </div>
          <span className="question-count">{exam.questions.length} {exam.questions.length === 1 ? "pregunta" : "preguntas"}</span>
        </div>
        {exam.description && <p>{exam.description}</p>}
        <div className="card-actions">
          <Link className="button-link" to={`/examenes/${exam.id}/responder`}>Ver y responder</Link>
          {isOwner && (
            <Link className="button-link button-secondary" to={`/examenes/${exam.id}/resultados`}>
              Resultados ({responses[exam.id] ?? 0})
            </Link>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Tu espacio de aprendizaje</p>
          <h1>Exámenes y formularios</h1>
          <p>Crea un examen para compartirlo con otros usuarios o responde los que han publicado.</p>
        </div>
        <Link className="button-link" to="/examenes/nuevo">+ Crear examen</Link>
      </section>
      {error && <p className="notice error" role="alert">{error}</p>}

      <section className="exam-section">
        <div className="section-heading"><h2>Tus exámenes</h2><span>{ownExams.length}</span></div>
        {ownExams.length ? (
          <div className="exam-grid">{ownExams.map((exam) => renderExam(exam, true))}</div>
        ) : (
          <div className="empty-state">
            <h3>Aún no has creado ningún examen</h3>
            <p>Agrega preguntas y comparte el formulario con otros usuarios.</p>
            <Link to="/examenes/nuevo">Crear mi primer examen</Link>
          </div>
        )}
      </section>

      <section className="exam-section">
        <div className="section-heading"><h2>Exámenes de la comunidad</h2><span>{sharedExams.length}</span></div>
        {sharedExams.length ? (
          <div className="exam-grid">{sharedExams.map((exam) => renderExam(exam, false))}</div>
        ) : (
          <div className="empty-state compact"><p>Cuando alguien más publique un examen, aparecerá aquí.</p></div>
        )}
      </section>
      <p className="storage-note">Los exámenes de esta demostración se comparten en el mismo navegador. No se envían a un servidor.</p>
    </main>
  );
}

export default ExamsPage;
