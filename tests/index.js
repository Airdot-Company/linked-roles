const { Verifiers } = require("../dist/index");
require("colors");

(() => {
    console.log(`Running Hex Color Tests:`.blue + `
• aaa is hex color string: ${Verifiers.HexColor("aaa")}
• #5865f2 is hex color string: ${Verifiers.HexColor("#5865f2")}`.gray);
})();

(() => {
    console.log(`Running Link Tests:`.blue + `
• aaa is link: ${Verifiers.Link("aaa")}
• https://discord.gg/ is link: ${Verifiers.Link("https://discord.gg/")}
• (unstrict) discord.gg is link: ${Verifiers.Link("discord.gg", false)}
• (strict) discord.gg is link: ${Verifiers.Link("discord.gg")}`.gray);
})();