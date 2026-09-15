import { ExtensionContext, workspace, window } from 'vscode';
import * as fs from "fs";
import * as path from "path";
import { EpubParser } from './epubUtil';

export interface SearchMatch {
    index: number;
    page: number;
    snippet: string;
}

const MAX_SEARCH_RESULTS = 200;
const SNIPPET_RADIUS = 18;

/**
 * 在规范化文本上做包含匹配，返回命中列表（按出现顺序）。
 */
export function searchMatches(
    text: string,
    keyword: string,
    pageSize: number,
    caseInsensitive: boolean
): { matches: SearchMatch[]; total: number } {
    const needle = keyword.trim();
    if (!needle || pageSize <= 0 || !text) {
        return { matches: [], total: 0 };
    }

    const haystack = caseInsensitive ? text.toLowerCase() : text;
    const needleCmp = caseInsensitive ? needle.toLowerCase() : needle;

    const matches: SearchMatch[] = [];
    let from = 0;
    let total = 0;

    while (true) {
        const index = haystack.indexOf(needleCmp, from);
        if (index < 0) {
            break;
        }
        total += 1;
        if (matches.length < MAX_SEARCH_RESULTS) {
            const page = Math.floor(index / pageSize) + 1;
            matches.push({
                index,
                page,
                snippet: buildSnippet(text, index, needle.length),
            });
        }
        from = index + needle.length;
    }

    return { matches, total };
}

/**
 * 构造命中前后文摘要。
 */
function buildSnippet(text: string, index: number, keywordLen: number): string {
    const start = Math.max(0, index - SNIPPET_RADIUS);
    const end = Math.min(text.length, index + keywordLen + SNIPPET_RADIUS);
    let snippet = text.substring(start, end).replace(/\s+/g, " ");
    if (start > 0) {
        snippet = "…" + snippet;
    }
    if (end < text.length) {
        snippet = snippet + "…";
    }
    return snippet;
}

export class Book {
    curr_page_number: number = 1;
    page_size: number | undefined = 50;
    page = 0;
    start = 0;
    end = this.page_size;
    filePath: string | undefined = "";
    extensionContext: ExtensionContext;
    private cachedText: string = ""; // 缓存解析后的文本
    private fileType: 'txt' | 'epub' | null = null; // 文件类型

    constructor(extensionContext: ExtensionContext) {
        this.extensionContext = extensionContext;
    }

    getSize(text: string) {
        let size = text.length;
        this.page = Math.ceil(size / this.page_size!);
    }

    getFileName() {
        var file_name: string | undefined = this.filePath!.split("/").pop();
        console.log(file_name);
    }

    getPage(type: string) {

        var curr_page = <number>workspace.getConfiguration().get('thiefBook.currPageNumber');
        var page = 0;

        if (type === "previous") {
            if (curr_page! <= 1) {
                page = 1;
            } else {
                page = curr_page - 1;
            }
        } else if (type === "next") {
            if (curr_page! >= this.page) {
                page = this.page;
            } else {
                page = curr_page + 1;
            }
        } else if (type === "curr") {
            page = curr_page;
        }

        this.curr_page_number = page;
        // this.curr_page_number = this.extensionContext.globalState.get("book_page_number", 1);
    }

    updatePage() {
        // var page = 0;

        // if (type === "previous") {
        //     if (this.curr_page_number! <= 1) {
        //         page = 1;
        //     } else {
        //         page = this.curr_page_number! - 1;
        //     }
        // } else if (type === "next") {
        //     if (this.curr_page_number! >= this.page) {
        //         page = this.page;
        //     } else {
        //         page = this.curr_page_number! + 1;
        //     }
        // }

        workspace.getConfiguration().update('thiefBook.currPageNumber', this.curr_page_number, true);
        // this.extensionContext.globalState.update("book_page_number", page);
    }

    getStartEnd() {
        this.start = this.curr_page_number * this.page_size!;
        this.end = this.curr_page_number * this.page_size! - this.page_size!;
    }

