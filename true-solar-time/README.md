# 真太阳时 · 子午流注(成品网站)

天文级全中国城市真太阳时实时显示网站,纯前端、离线可用、可安装为 PWA。

线上地址:https://ole983.github.io/true-solar-time/

## 设计原则

**白话结合文言,实用不失文化之魂。**

首屏只讲人话——今日几点睡、几点吃、当令经脉、宜忌三件事;天文公式与精度验证收进“天文原理”页兜底。四类人群各有刚需入口:养生作息、带娃晒娃、户外摄影、择吉命理。

## 页面

| 页面 | 说明 |
|---|---|
| `index.html` | 今日行动卡:当令时辰+今日三件事+四类人群要点+日出日落+金句;二级 Tab 切双钟/罗盘/十二时辰 |
| `cities.html` | 全国总表:默认 34 省会秒开,可展开全部 340 城,搜索排序、CSV 导出、脏检查秒级刷新 |
| `jieqi.html` | 二十四节气:精确交节时刻(分钟级)、倒计时、72 候、节气养生 |
| `tools.html` | 实用工具:真太阳⇄北京时间换算、摄影黄金/蓝调时刻、宝宝晒太阳计算器、节气海报生成 |
| `liuzhu.html` | 子午流注:当令经脉、十二时辰对照、经脉详解 |
| `sun.html` | 太阳轨迹:全年日出正午日落曲线、昼长曲线、今日高度曲线、节气日中表 |
| `science.html` | 天文原理:公式、精度指标、一键自检(8 项断言) |

## 算法

* `astro.js`:Meeus《Astronomical Algorithms》Ch.25 + IAU1980 章动 9 项,视黄经 ±0.01°、EoT ±8秒、日出落 ±30秒。
* `app.js`:共享时辰/节气/城市逻辑,四类人群要点、黄金时刻、晒太阳、真太阳换算、节气金句。
* `cities.js`:340 个地级市 WGS84 坐标,经度精度 ±1km。

真太阳时 = 北京时间 + (经度−120°)×4分 + 时差方程 EoT。

## 长尾 SEO 城市页

`city/` 目录下为 340 个城市的预渲染页,每页含该城市经度差、今日日出日落、当年二十四节气交节时刻与日中表,爬虫无需执行 JS 即可读取。

重新生成(每年或数据更新后):

```powershell
node scripts/gen-city-pages.js
```

脚本会重写 `city/*.html`、`city/city-index.html` 与 `sitemap.xml`(含全部城市页)。

## 本地预览

```powershell
cd true-solar-time
npx --yes serve -l 8000
# 打开 http://localhost:8000/index.html
```

或直接双击 `index.html`(定位功能需 http 服务)。

## 部署

纯静态,推送到 GitHub Pages 即上线。仓库根目录的 `.github/workflows/pages.yml` 只发布 `true-solar-time/` 子目录。

```powershell
git add true-solar-time
git commit -m "update: xxx"
git push
```

推送后约 1 分钟自动上线。Vercel / 任意对象存储同样适用,`vercel.json` 已配缓存头。

## 声明

内容为传统文化作息参考,不作医疗诊断依据。坐标取市政府驻地,县乡请按经度每度约 ±4 分钟自行修正。
