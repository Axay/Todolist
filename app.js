//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-akshay:Akshay%4010@cluster0.nnuyu0l.mongodb.net/todolistDB');

const itemsSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model('item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist'
});

const item2 = new Item({
  name: 'Click the + buttom to add a new item'
});

const item3 = new Item({
  name: ' <-- Hit this box to delete an item'
});

const defaultItems = [item1, item2, item3];


const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get("/", function(req, res) {

  

  Item.find({}).then(function(foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems);
    }else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }  
  });
});


app.get("/:customListName", function(req, res){
  const customListame = _.capitalize(req.params.customListName);
  List.findOne({name: customListame}).then(function(foundLists){
    if(!foundLists){
      const list = new List({
        name: customListame,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customListame);
    } else{
      res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items});
    }
  })

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

  const item = new Item({
    name: itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkedItem).then(function() {
      console.log("Successfully deleted checked item.");
      res. redirect("/");
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem }}}).then(function(){
      console.log("Item deleted!");
      res.redirect("/"+listName);
    });
  }

  
});




// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });







app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
  console.log("Server is running on port 3000.");
});

