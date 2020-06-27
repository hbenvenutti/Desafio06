import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import CreateCategoryService from './CreateCategoryService';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const createCategory = new CreateCategoryService();

    const { id: category_id } = await createCategory.execute(category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      const newBalance = total - value;

      if (newBalance < 0) {
        throw new AppError('balance cannot be negative');
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      category_id,
      type,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
