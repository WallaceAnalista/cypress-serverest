# 🌲 Cypress · ServeRest (Front + API)

![Cypress Tests](https://github.com/WallaceAnalista/cypress-serverest/actions/workflows/cypress.yml/badge.svg)
![Cypress](https://img.shields.io/badge/Cypress-17202C?logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

Automação de testes do [ServeRest](https://serverest.dev), um e-commerce de estudos, cobrindo **duas camadas com a mesma ferramenta**:

- **Interface** no [front oficial](https://front.serverest.dev): login, cadastro de usuários, cadastro de produtos e lista de compras.
- **API REST** com `cy.request`: CRUD de usuários e produtos, autenticação, regras de permissão e contrato das respostas.

## 🧪 Cobertura

| Camada | Suíte | Cenários |
| --- | --- | --- |
| UI | `login.cy.js` | Admin e cliente, senha inválida, rota protegida, logout |
| UI | `cadastro-usuario.cy.js` | Cadastro de cliente e de admin, e-mail duplicado |
| UI | `produtos.cy.js` | Admin cadastra produto, cliente pesquisa e monta a lista de compras, limpar lista |
| API | `usuarios.cy.js` | CRUD completo, e-mail duplicado, campos obrigatórios, contrato da listagem |
| API | `login-produtos.cy.js` | Token JWT, login inválido, CRUD de produto, nome duplicado, 401 e 403 |

## 🏗️ Boas práticas aplicadas

- **Comandos customizados** (`cypress/support/commands.js`) para API e tela, deixando os testes curtos e legíveis.
- **Massa de dados via API**: o teste de tela não depende de cliques para preparar o cenário.
- **`cy.session`** para reaproveitar o login entre testes.
- **Dados dinâmicos** com Faker (pt-BR) e **limpeza** dos registros criados, para não poluir a API pública.
- **Seletores estáveis** por `data-testid`.
- **Retries** no modo CI para absorver instabilidades de rede.
- **Relatório Mochawesome** com gráficos e screenshots das falhas.
- **GitHub Actions** com as suítes de UI e API em paralelo e execução semanal agendada.

## 📁 Estrutura

```
├── .github/workflows/cypress.yml
├── cypress
│   ├── e2e
│   │   ├── api/            # testes de API
│   │   └── ui/             # testes de interface
│   └── support
│       ├── commands.js     # comandos customizados
│       ├── factories.js    # geração de usuários e produtos
│       └── e2e.js
└── cypress.config.js
```

## ▶️ Como rodar

Pré-requisito: Node.js 18+.

```bash
npm install
npm run cy:open     # modo interativo
npm test            # todas as suítes em modo headless
npm run test:ui     # só interface
npm run test:api    # só API
```

O relatório HTML é gerado em `cypress/reports/index.html`.

---

Feito por [**Wallace Rodrigues de Oliveira**](https://www.linkedin.com/in/wallaceoliveira86/) · Especialista em Testes / QA Sênior
