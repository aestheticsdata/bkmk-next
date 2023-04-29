const router = require('express').Router();
const signInController = require('../controllers/users/signInController');
const addUserController = require('../controllers/users/addUserController');
const helloController = require('../controllers/users/helloController');
// const resetPasswordController = require('../controllers/users/resetPasswordController');
const catchAsync = require('../../../../frontend/src/utils/catchAsync');


router.post('/', catchAsync(signInController));
router.post('/add', catchAsync(addUserController));
router.get('/hello', catchAsync(helloController));
// router.post('/resetpassword', catchAsync(resetPasswordController));

module.exports = router;


// router.get('/all', checkToken, (req, res) => {
//   User.find()
//     .then(users => res.json(users))
//     .catch(err => res.status(400).json(`Error: ${err}`));
// });


// router.get('/:id', (req, res) => {
//   User.findById(req.params.id)
//     .then(user => res.json(user))
//     .catch(() => res.status(500).json('no user with this id'));
// });


// router.delete('/:id', (req, res) => {
//   User.findById(req.params.id)
//     .then(
//       user => user.remove().then(
//         () => res.json({ success: true })
//       )
//     )
//     .catch(() => res.status(500).json({ success: false }));
// });


