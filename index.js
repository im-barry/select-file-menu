import inquirer from 'inquirer';
import fs from 'fs';

const getFiles = async () => {
	const dir = await fs.promises.readdir('./');
	const dirItems = dir.map(async (file) => {
		return new Promise((resolve, reject) => {
			fs.stat(`./${file}`, (err, stats) => {
				if (err) {
					resolve(err);
					throw err;
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
		choices: dirItems.map((dirItem) => {
			const isDir = dirItem.type === 'dir';
			return { name: isDir ? `[${dirItem.label}]` : dirItem.label, value: dirItem };
		}),
	})
		.then((answer) => {
			console.log('answer', answer);
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
