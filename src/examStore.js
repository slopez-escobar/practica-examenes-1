const EXAMS_KEY = "registroExamenExams";
const SUBMISSIONS_KEY = "registroExamenSubmissions";

function readCollection(key, label) {
  let collection;
  try {
    const saved = window.localStorage.getItem(key);
    collection = saved ? JSON.parse(saved) : [];
  } catch {
    throw new Error(`No se pudieron leer ${label} guardados.`);
  }

  if (!Array.isArray(collection)) {
    throw new Error(`Los datos de ${label} guardados no tienen un formato válido.`);
  }

  return collection;
}

function writeCollection(key, collection, label) {
  try {
    window.localStorage.setItem(key, JSON.stringify(collection));
  } catch {
    throw new Error(`No se pudieron guardar ${label}. Revisa el espacio disponible del navegador.`);
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getExams() {
  return readCollection(EXAMS_KEY, "los exámenes");
}

export function getExam(examId) {
  return getExams().find((exam) => exam.id === examId) ?? null;
}

export function createExam({ title, description, questions }, owner) {
  const exams = getExams();
  const exam = {
    id: createId(),
    owner,
    title: title.trim(),
    description: description.trim(),
    questions: questions.map((question) => ({
      id: createId(),
      text: question.text.trim(),
      type: question.type,
      options: question.type === "choice"
        ? question.options.map((option) => option.trim()).filter(Boolean)
        : []
    })),
    createdAt: new Date().toISOString()
  };

  exams.unshift(exam);
  writeCollection(EXAMS_KEY, exams, "el examen");
  return exam;
}

export function getSubmissions(examId) {
  return readCollection(SUBMISSIONS_KEY, "las respuestas")
    .filter((submission) => submission.examId === examId);
}

export function hasResponded(examId, username) {
  return getSubmissions(examId).some((submission) => submission.respondent === username);
}

export function submitExam(exam, respondent, answers) {
  const submissions = readCollection(SUBMISSIONS_KEY, "las respuestas");
  if (submissions.some((submission) =>
    submission.examId === exam.id && submission.respondent === respondent
  )) {
    throw new Error("Ya enviaste tus respuestas a este examen.");
  }

  const submission = {
    id: createId(),
    examId: exam.id,
    respondent,
    answers,
    submittedAt: new Date().toISOString()
  };
  submissions.push(submission);
  writeCollection(SUBMISSIONS_KEY, submissions, "tus respuestas");
  return submission;
}
