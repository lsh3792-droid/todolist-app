require('dotenv').config();
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger/swagger.json');
const { corsOptions } = require('./config/corsOptions');
const { errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
