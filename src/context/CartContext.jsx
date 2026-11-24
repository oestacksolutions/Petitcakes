import { useState } from 'react';
import { CartContext } from './context';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (item) => {
    setCart((prev) => {
      if (!item.isCustom) {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
      }
      return [...prev, { ...item, cartId: Date.now() + Math.random(), quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (cartId) => setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  const total = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const sendWhatsAppOrder = (clientName) => {
    const phone = import.meta.env.VITE_WA_PHONE || '54911XXXXXXXX';
    let text = `Hola Erika! Quiero hacer un pedido de *Láminas Comestibles* en Petitcake's:\n\n`;
    cart.forEach((item) => {
      if (item.isCustom) {
        text += `• *Diseño Personalizado* (x${item.quantity})\n  - Descripción: ${item.description}\n  - Medida: ${item.size} cm\n  - Subtotal: $${item.price * item.quantity}\n`;
      } else {
        text += `• *${item.title}* [${item.categoryName}] (x${item.quantity}) - $${item.price * item.quantity}\n`;
      }
    });
    text += `\n*Total estimado:* $${total}`;
    if (clientName) text += `\n*Nombre:* ${clientName}`;
    text += `\n\n_(Si pedí diseño personalizado, te envío la imagen a continuación)_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, total, sendWhatsAppOrder, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};
