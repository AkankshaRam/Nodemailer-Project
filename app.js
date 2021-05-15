require("dotenv").config();
var nodemailer = require("nodemailer");
const express = require("express");
const multer = require("multer");           //middleware for handling multipart/form-data
const fs = require("fs");
const bodyParser = require("body-parser");


const app = express()


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(bodyParser.json());

var to;
var subject;
var body;
var path;


var Storage = multer.diskStorage({              //for storing files to disk
    destination: function(req, file, callback) {
        callback(null, "./excels")              //destination of the folder to which file has been saved
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
});

var upload = multer({             //Accept a single file with the name fieldname. The single file will be stored in req.file
    storage: Storage
}).single("excel"); //Field name and max count


app.use(express.static("public"));

app.get("/",(req,res) => {
    res.sendFile("/index.html")
});

app.post("/sendemail",(req,res) => {
    upload(req,res,function(err){
        if(err){
            console.log(err)
            return res.end("Something went wrong !");
        }else{
            to = req.body.to
            subject = req.body.subject
            body = req.body.body

            path = req.file.path


            console.log(to)
            console.log(subject)
            console.log(body)
            console.log(path)


            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASS
                }
              });

              var mailOptions = {
                from: process.env.EMAIL,
                to: to,
                subject:subject,
                text:body,
                attachments: [
                  {
                   path : path
                  }
               ]
              };

         transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  fs.unlink(path,function(err){                     //unlink() deletes a name from the filesystem if file already exist
                    if(err){
                        return res.end(err)
                    }else{
                        console.log("deleted")
                        return res.redirect("/result.html")
                    }
                  })
                }
              });
        }
    })
})



app.listen(3000,() => {
    console.log("App started on Port 3000 Successfully")
});
