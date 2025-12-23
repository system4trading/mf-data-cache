function runScreener(){
  const minRet = +fReturn.value/100 || 0;
  const maxRisk = +fRisk.value/100 || 1;

  const results = Object.entries(amfiData).filter(([code,data])=>{
    const r = mean(returns(data.map(x=>x.nav))) * 252;
    const v = stdev(returns(data.map(x=>x.nav))) * Math.sqrt(252);
    return r>=minRet && v<=maxRisk;
  });

  screenResults.innerHTML = results.slice(0,10)
    .map(r=>`<div>${r[0]}</div>`).join('');
}
