/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe('Auth - Login', function () {
  beforeEach(function () {
    cy.visit('/auth/login');
    cy.findByRole('heading', { name: /Bienvenido a SGIRS Cali!/i });
  });

  it('inicia sesión (flujo feliz) y redirige al home', function () {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      fixture: 'auth/login_success.json',
      delay: 100,
    }).as('login');

    cy.findByLabelText(/correo electrónico/i).type('prueba20@mail.com');
    cy.findByLabelText(/contraseña/i, { selector: 'input' }).type('Prueba12');
    cy.findByRole('button', { name: /iniciar sesión/i }).click();

    cy.wait('@login');
    cy.location('pathname').should('eq', '/');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.a('string');
    });
  });

  it('muestra error cuando las credenciales son inválidas (400)', function () {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 400,
      fixture: 'auth/login_400.json',
      delay: 100,
    }).as('login400');

    cy.findByLabelText(/correo electrónico/i).type('bad@example.com');
    cy.findByLabelText(/contraseña/i, { selector: 'input' }).type('WrongPassword');
    cy.findByRole('button', { name: /iniciar sesión/i }).click();

    cy.wait('@login400');
    cy.findByText(/Error en el inicio de sesión/i).should('be.visible');
  });
});
