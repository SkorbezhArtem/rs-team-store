export type PetCategory = 'Корм' | 'Игрушки' | 'Уход' | 'Аксессуары';
export type PetAnimal = 'cat' | 'dog' | 'bird' | 'fish' | 'universal';

export interface Product {
  id: string;
  title: string;
  category: PetCategory;
  price: number;
  image: string;
  description?: string;
  animals?: PetAnimal[];
}
export interface CartItem {
  productId: string;
  quantity: number;
}
