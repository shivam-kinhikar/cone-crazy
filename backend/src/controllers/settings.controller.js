const Settings = require('../models/Settings');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await Settings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private (Admin Only)
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
      await settings.save();
    } else {
      settings = await Settings.findOneAndUpdate({}, req.body, { new: true, runValidators: true });
    }
    res.status(200).json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
