const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const ld = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static('public'));

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true );
mongoose.connect("mongodb+srv://sdw1011:Hubham@10@cluster0.nulpb.mongodb.net/toDoListDB", function(err){
    if (err) throw err;
    else console.log("Succesfuly connected");
});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "welcome to my todo app"
})
const item2 = new Item({
    name: "Add an item "
})
const item3 = new Item({
    name: "delete an item"
})

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];


app.get("/", function(req,res){

    var day = date.getDay();


    Item.find({}, function(err, foundItems){

        if ( foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if (err) throw err;
                else console.log("Successfully added default items.");
            })
            res.redirect("/");
        } else {
        res.render("list", {
            listTitle: day,
            newListItem: foundItems
        });
        }
    })
    
});

app.get("/:customToDoList", (req,res) => {
    const listName = ld.capitalize(req.params.customToDoList);


    List.findOne({name: listName}, (err, foundItem)=> {
        if (!err) {
            if(!foundItem){
                const list = new List({
                    name: listName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + list.name);
            } else {
                res.render("list", {
                    listTitle: foundItem.name,
                    newListItem: foundItem.items
                });
            }
        }
    })

})

app.post("/", function(req,res){
    var itemName = req.body.newItem;
    const listTitle = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listTitle === date.getDay()){
        item.save();
        res.redirect("/");  
    } else {
        List.findOne({name: listTitle}, (err, foundList)=> {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listTitle);
        })
    }
})

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === date.getDay()) {
        Item.findByIdAndRemove(checkedItemId, (err)=> {
            if (!err) {
                console.log("succesfully deleted item");
            }
        })
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList)=> {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }
    
})


app.listen(3000, function(){
    console.log("Server is running on port 3000");
});