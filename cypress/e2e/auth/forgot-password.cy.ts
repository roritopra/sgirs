/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe('Auth - Olvidó contraseña', function () {
  it('navega desde login, envía email y llega a verify-email', function () {
    const testEmail = 'usuario.e2e@example.com';

    // Intercept del POST
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 200,
      body: { msg: 'If the email exists, a reset link has been sent' },
      delay: 100,
    }).as('forgotPwd');

    // Ir a login y click en enlace "¿Olvidaste tu contraseña?"
    cy.visit('/auth/login');
    cy.findByRole('link', { name: /recuperación de contraseña/i }).click();

    // Estamos en /auth/forgot-password
    cy.location('pathname').should('eq', '/auth/forgot-password');
    cy.findByRole('heading', { name: /contraseña olvidada/i }).should('be.visible');

    // Enviar email
    cy.findByLabelText(/correo electrónico/i).type(testEmail);
    cy.findByRole('button', { name: /enviar/i }).click();

    // Validar request y toast de éxito
    cy.wait('@forgotPwd');
    cy.findByText(/correo enviado/i).should('be.visible');
    cy.findByText(/Se envió un email a tu correo/i).should('be.visible');

    // Redirección a verify-email con query
    cy.location('pathname', { timeout: 8000 }).should('eq', '/auth/verify-email');
    cy.location('search').should('contain', encodeURIComponent(testEmail));

    // Página de verificación
    cy.findByRole('heading', { name: /¡correo enviado!/i }).should('be.visible');
    cy.findByText(testEmail).should('be.visible');
  });
});
