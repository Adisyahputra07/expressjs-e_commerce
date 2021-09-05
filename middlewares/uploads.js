const multer = require("multer");

module.exports = (imageFile) => {
  //create file Uploads
  const storage = multer.diskStorage({
    // tempat file yang telah di upload
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    //tentang name di hapus spasinya
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
    },
  });

  // memfilter file format
  const fileFilter = function (req, file, cb) {
    // pengecekan file
    if (file.filename === imageFile) {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|jpeg|png|PNG)$/)) {
        req.fileValidationError = {
          message: "Only image files are allowed!",
        };
        // jika tidak cocok kirim error
        return cb(new Error("Only image files are allowed!"), false);
      }
    }
    cb(null, true);
  };

  // memnutukan ukuran file
  const sizeInMb = 10;
  const maxSize = sizeInMb * 1000 * 1000;

  // todo ini function nya
  const upload = multer({
    storage, // diambil dari var storage
    fileFilter, //diambil dari var fileFilter
    limits: {
      fileSize: maxSize, // diambil dari maxSize
    },
  }).single(imageFile); // todo bisa jadi satu file

  //proses uploads
  return function (req, res, next) {
    // todo disini jalan kan nya
    upload(req, res, function (err) {
      // if (req.fileValidationError) {
      //   req.session.message = {
      //     type: 'danger',
      //     message: 'Please select file to upload',
      //   };
      //   return res.redirect(req.originalUrl);
      // }

      //if error kirimkan pesan error
      if (err) {
        //kalau ukuran file berlebih tampilakan ini//
        if (err.code == "LIMIT_FILE_SIZE") {
          req.session.message = {
            type: "danger",
            message: "Error, Max file size 10MB",
          };
          return res.redirect(req.originalUrl);
        }

        // ini pesan selain ukuran file lebih
        req.session.message = {
          type: "danger",
          message: err,
        };
        return res.redirect(req.originalUrl);
      }

      return next();
    });
  };
};
