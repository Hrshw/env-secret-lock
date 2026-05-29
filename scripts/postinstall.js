import fs from 'fs';

const C_GREEN = '\x1b[32m';
const C_CYAN = '\x1b[36m';
const C_BOLD = '\x1b[1m';
const C_RESET = '\x1b[0m';
const C_PURPLE = '\x1b[35m';

console.log(`\n${C_PURPLE}╭────────────────────────────────────────────────────────────╮${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  ${C_BOLD}✦ secret-lock installed successfully! ✦${C_RESET}                   ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}├────────────────────────────────────────────────────────────┤${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  ${C_GREEN}You are now ready to secure your developer environment.${C_RESET}    ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}                                                            ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  ${C_CYAN}Quickstart:${C_RESET}                                                ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  1. Run ${C_BOLD}secret-lock hook install${C_RESET} to protect Git.          ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  2. Run ${C_BOLD}secret-lock encrypt${C_RESET} to secure your .env file.     ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}                                                            ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  ⭐ ${C_BOLD}Enjoying the tool?${C_RESET} Support us with a star on GitHub!    ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}│${C_RESET}  👉 ${C_CYAN}https://github.com/Hrshw/env-secret-lock${C_RESET}                ${C_PURPLE}│${C_RESET}`);
console.log(`${C_PURPLE}╰────────────────────────────────────────────────────────────╯${C_RESET}\n`);
