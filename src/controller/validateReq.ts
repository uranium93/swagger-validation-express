import type { Swagger, ValidPaths, RequestExpress, PathItems, Operation, Parameter, Reference } from '../index';

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
export const validateReq = (validPaths: ValidPaths, req: RequestExpress): true | Error => {
    const [paths, pathsItems] = validPaths;
    const requestMethod = req.method;
    const requestURL = req.url;
    for (let i = 0; i < paths.length; i++) {
        if (validateURL(paths[i], requestURL)) {
            const operation: Operation | null = validateMethod(pathsItems[i], requestMethod);
            if (operation) {
                if (operation.parameters) {
                    return validateQueryParams(operation.parameters, req.query);
                }
                return true;
            }
            throw new Error(`Method ${requestMethod} not valid`);
        }
    }

    throw new Error(`Url ${requestURL} is not valid`);
};

const validateURL = (ValidPath: string, url: string): boolean => {
    const decodedURL = decodeURI(url);
    const regEx = new RegExp(`^${ValidPath}([?]{1}[-a-zA-Z0-9]+[=]{1}[-a-zA-Z0-9@:%_+.~#?&=]*)*$`);
    return regEx.test(decodedURL);
};

const validateMethod = (validMethods: Record<string, PathItems>, method: string): Operation | null => {
    if (validMethods[method.toLocaleLowerCase()]) {
        return validMethods[method.toLocaleLowerCase()];
    } else {
        return null;
    }
};

const validateQueryParams = (parameters: Array<Parameter | Reference>, query: Record<string, any>): true | Error => {
    const queryKeys = Object.keys(query);
    for (const parameter of parameters) {
        if ('$ref' in parameter) {
            // TODO #3 handle ref case
        } else {
            if (parameter.in === 'query' && parameter.required && !queryKeys.includes(parameter.name)) {
                throw new Error(`${parameter.name} is required`);
            }
        }
    }
    for (const queryName in query) {
        let found = false;
        for (const parameter of parameters) {
            if ('$ref' in parameter) {
                // TODO #3 handle ref case
            } else {
                if (queryName === parameter.name) {
                    // TODO #4 validate param value based on schema
                    found = true;
                    break;
                }
            }
        }
        if (!found) throw new Error(`${queryName} not valid`);
    }
    return true;
};
