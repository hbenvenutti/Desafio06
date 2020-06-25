import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

import CreateCategoryService from '../services/CreateCategoryService'


const transactionsRouter = Router();

const transactionsRepository = new TransactionsRepository()

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transactions = transactionsRepository.find();
  const balance = transactionsRepository.getBalance();

  return response.json({ transactions, balance })
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title, value, type,  category: categoryTitle } = request.body;

  const createTransaction = new CreateTransactionService()
  const createCategory = new CreateCategoryService()

  const category = await createCategory.execute(categoryTitle)

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category: category.id
  })

  return response.json(transaction)
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
