import type {
    Swagger,
    ValidPaths,
    RequestExpress,
    PathItems,
    Operation,
    Parameter,
    Reference,
    RequestBody,
} from '../index';

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
                    validateQueryParams(operation.parameters, req.query);
                }
                if (operation.requestBody) {
                    validateRequestBody(operation.requestBody, req.body);
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

const validateTypeParams = (swaggerType: string, query: string): Error | true => {
    switch (swaggerType) {
        case 'string':
            if (!RegExp(`[\s\S]*`).test(query)) {
                throw new Error(`${query} didn't match the type`);
            }
            break;
        case 'number':
            if (!RegExp(`[0-9]*`).test(query)) {
                throw new Error(`${query} didn't match the type`);
            }
            break;
        case 'boolean':
            if (!['true', 'false'].includes(query)) {
                throw new Error(`${query} didn't match the type`);
            }
            break;
        default:
            throw new Error(
                `${query} not valid ${swaggerType} not a recognized type,
                 use type string and define your pattern instead`,
            );
    }
    return true;
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
                    if (parameter.schema) {
                        if (parameter.schema.pattern) {
                            if (!RegExp(parameter.schema.pattern).test(query[queryName])) {
                                throw new Error(`${queryName} didn't match the pattern`);
                            }
                        } else if (parameter.schema.type) {
                            validateTypeParams(parameter.schema.type, query[queryName]);
                        }
                    }
                    found = true;
                    break;
                }
            }
        }
        if (!found) throw new Error(`${queryName} not valid`);
    }
    return true;
};

const validateRequestBody = (swaggerValidBody: RequestBody | Reference, { body }: RequestExpress): true | Error => {
    if (swaggerValidBody) {
        // TODO handle ref case
        // check required prop
        // validate body based on schema
    }
    return true;
};
