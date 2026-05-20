#!/usr/bin/env tsx
import { Command } from 'commander';
import { createCommand } from './commands/create';
import { addCommand } from './commands/add';
import { listCommand } from './commands/list';
import { doctorCommand } from './commands/doctor';

const program = new Command();

program
  .name('stax')
  .description('Stax CLI — install and manage modules')
  .version('0.1.0');

program.addCommand(createCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(doctorCommand);

program.parseAsync(process.argv);
