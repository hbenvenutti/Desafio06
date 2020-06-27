import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  parsedTransactions: TransactionDTO[];
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({
    parsedTransactions,
  }: RequestDTO): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    parsedTransactions.map(async parsedTransaction => {
      const transaction = await createTransaction.execute(parsedTransaction);

      transactions.push(transaction);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
