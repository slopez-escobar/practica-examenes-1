import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import RegistrationPage from "./RegistrationPage.jsx";

describe("RegistrationPage", () => {
  it("acepta un PDF válido y muestra el mensaje de éxito al enviarlo", async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);

    await user.type(screen.getByLabelText("Nombre"), "Ana García");
    await user.type(screen.getByLabelText("Teléfono"), "555123456");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await user.type(screen.getByLabelText("Edad"), "28");

    const fileInput = document.querySelector('input[type="file"]');
    const validPdf = new File(["%PDF-1.4\n%\uFEFF\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"], "identidad.pdf", {
      type: "application/pdf"
    });

    await user.upload(fileInput, validPdf);

    await waitFor(() => {
      expect(screen.getByText("Archivo seleccionado: identidad.pdf")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(
      screen.getByText("Esta es una demostración: tus datos no se enviaron ni se guardaron.")
    ).toBeInTheDocument();
  });

  it("rechaza un archivo PDF inválido", async () => {
    const user = userEvent.setup();
    render(<RegistrationPage />);

    const fileInput = document.querySelector('input[type="file"]');
    const invalidPdf = new File(["texto sin pdf"], "documento.pdf", { type: "application/pdf" });

    await user.upload(fileInput, invalidPdf);

    expect(await screen.findByRole("alert")).toHaveTextContent("El archivo debe ser un PDF válido.");
  });
});
