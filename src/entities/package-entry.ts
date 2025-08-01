export interface PackageEntry {
    readonly fileName: string;
    readonly directoryName: string;
    readonly typeName: string;
    readonly crc32: number;
    readonly smallDataSize: number;
    readonly archiveIndex: number;
    readonly offset: number;
    readonly length: number;
    readonly terminator: number;
    smallData?: Buffer | undefined;
}