/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Navegación entre steps: persistencia de respuestas y bloqueos por requeridos

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

describe("Ciudadano - Navegación entre steps (persistencia y bloqueos)", () => {
  beforeEach(() => {
    // Periodo activo
    cy.intercept("GET", "**/api/v1/periodos-encuesta/activos*", {
      statusCode: 200,
      body: {
        data: [
          { id: "PERIODO-2025", periodo: "2025", activo: true, status: true },
        ],
      },
      delay: 50,
    }).as("getActivos");

    // Verificación: sin formulario previo
    cy.intercept(
      "GET",
      "**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**",
      {
        statusCode: 200,
        body: [],
        delay: 50,
      }
    ).as("verifyForm");

    // Mensajes
    cy.intercept("GET", "**/api/v1/mensajes/**", {
      statusCode: 200,
      body: [],
      delay: 50,
    }).as("getMensajes");

    // Metadatos para Step 1 (pregunta 1: Sí/No, anexo=true)
    cy.intercept("GET", "**/api/v1/preguntas/numero/1*", {
      statusCode: 200,
      body: {
        id: "ed399cd2-8ebc-48d4-8ec5-217bacbd464f",
        id_tipo_pregunta: "f21641c4-8417-494a-9b34-aee2b1a974c2",
        num_pregunta: 1,
        contenido_pregunta: "¿Cuenta con un manual del SGIRS implementado?",
        anexo: true,
        status: true,
      },
      delay: 50,
    }).as("getPregunta1");

    // Step 2: Sí/No (sin anexo requerido)
    cy.intercept("GET", "**/api/v1/preguntas/numero/2*", {
      statusCode: 200,
      body: {
        id: "a6918a9f-1343-4d17-b73c-13bcc5e70e00",
        id_tipo_pregunta: "f21641c4-8417-494a-9b34-aee2b1a974c2",
        num_pregunta: 2,
        contenido_pregunta:
          "¿Cuenta con la definición de un esquema organizacional en la que se asignen roles y responsabilidades para el cumplimiento del SGIRS?",
        anexo: true,
        status: true,
      },
      delay: 50,
    }).as("getPregunta2");

    cy.intercept("GET", "**/api/v1/tipo_pregunta/**", {
      statusCode: 200,
      body: [
        {
          id: "f21641c4-8417-494a-9b34-aee2b1a974c2",
          tipo_pregunta: "Sí/No",
          status: true,
        },
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
          {
            id: "opt_si_q2",
            id_pregunta: "Q2",
            orden_opcion: 1,
            opcion_respuesta: "Sí",
            anexo_requerido: false,
            status: true,
          },
          {
            id: "opt_no_q2",
            id_pregunta: "Q2",
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

  it("persiste respuestas entre steps y bloquea avance cuando faltan requeridos", () => {
    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes/formulario");

    const nextBtn = () => cy.findByRole("button", { name: /siguiente/i });
    const prevBtn = () => cy.findByRole("button", { name: /anterior/i });

    // Step 1: Next deshabilitado inicialmente
    nextBtn().should("be.disabled");

    // Seleccionar "No" para poder avanzar sin anexo
    cy.findByLabelText(/^no$/i, { selector: 'input[type="radio"]' }).check({
      force: true,
    });
    nextBtn().should("not.be.disabled");

    // Avanzar a Step 2
    nextBtn().click();

    // Volver a Step 1 y validar persistencia de respuesta "No"
    prevBtn().click();
    cy.findByLabelText(/^no$/i, { selector: 'input[type="radio"]' }).should(
      "be.checked"
    );

    // Avanzar nuevamente a Step 2
    nextBtn().click();

    // Responder Step 2 y habilitar Next
    cy.findByLabelText(/^No$/i, { selector: 'input[type="radio"]' }).check({
      force: true,
    });
    nextBtn().should("not.be.disabled");
  });
});

export {};
