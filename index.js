import inquirer from 'inquirer';
import process from 'process';
import shelljs from 'shelljs';
import { spawn, exec, execSync } from 'node:child_process';
import fs from 'fs';

const gotoDirectory = (folder) => {
	const getFiles = async () => {
		const dir = await fs.promises.readdir(folder);
		const dirItems = dir.map(async (file) => {
			return new Promise((resolve, reject) => {
				fs.stat(`${folder}${file}`, (err, stats) => {
					if (err) {
						console.log('err', err);
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
				{ name: '[../]', value: { label: '..', type: 'dir' } },
				...dirItems.map((dirItem) => {
					const isDir = dirItem.type === 'dir';
					return { name: isDir ? `[${dirItem.label}]` : dirItem.label, value: dirItem };
				}),
			],
		})
			.then(({ decision }) => {
				if (decision.type === 'dir') {
					gotoDirectory(`${folder}${decision.label}/`);
				} else {
					if (process.argv[2]) {
						let command = `source ~/.bashrc; ${process.argv[2]} "${folder}" "${decision.label}"`;
						let counter = 3;
						while (counter < 10) {
							if (process.argv[counter]) {
								command += ` ${process.argv[counter]}`;
							} else {
								break;
							}
							counter++;
						}
						console.log('execute command:', command);

						shelljs.exec(command, {
							shell: '/bin/bash',
						});
					}
				}
			})
			.catch((error) => {
				if (error.isTtyError) {
					console.log('error', error);
					// Prompt couldn't be rendered in the current environment
				} else {
					console.log('Something else went wrong', error);
					// Something else went wrong
				}
			});
	});
};
gotoDirectory('./');
