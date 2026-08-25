#!/usr/bin/env node

// REC-RATCHET-02 immutable landed-C14 fixture successor R13
//
// Immutable Gate A/C9/C10/S evidence, permanently consumed C11/C12/C13
// topology, exact landed C14/X custody, one exact r13 correction route, one
// structurally exact protected correction merge, one exact REC-02 r3 activation
// route, and one structurally exact closure merge. Each active route consumes
// itself. The policy never
// publishes, deploys, tags, releases, certifies, changes rulesets, or supplies
// credentials.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ABSOLUTE_GIT = "/usr/bin/git";

const EXPECTED_REPOSITORY = "mbains89/Sunsplitter";
const RECOVERY_BRANCH = "recovery/e4f8440-nopub";
const GATE_A_BRANCH = "ticket/0.30.1-rec-ratchet-02";
const FAILED_POLICY_CORRECTION_BRANCHES = Object.freeze([
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r1",
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r2",
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r3",
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r4",
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r5",
  "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r6"
]);
const C9_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r7";
const POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r8";
const C11_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r9";
const C12_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r10";
const C13_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r11";
const C14_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r12";
const R13_POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r13";
const FUTURE_BRANCH = "ticket/0.30.1-rec-02-r2";
const R13_FUTURE_BRANCH = "ticket/0.30.1-rec-02-r3";
const AUTHORIZED_PATCH_TARGET_BRANCH = "ticket/0.30.1-rec-02-r1";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const GATE_A_BASE_SHA = "23951012655b0037a55e82c755b66dd4d852f20b";
const GATE_A_BASE_TREE = "96829ad0e01619f56bed2121a666645b3f9b5259";
const GATE_A_HEAD_SHA = "f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab";
const GATE_A_HEAD_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
const GATE_A_HEAD_RAW_SHA256 = "4835344d32a516c8d68df1c8d18f51313297f04c7de2ac5ce4628c356fb36376";
const GATE_A_MERGE_SHA = "31aca17b807c4dc8edef3683e30d5fefdd47ad7a";
const GATE_A_MERGE_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
const C9_HEAD_SHA = "f6b8e050717a6b9420bd3ec2dae0d65abcc57427";
const C9_HEAD_TREE = "103a4ccf5c1511d225d67870e6fb87e64b992de4";
const C9_HEAD_RAW_SHA256 = "1dea7f018883c68ef1368950ad7ac1ec7ac787ebbe8c53a86d71e5930ca8390b";
const C9_MANIFEST_SHA256 = "ae2e4309600269afc3ef9a81ce9eec0e9b0c02e7caed6feebbf76769f98a98fd";
const C9_MERGE_SHA = "31642c3644a58e9f5fc007bff648dc6146dabcfb";
const C9_MERGE_TREE = "103a4ccf5c1511d225d67870e6fb87e64b992de4";
const C9_MERGE_RAW_SHA256 = "41b8269ef543b5177430ac5e9bd1aeba07f1a4b0f40bd83d96435326e67a9322";
const C10_HEAD_SHA = "800ccc876d6d784a6851ca8ff74dbff7467bd1ff";
const C10_HEAD_TREE = "ea2c992bbb083eecf32404b21a11afc436a5f3c3";
const C10_HEAD_RAW_SHA256 = "d4a995a8f8317cb99f4cc1d85976f0b0da446b9196494cc93500f27635732f9e";
const C10_MANIFEST_SHA256 = "6679fedec181ab750195761ad510dd010cf1bdd209dfa8c89ed469b63413425d";
const C10_MERGE_SHA = "5995e344dbdbc18ce83186359ba9838fcf69c37e";
const C10_MERGE_TREE = "ea2c992bbb083eecf32404b21a11afc436a5f3c3";
const C10_MERGE_RAW_SHA256 = "3740cabe584ceb7f7663ab3186b1bc87a947add89a440860a4c32a67b198839e";

const C11_HEAD_SHA = "8a6dcc0fd99e7ace4cd3cea2e6d2030179f681e5";
const C11_HEAD_TREE = "78021c8d4a766bb4928226494dcbaab9c978e32c";
const C11_MERGE_SHA = "34483057eafed92bcc091215bd6854f0bf37d83a";
const C11_REVIEW_MERGE_SHA = "5ad492ae49197bec85fb68b4dbd64ee6918bffca";
const C11_REVIEW_MERGE_TREE = "77b45e46340a286d456098a831c402034bce4bca";
const C11_TRANSITION_SHA = "12345903c07a612431f3a05de69cc97c6b1cab60";
const C12_HEAD_SHA = "9612d4bbbcdbf91344b0852ee512a93c7ea5d1ae";
const C12_HEAD_TREE = "95438204b89cfcf9bc53d899dd40fc34836ce332";
const C12_MERGE_SHA = "e2872b2f3e7d37d7c024bbb6943cf008c2942e69";
const C12_REVIEW_MERGE_SHA = "de65821d54d197209e975f428706754de730ee3e";
const C12_REVIEW_MERGE_TREE = "ea2bcfa7d3bd2123bc2f582580d50debf73d3877";
const C12_TRANSITION_SHA = "2fd56a0f18c1f3947b6ce198376a96f26f5c1f64";
const C13_HEAD_SHA = "1dc0f80519db4b42add7010c5b3a6749b059019c";
const C13_HEAD_TREE = "f11bd7bf46099f9579af3fb031361f3b4105405f";
const C13_REVIEW_MERGE_SHA = "abcf29245e387a744a7b3810b956fa7164ac7f39";
const C13_FUTURE_SHA = "aedb8526ab0de685a037fc22c341e8f0b6f041d3";
const C13_FUTURE_TREE = "10bc158a1c8f66cfea0f1937149d20f7a32dfa54";
const C13_TRANSITION_SHA = "d5628b1f4e9c5e642c5922070e4e6e10bcbd8b5e";
const C14_HEAD_SHA = "a42fcf9da045e34f456652dfa13e5a890cd216f4";
const C14_HEAD_TREE = "35388f974a6175a9a8b791879989f3a33a69c1fe";
const C14_HEAD_RAW_SHA256 = "b87ef55e4cfff85892ff78c4d6ed58591454f46579d536e7eb4fbc16375d4b4f";
const C14_HEAD_RAW_BYTES = 302;
const C14_MANIFEST_SHA256 = "86e88012deca29100b43dea8b8fc57f6e4f05aaa1d1ac6009ff329aadc809982";
const C14_MANIFEST_BYTES = 766;
const C14_MERGE_SHA = "d78c453004100894fc523866b8010b40987752f6";
const C14_MERGE_TREE = C14_HEAD_TREE;
const C14_MERGE_RAW_SHA256 = "636c443f63215d29bc9dd09ebfccc8c6b3cbe4987125e8e54c1270d8c67ce1c1";
const C14_MERGE_RAW_BYTES = 1262;
const FAILED_REC_02_R2_HEAD = "caf42d891cd3e19b9977ffdc40cfa30c992e5042";
const FAILED_REC_02_R2_TREE = "c012e16cc411656036df1adb13fc32a4d6c8a072";
const FAILED_REC_02_R2_SYNTHETIC_MERGE = "4d1d56b6b2d32bcfd54c524d3e01c040e4267e33";
const FAILED_REC_02_R2_STATUS_BLOB = "1c0b1691b73dd2973704e5ca5231a480e03ba9b0";
const FAILED_REC_02_R2_STATUS_SHA256 = "e71925adb826079388548bc89890626c8b06952c9bc9779113da8441913911ca";
const FAILED_REC_02_R2_STATUS_BYTES = 26981;
const ACTIVE_BASELINE_PATH = "scripts/fixtures/pipe-boot-r1-simulation-baseline.json";
const INACTIVE_BASELINE_PATH = "artifacts/REC-RATCHET-02_AUTHORIZED_BASELINE.json";
const PATCH_ARTIFACT_PATH = "artifacts/REC-RATCHET-02_AUTHORIZED_REC-02.patch.json";
const TRANSITION_PATH = "artifacts/REC-RATCHET-02_BASELINE_TRANSITION.md";
const STATUS_PATH = "artifacts/PROJECT_STATUS.md";
const POLICY_CORRECTION_RECORD_PATH = "artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md";
const POLICY_PATH = "scripts/release-policy.mjs";
const VERIFY_WORKFLOW_PATH = ".github/workflows/verify.yml";
const RELEASE_WORKFLOW_PATH = ".github/workflows/release-policy.yml";

const NO_PUBLISH_TOKEN = "NO-PUBLISH / NOT CERTIFIED";
const GATE_A_COMMIT_TITLE = "REC-RATCHET-02: pin exact REC-02 recovery projection";
const C9_POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: retire C8 with receipt-safe verifier handoff";
const POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: seal immutable correction fixtures";
const C14_POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: bind trusted GitHub Actions Git environment";
const R13_POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: bind immutable landed-C14 fixtures";
const FUTURE_COMMIT_TITLE = "REC-02: apply authorized zero-exit projection";
const GATE_A_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787443200 -0500";
const C9_POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787792400 -0500";
const POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787965200 -0500";
const C14_POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1788656400 -0500";
const R13_POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1788742800 -0500";
const FUTURE_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1788051600 -0500";

const C14_CHANGED_PATHS = Object.freeze([
  RELEASE_WORKFLOW_PATH,
  STATUS_PATH,
  POLICY_CORRECTION_RECORD_PATH,
  PATCH_ARTIFACT_PATH,
  POLICY_PATH
].sort());

const R13_CHANGED_PATHS = Object.freeze([
  STATUS_PATH,
  POLICY_CORRECTION_RECORD_PATH,
  PATCH_ARTIFACT_PATH,
  POLICY_PATH
].sort());

const C14_POLICY_PROJECTION_SHA256 = "b36b21a9be35969ca6b1f06a8b0ff2745b2329cfd444d5b589cd8abc9961772c";
const C14_CANDIDATE_INVENTORY_SHA256 = "1c76ef4f8ddb6c79b818ac140836d6494620934c620d97e27c2c3374d815cd02";
const C14_FUTURE_INVENTORY_SHA256 = "96fba426ad3f5a72a4689ae0ab70d76573c9114eaea9544a4f23b796016d295f";
const C14_RELEASE_WORKFLOW_SHA256 = "2107c374e43e42fb808908d770439fe15803f9ee1dd55c162a41779d764ef7e1";
const C14_RELEASE_WORKFLOW_BLOB = "830c93e93aac72d555b163931f141839cf452422";
const C14_RELEASE_WORKFLOW_BYTES = 2402;
const C14_STATUS_SHA256 = "d948c3259f037393ca7b76cc0c5f932b96d950d69ba9169ec01cd8f2f5aef0b3";
const C14_STATUS_BLOB = "3ef6b8fc994aee5e9e8a5520d09355c2bf8723c1";
const C14_STATUS_BYTES = 26522;
const C14_RECORD_SHA256 = "e0c6bb7ff53e930e3f73b618764d15d6797f3dc69c1efc643ea0cf93f31c75f1";
const C14_RECORD_BLOB = "e12fa624d31fd63c9e31a442bb9b3095dc4e638b";
const C14_RECORD_BYTES = 51162;
const C14_PATCH_SHA256 = "9c1158ef758f41c52d749e22c53b736c0aa7fc782765921e5dbb606f84b64551";
const C14_PATCH_BLOB = "00f53e6fe2dc3787ccde36cb9e85f63d24c02950";
const C14_PATCH_BYTES = 37735;
const C14_POLICY_SHA256 = "f3ca30f5ee40d9c63bd84b9e6bac238a1bad475fe9defe3f842b2d3612d75ae4";
const C14_POLICY_BLOB = "66bb3b608005b468e2222b29bebe4e07d5074780";
const C14_POLICY_BYTES = 260343;

const R13_POLICY_PROJECTION_SHA256 = "0b8a602116b010b96d8299bcf689900aa116e8a96e40a54e1e2a259dd6188957";
const R13_CANDIDATE_INVENTORY_SHA256 = "d5782849d72e70ed9ce8b47eab5739764590d4da63e2fec8fc7e9e302654403a";
const R13_FUTURE_INVENTORY_SHA256 = "c0857eccc3b84d44dca02e39a5650bc542c3144b2ac68709766ad74e89d902bc";
const R13_STATUS_SHA256 = "aa24575edd2aef31e41ed4781bf379e39bd8f7907ceab95e64b7cbc5bcaa3a1e";
const R13_RECORD_SHA256 = "ca58adf7a758b75ee00659bfcd6892116c215ea9480f7fd99f960dc2e4c367b2";
const R13_STATUS_PROJECTION_SHA256 = "fbaa4808c99d399c067f2df5ee2b2dd73bf3c2018dc621961f2c819d4bd73dd4";
const R13_RECORD_PROJECTION_SHA256 = "20447d8e93ce8f416841435d9a33e1ac39dffc33ba04686439c2ffd39c70de40";
const R13_PATCH_SHA256 = "74bd104be7fbb46dc15a4242f03b8402e7267bad19c3de430f4e10aa403027b7";
const R13_PATCH_BLOB = "5d7315495fa220fed362bf7d580c69c1141385c0";
const R13_PATCH_BYTES = 37735;

const GATE_A_POLICY_PROJECTION_SHA256 = "02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5";
const C9_POLICY_PROJECTION_SHA256 = "6e44343fc7f892494c4477991b2a11e0f150215ae2a9bf955508a225a3014f27";
const POLICY_PROJECTION_SHA256 = "ca950b95fbc605c6d562853868df331e3e4ffe00ef4680206ee5638f47e998ad";
const TRANSITION_SHA256 = "a01180e9d5f917e47eafb9b65eea3c1c045e325b7b97690cfd8bfbef0110ba2a";

const VERIFY_WORKFLOW_SHA256 = "7f0047c7de5dd862083fbbd6c7cc56d018700a536f88e2c0904a7de922184cbd";
const RELEASE_WORKFLOW_SHA256 = "2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33";
const GATE_A_STATUS_SHA256 = "e84a750b32350c0a6cfecfd60c4b1a9b6e44a22f57ed5fdeb9c5afa941d56d33";
const INACTIVE_BASELINE_SHA256 = "048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20";
const PATCH_ARTIFACT_SHA256 = "b9d97f57ef5ab755db2509789ebee2dda129460f7ce6a7934a71e7ebc5b04eb3";
const C9_STATUS_SHA256 = "de79c8c97ff7ae05480f2413e0dd31380ec2f320c2e29cb532ffdfbd2b7f7dee";
const C9_STATUS_BLOB = "5868e2274a5b50758427b5eaf6ef15a1a06921fa";
const C9_STATUS_BYTES = 18976;
const C9_RECORD_SHA256 = "ff08839196539a7f84a88e2c275c9e82dd9e491d01a25903350bbb5d64daf75f";
const C9_RECORD_BLOB = "0e1586df61b2af7de466b8adc8b1f2362adf47d7";
const C9_RECORD_BYTES = 28306;
const C9_POLICY_SHA256 = "a22481cd73bb23ac9a16b82f04b69d716d59f8a92b044cd5bf1e71d1e3ef44ab";
const C9_POLICY_BLOB = "339a829105d4b322a37983d94e0ae90974782452";
const C9_POLICY_BYTES = 160021;
const POLICY_CORRECTION_STATUS_SHA256 = "0e59131954d73fb55e3991476ac7f3bfcada0731bec39f57981895c46263e592";
const POLICY_CORRECTION_STATUS_BLOB = "be10d9c76b666af3d33b7be227885b20514126e3";
const POLICY_CORRECTION_STATUS_BYTES = 22302;
const POLICY_CORRECTION_RECORD_SHA256 = "d2dd24d1aafb062b5fb90c0f1df4abc6884d18284cc83911b2cf8edfb82e0f33";
const POLICY_CORRECTION_RECORD_BLOB = "f0d0a072ecc336dfe0616babb36f32f440ad9af7";
const POLICY_CORRECTION_RECORD_BYTES = 40754;
const ACTIVE_BASELINE_INPUT_SHA256 = "0633469f57971b9c00c877a33f9ccb818e53d5a8de8cc787e4ca2a25fdeda7f2";
const FUNCTIONAL_TREE = "57e1439741965bf290cd6daf305c551e2f104182";
const FUNCTIONAL_MANIFEST_SHA256 = "3f10dbc636fadc942ee17dd6356ff7be023a34a5347c147d2c7631132b0fe48d";
const EMBEDDED_PATCH_SHA256 = "b33fdc96c1a5942e1dcd2fdb9d5606ca4222696133302c0ed3ebdd225e9d38fd";
const NORMALIZED_SIMULATION_SHA256 = "c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08";
const EXACT_SIMULATION_OUTPUT_SHA256 = "f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d";
const ART_R2_IMAGE_MANIFEST_SHA256 = "1441be78e8d0d95f4cf2cfd9ace72b7e6458aa0ec230336748de6a2b96db7baa";

const NORMALIZED_POLICY_SHA256 = Object.freeze({
  random: "13c043596cd756badc06844d72e0b4575e4470fe2947e5b46a68018230c1e385",
  cheapest: "0eb8095881dadec2f947bf3ebe05139eb7c2b91be75151273171681bd9a6cdcd",
  priciest: "38b752e6b7194da98368ef1e11e9389d710e6915859eed4a53d889efd94ef05a"
});

const ART_R2_HEAD = "7fe31675b678d041c980605ed5c5533d3ea22581";
const ART_R2_TREE = "52551891fe55324bc2fcd073bff56b9a8cd2c061";
const ART_R2_PARENT = GATE_A_BASE_SHA;
const ART_R2_AUTHOR = "Manraj Bains <54219887+mbains89@users.noreply.github.com> 1787236750 -0500";
const ART_R2_COMMIT_TITLE = "Integrate approved ART-R2 55 event plates";
const ART_R2_RAW_SHA256 = "3bdc250a87c3c37309806600639c8dff458f7e4aef41f2ba5ff02903088e224c";
const ART_R2_VERIFY_SHA256 = "654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f";
const ART_R2_VERIFY_BLOB = "b72530bb37fb07916e89c9d51ff7ee69a4ae4897";
const ART_R2_CHANGED_MANIFEST_SHA256 = "f617b540572839c5915a1ef3bf57ea89c1241dd3eaa0d3fa6cf24a876673ad65";
const ART_R2_RECORD_SHA256 = "d4512affd47ae29e6e8d9e711fd095b8273767de02f7bec06d1d4c5a9a33f29f";
const ART_R2_VALIDATOR_SHA256 = "bed3a5443255510e8201fa896a4db05fbb466da2e13c4d431fae1fe28fdf5141";
const REC_02_VERIFY_SHA256 = "c1258c11e1ac5ef56637a93bcbedb4c81b3d7b45ea15f332f51389e5eeddbe23";
const REC_02_VERIFY_BLOB = "a4a828d423addf4717164cfbb7f61eca659ae9d7";
const ART_R2_COMBINED_VERIFY_SHA256 = "7d06703e8af22a1aec080ef8453c22ed9238852e1fc5df31fdc67e600ef79440";
const ART_R2_COMBINED_VERIFY_BLOB = "b1cbd17b732c7c3b8d72d123dbed7874791f5906";
const ART_R2_COMBINED_TREE = "558a4d6d1fb491d6bd7cd3c07f0482ad6e35a482";
const ART_R2_COMBINED_MANIFEST_SHA256 = "0973fcfeaab8370fd5e7e36ddef089b6f7eedaa4ed386b5e6f2bf3a83c116609";
const ART_R2_TRANSFORM_FUNCTION_SHA256 = "aedfce193f9fe9ed3ec975b848cea82d2aac70943dad2ea2d628b63ed40c51e7";

const HISTORICAL_REC02_SEAL = Object.freeze({
  id: "gate-a-through-c10",
  targetBranch: AUTHORIZED_PATCH_TARGET_BRANCH,
  patchArtifactSha256: PATCH_ARTIFACT_SHA256,
  embeddedPatchSha256: EMBEDDED_PATCH_SHA256,
  functionalTree: FUNCTIONAL_TREE,
  functionalManifestSha256: FUNCTIONAL_MANIFEST_SHA256,
  verifySha256: REC_02_VERIFY_SHA256,
  verifyBlob: REC_02_VERIFY_BLOB,
  combinedVerifySha256: ART_R2_COMBINED_VERIFY_SHA256,
  combinedVerifyBlob: ART_R2_COMBINED_VERIFY_BLOB,
  combinedTree: ART_R2_COMBINED_TREE,
  combinedManifestSha256: ART_R2_COMBINED_MANIFEST_SHA256
});

const ACTIVE_REC02_SEAL = Object.freeze({
  id: "c14-r12-historical",
  targetBranch: FUTURE_BRANCH,
  patchArtifactSha256: C14_PATCH_SHA256,
  embeddedPatchSha256: "cee97660f7e472aeefee119c9e3679a6f10a7614541e283a80d70a47377665fb",
  functionalTree: "b0f2be69ef549e4ccf65005b8298056294c14716",
  functionalManifestSha256: "cf8510273f64c63f8c423c5049b0b3d7b724d11ddc9b5c0ed5eebacb5402cebb",
  verifySha256: "654548f791ceebd842126ea06e603a452ffb54ba1db7a2363c68fd351ddd4f0c",
  verifyBlob: "3b06c7164e1da5f1d1c080bc016aa349f984d31e",
  combinedVerifySha256: "46f5504c5362e464726b6dc881e9aa024b54542767f065797dec1cbc6e491b08",
  combinedVerifyBlob: "595c3f018716d244735adb39084ed0a9623a4db5",
  combinedTree: "1ed5bffeebc01b6cbdacd886c26044db34ba1000",
  combinedManifestSha256: "07498803ed5d2a41bbfd557d57e3b88e6a6f73f195a7cbda0d6969557a8973c2"
});

const R13_REC02_SEAL = Object.freeze({
  ...ACTIVE_REC02_SEAL,
  id: "r13-active",
  targetBranch: R13_FUTURE_BRANCH,
  patchArtifactSha256: R13_PATCH_SHA256
});

const FAILED_REC_02_R1_HEAD = "bd293bbe9fa9ed55eb0620bf85ef0a1316b2524e";
const FAILED_REC_02_R1_TREE = "34fa0adbfb027e01448a1a0771c8ff5af3997e26";
const FAILED_POLICY_CORRECTION_C1_HEAD = "b12ff37ef9153a509827d914b825dd51ec6de0ca";
const FAILED_POLICY_CORRECTION_C1_TREE = "14dcaa3fb6a92349b6bebf06a606d356456859e8";
const FAILED_POLICY_CORRECTION_C2_HEAD = "5c3b526d287d888bc3e0765569e6632ec5f6e0e6";
const FAILED_POLICY_CORRECTION_C2_TREE = "dc1e677d66c35873ac040c598e33b39c05c78e54";
const FAILED_POLICY_CORRECTION_C3_HEAD = "ec18d093a4d4fe7a79cb8996da0c780e182fe9a1";
const FAILED_POLICY_CORRECTION_C3_TREE = "a1c00d7ab971efd81d4544577150fa54e618f89d";
const FAILED_POLICY_CORRECTION_C4_HEAD = "6441d5f7ad5df5870dbddcabce6243c3d23d09ca";
const FAILED_POLICY_CORRECTION_C4_TREE = "f0f12d10bc406c320a1c9324249ee4f2d17332e5";
const FAILED_POLICY_CORRECTION_C5_HEAD = "111f80a5a45ab637504cdd6c09581848b90e09f9";
const FAILED_POLICY_CORRECTION_C5_TREE = "5727b34d002ecc8dc8e36fdef9ff575e3fd10c3d";
const FAILED_POLICY_CORRECTION_C6_HEAD = "fb16fe160a416fc4a638c2ea7dcae83361c88764";
const FAILED_POLICY_CORRECTION_C6_TREE = "7dec1712c000578da6c1ec92b0e7ac8ff8f081bb";
const FAILED_POLICY_CORRECTION_C7_HEAD = "37bba2712193a1ce9e7108b8ff9826230c69e680";
const FAILED_POLICY_CORRECTION_C7_TREE = "9332457ef5c6ebeb44eb0aa9d8c0673e10470de2";
const FAILED_POLICY_CORRECTION_C8_HEAD = "c469a1a4220686f62b3934289b0add56bbdcfc5d";
const FAILED_POLICY_CORRECTION_C8_TREE = "973abf4822ed040a4c98ab746efe1f8da875fb16";

const FAILED_IDENTITIES = Object.freeze([
  Object.freeze({
    label: "REC-02 r1",
    statusStem: "failed_rec_02_r1",
    head: FAILED_REC_02_R1_HEAD,
    tree: FAILED_REC_02_R1_TREE,
    disposition: "FAILED REQUIRED GATE / LOCAL ONLY / UNPUSHED / NON-REUSABLE",
    error: "failed REC-02 r1 identity is non-reusable"
  }),
  Object.freeze({
    label: "C1",
    statusStem: "failed_policy_correction_c1",
    head: FAILED_POLICY_CORRECTION_C1_HEAD,
    tree: FAILED_POLICY_CORRECTION_C1_TREE,
    disposition: "FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE",
    error: "failed policy correction C1 identity is non-reusable"
  }),
  Object.freeze({
    label: "C2",
    statusStem: "failed_policy_correction_c2",
    head: FAILED_POLICY_CORRECTION_C2_HEAD,
    tree: FAILED_POLICY_CORRECTION_C2_TREE,
    disposition: "FAILED REQUIRED REVIEW / LOCAL ONLY / UNPUSHED / NON-REUSABLE",
    error: "failed policy correction C2 identity is non-reusable"
  }),
  Object.freeze({
    label: "C3",
    statusStem: "failed_policy_correction_c3",
    head: FAILED_POLICY_CORRECTION_C3_HEAD,
    tree: FAILED_POLICY_CORRECTION_C3_TREE,
    disposition: "FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #30 FROZEN / UNMERGED / NON-REUSABLE",
    error: "failed policy correction C3 identity is non-reusable"
  }),
  Object.freeze({
    label: "C4",
    statusStem: "failed_policy_correction_c4",
    head: FAILED_POLICY_CORRECTION_C4_HEAD,
    tree: FAILED_POLICY_CORRECTION_C4_TREE,
    disposition: "FAILED REQUIRED INDEPENDENT ADJUDICATION / REMOTE BRANCH FROZEN / DRAFT PR #31 FROZEN / UNMERGED / NON-REUSABLE",
    error: "failed policy correction C4 identity is non-reusable"
  }),
  Object.freeze({
    label: "C5",
    statusStem: "failed_policy_correction_c5",
    head: FAILED_POLICY_CORRECTION_C5_HEAD,
    tree: FAILED_POLICY_CORRECTION_C5_TREE,
    disposition: "FAILED REQUIRED CLEAN-ROOM CHECK / LOCAL ONLY / UNPUSHED / NON-REUSABLE",
    error: "failed policy correction C5 identity is non-reusable"
  }),
  Object.freeze({
    label: "C6",
    statusStem: "failed_policy_correction_c6",
    head: FAILED_POLICY_CORRECTION_C6_HEAD,
    tree: FAILED_POLICY_CORRECTION_C6_TREE,
    disposition: "FAILED REQUIRED INDEPENDENT CLEAN-ROOM VERIFICATION / REMOTE BRANCH FROZEN / DRAFT PR #33 FROZEN / UNMERGED / NON-REUSABLE",
    error: "failed policy correction C6 identity is non-reusable"
  }),
  Object.freeze({
    label: "C7",
    statusStem: "failed_policy_correction_c7",
    head: FAILED_POLICY_CORRECTION_C7_HEAD,
    tree: FAILED_POLICY_CORRECTION_C7_TREE,
    disposition: "FAILED REQUIRED CLEAN-CLONE A CANDIDATE-STORE CHECK / LOCAL ONLY / UNPUSHED / NO PR / PERMANENTLY FROZEN / NON-REUSABLE",
    error: "failed policy correction C7 identity is non-reusable"
  }),
  Object.freeze({
    label: "C8",
    statusStem: "failed_policy_correction_c8",
    head: FAILED_POLICY_CORRECTION_C8_HEAD,
    tree: FAILED_POLICY_CORRECTION_C8_TREE,
    disposition: "FAILED REQUIRED INDEPENDENT RECEIPT CAPTURE / REMOTE BRANCH FROZEN / DRAFT PR #34 FROZEN / UNMERGED / PERMANENTLY FROZEN / NON-REUSABLE",
    error: "failed policy correction C8 identity is non-reusable"
  })
]);

const FAILED_REC_02_R2_IDENTITY = Object.freeze({
  label: "REC-02 r2",
  statusStem: "failed_rec_02_r2",
  head: FAILED_REC_02_R2_HEAD,
  tree: FAILED_REC_02_R2_TREE,
  syntheticMerge: FAILED_REC_02_R2_SYNTHETIC_MERGE,
  disposition: "FAILED REQUIRED CI / REMOTE BRANCH FROZEN / DRAFT PR #39 FROZEN / UNMERGED / NON-REUSABLE",
  error: "failed REC-02 r2 identity is non-reusable"
});
const ACTIVE_TERMINAL_IDENTITIES = Object.freeze([
  ...FAILED_IDENTITIES,
  FAILED_REC_02_R2_IDENTITY
]);

const ART_R2_SEALED_MANIFEST_BYTES = 10863;
const ART_R2_SEALED_MANIFEST_SHA256 = "a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073";
const FORBIDDEN_DERIVED_OBJECTS = Object.freeze([
  FUNCTIONAL_TREE,
  ART_R2_COMBINED_TREE,
  REC_02_VERIFY_BLOB,
  ART_R2_COMBINED_VERIFY_BLOB
]);
const FORBIDDEN_OBJECT_INVENTORY_SHA256 = "d6361bf849be1e2721c1871d84c1f8f569348edc401e08650ca6550bcc5d62d8";

const ACTIVE_FORBIDDEN_DERIVED_OBJECTS = Object.freeze([
  ACTIVE_REC02_SEAL.functionalTree,
  ACTIVE_REC02_SEAL.combinedTree,
  ACTIVE_REC02_SEAL.verifyBlob,
  ACTIVE_REC02_SEAL.combinedVerifyBlob
]);
const CONSUMED_C11_OBJECTS = Object.freeze([
  C11_HEAD_SHA,
  C11_HEAD_TREE,
  C11_MERGE_SHA,
  C11_REVIEW_MERGE_SHA,
  C11_REVIEW_MERGE_TREE,
  C11_TRANSITION_SHA
]);
const CONSUMED_C12_OBJECTS = Object.freeze([
  C12_HEAD_SHA,
  C12_HEAD_TREE,
  C12_MERGE_SHA,
  C12_REVIEW_MERGE_SHA,
  C12_REVIEW_MERGE_TREE,
  C12_TRANSITION_SHA
]);
const CONSUMED_C13_OBJECTS = Object.freeze([
  C13_HEAD_SHA,
  C13_HEAD_TREE,
  C13_REVIEW_MERGE_SHA,
  C13_FUTURE_SHA,
  C13_FUTURE_TREE,
  C13_TRANSITION_SHA
]);

const ART_R2_SEALED_MANIFEST = `100644 25bae8f0f4fb2a031890aa8c81b58c7d611b71e2 d4512affd47ae29e6e8d9e711fd095b8273767de02f7bec06d1d4c5a9a33f29f\tartifacts/ART-INTEGRATION-R2-55_RECORD.json
100644 a5fbd220d7dcec9182ef22a5dcc4124ac30921e5 aef2f5bfa39b24a4e7b34fcd638bb0c9f17cd3d7f70152c2a13b84c890e4fb38\timages/act2_tether_dock.jpg
100644 8bc91619d248192d1d74fce265200f363c70f6c2 452c9f5b271ea959322c9bc73c1dd76b6ac929e206fc1e21c438a3bfa6db778e\timages/act2_tether_hand_elias.jpg
100644 cb9d14737df104a23aa90a77c47c4a4c72aed026 363f91591b737c56836d6213130f3ebf507a79c3b62d6f86ec9ebc1f5153967b\timages/act2_tether_hand_mira.jpg
100644 c5e1c211b1770bffd5cf640c728a06004a1f1653 6d8a7e3b5cf515d2c889c9512177894d4f7f82d0e473f9ab5c7209f285be9bbf\timages/act2_tether_hand_sela.jpg
100644 cdec9f018998a9a4153f5d831e65a314d812bb6d f52776846b20f9c605349397db573ae443c9896d74a9cfceb1fd003ba88cf8f5\timages/act2_tether_lie.jpg
100644 6ce7a1eeb496a6328b84803c8d46a4a5ce359b21 a6d0dab281c86c5b4ede2439bf1d620aa5fea0f06303b1424012d9904e524663\timages/act2_tether_manifest.jpg
100644 87dd2b22aac3abd2de3481dfb77aeb354b1b2d0d e69fb6e9fdf03b6920b8b598a4ada07733d3d40fd48c5ff3693cc11457c70b37\timages/act2_tether_rush.jpg
100644 52c6d06345086e2be3dbafc0049009edbde4adc0 624351cbbf7723fff565e4517a8e450fed3b0c07c5635ad874fc72cc6a8c1054\timages/act2_tether_vent.jpg
100644 8fc84fe5a026d71733c56789cc61769f165e87ae 864e0bf6000f82214d24a959875ba21985c9d46cd73e5c3c14e484b306c298e7\timages/act3_lethal_elias_end.jpg
100644 165dc4e173ec1e6dff9acf708f410216adca5c67 c379c466708b2364d8cf22e8d8b58f9e09a6968e5deb38baa568f48609d0449c\timages/act3_lethal_lena_clock.jpg
100644 c60443bc34a65aa560c2fa8e76d8bf4f304b02b7 e19ae66dc3697e5a1e42159194de711bc2a47e51a0e15cd75e06a3abc5389ad0\timages/act3_lethal_lena_power.jpg
100644 8374d00d7a724db8d856b43fbc8867075ce6063b ddfda50e3b8f101b4f48bb308676c31378d63b5cbcd61b8934b2255448e7b14d\timages/act3_lethal_lena_sterile.jpg
100644 5e6b41524c8c6df3a9c0627fd7e105c7591b8808 6c6797b2db032089ee10a42ba5820ee5400ba2ed45b30ad43646cb2276649a97\timages/act3_lethal_mira_end.jpg
100644 a8053131b328dd37e5735a30765ee6db0662d1b1 7ff84dcb7b867743d00699564b84adf9c68da543269be15099918f65d1ff3ef8\timages/act3_lethal_tomas_end.jpg
100644 772d39c8576a355d4eed58006dd9576e366a03eb 416e493febea1b8bda80510b0bd02fb39ebbe08a0910cc279f80dade0a9b2502\timages/act3_lethal_tomas_stores.jpg
100644 e7d7a2fc05e52d24767d02a831dcc1f172794e13 a591262882d4a0cb53d5ca4f5d1bc531aba6857591b68546cb34fdb24a5c56b0\timages/act3_lethal_tomas_structure.jpg
100644 ddd19e739108099182e5607e37b8ad033185508a 4824aff8e5591387953d9d91d7b2f940cf666c73ea4d5cb666726d20b440cf67\timages/act3_reckoning_burn_stale.jpg
100644 93e517f04b4fe4f3933d6e93130e9a13061c0c83 11acbd494c2699c3419bd44dfa8c96021a920899ab9f7717ea1135d38af7c8b2\timages/act3_reckoning_burn_verified.jpg
100644 0cf1d9aa81bb19a488cbe5aab4213ae6f21c968f 243a32b065f6cd796fe1484856c11d66435b37d14f7f50641a49ec7a211ef974\timages/arc_fork.jpg
100644 7bf62efec7e124709c103357d841510c0d67101a dc7861e861a7bd73da299fcd94e9b23333292763821db9e0c945eeb7ffd2e8fd\timages/arc_future_1.jpg
100644 32b2f98173bbc60e07d9c9bd8d5f6651bef79d6b 148e144c54c6cf6311c107e07427aeaefd6fbaf38d21748f84d2d976866766b9\timages/arc_living_1.jpg
100644 4c53421910309d8efeb8b16e726868b1f166cacd c0c924f5621b2bbcfcb1201b20509bf1b6bf57c81ddbb68a0dd80d09f2946b86\timages/coolant_trade.jpg
100644 049a8117be006eebed00e5f4d2ff085e274d43b1 de95ae8cee252084b52dc282ce14810b0c0ba8b3648ca040c75b98db34410778\timages/crew_walk.jpg
100644 7e21f444c9edfd89e37407f791c6547c99b66315 c7ffdcbe1d04468fb728cd4f920c0c7e8d4749b3f8c94fa97106785e84b35269\timages/dying.jpg
100644 4e9c2721c60cb6bc8fb64f24d34afbd3fe53bf28 36731fb7abd2ba237fa554510d5f50421f99264e58339663e475b3bbf8f4d485\timages/faction_split.jpg
100644 a491aa0cb8c6c16eaf01d3048613c9b516470386 d87ae02770dd75e81f77ea1577e6a9753585223ee0ee6de86c1eab174f25679f\timages/history_elias.jpg
100644 181d2540c8ac8db97c940c1decd42549c0c1bfca cb305abe5e2a5501ac2898f9cba0cd87ddf40f2603b07de156ed59f8faeb5ab4\timages/offshift_elias.jpg
100644 f6f6ab4ef4b11c37a38a463f05290f4bc36a1ddc ceabe48aa56974ee7a037f4e7feea031b1d56bb4f837f61a2913e105de8f0706\timages/offshift_tomas.jpg
100644 f8174d8f6b3c4d182ca85b636022170a926d08d7 2d6b88d746be8a9e31f8bf679d02fe3eb3a360991632927a1011d29693fc2c94\timages/offshift_tomas_r.jpg
100644 6d94ad693ccebccdad1512f5b48d0068ada4dadf 0c06dd37a65c7dedab262f83b7d517d1d61559338176ca78c118e5d75cad099f\timages/pair_shield_cold.jpg
100644 92a63bdd263781a960b852a16ffb80d1df78599f 3614bebfde234a23bf34a84acd7fbada09fd880fa5b6a912ee49c4339c6890e9\timages/past_leak.jpg
100644 31a94f90ed0701e53b06fcacc074567d8e7374e2 207738c26775bd47e7e4854545b575cdd5da72ce4eb7125474dc7f00a339c8f1\timages/prom_direct.jpg
100644 7c5c978687a2898daa1a4d7363da1f3c04536a26 0764333a228fa4ed090bddb2f559520658b013a0e531c4f3f32a5ea0defa9eb7\timages/prom_direct_break.jpg
100644 faf7c07b79763419441a16bab0eb6effa928655a 37f941c081b1b55a8c10c4706eaf14f0da416d5786b7312978664f69b22959e4\timages/prom_direct_keep.jpg
100644 3938154d589f92b129562f4e4d8a0e4fb6146179 13c9a48eab36da4b64801c11ef62f8267e4855d67d7dfa93e87fa51de0d2e671\timages/prom_line_keep.jpg
100644 8a64bf39b6db5d297f13822fdbe620e1544a1ec1 cf88b2d94d58e717e310770a2b90b57fa94d5a6ec7324d3d413e00a0e14e82db\timages/prom_make_elias.jpg
100644 20a118861a4887f42d972d3986e06c62e1f285eb 16151327e971339e0040807978e865a605094105e2ebb108fcdd5d09300671b9\timages/prom_make_lena.jpg
100644 5b9dd3ec7490a556c0cd5d7675516d7edd6d29a5 fd286a8477648b34ef9cbd7017e984660410b5c66c98c88e0752f190d8e67ac4\timages/prom_make_tomas.jpg
100644 30f493cb4282ff897ddb359a3c48f44eb9377799 e886ff5920a5080caf29126e80160647f202b6201808b48e052e7ee05b0f1df4\timages/prom_price.jpg
100644 b694038785c6d789dca8f87cd3afe3ea4bd396b9 209d7ecd3feda9fa40fa2f4a1bbbfedcf0e07abf751357dd6911c5d6fd3e5ea2\timages/prom_price_break.jpg
100644 512722629f78678caef72acae8f90d5189d572e3 7002f53afdeb485b8b6fd312314dc1ff2ec84407d6f76cca2d73d62baa328e45\timages/prom_price_keep.jpg
100644 5f363c7b95e57800e139b35c5ecd9dac4d724287 852f5bf706427f8724349647c7a5978d1a3d092f6342c828700bd701469a0e9a\timages/prom_r_elias.jpg
100644 274dd286a10357042b11c05b91d64aa3a6f0ac0e 1224b9c482beec6bcbccfacbe818228a07003a6b730b35ff85d801254e1b5ef5\timages/prom_r_lena.jpg
100644 5a91cafd4412898fdff44f5f8f8062ed2121f473 9d7bb1cfe5ef0d7b9ee83e670bae7cb69fc7f1b7e28d9c6d3110d300b0b3cc3b\timages/prom_r_tomas.jpg
100644 b3a336a6cf8bfe8f12b347eaa0be9ef256fd4392 34fd54d0021a97d136a3e11c92df8b42f80944821b96ff775cc492fb6eb006f4\timages/prom_vent.jpg
100644 963dcc1b39e0b6efd63d72b8377927d1af281cc7 8af6d4eaf509a3adb62fe371d2c614fe1605d0b672c9f5643998742bf26e7c09\timages/prom_vent_break.jpg
100644 cd6024d7e936c1f1d27be459dd8b72de3dfc19f2 2482355106ae3459cdee108307902496bcff7be641f389550f1f833ebc9cfee0\timages/prom_vent_keep.jpg
100644 f2bc39e23e935a668b44cbb753fabd209a441445 78c8cf016f6c1d4b315815c7451709721b6ab18a76a1a74596ee26356c69fc28\timages/reckon_memory.jpg
100644 1bfef1d581a2666a75498812ec267fce83aa4b1c 62869057b1ff9b3460d66c6a9a81a30d6bf29a346b96df63977977b916a7ff87\timages/reckon_public.jpg
100644 8f07655b162a9d5af15df7d4cd35e70bb1270243 00489a94b60e7ef9fd73c12312d2c119f1e7dd0879c64c6c5f60254d548eb74a\timages/reckon_suppress.jpg
100644 5b2d26e7cf1c84d33db9bebdd506bb90550f62c9 0ad80b60cd514675f3c4e41545904d78a5cde745a1d632a540209a2813d1f734\timages/reckon_truth.jpg
100644 0a84b90820e890ff08c9c050e6fd55412304a731 43e9851016cb310e620e8d4d927594617167409567f8291667683aeeba540254\timages/seal_or_food.jpg
100644 5faf82fbce3241da175f17fa338060e2d6b048cd e10ccd1c59bbc6a5c4cd581270803657e4403e6ea949f5e0c863a66397784dfc\timages/status.jpg
100644 153dc368ca8f0918e5745f7436550d03ba44404f 8b21fa65ccbdda39e13ab51ed76c4e07537688171669d94571952b2ce8693bee\timages/time_pass.jpg
100644 b5c80b040a9802cf4cd2a03de95f7980b5ed891a e04bbac4de28877a872c12a752b6f7c04ce782ab993c0697a81036260c65baad\timages/wake.jpg
100644 9683759afee2d5065c32378000091d99e4b87285 bed3a5443255510e8201fa896a4db05fbb466da2e13c4d431fae1fe28fdf5141\tscripts/validate-art-r2.mjs
100644 b72530bb37fb07916e89c9d51ff7ee69a4ae4897 654193d383a4fd2e32472c554ba2b85c64d25f2941048a8b4fe936cbc985471f\tscripts/verify.mjs
100644 6d96f84768ffe8abbb7a5d08f5ee420bc77beddc 25704f64718973d345dd0d344fcb6c1b03996ddca846cae94a52d6eeedd4bb8c\tsrc/engine.js
100644 d4ebccbd01f011bd1e35ad23d08c3de3c8a658e0 ce4c6f43c3f47c69b6b72cac770facda0298604d1688bbb836c32d169cd2f9f8\tsrc/scenes-10.js
100644 3b7edaa1d654cce5b986809e81ffac68b93f8d40 d7759765f5d474e57a26723b14956daefef25539e7a255a10d4e8bba167e4701\tsrc/scenes-11.js
100644 51a73c067d21319e6925d273cb9857f54e74c3c7 cad5bc26eed483ebe364af4e12d0bcfb1bceaa9bd1d89d37548ead4a643a216b\tsrc/scenes-12.js
100644 1970c898c91a4ebd76ccdf819e9e54edc239059b adfd873e990f3d851b5fbcd4e070fa2849b059c733cf1b7fd4eb2fbcfb178e90\tsrc/scenes-14.js
100644 fe75251745eb9cb661a6b3128d725411026c57d0 f16b94c3dd580f5fa47db47c9aebe3c7f2a0da875fc67ae304aee9c60447266c\tsrc/scenes-19.js
100644 f54abdfd8799555beec376ad2a97c2c3bc3b0d1e 83bd582cd1e09e177dc46527919b8563696e36ade020f1f60bbc2e9350c94d89\tsrc/scenes-20.js
100644 a1caa4a73f4c2c67fb9a429cc364dcb421c92f76 ff848a31c8fb5c408114ce1fb9bd868572cbb1526fc4f21cb7417caaeff08296\tsrc/scenes-21.js
100644 a7cdcea0a2733682deb40f6a1c19d4ff5e0372ef fa8983653cec5faffe002b501a15e7071b5ca7a2116650b219a1bea9f3068bb4\tsrc/scenes-22.js
100644 03d13bdc7f63cae46f1223bfe49c0385ce2f0f1e 14029730a8239950a7b8437369c876b6aa4de4febeb797efa72daecdd414cca3\tsrc/scenes-23.js
100644 b104401c1e4b346286b9357629f027ddceba5de8 847248197cf27e686d4c820b794823bf7b7ff8be0f79ae1f7af0ee789b9186a5\tsrc/scenes-24.js
100644 ffe24e33de306b1292e2054253d643ca2ab411c5 b8a0450bff445abf89595f5e0f3385ebfd0ddf11a7a6deac3ba1563ea21af7e9\tsrc/scenes-35.js
100644 6f0c2fbc7104889077f97633feda03a5f547674a e4806543693537623080ae29d2efa7c0c97553e5df957eb127156f4fa588ea30\tsrc/scenes-43.js
100644 d5b2f38e4135d00d034733d1888013ee9bdd2b9c c3a4ab5f495d24e67ed7532d19c7915cfb683e6ac40647ba9764e5746cd241d1\tsrc/scenes-44.js
100644 063462eca47e555edcbff728315879e451c931fc 14abec21c21b5fc0ab24fef832c43da2bb43b15080856fbcb3fff20caf892992\tsrc/scenes-45.js
100644 b85e89ff12c36571e35ad9fc626f7620c708e62d c56f266719223bdf73cd156228e1f0df6f791f3ef06a19444b76e5092c0a1bae\tsrc/scenes-46.js
100644 6859c12773ef465cb5526249bbff9dd5baac07a5 f11c3d9746fda2c4633009ef52e4b8070d0705e761be87c33774fa1046e26416\tsrc/scenes-47.js
100644 65811021a10a90fade6ee1c053e46e8676667455 fa7d778e58fe516a153a5b8772c1a68e2ba3d2a8802a33b8b096f0563a059670\tsrc/scenes-48.js
100644 12d9de4a6d1ed89fc992dd0c15f72565bd94f62d 81d05814bf924b815bd65c13a5ae75ce240195f512dea8fd10c945490eeb8669\tsrc/scenes-49.js
100644 aeb5ff834d22bdd4c3c79495fc35e77b6294dda4 9c976e536535ff7d823d9e2a60874f4172a3a5a765f29d14c789a3ed9710c856\tsrc/scenes-52.js
100644 8eb50b54b844656b3999dca181ce53411d14abef 97da49717ab438a78700b8de7a156054426f3689e1011177d5f3960b1bd16f09\tsrc/state.js
`;

const CHECKOUT_ACTION = "actions/checkout@11d5960a326750d5838078e36cf38b85af677262";
const SETUP_NODE_ACTION = "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020";
const ALLOWED_ACTIONS = new Set([CHECKOUT_ACTION, SETUP_NODE_ACTION]);
const FULL_SHA_RE = /^[0-9a-f]{40}$/;
const FULL_SHA256_RE = /^[0-9a-f]{64}$/;

export const GATE_A_CHANGED_PATHS = Object.freeze([
  VERIFY_WORKFLOW_PATH,
  STATUS_PATH,
  INACTIVE_BASELINE_PATH,
  PATCH_ARTIFACT_PATH,
  TRANSITION_PATH,
  POLICY_PATH
].sort());

export const POLICY_CORRECTION_CHANGED_PATHS = Object.freeze([
  STATUS_PATH,
  POLICY_CORRECTION_RECORD_PATH,
  POLICY_PATH
].sort());

export const FUTURE_CHANGED_PATHS = Object.freeze([
  STATUS_PATH,
  ACTIVE_BASELINE_PATH,
  "scripts/verify.mjs",
  "src/scenes-02.js",
  "src/scenes-04.js",
  "src/scenes-05.js",
  "src/scenes-06.js",
  "src/scenes-13.js",
  "src/scenes-36.js",
  "src/scenes-55.js"
].sort());

const GATE_A_FIXED_SHA256 = Object.freeze({
  [VERIFY_WORKFLOW_PATH]: VERIFY_WORKFLOW_SHA256,
  [STATUS_PATH]: GATE_A_STATUS_SHA256,
  [INACTIVE_BASELINE_PATH]: INACTIVE_BASELINE_SHA256,
  [PATCH_ARTIFACT_PATH]: PATCH_ARTIFACT_SHA256,
  [TRANSITION_PATH]: TRANSITION_SHA256
});

const LEGACY_PROJECTION_CONSTANT_NAMES = Object.freeze([
  "POLICY_PROJECTION_SHA256",
  "TRANSITION_SHA256"
]);
const PROJECTION_CONSTANT_NAMES = Object.freeze([
  "C14_POLICY_PROJECTION_SHA256",
  "C14_CANDIDATE_INVENTORY_SHA256",
  "C14_FUTURE_INVENTORY_SHA256",
  "C14_STATUS_SHA256",
  "C14_RECORD_SHA256",
  "POLICY_PROJECTION_SHA256",
  "TRANSITION_SHA256"
]);
const R13_PROJECTION_CONSTANT_NAMES = Object.freeze([
  "R13_POLICY_PROJECTION_SHA256",
  "R13_CANDIDATE_INVENTORY_SHA256",
  "R13_FUTURE_INVENTORY_SHA256",
  "R13_STATUS_SHA256",
  "R13_RECORD_SHA256",
  "POLICY_PROJECTION_SHA256",
  "TRANSITION_SHA256"
]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function recursivelySorted(value) {
  if (Array.isArray(value)) return value.map(recursivelySorted);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, recursivelySorted(value[key])])
    );
  }
  return value;
}

function canonicalJsonBytes(value) {
  return Buffer.from(`${JSON.stringify(recursivelySorted(value))}\n`, "utf8");
}

const NORMALIZED_POLICY_FIELDS = Object.freeze([
  "runs",
  "endings",
  "incomplete",
  "errors",
  "stepLimits",
  "totalSteps",
  "endingCounts",
  "invariantTotals",
  "invariantRules",
  "invariantScenes",
  "invariantFingerprints"
]);

function normalizedSimulationEvidence(baseline) {
  const policies = {};
  for (const policy of baseline.config?.policies || []) {
    const source = baseline.policies?.[policy] || {};
    policies[policy] = Object.fromEntries(NORMALIZED_POLICY_FIELDS.map(field => [field, source[field]]));
  }
  const config = {
    seed: baseline.config?.seed,
    runs: baseline.config?.runs,
    startRun: baseline.config?.startRun,
    shardSize: baseline.config?.shardSize,
    maxSteps: baseline.config?.maxSteps,
    policies: baseline.config?.policies
  };
  const perPolicyConfig = {
    seed: config.seed,
    runs: config.runs,
    startRun: config.startRun,
    shardSize: config.shardSize,
    maxSteps: config.maxSteps
  };
  return {
    core: sha256(canonicalJsonBytes({ config, policies })),
    policies: Object.fromEntries((config.policies || []).map(policy => [
      policy,
      sha256(canonicalJsonBytes({ config: perPolicyConfig, policy, summary: policies[policy] }))
    ]))
  };
}

function gitObjectOid(type, bytes) {
  return createHash("sha1")
    .update(Buffer.from(`${type} ${bytes.length}\0`))
    .update(bytes)
    .digest("hex");
}

let gitInvocationObserver = null;

const REQUIRED_REPOSITORY_GIT_ENVIRONMENT = Object.freeze({
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_TERMINAL_PROMPT: "0"
});
const POLICY_CHILD_GIT_ENVIRONMENT = Object.freeze({
  GIT_CONFIG_SYSTEM: "/dev/null",
  GIT_NO_LAZY_FETCH: "1"
});

export function assertSafeGitEnvironment(environment = process.env) {
  const source = environment && typeof environment === "object" ? environment : {};
  const names = Object.keys(source).filter(name => name.startsWith("GIT_")).sort();
  const unsafe = [];
  for (const [name, expected] of Object.entries(REQUIRED_REPOSITORY_GIT_ENVIRONMENT)) {
    if (!Object.hasOwn(source, name) || source[name] !== expected) unsafe.push(name);
  }
  for (const name of names) {
    if (Object.hasOwn(REQUIRED_REPOSITORY_GIT_ENVIRONMENT, name)) continue;
    if (name !== "GIT_PAGER" || source[name] !== "cat") unsafe.push(name);
  }
  const uniqueUnsafe = [...new Set(unsafe)].sort();
  if (uniqueUnsafe.length) {
    throw new Error(`unsafe Git environment: ${uniqueUnsafe.join(", ")}`);
  }
  return Object.freeze({
    ...REQUIRED_REPOSITORY_GIT_ENVIRONMENT,
    ...(source.GIT_PAGER === "cat" ? { GIT_PAGER: "cat" } : {})
  });
}

function sanitizedChildGitEnvironment(overrides = {}) {
  const validated = assertSafeGitEnvironment(process.env);
  const source = overrides && typeof overrides === "object" ? overrides : {};
  const child = { ...process.env };
  for (const name of Object.keys(child)) {
    if (name.startsWith("GIT_")) delete child[name];
  }
  Object.assign(child, REQUIRED_REPOSITORY_GIT_ENVIRONMENT, POLICY_CHILD_GIT_ENVIRONMENT);
  if (validated.GIT_PAGER === "cat") child.GIT_PAGER = "cat";

  for (const [name, value] of Object.entries(source)) {
    if (!name.startsWith("GIT_")) {
      child[name] = value;
      continue;
    }
    if (Object.hasOwn(REQUIRED_REPOSITORY_GIT_ENVIRONMENT, name)) {
      if (value !== REQUIRED_REPOSITORY_GIT_ENVIRONMENT[name]) {
        throw new Error(`policy Git child override is unsafe: ${name}`);
      }
      child[name] = value;
      continue;
    }
    if (Object.hasOwn(POLICY_CHILD_GIT_ENVIRONMENT, name)) {
      if (value !== POLICY_CHILD_GIT_ENVIRONMENT[name]) {
        throw new Error(`policy Git child override is unsafe: ${name}`);
      }
      child[name] = value;
      continue;
    }
    if (name === "GIT_PAGER" && value === "cat") {
      child[name] = value;
      continue;
    }
    throw new Error(`policy Git child override is unsafe: ${name}`);
  }
  return child;
}

function withGitInvocationAudit(callback) {
  assert.equal(gitInvocationObserver, null, "nested Git invocation audit is forbidden");
  const calls = [];
  gitInvocationObserver = call => calls.push(call);
  try {
    return { result: callback(), calls };
  } finally {
    gitInvocationObserver = null;
  }
}

function runGit(args, {
  input,
  inputPath,
  outputPath,
  env,
  allowFailure = false,
  cwd = ROOT
} = {}) {
  const childEnvironment = sanitizedChildGitEnvironment(env);
  const gitEnvironmentNames = Object.keys(childEnvironment).filter(name => name.startsWith("GIT_")).sort();
  const expectedGitEnvironmentNames = [
    ...Object.keys(REQUIRED_REPOSITORY_GIT_ENVIRONMENT),
    ...Object.keys(POLICY_CHILD_GIT_ENVIRONMENT),
    ...(process.env.GIT_PAGER === "cat" ? ["GIT_PAGER"] : [])
  ].sort();
  assert.deepEqual(
    gitEnvironmentNames,
    expectedGitEnvironmentNames,
    "policy-owned Git child environment differs from the exact authorized inventory"
  );
  gitInvocationObserver?.({
    args: [...args],
    cwd,
    executable: ABSOLUTE_GIT,
    gitEnvironmentNames
  });
  let temporaryInputRoot = null;
  let inputFd = null;
  let outputFd = null;
  try {
    if (input !== undefined && inputPath !== undefined) {
      throw new Error("Git input bytes and input path are mutually exclusive");
    }
    if (input !== undefined) {
      temporaryInputRoot = mkdtempSync(join(tmpdir(), "sunsplitter-c14-git-input-"));
      const temporaryInputPath = join(temporaryInputRoot, "stdin");
      writeFileSync(temporaryInputPath, input, { flag: "wx", mode: 0o600 });
      inputFd = openSync(temporaryInputPath, "r");
    } else if (inputPath !== undefined) {
      const physicalInput = realpathSync(inputPath);
      if (physicalInput !== inputPath || !lstatSync(physicalInput).isFile()) {
        throw new Error("Git input path is not one physical regular file");
      }
      inputFd = openSync(physicalInput, "r");
    }
    if (outputPath !== undefined) outputFd = openSync(outputPath, "wx", 0o600);
    const options = {
      cwd,
      env: childEnvironment,
      encoding: null,
      maxBuffer: 32 * 1024 * 1024,
      shell: false
    };
    if (inputFd !== null || outputFd !== null) {
      options.stdio = [inputFd ?? "ignore", outputFd ?? "pipe", "pipe"];
    }
    const result = spawnSync(ABSOLUTE_GIT, args, options);
    if (!allowFailure && (result.error || result.status !== 0)) {
      const detail = Buffer.concat([
        Buffer.from(result.stdout || ""),
        Buffer.from(result.stderr || "")
      ]).toString("utf8").trim();
      throw new Error(`git ${args.join(" ")} failed (${result.status}): ${detail || result.error?.message || "unknown failure"}`);
    }
    return result;
  } finally {
    if (inputFd !== null) closeSync(inputFd);
    if (outputFd !== null) closeSync(outputFd);
    if (temporaryInputRoot !== null) rmSync(temporaryInputRoot, { recursive: true, force: true });
  }
}

function gitBytes(args, options) {
  return Buffer.from(runGit(args, options).stdout || "");
}

function gitText(args, options) {
  return gitBytes(args, options).toString("utf8").trim();
}

function resolveCommit(ref, repoRoot = ROOT) {
  if (!ref) return null;
  const result = runGit(["rev-parse", "--verify", ref], { allowFailure: true, cwd: repoRoot });
  if (result.status !== 0) return null;
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  if (!FULL_SHA_RE.test(oid)) return null;
  const type = runGit(["cat-file", "-t", oid], { allowFailure: true, cwd: repoRoot });
  if (type.status !== 0 || Buffer.from(type.stdout).toString("utf8").trim() !== "commit") return null;
  return oid;
}

function rawCommit(ref, repoRoot = ROOT) {
  const oid = resolveCommit(ref, repoRoot);
  if (!oid) return null;
  if (gitText(["rev-parse", "--show-object-format"], { cwd: repoRoot }) !== "sha1") return null;
  const result = runGit(["cat-file", "commit", oid], { allowFailure: true, cwd: repoRoot });
  if (result.status !== 0) return null;
  const bytes = Buffer.from(result.stdout);
  const declaredSize = Number(gitText(["cat-file", "-s", oid], { cwd: repoRoot }));
  return declaredSize === bytes.length && gitObjectOid("commit", bytes) === oid
    ? { oid, bytes, declaredSize }
    : null;
}

function commitHeaders(ref, repoRoot = ROOT) {
  const raw = rawCommit(ref, repoRoot);
  if (!raw) return null;
  const text = raw.bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(raw.bytes)) return null;
  const split = text.indexOf("\n\n");
  if (split < 0) return null;
  const headerLines = text.slice(0, split).split("\n");
  const treeLines = headerLines.filter(line => line.startsWith("tree "));
  const parentLines = headerLines.filter(line => line.startsWith("parent "));
  if (treeLines.length !== 1) return null;
  const tree = treeLines[0].slice(5);
  const parents = parentLines.map(line => line.slice(7));
  if (!FULL_SHA_RE.test(tree) || parents.some(parent => !FULL_SHA_RE.test(parent))) return null;
  return { ...raw, tree, parents, headerLines, message: text.slice(split + 2) };
}

function fileIdentity(ref, path, repoRoot = ROOT) {
  const result = runGit(["ls-tree", "-z", ref, "--", path], { allowFailure: true, cwd: repoRoot });
  if (result.status !== 0) return null;
  const raw = Buffer.from(result.stdout);
  const match = raw.toString("utf8").match(/^(\d{6}) blob ([0-9a-f]{40})\t([^\0]+)\0$/);
  if (!match || match[3] !== path) return null;
  const bytesResult = runGit(["cat-file", "blob", match[2]], { allowFailure: true, cwd: repoRoot });
  if (bytesResult.status !== 0) return null;
  const bytes = Buffer.from(bytesResult.stdout);
  if (gitObjectOid("blob", bytes) !== match[2]) return null;
  return {
    path,
    mode: match[1],
    blob: match[2],
    sha256: sha256(bytes),
    byteLength: bytes.length,
    bytes
  };
}

function changedPaths(base, head, repoRoot = ROOT) {
  if (!FULL_SHA_RE.test(base || "") || !FULL_SHA_RE.test(head || "")) return [];
  const result = runGit([
    "diff", "--no-ext-diff", "--name-only", "--no-renames", "--diff-filter=ACDMRTUXB", `${base}..${head}`
  ], { allowFailure: true, cwd: repoRoot });
  if (result.status !== 0) return [];
  return [...new Set(Buffer.from(result.stdout).toString("utf8").trim().split(/\r?\n/).filter(Boolean))].sort();
}

function sameList(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function canonicalRecords(ref, paths, repoRoot = ROOT) {
  return paths.map(path => fileIdentity(ref, path, repoRoot));
}

function canonicalManifest(records) {
  return records.map(record => `${record.mode} ${record.blob} ${record.sha256}\t${record.path}\n`).join("");
}

function canonicalMessage(title, records) {
  return [
    title,
    "",
    NO_PUBLISH_TOKEN,
    "",
    "Canonical manifest (mode blob sha256 path):",
    canonicalManifest(records)
  ].join("\n");
}

function canonicalRawCommit(tree, parent, author, title, records) {
  return Buffer.from([
    `tree ${tree}`,
    `parent ${parent}`,
    `author ${author}`,
    `committer ${author}`,
    "",
    canonicalMessage(title, records)
  ].join("\n"), "utf8");
}

function normalizedPolicyBytes(bytes) {
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("policy source is not lossless UTF-8");
  const names = text.includes("const R13_POLICY_PROJECTION_SHA256 =")
    ? R13_PROJECTION_CONSTANT_NAMES
    : text.includes("const C14_POLICY_PROJECTION_SHA256 =")
      ? PROJECTION_CONSTANT_NAMES
      : LEGACY_PROJECTION_CONSTANT_NAMES;
  for (const name of names) {
    const pattern = new RegExp(`(const ${name} = \")[0-9a-f]{64}(\";)`, "g");
    const matches = [...text.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`${name} must occur exactly once`);
    text = text.replace(pattern, `$1${"0".repeat(64)}$2`);
  }
  return Buffer.from(text, "utf8");
}

function replaceOneDocumentDigest(text, pattern, label) {
  const matches = [...text.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`${label} must occur exactly once`);
  return text.replace(pattern, `$1${"0".repeat(64)}$2`);
}

function normalizedR13StatusBytes(bytes) {
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("r13 STATUS is not lossless UTF-8");
  text = replaceOneDocumentDigest(
    text,
    /(r13_policy_projection: )[0-9a-f]{64}( — mechanically frozen)/g,
    "r13 STATUS policy projection"
  );
  text = replaceOneDocumentDigest(
    text,
    /(r13_forbidden_inventory_contract: candidate route 128 unique objects \/ SHA-256 )[0-9a-f]{64}(; future r3 route)/g,
    "r13 STATUS candidate inventory"
  );
  text = replaceOneDocumentDigest(
    text,
    /(r13_forbidden_inventory_contract:[^\n]+future r3 route 127 unique objects \/ SHA-256 )[0-9a-f]{64}(; historical C14)/g,
    "r13 STATUS future inventory"
  );
  return Buffer.from(text, "utf8");
}

function normalizedR13RecordBytes(bytes) {
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("r13 correction record is not lossless UTF-8");
  text = replaceOneDocumentDigest(
    text,
    /(The r13 normalized policy projection is `)[0-9a-f]{64}(`\.)/g,
    "r13 record policy projection"
  );
  text = replaceOneDocumentDigest(
    text,
    /(The active candidate inventory is 128 unique objects \/ SHA-256 `)[0-9a-f]{64}(`; the future r3 inventory)/g,
    "r13 record candidate inventory"
  );
  text = replaceOneDocumentDigest(
    text,
    /(the future r3 inventory is 127 unique objects \/ SHA-256 `)[0-9a-f]{64}(`\.)/g,
    "r13 record future inventory"
  );
  return Buffer.from(text, "utf8");
}

function policyProjection(ref) {
  const policy = fileIdentity(ref, POLICY_PATH);
  if (!policy) return null;
  try {
    return sha256(normalizedPolicyBytes(policy.bytes));
  } catch {
    return null;
  }
}

function parseJson(bytes, label, errors) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

function identityFromBytes(bytes, mode = "100644") {
  const blob = gitText(["hash-object", "-w", "--stdin"], { input: bytes });
  return { mode, blob, sha256: sha256(bytes), byteLength: bytes.length };
}

const projectionCache = new Map();

function validateProjectionArtifacts(ref, seal = HISTORICAL_REC02_SEAL) {
  const errors = [];
  const baselineIdentity = fileIdentity(ref, INACTIVE_BASELINE_PATH);
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  if (!baselineIdentity || !patchIdentity) {
    if (!baselineIdentity) errors.push("inactive REC-02 baseline is missing");
    if (!patchIdentity) errors.push("authorized REC-02 patch artifact is missing");
    return { errors };
  }
  const cacheKey = `${seal.id}:${baselineIdentity.blob}:${patchIdentity.blob}`;
  if (projectionCache.has(cacheKey)) return structuredClone(projectionCache.get(cacheKey));

  if (baselineIdentity.sha256 !== INACTIVE_BASELINE_SHA256) errors.push("inactive REC-02 baseline bytes drifted");
  if (patchIdentity.sha256 !== seal.patchArtifactSha256) errors.push("authorized REC-02 patch artifact bytes drifted");
  const baseline = parseJson(baselineIdentity.bytes, "inactive baseline", errors);
  const artifact = parseJson(patchIdentity.bytes, "patch artifact", errors);

  if (baseline) {
    if (baseline.certification !== NO_PUBLISH_TOKEN) errors.push("inactive baseline certification token drifted");
    if (baseline.provenance?.authorizationIssue !== 24) errors.push("inactive baseline authorization issue is not #24");
    if (baseline.provenance?.gateABaseSha !== GATE_A_BASE_SHA) errors.push("inactive baseline Gate A base drifted");
    if (baseline.provenance?.gateABaseTree !== GATE_A_BASE_TREE) errors.push("inactive baseline Gate A tree drifted");
    if (baseline.evidence?.repetitions !== 2) errors.push("inactive baseline does not record two repetitions");
    if (!sameList(baseline.evidence?.exactJsonOutputSha256 || [], [EXACT_SIMULATION_OUTPUT_SHA256, EXACT_SIMULATION_OUTPUT_SHA256])) {
      errors.push("inactive baseline exact simulation output digests drifted");
    }
    const expectedConfig = {
      seed: 20260817,
      runs: 2000,
      startRun: 0,
      shardSize: 500,
      maxSteps: 600,
      policies: ["random", "cheapest", "priciest"]
    };
    if (JSON.stringify(baseline.config) !== JSON.stringify(expectedConfig)) {
      errors.push("inactive baseline locked simulation configuration drifted");
    }
    for (const policy of ["random", "cheapest", "priciest"]) {
      const row = baseline.policies?.[policy];
      if (row && !sameList(Object.keys(row), NORMALIZED_POLICY_FIELDS)) {
        errors.push(`inactive baseline ${policy} field inventory drifted`);
      }
      if (!row || row.runs !== 2000 || row.endings !== 2000 || row.incomplete !== 0
        || row.errors !== 0 || row.stepLimits !== 0 || row.invariantTotals?.V1 !== 0) {
        errors.push(`inactive baseline ${policy} does not prove 2,000 complete V1-clean endings`);
      }
    }
    if ((baseline.policies?.random?.invariantTotals?.V4 ?? -1) !== 191
      || (baseline.policies?.random?.invariantTotals?.V5 ?? -1) !== 160
      || (baseline.policies?.cheapest?.invariantTotals?.V4 ?? -1) !== 489
      || (baseline.policies?.cheapest?.invariantTotals?.V5 ?? -1) !== 3895
      || (baseline.policies?.priciest?.invariantTotals?.V4 ?? -1) !== 0
      || (baseline.policies?.priciest?.invariantTotals?.V5 ?? -1) !== 0) {
      errors.push("inactive baseline V4/V5 evidence counts drifted");
    }
    const normalized = normalizedSimulationEvidence(baseline);
    if (normalized.core !== NORMALIZED_SIMULATION_SHA256
      || baseline.evidence?.normalizedCoreSha256 !== NORMALIZED_SIMULATION_SHA256) {
      errors.push("inactive baseline normalized simulation digest drifted");
    }
    for (const [policy, expected] of Object.entries(NORMALIZED_POLICY_SHA256)) {
      if (normalized.policies[policy] !== expected
        || baseline.evidence?.normalizedPolicySha256?.[policy] !== expected) {
        errors.push(`inactive baseline normalized ${policy} digest drifted`);
      }
    }
  }

  let functional = null;
  if (artifact) {
    if (artifact.certification !== NO_PUBLISH_TOKEN) errors.push("patch artifact certification token drifted");
    if (artifact.authority?.issue !== 24 || artifact.authority?.lock !== "L-021") {
      errors.push("patch artifact authority drifted");
    }
    if (artifact.authority?.baseCommit !== GATE_A_BASE_SHA || artifact.authority?.baseTree !== GATE_A_BASE_TREE) {
      errors.push("patch artifact base identity drifted");
    }
    if (artifact.authority?.targetBranch !== seal.targetBranch) errors.push("patch artifact target branch drifted");
    const governed = [
      "cut_out", "vent", "past_leak", "vault_voice", "arc_future_1",
      "act3_reckoning_heading", "pregnancy_check", "custody_possession", "custody_thaw"
    ];
    if (!sameList(artifact.authority?.governedScenes || [], governed)) errors.push("patch artifact governed-scene inventory drifted");
    const patchBytes = Buffer.from(artifact.patch?.unifiedDiff || "", "utf8");
    if (patchBytes.length !== artifact.patch?.byteLength || sha256(patchBytes) !== seal.embeddedPatchSha256
      || artifact.patch?.sha256 !== seal.embeddedPatchSha256) {
      errors.push("embedded full-index patch bytes drifted");
    }
    const filePaths = (artifact.files || []).map(row => row.path);
    if (!sameList([...filePaths].sort(), FUTURE_CHANGED_PATHS.filter(path => path !== STATUS_PATH && path !== ACTIVE_BASELINE_PATH))) {
      errors.push("patch artifact output path inventory drifted");
    }

    const replacementManifest = [];
    for (const row of artifact.files || []) {
      const input = fileIdentity(GATE_A_BASE_SHA, row.path);
      const expectedInput = row.input || {};
      if (!input || input.mode !== expectedInput.mode || input.blob !== expectedInput.blob
        || input.sha256 !== expectedInput.sha256 || input.byteLength !== expectedInput.byteLength) {
        errors.push(`${row.path}: recorded patch input identity drifted`);
      }
      replacementManifest.push(`${row.path}\0${expectedInput.mode}\0${expectedInput.blob}\0${expectedInput.sha256}\0${row.output?.mode}\0${row.output?.blob}\0${row.output?.sha256}\n`);
    }
    if (sha256(Buffer.from(replacementManifest.join(""))) !== artifact.patch?.replacementManifestSha256) {
      errors.push("patch replacement manifest digest drifted");
    }

    const activeInput = fileIdentity(GATE_A_BASE_SHA, ACTIVE_BASELINE_PATH);
    const baselineCopy = artifact.baselineCopy || {};
    if (baselineCopy.sourcePath !== INACTIVE_BASELINE_PATH || baselineCopy.targetPath !== ACTIVE_BASELINE_PATH) {
      errors.push("baseline-copy path contract drifted");
    }
    if (!activeInput || activeInput.sha256 !== ACTIVE_BASELINE_INPUT_SHA256
      || activeInput.mode !== baselineCopy.input?.mode || activeInput.blob !== baselineCopy.input?.blob
      || activeInput.sha256 !== baselineCopy.input?.sha256 || activeInput.byteLength !== baselineCopy.input?.byteLength) {
      errors.push("active baseline input identity drifted");
    }
    if (baselineCopy.output?.sha256 !== baselineIdentity.sha256
      || baselineCopy.output?.blob !== baselineIdentity.blob
      || baselineCopy.output?.mode !== baselineIdentity.mode
      || baselineCopy.output?.byteLength !== baselineIdentity.byteLength) {
      errors.push("inactive-to-active baseline output identity drifted");
    }

    if (errors.length === 0) {
      try {
        const reconstructed = reconstructPatchTree(GATE_A_BASE_SHA, artifact, {
          [ACTIVE_BASELINE_PATH]: { bytes: baselineIdentity.bytes, mode: baselineIdentity.mode }
        });
        for (const row of artifact.files || []) {
          const output = reconstructed.records.find(record => record.path === row.path);
          if (!output || output.mode !== row.output?.mode || output.blob !== row.output?.blob
            || output.sha256 !== row.output?.sha256 || output.byteLength !== row.output?.byteLength) {
            errors.push(`${row.path}: reconstructed output identity drifted`);
          }
        }
        const tree = reconstructed.tree;
        if (tree !== seal.functionalTree || tree !== artifact.functionalProjection?.tree) {
          errors.push(`functional projection tree ${tree || "missing"} != ${seal.functionalTree}`);
        }
        const manifestRows = [
          { path: ACTIVE_BASELINE_PATH, ...identityFromBytes(baselineIdentity.bytes, baselineIdentity.mode) },
          ...reconstructed.records
        ].sort((left, right) => left.path.localeCompare(right.path));
        const manifest = manifestRows.map(row => `${row.mode} ${row.blob} ${row.sha256}\t${row.path}\n`).join("");
        if (sha256(Buffer.from(manifest)) !== seal.functionalManifestSha256
          || artifact.functionalProjection?.canonicalManifestSha256 !== seal.functionalManifestSha256
          || artifact.functionalProjection?.canonicalManifest !== manifest) {
          errors.push("functional projection canonical manifest drifted");
        }
        functional = { tree, transcript: reconstructed.transcript, manifest, records: manifestRows };
      } catch (error) {
        errors.push(error.message);
      }
    }
  }

  const result = { errors, baseline, artifact, functional };
  projectionCache.set(cacheKey, structuredClone(result));
  return result;
}

function requireUniqueStatus(errors, text, key, predicate, label) {
  const values = [...text.matchAll(new RegExp("`" + key + ":\\s*([^`]+)`", "g"))]
    .map(match => match[1].trim());
  if (values.length !== 1) errors.push(`${label} must appear exactly once; found ${values.length}`);
  else if (!predicate(values[0])) errors.push(`${label} is missing or changed`);
}

function noPublishStatusErrors(bytes) {
  const errors = [];
  const text = bytes?.toString("utf8") || "";
  requireUniqueStatus(errors, text, "runtime_baseline_sha", value => value === RECOVERY_BASE_SHA, "STATUS runtime baseline");
  requireUniqueStatus(errors, text, "release_state", value => value === "NO-PUBLISH", "STATUS NO-PUBLISH state");
  requireUniqueStatus(errors, text, "production_url", value => value === "NOT_AUTHORIZED", "STATUS production block");
  requireUniqueStatus(errors, text, "release_artifact", value => value === "none authorized from this base", "STATUS release-artifact block");
  requireUniqueStatus(errors, text, "artifact_digest", value => /^none\s*[—-]\s*no release created$/i.test(value), "STATUS artifact block");
  requireUniqueStatus(errors, text, "version_integrity", value => /^NOT_CERTIFIED\b/.test(value), "STATUS certification block");
  return errors;
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first < 0 || first !== source.lastIndexOf(needle)) throw new Error(`${label} anchor count is not exactly one`);
  return source.slice(0, first) + replacement + source.slice(first + needle.length);
}

function applyArtVerifierTransform(source) {
  let output = source;
  const importAnchor = "} from \"./simulate.mjs\";\n";
  output = replaceOnce(output, importAnchor,
    `${importAnchor}import { runArtR2SelfTest, validateArtR2 } from \"./validate-art-r2.mjs\";\n`,
    "ART import");

  const selfTestAnchor = "  check(duplicateStatus.errors.some(error => error.includes(\"expected exactly 1\")), \"duplicate contradictory STATUS field did not fail closed\");\n\n";
  const selfTestAddition = [
    selfTestAnchor,
    "  const artR2 = runArtR2SelfTest(ROOT);\n",
    "  artR2.failures.forEach(failure => failures.push(`ART-INTEGRATION-R2: ${failure}`));\n\n"
  ].join("");
  output = replaceOnce(output, selfTestAnchor, selfTestAddition, "ART self-test");

  const mainAnchor = "  const simulations = runPolicySet(ROOT, { policies: POLICY_NAMES, runs: 1, seed: 20260817 });\n";
  const mainAddition = [
    "  const artR2 = validateArtR2(ROOT, { runtime, loadRuntime: false });\n",
    "  printCheck(\"ART-INTEGRATION-R2 exact assets + scene wiring\", artR2.errors,\n",
    "    `${artR2.wave2Count}+${artR2.wave3Count}=${artR2.plateCount} plates; ${artR2.warnings.length} warning(s)`);\n",
    "  failures.push(...artR2.errors.map(error => `ART-INTEGRATION-R2: ${error}`));\n\n",
    mainAnchor
  ].join("");
  output = replaceOnce(output, mainAnchor, mainAddition, "ART full validation");

  output = replaceOnce(
    output,
    "\" — injected version drift rejected\"",
    "\" — injected version and ART-R2 drift rejected\"",
    "ART success message"
  );
  return output;
}

function sealedManifestRecords(source = ART_R2_SEALED_MANIFEST) {
  const rows = source.endsWith("\n") ? source.slice(0, -1).split("\n") : source.split("\n");
  const records = rows.map((row, index) => {
    const match = row.match(/^(\d{6}) ([0-9a-f]{40}) ([0-9a-f]{64})\t([^\0]+)$/);
    if (!match) throw new Error(`sealed ART-R2 manifest row ${index + 1} is malformed`);
    const path = match[4];
    if (path.startsWith("/") || path.split("/").some(part => !part || part === "." || part === "..")) {
      throw new Error(`sealed ART-R2 manifest has unsafe path ${path}`);
    }
    return { mode: match[1], blob: match[2], sha256: match[3], path };
  });
  const paths = records.map(record => record.path);
  if (new Set(paths).size !== paths.length) throw new Error("sealed ART-R2 manifest has duplicate paths");
  if (!sameList(paths, [...paths].sort())) throw new Error("sealed ART-R2 manifest paths are not sorted");
  return records;
}

function legacyForbiddenObjectInventory(source = ART_R2_SEALED_MANIFEST) {
  const bytes = Buffer.from(source, "utf8");
  assert.equal(bytes.length, ART_R2_SEALED_MANIFEST_BYTES, "sealed ART-R2 manifest byte length drifted");
  assert.equal(sha256(bytes), ART_R2_SEALED_MANIFEST_SHA256, "sealed ART-R2 manifest SHA-256 drifted");

  const groups = {
    failedIdentityObjects: FAILED_IDENTITIES.flatMap(identity => [identity.head, identity.tree]),
    artRoots: [ART_R2_HEAD, ART_R2_TREE],
    artBlobs: sealedManifestRecords(source).map(record => record.blob),
    derived: [...FORBIDDEN_DERIVED_OBJECTS]
  };
  const expected = { failedIdentityObjects: 18, artRoots: 2, artBlobs: 79, derived: 4 };
  for (const [group, count] of Object.entries(expected)) {
    assert.equal(groups[group].length, count, `${group} count drifted`);
    assert.ok(groups[group].every(oid => FULL_SHA_RE.test(oid)), `${group} contains an invalid SHA-1`);
  }
  const objects = Object.values(groups).flat().sort();
  assert.equal(new Set(objects).size, objects.length, "forbidden-object inventory has duplicate OIDs");
  assert.equal(objects.length, 103, "forbidden-object inventory count drifted");
  return {
    counts: {
      artBlobs: groups.artBlobs.length,
      artRoots: groups.artRoots.length,
      derived: groups.derived.length,
      failedIdentityObjects: groups.failedIdentityObjects.length,
      total: objects.length
    },
    objects,
    sealedManifest: {
      byteLength: bytes.length,
      sha256: ART_R2_SEALED_MANIFEST_SHA256
    },
    schemaVersion: 1
  };
}

export function forbiddenObjectInventory(route = "c14", source = ART_R2_SEALED_MANIFEST) {
  assert.ok(route === "c14" || route === "rec-02", `unsupported forbidden-object route ${route}`);
  const bytes = Buffer.from(source, "utf8");
  assert.equal(bytes.length, ART_R2_SEALED_MANIFEST_BYTES, "sealed ART-R2 manifest byte length drifted");
  assert.equal(sha256(bytes), ART_R2_SEALED_MANIFEST_SHA256, "sealed ART-R2 manifest SHA-256 drifted");

  const activeDerived = route === "c14"
    ? ACTIVE_FORBIDDEN_DERIVED_OBJECTS
    : ACTIVE_FORBIDDEN_DERIVED_OBJECTS.filter(oid => oid !== ACTIVE_REC02_SEAL.verifyBlob);
  const groups = {
    failedIdentityObjects: FAILED_IDENTITIES.flatMap(identity => [identity.head, identity.tree]),
    artRoots: [ART_R2_HEAD, ART_R2_TREE],
    artBlobs: sealedManifestRecords(source).map(record => record.blob),
    consumedC11Objects: [...CONSUMED_C11_OBJECTS],
    consumedC12Objects: [...CONSUMED_C12_OBJECTS],
    consumedC13Objects: [...CONSUMED_C13_OBJECTS],
    derived: [...FORBIDDEN_DERIVED_OBJECTS, ...activeDerived]
  };
  const expected = {
    failedIdentityObjects: 18,
    artRoots: 2,
    artBlobs: 79,
    consumedC11Objects: 6,
    consumedC12Objects: 6,
    consumedC13Objects: 6,
    derived: route === "c14" ? 8 : 7
  };
  for (const [group, count] of Object.entries(expected)) {
    assert.equal(groups[group].length, count, `${group} count drifted`);
    assert.ok(groups[group].every(oid => FULL_SHA_RE.test(oid)), `${group} contains an invalid SHA-1`);
  }
  const objects = Object.values(groups).flat().sort();
  assert.equal(new Set(objects).size, objects.length, "forbidden-object inventory has duplicate OIDs");
  assert.equal(objects.length, route === "c14" ? 125 : 124, "forbidden-object inventory count drifted");
  return {
    counts: {
      artBlobs: groups.artBlobs.length,
      artRoots: groups.artRoots.length,
      consumedC11Objects: groups.consumedC11Objects.length,
      consumedC12Objects: groups.consumedC12Objects.length,
      consumedC13Objects: groups.consumedC13Objects.length,
      derived: groups.derived.length,
      failedIdentityObjects: groups.failedIdentityObjects.length,
      total: objects.length
    },
    objects,
    route,
    sealedManifest: {
      byteLength: bytes.length,
      sha256: ART_R2_SEALED_MANIFEST_SHA256
    },
    schemaVersion: 2
  };
}

export function forbiddenObjectInventories(source = ART_R2_SEALED_MANIFEST) {
  return {
    c14: forbiddenObjectInventory("c14", source),
    "rec-02": forbiddenObjectInventory("rec-02", source)
  };
}

export function r13ForbiddenObjectInventory(route = "r13", source = ART_R2_SEALED_MANIFEST) {
  assert.ok(route === "r13" || route === "rec-02-r3", `unsupported r13 forbidden-object route ${route}`);
  const historicalRoute = route === "r13" ? "c14" : "rec-02";
  const historical = forbiddenObjectInventory(historicalRoute, source);
  const terminalR2Objects = [
    FAILED_REC_02_R2_IDENTITY.head,
    FAILED_REC_02_R2_IDENTITY.tree,
    FAILED_REC_02_R2_IDENTITY.syntheticMerge
  ];
  assert.equal(terminalR2Objects.length, 3, "terminal REC-02 r2 object count drifted");
  assert.ok(terminalR2Objects.every(oid => FULL_SHA_RE.test(oid)), "terminal REC-02 r2 inventory has an invalid SHA-1");
  const objects = [...historical.objects, ...terminalR2Objects].sort();
  assert.equal(new Set(objects).size, objects.length, "r13 forbidden-object inventory has duplicate OIDs");
  assert.equal(objects.length, route === "r13" ? 128 : 127, "r13 forbidden-object inventory count drifted");
  return {
    counts: {
      ...historical.counts,
      terminalR2Objects: terminalR2Objects.length,
      total: objects.length
    },
    objects,
    route,
    sealedManifest: historical.sealedManifest,
    schemaVersion: 3
  };
}

export function r13ForbiddenObjectInventories(source = ART_R2_SEALED_MANIFEST) {
  return {
    r13: r13ForbiddenObjectInventory("r13", source),
    "rec-02-r3": r13ForbiddenObjectInventory("rec-02-r3", source)
  };
}

function legacyAssertForbiddenObjectInventoryIdentity(actual) {
  if (actual !== FORBIDDEN_OBJECT_INVENTORY_SHA256) {
    throw new Error(`forbidden-object inventory ${actual} != ${FORBIDDEN_OBJECT_INVENTORY_SHA256}`);
  }
}

function assertForbiddenObjectInventoryIdentity(route, actual) {
  const expected = route === "c14" ? C14_CANDIDATE_INVENTORY_SHA256 : C14_FUTURE_INVENTORY_SHA256;
  if (actual !== expected) throw new Error(`forbidden-object inventory ${route} ${actual} != ${expected}`);
}

function assertR13ForbiddenObjectInventoryIdentity(route, actual) {
  const expected = route === "r13" ? R13_CANDIDATE_INVENTORY_SHA256 : R13_FUTURE_INVENTORY_SHA256;
  if (actual !== expected) throw new Error(`r13 forbidden-object inventory ${route} ${actual} != ${expected}`);
}

function objectTypes(oids, repoRoot = ROOT) {
  const result = runGit(["cat-file", "--batch-check=%(objectname) %(objecttype)"], {
    allowFailure: true,
    cwd: repoRoot,
    env: {
      GIT_NO_LAZY_FETCH: "1",
      GIT_OPTIONAL_LOCKS: "0",
      GIT_TERMINAL_PROMPT: "0"
    },
    input: Buffer.from(`${oids.join("\n")}\n`, "utf8")
  });
  if (result.status !== 0) {
    const detail = Buffer.concat([Buffer.from(result.stdout || ""), Buffer.from(result.stderr || "")]).toString("utf8").trim();
    throw new Error(`object batch probe failed (${result.status}): ${detail}`);
  }
  const rows = Buffer.from(result.stdout).toString("utf8").trimEnd().split("\n");
  if (rows.length !== oids.length) throw new Error(`object batch probe returned ${rows.length} rows for ${oids.length} OIDs`);
  return rows.map((row, index) => {
    const match = row.match(/^([0-9a-f]{40}) (\S+)$/);
    if (!match || match[1] !== oids[index]) throw new Error(`object batch probe row ${index + 1} is malformed or reordered`);
    return { oid: match[1], type: match[2] };
  });
}

function exactObjectInventory(repoRoot) {
  const safeEnvironment = {
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_SYSTEM: "/dev/null",
    GIT_NO_LAZY_FETCH: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_TERMINAL_PROMPT: "0"
  };
  const runInventoryGit = (args, label) => {
    const result = runGit(args, {
      allowFailure: true,
      cwd: repoRoot,
      env: safeEnvironment
    });
    if (result.status !== 0) {
      const detail = Buffer.concat([
        Buffer.from(result.stdout || ""),
        Buffer.from(result.stderr || "")
      ]).toString("utf8").trim();
      throw new Error(`candidate-only ${label} failed (${result.status}): ${detail}`);
    }
    return Buffer.from(result.stdout || "");
  };

  const storedRows = runInventoryGit(
    ["--no-replace-objects", "cat-file", "--batch-all-objects", "--batch-check=%(objectname) %(objecttype) %(objectsize)"],
    "stored-object inventory"
  ).toString("utf8").trim().split(/\r?\n/).filter(Boolean).sort();
  const storedRecords = storedRows.map(row => {
    const match = row.match(/^([0-9a-f]{40}) (blob|commit|tag|tree) ([0-9]+)$/);
    if (!match || !Number.isSafeInteger(Number(match[3]))) {
      throw new Error("candidate-only stored-object inventory returned a malformed row");
    }
    return { oid: match[1], type: match[2], size: Number(match[3]) };
  });
  const stored = storedRecords.map(record => record.oid);
  if (new Set(stored).size !== stored.length) {
    throw new Error("candidate-only stored-object inventory returned duplicate object IDs");
  }

  const reachableRows = runInventoryGit(
    ["--no-replace-objects", "rev-list", "--objects", "--no-object-names", "HEAD"],
    "reachable-object inventory"
  ).toString("utf8").trim().split(/\r?\n/).filter(Boolean);
  if (reachableRows.some(row => !FULL_SHA_RE.test(row))) {
    throw new Error("candidate-only reachable-object inventory returned a malformed object ID");
  }
  const reachable = [...new Set(reachableRows)].sort();
  if (reachable.length !== reachableRows.length) {
    throw new Error("candidate-only reachable-object inventory returned duplicate object IDs");
  }

  const sortedStored = [...stored].sort();
  if (!sameList(sortedStored, reachable)) {
    const storedSet = new Set(sortedStored);
    const reachableSet = new Set(reachable);
    const unreachable = sortedStored.filter(oid => !reachableSet.has(oid));
    const missing = reachable.filter(oid => !storedSet.has(oid));
    throw new Error(
      `candidate-only object inventory differs from HEAD reachability; `
      + `unreachable stored objects: ${unreachable.join(", ") || "none"}; `
      + `missing reachable objects: ${missing.join(", ") || "none"}`
    );
  }

  const fsck = runGit(
    ["--no-replace-objects", "fsck", "--full", "--strict", "--no-progress", "--no-reflogs", "--no-dangling", "HEAD"],
    { allowFailure: true, cwd: repoRoot, env: safeEnvironment }
  );
  const fsckBytes = Buffer.concat([Buffer.from(fsck.stdout || ""), Buffer.from(fsck.stderr || "")]);
  if (fsck.status !== 0 || fsckBytes.length !== 0) {
    throw new Error(
      `candidate-only strict object verification failed (${fsck.status}): ${fsckBytes.toString("utf8").trim()}`
    );
  }

  const counts = { blob: 0, commit: 0, tag: 0, tree: 0, total: storedRecords.length };
  for (const record of storedRecords) counts[record.type] += 1;
  const inventoryBytes = canonicalJsonBytes({ objects: sortedStored, schemaVersion: 1 });
  return {
    counts,
    inventorySha256: sha256(inventoryBytes),
    reachable: reachable.length,
    stored: storedRecords.length,
    strictFsck: "PASS"
  };
}

function assertDirectoryHasNoSymlink(root, label) {
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`candidate-only ${label} contains symlink ${path}`);
      if (entry.isDirectory()) pending.push(path);
    }
  }
}

function legacyCandidateOnlyObjectStoreReceipt({ repoRoot = ROOT, environment = process.env } = {}) {
  assertSafeGitEnvironment({ ...process.env, ...environment });

  const requestedRoot = resolve(repoRoot);
  const physicalRoot = realpathSync(requestedRoot);
  if (requestedRoot !== physicalRoot) throw new Error("candidate-only checkout root is symlinked or redirected");

  const dotGit = join(physicalRoot, ".git");
  if (!existsSync(dotGit) || lstatSync(dotGit).isSymbolicLink() || !lstatSync(dotGit).isDirectory()) {
    throw new Error("candidate-only checkout .git entry is not a direct directory");
  }
  assertDirectoryHasNoSymlink(dotGit, "Git directory");
  for (const legacyName of ["branches", "remotes"]) {
    const legacyPath = join(dotGit, legacyName);
    if (existsSync(legacyPath)
      && (!lstatSync(legacyPath).isDirectory() || readdirSync(legacyPath).length > 0)) {
      throw new Error(`candidate-only repository contains legacy Git ${legacyName}`);
    }
  }
  for (const pseudoRef of [
    "AUTO_MERGE", "BISECT_HEAD", "CHERRY_PICK_HEAD", "FETCH_HEAD", "MERGE_AUTOSTASH",
    "MERGE_HEAD", "ORIG_HEAD", "REBASE_HEAD", "REVERT_HEAD"
  ]) {
    if (existsSync(join(dotGit, pseudoRef))) {
      throw new Error(`candidate-only repository contains Git pseudoref ${pseudoRef}`);
    }
  }
  if (existsSync(join(dotGit, "info", "grafts")) || existsSync(join(dotGit, "info", "refs"))) {
    throw new Error("candidate-only repository contains legacy Git object/ref metadata");
  }

  const topLevel = realpathSync(resolve(requestedRoot, gitText(["rev-parse", "--show-toplevel"], { cwd: requestedRoot })));
  if (topLevel !== physicalRoot) throw new Error("candidate-only repository does not match policy checkout root");
  const gitDirPath = resolve(requestedRoot, gitText(["rev-parse", "--absolute-git-dir"], { cwd: requestedRoot }));
  const commonDirPath = resolve(requestedRoot, gitText(["rev-parse", "--git-common-dir"], { cwd: requestedRoot }));
  const objectsPath = resolve(requestedRoot, gitText(["rev-parse", "--git-path", "objects"], { cwd: requestedRoot }));
  if (lstatSync(gitDirPath).isSymbolicLink() || lstatSync(objectsPath).isSymbolicLink()) {
    throw new Error("candidate-only Git directory or object store is symlinked");
  }
  const gitDir = realpathSync(gitDirPath);
  const commonDir = realpathSync(commonDirPath);
  const objects = realpathSync(objectsPath);
  if (realpathSync(dotGit) !== gitDir) throw new Error("candidate-only checkout .git directory is redirected");
  if (commonDir !== gitDir || existsSync(join(gitDir, "commondir"))) throw new Error("candidate-only repository uses a common Git directory");
  if (objects !== join(gitDir, "objects")) throw new Error("candidate-only repository redirects its object store");
  if (existsSync(join(gitDir, "shallow"))) throw new Error("candidate-only repository is shallow");
  if (existsSync(join(objects, "info", "alternates")) || existsSync(join(objects, "info", "http-alternates"))) {
    throw new Error("candidate-only repository has object alternates");
  }
  const packDir = join(objects, "pack");
  if (existsSync(packDir) && readdirSync(packDir).some(name => name.toLowerCase().endsWith(".promisor"))) {
    throw new Error("candidate-only repository contains a promisor pack");
  }
  if (gitText(["rev-parse", "--show-object-format"], { cwd: requestedRoot }) !== "sha1") {
    throw new Error("candidate-only repository is not SHA-1");
  }
  if (gitText(["for-each-ref", "--format=%(refname)"], { cwd: requestedRoot })) {
    throw new Error("candidate-only repository contains refs or tags");
  }
  if (gitText(["remote"], { cwd: requestedRoot })) throw new Error("candidate-only repository contains a remote");

  const config = runGit(
    ["config", "--local", "--no-includes", "--null", "--name-only", "--list"],
    { allowFailure: true, cwd: requestedRoot }
  );
  if (config.status !== 0) throw new Error("candidate-only repository configuration cannot be inspected");
  if (existsSync(join(gitDir, "config.worktree"))) {
    throw new Error("candidate-only repository has worktree-scoped Git configuration");
  }
  const unsafeConfig = Buffer.from(config.stdout).toString("utf8").split("\0").filter(Boolean).filter(raw => {
    const name = raw.toLowerCase();
    return /^extensions\./.test(name)
      || name === "core.alternaterefscommand"
      || name === "diff.external"
      || /^diff\..*\.command$/.test(name)
      || /^fsck\./.test(name)
      || name === "include.path"
      || /^includeif\..*\.path$/.test(name)
      || /^remote\..*\.(promisor|partialclonefilter|fetch)$/.test(name);
  }).sort();
  if (unsafeConfig.length) throw new Error(`candidate-only repository has unsafe Git configuration: ${unsafeConfig.join(", ")}`);

  const head = commitHeaders("HEAD", requestedRoot);
  if (!head) throw new Error("candidate-only HEAD is not an independently framed commit");
  if (!sameList(head.parents, [C9_MERGE_SHA])) throw new Error("candidate-only HEAD is not a direct child of exact Q");
  if (!sameList(changedPaths(C9_MERGE_SHA, head.oid, requestedRoot), POLICY_CORRECTION_CHANGED_PATHS)) {
    throw new Error("candidate-only HEAD does not have the exact three-path scope");
  }

  const controls = [
    [RECOVERY_BASE_SHA, "commit"],
    [GATE_A_BASE_SHA, "commit"],
    [GATE_A_BASE_TREE, "tree"],
    [GATE_A_HEAD_SHA, "commit"],
    [GATE_A_MERGE_SHA, "commit"],
    [GATE_A_MERGE_TREE, "tree"],
    [C9_HEAD_SHA, "commit"],
    [C9_MERGE_SHA, "commit"],
    [C9_MERGE_TREE, "tree"]
  ];
  const controlRows = objectTypes(controls.map(([oid]) => oid), requestedRoot);
  for (let index = 0; index < controls.length; index += 1) {
    if (controlRows[index].type !== controls[index][1]) {
      throw new Error(`required control ${controlRows[index].oid} is ${controlRows[index].type}, expected ${controls[index][1]}`);
    }
  }

  const inventory = forbiddenObjectInventory();
  const inventorySha256 = sha256(canonicalJsonBytes(inventory));
  assertForbiddenObjectInventoryIdentity(inventorySha256);
  const forbiddenRows = objectTypes(inventory.objects, requestedRoot);
  const present = forbiddenRows.filter(row => row.type !== "missing");
  if (present.length) throw new Error(`forbidden objects present: ${present.map(row => `${row.oid}:${row.type}`).join(", ")}`);

  const objectInventory = exactObjectInventory(requestedRoot);

  return {
    absent: forbiddenRows.length,
    controlsPresent: controlRows.length,
    head: head.oid,
    inventorySha256,
    objectInventory,
    result: "PASS",
    schemaVersion: 2
  };
}

export function candidateOnlyObjectStoreReceipt({ repoRoot = ROOT, environment = process.env } = {}) {
  assertSafeGitEnvironment(environment);

  const requestedRoot = resolve(repoRoot);
  const physicalRoot = realpathSync(requestedRoot);
  if (requestedRoot !== physicalRoot) throw new Error("candidate-only checkout root is symlinked or redirected");

  const dotGit = join(physicalRoot, ".git");
  if (!existsSync(dotGit) || lstatSync(dotGit).isSymbolicLink() || !lstatSync(dotGit).isDirectory()) {
    throw new Error("candidate-only checkout .git entry is not a direct directory");
  }
  assertDirectoryHasNoSymlink(dotGit, "Git directory");
  for (const legacyName of ["branches", "remotes"]) {
    const legacyPath = join(dotGit, legacyName);
    if (existsSync(legacyPath)
      && (!lstatSync(legacyPath).isDirectory() || readdirSync(legacyPath).length > 0)) {
      throw new Error(`candidate-only repository contains legacy Git ${legacyName}`);
    }
  }
  for (const pseudoRef of [
    "AUTO_MERGE", "BISECT_HEAD", "CHERRY_PICK_HEAD", "FETCH_HEAD", "MERGE_AUTOSTASH",
    "MERGE_HEAD", "ORIG_HEAD", "REBASE_HEAD", "REVERT_HEAD"
  ]) {
    if (existsSync(join(dotGit, pseudoRef))) {
      throw new Error(`candidate-only repository contains Git pseudoref ${pseudoRef}`);
    }
  }
  if (existsSync(join(dotGit, "info", "grafts")) || existsSync(join(dotGit, "info", "refs"))) {
    throw new Error("candidate-only repository contains legacy Git object/ref metadata");
  }

  const topLevel = realpathSync(resolve(requestedRoot, gitText(["rev-parse", "--show-toplevel"], { cwd: requestedRoot })));
  if (topLevel !== physicalRoot) throw new Error("candidate-only repository does not match policy checkout root");
  const gitDirPath = resolve(requestedRoot, gitText(["rev-parse", "--absolute-git-dir"], { cwd: requestedRoot }));
  const commonDirPath = resolve(requestedRoot, gitText(["rev-parse", "--git-common-dir"], { cwd: requestedRoot }));
  const objectsPath = resolve(requestedRoot, gitText(["rev-parse", "--git-path", "objects"], { cwd: requestedRoot }));
  if (lstatSync(gitDirPath).isSymbolicLink() || lstatSync(objectsPath).isSymbolicLink()) {
    throw new Error("candidate-only Git directory or object store is symlinked");
  }
  const gitDir = realpathSync(gitDirPath);
  const commonDir = realpathSync(commonDirPath);
  const objects = realpathSync(objectsPath);
  if (realpathSync(dotGit) !== gitDir) throw new Error("candidate-only checkout .git directory is redirected");
  if (commonDir !== gitDir || existsSync(join(gitDir, "commondir"))) throw new Error("candidate-only repository uses a common Git directory");
  if (objects !== join(gitDir, "objects")) throw new Error("candidate-only repository redirects its object store");
  if (existsSync(join(gitDir, "shallow"))) throw new Error("candidate-only repository is shallow");
  if (existsSync(join(objects, "info", "alternates")) || existsSync(join(objects, "info", "http-alternates"))) {
    throw new Error("candidate-only repository has object alternates");
  }
  const packDir = join(objects, "pack");
  if (existsSync(packDir) && readdirSync(packDir).some(name => name.toLowerCase().endsWith(".promisor"))) {
    throw new Error("candidate-only repository contains a promisor pack");
  }
  if (gitText(["rev-parse", "--show-object-format"], { cwd: requestedRoot }) !== "sha1") {
    throw new Error("candidate-only repository is not SHA-1");
  }
  if (gitText(["for-each-ref", "--format=%(refname)"], { cwd: requestedRoot })) {
    throw new Error("candidate-only repository contains refs or tags");
  }
  if (gitText(["remote"], { cwd: requestedRoot })) throw new Error("candidate-only repository contains a remote");

  const config = runGit(
    ["config", "--local", "--no-includes", "--null", "--name-only", "--list"],
    { allowFailure: true, cwd: requestedRoot }
  );
  if (config.status !== 0) throw new Error("candidate-only repository configuration cannot be inspected");
  if (existsSync(join(gitDir, "config.worktree"))) {
    throw new Error("candidate-only repository has worktree-scoped Git configuration");
  }
  const unsafeConfig = Buffer.from(config.stdout).toString("utf8").split("\0").filter(Boolean).filter(raw => {
    const name = raw.toLowerCase();
    return /^extensions\./.test(name)
      || name === "core.alternaterefscommand"
      || name === "diff.external"
      || /^diff\..*\.command$/.test(name)
      || /^fsck\./.test(name)
      || name === "include.path"
      || /^includeif\..*\.path$/.test(name)
      || /^remote\..*\.(promisor|partialclonefilter|fetch)$/.test(name);
  }).sort();
  if (unsafeConfig.length) throw new Error(`candidate-only repository has unsafe Git configuration: ${unsafeConfig.join(", ")}`);

  const head = commitHeaders("HEAD", requestedRoot);
  if (!head) throw new Error("candidate-only HEAD is not an independently framed commit");
  const route = sameList(head.parents, [C10_MERGE_SHA]) ? "c14"
    : sameList(head.parents, [C14_MERGE_SHA]) ? "r13"
      : null;
  if (!route) throw new Error("candidate-only HEAD is not a direct child of exact S or exact X");
  const base = route === "c14" ? C10_MERGE_SHA : C14_MERGE_SHA;
  const scope = route === "c14" ? C14_CHANGED_PATHS : R13_CHANGED_PATHS;
  if (!sameList(changedPaths(base, head.oid, requestedRoot), scope)) {
    throw new Error(`candidate-only HEAD does not have the exact ${route === "c14" ? "five-path C14" : "four-path r13"} scope`);
  }
  for (const path of scope) {
    const identity = fileIdentity(head.oid, path, requestedRoot);
    if (!identity || identity.mode !== "100644") throw new Error(`candidate-only ${path} is missing or not mode 100644`);
  }

  const controls = [
    [RECOVERY_BASE_SHA, "commit"],
    [GATE_A_BASE_SHA, "commit"],
    [GATE_A_BASE_TREE, "tree"],
    [GATE_A_HEAD_SHA, "commit"],
    [GATE_A_MERGE_SHA, "commit"],
    [GATE_A_MERGE_TREE, "tree"],
    [C9_HEAD_SHA, "commit"],
    [C9_MERGE_SHA, "commit"],
    [C9_MERGE_TREE, "tree"],
    [C10_HEAD_SHA, "commit"],
    [C10_MERGE_SHA, "commit"],
    [C10_MERGE_TREE, "tree"],
    ...(route === "r13" ? [
      [C14_HEAD_SHA, "commit"],
      [C14_MERGE_SHA, "commit"],
      [C14_MERGE_TREE, "tree"]
    ] : [])
  ];
  const controlRows = objectTypes(controls.map(([oid]) => oid), requestedRoot);
  for (let index = 0; index < controls.length; index += 1) {
    if (controlRows[index].type !== controls[index][1]) {
      throw new Error(`required control ${controlRows[index].oid} is ${controlRows[index].type}, expected ${controls[index][1]}`);
    }
  }

  const inventory = route === "c14"
    ? forbiddenObjectInventory("c14")
    : r13ForbiddenObjectInventory("r13");
  const inventorySha256 = sha256(canonicalJsonBytes(inventory));
  if (route === "c14") assertForbiddenObjectInventoryIdentity("c14", inventorySha256);
  else assertR13ForbiddenObjectInventoryIdentity("r13", inventorySha256);
  const forbiddenRows = objectTypes(inventory.objects, requestedRoot);
  const present = forbiddenRows.filter(row => row.type !== "missing");
  if (present.length) throw new Error(`forbidden objects present: ${present.map(row => `${row.oid}:${row.type}`).join(", ")}`);

  const objectInventory = exactObjectInventory(requestedRoot);
  return {
    absent: forbiddenRows.length,
    controlsPresent: controlRows.length,
    head: head.oid,
    inventorySha256,
    objectInventory,
    result: "PASS",
    route,
    schemaVersion: route === "c14" ? 3 : 4
  };
}

function flatTreeRecords(ref) {
  const raw = gitBytes(["ls-tree", "-r", "-z", ref]);
  return raw.toString("utf8").split("\0").filter(Boolean).map(row => {
    const match = row.match(/^(\d{6}) (?:blob|commit) ([0-9a-f]{40})\t(.+)$/);
    if (!match) throw new Error(`unsupported tree row in ${ref}: ${row}`);
    return { mode: match[1], blob: match[2], path: match[3] };
  }).sort((left, right) => left.path.localeCompare(right.path));
}

function overlayTreeRecords(baseRecords, overrides) {
  const records = new Map(baseRecords.map(record => [record.path, { ...record }]));
  for (const override of overrides) records.set(override.path, { ...override });
  return [...records.values()].sort((left, right) => left.path.localeCompare(right.path));
}

function treeOidFromFlatRecords(records) {
  const makeDirectory = () => ({ files: new Map(), directories: new Map() });
  const root = makeDirectory();
  for (const record of records) {
    if (!/^(?:100644|100755|120000|160000)$/.test(record.mode) || !FULL_SHA_RE.test(record.blob || "")) {
      throw new Error(`unsupported record for ${record.path}`);
    }
    const parts = record.path.split("/");
    let directory = root;
    for (const part of parts.slice(0, -1)) {
      if (directory.files.has(part)) throw new Error(`tree path collision at ${record.path}`);
      if (!directory.directories.has(part)) directory.directories.set(part, makeDirectory());
      directory = directory.directories.get(part);
    }
    const name = parts.at(-1);
    if (directory.files.has(name) || directory.directories.has(name)) throw new Error(`duplicate tree path ${record.path}`);
    directory.files.set(name, record);
  }

  const hashDirectory = directory => {
    const entries = [
      ...[...directory.files.entries()].map(([name, record]) => ({ name, mode: record.mode, oid: record.blob, directory: false })),
      ...[...directory.directories.entries()].map(([name, child]) => ({ name, mode: "40000", oid: hashDirectory(child), directory: true }))
    ].sort((left, right) => Buffer.compare(
      Buffer.from(`${left.name}${left.directory ? "/" : ""}`, "utf8"),
      Buffer.from(`${right.name}${right.directory ? "/" : ""}`, "utf8")
    ));
    const body = Buffer.concat(entries.map(entry => Buffer.concat([
      Buffer.from(`${entry.mode} ${entry.name}\0`, "utf8"),
      Buffer.from(entry.oid, "hex")
    ])));
    return gitObjectOid("tree", body);
  };
  return hashDirectory(root);
}

function changedRecordPaths(baseRecords, targetRecords) {
  const base = new Map(baseRecords.map(record => [record.path, record]));
  const target = new Map(targetRecords.map(record => [record.path, record]));
  return [...new Set([...base.keys(), ...target.keys()])].filter(path =>
    base.get(path)?.mode !== target.get(path)?.mode || base.get(path)?.blob !== target.get(path)?.blob
  ).sort();
}

function contentManifestFromRecords(records) {
  const sorted = [...records].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0
  );
  if (new Set(sorted.map(record => record.path)).size !== sorted.length) throw new Error("content manifest has duplicate paths");
  const digest = createHash("sha256");
  for (const record of sorted) {
    if (!record.sha256) throw new Error(`content manifest is missing SHA-256 for ${record.path}`);
    digest.update(record.mode);
    digest.update("\0blob\0");
    digest.update(record.path);
    digest.update("\0");
    digest.update(record.sha256);
    digest.update("\n");
  }
  return digest.digest("hex");
}

function contentManifest(ref, paths) {
  const unique = [...new Set(paths)].sort();
  if (unique.length !== paths.length) throw new Error("duplicate content-manifest path");
  const digest = createHash("sha256");
  for (const path of unique) {
    const item = fileIdentity(ref, path);
    if (!item) throw new Error(`content-manifest path is missing: ${path}`);
    digest.update(item.mode);
    digest.update("\0");
    digest.update("blob");
    digest.update("\0");
    digest.update(path);
    digest.update("\0");
    digest.update(item.sha256);
    digest.update("\n");
  }
  return digest.digest("hex");
}

const artCompatibilityCache = new Map();

function sealedArtRawCommit() {
  return Buffer.from([
    `tree ${ART_R2_TREE}`,
    `parent ${ART_R2_PARENT}`,
    `author ${ART_R2_AUTHOR}`,
    `committer ${ART_R2_AUTHOR}`,
    "",
    ART_R2_COMMIT_TITLE
  ].join("\n"), "utf8");
}

function validateArtCompatibility(ref, seal = HISTORICAL_REC02_SEAL) {
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  const cacheKey = `${seal.id}:${patchIdentity?.blob || "missing"}`;
  if (artCompatibilityCache.has(cacheKey)) return structuredClone(artCompatibilityCache.get(cacheKey));
  const errors = [];
  const sealedBytes = Buffer.from(ART_R2_SEALED_MANIFEST, "utf8");
  if (sealedBytes.length !== ART_R2_SEALED_MANIFEST_BYTES) errors.push("sealed ART-R2 manifest byte length drifted");
  if (sha256(sealedBytes) !== ART_R2_SEALED_MANIFEST_SHA256) errors.push("sealed ART-R2 manifest SHA-256 drifted");

  let sealedRecords = [];
  try {
    sealedRecords = sealedManifestRecords();
  } catch (error) {
    errors.push(error.message);
  }
  const sealedPaths = sealedRecords.map(record => record.path);
  const imageRecords = sealedRecords.filter(record => record.path.startsWith("images/"));
  if (sealedRecords.length !== 79 || new Set(sealedPaths).size !== 79) errors.push(`sealed ART-R2 path count ${sealedRecords.length} != 79`);
  if (imageRecords.length !== 55) errors.push(`sealed ART-R2 image count ${imageRecords.length} != 55`);

  const artRaw = sealedArtRawCommit();
  if (gitObjectOid("commit", artRaw) !== ART_R2_HEAD) errors.push("sealed ART-R2 raw frame does not reproduce the exact head");
  if (sha256(artRaw) !== ART_R2_RAW_SHA256) errors.push("sealed ART-R2 raw frame SHA-256 drifted");

  let baseRecords = [];
  let heldRecords = [];
  try {
    baseRecords = flatTreeRecords(GATE_A_BASE_SHA);
    heldRecords = overlayTreeRecords(baseRecords, sealedRecords);
    if (treeOidFromFlatRecords(heldRecords) !== ART_R2_TREE) errors.push("sealed ART-R2 records do not reproduce the held tree");
    if (!sameList(changedRecordPaths(baseRecords, heldRecords), sealedPaths)) errors.push("sealed ART-R2 changed-path inventory drifted");
    if (contentManifestFromRecords(sealedRecords) !== ART_R2_CHANGED_MANIFEST_SHA256) errors.push("sealed ART-R2 content manifest drifted");
    if (contentManifestFromRecords(imageRecords) !== ART_R2_IMAGE_MANIFEST_SHA256) errors.push("sealed ART-R2 55-image manifest drifted");
  } catch (error) {
    errors.push(`sealed ART-R2 tree reconstruction failed: ${error.message}`);
  }

  const sealedByPath = new Map(sealedRecords.map(record => [record.path, record]));
  if (sealedByPath.get("artifacts/ART-INTEGRATION-R2-55_RECORD.json")?.sha256 !== ART_R2_RECORD_SHA256) {
    errors.push("sealed ART-R2 record identity drifted");
  }
  if (sealedByPath.get("scripts/validate-art-r2.mjs")?.sha256 !== ART_R2_VALIDATOR_SHA256) {
    errors.push("sealed ART-R2 validator identity drifted");
  }
  const sealedVerify = sealedByPath.get("scripts/verify.mjs");
  if (!sealedVerify || sealedVerify.blob !== ART_R2_VERIFY_BLOB || sealedVerify.sha256 !== ART_R2_VERIFY_SHA256) {
    errors.push("sealed ART-R2 verifier identity drifted");
  }

  const baseVerify = fileIdentity(GATE_A_BASE_SHA, "scripts/verify.mjs");
  if (!baseVerify || baseVerify.sha256 !== "ba413f6b41d4f0278238f69feea59865e0d3e979b177c76db6b380854afec084") {
    errors.push("protected verifier identity drifted before ART transform");
  }
  if (sha256(Buffer.from(applyArtVerifierTransform.toString())) !== ART_R2_TRANSFORM_FUNCTION_SHA256) {
    errors.push("embedded ART transform source drifted");
  }

  let reproducedHeldVerify = null;
  let combinedVerify = null;
  try {
    if (baseVerify) {
      reproducedHeldVerify = Buffer.from(applyArtVerifierTransform(baseVerify.bytes.toString("utf8")), "utf8");
      if (gitObjectOid("blob", reproducedHeldVerify) !== ART_R2_VERIFY_BLOB
        || sha256(reproducedHeldVerify) !== ART_R2_VERIFY_SHA256) {
        errors.push("embedded ART transform does not reproduce the sealed held verifier");
      }
    }
  } catch (error) {
    errors.push(`held ART verifier reconstruction failed closed: ${error.message}`);
  }

  const projection = validateProjectionArtifacts(ref, seal);
  let recVerify = null;
  if (projection.errors.length) {
    errors.push(...projection.errors.map(error => `ART functional projection: ${error}`));
  } else if (projection.functional?.tree) {
    recVerify = fileIdentity(projection.functional.tree, "scripts/verify.mjs");
  }
  if (!recVerify || recVerify.blob !== seal.verifyBlob || recVerify.sha256 !== seal.verifySha256) {
    errors.push("REC-02 verifier output identity drifted before ART transform");
  }
  try {
    if (recVerify) combinedVerify = Buffer.from(applyArtVerifierTransform(recVerify.bytes.toString("utf8")), "utf8");
  } catch (error) {
    errors.push(`combined ART verifier reconstruction failed closed: ${error.message}`);
  }
  if (!combinedVerify || gitObjectOid("blob", combinedVerify) !== seal.combinedVerifyBlob
    || sha256(combinedVerify) !== seal.combinedVerifySha256) {
    errors.push("combined REC-02 + ART-R2 verifier identity drifted");
  }

  let combinedTree = null;
  let combinedManifest = null;
  if (projection.functional?.tree && combinedVerify && baseRecords.length && sealedRecords.length) {
    try {
      const functionalRecords = flatTreeRecords(projection.functional.tree);
      const combinedRecord = {
        mode: "100644",
        blob: seal.combinedVerifyBlob,
        sha256: seal.combinedVerifySha256,
        path: "scripts/verify.mjs"
      };
      const combinedRecords = overlayTreeRecords(overlayTreeRecords(functionalRecords, sealedRecords), [combinedRecord]);
      combinedTree = treeOidFromFlatRecords(combinedRecords);
      const combinedPaths = changedRecordPaths(baseRecords, combinedRecords);
      if (combinedPaths.length !== 87 || new Set(combinedPaths).size !== 87) {
        errors.push(`combined ART projection path count ${combinedPaths.length} != 87`);
      }
      const evidenceByPath = new Map([
        ...(projection.functional.records || []).map(record => [record.path, { ...record, sha256: record.sha256 }]),
        ...sealedRecords.map(record => [record.path, record]),
        [combinedRecord.path, combinedRecord]
      ]);
      const manifestRows = combinedPaths.map(path => evidenceByPath.get(path)).filter(Boolean);
      if (manifestRows.length !== combinedPaths.length) throw new Error("combined ART manifest lacks a changed-path identity");
      combinedManifest = contentManifestFromRecords(manifestRows);
      if (combinedTree !== seal.combinedTree) errors.push(`combined ART projection tree ${combinedTree} != ${seal.combinedTree}`);
      if (combinedManifest !== seal.combinedManifestSha256) errors.push("combined ART projection manifest drifted");
    } catch (error) {
      errors.push(`combined ART projection reconstruction failed: ${error.message}`);
    }
  }
  const result = {
    errors,
    combinedTree,
    combinedManifest,
    sealedManifestSha256: sha256(sealedBytes),
    transformSha256: sha256(Buffer.from(applyArtVerifierTransform.toString()))
  };
  artCompatibilityCache.set(cacheKey, structuredClone(result));
  return result;
}

function workflowSecurityErrors(ref, releaseWorkflowSha256 = RELEASE_WORKFLOW_SHA256) {
  const errors = [];
  const listing = gitText(["ls-tree", "-r", "--name-only", ref, "--", ".github/workflows"]);
  const names = listing ? listing.split(/\r?\n/).filter(Boolean).sort() : [];
  const expectedNames = [RELEASE_WORKFLOW_PATH, VERIFY_WORKFLOW_PATH].sort();
  if (!sameList(names, expectedNames)) errors.push(`workflow allowlist mismatch: ${names.join(", ") || "<none>"}`);
  const expectedHashes = {
    [RELEASE_WORKFLOW_PATH]: releaseWorkflowSha256,
    [VERIFY_WORKFLOW_PATH]: VERIFY_WORKFLOW_SHA256
  };
  for (const path of names) {
    const identity = fileIdentity(ref, path);
    if (!identity) {
      errors.push(`${path}: workflow is unreadable`);
      continue;
    }
    if (identity.sha256 !== expectedHashes[path]) errors.push(`${path}: bytes differ from the authorized workflow`);
    const text = identity.bytes.toString("utf8");
    const onBlock = text.match(/^on:\s*\n((?:(?:[ \t]+[^\n]*)?\n)*)/m)?.[1] || "";
    const events = [...onBlock.matchAll(/^  ([a-z_]+):/gm)].map(match => match[1]).sort();
    if (!sameList(events, ["pull_request", "push"])) errors.push(`${path}: trigger set is not exactly pull_request + push`);
    if (/^[ \t]*pull_request_target:/m.test(text) || /^[ \t]*(?:workflow_dispatch|repository_dispatch|release|schedule|deployment):/m.test(text)) {
      errors.push(`${path}: privileged, manual, scheduled, release, or deployment trigger is forbidden`);
    }
    if (/^\s{4,}(?:tags|tags-ignore|paths|paths-ignore):/m.test(text)) errors.push(`${path}: tag or path filters are forbidden`);
    if (/^[ \t]*permissions:[ \t]*(?:write-all|read-all)[ \t]*(?:#.*)?$/m.test(text)) {
      errors.push(`${path}: aggregate write-all/read-all permissions are forbidden`);
    }
    const permissionHeaders = [...text.matchAll(/^([ \t]+)permissions:[^\n]*$/gm)];
    if (permissionHeaders.length !== 0) {
      errors.push(`${path}: job-level permissions are forbidden`);
    }
    const permissionBlocks = [...text.matchAll(/^permissions:\s*\n((?:[ \t]+[^\n]*\n?)*)/gm)];
    if (permissionBlocks.length !== 1 || !/^  contents:\s*read\s*(?:#.*)?$/m.test(permissionBlocks[0]?.[1] || "")) {
      errors.push(`${path}: root permissions are not exactly contents: read`);
    }
    for (const permission of text.matchAll(/^([ \t]+)([a-z-]+):[ \t]*(read|write)[ \t]*(?:#.*)?$/gm)) {
      if (permission[1] !== "  " || permission[2] !== "contents" || permission[3] !== "read") {
        errors.push(`${path}: forbidden permission ${permission[2]}: ${permission[3]}`);
      }
    }
    const actions = [...text.matchAll(/^[ \t]*-?[ \t]*uses:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
    for (const action of actions) {
      if (!ALLOWED_ACTIONS.has(action) || !FULL_SHA_RE.test(action.split("@")[1] || "")) {
        errors.push(`${path}: unapproved or mutable action ${action}`);
      }
    }
    const lines = text.split(/\r?\n/);
    const jobsLine = lines.findIndex(line => /^jobs:[ \t]*(?:#.*)?$/.test(line));
    const jobStarts = jobsLine < 0 ? [] : lines.flatMap((line, index) => (
      index > jobsLine && /^  [a-zA-Z0-9_-]+:[ \t]*(?:#.*)?$/.test(line) ? [index] : []
    ));
    if (jobStarts.length === 0) errors.push(`${path}: no explicit jobs were found`);
    const jobNames = jobStarts.map(index => lines[index].trim().split(":", 1)[0]);
    const expectedJobNames = path === RELEASE_WORKFLOW_PATH
      ? ["release-policy"]
      : ["simulation_gate", "simulation_ratchet", "verify"];
    if (!sameList([...jobNames].sort(), [...expectedJobNames].sort())) {
      errors.push(`${path}: workflow job allowlist mismatch`);
    }
    for (let jobIndex = 0; jobIndex < jobStarts.length; jobIndex += 1) {
      const start = jobStarts[jobIndex];
      const end = jobStarts[jobIndex + 1] ?? lines.length;
      const jobName = jobNames[jobIndex];
      const jobText = lines.slice(start, end).join("\n");
      const jobActions = [...jobText.matchAll(/^[ \t]*-?[ \t]*uses:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      const requiresCheckout = path === RELEASE_WORKFLOW_PATH || jobName !== "simulation_gate";
      if (requiresCheckout && (jobActions.filter(action => action === CHECKOUT_ACTION).length !== 1
        || jobActions.filter(action => action === SETUP_NODE_ACTION).length !== 1)) {
        errors.push(`${path}: job ${jobName} must contain each required immutable action exactly once`);
      } else if (!requiresCheckout && jobActions.length !== 0) {
        errors.push(`${path}: actionless gate job ${jobName} contains an action`);
      }
    }
    const checkoutRows = lines.flatMap((line, index) => line.includes(`uses: ${CHECKOUT_ACTION}`) ? [index] : []);
    for (const row of checkoutRows) {
      let end = row + 1;
      while (end < lines.length && !/^      -[ \t]/.test(lines[end])) end += 1;
      const stanza = lines.slice(row, end).join("\n");
      const credentialValues = [...stanza.matchAll(/^[ \t]+persist-credentials:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      const depthValues = [...stanza.matchAll(/^[ \t]+fetch-depth:[ \t]*([^\s#]+).*$/gm)].map(match => match[1]);
      if (!sameList(credentialValues, ["false"]) || !sameList(depthValues, ["0"]) || /^[ \t]+ref:/m.test(stanza)) {
        errors.push(`${path}: checkout stanza is not exactly non-credentialed full-history event checkout`);
      }
    }
    if (!/^\s+persist-credentials:\s*false\s*(?:#.*)?$/m.test(text)) errors.push(`${path}: checkout credentials are not disabled`);
    if (!/^\s+fetch-depth:\s*0\s*(?:#.*)?$/m.test(text)) errors.push(`${path}: full history is not fetched`);
    if (/^\s+ref:/m.test(text)) errors.push(`${path}: checkout ref override is forbidden`);
    if (/^\s+environment:/m.test(text)) errors.push(`${path}: deployment environment is forbidden`);
    if (/\$\{\{\s*secrets\./.test(text)) errors.push(`${path}: secret access is forbidden`);
    if (/^\s*continue-on-error:\s*true/m.test(text) || /\|\|\s*true\b/.test(text)) errors.push(`${path}: failure suppression is forbidden`);
    if (/\b(?:git\s+(?:push|tag)|gh\s+(?:release|api)|netlify\s+(?:build|deploy)|npm\s+publish|itch(?:\.io)?\s+upload|butler\s+push|curl\b[^\n]*(?:--upload-file|-X\s*(?:POST|PUT|PATCH))|wget\b[^\n]*--post)\b/i.test(text)) {
      errors.push(`${path}: mutation, release, deploy, or upload command is forbidden`);
    }
  }
  return errors;
}

function candidateEvidence(ref) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["candidate is not an independently framed commit object"] };
  if (!sameList(commit.parents, [GATE_A_BASE_SHA])) errors.push("candidate is not one direct child of the exact Gate A base");
  if (!sameList(changedPaths(GATE_A_BASE_SHA, commit.oid), GATE_A_CHANGED_PATHS)) errors.push("candidate changed paths differ from the exact six-path Gate A scope");
  for (const path of GATE_A_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: candidate path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: candidate mode ${identity.mode} != 100644`);
  }
  for (const [path, expected] of Object.entries(GATE_A_FIXED_SHA256)) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity || identity.sha256 !== expected) errors.push(`${path}: candidate SHA-256 drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== GATE_A_POLICY_PROJECTION_SHA256) {
    errors.push(`historical Gate A policy projection ${projection || "missing"} != ${GATE_A_POLICY_PROJECTION_SHA256}`);
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid));
  const projectionEvidence = validateProjectionArtifacts(commit.oid);
  errors.push(...projectionEvidence.errors);
  const artEvidence = validateArtCompatibility(commit.oid);
  errors.push(...artEvidence.errors);

  const records = canonicalRecords(commit.tree, GATE_A_CHANGED_PATHS);
  if (records.some(record => !record)) errors.push("candidate canonical manifest contains an unreadable path");
  let expectedRaw = null;
  let expectedOid = null;
  let manifest = null;
  if (records.every(Boolean)) {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("candidate raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`candidate OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null,
    projectionEvidence,
    artEvidence
  };
}

function mergeEvidence(ref, firstParent, secondEvidence) {
  const errors = [];
  const merge = commitHeaders(ref);
  if (!merge) return { errors: ["merge is not an independently framed commit object"] };
  if (!sameList(merge.parents, [firstParent, secondEvidence.oid])) errors.push("merge parents differ from the exact ordered base/head pair");
  if (merge.tree !== secondEvidence.tree) errors.push("merge tree differs from the exact candidate tree");
  if (secondEvidence.errors.length) errors.push(...secondEvidence.errors.map(error => `candidate: ${error}`));
  return { errors, oid: merge.oid, tree: merge.tree, parents: merge.parents, rawSha256: sha256(merge.bytes) };
}

function gateAMergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== GATE_A_BASE_SHA) {
    return { errors: ["protected Gate A successor is not an exact two-parent merge from the pinned base"] };
  }
  const exactErrors = [];
  if (merge.oid !== GATE_A_MERGE_SHA) exactErrors.push(`protected Gate A successor ${merge.oid} != ${GATE_A_MERGE_SHA}`);
  if (merge.tree !== GATE_A_MERGE_TREE) exactErrors.push(`protected Gate A successor tree ${merge.tree} != ${GATE_A_MERGE_TREE}`);
  if (!sameList(merge.parents, [GATE_A_BASE_SHA, GATE_A_HEAD_SHA])) {
    exactErrors.push("protected Gate A successor parents differ from the exact landed pair");
  }
  const candidate = candidateEvidence(merge.parents[1]);
  const evidence = mergeEvidence(merge.oid, GATE_A_BASE_SHA, candidate);
  return { ...evidence, errors: [...exactErrors, ...evidence.errors] };
}

function failedIdentityByHead(ref) {
  if (typeof ref !== "string") return null;
  const normalized = ref.trim().toLowerCase();
  if (!FULL_SHA_RE.test(normalized)) return null;
  return FAILED_IDENTITIES.find(identity => identity.head === normalized) || null;
}

function failedIdentityByTree(tree) {
  return typeof tree === "string"
    ? FAILED_IDENTITIES.find(identity => identity.tree === tree) || null
    : null;
}

function rejectedIdentityEvidence(identity, commit = null) {
  return {
    errors: [identity.error],
    terminalFailure: true,
    failedIdentity: identity.label,
    rejectedBeforeGit: commit === null,
    oid: commit?.oid || identity.head,
    tree: commit?.tree || identity.tree,
    parent: commit?.parents?.[0] || null,
    rawSha256: commit ? sha256(commit.bytes) : null,
    expectedOid: null,
    manifest: null,
    manifestSha256: null
  };
}

function rejectedHeadEvidence(ref) {
  const identity = failedIdentityByHead(ref);
  return identity ? rejectedIdentityEvidence(identity) : null;
}

function presentedCandidateHead(facts) {
  if (facts.eventName === "pull_request") return facts.prHeadSha;
  if (facts.eventName === "push") return facts.afterSha;
  return null;
}

function policyCorrectionEvidence(ref) {
  const rejected = rejectedHeadEvidence(ref);
  if (rejected) return rejected;

  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["policy correction candidate is not an independently framed commit object"] };
  const failedTree = failedIdentityByTree(commit.tree);
  if (failedTree) return rejectedIdentityEvidence(failedTree, commit);
  if (commit.oid !== C9_HEAD_SHA) errors.push(`historical C9 head ${commit.oid} != ${C9_HEAD_SHA}`);
  if (commit.tree !== C9_HEAD_TREE) errors.push(`historical C9 tree ${commit.tree} != ${C9_HEAD_TREE}`);
  if (sha256(commit.bytes) !== C9_HEAD_RAW_SHA256) errors.push("historical C9 raw payload drifted");

  const base = gateAMergeEvidence(GATE_A_MERGE_SHA);
  if (base.errors.length) errors.push(...base.errors.map(error => `correction base: ${error}`));
  if (!sameList(commit.parents, [GATE_A_MERGE_SHA])) {
    errors.push("policy correction candidate is not one direct child of the exact protected Gate A successor");
  }
  if (!sameList(changedPaths(GATE_A_MERGE_SHA, commit.oid), POLICY_CORRECTION_CHANGED_PATHS)) {
    errors.push("policy correction changed paths differ from the exact three-path scope");
  }
  for (const path of POLICY_CORRECTION_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: policy correction path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: policy correction mode ${identity.mode} != 100644`);
  }

  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || status.blob !== C9_STATUS_BLOB
    || status.sha256 !== C9_STATUS_SHA256
    || status.byteLength !== C9_STATUS_BYTES) {
    errors.push(`${STATUS_PATH}: historical C9 identity drifted`);
  }
  const record = fileIdentity(commit.oid, POLICY_CORRECTION_RECORD_PATH);
  if (!record || record.blob !== C9_RECORD_BLOB
    || record.sha256 !== C9_RECORD_SHA256
    || record.byteLength !== C9_RECORD_BYTES) {
    errors.push(`${POLICY_CORRECTION_RECORD_PATH}: historical C9 identity drifted`);
  }
  const policy = fileIdentity(commit.oid, POLICY_PATH);
  if (!policy || policy.blob !== C9_POLICY_BLOB
    || policy.sha256 !== C9_POLICY_SHA256
    || policy.byteLength !== C9_POLICY_BYTES) {
    errors.push(`${POLICY_PATH}: historical C9 identity drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== C9_POLICY_PROJECTION_SHA256) {
    errors.push(`historical C9 policy projection ${projection || "missing"} != ${C9_POLICY_PROJECTION_SHA256}`);
  }
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid).errors);
  errors.push(...validateArtCompatibility(commit.oid).errors);

  const records = canonicalRecords(commit.tree, POLICY_CORRECTION_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(record => !record)) {
    errors.push("policy correction canonical manifest contains an unreadable path");
  } else {
    manifest = canonicalManifest(records);
    if (sha256(Buffer.from(manifest)) !== C9_MANIFEST_SHA256) errors.push("historical C9 manifest drifted");
    expectedRaw = canonicalRawCommit(
      commit.tree,
      GATE_A_MERGE_SHA,
      C9_POLICY_CORRECTION_AUTHOR,
      C9_POLICY_CORRECTION_COMMIT_TITLE,
      records
    );
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("policy correction raw commit payload differs from the canonical frame");
    if (commit.oid !== expectedOid) errors.push(`policy correction OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function policyCorrectionMergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== GATE_A_MERGE_SHA) {
    return { errors: ["historical C9 successor is not an exact two-parent merge from the Gate A successor"] };
  }
  const exactErrors = [];
  if (merge.oid !== C9_MERGE_SHA) exactErrors.push(`historical C9 successor ${merge.oid} != ${C9_MERGE_SHA}`);
  if (merge.tree !== C9_MERGE_TREE) exactErrors.push(`historical C9 successor tree ${merge.tree} != ${C9_MERGE_TREE}`);
  if (!sameList(merge.parents, [GATE_A_MERGE_SHA, C9_HEAD_SHA])) {
    exactErrors.push("historical C9 successor parents differ from the exact landed pair");
  }
  if (sha256(merge.bytes) !== C9_MERGE_RAW_SHA256) exactErrors.push("historical C9 successor raw payload drifted");
  const evidence = mergeEvidence(merge.oid, GATE_A_MERGE_SHA, policyCorrectionEvidence(merge.parents[1]));
  return { ...evidence, errors: [...exactErrors, ...evidence.errors] };
}

function expectedPolicySuccessorStatus(source = C9_MERGE_SHA) {
  if (source !== C9_MERGE_SHA) {
    throw new Error(`C10 STATUS source must be literal exact Q ${C9_MERGE_SHA}`);
  }
  const c9 = policyCorrectionMergeEvidence(source);
  if (c9.errors.length) throw new Error(`C10 STATUS source is not exact landed C9/Q: ${c9.errors.join(" | ")}`);
  const status = fileIdentity(source, STATUS_PATH);
  if (!status || status.blob !== C9_STATUS_BLOB || status.sha256 !== C9_STATUS_SHA256
    || status.byteLength !== C9_STATUS_BYTES) {
    throw new Error("C10 STATUS source is not exact immutable C9 STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "updated_utc", "2026-08-24");
  text = replaceUniqueStatusField(
    text,
    "rec_ratchet_02_control_state",
    "GATE A CLOSED at P; C9 CLOSED through protected PR #35 at Q; r7 route consumed; C10/r8 is PRE-IDENTITY; NO-PUBLISH / NOT CERTIFIED remains active"
  );
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", C9_MERGE_SHA);
  text = replaceUniqueStatusField(text, "tested_runtime_sha", `${C9_MERGE_SHA} — exact protected C9 policy-correction successor; recovery evidence, not certification`);
  text = replaceUniqueStatusField(text, "milestone", "REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R8-C10 — immutable fixture-source successor");
  text = replaceUniqueStatusField(text, "ticket", "Manraj continuous-goal authorization + REC-02 r2 pre-freeze self-test HOLD + independent C10 design and governance audits");
  text = replaceUniqueStatusField(text, "state", "POLICY CORRECTION C10 PRE-IDENTITY — historical C9/Q fixture sealing and r2-safe successor route under construction; no candidate identity, push, pull request, ready transition, or protected merge exists");
  text = replaceUniqueStatusField(text, "implementation_branch", POLICY_CORRECTION_BRANCH);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", C9_MERGE_SHA);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", C9_MERGE_TREE);
  text = replaceUniqueStatusField(
    text,
    "c9_candidate_identity",
    `LANDED PRECURSOR — protected successor ${C9_MERGE_SHA}; correction head ${C9_HEAD_SHA}; tree ${C9_MERGE_TREE}; ordered parents [${GATE_A_MERGE_SHA},${C9_HEAD_SHA}]`
  );
  text = replaceOnce(
    text,
    `\`c9_candidate_identity: LANDED PRECURSOR — protected successor ${C9_MERGE_SHA}; correction head ${C9_HEAD_SHA}; tree ${C9_MERGE_TREE}; ordered parents [${GATE_A_MERGE_SHA},${C9_HEAD_SHA}]\``,
    `\`c9_candidate_identity: LANDED PRECURSOR — protected successor ${C9_MERGE_SHA}; correction head ${C9_HEAD_SHA}; tree ${C9_MERGE_TREE}; ordered parents [${GATE_A_MERGE_SHA},${C9_HEAD_SHA}]\`\n\`c9_immutable_receipt: sole parent ${GATE_A_MERGE_SHA}; raw payload 825 bytes / SHA-256 ${C9_HEAD_RAW_SHA256}; three-path manifest SHA-256 ${C9_MANIFEST_SHA256}; active projection ${C9_POLICY_PROJECTION_SHA256}\`\n\`c9_pr_closure_receipt: PR #35 merged 2026-08-24T01:13:24Z; synthetic merge a3fa43fe01910ddbc6d4b6ce6f5d84be1e9e5e57; Recovery Release Policy #52 run 32676047856 SUCCESS; Recovery Verify #62 run 32676047846 SUCCESS\`\n\`c9_protected_push_receipt: Q raw payload 1,262 bytes / SHA-256 ${C9_MERGE_RAW_SHA256}; Recovery Release Policy #54 run 32679102742 / job 97292489797 SUCCESS; Recovery Verify #64 run 32679102689 SUCCESS — priciest 97292489624, verify 97292489681, random 97292489692, cheapest 97292489761, simulation-gate 97292916932; seed 20260817 / 6,000 total simulations\`\n\`issue_24_q_repin_receipt: COMPLETE 2026-08-24T01:43:09Z — title 80 bytes / SHA-256 3b0d8db069be8f45eb44d6a1ad0bf1e443d82f66bfab50fa3bf12752a2afad1c; body 21,564 bytes / SHA-256 ab26a5dec4c630d9a390276b1721ad5129aa41bc68f1c2eb681974e6c7314788; exact post-write equality PASS; zero comments\``,
    "C10 STATUS landed C9/Q closure receipt"
  );
  text = replaceUniqueStatusField(text, "c9_receipt_capture_preflight", "COMPLETE / CONSUMED — exact C9 first-result receipts were durably stored before hashing or formatting");
  text = replaceUniqueStatusField(text, "c9_external_launcher_preflight", "COMPLETE / CONSUMED — exact C9 clone-local launcher and negative controls passed before identity freeze");
  text = replaceUniqueStatusField(text, "fresh_rec_02_branch", `${FUTURE_BRANCH} — BLOCKED until exact C10 lands through a separately authorized protected merge and issue #24 is freshly repinned to that successor`);
  text = replaceUniqueStatusField(
    text,
    "issue_24_repin_requirement",
    "REQUIRED EXTERNAL PRECONDITION — after exact C10 protected merge S and before reconstructing REC-02 r2, issue #24 must be repinned to exact S under separate owner authorization"
  );
  text = replaceOnce(
    text,
    "`c9_policy_prefreeze_validation: PASS — pinned Node.js v22.16.0 syntax; policy self-test exit 0 with 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 101 structured adversarial fixtures; all nine recorded failed identities have sole parent 31aca17b807c4dc8edef3683e30d5fefdd47ad7a; evaluated inventory constants equal the prose tables; clean UTF-8 required across both documents, policy, runner, and test before identity freeze`",
    "`c9_policy_prefreeze_validation: PASS — pinned Node.js v22.16.0 syntax; policy self-test exit 0 with 162 zero-Git rejected-head checks, 86 historical raw-frame fixtures, and 101 structured adversarial fixtures; all nine recorded failed identities have sole parent 31aca17b807c4dc8edef3683e30d5fefdd47ad7a; evaluated inventory constants equal the prose tables; clean UTF-8 required across both documents, policy, runner, and test before identity freeze`\n`c10_candidate_identity: UNFROZEN — no prospective head, tree, manifest, raw payload, active policy projection, bundle, PR, synthetic merge, or CI identity is embedded here`\n`c10_fixture_source_contract: IMMUTABLE — historical C9 resolves only through exact Q/C9 objects; C10 STATUS derives mechanically from exact Q and never from mutable worktree STATUS; current record and policy must match exact stabilized identities`\n`c10_expected_policy_fixture_counts: 162 zero-Git rejected-head checks; 86 historical raw-frame fixtures; 104 structured adversarial fixtures`\n`c10_policy_fixture_delta: 104 = C9 101 + three-path worktree-poison exclusion + wrong immutable C9/Q source rejection + consumed r7/C9 branch rejection; the Q-direct REC-02 fixture replaces the earlier P-direct fixture and adds no count`\n`c10_candidate_store_controls: 9 unique required controls — six historical Gate A controls + C9 head commit + Q commit + shared C9/Q tree; 103 forbidden objects remain absent`\n`c10_receipt_capture_preflight: PASS / COMPLETE PRE-IDENTITY — runner /private/tmp/sunsplitter-c10-runner/c10-receipt-runner.mjs; SHA-256 56120267169dbb18fade58d87097608dd1ab1768e4bc72369b1768e083bef7b0; 52,696 bytes; disposable test /private/tmp/sunsplitter-c10-runner/c10-receipt-runner.test.mjs; SHA-256 92135b9e2ecc96f8c067bf427fc2a79e606fd92bfe492dc7878d88a9d341c320; 52,728 bytes; mode 0644; pinned Node.js v22.16.0 syntax and full disposable preflight PASS`\n`c10_external_launcher_preflight: PASS / INDEPENDENT AUDIT — exact 13-gate C→S→T→C sequence; Q→C→S→R→T topology; durable raw/status capture; replay and receipt-loss terminality; malformed C/S/R/T and active-collision rejection; role-aware frozen/consumed/prior-r2 pre-spawn denial; physical protected-root and symlink-alias fence; existing canonical out-of-sandbox builder rejection; production C10 session absent; consumed C9 recursive digest a84901d7075ccf85286c63f6aa20fe50a63953a9db445b6ef64f79abfdff1080 unchanged`\n`r2_prefreeze_hold: PRESERVED / UNFROZEN — tree 0970dc606b63a84dd38ab46541b2a359ef95674f; STATUS blob 742ae69f94bdac92cd4ccce8267508ef0693c62a / SHA-256 9cb1f4b42f9e8393f96f176fd0252682616afca09f8adfa9f9044a7575122aa6 / 18,008 bytes; static fail-closed determination before invocation: the mandatory policy self-test was not invoked, and its expected error was artifacts/PROJECT_STATUS.md: policy correction identity drifted`\n`r2_prefreeze_identity_receipt: manifest 1,351 bytes / SHA-256 469f6f5683acdeb8d34a81112c71d2409344032504335bef6e956dd6149680de; raw frame 1,712 bytes / SHA-256 15f8128f63145990f0323622744f54b0c23f994b4bfb2e4aead667351c133bd9; predicted OID f5ab37d4845156d7b80678e4492d5fdece1c4458 absent; local branch remained Q; remote branch absent; no PR`\n`r2_prefreeze_diagnostic_receipt: two diagnostic verifier/simulation repetitions passed with stdout SHA-256 f2e67e934b18e9dbc6464d9b7d502404b7c7e34b02307bb8056e3e8e94bfc69d and normalized core c1969e553a03fd80c9ce220a511e3ed6393c9c7b72ef0ca3ab4edb4dcfc78c08; no candidate PASS was claimed and no identity was frozen, committed, pushed, or opened as a PR`",
    "C10 STATUS fixture contract"
  );
  text = replaceOnce(
    text,
    "- C9 has no authority or design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh successor.",
    `- C9 landed at exact protected successor \`${C9_MERGE_SHA}\`; its route and protected-merge authorization are consumed.\n- C10 has no known design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh successor.`,
    "C10 STATUS C9/C10 blocker transition"
  );
  text = replaceOnce(
    text,
    "- REC-02 remains blocked until a passing C9 successor lands and issue #24 is repinned to it.",
    "- REC-02 r2 is held pre-freeze because the landed C9 self-test reconstructed historical C9 from mutable r2 STATUS. It remains uncommitted and unpushed until C10 lands and issue #24 is freshly repinned.",
    "C10 STATUS r2 blocker"
  );
  text = replaceOnce(
    text,
    "; C9 does not rule locks.",
    "; C10 does not rule locks.",
    "C10 STATUS authority-lag role"
  );
  text = replaceOnce(
    text,
    "**Build / GPT-Codex:** complete the remaining independent C9/r7 policy and documentation audits, bind the exact document identities and active projection, then freeze one exact identity and run its required clean-clone, policy, verifier, simulation, and exact-scope gates once. Only after complete PASS may that exact r7 identity be pushed once and opened as one draft PR. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "**Build / GPT-Codex:** run the repaired pre-identity self-test and remaining pre-freeze static checks; only after PASS may Build freeze and enter the 13-gate one-shot. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "C10 STATUS next action"
  );
  return Buffer.from(text, "utf8");
}

function policySuccessorEvidence(ref) {
  const rejected = rejectedHeadEvidence(ref);
  if (rejected) return rejected;

  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["C10 policy successor is not an independently framed commit object"] };
  const failedTree = failedIdentityByTree(commit.tree);
  if (failedTree) return rejectedIdentityEvidence(failedTree, commit);

  const base = policyCorrectionMergeEvidence(C9_MERGE_SHA);
  if (base.errors.length) errors.push(...base.errors.map(error => `C10 base: ${error}`));
  if (!sameList(commit.parents, [C9_MERGE_SHA])) errors.push("C10 policy successor is not one direct child of exact Q");
  if (!sameList(changedPaths(C9_MERGE_SHA, commit.oid), POLICY_CORRECTION_CHANGED_PATHS)) {
    errors.push("C10 changed paths differ from the exact three-path scope");
  }
  for (const path of POLICY_CORRECTION_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: C10 path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: C10 mode ${identity.mode} != 100644`);
  }

  const status = fileIdentity(commit.oid, STATUS_PATH);
  let expectedStatus = null;
  try {
    expectedStatus = expectedPolicySuccessorStatus();
  } catch (error) {
    errors.push(error.message);
  }
  if (!status || status.blob !== POLICY_CORRECTION_STATUS_BLOB
    || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES
    || !expectedStatus || !status.bytes.equals(expectedStatus)) {
    errors.push(`${STATUS_PATH}: C10 identity drifted`);
  }
  const record = fileIdentity(commit.oid, POLICY_CORRECTION_RECORD_PATH);
  if (!record || record.blob !== POLICY_CORRECTION_RECORD_BLOB
    || record.sha256 !== POLICY_CORRECTION_RECORD_SHA256
    || record.byteLength !== POLICY_CORRECTION_RECORD_BYTES) {
    errors.push(`${POLICY_CORRECTION_RECORD_PATH}: C10 identity drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== POLICY_PROJECTION_SHA256) {
    errors.push(`active C10 policy projection ${projection || "missing"} != ${POLICY_PROJECTION_SHA256}`);
  }
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid).errors);
  errors.push(...validateArtCompatibility(commit.oid).errors);

  const records = canonicalRecords(commit.tree, POLICY_CORRECTION_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(recordEntry => !recordEntry)) errors.push("C10 canonical manifest contains an unreadable path");
  else {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(
      commit.tree,
      C9_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
      records
    );
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("C10 raw commit payload differs from the canonical frame");
    if (commit.oid !== expectedOid) errors.push(`C10 OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function policySuccessorMergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== C9_MERGE_SHA) {
    return { errors: ["protected C10 successor is not an exact two-parent merge from Q"] };
  }
  return mergeEvidence(merge.oid, C9_MERGE_SHA, policySuccessorEvidence(merge.parents[1]));
}

function replaceUniqueStatusField(text, key, value) {
  const pattern = new RegExp("`" + key + ":\\s*([^`]+)`", "g");
  const matches = [...text.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`future STATUS source field ${key} occurs ${matches.length} time(s)`);
  return text.replace(pattern, `\`${key}: ${value}\``);
}

function expectedFutureStatus(protectedMerge) {
  const merge = commitHeaders(protectedMerge);
  if (!merge) throw new Error("future STATUS base is not a commit");
  const correctionBase = policySuccessorMergeEvidence(protectedMerge);
  if (correctionBase.errors.length) {
    throw new Error(`future STATUS base is not an exact C10 policy successor: ${correctionBase.errors.join(" | ")}`);
  }
  const status = fileIdentity(protectedMerge, STATUS_PATH);
  if (!status
    || status.blob !== POLICY_CORRECTION_STATUS_BLOB
    || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES) {
    throw new Error("future STATUS source is not the exact C10 policy-successor STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "updated_utc", "2026-08-25");
  text = replaceUniqueStatusField(text, "tested_runtime_sha", `${protectedMerge} — exact protected C10 policy successor; recovery evidence, not certification`);
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "milestone", "REC-02-R2 — exact inactive projection activation from the landed policy-correction successor");
  text = replaceUniqueStatusField(text, "ticket", "REC-02 / issue #24 — governed zero-exit implementation r2");
  text = replaceUniqueStatusField(text, "state", `REC-02 R2 CANDIDATE — exact protected policy-correction successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED`);
  text = replaceUniqueStatusField(text, "implementation_branch", FUTURE_BRANCH);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", merge.tree);
  text = replaceUniqueStatusField(
    text,
    "c10_candidate_identity",
    `LANDED PRECURSOR — protected successor ${protectedMerge}; correction head ${merge.parents[1]}; tree ${merge.tree}; ordered parents [${merge.parents.join(",")}]`
  );
  text = replaceUniqueStatusField(text, "c10_receipt_capture_preflight", "COMPLETE / CONSUMED — exact C10 first-result receipts were durably stored before hashing or formatting");
  text = replaceUniqueStatusField(text, "c10_external_launcher_preflight", "COMPLETE / CONSUMED — exact C10 clone-local launcher and negative controls passed before identity freeze");
  text = replaceUniqueStatusField(text, "fresh_rec_02_branch", `${FUTURE_BRANCH} — CONSTRUCTED FROM exact protected policy-correction successor ${protectedMerge}`);
  text = replaceUniqueStatusField(
    text,
    "issue_24_repin_requirement",
    `REQUIRED EXTERNAL PRECONDITION / NOT VERIFIED BY REPOSITORY POLICY — owner-authenticated readback must show issue #24 repinned to exact ${protectedMerge}; external receipt must accompany candidate`
  );
  text = replaceUniqueStatusField(text, "functional_projection_state", "ACTIVATED — exact pinned patch and baseline applied; full exact-head verifier and locked simulations must pass again");
  text = replaceUniqueStatusField(text, "active_simulation_baseline_sha256", `${INACTIVE_BASELINE_SHA256} — exact REC-02 baseline activated from the landed Gate A artifact`);
  text = replaceOnce(
    text,
    "`policy_correction_scope: exactly artifacts/PROJECT_STATUS.md; artifacts/REC-RATCHET-02_POLICY_SELFTEST_CORRECTION.md; scripts/release-policy.mjs`",
    "`policy_correction_scope: LANDED PRECURSOR — exact three-path C10 envelope retained as immutable evidence`\n`rec_02_scope: exactly artifacts/PROJECT_STATUS.md; scripts/fixtures/pipe-boot-r1-simulation-baseline.json; scripts/verify.mjs; src/scenes-02.js; src/scenes-04.js; src/scenes-05.js; src/scenes-06.js; src/scenes-13.js; src/scenes-36.js; src/scenes-55.js`",
    "future STATUS REC-02 scope"
  );
  text = replaceOnce(
    text,
    "- C10 has no known design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh successor.",
    `- C10 landed at exact protected policy successor \`${protectedMerge}\`; that protected-merge authorization is consumed.`,
    "future STATUS C10 blocker"
  );
  text = replaceOnce(
    text,
    "- REC-02 r2 is held pre-freeze because the landed C9 self-test reconstructed historical C9 from mutable r2 STATUS. It remains uncommitted and unpushed until C10 lands and issue #24 is freshly repinned.",
    `- REC-02 r2 is an exact candidate from \`${protectedMerge}\` after the required issue #24 repin. Its protected merge remains unauthorized pending exact-head checks, attributable CI, independent PASS, fresh ruleset/bypass/ref readback, and separate owner authorization.`,
    "future STATUS REC-02 blocker"
  );
  text = replaceUniqueStatusField(
    text,
    "r2_prefreeze_hold",
    `RESOLVED BY SUCCESSOR ROUTE — historical C9 fixture is immutable and this exact REC-02 r2 candidate was reconstructed from ${protectedMerge}; prior unfrozen Q-based bytes remain non-authoritative`
  );
  text = replaceOnce(
    text,
    "**Build / GPT-Codex:** run the repaired pre-identity self-test and remaining pre-freeze static checks; only after PASS may Build freeze and enter the 13-gate one-shot. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "**Build / GPT-Codex:** after complete local PASS, push this exact REC-02 r2 identity once, open one draft PR against the protected recovery branch, monitor attributable attempt-1 CI, and hand the immutable packet to independent review. Do not mark ready or merge. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "future STATUS next action"
  );
  return Buffer.from(text, "utf8");
}

const futureTreeCache = new Map();

function buildFutureTree(protectedMerge) {
  if (futureTreeCache.has(protectedMerge)) return futureTreeCache.get(protectedMerge);
  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  if (!patchIdentity || !baselineIdentity) throw new Error("future projection artifacts are missing");
  const artifact = JSON.parse(patchIdentity.bytes.toString("utf8"));
  const status = expectedFutureStatus(protectedMerge);
  const reconstructed = reconstructPatchTree(protectedMerge, artifact, {
    [ACTIVE_BASELINE_PATH]: { bytes: baselineIdentity.bytes, mode: baselineIdentity.mode },
    [STATUS_PATH]: { bytes: status, mode: "100644" }
  });
  const result = { tree: reconstructed.tree, transcript: reconstructed.transcript, status };
  futureTreeCache.set(protectedMerge, result);
  return result;
}

function futureEvidence(ref, protectedMerge) {
  const rejected = rejectedHeadEvidence(ref);
  if (rejected) return rejected;

  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: [...errors, "future REC-02 candidate is not an independently framed commit object"] };
  const failedTree = failedIdentityByTree(commit.tree);
  if (failedTree) return rejectedIdentityEvidence(failedTree, commit);

  const baseEvidence = policySuccessorMergeEvidence(protectedMerge);
  if (baseEvidence.errors.length) errors.push(...baseEvidence.errors.map(error => `future base: ${error}`));
  if (!sameList(commit.parents, [protectedMerge])) errors.push("future REC-02 candidate is not one direct child of the exact protected policy-correction successor");
  if (!sameList(changedPaths(protectedMerge, commit.oid), FUTURE_CHANGED_PATHS)) errors.push("future REC-02 changed paths differ from the exact ten-path activation scope");
  let expectedTree;
  try {
    expectedTree = buildFutureTree(protectedMerge);
    if (commit.tree !== expectedTree.tree) errors.push(`future REC-02 tree ${commit.tree} != mechanically projected ${expectedTree.tree}`);
  } catch (error) {
    errors.push(error.message);
  }

  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  let artifact = null;
  try {
    artifact = patchIdentity ? JSON.parse(patchIdentity.bytes.toString("utf8")) : null;
  } catch {
    errors.push("future patch artifact is not valid JSON");
  }
  if (artifact) {
    for (const row of artifact.files || []) {
      const output = fileIdentity(commit.oid, row.path);
      if (!output || output.mode !== row.output?.mode || output.blob !== row.output?.blob
        || output.sha256 !== row.output?.sha256 || output.byteLength !== row.output?.byteLength) {
        errors.push(`${row.path}: future exact output identity drifted`);
      }
    }
  }
  const active = fileIdentity(commit.oid, ACTIVE_BASELINE_PATH);
  if (!active || !baselineIdentity || active.mode !== baselineIdentity.mode || active.blob !== baselineIdentity.blob
    || active.sha256 !== baselineIdentity.sha256 || active.byteLength !== baselineIdentity.byteLength) {
    errors.push("future active baseline is not the exact authorized inactive baseline bytes");
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || !expectedTree || !status.bytes.equals(expectedTree.status)) errors.push("future STATUS is not the exact separately authored structural transition");
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  if (policyProjection(commit.oid) !== POLICY_PROJECTION_SHA256) errors.push("future REC-02 policy projection drifted");
  errors.push(...workflowSecurityErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid).errors);

  const records = canonicalRecords(commit.tree, FUTURE_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(record => !record)) errors.push("future REC-02 canonical manifest contains an unreadable path");
  else {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("future REC-02 raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`future REC-02 OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: protectedMerge,
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function futureMergeEvidence(ref, protectedMerge) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== protectedMerge) {
    return { errors: ["protected REC-02 successor is not an exact two-parent merge from the policy-correction successor"] };
  }
  const candidate = futureEvidence(merge.parents[1], protectedMerge);
  return mergeEvidence(merge.oid, protectedMerge, candidate);
}

export function legacyEvaluatePolicy(facts) {
  const errors = [];
  const notices = [
    "NO-PUBLISH / NOT CERTIFIED remains active.",
    "Rulesets 21051662 and 21051665, explicit bypass_actors: [], Netlify controls, and merge-time ref identity require a fresh owner-authenticated read before any separately authorized protected merge.",
    "This workflow grants no merge, ready-for-review, rerun, deployment, release, tag, publication, certification, or external-write authority."
  ];
  let route = null;
  let evidence = null;

  const rejected = rejectedHeadEvidence(presentedCandidateHead(facts));
  if (rejected) {
    return {
      passed: false,
      errors: [...rejected.errors],
      notices,
      route: null,
      evidence: rejected
    };
  }

  if (facts.repository !== EXPECTED_REPOSITORY) errors.push(`repository ${facts.repository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
  if (!FULL_SHA_RE.test(facts.sha || "")) errors.push("event SHA is not a full SHA-1");
  if (facts.checkedOutSha !== facts.sha) errors.push(`checked-out SHA ${facts.checkedOutSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
  if (facts.refType === "tag" || (facts.ref || "").startsWith("refs/tags/")) errors.push("tag creation or evaluation is forbidden");

  if (facts.eventName === "pull_request") {
    if (facts.baseRef === "main") errors.push("all pull requests to main are blocked while NO-PUBLISH is active");
    if (facts.baseRef !== RECOVERY_BRANCH) errors.push(`pull-request base ${facts.baseRef || "<missing>"} != ${RECOVERY_BRANCH}`);
    if (facts.prHeadRepository !== EXPECTED_REPOSITORY) errors.push(`pull-request head repository ${facts.prHeadRepository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
    if (!FULL_SHA_RE.test(facts.prBaseSha || "") || !FULL_SHA_RE.test(facts.prHeadSha || "")) errors.push("pull-request base/head SHA is not a full SHA-1 pair");
    if (FAILED_POLICY_CORRECTION_BRANCHES.includes(facts.headRef)) {
      errors.push(`policy correction branch ${facts.headRef} is failed, frozen, and non-reusable`);
    } else if (facts.headRef === C9_POLICY_CORRECTION_BRANCH) {
      errors.push(`policy correction branch ${facts.headRef} is landed, consumed, and non-reusable`);
    } else if (facts.headRef === POLICY_CORRECTION_BRANCH) {
      route = "rec-ratchet-02-policy-successor";
      if (facts.prBaseSha !== C9_MERGE_SHA) {
        errors.push(`C10 pull-request base ${facts.prBaseSha || "<missing>"} != ${C9_MERGE_SHA}`);
      }
      evidence = policySuccessorEvidence(facts.prHeadSha);
      const merge = mergeEvidence(facts.sha, C9_MERGE_SHA, evidence);
      errors.push(...merge.errors);
    } else if (facts.headRef === FUTURE_BRANCH) {
      route = "rec-02";
      evidence = futureEvidence(facts.prHeadSha, facts.prBaseSha);
      const merge = mergeEvidence(facts.sha, facts.prBaseSha, evidence);
      errors.push(...merge.errors);
    } else if (facts.headRef === GATE_A_BRANCH) {
      errors.push("historical Gate A route is consumed and non-reusable");
    } else if (facts.headRef === AUTHORIZED_PATCH_TARGET_BRANCH) {
      errors.push("REC-02 r1 route is failed and non-reusable");
    } else {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} is not an armed recovery route`);
    }
  } else if (facts.eventName === "push") {
    if (facts.ref !== `refs/heads/${RECOVERY_BRANCH}` || facts.refName !== RECOVERY_BRANCH || facts.refType !== "branch") {
      errors.push("push is not an exact protected recovery-branch event");
    }
    if (facts.sha !== facts.afterSha) errors.push("push event SHA differs from after SHA");
    if (facts.beforeSha === C9_MERGE_SHA) {
      route = "rec-ratchet-02-policy-successor-merge";
      evidence = policySuccessorMergeEvidence(facts.afterSha);
      errors.push(...evidence.errors);
    } else {
      const base = policySuccessorMergeEvidence(facts.beforeSha);
      if (base.errors.length === 0) {
        route = "rec-02-merge";
        evidence = futureMergeEvidence(facts.afterSha, facts.beforeSha);
        errors.push(...evidence.errors);
      } else {
        errors.push("push before SHA is not the one unconsumed exact C10 policy successor");
      }
    }
  } else {
    errors.push(`event ${facts.eventName || "<missing>"} is not authorized`);
  }

  return { passed: errors.length === 0, errors, notices, route, evidence };
}

function environmentFacts(environment = {}, checkedOutShaReader = () => "") {
  const facts = {
    eventName: environment.POLICY_EVENT_NAME || "",
    repository: environment.POLICY_REPOSITORY || "",
    sha: environment.POLICY_SHA || "",
    checkedOutSha: "",
    ref: environment.POLICY_REF || "",
    refName: environment.POLICY_REF_NAME || "",
    refType: environment.POLICY_REF_TYPE || "",
    baseRef: environment.POLICY_BASE_REF || "",
    headRef: environment.POLICY_HEAD_REF || "",
    prHeadRepository: environment.POLICY_PR_HEAD_REPOSITORY || "",
    prBaseSha: environment.POLICY_PR_BASE_SHA || "",
    prHeadSha: environment.POLICY_PR_HEAD_SHA || "",
    beforeSha: environment.POLICY_BEFORE_SHA || "",
    afterSha: environment.POLICY_AFTER_SHA || ""
  };
  if (!failedIdentityByHead(presentedCandidateHead(facts)) && !terminalC14RouteError(facts)) {
    facts.checkedOutSha = checkedOutShaReader();
  }
  return facts;
}

function environmentFromProcess() {
  return environmentFacts(process.env, () => gitText(["rev-parse", "HEAD"]));
}

function writeBlob(bytes) {
  return gitText(["hash-object", "-w", "--stdin"], { input: bytes });
}

function writeRawCommit(bytes) {
  const result = runGit(["hash-object", "--literally", "-t", "commit", "-w", "--stdin"], { input: bytes });
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  assert.equal(oid, gitObjectOid("commit", bytes));
  return oid;
}

function writeRawTag(bytes) {
  const result = runGit(["hash-object", "--literally", "-t", "tag", "-w", "--stdin"], { input: bytes });
  const oid = Buffer.from(result.stdout).toString("utf8").trim();
  assert.equal(oid, gitObjectOid("tag", bytes));
  return oid;
}

function recursiveTreeEntries(baseRef) {
  const output = gitBytes(["ls-tree", "-r", "-z", "--full-tree", baseRef]);
  const entries = new Map();
  for (const row of output.toString("utf8").split("\0").filter(Boolean)) {
    const match = row.match(/^([0-7]{6}) ([a-z]+) ([0-9a-f]{40})\t(.+)$/s);
    if (!match) throw new Error(`malformed recursive tree row: ${row}`);
    entries.set(match[4], { mode: match[1], type: match[2], oid: match[3] });
  }
  return entries;
}

function writeTreeFromEntries(entries) {
  const root = { directories: new Map(), entries: new Map() };
  for (const [path, entry] of entries) {
    const parts = path.split("/");
    if (!parts.length || parts.some(part => !part || part === "." || part === "..")) {
      throw new Error(`unsafe tree path: ${path}`);
    }
    let node = root;
    for (const part of parts.slice(0, -1)) {
      if (!node.directories.has(part)) node.directories.set(part, { directories: new Map(), entries: new Map() });
      node = node.directories.get(part);
    }
    const name = parts.at(-1);
    if (node.entries.has(name) || node.directories.has(name)) throw new Error(`tree path collision: ${path}`);
    node.entries.set(name, entry);
  }
  const writeNode = node => {
    const rows = [];
    for (const [name, child] of node.directories) {
      rows.push(Buffer.from(`040000 tree ${writeNode(child)}\t${name}\0`, "utf8"));
    }
    for (const [name, entry] of node.entries) {
      rows.push(Buffer.from(`${entry.mode} ${entry.type} ${entry.oid}\t${name}\0`, "utf8"));
    }
    return gitText(["mktree", "-z"], { input: Buffer.concat(rows) });
  };
  return writeNode(root);
}

function treeWithOverrides(baseRef, overrides) {
  const entries = recursiveTreeEntries(baseRef);
  for (const [path, value] of Object.entries(overrides)) {
    if (value === null) {
      entries.delete(path);
      continue;
    }
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value.bytes);
    const mode = Buffer.isBuffer(value) ? "100644" : value.mode || "100644";
    entries.set(path, { mode, oid: writeBlob(bytes), type: "blob" });
  }
  return writeTreeFromEntries(entries);
}

function physicalFiles(root, relative = "") {
  const files = [];
  for (const name of readdirSync(join(root, relative)).sort()) {
    const childRelative = relative ? `${relative}/${name}` : name;
    const child = join(root, childRelative);
    const metadata = lstatSync(child);
    if (metadata.isSymbolicLink()) throw new Error(`patch workspace contains symlink: ${childRelative}`);
    if (metadata.isDirectory()) files.push(...physicalFiles(root, childRelative));
    else if (metadata.isFile()) files.push(childRelative);
    else throw new Error(`patch workspace contains non-file: ${childRelative}`);
  }
  return files;
}

function reconstructPatchTree(baseRef, artifact, extraOverrides = {}) {
  const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-patch-"));
  try {
    const rows = artifact.files || [];
    const paths = rows.map(row => row.path).sort();
    for (const path of paths) {
      if (path.startsWith("/") || path.split("/").some(part => !part || part === "." || part === "..")) {
        throw new Error(`unsafe patch path: ${path}`);
      }
      const input = fileIdentity(baseRef, path);
      if (!input) throw new Error(`${path}: patch input is missing from ${baseRef}`);
      const destination = join(parent, path);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, input.bytes, {
        flag: "wx",
        mode: Number.parseInt(input.mode, 8) & 0o777
      });
    }
    const applied = runGit(["apply", "--whitespace=error-all", "--verbose", "-"], {
      cwd: parent,
      input: Buffer.from(artifact.patch.unifiedDiff, "utf8"),
      allowFailure: true
    });
    const transcript = Buffer.concat([
      Buffer.from(applied.stdout || ""), Buffer.from(applied.stderr || "")
    ]).toString("utf8");
    if (applied.status !== 0 || applied.error || applied.signal) {
      throw new Error(`strict patch reconstruction failed: ${transcript.trim() || applied.error?.message || applied.signal}`);
    }
    if (/\b(?:offset|fuzz)\b/i.test(transcript)) throw new Error("strict patch reconstruction reported offset or fuzz");
    assert.deepEqual(physicalFiles(parent), paths, "patch reconstruction changed an unexpected path");
    const overrides = { ...extraOverrides };
    const records = [];
    for (const row of rows) {
      const bytes = readFileSync(join(parent, row.path));
      const identity = identityFromBytes(bytes, row.output.mode);
      overrides[row.path] = { bytes, mode: row.output.mode };
      records.push({ path: row.path, ...identity });
    }
    return {
      records,
      transcript,
      tree: treeWithOverrides(baseRef, overrides)
    };
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function historicalGateAFixture() {
  const commit = commitHeaders(GATE_A_HEAD_SHA);
  assert.ok(commit, "historical Gate A commit is missing");
  assert.equal(commit.oid, GATE_A_HEAD_SHA);
  assert.equal(commit.tree, GATE_A_HEAD_TREE);
  assert.deepEqual(commit.parents, [GATE_A_BASE_SHA]);
  assert.equal(sha256(commit.bytes), GATE_A_HEAD_RAW_SHA256);
  const records = canonicalRecords(commit.tree, GATE_A_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(commit.tree, GATE_A_BASE_SHA, GATE_A_AUTHOR, GATE_A_COMMIT_TITLE, records);
  assert.ok(commit.bytes.equals(raw), "historical Gate A raw frame drifted");
  assert.equal(gitObjectOid("commit", raw), GATE_A_HEAD_SHA);
  return { oid: commit.oid, tree: commit.tree, raw: commit.bytes, records };
}

function policyCorrectionFixture(source = C9_MERGE_SHA) {
  if (source !== C9_MERGE_SHA) {
    throw new Error(`immutable C9/Q fixture source must be literal exact Q ${C9_MERGE_SHA}`);
  }
  const merge = commitHeaders(source);
  assert.ok(merge, "immutable C9/Q fixture source is missing");
  assert.equal(merge.oid, C9_MERGE_SHA, "immutable C9/Q fixture source OID drifted");
  assert.equal(merge.tree, C9_MERGE_TREE, "immutable C9/Q fixture source tree drifted");
  assert.deepEqual(merge.parents, [GATE_A_MERGE_SHA, C9_HEAD_SHA], "immutable C9/Q fixture source parents drifted");
  assert.equal(sha256(merge.bytes), C9_MERGE_RAW_SHA256, "immutable C9/Q fixture source raw payload drifted");
  const commit = commitHeaders(merge.parents[1]);
  assert.ok(commit, "immutable C9 candidate fixture is missing");
  assert.equal(commit.oid, C9_HEAD_SHA);
  assert.equal(commit.tree, C9_HEAD_TREE);
  assert.deepEqual(commit.parents, [GATE_A_MERGE_SHA]);
  assert.equal(sha256(commit.bytes), C9_HEAD_RAW_SHA256);
  const records = canonicalRecords(commit.tree, POLICY_CORRECTION_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  assert.equal(sha256(Buffer.from(canonicalManifest(records))), C9_MANIFEST_SHA256);
  assert.deepEqual(policyCorrectionEvidence(commit.oid).errors, []);
  return { oid: commit.oid, tree: commit.tree, raw: commit.bytes, records };
}

function bindPolicySuccessorInputs(status, readCurrent = path => gitBytes(["show", `:${path}`])) {
  const record = readCurrent(POLICY_CORRECTION_RECORD_PATH);
  const policy = readCurrent(POLICY_PATH);
  if (gitObjectOid("blob", status) !== POLICY_CORRECTION_STATUS_BLOB
    || sha256(status) !== POLICY_CORRECTION_STATUS_SHA256
    || status.length !== POLICY_CORRECTION_STATUS_BYTES) {
    throw new Error("deterministic C10 STATUS identity drifted");
  }
  if (gitObjectOid("blob", record) !== POLICY_CORRECTION_RECORD_BLOB
    || sha256(record) !== POLICY_CORRECTION_RECORD_SHA256
    || record.length !== POLICY_CORRECTION_RECORD_BYTES) {
    throw new Error("current C10 correction-record identity drifted");
  }
  if (sha256(normalizedPolicyBytes(policy)) !== POLICY_PROJECTION_SHA256) {
    throw new Error("current C10 policy projection drifted");
  }
  return { status, record, policy };
}

function policySuccessorInputs(readCurrent = path => gitBytes(["show", `:${path}`])) {
  return bindPolicySuccessorInputs(expectedPolicySuccessorStatus(), readCurrent);
}

function policySuccessorFixture(readCurrent = path => gitBytes(["show", `:${path}`])) {
  const inputs = policySuccessorInputs(readCurrent);
  const { status, record, policy } = inputs;
  const tree = treeWithOverrides(C9_MERGE_SHA, {
    [STATUS_PATH]: status,
    [POLICY_CORRECTION_RECORD_PATH]: record,
    [POLICY_PATH]: policy
  });
  const records = canonicalRecords(tree, POLICY_CORRECTION_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(
    tree,
    C9_MERGE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    records
  );
  const oid = writeRawCommit(raw);
  return { oid, tree, raw, records, inputs };
}

function currentSelfTestStatusEnvelope() {
  const staged = new Map();
  for (const path of POLICY_CORRECTION_CHANGED_PATHS) {
    const worktree = readFileSync(resolve(ROOT, path));
    const index = gitBytes(["show", `:${path}`]);
    if (!worktree.equals(index)) throw new Error(`self-test ${path} has unstaged worktree drift`);
    staged.set(path, index);
  }
  const indexStatus = staged.get(STATUS_PATH);
  const c10Status = expectedPolicySuccessorStatus();
  if (indexStatus.equals(c10Status)) return { state: "C10", protectedMerge: null };

  const head = commitHeaders("HEAD");
  if (!head) throw new Error("self-test HEAD is not an independently framed commit");
  const candidates = new Set([head.oid, ...head.parents]);
  for (const parent of head.parents) {
    const commit = commitHeaders(parent);
    for (const grandparent of commit?.parents || []) candidates.add(grandparent);
  }
  const valid = [...candidates].filter(ref => policySuccessorMergeEvidence(ref).errors.length === 0);
  if (valid.length !== 1) throw new Error(`self-test found ${valid.length} exact C10 protected successors`);
  const expected = expectedFutureStatus(valid[0]);
  if (!indexStatus.equals(expected)) throw new Error("self-test STATUS is neither exact C10 nor exact derived REC-02 state");
  return { state: "REC-02", protectedMerge: valid[0] };
}

function genericMerge(tree, parents, label) {
  const raw = Buffer.from([
    `tree ${tree}`,
    ...parents.map(parent => `parent ${parent}`),
    `author Sunsplitter Merge Fixture <noreply@openai.com> 1787616000 -0500`,
    `committer Sunsplitter Merge Fixture <noreply@openai.com> 1787616000 -0500`,
    "",
    `${label}\n`
  ].join("\n"), "utf8");
  return { oid: writeRawCommit(raw), raw, tree, parents };
}

function futureFixture(protectedMerge) {
  const projected = buildFutureTree(protectedMerge);
  const records = canonicalRecords(projected.tree, FUTURE_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(projected.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
  return { oid: writeRawCommit(raw), raw, tree: projected.tree, records };
}

function prFacts({ sha, base, head, headRef }) {
  return {
    eventName: "pull_request",
    repository: EXPECTED_REPOSITORY,
    sha,
    checkedOutSha: sha,
    ref: "refs/pull/999/merge",
    refName: "999/merge",
    refType: "branch",
    baseRef: RECOVERY_BRANCH,
    headRef,
    prHeadRepository: EXPECTED_REPOSITORY,
    prBaseSha: base,
    prHeadSha: head,
    beforeSha: "",
    afterSha: ""
  };
}

function pushFacts({ before, after }) {
  return {
    eventName: "push",
    repository: EXPECTED_REPOSITORY,
    sha: after,
    checkedOutSha: after,
    ref: `refs/heads/${RECOVERY_BRANCH}`,
    refName: RECOVERY_BRANCH,
    refType: "branch",
    baseRef: "",
    headRef: "",
    prHeadRepository: "",
    prBaseSha: "",
    prHeadSha: "",
    beforeSha: before,
    afterSha: after
  };
}

function expectPolicyFailure(facts, mutate, needle) {
  const altered = structuredClone(facts);
  mutate(altered);
  const result = evaluatePolicy(altered);
  assert.equal(result.passed, false, `policy unexpectedly accepted ${needle}`);
  assert.ok(result.errors.some(error => error.includes(needle)), `missing ${needle}: ${result.errors.join(" | ")}`);
}

function expectLegacyPolicyFailure(facts, mutate, needle) {
  const altered = structuredClone(facts);
  mutate(altered);
  const result = legacyEvaluatePolicy(altered);
  assert.equal(result.passed, false, `legacy policy unexpectedly accepted ${needle}`);
  assert.ok(result.errors.some(error => error.includes(needle)), `legacy missing ${needle}: ${result.errors.join(" | ")}`);
}

function legacySelfTest() {
  const readExactC10 = path => gitBytes(["show", `${C10_HEAD_SHA}:${path}`]);
  assert.ok(FULL_SHA256_RE.test(POLICY_PROJECTION_SHA256) && !/^0+$/.test(POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(TRANSITION_SHA256) && !/^0+$/.test(TRANSITION_SHA256));
  assert.equal(sha256(normalizedPolicyBytes(readExactC10(POLICY_PATH))), POLICY_PROJECTION_SHA256);
  assert.deepEqual(policySuccessorEvidence(C10_HEAD_SHA).errors, [], "exact historical C10 evidence drifted");
  assert.ok(readExactC10(STATUS_PATH).equals(expectedPolicySuccessorStatus()));
  assert.deepEqual(GATE_A_CHANGED_PATHS, [
    VERIFY_WORKFLOW_PATH, STATUS_PATH, INACTIVE_BASELINE_PATH, PATCH_ARTIFACT_PATH, TRANSITION_PATH, POLICY_PATH
  ].sort());
  assert.deepEqual(POLICY_CORRECTION_CHANGED_PATHS, [STATUS_PATH, POLICY_CORRECTION_RECORD_PATH, POLICY_PATH].sort());
  assert.equal(FUTURE_CHANGED_PATHS.length, 10);

  const inventoryAudit = withGitInvocationAudit(() => legacyForbiddenObjectInventory());
  assert.deepEqual(inventoryAudit.calls, []);
  const inventory = inventoryAudit.result;
  const inventoryBytes = canonicalJsonBytes(inventory);
  assert.equal(inventoryBytes.length, 4664);
  assert.equal(sha256(inventoryBytes), FORBIDDEN_OBJECT_INVENTORY_SHA256);
  assert.deepEqual(inventory.counts, {
    artBlobs: 79,
    artRoots: 2,
    derived: 4,
    failedIdentityObjects: 18,
    total: 103
  });
  assert.deepEqual(inventory.objects, [...inventory.objects].sort());
  assert.equal(new Set(inventory.objects).size, 103);
  assert.throws(() => legacyForbiddenObjectInventory(`${ART_R2_SEALED_MANIFEST}\n`), /byte length drifted/);
  assert.throws(
    () => legacyForbiddenObjectInventory(ART_R2_SEALED_MANIFEST.replace("100644", "100755")),
    /SHA-256 drifted/
  );

  const gateA = historicalGateAFixture();
  const gateAEvidence = candidateEvidence(gateA.oid);
  assert.deepEqual(gateAEvidence.errors, []);
  const normalized = normalizedSimulationEvidence(gateAEvidence.projectionEvidence.baseline);
  assert.equal(normalized.core, NORMALIZED_SIMULATION_SHA256);
  assert.deepEqual(normalized.policies, NORMALIZED_POLICY_SHA256);
  const normalizedDrift = structuredClone(gateAEvidence.projectionEvidence.baseline);
  normalizedDrift.policies.random.totalSteps += 1;
  assert.notEqual(normalizedSimulationEvidence(normalizedDrift).core, NORMALIZED_SIMULATION_SHA256);
  assert.deepEqual(gateAEvidence.artEvidence.errors, []);
  assert.equal(gateAEvidence.artEvidence.combinedTree, ART_R2_COMBINED_TREE);
  assert.throws(
    () => applyArtVerifierTransform(
      fileIdentity(GATE_A_BASE_SHA, "scripts/verify.mjs").bytes.toString("utf8").replace("./simulate.mjs", "./simulate-drift.mjs")
    ),
    /ART import anchor count is not exactly one/
  );

  let historicalRawRejected = 0;
  const rejectHistoricalRaw = (bytes, label) => {
    const result = candidateEvidence(writeRawCommit(bytes));
    assert.ok(result.errors.length > 0, `altered historical raw commit accepted: ${label}`);
    historicalRawRejected += 1;
  };
  const gateAText = gateA.raw.toString("utf8");
  const gateAManifest = canonicalManifest(gateA.records);
  const gateAManifestLines = gateAManifest.trimEnd().split("\n");
  const swappedGateAManifest = [gateAManifestLines[1], gateAManifestLines[0], ...gateAManifestLines.slice(2)].join("\n") + "\n";
  const namedHistoricalRawMutations = [
    [gateA.raw.subarray(0, gateA.raw.length - 1), "missing terminal LF"],
    [Buffer.concat([gateA.raw, Buffer.from("\n")]), "extra terminal LF"],
    [Buffer.from(gateAText.replaceAll("\n", "\r\n")), "CRLF frame"],
    [Buffer.from(gateAText.replace(GATE_A_COMMIT_TITLE, `${GATE_A_COMMIT_TITLE}.`)), "title"],
    [Buffer.from(gateAText.replace(NO_PUBLISH_TOKEN, "NO-PUBLISH / CERTIFIED")), "certification token"],
    [Buffer.from(gateAText.replace("Canonical manifest", "canonical manifest")), "manifest header"],
    [Buffer.from(gateAText.replace("author Sunsplitter", "author Altered")), "author identity"],
    [Buffer.from(gateAText.replace("committer Sunsplitter", "committer Altered")), "committer identity"],
    [Buffer.from(gateAText.replace("1787443200", "1787443201")), "author timestamp"],
    [Buffer.from(gateAText.replace(`author ${GATE_A_AUTHOR}`, `author ${GATE_A_AUTHOR.replace("-0500", "+0000")}`)), "author timezone"],
    [Buffer.from(gateAText.replace(`committer ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR.replace("1787443200", "1787443201")}`)), "committer timestamp"],
    [Buffer.from(gateAText.replace(`committer ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR.replace("-0500", "+0000")}`)), "committer timezone"],
    [Buffer.from(gateAText.replaceAll("-0500", "+0000")), "timezone"],
    [Buffer.from(gateAText.replace(`parent ${GATE_A_BASE_SHA}`, `parent ${RECOVERY_BASE_SHA}`)), "parent"],
    [Buffer.from(gateAText.replace(`parent ${GATE_A_BASE_SHA}`, `parent ${GATE_A_BASE_SHA}\nparent ${RECOVERY_BASE_SHA}`)), "second parent"],
    [Buffer.from(gateAText.replace(`tree ${gateA.tree}`, `tree ${GATE_A_BASE_TREE}`)), "tree"],
    [Buffer.from(gateAText.replace("author ", "encoding UTF-8\nauthor ")), "extra header"],
    [Buffer.from(gateAText.replace("author ", "x-recovery counterfeit\nauthor ")), "extra generic header"],
    [Buffer.from(gateAText.replace("author ", "gpgsig counterfeit\nauthor ")), "signature header"],
    [Buffer.from(gateAText.replace("author ", "gpgsig counterfeit\n continuation\nauthor ")), "multiline signature header"],
    [Buffer.from(gateAText.replace(`author ${GATE_A_AUTHOR}\ncommitter ${GATE_A_AUTHOR}`, `committer ${GATE_A_AUTHOR}\nauthor ${GATE_A_AUTHOR}`)), "header order"],
    [Buffer.from(gateAText.replace(`author ${GATE_A_AUTHOR}\n`, "")), "missing author header"],
    [Buffer.from(gateAText.replace(`author ${GATE_A_AUTHOR}\n`, `author ${GATE_A_AUTHOR}\nauthor ${GATE_A_AUTHOR}\n`)), "duplicate author header"],
    [Buffer.from(gateAText.replace("100644", "100755")), "manifest mode"],
    [Buffer.from(gateAText.replace(gateA.records[0].blob, "f".repeat(40))), "manifest blob"],
    [Buffer.from(gateAText.replace(gateA.records[0].sha256, "f".repeat(64))), "manifest SHA-256"],
    [Buffer.from(gateAText.replace(gateA.records[0].path, `${gateA.records[0].path}.bak`)), "manifest path"],
    [Buffer.from(gateAText.replace(gateAManifest, gateAManifest.replace(`${gateAManifestLines[0]}\n`, ""))), "missing manifest entry"],
    [Buffer.from(gateAText.replace(gateAManifest, `${gateAManifestLines[0]}\n${gateAManifest}`)), "duplicate manifest entry"],
    [Buffer.from(gateAText.replace(gateAManifest, `${gateAManifest}100644 ${"f".repeat(40)} ${"e".repeat(64)}\tartifacts/EXTRA\n`)), "extra manifest entry"],
    [Buffer.from(gateAText.replace(gateAManifest, swappedGateAManifest)), "reordered manifest"],
    [Buffer.from(gateAText.replace(`committer ${GATE_A_AUTHOR}\n\n${GATE_A_COMMIT_TITLE}`, `committer ${GATE_A_AUTHOR}\n${GATE_A_COMMIT_TITLE}`)), "missing header-message separator"],
    [Buffer.from(gateAText.replace(`committer ${GATE_A_AUTHOR}\n\n${GATE_A_COMMIT_TITLE}`, `committer ${GATE_A_AUTHOR}\n\n\n${GATE_A_COMMIT_TITLE}`)), "additional header-message separator"],
    [Buffer.from(gateAText.replace("\n\n" + NO_PUBLISH_TOKEN, "\n" + NO_PUBLISH_TOKEN)), "message boundary"]
  ];
  for (const [bytes, label] of namedHistoricalRawMutations) rejectHistoricalRaw(bytes, label);
  const stride = Math.max(1, Math.floor(gateA.raw.length / 128));
  for (let index = 0; index < gateA.raw.length && historicalRawRejected < 84; index += stride) {
    const altered = Buffer.from(gateA.raw);
    altered[index] = altered[index] === 0x78 ? 0x79 : 0x78;
    rejectHistoricalRaw(altered, `byte ${index}`);
  }
  assert.equal(historicalRawRejected, 84);
  const alteredStatusBytes = Buffer.concat([
    fileIdentity(gateA.tree, STATUS_PATH).bytes,
    Buffer.from("\n`release_state: PUBLISH`\n")
  ]);
  const alteredStatusTree = treeWithOverrides(gateA.tree, { [STATUS_PATH]: alteredStatusBytes });
  rejectHistoricalRaw(
    canonicalRawCommit(
      alteredStatusTree,
      GATE_A_BASE_SHA,
      GATE_A_AUTHOR,
      GATE_A_COMMIT_TITLE,
      canonicalRecords(alteredStatusTree, GATE_A_CHANGED_PATHS)
    ),
    "self-consistent altered STATUS"
  );
  const alteredWorkflow = Buffer.concat([
    fileIdentity(gateA.tree, VERIFY_WORKFLOW_PATH).bytes,
    Buffer.from("\n  workflow_dispatch:\n")
  ]);
  const alteredWorkflowTree = treeWithOverrides(gateA.tree, { [VERIFY_WORKFLOW_PATH]: alteredWorkflow });
  rejectHistoricalRaw(
    canonicalRawCommit(
      alteredWorkflowTree,
      GATE_A_BASE_SHA,
      GATE_A_AUTHOR,
      GATE_A_COMMIT_TITLE,
      canonicalRecords(alteredWorkflowTree, GATE_A_CHANGED_PATHS)
    ),
    "self-consistent altered workflow"
  );
  assert.equal(historicalRawRejected, 86);

  const c9 = policyCorrectionFixture();
  assert.equal(c9.oid, C9_HEAD_SHA);
  assert.equal(c9.tree, C9_HEAD_TREE);
  assert.equal(sha256(c9.raw), C9_HEAD_RAW_SHA256);
  assert.equal(sha256(Buffer.from(canonicalManifest(c9.records))), C9_MANIFEST_SHA256);
  assert.deepEqual(policyCorrectionEvidence(c9.oid).errors, []);
  assert.deepEqual(policyCorrectionMergeEvidence(C9_MERGE_SHA).errors, []);
  assert.throws(
    () => policyCorrectionFixture(GATE_A_MERGE_SHA),
    error => error?.message === `immutable C9/Q fixture source must be literal exact Q ${C9_MERGE_SHA}`
  );

  const correction = policySuccessorFixture(readExactC10);
  const correctionEvidenceResult = policySuccessorEvidence(correction.oid);
  assert.deepEqual(correctionEvidenceResult.errors, []);
  const cleanFixtureInputs = correction.inputs;
  const poisonedWorktreeInputs = [];
  for (const targetPath of POLICY_CORRECTION_CHANGED_PATHS) {
    const physicalPath = resolve(ROOT, targetPath);
    const originalBytes = readFileSync(physicalPath);
    const indexBytes = gitBytes(["show", `:${targetPath}`]);
    assert.ok(originalBytes.equals(indexBytes), `${targetPath}: pre-poison worktree/index drift`);
    try {
      writeFileSync(
        physicalPath,
        Buffer.concat([originalBytes, Buffer.from(`<!-- C10 worktree poison: ${targetPath} -->\n`, "utf8")])
      );
      assert.equal(readFileSync(physicalPath).equals(indexBytes), false, `${targetPath}: poison did not change worktree bytes`);
      poisonedWorktreeInputs.push(bindPolicySuccessorInputs(cleanFixtureInputs.status, readExactC10));
    } finally {
      writeFileSync(physicalPath, originalBytes);
    }
    assert.ok(readFileSync(physicalPath).equals(indexBytes), `${targetPath}: exact worktree restoration failed`);
  }
  const correctionSynthetic = genericMerge(
    correction.tree,
    [C9_MERGE_SHA, correction.oid],
    "Synthetic C10 policy successor merge fixture"
  );
  const correctionPr = prFacts({
    sha: correctionSynthetic.oid,
    base: C9_MERGE_SHA,
    head: correction.oid,
    headRef: POLICY_CORRECTION_BRANCH
  });
  const correctionPush = pushFacts({ before: C9_MERGE_SHA, after: correctionSynthetic.oid });
  assert.deepEqual(legacyEvaluatePolicy(correctionPr).errors, []);
  assert.deepEqual(legacyEvaluatePolicy(correctionPush).errors, []);
  expectLegacyPolicyFailure(correctionPr, facts => { facts.repository = "attacker/Sunsplitter"; }, "repository attacker/Sunsplitter");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.baseRef = "main"; }, "pull requests to main");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.headRef = "ticket/unarmed"; }, "not an armed recovery route");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.prHeadRepository = "fork/Sunsplitter"; }, "pull-request head repository");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.checkedOutSha = correction.oid; }, "checked-out SHA");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.ref = "refs/tags/sun-v0.30.1"; facts.refType = "tag"; }, "tag creation");
  expectLegacyPolicyFailure(correctionPr, facts => { facts.prBaseSha = GATE_A_MERGE_SHA; }, "C10 pull-request base");
  const consumedGateAPr = prFacts({
    sha: genericMerge(gateA.tree, [GATE_A_BASE_SHA, gateA.oid], "consumed historical Gate A PR fixture").oid,
    base: GATE_A_BASE_SHA,
    head: gateA.oid,
    headRef: GATE_A_BRANCH
  });
  assert.ok(legacyEvaluatePolicy(consumedGateAPr).errors.some(error => error.includes("historical Gate A route is consumed")));

  let zeroGitRejected = 0;
  const exactRejectedResult = (result, identity, label) => {
    assert.deepEqual(result.errors, [identity.error], `${label}: wrong terminal error`);
    assert.equal(result.terminalFailure ?? result.evidence?.terminalFailure, true, `${label}: missing terminal flag`);
  };
  const failedSpellings = head => [head, head.toUpperCase(), `  ${head.toUpperCase()}  `];
  for (const identity of FAILED_IDENTITIES) {
    for (const spelling of failedSpellings(identity.head)) {
      const routes = [
        ["direct correction", () => policySuccessorEvidence(spelling)],
        ["direct future", () => futureEvidence(spelling, correctionSynthetic.oid)],
        ["full correction PR", () => legacyEvaluatePolicy(prFacts({
          sha: "0".repeat(40), base: C9_MERGE_SHA, head: spelling, headRef: POLICY_CORRECTION_BRANCH
        }))],
        ["full future PR", () => legacyEvaluatePolicy(prFacts({
          sha: "0".repeat(40), base: correctionSynthetic.oid, head: spelling, headRef: FUTURE_BRANCH
        }))],
        ["CLI correction PR", () => {
          let readerCalls = 0;
          const facts = environmentFacts({
            POLICY_EVENT_NAME: "pull_request",
            POLICY_REPOSITORY: EXPECTED_REPOSITORY,
            POLICY_SHA: "0".repeat(40),
            POLICY_REF: "refs/pull/999/merge",
            POLICY_REF_NAME: "999/merge",
            POLICY_REF_TYPE: "branch",
            POLICY_BASE_REF: RECOVERY_BRANCH,
            POLICY_HEAD_REF: POLICY_CORRECTION_BRANCH,
            POLICY_PR_HEAD_REPOSITORY: EXPECTED_REPOSITORY,
            POLICY_PR_BASE_SHA: C9_MERGE_SHA,
            POLICY_PR_HEAD_SHA: spelling
          }, () => { readerCalls += 1; return "0".repeat(40); });
          assert.equal(readerCalls, 0);
          return legacyEvaluatePolicy(facts);
        }],
        ["CLI future PR", () => {
          let readerCalls = 0;
          const facts = environmentFacts({
            POLICY_EVENT_NAME: "pull_request",
            POLICY_REPOSITORY: EXPECTED_REPOSITORY,
            POLICY_SHA: "0".repeat(40),
            POLICY_REF: "refs/pull/999/merge",
            POLICY_REF_NAME: "999/merge",
            POLICY_REF_TYPE: "branch",
            POLICY_BASE_REF: RECOVERY_BRANCH,
            POLICY_HEAD_REF: FUTURE_BRANCH,
            POLICY_PR_HEAD_REPOSITORY: EXPECTED_REPOSITORY,
            POLICY_PR_BASE_SHA: correctionSynthetic.oid,
            POLICY_PR_HEAD_SHA: spelling
          }, () => { readerCalls += 1; return "0".repeat(40); });
          assert.equal(readerCalls, 0);
          return legacyEvaluatePolicy(facts);
        }]
      ];
      for (const [label, callback] of routes) {
        const audited = withGitInvocationAudit(callback);
        assert.deepEqual(audited.calls, [], `${identity.label} ${label}: Git was invoked`);
        exactRejectedResult(audited.result, identity, `${identity.label} ${label}`);
        zeroGitRejected += 1;
      }
    }
  }
  assert.equal(zeroGitRejected, 162);

  let structuredRejected = 0;
  const countFailure = (condition, label) => {
    assert.ok(condition, label);
    structuredRejected += 1;
  };
  const countExactRouteFailure = (result, expectedRoute, expectedError, label) => {
    assert.equal(result.passed, false, `${label}: policy unexpectedly passed`);
    assert.equal(result.route, expectedRoute, `${label}: wrong route`);
    assert.ok(
      result.errors.includes(expectedError),
      `${label}: missing exact error ${JSON.stringify(expectedError)} in ${result.errors.join(" | ")}`
    );
    structuredRejected += 1;
  };
  countFailure(
    poisonedWorktreeInputs.length === POLICY_CORRECTION_CHANGED_PATHS.length
      && poisonedWorktreeInputs.every(inputs => (
        inputs.status.equals(cleanFixtureInputs.status)
        && inputs.record.equals(cleanFixtureInputs.record)
        && inputs.policy.equals(cleanFixtureInputs.policy)
      ))
      && POLICY_CORRECTION_CHANGED_PATHS.every(path => (
        readFileSync(resolve(ROOT, path)).equals(gitBytes(["show", `:${path}`]))
      )),
    "three-path worktree poison affected immutable/index-bound C10 fixture bytes or restoration"
  );
  countFailure((() => {
    const invalidSources = [
      "HEAD",
      C9_MERGE_SHA.toUpperCase(),
      ` ${C9_MERGE_SHA} `,
      GATE_A_MERGE_SHA,
      "f".repeat(40)
    ];
    const sourceGuards = [
      [
        "fixture",
        source => policyCorrectionFixture(source),
        `immutable C9/Q fixture source must be literal exact Q ${C9_MERGE_SHA}`
      ],
      [
        "STATUS",
        source => expectedPolicySuccessorStatus(source),
        `C10 STATUS source must be literal exact Q ${C9_MERGE_SHA}`
      ]
    ];
    for (const [label, callback, expectedError] of sourceGuards) {
      for (const source of invalidSources) {
        let observedError = null;
        const audited = withGitInvocationAudit(() => {
          try {
            callback(source);
          } catch (error) {
            observedError = error;
          }
        });
        assert.deepEqual(audited.calls, [], `${label} source ${JSON.stringify(source)} invoked Git before rejection`);
        assert.equal(observedError?.message, expectedError, `${label} source ${JSON.stringify(source)} wrong error`);
      }
    }
    return true;
  })(), "non-literal immutable C9/Q source did not fail with exact zero-Git rejection");

  const gateAMergeVariants = [
    genericMerge(gateA.tree, [GATE_A_BASE_SHA], "historical Gate A one-parent fixture"),
    genericMerge(gateA.tree, [gateA.oid, GATE_A_BASE_SHA], "historical Gate A swapped fixture"),
    genericMerge(gateA.tree, [GATE_A_BASE_SHA, gateA.oid, RECOVERY_BASE_SHA], "historical Gate A octopus fixture"),
    genericMerge(GATE_A_BASE_TREE, [GATE_A_BASE_SHA, gateA.oid], "historical Gate A wrong-tree fixture"),
    genericMerge(gateA.tree, [GATE_A_BASE_SHA, gateA.oid], "historical Gate A alternate exact-topology fixture")
  ];
  for (const fixture of gateAMergeVariants) {
    countFailure(gateAMergeEvidence(fixture.oid).errors.length > 0, "historical Gate A bad merge or alternate identity accepted");
  }
  assert.ok(gateAMergeEvidence(gateA.oid).errors.length > 0, "historical Gate A ticket head was accepted as protected merge");

  const correctionText = correction.raw.toString("utf8");
  const correctionManifest = canonicalManifest(correction.records);
  const correctionManifestLines = correctionManifest.trimEnd().split("\n");
  const correctionRawMutations = [
    correction.raw.subarray(0, correction.raw.length - 1),
    Buffer.concat([correction.raw, Buffer.from("\n")]),
    Buffer.from(correctionText.replaceAll("\n", "\r\n")),
    Buffer.from(correctionText.replace(POLICY_CORRECTION_COMMIT_TITLE, `${POLICY_CORRECTION_COMMIT_TITLE}.`)),
    Buffer.from(correctionText.replace(NO_PUBLISH_TOKEN, "NO-PUBLISH / CERTIFIED")),
    Buffer.from(correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Alternate Build <noreply@openai.com> 1787965200 -0500`)),
    Buffer.from(correctionText.replace(`committer ${POLICY_CORRECTION_AUTHOR}`, `committer Alternate Build <noreply@openai.com> 1787965200 -0500`)),
    Buffer.from(correctionText.replace("1787965200", "1787965201")),
    Buffer.from(correctionText.replaceAll("-0500", "+0000")),
    Buffer.from(correctionText.replace(`parent ${C9_MERGE_SHA}`, `parent ${GATE_A_MERGE_SHA}`)),
    Buffer.from(correctionText.replace(`parent ${C9_MERGE_SHA}`, `parent ${C9_MERGE_SHA}\nparent ${GATE_A_MERGE_SHA}`)),
    Buffer.from(correctionText.replace("author ", "encoding UTF-8\nauthor ")),
    Buffer.from(correctionText.replace(
      correctionManifest,
      [correctionManifestLines[1], correctionManifestLines[0], ...correctionManifestLines.slice(2)].join("\n") + "\n"
    ))
  ];
  assert.equal(correctionRawMutations.length, 13);
  for (const bytes of correctionRawMutations) {
    countFailure(policySuccessorEvidence(writeRawCommit(bytes)).errors.length > 0, "C10 raw-frame mutation accepted");
  }

  const rejectGateATree = (tree, label, needle) => {
    const records = canonicalRecords(tree, GATE_A_CHANGED_PATHS);
    const raw = canonicalRawCommit(
      tree,
      GATE_A_BASE_SHA,
      GATE_A_AUTHOR,
      GATE_A_COMMIT_TITLE,
      records.every(Boolean) ? records : gateA.records
    );
    const result = candidateEvidence(writeRawCommit(raw));
    countFailure(
      result.errors.length > 0 && (!needle || result.errors.some(error => error.includes(needle))),
      `historical Gate A tree fixture accepted or missed ${needle || "error"}: ${label}`
    );
  };
  rejectGateATree(
    treeWithOverrides(gateA.tree, {
      [GATE_A_CHANGED_PATHS[0]]: { bytes: fileIdentity(gateA.tree, GATE_A_CHANGED_PATHS[0]).bytes, mode: "100755" }
    }),
    "executable authorized path",
    "candidate mode"
  );
  rejectGateATree(treeWithOverrides(gateA.tree, { [GATE_A_CHANGED_PATHS[0]]: null }), "missing authorized path", "candidate path is missing");
  rejectGateATree(treeWithOverrides(gateA.tree, { "artifacts/UNAUTHORIZED.md": Buffer.from("unauthorized\n") }), "extra path", "six-path Gate A scope");
  const preservedPaths = [
    "AGENTS.md", RELEASE_WORKFLOW_PATH, "artifacts/LOCKS.md", "artifacts/ROADMAP.md",
    "artifacts/REC-RATCHET-01_BASELINE_TRANSITION.md", ACTIVE_BASELINE_PATH, "scripts/simulate.mjs",
    "scripts/verify.mjs", "src/scenes-01.js", "images/abandoned_sealed.jpg", "VERSION.md", "index.html",
    "netlify.toml"
  ];
  assert.equal(preservedPaths.length, 13);
  for (const path of preservedPaths) {
    const original = fileIdentity(gateA.tree, path);
    assert.ok(original, `missing preserved fixture path ${path}`);
    rejectGateATree(
      treeWithOverrides(gateA.tree, { [path]: Buffer.concat([original.bytes, Buffer.from("\n")]) }),
      `preserved surface ${path}`,
      "six-path Gate A scope"
    );
  }
  rejectGateATree(
    treeWithOverrides(gateA.tree, { [POLICY_PATH]: Buffer.concat([fileIdentity(gateA.tree, POLICY_PATH).bytes, Buffer.from("\n")]) }),
    "historical policy projection",
    "policy projection"
  );

  const rejectCorrectionTree = (tree, label) => {
    const records = canonicalRecords(tree, POLICY_CORRECTION_CHANGED_PATHS);
    const raw = canonicalRawCommit(
      tree,
      C9_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
      records.every(Boolean) ? records : correction.records
    );
    countFailure(policySuccessorEvidence(writeRawCommit(raw)).errors.length > 0, `C10 tree fixture accepted: ${label}`);
  };
  rejectCorrectionTree(
    treeWithOverrides(correction.tree, {
      [STATUS_PATH]: { bytes: fileIdentity(correction.tree, STATUS_PATH).bytes, mode: "100755" }
    }),
    "executable STATUS"
  );
  rejectCorrectionTree(treeWithOverrides(correction.tree, { [POLICY_CORRECTION_RECORD_PATH]: null }), "missing record");
  rejectCorrectionTree(treeWithOverrides(correction.tree, { "artifacts/UNAUTHORIZED.md": Buffer.from("unauthorized\n") }), "extra path");
  rejectCorrectionTree(treeWithOverrides(correction.tree, { [STATUS_PATH]: Buffer.concat([fileIdentity(correction.tree, STATUS_PATH).bytes, Buffer.from("\n")]) }), "STATUS drift");
  rejectCorrectionTree(treeWithOverrides(correction.tree, { [POLICY_CORRECTION_RECORD_PATH]: Buffer.concat([fileIdentity(correction.tree, POLICY_CORRECTION_RECORD_PATH).bytes, Buffer.from("\n")]) }), "record drift");
  rejectCorrectionTree(treeWithOverrides(correction.tree, { [POLICY_PATH]: Buffer.concat([fileIdentity(correction.tree, POLICY_PATH).bytes, Buffer.from("\n")]) }), "policy drift");

  const rejectWorkflowMutation = (mutate, needle) => {
    const source = fileIdentity(gateA.tree, VERIFY_WORKFLOW_PATH).bytes.toString("utf8");
    const tree = treeWithOverrides(gateA.tree, { [VERIFY_WORKFLOW_PATH]: Buffer.from(mutate(source), "utf8") });
    const oid = writeRawCommit(canonicalRawCommit(
      tree,
      GATE_A_BASE_SHA,
      GATE_A_AUTHOR,
      GATE_A_COMMIT_TITLE,
      canonicalRecords(tree, GATE_A_CHANGED_PATHS)
    ));
    const result = candidateEvidence(oid);
    countFailure(result.errors.some(error => error.includes(needle)), `workflow fixture missing ${needle}`);
  };
  const workflowMutations = [
    [text => text.replace("contents: read", "contents: read\n  actions: write"), "forbidden permission actions: write"],
    [text => text.replace("contents: read", "contents: write"), "forbidden permission contents: write"],
    [text => `${text}\n    permissions: write-all\n`, "aggregate write-all/read-all"],
    [text => text.replace("  verify:\n", "  verify:\n    permissions: { contents: write }\n"), "job-level permissions are forbidden"],
    [text => text.replace("  pull_request:\n", "  release:\n    types: [published]\n  pull_request:\n"), "privileged, manual, scheduled, release, or deployment trigger"],
    [text => text.replace("  push:\n    branches:\n", "  push:\n    tags:\n      - '*'\n    branches:\n"), "tag or path filters"],
    [text => `${text}\n    environment: production\n`, "deployment environment"],
    [text => `${text}\n      - run: netlify deploy --prod\n`, "mutation, release, deploy, or upload command"],
    [text => `${text}\n      - run: npm publish\n`, "mutation, release, deploy, or upload command"],
    [text => `${text}\n      - run: git push origin main\n`, "mutation, release, deploy, or upload command"],
    [text => `${text}\n      - run: gh release create sun-v0.30.1\n`, "mutation, release, deploy, or upload command"],
    [text => `${text}\n      - run: itch.io upload build.zip\n`, "mutation, release, deploy, or upload command"],
    [text => `${text}\n      - run: echo \"${"${{ secrets.TOKEN }}"}\"\n`, "secret access"],
    [text => `${text}\n      - uses: actions/upload-artifact@${"a".repeat(40)}\n`, "unapproved or mutable action"],
    [text => text.replace(
      "      - name: Use exact Node.js version\n",
      `      - name: Duplicate checkout without safe options\n        uses: ${CHECKOUT_ACTION}\n\n      - name: Use exact Node.js version\n`
    ), "must contain each required immutable action exactly once"]
  ];
  assert.equal(workflowMutations.length, 15);
  for (const [mutate, needle] of workflowMutations) rejectWorkflowMutation(mutate, needle);
  const extraWorkflowTree = treeWithOverrides(gateA.tree, {
    ".github/workflows/unauthorized.yml": Buffer.from("name: Unauthorized workflow\n", "utf8")
  });
  const extraWorkflowOid = writeRawCommit(canonicalRawCommit(
    extraWorkflowTree,
    GATE_A_BASE_SHA,
    GATE_A_AUTHOR,
    GATE_A_COMMIT_TITLE,
    canonicalRecords(extraWorkflowTree, GATE_A_CHANGED_PATHS)
  ));
  countFailure(candidateEvidence(extraWorkflowOid).errors.some(error => error.includes("workflow allowlist mismatch")), "extra workflow accepted");
  const annotatedTag = writeRawTag(Buffer.from([
    `object ${gateA.oid}`,
    "type commit",
    "tag rec-ratchet-02-counterfeit",
    "tagger Sunsplitter Tag Fixture <noreply@openai.com> 1787616000 -0500",
    "",
    "Annotated tag must not peel into an accepted candidate.\n"
  ].join("\n"), "utf8"));
  countFailure(candidateEvidence(annotatedTag).errors.some(error => error.includes("not an independently framed commit object")), "annotated tag accepted");

  const rejectCorrectionTopology = (fixture, head = correction.oid) => {
    const facts = prFacts({ sha: fixture.oid, base: C9_MERGE_SHA, head, headRef: POLICY_CORRECTION_BRANCH });
    countFailure(legacyEvaluatePolicy(facts).passed === false, "invalid correction topology accepted");
  };
  rejectCorrectionTopology(genericMerge(correction.tree, [C9_MERGE_SHA], "C10 one-parent fixture"));
  rejectCorrectionTopology(genericMerge(correction.tree, [correction.oid, C9_MERGE_SHA], "C10 swapped fixture"));
  rejectCorrectionTopology(genericMerge(correction.tree, [C9_MERGE_SHA, correction.oid, GATE_A_MERGE_SHA], "C10 octopus fixture"));
  rejectCorrectionTopology(genericMerge(C9_MERGE_TREE, [C9_MERGE_SHA, correction.oid], "C10 wrong-tree fixture"));
  rejectCorrectionTopology({ oid: correction.oid });
  const rebasedCorrectionHead = writeRawCommit(canonicalRawCommit(
    correction.tree,
    GATE_A_BASE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    correction.records
  ));
  rejectCorrectionTopology(
    genericMerge(correction.tree, [C9_MERGE_SHA, rebasedCorrectionHead], "C10 rebased fixture"),
    rebasedCorrectionHead
  );
  const alternateCorrectionHead = writeRawCommit(Buffer.from(
    correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Alternate Build <noreply@openai.com> 1787965200 -0500`),
    "utf8"
  ));
  rejectCorrectionTopology(
    genericMerge(correction.tree, [C9_MERGE_SHA, alternateCorrectionHead], "C10 alternate-author fixture"),
    alternateCorrectionHead
  );
  const repeatedCorrectionSuccessor = genericMerge(
    correction.tree,
    [correctionSynthetic.oid, correction.oid],
    "repeated correction fixture"
  );
  countExactRouteFailure(
    legacyEvaluatePolicy(pushFacts({ before: correctionSynthetic.oid, after: repeatedCorrectionSuccessor.oid })),
    "rec-02-merge",
    "candidate: future REC-02 candidate is not one direct child of the exact protected policy-correction successor",
    "repeated correction successor"
  );

  for (const branch of FAILED_POLICY_CORRECTION_BRANCHES) {
    const facts = structuredClone(correctionPr);
    facts.headRef = branch;
    countFailure(legacyEvaluatePolicy(facts).errors.some(error => error.includes("failed, frozen, and non-reusable")), `frozen branch accepted: ${branch}`);
  }
  const consumedC9Facts = structuredClone(correctionPr);
  consumedC9Facts.headRef = C9_POLICY_CORRECTION_BRANCH;
  consumedC9Facts.prBaseSha = GATE_A_MERGE_SHA;
  consumedC9Facts.prHeadSha = C9_HEAD_SHA;
  countFailure(
    legacyEvaluatePolicy(consumedC9Facts).errors.some(error => error.includes("landed, consumed, and non-reusable")),
    "consumed r7/C9 branch accepted"
  );
  const oldRec02Facts = structuredClone(correctionPr);
  oldRec02Facts.headRef = AUTHORIZED_PATCH_TARGET_BRANCH;
  countFailure(legacyEvaluatePolicy(oldRec02Facts).errors.some(error => error.includes("REC-02 r1 route")), "old REC-02 r1 route accepted");

  for (const identity of FAILED_IDENTITIES) {
    const placeholderRaw = Buffer.from([
      `tree ${identity.tree}`,
      `parent ${C9_MERGE_SHA}`,
      `author ${POLICY_CORRECTION_AUTHOR}`,
      `committer ${POLICY_CORRECTION_AUTHOR}`,
      "",
      `Failed-tree placeholder ${identity.label}\n`
    ].join("\n"), "utf8");
    const placeholder = writeRawCommit(placeholderRaw);
    const expectedFramingCalls = [
      ["rev-parse", "--verify", placeholder],
      ["cat-file", "-t", placeholder],
      ["rev-parse", "--show-object-format"],
      ["cat-file", "commit", placeholder],
      ["cat-file", "-s", placeholder]
    ];
    for (const [label, callback] of [
      ["correction", () => policySuccessorEvidence(placeholder)],
      ["future", () => futureEvidence(placeholder, correctionSynthetic.oid)]
    ]) {
      const audited = withGitInvocationAudit(callback);
      assert.deepEqual(audited.result.errors, [identity.error]);
      assert.equal(audited.result.terminalFailure, true);
      assert.equal(audited.calls.length, 5, `${identity.label} ${label}: framing call count drifted`);
      assert.deepEqual(audited.calls.map(call => call.args), expectedFramingCalls);
      assert.deepEqual(audited.calls.map(call => call.cwd), Array(5).fill(ROOT));
      countFailure(true, `${identity.label} ${label} failed-tree check did not run`);
    }
  }

  const directQFuture = genericMerge(
    correction.tree,
    [C9_MERGE_SHA, correction.oid],
    "direct Q to REC-02 fixture"
  );
  const directQFutureResult = legacyEvaluatePolicy(prFacts({
    sha: directQFuture.oid,
    base: C9_MERGE_SHA,
    head: correction.oid,
    headRef: FUTURE_BRANCH
  }));
  countFailure(
    directQFutureResult.errors.includes(
      "candidate: future base: protected C10 successor is not an exact two-parent merge from Q"
    ),
    "direct Q to REC-02 did not fail on the exact C10-base guard"
  );

  const protectedMerge = correctionSynthetic.oid;
  const future = futureFixture(protectedMerge);
  const futureSynthetic = genericMerge(future.tree, [protectedMerge, future.oid], "Synthetic REC-02 r2 merge fixture");
  const futurePr = prFacts({ sha: futureSynthetic.oid, base: protectedMerge, head: future.oid, headRef: FUTURE_BRANCH });
  const futurePush = pushFacts({ before: protectedMerge, after: futureSynthetic.oid });
  assert.deepEqual(legacyEvaluatePolicy(futurePr).errors, []);
  assert.deepEqual(legacyEvaluatePolicy(futurePush).errors, []);

  const futureStatus = fileIdentity(future.tree, STATUS_PATH).bytes;
  const futureStatusText = futureStatus.toString("utf8");
  assert.match(futureStatusText, /`updated_utc: 2026-08-25`/);
  assert.match(futureStatusText, new RegExp(`governed_recovery_successor_sha: ${protectedMerge}`));
  assert.match(futureStatusText, new RegExp(`active_simulation_baseline_sha256: ${INACTIVE_BASELINE_SHA256}`));
  assert.match(futureStatusText, /C10 landed at exact protected policy successor/);
  assert.match(futureStatusText, new RegExp(`fresh_rec_02_branch: ${FUTURE_BRANCH} — CONSTRUCTED FROM exact protected policy-correction successor ${protectedMerge}`));
  assert.match(futureStatusText, /issue_24_repin_requirement: REQUIRED EXTERNAL PRECONDITION \/ NOT VERIFIED BY REPOSITORY POLICY/);
  assert.doesNotMatch(futureStatusText, /fresh_rec_02_branch:[^`]*BLOCKED/);
  const exactStatusField = key => {
    const matches = [...futureStatusText.matchAll(new RegExp("`" + key + ":\\s*([^`]+)`", "g"))];
    assert.equal(matches.length, 1, `future STATUS ${key} field count drifted`);
    return matches[0][1].trim();
  };
  for (const identity of FAILED_IDENTITIES) {
    assert.equal(exactStatusField(`${identity.statusStem}_head`), identity.head);
    assert.equal(exactStatusField(`${identity.statusStem}_tree`), identity.tree);
    assert.equal(exactStatusField(`${identity.statusStem}_disposition`), identity.disposition);
  }
  assert.match(futureStatusText, new RegExp(POLICY_CORRECTION_RECORD_PATH.replaceAll("/", "\\/")));
  const nextActionSections = [...futureStatusText.matchAll(/^## Next action\s*\n\n([\s\S]*?)(?=\n## |\n<!--|$)/gm)];
  assert.equal(nextActionSections.length, 1, "future STATUS must contain exactly one Next action section");
  assert.deepEqual(
    [...nextActionSections[0][1].matchAll(/\*\*([^*\n]+):\*\*/g)].map(match => match[1]),
    ["Build / GPT-Codex"],
    "future STATUS next action must name exactly Build / GPT-Codex"
  );
  assert.doesNotMatch(
    futureStatusText,
    /C10 PRE-IDENTITY|c10_candidate_identity:\s*UNFROZEN|run the repaired pre-identity self-test|REC-02 r2 is held pre-freeze/
  );

  const driftFutureTree = treeWithOverrides(future.tree, {
    [STATUS_PATH]: Buffer.concat([futureStatus, Buffer.from("\n")])
  });
  const driftFutureOid = writeRawCommit(canonicalRawCommit(
    driftFutureTree,
    protectedMerge,
    FUTURE_AUTHOR,
    FUTURE_COMMIT_TITLE,
    canonicalRecords(driftFutureTree, FUTURE_CHANGED_PATHS)
  ));
  countFailure(futureEvidence(driftFutureOid, protectedMerge).errors.length > 0, "future STATUS drift accepted");
  const extraParentRaw = Buffer.from(
    future.raw.toString("utf8").replace(`parent ${protectedMerge}`, `parent ${protectedMerge}\nparent ${C9_MERGE_SHA}`),
    "utf8"
  );
  countFailure(futureEvidence(writeRawCommit(extraParentRaw), protectedMerge).errors.length > 0, "future extra parent accepted");
  const futureMergeVariants = [
    genericMerge(future.tree, [protectedMerge], "future one-parent fixture"),
    genericMerge(future.tree, [future.oid, protectedMerge], "future swapped fixture"),
    genericMerge(future.tree, [protectedMerge, future.oid, GATE_A_MERGE_SHA], "future octopus fixture"),
    genericMerge(correction.tree, [protectedMerge, future.oid], "future wrong-tree fixture")
  ];
  for (const fixture of futureMergeVariants) {
    countFailure(legacyEvaluatePolicy(pushFacts({ before: protectedMerge, after: fixture.oid })).passed === false, "future bad merge accepted");
  }
  const consumedPr = prFacts({ sha: futureSynthetic.oid, base: futureSynthetic.oid, head: future.oid, headRef: FUTURE_BRANCH });
  countExactRouteFailure(
    legacyEvaluatePolicy(consumedPr),
    "rec-02",
    "candidate: future base: protected C10 successor is not an exact two-parent merge from Q",
    "consumed future PR"
  );
  countExactRouteFailure(
    legacyEvaluatePolicy(pushFacts({ before: futureSynthetic.oid, after: futureSynthetic.oid })),
    null,
    "push before SHA is not the one unconsumed exact C10 policy successor",
    "consumed future push"
  );
  const repeatedFutureSuccessor = genericMerge(
    future.tree,
    [futureSynthetic.oid, future.oid],
    "repeated future fixture"
  );
  countExactRouteFailure(
    legacyEvaluatePolicy(pushFacts({ before: futureSynthetic.oid, after: repeatedFutureSuccessor.oid })),
    null,
    "push before SHA is not the one unconsumed exact C10 policy successor",
    "repeated future successor"
  );

  assert.equal(structuredRejected, 104);

  const evaluateInColdProcess = facts => {
    const moduleUrl = pathToFileURL(resolve(ROOT, POLICY_PATH)).href;
    const source = [
      `import { legacyEvaluatePolicy } from ${JSON.stringify(moduleUrl)};`,
      "const result = legacyEvaluatePolicy(JSON.parse(process.argv[1]));",
      "process.stdout.write(JSON.stringify(result));"
    ].join("\n");
    const child = spawnSync(process.execPath, ["--input-type=module", "--eval", source, JSON.stringify(facts)], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      shell: false
    });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  };
  for (const [facts, route] of [
    [correctionPr, "rec-ratchet-02-policy-successor"],
    [correctionPush, "rec-ratchet-02-policy-successor-merge"],
    [futurePr, "rec-02"],
    [futurePush, "rec-02-merge"]
  ]) {
    const cold = evaluateInColdProcess(facts);
    assert.equal(cold.passed, true, cold.errors?.join(" | "));
    assert.equal(cold.route, route);
  }

  const storeCandidate = c14Fixture();
  const exactStoreEnvironment = { ...REQUIRED_REPOSITORY_GIT_ENVIRONMENT };
  const storeUnitRoot = realpathSync(mkdtempSync(join(tmpdir(), "sunsplitter-c14-store-unit-")));
  const storeUnitTransferRoot = realpathSync(mkdtempSync(join(tmpdir(), "sunsplitter-c14-object-transfer-")));
  try {
    runGit(["init", "--quiet"], { cwd: storeUnitRoot });
    const reachableOids = gitText([
      "rev-list", "--objects", "--no-object-names", storeCandidate.oid
    ]).split("\n").filter(Boolean);
    assert.equal(new Set(reachableOids).size, reachableOids.length, "store unit reachable inventory contains duplicates");
    for (const oid of reachableOids) {
      const type = gitText(["cat-file", "-t", oid]);
      assert.match(type, /^(?:blob|commit|tree)$/, `store unit object ${oid} has unsupported type ${type}`);
      const bytes = gitBytes(["cat-file", type, oid]);
      const transferPath = join(storeUnitTransferRoot, oid);
      writeFileSync(transferPath, bytes, { flag: "wx", mode: 0o600 });
      const copied = gitText([
        "hash-object", "-t", type, "-w", "--no-filters", "--", transferPath
      ], { cwd: storeUnitRoot });
      unlinkSync(transferPath);
      assert.equal(copied, oid, `store unit object ${oid} changed while copying`);
    }
    runGit(["update-ref", "--no-deref", "HEAD", storeCandidate.oid], { cwd: storeUnitRoot });
    const storePass = candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment });
    assert.equal(storePass.absent, 125);
    assert.equal(storePass.controlsPresent, 12);
    assert.equal(storePass.head, storeCandidate.oid);
    assert.equal(storePass.inventorySha256, C14_CANDIDATE_INVENTORY_SHA256);
    const expectedStoredRows = [...reachableOids].sort().map(oid => (
      `${oid} ${gitText(["cat-file", "-t", oid])} ${gitText(["cat-file", "-s", oid])}`
    ));
    const expectedCounts = { blob: 0, commit: 0, tag: 0, tree: 0, total: expectedStoredRows.length };
    for (const row of expectedStoredRows) expectedCounts[row.split(" ")[1]] += 1;
    assert.deepEqual(storePass.objectInventory, {
      counts: expectedCounts,
      inventorySha256: sha256(canonicalJsonBytes({
        objects: [...reachableOids].sort(),
        schemaVersion: 1
      })),
      reachable: reachableOids.length,
      stored: reachableOids.length,
      strictFsck: "PASS"
    });
    assert.equal(storePass.result, "PASS");
    assert.equal(storePass.route, "c14");
    assert.equal(storePass.schemaVersion, 3);
    assert.throws(
      () => assertForbiddenObjectInventoryIdentity("c14", "0".repeat(64)),
      /forbidden-object inventory/
    );

    const gitDirectory = join(storeUnitRoot, ".git");
    const objectsDirectory = join(gitDirectory, "objects");
    const storeUnitAlias = `${storeUnitRoot}-alias`;
    symlinkSync(storeUnitRoot, storeUnitAlias);
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitAlias, environment: exactStoreEnvironment }),
      /checkout root is symlinked or redirected/
    );
    unlinkSync(storeUnitAlias);

    const fetchHeadPath = join(gitDirectory, "FETCH_HEAD");
    writeFileSync(fetchHeadPath, `${storeCandidate.oid}\n`, { flag: "wx" });
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
      /Git pseudoref FETCH_HEAD/
    );
    unlinkSync(fetchHeadPath);

    const gitInfoDirectory = join(gitDirectory, "info");
    for (const legacyMetadataName of ["grafts", "refs"]) {
      const legacyMetadataPath = join(gitInfoDirectory, legacyMetadataName);
      writeFileSync(legacyMetadataPath, `${storeCandidate.oid}\n`, { flag: "wx" });
      assert.throws(
        () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
        /legacy Git object\/ref metadata/
      );
      unlinkSync(legacyMetadataPath);
    }

    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: { ...exactStoreEnvironment, GIT_DIR: "/unsafe" } }),
      /unsafe Git environment/
    );
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: { ...exactStoreEnvironment, GIT_REFERENCE_BACKEND: "files" } }),
      /unsafe Git environment/
    );
    const storeCheckerModuleUrl = pathToFileURL(resolve(ROOT, POLICY_PATH)).href;
    const coldUnsafeEnvironmentSource = [
      `import { candidateOnlyObjectStoreReceipt } from ${JSON.stringify(storeCheckerModuleUrl)};`,
      "try {",
      "  candidateOnlyObjectStoreReceipt({ repoRoot: process.argv[1] });",
      "  process.stderr.write('unsafe Git environment accepted');",
      "  process.exitCode = 2;",
      "} catch (error) {",
      "  if (!/unsafe Git environment: .*GIT_EXTERNAL_DIFF/.test(error.message)) {",
      "    process.stderr.write(error.stack || error.message);",
      "    process.exitCode = 3;",
      "  }",
      "}"
    ].join("\n");
    const coldUnsafeEnvironment = spawnSync(
      process.execPath,
      ["--input-type=module", "--eval", coldUnsafeEnvironmentSource, storeUnitRoot],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: { ...process.env, GIT_EXTERNAL_DIFF: "/definitely/not-executed" },
        maxBuffer: 32 * 1024 * 1024,
        shell: false
      }
    );
    assert.equal(coldUnsafeEnvironment.status, 0, coldUnsafeEnvironment.stderr);

    runGit(["update-ref", "refs/heads/forbidden", storeCandidate.oid], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /contains refs or tags/);
    runGit(["update-ref", "-d", "refs/heads/forbidden"], { cwd: storeUnitRoot });

    runGit(["update-ref", "refs/tags/forbidden", storeCandidate.oid], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /contains refs or tags/);
    runGit(["update-ref", "-d", "refs/tags/forbidden"], { cwd: storeUnitRoot });

    runGit(["remote", "add", "origin", "https://invalid.example/Sunsplitter.git"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /contains a remote/);
    runGit(["remote", "remove", "origin"], { cwd: storeUnitRoot });

    for (const legacyName of ["branches", "remotes"]) {
      const legacyPath = join(gitDirectory, legacyName);
      mkdirSync(legacyPath, { recursive: true });
      const legacyMarker = join(legacyPath, "forbidden");
      writeFileSync(legacyMarker, "https://invalid.example/Sunsplitter.git\n", { flag: "wx" });
      assert.throws(
        () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
        new RegExp(`legacy Git ${legacyName}`)
      );
      rmSync(legacyPath, { recursive: true });
    }

    const refsPath = join(gitDirectory, "refs");
    const parkedRefsPath = join(gitDirectory, "refs.c9-parked");
    renameSync(refsPath, parkedRefsPath);
    symlinkSync(parkedRefsPath, refsPath);
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
      /Git directory contains symlink/
    );
    unlinkSync(refsPath);
    renameSync(parkedRefsPath, refsPath);

    const infoDirectory = join(objectsDirectory, "info");
    mkdirSync(infoDirectory, { recursive: true });
    const alternatesPath = join(infoDirectory, "alternates");
    writeFileSync(alternatesPath, "/definitely/missing/objects\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /object alternates/);
    unlinkSync(alternatesPath);
    const httpAlternatesPath = join(infoDirectory, "http-alternates");
    writeFileSync(httpAlternatesPath, "https://invalid.example/objects\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /object alternates/);
    unlinkSync(httpAlternatesPath);

    const shallowPath = join(gitDirectory, "shallow");
    writeFileSync(shallowPath, `${storeCandidate.oid}\n`, { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /is shallow/);
    unlinkSync(shallowPath);

    const commonPath = join(gitDirectory, "commondir");
    writeFileSync(commonPath, ".\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /common Git directory/);
    unlinkSync(commonPath);

    const packDirectory = join(objectsDirectory, "pack");
    mkdirSync(packDirectory, { recursive: true });
    const promisorPath = join(packDirectory, "forbidden.PROMISOR");
    writeFileSync(promisorPath, "", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /promisor pack/);
    unlinkSync(promisorPath);

    runGit(["config", "extensions.partialClone", "origin"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /unsafe Git configuration/);
    runGit(["config", "--unset", "extensions.partialClone"], { cwd: storeUnitRoot });

    runGit(["config", "diff.external", "/definitely/not-executed"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /unsafe Git configuration/);
    runGit(["config", "--unset", "diff.external"], { cwd: storeUnitRoot });

    runGit(["config", "fsck.missingEmail", "ignore"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /unsafe Git configuration/);
    runGit(["config", "--unset", "fsck.missingEmail"], { cwd: storeUnitRoot });

    const worktreeConfigPath = join(gitDirectory, "config.worktree");
    runGit(["config", "extensions.worktreeConfig", "true"], { cwd: storeUnitRoot });
    runGit(["config", "--worktree", "fsck.missingEmail", "ignore"], { cwd: storeUnitRoot });
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
      /unsafe Git configuration|worktree-scoped Git configuration/
    );
    runGit(["config", "--worktree", "--unset", "fsck.missingEmail"], { cwd: storeUnitRoot });
    runGit(["config", "--unset", "extensions.worktreeConfig"], { cwd: storeUnitRoot });
    assert.equal(existsSync(worktreeConfigPath), true, "worktree config fixture was not created");
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
      /worktree-scoped Git configuration/
    );
    unlinkSync(worktreeConfigPath);
    assert.equal(candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }).result, "PASS");

    runGit(["config", "include.path", "/definitely/missing-config"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /unsafe Git configuration/);
    runGit(["config", "--unset", "include.path"], { cwd: storeUnitRoot });

    const objectSymlink = join(objectsDirectory, "forbidden-symlink");
    symlinkSync(gitDirectory, objectSymlink);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /Git directory contains symlink/);
    unlinkSync(objectSymlink);

    const missingControlPath = join(objectsDirectory, RECOVERY_BASE_SHA.slice(0, 2), RECOVERY_BASE_SHA.slice(2));
    const parkedControlPath = `${missingControlPath}.missing`;
    renameSync(missingControlPath, parkedControlPath);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /required control/);
    renameSync(parkedControlPath, missingControlPath);

    const forbiddenBytes = gitBytes(["cat-file", "tree", FUNCTIONAL_TREE]);
    const copiedForbidden = gitText(["hash-object", "--literally", "-t", "tree", "-w", "--stdin"], {
      cwd: storeUnitRoot,
      input: forbiddenBytes
    });
    assert.equal(copiedForbidden, FUNCTIONAL_TREE);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }), /forbidden objects present/);
    unlinkSync(join(objectsDirectory, FUNCTIONAL_TREE.slice(0, 2), FUNCTIONAL_TREE.slice(2)));

    const unrelatedBytes = Buffer.from("C14 unrelated unreachable object\n", "utf8");
    const unrelatedOid = gitText(["hash-object", "-w", "--stdin"], {
      cwd: storeUnitRoot,
      input: unrelatedBytes
    });
    assert.equal(reachableOids.includes(unrelatedOid), false, "unreachable fixture unexpectedly belongs to candidate history");
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }),
      new RegExp(`unreachable stored objects: ${unrelatedOid}`)
    );
    unlinkSync(join(objectsDirectory, unrelatedOid.slice(0, 2), unrelatedOid.slice(2)));
    assert.equal(candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: exactStoreEnvironment }).result, "PASS");
  } finally {
    rmSync(storeUnitRoot, { recursive: true, force: true });
    rmSync(storeUnitTransferRoot, { recursive: true, force: true });
  }

  console.log(`PASS release-policy self-test — ${zeroGitRejected} zero-Git rejected-head checks; ${historicalRawRejected} historical raw-frame fixtures; ${structuredRejected} structured adversarial fixtures; immutable Gate A and C9/Q, one self-consuming C10 correction, and one self-consuming REC-02 r2 route accepted; NO-PUBLISH remains active`);
  console.log(`FIXTURE gate-a-head=${gateA.oid} tree=${gateA.tree}`);
  console.log(`FIXTURE correction-head=${correction.oid} tree=${correction.tree} synthetic=${correctionSynthetic.oid}`);
  console.log(`FIXTURE future-head=${future.oid} tree=${future.tree} synthetic=${futureSynthetic.oid}`);
}

function c14WorkflowDeltaStripped(bytes) {
  let text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("C14 workflow is not lossless UTF-8");
  const firstEnvironment = [
    "      - name: Run release-policy positive and negative fixtures\n",
    "        env:\n",
    "          GIT_CONFIG_GLOBAL: /dev/null\n",
    "          GIT_CONFIG_NOSYSTEM: \"1\"\n",
    "          GIT_OPTIONAL_LOCKS: \"0\"\n",
    "          GIT_TERMINAL_PROMPT: \"0\"\n"
  ].join("");
  text = replaceOnce(
    text,
    firstEnvironment,
    "      - name: Run release-policy positive and negative fixtures\n",
    "C14 first policy-step Git environment"
  );
  text = replaceOnce(
    text,
    "          node scripts/release-policy.mjs --github-actions-git-environment-fixture\n",
    "",
    "C14 focused Actions fixture command"
  );
  const enforcementEnvironment = [
    "        env:\n",
    "          GIT_CONFIG_GLOBAL: /dev/null\n",
    "          GIT_CONFIG_NOSYSTEM: \"1\"\n",
    "          GIT_OPTIONAL_LOCKS: \"0\"\n",
    "          GIT_TERMINAL_PROMPT: \"0\"\n",
    "          POLICY_EVENT_NAME:"
  ].join("");
  text = replaceOnce(
    text,
    enforcementEnvironment,
    "        env:\n          POLICY_EVENT_NAME:",
    "C14 enforcement-step Git environment"
  );
  return Buffer.from(text, "utf8");
}

function c14WorkflowContractErrors(ref) {
  const errors = [];
  const workflow = fileIdentity(ref, RELEASE_WORKFLOW_PATH);
  const historical = fileIdentity(C10_MERGE_SHA, RELEASE_WORKFLOW_PATH);
  if (!workflow) return [`${RELEASE_WORKFLOW_PATH}: C14 workflow is missing`];
  if (workflow.mode !== "100644"
    || workflow.blob !== C14_RELEASE_WORKFLOW_BLOB
    || workflow.sha256 !== C14_RELEASE_WORKFLOW_SHA256
    || workflow.byteLength !== C14_RELEASE_WORKFLOW_BYTES) {
    errors.push(`${RELEASE_WORKFLOW_PATH}: C14 exact identity drifted`);
  }
  try {
    if (!historical || !c14WorkflowDeltaStripped(workflow.bytes).equals(historical.bytes)) {
      errors.push(`${RELEASE_WORKFLOW_PATH}: bytes outside the bounded C14 additions differ from exact S`);
    }
  } catch (error) {
    errors.push(error.message);
  }

  const text = workflow.bytes.toString("utf8");
  const lines = text.split("\n");
  const stepStarts = lines.flatMap((line, index) => /^      - name: /.test(line) ? [index] : []);
  const steps = stepStarts.map((start, index) => ({
    start,
    text: lines.slice(start, stepStarts[index + 1] ?? lines.length).join("\n")
  }));
  const policySteps = steps.filter(step => /^        run:/m.test(step.text));
  if (policySteps.length !== 2) errors.push(`C14 policy run-step count ${policySteps.length} != 2`);
  const requiredLiteralLines = Object.freeze({
    GIT_CONFIG_GLOBAL: "          GIT_CONFIG_GLOBAL: /dev/null",
    GIT_CONFIG_NOSYSTEM: "          GIT_CONFIG_NOSYSTEM: \"1\"",
    GIT_OPTIONAL_LOCKS: "          GIT_OPTIONAL_LOCKS: \"0\"",
    GIT_TERMINAL_PROMPT: "          GIT_TERMINAL_PROMPT: \"0\""
  });
  for (const [name, literal] of Object.entries(requiredLiteralLines)) {
    const count = lines.filter(line => line === literal).length;
    if (count !== 2) errors.push(`${name}: literal step-local occurrence count ${count} != 2`);
    for (const step of policySteps) {
      if (!step.text.split("\n").includes(literal)) errors.push(`${name}: missing from one policy run step`);
    }
  }
  if (lines.some(line => /^env:$/.test(line) && line !== "env:")
    || lines.some(line => /^    env:/.test(line))) {
    errors.push("C14 Git environment leaked to workflow or job scope");
  }
  const actionSteps = steps.filter(step => /actions\/(?:checkout|setup-node)@/.test(step.text));
  if (actionSteps.some(step => Object.keys(requiredLiteralLines).some(name => step.text.includes(name)))) {
    errors.push("checkout/setup received the C14 Git environment");
  }
  const first = policySteps[0]?.text || "";
  const fixtureIndex = first.indexOf("node scripts/release-policy.mjs --github-actions-git-environment-fixture");
  const selfTestIndex = first.indexOf("node scripts/release-policy.mjs --self-test");
  if (fixtureIndex < 0 || selfTestIndex < 0 || fixtureIndex >= selfTestIndex) {
    errors.push("focused Actions fixture is not before the full self-test in the first policy step");
  }
  if (!/^        run: node scripts\/release-policy\.mjs$/m.test(policySteps[1]?.text || "")) {
    errors.push("C14 enforcement step command drifted");
  }
  const policyMappings = [...(policySteps[1]?.text || "").matchAll(/^          (POLICY_[A-Z_]+):/gm)]
    .map(match => match[1]);
  const expectedPolicyMappings = [
    "POLICY_EVENT_NAME", "POLICY_REPOSITORY", "POLICY_SHA", "POLICY_REF", "POLICY_REF_NAME",
    "POLICY_REF_TYPE", "POLICY_BASE_REF", "POLICY_HEAD_REF", "POLICY_PR_BASE_SHA",
    "POLICY_PR_HEAD_SHA", "POLICY_PR_HEAD_REPOSITORY", "POLICY_BEFORE_SHA", "POLICY_AFTER_SHA"
  ];
  if (!sameList(policyMappings, expectedPolicyMappings)) errors.push("C14 enforcement POLICY_* mapping inventory or order drifted");
  return errors;
}

function c14RawCommit(tree) {
  return Buffer.from([
    `tree ${tree}`,
    `parent ${C10_MERGE_SHA}`,
    `author ${C14_POLICY_CORRECTION_AUTHOR}`,
    `committer ${C14_POLICY_CORRECTION_AUTHOR}`,
    "",
    C14_POLICY_CORRECTION_COMMIT_TITLE
  ].join("\n") + "\n", "utf8");
}

function c14CandidateEvidence(ref) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["C14 candidate is not an independently framed commit object"] };
  if (!sameList(commit.parents, [C10_MERGE_SHA])) errors.push("C14 candidate is not one direct child of exact S");
  if (!sameList(changedPaths(C10_MERGE_SHA, commit.oid), C14_CHANGED_PATHS)) {
    errors.push("C14 changed paths differ from the exact five-path scope");
  }
  for (const path of C14_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: C14 path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: C14 mode ${identity.mode} != 100644`);
  }
  const exactIdentities = {
    [RELEASE_WORKFLOW_PATH]: [C14_RELEASE_WORKFLOW_BLOB, C14_RELEASE_WORKFLOW_SHA256, C14_RELEASE_WORKFLOW_BYTES],
    [PATCH_ARTIFACT_PATH]: [C14_PATCH_BLOB, C14_PATCH_SHA256, C14_PATCH_BYTES]
  };
  for (const [path, [blob, digest, byteLength]] of Object.entries(exactIdentities)) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity || identity.blob !== blob || identity.sha256 !== digest || identity.byteLength !== byteLength) {
      errors.push(`${path}: C14 exact identity drifted`);
    }
  }
  for (const [path, digest] of [
    [STATUS_PATH, C14_STATUS_SHA256],
    [POLICY_CORRECTION_RECORD_PATH, C14_RECORD_SHA256]
  ]) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity || identity.sha256 !== digest) errors.push(`${path}: C14 exact identity drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== C14_POLICY_PROJECTION_SHA256) {
    errors.push(`C14 policy projection ${projection || "missing"} != ${C14_POLICY_PROJECTION_SHA256}`);
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  errors.push(...workflowSecurityErrors(commit.oid, C14_RELEASE_WORKFLOW_SHA256));
  errors.push(...c14WorkflowContractErrors(commit.oid));
  const projectionEvidence = validateProjectionArtifacts(commit.oid, ACTIVE_REC02_SEAL);
  errors.push(...projectionEvidence.errors);
  const artEvidence = validateArtCompatibility(commit.oid, ACTIVE_REC02_SEAL);
  errors.push(...artEvidence.errors);

  const records = canonicalRecords(commit.tree, C14_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(record => !record)) {
    errors.push("C14 canonical manifest contains an unreadable path");
  } else {
    manifest = canonicalManifest(records);
    expectedRaw = c14RawCommit(commit.tree);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("C14 raw commit payload differs from the exact subject-only frame");
    if (commit.oid !== expectedOid) errors.push(`C14 OID ${commit.oid} != independently framed ${expectedOid}`);
    if (!sameList(commit.headerLines, [
      `tree ${commit.tree}`,
      `parent ${C10_MERGE_SHA}`,
      `author ${C14_POLICY_CORRECTION_AUTHOR}`,
      `committer ${C14_POLICY_CORRECTION_AUTHOR}`
    ])) errors.push("C14 raw header order or inventory drifted");
    if (commit.message !== `${C14_POLICY_CORRECTION_COMMIT_TITLE}\n`) errors.push("C14 commit message bytes drifted");
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    rawByteLength: commit.bytes.length,
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null,
    projectionEvidence,
    artEvidence
  };
}

function c14MergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== C10_MERGE_SHA) {
    return { errors: ["protected C14 successor is not an exact two-parent merge from S"] };
  }
  return mergeEvidence(merge.oid, C10_MERGE_SHA, c14CandidateEvidence(merge.parents[1]));
}

function expectedC14FutureStatus(protectedMerge) {
  const merge = commitHeaders(protectedMerge);
  if (!merge) throw new Error("future STATUS base is not a commit");
  const base = c14MergeEvidence(protectedMerge);
  if (base.errors.length) throw new Error(`future STATUS base is not exact X: ${base.errors.join(" | ")}`);
  const c14 = c14CandidateEvidence(merge.parents[1]);
  const status = fileIdentity(merge.parents[1], STATUS_PATH);
  if (c14.errors.length || !status
    || status.sha256 !== C14_STATUS_SHA256) {
    throw new Error("future STATUS source is not the exact C14 STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "updated_utc", "2026-08-25");
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", protectedMerge);
  text = replaceUniqueStatusField(
    text,
    "tested_runtime_sha",
    `${protectedMerge} — exact protected C14 policy successor; recovery evidence, not certification`
  );
  text = replaceUniqueStatusField(text, "milestone", "REC-02-R2 — exact active projection from protected C14 successor X");
  text = replaceUniqueStatusField(text, "ticket", "REC-02 / issue #24 — governed zero-exit implementation r2");
  text = replaceUniqueStatusField(
    text,
    "state",
    `REC-02 R2 CANDIDATE — exact protected C14 successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED`
  );
  text = replaceUniqueStatusField(text, "implementation_branch", FUTURE_BRANCH);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", merge.tree);
  text = replaceUniqueStatusField(
    text,
    "rec_ratchet_02_control_state",
    `GATE A CLOSED at P; C9 CLOSED/CONSUMED at Q; C10/r8 CLOSED/CONSUMED at S; C11/r9, C12/r10, and C13/r11 TERMINAL/NON-REUSABLE; C14/r12 CLOSED/LANDED/CONSUMED at exact protected successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED remains active`
  );
  text = replaceUniqueStatusField(
    text,
    "c14_candidate_identity",
    `LANDED PRECURSOR — protected successor ${protectedMerge}; correction head ${merge.parents[1]}; tree ${merge.tree}; ordered parents [${merge.parents.join(",")}]`
  );
  text = replaceUniqueStatusField(
    text,
    "fresh_rec_02_branch",
    `${FUTURE_BRANCH} — CONSTRUCTED FROM exact protected C14 successor ${protectedMerge}`
  );
  text = replaceUniqueStatusField(
    text,
    "issue_24_repin_requirement",
    `REQUIRED EXTERNAL PRECONDITION / NOT VERIFIED BY REPOSITORY POLICY — owner-authenticated readback must show issue #24 repinned to exact ${protectedMerge}; external receipt must accompany candidate`
  );
  text = replaceUniqueStatusField(
    text,
    "active_simulation_baseline_sha256",
    `${INACTIVE_BASELINE_SHA256} — exact REC-02 baseline activated from the landed Gate A artifact`
  );
  text = replaceUniqueStatusField(
    text,
    "functional_projection_state",
    "ACTIVATED — exact pinned patch and baseline applied; full exact-head verifier and locked simulations must pass again"
  );
  text = replaceOnce(
    text,
    "- C14 has no known design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh owner-dispatched successor.",
    `- C14 landed at exact protected successor \`${protectedMerge}\`; that route and protected-merge authorization are consumed.`,
    "future STATUS C14 blocker transition"
  );
  text = replaceOnce(
    text,
    "- REC-02 r2 remains blocked until C14 lands under separate authorization and issue #24 is freshly repinned to exact X.",
    `- REC-02 r2 is an exact candidate from \`${protectedMerge}\` after the required issue #24 repin. Its protected merge remains unauthorized pending exact-head checks, attributable CI, independent PASS, fresh ruleset/bypass/ref readback, and separate owner authorization.`,
    "future STATUS REC-02 blocker transition"
  );
  text = replaceOnce(
    text,
    "**Build / GPT-Codex:** complete C14 pre-freeze validation and independent exact-byte review; only total PASS permits one freeze and the one-shot 13-gate runner. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "**Build / GPT-Codex:** after complete local PASS, push this exact REC-02 r2 identity once, open one draft PR against the protected recovery branch, monitor attributable attempt-1 CI, and hand the immutable packet to independent review. Do not mark ready or merge. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "future STATUS next action"
  );
  return Buffer.from(text, "utf8");
}

const c14FutureTreeCache = new Map();

function buildC14FutureTree(protectedMerge) {
  if (c14FutureTreeCache.has(protectedMerge)) return c14FutureTreeCache.get(protectedMerge);
  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  if (!patchIdentity || !baselineIdentity) throw new Error("future projection artifacts are missing");
  if (patchIdentity.sha256 !== C14_PATCH_SHA256 || patchIdentity.byteLength !== C14_PATCH_BYTES) {
    throw new Error("future projection patch identity drifted");
  }
  const artifact = JSON.parse(patchIdentity.bytes.toString("utf8"));
  const futureStatus = expectedC14FutureStatus(protectedMerge);
  const reconstructed = reconstructPatchTree(protectedMerge, artifact, {
    [ACTIVE_BASELINE_PATH]: { bytes: baselineIdentity.bytes, mode: baselineIdentity.mode },
    [STATUS_PATH]: { bytes: futureStatus, mode: "100644" }
  });
  const result = { tree: reconstructed.tree, transcript: reconstructed.transcript, status: futureStatus };
  c14FutureTreeCache.set(protectedMerge, result);
  return result;
}

function c14FutureEvidence(ref, protectedMerge) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["future REC-02 candidate is not an independently framed commit object"] };
  const base = c14MergeEvidence(protectedMerge);
  if (base.errors.length) errors.push(...base.errors.map(error => `future base: ${error}`));
  if (!sameList(commit.parents, [protectedMerge])) {
    errors.push("future REC-02 candidate is not one direct child of exact X");
  }
  if (!sameList(changedPaths(protectedMerge, commit.oid), FUTURE_CHANGED_PATHS)) {
    errors.push("future REC-02 changed paths differ from the exact ten-path activation scope");
  }
  let projected = null;
  try {
    projected = buildC14FutureTree(protectedMerge);
    if (commit.tree !== projected.tree) {
      errors.push(`future REC-02 tree ${commit.tree} != mechanically projected ${projected.tree}`);
    }
  } catch (error) {
    errors.push(error.message);
  }

  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  let artifact = null;
  try {
    artifact = patchIdentity ? JSON.parse(patchIdentity.bytes.toString("utf8")) : null;
  } catch {
    errors.push("future patch artifact is not valid JSON");
  }
  for (const row of artifact?.files || []) {
    const output = fileIdentity(commit.oid, row.path);
    if (!output || output.mode !== row.output?.mode || output.blob !== row.output?.blob
      || output.sha256 !== row.output?.sha256 || output.byteLength !== row.output?.byteLength) {
      errors.push(`${row.path}: future exact output identity drifted`);
    }
  }
  const active = fileIdentity(commit.oid, ACTIVE_BASELINE_PATH);
  if (!active || !baselineIdentity || active.mode !== baselineIdentity.mode || active.blob !== baselineIdentity.blob
    || active.sha256 !== baselineIdentity.sha256 || active.byteLength !== baselineIdentity.byteLength) {
    errors.push("future active baseline is not the exact authorized inactive baseline bytes");
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || !projected || !status.bytes.equals(projected.status)) {
    errors.push("future STATUS is not the exact mechanically derived transition");
  }
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  if (policyProjection(commit.oid) !== C14_POLICY_PROJECTION_SHA256) errors.push("future REC-02 policy projection drifted");
  errors.push(...workflowSecurityErrors(commit.oid, C14_RELEASE_WORKFLOW_SHA256));
  errors.push(...c14WorkflowContractErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid, ACTIVE_REC02_SEAL).errors);
  errors.push(...validateArtCompatibility(commit.oid, ACTIVE_REC02_SEAL).errors);

  const records = canonicalRecords(commit.tree, FUTURE_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(record => !record)) {
    errors.push("future REC-02 canonical manifest contains an unreadable path");
  } else {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("future REC-02 raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`future REC-02 OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: protectedMerge,
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function c14FutureMergeEvidence(ref, protectedMerge) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== protectedMerge) {
    return { errors: ["protected REC-02 successor is not an exact two-parent merge from X"] };
  }
  return mergeEvidence(merge.oid, protectedMerge, c14FutureEvidence(merge.parents[1], protectedMerge));
}

function r13RawCommit(tree) {
  return Buffer.from([
    `tree ${tree}`,
    `parent ${C14_MERGE_SHA}`,
    `author ${R13_POLICY_CORRECTION_AUTHOR}`,
    `committer ${R13_POLICY_CORRECTION_AUTHOR}`,
    "",
    R13_POLICY_CORRECTION_COMMIT_TITLE
  ].join("\n") + "\n", "utf8");
}

function r13CandidateEvidence(ref) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["r13 candidate is not an independently framed commit object"] };
  if (!sameList(commit.parents, [C14_MERGE_SHA])) errors.push("r13 candidate is not one direct child of exact X");
  if (!sameList(changedPaths(C14_MERGE_SHA, commit.oid), R13_CHANGED_PATHS)) {
    errors.push("r13 changed paths differ from the exact four-path scope");
  }
  for (const path of R13_CHANGED_PATHS) {
    const identity = fileIdentity(commit.oid, path);
    if (!identity) errors.push(`${path}: r13 path is missing`);
    else if (identity.mode !== "100644") errors.push(`${path}: r13 mode ${identity.mode} != 100644`);
  }

  const status = fileIdentity(commit.oid, STATUS_PATH);
  const record = fileIdentity(commit.oid, POLICY_CORRECTION_RECORD_PATH);
  const patch = fileIdentity(commit.oid, PATCH_ARTIFACT_PATH);
  if (!status || status.sha256 !== R13_STATUS_SHA256) errors.push(`${STATUS_PATH}: r13 exact identity drifted`);
  if (!record || record.sha256 !== R13_RECORD_SHA256) errors.push(`${POLICY_CORRECTION_RECORD_PATH}: r13 exact identity drifted`);
  if (!patch || patch.blob !== R13_PATCH_BLOB || patch.sha256 !== R13_PATCH_SHA256
    || patch.byteLength !== R13_PATCH_BYTES) {
    errors.push(`${PATCH_ARTIFACT_PATH}: r13 exact identity drifted`);
  }
  try {
    if (!status || sha256(normalizedR13StatusBytes(status.bytes)) !== R13_STATUS_PROJECTION_SHA256) {
      errors.push("r13 STATUS normalized projection drifted");
    }
  } catch (error) {
    errors.push(error.message);
  }
  try {
    if (!record || sha256(normalizedR13RecordBytes(record.bytes)) !== R13_RECORD_PROJECTION_SHA256) {
      errors.push("r13 correction-record normalized projection drifted");
    }
  } catch (error) {
    errors.push(error.message);
  }
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  if (policyProjection(commit.oid) !== R13_POLICY_PROJECTION_SHA256) {
    errors.push("r13 policy normalized projection drifted");
  }
  errors.push(...workflowSecurityErrors(commit.oid, C14_RELEASE_WORKFLOW_SHA256));
  errors.push(...c14WorkflowContractErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid, R13_REC02_SEAL).errors);
  errors.push(...validateArtCompatibility(commit.oid, R13_REC02_SEAL).errors);

  const records = canonicalRecords(commit.tree, R13_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(row => !row)) {
    errors.push("r13 canonical manifest contains an unreadable path");
  } else {
    manifest = canonicalManifest(records);
    expectedRaw = r13RawCommit(commit.tree);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("r13 raw commit payload differs from the exact subject-only frame");
    if (commit.oid !== expectedOid) errors.push(`r13 OID ${commit.oid} != independently framed ${expectedOid}`);
    if (!sameList(commit.headerLines, [
      `tree ${commit.tree}`,
      `parent ${C14_MERGE_SHA}`,
      `author ${R13_POLICY_CORRECTION_AUTHOR}`,
      `committer ${R13_POLICY_CORRECTION_AUTHOR}`
    ])) errors.push("r13 raw header order or inventory drifted");
    if (commit.message !== `${R13_POLICY_CORRECTION_COMMIT_TITLE}\n`) errors.push("r13 commit message bytes drifted");
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: commit.parents[0],
    rawSha256: sha256(commit.bytes),
    rawByteLength: commit.bytes.length,
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function r13MergeEvidence(ref) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== C14_MERGE_SHA) {
    return { errors: ["protected r13 successor is not an exact two-parent merge from X"] };
  }
  return mergeEvidence(merge.oid, C14_MERGE_SHA, r13CandidateEvidence(merge.parents[1]));
}

function expectedR13FutureStatus(protectedMerge) {
  const merge = commitHeaders(protectedMerge);
  if (!merge) throw new Error("r3 STATUS base is not a commit");
  const base = r13MergeEvidence(protectedMerge);
  if (base.errors.length) throw new Error(`r3 STATUS base is not an exact r13 successor: ${base.errors.join(" | ")}`);
  const candidate = r13CandidateEvidence(merge.parents[1]);
  const status = fileIdentity(merge.parents[1], STATUS_PATH);
  if (candidate.errors.length || !status || status.sha256 !== R13_STATUS_SHA256) {
    throw new Error("r3 STATUS source is not the exact r13 STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", protectedMerge);
  text = replaceUniqueStatusField(
    text,
    "tested_runtime_sha",
    `${protectedMerge} — exact protected r13 policy successor; recovery evidence, not certification`
  );
  text = replaceUniqueStatusField(text, "milestone", "REC-02-R3 — exact active projection from protected r13 successor");
  text = replaceUniqueStatusField(text, "ticket", "REC-02 / issue #24 — governed zero-exit implementation r3");
  text = replaceUniqueStatusField(
    text,
    "state",
    `REC-02 R3 CANDIDATE — exact protected r13 successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED`
  );
  text = replaceUniqueStatusField(text, "implementation_branch", R13_FUTURE_BRANCH);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", merge.tree);
  text = replaceUniqueStatusField(
    text,
    "rec_ratchet_02_control_state",
    `GATE A CLOSED at P; C9 CLOSED/CONSUMED at Q; C10/r8 CLOSED/CONSUMED at S; C11/r9, C12/r10, and C13/r11 TERMINAL/NON-REUSABLE; C14/r12 CLOSED/LANDED/CONSUMED at X; REC-02 r2 / PR #39 TERMINAL/NON-REUSABLE; r13 CLOSED/LANDED/CONSUMED at exact protected successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED remains active`
  );
  text = replaceUniqueStatusField(
    text,
    "r13_candidate_identity",
    `LANDED PRECURSOR — protected successor ${protectedMerge}; correction head ${merge.parents[1]}; tree ${merge.tree}; ordered parents [${merge.parents.join(",")}]`
  );
  text = replaceUniqueStatusField(
    text,
    "fresh_rec_02_branch",
    `${R13_FUTURE_BRANCH} — CONSTRUCTED FROM exact protected r13 successor ${protectedMerge}`
  );
  text = replaceUniqueStatusField(
    text,
    "issue_24_repin_requirement",
    `REQUIRED EXTERNAL PRECONDITION / NOT VERIFIED BY REPOSITORY POLICY — owner-authenticated readback must show issue #24 freshly repinned to exact ${protectedMerge}; external receipt must accompany candidate`
  );
  text = replaceUniqueStatusField(
    text,
    "active_simulation_baseline_sha256",
    `${INACTIVE_BASELINE_SHA256} — exact REC-02 baseline activated from the landed Gate A artifact`
  );
  text = replaceUniqueStatusField(
    text,
    "functional_projection_state",
    "ACTIVATED — exact pinned patch and baseline applied; full exact-head verifier and locked simulations must pass again"
  );
  text = replaceOnce(
    text,
    "- r13 is authorized only through a fully validated local candidate and independent review. No push, PR, ready transition, merge, workflow rerun, deployment, publication, tag, release, or certification is authorized.",
    `- r13 landed at exact protected successor \`${protectedMerge}\`; that route and its protected-merge authorization are consumed.`,
    "r3 STATUS r13 blocker transition"
  );
  text = replaceOnce(
    text,
    "- REC-02 r3 remains UNFROZEN and blocked until an exact r13 successor lands under separate authorization and issue #24 is separately repinned to that exact successor.",
    `- REC-02 r3 is a synthetic exact candidate from \`${protectedMerge}\`; any real construction, push, PR, ready transition, or merge still requires separate authorization and external Issue #24 evidence.`,
    "r3 STATUS REC-02 blocker transition"
  );
  text = replaceOnce(
    text,
    "**Build / GPT-Codex:** complete the exact four-path r13 local validation and independent review, freeze one local candidate identity only on total PASS, report its evidence, and stop before any push or PR. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "**Owner / Manraj:** decide whether to authorize a separately executed REC-02 r3 Build candidate after exact Issue #24 repin evidence. `NO-PUBLISH / NOT CERTIFIED` remains active.",
    "r3 STATUS next action"
  );
  return Buffer.from(text, "utf8");
}

const r13FutureTreeCache = new Map();

function buildR13FutureTree(protectedMerge) {
  if (r13FutureTreeCache.has(protectedMerge)) return r13FutureTreeCache.get(protectedMerge);
  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  if (!patchIdentity || !baselineIdentity) throw new Error("r3 projection artifacts are missing");
  if (patchIdentity.sha256 !== R13_PATCH_SHA256 || patchIdentity.byteLength !== R13_PATCH_BYTES) {
    throw new Error("r3 projection patch identity drifted");
  }
  const artifact = JSON.parse(patchIdentity.bytes.toString("utf8"));
  const futureStatus = expectedR13FutureStatus(protectedMerge);
  const reconstructed = reconstructPatchTree(protectedMerge, artifact, {
    [ACTIVE_BASELINE_PATH]: { bytes: baselineIdentity.bytes, mode: baselineIdentity.mode },
    [STATUS_PATH]: { bytes: futureStatus, mode: "100644" }
  });
  const result = { tree: reconstructed.tree, transcript: reconstructed.transcript, status: futureStatus };
  r13FutureTreeCache.set(protectedMerge, result);
  return result;
}

function r13FutureEvidence(ref, protectedMerge) {
  const errors = [];
  const commit = commitHeaders(ref);
  if (!commit) return { errors: ["future REC-02 r3 candidate is not an independently framed commit object"] };
  const base = r13MergeEvidence(protectedMerge);
  if (base.errors.length) errors.push(...base.errors.map(error => `r3 base: ${error}`));
  if (!sameList(commit.parents, [protectedMerge])) errors.push("future REC-02 r3 candidate is not one direct child of exact r13 successor");
  if (!sameList(changedPaths(protectedMerge, commit.oid), FUTURE_CHANGED_PATHS)) {
    errors.push("future REC-02 r3 changed paths differ from the exact ten-path activation scope");
  }
  let projected = null;
  try {
    projected = buildR13FutureTree(protectedMerge);
    if (commit.tree !== projected.tree) errors.push(`future REC-02 r3 tree ${commit.tree} != mechanically projected ${projected.tree}`);
  } catch (error) {
    errors.push(error.message);
  }

  const patchIdentity = fileIdentity(protectedMerge, PATCH_ARTIFACT_PATH);
  const baselineIdentity = fileIdentity(protectedMerge, INACTIVE_BASELINE_PATH);
  let artifact = null;
  try {
    artifact = patchIdentity ? JSON.parse(patchIdentity.bytes.toString("utf8")) : null;
  } catch {
    errors.push("r3 patch artifact is not valid JSON");
  }
  for (const row of artifact?.files || []) {
    const output = fileIdentity(commit.oid, row.path);
    if (!output || output.mode !== row.output?.mode || output.blob !== row.output?.blob
      || output.sha256 !== row.output?.sha256 || output.byteLength !== row.output?.byteLength) {
      errors.push(`${row.path}: future r3 exact output identity drifted`);
    }
  }
  const active = fileIdentity(commit.oid, ACTIVE_BASELINE_PATH);
  if (!active || !baselineIdentity || active.mode !== baselineIdentity.mode || active.blob !== baselineIdentity.blob
    || active.sha256 !== baselineIdentity.sha256 || active.byteLength !== baselineIdentity.byteLength) {
    errors.push("future r3 active baseline is not the exact authorized inactive baseline bytes");
  }
  const status = fileIdentity(commit.oid, STATUS_PATH);
  if (!status || !projected || !status.bytes.equals(projected.status)) errors.push("future r3 STATUS is not the exact mechanically derived transition");
  if (status) errors.push(...noPublishStatusErrors(status.bytes));
  if (policyProjection(commit.oid) !== R13_POLICY_PROJECTION_SHA256) errors.push("future REC-02 r3 policy projection drifted");
  errors.push(...workflowSecurityErrors(commit.oid, C14_RELEASE_WORKFLOW_SHA256));
  errors.push(...c14WorkflowContractErrors(commit.oid));
  errors.push(...validateProjectionArtifacts(commit.oid, R13_REC02_SEAL).errors);
  errors.push(...validateArtCompatibility(commit.oid, R13_REC02_SEAL).errors);

  const records = canonicalRecords(commit.tree, FUTURE_CHANGED_PATHS);
  let manifest = null;
  let expectedRaw = null;
  let expectedOid = null;
  if (records.some(row => !row)) {
    errors.push("future REC-02 r3 canonical manifest contains an unreadable path");
  } else {
    manifest = canonicalManifest(records);
    expectedRaw = canonicalRawCommit(commit.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
    expectedOid = gitObjectOid("commit", expectedRaw);
    if (!commit.bytes.equals(expectedRaw)) errors.push("future REC-02 r3 raw commit payload differs from the exact canonical frame");
    if (commit.oid !== expectedOid) errors.push(`future REC-02 r3 OID ${commit.oid} != independently framed ${expectedOid}`);
  }
  return {
    errors,
    oid: commit.oid,
    tree: commit.tree,
    parent: protectedMerge,
    rawSha256: sha256(commit.bytes),
    expectedOid,
    manifest,
    manifestSha256: manifest ? sha256(Buffer.from(manifest)) : null
  };
}

function r13FutureMergeEvidence(ref, protectedMerge) {
  const merge = commitHeaders(ref);
  if (!merge || merge.parents.length !== 2 || merge.parents[0] !== protectedMerge) {
    return { errors: ["protected REC-02 r3 successor is not an exact two-parent merge from the r13 successor"] };
  }
  return mergeEvidence(merge.oid, protectedMerge, r13FutureEvidence(merge.parents[1], protectedMerge));
}

const TERMINAL_CORRECTION_BRANCHES = Object.freeze([
  ...FAILED_POLICY_CORRECTION_BRANCHES,
  C9_POLICY_CORRECTION_BRANCH,
  POLICY_CORRECTION_BRANCH,
  C11_POLICY_CORRECTION_BRANCH,
  C12_POLICY_CORRECTION_BRANCH,
  C13_POLICY_CORRECTION_BRANCH,
  C14_POLICY_CORRECTION_BRANCH,
  GATE_A_BRANCH,
  AUTHORIZED_PATCH_TARGET_BRANCH,
  FUTURE_BRANCH
]);
const TERMINAL_SUCCESSOR_OBJECTS = Object.freeze(new Map([
  [C9_HEAD_SHA, "C9/r7 is landed, consumed, and non-reusable"],
  [C10_HEAD_SHA, "C10/r8 is landed, consumed, and non-reusable"],
  [C11_HEAD_SHA, "C11/r9 is terminal and non-reusable"],
  [C12_HEAD_SHA, "C12/r10 is terminal and non-reusable"],
  [C13_HEAD_SHA, "C13/r11 is terminal and non-reusable"],
  [C11_MERGE_SHA, "C11 terminal topology is non-reusable"],
  [C11_REVIEW_MERGE_SHA, "C11 terminal topology is non-reusable"],
  [C11_TRANSITION_SHA, "C11 terminal topology is non-reusable"],
  [C12_MERGE_SHA, "C12 terminal topology is non-reusable"],
  [C12_REVIEW_MERGE_SHA, "C12 terminal topology is non-reusable"],
  [C12_TRANSITION_SHA, "C12 terminal topology is non-reusable"],
  [C13_REVIEW_MERGE_SHA, "C13 terminal topology is non-reusable"],
  [C13_FUTURE_SHA, "C13 terminal topology is non-reusable"],
  [C13_TRANSITION_SHA, "C13 terminal topology is non-reusable"],
  [C14_HEAD_SHA, "C14/r12 is landed, consumed, and non-reusable"],
  [FAILED_REC_02_R2_HEAD, "REC-02 r2 / PR #39 is terminal and non-reusable"],
  [FAILED_REC_02_R2_TREE, "REC-02 r2 tree is terminal and non-reusable"],
  [FAILED_REC_02_R2_SYNTHETIC_MERGE, "REC-02 r2 synthetic merge is terminal and non-reusable"]
]));

function terminalC14RouteError(facts) {
  const normalizeOid = value => {
    if (typeof value !== "string") return null;
    const normalized = value.trim().toLowerCase();
    return FULL_SHA_RE.test(normalized) ? normalized : null;
  };
  const head = normalizeOid(presentedCandidateHead(facts));
  if (TERMINAL_SUCCESSOR_OBJECTS.has(head)) return TERMINAL_SUCCESSOR_OBJECTS.get(head);
  const before = normalizeOid(facts.beforeSha);
  if (TERMINAL_SUCCESSOR_OBJECTS.has(before)) return TERMINAL_SUCCESSOR_OBJECTS.get(before);
  if (facts.eventName === "pull_request" && TERMINAL_CORRECTION_BRANCHES.includes(facts.headRef)) {
    return `correction branch ${facts.headRef} is consumed or terminal and non-reusable`;
  }
  return null;
}

export function evaluatePolicy(facts) {
  const notices = [
    "NO-PUBLISH / NOT CERTIFIED remains active.",
    "Ruleset 21051662, explicit bypass_actors: [], required checks, issue #24, and merge-time ref identity require a fresh owner-authenticated read before any separately authorized protected merge.",
    "This workflow grants no merge, ready-for-review, rerun, deployment, release, tag, publication, certification, or external-write authority."
  ];
  const errors = [];
  let route = null;
  let evidence = null;

  const failed = failedIdentityByHead(presentedCandidateHead(facts));
  if (failed) {
    evidence = rejectedIdentityEvidence(failed);
    return { passed: false, errors: [...evidence.errors], notices, route, evidence };
  }
  const terminal = terminalC14RouteError(facts);
  if (terminal) {
    evidence = { errors: [terminal], rejectedBeforeGit: true, terminalFailure: true };
    return { passed: false, errors: [terminal], notices, route, evidence };
  }

  if (facts.repository !== EXPECTED_REPOSITORY) errors.push(`repository ${facts.repository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
  if (!FULL_SHA_RE.test(facts.sha || "")) errors.push("event SHA is not a full SHA-1");
  if (facts.checkedOutSha !== facts.sha) {
    errors.push(`checked-out SHA ${facts.checkedOutSha || "<missing>"} != event SHA ${facts.sha || "<missing>"}`);
  }
  if (facts.refType === "tag" || (facts.ref || "").startsWith("refs/tags/")) errors.push("tag creation or evaluation is forbidden");

  if (facts.eventName === "pull_request") {
    if (facts.baseRef === "main") errors.push("all pull requests to main are blocked while NO-PUBLISH is active");
    if (facts.baseRef !== RECOVERY_BRANCH) errors.push(`pull-request base ${facts.baseRef || "<missing>"} != ${RECOVERY_BRANCH}`);
    if (facts.prHeadRepository !== EXPECTED_REPOSITORY) {
      errors.push(`pull-request head repository ${facts.prHeadRepository || "<missing>"} != ${EXPECTED_REPOSITORY}`);
    }
    if (!FULL_SHA_RE.test(facts.prBaseSha || "") || !FULL_SHA_RE.test(facts.prHeadSha || "")) {
      errors.push("pull-request base/head SHA is not a full SHA-1 pair");
    }
    if (facts.headRef === R13_POLICY_CORRECTION_BRANCH) {
      route = "rec-ratchet-02-r13";
      if (facts.prBaseSha !== C14_MERGE_SHA) {
        errors.push(`r13 pull-request base ${facts.prBaseSha || "<missing>"} != exact X ${C14_MERGE_SHA}`);
      }
      evidence = r13CandidateEvidence(facts.prHeadSha);
      errors.push(...mergeEvidence(facts.sha, C14_MERGE_SHA, evidence).errors);
    } else if (facts.headRef === R13_FUTURE_BRANCH) {
      route = "rec-02-r3";
      evidence = r13FutureEvidence(facts.prHeadSha, facts.prBaseSha);
      errors.push(...mergeEvidence(facts.sha, facts.prBaseSha, evidence).errors);
    } else {
      errors.push(`pull-request head ${facts.headRef || "<missing>"} is not an armed recovery route`);
    }
  } else if (facts.eventName === "push") {
    if (facts.ref !== `refs/heads/${RECOVERY_BRANCH}`
      || facts.refName !== RECOVERY_BRANCH
      || facts.refType !== "branch") {
      errors.push("push is not an exact protected recovery-branch event");
    }
    if (facts.sha !== facts.afterSha) errors.push("push event SHA differs from after SHA");
    if (facts.beforeSha === C14_MERGE_SHA) {
      route = "rec-ratchet-02-r13-merge";
      evidence = r13MergeEvidence(facts.afterSha);
      errors.push(...evidence.errors);
    } else {
      const base = r13MergeEvidence(facts.beforeSha);
      if (base.errors.length === 0) {
        route = "rec-02-r3-merge";
        evidence = r13FutureMergeEvidence(facts.afterSha, facts.beforeSha);
        errors.push(...evidence.errors);
      } else {
        errors.push("push before SHA is not exact X or the one unconsumed exact r13 successor");
      }
    }
  } else {
    errors.push(`event ${facts.eventName || "<missing>"} is not authorized`);
  }
  return { passed: errors.length === 0, errors, notices, route, evidence };
}

function runGithubActionsGitEnvironmentFixture() {
  const exact = { ...REQUIRED_REPOSITORY_GIT_ENVIRONMENT };
  const positives = [
    { label: "exact-four", environment: { ...exact } },
    { label: "exact-four-plus-pager", environment: { ...exact, GIT_PAGER: "cat" } }
  ];
  for (const testCase of positives) {
    const audit = withGitInvocationAudit(() => assertSafeGitEnvironment(testCase.environment));
    assert.equal(audit.calls.length, 0, `${testCase.label} invoked Git`);
    assert.deepEqual(audit.result, testCase.environment, `${testCase.label} normalized or changed an exact value`);
  }

  const negatives = [];
  const wrongValues = {
    GIT_CONFIG_GLOBAL: "/tmp/attacker-config",
    GIT_CONFIG_NOSYSTEM: "0",
    GIT_OPTIONAL_LOCKS: "1",
    GIT_TERMINAL_PROMPT: "1"
  };
  for (const name of Object.keys(exact)) {
    const missing = { ...exact };
    delete missing[name];
    negatives.push({ label: `${name}-missing`, environment: missing, names: [name] });
    negatives.push({ label: `${name}-empty`, environment: { ...exact, [name]: "" }, names: [name] });
    negatives.push({ label: `${name}-wrong`, environment: { ...exact, [name]: wrongValues[name] }, names: [name] });
  }
  negatives.push({ label: "pager-wrong", environment: { ...exact, GIT_PAGER: "less" }, names: ["GIT_PAGER"] });
  const sampledExtras = [
    "GIT_CEILING_DIRECTORIES",
    "GIT_CONFIG_SYSTEM",
    "GIT_CONFIG_COUNT",
    "GIT_CONFIG_KEY_0",
    "GIT_CONFIG_VALUE_0",
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    "GIT_EXTERNAL_DIFF",
    "GIT_DIFF_OPTS",
    "GIT_SSH",
    "GIT_SSH_COMMAND",
    "GIT_ASKPASS",
    "GIT_REPLACE_REF_BASE",
    "GIT_CONFIG_PARAMETERS",
    "GIT_ATTR_NOSYSTEM",
    "GIT_PROTOCOL_FROM_USER",
    "GIT_FLUSH",
    "GIT_TRACE",
    "GIT_TRACE2",
    "GIT_NAMESPACE",
    "GIT_COMMON_DIR",
    "GIT_INDEX_FILE"
  ];
  for (const name of sampledExtras) {
    negatives.push({ label: `${name}-extra`, environment: { ...exact, [name]: "attacker" }, names: [name] });
  }
  negatives.push({
    label: "coherent-command-scope-config",
    environment: {
      ...exact,
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "core.fsmonitor",
      GIT_CONFIG_VALUE_0: "!attacker-command"
    },
    names: ["GIT_CONFIG_COUNT", "GIT_CONFIG_KEY_0", "GIT_CONFIG_VALUE_0"]
  });
  negatives.push({
    label: "github-marker-missing",
    environment: {
      ...Object.fromEntries(Object.entries(exact).filter(([name]) => name !== "GIT_TERMINAL_PROMPT")),
      GITHUB_ACTIONS: "true",
      CI: "true",
      RUNNER_ENVIRONMENT: "github-hosted"
    },
    names: ["GIT_TERMINAL_PROMPT"]
  });
  negatives.push({
    label: "github-marker-wrong",
    environment: { ...exact, GIT_OPTIONAL_LOCKS: "1", GITHUB_ACTIONS: "true", CI: "true" },
    names: ["GIT_OPTIONAL_LOCKS"]
  });
  negatives.push({
    label: "github-marker-extra",
    environment: { ...exact, GIT_CEILING_DIRECTORIES: "/runner/work", GITHUB_ACTIONS: "true", CI: "true" },
    names: ["GIT_CEILING_DIRECTORIES"]
  });

  const sentinelRoot = mkdtempSync(join(tmpdir(), "sunsplitter-c14-git-sentinel-"));
  const sentinelMarker = join(sentinelRoot, "CALLED");
  try {
    writeFileSync(
      join(sentinelRoot, "git"),
      `#!/bin/sh\nprintf called > '${sentinelMarker}'\nexit 99\n`,
      { flag: "wx", mode: 0o700 }
    );
    let zeroGitRejections = 0;
    for (const testCase of negatives) {
      const audit = withGitInvocationAudit(() => {
        try {
          assertSafeGitEnvironment({ ...testCase.environment, PATH: sentinelRoot });
          return null;
        } catch (error) {
          return error;
        }
      });
      assert.equal(audit.calls.length, 0, `${testCase.label} reached repository Git`);
      assert.ok(audit.result instanceof Error, `${testCase.label} unexpectedly passed`);
      const expectedNames = [...testCase.names].sort();
      const suffix = audit.result.message.slice(audit.result.message.indexOf(":") + 1).trim();
      assert.deepEqual(suffix.split(", ").filter(Boolean), expectedNames, `${testCase.label} error names drifted`);
      for (const value of Object.values(testCase.environment)) {
        if (typeof value === "string" && value.includes("attacker")) {
          assert.equal(audit.result.message.includes(value), false, `${testCase.label} printed an attacker value`);
        }
      }
      zeroGitRejections += 1;
    }
    assert.equal(existsSync(sentinelMarker), false, "sentinel Git executable was called");
    return {
      expectedGitEnvironment: exact,
      mode: "github-actions-git-environment-fixture",
      negativeCases: negatives.length,
      optionalPagerCases: 1,
      positiveCases: positives.length,
      result: "PASS",
      schemaVersion: 1,
      sentinelGitCalls: 0,
      zeroGitRejections
    };
  } finally {
    rmSync(sentinelRoot, { recursive: true, force: true });
  }
}

export function githubActionsGitEnvironmentFixture() {
  return runGithubActionsGitEnvironmentFixture();
}

function currentC14Inputs(source = C14_MERGE_SHA) {
  if (source !== C14_MERGE_SHA) {
    throw new Error(`historical C14 fixture source must be literal exact X ${C14_MERGE_SHA}`);
  }
  const protectedMerge = commitHeaders(source);
  if (!protectedMerge
    || protectedMerge.oid !== C14_MERGE_SHA
    || protectedMerge.tree !== C14_MERGE_TREE
    || !sameList(protectedMerge.parents, [C10_MERGE_SHA, C14_HEAD_SHA])
    || protectedMerge.bytes.length !== C14_MERGE_RAW_BYTES
    || sha256(protectedMerge.bytes) !== C14_MERGE_RAW_SHA256) {
    throw new Error("historical exact X identity, tree, topology, or raw payload drifted");
  }
  const candidate = commitHeaders(C14_HEAD_SHA);
  if (!candidate
    || candidate.oid !== C14_HEAD_SHA
    || candidate.tree !== C14_HEAD_TREE
    || !sameList(candidate.parents, [C10_MERGE_SHA])
    || candidate.bytes.length !== C14_HEAD_RAW_BYTES
    || sha256(candidate.bytes) !== C14_HEAD_RAW_SHA256) {
    throw new Error("historical exact C14 identity, tree, topology, or raw payload drifted");
  }
  if (candidate.tree !== protectedMerge.tree) throw new Error("historical C14 and X trees differ");
  if (!sameList(changedPaths(C10_MERGE_SHA, candidate.oid), C14_CHANGED_PATHS)) {
    throw new Error("historical C14 changed-path scope drifted");
  }

  const exact = Object.freeze({
    [RELEASE_WORKFLOW_PATH]: [C14_RELEASE_WORKFLOW_BLOB, C14_RELEASE_WORKFLOW_SHA256, C14_RELEASE_WORKFLOW_BYTES],
    [STATUS_PATH]: [C14_STATUS_BLOB, C14_STATUS_SHA256, C14_STATUS_BYTES],
    [POLICY_CORRECTION_RECORD_PATH]: [C14_RECORD_BLOB, C14_RECORD_SHA256, C14_RECORD_BYTES],
    [PATCH_ARTIFACT_PATH]: [C14_PATCH_BLOB, C14_PATCH_SHA256, C14_PATCH_BYTES],
    [POLICY_PATH]: [C14_POLICY_BLOB, C14_POLICY_SHA256, C14_POLICY_BYTES]
  });
  const inputs = {};
  const records = canonicalRecords(candidate.tree, C14_CHANGED_PATHS);
  if (records.some(record => !record)) throw new Error("historical C14 manifest contains a missing record");
  const manifest = Buffer.from(canonicalManifest(records), "utf8");
  if (manifest.length !== C14_MANIFEST_BYTES || sha256(manifest) !== C14_MANIFEST_SHA256) {
    throw new Error("historical C14 five-path manifest drifted");
  }
  for (const record of records) {
    const [blob, digest, byteLength] = exact[record.path] || [];
    if (record.mode !== "100644" || record.blob !== blob || record.sha256 !== digest || record.byteLength !== byteLength) {
      throw new Error(`historical C14 ${record.path} exact identity drifted`);
    }
    inputs[record.path] = record.bytes;
  }
  const parsedPatch = JSON.parse(inputs[PATCH_ARTIFACT_PATH].toString("utf8"));
  const formattedPatch = Buffer.from(`${JSON.stringify(parsedPatch, null, 2)}\n`, "utf8");
  if (!formattedPatch.equals(inputs[PATCH_ARTIFACT_PATH])) {
    throw new Error("historical C14 patch artifact is not canonical two-space JSON with one terminal LF");
  }
  return inputs;
}

function expectedR13PatchBytes(source = C14_MERGE_SHA) {
  if (source !== C14_MERGE_SHA) {
    throw new Error(`r13 patch source must be literal exact X ${C14_MERGE_SHA}`);
  }
  currentC14Inputs(source);
  const historical = fileIdentity(source, PATCH_ARTIFACT_PATH);
  if (!historical || historical.blob !== C14_PATCH_BLOB || historical.sha256 !== C14_PATCH_SHA256) {
    throw new Error("r13 patch source is not the exact landed C14 artifact");
  }
  const artifact = JSON.parse(historical.bytes.toString("utf8"));
  if (artifact.authority?.targetBranch !== FUTURE_BRANCH) {
    throw new Error("historical C14 patch target is not exact REC-02 r2");
  }
  artifact.authority.targetBranch = R13_FUTURE_BRANCH;
  const bytes = Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  if (bytes.length !== R13_PATCH_BYTES || sha256(bytes) !== R13_PATCH_SHA256
    || gitObjectOid("blob", bytes) !== R13_PATCH_BLOB) {
    throw new Error("mechanically derived r13 patch identity drifted");
  }
  return bytes;
}

function r13EnvelopeAt(ref) {
  const inputs = {};
  for (const path of R13_CHANGED_PATHS) {
    const identity = fileIdentity(ref, path);
    if (!identity || identity.mode !== "100644") {
      throw new Error(`${path}: r13 envelope exact identity drifted`);
    }
    inputs[path] = identity.bytes;
  }
  return inputs;
}

function readCurrentR13Envelope() {
  const inputs = {};
  for (const path of R13_CHANGED_PATHS) {
    const physicalPath = resolve(ROOT, path);
    const metadata = lstatSync(physicalPath);
    if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error(`r13 self-test ${path} is not one regular file`);
    const worktree = readFileSync(physicalPath);
    const index = gitBytes(["show", `:${path}`]);
    if (!worktree.equals(index)) throw new Error(`r13 self-test ${path} has unstaged worktree drift`);
    const text = worktree.toString("utf8");
    if (!Buffer.from(text, "utf8").equals(worktree)) throw new Error(`r13 self-test ${path} is not lossless UTF-8`);
    if (text.includes("\r") || text.includes("\0")) throw new Error(`r13 self-test ${path} contains forbidden bytes`);
    if (!text.endsWith("\n") || text.endsWith("\n\n")) {
      throw new Error(`r13 self-test ${path} does not have exactly one terminal LF`);
    }
    inputs[path] = worktree;
  }
  return inputs;
}

function validateR13CandidateInputs(inputs) {
  currentC14Inputs(C14_MERGE_SHA);
  if (sha256(inputs[STATUS_PATH]) !== R13_STATUS_SHA256) {
    throw new Error("current r13 STATUS exact identity drifted");
  }
  if (sha256(inputs[POLICY_CORRECTION_RECORD_PATH]) !== R13_RECORD_SHA256) {
    throw new Error("current r13 correction-record exact identity drifted");
  }
  if (!inputs[PATCH_ARTIFACT_PATH].equals(expectedR13PatchBytes(C14_MERGE_SHA))) {
    throw new Error("current r13 patch is not the exact one-field X-derived transition");
  }
  const historicalRecord = fileIdentity(C14_MERGE_SHA, POLICY_CORRECTION_RECORD_PATH);
  if (!historicalRecord || !inputs[POLICY_CORRECTION_RECORD_PATH].subarray(0, historicalRecord.bytes.length).equals(historicalRecord.bytes)
    || inputs[POLICY_CORRECTION_RECORD_PATH].subarray(historicalRecord.bytes.length).toString("utf8")
      .startsWith("\n## 12. r13 immutable landed-C14 fixture-source supplement\n") === false) {
    throw new Error("r13 correction record is not exact X plus one r13 supplement");
  }
  if (sha256(normalizedR13StatusBytes(inputs[STATUS_PATH])) !== R13_STATUS_PROJECTION_SHA256) {
    throw new Error("r13 STATUS normalized projection drifted");
  }
  if (sha256(normalizedR13RecordBytes(inputs[POLICY_CORRECTION_RECORD_PATH])) !== R13_RECORD_PROJECTION_SHA256) {
    throw new Error("r13 correction-record normalized projection drifted");
  }
  if (sha256(normalizedPolicyBytes(inputs[POLICY_PATH])) !== R13_POLICY_PROJECTION_SHA256) {
    throw new Error("r13 policy normalized projection drifted");
  }
  const statusErrors = noPublishStatusErrors(inputs[STATUS_PATH]);
  if (statusErrors.length) throw new Error(`r13 STATUS publication boundary drifted: ${statusErrors.join(" | ")}`);
  return inputs;
}

function immutableR13Inputs(protectedMerge) {
  const merge = commitHeaders(protectedMerge);
  const base = r13MergeEvidence(protectedMerge);
  if (!merge || base.errors.length) {
    throw new Error(`immutable r13 source is not an exact protected successor: ${base.errors.join(" | ")}`);
  }
  const candidateOid = merge.parents[1];
  const candidate = r13CandidateEvidence(candidateOid);
  if (candidate.errors.length) {
    throw new Error(`immutable r13 candidate source drifted: ${candidate.errors.join(" | ")}`);
  }
  const inputs = r13EnvelopeAt(candidateOid);
  const records = canonicalRecords(commitHeaders(candidateOid).tree, R13_CHANGED_PATHS);
  if (records.some(record => !record || record.mode !== "100644")
    || canonicalManifest(records) !== candidate.manifest) {
    throw new Error("immutable r13 four-path manifest drifted");
  }
  return inputs;
}

function r13EnvelopeMatchesRef(envelope, ref) {
  return R13_CHANGED_PATHS.every(path => {
    const identity = fileIdentity(ref, path);
    return identity?.mode === "100644" && envelope[path]?.equals(identity.bytes);
  });
}

function currentR13Inputs(checkoutRef = "HEAD", currentEnvelope = null) {
  const checkout = commitHeaders(checkoutRef);
  if (!checkout) throw new Error("r13 self-test checkout is not a commit");
  const envelope = currentEnvelope || readCurrentR13Envelope();
  const checkoutProtectedEvidence = r13MergeEvidence(checkout.oid);
  if (checkoutProtectedEvidence.errors.length === 0) {
    if (r13EnvelopeMatchesRef(envelope, checkout.oid)) {
      return immutableR13Inputs(checkout.oid);
    }
    const projected = buildR13FutureTree(checkout.oid);
    if (r13EnvelopeMatchesRef(envelope, projected.tree)) {
      return immutableR13Inputs(checkout.oid);
    }
    throw new Error("r13 protected-successor checkout envelope is neither exact r13 nor exact staged r3");
  }
  const protectedMerge = checkout.parents[0];
  const protectedEvidence = protectedMerge ? r13MergeEvidence(protectedMerge) : { errors: ["missing first parent"] };
  if (protectedEvidence.errors.length === 0) {
    let routeErrors;
    if (sameList(checkout.parents, [protectedMerge])) {
      routeErrors = r13FutureEvidence(checkout.oid, protectedMerge).errors;
    } else if (checkout.parents.length === 2 && checkout.parents[0] === protectedMerge) {
      routeErrors = r13FutureMergeEvidence(checkout.oid, protectedMerge).errors;
    } else {
      routeErrors = ["future r3 checkout has unsupported topology"];
    }
    if (routeErrors.length) {
      throw new Error(`future r3 checkout evidence drifted: ${routeErrors.join(" | ")}`);
    }
    if (!r13EnvelopeMatchesRef(envelope, checkout.oid)) {
      throw new Error("future r3 checkout envelope drifted");
    }
    return immutableR13Inputs(protectedMerge);
  }
  return validateR13CandidateInputs(envelope);
}

function c14Fixture(inputs = currentC14Inputs()) {
  const tree = treeWithOverrides(C10_MERGE_SHA, Object.fromEntries(
    C14_CHANGED_PATHS.map(path => [path, inputs[path]])
  ));
  const records = canonicalRecords(tree, C14_CHANGED_PATHS);
  assert.ok(records.every(Boolean), "C14 fixture manifest contains a missing record");
  const raw = c14RawCommit(tree);
  const oid = writeRawCommit(raw);
  if (inputs[POLICY_PATH]?.equals(currentC14Inputs()[POLICY_PATH])) {
    assert.equal(oid, C14_HEAD_SHA, "immutable historical C14 fixture did not resolve to the landed head");
  }
  return { oid, tree, raw, records, inputs };
}

function c14FutureFixture(protectedMerge) {
  const projected = buildC14FutureTree(protectedMerge);
  const records = canonicalRecords(projected.tree, FUTURE_CHANGED_PATHS);
  assert.ok(records.every(Boolean), "future C14 fixture manifest contains a missing record");
  const raw = canonicalRawCommit(projected.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
  return { oid: writeRawCommit(raw), raw, tree: projected.tree, records };
}

function r13Fixture(inputs = currentR13Inputs()) {
  const tree = treeWithOverrides(C14_MERGE_SHA, Object.fromEntries(
    R13_CHANGED_PATHS.map(path => [path, inputs[path]])
  ));
  const records = canonicalRecords(tree, R13_CHANGED_PATHS);
  assert.ok(records.every(Boolean), "r13 fixture manifest contains a missing record");
  const raw = r13RawCommit(tree);
  return { oid: writeRawCommit(raw), tree, raw, records, inputs };
}

function r13FutureFixture(protectedMerge) {
  const projected = buildR13FutureTree(protectedMerge);
  const records = canonicalRecords(projected.tree, FUTURE_CHANGED_PATHS);
  assert.ok(records.every(Boolean), "future r3 fixture manifest contains a missing record");
  const raw = canonicalRawCommit(projected.tree, protectedMerge, FUTURE_AUTHOR, FUTURE_COMMIT_TITLE, records);
  return { oid: writeRawCommit(raw), raw, tree: projected.tree, records };
}

function expectC14PolicyFailure(facts, mutate, needle) {
  const altered = structuredClone(facts);
  mutate(altered);
  const result = evaluatePolicy(altered);
  assert.equal(result.passed, false, `policy unexpectedly accepted ${needle}`);
  assert.ok(result.errors.some(error => error.includes(needle)), `missing ${needle}: ${result.errors.join(" | ")}`);
}

function selfTest() {
  assertSafeGitEnvironment(process.env);
  assert.ok(FULL_SHA256_RE.test(R13_POLICY_PROJECTION_SHA256) && !/^0+$/.test(R13_POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(R13_CANDIDATE_INVENTORY_SHA256) && !/^0+$/.test(R13_CANDIDATE_INVENTORY_SHA256));
  assert.ok(FULL_SHA256_RE.test(R13_FUTURE_INVENTORY_SHA256) && !/^0+$/.test(R13_FUTURE_INVENTORY_SHA256));
  assert.ok(FULL_SHA256_RE.test(R13_STATUS_SHA256) && !/^0+$/.test(R13_STATUS_SHA256));
  assert.ok(FULL_SHA256_RE.test(R13_RECORD_SHA256) && !/^0+$/.test(R13_RECORD_SHA256));
  assert.ok(FULL_SHA256_RE.test(C14_POLICY_PROJECTION_SHA256) && !/^0+$/.test(C14_POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(C14_CANDIDATE_INVENTORY_SHA256) && !/^0+$/.test(C14_CANDIDATE_INVENTORY_SHA256));
  assert.ok(FULL_SHA256_RE.test(C14_FUTURE_INVENTORY_SHA256) && !/^0+$/.test(C14_FUTURE_INVENTORY_SHA256));
  assert.equal(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))), R13_POLICY_PROJECTION_SHA256);
  assert.equal(policyProjection(C14_HEAD_SHA), C14_POLICY_PROJECTION_SHA256, "historical C14 policy projection drifted");
  const immutableC14Inputs = currentC14Inputs();
  assert.equal(sha256(immutableC14Inputs[STATUS_PATH]), C14_STATUS_SHA256);
  assert.notEqual(sha256(readFileSync(resolve(ROOT, STATUS_PATH))), C14_STATUS_SHA256, "current r13 STATUS unexpectedly equals historical C14 STATUS");
  for (const alias of ["HEAD", C14_MERGE_SHA.toUpperCase(), ` ${C14_MERGE_SHA}`, C10_MERGE_SHA, "0".repeat(40)]) {
    const aliasAudit = withGitInvocationAudit(() => assert.throws(
      () => currentC14Inputs(alias),
      /historical C14 fixture source must be literal exact X/
    ));
    assert.equal(aliasAudit.calls.length, 0, `historical C14 alias ${alias} invoked Git`);
  }

  const environmentReceipt = runGithubActionsGitEnvironmentFixture();
  assert.equal(environmentReceipt.result, "PASS");
  const childProbe = sanitizedChildGitEnvironment({ C14_NON_GIT_PROBE: "preserved" });
  assert.equal(childProbe.C14_NON_GIT_PROBE, "preserved", "ordinary non-Git child environment did not survive");
  const childGitNames = Object.keys(childProbe).filter(name => name.startsWith("GIT_")).sort();
  const expectedChildGitNames = [
    ...Object.keys(REQUIRED_REPOSITORY_GIT_ENVIRONMENT),
    ...Object.keys(POLICY_CHILD_GIT_ENVIRONMENT),
    ...(process.env.GIT_PAGER === "cat" ? ["GIT_PAGER"] : [])
  ].sort();
  assert.deepEqual(childGitNames, expectedChildGitNames, "policy Git child environment inventory drifted");
  const childAudit = withGitInvocationAudit(() => gitText(["--version"], { env: { C14_NON_GIT_PROBE: "preserved" } }));
  assert.match(childAudit.result, /^git version /);
  assert.equal(childAudit.calls.length, 1);
  assert.equal(childAudit.calls[0].executable, ABSOLUTE_GIT);
  assert.deepEqual(childAudit.calls[0].gitEnvironmentNames, expectedChildGitNames);

  legacySelfTest();

  const candidateInventory = forbiddenObjectInventory("c14");
  const futureInventory = forbiddenObjectInventory("rec-02");
  const r13CandidateInventory = r13ForbiddenObjectInventory("r13");
  const r13FutureInventory = r13ForbiddenObjectInventory("rec-02-r3");
  assert.deepEqual(candidateInventory.counts, {
    artBlobs: 79,
    artRoots: 2,
    consumedC11Objects: 6,
    consumedC12Objects: 6,
    consumedC13Objects: 6,
    derived: 8,
    failedIdentityObjects: 18,
    total: 125
  });
  assert.deepEqual(futureInventory.counts, {
    artBlobs: 79,
    artRoots: 2,
    consumedC11Objects: 6,
    consumedC12Objects: 6,
    consumedC13Objects: 6,
    derived: 7,
    failedIdentityObjects: 18,
    total: 124
  });
  assertForbiddenObjectInventoryIdentity("c14", sha256(canonicalJsonBytes(candidateInventory)));
  assertForbiddenObjectInventoryIdentity("rec-02", sha256(canonicalJsonBytes(futureInventory)));
  assert.deepEqual(r13CandidateInventory.counts, {
    artBlobs: 79,
    artRoots: 2,
    consumedC11Objects: 6,
    consumedC12Objects: 6,
    consumedC13Objects: 6,
    derived: 8,
    failedIdentityObjects: 18,
    total: 128,
    terminalR2Objects: 3
  });
  assert.deepEqual(r13FutureInventory.counts, {
    artBlobs: 79,
    artRoots: 2,
    consumedC11Objects: 6,
    consumedC12Objects: 6,
    consumedC13Objects: 6,
    derived: 7,
    failedIdentityObjects: 18,
    total: 127,
    terminalR2Objects: 3
  });
  assertR13ForbiddenObjectInventoryIdentity("r13", sha256(canonicalJsonBytes(r13CandidateInventory)));
  assertR13ForbiddenObjectInventoryIdentity("rec-02-r3", sha256(canonicalJsonBytes(r13FutureInventory)));
  for (const [label, objects] of [
    ["C11", CONSUMED_C11_OBJECTS],
    ["C12", CONSUMED_C12_OBJECTS],
    ["C13", CONSUMED_C13_OBJECTS]
  ]) {
    for (const oid of objects) {
      assert.ok(candidateInventory.objects.includes(oid), `${label} object is absent from the C14 inventory`);
      assert.ok(futureInventory.objects.includes(oid), `${label} object is absent from the future inventory`);
    }
  }

  const gateA = historicalGateAFixture();
  const c9 = policyCorrectionFixture();
  const c10 = policySuccessorEvidence(C10_HEAD_SHA);
  assert.deepEqual(c10.errors, [], `historical C10 evidence drifted: ${c10.errors.join(" | ")}`);
  const s = policySuccessorMergeEvidence(C10_MERGE_SHA);
  assert.deepEqual(s.errors, [], `historical S evidence drifted: ${s.errors.join(" | ")}`);
  assert.equal(s.oid, C10_MERGE_SHA);
  assert.equal(s.tree, C10_MERGE_TREE);
  assert.equal(sha256(commitHeaders(C10_MERGE_SHA).bytes), C10_MERGE_RAW_SHA256);
  assert.equal(c10.oid, C10_HEAD_SHA);
  assert.equal(c10.tree, C10_HEAD_TREE);
  assert.equal(c10.rawSha256, C10_HEAD_RAW_SHA256);
  assert.equal(c10.manifestSha256, C10_MANIFEST_SHA256);

  const candidate = c14Fixture();
  const candidateEvidence = c14CandidateEvidence(candidate.oid);
  assert.deepEqual(candidateEvidence.errors, [], `C14 fixture failed: ${candidateEvidence.errors.join(" | ")}`);
  let structuredRejected = 0;
  const countC14Rejection = (condition, label) => {
    assert.ok(condition, label);
    structuredRejected += 1;
  };
  const candidateText = candidate.raw.toString("utf8");
  const candidateRawMutations = [
    [candidate.raw.subarray(0, candidate.raw.length - 1), "missing terminal LF"],
    [Buffer.concat([candidate.raw, Buffer.from("\n")]), "extra terminal LF"],
    [Buffer.from(candidateText.replaceAll("\n", "\r\n")), "CRLF raw frame"],
    [Buffer.from(candidateText.replace(C14_POLICY_CORRECTION_COMMIT_TITLE, `${C14_POLICY_CORRECTION_COMMIT_TITLE}.`)), "title drift"],
    [Buffer.from(candidateText.replace(`author ${C14_POLICY_CORRECTION_AUTHOR}`, "author Altered <noreply@openai.com> 1788656400 -0500")), "author drift"],
    [Buffer.from(candidateText.replace(`committer ${C14_POLICY_CORRECTION_AUTHOR}`, "committer Altered <noreply@openai.com> 1788656400 -0500")), "committer drift"],
    [Buffer.from(candidateText.replace("1788656400", "1788656401")), "timestamp drift"],
    [Buffer.from(candidateText.replaceAll("-0500", "+0000")), "timezone drift"],
    [Buffer.from(candidateText.replace(`parent ${C10_MERGE_SHA}`, `parent ${C9_MERGE_SHA}`)), "parent drift"],
    [Buffer.from(candidateText.replace(`parent ${C10_MERGE_SHA}`, `parent ${C10_MERGE_SHA}\nparent ${C9_MERGE_SHA}`)), "extra parent"],
    [Buffer.from(candidateText.replace(`tree ${candidate.tree}`, `tree ${C10_MERGE_TREE}`)), "tree drift"],
    [Buffer.from(candidateText.replace("author ", "encoding UTF-8\nauthor ")), "encoding header"],
    [Buffer.from(candidateText.replace("author ", "gpgsig counterfeit\nauthor ")), "signature header"],
    [Buffer.from(candidateText.replace(`author ${C14_POLICY_CORRECTION_AUTHOR}\ncommitter ${C14_POLICY_CORRECTION_AUTHOR}`, `committer ${C14_POLICY_CORRECTION_AUTHOR}\nauthor ${C14_POLICY_CORRECTION_AUTHOR}`)), "header order"],
    [Buffer.from(candidateText.replace(`committer ${C14_POLICY_CORRECTION_AUTHOR}\n\n`, `committer ${C14_POLICY_CORRECTION_AUTHOR}\n`)), "header/message boundary"]
  ];
  for (const [bytes, label] of candidateRawMutations) {
    countC14Rejection(c14CandidateEvidence(writeRawCommit(bytes)).errors.length > 0, `C14 raw mutation accepted: ${label}`);
  }

  const exactOverrides = Object.fromEntries(C14_CHANGED_PATHS.map(path => [path, candidate.inputs[path]]));
  const treeMutations = [
    ["workflow bytes", { ...exactOverrides, [RELEASE_WORKFLOW_PATH]: Buffer.concat([candidate.inputs[RELEASE_WORKFLOW_PATH], Buffer.from("\n")]) }],
    ["STATUS bytes", { ...exactOverrides, [STATUS_PATH]: Buffer.concat([candidate.inputs[STATUS_PATH], Buffer.from("\n")]) }],
    ["record bytes", { ...exactOverrides, [POLICY_CORRECTION_RECORD_PATH]: Buffer.concat([candidate.inputs[POLICY_CORRECTION_RECORD_PATH], Buffer.from("\n")]) }],
    ["patch bytes", { ...exactOverrides, [PATCH_ARTIFACT_PATH]: Buffer.concat([candidate.inputs[PATCH_ARTIFACT_PATH], Buffer.from("\n")]) }],
    ["policy bytes", { ...exactOverrides, [POLICY_PATH]: Buffer.concat([candidate.inputs[POLICY_PATH], Buffer.from("\n")]) }],
    ["workflow mode", { ...exactOverrides, [RELEASE_WORKFLOW_PATH]: { bytes: candidate.inputs[RELEASE_WORKFLOW_PATH], mode: "100755" } }],
    ["extra path", { ...exactOverrides, "artifacts/C14-UNAUTHORIZED": Buffer.from("unauthorized\n") }],
    ["missing path", { ...exactOverrides, [POLICY_CORRECTION_RECORD_PATH]: null }]
  ];
  for (const [label, overrides] of treeMutations) {
    const alteredTree = treeWithOverrides(C10_MERGE_SHA, overrides);
    const alteredHead = writeRawCommit(c14RawCommit(alteredTree));
    countC14Rejection(c14CandidateEvidence(alteredHead).errors.length > 0, `C14 tree mutation accepted: ${label}`);
  }

  const x = genericMerge(candidate.tree, [C10_MERGE_SHA, candidate.oid], "C14 protected successor fixture");
  const xEvidence = c14MergeEvidence(x.oid);
  assert.deepEqual(xEvidence.errors, [], `X fixture failed: ${xEvidence.errors.join(" | ")}`);
  for (const fixture of [
    genericMerge(candidate.tree, [C10_MERGE_SHA], "C14 one-parent X fixture"),
    genericMerge(candidate.tree, [candidate.oid, C10_MERGE_SHA], "C14 swapped X fixture"),
    genericMerge(candidate.tree, [C10_MERGE_SHA, candidate.oid, C9_MERGE_SHA], "C14 octopus X fixture"),
    genericMerge(C10_MERGE_TREE, [C10_MERGE_SHA, candidate.oid], "C14 wrong-tree X fixture")
  ]) countC14Rejection(c14MergeEvidence(fixture.oid).errors.length > 0, "invalid C14 X topology accepted");

  const future = c14FutureFixture(x.oid);
  const futureEvidence = c14FutureEvidence(future.oid, x.oid);
  assert.deepEqual(futureEvidence.errors, [], `future fixture failed: ${futureEvidence.errors.join(" | ")}`);
  const futureStatusText = fileIdentity(future.oid, STATUS_PATH).bytes.toString("utf8");
  assert.match(
    futureStatusText,
    new RegExp(`rec_ratchet_02_control_state: [^\n]*C14/r12 CLOSED/LANDED/CONSUMED at exact protected successor ${x.oid}`)
  );
  assert.doesNotMatch(futureStatusText, /rec_ratchet_02_control_state:[^\n]*C14\/r12 PRE-IDENTITY/);
  const futureText = future.raw.toString("utf8");
  for (const [bytes, label] of [
    [future.raw.subarray(0, future.raw.length - 1), "missing terminal LF"],
    [Buffer.concat([future.raw, Buffer.from("\n")]), "extra terminal LF"],
    [Buffer.from(futureText.replace(FUTURE_COMMIT_TITLE, `${FUTURE_COMMIT_TITLE}.`)), "title drift"],
    [Buffer.from(futureText.replace(`parent ${x.oid}`, `parent ${C10_MERGE_SHA}`)), "parent drift"],
    [Buffer.from(futureText.replace(`parent ${x.oid}`, `parent ${x.oid}\nparent ${C10_MERGE_SHA}`)), "extra parent"],
    [Buffer.from(futureText.replace(`tree ${future.tree}`, `tree ${candidate.tree}`)), "tree drift"]
  ]) countC14Rejection(c14FutureEvidence(writeRawCommit(bytes), x.oid).errors.length > 0, `future raw mutation accepted: ${label}`);

  const t = genericMerge(future.tree, [x.oid, future.oid], "REC-02 protected successor fixture");
  const tEvidence = c14FutureMergeEvidence(t.oid, x.oid);
  assert.deepEqual(tEvidence.errors, [], `T fixture failed: ${tEvidence.errors.join(" | ")}`);
  for (const fixture of [
    genericMerge(future.tree, [x.oid], "future one-parent T fixture"),
    genericMerge(future.tree, [future.oid, x.oid], "future swapped T fixture"),
    genericMerge(future.tree, [x.oid, future.oid, C10_MERGE_SHA], "future octopus T fixture"),
    genericMerge(candidate.tree, [x.oid, future.oid], "future wrong-tree T fixture")
  ]) countC14Rejection(c14FutureMergeEvidence(fixture.oid, x.oid).errors.length > 0, "invalid future T topology accepted");

  const landedX = commitHeaders(C14_MERGE_SHA);
  assert.ok(landedX, "exact X is missing");
  assert.equal(landedX.tree, C14_MERGE_TREE);
  assert.deepEqual(landedX.parents, [C10_MERGE_SHA, C14_HEAD_SHA]);
  assert.equal(landedX.bytes.length, C14_MERGE_RAW_BYTES);
  assert.equal(sha256(landedX.bytes), C14_MERGE_RAW_SHA256);
  assert.deepEqual(c14MergeEvidence(C14_MERGE_SHA).errors, [], "landed exact X evidence drifted");

  const pr39MutableStatus = expectedC14FutureStatus(C14_MERGE_SHA);
  assert.equal(pr39MutableStatus.length, FAILED_REC_02_R2_STATUS_BYTES, "PR #39 STATUS byte length drifted");
  assert.equal(sha256(pr39MutableStatus), FAILED_REC_02_R2_STATUS_SHA256, "PR #39 STATUS SHA-256 drifted");
  assert.equal(gitObjectOid("blob", pr39MutableStatus), FAILED_REC_02_R2_STATUS_BLOB, "PR #39 STATUS blob drifted");
  const pr39MutableInputs = { ...immutableC14Inputs, [STATUS_PATH]: pr39MutableStatus };
  const pr39MutableTree = treeWithOverrides(C10_MERGE_SHA, Object.fromEntries(
    C14_CHANGED_PATHS.map(path => [path, pr39MutableInputs[path]])
  ));
  const pr39MutableHead = writeRawCommit(c14RawCommit(pr39MutableTree));
  assert.notEqual(pr39MutableHead, FAILED_REC_02_R2_HEAD, "PR #39 reproduction reused frozen r2 head");
  assert.notEqual(pr39MutableTree, FAILED_REC_02_R2_TREE, "PR #39 reproduction reused frozen r2 tree");
  const pr39MutableErrors = c14CandidateEvidence(pr39MutableHead).errors;
  assert.deepEqual(
    pr39MutableErrors,
    [`${STATUS_PATH}: C14 exact identity drifted`],
    `PR #39 mutable-source failure changed: ${pr39MutableErrors.join(" | ")}`
  );
  assert.equal(
    sha256(currentC14Inputs()[STATUS_PATH]),
    C14_STATUS_SHA256,
    "PR #39 reproduction poisoned immutable C14 source"
  );

  const r13 = r13Fixture();
  const r13Evidence = r13CandidateEvidence(r13.oid);
  assert.deepEqual(r13Evidence.errors, [], `r13 fixture failed: ${r13Evidence.errors.join(" | ")}`);
  const y = genericMerge(r13.tree, [C14_MERGE_SHA, r13.oid], "r13 protected successor fixture");
  assert.deepEqual(r13MergeEvidence(y.oid).errors, [], "r13 successor fixture failed");
  const futureR3 = r13FutureFixture(y.oid);
  const futureR3Evidence = r13FutureEvidence(futureR3.oid, y.oid);
  assert.deepEqual(futureR3Evidence.errors, [], `future r3 fixture failed: ${futureR3Evidence.errors.join(" | ")}`);
  const futureR3Status = fileIdentity(futureR3.oid, STATUS_PATH);
  assert.ok(futureR3Status && futureR3Status.sha256 !== R13_STATUS_SHA256, "future r3 STATUS did not differ from r13 STATUS");
  assert.equal(sha256(currentC14Inputs()[STATUS_PATH]), C14_STATUS_SHA256, "future r3 construction poisoned historical C14 STATUS");
  const u = genericMerge(futureR3.tree, [y.oid, futureR3.oid], "REC-02 r3 protected successor fixture");
  assert.deepEqual(r13FutureMergeEvidence(u.oid, y.oid).errors, [], "future r3 successor fixture failed");
  const protectedR13Inputs = currentR13Inputs(y.oid, r13EnvelopeAt(y.oid));
  assert.equal(sha256(protectedR13Inputs[STATUS_PATH]), R13_STATUS_SHA256, "exact r13 successor lost immutable STATUS");
  for (const [label, checkoutRef, envelopeRef] of [
    ["staged pre-freeze future r3", y.oid, futureR3.oid],
    ["direct future r3", futureR3.oid, futureR3.oid],
    ["future r3 successor", u.oid, u.oid]
  ]) {
    const transitionedEnvelope = r13EnvelopeAt(envelopeRef);
    assert.notEqual(
      sha256(transitionedEnvelope[STATUS_PATH]),
      R13_STATUS_SHA256,
      `${label} did not carry transitioned STATUS`
    );
    const futureCheckoutR13Inputs = currentR13Inputs(checkoutRef, transitionedEnvelope);
    assert.equal(
      sha256(futureCheckoutR13Inputs[STATUS_PATH]),
      R13_STATUS_SHA256,
      `${label} poisoned immutable r13 STATUS`
    );
    assert.notEqual(
      sha256(futureCheckoutR13Inputs[STATUS_PATH]),
      sha256(transitionedEnvelope[STATUS_PATH]),
      `${label} reused transitioned STATUS as the historical r13 fixture`
    );
    const replayedR13 = r13Fixture(futureCheckoutR13Inputs);
    assert.equal(replayedR13.oid, r13.oid, `${label} did not reconstruct the exact r13 fixture`);
    assert.equal(replayedR13.tree, r13.tree, `${label} changed the immutable r13 fixture tree`);
    assert.deepEqual(r13CandidateEvidence(replayedR13.oid).errors, [], `${label} rejected the exact r13 fixture`);
  }

  const r13Pr = prFacts({
    sha: y.oid,
    base: C14_MERGE_SHA,
    head: r13.oid,
    headRef: R13_POLICY_CORRECTION_BRANCH
  });
  const r13Push = pushFacts({ before: C14_MERGE_SHA, after: y.oid });
  const futurePr = prFacts({ sha: u.oid, base: y.oid, head: futureR3.oid, headRef: R13_FUTURE_BRANCH });
  const futurePush = pushFacts({ before: y.oid, after: u.oid });
  for (const [label, facts] of [
    ["r13 PR", r13Pr],
    ["r13 push", r13Push],
    ["future r3 PR", futurePr],
    ["future r3 push", futurePush]
  ]) {
    const result = evaluatePolicy(facts);
    assert.equal(result.passed, true, `${label} failed: ${result.errors.join(" | ")}`);
  }

  const structuredCases = [
    [r13Pr, facts => { facts.repository = "attacker/repository"; }, "repository"],
    [r13Pr, facts => { facts.checkedOutSha = C14_MERGE_SHA; }, "checked-out SHA"],
    [r13Pr, facts => { facts.refType = "tag"; }, "tag creation"],
    [r13Pr, facts => { facts.baseRef = "main"; }, "pull requests to main"],
    [r13Pr, facts => { facts.prHeadRepository = "fork/repository"; }, "pull-request head repository"],
    [r13Pr, facts => { facts.prBaseSha = C10_MERGE_SHA; }, "r13 pull-request base"],
    [r13Pr, facts => { facts.headRef = "ticket/unarmed"; }, "not an armed recovery route"],
    [r13Pr, facts => { facts.eventName = "workflow_dispatch"; }, "event workflow_dispatch"],
    [r13Push, facts => { facts.ref = "refs/heads/main"; }, "not an exact protected recovery-branch event"],
    [r13Push, facts => { facts.refName = "main"; }, "not an exact protected recovery-branch event"],
    [r13Push, facts => { facts.refType = "tag"; }, "tag creation"],
    [r13Push, facts => { facts.sha = r13.oid; }, "push event SHA differs"],
    [r13Push, facts => { facts.beforeSha = C10_MERGE_SHA; }, "push before SHA"],
    [futurePr, facts => { facts.prBaseSha = C14_MERGE_SHA; }, "r3 base"],
    [futurePush, facts => { facts.afterSha = futureR3.oid; facts.sha = futureR3.oid; }, "protected REC-02 r3 successor"]
  ];
  for (const [facts, mutate, needle] of structuredCases) {
    expectC14PolicyFailure(facts, mutate, needle);
    structuredRejected += 1;
  }
  countC14Rejection(
    evaluatePolicy(prFacts({ sha: y.oid, base: y.oid, head: r13.oid, headRef: R13_POLICY_CORRECTION_BRANCH })).passed === false,
    "replayed r13 pull request route accepted"
  );
  countC14Rejection(
    evaluatePolicy(pushFacts({ before: y.oid, after: y.oid })).passed === false,
    "replayed r13 protected successor accepted"
  );

  let zeroGitRejected = 0;
  assert.equal(ACTIVE_TERMINAL_IDENTITIES.length, 10, "active terminal identity count drifted");
  const terminalFacts = [
    ...FAILED_IDENTITIES.map(identity => prFacts({
      sha: identity.head,
      base: C14_MERGE_SHA,
      head: identity.head,
      headRef: R13_POLICY_CORRECTION_BRANCH
    })),
    ...[...TERMINAL_SUCCESSOR_OBJECTS.keys()].filter(oid => oid !== C14_HEAD_SHA).map(oid => prFacts({
      sha: oid,
      base: C14_MERGE_SHA,
      head: oid,
      headRef: R13_POLICY_CORRECTION_BRANCH
    })),
    ...TERMINAL_CORRECTION_BRANCHES.map(headRef => prFacts({
      sha: r13.oid,
      base: C14_MERGE_SHA,
      head: r13.oid,
      headRef
    }))
  ];
  for (const facts of terminalFacts) {
    const audit = withGitInvocationAudit(() => evaluatePolicy(facts));
    assert.equal(audit.result.passed, false, "terminal route unexpectedly passed");
    assert.equal(audit.calls.length, 0, "terminal route was rejected after repository Git");
    zeroGitRejected += 1;
  }
  assert.equal(zeroGitRejected, 41, "active r13 zero-Git terminal-route count drifted");
  let terminalSpellingRejected = 0;
  for (const oid of [FAILED_REC_02_R2_HEAD, FAILED_REC_02_R2_TREE, FAILED_REC_02_R2_SYNTHETIC_MERGE]) {
    for (const presented of [oid.toUpperCase(), ` ${oid} `]) {
      for (const facts of [
        prFacts({ sha: y.oid, base: C14_MERGE_SHA, head: presented, headRef: R13_POLICY_CORRECTION_BRANCH }),
        pushFacts({ before: presented, after: y.oid })
      ]) {
        const audit = withGitInvocationAudit(() => evaluatePolicy(facts));
        assert.equal(audit.result.passed, false, "terminal r2 spelling variant unexpectedly passed");
        assert.equal(audit.calls.length, 0, "terminal r2 spelling variant was rejected after repository Git");
        terminalSpellingRejected += 1;
      }
    }
  }
  assert.equal(terminalSpellingRejected, 12, "terminal r2 spelling rejection count drifted");
  const landedC14Audit = withGitInvocationAudit(() => evaluatePolicy(prFacts({
    sha: C14_HEAD_SHA,
    base: C14_MERGE_SHA,
    head: C14_HEAD_SHA,
    headRef: R13_POLICY_CORRECTION_BRANCH
  })));
  assert.equal(landedC14Audit.result.passed, false, "landed C14 head was reusable");
  assert.equal(landedC14Audit.calls.length, 0, "landed C14 head was rejected after repository Git");
  assert.equal(structuredRejected, 54, "historical C14 plus active r13 structured adversarial count drifted");
  assert.equal(environmentReceipt.positiveCases, 2, "focused environment positive count drifted");
  assert.equal(environmentReceipt.negativeCases, 41, "focused environment negative count drifted");
  assert.equal(environmentReceipt.zeroGitRejections, 41, "focused environment zero-Git count drifted");

  const r13StoreRoot = realpathSync(mkdtempSync(join(tmpdir(), "sunsplitter-r13-store-unit-")));
  const r13TransferRoot = realpathSync(mkdtempSync(join(tmpdir(), "sunsplitter-r13-object-transfer-")));
  try {
    runGit(["init", "--quiet"], { cwd: r13StoreRoot });
    const reachableOids = gitText([
      "rev-list", "--objects", "--no-object-names", r13.oid
    ]).split("\n").filter(Boolean);
    assert.equal(new Set(reachableOids).size, reachableOids.length, "r13 store reachable inventory contains duplicates");
    for (const oid of reachableOids) {
      const type = gitText(["cat-file", "-t", oid]);
      assert.match(type, /^(?:blob|commit|tree)$/, `r13 store object ${oid} has unsupported type ${type}`);
      const transferPath = join(r13TransferRoot, oid);
      writeFileSync(transferPath, gitBytes(["cat-file", type, oid]), { flag: "wx", mode: 0o600 });
      const copied = gitText(["hash-object", "-t", type, "-w", "--no-filters", "--", transferPath], { cwd: r13StoreRoot });
      unlinkSync(transferPath);
      assert.equal(copied, oid, `r13 store object ${oid} changed while copying`);
    }
    runGit(["update-ref", "--no-deref", "HEAD", r13.oid], { cwd: r13StoreRoot });
    const receipt = candidateOnlyObjectStoreReceipt({
      repoRoot: r13StoreRoot,
      environment: { ...REQUIRED_REPOSITORY_GIT_ENVIRONMENT }
    });
    assert.equal(receipt.absent, 128);
    assert.equal(receipt.controlsPresent, 15);
    assert.equal(receipt.head, r13.oid);
    assert.equal(receipt.inventorySha256, R13_CANDIDATE_INVENTORY_SHA256);
    assert.equal(receipt.result, "PASS");
    assert.equal(receipt.route, "r13");
    assert.equal(receipt.schemaVersion, 4);
  } finally {
    rmSync(r13StoreRoot, { recursive: true, force: true });
    rmSync(r13TransferRoot, { recursive: true, force: true });
  }

  console.log(
    `PASS release-policy self-test — ${zeroGitRejected} zero-Git terminal-route rejections; `
    + `${terminalSpellingRejected} terminal-spelling rejections; ${structuredRejected} structured adversarial rejections; `
    + `${environmentReceipt.negativeCases} environment negatives; `
    + `immutable Gate A/C9/C10/S/C14/X, one self-consuming r13 route, and one self-consuming REC-02 r3 route accepted; NO-PUBLISH remains active`
  );
  console.log(`FIXTURE gate-a-head=${gateA.oid} tree=${gateA.tree}`);
  console.log(`FIXTURE c9-head=${c9.oid} tree=${c9.tree}`);
  console.log(`FIXTURE c14-head=${candidate.oid} tree=${candidate.tree} x=${C14_MERGE_SHA}`);
  console.log(`FIXTURE r13-head=${r13.oid} tree=${r13.tree} y=${y.oid}`);
  console.log(`FIXTURE future-r3-head=${futureR3.oid} tree=${futureR3.tree} u=${u.oid}`);
  console.log(`INVENTORY historical-c14=${candidateInventory.objects.length}/${C14_CANDIDATE_INVENTORY_SHA256} historical-future=${futureInventory.objects.length}/${C14_FUTURE_INVENTORY_SHA256}`);
  console.log(`INVENTORY r13=${r13CandidateInventory.objects.length}/${R13_CANDIDATE_INVENTORY_SHA256} future-r3=${r13FutureInventory.objects.length}/${R13_FUTURE_INVENTORY_SHA256}`);
}

function taskForRoute(route) {
  if (route?.startsWith("rec-ratchet-02-r13")) return "REC-RATCHET-02-R13";
  if (route?.startsWith("rec-02-r3")) return "REC-02-R3/#24";
  if (route?.startsWith("rec-ratchet-02-c14")) return "REC-RATCHET-02-C14-R12";
  if (route?.startsWith("rec-ratchet-02")) return "REC-RATCHET-02/#24";
  if (route?.startsWith("rec-02")) return "REC-02/#24";
  return "GOVERNED-RECOVERY";
}

function writeSummary(facts, result) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const source = (facts.sha || "unknown").slice(0, 7);
  const lines = [
    "## Governed recovery release policy",
    "",
    `- Exact tested SHA: \`${facts.sha || "missing"}\``,
    `- PR head SHA: \`${facts.prHeadSha || "n/a"}\``,
    `- PR base SHA: \`${facts.prBaseSha || facts.beforeSha || "n/a"}\``,
    `- Result: **${result.passed ? "PASS" : "FAIL"}**`,
    `- Source declaration: \`SOURCE ${source} · RUNTIME ${source} · TASK ${taskForRoute(result.route)} · MODE verification\``,
    "",
    ...result.notices.map(notice => `- ${notice}`)
  ];
  if (result.errors.length) lines.push("", "### Failures", "", ...result.errors.map(error => `- ${error}`));
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}

function legacyMain() {
  if (process.argv.length === 3 && process.argv[2] === "--forbidden-object-inventory") {
    process.stdout.write(canonicalJsonBytes(forbiddenObjectInventory()));
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--check-candidate-only-object-store") {
    process.stdout.write(canonicalJsonBytes(candidateOnlyObjectStoreReceipt()));
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    selfTest();
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--projection") {
    console.log(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))));
    return;
  }
  if (process.argv.length !== 2) {
    throw new Error("Usage: node scripts/release-policy.mjs [--forbidden-object-inventory|--check-candidate-only-object-store|--self-test|--projection]");
  }
  const facts = environmentFromProcess();
  const result = evaluatePolicy(facts);
  const shortSha = (facts.sha || "unknown").slice(0, 7);
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK ${taskForRoute(result.route)} · MODE verification`);
  console.log(`exact tested SHA: ${facts.sha || "missing"}`);
  if (facts.prHeadSha) console.log(`pull-request head SHA: ${facts.prHeadSha}`);
  if (facts.prBaseSha) console.log(`pull-request base SHA: ${facts.prBaseSha}`);
  result.notices.forEach(notice => console.log(`NOTICE ${notice}`));
  writeSummary(facts, result);
  if (!result.passed) {
    result.errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
  } else {
    console.log("PASS governed recovery release policy; NO-PUBLISH / NOT CERTIFIED remains active");
  }
}

function main() {
  // This is the first trust decision for every CLI mode. It is deliberately
  // before environment-derived facts and before every repository Git read.
  assertSafeGitEnvironment(process.env);
  if (process.argv.length === 3 && process.argv[2] === "--github-actions-git-environment-fixture") {
    process.stdout.write(canonicalJsonBytes(githubActionsGitEnvironmentFixture()));
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--forbidden-object-inventory") {
    process.stdout.write(canonicalJsonBytes(r13ForbiddenObjectInventories()));
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--check-candidate-only-object-store") {
    process.stdout.write(canonicalJsonBytes(candidateOnlyObjectStoreReceipt()));
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--self-test") {
    selfTest();
    return;
  }
  if (process.argv.length === 3 && process.argv[2] === "--projection") {
    console.log(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))));
    return;
  }
  if (process.argv.length !== 2) {
    throw new Error(
      "Usage: node scripts/release-policy.mjs [--github-actions-git-environment-fixture|--forbidden-object-inventory|--check-candidate-only-object-store|--self-test|--projection]"
    );
  }
  const facts = environmentFromProcess();
  const result = evaluatePolicy(facts);
  const shortSha = (facts.sha || "unknown").slice(0, 7);
  console.log(`SOURCE ${shortSha} · RUNTIME ${shortSha} · TASK ${taskForRoute(result.route)} · MODE verification`);
  console.log(`exact tested SHA: ${facts.sha || "missing"}`);
  if (facts.prHeadSha) console.log(`pull-request head SHA: ${facts.prHeadSha}`);
  if (facts.prBaseSha) console.log(`pull-request base SHA: ${facts.prBaseSha}`);
  result.notices.forEach(notice => console.log(`NOTICE ${notice}`));
  writeSummary(facts, result);
  if (!result.passed) {
    result.errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
  } else {
    console.log("PASS governed recovery release policy; NO-PUBLISH / NOT CERTIFIED remains active");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL release-policy crash: ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
