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
    const updatePromises = updateData.map((item) =>
      Section.findOneAndUpdate({ uniqueName: item.uniqueName }, { $set: item }, { new: true })
    );
    return Promise.all(updatePromises);
  } catch (error) {
    throw error;
  }
};

exports.createHomeSection = async (sectionData) => {
  try {
    const newSection = new Section(sectionData);
    return newSection.save();
  } catch (error) {
    throw error;
  }
};

exports.deleteHomeSection = async (id) => {
  try {
    return Section.findOneAndDelete({ uniqueName: id });
  } catch (error) {
    throw error;
  }
};
