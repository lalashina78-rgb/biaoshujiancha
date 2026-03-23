# 项目设计规范 (Design Specifications)

本文档记录了项目中的核心 UI 设计规范，以确保整个应用在视觉和交互上保持高度一致。

## 1. 大卡片样式 (Card Styles)
用于包裹主要内容区块的容器（如项目基本信息、文件管理列表等）。
- **圆角 (Border Radius)**: `rounded-2xl` (16px)
- **投影 (Shadow)**: `shadow-sm` (浅色扁平化投影)
- **边框 (Border)**: `border border-gray-200`
- **背景色 (Background)**: `bg-white`

*Tailwind 示例: `className="bg-white rounded-2xl shadow-sm border border-gray-200"`*

## 2. 布局间距 (Layout Spacing)
用于控制大区块之间的纵向或横向间距。
- **大卡片间距 (Card Gap)**: 16px
- **Tailwind 类名**: `space-y-4` 或 `gap-4`

## 3. 列表项/版本项样式 (List / Version Items)
用于展示可折叠、可交互的列表项（如投标文件版本）。
- **默认背景色 (Default Background)**: 浅蓝色 `bg-blue-50/40`
- **悬浮背景色 (Hover Background)**: `bg-blue-50/80`
- **边框颜色 (Border Color)**: 浅蓝色 `border-blue-100`
- **展开状态内容区背景**: `bg-white`

*Tailwind 示例: `className="bg-blue-50/40 hover:bg-blue-50/80 border-blue-100"`*

## 4. 标签与徽标 (Badges & Tags)
用于展示状态、检查结果等小块信息。
- **风格**: 扁平化设计 (Flat Design)
- **投影**: 无投影 (去除 `shadow-sm` 等属性)
- **边框**: 细边框 `border border-gray-200` (或对应颜色的浅色边框)

## 5. 页面最大宽度 (Page Max Width)
用于限制内容区域在超大屏幕上的拉伸。
- **最大宽度**: 1400px
- **居中方式**: `mx-auto`
- **Tailwind 示例**: `className="max-w-[1400px] mx-auto"` (或在父容器统一设置)

## 6. 页面主体内容区域布局 (Main Content Area Layout)
用于规范页面级容器的内边距、对齐方式以及整体结构。
- **外层容器 (Wrapper)**: 通常使用 `flex flex-col h-full w-full space-y-4 pb-8 px-6` (宽度限制由父级统一控制)。
- **内容区内边距 (Padding)**: 页面左右通常保持 `px-6`，底部留白 `pb-8` 或 `pb-12` 以防止内容贴底。

## 7. 导航规范 (Navigation Specs)
用于规范页面顶部的导航栏、返回按钮及标题等元素。
- **顶部导航栏 (Top Header Bar)**: 采用 Flex 布局，左右两端对齐 (`flex items-center justify-between`)，底部通常留有一定间距（如 `mb-6`）或直接通过外层容器的 `space-y-4` 控制。
- **返回按钮 (Back Button)**: 
  - 风格：扁平化、无外框、无投影，图标大小通常为 `size={18}` 或 `size={20}`。
  - 交互：悬浮时带有浅色背景 (`hover:bg-gray-100`)。
  - Tailwind 示例: `className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"`
- **标题与面包屑 (Title & Breadcrumbs)**:
  - 面包屑/层级指引：使用小号字体 `text-xs text-gray-500`，可点击项增加 `hover:text-brand` 交互。
  - 页面主标题：使用 `text-xl font-bold text-gray-900`（若在详情卡片内作为大标题则用 `text-2xl font-extrabold`）。
- **右侧操作区 (Actions Area)**: 位于导航栏最右侧，多个操作按钮之间间距通常为 `gap-3`。
