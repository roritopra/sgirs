/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Validación Step 1: el botón "Siguiente" permanece deshabilitado hasta completar las preguntas requeridas

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        access_token: 'header.eyJzdWIiOiIxMjMiLCJuYW1lIjoiQ2l1ZGFkYW5vIn0.signature',
      },
      delay: 50,
    });
  }).as('login');

  cy.visit('/auth/login');
  cy.findByLabelText(/correo electrónico/i).type(email);
  cy.findByLabelText(/contraseña/i, { selector: 'input' }).type(password);
  cy.findByRole('button', { name: /iniciar sesión/i }).click();
  cy.wait('@login');
  cy.location('pathname', { timeout: 15000 }).should('eq', '/ciudadano');
};

describe('Ciudadano - Validaciones Step 1 (requeridos)', () => {
  beforeEach(() => {
    // Periodo activo para permitir entrada al formulario
    cy.intercept('GET', '**/api/v1/periodos-encuesta/activos', {
      statusCode: 200,
      body: {
        data: [
          { id: 'PERIODO-2025', periodo: '2025', activo: true, status: true },
        ],
      },
      delay: 50,
    }).as('getActivos');

    // Verificación sin formulario previo (para no bloquear)
    cy.intercept(
      'GET',
      '**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**',
      {
        statusCode: 200,
        body: [],
        delay: 50,
      }
    ).as('verifyForm');

    // Mensajes in-app vacío
    cy.intercept('GET', '**/api/v1/mensajes/**', {
      statusCode: 200,
      body: [],
      delay: 50,
    }).as('getMensajes');

    // Metadatos para Step 1 (pregunta 1: Sí/No sin anexo requerido)
    cy.intercept('GET', '**/api/v1/preguntas/numero/1', {
      statusCode: 200,
      body: {
        id: 'ed399cd2-8ebc-48d4-8ec5-217bacbd464f',
        id_tipo_pregunta: 'f21641c4-8417-494a-9b34-aee2b1a974c2',
        num_pregunta: 1,
        contenido_pregunta: '¿Cuenta con un manual del SGIRS implementado?',
        anexo: true,
        status: true,
      },
      delay: 50,
    }).as('getPregunta1');

    cy.intercept('GET', '**/api/v1/tipo_pregunta/**', {
      statusCode: 200,
      body: [
        { id: 'f21641c4-8417-494a-9b34-aee2b1a974c2', tipo_pregunta: 'Sí/No', status: true },
      ],
      delay: 50,
    }).as('getTiposPregunta');

    cy.intercept('GET', '**/api/v1/opciones-respuesta*', {
      statusCode: 200,
      body: {
        data: [
          { id: 'eed58835-72ed-43ce-9333-abf950d16e5e', id_pregunta: 'ed399cd2-8ebc-48d4-8ec5-217bacbd464f', orden_opcion: 1, opcion_respuesta: 'Sí', anexo_requerido: false, status: true },
          { id: '377eb183-5f4c-463f-bb2e-36983105effc', id_pregunta: 'ed399cd2-8ebc-48d4-8ec5-217bacbd464f', orden_opcion: 2, opcion_respuesta: 'No', anexo_requerido: false, status: true },
        ],
      },
      delay: 50,
    }).as('getOpciones');
  });

  it('mantiene "Siguiente" deshabilitado sin responder y lo habilita al responder la pregunta 1', () => {
    loginCitizenUI('prueba20@mail.com', 'Prueba12');

    // Entrar al formulario
    cy.visit('/ciudadano/reportes/formulario');

    // Verificar estado inicial: botón Siguiente deshabilitado y alerta visible
    const nextBtn = () => cy.findByRole('button', { name: /siguiente/i });
    nextBtn().should('exist');
    nextBtn().should('be.disabled');
    nextBtn().should('have.attr', 'data-disabled', 'true');
    cy.findByText(/por favor complete todas las preguntas visibles antes de continuar/i).should('be.visible');

    // Responder la pregunta 1: seleccionar "Sí"
    cy.findByLabelText(/^no$/i, { selector: 'input[type="radio"]' }).check({ force: true });

    // Verificar que se habilita el botón Siguiente y desaparece la alerta
    nextBtn().should('not.be.disabled');
    nextBtn().should('not.have.attr', 'data-disabled');
    nextBtn().should('have.attr', 'tabindex', '0');
    cy.findByText(/por favor complete todas las preguntas visibles antes de continuar/i).should('not.exist');
  });
});

export {};
