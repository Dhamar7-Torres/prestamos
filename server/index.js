import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import corsConfig from './config/cors.js';
import errorHandler from './middleware/errorHandler.js';
import { optionalAuth, logUserActivity } from './middleware/auth.js';
import routes from './routes/index.js';
import { logError } from './utils/helpers.js';

// Configuración ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ====================================================
// MIDDLEWARES DE SEGURIDAD
// ====================================================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logError(
      new Error(`Rate limit exceeded for IP: ${req.ip}`),
      `Rate Limiting - ${req.method} ${req.originalUrl}`
    );
    res.status(429).json({
      success: false,
      message: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
    });
  }
});

// Aplicar rate limiting solo a rutas API
app.use('/api/', globalLimiter);

// Rate limiting más estricto para operaciones sensibles
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 requests por ventana
  skipSuccessfulRequests: true
});

// ====================================================
// MIDDLEWARES GENERALES
// ====================================================

// CORS
app.use(corsConfig);

// Trust proxy para obtener IP correcta detrás de reverse proxy
app.set('trust proxy', 1);

// Parsing de JSON y URL encoded con límites de tamaño
app.use(express.json({ 
  limit: '10mb',
  strict: true,
  type: ['application/json', 'text/plain']
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 20
}));

// Middleware para obtener IP real
app.use((req, res, next) => {
  req.realIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  next();
});

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.realIP;
    
    console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
    next();
  });
}

// ====================================================
// MIDDLEWARES DE AUTENTICACIÓN (OPCIONAL POR AHORA)
// ====================================================

// Autenticación opcional para todas las rutas API
app.use('/api/', optionalAuth);

// Logging de actividad de usuario para operaciones importantes
app.use('/api/prestamos', logUserActivity('prestamo_operation'));
app.use('/api/pagos', logUserActivity('pago_operation'));
app.use('/api/personas', logUserActivity('persona_operation'));

// ====================================================
// RUTAS
// ====================================================

// Health check detallado
app.get('/api/health', (req, res) => {
  const healthData = {
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    database: {
      status: 'connected' // Este estado se podría verificar dinámicamente
    }
  };

  res.json(healthData);
});

// API Routes principales
app.use('/api', routes);

// Rutas con rate limiting estricto para operaciones críticas
app.use('/api/prestamos', strictLimiter);
app.use('/api/pagos', strictLimiter);

// Endpoint para información de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: process.env.APP_NAME || 'Gestión de Préstamos API',
    version: process.env.APP_VERSION || '1.0.0',
    description: 'API para gestión de préstamos y pagos',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      personas: '/api/personas',
      prestamos: '/api/prestamos',
      pagos: '/api/pagos'
    },
    documentation: {
      swagger: '/api/docs', // Para futuras implementaciones
      github: 'https://github.com/tu-usuario/prestamos-app'
    },
    contact: {
      email: process.env.CONTACT_EMAIL || 'admin@prestamos.app',
      support: process.env.SUPPORT_URL || 'https://support.prestamos.app'
    }
  });
});

// Ruta para manejar endpoints no encontrados en API
app.use('/api/*', (req, res) => {
  logError(
    new Error(`Endpoint not found: ${req.originalUrl}`),
    `404 Handler - ${req.method} ${req.originalUrl}`
  );
  
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} no encontrado`,
    timestamp: new Date().toISOString(),
    method: req.method,
    availableEndpoints: ['/api/health', '/api/personas', '/api/prestamos', '/api/pagos']
  });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));
  
  // Catch-all handler: enviar back to React app para manejar routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // En desarrollo, mostrar mensaje para rutas no API
  app.get('*', (req, res) => {
    res.json({
      message: 'Servidor de desarrollo - Frontend corriendo en puerto 5173',
      api: 'http://localhost:5001/api',
      frontend: 'http://localhost:5173',
      health: 'http://localhost:5001/api/health'
    });
  });
}

// ====================================================
// MANEJO DE ERRORES
// ====================================================

// Error handler personalizado
app.use(errorHandler);

// ====================================================
// MANEJO DE PROCESOS
// ====================================================

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  logError(reason, 'Unhandled Promise Rejection');
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  
  // En producción, cerrar gracefully
  if (process.env.NODE_ENV === 'production') {
    console.log('🔄 Cerrando servidor debido a unhandled promise rejection');
    server.close(() => {
      process.exit(1);
    });
  }
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logError(error, 'Uncaught Exception');
  console.error('❌ Uncaught Exception:', error);
  console.log('🔄 Cerrando servidor debido a uncaught exception');
  process.exit(1);
});

// ====================================================
// INICIO DEL SERVIDOR
// ====================================================

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    🚀 SERVIDOR INICIADO                        ║
╠════════════════════════════════════════════════════════════════╣
║  Puerto:          ${PORT.toString().padEnd(47)} ║
║  Entorno:         ${(process.env.NODE_ENV || 'development').padEnd(47)} ║
║  PID:             ${process.pid.toString().padEnd(47)} ║
║                                                                ║
║  URLs:                                                         ║
║    API:           http://localhost:${PORT}/api${' '.repeat(25)} ║
║    Health:        http://localhost:${PORT}/api/health${' '.repeat(19)} ║
║    Frontend:      http://localhost:5173${' '.repeat(27)} ║
║                                                                ║
║  Tiempo inicio:   ${new Date().toLocaleString('es-CO').padEnd(47)} ║
╚════════════════════════════════════════════════════════════════╝
  `);

  // Verificar conexión a la base de datos al iniciar
  if (process.env.NODE_ENV !== 'test') {
    import('./config/database.js').then(({ default: prisma }) => {
      prisma.$connect()
        .then(() => console.log('✅ Conexión a la base de datos verificada'))
        .catch((error) => {
          console.error('❌ Error de conexión a la base de datos:', error.message);
        });
    });
  }
});

// ====================================================
// SHUTDOWN GRACEFUL
// ====================================================

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 ${signal} recibido. Cerrando servidor gracefully...`);
  
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado');
    
    // Cerrar conexión de base de datos
    import('./config/database.js').then(({ default: prisma }) => {
      return prisma.$disconnect();
    }).then(() => {
      console.log('✅ Conexión a base de datos cerrada');
      console.log('✅ Todas las conexiones cerradas. Adiós! 👋');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Error al cerrar conexión de BD:', error);
      process.exit(1);
    });
  });

  // Forzar cierre después de 15 segundos
  setTimeout(() => {
    console.error('❌ Forzando cierre del servidor (timeout)');
    process.exit(1);
  }, 15000);
};

// Escuchar señales de terminación
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar Ctrl+C en Windows
if (process.platform === "win32") {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", () => {
    process.emit("SIGINT");
  });
}

export default app;