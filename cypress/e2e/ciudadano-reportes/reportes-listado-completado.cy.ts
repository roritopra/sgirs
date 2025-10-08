/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Listado de reportes (solo completado): navegar a Ver resumen

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

describe("Ciudadano - Reportes listado (completado): navegar a Ver resumen", () => {
  beforeEach(() => {
    // Periodo activo
    cy.intercept("GET", "**/api/v1/periodos-encuesta/activos*", {
      statusCode: 200,
      body: { data: [{ id: "51d1edd7-6cde-4b1a-a842-a236ac639c63", periodo: "2025", activo: true, status: true }] },
    }).as("getActivos");

    // Combinadas (al menos un reporte completado)
    cy.intercept(
      {
        method: "GET",
        url: "**/api/v1/respuestas-usuario/respuestas-usuario/combinadas*",
      },
      (req) => {
        const auth = req.headers["authorization"] || req.headers["Authorization"];
        if (auth) expect(String(auth)).to.match(/^Bearer\s+.+/);
        req.reply([
          {
            id_periodo_encuesta: "PER-1",
            periodo_encuesta: "2025-I",
            completado: true,
            updated_at: isoNow(),
            created_at: isoNow(),
          },
        ]);
      }
    ).as("getCombined");
  });

  it("muestra reporte completado y navega al resumen", () => {
    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes");
    cy.wait(["@getActivos", "@getCombined"]);

    cy.findByText(/reporte completado/i).should("be.visible");

    // Intercepts del detalle e indicadores
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
              archivo_anexo: "http://34.66.160.217:9000/sgirs-bucket/respuestas_usuario/2025-II/2fdb2cdb-5b2a-43f6-8dbd-44d175dbab2a/manual_sgirs.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=zlo03rqP4xG3UvGxBAaQ%2F20250929%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250929T201306Z&X-Amz-Expires=1800&X-Amz-SignedHeaders=host&X-Amz-Signature=3e1367808ccbd715d03a0dcb7823f8f4275a79e7519ab78cecdc59eb9453fad8",
              nombre_anexo: "manual-sgirs.pdf",
            },
          ],
        },
      }
    ).as("getReportDetails");

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

    // Descargar anexo desde Documentación: abrir el accordion y hacer click en "Abrir"
    cy.intercept("GET", "**/api/v1/archivos/demo-manual.pdf*", {
      statusCode: 200,
      headers: { "content-type": "application/pdf" },
      body: "PDF",
      delay: 300,
    }).as("getAnexo");

    // Abrir accordion de Documentación y click en enlace "Abrir"
    cy.findByRole("button", { name: /^documentación:/i }).click();
    cy.contains("a", /^abrir$/i).should("be.visible").invoke("removeAttr", "target").click();
    cy.wait("@getAnexo");
  });
});

export {};
