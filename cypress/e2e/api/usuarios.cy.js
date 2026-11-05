import { buildUser } from '../../support/factories';

const api = () => Cypress.env('apiUrl');

describe('API · /usuarios', () => {
  it('cadastra, consulta, altera e exclui um usuário (CRUD)', () => {
    const user = buildUser();

    cy.apiCreateUser(user).then((created) => {
      expect(created.status).to.eq(201);
      expect(created.body.message).to.eq('Cadastro realizado com sucesso');
      expect(created.body._id).to.be.a('string').and.not.be.empty;
      const id = created.body._id;

      cy.request(`${api()}/usuarios/${id}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.include({ nome: user.nome, email: user.email, administrador: 'false', _id: id });
      });

      cy.request('PUT', `${api()}/usuarios/${id}`, { ...user, nome: 'Nome Alterado QA' }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.eq('Registro alterado com sucesso');
      });

      cy.request(`${api()}/usuarios/${id}`).its('body.nome').should('eq', 'Nome Alterado QA');

      cy.apiDelete('usuarios', id).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message).to.eq('Registro excluído com sucesso');
      });

      cy.request({ url: `${api()}/usuarios/${id}`, failOnStatusCode: false }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Usuário não encontrado');
      });
    });
  });

  it('não permite e-mail duplicado', () => {
    const user = buildUser();
    cy.apiCreateUser(user).then(({ body }) => {
      cy.apiCreateUser(user).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Este email já está sendo usado');
      });
      cy.apiDelete('usuarios', body._id);
    });
  });

  const camposObrigatorios = ['nome', 'email', 'password', 'administrador'];

  camposObrigatorios.forEach((campo) => {
    it(`valida o campo obrigatório "${campo}"`, () => {
      const user = buildUser();
      delete user[campo];

      cy.apiCreateUser(user).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property(campo);
      });
    });
  });

  it('filtra usuários por e-mail respeitando o contrato da listagem', () => {
    const user = buildUser();
    cy.apiCreateUser(user).then(({ body }) => {
      cy.request(`${api()}/usuarios?email=${encodeURIComponent(user.email)}`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.all.keys('quantidade', 'usuarios');
        expect(res.body.quantidade).to.eq(1);
        expect(res.body.usuarios[0]).to.have.all.keys('nome', 'email', 'password', 'administrador', '_id');
      });
      cy.apiDelete('usuarios', body._id);
    });
  });
});
