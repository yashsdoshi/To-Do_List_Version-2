//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const _ = require('lodash');
mongoose.set('strictQuery',false);
mongoose.connect('mongodb://127.0.0.1:27017/To-Do_List');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const port = 3000

const ItemSchema = new mongoose.Schema({ name: { type: String, required: [true, 'Product name is required']}});
const ItemModel = mongoose.model('Item_List', ItemSchema)

const Item_1 = new ItemModel({name: 'Task-1'});
const Item_2 = new ItemModel({name: 'Task-2'});
const Item_3 = new ItemModel({name: 'Task-3'});
const DefaultItems = [Item_1, Item_2, Item_3];

const listschema = { name: String, items: [ItemSchema]};
const listmodel  = mongoose.model("list", listschema);

app.get('/', (req, res) => {
    ItemModel.find({}, function(err, foundItems){
        if(foundItems.length === 0){
            ItemModel.insertMany(DefaultItems, function(err){
                if(err){console.log(err);}
                else{console.log("Saved!");}
            });
            res.redirect("/");
        }else{
            res.render("lists", {listtitle: "Today", newitem: foundItems});
        }
    })
});

app.post("/", function(req, res){
    const itemname = req.body.newitem;
    const listname = req.body.list;
    const Item = new ItemModel({name:itemname});
    if(listname === "Today"){
        Item.save();
        res.redirect("/");
    }else{
        listmodel.findOne({name: listname}, function(err, foundlist){
            if(!foundlist){
                const list = new listmodel({name:listname, items: [Item]});
                list.save();
                res.redirect("/"+listname)
            }else{
                foundlist.items.push(Item);
                foundlist.save();
                res.redirect("/"+listname);
            }
        });
    }
});

app.get("/:customlink", function(req, res){
    const customlistname = _.capitalize(req.params.customlink);
    listmodel.findOne({name: customlistname}, function(err, foundlist){
        if(!err){
            if(!foundlist){
                const list = new listmodel({name:customlistname, items: DefaultItems});
                list.save();
                res.redirect("/"+customlistname)
            }
            else{
                res.render("lists",{listtitle: foundlist.name, newitem: foundlist.items})
            }
        }
    });
});

app.post("/delete", function(req, res){
    const checkeditem = req.body.checkbox;
    const listname = req.body.listname;
    if(listname === "Today"){
        ItemModel.findByIdAndRemove(checkeditem, function(err){
            if(!err){console.log("successfully deleted!"); 
            res.redirect("/");}
        });
    }else{
        listmodel.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkeditem}}}, function(err, foundlist){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

