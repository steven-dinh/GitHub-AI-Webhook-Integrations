# Repo Info

Tool that connects with integrates GitHub pull requests and provides intelligent AI suggestions, to understand context, suggesting architectural improvements, and flagging potential security problems.

# Setup

## Using HTTPS to clone.

```bash
git clone https://github.com/nguyendy630/GitHub-AI-Webhook-Integrations.git .
```

## Install Dependencies
```bash
npm install
```

## Directory
```
node_modules
src
.env -> MUST ADD.
.env.template -> TEMPLATE TO FOLLOW
.gitignore
LICENSE
```

## Webhook Integration is using Octokit for reading pull request information
<a href="https://actions-cool.github.io/octokit-rest/api/actions
">OctoKit API Documenation</a>
