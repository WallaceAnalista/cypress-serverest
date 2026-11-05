import { buildProduct, buildUser } from '../../support/factories';

const api = () => Cypress.env('apiUrl');

describe('API · /login e /produtos', () => {
  const admin = buildUser({ admin: true });
  const comum = buildUser();
  const userIds = [];
  let adminToken;
  let comumToken;

  before(() => {
    [admin, comum].forEach((u) => cy.apiCreateUser(u).then((res) => userIds.push(res.body._id)));
    cy.then(() => cy.apiToken(admin.email, admin.password)).then((t) => (adminToken = t));
    cy.then(() => cy.apiToken(comum.email, comum.password)).then((t) => (comumToken = t));
  });

  after(() => userIds.forEach((id) => cy.apiDelete('usuarios', id)));

  context('Login', () => {
    it('retorna token JWT para credenciais válidas', () => {
      cy.apiLogin(admin.email, admin.password).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.eq('Login realizado com sucesso');
        expect(res.body.authorization).to.match(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
      });
    });

    it('recusa senha inválida', () => {
      cy.apiLogin(admin.email, 'senha_errada').then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('Email e/ou senha inválidos');
      });
    });
  });

  context('Produtos', () => {
    it('administrador executa o ciclo completo de um produto', () => {
      const produto = buildProduct();

      cy.apiCreateProduct(produto, adminToken).then((created) => {
        expect(created.status).to.eq(201);
        expect(created.body.message).to.eq('Cadastro realizado com sucesso');
        const id = created.body._id;

        cy.request(`${api()}/produtos/${id}`).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.include({ ...produto, _id: id });
        });

        cy.request({
          method: 'PUT',
          url: `${api()}/produtos/${id}`,
          headers: { Authorization: adminToken },
          body: { ...produto, preco: produto.preco + 10 },
        }).its('body.message').should('eq', 'Registro alterado com sucesso');

        cy.apiDelete('produtos', id, adminToken).its('body.message').should('eq', 'Registro excluído com sucesso');
      });
    });

    it('não permite produto com nome repetido', () => {
      const produto = buildProduct();
      cy.apiCreateProduct(produto, adminToken).then(({ body }) => {
        cy.apiCreateProduct(produto, adminToken).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Já existe produto com esse nome');
        });
        cy.apiDelete('produtos', body._id, adminToken);
      });
    });

    it('bloqueia cadastro sem token (401)', () => {
      cy.apiCreateProduct(buildProduct()).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq(
          'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
        );
      });
    });

    it('bloqueia cadastro por usuário que não é administrador (403)', () => {
      cy.apiCreateProduct(buildProduct(), comumToken).then((res) => {
        expect(res.status).to.eq(403);
        expect(res.body.message).to.eq('Rota exclusiva para administradores');
      });
    });
  });
});
