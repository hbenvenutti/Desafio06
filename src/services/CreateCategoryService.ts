import { getCustomRepository } from 'typeorm';

import Category from '../models/Category';
import CategoryRespository from '../repositories/CategoriesRepository';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoriesRepository = getCustomRepository(CategoryRespository);

    const categoryExists = await categoriesRepository.findOne({
      where: {
        title,
      },
    });

    if (!categoryExists) {
      const category = await categoriesRepository.create({ title });
      await categoriesRepository.save(category);

      return category;
    }

    return categoryExists;
  }
}

export default CreateCategoryService;
