import { useRef, useState } from "react";

function RegistrationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const browseButtonRef = useRef(null);

  async function setPdfFile(file) {
    setSelectedFile(null);
    setFileError("");

    if (!file) {
      return;
    }

    const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
    const hasPdfType = !file.type || file.type === "application/pdf";
    let hasPdfSignature = false;

    try {
      const header = await file.slice(0, 5).text();
      hasPdfSignature = header === "%PDF-";
    } catch {
      setFileError("No se pudo leer el archivo. Intenta seleccionar otro PDF.");
      return;
    }

    if (!hasPdfExtension || !hasPdfType || !hasPdfSignature) {
      setFileError("El archivo debe ser un PDF válido.");
      return;
    }

    setSelectedFile(file);
  }

  function handleFileChange(event) {
    setPdfFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    setPdfFile(event.dataTransfer.files?.[0]);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setFileError("Selecciona un archivo PDF para continuar.");
      browseButtonRef.current?.focus();
      return;
    }

    setSubmitted(true);
  }

  return (
    <main>
      <h1>Registro para examen</h1>
      <p>Registra tu información para poder presentarte al examen de manera correcta.</p>
      <p>Completa tus datos para registrarte.</p>

      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="nombre">Nombre</label><br />
          <input id="nombre" name="nombre" type="text" autoComplete="name" required />
        </p>

        <p>
          <label htmlFor="telefono">Teléfono</label><br />
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" required />
        </p>

        <p>
          <label htmlFor="correo">Correo electrónico</label><br />
          <input id="correo" name="correo" type="email" autoComplete="email" required />
        </p>

        <p>
          <label htmlFor="direccion">Dirección (opcional)</label><br />
          <textarea id="direccion" name="direccion" autoComplete="street-address" rows="3" />
        </p>

        <p>
          <label htmlFor="edad">Edad</label><br />
          <input id="edad" name="edad" type="number" inputMode="numeric" required />
        </p>

        <fieldset>
          <legend>Documento PDF (obligatorio)</legend>
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            aria-describedby="archivo-ayuda archivo-estado"
            style={{
              border: `2px dashed ${isDragging ? "var(--teal)" : "var(--line)"}`,
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <p>Arrastra tu archivo PDF aquí o selecciónalo desde tu dispositivo.</p>
            <input
              ref={fileInputRef}
              id="documento"
              name="documento"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              hidden
            />
            <button
              ref={browseButtonRef}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Buscar archivo PDF en tu dispositivo"
            >
              Buscar archivo
            </button>
            <p id="archivo-ayuda">Solo se permiten archivos PDF.</p>
            <p id="archivo-estado" role="status" aria-live="polite">
              {selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : ""}
            </p>
            {fileError && <p role="alert">{fileError}</p>}
          </div>
        </fieldset>

        <button type="submit">Registrarme</button>
      </form>

      {submitted && (
        <p role="status" aria-live="polite">
          Esta es una demostración: tus datos no se enviaron ni se guardaron.
        </p>
      )}
    </main>
  );
}

export default RegistrationPage;