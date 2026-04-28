/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Settings, 
  ShoppingBag, 
  Truck, 
  AlertCircle, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle,
  Clock,
  MapPin,
  X,
  Printer,
  ChevronRight,
  Droplets,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Role = 'ADMIN' | 'CAJERO' | 'REPARTIDOR';

interface StockItem {
  id: string;
  name: string;
  amount: number; // in ml
  minThreshold: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: 'CONCENTRADO' | 'PREPARADA';
  ingredients?: string[];
  extrasAvailable?: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
  extras: string[];
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  address: string;
  status: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO';
  timestamp: Date;
}

// Mock Data
const INITIAL_STOCK: StockItem[] = [
  { id: '1', name: 'Concentrado Tamarindo', amount: 5000, minThreshold: 1000 },
  { id: '2', name: 'Concentrado Fresa', amount: 800, minThreshold: 1000 }, // Low stock
  { id: '3', name: 'Concentrado Menta', amount: 2500, minThreshold: 500 },
  { id: '4', name: 'Base Frappé', amount: 10000, minThreshold: 2000 },
];

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Frappé Tamarindo', price: 45, category: 'PREPARADA', extrasAvailable: ['Chamoy', 'Tajín', 'Gomitas'] },
  { id: 'p2', name: 'Agua de Fresa', price: 35, category: 'PREPARADA', extrasAvailable: ['Leche condensada'] },
  { id: 'p3', name: 'Concentrado 1L Tamarindo', price: 120, category: 'CONCENTRADO' },
  { id: 'p4', name: 'Concentrado 1L Fresa', price: 120, category: 'CONCENTRADO' },
  { id: 'p5', name: 'Frappé Menta-Limón', price: 50, category: 'PREPARADA', extrasAvailable: ['Chispas Chocolate'] },
];

