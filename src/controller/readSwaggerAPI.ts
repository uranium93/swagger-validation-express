import readSwagger from '../core/readSwagger';
import type { Swagger } from '../index';

const readSwaggerAPI = (path: string): Swagger | Error => {
    return readSwagger(path);
};

export default readSwaggerAPI;
