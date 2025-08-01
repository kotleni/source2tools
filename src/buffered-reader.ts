import * as fs from 'fs';
// Note: 'Buffer' is a global type in Node.js, so no import is needed for it.

/**
 * A class for reading binary data from a file buffer in a sequential manner.
 * It loads the entire file into an in-memory Buffer for efficient reading.
 */
export class BufferedReader {
    private readonly buffer: Buffer;
    private offset: number = 0;

    /**
     * Creates a new BufferedReader instance by reading a file into memory.
     * @param filePath The path to the file to read.
     */
    constructor(filePath: string) {
        this.buffer = fs.readFileSync(filePath);
    }

    /**
     * Checks if the reader has reached the end of the buffer.
     * @returns {boolean} True if no more bytes can be read.
     */
    public isEOF(): boolean {
        return this.offset >= this.buffer.length;
    }

    /**
     * Returns the total size of the buffer in bytes.
     * @returns {number}
     */
    public getTotalSize(): number {
        return this.buffer.length;
    }

    /**
     * Returns the number of bytes read so far.
     * @returns {number}
     */
    public getBytesRead(): number {
        return this.offset;
    }

    /**
     * Returns the number of bytes remaining in the buffer.
     * @returns {number}
     */
    public getRemaining(): number {
        return this.buffer.length - this.offset;
    }

    /**
     * Moves the read cursor to a specific offset.
     * @param offset The absolute position to move the cursor to.
     */
    public seek(offset: number): void {
        if (offset < 0 || offset > this.buffer.length) {
            throw new Error(`Seek offset ${offset} is out of bounds.`);
        }
        this.offset = offset;
    }

    /**
     * Skips a specified number of bytes.
     * @param bytes The number of bytes to skip (can be negative).
     */
    public skip(bytes: number): void {
        this.seek(this.offset + bytes);
    }

    /**
     * Ensures that there are enough bytes remaining to read. Throws an error if not.
     * @param byteCount The number of bytes required.
     * @private
     */
    private ensureBytes(byteCount: number): void {
        if (this.offset + byteCount > this.buffer.length) {
            throw new Error(`Attempt to read past end of buffer. Needed ${byteCount} bytes, but only ${this.getRemaining()} available.`);
        }
    }

    // --- Integer Reading Methods ---

    public readByte(): number { return this.readUInt8(); }
    public readUInt8(): number {
        this.ensureBytes(1);
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }

    public readInt8(): number {
        this.ensureBytes(1);
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }

    public readUInt16LE(): number {
        this.ensureBytes(2);
        const value = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    public readUInt16BE(): number {
        this.ensureBytes(2);
        const value = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        return value;
    }

    public readInt16LE(): number {
        this.ensureBytes(2);
        const value = this.buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
    }
    public readInt16BE(): number {
        this.ensureBytes(2);
        const value = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return value;
    }

    public readUInt32LE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    public readUInt32BE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    public readInt32LE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return value;
    }
    public readInt32BE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return value;
    }

    public readBigUInt64LE(): bigint {
        this.ensureBytes(8);
        const value = this.buffer.readBigUInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    public readBigUInt64BE(): bigint {
        this.ensureBytes(8);
        const value = this.buffer.readBigUInt64BE(this.offset);
        this.offset += 8;
        return value;
    }

    public readBigInt64LE(): bigint {
        this.ensureBytes(8);
        const value = this.buffer.readBigInt64LE(this.offset);
        this.offset += 8;
        return value;
    }
    public readBigInt64BE(): bigint {
        this.ensureBytes(8);
        const value = this.buffer.readBigInt64BE(this.offset);
        this.offset += 8;
        return value;
    }

    // --- Floating Point Reading Methods ---

    public readFloatLE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
    }
    public readFloatBE(): number {
        this.ensureBytes(4);
        const value = this.buffer.readFloatBE(this.offset);
        this.offset += 4;
        return value;
    }

    public readDoubleLE(): number {
        this.ensureBytes(8);
        const value = this.buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
    }
    public readDoubleBE(): number {
        this.ensureBytes(8);
        const value = this.buffer.readDoubleBE(this.offset);
        this.offset += 8;
        return value;
    }

    // --- Buffer/String Reading Methods ---

    /**
     * Reads a specified number of bytes into a new Buffer.
     * @param length The number of bytes to read.
     * @returns {Buffer}
     */
    public readBytes(length: number): Buffer {
        this.ensureBytes(length);
        const slice = this.buffer.subarray(this.offset, this.offset + length);
        this.offset += length;
        return slice;
    }

    /**
     * Reads a fixed-length string.
     * @param length The number of bytes that make up the string.
     * @param encoding The character encoding (e.g., 'utf-8', 'ascii').
     * @returns {string}
     */
    public readString(length: number, encoding: BufferEncoding = 'utf8'): string {
        this.ensureBytes(length);
        const value = this.buffer.toString(encoding, this.offset, this.offset + length);
        this.offset += length;
        return value;
    }

    /**
     * Reads a null-terminated string.
     * @param encoding The character encoding.
     * @returns {string} The string, without the null terminator.
     */
    public readNullTerminatedString(encoding: BufferEncoding = 'utf8'): string {
        const nullPos = this.buffer.indexOf(0x00, this.offset);
        if (nullPos === -1) {
            throw new Error("Could not find null terminator.");
        }
        const length = nullPos - this.offset;
        const str = this.readString(length, encoding);
        this.skip(1); // Skip the null byte itself
        return str;
    }
}