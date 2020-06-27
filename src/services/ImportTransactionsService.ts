import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository } from 'typeorm';

import Category from '../models/Category';
import CategoryRespository from '../repositories/CategoriesRepository';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  path: string;
}

interface ParsedTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ path }: RequestDTO): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoryRespository);

    const parsedTransactions: ParsedTransactions[] = [];
    const categories: string[] = [];

    // ====================Parsing CSV =====================================//
    const readCsvStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCsvStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      parsedTransactions.push({
        title,
        type,
        value,
        category,
      });

      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // ==========Dealing with Categories================================//
    const existentCategories = await categoriesRepository.findCategoriesInArray(
      categories,
    );

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const nonExistentCategories = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      nonExistentCategories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    // =================Dealing with Transactions========================//

    const createdTransactions = transactionsRepository.create(
      parsedTransactions.map(transaction => {
        const findCategory = finalCategories.find(
          category => category.title === transaction.category,
        );
        const category_id = findCategory?.id;
        return {
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category_id,
        };
      }),
    );

    /*
    const testCreatedTransactions = transactionsRepository.create(
      parsedTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    */

    transactionsRepository.save(createdTransactions);
    // ==================================================================//

    await fs.promises.unlink(path);

    return createdTransactions;

    // ------------------------------------------------------------------------ //
  }
}

export default ImportTransactionsService;
