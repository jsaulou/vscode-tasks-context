import * as vscode from 'vscode';
import { messages } from './messages';

export class NoTasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        const item = new vscode.TreeItem("");
        item.description = messages.folder_required;
        return [item];
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

}
