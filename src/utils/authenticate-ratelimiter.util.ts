export default function authenticate(username: string, password: string) {
  console.log(process.env.R_PASSWORD);

  return (
    username === process.env.R_USERNAME && password === process.env.R_PASSWORD
  );
}
