// Kit → web3.js adapter
//
// Codama's default JavaScript renderer targets @solana/kit, while this repo's
// tests (and Anchor's TypeScript client) still speak @solana/web3.js v1. The two
// libraries describe an instruction with different shapes:
//
//   kit      { programAddress, accounts: [{ address, role }], data }
//   web3.js  { programId,      keys:     [{ pubkey, isSigner, isWritable }], data }
//
// This file converts a Kit instruction into a web3.js TransactionInstruction so
// it can be sent through the AnchorProvider the rest of the suite already uses.
// It is only needed for the bonus test; the three required TODOs never send a
// transaction with the generated client.

import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { isSignerRole, isWritableRole, type Instruction } from "@solana/kit";

export function toWeb3Instruction(ix: Instruction): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programAddress),
    keys: (ix.accounts ?? []).map((account) => ({
      pubkey: new PublicKey(account.address),
      isSigner: isSignerRole(account.role),
      isWritable: isWritableRole(account.role),
    })),
    data: Buffer.from(ix.data ?? new Uint8Array()),
  });
}
