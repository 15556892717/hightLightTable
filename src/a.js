// node fs模块
const fs = require('fs');
// node path模块
const path = require('path');
// 被读取的文件夹地址
const filePath = path.resolve('./src/page');
// locales
// const ch = require('./src/locales/ch');
// const en = require('./src/locales/en');

const filesArr = [];
const keys = [];

function getAllFiles(directory) {
	// 读取文件夹
	fs.readdir(directory, function (err, files) {
		// 循环files 判断 file 是文件还是文件夹，如果是文件push到filesArr中，反之再次循环
		files.forEach(file => {
			const fileDir = path.resolve(directory, file);
			// fs.stat 返回文件示例 通过其身上的方法可以判断是否为文件和目录
			fs.stat(fileDir, function (err, stats) {
				if (err) console.error(err);
				if (stats.isFile()) {
					filesArr.push({ fileP: fileDir, read: false });
				}
				if (stats.isDirectory()) {
					getAllFiles(fileDir);
				}
				console.log(filesArr, 'filesArr');

				// 遍历所有的文件，将页面中用到的国际化key都存放到数组中
				// filesArr.forEach(item => {
				// 	fs.readFile(item.fileP, 'utf8', (err, data) => {
				// 		if (err) throw err;
				// 		const reg = /utils.getStr\(.+'\)\)/g;
				// 		const matchRes = data.match(reg) || [];
				// 		matchRes.forEach((item, index) => {
				// 			matchRes[index] = item
				// 				.replace("utils.getStr('", '')
				// 				.replace("'))", '');
				// 		});
				// 		// 往keys中push所有用到的国际化文件中的key
				// 		keys.push(...matchRes);
				// 		const chContent = {};
				// 		const enContent = {};
				// 		[...new Set(keys)].forEach(item => {
				// 			chContent[item] = ch[item];
				// 			enContent[item] = en[item];
				// 		});
				// 		// // 写入数据
				// 		// fs.writeFile(
				// 		// 	'./例2.js',
				// 		// 	`export default ${JSON.stringify(chContent)}`,
				// 		// 	function (err) {
				// 		// 		if (err) {
				// 		// 			return console.log('文件写入失败！' + err.message);
				// 		// 		}
				// 		// 		console.log('文件写入成功！');
				// 		// 	}
				// 		// );
				// 		// fs.writeFile(
				// 		// 	'./例3.js',
				// 		// 	`export default ${JSON.stringify(enContent)}`,
				// 		// 	function (err) {
				// 		// 		if (err) {
				// 		// 			return console.log('文件写入失败！' + err.message);
				// 		// 		}
				// 		// 		console.log('文件写入成功！');
				// 		// 	}
				// 		// );
				// 	});
				// });
			});
		});
	});
	// console.log('filesArr', filesArr);
}
getAllFiles(filePath);
