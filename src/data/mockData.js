export const categories = [
  { id: '1', title: 'Grocery', icon: 'basket', color: '#FFF3E0', count: '1,240 items' },
  { id: '2', title: 'Restaurants', icon: 'storefront', color: '#FBE9E7', count: '450 places' },
  { id: '3', title: 'Alcohol', icon: 'glass-wine', color: '#EDE7F6', count: '320 brands' },
  { id: '4', title: 'Retail', icon: 'shopping', color: '#E8F5E9', count: '890 stores' },
  { id: '5', title: 'Bakery', icon: 'baguette', color: '#FFF8E1', count: '210 items' },
  { id: '6', title: 'Dairy & Eggs', icon: 'egg-outline', color: '#E1F5FE', count: '180 items' },
];

export const flashSaleItems = [
  {
    id: '1',
    name: 'Fresh Sweet Orange',
    weight: '1 kg',
    price: 4.5,
    oldPrice: '$6.00',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80',
  },
  {
    id: '2',
    name: 'Fresh Pomegranate',
    weight: '500 g',
    price: 5.2,
    oldPrice: '$7.00',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&q=80',
  },
  {
    id: '3',
    name: 'Fresh Broccoli',
    weight: '1 pc',
    price: 2.8,
    oldPrice: '$3.50',
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&q=80',
  },
  {
    id: '4',
    name: 'Red Bell Pepper',
    weight: '500 g',
    price: 3.1,
    oldPrice: '$4.00',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80',
  },
];

export const popularStores = [
  {
    id: 's1',
    name: 'Whole Foods Market',
    deliveryTime: '25-35 min',
    rating: '4.9',
    tag: 'Organic & Fresh',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&q=80',
  },
  {
    id: 's2',
    name: 'Sprouts Farmers Market',
    deliveryTime: '30-45 min',
    rating: '4.7',
    tag: 'Natural Groceries',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
  },
];

export const dailyEssentials = [
  {
    id: 'e1',
    name: 'Fresh Organic Milk',
    weight: '1 Gallon',
    price: 3.8,
    oldPrice: '$4.50',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  },
  {
    id: 'e2',
    name: 'Brown Farm Eggs',
    weight: '12 pcs',
    price: 4.2,
    oldPrice: '$5.00',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
  },
  {
    id: 'e3',
    name: 'Artisan Sourdough Bread',
    weight: '400 g',
    price: 3.4,
    oldPrice: '$4.20',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  },
];

export const sampleOrders = [
  {
    id: 'ORD-8942',
    date: '24 Aug 2026, 04:30 PM',
    status: 'In Transit',
    total: 24.5,
    itemsCount: 4,
    store: 'Whole Foods Market',
  },
  {
    id: 'ORD-7612',
    date: '19 Aug 2026, 11:15 AM',
    status: 'Delivered',
    total: 38.2,
    itemsCount: 6,
    store: 'Sprouts Farmers Market',
  },
  {
    id: 'ORD-6201',
    date: '10 Aug 2026, 07:45 PM',
    status: 'Delivered',
    total: 15.8,
    itemsCount: 2,
    store: 'Instacart Express Store',
  },
];