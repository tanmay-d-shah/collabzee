import express, { Application, Request, Response } from 'express';
import ondc from './routes/ondc.js';
import ondc_site_verification from './routes/ondc_site_verification.js'

const app: Application = express();
const port: number = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World with TypeScript!');
});

app.use('/ondc', ondc);

app.use('/ondc-site-verification.html', ondc_site_verification)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});