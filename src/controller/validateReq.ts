import type { Swagger, ValidPaths } from '../index';

export const validPaths = (swagger: Swagger): ValidPaths => {
    const paths: ValidPaths = [];
    for (const path in swagger.paths) {
        if (RegExp(/\/{.*}\//).test(path)) {
            const regExPath = path.replace(/{.*}/, '[-a-zA-Z0-9@:%_+.~#?&=]*');
            paths.push(regExPath);
        } else {
            paths.push(path);
        }
    }
    return paths;
};
export const validatePath = (validPaths: ValidPaths, url: string): boolean => {
    let found = false;
    const decodedURL = decodeURI(url);
    for (const validPath of validPaths) {
        const regEx = new RegExp(`^${validPath}$`);
        if (regEx.test(decodedURL)) return (found = true);
    }
    return found;
};
