import { readSwaggerCore } from '../core';
import type { Swagger } from '../index';

const readSwagger = (path: string): Swagger | Error => {
    return readSwaggerCore(path);
};

export default readSwagger;
