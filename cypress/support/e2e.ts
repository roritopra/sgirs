import '@testing-library/cypress/add-commands';

beforeEach(function () {
  // Aislar estado de autenticación entre pruebas
  cy.clearLocalStorage('auth_token');
  cy.clearLocalStorage('auth_user');
  cy.clearCookies();
});
