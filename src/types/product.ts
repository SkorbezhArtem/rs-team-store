export type PetCategory = "food" | "toys" | "care" | "accessories";
export type PetAnimal = "cat" | "dog" | "bird" | "fish" | "universal";

export interface Product {
  id: string;
  title: string;
  category: PetCategory;
  price: number;
  image: string;
  description?: string;
  animal?: PetAnimal;
}
