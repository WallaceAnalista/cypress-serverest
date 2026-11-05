import { buildUser } from '../../support/factories';

describe('Cadastro de usuário pela tela', () => {
  let createdEmail;

  afterEach(() => {
    if (!createdEmail) return;
    cy.request(`${Cypress.env('apiUrl')}/usuarios?email=${encodeURIComponent(createdEmail)}`).then(({ body }) =>
      body.usuarios.forEach((u) => cy.apiDelete('usuarios', u._id)),
    );
  });

  it('cadastra um novo cliente e entra na loja', () => {
    const user = buildUser();
    createdEmail = user.email;

    cy.visit('/cadastrarusuarios');
    cy.getByTestId('nome').type(user.nome);
    cy.getByTestId('email').type(user.email);
    cy.getByTestId('password').type(user.password, { log: false });
    cy.getByTestId('cadastrar').click();

    cy.contains('Cadastro realizado com sucesso').should('be.visible');
    cy.location('pathname').should('eq', '/home');
  });

  it('cadastra um administrador e abre o painel', () => {
    const user = buildUser({ admin: true });
    createdEmail = user.email;

    cy.visit('/cadastrarusuarios');
    cy.getByTestId('nome').type(user.nome);
    cy.getByTestId('email').type(user.email);
    cy.getByTestId('password').type(user.password, { log: false });
    cy.getByTestId('checkbox').check();
    cy.getByTestId('cadastrar').click();

    cy.contains('Cadastro realizado com sucesso').should('be.visible');
    cy.location('pathname').should('eq', '/admin/home');
  });

  it('não permite cadastrar e-mail já utilizado', () => {
    const user = buildUser();
    createdEmail = user.email;
    cy.apiCreateUser(user);

    cy.visit('/cadastrarusuarios');
    cy.getByTestId('nome').type(user.nome);
    cy.getByTestId('email').type(user.email);
    cy.getByTestId('password').type(user.password, { log: false });
    cy.getByTestId('cadastrar').click();

    cy.contains('Este email já está sendo usado').should('be.visible');
    cy.location('pathname').should('eq', '/cadastrarusuarios');
  });
});
