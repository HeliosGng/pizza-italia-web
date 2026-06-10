/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pizza,
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  Map,
  BadgeAlert,
  MessageSquare,
  Utensils,
  Smartphone,
  Check,
  Instagram
} from 'lucide-react';

import { Language, CartItem, MenuItem } from './types';
import { MENU_ITEMS, REVIEWS, TRANSLATIONS } from './data';

export default function App() {
  const [lang, setLang] = useState<Language>('sq'); // Default to Albanian as requested by physical context
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pizza' | 'sandwiches' | 'drinks'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track selected size for each pizza item card independently
  // Key: item ID, Value: 'medium' | 'family'
  const [pizzaSizes, setPizzaSizes] = useState<Record<string, 'medium' | 'family'>>({});

  // Checkout Details
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'takeout' | 'dine-in'>('delivery');
  
  // GPS Coordinates
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  // Handle smooth scroll to menu
  const handleScrollToMenu = () => {
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem, selectedSize?: 'medium' | 'family') => {
    // Generate a unique ID based on item ID and selected size
    const cartItemId = item.category === 'pizza' && selectedSize 
      ? `${item.id}-${selectedSize}` 
      : item.id;

    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.id === cartItemId);
      if (existing) {
        return prevCart.map((ci) =>
          ci.id === cartItemId ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prevCart,
        {
          id: cartItemId,
          menuItem: item,
          selectedSize: item.category === 'pizza' ? (selectedSize || 'medium') : undefined,
          quantity: 1
        }
      ];
    });
  };

  // Find dynamic cart quantity for a specific item state
  const getItemCartQuantity = (item: MenuItem, size?: 'medium' | 'family') => {
    const idToSearch = item.category === 'pizza' && size ? `${item.id}-${size}` : item.id;
    return cart.find((ci) => ci.id === idToSearch)?.quantity || 0;
  };

  // Update quantity inside cart
  const handleUpdateQuantityInCart = (cartItemId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.id === cartItemId) {
            const nextQty = ci.quantity + amount;
            return { ...ci, quantity: nextQty };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0);
    });
  };

  // Remove item completely from cart
  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.id !== cartItemId));
  };

  // Clear Basket
  const handleClearCart = () => {
    setCart([]);
  };

  // Toggle size state for an item
  const handleTogglePizzaSize = (itemId: string, size: 'medium' | 'family') => {
    setPizzaSizes((prev) => ({
      ...prev,
      [itemId]: size
    }));
  };

  // Computations
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, current) => {
      const itemPrice = current.selectedSize === 'family' 
        ? (current.menuItem.priceFamily || 0) 
        : current.selectedSize === 'medium' 
          ? (current.menuItem.priceMedium || 0) 
          : (current.menuItem.priceSq || 0);
      return acc + itemPrice * current.quantity;
    }, 0);
  }, [cart]);

  const totalItemCount = useMemo(() => {
    return cart.reduce((acc, current) => acc + current.quantity, 0);
  }, [cart]);

  // HTML5 geolocation service
  const handleAcquireGPS = () => {
    setGpsStatus('loading');
    if (!navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGpsStatus('success');
      },
      (error) => {
        console.error('GPS extraction failed:', error);
        setGpsStatus('failed');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // WhatsApp Send trigger
  const handleSendOrderToWhatsApp = () => {
    if (cart.length === 0) return;

    const phoneNumber = '355697800007'; // Pizza Italia official Tirana whatsapp number
    const lineSeparator = '--------------------------------\n';
    
    let text = `🍕 *POROSI E RE - PICA ITALIA (YZBERISHT)* 🍕\n`;
    text += `${lineSeparator}`;
    
    // All core details always formatted clearly in Albanian for the restaurant staff
    text += `👤 *Klienti:* ${customerName || 'Vizitor (Guest)'}\n`;
    text += `📦 *Mënyra e marrjes:* ${
      deliveryMethod === 'delivery' ? 'Dërgesë në Shtëpi 🛵' : 
      deliveryMethod === 'takeout' ? 'Merre Vetë (Takeout) 🛍️' : 'Në Pizzeri (Dine-In) 🍽️'
    }\n`;

    if (deliveryMethod === 'delivery') {
      text += `📍 *Adresa e Dorëzimit:* ${deliveryAddress || 'E paspecifikuar (Not specified)'}\n`;
      if (gpsLocation) {
        text += `🌍 *Vendndodhja (Harta GPS):* https://www.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}\n`;
      } else {
        text += `🌍 *Vendndodhja (GPS):* Nuk është bashkëngjitur\n`;
      }
    }

    text += `\n🛒 *ARTIKUJT E POROSITUR (TË PËRKTHYER):*\n`;
    text += `${lineSeparator}`;
    
    cart.forEach((ci) => {
      const isPizza = ci.menuItem.category === 'pizza';
      const sizeLabel = isPizza 
        ? (ci.selectedSize === 'family' ? 'FAMILJARE (Family)' : 'E MESME (Medium)') 
        : '';
      const unitPrice = ci.selectedSize === 'family' 
        ? (ci.menuItem.priceFamily || 0) 
        : ci.selectedSize === 'medium' 
          ? (ci.menuItem.priceMedium || 0) 
          : (ci.menuItem.priceSq || 0);
          
      const rowTotal = unitPrice * ci.quantity;
      // ALWAYS send in Albanian (nameSq) even if site is viewed in English so pizzeria gets precise, readable local order
      const itemName = ci.menuItem.nameSq;
      
      text += `👉 *${ci.quantity}x ${itemName}* \n`;
      if (isPizza) text += `   Madhësia: _${sizeLabel}_\n`;
      text += `   [ ${unitPrice} ALL për njësi ] = *${rowTotal} ALL*\n\n`;
    });

    text += `${lineSeparator}`;
    text += `💰 *TOTALI PËR T'U PAGUAR:* *${cartTotal} ALL*\n`;
    text += `🛵 *Transporti:* *TAXI FALAS*\n`;
    text += `${lineSeparator}`;
    text += `⚡ _Dërguar nga sistemi i porosive online - Pizza Italia Tirana_`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filter products by search and category tabs
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        item.nameEn.toLowerCase().includes(lowerQuery) ||
        item.nameSq.toLowerCase().includes(lowerQuery) ||
        item.descriptionEn.toLowerCase().includes(lowerQuery) ||
        item.descriptionSq.toLowerCase().includes(lowerQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50/60 font-sans text-stone-900 selection:bg-red-50 selection:text-red-900 overflow-x-hidden" id="pizza-italia-app">
      
      {/* 1. TOP DYNAMIC ANNOUNCEMENT BANNER */}
      <div className="bg-stone-950 text-stone-300 text-[11px] sm:text-xs py-2 px-4 border-b border-stone-800 flex justify-between items-center z-50 relative" id="top-bar-notice">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-medium tracking-wide">
            {lang === 'en' ? 'Open • Closes at 12:00 AM • Authentic Woodfire Oven' : 'Hapur • Mbyllet në 12:00 PM • Furrë Autentike Druri'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-stone-400 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            10:00 - 24:00
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            Yzberisht, Tiranë
          </span>
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            ⚡ TAXI FREE / FALAS
          </span>
        </div>
      </div>

      {/* 2. STICKY MODERN LANDING PAGE NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-100 transition-all duration-300" id="navbar-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo Brand Emblem */}
          <a href="#" className="flex items-center gap-2 group" id="brand-logo-trigger">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:rotate-12 transition-transform duration-350">
              <Pizza className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold font-serif tracking-tight text-stone-900 block leading-none">
                  Pizza Italia
                </span>
                <div className="flex gap-0.5" id="italian-emblem">
                  <span className="w-1.5 h-3 bg-emerald-600 rounded-xs" />
                  <span className="w-1.5 h-3 bg-white border border-stone-200 rounded-s" />
                  <span className="w-1.5 h-3 bg-red-600 rounded-xs" />
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-amber-600 font-bold block mt-0.5">
                Yzberisht, Tiranë
              </span>
            </div>
          </a>

          {/* Actions panel */}
          <div className="flex items-center gap-3">
            
            {/* Elegant Language toggle switcher Button */}
            <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-0.5 border border-stone-200/40" id="language-switcher">
              <button
                id="switcher-en-btn"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                EN
              </button>
              <button
                id="switcher-sq-btn"
                onClick={() => setLang('sq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  lang === 'sq'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                ALB
              </button>
            </div>

            {/* Direct Telephone Access */}
            <a
              href="tel:+355697800007"
              className="p-2.5 text-stone-700 bg-stone-100 hover:bg-stone-200/60 transition-colors rounded-xl hidden sm:inline-flex items-center gap-2 text-xs font-bold"
              id="header-call-btn"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="font-mono text-stone-850">+355 69 780 0007</span>
            </a>

            {/* Float cart indicator trigger */}
            <button
              id="basket-indicator-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 shrink-0" />
              {totalItemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={totalItemCount}
                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-5.5 w-5.5 rounded-full flex items-center justify-center shadow-sm"
                >
                  {totalItemCount}
                </motion.span>
              )}
              {cartTotal > 0 && (
                <span className="text-xs font-bold font-mono hidden md:inline ml-1 text-stone-850">
                  {cartTotal} ALL
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO / LANDING BANNER SPLIT LAYOUT */}
      <section className="relative overflow-hidden pt-10 pb-16 md:py-24 bg-gradient-to-br from-amber-50/50 via-stone-50 to-white" id="hero-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-150/50 border border-amber-200/70 text-amber-900 text-xs font-semibold tracking-wide" id="hero-alert-badge">
              <Sparkles className="w-4.5 h-4.5 text-amber-600" />
              <span>4.7 ★★★★★ (86 Vlerësime) • Tiranë</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-stone-950 leading-tight">
              {lang === 'en' ? 'Authentic Italian Flavor' : 'Shije Autentike Italiane'} <br/>
              <span className="text-red-600 font-sans italic font-light">{lang === 'en' ? 'Direct to Your Door' : 'Direkt në Shtëpinë Tuaj'}</span>
            </h1>

            <p className="text-stone-600 text-sm sm:text-base md:text-lg max-w-2xl lg:max-w-none mx-auto lg:mx-0 leading-relaxed font-sans">
              {t.subtitle}
            </p>

            {/* PULLING MAIN HERO DOCK OF ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
              <button
                id="main-order-now-trigger"
                onClick={handleScrollToMenu}
                className="px-8 py-4 bg-red-600 text-white font-extrabold rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-98 transition-all flex items-center justify-center gap-2 text-base cursor-pointer group"
              >
                <span>{t.orderNow}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <a
                href="#location-details"
                className="px-6 py-4 bg-white text-stone-800 font-semibold rounded-xl border border-stone-200 shadow-xs hover:bg-stone-50 active:scale-98 transition-all flex items-center justify-center gap-2 text-base"
                id="directions-hero-btn"
              >
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>{t.viewDirections}</span>
              </a>
            </div>

            {/* Micro proof badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-sm mx-auto lg:mx-0 text-left border-t border-stone-200/50" id="micro-proof">
              <div>
                <span className="block text-xl font-bold text-red-600">4.7 ★</span>
                <span className="text-xs text-stone-500 font-medium">{lang === 'en' ? '86 Google reviews' : '86 Vlerësime Google'}</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-stone-900">450°C</span>
                <span className="text-xs text-stone-500 font-medium">{lang === 'en' ? 'Woodfire baking' : 'Pjekje me Dru'}</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-emerald-600">0 ALL</span>
                <span className="text-xs text-stone-500 font-medium">{lang === 'en' ? 'Free Courier' : 'Taxi Falas'}</span>
              </div>
            </div>
          </div>

          {/* Right Banner Showcase */}
          <div className="lg:col-span-5 relative flex justify-center py-2" id="hero-interactive-showcase">
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2">
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80"
                alt="Perfect Woodfire Gourmet Pizza"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-amber-400 text-xs font-bold font-mono tracking-widest uppercase mb-1">Authentic Traditional Pizzeria</span>
                <span className="text-white text-xl font-bold font-serif">Pizza Italia Tiranë</span>
                <span className="text-stone-300 text-xs mt-1">Rruga 3 Dëshmorët, Pallati Dilo, Yzberisht</span>
              </div>
            </div>

            {/* Quick action floats */}
            <div className="absolute -top-4 -left-4 bg-white p-3.5 rounded-2xl shadow-lg flex items-center gap-3 border border-stone-100" id="badge-floating-pizza">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                <Pizza className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Pro Pizza</p>
                <p className="text-[10px] text-amber-600 font-extrabold">ALL 700 / 1300</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 bg-white p-3 rounded-2xl shadow-lg flex items-center gap-2 border border-stone-100" id="badge-floating-delivery">
              <span className="w-2 rounded-full h-2 bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-stone-700 tracking-wide uppercase">
                {lang === 'en' ? 'Fast Local Taxi: 20-25 Mins' : 'Transporti në Zonë: 20-25 Min'}
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. MAIN INTERACTIVE CATEGORIES & PRODUCT GRID */}
      <section className="py-16 bg-white" id="menu-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header titles */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-stone-950 mb-3 block">
              {t.ourMenu}
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm">
              {t.menuSubtitle}
            </p>
          </div>

          {/* Filters, category pills and dynamic search */}
          <div className="flex flex-col md:flex-row gap-5 items-center justify-between mb-10 pb-6 border-b border-stone-100" id="search-filter-anchor">
            
            {/* Category selection */}
            <div className="flex flex-wrap gap-1.5 justify-center" id="category-tabs">
              {(['all', 'pizza', 'sandwiches', 'drinks'] as const).map((cat) => (
                <button
                  key={cat}
                  id={`tab-btn-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-red-650 bg-red-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/60 hover:text-stone-900'
                  }`}
                >
                  {cat === 'all' && t.allSection}
                  {cat === 'pizza' && t.pizzaSection}
                  {cat === 'sandwiches' && t.sandwichSection}
                  {cat === 'drinks' && t.drinksSection}
                </button>
              ))}
            </div>

            {/* Pure Instant Search Bar */}
            <div className="relative w-full md:max-w-xs" id="quick-search-box">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="live-menu-search"
                type="text"
                placeholder={lang === 'en' ? 'Search pizzas, sandwich...' : 'Kërko pica, sanduiçë...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-stone-100 focus:bg-white border border-transparent focus:border-stone-200 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Pricing Policy Indicator */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 text-center text-[11px] text-amber-900 font-medium mb-10" id="price-policy-badge">
            {t.customIngredientsNotice}
          </div>

          {/* Active items Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" id="menu-items-grid">
            <AnimatePresence mode="popLayout">
              {filteredMenuItems.map((item) => {
                const isPizza = item.category === 'pizza';
                
                // Get chosen size for this pizza card (default to medium)
                const currentSize = pizzaSizes[item.id] || 'medium';
                
                // Fetch dynamic price displayed
                const displayedPrice = isPizza 
                  ? (currentSize === 'family' ? item.priceFamily : item.priceMedium)
                  : item.priceSq;

                // Determine quantity already added to cart with this configuration
                const currentCartQty = isPizza 
                  ? getItemCartQuantity(item, currentSize) 
                  : getItemCartQuantity(item);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    id={`menu-card-${item.id}`}
                    key={item.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-200/50 flex flex-col hover:shadow-lg hover:translate-y-[-4px] transition-all duration-300"
                  >
                    
                    {/* Visual Media banner */}
                    <div className="aspect-video relative overflow-hidden bg-stone-100">
                      <img
                        src={item.image}
                        alt={lang === 'en' ? item.nameEn : item.nameSq}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-750"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Popular badges */}
                      {item.isPopular && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                          {t.popular}
                        </span>
                      )}

                      {/* Display tags */}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[65%] justify-end">
                        {(lang === 'en' ? item.tagsEn : item.tagsSq)?.map((tag, idx) => (
                          <span key={idx} className="bg-white/95 text-stone-900 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Real-time Dynamic Price absolute tag */}
                      <div className="absolute bottom-3 right-3 bg-stone-950/95 text-white px-3 py-1.5 rounded-lg font-mono text-sm font-bold tracking-tight shadow-sm">
                        {displayedPrice} ALL
                      </div>
                    </div>

                    {/* Meta Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-lg font-serif font-black text-stone-900 group-hover:text-red-600 transition-colors">
                            {lang === 'en' ? item.nameEn : item.nameSq}
                          </h3>
                        </div>
                        
                        <p className="text-xs text-stone-500 leading-relaxed min-h-[3rem] line-clamp-2">
                          {lang === 'en' ? item.descriptionEn : item.descriptionSq}
                        </p>
                      </div>

                      {/* Pizza Size Switches - EXCLUSIVE FOR WOODFIRE PIZZAS */}
                      {isPizza && (
                        <div className="mt-4 pt-3.5 border-t border-stone-100" id={`size-segment-${item.id}`}>
                          <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
                            {lang === 'en' ? 'Select Pizza Size:' : 'Zgjidhni Madhësinë:'}
                          </label>
                          <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => handleTogglePizzaSize(item.id, 'medium')}
                              className={`py-1.5 px-2 text-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                currentSize === 'medium'
                                  ? 'bg-white text-stone-950 shadow-2xs'
                                  : 'text-stone-400 hover:text-stone-700'
                              }`}
                            >
                              {lang === 'en' ? 'Medium' : 'E Mesme'} ({item.priceMedium} L)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePizzaSize(item.id, 'family')}
                              className={`py-1.5 px-2 text-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                currentSize === 'family'
                                  ? 'bg-white text-stone-950 shadow-2xs'
                                  : 'text-stone-400 hover:text-stone-700'
                              }`}
                            >
                              {lang === 'en' ? 'Family' : 'Familjare'} ({item.priceFamily} L)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions Footer row */}
                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                          {item.category === 'pizza' ? (lang === 'en' ? 'Woodfire Pizza' : 'Pica në Dru') : 
                           item.category === 'sandwiches' ? (lang === 'en' ? 'Pressed Sand' : 'Sanduiç i Shtypur') :
                           item.category === 'drinks' ? (lang === 'en' ? 'Icy Beverage' : 'Pije e Ftohtë') : (lang === 'en' ? 'Handmade Dessert' : 'Ëmbëlsirë Shtëpie')}
                        </span>

                        {/* Quantity switches or Add button */}
                        {currentCartQty > 0 ? (
                          <div className="flex items-center bg-red-600 text-white rounded-xl shadow-xs px-1.5 py-1" id={`qty-controls-${item.id}`}>
                            <button
                              onClick={() => {
                                const cartItemId = isPizza ? `${item.id}-${currentSize}` : item.id;
                                handleUpdateQuantityInCart(cartItemId, -1);
                              }}
                              className="p-1 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold font-mono min-w-[18px] text-center">
                              {currentCartQty}
                            </span>
                            <button
                              onClick={() => handleAddToCart(item, isPizza ? currentSize : undefined)}
                              className="p-1 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`add-btn-${item.id}`}
                            onClick={() => handleAddToCart(item, isPizza ? currentSize : undefined)}
                            className="px-4 py-2 bg-stone-950 text-white text-xs font-extrabold rounded-xl hover:bg-red-600 hover:shadow-xs hover:scale-101 active:scale-99 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{t.addToCart}</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Zero results placeholder */}
            {filteredMenuItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-stone-100" id="zero-result-placeholder">
                <BadgeAlert className="w-12 h-12 text-amber-500 stroke-1 mx-auto mb-3" />
                <p className="text-stone-900 font-bold text-sm mb-1">
                  {lang === 'en' ? 'No dishes matched your filters' : 'Asnjë produkt nuk përputhet'}
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  {lang === 'en' ? 'Try searching something else or switch categories.' : 'Provoni të kërkoni një emër tjetër ose ndryshoni filtrat.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. GUEST FEEDBACK / REVIEWS SECTION */}
      <section className="py-16 bg-stone-100 border-t border-b border-stone-200/50" id="reviews-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950 block">
                {t.reviewsTitle}
              </h2>
              <p className="text-stone-500 text-xs mt-1">
                {lang === 'en' ? 'Genuine customer satisfaction ratings from Google & TripAdvisor maps.' : 'Vlerësime reale të lëna nga klientët tanë në hapyrat dixhitale.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-lg font-bold text-amber-500">4.7</span>
              <div className="flex text-amber-400">
                {"★★★★★".split('').map((char, index) => (
                  <span key={index} className="text-xs">{char}</span>
                ))}
              </div>
              <span className="text-xs text-stone-500 font-mono">(86 {lang === 'en' ? 'ratings' : 'vlerësime'})</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6" id="reviews-slider-deck">
            {REVIEWS.map((rev) => (
              <div
                id={`review-card-${rev.id}`}
                key={rev.id}
                className="bg-white p-6 rounded-2xl shadow-2xs border border-stone-200/40 flex flex-col justify-between hover:scale-101 transition-transform"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{rev.author}</h4>
                      <p className="text-[10px] text-stone-400 font-mono tracking-tight">{rev.count}</p>
                    </div>
                    <div className="flex text-amber-400 text-xs font-serif">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-stone-605 text-stone-605 italic leading-relaxed">
                    "{lang === 'en' ? rev.commentEn : rev.commentSq}"
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wide">
                    {rev.type}
                  </span>
                  <span>{lang === 'en' ? rev.dateEn : rev.dateSq}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PHYSICAL ADDRESS, LOGISTICS & EMBEDDED GOOGLE MAPS */}
      <section className="py-16 bg-white" id="location-details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center">
          
          {/* left column info text */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-950 leading-tight block">
              {t.findUs}
            </h2>
            
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
              {lang === 'en' 
                ? 'Join us at our cozy pizza spot in Tirana or place an express order for home. We deliver free of charge inside the neighborhood with quick response times!'
                : 'Na vizitoni në pizzerinë tonë të këndshme ose kryeni një porosi të shpejtë për shtëpi. Korrierët tanë vijnë falas në kohë rekord pranë jush!'}
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-stone-800" id="card-physical-info">
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-950">{lang === 'en' ? 'Pizzeria Location' : 'Vendndodhja e Pizzerisë'}</h5>
                  <p className="text-stone-500 text-xs mt-0.5">Rruga 3 Dëshmorët, Pallati Dilo, Yzberisht, Tiranë 1060, Albania</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-950">{lang === 'en' ? 'Hours of Operation' : 'Orarei i Shërbimit'}</h5>
                  <p className="text-stone-500 text-xs mt-0.5">{t.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-stone-950">{lang === 'en' ? 'Order Directly' : 'Marrëveshje & Porosi Direkt'}</h5>
                  <a href="tel:+355697800007" className="text-emerald-700 font-bold hover:underline block mt-0.5 font-mono">
                    +355 69 780 0007
                  </a>
                </div>
              </div>
            </div>

            {/* alternative channels buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2" id="channel-action-links">
              <a
                href="https://wolt.com"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                id="wolt-outbound-btn"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{t.woltOrder}</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                id="instagram-outbound-btn"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>Instagram Feed</span>
              </a>
            </div>
          </div>

          {/* Right column embedded google maps */}
          <div className="md:col-span-7" id="iframe-map-box">
            <div className="w-full aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-stone-200">
              <iframe
                title="Pizza Italia Tirana Location"
                src="https://maps.google.com/maps?q=Pizza%20Italia,%20Rruga%203%20Deshmoret,%20Tirane&t=&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-none"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              ></iframe>
            </div>
          </div>

        </div>
      </section>

      {/* 7. WHATSAPP CART SIDEBAR DRAWER FLIDE OUT */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-root">
            
            {/* Dark glass slide dynamic click target */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs"
              id="cart-drawer-backdrop"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10" id="cart-drawer-flexbox">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 210 }}
                className="w-screen max-w-md bg-white flex flex-col shadow-2xl h-full"
                id="cart-drawer-paper"
              >
                
                {/* Header box of sidebar */}
                <div className="px-5 py-5 bg-stone-950 text-white flex items-center justify-between" id="drawer-header-banner">
                  <div className="flex items-center gap-2.5">
                    <Pizza className="w-5.5 h-5.5 text-red-500 animate-spin-slow shrink-0" />
                    <div>
                      <h3 className="text-base font-serif font-black">{t.yourCart}</h3>
                      <p className="text-[10px] text-stone-400 font-mono tracking-wider">{totalItemCount} {lang === 'en' ? 'items selected' : 'produkte të zgjedhura'}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                    id="drawer-close-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main scrollable list */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-stone-50/40" id="drawer-main-content">
                  
                  {cart.length === 0 ? (
                    <div className="py-16 text-center" id="empty-basket-fallback">
                      <ShoppingBag className="w-16 h-16 stroke-1 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-500 text-xs sm:text-sm max-w-xs mx-auto">
                        {t.emptyCart}
                      </p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          handleScrollToMenu();
                        }}
                        className="mt-5 px-6 py-2.5 bg-red-650 bg-red-600 text-white text-xs font-black rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        {lang === 'en' ? 'Start Selecting' : 'Fillo Porositjen'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6" id="active-basket-body">
                      
                      {/* Cart List Items Card row */}
                      <div className="space-y-3.5" id="ticket-items-list">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                          <span className="text-[10px] font-extrabold uppercase text-stone-400">{lang === 'en' ? 'Selection' : 'Zgjedhjet tuaja'}</span>
                          <button 
                            onClick={handleClearCart} 
                            className="text-[10.5px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Clear Basket' : 'Pastro Shportën'}</span>
                          </button>
                        </div>

                        {cart.map((ci) => {
                          const isPizza = ci.menuItem.category === 'pizza';
                          const sizeLabel = isPizza 
                            ? (ci.selectedSize === 'family' ? (lang === 'en' ? 'Family size' : 'Familjare') : (lang === 'en' ? 'Medium' : 'E Mesme')) 
                            : '';
                          
                          const unitPrice = isPizza 
                            ? (ci.selectedSize === 'family' ? (ci.menuItem.priceFamily || 0) : (ci.menuItem.priceMedium || 0))
                            : (ci.menuItem.priceSq || 0);

                          const rowCost = unitPrice * ci.quantity;

                          return (
                            <div
                              id={`basket-row-${ci.id}`}
                              key={ci.id}
                              className="bg-white p-3 rounded-xl border border-stone-200/60 flex gap-3 items-start justify-between shadow-3xs"
                            >
                              <img
                                src={ci.menuItem.image}
                                alt={lang === 'en' ? ci.menuItem.nameEn : ci.menuItem.nameSq}
                                className="w-14 h-14 object-cover rounded-lg shrink-0 border border-stone-100"
                                referrerPolicy="no-referrer"
                              />

                              <div className="flex-1 space-y-1">
                                <h4 className="text-xs font-bold text-stone-950 leading-snug">
                                  {lang === 'en' ? ci.menuItem.nameEn : ci.menuItem.nameSq}
                                </h4>
                                {isPizza && (
                                  <span className="inline-block bg-amber-50 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">
                                    {sizeLabel}
                                  </span>
                                )}
                                <p className="text-[10px] text-stone-400 font-mono">
                                  {unitPrice} ALL / {lang === 'en' ? 'unit' : 'copa'}
                                </p>

                                {/* Quantity management */}
                                <div className="flex items-center gap-2 pt-1.5" id={`quantity-panel-${ci.id}`}>
                                  <button
                                    onClick={() => handleUpdateQuantityInCart(ci.id, -1)}
                                    className="p-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-xs font-bold font-mono px-1">{ci.quantity}</span>
                                  <button
                                    onClick={() => handleAddToCart(ci.menuItem, ci.selectedSize)}
                                    className="p-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-right flex flex-col justify-between items-end h-[68px]">
                                <span className="text-xs font-black font-mono text-stone-950">{rowCost} ALL</span>
                                <button
                                  onClick={() => handleRemoveFromCart(ci.id)}
                                  className="text-stone-400 hover:text-red-600 transition-colors p-1"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Logistical form & address block */}
                      <div className="bg-white p-4 rounded-xl border border-stone-200/70 space-y-4 shadow-3xs" id="logistical-checkout-card">
                        
                        {/* Delivery Protocols switch */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                            {t.deliveryMethodLabel}
                          </label>
                          <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
                            {(['delivery', 'takeout', 'dine-in'] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                id={`delivery-protocol-tab-${method}`}
                                onClick={() => setDeliveryMethod(method)}
                                className={`py-2 px-1 text-center text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                                  deliveryMethod === method
                                    ? 'bg-stone-900 text-white shadow-2xs'
                                    : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                {method === 'delivery' && (lang === 'en' ? 'Delivery' : 'Dërgesë')}
                                {method === 'takeout' && (lang === 'en' ? 'Takeout' : 'Merr Vetë')}
                                {method === 'dine-in' && (lang === 'en' ? 'Dine In' : 'Pizzeri')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Customer Name input */}
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
                            {t.customerNameLabel}
                          </label>
                          <input
                            id="checkout-name-input"
                            type="text"
                            placeholder={t.customerNamePlaceholder}
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:border-red-500 outline-none transition-all"
                          />
                        </div>

                        {/* Delivery address details & LIVE SAT GPS BUTTON */}
                        {deliveryMethod === 'delivery' && (
                          <div className="space-y-3 pt-1 border-t border-stone-105" id="home-delivery-form-dock">
                            
                            {/* Address details */}
                            <div>
                              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-stone-400 mb-1.5">
                                {t.addressLabel}
                              </label>
                              <textarea
                                id="checkout-address-textarea"
                                rows={2}
                                placeholder={t.addressPlaceholder}
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:border-red-500 outline-none transition-all resize-none"
                              />
                            </div>

                            {/* GPS Satellite Panel */}
                            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2" id="gps-satellite-panel">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                  {lang === 'en' ? 'GPS Safe Delivery' : 'Saktësia GPS'}
                                </span>

                                {gpsStatus === 'success' && (
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    {t.gpsAcquired}
                                  </span>
                                )}

                                {gpsStatus === 'loading' && (
                                  <span className="text-[10px] text-stone-400 animate-pulse font-medium">
                                    {t.requestingGPS}
                                  </span>
                                )}

                                {gpsStatus === 'failed' && (
                                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                                    ✕ {t.gpsFailed}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={handleAcquireGPS}
                                className="w-full py-2 bg-stone-900 border border-transparent text-white text-[11px] font-black rounded-lg hover:bg-stone-850 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                id="acquire-satellite-gps-btn"
                              >
                                <Compass className="w-4 h-4 text-amber-500" />
                                <span>{t.getGPSBtn}</span>
                              </button>

                              {gpsLocation && (
                                <div className="text-[9.5px] text-stone-500 font-mono text-center">
                                  LAT: {gpsLocation.latitude.toFixed(5)} • LNG: {gpsLocation.longitude.toFixed(5)}
                                </div>
                              )}
                            </div>

                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>

                {/* Submitting basket with automated real-time price totals */}
                {cart.length > 0 && (
                  <div className="p-5 border-t border-stone-200 bg-stone-50/90 text-stone-900 space-y-4" id="drawer-calculator-footer">
                    
                    {/* Real-time costs breakdown */}
                    <div className="space-y-1.5 text-xs font-medium" id="calculator-rows">
                      <div className="flex justify-between text-stone-500">
                        <span>{lang === 'en' ? 'Subtotal Amount' : 'Nëntotali'}</span>
                        <span className="font-mono font-bold text-stone-800">{cartTotal} ALL</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>{lang === 'en' ? 'Taxi Courier' : 'Transporti me Taksi'}</span>
                        <span className="text-emerald-600 font-black tracking-wide uppercase">{lang === 'en' ? 'FREE' : 'FALAS'}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-stone-950 pt-2 border-t border-stone-200">
                        <span>{t.cartTotal}</span>
                        <span className="font-mono text-red-650 text-red-600">{cartTotal} ALL</span>
                      </div>
                    </div>

                    {/* WhatsApp message trigger */}
                    <button
                      onClick={handleSendOrderToWhatsApp}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-600/10 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                      id="whatsapp-submit-order-button"
                    >
                      <MessageSquare className="w-5.5 h-5.5 text-white animate-pulse" />
                      <span>{t.sendToWhatsApp}</span>
                    </button>
                    
                    <p className="text-center text-[9px] text-stone-400 font-mono">
                      {lang === 'en' ? 'Powered by Pizza Italia Tirana secure orders' : 'Siguruar nën oraret e punës të Pizza Italia'}
                    </p>
                  </div>
                )}

              </motion.div>
            </div>

          </div>
        )}
      </AnimatePresence>

      {/* 8. FLOATING ACTION CART BUTTON (FAB) */}
      <AnimatePresence>
        {totalItemCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-4 shadow-2xl shadow-red-600/40 hover:shadow-red-600/55 flex items-center gap-3 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-150 border border-white/10"
            id="floating-cart-fab"
          >
            <div className="relative">
              <ShoppingBag className="w-5.5 h-5.5" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalItemCount}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="absolute -top-2.5 -right-2.5 bg-amber-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-red-600 shadow-xs"
              >
                {totalItemCount}
              </motion.span>
            </div>
            <div className="flex flex-col text-left pr-1 leading-none">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-red-150 text-red-100 leading-none">
                {lang === 'en' ? 'Your Cart' : 'Shporta Juaj'}
              </span>
              <span className="text-xs font-black font-mono mt-1 leading-none">
                {cartTotal} ALL
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-12 border-t border-stone-800" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-white font-serif font-black text-base">Pizza Italia</h4>
            <p className="text-[11px] leading-relaxed">
              {lang === 'en' ? 'The absolute authentic taste of firewood-style Italian pizza cooked at blistering 450°C heat under genuine supervision in Tirana Albania.'
                             : 'Shija absolute inteligjente e pica italiane me dru pjekur në temperaturë të lartë nën kujdes të veçantë në Tiranë Shqipëri.'}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-stone-300 capitalize">{lang === 'en' ? 'Taxi is active now' : 'Taksi është aktive tani'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-white font-bold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Sectors' : 'Sektorët'}</span>
            <ul className="space-y-1.5 text-[11px]">
              <li><button onClick={() => { setSelectedCategory('pizza'); handleScrollToMenu(); }} className="hover:text-white transition-colors cursor-pointer">{lang === 'en' ? 'Artizan Pizzas' : 'Pica artizanale'}</button></li>
              <li><button onClick={() => { setSelectedCategory('sandwiches'); handleScrollToMenu(); }} className="hover:text-white transition-colors cursor-pointer">{lang === 'en' ? 'Sandwiches' : 'Sanduiçë me brum pice'}</button></li>
              <li><button onClick={() => { setSelectedCategory('drinks'); handleScrollToMenu(); }} className="hover:text-white transition-colors cursor-pointer">{lang === 'en' ? 'Cold Soda ' : 'Pijet e Ftohta '}</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-white font-bold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Location Info' : 'Detajet e Pizzerisë'}</span>
            <p className="text-[11px] leading-relaxed">
              Rruga 3 Dëshmorët, Pallati Dilo<br/>
              Yzberisht, Tiranë 1060, Albania
            </p>
            <span className="block text-[10px] text-amber-500 font-mono">8QFH+G2 Tiranë</span>
          </div>

          <div className="space-y-3">
            <span className="block text-white font-bold uppercase tracking-wider text-[10px]">{lang === 'en' ? 'Instant Access' : 'Kontakte të Shpejta'}</span>
            <p className="text-[11px] leading-relaxed">
              {lang === 'en' ? 'Call us directly for customized table reservations or event orders.' : 'Na telefononi direkt për organizime apo prenotime tavolinash.'}
            </p>
            <a href="tel:+355697800007" className="inline-flex items-center gap-1.5 text-emerald-500 font-bold hover:underline font-mono">
              <Phone className="w-3.5 h-3.5" />
              <span>+355 69 780 0007</span>
            </a>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 text-center text-[10px] text-stone-600 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Pizza Italia Tiranë. All Rights Reserved. Crafted with love & authenticity.</p>
          <div className="flex gap-4">
            <a href="https://instagram.com" className="hover:text-stone-400">Instagram</a>
            <a href="https://wolt.com" className="hover:text-stone-400">Wolt Portal</a>
            <a href="#" className="hover:text-stone-400">Terms & Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
