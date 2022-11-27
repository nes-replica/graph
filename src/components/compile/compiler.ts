import ts, {CreateProgramOptions} from "typescript";
import VirtualHost from "./VirtualHost";
import ScriptTarget = ts.ScriptTarget;

const compilerHost: VirtualHost = new VirtualHost({
  'test.ts': `
    function printNumber(x: number): void {
      console.log(x.toString());
    }
    printNumber(1);
  `
});

const createOptions: CreateProgramOptions = {
  rootNames: ['test.ts'],
  options: {},
  host: compilerHost,
  oldProgram: undefined,
};

const program = ts.createProgram(createOptions);
const testTSResult = program.emit(compilerHost.getSourceFile('test.ts', ScriptTarget.ES2022))

console.log(testTSResult)

for (let filename in compilerHost.writtenFiles) {
  console.log(filename);
  console.log(compilerHost.writtenFiles[filename])
}