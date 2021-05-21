import { Project, SourceFile } from "ts-morph";
import Constants from "../constants/Constants";
import ApiErrorMessage from "../enums/ApiErrorMessage";
import Primitive from "../enums/Primitive";
import {
  convertCamelCaseToCapsCamelCase,
  convertCamelCaseToCapsUnderscore,
} from "../helpers/StringHelpers";
import IGenerated from "../interfaces/IGenerated";
import ITypeScriptProperty from "../interfaces/ITypeScriptProperty";
import { isLowerCase } from "../utils/isLowerCase";

export default class ASTService {
  private readonly project: Project;
  private readonly statePrefix: string;
  private readonly stateProperties: Array<ITypeScriptProperty>;
  private readonly typesFile: SourceFile;
  private readonly reducersFile: SourceFile;
  private readonly actionsFile: SourceFile;

  constructor(stateCode: string) {

    // create initial file from passed state code - this is the start of the types file
    this.project = new Project({
      useInMemoryFileSystem: true
    });
    this.typesFile = this.project.createSourceFile(
      Constants.TYPES_FILE_NAME,
      stateCode
    );

    // run all validations
    this.runValidations()

    this.statePrefix = this.typesFile
      .getInterfaces()[0]
      .getName()
      .replace("State", "");

    this.stateProperties = this.typesFile
      .getInterfaces()[0]
      .getProperties()
      .map((propertySignature) => {
        return {
          name: propertySignature.getName(),
          type: propertySignature.getType().getText() as Primitive,
        };
      });

    // throw if the state properties do not include exclusively primitives
    if (
      !this.stateProperties.every((stateProperty) =>
        Constants.PRIMITIVES.includes(stateProperty.type)
      )
    ) {
      throw new Error(
        ApiErrorMessage.ONLY_CERTAIN_PRIMITIVES_SUPPORTED_IN_STATE
      );
    }

    this.reducersFile = this.project.createSourceFile(
      Constants.REDUCERS_FILE_NAME,
      `import { SourceFile } from 'ts-morph'`
    );
    this.actionsFile = this.project.createSourceFile(
      Constants.ACTIONS_FILE_NAME,
      `import { SourceFile } from 'ts-morph'`
    );
  }

  public generate(): IGenerated {

    // generate all files
    this.generateTypesFile();
    this.generateReducersFile();
    this.generateActionsFile();

    // return their source code!
    return {
      files: [
        {
          fileLabel: Constants.TYPES_FILE_NAME,
          code: this.typesFile.getFullText(),
        },
        {
          fileLabel: Constants.REDUCERS_FILE_NAME,
          code: this.reducersFile.getFullText(),
        },
        {
          fileLabel: Constants.ACTIONS_FILE_NAME,
          code: this.actionsFile.getFullText(),
        },
      ],
    };
  }

  private runValidations(): void {
    // throw if syntax errors
    if (this.typesFile.getPreEmitDiagnostics().length > 0) {
      throw new Error(ApiErrorMessage.FIX_SYNTAX_ERRORS);
    }
    
    // throw if multiple interfaces found
    if (this.typesFile.getInterfaces().length !== 1) {
      throw new Error(ApiErrorMessage.ONE_INTERFACE_LIMIT);
    }

    // throw if state interface name does not include 'State'
    if (!this.typesFile.getInterfaces()[0].getName().includes("State")) {
      throw new Error(ApiErrorMessage.STATE_IDENTIFIER_IN_INTERFACE_REQUIRED);
    }

    // throw if state interface name is not capitalized
    if (isLowerCase(this.typesFile.getInterfaces()[0].getName()[0])) {
      throw new Error(ApiErrorMessage.STATE_NAME_MUST_BE_CAPITALIZED);
    }

    // throw if there are more than 5 properties
    if (this.typesFile
      .getInterfaces()[0]
      .getProperties().length > 5) {
        throw new Error(ApiErrorMessage.MAX_FIVE_PROPERTIES_ALLOWED_IN_STATE);
    }
  }

  private generateTypesFile() {
    // we're appending to the existing state, so a new line for formatting here:
    this.typesFile.addStatements("\n");

    // adding const action declarations
    this.stateProperties.forEach((stateProperty) => {
      this.typesFile.addStatements(
        this.generateActionConst(stateProperty.name)
      );
    });

    this.typesFile.addStatements("\n");

    // adding action interfaces
    this.stateProperties.forEach((stateProperty) => {
      this.typesFile.addStatements(this.generateActionInterface(stateProperty));
    });

    this.typesFile.addStatements("\n");

    // adding combined action type (union of the action interfaces)
    this.typesFile.addStatements(this.generateActionTypeUnion());
  }

