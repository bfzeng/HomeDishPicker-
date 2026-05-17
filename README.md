# HomeDishPicker 家常菜抽签系统

一个用于练习前端基础、Codex、Git、README 和版本控制的小项目。

## 项目目标

制作一个网页版家常菜随机抽签系统，帮助用户快速决定今天吃什么。

## 第一版功能

- 展示家常菜候选列表
- 点击按钮随机抽取一道菜
- 显示抽签结果
- 支持重复抽取

## 第二版功能

- 抽签时显示菜名滚动，最后定格到抽中的菜
- 输入冰箱现有食材，根据食材推荐可做菜品
- 抽签时优先从匹配食材的菜品中抽选
- 支持添加自己会做的菜到抽签库
- 自定义菜品会保存在当前浏览器中
- 每道菜都提供小红书教程搜索入口

## 当前版本

v2 已完成食材推荐、自定义菜品、滚动抽签和教程搜索入口。页面可以直接在浏览器中运行，不需要安装依赖。

## 技术栈

- HTML
- CSS
- JavaScript

## 项目结构

```text
HomeDishPicker/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── README.md
└── .gitignore
```

## 如何运行

直接用浏览器打开 `index.html`。

## 学习重点

- 使用 Codex 辅助规划和开发
- 使用 Git 记录项目版本
- 编写清晰的 README
- 将功能拆分成合理的 commit

## 推荐 Commit 划分

本项目第一版按照以下思路拆分提交：

- `chore: initialize project files`
- `docs: add initial README`
- `feat: add basic page structure`
- `style: add page layout and visual styles`
- `feat: implement random dish picker`
- `docs: update README with v1 usage`

## 后续计划

- 增加菜品分类
- 支持不重复抽取
- 保存历史抽签记录
- 支持删除或编辑自定义菜品
- 支持导入和导出抽签库
