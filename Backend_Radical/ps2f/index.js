const express = require('express');
const router = express.Router();

const user = require('./user/user.route');
const file = require('./file/file.route');
const project = require('./project/project.route');
const visualize = require('./visualize/visualize.route');

const webRoutes = require('./abaque/upload');
const clipRoutes = require('./abaque/mapClip');
const exportRoutes = require('./abaque/Front');
const frontFRoutes = require('./abaque/FrontFile');
const initRoutes = require('./abaque/Initialiser');
const jsonRoutes = require('./abaque/JsonFile');
const meteoRoutes = require('./abaque/Meteo');
const isoRoutes = require('./abaque/Calculisoflux');


router.use('/user', user);
router.use('/file', file);
router.use('/project', project);
router.use('/visualize', visualize);

router.use('/api/file', frontFRoutes);
router.use('/api/export', exportRoutes);
router.use('/api/clip', clipRoutes);
router.use('/api/upload', webRoutes);
router.use('/api/delete', initRoutes);
router.use('/api/create', jsonRoutes);
router.use('/api/meteo', meteoRoutes);
router.use('/api/isoflux', isoRoutes);

module.exports = router;

// function emptyUploadsDirectories(dir_path) {
//     if (fs.existsSync(dir_path)) {
//         fs.readdirSync(dir_path).forEach(function (entry) {
//             var entry_path = path.join(dir_path, entry);
//             let keep = entry_path.substring(-5);
//             if (fs.lstatSync(entry_path).isDirectory()) {
//                 emptyUploadsDirectories(entry_path);
//             } else if (keep != '.keep') {
//                 fs.unlinkSync(entry_path);
//             }
//         });
//         if (dir_path.substring(-7) != 'uploads') {
//             fs.rmdirSync(dir_path);
//         }
//     }
// }

// let dirfiles = path.join(__dirname, 'file', 'uploads');

// emptyUploadsDirectories(dirfiles);
