const Listing= require("../models/listing");

module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.newForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showForm= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate(
      {
        path:"reviews",
        populate:{
          path:"author"
        }
      })
      .populate("owner");
    if(!listing){
      req.flash("error","Not existed");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createForm= async (req, res, next) => {

  let url= req.file.path;
  let filename=req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image={url,filename};
  await newListing.save(); // Save to the database

  req.flash("success", "New listing registered");
  res.redirect("/listings");
};

module.exports.editForm = async(req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Not existed");
    res.redirect("/listings");
  }
  let originalImage=listing.image.url;
  newImage=originalImage.replace("/upload","/upload/h_300/w_250");
  res.render("listings/edit.ejs", { listing,newImage });
};

module.exports.updateForm= async (req, res) => {
  let { id } = req.params;
  let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if(typeof req.file !=="undefined"){
    let url= req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
  }

  req.flash("success","Listing updated");
  res.redirect(`/listings/${id}`);
};

// module.exports.search= async(req,res)=>{
//   let {id}=req.params;
// }

module.exports.deleteForm= async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
};