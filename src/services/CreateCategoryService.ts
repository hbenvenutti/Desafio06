import { getRepository } from 'typeorm';

import Category from '../models/Category';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const categoryExists = await categoriesRepository.findOne({
      where: {
        title,
      },
    });

    if (!categoryExists) {
      const category = await categoriesRepository.create({ title });
      categoriesRepository.save(category);

      return category;
    }

    return categoryExists;
  }
}

export default CreateCategoryService;
