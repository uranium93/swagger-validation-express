/*
@ Type Level 1
 */
export interface Swagger {
    openapi: string;
    info: Info;
    servers?: Array<Server>;
    paths: Record<string, Path>;
    components?: Record<string, Component>;
    security?: Array<Security>;
    tags?: Array<Tag>;
    externalDocs?: ExternalDocs;
}
/*
@ Type Level 2
 */
export interface Info {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: { name: string; url: string; email: string };
    license?: { name: string; url: string };
    version: string;
}
export interface Server {
    url: string;
    description?: string;
    variables?: ServerVariable; //@Level3
}
export interface Path {
    [path: string]: PathItems;
}
export interface Component {
    schemas?: Record<string, Schema | Reference>;
    responses?: Record<string, Response | Reference>;
    parameters?: Record<string, Parameter | Reference>;
    examples?: Record<string, Example | Reference>;
    requestBodies?: Record<string, RequestBody | Reference>;
    headers?: Record<string, Headers | Reference>;
    securitySchemes?: Record<string, Security | Reference>;
    links?: Record<string, string | Reference>;
    callbacks?: Record<string, Callback | Reference>;
}
export interface Security {
    [securityMechanism: string]: Array<string>;
}
export interface Tag {
    name: string;
    description?: string;
    externalDocs: ExternalDocs;
}
export interface ExternalDocs {
    url: string;
    description: string;
}
/*
@ Type Level 3
 */
export interface ServerVariable {
    enum?: Array<string>;
    default: string;
    description: string;
}
export interface PathItems {
    $ref?: string;
    summary?: string;
    description?: string;
    get?: Operation; //@Level4
    put?: Operation;
    post?: Operation;
    delete?: Operation;
    options?: Operation;
    head?: Operation;
    path?: Operation;
    trace?: Operation;
    servers: Array<Server>; //@Level2
    parameters?: Array<Parameter | Reference>; //@Level4
}
/*
@ Type Level 4
 */
export interface Operation {
    tags?: Array<string>;
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocs;
    operationId?: string;
    parameters?: Array<Parameter | Reference>;
    requestBody?: RequestBody | Reference;
    response?: Record<string, Response | Reference>;
    callback?: Array<string | Callback | Reference>;
    deprecated?: boolean;
    security?: Array<Security>; //@Level2
    servers?: Array<Server>; //@Level2
}
export interface Response {
    description: string;
    headers?: Record<string, { description?: string; schema: Schema }>;
    content?: Record<string, Media>;
    links?: Record<string, string | Reference>; // TODO correct if needed https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#linkObject
}
export interface Parameter {
    name: string;
    in: 'query' | 'headers' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
}
export interface Reference {
    $ref: string;
}
export interface RequestBody {
    description?: string;
    content: Array<string | Media>;
    required?: boolean;
}

export interface Callback {
    [expression: string]: PathItems;
}

export interface Media {
    schema?: Schema | Reference;
    example?: string;
    examples?: Array<string | Example | Reference>;
    encoding?: Array<string | Encoding>;
}
export interface Schema {
    nullable?: boolean;
    discriminator?: Discriminator;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XMLDocument; //TODO should be changed to : https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#xmlObject
    externalDocs?: ExternalDocs;
    example?: string;
    deprecated?: boolean;
}
export interface Discriminator {
    propertyName: string;
    mapping?: [string, string];
}

export interface Example {
    summary?: string;
    description?: string;
    value?: string;
    externalValue?: string;
}
export interface Encoding {
    contentType?: string;
    headers?: Record<string, Header | Reference>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

export interface Header {
    name: string;
    description?: string;
    externalDocs?: ExternalDocs;
}
// Swagger type ref: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#documentStructure

export type ValidPaths = [Array<string>, Array<Record<string, PathItems>>];
import type { Request, NextFunction } from 'express';
import type { Response as ResponseExpress } from 'express';
export type RequestExpress = Request;
type NextFunctionExpress = NextFunction;

///////////////////////////////// END OF TYPES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
import readSwagger from './controller/readSwagger';
import * as validateReq from './controller/validateReq';
const swagger: Swagger | Error = readSwagger('./swagger.json');
if ('message' in swagger) {
    console.log(swagger.message);
    throw swagger;
}
const validPaths: ValidPaths = validateReq.validPaths(swagger);
export const validate = (req: RequestExpress): true | Error => validateReq.validateReq(validPaths, req);
export const middleware = (req: RequestExpress, res: ResponseExpress, next: NextFunctionExpress): void => {
    try {
        validate(req);
        next();
    } catch (error) {
        res.status(401).json({ status: 'Rejected', message: error.message });
    }
};