export default function App() {
  const [role, setRole] = useState<Role>('CAJERO');
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      items: [{ product: PRODUCTS[0], quantity: 2, extras: ['Chamoy'] }],
      total: 90,
      address: 'Av. Reforma 123, Col. Centro',
      status: 'PENDIENTE',
      timestamp: new Date()
    }
  ]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Handlers
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1, extras: [] }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const finalizePurchase = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      items: [...cart],
      total,
      address: 'Venta en Mostrador',
      status: 'PENDIENTE',
      timestamp: new Date()
    };
    setOrders([newOrder, ...orders]);
    setLastOrder(newOrder);
    setCart([]);
    setShowPrintModal(true);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-slate-800">
      {/* Role Navigation */}
      <nav className="bg-white border-b border-amber-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg text-white">
            <Droplets size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-amber-600">Las Delicias</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-none">Gestión de Bebidas</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['ADMIN', 'CAJERO', 'REPARTIDOR'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                role === r 
                ? 'bg-white text-amber-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r === 'ADMIN' ? 'Administrador' : r === 'CAJERO' ? 'Cajero' : 'Repartidor'}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {role === 'ADMIN' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">Panel de Control</h2>
                  <p className="text-slate-500 font-medium tracking-tight">Inventario de concentrados e insumos</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex gap-8">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Alertas</p>
                    <p className="text-xl font-black text-red-500">
                      {stock.filter(s => s.amount <= s.minThreshold).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Insumos</p>
                    <p className="text-xl font-black text-amber-600">{stock.length}</p>
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stock.map((item) => {
                  const isLow = item.amount <= item.minThreshold;
                  return (
                    <div key={item.id} className={`bg-white p-6 rounded-3xl border transition-all ${
                      isLow ? 'border-red-200 bg-red-50/30 shadow-red-100' : 'border-slate-100'
                    } shadow-sm`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-xl ${isLow ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          <Package size={20} />
                        </div>
                        {isLow && (
                          <span className="flex items-center gap-1 text-[10px] font-black uppercase py-1 px-2 rounded-lg bg-red-500 text-white animate-pulse">
                            Bajo
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                          {(item.amount / 1000).toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Litros</span>
                      </div>
                      <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, (item.amount / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-white rounded-[32px] border border-amber-100 p-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
                    <Settings size={32} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl">Configuración Maestra</h3>
                    <p className="text-sm text-slate-400 font-medium">Alertas automáticas y gestión de proveedores</p>
                  </div>
                </div>
                <button className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-200">
                  Gestionar Ajustes
                </button>
              </div>
            </motion.div>
          )}

          {role === 'CAJERO' && (
            <motion.div
              key="cashier"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]"
            >
              {/* Product Picker */}
              <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
                <header className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800">Menú de Ventas</h2>
                    <p className="text-slate-500 font-medium">Selecciona los productos solicitados</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-5 py-2 bg-amber-500 text-white rounded-xl font-black shadow-md shadow-amber-200">Todo</button>
                    <button className="px-5 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold">Concentrados</button>
                  </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {PRODUCTS.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="group bg-white p-5 rounded-[32px] border border-slate-100 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-200/40 transition-all text-left relative overflow-hidden flex flex-col"
                    >
                      <div className="w-full aspect-square bg-amber-50 rounded-2xl mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                        {product.name.includes('Tamarindo') ? '🍊' : product.name.includes('Fresa') ? '🍓' : product.name.includes('Menta') ? '🌿' : '🥤'}
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 self-start ${
                        product.category === 'CONCENTRADO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {product.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{product.name}</h3>
                      <p className="text-amber-600 font-black text-2xl mt-auto">${product.price}</p>
                      <Plus className="absolute bottom-6 right-6 text-amber-100 group-hover:text-amber-500 transition-colors" size={32} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cart / Summary */}
              <div className="bg-white rounded-[40px] border border-amber-100 shadow-2xl shadow-amber-900/5 flex flex-col overflow-hidden h-full">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30">
                  <div>
                    <h3 className="font-black text-xl">Orden Actual</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cajero: Juan Perez</p>
                  </div>
                  <ShoppingBag className="text-amber-600" size={24} />
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-4">
                      <div className="p-6 bg-slate-50 rounded-full">
                        <ShoppingBag size={64} strokeWidth={1} />
                      </div>
                      <p className="font-bold text-slate-400">El carrito está vacío</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="flex justify-between items-start group animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex-1">
                          <h4 className="font-black text-slate-800 leading-none">{item.product.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-tighter">${item.product.price} x {item.quantity}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-black text-amber-600">${item.product.price * item.quantity}</span>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-slate-50 rounded-b-[40px] space-y-6 border-t border-slate-100">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total Cobrar</span>
                    <span className="text-4xl font-black text-amber-600">
                      ${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}
                    </span>
                  </div>
                  <button 
                    disabled={cart.length === 0}
                    onClick={finalizePurchase}
                    className="w-full bg-amber-500 disabled:bg-slate-300 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    Cobrar e Imprimir
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {role === 'REPARTIDOR' && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <header>
                <h2 className="text-3xl font-black text-slate-800">Hoja de Ruta</h2>
                <p className="text-slate-500 font-medium">Envíos activos para hoy</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-[40px] border border-amber-100 p-8 flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 transition-all">
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">{order.id}</p>
                          <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
                             <MapPin size={20} className="text-amber-400" />
                             {order.address}
                          </h3>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl">
                        {order.items.map((it, idx) => (
                           <p key={idx} className="text-sm font-bold text-slate-600 flex justify-between">
                             <span>{it.product.name}</span>
                             <span className="text-slate-400">x{it.quantity}</span>
                           </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 pt-6">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full"><Clock size={14} /> 14:05</span>
                        <span className="text-amber-600 text-lg tracking-normal underline underline-offset-4 decoration-amber-200">${order.total} MXN</span>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 justify-center min-w-[200px]">
                      <button className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 transition-all">
                        <Truck size={20} /> Entregado
                      </button>
                      <button className="flex-1 bg-amber-50 text-amber-700 border border-amber-200 px-8 py-4 rounded-2xl font-black hover:bg-amber-100 transition-all">
                        Ruta Waze
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DUAL PRINT MODAL (Vibrant Palette style) */}
      <AnimatePresence>
        {showPrintModal && lastOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrintModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                <div className="flex items-center gap-4 text-slate-800">
                  <div className="p-3 bg-amber-500 text-white rounded-2xl">
                    <Printer size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter">Vista Previa de Impresión</h3>
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.2em] leading-none mt-1">Modalidad Dual Habilitada • {lastOrder.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 transition-all text-slate-400"
                >
                  <X />
                </button>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 bg-slate-100/30">
                {/* TICKET DE CAJA (Client focused) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    1. Ticket para Cliente (Comercial)
                  </span>
                  
                  <div className="bg-white w-full shadow-2xl border-t-[8px] border-amber-500 p-8 flex flex-col font-mono text-xs text-slate-700 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transform rotate-12 scale-150">
                      <Droplets size={120} />
                    </div>
                    
                    <div className="text-center mb-8">
                      <div className="inline-block px-4 py-1 border-2 border-slate-800 font-black text-base uppercase mb-2">Las Delicias</div>
                      <p className="font-bold">Av. Principal #123, Centro</p>
                      <p className="text-[10px] tracking-widest text-slate-400 uppercase mt-1">RFC: DELI880224-T01</p>
                    </div>

                    <div className="border-b-2 border-dashed border-slate-200 my-4"></div>
                    
                    <div className="space-y-3 mb-6">
                      {lastOrder.items.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between gap-4 font-bold">
                            <span className="flex-1">{item.quantity}x {item.product.name}</span>
                            <span className="font-black">${item.product.price * item.quantity}</span>
                          </div>
                          {item.product.id === 'p1' && (
                             <p className="text-[9px] text-slate-400 italic ml-4 leading-none">+ Chamoy / Tajín / Gomitas</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-b-2 border-dashed border-slate-200 my-4"></div>

                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center py-1">
                        <span className="uppercase tracking-widest font-bold text-[10px]">Subtotal</span>
                        <span className="font-bold text-sm">${lastOrder.total}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 text-white p-3 font-black text-lg mt-2">
                        <span className="tracking-tighter">TOTAL</span>
                        <span className="text-xl">${lastOrder.total} MXN</span>
                      </div>
                    </div>

                    <div className="mt-10 text-center space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">¡Gracias por su delicia!</p>
                      <div className="flex flex-col gap-0.5 items-center">
                        <div className="h-6 w-full max-w-[150px] bg-slate-900 mb-1" />
                        <p className="text-[8px] text-slate-300">{lastOrder.timestamp.toLocaleDateString()} - {lastOrder.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    {/* Bottom zigzag decoration simulation */}
                    <div className="absolute -bottom-2 left-0 right-0 h-2 flex">
                       {[...Array(20)].map((_, i) => (
                         <div key={i} className="flex-1 bg-white border-b-4 border-l-4 border-slate-100 transform rotate-45 -translate-y-1" />
                       ))}
                    </div>
                  </div>
                </div>

                {/* COMANDA DE BARRA (Barista focused) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-500 mb-6 tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    2. Comanda de Barra (Preparación)
                  </span>
                  
                  <div className="bg-white w-full shadow-2xl border-t-[8px] border-emerald-500 p-8 flex flex-col font-mono text-slate-900 border-2 border-slate-100">
                    <div className="bg-slate-100 p-3 text-center rounded-xl mb-8">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Producción Inmediata</p>
                       <h4 className="text-2xl font-black tracking-tighter">PEDIDO {lastOrder.id}</h4>
                    </div>

                    <div className="space-y-8 flex-1">
                      {lastOrder.items.filter(i => i.product.category === 'PREPARADA').map((item, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg">{item.quantity}</span>
                            <h4 className="font-black text-2xl uppercase tracking-tighter leading-none">{item.product.name}</h4>
                          </div>
                          
                          {item.product.id === 'p1' && (
                             <div className="ml-12 mt-4 flex flex-wrap gap-2">
                               <span className="bg-amber-100 text-amber-700 border-2 border-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight underline italic">+ Chamoy</span>
                               <span className="bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold uppercase italic">+ Tajín</span>
                             </div>
                          )}
                          
                          {item.product.id !== 'p1' && (
                            <div className="h-0.5 w-full bg-slate-50 mt-4" />
                          )}
                        </div>
                      ))}
                      
                      {/* Products that just need to be handed over */}
                      {lastOrder.items.filter(i => i.product.category === 'CONCENTRADO').map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center opacity-40 bg-slate-50 p-3 rounded-lg">
                           <span className="bg-slate-400 text-white w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs">{item.quantity}</span>
                           <span className="font-bold text-xs uppercase italic tracking-tight">Entrega: {item.product.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 pt-8 border-t-4 border-double border-slate-100 text-center bg-emerald-50/20 -mx-8 -mb-8 p-8">
                      <p className="text-[10px] font-black text-slate-300 mb-2 tracking-[0.3em] uppercase italic">Barista: Priority High</p>
                      <div className="flex justify-center gap-1">
                        <div className="w-1 h-1 bg-emerald-300 rounded-full" />
                        <div className="w-1 h-1 bg-emerald-300 rounded-full" />
                        <div className="w-1 h-1 bg-emerald-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4 shadow-inner">
                <button 
                  onClick={() => setShowPrintModal(false)}
                  className="px-8 py-4 rounded-2xl font-black bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-12 py-4 rounded-2xl font-black bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-sm translate-all active:scale-95"
                >
                  <Printer size={20} strokeWidth={3} /> Confirmar Todo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
