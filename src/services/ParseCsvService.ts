import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import uploadConfig from '../config/upload';

interface RequestDTO {
  fileName: string;
}

interface Transactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ParseCsvService {
  public async execute({ fileName }: RequestDTO): Promise<Transactions[]> {
    const parsedTransactions: Transactions[] = [];

    const filePath = path.join(uploadConfig.directory, fileName);

    const readCsvStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCsvStream.pipe(parseStream);

    parseCSV.on('data', line => {
      const transaction = {
        title: line[0],
        type: line[1],
        value: parseFloat(line[2]),
        category: line[3],
      };
      parsedTransactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return parsedTransactions;
  }
}

export default ParseCsvService;
