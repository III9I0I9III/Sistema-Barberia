import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Product } from '../types';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiService.getProducts().then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h1>Productos</h1>

      {products.map(p => (
        <div key={p.id}>
          <p>{p.name}</p>
          <p>${p.price}</p>
        </div>
      ))}
    </div>
  );
};
