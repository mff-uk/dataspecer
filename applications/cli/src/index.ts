#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {generate} from "./commands/generate";

require('dotenv-defaults').config({
    path: ".env.local",
    defaults: ".env",
});

/**
 * Main script that routes different commands and parses the command line.
 */

yargs(hideBin(process.argv))
    .command(
        'generate <data-specification-iri>',
        'Generate artifacts from the given data specification.',
        yargs => yargs.option("backend-url", {
            type: "string",
            default: process.env.BACKEND,
            describe: "The URL of the backend to use.",
        }),
        generate as any,
    )
    .version(false)
    .demandCommand(1, "You need to specify command.")
    .parse();
