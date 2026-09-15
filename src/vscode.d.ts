// Type definitions for vscode module
// This is a minimal declaration to work with TypeScript 3.3.1

declare module 'vscode' {
    export interface ExtensionContext {
        subscriptions: { dispose(): any }[];
        globalState: any;
        workspaceState: any;
    }

    export interface QuickPickItem {
        label: string;
        description?: string;
        detail?: string;
    }

    export interface InputBoxOptions {
        prompt?: string;
        placeHolder?: string;
        ignoreFocusOut?: boolean;
    }

    export interface QuickPickOptions {
        placeHolder?: string;
        matchOnDescription?: boolean;
        matchOnDetail?: boolean;
    }

    export namespace window {
        export function showWarningMessage(message: string): void;
        export function showErrorMessage(message: string): void;
        export function showInformationMessage(message: string): void;
        export function setStatusBarMessage(text: string): void;
        export function showInputBox(options?: InputBoxOptions): Thenable<string | undefined>;
        export function showQuickPick<T extends QuickPickItem>(
            items: T[] | Thenable<T[]>,
            options?: QuickPickOptions
        ): Thenable<T | undefined>;
    }

    export namespace workspace {
        export interface Configuration {
            get<T>(key: string, defaultValue?: T): T;
            update(key: string, value: any, target?: boolean): Thenable<void>;
        }
        export function getConfiguration(section?: string, scope?: any): Configuration;
    }

    export namespace commands {
        export interface Command {
            command: string;
            title: string;
        }
        export function registerCommand(command: string, callback: (...args: any[]) => any): { dispose(): any };
    }
}

