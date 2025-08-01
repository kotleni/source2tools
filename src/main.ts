import {BufferedReader} from "./buffered-reader.js";
import * as process from "node:process";
import * as console from "node:console";

const FILE_PATH = '/home/kotleni/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo/pak01_dir.vpk';
const MAGIC = 0x55AA1234;
const SUPPORTED_VERSION = 2;

// https://developer.valvesoftware.com/wiki/VPK_(file_format)

interface VPKHeader {
    magic: number;
    version: number;
    treeSize: number;
    fileDataSectionSize: number;
    archiveMD5SectionSize: number;
    otherMD5SectionSize: number;
    signatureSectionSize: number;
}

interface PackageEntry {
    fileName: string;
    directoryName: string;
    typeName: string;
    crc32: number;
    smallDataSize: number;
    archiveIndex: number;
    offset: number;
    length: number;
    terminator: number;
    smallData?: Buffer | undefined;
}

const reader = new BufferedReader(FILE_PATH);

const header: VPKHeader = {
    magic: reader.readUInt32LE(),
    version: reader.readUInt32LE(),
    treeSize: reader.readUInt32LE(),
    fileDataSectionSize: reader.readUInt32LE(),
    archiveMD5SectionSize: reader.readUInt32LE(),
    otherMD5SectionSize: reader.readUInt32LE(),
    signatureSectionSize: reader.readUInt32LE(),
};

if(header.magic !== MAGIC) {
    console.log('File do not contains MAGIC value at start.');
    process.exit(1);
}

if(header.version !== SUPPORTED_VERSION) {
    console.log('Unsupported version: ' + header.version);
    process.exit(1);
}

console.log('header =', header);

const entries: PackageEntry[] = [];

// Types
while(true) {
    const typeName = reader.readNullTerminatedString('utf8');

    if(typeName.length === 0) {
        break;
    }

    // Directories
    while(true) {
        const directoryName = reader.readNullTerminatedString('utf8');

        if(directoryName.length === 0) {
            break;
        }

        // Files
        while(true) {
            const fileName = reader.readNullTerminatedString('utf8');

            if(fileName.length === 0) {
                break;
            }

            const entry: PackageEntry = {
                fileName,
                directoryName,
                typeName,
                crc32: reader.readUInt32LE(),
                smallDataSize: reader.readUInt16LE(),
                archiveIndex: reader.readUInt16LE(),
                offset: reader.readUInt32LE(),
                length: reader.readUInt32LE(),
                terminator: reader.readUInt16LE(),
                smallData: undefined
            };

            //console.log('entry =', entry);
            console.log(`${entry.directoryName}/${entry.fileName}.${entry.typeName}`);
            if (entry.terminator != 0xFFFF) {
                console.log('Invalid entry terminator =', entry.terminator);
                process.exit(1);
            }

            if(entry.smallDataSize > 0) {
                entry.smallData = reader.readBytes(entry.smallDataSize);
            }

            entries.push(entry);
        }
    }
}