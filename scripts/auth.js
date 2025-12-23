export function login(email) {
  localStorage.setItem("user", email);
  localStorage.setItem("plan", "advisor");
}

export function hasFeature(feature) {
  const plan = localStorage.getItem("plan");
  return plan === "advisor";
}
