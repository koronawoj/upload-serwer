const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        let random = Math.floor(Math.random() * 1000);
        let filename = (file.fieldname + random + '-' + Date.now() + path.extname(file.originalname)).toLowerCase()
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 5242880},
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).array('file', 10);


function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /pdf|jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Wrong file type! Try pdf|jpg|png|gif');
    }
}

exports.addImages = function (req, res, next) {
    upload(req, res, (err) => {
        if (err) {
            res.send({
                msg: err
            });
        } else {
            if (!req.files.length) {
                res.send({
                    msg: 'Error: No Files Selected!'
                });
            } else {
                let addedFiles = req.files.map((elem) => `uploads/${elem.filename}`)

                let update = {files: [...req.user.files, ...addedFiles]};
                let query = {'email': req.user.email};
                User.findOneAndUpdate(query, update, (err) => {
                    if (err) return res.send(500, {error: err});
                    next();
                    // return res.send({
                    //     msg: 'File Uploaded!',
                    //     addedFiles
                    // });
                });
            }
        }
    });
}
exports.resized = function (req, res, next) {
    req.files.forEach(elem => {
        if(elem.filename.slice(-3) !== "pdf"){
            sharp(elem.path).resize(200, 200).toFile(`./public/resized/uploads/${elem.filename}`);
        }
    })

    res.send({
        msg: 'No file found.'
    });
}

exports.deleteImage = function (req, res, next) {
    fs.exists(`./public/resized/uploads/${req.params.id}`, function(exists) {
        if(exists) {
            fs.unlink(`./public/resized/uploads/${req.params.id}`,function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
        }
    });
    fs.exists(`./public/uploads/${req.params.id}`, function(exists) {
        if(exists) {
            fs.unlink(`./public/uploads/${req.params.id}`,function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully');
            });
        }
    });
    let newFilesArr = req.user.files.filter(elem => elem !== 'uploads/' + req.params.id)
    if (req.user.files.length === newFilesArr.length) {
        res.send({
            msg: 'No file found.'
        });
    } else {
        let update = {files: newFilesArr};
        let query = {'email': req.user.email};

        User.findOneAndUpdate(query, update, (err) => {
            if (err) return res.send(500, {error: err});
            return res.send({
                msg: 'Files Uploaded!'
            });
        });
    }
}

exports.getFiles = function (req, res, next) {
    let filesArr = req.user.files;
    return res.send({
        files: filesArr
    });
}

