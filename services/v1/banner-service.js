const Banner = require("../../models/Banner");

exports.getBanners = async () => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    return banners;
  } catch (error) {
    console.error("Error fetching banner items:", error);
    throw new Error("Failed to fetch banner items");
  }
};

exports.createBanner = async (bannerData) => {
  try {
    const newBanner = new Banner(bannerData);
    return newBanner.save();
  } catch (error) {
    console.error("Error creating banner:", error);
    throw new Error("Failed to create banner");
  }
};

exports.updateBanner = async (id, updateData) => {
  try {
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedBanner) {
      throw new Error("Banner not found");
    }

    return updatedBanner.toObject();
  } catch (error) {
    console.error("Error updating banner:", error);
    throw new Error("Failed to update banner");
  }
};

exports.deleteBanner = async (id) => {
  try {
    const deletedBanner = await Banner.findByIdAndDelete(id);
    if (!deletedBanner) {
      throw new Error("Banner not found");
    }

    // Remove banner reference from associated section
    const Section = require("../../models/Section");
    await Section.deleteOne({ relatedId: deletedBanner._id });

    return deletedBanner.toObject();
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error("Failed to delete banner");
  }
};
