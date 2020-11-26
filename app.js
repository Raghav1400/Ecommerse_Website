var express=require("express");
var app=express();
var mysql = require('mysql');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
var bcrypt =require('bcryptjs');
var cookieParser =require("cookie-parser");
dotenv.config({path: './detail.env'});

app.set("view engine","ejs");
app.use(express.static(__dirname+"public"));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());

var connection = mysql.createConnection({
    host     : process.env.DATABASE_HOST,
    user     : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : process.env.DATABASE,
    insecureAuth : true
  });
  connection.connect(function(err) {
    if (err) {
      console.log(err);
      return;
    }
    console.log("msql connected");
  });


app.get("/login",function(req,res){
    var t=0;
    res.render("login.ejs",{t:t});
})
app.post("/login", async function(req,res){
    try {
        var email = req.body.email;
        var password = req.body.password;
        // console.log(email);
        // console.log(password);
        if(!email || !password){
            var t=4;
            return res.render("login",{t:t});
        }

        connection.query("SELECT * FROM users WHERE email=?",[email],async function(err,rows){
            if(!rows || !(await bcrypt.compare(password , rows[0].password))){
                var t=1;
                res.render("login",{t:t});
            }else{
                //console.log(rows);
                var id= rows[0].id;
                var token = jwt.sign({id: id}, process.env.JWT_SECRET,{
                    expiresIn: "90d" 
                });

               // console.log("the token is: "+token);

                const cookieOption = {
                    expire: new Date(
                        Date.now() +process.env.JWT_COOKIE_EXPIRES *24*60*60*1000
                    ),
                    httpOnly: true
                };
                res.cookie("jwt",token ,cookieOption);
                //var t=5;//means logedin
                connection.query("select * from category",function(err,rows,fields){
                    //console.log(rows);
                    var t=3;
                    res.render("index.ejs",{rows:rows,t:t});
                })
                
            }
        })
    } catch (error) {
        console.log(err);
    }
})
app.get("/signup",function(req,res){
    var t=0;
    res.render("signup.ejs",{t:t});
})
app.post("/signup",function(req,res){
    const name= req.body.name;
    const email= req.body.email;
    const password= req.body.password;
    const passwordC= req.body.passwordConfirm;
    connection.query("SELECT email from users where email = ?",  [email],async function(err,rows){
        if(err){
            console.log(err);
        }
        if(rows.length>0){
            var t=1;
            return res.render("signup",{t:t});
        }else if(password !==passwordC){
            var t=2;
            return res.render("signup",{t:t});
        }



        let hashpassword = await bcrypt.hash(password, 8);
        //console.log(hashpassword);

        connection.query("INSERT INTO users SET ?",{name: name ,password: hashpassword, email:email}, function(err,rows){
            if(err){
                console.log(err);
            }else{
                console.log(rows);
                var t=3;
                return res.render("signup",{t:t}); 
            }
        })
    });
})

app.get("/logout",function(req,res){
    res.clearCookie('jwt');
    connection.query("select * from category",function(err,rows,fields){
        //console.log(rows);
        var t=1;
        res.render("index.ejs",{rows:rows,t:t});
    })
})

app.get("/",function(req,res){
    connection.query("select * from category",function(err,rows,fields){
        //console.log(rows);
        var t=1;
        res.render("index.ejs",{rows:rows,t:t});
    })
})

app.get("/:ob",function(req,res){
    if(req.url==="/candies"){
        connection.query("select * from products where cid='3' ",function(err,rows,fields){
            //console.log(rows);
            var token = req.cookies.jwt;
            try {
                var t=3;
                var decoded =jwt.verify(token,process.env.JWT_SECRET);
                res.render("products.ejs",{rows:rows,t:t});
                //res.render("checkout.ejs",{rows:rows});
            } catch (error) {
                    var t=1;
                    res.render("products.ejs",{rows:rows,t:t});
            }
            // res.render("products.ejs",{rows:rows});
        })
    }
    if(req.url==="/utensils"){
        console.log("uten");
        connection.query("select * from products where cid='2' ",function(err,rows,fields){
            //console.log(rows);
            var token = req.cookies.jwt;
            try {
                var t=3;
                var decoded =jwt.verify(token,process.env.JWT_SECRET);
                res.render("products.ejs",{rows:rows,t:t});
                //res.render("checkout.ejs",{rows:rows});
            } catch (error) {
                    var t=1;
                    res.render("products.ejs",{rows:rows,t:t});
            }
            //res.render("products.ejs",{rows:rows});
        })
    }
    if(req.url==="/shoes"){
        connection.query("select * from products where cid='1' ",function(err,rows,fields){
            //console.log(rows);
            var token = req.cookies.jwt;
            try {
                var t=3;
                var decoded =jwt.verify(token,process.env.JWT_SECRET);
                res.render("products.ejs",{rows:rows,t:t});
                //res.render("checkout.ejs",{rows:rows});
            } catch (error) {
                    var t=1;
                    res.render("products.ejs",{rows:rows,t:t});
            }
            //res.render("products.ejs",{rows:rows});
        })
    }
    if(req.url==="/watches"){
        connection.query("select * from products where cid='4' ",function(err,rows,fields){
            //console.log(rows);
            var token = req.cookies.jwt;
            try {
                var t=3;
                var decoded =jwt.verify(token,process.env.JWT_SECRET);
                res.render("products.ejs",{rows:rows,t:t});
                //res.render("checkout.ejs",{rows:rows});
            } catch (error) {
                    var t=1;
                    res.render("products.ejs",{rows:rows,t:t});
            }
            //res.render("products.ejs",{rows:rows});
        })
    }
})

app.get("/:product/buy/:id",function(req,res){
    var j=(req.params.id);
    console.log(req);
    connection.query("SELECT * FROM products WHERE pid = ?",[j], function (err, rows) {
        if(err){
            console.log(err);
        }else{
            var token = req.cookies.jwt;
            try {
                var decoded =jwt.verify(token,process.env.JWT_SECRET);
                res.render("checkout.ejs",{rows:rows});
            } catch (error) {
                    var t=0;
                    //console.log(error);
                    res.render("login",{t:t});
                    //prompt("u r not looged in");
            }
            
        }
        
      });
    
})

app.post("/:product/buy/:id",function(req,res){
    const firstName= req.body.firstName;
    const lastName= req.body.lastName;
    const email= req.body.email;
    const pid= req.body.pid;
    connection.query("SELECT * FROM users WHERE email=?",[email],async function(err,rows){
        const cid =rows[0].id;
        connection.query("INSERT INTO orders SET ?",{cid: cid ,pid:pid, email:email}, function(err,r){
            if(err){
                console.log(err);
            }else{
                    console.log("sucessfully ordered");
                    connection.query("select * from category",function(err,rows,fields){
                    var t=3;
                    res.render("index.ejs",{rows:rows,t:t});
                })
            }
        })
    })
    
   //res.redirect("/");
    
})


app.get("/signup",function(req,res){
    res.render("signup.ejs");
})
app.listen(14,function(){
    console.log("App has started!! ");
});