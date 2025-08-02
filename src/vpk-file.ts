import {BufferedReader} from "./buffered-reader.js";
import type {PackageEntry} from "./entities/package-entry.js";
import console from "node:console";
import process from "node:process";
import type {VPKHeader} from "./entities/vpk-header.js";
import {VPK_MAGIC, VPK_SUPPORTED_VERSION} from "./constants.js";

export class VPKFile {
    private reader: BufferedReader;
    private _header: VPKHeader | undefined;
    private _entries: PackageEntry[] = [];

    constructor(private filePath: string) {
        this.reader = new BufferedReader(this.filePath)
    }

    get isLoaded(): boolean { return this.header !== undefined; }
    get header() { return this._header; }
    get entries(): PackageEntry[] { return this._entries; }

    getArchiveFilePathByIndex(index: number): string {
        const pathStart = this.filePath.substring(0, this.filePath.lastIndexOf("_"));
        return `${pathStart}_${index}.vpk`;
    }

    readFile(entry: PackageEntry): Buffer | undefined {
        const filePath = this.getArchiveFilePathByIndex(entry.archiveIndex);
        // TODO: Merge with smallData
        if(entry.smallData) {
            console.log('Error, reading files with small data block not implemented yet.');
            process.exit(1);
        }

        if(entry.length > 0) {
            const reader = new BufferedReader(filePath);
            reader.seek(entry.offset);
            return reader.readBytes(entry.length);
        }

        return undefined;
    }

    load() {
        this._header = {
            magic: this.reader.readUInt32LE(),
            version: this.reader.readUInt32LE(),
            treeSize: this.reader.readUInt32LE(),
            fileDataSectionSize: this.reader.readUInt32LE(),
            archiveMD5SectionSize: this.reader.readUInt32LE(),
            otherMD5SectionSize: this.reader.readUInt32LE(),
            signatureSectionSize: this.reader.readUInt32LE(),
        };

        if(this._header.magic !== VPK_MAGIC) {
            console.log('File do not contains MAGIC value at start.');
            process.exit(1);
        }

        if(this._header.version !== VPK_SUPPORTED_VERSION) {
            console.log('Unsupported version: ' + this._header.version);
            process.exit(1);
        }

        this._entries = []; // Reset

        // Types
        while (true) {
            const typeName = this.reader.readNullTerminatedString('utf8');

            if (typeName.length === 0) {
                break;
            }

            // Directories
            while (true) {
                const directoryName = this.reader.readNullTerminatedString('utf8');

                if (directoryName.length === 0) {
                    break;
                }

                // Files
                while (true) {
                    const fileName = this.reader.readNullTerminatedString('utf8');

                    if (fileName.length === 0) {
                        break;
                    }

                    const entry: PackageEntry = {
                        fileName,
                        directoryName,
                        typeName,
                        crc32: this.reader.readUInt32LE(),
                        smallDataSize: this.reader.readUInt16LE(),
                        archiveIndex: this.reader.readUInt16LE(),
                        offset: this.reader.readUInt32LE(),
                        length: this.reader.readUInt32LE(),
                        terminator: this.reader.readUInt16LE(),
                        smallData: undefined
                    };

                    //console.log('entry =', entry);

                    if (entry.terminator != 0xFFFF) {
                        console.log('Invalid entry terminator =', entry.terminator);
                        process.exit(1);
                    }

                    if (entry.smallDataSize > 0) {
                        entry.smallData = this.reader.readBytes(entry.smallDataSize);
                    }

                    this._entries.push(entry);
                }
            }
        }
    }
}