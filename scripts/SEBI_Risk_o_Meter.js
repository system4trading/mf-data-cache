function updateRiskMeter(vol){
  let level = 'low';
  if(vol > 0.25) level='very-high';
  else if(vol > 0.20) level='high';
  else if(vol > 0.15) level='moderate';

  document.getElementById('riskSvg').src = `risk-${level}.svg`;
}
