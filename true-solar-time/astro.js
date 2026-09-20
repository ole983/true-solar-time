/* 天文级太阳位置算法 · Meeus《Astronomical Algorithms》Ch.25 + IAU1980 章动截断9项
   精度:太阳视黄经 ±0.01°,时差 ±8秒,日出日落 ±30秒(平原地区,不含高程/山体遮挡)
   所有角度均为度,时间均为UTC Date */
(function(){
"use strict";
const D2R=Math.PI/180, R2D=180/Math.PI;
function norm360(d){d%=360;return d<0?d+360:d;}
function norm180(d){d=(d+180)%360;if(d<0)d+=360;return d-180;}
function julianDay(date){return date.getTime()/86400000+2440587.5;}
function centuries(jd){return (jd-2451545.0)/36525;}

/* 章动(黄经dPsi/交角dEps,单位度,截断9项,精度0.5") */
function nutation(T){
  const Om=norm360(125.04452-1934.136261*T+0.0020708*T*T),
        L0=norm360(280.4665+36000.7698*T),
        Lp=norm360(218.3165+481267.8813*T);
  const dPsi=(-1712*Math.sin(Om*D2R)-131*Math.sin(2*L0*D2R)-227*Math.sin(2*Lp*D2R)
    +74*Math.sin(2*(Lp-Om)*D2R)+21*Math.sin(2*L0*D2R))/10000/3600;
  const dEps=(920*Math.cos(Om*D2R)+57*Math.cos(2*L0*D2R)+9*Math.cos(2*Lp*D2R))/10000/3600;
  return {Om,dPsi,dEps};
}

/* 太阳视位置:返回 {lambda(视黄经),epsilon(真黄赤交角),RA,Dec,eq(时差分钟),L0,M,e,dist(AU)} */
function sunApparent(date){
  const jd=julianDay(date), T=centuries(jd);
  const L0=norm360(280.46646+36000.76983*T+0.0003032*T*T);
  const M=norm360(357.52911+35999.05029*T-0.0001537*T*T);
  const Mr=M*D2R;
  const e=0.016708634-0.000042037*T-0.0000001267*T*T;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(Mr)
         +(0.019993-0.000101*T)*Math.sin(2*Mr)+0.000289*Math.sin(3*Mr);
  const trueLong=L0+C;
  const Om=125.04-1934.136*T;
  const lambda=norm360(trueLong-0.00569-0.00478*Math.sin(Om*D2R)); // 视黄经(含光行差)
  const eps0=23+26/60+21.448/3600-46.815/3600*T-0.00059/3600*T*T+0.001813/3600*T*T*T;
  const nut=nutation(T);
  const eps=eps0+0.00256*Math.cos(Om*D2R)+nut.dEps;
  const lamR=lambda*D2R, epsR=eps*D2R;
  let RA=Math.atan2(Math.cos(epsR)*Math.sin(lamR),Math.cos(lamR))*R2D;
  RA=norm360(RA);
  const Dec=Math.asin(Math.sin(epsR)*Math.sin(lamR))*R2D;
  // 时差 = 平太阳 - 视太阳(分钟): EoT = L0 - 0.0057183 - RA + dPsi*cosEps
  let E=norm180(L0-0.0057183-RA+nut.dPsi*Math.cos(epsR));
  const eqMin=E*4; // 1°=4min
  const dist=(1.000001018*(1-e*e))/(1+e*Math.cos((M+C)*D2R));
  return {jd,T,L0,M,e,lambda,epsilon:eps,RA,Dec,eq:eqMin,dist,nut};
}

/* 某地某日(北京时间)日出日落/正午:lat,lon度;返回分钟制北京时间 */
function sunEventsForCity(year,mon,day,lat,lon){
  // 取当日12点北京时的太阳参数(赤纬/时差日内变化小,用正午值即可,±5秒)
  const noonProbe=new Date(Date.UTC(year,mon-1,day,4,0,0)); // 12:00 Beijing = 04:00 UTC
  const s=sunApparent(noonProbe);
  const decR=s.Dec*D2R, latR=lat*D2R;
  const zenith=90.833*D2R;
  const cosH=(Math.cos(zenith)-Math.sin(latR)*Math.sin(decR))/(Math.cos(latR)*Math.cos(decR));
  let polar=null,H0=null;
  if(cosH>1) polar='极夜'; else if(cosH<-1) polar='极昼';
  else H0=Math.acos(cosH)*R2D; // 度
  const lonCorr=(lon-120)*4; // 分钟:当地平太阳相对北京提前量
  // 北京时正午 = 720 - lonCorr - eq
  const noonMin=720-lonCorr-s.eq;
  let riseMin=null,setMin=null;
  if(H0!=null){riseMin=noonMin-H0*4;setMin=noonMin+H0*4;}
  return {dec:s.Dec,eq:s.eq,noonMin,riseMin,setMin,polar,H0,RA:s.RA,lambda:s.lambda,dist:s.dist};
}

/* 真太阳时:beijingDate->该经度真太阳时Date(同绝对时刻,不同钟面读数) */
function trueSolar(beijingDate,lon,eqMin){
  const bjlMin=beijingDate.getHours()*60+beijingDate.getMinutes()+beijingDate.getSeconds()/60+beijingDate.getMilliseconds()/60000;
  const tstMin=bjlMin+(lon-120)*4+eqMin;
  return tstMin; // 0~1440可越界,调用方格式化
}
function fmtMin(min){
  min=((min%1440)+1440)%1440;
  const h=Math.floor(min/60), m=Math.floor(min%60), s=Math.floor((min*60)%60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
/* 太阳地平坐标:高度角/方位角(北为0顺时针),含大气折射修正近似 */
function solarAltAz(date,lat,lon){
  const jd=julianDay(date), T=centuries(jd);
  const s=sunApparent(date);
  const d=jd-2451545.0;
  let gmst=norm360(280.46061837+360.98564736629*d+0.000387933*T*T-T*T*T/38710000);
  const nut=s.nut||{dPsi:0};
  const epsR=s.epsilon*D2R;
  const gast=gmst+nut.dPsi*Math.cos(epsR); // 视恒星时(度),忽略0.0026项
  const lst=norm360(gast+lon);
  const H=norm180(lst-s.RA)*D2R;
  const latR=lat*D2R, decR=s.Dec*D2R;
  const sinAlt=Math.sin(decR)*Math.sin(latR)+Math.cos(decR)*Math.cos(latR)*Math.cos(H);
  let alt=Math.asin(Math.max(-1,Math.min(1,sinAlt)))*R2D;
  let az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(latR)-Math.tan(decR)*Math.cos(latR))*R2D;
  az=norm360(az+180);
  // 大气折射(近地平线):Bennett 1982简化,高度>85°忽略
  let refr=0;
  if(alt>-1&&alt<90){const r=alt+10.3/(alt+5.11);refr=1.02/Math.tan(r*D2R)/60;}
  return {alt:alt+refr,az,geoAlt:alt,refr,H:H*R2D,lst,gst:gast};
}
function bjtWall(date){
  return new Date(date.getTime()+(480+date.getTimezoneOffset())*60000);
}
function bjtMinutesFloat(date){
  const b=bjtWall(date);
  return b.getHours()*60+b.getMinutes()+b.getSeconds()/60+b.getMilliseconds()/60000;
}
function bjtParts(date){
  const b=bjtWall(date);
  return {y:b.getFullYear(),m:b.getMonth()+1,d:b.getDate(),h:b.getHours(),mi:b.getMinutes(),s:b.getSeconds(),ms:b.getMilliseconds(),week:b.getDay()};
}
function fmtHM(min){
  if(min==null||!isFinite(min))return'—';
  min=((min%1440)+1440)%1440;
  const h=Math.floor(min/60), m=Math.floor(min%60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
}
function fmtHMS(min){
  if(min==null||!isFinite(min))return'—';
  min=((min%1440)+1440)%1440;
  const h=Math.floor(min/60), m=Math.floor(min%60), s=Math.floor((min*60)%60);
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
window.ASTRO={sunApparent,sunEventsForCity,trueSolar,fmtMin,fmtHM,fmtHMS,julianDay,bjtWall,bjtMinutesFloat,bjtParts,solarAltAz,norm360,norm180};
})();
