export const inventoryData = [
  {
    id: 1,
    title: "Sistema de Riego Automático",
    description: "Sistema de riego por goteo automatizado con sensores de humedad y programación inteligente.",
    category: 'green-dark',
    author: "Carlos López",
    date: "2024-01-15",
    tags: ["Herramientas", "Riego", "Automático"],
    stock: 2,
    status: "Disponible",
    location: "Almacén Principal",
    price: "$150.00"
  },
  {
    id: 2,
    title: "Semillas de Tomate Cherry",
    description: "Semillas orgánicas de tomate cherry, variedad resistente a enfermedades y alta producción.",
    category: 'green-medium',
    author: "María García",
    date: "2024-01-14",
    tags: ["Semillas", "Tomate", "Orgánico"],
    stock: 15,
    status: "Disponible",
    location: "Refrigerador Semillas",
    price: "$8.50"
  },
  {
    id: 3,
    title: "Fertilizante Orgánico NPK",
    description: "Fertilizante orgánico balanceado con nitrógeno, fósforo y potasio para crecimiento óptimo.",
    category: 'green-light',
    author: "Juan Pérez",
    date: "2024-01-13",
    tags: ["Fertilizante", "Orgánico", "NPK"],
    stock: 8,
    status: "Disponible",
    location: "Almacén Químicos",
    price: "$25.00"
  },
  {
    id: 4,
    title: "Pesticida Natural Neem",
    description: "Pesticida natural a base de aceite de neem para control de plagas sin químicos tóxicos.",
    category: 'cream',
    author: "Ana Rodríguez",
    date: "2024-01-12",
    tags: ["Pesticida", "Natural", "Neem"],
    stock: 5,
    status: "Disponible",
    location: "Almacén Químicos",
    price: "$18.00"
  },
  {
    id: 5,
    title: "Macetas Verticales 5L",
    description: "Macetas especializadas para cultivo vertical con sistema de drenaje integrado.",
    category: 'green-dark',
    author: "Luis Martínez",
    date: "2024-01-11",
    tags: ["Macetas", "Vertical", "5L"],
    stock: 50,
    status: "Disponible",
    location: "Almacén Principal",
    price: "$12.00"
  },
  {
    id: 6,
    title: "Sustrato Premium",
    description: "Sustrato especializado para cultivo hidropónico con pH balanceado y nutrientes.",
    category: 'green-medium',
    author: "Carmen Silva",
    date: "2024-01-10",
    tags: ["Sustrato", "Hidropónico", "Premium"],
    stock: 12,
    status: "Disponible",
    location: "Almacén Principal",
    price: "$35.00"
  },
  {
    id: 7,
    title: "Tijeras de Poda Profesionales",
    description: "Tijeras de poda de acero inoxidable con mango ergonómico para trabajos precisos.",
    category: 'dark',
    author: "Roberto Díaz",
    date: "2024-01-09",
    tags: ["Herramientas", "Poda", "Profesional"],
    stock: 3,
    status: "Disponible",
    location: "Caja de Herramientas",
    price: "$45.00"
  },
  {
    id: 8,
    title: "Semillas de Albahaca",
    description: "Semillas de albahaca dulce, perfecta para cultivo en interiores y exteriores.",
    category: 'green-light',
    author: "Patricia Vega",
    date: "2024-01-08",
    tags: ["Semillas", "Albahaca", "Aromática"],
    stock: 20,
    status: "Disponible",
    location: "Refrigerador Semillas",
    price: "$6.00"
  },
  {
    id: 9,
    title: "Sensores de pH Digital",
    description: "Sensores digitales para medir pH del suelo y agua con calibración automática.",
    category: 'green-dark',
    author: "Fernando Ruiz",
    date: "2024-01-07",
    tags: ["Sensores", "pH", "Digital"],
    stock: 4,
    status: "Disponible",
    location: "Almacén Electrónicos",
    price: "$85.00"
  },
  {
    id: 10,
    title: "Lámparas LED Cultivo",
    description: "Lámparas LED especializadas para cultivo indoor con espectro completo.",
    category: 'green-medium',
    author: "Isabel Morales",
    date: "2024-01-06",
    tags: ["Iluminación", "LED", "Cultivo"],
    stock: 6,
    status: "Disponible",
    location: "Almacén Electrónicos",
    price: "$120.00"
  },
  {
    id: 11,
    title: "Semillas de Lechuga",
    description: "Semillas de lechuga romana, variedad de crecimiento rápido y alta producción.",
    category: 'green-light',
    author: "Diego Castro",
    date: "2024-01-05",
    tags: ["Semillas", "Lechuga", "Rápido"],
    stock: 18,
    status: "Disponible",
    location: "Refrigerador Semillas",
    price: "$7.50"
  },
  {
    id: 12,
    title: "Guantes de Jardinería",
    description: "Guantes resistentes al agua con protección UV para trabajos de jardinería.",
    category: 'cream',
    author: "Sofía Herrera",
    date: "2024-01-04",
    tags: ["Protección", "Guantes", "Jardinería"],
    stock: 10,
    status: "Disponible",
    location: "Caja de Herramientas",
    price: "$15.00"
  }
];

// Categorías para filtros
export const inventoryCategories = [
  { id: 'herramientas', name: 'Herramientas', color: 'dark' },
  { id: 'semillas', name: 'Semillas', color: 'green-medium' },
  { id: 'fertilizantes', name: 'Fertilizantes', color: 'green-light' },
  { id: 'pesticidas', name: 'Pesticidas', color: 'cream' },
  { id: 'macetas', name: 'Macetas', color: 'green-dark' },
  { id: 'sustratos', name: 'Sustratos', color: 'green-medium' },
  { id: 'sensores', name: 'Sensores', color: 'green-dark' },
  { id: 'iluminacion', name: 'Iluminación', color: 'green-medium' },
  { id: 'proteccion', name: 'Protección', color: 'cream' }
];

// Estados de stock
export const stockStatuses = [
  { id: 'disponible', name: 'Disponible', color: 'green' },
  { id: 'bajo', name: 'Stock Bajo', color: 'yellow' },
  { id: 'agotado', name: 'Agotado', color: 'red' },
  { id: 'reservado', name: 'Reservado', color: 'blue' }
];