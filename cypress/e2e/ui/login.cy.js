import { buildUser } from '../../support/factories';

describe('Login', () => {
  const admin = buildUser({ admin: true });
  const comum = buildUser();
  const ids = [];

  before(() => {
    [admin, comum].forEach((user) =>
      cy.apiCreateUser(user).then((res) => ids.push(res.body._id)),
    );
  });

  after(() => ids.forEach((id) => cy.apiDelete('usuarios', id)));

  beforeEach(() => cy.visit('/login'));

  it('administrador acessa o painel administrativo', () => {
    cy.getByTestId('email').type(admin.email);
    cy.getByTestId('senha').type(admin.password, { log: false });
    cy.getByTestId('entrar').click();

    cy.location('pathname').should('eq', '/admin/home');
    cy.contains('h1', `Bem Vindo ${admin.nome}`).should('be.visible');
    cy.getByTestId('logout').should('be.visible');
  });

  it('usuário comum acessa a loja', () => {
    cy.getByTestId('email').type(comum.email);
    cy.getByTestId('senha').type(comum.password, { log: false });
    cy.getByTestId('entrar').click();

    cy.location('pathname').should('eq', '/home');
    cy.contains('Serverest Store').should('be.visible');
    cy.getByTestId('pesquisar').should('be.visible');
  });

  it('exibe erro para senha incorreta', () => {
    cy.getByTestId('email').type(comum.email);
    cy.getByTestId('senha').type('senha_errada');
    cy.getByTestId('entrar').click();

    cy.contains('Email e/ou senha inválidos').should('be.visible');
    cy.location('pathname').should('eq', '/login');
  });

  it('não permite acessar o painel sem estar logado', () => {
    cy.clearLocalStorage();
    cy.visit('/admin/home');
    cy.location('pathname').should('eq', '/login');
  });

  it('faz logout e volta para o login', () => {
    cy.loginUi(admin.email, admin.password);
    cy.visit('/admin/home');
    cy.getByTestId('logout').click();
    cy.location('pathname').should('eq', '/login');
  });
});
