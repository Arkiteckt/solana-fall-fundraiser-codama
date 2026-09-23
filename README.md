# Fundraiser × Codama: A Client Generation Challenge

> **Solana Fall School · Assignment** · Anchor 1.1.2 · [Codama](https://github.com/codama-idl/codama) CLI 1.6.3 · `@solana/kit` 8.3.0 · Tests in TypeScript with Mocha · 3 TODOs + 1 bonus

**You wrote the program. Now let a machine write the client.**

This repo is the fundraiser program from the last assignment, unchanged. The Anchor tests pass. `tests/codama.ts` does not: it has three TODOs that can only be filled with a TypeScript client you have not generated yet. Your job is to hand the program's IDL to Codama, generate that client, and prove in three short tests that it reads the same bytes and produces the same instructions as the `@coral-xyz/anchor` client you have been using all along.

| Checkpoint | Section | When you finish this |
| --- | --- | --- |
| 00 | [Setup: Fork the repo](#00--setup-fork-the-repo) | Your own copy, with the pinned toolchain installed |
| 01 | [Starting point: Build, and find the IDL](#01--starting-point-build-and-find-the-idl) | Fundraiser tests green, three `TODO` tests red, IDL located |
| 02 | [Configure: `codama init`](#02--configure-codama-init) | A `codama.json` pointing at the right IDL |
| 03 | [Generate: `codama run`, and read what came out](#03--generate-codama-run-and-read-what-came-out) | Seventeen files in `clients/js`, and you know which four exports you need |
| 04 | [TODO 1 · Decode an account](#04--todo-1--decode-an-account) | The generated decoder reads bytes Anchor wrote |
| 05 | [TODO 2 · Encode an instruction](#05--todo-2--encode-an-instruction) | Codama's `contribute` is byte-identical to Anchor's |
| 06 | [TODO 3 · Let it resolve accounts](#06--todo-3--let-it-resolve-accounts) | Optional accounts filled in, and you can say why two were not |
| 07 | [Bonus: Send it](#07--bonus-send-it) | A Kit instruction goes through the web3.js provider |
| ? | [When it breaks: Troubleshooting](#when-it-breaks-troubleshooting) | Look up the error |
| | [Codama and Kit cheat sheet](#codama-and-kit-cheat-sheet) | API reference for the pinned versions |

---

## What Codama is

Anchor already gives you an IDL: a JSON description of every instruction, account and type in your program. `@coral-xyz/anchor` reads that IDL at runtime and builds `program.methods.contribute()` for you dynamically. Codama does the same job at build time. It reads the IDL once, turns it into a tree of nodes, and renders real TypeScript files: a decoder per account, a builder per instruction, a finder per PDA. No Anchor dependency, no `any`. Codama is the generator behind many modern Solana program clients, including the `@solana-program/*` clients; Metaplex uses closely related IDL-driven tooling (Kinobi, Codama's predecessor) for its Umi clients.

```
  anchor build ──▶ target/idl/fundraiser.json ──▶ codama run js ──▶ clients/js/src/generated/
                                                                          ├── accounts/      getFundraiserDecoder()
                                                                          ├── instructions/  getContributeInstruction()
                                                                          ├── pdas/          findContributorAccountPda()
                                                                          └── programs/      FUNDRAISER_PROGRAM_ADDRESS
```

### What is different about this assignment

Nothing here is open-ended. There is one right `codama.json`, three TODOs with one obvious way to fill each, and a single question to answer in prose. If you get the config right, the generated client does most of the work; the tests are there to make you read what it generated rather than trust it.

The question, which is the graded part: when Codama builds a `contribute` instruction for you, it can fill in `contributorAccount`, `contributorAta`, `tokenProgram` and `systemProgram` by itself, but it makes you pass `fundraiser` and `vault`. All four PDAs have seeds in the IDL. Why the difference? Checkpoint 06 walks you to the answer; you write it in `NOTES.md`.

### The files you will touch

| File | What it is |
| --- | --- |
| `codama.json` | Does not exist yet. Checkpoint 02 creates it. Commit it. |
| `clients/js/` | Does not exist yet. Checkpoint 03 generates it. Gitignored; the config is what you submit, not its output. |
| `tests/codama.ts` | Setup written, three TODOs empty, one bonus skipped. Your work. |
| `tests/helpers/kit-adapter.ts` | Twenty lines that turn a Kit instruction into a web3.js one. Read it for the bonus. |
| `tests/fundraiser.ts`, `tests/time-window*.ts` | The original suite. Must stay green. |
| `NOTES.md` | Does not exist yet. Your answer to the checkpoint 06 question, plus versions. |
| `programs/fundraiser/` | Unchanged. You will not edit a `.rs` file, only read seeds in two of them. |

---

## 00 · Setup: Fork the repo

**When you finish this:** your own copy of the assignment on GitHub and on your machine, with the pinned toolchain installed.

1. Open [github.com/decentra1ized/solana-fall-fundraiser-codama](https://github.com/decentra1ized/solana-fall-fundraiser-codama) and click **Fork**, top right.
2. Clone *your fork*, not the original. Put your GitHub username in the link.

```bash
git clone https://github.com/YOUR-USERNAME/solana-fall-fundraiser-codama.git
cd solana-fall-fundraiser-codama
yarn install
```

### Tools this repo expects

| Tool | Version | How to get it |
| --- | --- | --- |
| Anchor CLI | 1.1.2 | `avm install 1.1.2 && avm use 1.1.2`. The program pins `anchor-lang` to `=1.1.2`, so the CLI has to match |
| Solana CLI | 3.1.10 | [Agave installer](https://docs.anza.xyz/cli/install). Anchor 1.x targets Solana 3.x and recommends 3.1.10 |
| Node | 20.18 or newer | With `yarn`. Anchor 1.x tooling requires Node 20.18+ |
| Surfpool | current | Anchor 1.x `anchor test` boots [Surfpool](https://surfpool.run) instead of `solana-test-validator`. Install it, or pass `anchor test --validator legacy` every time |

```bash
anchor --version     # anchor-cli 1.1.2
solana --version     # solana-cli 3.1.10
node --version       # v20.18 or newer
surfpool --version   # or plan to use --validator legacy
```

### Packages this repo pins

| Package | Version | What it gives you |
| --- | --- | --- |
| `@codama/cli` | 1.6.3 | `codama init`, `codama run` |
| `@codama/nodes-from-anchor` | 1.5.6 | Reads an Anchor IDL into Codama's node tree |
| `@codama/renderers-js` | 2.5.0 | Renders the node tree as TypeScript for `@solana/kit` |
| `@solana/kit` | 8.3.0 | What the generated code imports. `@solana/program-client-core`, which it also imports, comes with it |
| `@coral-xyz/anchor` | ^0.32.1 | The Anchor TypeScript client you used last week; the tests compare Codama's output against it. See the note below on the package name |

> **One package name, two eras.** The program is Anchor 1.1.2. The TypeScript client is `@coral-xyz/anchor` 0.32.1, the last release under the old package name; Anchor 1.0 renamed it to `@anchor-lang/core` with the same API and the same IDL format. This repo keeps 0.32.1 to stay identical to the fundraiser assignment you forked last week, so nothing about the Anchor side of the tests is new.

> **Why exact pins.** `renderers-js` minor releases raise the minimum Kit version, and Kit majors change the type of an instruction. The lockfile pairs `renderers-js 2.5.0` with `kit 8.3.0`; that pair is what the answer key was run against. `codama init` would offer to install these for you, but it installs whatever is newest, and newest is not what the tests were written against. `yarn install` first, then `init` has nothing to install.

Push after each checkpoint, so your progress is saved:

```bash
git add -A && git commit -m "checkpoint 2: codama.json" && git push
```

---

## 01 · Starting point: Build, and find the IDL

**When you finish this:** the fundraiser suite is green, the three `TODO` tests are red for the right reason, and you can point at the line in the IDL that checkpoint 06 is about.

```bash
anchor build
anchor keys sync     # first time only
anchor build         # yes, again
anchor test          # or: anchor test --validator legacy
```

> **Surfpool.** Anchor 1.x runs `anchor test` against Surfpool by default. If `anchor test` stops before Mocha starts with a message about Surfpool not being found, either install it (see the toolchain table) or add `--validator legacy` to use `solana-test-validator` as before. Pick one and use it for the whole assignment.

> **Build twice, on purpose.** The repo declares a program id whose keypair it does not ship. Your first `anchor build` mints a different one and `anchor keys sync` rewrites `declare_id!` and `Anchor.toml` to match; you did this last time. What is new: the IDL at `target/idl/fundraiser.json` carries the program address too, and Codama copies it straight into the generated client. An IDL built *before* `keys sync` gives you a client that points at a program that does not exist. Rebuild after syncing, every time the id changes.

`anchor test` should end with the fundraiser suite green and **three red tests in `codama`**, each failing with a message that starts `TODO`. That is the correct starting state. If `fundraiser.ts` is red too, fix that before you go on.

### Open the IDL

Before you hand it to a tool, read the thing you are handing over. `target/idl/fundraiser.json` is a few hundred lines; you care about three shapes.

| Key | Holds | Codama turns it into |
| --- | --- | --- |
| `address` | The program id | `FUNDRAISER_PROGRAM_ADDRESS` |
| `instructions[]` | Name, 8-byte discriminator, accounts with `pda` seeds, args | `getContributeInstruction()` and friends |
| `accounts[]` + `types[]` | Name, discriminator, field layout | `getFundraiserDecoder()`, `fetchFundraiser()` |

Find the `contribute` instruction and look at the `fundraiser` account inside it. Its seeds look like this:

```json
"pda": {
  "seeds": [
    { "kind": "const",   "value": [102, 117, 110, 100, 114, 97, 105, 115, 101, 114] },
    { "kind": "account", "path": "fundraiser.maker", "account": "Fundraiser" }
  ]
}
```

Now find the same account in `initialize`. The second seed there is `{ "kind": "account", "path": "maker" }`, with no dot. Keep that difference in your head; checkpoint 06 is entirely about it.

> **Where the discriminators come from.** Every instruction and account starts with 8 bytes Anchor derives from its name: `sha256("global:contribute")[..8]` for instructions, `sha256("account:Fundraiser")[..8]` for accounts. They are written into the IDL as plain arrays, and Codama copies them into constants like `CONTRIBUTE_DISCRIMINATOR`. Those are the first 8 of the 16 bytes you will compare in checkpoint 05.

---

## 02 · Configure: `codama init`

**When you finish this:** a `codama.json` at the repo root that points at the right IDL and renders only the JavaScript client.

```bash
npx codama init
```

Four prompts. Three of the defaults are wrong for this repo.

| Prompt | Default | Answer |
| --- | --- | --- |
| Where is your IDL located? | `program/idl.json` | `target/idl/fundraiser.json` |
| Which script preset would you like to use? | JS *and* Rust selected | JS only. Press `space` on Rust to deselect, then `enter` |
| [js] Where is the JavaScript client package located? | `clients/js` | `clients/js` (keep it) |

The Rust prompt only appears if you left Rust selected. If it does, you have gone one step too far: `Ctrl-C`, delete `codama.json`, start over.

> **Don't use `--default`.** It answers every prompt with the default, which means it points at an IDL that does not exist, selects the Rust renderer, and then tries to install `@codama/renderers-rust`, which is not in the lockfile. You will wait a long time for something you did not want.

You should end up with this file:

```json
{
    "idl": "target/idl/fundraiser.json",
    "before": [],
    "scripts": {
        "js": {
            "from": "@codama/renderers-js",
            "args": ["clients/js"]
        }
    }
}
```

Read it as a pipeline: load `idl`, run every visitor in `before` (none yet), then for each script run its visitor with its args. `from` is a package whose default export is a visitor; `args` are passed to it. That is the entire configuration model.

**Commit this file.** It is the proof you did the assignment, and it is small. The generated output in `clients/` is gitignored; anyone can regenerate it from your config.

---

## 03 · Generate: `codama run`, and read what came out

**When you finish this:** `clients/js/src/generated/` exists, `tests/codama.ts` compiles with the import uncommented, and you know which four exports you need.

```bash
npx codama run js
find clients -type f | sort
```

```
clients/js/package.json
clients/js/src/generated/accounts/contributor.ts
clients/js/src/generated/accounts/fundraiser.ts
clients/js/src/generated/errors/fundraiser.ts
clients/js/src/generated/index.ts
clients/js/src/generated/instructions/checkContributions.ts
clients/js/src/generated/instructions/contribute.ts
clients/js/src/generated/instructions/initialize.ts
clients/js/src/generated/instructions/refund.ts
clients/js/src/generated/pdas/contributorAccount.ts
clients/js/src/generated/pdas/fundraiser.ts
clients/js/src/generated/programs/fundraiser.ts
(plus an index.ts per folder)
```

Seventeen files from one JSON. Do not treat them as a black box; you will need four exports from them, and knowing where each lives is most of the work.

| Folder | One file per | You will use |
| --- | --- | --- |
| `accounts/` | `#[account]` struct | `getFundraiserDecoder()`: bytes in, typed object out |
| `instructions/` | instruction | `getContributeInstruction()` and `getContributeInstructionAsync()` |
| `pdas/` | PDA whose seeds Codama could fully express | Nothing directly; the Async builder calls these for you |
| `programs/` | program | `FUNDRAISER_PROGRAM_ADDRESS` |
| `errors/` | program | Nothing today, but note every `#[msg]` is there |

### 1 · Open `instructions/contribute.ts`

Find the type `ContributeAsyncInput`. Some of its fields end in `?`. Write down which. Then find the block that starts `// Resolve default values.` That is the code that fills the optional ones in. Each `if (!accounts.X.value)` corresponds to one `?`.

### 2 · Open `pdas/`

Two files: `fundraiser.ts` and `contributorAccount.ts`. The vault is not there, because it is an associated token account and Codama inlines that derivation into the instruction rather than giving it a finder. Nothing for `contribute`'s `fundraiser` either, in that instruction. Hold the thought.

### 3 · Uncomment the import

At the top of `tests/codama.ts`:

```ts
import {
  getFundraiserDecoder,
  getContributeInstruction,
  getContributeInstructionAsync,
  FUNDRAISER_PROGRAM_ADDRESS,
} from "../clients/js/src/generated";
```

Run `anchor test`. The three TODO tests still fail with `TODO` messages, but they compile. If instead you see `Cannot find module '../clients/js/src/generated'`, the generator did not run or your `codama.json` points somewhere else.

> **Two libraries, one program.** Every generated file imports from `@solana/kit`. Your tests import from `@solana/web3.js` and `@coral-xyz/anchor`. They do not share types: Kit's `Address` is a branded `string`, web3's `PublicKey` is a class; Kit decodes `u64` as `bigint`, Anchor as `BN`. You will cross this border in every TODO, always in the same two ways: `address(pk.toBase58())` going in, and `BigInt(n)` when comparing numbers.

---

## 04 · TODO 1 · Decode an account

**When you finish this:** the generated decoder reads the `Fundraiser` account that Anchor wrote, and the two clients agree on every field.

The `before()` hook in `tests/codama.ts` has already opened a campaign and made one contribution using `program.methods`, the Anchor client. The account exists on the local validator. Read it with the *other* client.

### The steps

1. Assert `FUNDRAISER_PROGRAM_ADDRESS === program.programId.toBase58()`. One line, and it catches the "built the IDL before keys sync" mistake before it costs you an hour in checkpoint 05.
2. Get the raw bytes with web3.js: `provider.connection.getAccountInfo(fundraiser)`. You want `.data`.
3. Hand them to `getFundraiserDecoder().decode(...)`. Pass the whole buffer; the decoder consumes the 8-byte discriminator itself.
4. Read the same account with Anchor, `program.account.fundraiser.fetch(fundraiser)`, and assert the two agree.

### The types you get back

| Field | Anchor `fetch()` | Codama `decode()` | Compare with |
| --- | --- | --- | --- |
| `maker` | `PublicKey` | `Address` (a base58 `string`) | `maker.publicKey.toBase58()` |
| `amountToRaise` | `BN` | `bigint` | `BigInt(TARGET)` |
| `duration`, `bump` | `number` | `number` | directly |

Both clients camel-case the Rust field names, so the property names match. Only the value types differ.

> **Why not `fetchFundraiser()`?** It exists, and it is the function you would use in a real Kit app: `fetchFundraiser(rpc, address)`. But it wants a Kit `Rpc` object, and your test has a web3.js `Connection`. Standing up a second RPC client for one fetch is more ceremony than the assignment deserves. The decoder is the layer underneath `fetchFundraiser`; using it directly shows you that the interesting part, the byte layout, has nothing to do with the transport.

**Check yourself:** TODO 1 is green. Change `BigInt(TARGET)` to `TARGET` and watch it go red: `30000000n` is not `30000000` to `strictEqual`. Change it back.

---

## 05 · TODO 2 · Encode an instruction

**When you finish this:** a `contribute` instruction built by Codama is byte-for-byte equal to one built by Anchor, accounts in the same order.

Two clients, two code paths, one wire format. The Anchor half is already in the test: `program.methods.contribute(...).accountsPartial({...}).instruction()` gives you a `TransactionInstruction` with `.data` and `.keys`. Your half is `getContributeInstruction()`, the synchronous one, where you pass every account.

### Crossing the border

The generated function will not accept a `PublicKey`. Two conversions, and you will use both in every Kit call from now on:

```ts
import { address, createNoopSigner } from "@solana/kit";

fundraiser:  address(fundraiser.toBase58()),                           // any account
contributor: createNoopSigner(address(provider.publicKey.toBase58())), // a signer
```

A "noop signer" is a signer that never signs; it just carries an address so the account gets the right `role`. Nobody sends this instruction; you are comparing bytes. The `amount` arg accepts `number | bigint`, so `AMOUNT` as-is is fine.

### What to assert

```ts
assert.isTrue(Buffer.from(kitIx.data).equals(anchorIx.data), "instruction data differs");
assert.deepStrictEqual(
  kitIx.accounts.map((a) => a.address),
  anchorIx.keys.map((k) => k.pubkey.toBase58()),
  "account order differs",
);
```

Sixteen bytes of data: 8 for the discriminator, 8 for the little-endian `u64`. Eight accounts in IDL order. If both pass, the client Codama generated and the client Anchor builds at runtime produce transactions the program cannot tell apart.

> **Data matches, accounts don't.** You passed a different address for the same role, usually `contributorAta` derived for the wrong owner or `vault` without `allowOwnerOffCurve = true`. The test file already has the correct values in scope (`contributorAccount`, `contributorAta`, `vault`); use those variables rather than re-deriving.

**Check yourself:** TODO 2 is green. Change `amount: AMOUNT` to `amount: AMOUNT + 1`; exactly one byte should differ and the data assertion should fail. Change it back.

---

## 06 · TODO 3 · Let it resolve accounts

**When you finish this:** the Async builder fills in four accounts you did not pass, and you have written down why it could not fill in the other two.

Now the `Async` variant. It has the same shape as the sync one, except some inputs are optional, and when you leave them out it derives them from the IDL's seeds. This is what a generated client buys you over hand-written `findProgramAddressSync` calls: the derivation lives in one place, and that place is the program's own IDL.

### 1 · Find the minimum input

Call `getContributeInstructionAsync()` with the fewest inputs TypeScript will accept. Start with just `contributor` and `amount`, read the error, add what it demands, repeat. You will end up with exactly four accounts.

### 2 · Assert on what it filled in

```ts
const got = ix.accounts.map((a) => a.address);
assert.strictEqual(got[3], contributorAccount.toBase58());   // a PDA, from pdas/
assert.strictEqual(got[4], contributorAta.toBase58());       // an ATA, inlined
assert.strictEqual(got[6], TOKEN_PROGRAM_ID.toBase58());     // a constant
```

### 3 · Answer the question, in `NOTES.md`

You had to pass `fundraiser` and `vault`. You did not have to pass `contributorAccount` or `contributorAta`. All four are PDAs with seeds in the IDL. Why the difference?

Go back to `programs/fundraiser/src/instructions/contribute.rs` and read the seeds of each. Then read the seeds of `fundraiser` in `initialize.rs`, and open `ContributeAsyncInput` next to `InitializeAsyncInput` in the generated code. The same account is optional in one and required in the other. Write your answer, two or three sentences, in a `NOTES.md` at the repo root, along with your tool versions.

> **If you have stared at the seeds and it isn't clicking.** Ask, for each seed: is this something the caller already has in hand, or is it something *inside* the account we are trying to find? A finder can only use inputs it has. If the address of X depends on a field of X, you need X to find X.

> **Is this a Codama limitation or a program-design choice?** Both, and the second is the more useful reading. Look at how `refund.rs` declares the same `fundraiser` account. It takes `maker` as an explicit account and seeds off `maker.key()`, so in the generated `RefundAsyncInput`, `fundraiser` is optional again. `contribute` chose not to take `maker`, saving one account in the transaction, and paid for it in every client that ever tries to derive the PDA. Neither choice is wrong. Knowing it is a choice is the point.

**Check yourself:** TODO 3 is green. In your head, name the four optional and two required accounts without looking. Then say in one sentence why `fundraiser` is required here and optional in `initialize`. If you can, you are done with the hard part.

---

## 07 · Bonus: Send it

**When you finish this:** a Codama-built instruction has gone through the Anchor provider and moved real tokens into the vault.

Everything so far compares bytes without touching the chain. The obstacle to sending is the border again: a Kit `Instruction` is `{ programAddress, accounts: [{ address, role }], data }`; web3.js wants `{ programId, keys: [{ pubkey, isSigner, isWritable }], data }`. `tests/helpers/kit-adapter.ts` converts one into the other; read it, it is twenty lines. Then:

```ts
const ix = await getContributeInstructionAsync({ /* same four inputs as TODO 3 */ });
await provider.sendAndConfirm(new anchor.web3.Transaction().add(toWeb3Instruction(ix)));
```

The noop signer's address is the provider wallet, so the provider signs for real. Change `it.skip` to `it`. The cap is 10% of the target per contributor and you are at one token of a possible three, so the second contribution is legal.

### Definition of done

- [ ] `codama.json` committed, pointing at `target/idl/fundraiser.json`, JS renderer only.
- [ ] `tests/codama.ts`: import uncommented, TODO 1, 2 and 3 pass under `anchor test`.
- [ ] `tests/fundraiser.ts` and `tests/time-window*.ts` still pass.
- [ ] `NOTES.md` at the repo root: which accounts are required vs optional in `ContributeAsyncInput`, why, and why the same account is optional in `initialize`. Plus `anchor --version`, `node --version`, `npx codama --version`.
- [ ] `clients/` is not committed. `git status` should never show it.
- [ ] Bonus, optional: the fifth test un-skipped and green.

> **You are done when** the three TODOs are green, `NOTES.md` explains the two required accounts in terms of their seeds, and `codama.json` is in the commit. Push it.

```bash
git add codama.json tests/codama.ts NOTES.md
git commit -m "Codama client: three TODOs and notes"
git push
```

---

## When it breaks: Troubleshooting

**Configuration file already exists.**
A `codama.json` is already at the root, from a previous attempt. `npx codama init --force` to overwrite it, or delete it.

**`codama init` hangs, or asks to install `@codama/renderers-rust`.**
You left "Generate Rust client" selected on the second prompt, or used `--default`, which does the same. The Rust renderer is not in the lockfile, so `init` tries to install it. `Ctrl-C`, delete `codama.json` if it was written, run `init` again and press `space` on the Rust option before `enter`.

**Cannot find module '../clients/js/src/generated'.**
Either `npx codama run js` never ran, or `codama.json`'s `args` is not `["clients/js"]`. Run `find clients -name index.ts`; the path it prints must be exactly `clients/js/src/generated/index.ts`.

**`FUNDRAISER_PROGRAM_ADDRESS` does not equal `program.programId`.**
The IDL Codama read was built before `anchor keys sync`, so it carries the old address. `anchor build`, then `npx codama run js`. The generator does not watch the IDL; rerun it whenever the IDL changes.

**Type 'PublicKey' is not assignable to type 'Address<string>'.**
Kit and web3.js do not share a public-key type. Wrap every `PublicKey` you pass into a generated function: `address(pk.toBase58())`. Going the other way, `new PublicKey(addr)` accepts the base58 string directly.

**Type 'PublicKey' is not assignable to type 'InstructionSignerInput'.**
The `contributor` field is a signer, and Kit wants a `TransactionSigner` there, not an address. `createNoopSigner(address(pk.toBase58()))` from `@solana/kit` gives the builder what it needs without holding a key. When you send for real (bonus), the provider signs anyway.

**AssertionError: expected 30000000n to equal 30000000.**
Kit decodes `u64` and `i64` as `bigint`; `strictEqual` does not coerce. Compare against `BigInt(TARGET)`, or write the literal with an `n` suffix.

**Cannot find module '@solana/program-client-core'.**
The generated code imports it; it ships as a dependency of `@solana/kit` at the same version. Your `node_modules` predates the pin. `yarn install`.

**decode() returns garbage, or complains about the byte count.**
Pass `info.data` whole. The decoder consumes the 8-byte discriminator itself; slicing it off shifts every field.

**fundraiser.ts tests started failing after I touched codama.ts.**
Every suite in `tests/` has independent setup (its own maker, mint and campaign inside its own `before()`), so file order does not matter and nothing should leak between them. If you moved setup to the top level, reused the provider wallet as the maker, or shared a mint across files, put it back.

**anchor test says it cannot find Surfpool.**
Anchor 1.x boots Surfpool for `anchor test` by default. Install it from [surfpool.run](https://surfpool.run), or run `anchor test --validator legacy` to use `solana-test-validator` instead.

**ANCHOR_PROVIDER_URL is not defined.**
Same as last time: run `anchor test`, not `ts-mocha` directly. Or export `ANCHOR_PROVIDER_URL=http://127.0.0.1:8899` and `ANCHOR_WALLET=~/.config/solana/id.json` yourself against a validator you started.

---

## Codama and Kit cheat sheet

Pinned: `@codama/cli 1.6.3` · `@codama/renderers-js 2.5.0` · `@solana/kit 8.3.0`.

### CLI

| Command | Does |
| --- | --- |
| `npx codama init` | Prompts, writes `codama.json`. `--force` overwrites, `--js` writes `codama.js` instead |
| `npx codama run js` | Runs the `js` script from the config. `--all` runs every script |
| `npx codama run -i path/to/idl.json js` | Overrides the config's `idl` for one run |
| `npx codama convert <anchor.json> <out.json>` | Writes the Codama IDL (the node tree) without rendering anything |

### Config (`codama.json`)

```json
{ "idl": "…", "before": [], "scripts": { "js": { "from": "@codama/renderers-js", "args": ["clients/js"] } } }
```

`before` is where transforms go when the generated API is not what you want: `{ "from": "codama", "item": "updateInstructionsVisitor", "args": [ { } ] }`. Change the tree, never the output.

### Generated code, per IDL element

| IDL element | Generated | Key exports |
| --- | --- | --- |
| Program | `programs/<name>.ts` | `<NAME>_PROGRAM_ADDRESS`, `identify<Name>Instruction()` |
| Account | `accounts/<name>.ts` | `get<Name>Decoder()`, `get<Name>Encoder()`, `decode<Name>()`, `fetch<Name>(rpc, addr)`, `<NAME>_DISCRIMINATOR` |
| Instruction | `instructions/<name>.ts` | `get<Name>Instruction(input)`, `get<Name>InstructionAsync(input)`, `get<Name>InstructionDataEncoder()`, `parse<Name>Instruction()` |
| PDA with expressible seeds | `pdas/<name>.ts` | `find<Name>Pda(seeds)` |
| Error enum | `errors/<name>.ts` | `<NAME>_ERROR__<VARIANT>` constants, `get<Name>ErrorMessage()` |

An input is optional (`?:`) when the IDL gives it a default Codama can compute: a PDA whose seeds are other accounts or args in the same instruction, an ATA of two such accounts, or a fixed program address. A seed that reaches *into* an account (`fundraiser.maker`) has no default.

### Kit types you will meet

| Kit | web3.js v1 / `@coral-xyz/anchor` | Convert |
| --- | --- | --- |
| `Address` (branded `string`) | `PublicKey` | `address(pk.toBase58())` / `new PublicKey(addr)` |
| `TransactionSigner` | `Keypair` / wallet | `createNoopSigner(address(...))` when only the address matters |
| `bigint` for `u64`, `i64` | `BN` | `BigInt(bn.toString())` / `new BN(big.toString())` |
| `Instruction { programAddress, accounts: [{address, role}], data }` | `TransactionInstruction { programId, keys, data }` | `tests/helpers/kit-adapter.ts` |
| `AccountRole` | `isSigner` + `isWritable` | `isSignerRole(role)`, `isWritableRole(role)` |

---

Base program by Javier Bonilla: [github.com/JavierBonill4/anchor-fundraiser](https://github.com/JavierBonill4/anchor-fundraiser). Previous assignment: [tutorial-fundraiser.vercel.app](https://tutorial-fundraiser.vercel.app).
