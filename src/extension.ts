'use strict';

import * as vscode from 'vscode';
import { messages } from './messages';
import { NoTasksProvider } from './noTasksTreeViewProvider';
import { File, Task } from './tasks';
import { TasksManager } from './tasksManager';
import { TasksRepository } from './tasksRepository';
import { TasksProvider } from './tasksTreeViewProvider';

export function activate(context: vscode.ExtensionContext) {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length > 1) {
        initNoWorkspace(context);
    } else {
        initWorkspace(context, vscode.workspace.workspaceFolders[0].uri);
    }
}

export function deactivate() {
}

function initWorkspace(context: vscode.ExtensionContext, workspaceUri: vscode.Uri) {
    const tasksRepository = new TasksRepository(workspaceUri);

    const tasksProvider = new TasksProvider(tasksRepository);
    const treeProvider = vscode.window.registerTreeDataProvider('tasks-context', tasksProvider);

    const tasksManager = new TasksManager(tasksRepository, tasksProvider);

    vscode.window.onDidChangeTextEditorSelection(e => {
        const autoActive = vscode.workspace.getConfiguration('tasks-context', null).get<string>('autoAddFileToActiveTask');
        if (autoActive === 'modified' && tasksManager.activeTask() && e.textEditor.document.isDirty) {
            tasksManager.addFileToActiveTask(e.textEditor.document.uri);
        }
    });

    vscode.window.onDidChangeActiveTextEditor(e => {
        if (!e) { return; }

        const autoActive = vscode.workspace.getConfiguration('tasks-context', null).get<string>('autoAddFileToActiveTask');
        if (autoActive === 'opened' && tasksManager.activeTask()) {
            tasksManager.addFileToActiveTask(e.document.uri);
        }
    });

    const commandReloadTasks = vscode.commands.registerCommand('tasks-context.reloadTasks', () => {
        tasksManager.reloadTasks();
    });

    const commandNewTask = vscode.commands.registerCommand('tasks-context.newTask', () => {
        vscode.window.showInputBox({ placeHolder: messages.task_name }).then(taskName => {
            if (taskName) {
                tasksManager.createTask(taskName);
            }
        });
    });

    const commandOpenAllFiles = vscode.commands.registerCommand('tasks-context.openAllFiles', (task: Task) => {
        tasksManager.openAllFiles(task);
    });

    const commandDeleteTask = vscode.commands.registerCommand('tasks-context.deleteTask', (task: Task) => {
        vscode.window.showWarningMessage(messages.deleteTask + ' ' + task.name + '?', messages.actionDelete, messages.actionCancel).then((action) => {
            if (action === messages.actionDelete) {
                tasksManager.deleteTask(task);
            }
        });
    });

    const commandRemoveTaskFile = vscode.commands.registerCommand('tasks-context.removeTaskFile', (file: File) => {
        tasksManager.removeTaskFile(file);
    });

    const commandAddFileToActiveTask = vscode.commands.registerCommand('tasks-context.addFileToActiveTask', (fileUri: vscode.Uri) => {
        if (tasksManager.activeTask()) {
            tasksManager.addFileToActiveTask(fileUri);
        } else {
            const taskNames = Array.from(tasksRepository.tasks).map(t => t.name).sort();
            vscode.window.showQuickPick(taskNames, { canPickMany: false, placeHolder: messages.selectTaskToActivate }).then(taskName => {
                if (taskName) {
                    const task = tasksRepository.getTaskByName(taskName);
                    if (task) {
                        tasksManager.activateTask(task);
                        tasksManager.addFileToActiveTask(fileUri);
                    }
                }
            });
        }
    });

    const activateTask = vscode.commands.registerCommand('tasks-context.activateTask', (task: Task) => {
        tasksManager.activateTask(task);
    });

    const deactivateTask = vscode.commands.registerCommand('tasks-context.deactivateTask', (task: Task) => {
        tasksManager.deactivateTask(task);
    });

    const renameTask = vscode.commands.registerCommand('tasks-context.renameTask', (task: Task) => {
        vscode.window.showInputBox({ placeHolder: messages.task_name, value: task.name }).then(newName => {
            if (newName) {
                tasksManager.renameTask(task, newName);
            }
        });
    });

    const markTaskComplete = vscode.commands.registerCommand('tasks-context.markTaskComplete', (task: Task) => {
        tasksManager.markTaskComplete(task);
    });

    const markTaskIncomplete = vscode.commands.registerCommand('tasks-context.markTaskIncomplete', (task: Task) => {
        tasksManager.markTaskIncomplete(task);
    });

    const sortTasksByName = vscode.commands.registerCommand('tasks-context.sortTasksByName', () => {
        tasksProvider.sortBy = 'name';
    });

    const sortTasksByCreationDate = vscode.commands.registerCommand('tasks-context.sortTasksByCreationDate', () => {
        tasksProvider.sortBy = 'creationDate';
    });

    const showCompletedTasks = vscode.commands.registerCommand('tasks-context.showCompletedTasks', () => {
        vscode.workspace.getConfiguration().update('tasks-context.hideCompletedTasks', false, true);
        tasksProvider._onDidChangeTreeData.fire();
    });

    const hideCompletedTasks = vscode.commands.registerCommand('tasks-context.hideCompletedTasks', () => {
        vscode.workspace.getConfiguration().update('tasks-context.hideCompletedTasks', true, true);
        tasksProvider._onDidChangeTreeData.fire();
    });

    context.subscriptions.push(treeProvider);
    context.subscriptions.push(commandReloadTasks);
    context.subscriptions.push(commandNewTask);
    context.subscriptions.push(commandOpenAllFiles);
    context.subscriptions.push(commandDeleteTask);
    context.subscriptions.push(commandRemoveTaskFile);
    context.subscriptions.push(commandAddFileToActiveTask);
    context.subscriptions.push(activateTask);
    context.subscriptions.push(deactivateTask);
    context.subscriptions.push(renameTask);
    context.subscriptions.push(markTaskComplete);
    context.subscriptions.push(markTaskIncomplete);
    context.subscriptions.push(sortTasksByName);
    context.subscriptions.push(sortTasksByCreationDate);
    context.subscriptions.push(showCompletedTasks);
    context.subscriptions.push(hideCompletedTasks);
}

function initNoWorkspace(context: vscode.ExtensionContext) {
    const tasksProvider = new NoTasksProvider();
    const treeProvider = vscode.window.registerTreeDataProvider('tasks-context', tasksProvider);

    context.subscriptions.push(treeProvider);
}
