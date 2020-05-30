// this file is for development purpose and will not be published to npm
import * as express from 'express';
import * as swaggerValidation from './lib';

const app = express();
const PORT = 2900;
app.use((req, res, next) => {
    if (swaggerValidation.validatePath(req.url)) {
        next();
    } else {
        res.status(401).json({ status: 'Rejected' });
    }

    //
});
app.post('/test', (req, res) => {
    res.json({ status: 'success' });
});
app.listen(PORT);
console.log('_____________/\\_________________');
console.log(`  server running at port ${PORT}`);
console.log('');
