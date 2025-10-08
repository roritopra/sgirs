/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe('Auth - Registro', function () {
  beforeEach(function () {
    // Intercepts de datos dependientes
    cy.intercept('GET', '**/sectores/all**', { fixture: 'shared/sectores.json' }).as('getSectores');
    cy.intercept('GET', '**/comunas**', { fixture: 'shared/comunas.json' }).as('getComunas');
    // Intercept de barrios por comuna seleccionada (ej. Comuna 2)
    cy.intercept('GET', /\/comunas\/.*\/barrios.*/, { fixture: 'shared/barrios_comuna_1.json' }).as('getBarrios');

    cy.visit('/auth/register');
  });

  it('completa el registro (2 pasos) y muestra confirmación', function () {
    // Paso 1: Información personal
    cy.findByLabelText(/primer nombre/i).type('Juan');
    cy.findByLabelText(/primer apellido/i).type('Pérez');
    cy.findByLabelText(/correo electrónico/i).type('m1s0w44eqg@zudpck.com');
    cy.findByLabelText(/contraseña/i, { selector: 'input' }).type('Prueba123');

    cy.findByRole('button', { name: /siguiente/i }).click();

    // Esperar carga de catálogos
    cy.wait(['@getSectores', '@getComunas']);

    // Paso 2: Información del establecimiento
    cy.findByLabelText(/NIT del establecimiento/i, { selector: 'input' }).type('900123456');
    cy.findByLabelText(/^DV$/i, { selector: 'input' }).type('1');

    cy.findByLabelText(/Nombre del establecimiento/i).type('Mi Empresa Fantasma');

    // Sector
    cy.findByLabelText(/Seleccionar sector del establecimiento/i).click();
    cy.findByRole('option', { name: 'Eventos Masivos' }).click();

    // Comuna
    cy.findByLabelText(/Seleccionar comuna donde se ubica el establecimiento/i).click();
    cy.findByRole('option', { name: 'Comuna 2' }).click();

    // Barrios (esperar que cargue por comuna seleccionada y que el Select se habilite)
    cy.wait('@getBarrios');
    cy.findByLabelText(/Seleccionar barrio del establecimiento/i)
      .should('not.have.attr', 'aria-disabled', 'true')
      .click();
    cy.findByRole('option', { name: 'Centenario', timeout: 8000 }).click();

    cy.findByLabelText(/Número de teléfono/i, { selector: 'input' }).type('12345678');

    // Dirección (Abrir popover y guardar)
    cy.findByRole('button', { name: /Agregar dirección/i })
      .scrollIntoView()
      .click({ force: true });
    // Esperar a que el popover (dialog) esté visible antes de interactuar
    cy.findByRole('dialog', { name: /Dirección del establecimiento/i, timeout: 10000 })
      .should('be.visible');
    // Abrir el Select de "Vía" usando data-testid e ID del listbox
    cy.get('[data-testid="via-select"]').scrollIntoView().click({ force: true });
    cy.get('#via-listbox', { timeout: 8000 }).should('be.visible');
    // Seleccionar "Autopista" usando data-testid estable del SelectItem
    cy.get('[data-testid="via-option-Autopista"]', { timeout: 8000 })
      .scrollIntoView()
      .click({ force: true });
    // Verificar que el Select muestra la opción elegida; si no, usar typeahead + Enter
    cy.get('[data-testid="via-select"]').then(($trigger) => {
      if (!$trigger.text().match(/Autopista/i)) {
        cy.wrap($trigger).type('Autopista{enter}', { delay: 0 });
      }
    });
    // Confirmación visual del valor seleccionado
    cy.get('[data-testid="via-select"]').should('contain.text', 'Autopista');
    cy.findByLabelText(/^Número$/i).type('10');
    cy.findByLabelText(/Número de la vía de cruce/i).type('20');
    cy.findByLabelText(/Número de placa o inmueble/i).type('30');
    cy.findByRole('button', { name: /guardar dirección construida/i }).click();
    // Verificar que la dirección compuesta se muestre correctamente fuera del popover
    cy.get('#address-display', { timeout: 8000 })
      .should('be.visible')
      .and('contain.text', 'Autopista 10 # 20 - 30');

    // Aceptar política (checkbox)
    cy.findByRole('checkbox').click();

    // Intercept del POST de registro
    cy.intercept('POST', '**/auth/registro-sector-estrategico', {
      statusCode: 200,
      fixture: 'auth/register_success.json',
      delay: 150,
    }).as('postRegister');

    // Enviar
    cy.findByRole('button', { name: /registrarse/i }).click();

    // Verificar diálogo de éxito y continuar
    cy.wait('@postRegister');
    cy.findByText('¡Registro exitoso!').should('be.visible');
    cy.findByRole('button', { name: /continuar/i }).click();

    // Redirección al login
    cy.location('pathname').should('eq', '/auth/login');
  });

  it('muestra error cuando el correo ya está registrado', function () {
    // Paso 1: Información personal con correo existente
    cy.visit('/auth/register');
    cy.findByLabelText(/primer nombre/i).type('Ana');
    cy.findByLabelText(/primer apellido/i).type('García');
    cy.findByLabelText(/correo electrónico/i).type('prueba@mail.com');
    cy.findByLabelText(/contraseña/i, { selector: 'input' }).type('Prueba123');
    cy.findByRole('button', { name: /siguiente/i }).click();

    // Esperar catálogos
    cy.wait(['@getSectores', '@getComunas']);

    // Paso 2
    cy.findByLabelText(/NIT del establecimiento/i, { selector: 'input' }).type('900123456');
    cy.findByLabelText(/^DV$/i, { selector: 'input' }).type('1');
    cy.findByLabelText(/Nombre del establecimiento/i).type('Empresa Repetida');

    // Sector
    cy.findByLabelText(/Seleccionar sector del establecimiento/i).click();
    cy.findByRole('option', { name: 'Eventos Masivos' }).click();

    // Comuna
    cy.findByLabelText(/Seleccionar comuna donde se ubica el establecimiento/i).click();
    cy.findByRole('option', { name: 'Comuna 2' }).click();

    // Barrio
    cy.wait('@getBarrios');
    cy.findByLabelText(/Seleccionar barrio del establecimiento/i)
      .should('not.have.attr', 'aria-disabled', 'true')
      .click();
    cy.findByRole('option', { name: 'Centenario', timeout: 8000 }).click();

    // Teléfono
    cy.findByLabelText(/Número de teléfono/i, { selector: 'input' }).type('12345678');

    // Dirección
    cy.findByRole('button', { name: /Agregar dirección/i })
      .scrollIntoView()
      .click({ force: true });
    cy.findByRole('dialog', { name: /Dirección del establecimiento/i, timeout: 10000 })
      .should('be.visible');
    cy.get('[data-testid="via-select"]').scrollIntoView().click({ force: true });
    cy.get('#via-listbox', { timeout: 8000 }).should('be.visible');
    cy.get('[data-testid="via-option-Autopista"]').click({ force: true });
    cy.get('[data-testid="via-select"]').should('contain.text', 'Autopista');
    cy.findByLabelText(/^Número$/i).type('10');
    cy.findByLabelText(/Número de la vía de cruce/i).type('20');
    cy.findByLabelText(/Número de placa o inmueble/i).type('30');
    cy.findByRole('button', { name: /guardar dirección construida/i }).click();
    cy.get('#address-display', { timeout: 8000 })
      .should('be.visible')
      .and('contain.text', 'Autopista 10 # 20 - 30');

    // Aceptar política
    cy.findByRole('checkbox').click();

    // Intercept 400 email existente
    cy.intercept('POST', '**/auth/registro-sector-estrategico', {
      statusCode: 400,
      body: { message: 'Email already exists' },
      delay: 100,
    }).as('postRegisterExists');

    // Enviar
    cy.findByRole('button', { name: /registrarse/i }).click();

    // Asertar toast de error y permanencia en la página
    cy.wait('@postRegisterExists');
    cy.findByText('Email ya registrado').should('be.visible');
    cy.findByText(/Este correo electrónico ya está registrado/i).should('be.visible');
    cy.location('pathname').should('eq', '/auth/register');
  });
});
