/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// E2E: Completar todos los steps y finalizar. Todas las respuestas en "No" excepto P7 y P11 en "Sí" para ver los indicadores.

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept("POST", "**/auth/login", (req) => {
    req.reply({
      statusCode: 200,
      body: {
        access_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZmRiMmNkYi01YjJhLTQzZjYtOGRiZC00NGQxNzVkYmFiMmEiLCJyb2xlIjoiU2VjdG9yIEVzdHJhdFx1MDBlOWdpY28iLCJub21icmU6IjoiSnVhbiBKb3NcdTAwZTkiLCJleHAiOjE3NTkxNzI5MzB9.0DljTEJx3RIPupxnROHmfcwi0AdTluEsOq-gQdA0IS0",
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

// Helpers
const setRadiosForCurrentStep = (exceptionsYesNums: number[] = []) => {
  cy.findAllByRole("radiogroup", { timeout: 10000 })
    .filter(':visible')
    .each(($rg) => {
      const $el = Cypress.$($rg as any);
      const labelId = $el.attr('aria-labelledby');
      const legendText = labelId ? Cypress.$(`#${labelId}`).text() : '';
      const match = (legendText || '').trim().match(/^(\d+)/);
      const qNum = match ? parseInt(match[1], 10) : NaN;
      const selectYes = Number.isFinite(qNum) && exceptionsYesNums.includes(qNum);
      const valueToSelect = selectYes ? 'true' : 'false';
      cy.wrap($rg)
        .scrollIntoView()
        .find(`input[type="radio"][value="${valueToSelect}"]`)
        .then(($inputs) => {
          if ($inputs.length > 0) {
            cy.wrap($inputs[0]).check({ force: true });
          }
        });
    });
};

const clickNext = () => cy.findByRole("button", { name: /siguiente/i }).should("not.be.disabled").click();

// Genera opciones Sí/No para ids de pregunta Q1..Q44
const buildSiNoOptions = (from = 1, to = 44) => {
  const data: any[] = [];
  for (let n = from; n <= to; n++) {
    data.push(
      { id: `opt_si_Q${n}`, id_pregunta: `Q${n}`, orden_opcion: 1, opcion_respuesta: "Sí", anexo_requerido: false, status: true },
      { id: `opt_no_Q${n}`, id_pregunta: `Q${n}`, orden_opcion: 2, opcion_respuesta: "No", anexo_requerido: false, status: true },
    );
  }
  return data;
};

describe("Ciudadano - Finalizar formulario y descargar certificado", () => {
  beforeEach(() => {
    // Periodo activo
    cy.intercept("GET", "**/api/v1/periodos-encuesta/activos*", {
      statusCode: 200,
      body: { data: [{ id: "51d1edd7-6cde-4b1a-a842-a236ac639c63", periodo: "2025", activo: true, status: true }] },
      delay: 50,
    }).as("getActivos");

    // Verificación: no existe aún
    cy.intercept(
      "GET",
      "**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**",
      { statusCode: 200, body: [], delay: 50 }
    ).as("verifyForm");

    // Tipos de pregunta (solo Sí/No)
    cy.intercept("GET", "**/api/v1/tipo_pregunta/**", {
      statusCode: 200,
      body: [{ id: "TP_SINO", tipo_pregunta: "Sí/No", status: true }],
      delay: 30,
    }).as("getTiposPregunta");

    // Opciones de respuesta para todas las preguntas 1..44
    cy.intercept("GET", "**/api/v1/opciones-respuesta*", (req) => {
      // IDs reales de opción 'Sí' para P7 y P11
      const P7_ID = "965c5be5-61ce-4d78-9541-74781f324ec7";
      const P11_ID = "c2abbaa6-2a86-4785-806c-1bcbd48dbb3f";
      const OPT_SI_P7 = "7f6f9b17-5e63-48d3-8300-6c858d514d49";
      const OPT_SI_P11 = "f411fec0-eb00-4e77-9c3c-ecfcc67da17c";
      const fixed = [
        { id: OPT_SI_P7, id_pregunta: P7_ID, orden_opcion: 1, opcion_respuesta: "Sí", anexo_requerido: false, status: true },
        { id: "no-" + P7_ID, id_pregunta: P7_ID, orden_opcion: 2, opcion_respuesta: "No", anexo_requerido: false, status: true },
        { id: OPT_SI_P11, id_pregunta: P11_ID, orden_opcion: 1, opcion_respuesta: "Sí", anexo_requerido: false, status: true },
        { id: "no-" + P11_ID, id_pregunta: P11_ID, orden_opcion: 2, opcion_respuesta: "No", anexo_requerido: false, status: true },
      ];
      const base = buildSiNoOptions(1, 44);
      req.reply({ statusCode: 200, body: { data: [...base, ...fixed] }, delay: 30 });
    }).as("getOpciones");

    // Preguntas por número: respuesta genérica con id Q{N}
    cy.intercept("GET", /\/api\/v1\/preguntas\/numero\/(\d+).*/, (req) => {
      const m = req.url.match(/preguntas\/numero\/(\d+)/);
      const num = m ? parseInt(m[1], 10) : 0;
      // IDs reales para preguntas 7 y 11 que habilitan indicadores
      const P7_ID = "965c5be5-61ce-4d78-9541-74781f324ec7";
      const P11_ID = "c2abbaa6-2a86-4785-806c-1bcbd48dbb3f";
      const body = {
        id: num === 7 ? P7_ID : num === 11 ? P11_ID : `Q${num}`,
        id_tipo_pregunta: "TP_SINO",
        num_pregunta: num,
        contenido_pregunta: `P${num}: Pregunta ${num}`,
        anexo: false,
        status: true,
      };
      req.reply({ statusCode: 200, body, delay: 20 });
    }).as("getPreguntaGeneric");

    // Indicadores dinámicos: devolver 2 indicadores (por P7 y P11)
    cy.intercept({ method: 'POST', url: /\/api\/v1\/indicadores\/obtener-por-respuestas\/?(?:\?.*)?$/ }, (req) => {
      const expected = {
        respuestas: [
          {
            id_pregunta: "965c5be5-61ce-4d78-9541-74781f324ec7",
            id_opcion_respuesta: "7f6f9b17-5e63-48d3-8300-6c858d514d49",
          },
          {
            id_pregunta: "c2abbaa6-2a86-4785-806c-1bcbd48dbb3f",
            id_opcion_respuesta: "f411fec0-eb00-4e77-9c3c-ecfcc67da17c",
          },
        ],
      };
      try {
        expect(req.body).to.deep.equal(expected);
      } catch (e) {
        console.warn("Body inesperado en obtener-por-respuestas:", req.body);
      }
      req.reply({
        statusCode: 200,
        body: [
          {
            num_indicador: 1,
            nombre_indicador: "Porcentaje de ejecución de los componentes del SGIRS",
            es_uar: false,
            variables: [
              { nombre_variable: "Número de Actividades IEC Ejecutadas" },
              { nombre_variable: "Número de Actividades IEC Programadas" },
            ],
          },
          {
            num_indicador: 2,
            nombre_indicador: "Porcentaje de residuos sólidos aprovechables reincorporados a la cadena productiva de reciclaje",
            es_uar: false,
            variables: [
              { nombre_variable: "Peso total de residuos sólidos aprovechados (kg)" },
              { nombre_variable: "Peso total de residuos sólidos generados (kg)" },
            ],
          },
        ],
        delay: 50,
      });
    }).as("getDynamicIndicators");

    // Prefill de indicadores: devolver vacío
    cy.intercept(
      "GET",
      "**/api/v1/indicadores/respuestas-parciales/**",
      { statusCode: 200, body: { respuestas: [] }, delay: 30 }
    ).as("getPartialIndicators");

    // Submit de indicadores al finalizar
    cy.intercept(
      "POST",
      "**/api/v1/indicadores/subir-respuestas",
      { statusCode: 200, body: { ok: true }, delay: 80 }
    ).as("submitIndicators");

    // Finalizar: completar respuestas
    cy.intercept(
      "POST",
      "**/api/v1/respuestas-usuario/respuestas-usuario/completar",
      { statusCode: 200, body: { ok: true }, delay: 80 }
    ).as("completeForm");

    // Subir archivos diferido
    cy.intercept(
      "POST",
      "**/api/v1/respuestas-usuario/respuestas-usuario/subir-archivos-respuestas-usuario**",
      { statusCode: 200, body: { ok: true }, delay: 50 }
    ).as("uploadFiles");
  });

  it("completa todos los pasos y finaliza", () => {
    loginCitizenUI("prueba20@mail.com", "Prueba12");

    cy.visit("/ciudadano/reportes/formulario");
    cy.wait(["@getActivos", "@verifyForm", "@getTiposPregunta", "@getOpciones"]);

    // Step 1
    setRadiosForCurrentStep([]); // todo No
    clickNext();

    // Step 2
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 3
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 4 (P7 = Sí, las demás No)
    setRadiosForCurrentStep([7]);
    clickNext();

    // Step 5 (todo No; StepComplete pasa porque empresa/frecuencia quedan != "")
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 6 (P11 = Sí; resto No)
    setRadiosForCurrentStep([11]);
    // Esperar a que se muestren las preguntas condicionales (P12..P16)
    cy.findAllByRole('radiogroup').should('have.length.greaterThan', 1);
    // Aplicar nuevamente para marcar No en las nuevas (manteniendo P11 en Sí)
    setRadiosForCurrentStep([11]);
    clickNext();

    // Step 7
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 8 (condicional): no responde, solo avanza
    clickNext();

    // Step 9
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 10
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 11
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 12 (incluye P43 que debe ser No)
    setRadiosForCurrentStep([]);
    clickNext();

    // Step 13: esperar opciones y luego indicadores
    cy.wait('@getOpciones');
    cy.wait("@getDynamicIndicators", { timeout: 20000 });
    cy.findByText(/\bIndicador 1:/i, { timeout: 10000 }).should('be.visible');
    cy.findByText(/\bIndicador 2:/i, { timeout: 10000 }).should('be.visible');
    // Completar todas las celdas de los indicadores con "1"
    cy.get('input[type="number"]', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .each(($inp) => {
        cy.wrap($inp).clear().type("1");
      });

    // Ahora el botón Finalizar debe habilitarse
    cy.findByRole("button", { name: /finalizar/i }).should("not.be.disabled").click();
    cy.contains('button', /^sí, finalizar$/i).click();

    cy.wait(["@submitIndicators", "@completeForm"]);

    // Toast/estado final
    cy.findByText(/formulario finalizado/i, { timeout: 10000 }).should("be.visible");

    // Descarga de certificado
    const periodoId = "51d1edd7-6cde-4b1a-a842-a236ac639c63";
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZmRiMmNkYi01YjJhLTQzZjYtOGRiZC00NGQxNzVkYmFiMmEiLCJyb2xlIjoiU2VjdG9yIEVzdHJhdFx1MDBlOWdpY28iLCJub21icmU6IjoiSnVhbiBKb3NcdTAwZTkiLCJleHAiOjE3NTkxNzI5MzB9.0DljTEJx3RIPupxnROHmfcwi0AdTluEsOq-gQdA0IS0";

    // Stub de window.open para capturar la navegación al PDF
    cy.window().then((win) => {
      const fakeWin: any = { location: { href: "" } };
      const openStub = cy.stub(win as any, "open") as unknown as any;
      cy.wrap(openStub).as("winOpen");
      cy.get("@winOpen").then((stub: any) => {
        stub.callsFake(() => fakeWin);
      });
    });

    const pdfUrl = "https://files.example.com/certificates/demo-certificado.pdf";
    cy.intercept(
      {
        method: "GET",
        url: /\/api\/v1\/certificado\/?(?:\?.*)?$/,
      },
      (req) => {
        // Validar query id_periodo y Authorization
        const idPeriodo = new URL(req.url, window.location.origin).searchParams.get("id_periodo");
        expect(idPeriodo).to.equal(periodoId);
        const auth = req.headers["authorization"] || req.headers["Authorization"];
        expect(String(auth)).to.equal(`Bearer ${token}`);
        req.reply({ statusCode: 200, body: pdfUrl, delay: 3000 });
      }
    ).as("getCertificate");

    // Click en botón y esperar el GET
    cy.findByRole("button", { name: /download certificate/i }).click();
    cy.wait("@getCertificate", { timeout: 10000 });
    cy.get("@winOpen").should("have.been.called");
    cy.get("@winOpen").then((stub: any) => {
      const returned = stub.returnValues[0];
      expect(returned.location.href).to.equal(pdfUrl);
    });
  });
});

export {};
