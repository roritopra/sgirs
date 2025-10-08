/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Listado de reportes: validar dos flujos

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZmRiMmNkYi01YjJhLTQzZjYtOGRiZC00NGQxNzVkYmFiMmEiLCJyb2xlIjoiU2VjdG9yIEVzdHJhdFx1MDBlOWdpY28iLCJub21icmU6IjoiSnVhbiBKb3NcdTAwZTkiLCJleHAiOjE3NTkxNzI5MzB9.0DljTEJx3RIPupxnROHmfcwi0AdTluEsOq-gQdA0IS0";

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept("POST", "**/auth/login", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        access_token: TOKEN,
      },
      delay: 30,
    });
  }).as("login");

  cy.visit("/auth/login");
  cy.findByLabelText(/correo electrónico/i).type(email);
  cy.findByLabelText(/contraseña/i, { selector: "input" }).type(password);
  cy.findByRole("button", { name: /iniciar sesión/i }).click();
  cy.wait("@login");
  cy.location("pathname", { timeout: 15000 }).should("eq", "/ciudadano");
};

const isoNow = () => new Date().toISOString();

describe("Ciudadano - Reportes listado: finalizado y en curso", () => {
  beforeEach(() => {
    // Periodo activo (permite entrar a formulario en curso)
    cy.intercept("GET", "**/api/v1/periodos-encuesta/activos*", {
      statusCode: 200,
      body: { data: [{ id: "51d1edd7-6cde-4b1a-a842-a236ac639c63", periodo: "2025", activo: true, status: true }] },
    }).as("getActivos");

    // Listado combinado de reportes
    cy.intercept(
      {
        method: "GET",
        url: "**/api/v1/respuestas-usuario/respuestas-usuario/combinadas*",
      },
      (req) => {
        // Opcional: validar Authorization si llega
        const auth = req.headers["authorization"] || req.headers["Authorization"];
        if (auth) {
          expect(String(auth)).to.match(/^Bearer\s+.+/);
        }
        req.reply([
          {
            id_periodo_encuesta: "PER-1",
            periodo_encuesta: "2025-I",
            completado: true,
            updated_at: isoNow(),
            created_at: isoNow(),
          },
          {
            id_periodo_encuesta: "PER-2",
            periodo_encuesta: "2025-II",
            completado: false,
            updated_at: isoNow(),
            created_at: isoNow(),
          },
        ]);
      }
    ).as("getCombined");
  });

  it("muestra los reportes y navega a resumen y formulario", () => {
    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes");
    cy.wait(["@getActivos", "@getCombined"]);

    // Debe mostrar un completado y uno pendiente
    cy.findByText(/reporte completado/i).should("be.visible");
    cy.findByText(/reporte pendiente/i).should("be.visible");

    // Flujo 1: Ver resumen del completado
    // Usar RegExp para cubrir 'ñ' codificada (%C3%B1) y query strings
    cy.intercept(
      {
        method: "GET",
        url: /\/api\/v1\/respuestas-usuario\/respuestas-usuario\/PER-1\/mostrar-respuestas-a-preguntas-y-(?:archivos-a%C3%B1adidos|archivos-añadidos)(?:\?.*)?$/,
      },
      {
        statusCode: 200,
        body: {
          id_periodo_encuesta: "PER-1",
          periodo_encuesta: "2025-I",
          completado: true,
          updated_at: isoNow(),
          respuestas_usuario: [
            {
              id: "r1",
              num_pregunta: "1",
              pregunta: "Cuenta con manual SGIRS?",
              opcion_respuesta: "Sí",
              archivo_anexo: null,
              nombre_anexo: null,
            },
          ],
        },
      }
    ).as("getReportDetails");

    // Incluir comodín para query _t
    cy.intercept("GET", "**/api/v1/indicadores/respuestas/PER-1*", {
      statusCode: 200,
      body: { periodo_encuesta_id: "PER-1", respuestas: [] },
    }).as("getIndAnswers");

    cy.findByRole("button", { name: /ver resumen/i }).click();
    cy.location("pathname", { timeout: 10000 }).should(
      "match",
      /\/ciudadano\/reportes\/PER-1$/
    );
    cy.wait(["@getReportDetails", "@getIndAnswers"]);
    cy.findByText(/resumen de reporte/i).should("be.visible");

    // Volver al listado
    cy.visit("/ciudadano/reportes");
    cy.wait(["@getActivos", "@getCombined"]);

    // Flujo 2: Terminar formulario para pendiente
    // Evitar que el Stepper falle por datos: intercepts mínimos
    cy.intercept("GET", "**/api/v1/tipo_pregunta/**", {
      statusCode: 200,
      body: [{ id: "TP_SINO", tipo_pregunta: "Sí/No", status: true }],
    }).as("getTiposPregunta");
    cy.intercept("GET", "**/api/v1/opciones-respuesta*", { statusCode: 200, body: { data: [] } }).as(
      "getOpciones"
    );

    cy.findByRole("button", { name: /terminar formulario/i }).click();
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      "/ciudadano/reportes/formulario"
    );
  });
});

export {};
