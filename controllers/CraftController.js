const Craft = require("../models/Craft");


//  GET all crafts
  // GET /api/crafts
 
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


//  GET single craft details
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
 
exports.findCraftsByMaterial = async (req, res) => {
  try {
    const materials = JSON.parse(req.body.materials || "[]");

    if (!materials.length) {
      return res.status(400).json({ message: "Materials required" });
    }

    const crafts = await Craft.find({
      materials: { $in: materials },
    });

    res.json({ results: crafts });
  } catch (err) {
    console.error("FindCraft error:", err);
    res.status(500).json({ message: "Internal server error" });
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

    if (!req.file) {
      return res.status(400).json({ message: "Craft image is required" });
    }

    const craft = new Craft({
      title,
      description,
      price,
      category,
      materials: JSON.parse(materials),
      image: `/uploads/${req.file.filename}`,
      tutorialVideo,
      tutorialSteps: tutorialSteps ? JSON.parse(tutorialSteps) : [],
    });

    await craft.save();
    res.status(201).json(craft);
  } catch (err) {
    console.error("Create craft error:", err);
    res.status(400).json({ message: "Failed to create craft" });
  }
};
