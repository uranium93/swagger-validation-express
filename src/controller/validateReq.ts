import type { Swagger } from '../index';
export const validatePath = (swagger: Swagger, path: string): boolean => {
    const paths: Array<string> = Object.keys(swagger.paths);
    return paths.includes(path);
};
