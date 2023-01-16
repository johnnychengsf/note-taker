const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');

//const PORT = 3001;
const PORT = 9413;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(express.static('public'));

// Promise version of fs.readFile
const readFromFile = util.promisify(fs.readFile);

// GET Route for retrieving all the tips
app.get('/api/notes', (req, res) => {
   //console.info(`${req.method} request received for notes`);
   readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
 });
// delete note
 app.delete('/api/notes/:id', (req, res) => {
   let noteString = JSON.stringify(req.body);
   console.log(req.params.id);
   fs.readFile(`./db/db.json`, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
         const notes = JSON.parse(data);
         //console.log(notes);
         let pos = -1;
         let removeNote = {};
         for (let i = 0;i < notes.length; i++) {
            console.log(req.params.id + ", " + notes[i].id);
            if (req.params.id == notes[i].id) {
               pos = i;
               removeNote = notes[i];
               console.log("match!!!");
               break;
            }
         }
         if (pos >= 0) {
            notes.splice(pos, 1);
            console.log(notes);
            noteString = JSON.stringify(notes);
            fs.writeFile(`./db/db.json`, noteString, (err) =>
            err
               ? console.error(err)
               : console.log(
                  `Note for ${removeNote.id} has been deleted from JSON file`
                  )
            );
         }
      }
   });
   
   const response = {
      status: 'success',
      body: noteString,
    };

    console.log(response);
    res.status(201).json(response);
 });

 // save note
 app.post('/api/notes', (req, res) => {
    const noteString = JSON.stringify(req.body);
    fs.readFile(`./db/db.json`, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const notes = JSON.parse(data);
        req.body.id = uuid();
        notes.push(req.body);
        console.log(req.body);


        fs.writeFile(`./db/db.json`, JSON.stringify(notes), (err) =>
        err
          ? console.error(err)
          : console.log(
              `Note for ${req.body.title} has been written to JSON file`
            )
        );
      }
    });
    
    const response = {
      status: 'success',
      body: noteString,
    };

    console.log(response);
    res.status(201).json(response);
 });

// GET Route for homepage
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for retrieving all the Note
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/notes.html'))
});
 
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
