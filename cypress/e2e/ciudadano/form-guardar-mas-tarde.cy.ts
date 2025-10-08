/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Guardar para más tarde: crea (cuando no existe) y patch (cuando existe), con y sin archivos

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept("POST", "**/auth/login", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        access_token:
          "header.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQ2l1ZGFkYW5vIn0.signature",
      },
      delay: 50,
    });
  }).as("login");

  cy.visit("/auth/login");
  cy.findByLabelText(/correo electrónico/i).type(email);
  cy.findByLabelText(/contraseña/i, { selector: "input" }).type(password);
  cy.findByRole("button", { name: /iniciar sesión/i }).click();
  cy.wait("@login");
  cy.location("pathname", { timeout: 15000 }).should("eq", "/ciudadano");
};

describe("Ciudadano - Guardar para más tarde", () => {
  beforeEach(() => {
    // Periodo activo para permitir entrada al formulario
    cy.intercept("GET", "**/api/v1/periodos-encuesta/activos*", {
      statusCode: 200,
      body: {
        data: [
          { id: "PERIODO-2025", periodo: "2025", activo: true, status: true },
        ],
      },
      delay: 50,
    }).as("getActivos");

    // Mensajes vacío
    cy.intercept("GET", "**/api/v1/mensajes/**", {
      statusCode: 200,
      body: [],
      delay: 50,
    }).as("getMensajes");

    // Step 1: Sí/No con anexo condicional (anexo=true)
    cy.intercept("GET", "**/api/v1/preguntas/numero/1*", {
      statusCode: 200,
      body: {
        id: "Q1",
        id_tipo_pregunta: "TP_SINO",
        num_pregunta: 1,
        contenido_pregunta: "¿Cuenta con un manual del SGIRS implementado?",
        anexo: true,
        status: true,
      },
      delay: 50,
    }).as("getPregunta1");

    cy.intercept("GET", "**/api/v1/tipo_pregunta/**", {
      statusCode: 200,
      body: [
        { id: "TP_SINO", tipo_pregunta: "Sí/No", status: true },
      ],
      delay: 50,
    }).as("getTiposPregunta");

    cy.intercept("GET", "**/api/v1/opciones-respuesta*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "opt_si",
            id_pregunta: "Q1",
            orden_opcion: 1,
            opcion_respuesta: "Sí",
            anexo_requerido: false,
            status: true,
          },
          {
            id: "opt_no",
            id_pregunta: "Q1",
            orden_opcion: 2,
            opcion_respuesta: "No",
            anexo_requerido: false,
            status: true,
          },
        ],
      },
      delay: 50,
    }).as("getOpciones");
  });

  it("crea formulario (no existe), adjunta PDF y muestra toast de Guardado", () => {
    // Verificación: NO existe aún
    cy.intercept(
      "GET",
      "**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**",
      { statusCode: 200, body: [], delay: 50 }
    ).as("verifyForm");

    // POST crear
    cy.intercept("POST", "**/api/v1/encuesta-estado/**", {
      statusCode: 200,
      body: { ok: true },
      delay: 50,
    }).as("createForm");

    // Upload archivos
    cy.intercept(
      "POST",
      "**/api/v1/respuestas-usuario/respuestas-usuario/subir-archivos-respuestas-usuario**",
      { statusCode: 200, body: { ok: true }, delay: 50 }
    ).as("uploadFiles");

    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes/formulario");
    cy.wait(["@getActivos", "@getPregunta1", "@getTiposPregunta", "@getOpciones", "@verifyForm"]);

    // Responder "Sí" y adjuntar PDF
    cy.findByLabelText(/^sí$/i, { selector: 'input[type="radio"]' }).check({ force: true });

    cy.findByRole("button", { name: /seleccionar archivo/i })
      .invoke("attr", "aria-describedby")
      .then((descId) => {
        const inputId = String(descId).replace(/-label$/, "");
        cy.get(`#${inputId}`).selectFile(
          {
            contents: Cypress.Buffer.from("PDF contenido de prueba"),
            fileName: "manual-sgirs.pdf",
            mimeType: "application/pdf",
            lastModified: Date.now(),
          },
          { force: true }
        );
      });

    // Guardar para más tarde
    cy.contains('button', /guardar para más tarde/i)
      .filter(':visible')
      .should('not.be.disabled')
      .click();
    // Confirmar en el diálogo (usar texto visible "Sí, guardar")
    cy.contains('button', /^sí, guardar$/i).click();

    // Debe llamar a createForm y uploadFiles
    cy.wait(["@createForm", "@uploadFiles"]);

    // Toast de éxito
    cy.findByText(/se guardaron exitosamente las preguntas/i, { timeout: 10000 }).should("be.visible");
  });

});

export {};
