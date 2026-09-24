# NOTES

## Why some accounts are required and others are optional

Codama can auto-derive a PDA when every seed is either a constant or an account already present in the instruction. `contributorAccount`'s seeds are `["contributor", fundraiser, contributor]`, and both are already in the instruction — so Codama derives it. `contributorAta` is an ATA of `(mint, contributor)`, also derivable. But `fundraiser`'s own seed list includes `fundraiser.maker`: the maker's pubkey lives *inside* the account we are trying to find, so we would need the account to find the account. That is circular, and Codama cannot break it. Because `fundraiser` cannot be derived, `vault` — an ATA of `(mint, fundraiser)` — cannot be either, so both must be passed by the caller.

## Why the same account is optional in `initialize`

In `initialize`, the `maker` is passed as its own instruction account, so the fundraiser's seeds are `["fundraiser", maker.key()]` — the second seed is a value the caller has in hand. The same account (`fundraiser`) is therefore optional in `InitializeAsyncInput`. In `contribute`, the program designer chose *not* to pass `maker` as an account, saving one account per transaction but paying for it in the client, where the PDA can no longer be derived. `refund` makes the same choice as `initialize` and gets the same result. Neither design is wrong: it's a trade-off, not a Codama limitation.

## Versions

- anchor --version: 1.1.2
- node --version: v22.23.3
- npx codama --version: 1.6.3





## TODO 3
Required: fundraiser, vault. Optional: contributorAccount, contributorAta,
tokenProgram, systemProgram. `contribute` seeds the fundraiser PDA on
`fundraiser.maker`, a field of the account being derived, so the finder
would need the account to find the account. `initialize` seeds it on the
`maker` account, which the caller has, so there it is optional.

## Bonus
Not attempted.

## One thing that surprised me
The build worked only with `nightly-2025-06-15`: older nightlies rejected
`edition2024` crates, newer ones broke Anchor's IDL builder with a
`{toolchain}` error. The pin that made everything work was in
`rust-toolchain.toml`, not `RUSTUP_TOOLCHAIN`, because Anchor's IDL step
ignores the environment variable.
