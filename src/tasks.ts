import * as path from 'path';
import * as vscode from 'vscode';
import { TreeItemCollapsibleState } from 'vscode';
import { messages } from './messages';
import { formatDate } from './util';

export class Task extends vscode.TreeItem {

    private _active: boolean = false;
    private _complete: boolean = false;
    public creationDate: Date;
    public files: Set<File> = new Set();

    constructor(
        private _name: string,
    ) {
        super(_name, TreeItemCollapsibleState.Collapsed);
        this.creationDate = new Date();
        this.updateState();
    }

    addFile(file: File) {
        this.files.add(file);
        this.updateState();
    }

    removeFile(file: File) {
        this.files.delete(file);
        this.updateState();
    }

    get tooltip() {
        return messages.task_tooltip + formatDate(this.creationDate);
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
        this.label = name;
        this.updateState();
    }

    get active(): boolean {
        return this._active;
    }

    set active(active: boolean) {
        this._active = active;
        this.updateState();
    }

    get complete(): boolean {
        return this._complete;
    }

    set complete(complete: boolean) {
        this._complete = complete;
        this.updateState();
    }

    private updateState() {
        this.description = '(' + this.files.size + ' ' + (this.files.size > 1 ? messages.files : messages.file) + ')';

        if (this.active) {
            this.collapsibleState = TreeItemCollapsibleState.Expanded;
            this.description = this.description + ' - ' + messages.task_active;
        } else {
            this.collapsibleState = TreeItemCollapsibleState.Collapsed;
        }

        this.contextValue = `task:${this.active ? 'active' : 'inactive'}:${this.complete ? 'complete' : 'incomplete'}`;

        const icon = `task-${this.active ? 'active' : 'inactive'}-${this.complete ? 'complete' : 'incomplete'}.svg`;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'media/light', icon),
            dark: path.join(__filename, '..', '..', 'media/dark', icon),
        };
    }

}

export class File extends vscode.TreeItem {

    constructor(
        public task: Task,
        public readonly file: vscode.Uri,
    ) {
        super(file);
    }

    command = {
        command: 'vscode.open',
        title: '',
        arguments: [this.file, { preview: false }]
    };

    contextValue = 'file';
    description = true;

}