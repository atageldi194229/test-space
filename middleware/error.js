const { ErrorResponse } = require("../utils");

const error = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Sequelize Error
  if (err.name === "SequelizeDatabaseError") {
    if (err.original.code === "ER_NO_SUCH_TABLE")
      error = new ErrorResponse("Error no such table in db", 500);
    else error = new ErrorResponse("DB Error", 500);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    // err,
  });
};

module.exports = error;
