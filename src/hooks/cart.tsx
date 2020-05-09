import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsFromAsyncStorage = await AsyncStorage.getItem(
        '@DesafioReactNative:products',
      );

      if (productsFromAsyncStorage) {
        setProducts(JSON.parse(productsFromAsyncStorage));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@DesafioReactNative:products',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const increment = useCallback(
    async id => {
      const idx = products.findIndex(product => product.id === id);
      const productSeleted = products[idx];
      productSeleted.quantity += 1;
      products[idx] = productSeleted;

      const productsList = products.filter(product => product.id !== id);
      setProducts([...productsList, productSeleted]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsList = products.filter(product => product.id !== id);
      const idx = products.findIndex(product => product.id === id);
      const productSeleted = products[idx];

      if (productSeleted.quantity > 1) {
        productSeleted.quantity -= 1;
        products[idx] = productSeleted;

        setProducts([...productsList, productSeleted]);
      } else {
        setProducts([...productsList]);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async ({ id, title, image_url, price, quantity = 1 }) => {
      const productsSearched = products.filter(product => product.id === id);

      let quantitySanatized = quantity;
      if (quantitySanatized === 0) {
        quantitySanatized = 1;
      }

      if (productsSearched.length > 0) {
        await increment(productsSearched[0].id);
      } else {
        const product: Product = {
          id,
          title,
          image_url,
          price,
          quantity: quantitySanatized,
        };
        setProducts([...products, product]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
