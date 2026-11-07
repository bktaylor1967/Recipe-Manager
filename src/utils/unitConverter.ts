export function formatQuantity(val: number): string {
  if (!val || val === 0) return '';
  // Check common fractions
  const whole = Math.floor(val);
  const frac = Math.round((val - whole) * 100) / 100;

  let fracStr = '';
  if (Math.abs(frac - 0.25) < 0.05) fracStr = '¼';
  else if (Math.abs(frac - 0.33) < 0.05) fracStr = '⅓';
  else if (Math.abs(frac - 0.5) < 0.05) fracStr = '½';
  else if (Math.abs(frac - 0.66) < 0.05) fracStr = '⅔';
  else if (Math.abs(frac - 0.75) < 0.05) fracStr = '¾';
  else if (frac > 0) {
    fracStr = frac.toFixed(1).replace(/^0/, '');
    if (fracStr.endsWith('.0')) fracStr = '';
  }

  if (whole === 0 && fracStr) return fracStr;
  if (whole > 0 && fracStr) return `${whole} ${fracStr}`;
  return `${whole}`;
}

export function scaleIngredient(
  quantity: number,
  baseServings: number,
  currentServings: number
): number {
  if (!quantity || baseServings <= 0) return quantity;
  const scaled = (quantity / baseServings) * currentServings;
  return Math.round(scaled * 100) / 100;
}

export function convertUnitSystem(
  qty: number,
  unit: string,
  targetSystem: 'metric' | 'imperial'
): { quantity: number; unit: string } {
  const cleanUnit = unit.toLowerCase().trim();

  if (targetSystem === 'metric') {
    // Convert Imperial to Metric
    if (cleanUnit === 'oz' || cleanUnit === 'ounce' || cleanUnit === 'ounces') {
      return { quantity: Math.round(qty * 28.35), unit: 'g' };
    }
    if (cleanUnit === 'lb' || cleanUnit === 'lbs' || cleanUnit === 'pound' || cleanUnit === 'pounds') {
      return { quantity: Math.round(qty * 453.6), unit: 'g' };
    }
    if (cleanUnit === 'cup' || cleanUnit === 'cups') {
      return { quantity: Math.round(qty * 240), unit: 'ml' };
    }
    if (cleanUnit === 'tbsp' || cleanUnit === 'tablespoon' || cleanUnit === 'tablespoons') {
      return { quantity: Math.round(qty * 15), unit: 'ml' };
    }
    if (cleanUnit === 'tsp' || cleanUnit === 'teaspoon' || cleanUnit === 'teaspoons') {
      return { quantity: Math.round(qty * 5), unit: 'ml' };
    }
  } else if (targetSystem === 'imperial') {
    // Convert Metric to Imperial
    if (cleanUnit === 'g' || cleanUnit === 'grams') {
      if (qty >= 400) {
        return { quantity: Math.round((qty / 453.6) * 10) / 10, unit: 'lb' };
      }
      return { quantity: Math.round((qty / 28.35) * 10) / 10, unit: 'oz' };
    }
    if (cleanUnit === 'ml' || cleanUnit === 'milliliters') {
      if (qty >= 100) {
        return { quantity: Math.round((qty / 240) * 10) / 10, unit: 'cups' };
      }
      return { quantity: Math.round((qty / 15) * 10) / 10, unit: 'tbsp' };
    }
  }

  return { quantity: qty, unit };
}
