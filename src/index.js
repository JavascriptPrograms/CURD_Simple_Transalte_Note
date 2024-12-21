const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const flash = require('express-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'atulya',
  database: 'translation'
});

if(connection){
  console.log('Database Connected...');
}else{
  console.log('Database Connection Failed...');
  process.exit();
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(flash());
// app.set('view cache', false);

app.use(session({
  cookie:{maxAge:2000},
  secret:'secret',
  resave:false,
  saveUninitialized: true,
}));


app.get('/', (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1; // Get the current page, default to 1
    const limit = 3; // Number of records per page
    const offset = (page - 1) * limit;
    
    connection.query('SELECT COUNT(*) AS count FROM new_transalte', (err, data) => {
      if(err) throw err;
      const totalUsers = data[0].count;
      const totalPages = Math.ceil(totalUsers / limit);
      // console.log(totalPages)
      connection.query(`SELECT * FROM new_transalte LIMIT ${limit} OFFSET ${offset}`, (err, users) => {
        if(err) throw err;
        res.render('index', {
          users: users,
          currentPage: page,
          totalPages: totalPages
        });
      });
    });
  }catch(err){
    console.log(err);
    res.render('pages/error_page',{err:err})
  }
});

app.get('/add_transalte',(req,res)=>{
    res.render('pages/add_translate',{ message: req.flash('message') });
})

app.post('/submit_transale',(req,res)=>{
    const Chapter_no = req.body.Chapter_no;
    const Structure_no = req.body.Structure_no;
    const Transalate = req.body.Transalate;

    console.log(Chapter_no+" "+Structure_no+" "+Transalate)
     const query = "INSERT INTO new_transalte (chapter_no, structure_no, translate) VALUES (?,?,?)";
     connection.query(query,[Chapter_no,Structure_no,Transalate],(err, result) => {
      if(err) {
        console.log(err);
        res.render('pages/error_page',{err:err})
      }else{
        console.log(result);
        req.flash('success','Successfully Add in Database.!!')
        res.redirect('/add_transalte')
      }
     });
})

app.get('/show_transalte',(req,res)=>{
  const page = parseInt(req.query.page) || 1; // Get the current page, default to 1
  const limit = 3; // Number of records per page
  const offset = (page - 1) * limit;

  connection.query('SELECT COUNT(*) AS count FROM new_transalte',(err, rows) => {
    if(err) throw err;
      const totalUsers = rows[0].count;
      const totalPages = Math.ceil(totalUsers / limit);
      // console.log(totalPages)
      connection.query(`SELECT * FROM new_transalte LIMIT ${limit} OFFSET ${offset}`, (err, data) => {
        if(err) throw err;
        res.render('pages/show_translate', {
          rows: data,
          currentPage: page,
          totalPages: totalPages,
          username:req.session.user
        });
    });
  });
});

app.get('/edit_transalte/:chapter_no',(req,res)=>{
  const chapter_no = req.params.chapter_no;
  const query = "SELECT * FROM new_transalte WHERE chapter_no=?";
  connection.query(query,[chapter_no],(err, rows) => {
    if(err) {
      console.log(err);
      res.render('pages/error_page',{err:err})
    }else{
      console.log(rows);
      res.render('pages/edit_translate',{row:rows})
    }
  });
});

app.post('/update_transalte/:chapter_no',(req,res)=>{
  const Structure_no = req.body.Structure_no;
  const Transalate = req.body.Transalate;
  // console.log(Structure_no+" "+Transalate);
  const chapter_no = req.params.chapter_no;
  const query = "UPDATE new_transalte SET structure_no=?, translate=? WHERE chapter_no=?";
  connection.query(query,[Structure_no,Transalate,chapter_no],(err, result) => {
    if(err) {
      console.log(err);
      res.render('pages/error_page',{err:err})
    }else{
      console.log(result);
      req.flash('success','Succesfully Update value in Database..!!')
      res.redirect('/show_transalte')
    }
  });
});

app.get('/delete_transalte/:chapter_no',(req,res)=>{
  const chapter_no = req.params.chapter_no;
  const query = "DELETE FROM new_transalte WHERE chapter_no=?";
  connection.query(query,[chapter_no],(err, result) => {
    if(err) {
      console.log(err);
      res.render('pages/error_page',{err:err})
    }else{
      console.log(result);
      req.flash('success','Successfully Delete from Database..!!')
      res.redirect('/show_transalte')
    }
  });
});


app.get('*',(req,res)=>{
  res.render('pages/page_not_found')
})

const PORT = 4000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




