import * as vscode from 'vscode';
import { File, Task } from "./tasks";
import { TasksRepository } from './tasksRepository';
import { TasksProvider } from './tasksTreeViewProvider';
import { messages } from './messages';

export class TasksManager {

    private _activeTask?: Task;

    constructor(
        private tasksRepository: TasksRepository,
        private tasksProvider: TasksProvider) {
    }

    reloadTasks() {
        this._activeTask = undefined;
        this.tasksRepository.read();
        this.tasksProvider._onDidChangeTreeData.fire();
    }

    createTask(taskName: string) {
        const task = new Task(taskName);
        this.tasksRepository.addTask(task);
        this.tasksProvider._onDidChangeTreeData.fire();
        this.tasksRepository.write();
    }

    deleteTask(task: Task) {
        if (this._activeTask === task) {
            this._activeTask = undefined;
        }
        this.tasksRepository.deleteTask(task);
        this.tasksProvider._onDidChangeTreeData.fire();
        this.tasksRepository.write();
    }

    openAllFiles(task: Task) {
        task.files.forEach(f => vscode.window.showTextDocument(f.file, { preview: false }));
    }

    activeTask(): Task | undefined {
        return this._activeTask;
    }

    renameTask(task: Task, newName: string) {
        task.name = newName;
        this.tasksRepository.write();
        this.tasksProvider._onDidChangeTreeData.fire();
    }

    addFileToActiveTask(fileUri: vscode.Uri) {
        if (this._activeTask) {
            this.addFileToTask(fileUri, this._activeTask);
        } else {
            vscode.window.showInformationMessage(messages.activateTaskFirst);
        }
    }

    addFileToTask(fileUri: vscode.Uri, task: Task) {
        let found = false;
        task.files.forEach(f => {
            if (f.resourceUri && f.resourceUri.toString() === fileUri.toString()) {
                found = true;
            }
        });

        if (!found) {
            const file = new File(task, fileUri);
            task.addFile(file);
            this.tasksProvider._onDidChangeTreeData.fire();
            this.tasksRepository.write();
        }
    }

    removeTaskFile(file: File) {
        const task = file.task;
        task.removeFile(file);
        this.tasksProvider._onDidChangeTreeData.fire();
        this.tasksRepository.write();
    }

    activateTask(task: Task) {
        if (this._activeTask) {
            this._activeTask.active = false;
        }

        this._activeTask = task;
        task.active = true;

        this.tasksProvider._onDidChangeTreeData.fire();
    }

    deactivateTask(task: Task) {
        if (this._activeTask) {
            this._activeTask.active = false;
            this._activeTask = undefined;
            this.tasksProvider._onDidChangeTreeData.fire();
        }
    }

    markTaskIncomplete(task: Task) {
        task.complete = false;
        this.tasksProvider._onDidChangeTreeData.fire();
        this.tasksRepository.write();
    }

    markTaskComplete(task: Task) {
        task.complete = true;
        this.tasksProvider._onDidChangeTreeData.fire();
        this.tasksRepository.write();
    }

}