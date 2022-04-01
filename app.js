const express = require("express");
const bodyParser = require("body-parser");
const { response } = require("express");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view-engine','ejs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://dannyisfree:No2Mqz0jyZ304X5g@cluster0.hpyyo.mongodb.net/listdb');

// const items = [];
const workItems = [];

const itemSchema = new mongoose.Schema({
        name:String
});

const Item = new mongoose.model("item", itemSchema);

const listSchema = new mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const List = new mongoose.model("list",listSchema);


const buyFood = new Item({
    name:"Buy food"
});

const cookFood = new Item({
    name:"Cook food"
});

const eatFood = new Item({
    name:"Eat food"
});

const defaultItems = [buyFood,cookFood,eatFood];


app.get("/", function(req,res)
{
    Item.find(function(error,listItems){
        if(listItems.length == 0)
        {
            Item.insertMany(defaultItems,function(error)
            {
            if(error)
                console.log(error)
            else
                console.log("Added successfully");
            });
        }
        res.render("list.ejs",{listTitle:"Home", userAddedItems: listItems}); 
    });

});

app.post("/", function(req,res)
{   
    const listTitle = req.body.listTitle;
    if(listTitle == "Home")
    {
        const newUserItem = new Item({
            name: req.body.newItem
        });
        newUserItem.save();
        res.redirect("/");
    }
    else
    {
        List.findOne({name:listTitle},function(error,foundList)
        {
            const newUserItem = new Item({
                name: req.body.newItem
            });
            foundList.items.push(newUserItem);
            foundList.save();
            res.redirect("/"+listTitle);
        });
    }
});

let port = process.env.PORT; //code snippet from heroku docs. 
if (port == null || port == "") { //If app is not on heroku server, you can connect via port 3000
  port = 3000;
}

app.listen(port, function()
{
    console.log("Server started");
});

app.post("/delete",function(req,res)
{
    const listTitle= req.body.listTitle;
    const checkedItemID = req.body.checkedItemID;
    if(listTitle == "Home")
    {
        Item.findByIdAndRemove(checkedItemID,function(error)
        {
            if (error)
                console.log(error)
            else
                console.log("Removed successfully");
        });
        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:checkedItemID}}}, function(error,foundList)
        {
            if(error)
            {
                console.log(error);
            }
            res.redirect("/"+listTitle);
        });
    }
});

app.get("/about",function(req,res)
{
    res.render("about.ejs")
});

app.get("/:paramName", function(req,res)
{
    const newListName = _.capitalize(req.params.paramName);
    
    const newList = new List({
        name:newListName,
        items:defaultItems
    });
    List.findOne({name:newListName},function(error, foundList)
    {
        if(!error)
        {
            if(!foundList)
            {
                console.log("No list found. Creating new list...");
                newList.save();
                res.redirect("/"+newListName);
            }
            else
            {
                console.log("List found.");
                res.render("list.ejs",{listTitle:foundList.name,userAddedItems:foundList.items});
            }      
        }
        else
        console.log(error)
    });
});