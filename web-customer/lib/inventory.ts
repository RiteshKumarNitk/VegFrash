export interface Product {
    id: string;
    name: string;
    replacementHierarchy: string[]; // List of product IDs
}

export interface InventoryBatch {
    productId: string;
    expiryGrade: 'A' | 'B' | 'C';
    quantityKg: number;
    priceModifier: number;
}

/**
 * Finds the best available substitute for a product.
 * Logic:
 * 1. Check direct substitutes in hierarchy order.
 * 2. Prefer Grade A inventory for substitutes.
 * 3. Return best match or null.
 */
export function findSubstitute(
    originalProduct: Product,
    availableInventory: InventoryBatch[], // Flat list of all available inventory
    allProducts: Product[] // Map or list to look up substitute details
): { productId: string; reason: string } | null {

    if (!originalProduct.replacementHierarchy || originalProduct.replacementHierarchy.length === 0) {
        return null;
    }

    for (const substituteId of originalProduct.replacementHierarchy) {
        // Check if substitute has Grade A stock
        const customStock = availableInventory.find(
            b => b.productId === substituteId && b.expiryGrade === 'A' && b.quantityKg > 0
        );

        if (customStock) {
            return { productId: substituteId, reason: 'Grade A Upgrade' };
        }

        // Fallback to Grade B if allowed (business logic dependent)
        const agingStock = availableInventory.find(
            b => b.productId === substituteId && b.expiryGrade === 'B' && b.quantityKg > 0
        );

        if (agingStock) {
            return { productId: substituteId, reason: 'Available Substitute' };
        }
    }

    return null;
}
