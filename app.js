const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose= require("mongoose");
const md5= require("md5");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-khush:test123@cluster0-f7rnm.mongodb.net/moneyManagerDB", {useNewUrlParser: true,useUnifiedTopology:true});

var expenditureSchema=new mongoose.Schema({
  date:String,
  amount:Number,
  reason:String,

})
var Expenditure=mongoose.model("Expenditure",expenditureSchema);

var userSchema=new mongoose.Schema({
  email:String,
  password:String,
  expenditures:[expenditureSchema],
  total:Number
})
var User = mongoose.model("User",userSchema);

var expenditures=[];


var total_expenditure=0;

app.get("/",function(req,res)
{
  res.render("home.ejs");
}
)

app.get("/login",function(req,res){
  res.render("login");
})

app.get("/register",function(req,res){
  res.render("register");
})

app.get("/manager", function(req, res){
Expenditure.find({},function(err,found){
  console.log(found.amount);
})
});

app.post("/register",function(req,res){
  initial_total=0;
  User.findOne({email:req.body.username},function(err,foundUser){
    if(err){console.log(err);}
    else{
      if(!foundUser)
      {
        const user=new User({
           email:req.body.username,
           password:md5(req.body.password),
           expenditures:expenditures,
           total:initial_total
        })
        user.save(function(err)
      {
        if(err){console.log(err);}
        else
        res.render("manager", {emailid:req.body.username,total_amount:user.total,expenditures:user.expenditures});
      })
      }
      else
      {
        res.redirect("/login");
      }
    }
  })
})

app.post("/login",function(req,res){
  
  const login_email=req.body.username;
  const login_password=req.body.password;

  User.findOne({email:login_email},function(err,foundUser){
    if(err){console.log(err);}
    else
    {
      if(foundUser)
      {
        if(foundUser.password===md5(login_password))
        {
            res.render("manager",{emailid:foundUser.email,total_amount:foundUser.total,expenditures:foundUser.expenditures});
        }
      }
      else
      {
        res.redirect("/login");
      }
    }
  })
})


var total=0;
app.post("/manager",function(req,res){
  var exp_date=req.body.date;
  var exp_amt=req.body.expenditure_amt;
  var exp_reason=req.body.reason;
  const loggedinuser=req.body.button;
  var expenditure=new Expenditure({
    date:exp_date,
    amount:exp_amt,
    reason:exp_reason
  })

User.findOne({email:loggedinuser},function(err,foundUser){
    foundUser.expenditures.push(expenditure);
    foundUser.total=foundUser.total+expenditure.amount;
    foundUser.save();
    res.render("manager",{emailid:foundUser.email,expenditures:foundUser.expenditures,total_amount:foundUser.total})

  })
});

let port = process.env.PORT;
if(port == null|| port == "")
{
 port=3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
