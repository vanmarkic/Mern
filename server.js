const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');



const app = express();

// Body Parser
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// DB config
const db = require('./config/keys').mongoURI;

// passport middleware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport);

// Connect to mongodb
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World!'))

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);



const port = process.env.PORT || 5002;

app.listen(port, () => console.log(`server running on port ${port}`));