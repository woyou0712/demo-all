const qiniuUploader = require('./qiniuUploader.js');
import { FileBaseUrl } from '../common/config.js';
import request from './request.js';

/**
 * 上传文件
 * @param {String} filePath
 */
export default function uploadFile(filePath) {
	return new Promise(async (resolve, reject) => {
		try {
			// 获取文件后缀
			const suffix = filePath.split('.').pop();
			const { token, path } = await request(`/qiniuToken?suffix=${suffix}`);
			qiniuUploader.upload(
				filePath,
				(res) => {
					console.log(res);
					if (res.error) {
						uni.showToast({
							title: res.error,
							icon: 'none'
						});
						reject(res.error);
						return;
					}
					resolve(res.fileURL);
				},
				(err) => {
					reject(err);
				},
				{
					region: 'SCN',
					domain: FileBaseUrl,
					key: path,
					uptoken: token
				}
			);
		} catch (e) {
			//TODO handle the exception
			reject(e);
		}
	});
}
