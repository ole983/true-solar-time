# 真太阳时 · 子午流注(成品网站)

天文级全中国城市真太阳时实时显示网站,纯前端、离线可用。

## 打开方式

- 本地:双击 `true-solar-time/index.html` 即可(全部功能离线可用,定位除外)。
- 局域网/服务器:把 `true-solar-time/` 文件夹整体作为静态目录。例 `npx serve true-solar-time` 后访问。
- PWA:联网首访会自动注册 `sw.js` 离线缓存,之后断网仍可打开5个页面。

## 页面

| 页面 | 说明 |
|---|---|
| `index.html` | 首页主钟:双钟对照(100ms)、太阳罗盘、EoT年曲线、今日时辰→北京时对照 |
| `cities.html` | 全国300+城实时总表(1秒)、CSV导出、点击行进主钟 |
| `liuzhu.html` | 子午流注:当令经脉、十二时辰对照、经脉详解 |
| `sun.html` | 全年日出正午日落曲线、昼长曲线、今日高度曲线、24节气日中表 |
| `science.html` | 公式、精度指标、一键自检(8项断言) |

## 算法

`astro.js`:Meeus Ch.25 + IAU1980章动9项;`app.js`:共享时辰/节气/城市逻辑;`cities.js`:300+城WGS84坐标。

## 部署

纯静态, pushing `true-solar-time/` 到 GitHub Pages / Vercel / 任意对象存储即可,无需构建。
