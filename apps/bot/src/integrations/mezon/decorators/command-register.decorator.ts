import { CommandStorage } from "#src/integrations";

export function Command(commandName: string): (target: any) => void {
  return function (target: any): void {
    CommandStorage.registerCommand(commandName, target);
  };
}

export function CommandDynamic(commandName: string): (target: any) => void {
  return function (target: any): void {
    CommandStorage.registerCommandDynamic(commandName, target);
  };
}