# @airdot/verifiers
Verify node types and discord types

## Installation
### Yarn (recommended)
```bash
yarn add @airdot/verifiers
```
### Node Package Manager (npm)
```bash
npm install @airdot/verifiers
```

## Questions, answers, and all that
[![Discord Server](http://invidget.switchblade.xyz/Rgxv5M6sq9)](https://discord.gg/Rgxv5M6sq9)

## Example Usage
```ts
import { Verifiers } from "@airdot/verifiers";

Verifiers.HexColor("#5865f2")\
//-> true

// false is for the `strict` setting
// to only allow protocol links
Verifiers.Link("discord.gg", false)
//-> true
```