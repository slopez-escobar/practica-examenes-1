export function readFormDraft(key, label) {
  let saved;
  try {
    saved = window.localStorage.getItem(key);
  } catch {
    throw new Error(`No se pudo recuperar el borrador de ${label}.`);
  }

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    throw new Error(`El borrador de ${label} no tiene un formato válido.`);
  }
}

export function saveFormDraft(key, draft, label) {
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    throw new Error(`No se pudo guardar el borrador de ${label}. Revisa el espacio disponible del navegador.`);
  }
}

export function clearFormDraft(key, label) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    throw new Error(`No se pudo eliminar el borrador de ${label}.`);
  }
}
