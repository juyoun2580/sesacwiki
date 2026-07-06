<table align="center"><tr><td>

```
                        * *    
                    *    *  *
                *  *    *     *  *
                *     *    *  *    *
            * *   *    *    *    *   *
            *     *  *    * * .#  *   *
            *   *     * #.  .# *   *
            *     "#.  #: #" * *    *
            *   * * "#. ##"       *
            *       "###
                        "##
                        ##.
                        .##:
                        :###
                        ;###
                        ,####.
            /\/\/\/\/\/.######.\/\/\/\/\

   _____                       __          ___ _    _ 
  / ____|                      \ \        / (_) |  (_)
 | (___   ___  ___  __ _  ___   \ \  /\  / / _| | ___ 
  \___ \ / _ \/ __|/ _` |/ __|   \ \/  \/ / | | |/ / |
  ____) |  __/\__ \ (_| | (__     \  /\  /  | |   <| |
 |_____/ \___||___/\__,_|\___|     \/  \/   |_|_|\_\_|
                                                      
                                                      
```

</td></tr></table>

<p align="center">
<img src="https://img.shields.io/badge/HTML-E34F26?logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/JSON-000000?logo=json&logoColor=white" />
</p>

## What is Sesac Wiki?

**Sesac Wiki** is a lightweight learning platform built with **Vanilla JavaScript** for organizing and studying programming knowledge.

It provides an intuitive interface for exploring technical topics, practicing quizzes, tracking learning progress, and managing personal study resources—all without relying on a frontend framework.

Designed with maintainability in mind, the project emphasizes reusable components, clear architecture, and scalable project organization.

---

## Key Features

- 📚 Browse programming concepts through an organized wiki
- 📝 Take quizzes to reinforce learning
- ⭐ Save favorite articles and vocabulary
- 📖 Manage personal study notes and documents
- 💼 Track job preparation progress
- 🧩 Reusable UI component system
- 📦 JSON-driven content management
- 📱 Responsive layout for multiple screen sizes

---

## Architecture

The project follows a **Multi-Page Application (MPA)** architecture with a component-based UI system.

Core principles include:

- **Reusable Components** (Header, Navigation, Toast, Modal, etc.)
- **Separation of Concerns** between HTML, CSS, JavaScript, and JSON
- **Page-specific assets** organized independently
- **JSON-driven data structure** for scalable content management
- **Design Token** based styling for consistent UI

---

## Project Structure

```text
sesac-wiki/
│
├── index.html           # Home (the only screen outside pages/)
├── components/          # Shared HTML fragments, injected at runtime via fetch()
│   ├── header.html
│   └── nav.html
│
├── pages/               # Every other screen, one folder per feature group
│   ├── auth/
│   ├── wiki/
│   ├── exam/
│   ├── handbook/
│   └── my/
│
├── assets/
│   ├── css/
│   ├── js/
│   ├── data/
│   └── img/
│
├── supabase/            # Supabase schema (DDL)
├── docs/                # Project documentation
├── README.md
└── CLAUDE.md
```

---

## Contributor

<a href="https://github.com/juyoun2580/sesacwiki/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=juyoun2580/sesacwiki" />
</a>

Made with [contrib.rocks](https://contrib.rocks).