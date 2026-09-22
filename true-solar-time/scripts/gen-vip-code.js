/* 激活码生成器(与 app.js 中 VIP.verify 同一算法)
   用法:
     node scripts/gen-vip-code.js M 31      # 月度 31 天
     node scripts/gen-vip-code.js Q 93      # 季度 93 天
     node scripts/gen-vip-code.js Y 366     # 年度 366 天
     node scripts/gen-vip-code.js A 31      # 连续包月(每期一张)
     node scripts/gen-vip-code.js batch Y 366 10   # 批量 10 张
   注意:算法与密钥在前端可被逆向,本方案仅用于低价值场景的防误输。
   若要更强防盗,应改为服务端签发+校验。 */
const VIP_SALT = "TST-2026-ziwuliuzhu-ole983";
const PLANS = { A:"连续包月", M:"月度会员", Q:"季度会员", Y:"年度会员" };

function vipSign(p){ let h=5381; const s=p+"|"+VIP_SALT;
  for(let i=0;i<s.length;i++){ h=((h<<5)+h+s.charCodeAt(i))>>>0; }
  return h.toString(36).toUpperCase().slice(-4).padStart(4,"0"); }

function make(plan,days,serial){ return "TST-"+plan+"-"+days+"-"+serial+"-"+vipSign(plan+days+serial); }
function randSerial(){
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s="";
  for(let i=0;i<4;i++) s+=c[Math.floor(Math.random()*c.length)];
  return s;
}

const [,,plan,daysArg,countArg] = process.argv;
if(!plan||!daysArg){ console.log("用法: node scripts/gen-vip-code.js <A|M|Q|Y> <天数> [数量]"); process.exit(0); }
const days = parseInt(daysArg,10);
if(!PLANS[plan]){ console.error("未知档位:"+plan+"(可选 A/M/Q/Y)"); process.exit(1); }
if(!(days>0&&days<=4000)){ console.error("天数需在 1..4000"); process.exit(1); }
const n = Math.max(1, parseInt(countArg||"1",10));

console.log("档位:"+PLANS[plan]+"  天数:"+days+"  共 "+n+" 张");
const seen=new Set();
for(let i=0;i<n;i++){
  let code;
  do{ code=make(plan,days,randSerial()); }while(seen.has(code));
  seen.add(code);
  console.log("  "+code);
}
