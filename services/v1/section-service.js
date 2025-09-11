const Section = require("../../models/Section");

exports.getHomeSections = async () => {
  try {
    return Section.find().sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};

exports.updateHomeSections = async (updateData) => { 
  try {
    const updatePromises = updateData.map(item => 
      Section.findByIdAndUpdate(
        item._id,
        { $set: item },
        { new: true }
      )
    );
    return Promise.all(updatePromises);
  } catch (error) {
    throw error;
  }
};