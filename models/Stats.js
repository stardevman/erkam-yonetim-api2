const mongoose = require("mongoose");

const statsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: ["books", "authors", "categories", "users"],
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get count for a specific type
statsSchema.statics.getCount = async function (type) {
  const stats = await this.findOne({ type });
  return stats ? stats.count : 0;
};

// Static method to increment count
statsSchema.statics.incrementCount = async function (type, amount = 1) {
  const result = await this.findOneAndUpdate(
    { type },
    { $inc: { count: amount } },
    {
      new: true,
      upsert: true, // Create if doesn't exist
      runValidators: true,
    }
  );
  return result.count;
};

// Static method to decrement count
statsSchema.statics.decrementCount = async function (type, amount = 1) {
  const result = await this.findOneAndUpdate(
    { type },
    { $inc: { count: -amount } },
    {
      new: true,
      runValidators: true,
    }
  );

  // Ensure count doesn't go below 0
  if (result && result.count < 0) {
    result.count = 0;
    await result.save();
  }

  return result ? result.count : 0;
};

// Static method to set exact count
statsSchema.statics.setCount = async function (type, count) {
  const result = await this.findOneAndUpdate(
    { type },
    { count: Math.max(0, count) },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
  return result.count;
};

module.exports = mongoose.model("Stats", statsSchema);
