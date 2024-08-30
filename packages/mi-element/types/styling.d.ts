export function classMap(map: {
    [name: string]: string | boolean | number;
}): string;
export function styleMap(map: {
    [name: string]: string | number | undefined | null;
}, options?: {
    unit?: string | undefined;
} | undefined): string;
