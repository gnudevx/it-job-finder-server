import JobsGroup from "../models/jobsGroup.model.js";

export const getAllJobGroups = async () => {
  return await JobsGroup.find({});
};

export const getJobsByGroup = async (groupName) => {
  return await JobsGroup.findOne({ group: groupName });
};
