import chalk from "chalk"
import { createHash } from "crypto"

/**
 * These are functions to get colorfull outputs
 */

export function success(str: string) {
     console.log(chalk.bgGreen("✔ " + str))
}

export function error(str: string) {
     console.log(chalk.bgRedBright(chalk.black("⚠ " + str)))
}

export function info(str: string) {
     console.log(chalk.bgCyanBright(chalk.black("ℹ " + str)))
}