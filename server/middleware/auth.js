import jwt from 'jsonwebtoken';
import { HTTP_STATUS, MESSAGES } from '../utils/constants.js';
import { createErrorResponse } from '../utils/helpers.js';

// Middleware de autenticación JWT (para futuras implementaciones)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createErrorResponse('Token de acceso requerido', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse('Token inválido o expirado', HTTP_STATUS.FORBIDDEN)
      );
    }

    req.user = user;
    next();
  });
};

// Middleware para verificar roles específicos
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED)
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse('Permisos insuficientes', HTTP_STATUS.FORBIDDEN)
      );
    }

    next();
  };
};

// Middleware para verificar propiedad de recursos
export const checkResourceOwnership = (req, res, next) => {

  
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json(
      createErrorResponse('Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED)
    );
  }

  if (req.user.role === 'admin') {
    return next();
  }


  next();
};

// Generar token JWT
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    issuer: 'prestamos-app',
    audience: 'prestamos-users'
  });
};

// Verificar token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Middleware opcional de autenticación (no requerida)
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

// Middleware para logging de actividad del usuario
export const logUserActivity = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;

    res.send = function(data) {
      // Log de la actividad después de la respuesta exitosa
      if (res.statusCode < 400) {
        const logData = {
          userId: req.user?.id || 'anonymous',
          action,
          resource: req.originalUrl,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        };

        // Aquí se podría guardar en base de datos o log file
        console.log('User Activity:', logData);
      }

      originalSend.call(this, data);
    };

    next();
  };
};

// Rate limiting por usuario
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }

    const currentRequests = requests.get(userId) || [];

    if (currentRequests.length >= maxRequests) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
        createErrorResponse(
          'Demasiadas requests. Intenta de nuevo más tarde.',
          HTTP_STATUS.TOO_MANY_REQUESTS
        )
      );
    }

    currentRequests.push(now);
    requests.set(userId, currentRequests);

    next();
  };
};

export default {
  authenticateToken,
  requireRole,
  checkResourceOwnership,
  generateToken,
  verifyToken,
  optionalAuth,
  logUserActivity,
  userRateLimit
};