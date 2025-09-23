import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo, usar una instancia global para evitar múltiples conexiones
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

// Manejo de eventos de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida');
  })
  .catch((error) => {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  });

// Manejo graceful de cierre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Desconectado de la base de datos');
});

export default prisma;