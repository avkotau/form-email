const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    fs = require('file-system'),
    exphbs = require('express-handlebars'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    dataFile = 'tasks.json',
    end = express();
end.highScores = undefined;

let urlencodedParser = bodyParser.urlencoded({ extended: false });

end.use(bodyParser.urlencoded({extended: false}));
end.use(bodyParser.json());
end.use(morgan('common'));
end.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

let highScores = {score:2};

// Installing the engine
end.engine('handlebars', exphbs());
end.set('view engine', 'handlebars');

// Static folder
end.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
end.use(bodyParser.urlencoded({ extended: false }));
end.use(bodyParser.json());

    end.get('/', (req, res) => {
        res.render('contact', {layout: false, favicon: false});
        const highScores = end.highScores;
    });

end.post('/send', (req, res) => {

    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>
      <li>Name: ${req.body.name}</li>
      <li>Faculty: ${req.body.faculty}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
      <li>Right answer: ${highScores.score}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
    `;

// create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'sashulya.kotov.20000@mail.ru', // generated ethereal user
            pass: ''  // put this your password
        },
        tls:{
            rejectUnauthorized:false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Nodemailer Contact" <sashulya.kotov.20000@mail.ru>', // sender address
        to: 'sashulya.kotov.20000@mail.ru', // list of receivers
        subject: 'Node Contact Request', // Subject line
        text: 'Hello world?', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        });
        res.end('The message has been successfully sent');

    });
});

function getTasksFromDB() {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));//read the contents of the file, return to the frontend
}

function setTasksToDB(highScores) {
    fs.writeFileSync(dataFile, JSON.stringify(highScores));
}

end.listen(3000, () => console.log(`Server started...`));