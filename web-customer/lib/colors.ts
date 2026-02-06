/**
 * Utility to manipulate hex colors for dynamic theme generation
 */

export function adjustColor(hex: string, amount: number): string {
    return '#' + hex.replace(/^#/, '').replace(/../g, color => {
        let val = parseInt(color, 16);
        val = Math.max(0, Math.min(255, val + amount));
        const hexVal = val.toString(16);
        return hexVal.length === 1 ? '0' + hexVal : hexVal;
    });
}

/**
 * Generates a complementary light version of a color (usually for backgrounds)
 * Shifts color towards white.
 */
export function getLightVariant(hex: string): string {
    // For very light backgrounds, we want to shift close to 255.
    // If it's already light, shift less. If dark, shift more.
    return adjustColor(hex, 200);
}

/**
 * Generates a dark version of a color (usually for hover states)
 * Shifts color towards black.
 */
export function getDarkVariant(hex: string): string {
    return adjustColor(hex, -30);
}
