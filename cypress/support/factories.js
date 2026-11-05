import { faker } from '@faker-js/faker/locale/pt_BR';

/** Gera um usuário único para cada teste, evitando conflito na API pública. */
export function buildUser({ admin = false, ...overrides } = {}) {
  const stamp = `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`;
  return {
    nome: faker.person.fullName(),
    email: `qa_${stamp}@teste.com.br`,
    password: faker.internet.password({ length: 10 }),
    administrador: String(admin),
    ...overrides,
  };
}

/** Gera um produto com nome único. */
export function buildProduct(overrides = {}) {
  return {
    nome: `Produto QA ${faker.commerce.productName()} ${Date.now()}`,
    preco: faker.number.int({ min: 10, max: 999 }),
    descricao: faker.commerce.productDescription().slice(0, 80),
    quantidade: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  };
}
