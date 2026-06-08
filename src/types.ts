export type Language = 'en' | 'sq';

export interface MenuItem {
  id: string;
  nameEn: string;
  nameSq: string;
  descriptionEn: string;
  descriptionSq: string;
  priceMedium?: number; // for pizzas ('e mesme')
  priceFamily?: number; // for pizzas ('familjare')
  priceSq?: number; // single price for other elements like sandwiches
  category: 'pizza' | 'sandwiches' | 'drinks';
  image: string; // Gorgeous high quality Unsplash url
  isPopular?: boolean;
  tagsEn?: string[];
  tagsSq?: string[];
}

export interface CartItem {
  id: string; // unique cart entry ID (e.g. itemId + size)
  menuItem: MenuItem;
  selectedSize?: 'medium' | 'family';
  quantity: number;
}

export interface TranslationSet {
  appName: string;
  tagline: string;
  subtitle: string;
  orderNow: string;
  viewDirections: string;
  ourMenu: string;
  menuSubtitle: string;
  popular: string;
  price: string;
  sizeMedium: string;
  sizeFamily: string;
  addToCart: string;
  added: string;
  yourCart: string;
  emptyCart: string;
  cartTotal: string;
  sendToWhatsApp: string;
  requestingGPS: string;
  gpsAcquired: string;
  gpsFailed: string;
  locationRequired: string;
  addressPlaceholder: string;
  addressLabel: string;
  getGPSBtn: string;
  quickNotice: string;
  hours: string;
  contactUs: string;
  reviewsTitle: string;
  findUs: string;
  woltOrder: string;
  phoneLabel: string;
  customerNameLabel: string;
  customerNamePlaceholder: string;
  deliveryMethodLabel: string;
  deliveryOption: string;
  takeoutOption: string;
  dineInOption: string;
  pizzaSection: string;
  sandwichSection: string;
  drinksSection: string;
  allSection: string;
  customIngredientsNotice: string;
}
