import CodeGeneratorService from "./services/CodeGeneratorService"

const stateCode = `export interface ReduxPlateState {
    myString: string
}`

const run = async () => {
    const codeGeneratorService = new CodeGeneratorService(stateCode);
    const files = await codeGeneratorService.generate()
    files.files.forEach(file => {
        console.log(`------${file.fileLabel}------`)
        console.log(file.code)
    })
}
run();