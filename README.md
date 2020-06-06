# swagger-validation-express

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

use your swagger file as a validation for express application

### Tech

swagger-validation-express uses the open source definition of swagger to work properly:

-   [Swagger] - the official website
-   [OpenApi 3.0.0] - the module created based on version 3.0.0 definition

### Installation

swagger-validation-express:

> -requires [Node.js](https://nodejs.org/) v12+ to run as expected.
> -support typeScript
> -body should be parsed (use express.json() or body-parser)

**1- Installing the module**

```sh
$ npm i swagger-validation-express
```

or

```sh
$ yarn add swagger-validation-express
```

---

**2- Including the swagger file**
in this version the module is expecting the swagger file to be as json at root level

```sh
├── package.json
├── package-lock.json
├── README.md
├── server.js
├── settings.json
├── src
├── swagger.json   //the same level with server.js and with exact name swagger.json
└── tsconfig.json

```

**3-Use the middleware**
basicly theres two ways to use the module, one is flexible and the other is outside the box

```javascript
import * as express from 'express';
import * as swaggerValidation from 'swagger-validation-express';
const app = express();
const PORT = 2900;
app.use(express.json());
app.use(swaggerValidation.middleware); //using the module as the midlleware
app.post('/test', (req, res) => {
    res.json({ status: 'success' });
});
app.listen(PORT);
```

#### OR

```javascript
import * as express from 'express';
import * as swaggerValidation from 'swagger-validation-express';
const app = express();
const PORT = 2900;
app.use(express.json());
app.use((req, res, next) => {
    // add your own logic...
    try {
        swaggerValidation.validate(req);
        next();
    } catch (error) {
        res.status(401).json({ status: 'Rejected', message: error.message });
    }
});
app.post('/test', (req, res) => {
    res.json({ status: 'success' });
});
app.listen(PORT);
```

### Example

Lets use our swagger file : https://github.com/uranium93/swagger-validation-express/blob/development/swagger.json
and now lets try to send this request to our server

```curl
curl --location --request POST 'http://localhost:2900/service1/hjs/hold?query2=test&query1=111-dd-XRPW' \
--header 'Content-Type: application/json' \
--data-raw '{
    "key2": "string DATA",
    "record": {
        "subKey1": 12345,
        "subKey2": {
            "final": true,
            "script":"<script>some important scripts that should be allowed and well formated /script>"
        }
    }
}'
```

the request will be refused because script value didn't match the swagger pattern validation

```json
{
    "status": "Rejected",
    "message": "<script>some important scripts that should be allowed and well formated <script> is not valid : ^<script>.*</script>$"
}
```

### Development

Want to contribute? Great!

swagger-valdiation-express uses `typescript` for secure developing.
Make a change in your file and instantaneously see your updates!

Open your favorite Terminal and run these commands.

First Tab:

```sh
$ git clone git@github.com:uranium93/swagger-validation-express.git
```

Second Tab:

```sh
$ cd swagger-valdiation-express
```

Third:

```sh
$ npm install
```

Fourth:

```sh
$ npm run dev
```

to run the development server

[//]: # "These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax"
[dill]: https://github.com/joemccann/dillinger
[git-repo-url]: https://github.com/joemccann/dillinger.git
[john gruber]: http://daringfireball.net
[df1]: http://daringfireball.net/projects/markdown/
[markdown-it]: https://github.com/markdown-it/markdown-it
[ace editor]: http://ace.ajax.org
[node.js]: http://nodejs.org
[twitter bootstrap]: http://twitter.github.com/bootstrap/
[openapi 3.0.0]: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
[@tjholowaychuk]: http://twitter.com/tjholowaychuk
[express]: http://expressjs.com
[swagger]: https://swagger.io/
[gulp]: http://gulpjs.com
[pldb]: https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md
[plgh]: https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md
[plgd]: https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md
[plod]: https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md
[plme]: https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md
[plga]: https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md
