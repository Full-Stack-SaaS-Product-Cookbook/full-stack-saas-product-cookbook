import { isLowerCase } from "../utils/isLowerCase";

export const convertCamelCaseToCapsCamelCase = (str: string): string => {
  return `${str[0].toUpperCase()}${str.slice(1, str.length)}`;
};

export const convertCamelCaseToCapsUnderscore = (str: string): string => {
  const capsStr = convertCamelCaseToCapsCamelCase(str);
  return [...capsStr].reduce((acc, cur) => {
    return `${acc}${isLowerCase(cur) ? cur.toUpperCase() : `_${cur}`}`;
  });
};

export const convertPropertyNameToActionConstName = (propertyName: string): string => {
  return `SET_${convertCamelCaseToCapsUnderscore(propertyName)}`;
};

export const convertPropertyNameToActionInterfaceName = (propertyName: string): string => {
  return `Set${convertCamelCaseToCapsCamelCase(propertyName)}Action`;
};

export const convertPropertyNameToActionFunctionName = (propertyName: string): string => {
  return `set${convertCamelCaseToCapsCamelCase(propertyName)}`;
};
