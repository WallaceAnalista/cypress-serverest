import { buildProduct, buildUser } from '../../support/factories';

describe('Produtos', () => {
  const admin = buildUser({ admin: true });
  const cliente = buildUser();
  const userIds = [];
  let adminToken;

  before(() => {
    [admin, cliente].forEach((u) => cy.apiCreateUser(u).then((res) => userIds.push(res.body._id)));
    cy.then(() => cy.apiToken(admin.email, admin.password)).then((token) => {
      adminToken = token;
    });
  });

  after(() => {
    // Limpa os produtos criados por este usuário e depois os próprios usuários
    cy.request(`${Cypress.env('apiUrl')}/produtos`).then(({ body }) =>
      body.produtos
        .filter((p) => p.nome.startsWith('Produto QA') && p.descricao.includes('[cy]'))
        .forEach((p) => cy.apiDelete('produtos', p._id, adminToken)),
    );
    cy.then(() => userIds.forEach((id) => cy.apiDelete('usuarios', id)));
  });

  it('administrador cadastra um produto e ele aparece na listagem', () => {
    const produto = buildProduct({ descricao: 'Cadastrado pela tela [cy]' });
    cy.loginUi(admin.email, admin.password);

    cy.visit('/admin/cadastrarprodutos');
    cy.getByTestId('nome').type(produto.nome);
    cy.getByTestId('preco').type(String(produto.preco));
    cy.getByTestId('descricao').type(produto.descricao);
    cy.getByTestId('quantity').type(String(produto.quantidade));
    cy.getByTestId('cadastarProdutos').click();

    cy.location('pathname').should('eq', '/admin/listarprodutos');
    cy.contains(produto.nome).should('exist');
  });

  it('cliente pesquisa um produto e adiciona à lista de compras', () => {
    const produto = buildProduct({ descricao: 'Criado via API [cy]' });
    cy.apiCreateProduct(produto, adminToken).its('status').should('eq', 201);

    cy.loginUi(cliente.email, cliente.password);
    cy.visit('/home');
    cy.getByTestId('pesquisar').type(produto.nome);
    cy.getByTestId('botaoPesquisar').click();
    cy.contains(produto.nome).should('be.visible');

    cy.getByTestId('adicionarNaLista').first().click();

    cy.location('pathname').should('eq', '/minhaListaDeProdutos');
    cy.getByTestId('shopping-cart-product-name').should('contain', produto.nome);
  });

  it('cliente limpa a lista de compras', () => {
    const produto = buildProduct({ descricao: 'Criado via API [cy]' });
    cy.apiCreateProduct(produto, adminToken).its('status').should('eq', 201);

    cy.loginUi(cliente.email, cliente.password);
    cy.visit('/home');
    cy.getByTestId('pesquisar').type(produto.nome);
    cy.getByTestId('botaoPesquisar').click();
    cy.getByTestId('adicionarNaLista').first().click();
    cy.getByTestId('shopping-cart-product-name').should('have.length', 1);

    cy.getByTestId('limparLista').click();
    cy.getByTestId('shopping-cart-empty-message').should('be.visible');
  });
});
