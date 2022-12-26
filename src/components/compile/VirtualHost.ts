import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";

const nullCancellationToken = new class implements ts.CancellationToken {
  isCancellationRequested(): boolean {
    return false;
  }

  throwIfCancellationRequested(): void {
  }
}();

function isNodeModulesPath(filename: string): boolean {
  return filename.startsWith("/node_modules")
}

function realNodeModules(filename: string): string {
  return path.resolve(__dirname + "/../../.." + filename);
}


export default class VirtualHost implements ts.CompilerHost {
  private readonly sourceFiles: Record<string, string>;

  constructor(sourceFiles: Record<string, string>) {
    this.sourceFiles = sourceFiles;
  }

  directoryExists(directoryName: string): boolean {
    if (directoryName.startsWith("/node_modules")) {
      const actualPath = realNodeModules(directoryName)
      console.debug(`resolving directory as ${actualPath}`)
      return fs.existsSync(actualPath)
    }
    for (let filename in this.sourceFiles) {
      if (filename.startsWith(directoryName + '/')) {
        return true;
      }
    }
    console.warn(`requested directory does not exists`)
    return false;
  }

  fileExists(fileName: string): boolean {
    if (isNodeModulesPath(fileName)) {
      return fs.existsSync(realNodeModules(fileName));
    }
    if (fileName in this.sourceFiles) {
      return true;
    }
    console.warn(`requested file does not exists: ${fileName}`)
    return false;
  }

  readDirectory(rootDir: string, extensions: readonly string[], excludes: readonly string[] | undefined, includes: readonly string[], depth?: number): string[] {
    throw new Error("not implemented")
  }

  getDirectories(file: string): string[] {
    if (isNodeModulesPath(file)) {
      const modulesPath = realNodeModules(file);
      const files = fs.readdirSync(modulesPath);
      const directories = files.filter(name => fs.lstatSync(path.resolve(modulesPath, name)).isDirectory());
      console.debug(`got directories for ${file} from node_modules: ${directories}`);
      return directories;
    }
    console.log('getDirectories', arguments)
    return [];
  }

  readFile(fileName: string): string | undefined {
    console.log('readFile', arguments)
    if (fileName.startsWith("/node_modules")) {
      return fs.readFileSync(realNodeModules(fileName), "utf-8")
    }
    if (fileName in this.sourceFiles) {
      return this.sourceFiles[fileName];
    }
    console.warn(`requested file ${fileName} not found`);
    return undefined;
  }

  writtenFiles: Record<string, string> = {};

  writeFile(fileName: string, text: string, writeByteOrderMark: boolean, onError: ((message: string) => void) | undefined, sourceFiles: readonly ts.SourceFile[] | undefined, data: ts.WriteFileCallbackData | undefined): void {
    this.writtenFiles[fileName] = text;
  }

  createHash(data: string): string {
    throw new Error('createHash not implemented');
  }

  getCancellationToken(): ts.CancellationToken {
    console.warn('getCancellationToken is somehow implemented')
    return nullCancellationToken;
  }

  getCanonicalFileName(fileName: string): string {
    return fileName;
  }

  getCurrentDirectory(): string {
    return "/";
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return "/node_modules/typescript/lib/lib.d.ts";
  }

  getDefaultLibLocation(): string {
    return "/node_modules/typescript/lib";
  }

  getEnvironmentVariable(name: string): string | undefined {
    console.warn(`getEnvironmentVariable is not really implemented`);
    return undefined;
  }

  getModuleResolutionCache(): ts.ModuleResolutionCache | undefined {
    console.warn(`getModuleResolutionCache is not really implemented`);
    return undefined;
  }

  getNewLine(): string {
    return "\n";
  }

  getParsedCommandLine(fileName: string): ts.ParsedCommandLine | undefined {
    console.warn('not implemented getParsedCommandLine', arguments)
    return undefined;
  }

  createdSourceFiles: Record<string, ts.SourceFile> = {};

  getSourceFile(fileName: string, languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
    if (shouldCreateNewSourceFile) {
      throw new Error("dont know how to create source file (getSourceFile(" + arguments.toString() + "))")
    }
    if (!(fileName in this.createdSourceFiles)) {
      const file = this.readFile(fileName);
      if (file) {
        this.createdSourceFiles[fileName] = ts.createSourceFile(fileName, file, languageVersionOrOptions);
      } else {
        throw new Error("file not found: " + fileName);
      }
    }
    return this.createdSourceFiles[fileName];
  }

  getSourceFileByPath(fileName: string, path: ts.Path, languageVersionOrOptions: ts.ScriptTarget | ts.CreateSourceFileOptions, onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile | undefined {
    console.warn('not implemented getSourceFileByPath', arguments)
    return undefined;
  }

  realpath(path: string): string {
    console.warn('not implemented realpath', path);
    return path;
  }

  resolveModuleNames(moduleNames: string[], containingFile: string, reusedNames: string[] | undefined, redirectedReference: ts.ResolvedProjectReference | undefined, options: ts.CompilerOptions, containingSourceFile?: ts.SourceFile): (ts.ResolvedModule | undefined)[] {
    console.warn('not implemented resolveModuleNames', arguments)
    return [];
  }

  resolveTypeReferenceDirectives(typeReferenceDirectiveNames: string[] | readonly ts.FileReference[], containingFile: string, redirectedReference: ts.ResolvedProjectReference | undefined, options: ts.CompilerOptions, containingFileMode?: ts.SourceFile["impliedNodeFormat"] | undefined): (ts.ResolvedTypeReferenceDirective | undefined)[] {
    console.warn('not implemented resolveTypeReferenceDirectives', arguments)
    return [];
  }

  trace(s: string): void {
    console.trace('compiler host:', s)
  }

  useCaseSensitiveFileNames(): boolean {
    return true;
  }
}