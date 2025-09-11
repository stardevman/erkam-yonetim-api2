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
