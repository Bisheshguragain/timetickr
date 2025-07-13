# Guide: Pushing Your Project to GitHub

This guide provides the commands needed to upload your existing application code to a new GitHub repository.

## Prerequisites

1.  **GitHub Account**: You need a free GitHub account.
2.  **New GitHub Repository**: You must have already created a new, **empty** repository on GitHub. Do not initialize it with a README or .gitignore file.

## Step-by-Step Commands

Open the terminal **within Firebase Studio** and run the following commands one by one.

---

### 1. Initialize the Git Repository

This command prepares your project folder here in the cloud.

```bash
git init -b main
```

---

### 2. Add All Files for Tracking

This command stages all your project files, getting them ready to be saved.

```bash
git add .
```

---

### 3. Create Your First Commit

This command saves your files with a message.

```bash
git commit -m "Initial commit of TimeTickR application"
```

---

### 4. Link to Your GitHub Repository

This command tells your project where your GitHub repository is.

**Important**: Replace `YOUR_USERNAME` and `YOUR_REPOSITORY.git` with your actual GitHub username and repository name.

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```
*Example: `git remote add origin https://github.com/janedoe/timetickr-app.git`*

---

### 5. Push Your Code to GitHub

This final command uploads your code. After running this, you can refresh your GitHub page to see all your project files.

```bash
git push -u origin main
```
