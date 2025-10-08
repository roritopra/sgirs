/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Reanudar formulario con prefill de respuestas y adjuntos

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept("POST", "**/auth/login", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        access_token: "eyJhbGciOiJub3QtcmVhbC10b2tlbiJ9.fake.payload",
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

describe("Ciudadano - Reanudar formulario (prefill respuestas y adjuntos)", () => {
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

    // Mensajes
    cy.intercept("GET", "**/api/v1/mensajes/**", {
      statusCode: 200,
      body: [],
      delay: 50,
    }).as("getMensajes");

    // Preguntas 1 y 2
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

    // Tipos y opciones
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
            id: "opt_si_q1",
            id_pregunta: "ed399cd2-8ebc-48d4-8ec5-217bacbd464f",
            orden_opcion: 1,
            opcion_respuesta: "Sí",
            anexo_requerido: false,
            status: true,
          },
          {
            id: "opt_no_q1",
            id_pregunta: "ed399cd2-8ebc-48d4-8ec5-217bacbd464f",
            orden_opcion: 2,
            opcion_respuesta: "No",
            anexo_requerido: false,
            status: true,
          },
          {
            id: "opt_si_q2",
            id_pregunta: "a6918a9f-1343-4d17-b73c-13bcc5e70e00",
            orden_opcion: 1,
            opcion_respuesta: "Sí",
            anexo_requerido: false,
            status: true,
          },
          {
            id: "opt_no_q2",
            id_pregunta: "a6918a9f-1343-4d17-b73c-13bcc5e70e00",
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

  it("prefill: Step 1 con 'Sí' y archivo; Step 2 con 'No'", () => {
    // Verificación: existe formulario
    cy.intercept(
      "GET",
      "**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**",
      { statusCode: 200, body: [{ id: "EXISTE" }], delay: 50 }
    ).as("verifyForm");

    // Respuestas guardadas para rehidratar (con num_pregunta)
    cy.intercept(
      {
        method: "GET",
        url: /\/api\/v1\/respuestas-usuario\/respuestas-usuario\/[^/]+\/mostrar-respuestas-a-preguntas-y-archivos(?:-[^/?#]+)?(?:\?.*)?$/,
      },
      {
        statusCode: 200,
        body: {
          respuestas_usuario: [
            {
              num_pregunta: 2,
              opcion_respuesta: "No",
            },
          ],
        },
        delay: 50,
      }
    ).as("getAnswers");

    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes/formulario");

    // Esperar verificación y respuestas
    cy.wait([
      "@getActivos",
      "@verifyForm",
      "@getAnswers",
      "@getPregunta1",
      "@getTiposPregunta",
      "@getOpciones",
    ]);

    const nextBtn = () => cy.findByRole("button", { name: /siguiente/i });

    // Avanzar a Step 2 (prefill ya tiene respuesta "No")
    nextBtn().should("not.be.disabled").click();
    cy.wait(["@getPregunta2", "@getTiposPregunta", "@getOpciones"]);

    // Step 2: "No" debe estar marcado
    cy.findByLabelText(/^no$/i, { selector: 'input[type="radio"]' }).should(
      "be.checked"
    );
  });
});

export {};
