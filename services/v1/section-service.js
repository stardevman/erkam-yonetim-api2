const Section = require("../../models/Section");

exports.getHomeSections = async () => {
  try {
    return Section.find().sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};

exports.updateHomeSection = async (id, updateData) => {
  try {
    const section = await Section.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!section) {
      throw new Error("Section not found");
    }
    return section;
  } catch (error) {
    throw error;
  }
};

exports.updateHomeSections = async (updateData) => {
  try {
    const updatePromises = updateData.map((item) =>
      Section.findByIdAndUpdate(item._id, { $set: item }, { new: true })
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
    return Section.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};
