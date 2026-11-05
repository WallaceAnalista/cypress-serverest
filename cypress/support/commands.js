const api = () => Cypress.env('apiUrl');

// ---------- Comandos de API ----------

Cypress.Commands.add('apiCreateUser', (user) =>
  cy.request({ method: 'POST', url: `${api()}/usuarios`, body: user, failOnStatusCode: false }),
);

Cypress.Commands.add('apiLogin', (email, password) =>
  cy.request({ method: 'POST', url: `${api()}/login`, body: { email, password }, failOnStatusCode: false }),
);

/** Faz login pela API e devolve apenas o token "Bearer ...". */
Cypress.Commands.add('apiToken', (email, password) =>
  cy.apiLogin(email, password).then((res) => {
    expect(res.status, 'login na API').to.eq(200);
    return res.body.authorization;
  }),
);

Cypress.Commands.add('apiCreateProduct', (product, token) =>
  cy.request({
    method: 'POST',
    url: `${api()}/produtos`,
    headers: token ? { Authorization: token } : {},
    body: product,
    failOnStatusCode: false,
  }),
);

/** Remove o registro criado no teste para não deixar lixo na API pública. */
Cypress.Commands.add('apiDelete', (resource, id, token) =>
  cy.request({
    method: 'DELETE',
    url: `${api()}/${resource}/${id}`,
    headers: token ? { Authorization: token } : {},
    failOnStatusCode: false,
  }),
);

// ---------- Comandos de interface ----------

/** Login pela tela, com a sessão guardada em cache entre os testes (cy.session). */
Cypress.Commands.add('loginUi', (email, password) => {
  cy.session(
    ['login', email],
    () => {
      cy.visit('/login');
      cy.getByTestId('email').type(email);
      cy.getByTestId('senha').type(password, { log: false });
      cy.getByTestId('entrar').click();
      cy.location('pathname').should('match', /\/(admin\/)?home$/);
    },
    {
      validate() {
        cy.window().its('localStorage').invoke('getItem', 'serverest/userToken').should('exist');
      },
    },
  );
});

Cypress.Commands.add('getByTestId', (id, options) => cy.get(`[data-testid="${id}"]`, options));
