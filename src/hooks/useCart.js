// src/hooks/useCart.js
import { useState } from "react";
import { fmt, nid, today } from "../data/constants";

export function useCart() {
  const [items, setItems] = useState([]);

  const add = (prod, qty = 1) => {
    setItems(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...prod, qty }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, delta) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const buildOrder = (phone, lieu) => ({
    id: nid(),
    client: "Client",
    phone,
    product: items.map(i => i.name).join(", "),
    amount: total,
    status: "En attente",
    date: today(),
    lieu,
  });

  const waMessage = () =>
    encodeURIComponent(
      "Bonjour Baark Wende Store\n" +
      items.map(i => "- " + i.name + " x" + i.qty + " : " + fmt(i.price * i.qty)).join("\n") +
      "\nTotal : " + fmt(total)
    );

  return { items, add, remove, updateQty, clear, total, count, buildOrder, waMessage };
}
