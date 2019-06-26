import * as vscode from 'vscode';
import * as path from 'path';
import { Task, File } from './tasks';
import { TasksRepository } from './tasksRepository';
import { messages } from './messages';

export class TasksProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

    _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    private _sortBy: string = 'name';
    private _sortOrder = 1;

    constructor(private tasksRepository: TasksRepository) {
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        let hideCompletedTasks = vscode.workspace.getConfiguration().get<boolean>('tasks-context.hideCompletedTasks');
        if (hideCompletedTasks === undefined) {
            hideCompletedTasks = false;
        }

        if (element instanceof Task) {
            return Array.from(element.files).sort((a, b) => {
                if (!a.resourceUri) {
                    return 1;
                }
                if (!b.resourceUri) {
                    return -1;
                }
                return path.basename(a.resourceUri.fsPath).localeCompare(path.basename(b.resourceUri.fsPath));
            });
        }

        if (this.tasksRepository.tasks.size > 0) {
            let tasks: Task[];
            if (this._sortBy === 'creationDate') {
                tasks = Array.from(this.tasksRepository.tasks)
                    .sort((a, b) => {
                        return (a.creationDate.getTime() - b.creationDate.getTime()) * this._sortOrder;
                    });
            } else {
                tasks = Array.from(this.tasksRepository.tasks)
                    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) * this._sortOrder);
            }

            tasks = tasks.filter(t => hideCompletedTasks ? !t.complete || t.active : true);
            if (tasks.length > 0) {
                return tasks;
            }

            const noTasksItem = new vscode.TreeItem("");
            noTasksItem.description = messages.noVisibleTasks;
            return [noTasksItem];
        }

        const noTasksItem = new vscode.TreeItem("");
        noTasksItem.description = messages.noTasks;
        return [noTasksItem];
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getParent?(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
        if (element instanceof File) {
            return element.task;
        }
        return null;
    }

    set sortBy(newSortBy: string) {
        if (this._sortBy === newSortBy) {
            this.toggleSort();
        } else {
            this._sortBy = newSortBy;
        }
        this._onDidChangeTreeData.fire();
    }

    toggleSort() {
        this._sortOrder = this._sortOrder * -1;
    }

}
