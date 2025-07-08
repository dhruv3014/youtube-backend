import multer from "multer";
// Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
// NOTE: Multer will not process any form which is not multipart (multipart/form-data).

const storage = multer.diskStorage({

  // destination is used to determine within which folder the uploaded files should be stored. If no destination is given, the operating system's default directory for temporary files is used.
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },

  // filename is used to determine what the file should be named inside the folder. If no filename is given, each file will be given a random name that doesn't include any file extension.
  // Note: Multer will not append any file extension for you, your function should return a filename complete with a file extension.
  filename: function (req, file, cb) {
    cb(null, file.originalname)
    console.log(file);
    
  }
})

export const upload = multer({ 
    storage, // or storage: storage
})