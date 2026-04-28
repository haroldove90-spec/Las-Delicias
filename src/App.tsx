import React, { useState, useEffect } from 'react';
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
  Package,
  Menu,
  TrendingUp,
  DollarSign,
  History,
  Info,
  Loader2
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
  id: string; // unique for cart entry (same product can have different extras)
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

interface Wastage {
  id: string;
  itemName: string;
  reason: string;
  quantity: string;
  timestamp: Date;
}

// Mock Data
const INITIAL_STOCK: StockItem[] = [
  { id: '1', name: 'Concentrado Tamarindo', amount: 5000, minThreshold: 1000 },
  { id: '2', name: 'Concentrado Fresa', amount: 800, minThreshold: 1000 }, 
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

const INITIAL_WASTAGE: Wastage[] = [
  { id: 'w1', itemName: 'Frappé Tamarindo', reason: 'Vaso roto', quantity: '1 pz', timestamp: new Date(Date.now() - 3600000) },
  { id: 'w2', itemName: 'Jarabe Fresa', reason: 'Derrame en barra', quantity: '200ml', timestamp: new Date(Date.now() - 7200000) },
];

const HISTORIAL_DELIVERIES: Order[] = [
  { id: 'ORD-HIST-1', items: [], total: 150, address: 'Calle 5 #45', status: 'ENTREGADO', timestamp: new Date(Date.now() - 86400000) },
  { id: 'ORD-HIST-2', items: [], total: 85, address: 'Av. Juarez 88', status: 'ENTREGADO', timestamp: new Date(Date.now() - 90000000) },
];

export default function App() {
  const [role, setRole] = useState<Role>('CAJERO');
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      items: [{ id: 'ci1', product: PRODUCTS[0], quantity: 2, extras: ['Chamoy'] }],
      total: 90,
      address: 'Av. Reforma 123, Col. Centro',
      status: 'PENDIENTE',
      timestamp: new Date()
    }
  ]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [wastage, setWastage] = useState<Wastage[]>(INITIAL_WASTAGE);

  // Toast handler
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handlers
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id && item.extras.length === 0);
    if (existing) {
      setCart(cart.map(item => item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: Math.random().toString(36).substr(2, 9), product, quantity: 1, extras: [] }]);
    }
    if (window.innerWidth < 1024) setIsCartOpenMobile(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
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
    setIsCartOpenMobile(false);
  };

  const simulatePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setShowPrintModal(false);
      setToast({ 
        message: `¡Impresión exitosa! Ticket ${lastOrder?.id} enviado a Caja y Orden de Producción enviada a Barra.`, 
        type: 'success' 
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-amber-50 font-sans text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only or Overlay on Mobile */}
      <AnimatePresence>
        {(isMobileMenuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed md:relative z-50 w-72 h-screen bg-white border-r border-amber-100 flex flex-col shadow-xl md:shadow-none transition-transform duration-300 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-8 border-b border-amber-50 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-amber-600 tracking-tighter">Las Delicias</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest leading-none mt-1">Gestión de Bebidas</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {(['ADMIN', 'CAJERO', 'REPARTIDOR'] as Role[]).map((r) => {
            const isActive = role === r;
            return (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold group ${
                  isActive 
                    ? 'bg-amber-100 text-amber-700 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <div className={`${isActive ? 'text-amber-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                  {r === 'ADMIN' ? <Settings size={20} /> : r === 'CAJERO' ? <ShoppingBag size={20} /> : <Truck size={20} />}
                </div>
                {r === 'ADMIN' ? 'Administrador' : r === 'CAJERO' ? 'Cajero POS' : 'Repartidor'}
              </button>
            );
          })}
        </nav>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Alertas de Stock</h3>
          <div className="space-y-3">
            {stock.filter(s => s.amount <= s.minThreshold).map(item => (
              <div key={item.id} className="flex justify-between items-center text-xs animate-pulse">
                <span className="font-bold text-slate-600">{item.name}</span>
                <span className="text-red-500 font-black">{item.amount}ml</span>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-amber-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-amber-600">
            <Menu size={24} />
          </button>
          <div className="text-center">
             <h1 className="text-lg font-black text-amber-600 leading-none">Las Delicias</h1>
             <p className="text-[8px] font-bold uppercase text-amber-400">{role}</p>
          </div>
          <button onClick={() => setIsCartOpenMobile(true)} className="relative p-2 text-amber-600">
            <ShoppingBag size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        {/* User context desktop */}
        <header className="hidden md:flex bg-white h-20 items-center justify-between px-10 border-b border-amber-50">
           <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
             <span className="italic underline underline-offset-4 decoration-amber-300">Sesión activa:</span>
             <span className="font-bold text-slate-800">Cajero Principal</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">Las Delicias Sucursal 01</p>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest text-right leading-none">Terminal Online</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center font-black text-amber-700 text-lg shadow-sm border border-amber-300">
                LD
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            {role === 'ADMIN' && (
              <motion.div
                key="admin-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <section>
                  <div className="mb-6">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Finanzas y Métricas</h2>
                    <p className="text-slate-500 font-medium">Control de ingresos y mermas del periodo actual</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Ventas Hoy', val: '$12,450', icon: <DollarSign size={24} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                      { label: 'Ingresos Mes', val: '$84,200', icon: <TrendingUp size={24} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                      { label: 'Valor Mermas', val: '$420.50', icon: <AlertCircle size={24} />, color: 'bg-red-50 text-red-600 border-red-100' },
                      { label: 'Margen Neto', val: '68%', icon: <TrendingUp size={24} />, color: 'bg-amber-50 text-amber-600 border-amber-100' }
                    ].map((card, i) => (
                      <div key={i} className={`p-6 rounded-[32px] border ${card.color} shadow-sm backdrop-blur-sm bg-opacity-50`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 rounded-xl bg-white bg-opacity-70">{card.icon}</div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">{card.label}</p>
                        <p className="text-2xl font-black">{card.val}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">Inventario Crítico</h2>
                      <p className="text-slate-500 font-medium tracking-tight">Estado actual de concentrados</p>
                    </div>
                    <button className="text-amber-600 font-black text-sm uppercase tracking-widest hover:underline underline-offset-4">Ver Almacén</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stock.map((item) => {
                      const isLow = item.amount <= item.minThreshold;
                      return (
                        <div key={item.id} className={`bg-white p-6 rounded-[32px] border transition-all ${
                          isLow ? 'border-red-200 bg-red-50/20 shadow-xl shadow-red-100/40 translate-y-[-4px]' : 'border-slate-100'
                        } shadow-sm group`}>
                          <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl transition-colors ${isLow ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                              <Package size={24} />
                            </div>
                            {isLow && (
                              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase py-1.5 px-3 rounded-full bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20">
                                Crítico
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-slate-800 mb-1 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{item.name}</h3>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-3xl font-black tracking-tighter ${isLow ? 'text-red-700' : 'text-slate-900'}`}>
                              {(item.amount / 1000).toFixed(1)}
                            </span>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Litros</span>
                          </div>
                          <div className="mt-6 w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (item.amount / 10000) * 100)}%` }}
                              className={`h-full rounded-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {role === 'CAJERO' && (
              <motion.div
                key="cashier-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full pb-20 md:pb-0"
              >
                <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-4xl font-black text-slate-800 tracking-tighter">POS Directo</h2>
                      <p className="text-slate-500 font-medium">Botonera rápida para venta en mostrador</p>
                    </div>
                    <div className="flex bg-white p-1.5 rounded-2xl border border-amber-100 shadow-sm w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-6 py-2.5 bg-amber-500 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20">Todo</button>
                      <button className="flex-1 sm:flex-none px-6 py-2.5 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600">Preparadas</button>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PRODUCTS.map(product => (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group bg-white p-6 rounded-[40px] border-2 border-transparent hover:border-amber-400 hover:shadow-[0_20px_40px_rgba(251,191,36,0.15)] transition-all text-left relative overflow-hidden flex flex-col min-h-[160px] md:min-h-[220px]"
                      >
                        <div className="w-20 h-20 bg-amber-50 rounded-3xl mb-4 flex items-center justify-center text-5xl group-hover:rotate-12 transition-transform duration-300">
                          {product.name.includes('Tamarindo') ? '🍊' : product.name.includes('Fresa') ? '🍓' : product.name.includes('Menta') ? '🌿' : '🥤'}
                        </div>
                        <div className="space-y-1">
                          <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] mb-3 inline-block ${
                            product.category === 'CONCENTRADO' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {product.category}
                          </span>
                          <h3 className="font-black text-slate-800 text-xl leading-none mb-2 md:mb-4">{product.name}</h3>
                          <p className="text-amber-600 font-black text-3xl mt-auto">${product.price}</p>
                        </div>
                        <div className="absolute bottom-6 right-6 p-4 bg-amber-100 text-amber-600 rounded-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg shadow-amber-500/10">
                          <Plus size={28} strokeWidth={3} />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <section className="mt-12 bg-white rounded-[40px] border border-amber-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                         <Trash2 size={24} />
                       </div>
                       <div>
                         <h3 className="font-black text-2xl text-slate-800 tracking-tight">Registro de Mermas</h3>
                         <p className="text-slate-400 text-sm font-medium">Control de desperdicios en estación</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                      {wastage.map(w => (
                        <div key={w.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-red-200 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-red-400 font-black border border-red-50 text-sm shadow-sm">
                              {w.id}
                            </div>
                            <div>
                               <p className="font-black text-slate-800 text-lg">{w.itemName}</p>
                               <p className="text-xs text-slate-400 font-bold italic uppercase tracking-widest">Motivo: {w.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-red-600 text-xl">{w.quantity}</p>
                             <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">{w.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))}
                      <button className="w-full py-6 border-4 border-dashed border-slate-100 rounded-[32px] text-slate-300 font-black uppercase tracking-[0.2em] hover:border-red-200 hover:text-red-400 transition-all flex items-center justify-center gap-4 group">
                         <Plus size={24} className="group-hover:scale-125 transition-transform" /> Registrar Merma Seleccionada
                      </button>
                    </div>
                  </section>
                </div>

                {/* Cart Summary - Desktop View */}
                <div className="hidden lg:flex flex-col bg-white rounded-[40px] border border-amber-100 shadow-2xl shadow-amber-900/5 overflow-hidden h-full">
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-amber-50/30">
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter">Canasta</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Caja Activa</p>
                      </div>
                    </div>
                    <ShoppingBag className="text-amber-600" size={32} />
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-8 p-10">
                        <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center">
                          <ShoppingBag size={100} strokeWidth={1} />
                        </div>
                        <div className="text-center">
                          <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-xl">Sin Pedidos</p>
                          <p className="text-xs text-slate-300 font-bold mt-2">La canasta está esperando por delicias</p>
                        </div>
                      </div>
                    ) : (
                      cart.map(item => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={item.id} 
                          className="flex justify-between items-start group relative border-b border-slate-50 pb-6 last:border-0"
                        >
                          <div className="flex-1">
                            <h4 className="font-black text-xl text-slate-800 leading-tight">{item.product.name}</h4>
                            <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-widest">${item.product.price} x {item.quantity}</p>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <span className="font-black text-2xl text-amber-600">${item.product.price * item.quantity}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="p-10 bg-slate-50 rounded-b-[40px] space-y-8 border-t border-slate-100 shadow-inner">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                          <span>Subtotal Estimado</span>
                          <span>${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}.00</span>
                       </div>
                       <div className="flex justify-between items-end border-t-4 border-double border-slate-200 pt-6">
                          <span className="text-slate-800 font-black uppercase tracking-[0.3em] text-sm">Cobro Total</span>
                          <span className="text-5xl font-black text-amber-600 tracking-tighter leading-none">
                            ${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}
                          </span>
                       </div>
                    </div>
                    <button 
                      disabled={cart.length === 0}
                      onClick={finalizePurchase}
                      className="w-full bg-amber-500 disabled:bg-slate-300 text-white py-7 rounded-[32px] font-black text-2xl shadow-2xl shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.1em]"
                    >
                      Procesar Pago
                      <ChevronRight size={32} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {role === 'REPARTIDOR' && (
              <motion.div
                key="repartidor-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12 pb-20 md:pb-0"
              >
                <section>
                  <header className="mb-10">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Rutas de Hoy</h2>
                    <p className="text-slate-500 font-bold text-lg">Entregas domiciliarias filtradas por proximidad</p>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-[56px] border border-amber-100 p-8 md:p-12 flex flex-col md:flex-row gap-10 shadow-sm hover:shadow-[0_48px_96px_rgba(245,158,11,0.12)] transition-all group overflow-hidden relative border-b-8 border-amber-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[80px] -mr-16 -mt-16 flex items-center justify-center p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                           <Truck className="text-amber-600 mt-6 mr-6" size={50} />
                        </div>
                        
                        <div className="flex-1 space-y-8">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="text-xs font-black text-amber-600 uppercase tracking-[0.4em] mb-2">{order.id}</p>
                              <h3 className="font-black text-3xl flex items-center gap-4 text-slate-800 tracking-tighter leading-tight">
                                 <div className="p-4 bg-amber-100 text-amber-600 rounded-3xl"><MapPin size={32} /></div>
                                 <span className="max-w-[280px]">{order.address}</span>
                              </h3>
                            </div>
                            <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ${
                              order.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 shadow-amber-200/50' : 'bg-emerald-100 text-emerald-700 shadow-emerald-200/50'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-3">
                               <ShoppingBag size={14} /> Manifiesto de Carga
                             </p>
                            <div className="space-y-3">
                              {order.items.map((it, idx) => (
                                 <div key={idx} className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:scale-[1.01] transition-transform">
                                   <span className="font-black text-slate-800 text-lg uppercase tracking-tighter">{it.product.name}</span>
                                   <div className="flex items-center gap-4">
                                     <span className="bg-amber-100 text-amber-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 border-white shadow-sm italic">x{it.quantity}</span>
                                   </div>
                                 </div>
                              ))}
                            </div>
                          </div>
    
                          <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 border-t-2 border-dashed border-slate-100 pt-8">
                            <div className="flex items-center gap-6">
                              <span className="flex items-center gap-2.5 bg-white border border-slate-100 px-5 py-2.5 rounded-full shadow-sm text-slate-800"><Clock size={18} /> 14:05 PM</span>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] text-slate-400 mb-1 uppercase font-black">Cobrar al Cliente</p>
                               <span className="text-amber-600 text-4xl font-black italic tracking-tighter shadow-amber-200">${order.total} MXN</span>
                            </div>
                          </div>
                        </div>
    
                        <div className="flex md:flex-col gap-5 justify-center min-w-[240px]">
                          <button className="flex-1 bg-slate-900 text-white px-10 py-6 rounded-[32px] font-black hover:bg-black shadow-[0_20px_40px_rgba(15,23,42,0.3)] flex items-center justify-center gap-4 transition-all hover:scale-[1.05] active:scale-95 text-lg">
                            <CheckCircle size={28} /> Entregado
                          </button>
                          <button className="flex-1 bg-emerald-50 text-emerald-700 border-4 border-white px-10 py-6 rounded-[32px] font-black hover:bg-emerald-100 transition-all flex items-center justify-center gap-4 text-lg shadow-sm">
                            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20"><MapPin size={20} /></div> Iniciar Ruta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                   <header className="mb-10 flex items-center gap-6">
                      <div className="p-4 bg-indigo-100 text-indigo-600 rounded-3xl shadow-lg shadow-indigo-100">
                        <History size={32} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Historial del Turno</h2>
                        <p className="text-slate-500 font-bold text-lg italic underline underline-offset-8 decoration-4 decoration-indigo-200">Récord de entregas exitosas</p>
                      </div>
                   </header>
                   <div className="bg-white rounded-[56px] border border-amber-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] border-b border-slate-100">
                            <tr>
                              <th className="px-12 py-8">Voucher / ID</th>
                              <th className="px-12 py-8">Destino Final</th>
                              <th className="px-12 py-8">Monto Cobrado</th>
                              <th className="px-12 py-8">Estado Actual</th>
                              <th className="px-12 py-8 text-right">Llegada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 font-bold">
                            {HISTORIAL_DELIVERIES.map(item => (
                              <tr key={item.id} className="hover:bg-amber-100/10 transition-colors group">
                                 <td className="px-12 py-8">
                                   <div className="flex items-center gap-3">
                                      <div className="w-2 h-8 bg-indigo-500 rounded-full group-hover:scale-y-125 transition-transform" />
                                      <span className="font-mono font-black text-indigo-600 text-lg uppercase">{item.id}</span>
                                   </div>
                                 </td>
                                 <td className="px-12 py-8 text-slate-600">{item.address}</td>
                                 <td className="px-12 py-8">
                                   <div className="flex items-center gap-2">
                                      <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-black text-xl italic">${item.total}.00</span>
                                   </div>
                                 </td>
                                 <td className="px-12 py-8">
                                   <div className="flex items-center gap-3 text-emerald-600 font-black uppercase text-[10px] tracking-[0.2em] bg-emerald-50/50 w-fit px-4 py-2 rounded-full border border-emerald-100">
                                     <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                     {item.status}
                                   </div>
                                 </td>
                                 <td className="px-12 py-8 text-right text-slate-400 font-black text-base italic">
                                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Cart Button for Mobile (Solicitado por el requerimiento 2) */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCartOpenMobile(true)}
        className={`md:hidden fixed bottom-8 right-8 w-20 h-20 bg-amber-500 text-white rounded-[28px] shadow-[0_20px_50px_rgba(245,158,11,0.4)] flex items-center justify-center z-40 ${cart.length > 0 ? 'animate-bounce' : ''} transition-all`}
      >
        <ShoppingBag size={32} strokeWidth={2.5} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-amber-50 shadow-lg">
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Mobile Cart Overlay (Solicitado por el requerimiento 2) */}
      <AnimatePresence>
        {isCartOpenMobile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpenMobile(false)}
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[60]" 
            />
            <motion.div
              initial={{ y: '100%', scale: 1.1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 1.1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[64px] z-[70] shadow-[0_-20px_60px_rgba(0,0,0,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="h-2 w-16 bg-slate-100 rounded-full mx-auto mt-4 mb-2" />
              <div className="p-10 pb-6 flex justify-between items-end border-b border-slate-50">
                <div>
                  <h3 className="font-black text-4xl tracking-tighter text-slate-900 leading-none mb-2">Canasta</h3>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] font-mono">{cart.length} Artículos Listos</p>
                </div>
                <button onClick={() => setIsCartOpenMobile(false)} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:bg-slate-100 transition-colors">
                   <X size={28} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-slate-100 opacity-50 italic">
                    <ShoppingBag size={120} strokeWidth={1} />
                    <p className="font-black text-slate-300 mt-8 text-center text-xl tracking-[0.2em] uppercase">Vacío</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50/30 p-6 rounded-[32px] border border-slate-50/50">
                      <div className="flex-1">
                        <h4 className="font-black text-slate-800 text-xl tracking-tight leading-none">{item.product.name}</h4>
                        <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-widest italic">${item.product.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="font-black text-2xl text-amber-600 tracking-tighter">${item.product.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-3 bg-white rounded-2xl shadow-sm border border-red-50">
                           <Trash2 size={24} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-10 bg-white border-t-2 border-dashed border-slate-100 space-y-8 rounded-b-[64px]">
                <div className="flex justify-between items-end">
                   <span className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Total Parcial</span>
                   <span className="text-5xl font-black text-amber-600 tracking-tighter leading-none">${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}</span>
                </div>
                <button 
                  onClick={finalizePurchase}
                  disabled={cart.length === 0}
                  className="w-full bg-amber-500 text-white py-8 rounded-[36px] font-black text-2xl shadow-[0_20px_50px_rgba(245,158,11,0.35)] active:scale-95 transition-transform uppercase tracking-[0.2em]"
                >
                  Confirmar Pago
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DUAL PRINT MODAL (Solicitado por el requerimiento 1 y 4) */}
      <AnimatePresence>
        {showPrintModal && lastOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPrinting && setShowPrintModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl" 
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="relative bg-white w-full max-w-6xl md:rounded-[72px] rounded-[48px] shadow-[0_60px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[96vh] border border-white/20"
            >
              <div className="p-8 md:p-12 border-b-2 border-dashed border-slate-100 flex justify-between items-center bg-amber-50/40">
                <div className="flex items-center gap-6 text-slate-800">
                  <div className="p-5 bg-amber-500 text-white rounded-[28px] shadow-2xl shadow-amber-500/40 transform -rotate-3">
                    <Printer size={40} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-3xl md:text-4xl uppercase tracking-tighter leading-none italic">Centro de Impresión</h3>
                    <p className="text-[10px] md:text-sm text-amber-600 font-black uppercase tracking-[0.5em] leading-none mt-2 font-mono">Dual Output Active • {lastOrder.id}</p>
                  </div>
                </div>
                {!isPrinting && (
                  <button 
                    onClick={() => setShowPrintModal(false)}
                    className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-50 transition-all text-slate-300 hover:text-slate-500 border border-slate-50"
                  >
                    <X size={32} />
                  </button>
                )}
              </div>

              <div className="p-6 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 bg-slate-100/50 overflow-y-auto custom-scrollbar">
                {/* TICKET DE CAJA (Solicitado por el requerimiento 4) */}
                <div className="flex flex-col items-center group">
                  <span className="text-[11px] font-black uppercase text-slate-400 mb-8 tracking-[0.3em] flex items-center gap-4 group-hover:text-amber-500 transition-colors">
                    <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                    1. Comprobante Cliente
                  </span>
                  
                  <div className="bg-white w-full shadow-2xl border-t-[12px] border-amber-500 p-10 md:p-12 flex flex-col font-mono text-[13px] text-slate-700 relative border-b-2 border-dotted border-slate-200 transform group-hover:scale-[1.02] transition-transform duration-500">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.04] pointer-events-none transform rotate-12 scale-[2.5]">
                      <Droplets size={140} />
                    </div>
                    
                    <div className="text-center mb-12">
                      <div className="inline-block px-8 py-3 border-[6px] border-slate-900 font-black text-2xl uppercase mb-4 tracking-tighter shadow-sm">Las Delicias</div>
                      <p className="font-black text-slate-800 text-sm">Sucursal Diamante: Av. Principal #123</p>
                      <p className="text-[11px] tracking-[0.5em] text-slate-400 uppercase mt-2 font-black leading-none italic">ID FISCAL: DELI880224-T01</p>
                    </div>

                    <div className="border-b-[6px] border-dotted border-slate-100 my-8"></div>
                    
                    <div className="space-y-6 mb-10">
                      {lastOrder.items.map((item, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between gap-8 font-black text-slate-900 text-lg tracking-tighter">
                            <span className="flex-1 italic">{item.quantity}x {item.product.name}</span>
                            <span className="font-black">${item.product.price * item.quantity}.00</span>
                          </div>
                          {item.product.id === 'p1' && (
                             <p className="text-[11px] text-amber-500 italic ml-10 leading-none border-l-4 border-amber-100 pl-4 uppercase font-black tracking-tight">+ Chamoy, Tajín y Chamoy de la casa</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="border-b-[6px] border-dotted border-slate-100 my-8"></div>

                    <div className="space-y-4 mt-4">
                      <div className="flex justify-between items-center py-2 bg-slate-100/50 px-6 rounded-2xl border border-slate-100">
                        <span className="uppercase tracking-[0.4em] font-black text-[11px] text-slate-400">Subtotal Neto</span>
                        <span className="font-black text-xl text-slate-900 tracking-tighter">${lastOrder.total}.00</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl font-black text-3xl mt-4 shadow-2xl shadow-slate-900/20">
                        <span className="tracking-tighter uppercase italic text-sm opacity-60">Total</span>
                        <span className="tracking-tighter leading-none">${lastOrder.total} MXN</span>
                      </div>
                    </div>

                    <div className="mt-16 text-center space-y-8">
                      <div className="p-6 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                         <p className="text-[12px] font-black text-amber-600 uppercase tracking-[0.3em] font-mono underline decoration-2 underline-offset-8">¡Disfruta tu Delicia!</p>
                      </div>
                      <div className="flex flex-col gap-1.5 items-center opacity-30 mt-8">
                        <div className="h-1 w-[90%] bg-slate-900 rounded-full" />
                        <div className="h-1 w-[70%] bg-slate-900 rounded-full" />
                        <div className="h-1 w-[50%] bg-slate-900 rounded-full" />
                        <p className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-[0.2em] font-mono">{lastOrder.timestamp.toLocaleDateString()} • {lastOrder.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    {/* Unique paper tear footer (Solicitado por el requerimiento 4) */}
                    <div className="absolute -bottom-4 left-0 right-0 overflow-hidden h-4 flex">
                       {[...Array(40)].map((_, i) => (
                         <div key={i} className="flex-1 bg-white h-full border-b-[8px] border-l-[8px] border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transform rotate-45 -translate-y-2.5" />
                       ))}
                    </div>
                  </div>
                </div>

                {/* COMANDA DE BARRA (Solicitado por el requerimiento 4) */}
                <div className="flex flex-col items-center group">
                  <span className="text-[11px] font-black uppercase text-emerald-500 mb-8 tracking-[0.3em] flex items-center gap-4 group-hover:text-emerald-300 transition-colors">
                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                    2. Comanda de Producción
                  </span>
                  
                  <div className="bg-white w-full shadow-2xl border-t-[12px] border-emerald-500 p-10 md:p-12 flex flex-col font-mono text-slate-900 border-x-4 border-slate-50 border-b-2 border-dashed border-slate-200 transform group-hover:scale-[1.02] transition-transform duration-500 rounded-b-[60px]">
                    <div className="bg-slate-900 p-8 text-center rounded-[36px] mb-12 shadow-2xl shadow-slate-900/30 overflow-hidden relative">
                       <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/10 animate-pulse" />
                       <p className="text-[12px] font-black uppercase text-slate-400 tracking-[0.5em] mb-3 italic relative z-10">Orden Prioritaria</p>
                       <h4 className="text-4xl font-black tracking-tighter text-white relative z-10 font-mono underline decoration-emerald-500 leading-none">PEDIDO {lastOrder.id}</h4>
                    </div>

                    <div className="space-y-12 flex-1">
                      {lastOrder.items.filter(i => i.product.category === 'PREPARADA').map((item, idx) => (
                        <div key={idx} className="space-y-6">
                          <div className="flex items-start gap-6">
                            <div className="bg-emerald-500 text-white w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-3xl shadow-xl shadow-emerald-500/30 italic">{item.quantity}</div>
                            <div className="flex-1 border-b-4 border-double border-slate-50 pb-6">
                              <h4 className="font-black text-3xl uppercase tracking-tighter leading-none mb-6 italic text-slate-800">{item.product.name}</h4>
                              <div className="flex flex-wrap gap-3">
                                <span className="bg-amber-100 text-amber-800 border-2 border-amber-400 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest italic shadow-sm">+ Con Todo (Salsa)</span>
                                <span className="bg-emerald-50 text-emerald-800 border-2 border-emerald-100 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase italic tracking-widest shadow-sm">Edición Especial</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-16 pt-12 border-t-8 border-dotted border-slate-100 text-center relative rounded-b-[60px]">
                      <div className="absolute top-[-15px] left-1/2 transform -translate-x-1/2 bg-white px-8 text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
                        Confirmación Insumos
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 shadow-inner">
                        <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 italic flex items-center justify-center gap-3">
                          <CheckCircle size={20} /> ¡Despachar Ahora!
                        </p>
                      </div>
                      <div className="flex justify-center gap-2 mt-8 opacity-10">
                        <div className="w-3 h-3 bg-slate-900 rounded-full" />
                        <div className="w-3 h-3 bg-slate-900 rounded-full" />
                        <div className="w-3 h-3 bg-slate-900 rounded-full" />
                      </div>
                    </div>

                    {/* Dotted border line at very bottom */}
                    <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-transparent to-emerald-500 opacity-20 mt-10 rounded-full" />
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER (Solicitado por el requerimiento 1) */}
              <div className="p-8 md:p-16 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-end gap-6 shadow-[0_-40px_80px_rgba(0,0,0,0.05)]">
                <button 
                  disabled={isPrinting}
                  onClick={() => setShowPrintModal(false)}
                  className="px-12 py-6 rounded-[32px] font-black bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all uppercase tracking-widest text-sm shadow-sm"
                >
                  Regresar al POS
                </button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  disabled={isPrinting}
                  onClick={simulatePrint}
                  className={`min-w-[340px] px-14 py-6 rounded-[32px] font-black ${isPrinting ? 'bg-indigo-500' : 'bg-amber-500'} text-white shadow-[0_30px_60px_rgba(245,158,11,0.3)] flex items-center justify-center gap-5 transition-all uppercase tracking-[0.2em] text-base active:shadow-inner hover:scale-[1.02]`}
                >
                  {isPrinting ? (
                    <>
                      <Loader2 size={32} className="animate-spin" strokeWidth={3} />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Printer size={32} strokeWidth={2.5} />
                      Imprimir Comprobantes
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST (Solicitado por el requerimiento 1) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 200, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 200, opacity: 0, scale: 0.5 }}
            className={`fixed bottom-12 left-1/2 z-[200] -translate-x-1/2 px-10 py-6 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex items-center gap-6 border-4 md:min-w-[600px] ${
              toast.type === 'success' ? 'bg-emerald-900 text-emerald-50 border-emerald-500/30 backdrop-blur-xl' : 'bg-red-900 text-red-50 border-red-500/30'
            }`}
          >
            <div className={`p-4 rounded-[20px] ${toast.type === 'success' ? 'bg-emerald-500 shadow-xl shadow-emerald-500/40' : 'bg-red-500'} text-white flex-shrink-0 animate-bounce`}>
              <CheckCircle size={28} strokeWidth={3} />
            </div>
            <div className="flex-1">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-60">Operación Exitosa</p>
               <p className="font-black text-lg leading-tight tracking-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-emerald-200 hover:text-white p-2">
               <X size={28} strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Style for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fde68a;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f59e0b;
        }
      `}</style>
    </div>
  );
}
