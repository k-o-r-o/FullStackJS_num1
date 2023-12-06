var express = require('express');
var bodyParser = require('body-parser');
var app = express();

require('dotenv').config();

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({extended: true }));

var personSchema = mongoose.Schema({
	lastName: {
		type: String,
		required: true 
	},
	firstName: String,
	dateOfBirth: String,
	address1: String,
	address2: String,
	city: String,
	postalCode: String,
	country: String,
	phone: String,
	email: {
		type: String,
		required: true, 
		unique: true, 
		validate: {
			validator: function(v) {
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
			},
			message: props => `${props.value} is not a valid email address!`
		}
	},
	notes: String
});

var Person = mongoose.model("Person", personSchema);

app.post('/persons', function (req, res) {
	var personInfo = req.body;

	var newPerson = new Person({
		lastName: personInfo.lastName,
		firstName: personInfo.firstName,
		dateOfBirth: personInfo.dateOfBirth,
		address1: personInfo.address1,
		address2: personInfo.address2,
		city: personInfo.city,
		postalCode: personInfo.postalCode,
		country: personInfo.country,
		phone: personInfo.phone,
		email: personInfo.email,
		notes: personInfo.notes
	});

	newPerson.save()
		.then(() => {
			res.redirect('/persons');
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.get('/persons', function (req, res) {
	Person.find({})
		.then(persons => {
			res.render('persons', { persons: persons || [] });
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.get('/update/:id', function (req, res) {
	const personId = req.params.id;

	Person.findById(personId)
		.then(person => {
			res.render('update', { person: person });
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.put('/update/:id', function (req, res) {
	const personId = req.params.id;

	Person.findByIdAndUpdate(personId, req.body)
		.then(updatedPerson => {
			res.redirect('/persons');
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.post('/update/:id', function (req, res) {
	const personId = req.params.id;
	const updatedPersonInfo = req.body;

	Person.findByIdAndUpdate(personId, updatedPersonInfo)
		.then(updatedPerson => {

			res.redirect('/persons');
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.post('/delete/:id', function (req, res) {
	const personId = req.params.id;

	Person.findOneAndDelete({ _id: personId })
		.then(() => {
			res.redirect('/persons');
		})
		.catch(err => {
			res.render('error', { error: 'Database error: ' + err.message });
		  });
});

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', function (req, res) {
	res.render("form");
});

app.use(express.static('public'));

app.listen(8080);