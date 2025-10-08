/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

// Pruebas de restricción de acceso por rol

const setAuth = (role?: string) => {
  if (role) {
    cy.setCookie('auth_role', encodeURIComponent(role));
    // Cualquier token (no necesita ser JWT válido para evitar redirect a login)
    cy.setCookie('auth_token', 'dummy.token.value');
  } else {
    // Limpiar autenticación
    cy.clearCookie('auth_role');
    cy.clearCookie('auth_token');
  }
};

const loginAsCitizenUI = (email: string, password: string) => {
  // Intercept del login para acelerar y asegurar cookie de rol por lógica del frontend
  cy.intercept('POST', '**/auth/login', (req) => {
    // Responder con un access_token de 3 segmentos (no necesita ser real)
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
  // El frontend setea cookie auth_role con "Sector estratégico" por defecto si no hay rol en el token
  cy.location('pathname', { timeout: 8000 }).should('eq', '/ciudadano');
};

describe('Restricción de acceso en ciudadano', () => {
  context('Ciudadano (Sector estratégico) tras iniciar sesión', () => {
    beforeEach(() => {
      // Login real por UI con las credenciales provistas
      loginAsCitizenUI('prueba20@mail.com', 'Prueba12');
    });

    it('no accede a /admin y es redirigido a /ciudadano', () => {
      cy.visit('/admin');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/ciudadano');
    });

    it('no accede a /funcionario y es redirigido a /ciudadano', () => {
      cy.visit('/funcionario');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/ciudadano');
    });

    it('accede a /ciudadano (su home) sin redirección', () => {
      cy.visit('/ciudadano');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/ciudadano');
    });
  });

  context('No autenticado', () => {
    beforeEach(() => {
      setAuth(undefined);
    });

    it('al intentar acceder a /admin redirige a /auth/login con redirect', () => {
      cy.visit('/admin');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/auth/login');
      cy.location('search').should('contain', 'redirect=%2Fadmin');
    });

    it('al intentar acceder a /funcionario redirige a /auth/login con redirect', () => {
      cy.visit('/funcionario');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/auth/login');
      cy.location('search').should('contain', 'redirect=%2Ffuncionario');
    });

    it('al intentar acceder a /ciudadano redirige a /auth/login con redirect', () => {
      cy.visit('/ciudadano');
      cy.location('pathname', { timeout: 8000 }).should('eq', '/auth/login');
      cy.location('search').should('contain', 'redirect=%2Fciudadano');
    });
  });
});
