import * as fs from 'fs';
import type { Swagger } from '../index';
const readSwagger = (path: string): Swagger | Error => {
    let swagger: Swagger;
    try {
        swagger = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
        console.log(swagger);
        return swagger;
    } catch (error) {
        console.log(error.message);
        return new Error('Error reading swagger file');
    }
};

export default readSwagger;
