import { env } from 'vscode';

interface Messages {
    activateTaskFirst: string;
    folder_required: string;
    task_active: string;
    task_tooltip: string;
    task_name: string;
    noTasks: string;
    noVisibleTasks: string;
    selectTaskToActivate: string;
    errorLoadingTasksFile: string;
    file: string;
    files: string;
    actionCancel: string;
    actionDelete: string;
    deleteTask: string;
}

const MessagesFr: Messages = {
    activateTaskFirst: "Vous devez activer une tâche.",
    folder_required: 'Un répertoire doit être ouvert pour utiliser l\'extension',
    task_active: 'Active',
    task_tooltip: 'Créée le ',
    task_name: 'Nom de la tâche',
    noTasks: 'Aucune tâche',
    noVisibleTasks: 'Aucune tâche non complétée à afficher',
    selectTaskToActivate: 'Sélectionnez la tâche à activer',
    errorLoadingTasksFile: 'Erreur au chargement des tâches. Le fichier JSON de configuration n\'est pas valide. Veuillez vérifier votre fichier .vscode/tasks-context.json.',
    file: 'fichier',
    files: 'fichiers',
    actionCancel: 'Annuler',
    actionDelete: 'Supprimer',
    deleteTask: 'Supprimer la tâche ',
};

const MessagesEn: Messages = {
    activateTaskFirst: "You must activate a task first.",
    folder_required: 'A folder must be opened to use this extension',
    task_active: 'Active',
    task_tooltip: 'Created on ',
    task_name: 'Task name',
    noTasks: 'No incomplete tasks to show',
    noVisibleTasks: '',
    selectTaskToActivate: 'Select the task to activate',
    errorLoadingTasksFile: 'Could not load tasks. JSON configuration file is invalid. Please check your .vscode/tasks-context.json file.',
    file: 'file',
    files: 'files',
    actionCancel: 'Cancel',
    actionDelete: 'Delete',
    deleteTask: 'Delete task ',
};

export let messages: Messages = MessagesEn;
switch (env.language) {
    case 'fr':
        messages = MessagesFr;
        break;
    default:
        messages = MessagesEn;
        break;
}
