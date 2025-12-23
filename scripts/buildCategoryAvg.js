function CAGR(p, years) {
  return Math.pow(p[p.length-1]/p[p.length-1-years*252], 1/years)-1;
}
