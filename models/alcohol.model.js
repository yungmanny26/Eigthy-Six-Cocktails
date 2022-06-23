const { Schema, model } = require("mongoose");


const cocktailsSchema = new Schema(
  {
    // title: {type: String, unique: true},
     title: String,
     glass: String,
    category: String,
    ingredient:String,
    measure:String,

    
    
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true
  }
);

// instead of typing mongoose.model(), we can just say model() beacuse we destructured "model"
// variable in line 4



module.exports = model("cocktails", cocktailsSchema);
