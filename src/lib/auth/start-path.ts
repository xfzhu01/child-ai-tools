export function getStartPath(isLoggedIn: boolean) {
  return isLoggedIn ? "/dashboard" : "/register";
}
