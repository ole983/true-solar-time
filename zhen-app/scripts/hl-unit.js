const fs=require("fs");
global.window={};
eval(fs.readFileSync("E:/cursor/ZHOUJIE/true-solar-time/huangli.js","utf8"));
const T=window.TSTHuangli;
// 2026-09-22: 公历,查万年历应为戊午日(与择时页真太阳日柱一致性由页面级测试覆盖)
const dp=T.dayGZ(2026,9,22);
console.log("日柱:",dp.g+dp.z);
const hl=T.huangli(dp,"酉"); // 9月秋分后月建酉
console.log("建除:",hl.jianchu,"| 宜:",hl.yi.join(" "),"| 忌:",hl.ji.join(" "));
console.log(hl.chong,hl.sha,"| 胎神"+hl.taishen);
console.log("彭祖:",hl.pengzu);
// 十二建除轮转冒烟:12天各不同
const seq=[];for(let d=1;d<=12;d++){seq.push(T.huangli(T.dayGZ(2026,9,d),"酉").jianchu);}
console.log("9月1-12日建除:",seq.join(""));
console.log(new Set(seq).size===12?"轮转OK":"轮转异常");
