import type { Swagger, ValidPaths, RequestExpress } from '../index';

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
export const validatePath = (validPaths: ValidPaths, req: RequestExpress): boolean => {
    let found = false;
    const decodedURL = decodeURI(req.url);
    const [paths, pathsItems] = validPaths;
    for (let i = 0; i < paths.length; i++) {
        const regEx = new RegExp(`^${paths[i]}$`);
        if (regEx.test(decodedURL)) {
            if (pathsItems[i][req.method.toLocaleLowerCase()]) {
            } else {
                return (found = false);
            }
            return (found = true);
        }
    }

    return found;
};
