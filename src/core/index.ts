import * as fs from 'fs';
import type { Swagger } from '../index';
export const readSwaggerCore = (path: string): Swagger | Error => {
    let swagger: Swagger;
    try {
        swagger = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
        return swagger;
    } catch (error) {
        return new Error('Error reading swagger file');
    }
};