  private async generateReducersFile() {
    // generate the initial state (default values for primitives for now)
    this.reducersFile.addStatements(this.generateInitialState());

    this.reducersFile.addStatements("\n");

    // add reducer
    this.reducersFile.addStatements(this.generateReducer());

    // fix and organize imports
    this.reducersFile.fixMissingImports();
    this.reducersFile.organizeImports();
  }

  private async generateActionsFile() {
    // for each type create an action function
    this.stateProperties.forEach((stateProperty) => {
      this.actionsFile.addStatements(this.generateActionFunction(stateProperty));
    });

    // fix and organize imports
    this.actionsFile.fixMissingImports();
    this.actionsFile.organizeImports();
  }

  private generateActionConst(propertyName: string): string {
    const actionConstant = this.getActionConst(propertyName);
    return `export const ${actionConstant} = '${actionConstant}'`;
  }

  private generateActionInterface(property: ITypeScriptProperty): string {
    return `
export interface ${this.getActionInterfaceName(property.name)} {
  type: typeof ${this.getActionConst(property.name)}
  payload: {
    ${property.name}: ${property.type}
  }
}
`;
  }

  private getInitialPropertyStatements(): string {
    return this.stateProperties
      .map((stateProperty) => {
        return `  ${stateProperty.name}: ${this.getDefaultInitialPropertyValues(
          stateProperty.type
        )},`;
      })
      .join("\n");
  }

  private getDefaultInitialPropertyValues(type: Primitive): string {
    switch (type) {
      case Primitive.number:
      case Primitive.bigint:
        return "0";
      case Primitive.boolean:
        return "false";
      case Primitive.string:
        return "''";
      case Primitive.symbol:
        return "Symbol('')";
      case Primitive["string[]"]:
        return "[]";
      case Primitive["number[]"]:
      case Primitive["bigint[]"]:
        return "[]";
      case Primitive["boolean[]"]:
        return "[]";
      default:
        return "''";
    }
  }

  private generateActionTypeUnion(): string {
    return `export type ${this.getActionUnionTypeName()} = ${this.stateProperties
      .map((property) => this.getActionInterfaceName(property.name))
      .join(" | ")}`;
  }

  private generateInitialState(): string {
    return `
export const ${this.getInitialStateName()}: ${this.getStateName()} = {
${this.getInitialPropertyStatements()}   
}`;
  }

  private generateReducerCaseStatements(): string {
    return (
      this.stateProperties
        .map((stateProperty) => {
          return `    case ${this.getActionConst(stateProperty.name)}:
      return {
        ...state,
        ${stateProperty.name}: action.payload.${stateProperty.name}
      }
`;
        })
        .join("\n") +
      `    default:
      return state`
    );
  }

  private generateReducer(): string {
    return `
export function ${
      this.getReducerName()
    }(state = ${this.getInitialStateName()}, action: ${this.getActionUnionTypeName()}): ${this.getStateName()} {
  switch (action.type) {
${this.generateReducerCaseStatements()}
  }
}`;
  }

  private generateActionFunction(property: ITypeScriptProperty): string {
    return `
export function ${this.getActionFunctionName(property.name)}(${
      property.name
    }: ${property.type}): ${this.getActionUnionTypeName()} {
  return {
    type: ${this.getActionConst(property.name)},
    payload: {
      ${property.name}
    }
  } as const
}
`;
  }

  // remaining functions are simple formatters prefix / suffix

  private getActionConst(propertyName: string): string {
    return `SET_${convertCamelCaseToCapsUnderscore(propertyName)}`;
  }

  private getActionInterfaceName(propertyName: string): string {
    return `Set${convertCamelCaseToCapsCamelCase(propertyName)}Action`;
  }

  private getActionFunctionName(propertyName: string): string {
    return `set${convertCamelCaseToCapsCamelCase(propertyName)}`;
  }

  private getActionUnionTypeName(): string {
    return `${convertCamelCaseToCapsCamelCase(this.statePrefix)}ActionTypes`;
  }

  private getReducerName(): string {
    return `${this.statePrefix}Reducer`;
  }

  private getStateName(): string {
    return `${convertCamelCaseToCapsCamelCase(this.statePrefix)}State`;
  }

  private getInitialStateName(): string {
    return `initial${convertCamelCaseToCapsCamelCase(this.statePrefix)}State`;
  }
}
