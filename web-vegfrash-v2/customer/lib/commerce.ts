export interface PricingRule {
    pricingType: 'per_kg' | 'per_piece';
    basePrice: number;
}

export interface WeightAdjustment {
    requestedKg: number;
    actualKg: number;
    pricePerKgAtTime: number;
}

/**
 * Calculates the final price for a line item based on actual weight relative to requested weight.
 * For 'per_kg' items, strict pro-rata pricing applies.
 * For 'per_piece' items, usually fixed, but if weight variance is extreme, logic can be added here.
 */
export function calculateFinalLinePrice(
    pricingType: 'per_kg' | 'per_piece',
    pricePerKgAtTime: number,
    actualWeightKg: number,
    basePricePerPiece?: number,
    quantityUnits?: number
): number {
    if (pricingType === 'per_kg') {
        return Number((actualWeightKg * pricePerKgAtTime).toFixed(2));
    } else {
        // Per piece - price is usually fixed per unit, not weight
        return Number(((basePricePerPiece || 0) * (quantityUnits || 1)).toFixed(2));
    }
}

/**
 * Calculates the total refund or extra charge needed after weighing.
 * Positive = Customer owes more (rare for weight, usually refund)
 * Negative = Refund due to customer
 */
export function calculateWeightAdjustmentTotal(items: WeightAdjustment[]): number {
    let totalAdjustment = 0;

    for (const item of items) {
        const originalPrice = item.requestedKg * item.pricePerKgAtTime;
        const finalPrice = item.actualKg * item.pricePerKgAtTime;
        totalAdjustment += (finalPrice - originalPrice);
    }

    return Number(totalAdjustment.toFixed(2));
}

export const TOLERANCE_PERCENTAGE = 0.05; // 5% tolerance

export function isWeightWithinTolerance(requested: number, actual: number): boolean {
    const diff = Math.abs(requested - actual);
    return diff <= (requested * TOLERANCE_PERCENTAGE);
}
