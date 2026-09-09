# Trip Planner（可公网访问的静态版）

这是一个可直接部署到静态托管平台（Cloudflare Pages 等）的旅行计划 Web App。  
技术栈：Next.js + React + TypeScript + Tailwind CSS（纯前端，无后端/数据库）。

## 功能清单

- 行程概览（标题、日期、出发地、目的地、描述）
- 航班信息与倒计时
- `#route` 路线页面（路线段、交通方式、时段、距离）
- 每日安排与地点清单
- 地图联动（优先高德，其次 Google，无 Key 降级 SVG 示意图）
- **CRUD 管理面板**：支持对概览/地点/路线/每日安排/待办进行增删改查
- 本地持久化：所有数据写入浏览器 `localStorage`，刷新不丢失

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 环境变量（可选）

在项目根目录创建 `.env.local`：

```env
# 高德（推荐）
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=

# Google（备选）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

> 若不配置任何地图 Key，应用会自动使用内置 SVG 地图示意图，核心功能可正常使用。

## 生产构建（静态导出）

```bash
npm run build
```

构建后会生成 `out/` 目录（纯静态资源），可直接托管。

本地预览静态产物：

```bash
npm run preview:static
```

默认访问 http://localhost:4173

---

## 部署到 Cloudflare Pages（推荐）

### 方式 A：连接 Git 仓库（最简单）

1. 将项目推送到 GitHub / GitLab。
2. 登录 Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**。
3. 选择 **Connect to Git**，选择仓库。
4. Build 配置填写：
   - **Framework preset**: `Next.js`（或 `None` 也可）
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. （可选）在 Pages 项目设置里添加环境变量：
   - `NEXT_PUBLIC_AMAP_KEY`
   - `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
6. 点击 Deploy，完成后会得到：
   - `https://<your-project>.pages.dev/`

### 方式 B：CLI 直接发布 `out/`

先确保已构建：

```bash
npm run build
```

然后：

```bash
npx wrangler pages deploy out --project-name <your-project-name>
```

成功后同样会返回 `https://<your-project-name>.pages.dev/`。

---

## 移动端与桌面端

页面采用响应式布局：
- 桌面端：路线/行程与地图双栏展示
- 移动端：自动堆叠为单栏、按钮与输入控件可触达

## 数据存储说明

- 存储键：`trip-planner-app:v2:trip`
- 首次打开：使用内置默认行程初始化
- 后续编辑：自动写入 `localStorage`
- 页面刷新后：读取本地数据并恢复状态
- 管理面板提供“重置全部为默认数据”按钮
