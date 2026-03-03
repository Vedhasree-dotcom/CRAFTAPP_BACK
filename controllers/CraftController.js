const Craft = require("../models/Craft");
const User = require("../models/User");



//  GET all crafts
 
exports.getAllCrafts = async (req, res) => {
  try {
    const crafts = await Craft.find();
    res.json(crafts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch crafts" });
  }
};


  // GET /api/crafts/category/:category
 
exports.getCraftsByCategory = async (req, res) => {
  try {
    const crafts = await Craft.find({
      category: req.params.category.trim(),
    });
    res.json(crafts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category crafts" });
  }
};


//  GET /api/crafts/:id
 
exports.getCraftById = async (req, res) => {
  try {
    const craft = await Craft.findById(req.params.id);
    if (!craft) {
      return res.status(404).json({ message: "Craft not found" });
    }
    res.json(craft);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch craft" });
  }
};



  // POST /api/crafts/find
 
exports.findCraftsByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const filename = req.file.originalname.toLowerCase();

    let detectedMaterials = [];

    if (filename.includes("paper")) detectedMaterials.push("paper");
    if (filename.includes("paint")) detectedMaterials.push("paint");
    if (filename.includes("glue")) detectedMaterials.push("glue");
    if (filename.includes("home-decor")) detectedMaterials.push("home-decor");
    if (filename.includes("clay")) detectedMaterials.push("clay");
    if (filename.includes("knitting")) detectedMaterials.push("knitting");

    if (detectedMaterials.length === 0) {
      return res.json({ results: [] });
    }

   const crafts = await Craft.find({
    materials: { $all: detectedMaterials }
  });

    res.json({ results: crafts });

  } catch (err) {
    console.error("Image Find error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.toggleSaveCraft = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const craftId = req.params.id;

    const alreadySaved = user.savedCrafts.some(
      (id) => id.toString() === craftId
    );

    if (alreadySaved) {
      user.savedCrafts = user.savedCrafts.filter(
        (id) => id.toString() !== craftId
      );
    } else {
      user.savedCrafts.push(craftId);
    }

    await user.save();

    return res.json({
      message: alreadySaved ? "Craft unsaved" : "Craft saved",
      savedCrafts: user.savedCrafts,
    });

  } catch (error) {
    console.error("SAVE ERROR:", error);  
    return res.status(500).json({ message: "Server error" });
  }
};


//  CREATE craft (Admin only)
exports.createCraft = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      materials,
      tutorialVideo,
      tutorialSteps,
    } = req.body;

    // Check main craft image
    if (!req.files?.image || !req.files.image[0]) {
      return res.status(400).json({ message: "Craft main image is required" });
    }

    // Parse JSON fields
    const parsedMaterials = materials ? JSON.parse(materials) : [];
    const parsedSteps = tutorialSteps ? JSON.parse(tutorialSteps) : [];

    // Attach step images if uploaded
    if (req.files?.stepImages) {
      req.files.stepImages.forEach((file, index) => {
        if (parsedSteps[index]) parsedSteps[index].image = `/uploads/${file.filename}`;
      });
    }

    const craft = new Craft({
      title,
      description,
      price,
      category,
      materials: parsedMaterials,
      image: `/uploads/${req.files.image[0].filename}`, // main craft image
      tutorialVideo,
      tutorialSteps: parsedSteps,
    });

    await craft.save();
    res.status(201).json(craft);
  } catch (err) {
    console.error("Create craft error:", err);
    res.status(400).json({ message: "Failed to create craft" });
  }
};

//  UPDATE craft (Admin only)
exports.updateCraft = async (req, res) => {
  try {
    const craft = await Craft.findById(req.params.id);
    if (!craft) return res.status(404).json({ message: "Craft not found" });

    const {
      title,
      description,
      price,
      category,
      materials,
      tutorialVideo,
      tutorialSteps,
    } = req.body;

    craft.title = title || craft.title;
    craft.description = description || craft.description;
    craft.price = price || craft.price;
    craft.category = category || craft.category;
    craft.tutorialVideo = tutorialVideo || craft.tutorialVideo;

    // Parse materials
    if (materials) craft.materials = JSON.parse(materials);

    // Parse tutorial steps
    const parsedSteps = tutorialSteps
      ? JSON.parse(tutorialSteps)
      : craft.tutorialSteps;

    // Attach/update step images if uploaded
    if (req.files?.stepImages) {
      req.files.stepImages.forEach((file, index) => {
        if (parsedSteps[index]) parsedSteps[index].image = `/uploads/${file.filename}`;
      });
    }

    craft.tutorialSteps = parsedSteps;

    // Update main craft image if uploaded
    if (req.files?.image && req.files.image[0]) {
      craft.image = `/uploads/${req.files.image[0].filename}`;
    }

    await craft.save();
    res.json(craft);

  } catch (err) {
    console.error("Update craft error:", err);
    res.status(400).json({ message: "Failed to update craft" });
  }
};

//  DELETE craft
exports.deleteCraft = async (req, res) => {
  try {
    const craft = await Craft.findById(req.params.id);
    if (!craft) return res.status(404).json({ message: "Craft not found" });

    await craft.deleteOne();
    res.json({ message: "Craft deleted successfully" });
  } catch (err) {
    console.error("Delete craft error:", err);
    res.status(500).json({ message: "Failed to delete craft" });
  }
};