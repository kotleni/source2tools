// https://developer.valvesoftware.com/wiki/VPK_(file_format)
export interface VPKHeader {
    readonly magic: number;
    readonly version: number;
    readonly treeSize: number;
    readonly fileDataSectionSize: number;
    readonly archiveMD5SectionSize: number;
    readonly otherMD5SectionSize: number;
    readonly signatureSectionSize: number;
}