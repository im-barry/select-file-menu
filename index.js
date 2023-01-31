import inquirer from 'inquirer';
import process from 'process';
// import shelljs from 'shelljs';
import { spawn, exec, execSync } from 'node:child_process';
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
				} else {
					console.log('a decision was made: ', decision);
					console.log('a decision was made2: ', process.argv[2], folder + decision.label);
					//process.argv[2]
					if (process.argv[2]) {
						console.log('call', process.argv[2], ' with ', `${folder}${decision.label}`);

						// console.log('execute', process.argv[2], ' on: ', `${folder}${decision.label}`, shelljs);
						// shelljs.echo('my cache dir is', shelljs.env);
						// shelljs.exec(
						// 	`shopt -s expand_aliases \n source ~/.bashrc \n alias ${process.argv[2]} \n ${process.argv[2]} ${
						// 		folder + decision.label
						// 	}`,
						// 	{ shell: '/bin/bash' }
						// );
						// execSync(`shopt -s expand_aliases \n source ~/.bashrc \n ${process.argv[2]} ${folder + decision.label}`, {
						// 	shell: '/bin/bash',
						// }); //.toString();
						// shelljs.exec(`source ~/.bashrc; ${process.argv[2]}`, { shell: '/bin/bash' });
						// shelljs.exec(
						// 	process.argv[2],
						// 	{ shell: '/bin/bash' } //, stdio: 'inherit', detached: true },
						// function (error, stdout, stderr) {
						// 	console.log('stdout: ' + stdout);
						// 	console.log('stderr: ' + stderr);
						// 	if (error !== null) {
						// 		console.log('exec error: ' + error);
						// 	}
						// }
						// );
						// // this works for nano:
						// const command = spawn(process.argv[2], [`${folder}${decision.label}`], {
						// 	stdio: 'inherit',
						// 	detached: true,
						// });
						// command.stdout.on('data', (output) => {
						// 	console.log('output');
						// });
						// exec(process.argv[2], (err, output) => {
						// 	if (err) {
						// 		return console.log('error', err);
						// 	}
						// 	console.log('output');
						// });
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
