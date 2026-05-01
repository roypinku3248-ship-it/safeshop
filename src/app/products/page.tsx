'use client';

import React, { useState } from 'react';
import { products } from '@/data/mockData';
import ProductCard from '@/components/ProductCard';
import { Filter, Search, ChevronDown } from 'lucide-react';
import styles from './Products.module.css';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Groceries'];

  return (
    <div className={styles.productsPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Explore All Products</h1>
          <p>{filteredProducts.length} verified products found with Escrow Protection.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.search}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <Filter size={20} />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid-products">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
