// plan-helpers.js
// Helpers compartidos para normalizar planes, pagos y manejo de imagenes (compatibles con productos legacy).

export function normalizePlanName(plan) {
  return String(plan?.planName || "trial").toLowerCase();
}

export function canUsePayments(plan) {
  const name = normalizePlanName(plan);
  return name === "pro" || name === "professional" || name === "premium" || name === "enterprise";
}

export function getImageLimitByPlan(plan) {
  const name = normalizePlanName(plan);
  if (name === "premium" || name === "enterprise") return 5;
  if (name === "pro" || name === "professional") return 3;
  return 1;
}

export function getProductImages(product = {}) {
  if (Array.isArray(product.images) && product.images.length) {
    return product.images.filter(Boolean).slice(0, 5);
  }
  if (product.imageUrl) return [product.imageUrl];
  return [];
}

