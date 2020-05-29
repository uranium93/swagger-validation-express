import * as fs from 'fs';
const readSwagger = (path: string): Record<string, unknown> | Error => {
    let swagger: Record<string, unknown>;
    try {
        swagger = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }));
        console.log(swagger);
        return swagger;
    } catch (error) {
        console.log(error);
        return new Error('Error reading swagger file');
    }
};

export default readSwagger;
