/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// E2E: Cerrar sesión desde el home de ciudadano (Header dropdown)

const loginCitizenUI = (email: string, password: string) => {
  cy.intercept('POST', '**/auth/login', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        // 3 segmentos para que el frontend lo acepte, rol no es necesario (frontend pone "Sector estratégico" por defecto)
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
  cy.location('pathname', { timeout: 8000 }).should('eq', '/ciudadano');
};

describe('Auth - Cerrar sesión (desde ciudadano)', () => {
  beforeEach(() => {
    loginCitizenUI('prueba20@mail.com', 'Prueba12');
  });

  it('abre el dropdown del Header y cierra sesión, redirigiendo a /auth/login', () => {
    // Abrir el dropdown del usuario en el Header
    cy.get('header').should('be.visible');
    // Esperar de forma explícita a que el Dropdown del Header exista (puede tardar en renderizarse)
    cy.get('[data-testid="user-dropdown"]', { timeout: 15000 }).should('exist');

    // Interactuar mediante el contenedor del Dropdown (sin usar el trigger/avatar directamente)
    cy.get('[data-testid="user-dropdown"]').within(() => {
      cy.findByRole('button').click({ force: true });
    });

    // Seleccionar "Cerrar sesión" por data-testid del DropdownItem
    cy.get('[data-testid="user-dropdown-item-logout"]').click({ force: true });

    // Redirección al login
    cy.location('pathname', { timeout: 8000 }).should('eq', '/auth/login');

    // Validar que cookies se eliminaron (si el logout limpia cookies)
    cy.getCookie('auth_token').should('be.null');
    cy.getCookie('auth_role').should('be.null');

    // (Opcional) validar que no hay usuario en localStorage
    cy.window().then((win) => {
      const user = win.localStorage.getItem('auth_user');
      expect(user, 'auth_user localStorage cleared').to.be.null;
    });
  });
});

export {};
