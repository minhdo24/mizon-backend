export class CommandStorage {
  private static commands = new Map<string, any>();
  private static commandDynamics = new Map<string, any>();

  static registerCommand(commandName: string, commandClass: any): void {
    this.commands.set(commandName, commandClass);
  }

  static getCommand(commandName: string): any {
    return this.commands.get(commandName);
  }

  static getAllCommands(): Map<string, any> {
    return this.commands;
  }

  static registerCommandDynamic(commandName: string, commandClass: any): void {
    this.commandDynamics.set(commandName, commandClass);
  }

  static getCommandDynamic(commandName: string): any {
    return this.commandDynamics.get(commandName);
  }

  static getAllCommandsDynamic(): Map<string, any> {
    return this.commandDynamics;
  }
}
