import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { messages } from './messages';
import { File, Task } from "./tasks";
import { pathExists } from './util';

export class TasksRepository {

    private tasksFile: string = "";
    tasks: Set<Task> = new Set();

    constructor(private workspaceRoot: vscode.Uri) {
        this.tasksFile = path.join(workspaceRoot.fsPath, '.vscode', 'tasks-context.json');
        this.read();
    }

    read() {
        this.tasks.clear();
        if (!pathExists(this.tasksFile)) {
            return;
        }

        let configJson;
        try {
            configJson = JSON.parse(fs.readFileSync(this.tasksFile, 'utf-8'));
        } catch (err) {
            vscode.window.showErrorMessage(messages.errorLoadingTasksFile);
            return;
        }

        if (!configJson.tasks) { return; }

        configJson.tasks.forEach((taskJson: any) => {
            const task = new Task(taskJson.name);
            task.complete = taskJson.complete;
            task.creationDate = new Date(taskJson.creationDate);
            if (taskJson.files) {
                taskJson.files.forEach((filePath: any) => {
                    const fileFullPath = path.resolve(this.workspaceRoot.fsPath, filePath);
                    task.addFile(new File(task, vscode.Uri.file(fileFullPath)));
                });
            }

            this.tasks.add(task);
        });
    }

    write() {
        const json: any = { tasks: [] };

        this.tasks.forEach(task => {
            const taskJson: any = {
                name: task.name,
                complete: task.complete,
                creationDate: task.creationDate.toISOString(),
                files: []
            };
            task.files.forEach(file => {
                if (file.resourceUri) {
                    const relativePath = path.relative(this.workspaceRoot.fsPath, file.resourceUri.fsPath);
                    taskJson.files.push(relativePath);
                }
            });

            json.tasks.push(taskJson);
        });

        const vscodeDir = path.join(this.workspaceRoot.fsPath, '.vscode');
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(path.join(this.workspaceRoot.fsPath, '.vscode'));
        }

        fs.writeFile(this.tasksFile, JSON.stringify(json, undefined, 2), { encoding: 'utf-8' }, (err) => {
            if (err) { throw err; }
        });
    }

    getTaskByName(name: string): Task | undefined {
        return Array.from(this.tasks).find(task => task.name === name);
    }

    addTask(task: Task) {
        this.tasks.add(task);
    }

    deleteTask(task: Task) {
        this.tasks.delete(task);
    }
}