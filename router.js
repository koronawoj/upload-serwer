const Authentication = require('./controllers/authentication');
const ImagesUpload = require('./controllers/imagesUpload');
const passportService = require('./services/passport');
const passport = require('passport');


const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignin = passport.authenticate('local', { session: false });

module.exports = function(app) {

    app.post('/signin', requireSignin, Authentication.signin);

    app.post('/signup', Authentication.signup);

    app.post('/upload', requireAuth, ImagesUpload.addImages, ImagesUpload.resized);

    app.get('/getFiles', requireAuth, ImagesUpload.getFiles);

    app.delete('/upload/:id', requireAuth, ImagesUpload.deleteImage);

}
