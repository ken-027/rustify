export default function authenticate(username: string, password: string) {
  return (
    username === process.env.R_USERNAME && password === process.env.R_PASSWORD
  );
}
