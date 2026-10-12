const generateApplicationId = () => {
  const year = new Date().getFullYear();

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `IEM${year}${randomNumber}`;
};

module.exports = generateApplicationId;