# Guide: Pushing Your Project to GitHub

This guide provides the commands needed to upload your existing application code to a new GitHub repository.

## Prerequisites

1.  **Git Installed**: You must have Git installed on your computer. If not, download it from [git-scm.com](https://git-scm.com/).
2.  **GitHub Account**: You need a GitHub account.
3.  **New GitHub Repository**: You must have already created a new, **empty** repository on GitHub. Do not initialize it with a README or .gitignore file.

## Step-by-Step Commands

Open a terminal or command prompt in your project's root directory (the same directory where this file is located) and run the following commands one by one.

---

### 1. Initialize the Git Repository

This command creates a new Git repository in your current directory. The `-b main` part sets the default branch name to `main`, which is the standard.

```bash
git init -b main
```

---

### 2. Add All Files for Tracking

This command stages all the files in your project, preparing them to be saved in your first commit. The `.` means "all files and folders in the current directory".

```bash
git add .
```

---

### 3. Create Your First Commit

A commit is a snapshot of your code at a specific point in time. This command saves your staged files with a descriptive message.

```bash
git commit -m "Initial commit of TimeTickR application"
```

---

### 4. Link to Your GitHub Repository

This command tells your local Git repository where the remote repository on GitHub is located.

**Important**: You must replace `YOUR_USERNAME` and `YOUR_REPOSITORY.git` with your actual GitHub username and the name of the repository you created.

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```
*Example: `git remote add origin https://github.com/janedoe/timetickr-app.git`*

---

### 5. Push Your Code to GitHub

This final command uploads your committed code from your local `main` branch to the `origin` remote (which is your GitHub repository).

```bash
git push -u origin main
```

After running this command, you can refresh your GitHub repository page in the browser, and you will see all of your project files.