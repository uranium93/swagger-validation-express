import type { Swagger, ValidPaths } from '../index';

export const validPaths = (swagger: Swagger): ValidPaths => Object.keys(swagger.paths);
export const validatePath = (validPath: ValidPaths, path: string): boolean => {
    return validPath.includes(path);
};
