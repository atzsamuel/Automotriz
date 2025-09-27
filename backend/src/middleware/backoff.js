// Algoritmo Exponential Backoff para protección anti-brute force
const attempts = {};

function exponentialBackoff(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (!attempts[ip]) attempts[ip] = [];
  attempts[ip] = attempts[ip].filter(ts => now - ts < 60000); // 1 min
  if (attempts[ip].length >= 5) {
    const waitTime = Math.pow(2, attempts[ip].length) * 1000;
    return res.status(429).json({ error: `Demasiados intentos. Espera ${waitTime / 1000}s.` });
  }
  attempts[ip].push(now);
  next();
}

module.exports = exponentialBackoff;
