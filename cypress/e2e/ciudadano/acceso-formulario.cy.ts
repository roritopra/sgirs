/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Flujo: Login como ciudadano -> Botón "Diligenciar formulario" -> Navegar al formulario

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

describe('Ciudadano - Acceso al formulario', () => {
  beforeEach(() => {
    // Intercepts necesarios para que el botón esté habilitado
    cy.intercept('GET', '**/api/v1/periodos-encuesta/activos', {
      statusCode: 200,
      body: {
        data: [
          { id: 'PERIODO-2025', periodo: '2025', activo: true, status: true },
        ],
      },
      delay: 50,
    }).as('getActivos');

    cy.intercept(
      'GET',
      '**/api/v1/respuestas-usuario/respuestas-usuario/verificar-si-hay-formulario-creado-para-periodo/**',
      {
        statusCode: 200,
        body: [],
        delay: 50,
      }
    ).as('verifyForm');

    cy.intercept('GET', '**/api/v1/mensajes/**', {
      statusCode: 200,
      body: [],
      delay: 50,
    }).as('getMensajes');
  });

  it('debe permitir ingresar al formulario desde el botón Diligenciar formulario', () => {
    loginCitizenUI('prueba20@mail.com', 'Prueba12');

    // Verificar que el botón esté habilitado
    const btn = () => cy.findByRole('button', { name: /diligenciar formulario/i });
    btn().should('exist');
    btn().should('have.attr', 'aria-disabled', 'false');

    // Entrar al formulario
    btn().click();
    cy.location('pathname', { timeout: 15000 }).should(
      'eq',
      '/ciudadano/reportes/formulario'
    );
  });
});

export {};
