// this file is for development purpose and will not be published to npm
import * as express from 'express';
import * as swaggerValidation from './lib';

const app = express();
const PORT = 2900;
swaggerValidation;
app.listen(PORT);
console.log('_____________/\\_________________');
console.log(`  server running at port ${PORT}`);
console.log('');
