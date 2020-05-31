import type { Swagger, ValidPaths, RequestExpress, PathItems, Operation } from '../index';

export const validPaths = (swagger: Swagger): ValidPaths => {
    const paths: ValidPaths = [[], []];
    for (const path in swagger.paths) {
        if (RegExp(/\/{.*}\//).test(path)) {
            const regExPath = path.replace(/{.*}/, '[-a-zA-Z0-9@:%_+.~#?&=]*');
            paths[0].push(regExPath);
            paths[1].push(swagger.paths[path]);
        } else {
            paths[0].push(path);
            paths[1].push(swagger.paths[path]);
        }
    }
    return paths;
};
export const validateReq = (validPaths: ValidPaths, req: RequestExpress): boolean => {
    let found = false;
    const [paths, pathsItems] = validPaths;
    for (let i = 0; i < paths.length; i++) {
        if (validateURL(paths[i], req.url)) {
            if (validateMethod(pathsItems[i], req.method)) {
                return (found = true);
            }
            return (found = false);
        }
    }

    return found;
};

const validateURL = (ValidPath: string, url: string): boolean => {
    const decodedURL = decodeURI(url);
    const regEx = new RegExp(`^${ValidPath}$`);
    return regEx.test(decodedURL);
};

const validateMethod = (validMethods: Record<string, PathItems>, method: string): Operation | null => {
    if (validMethods[method.toLocaleLowerCase()]) {
        return validMethods[method.toLocaleLowerCase()];
    } else {
        return null;
    }
};
