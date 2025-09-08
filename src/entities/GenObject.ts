export interface GenObject {
    genName: string;
    genId: string;
    genMeta: Record<string, unknown>;
    genDest?: string;
    genLink?: string;
    [ x: string ]: unknown | GenObject | GenObject[];
}