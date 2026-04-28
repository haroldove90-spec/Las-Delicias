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
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Printer,
  ChevronRight,
  Droplets,
  Phone,
  Navigation,
  ExternalLink,
  Wallet,
  Package,
  Menu,
  TrendingUp,
  DollarSign,
  History,
  Info,
  Loader2,
  Download
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // PWA Effect
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setToast({ message: '¡App instalada con éxito!', type: 'success' });
    }
  };

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
          {deferredPrompt && (
            <button 
              onClick={installApp}
              className="w-full flex items-center gap-3 p-4 mb-6 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Download size={16} /> Instalar App
            </button>
          )}
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
                className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-theme(spacing.24)-theme(spacing.20))] lg:h-[calc(100vh-12rem)] overflow-hidden"
              >
                {/* Column 1: Navigation of categories (Small) */}
                <div className="hidden lg:flex flex-col w-32 bg-white rounded-3xl border border-amber-100 p-3 space-y-3 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest mb-1">Categorías</h3>
                  <button className="w-full flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-tighter shadow-lg shadow-amber-500/20">
                    <Droplets size={20} />
                    Todo
                  </button>
                  <button className="w-full flex flex-col items-center gap-1 p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-black text-[10px] uppercase tracking-tighter transition-all">
                    <ShoppingBag size={20} />
                    Venta
                  </button>
                  <button className="w-full flex flex-col items-center gap-1 p-3 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-black text-[10px] uppercase tracking-tighter transition-all">
                    <History size={20} />
                    Recent
                  </button>
                </div>

                {/* Column 2: Product Grid (Compact & Integrated) */}
                <div className="flex-1 flex flex-col min-w-0 bg-white/40 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
                  <header className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-amber-500 rounded-full" />
                      <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Productos</h2>
                    </div>
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                      <button className="px-5 py-2 bg-white shadow-sm text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100">Preparadas</button>
                      <button className="px-5 py-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Insumos</button>
                    </div>
                  </header>

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-1 custom-scrollbar">
                    {PRODUCTS.map(product => (
                      <motion.button
                        whileTop={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group bg-white p-4 rounded-3xl border border-slate-100 hover:border-amber-400/50 hover:bg-amber-50/10 hover:shadow-xl hover:shadow-amber-500/5 transition-all text-left relative flex flex-col"
                      >
                        <div className="w-14 h-14 bg-amber-50/50 rounded-2xl mb-3 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner">
                          {product.name.includes('Tamarindo') ? '🍊' : product.name.includes('Fresa') ? '🍓' : product.name.includes('Menta') ? '🌿' : '🥤'}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-800 text-[13px] truncate leading-tight tracking-tight uppercase">{product.name}</h3>
                          <div className="flex items-center gap-2">
                             <p className="text-amber-600 font-extrabold text-sm">${product.price}</p>
                             <div className="w-1 h-1 bg-slate-200 rounded-full" />
                             <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">MXN</p>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 p-2 bg-amber-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg shadow-amber-500/20">
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Waste registration area integrated small */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} /> Últimas Mermas
                      </h3>
                      <button className="text-[10px] font-black text-red-500 uppercase hover:underline">+ Registrar</button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {wastage.map(w => (
                        <div key={w.id} className="flex-shrink-0 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 min-w-[140px]">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-400 text-[10px] font-black border border-red-50">
                            {w.id}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-[10px] truncate w-20">{w.itemName}</p>
                            <p className="text-[8px] text-red-500 font-black">{w.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Cart/Ticket Summary (Modern Minimalist Sidebar) */}
                <div className="hidden lg:flex flex-col w-96 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative">
                  <div className="p-6 border-b border-slate-50 bg-white/40 flex justify-between items-center relative z-10">
                    <div>
                      <h3 className="font-black text-2xl tracking-tighter text-slate-800">Canasta</h3>
                      <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-[0.2em] mt-1">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)} ARTÍCULOS LISTOS
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-600">
                      <ShoppingBag size={24} />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative z-10">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-200 space-y-4 opacity-50">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-dashed border-slate-200">
                          <ShoppingBag size={40} strokeWidth={1} />
                        </div>
                        <p className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Sin pedidos aún</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <motion.div 
                          layout 
                          key={item.id} 
                          className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm hover:shadow-md transition-shadow group"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-black text-xs text-slate-800 leading-tight truncate">{item.product.name}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">${item.product.price} por unidad</span>
                              <div className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-[9px] text-amber-600 font-black">Cant: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-sm text-slate-900 tracking-tighter whitespace-nowrap">${item.product.price * item.quantity}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)} 
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-white/60 border-t border-slate-100 relative z-10">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <span>Ticket Estándar</span>
                        <span>${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}.00</span>
                      </div>
                      <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-200">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-[9px] mb-1">Total Parcial</span>
                          <span className="text-4xl font-black text-amber-600 tracking-tighter leading-none">
                            ${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      disabled={cart.length === 0}
                      onClick={finalizePurchase}
                      className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-tighter overflow-hidden relative group"
                    >
                      <span className="relative z-10">Confirmar Pago</span>
                      <ChevronRight size={22} strokeWidth={3} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {role === 'REPARTIDOR' && (
              <motion.div
                key="repartidor-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full -m-4 md:-m-10 bg-slate-50"
              >
                {/* 3. Sticky Liquidation Summary */}
                <div className="sticky top-0 z-30 bg-slate-900 text-white px-6 py-4 shadow-xl border-b border-slate-800">
                  <div className="max-w-md mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Wallet size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Liquidación Hoy</p>
                        <p className="text-xl font-black tracking-tighter text-emerald-400">
                          ${orders.filter(o => o.status === 'ENTREGADO').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Entregas</p>
                      <p className="text-xl font-black tracking-tighter">
                        {orders.filter(o => o.status === 'ENTREGADO').length} <span className="text-sm font-medium text-slate-500 italic">/ {orders.length}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar pb-24">
                  {/* Active Orders Section */}
                  <section>
                    <header className="mb-4 flex justify-between items-center px-2">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                         Ruta Activa
                       </h3>
                    </header>

                    <div className="space-y-4">
                      {orders.filter(o => o.status !== 'ENTREGADO').map((order, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={order.id} 
                          className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${
                            order.status === 'EN_CAMINO' ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-100'
                          }`}
                        >
                          {/* Card Content */}
                          <div className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">PEDIDO {order.id}</p>
                                <h4 className="text-lg font-black text-slate-900 leading-tight">Juan Pérez</h4>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                  <MapPin size={14} className="text-emerald-500 shrink-0" />
                                  {order.address}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Cobrar</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">${order.total}</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <button className="flex items-center justify-center gap-2 py-3.5 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
                                <Phone size={16} /> Llamar
                              </button>
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank')}
                                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                              >
                                <Navigation size={16} /> Navegar
                              </button>
                            </div>

                            {/* Status Stepper */}
                            <div className="flex items-center gap-4 mt-2">
                              {order.status === 'PENDIENTE' ? (
                                <button 
                                  onClick={() => setOrders(orders.map(o => o.id === order.id ? {...o, status: 'EN_CAMINO'} : o))}
                                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                  Iniciar Ruta <ChevronRight size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setOrders(orders.map(o => o.id === order.id ? {...o, status: 'ENTREGADO'} : o));
                                    setToast({ message: '¡Pedido entregado con éxito!', type: 'success' });
                                  }}
                                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                  Marcar Entregado <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Summary of items tiny */}
                          <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                            {order.items.map((it, idx) => (
                              <span key={idx} className="text-[9px] font-bold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                                {it.quantity}x {it.product.name}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* History Section */}
                  <section className="pt-4 opacity-60">
                    <header className="mb-4 flex items-center gap-2 px-2">
                       <History size={14} className="text-slate-400" />
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Entregas del Día</h3>
                    </header>

                    <div className="space-y-3">
                      {[...orders, ...HISTORIAL_DELIVERIES].filter(o => o.status === 'ENTREGADO').map((order, idx) => (
                        <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                               <CheckCircle2 size={16} />
                             </div>
                             <div>
                               <p className="text-[11px] font-black text-slate-800 leading-none">{order.address}</p>
                               <p className="text-[9px] text-slate-400 font-bold mt-1">Cobrado: ${order.total}</p>
                             </div>
                           </div>
                           <p className="text-[9px] font-black text-slate-300 italic">{order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
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

      {/* Mobile Cart Overlay (Refined & Discrete) */}
      <AnimatePresence>
        {isCartOpenMobile && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpenMobile(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]" 
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="h-1.5 w-12 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
              <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50">
                <div>
                  <h3 className="font-black text-2xl tracking-tighter text-slate-800">Canasta</h3>
                  <p className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em]">{cart.length} Artículos</p>
                </div>
                <button onClick={() => setIsCartOpenMobile(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                   <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center py-12 opacity-30">
                    <ShoppingBag size={60} strokeWidth={1} />
                    <p className="font-black text-slate-400 mt-4 text-xs uppercase tracking-widest">Vacío</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex-1 pr-4">
                        <h4 className="font-black text-slate-800 text-sm tracking-tight leading-none">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">${item.product.price} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-base text-amber-600 tracking-tighter">${item.product.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-300 p-2 hover:text-red-500 transition-colors">
                           <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-8 bg-white border-t border-slate-100 space-y-6">
                <div className="flex justify-between items-end">
                   <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[9px]">Total Parcial</span>
                   <span className="text-4xl font-black text-amber-600 tracking-tighter leading-none">${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}</span>
                </div>
                <button 
                  onClick={finalizePurchase}
                  disabled={cart.length === 0}
                  className="w-full bg-amber-500 text-white py-5 rounded-[24px] font-black text-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Confirmar Pago
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DUAL PRINT MODAL (Refined & Discrete) */}
      <AnimatePresence>
        {showPrintModal && lastOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPrinting && setShowPrintModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4 text-slate-800">
                  <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                    <Printer size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase tracking-tighter leading-none italic">Impresión</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Pedido: {lastOrder.id}</p>
                  </div>
                </div>
                {!isPrinting && (
                  <button 
                    onClick={() => setShowPrintModal(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-100/30 overflow-y-auto custom-scrollbar items-start">
                {/* TICKET DE CAJA (Reduced Size & Mono) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    Comprobante
                  </span>
                  
                  <div className="bg-white w-full max-w-[300px] shadow-sm p-8 flex flex-col font-mono text-[9px] text-slate-900 border border-slate-100 relative">
                    <div className="text-center mb-6">
                      <p className="font-extrabold text-xs tracking-[0.3em] uppercase mb-1">Las Delicias</p>
                      <p className="opacity-60 text-[8px] tracking-widest uppercase italic">Artesanal & Natural</p>
                      <p className="mt-4 opacity-40">-----------------------------</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between font-black border-b border-slate-50 pb-1 mb-1 opacity-20">
                        <span className="w-6">C</span>
                        <span className="flex-1">PRODUCTO</span>
                        <span className="w-12 text-right">TOT</span>
                      </div>
                      {lastOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-1 leading-tight mb-1">
                          <span className="w-6 opacity-60">{item.quantity}</span>
                          <span className="flex-1 font-black">{item.product.name.toUpperCase()}</span>
                          <span className="w-12 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-center opacity-40 mb-4">-----------------------------</p>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>SUBTOTAL:</span>
                        <span>${lastOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-black text-xs mt-3 pt-2 border-t border-slate-100">
                        <span>TOTAL MXN:</span>
                        <span>${lastOrder.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-10 text-center opacity-40 space-y-2 text-[8px] uppercase tracking-widest font-black italic">
                      <p>¡Disfruta tu Delicia!</p>
                      <p className="mt-4">{lastOrder.timestamp.toLocaleString()}</p>
                      <p>Folio: {lastOrder.id}</p>
                    </div>
                  </div>
                </div>

                {/* COMANDA DE BARRA (Minimalist & Bold) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Barra
                  </span>
                  
                  <div className="bg-white w-full max-w-[300px] shadow-sm p-8 flex flex-col font-mono text-slate-900 border border-slate-100">
                    <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-end">
                       <h4 className="text-2xl font-black">{lastOrder.id}</h4>
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Orden Barra</p>
                    </div>

                    <div className="space-y-6 flex-1">
                      {lastOrder.items.filter(i => i.product.category === 'PREPARADA').map((item, idx) => (
                        <div key={idx} className="border-b border-dashed border-slate-200 pb-4">
                          <div className="flex items-start gap-4">
                            <span className="text-xl font-black">{item.quantity}</span>
                            <div className="flex-1">
                              <h4 className="font-extrabold text-sm leading-tight uppercase tracking-wide">{item.product.name}</h4>
                              <p className="text-[9px] mt-1 font-bold italic text-emerald-600 uppercase tracking-tighter opacity-60">CON TODO / EXTRA HIELO</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 text-center text-[8px] font-black uppercase tracking-[0.4em] opacity-30 italic">
                       Producción Inmediata
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION FOOTER (Refined & Discrete) */}
              <div className="p-6 bg-white border-t border-slate-50 flex flex-col md:flex-row justify-end gap-4">
                <button 
                  disabled={isPrinting}
                  onClick={() => setShowPrintModal(false)}
                  className="px-8 py-4 rounded-2xl font-black bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                >
                  Regresar al POS
                </button>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  disabled={isPrinting}
                  onClick={simulatePrint}
                  className={`min-w-[240px] px-8 py-4 rounded-2xl font-black ${isPrinting ? 'bg-indigo-500' : 'bg-amber-500'} text-white shadow-lg shadow-amber-500/10 flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs`}
                >
                  {isPrinting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Printer size={18} strokeWidth={2.5} />
                      Imprimir
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST (Moved to Right Bottom for visibility) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={`fixed bottom-8 right-8 z-[200] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border ${
              toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-50 border-emerald-500/30 backdrop-blur-md' : 'bg-red-900/90 text-red-50 border-red-500/30 backdrop-blur-md'
            } max-w-sm`}
          >
            <div className={`p-2 rounded-xl ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
              <CheckCircle size={20} strokeWidth={3} />
            </div>
            <div className="flex-1">
               <p className="font-black text-sm tracking-tight leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-emerald-200 hover:text-white">
               <X size={20} />
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

// Service Worker Registration for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
