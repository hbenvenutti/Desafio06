import { Repository, EntityRepository, In } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRespository extends Repository<Category> {
  public async findCategoriesInArray(array: string[]): Promise<Category[]> {
    const existentCategories = await this.find({
      where: {
        title: In(array),
      },
    });

    return existentCategories;
  }
}

export default CategoryRespository;
