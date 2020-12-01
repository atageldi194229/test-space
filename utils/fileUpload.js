let uploadedFile = req.files.uploadedFile;
uploadedFile.mv("./uploadedFiles/" + uploadedFile.name);
res.json({
  message: "File is uploaded",
  data: {
    name: uploadedFile.name,
    mimetype: uploadedFile.mimetype,
    size: uploadedFile.size,
  },
});
