import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Package } from 'lucide-react';
import '../index.css';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Cera para Cabello Premium',
    description: 'Cera de alta calidad con fijación fuerte y acabado natural.',
    price: 18,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop',
    category: 'Estilo',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Aceite para Barba',
    description: 'Aceite nutritivo con argán y jojoba para una barba suave.',
    price: 15,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    category: 'Barba',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Shampoo Fortalecedor',
    description: 'Shampoo profesional con biotina y cafeína.',
    price: 22,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
    category: 'Cabello',
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Acondicionador Hidratante',
    description: 'Acondicionador premium para cabello seco o dañado.',
    price: 20,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop',
    category: 'Cabello',
    rating: 4.6,
  },
  {
    id: 5,
    name: 'Bálsamo Aftershave',
    description: 'Bálsamo calmante con aloe vera y hamamelis.',
    price: 14,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'Afeitado',
    rating: 4.8,
  },
  {
    id: 6,
    name: 'Kit de Viaje',
    description: 'Set completo de viaje con productos miniatura.',
    price: 25,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop',
    category: 'Kits',
    rating: 4.9,
  },
];

const CATEGORIES = ['Todos', 'Estilo', 'Barba', 'Cabello', 'Afeitado', 'Kits'];

export const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredProducts = selectedCategory === 'Todos'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="products-container">

      <div className="products-header">
        <h1>Nuestros Productos</h1>
        <p>
          Productos profesionales para el cuidado de tu cabello y barba.
        </p>
      </div>

      <div className="categories">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-btn ${
              selectedCategory === category ? 'active' : ''
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">

            <div className="product-image">
              <img src={product.image} alt={product.name} />

              <button
                onClick={() => toggleFavorite(product.id)}
                className={`favorite-btn ${
                  favorites.includes(product.id) ? 'favorite-active' : ''
                }`}
              >
                <Heart className={`icon-small ${favorites.includes(product.id) ? 'fill' : ''}`} />
              </button>

              <div className="category-badge">
                <span>{product.category}</span>
              </div>

              {product.stock < 10 && (
                <div className="low-stock">
                  <span>¡Pocas unidades!</span>
                </div>
              )}
            </div>

            <div className="product-content">
              <div className="product-top">
                <h3>{product.name}</h3>
                <div className="rating">
                  <Star className="star-icon" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <p className="description">{product.description}</p>

              <div className="product-bottom">
                <div>
                  <span className="price">${product.price}</span>
                  <div className="stock">
                    <Package className="package-icon" />
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>

                <button
                  className="buy-btn"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="icon-small" />
                  <span>Comprar</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
