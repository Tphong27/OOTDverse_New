const Setting = require("../models/setting");

exports.getRoleIdByName = async (roleName) => {
  try {
    const roleSetting = await Setting.findOne({
      name: roleName,
      type: "role",
      status: "Active",
    });
    return roleSetting ? roleSetting._id : null;
  } catch (error) {
    console.error(`Error finding role ID for ${roleName}:`, error);
    return null;
  }
};