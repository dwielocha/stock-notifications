import * as nodemailer from 'nodemailer';
import hbs = require('nodemailer-express-handlebars');
import SMTPTransport = require('nodemailer/lib/smtp-transport');

const config: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === '1',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    debug: process.env.MAILER_DEBUG === '1',
};

const mailer = nodemailer.createTransport(config);

mailer.use(
    'compile',
    hbs({
        viewEngine: {
            partialsDir: './src/templates',
            layoutsDir: './src/templates',
            defaultLayout: false,
        },
        viewPath: './src/templates',
    }),
);

export { mailer };
