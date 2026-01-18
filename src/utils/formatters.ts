/**
 * Format number as currency
 */
export function formatCurrency(value: string | number, currency = 'USD'): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return '-';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue);
}

/**
 * Format number with abbreviation (K, M, B)
 */
export function formatNumber(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return '-';
    }

    if (numValue >= 1e9) {
        return `${(numValue / 1e9).toFixed(2)}B`;
    }
    if (numValue >= 1e6) {
        return `${(numValue / 1e6).toFixed(2)}M`;
    }
    if (numValue >= 1e3) {
        return `${(numValue / 1e3).toFixed(2)}K`;
    }
    return numValue.toFixed(2);
}

/**
 * Format percentage
 */
export function formatPercentage(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
        return '-';
    }

    const sign = numValue >= 0 ? '+' : '';
    return `${sign}${numValue.toFixed(2)}%`;
}

/**
 * Parse percentage string to number
 */
export function parsePercentage(value: string): number {
    return parseFloat(value.replace('%', ''));
}

/**
 * Check if stock is gaining
 */
export function isGaining(changePercentage: string): boolean {
    const value = parsePercentage(changePercentage);
    return value > 0;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return `${text.substring(0, maxLength)}...`;
}
