module.exports = async () => {
  if (process.env.UPDATE_FE) {
    console.log("Update FE");
    updateContractAddress();
    updateABI();
  }
};
