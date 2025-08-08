import type { Product } from '../types'

export const products: Product[] = [
  // Dairy & Beverages
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    price: 3.99,
    image: '🥛',
    location: { x: 2, y: 2 },
    aisle: 'Dairy Aisle'
  },
  {
    id: '2',
    name: 'Cheese',
    category: 'Dairy',
    price: 4.99,
    image: '🧀',
    location: { x: 4, y: 2 },
    aisle: 'Dairy Aisle'
  },
  {
    id: '3',
    name: 'Yogurt',
    category: 'Dairy',
    price: 2.99,
    image: '🍶',
    location: { x: 6, y: 2 },
    aisle: 'Dairy Aisle'
  },
  {
    id: '4',
    name: 'Butter',
    category: 'Dairy',
    price: 3.49,
    image: '🧈',
    location: { x: 8, y: 2 },
    aisle: 'Dairy Aisle'
  },
  {
    id: '5',
    name: 'Orange Juice',
    category: 'Beverages',
    price: 4.49,
    image: '🍊',
    location: { x: 10, y: 2 },
    aisle: 'Beverages Aisle'
  },
  {
    id: '6',
    name: 'Coffee',
    category: 'Beverages',
    price: 8.99,
    image: '☕',
    location: { x: 12, y: 2 },
    aisle: 'Beverages Aisle'
  },

  // Bakery & Grains
  {
    id: '7',
    name: 'Bread',
    category: 'Bakery',
    price: 2.99,
    image: '🍞',
    location: { x: 2, y: 5 },
    aisle: 'Bakery Aisle'
  },
  {
    id: '8',
    name: 'Jam',
    category: 'Bakery',
    price: 3.49,
    image: '🍯',
    location: { x: 4, y: 5 },
    aisle: 'Bakery Aisle'
  },
  {
    id: '9',
    name: 'Cereal',
    category: 'Grains',
    price: 4.99,
    image: '🥣',
    location: { x: 6, y: 5 },
    aisle: 'Grains Aisle'
  },
  {
    id: '10',
    name: 'Rice',
    category: 'Grains',
    price: 6.99,
    image: '🍚',
    location: { x: 8, y: 5 },
    aisle: 'Grains Aisle'
  },
  {
    id: '11',
    name: 'Pasta',
    category: 'Grains',
    price: 2.49,
    image: '🍝',
    location: { x: 10, y: 5 },
    aisle: 'Grains Aisle'
  },
  {
    id: '12',
    name: 'Flour',
    category: 'Grains',
    price: 3.99,
    image: '🌾',
    location: { x: 12, y: 5 },
    aisle: 'Grains Aisle'
  },

  // Meat & Protein
  {
    id: '13',
    name: 'Chicken',
    category: 'Meat',
    price: 12.99,
    image: '🍗',
    location: { x: 2, y: 8 },
    aisle: 'Meat Aisle'
  },
  {
    id: '14',
    name: 'Beef',
    category: 'Meat',
    price: 15.99,
    image: '🥩',
    location: { x: 4, y: 8 },
    aisle: 'Meat Aisle'
  },
  {
    id: '15',
    name: 'Eggs',
    category: 'Protein',
    price: 4.99,
    image: '🥚',
    location: { x: 6, y: 8 },
    aisle: 'Protein Aisle'
  },
  {
    id: '16',
    name: 'Bacon',
    category: 'Meat',
    price: 8.99,
    image: '🥓',
    location: { x: 8, y: 8 },
    aisle: 'Meat Aisle'
  },
  {
    id: '17',
    name: 'Fish',
    category: 'Seafood',
    price: 18.99,
    image: '🐟',
    location: { x: 10, y: 8 },
    aisle: 'Seafood Aisle'
  },
  {
    id: '18',
    name: 'Shrimp',
    category: 'Seafood',
    price: 22.99,
    image: '🦐',
    location: { x: 12, y: 8 },
    aisle: 'Seafood Aisle'
  },

  // Produce & Vegetables
  {
    id: '19',
    name: 'Tomatoes',
    category: 'Produce',
    price: 3.99,
    image: '🍅',
    location: { x: 2, y: 11 },
    aisle: 'Produce Aisle'
  },
  {
    id: '20',
    name: 'Onions',
    category: 'Produce',
    price: 2.99,
    image: '🧅',
    location: { x: 4, y: 11 },
    aisle: 'Produce Aisle'
  },
  {
    id: '21',
    name: 'Potatoes',
    category: 'Produce',
    price: 4.99,
    image: '🥔',
    location: { x: 6, y: 11 },
    aisle: 'Produce Aisle'
  },
  {
    id: '22',
    name: 'Garlic',
    category: 'Produce',
    price: 1.99,
    image: '🧄',
    location: { x: 8, y: 11 },
    aisle: 'Produce Aisle'
  },
  {
    id: '23',
    name: 'Carrots',
    category: 'Produce',
    price: 2.49,
    image: '🥕',
    location: { x: 10, y: 11 },
    aisle: 'Produce Aisle'
  },
  {
    id: '24',
    name: 'Lettuce',
    category: 'Produce',
    price: 1.99,
    image: '🥬',
    location: { x: 12, y: 11 },
    aisle: 'Produce Aisle'
  },

  // Condiments & Sauces
  {
    id: '25',
    name: 'Pasta Sauce',
    category: 'Condiments',
    price: 3.49,
    image: '🍝',
    location: { x: 2, y: 14 },
    aisle: 'Condiments Aisle'
  },
  {
    id: '26',
    name: 'Olive Oil',
    category: 'Condiments',
    price: 8.99,
    image: '🫒',
    location: { x: 4, y: 14 },
    aisle: 'Condiments Aisle'
  },
  {
    id: '27',
    name: 'Ketchup',
    category: 'Condiments',
    price: 2.99,
    image: '🍅',
    location: { x: 6, y: 14 },
    aisle: 'Condiments Aisle'
  },
  {
    id: '28',
    name: 'Mustard',
    category: 'Condiments',
    price: 2.49,
    image: '🌭',
    location: { x: 8, y: 14 },
    aisle: 'Condiments Aisle'
  },
  {
    id: '29',
    name: 'Mayonnaise',
    category: 'Condiments',
    price: 3.99,
    image: '🥪',
    location: { x: 10, y: 14 },
    aisle: 'Condiments Aisle'
  },
  {
    id: '30',
    name: 'Hot Sauce',
    category: 'Condiments',
    price: 4.49,
    image: '🌶️',
    location: { x: 12, y: 14 },
    aisle: 'Condiments Aisle'
  },

  // Snacks & Treats
  {
    id: '31',
    name: 'Chips',
    category: 'Snacks',
    price: 3.99,
    image: '🥔',
    location: { x: 2, y: 17 },
    aisle: 'Snacks Aisle'
  },
  {
    id: '32',
    name: 'Chocolate',
    category: 'Snacks',
    price: 4.99,
    image: '🍫',
    location: { x: 4, y: 17 },
    aisle: 'Snacks Aisle'
  },
  {
    id: '33',
    name: 'Cookies',
    category: 'Snacks',
    price: 3.49,
    image: '🍪',
    location: { x: 6, y: 17 },
    aisle: 'Snacks Aisle'
  },
  {
    id: '34',
    name: 'Nuts',
    category: 'Snacks',
    price: 6.99,
    image: '🥜',
    location: { x: 8, y: 17 },
    aisle: 'Snacks Aisle'
  },
  {
    id: '35',
    name: 'Popcorn',
    category: 'Snacks',
    price: 2.99,
    image: '🍿',
    location: { x: 10, y: 17 },
    aisle: 'Snacks Aisle'
  },
  {
    id: '36',
    name: 'Candy',
    category: 'Snacks',
    price: 1.99,
    image: '🍬',
    location: { x: 12, y: 17 },
    aisle: 'Snacks Aisle'
  }
]

export const categories = [
  'Dairy & Eggs',
  'Fruits & Vegetables',
  'Meat & Seafood',
  'Pantry',
  'Beverages',
  'Snacks'
] 