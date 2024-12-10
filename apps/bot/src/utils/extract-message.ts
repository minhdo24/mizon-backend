export function extractMessage(message: string): [string, string[]] {
  const args = message.replace("\n", " ").slice("*".length).trim().split(/ +/);
  let command: string;
  if (args.length > 0) {
    command = args.shift().toLowerCase();
    return [command, args];
  } else return [command, []];
}
