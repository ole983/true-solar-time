// 日柱三重验证:锚点 2000-01-01=戊午日(业界公认,本项目此前已用该锚点验出己卯丙子戊午戊午)
function jdn(y,m,d){var a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;}
var GAN=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"],ZHI=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
function gz(y,m,d){var i=((jdn(y,m,d)+49)%60+60)%60;return GAN[i%10]+ZHI[i%12]+"(idx"+i+")";}
// 验证1:锚点本身
console.log("2000-01-01:",gz(2000,1,1),"(期望戊午)");
// 验证2:天数差推算
var diff=jdn(2026,9,22)-jdn(2000,1,1);
console.log("相隔天数:",diff,"; (54+"+diff+")%60=",(54+diff)%60,"(己亥idx应为35)");
console.log("2026-09-22:",gz(2026,9,22),"(期望己亥)");
// 验证3:更多公开锚点
[["2024-02-10","甲辰"],["2025-01-29","戊戌"],["2026-01-01","乙亥"],["2000-01-01","戊午"]].forEach(([s,exp])=>{
  var [y,m,d]=s.split("-").map(Number);
  var got=gz(y,m,d).slice(0,2);
  console.log(s,got,got===exp?"✓":"✗(期望"+exp+")");
});
