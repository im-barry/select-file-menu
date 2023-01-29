import inquirer from 'inquirer';
import fs from 'fs';

const gotoDirectory = (folder) => {
	const getFiles = async () => {
		const dir = await fs.promises.readdir(folder);
		const dirItems = dir.map(async (file) => {
			return new Promise((resolve, reject) => {
				fs.stat(`${folder}${file}`, (err, stats) => {
					if (err) {
						return resolve({ label: file, type: 'unreadable' });
					}
					resolve({ label: file, type: stats.isFile() ? 'file' : 'dir' });
				});
			});
		});
		return Promise.all(dirItems);
	};

	getFiles().then((dirItems) => {
		const prompt = inquirer.createPromptModule({});
		prompt({
			type: 'list',
			name: 'decision',
			choices: [
				{ name: '[../]', value: { label: '../', type: 'dir' } },
				...dirItems.map((dirItem) => {
					const isDir = dirItem.type === 'dir';
					return { name: isDir ? `[${dirItem.label}]` : dirItem.label, value: dirItem };
				}),
			],
		})
			.then(({ decision }) => {
				if (decision.type === 'dir') {
					gotoDirectory(`${folder}${decision.label}/`);
				}
			})
			.catch((error) => {
				if (error.isTtyError) {
					console.log('error', error);
					// Prompt couldn't be rendered in the current environment
				} else {
					console.log('Something else went wrong');
					// Something else went wrong
				}
			});
	});
};
gotoDirectory('./');
