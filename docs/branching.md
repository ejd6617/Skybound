# Youtube Links

[VSCode Git Basics](https://www.youtube.com/watch?v=i_23KUAEtUM)\
[VSCode Git Branching/Merging](https://www.youtube.com/watch?v=b9LTz6joMf8)

# Procedure

## 1. Make sure you're on main and pull the latest changes

### Command line:

```bash
git checkout main
git pull origin main
```

### GUI:

1. In bottom left corner of the screen: click on the name of the current branch. A menu will open up top to select the branch to switch to.
2. In the `Source Control` panel on the left: hover over `CHANGES`, click the "..." on the right, select `pull`

## 2. Make a new branch for your feature and switch to it

### Command line:

```bash
git branch "newBranch"
git checkout "newBranch"
# Or, git checkout -b "newBranch" to do both steps at once
```

### GUI:

1. In bottom left corner of the screen: click on the name of the current branch. A menu will open up top.
2. Select `+ Create new branch...`, enter the name of the new branch

## 3. Stage your changes and commit to your branch

It's best practice to commit relatively often so you can revert back to old commits when things break. ChatGPT explains it better than I can:

- You should commit whenever you complete a meaningful unit of work that:

    * Adds value (e.g. a feature, bug fix, or improvement)
    * Keeps the code in a working state
    * Is logically independent and understandable

- In practice, this often means:

    * Several small commits per day during active development
    * Before switching tasks, pulling changes, or testing
    * With clear, descriptive messages
    
Don't worry too much about your commit strategy, none of us are experts at this and descriptive commit messages can be difficult to write.
    
### Command line:

```bash
git add . # Changes need to be staged before they are committed. This command means "stage all files in the current directory"
git commit -m "Descriptive commit message"
```

### GUI:

1. In the `Source Control` panel on the left: click '+' next to files you'd like to commit changes for.
    * Or, click the '+' which appears to the right of the `Changes` heading when you hover over it. This will stage all files for commit
    * Or, skip right to the big commit button. It will ask you if you'd like to stage your currently changed files
    
2. Enter a commit message above the big `Commit` button, and click it

> [!NOTE]
> Before you commit, **make sure you're on the branch you intend to commit to**. You should see the name of your branch in the bottom left of the screen, or in the first line of the output of `git status` on the command line. If not, click it and change it via the GUI, or run `git checkout branchName`

## 4. Push your local branch to GitHub

This will be necessary if you want to do the merge on GitHub's website. Otherwise, it's still nice to have an online copy of your local changes in case you lose them on your computer.

### Command line:

```bash
git checkout my-feature-branch
git push origin main
```

### GUI:



## 5. Merge your branch back into main

You can do this on the GitHub website in the `Pull Requests` tab. If the website fails you, here's how you can do it in VSCode:

### Command line:

``` Bash
# Switch to main
git checkout main

# Ensure that the copy of main on your computer is the same as the one on GitHub
git pull origin main

# Merge your feature branch into main
git merge my-feature-branch

# If there are merge conflicts: VSCode will show a comparison between the version in main and your branch. You can choose which one to keep.

# Mark conflicts as resolved by committing
# You should only have to do this if there were conflicts
git add .
git commit

# Push the merge to GitHub
git push origin main
```

### GUI:

1. Switch to the main branch by clicking the name of the branch in the bottom left of the screen.
2. Pull in any new changes from the `CHANGES` Heading > "..." > "Pull"
3. Open the command palette with `Ctrl+Shift+P`, search for "git: merge branch". Select the branch to merge into main.
4. Resolve conflicts displayed by VSCode
5. Commit resolved files with the big button
6. Open the command palette with `Ctrl+Shift+P`, search for "git: push", select it.