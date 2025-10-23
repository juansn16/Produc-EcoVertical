// Script para crear proveedores de prueba
const proveedoresPrueba = [
  {
    nombre_empresa: "Vivero Verde",
    contacto_principal: "María González",
    telefono: "0412-1234567",
    email: "maria@viveroverde.com",
    categorias: ["Plantas", "Fertilizantes"],
    descripcion: "Especialistas en plantas ornamentales y fertilizantes orgánicos",
    ubicacion: {
      ciudad: "Caracas",
      estado: "Distrito Capital",
      calle: "Av. Principal",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Huertos Urbanos",
    contacto_principal: "Carlos Pérez",
    telefono: "0424-9876543",
    email: "carlos@huertosurbanos.com",
    categorias: ["Macetas", "Sistemas de riego"],
    descripcion: "Soluciones completas para huertos urbanos y verticales",
    ubicacion: {
      ciudad: "Valencia",
      estado: "Carabobo",
      calle: "Calle 5",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "AgroTec",
    contacto_principal: "Ana Rodríguez",
    telefono: "0416-5555555",
    email: "ana@agrotec.com",
    categorias: ["Tecnología", "Sensores"],
    descripcion: "Tecnología avanzada para agricultura inteligente",
    ubicacion: {
      ciudad: "Maracaibo",
      estado: "Zulia",
      calle: "Av. 5 de Julio",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Semillas Premium",
    contacto_principal: "Luis Martínez",
    telefono: "0426-7777777",
    email: "luis@semillaspremium.com",
    categorias: ["Semillas", "Plantas"],
    descripcion: "Semillas de alta calidad para cultivos diversos",
    ubicacion: {
      ciudad: "Barquisimeto",
      estado: "Lara",
      calle: "Carrera 15",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Riego Inteligente",
    contacto_principal: "Patricia López",
    telefono: "0414-3333333",
    email: "patricia@riegointeligente.com",
    categorias: ["Sistemas de riego", "Automatización"],
    descripcion: "Sistemas de riego automatizados para huertos",
    ubicacion: {
      ciudad: "San Cristóbal",
      estado: "Táchira",
      calle: "Av. Libertador",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Fertilizantes Naturales",
    contacto_principal: "Roberto Silva",
    telefono: "0422-4444444",
    email: "roberto@fertilizantesnaturales.com",
    categorias: ["Fertilizantes", "Abonos orgánicos"],
    descripcion: "Fertilizantes 100% orgánicos y naturales",
    ubicacion: {
      ciudad: "Mérida",
      estado: "Mérida",
      calle: "Calle 8",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Macetas Ecológicas",
    contacto_principal: "Carmen Herrera",
    telefono: "0418-6666666",
    email: "carmen@macetasecologicas.com",
    categorias: ["Macetas", "Materiales ecológicos"],
    descripcion: "Macetas fabricadas con materiales reciclados",
    ubicacion: {
      ciudad: "Puerto La Cruz",
      estado: "Anzoátegui",
      calle: "Av. Intercomunal",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Plantas Medicinales",
    contacto_principal: "Diego Morales",
    telefono: "0428-8888888",
    email: "diego@plantasmedicinales.com",
    categorias: ["Plantas medicinales", "Hierbas"],
    descripcion: "Plantas medicinales y hierbas aromáticas",
    ubicacion: {
      ciudad: "Cumana",
      estado: "Sucre",
      calle: "Calle 3",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Invernaderos Modernos",
    contacto_principal: "Elena Vargas",
    telefono: "0410-9999999",
    email: "elena@invernaderosmodernos.com",
    categorias: ["Invernaderos", "Estructuras"],
    descripcion: "Invernaderos y estructuras para cultivos protegidos",
    ubicacion: {
      ciudad: "Maracay",
      estado: "Aragua",
      calle: "Av. Las Delicias",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Sustratos Premium",
    contacto_principal: "Miguel Torres",
    telefono: "0420-1111111",
    email: "miguel@sustratospremium.com",
    categorias: ["Sustratos", "Tierra"],
    descripcion: "Sustratos especializados para diferentes tipos de plantas",
    ubicacion: {
      ciudad: "Ciudad Guayana",
      estado: "Bolívar",
      calle: "Av. Guayana",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Herramientas Agrícolas",
    contacto_principal: "Sofía Jiménez",
    telefono: "0412-2222222",
    email: "sofia@herramientasagricolas.com",
    categorias: ["Herramientas", "Equipos"],
    descripcion: "Herramientas especializadas para agricultura urbana",
    ubicacion: {
      ciudad: "Coro",
      estado: "Falcón",
      calle: "Calle Zamora",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Iluminación LED",
    contacto_principal: "Andrés Castillo",
    telefono: "0416-3333333",
    email: "andres@iluminacionled.com",
    categorias: ["Iluminación", "LED"],
    descripcion: "Sistemas de iluminación LED para cultivos indoor",
    ubicacion: {
      ciudad: "Trujillo",
      estado: "Trujillo",
      calle: "Av. Bolívar",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Control de Plagas",
    contacto_principal: "Isabel Ruiz",
    telefono: "0424-4444444",
    email: "isabel@controlplagas.com",
    categorias: ["Control de plagas", "Pesticidas naturales"],
    descripcion: "Soluciones naturales para el control de plagas",
    ubicacion: {
      ciudad: "Los Teques",
      estado: "Miranda",
      calle: "Calle Bolívar",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Sistemas Hidropónicos",
    contacto_principal: "Fernando Díaz",
    telefono: "0418-5555555",
    email: "fernando@sistemashidroponicos.com",
    categorias: ["Hidroponía", "Sistemas"],
    descripcion: "Sistemas hidropónicos completos para cultivos",
    ubicacion: {
      ciudad: "Valera",
      estado: "Trujillo",
      calle: "Av. Principal",
      pais: "Venezuela"
    }
  },
  {
    nombre_empresa: "Compost Orgánico",
    contacto_principal: "Lucía Mendoza",
    telefono: "0426-6666666",
    email: "lucia@compostorganico.com",
    categorias: ["Compost", "Abonos"],
    descripcion: "Compost orgánico de alta calidad para cultivos",
    ubicacion: {
      ciudad: "Acarigua",
      estado: "Portuguesa",
      calle: "Calle 5 de Julio",
      pais: "Venezuela"
    }
  }
];

console.log('🌱 Proveedores de prueba creados:', proveedoresPrueba);
console.log('📊 Total de proveedores:', proveedoresPrueba.length);
console.log('📄 Con 6 por página serían:', Math.ceil(proveedoresPrueba.length / 6), 'páginas');

export { proveedoresPrueba };
