import * as process from "node:process";
import * as console from "node:console";
import {Command} from '@commander-js/extra-typings';
import {VPKFile} from "./vpk-file.js";

const program = new Command()
    .option("-m, --mode <modeName>")
    .argument('<filePath>', 'Path to target file.');
program.parse(process.argv);
const options = program.opts();
const args = program.processedArgs;

const filePath = args[0];
const modeName = options.mode;

switch (modeName) {
    case 'vpk-dump':
        const vpkFile = new VPKFile(filePath);
        vpkFile.load();
        if(!vpkFile.isLoaded) {
            console.log('Vpk file not loaded.')
            process.exit(1);
        }
        console.log('header =', vpkFile.header);
        console.log('Entries: ');
        vpkFile.entries.forEach(entry => {
           console.log(`${entry.directoryName}/${entry.fileName}.${entry.typeName}`);
           console.log(` \\ from archive ${vpkFile.getArchiveFilePathByIndex(entry.archiveIndex)}`)
        });
        break;
}