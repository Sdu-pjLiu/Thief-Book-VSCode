// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, QuickPickItem, window } from 'vscode';
import * as book from './bookUtil';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "thief-book" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// 老板键
	let displayCode = commands.registerCommand('extension.displayCode', () => {

		let lauage_arr_list = [
			'Java - System.out.println("Hello World");',
			'C++ - cout << "Hello, world!" << endl;',
			'C - printf("Hello, World!");',
			'Python - print("Hello, World!")',
			'PHP - echo "Hello World!";',
			'Ruby - puts "Hello World!";',
			'Perl - print "Hello, World!";',
			'Lua - print("Hello World!")',
			'Scala - println("Hello, world!")',
			'Golang - fmt.Println("Hello, World!")'
		];

		var index = Math.floor((Math.random() * lauage_arr_list.length));
		window.setStatusBarMessage(lauage_arr_list[index]);
	});

	// 下一页
	let getNextPage = commands.registerCommand('extension.getNextPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getNextPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 上一页
	let getPreviousPage = commands.registerCommand('extension.getPreviousPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getPreviousPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 跳转某个页面
	let getJumpingPage = commands.registerCommand('extension.getJumpingPage', async () => {
		try {
		let books = new book.Book(context);
			const content = await books.getJumpingPage();
			window.setStatusBarMessage(content);
		} catch (error) {
			window.showErrorMessage(`读取失败: ${error}`);
		}
	});

	// 搜索小说内容
	let searchBook = commands.registerCommand('extension.searchBook', async () => {
		try {
			const books = new book.Book(context);

			const keyword = await window.showInputBox({
				prompt: '搜索小说内容',
				placeHolder: '输入要查找的关键词',
				ignoreFocusOut: true,
			});

			if (keyword === undefined) {
				return;
			}
			if (!keyword.trim()) {
				window.showInformationMessage('关键词不能为空');
				return;
			}

			const { matches, total, page } = await books.search(keyword);
			if (total === 0) {
				window.showInformationMessage('未找到匹配内容');
				return;
			}

			interface MatchItem extends QuickPickItem {
				pageNumber: number;
			}

			const items: MatchItem[] = matches.map((m) => ({
				label: `${m.page}/${page}`,
				description: m.snippet,
				pageNumber: m.page,
			}));

			const picked = await window.showQuickPick(items, {
				placeHolder:
					total > matches.length
						? `找到 ${total} 处，显示前 ${matches.length} 处`
						: `找到 ${total} 处，选择后跳转`,
				matchOnDescription: false,
				matchOnDetail: false,
			});

			if (!picked) {
				return;
			}

			const content = await books.jumpToPage(picked.pageNumber);
			if (content) {
				window.setStatusBarMessage(content);
			}
		} catch (error) {
			window.showErrorMessage(`搜索失败: ${error}`);
		}
	});

	context.subscriptions.push(displayCode);
	context.subscriptions.push(getNextPage);
	context.subscriptions.push(getPreviousPage);
	context.subscriptions.push(getJumpingPage);
	context.subscriptions.push(searchBook);
}

// this method is called when your extension is deactivated
export function deactivate() { }
