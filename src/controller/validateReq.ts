import type {
    Swagger,
    ValidPaths,
    RequestExpress,
    PathItems,
    Operation,
    Parameter,
    Reference,
    RequestBody,
    Schema,
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
                    validateQueryParams(operation.parameters, req);
                }
                if (operation.requestBody) {
                    validateRequestBody(operation.requestBody, req);
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

const validateQueryParams = (parameters: Array<Parameter | Reference>, { query }: RequestExpress): true | Error => {
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
                            if (!RegExp(parameter.schema.pattern).test(`${query[queryName]}`)) {
                                throw new Error(`${queryName} didn't match the pattern`);
                            }
                        } else if (parameter.schema.type) {
                            validateTypeParams(parameter.schema.type, `${query[queryName]}`);
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

const validateBodyJson = (swaggerValidBodySchema: Schema, value: any): void | Error => {
    const { type } = swaggerValidBodySchema;
    switch (type) {
        case 'string':
            if (swaggerValidBodySchema.pattern) {
                if (!RegExp(swaggerValidBodySchema.pattern).test(value)) {
                    throw Error(`${value} is not valid : ${swaggerValidBodySchema.pattern}`);
                }
            } else {
                if (typeof value !== 'string' || !RegExp(`[\s\S]*`).test(value)) {
                    throw new Error(`${value} didn't match the type string`);
                }
            }
            break;
        case 'number':
            if (swaggerValidBodySchema.pattern) {
                if (!RegExp(swaggerValidBodySchema.pattern).test(value)) {
                    throw Error(`${value} is not valid : ${swaggerValidBodySchema.pattern}`);
                }
            } else {
                if (typeof value !== 'number') {
                    throw new Error(`${value} didn't match the type number`);
                }
            }
            break;
        case 'boolean':
            if (swaggerValidBodySchema.pattern) {
                if (!RegExp(swaggerValidBodySchema.pattern).test(value)) {
                    throw Error(`${value} is not valid : ${swaggerValidBodySchema.pattern}`);
                }
            } else {
                if (typeof value !== 'boolean') {
                    throw new Error(`${value} didn't match the type boolean`);
                }
            }
            break;
        case 'object':
            if (swaggerValidBodySchema.properties) {
                const bodyKeys = Object.keys(value);
                const notValidProps = bodyKeys._missing(Object.keys(swaggerValidBodySchema.properties));
                if (notValidProps) {
                    throw Error(`${notValidProps} are not allowed`);
                }
                if (swaggerValidBodySchema.required) {
                    const missingRequiredProp = swaggerValidBodySchema.required._missing(bodyKeys);
                    if (missingRequiredProp) {
                        throw Error(`${missingRequiredProp} are required in body`);
                    }
                }
                for (const bodyKey of bodyKeys) {
                    validateBodyJson(swaggerValidBodySchema.properties[bodyKey], value[bodyKey]);
                }
            }
            break;
        default:
            throw Error(`${JSON.stringify(value)} is not valid`);
    }
};
const validateRequestBody = (swaggerValidBody: RequestBody | Reference, req: RequestExpress): true | Error => {
    const { body } = req;
    if (swaggerValidBody) {
        if (!body) {
            throw Error('Body is not parsed');
        }
        if ('$ref' in swaggerValidBody) {
            // TODO handle ref case
        } else {
            if (swaggerValidBody.required && Object.keys(body).length === 0) {
                throw Error('Body is required');
            }
            const appJson = swaggerValidBody.content['application/json'];
            if (appJson) {
                if ('$ref' in appJson.schema) {
                    // TODO handle ref case
                } else {
                    validateBodyJson(appJson.schema, body);
                }
            }
        }

        // check required prop
        // validate body based on schema
    }
    return true;
};