    /**
     * 检测文件类型
     */
    private detectFileType(filePath: string): 'txt' | 'epub' {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.epub') {
            return 'epub';
        }
        return 'txt';
    }

    /**
     * 读取 TXT 文件
     */
    private readTxtFile(): string {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            window.showWarningMessage("请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file");
            return "";
        }

        var data = fs.readFileSync(this.filePath!, 'utf-8');
        var line_break = <string>workspace.getConfiguration().get('thiefBook.lineBreak');

        return data.toString()
            .replace(/\n/g, line_break)
            .replace(/\r/g, " ")
            .replace(/　　/g, " ")
            .replace(/ /g, " ");
    }

    /**
     * 读取 EPUB 文件
     */
    private async readEpubFile(): Promise<string> {
        if (this.filePath === "" || typeof (this.filePath) === "undefined") {
            window.showWarningMessage("请填写EPUB格式的小说文件路径 & Please fill in the path of the EPUB format novel file");
            return "";
        }

        try {
            // 如果已缓存，直接返回
            if (this.cachedText) {
                return this.cachedText;
            }

            const parser = new EpubParser(this.filePath!);
            await parser.init();
            const text = parser.getText();
            
            // 处理换行符
            var line_break = <string>workspace.getConfiguration().get('thiefBook.lineBreak');
            this.cachedText = text
                .replace(/\n/g, line_break)
                .replace(/\r/g, " ")
                .replace(/　　/g, " ")
                .replace(/ /g, " ");

            return this.cachedText;
        } catch (error) {
            window.showErrorMessage(`EPUB 文件解析失败: ${error}`);
            return "";
        }
    }

    /**
     * 统一文件读取接口
     */
    async readFile(): Promise<string> {
        if (!this.filePath) {
            return "";
        }

        this.fileType = this.detectFileType(this.filePath);

        if (this.fileType === 'epub') {
            return await this.readEpubFile();
        } else {
            return this.readTxtFile();
        }
    }

    init() {
        const newFilePath = workspace.getConfiguration().get<string>('thiefBook.filePath', '');
        const newFileType = newFilePath ? this.detectFileType(newFilePath) : null;
        
        // 文件类型改变时清除缓存
        if (this.filePath !== newFilePath || this.fileType !== newFileType) {
            this.cachedText = "";
        }

        this.filePath = newFilePath;
        this.fileType = newFileType;
        
        var is_english = <boolean>workspace.getConfiguration().get('thiefBook.isEnglish');

        if (is_english === true) {
            this.page_size = <number>workspace.getConfiguration().get('thiefBook.pageSize') * 2;
        } else {
            this.page_size = workspace.getConfiguration().get('thiefBook.pageSize');
        }
    }

    async getPreviousPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("previous");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();
        return text.substring(this.start, this.end) + "    " + page_info;
    }

    async getNextPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("next");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();

        return text.substring(this.start, this.end) + "    " + page_info;
    }

    async getJumpingPage(): Promise<string> {
        this.init();

        let text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        this.getPage("curr");
        this.getStartEnd();

        var page_info = this.curr_page_number.toString() + "/" + this.page.toString();

        this.updatePage();

        return text.substring(this.start, this.end) + "    " + page_info;
    }

    /**
     * 按关键词搜索当前小说，返回命中列表与总页数。
     */
    async search(keyword: string): Promise<{ matches: SearchMatch[]; total: number; page: number }> {
        this.init();

        const text = await this.readFile();
        if (!text) {
            return { matches: [], total: 0, page: this.page };
        }

        this.getSize(text);
        const isEnglish = <boolean>workspace.getConfiguration().get("thiefBook.isEnglish");
        const result = searchMatches(text, keyword, this.page_size!, isEnglish === true);
        return { ...result, page: this.page };
    }

    /**
     * 跳到指定页并返回状态栏文案。
     */
    async jumpToPage(pageNumber: number): Promise<string> {
        this.init();

        const text = await this.readFile();
        if (!text) {
            return "";
        }

        this.getSize(text);
        if (pageNumber < 1) {
            pageNumber = 1;
        } else if (pageNumber > this.page) {
            pageNumber = this.page;
        }

        this.curr_page_number = pageNumber;
        this.getStartEnd();
        this.updatePage();

        const pageInfo = `${this.curr_page_number}/${this.page}`;
        return text.substring(this.start, this.end) + "    " + pageInfo;
    }
}