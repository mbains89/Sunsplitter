#!/usr/bin/env node

// REC-RATCHET-02 policy self-test correction R7 / C9
//
// Immutable Gate A evidence, one exact C9 correction route, one structurally
// exact protected correction merge, one exact REC-02 r2 activation route, and
// one structurally exact closure merge. Each route consumes itself. The policy
// never publishes, deploys, tags, releases, certifies, changes rulesets, or
// supplies credentials.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
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
const POLICY_CORRECTION_BRANCH = "ticket/0.30.1-rec-ratchet-02-policy-selftest-correction-r7";
const FUTURE_BRANCH = "ticket/0.30.1-rec-02-r2";
const AUTHORIZED_PATCH_TARGET_BRANCH = "ticket/0.30.1-rec-02-r1";
const RECOVERY_BASE_SHA = "e4f84409759760d31fcf47b8a227802a61421f51";
const GATE_A_BASE_SHA = "23951012655b0037a55e82c755b66dd4d852f20b";
const GATE_A_BASE_TREE = "96829ad0e01619f56bed2121a666645b3f9b5259";
const GATE_A_HEAD_SHA = "f23c4bed1555c7ad6bcb3b42ca5c6ea3a92e37ab";
const GATE_A_HEAD_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
const GATE_A_HEAD_RAW_SHA256 = "4835344d32a516c8d68df1c8d18f51313297f04c7de2ac5ce4628c356fb36376";
const GATE_A_MERGE_SHA = "31aca17b807c4dc8edef3683e30d5fefdd47ad7a";
const GATE_A_MERGE_TREE = "f458b021bc9a9a36cb28c24fd7dee165c2bbaac5";
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
const POLICY_CORRECTION_COMMIT_TITLE = "REC-RATCHET-02: retire C8 with receipt-safe verifier handoff";
const FUTURE_COMMIT_TITLE = "REC-02: apply authorized zero-exit projection";
const GATE_A_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787443200 -0500";
const POLICY_CORRECTION_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787792400 -0500";
const FUTURE_AUTHOR = "Sunsplitter Recovery Build <noreply@openai.com> 1787878800 -0500";

const GATE_A_POLICY_PROJECTION_SHA256 = "02bd44d53b1160a992071de4add1774cd9062f0a1949b9b9985adb301387e4a5";
const POLICY_PROJECTION_SHA256 = "6e44343fc7f892494c4477991b2a11e0f150215ae2a9bf955508a225a3014f27";
const TRANSITION_SHA256 = "a01180e9d5f917e47eafb9b65eea3c1c045e325b7b97690cfd8bfbef0110ba2a";

const VERIFY_WORKFLOW_SHA256 = "7f0047c7de5dd862083fbbd6c7cc56d018700a536f88e2c0904a7de922184cbd";
const RELEASE_WORKFLOW_SHA256 = "2d0c146aaae977c61cbfa7c96642f99759dfacefb142f053e6d1187c0395dd33";
const GATE_A_STATUS_SHA256 = "e84a750b32350c0a6cfecfd60c4b1a9b6e44a22f57ed5fdeb9c5afa941d56d33";
const INACTIVE_BASELINE_SHA256 = "048ee211f4708252b8609d475b47d3b6c05e85bd1d8bd1ae9c44f9229b659c20";
const PATCH_ARTIFACT_SHA256 = "b9d97f57ef5ab755db2509789ebee2dda129460f7ce6a7934a71e7ebc5b04eb3";
const POLICY_CORRECTION_STATUS_SHA256 = "de79c8c97ff7ae05480f2413e0dd31380ec2f320c2e29cb532ffdfbd2b7f7dee";
const POLICY_CORRECTION_STATUS_BLOB = "5868e2274a5b50758427b5eaf6ef15a1a06921fa";
const POLICY_CORRECTION_STATUS_BYTES = 18976;
const POLICY_CORRECTION_RECORD_SHA256 = "ff08839196539a7f84a88e2c275c9e82dd9e491d01a25903350bbb5d64daf75f";
const POLICY_CORRECTION_RECORD_BLOB = "0e1586df61b2af7de466b8adc8b1f2362adf47d7";
const POLICY_CORRECTION_RECORD_BYTES = 28306;
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

const ART_R2_SEALED_MANIFEST_BYTES = 10863;
const ART_R2_SEALED_MANIFEST_SHA256 = "a3bb3dc47bf7302de03d8b057637ecdbcd852b1e2e7d2034b098a3e55358a073";
const FORBIDDEN_DERIVED_OBJECTS = Object.freeze([
  FUNCTIONAL_TREE,
  ART_R2_COMBINED_TREE,
  REC_02_VERIFY_BLOB,
  ART_R2_COMBINED_VERIFY_BLOB
]);
const FORBIDDEN_OBJECT_INVENTORY_SHA256 = "d6361bf849be1e2721c1871d84c1f8f569348edc401e08650ca6550bcc5d62d8";

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

const PROJECTION_CONSTANT_NAMES = Object.freeze([
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

function runGit(args, { input, env, allowFailure = false, cwd = ROOT } = {}) {
  gitInvocationObserver?.({ args: [...args], cwd });
  const result = spawnSync("git", args, {
    cwd,
    env: env ? { ...process.env, ...env } : process.env,
    input,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024
  });
  if (!allowFailure && result.status !== 0) {
    const detail = Buffer.concat([
      Buffer.from(result.stdout || ""),
      Buffer.from(result.stderr || "")
    ]).toString("utf8").trim();
    throw new Error(`git ${args.join(" ")} failed (${result.status}): ${detail}`);
  }
  return result;
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

function fileIdentity(ref, path) {
  const result = runGit(["ls-tree", "-z", ref, "--", path], { allowFailure: true });
  if (result.status !== 0) return null;
  const raw = Buffer.from(result.stdout);
  const match = raw.toString("utf8").match(/^(\d{6}) blob ([0-9a-f]{40})\t([^\0]+)\0$/);
  if (!match || match[3] !== path) return null;
  const bytesResult = runGit(["cat-file", "blob", match[2]], { allowFailure: true });
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

function canonicalRecords(ref, paths) {
  return paths.map(path => fileIdentity(ref, path));
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
  for (const name of PROJECTION_CONSTANT_NAMES) {
    const pattern = new RegExp(`(const ${name} = \")[0-9a-f]{64}(\";)`, "g");
    const matches = [...text.matchAll(pattern)];
    if (matches.length !== 1) throw new Error(`${name} must occur exactly once`);
    text = text.replace(pattern, `$1${"0".repeat(64)}$2`);
  }
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

function stagedIdentity(indexPath, path) {
  const env = { GIT_INDEX_FILE: indexPath };
  const row = gitText(["ls-files", "-s", "--", path], { env });
  const match = row.match(/^(\d{6}) ([0-9a-f]{40}) 0\t(.+)$/);
  if (!match || match[3] !== path) return null;
  const bytes = gitBytes(["cat-file", "blob", match[2]]);
  return { mode: match[1], blob: match[2], sha256: sha256(bytes), byteLength: bytes.length };
}

function updateIndexBytes(indexPath, path, bytes, mode = "100644") {
  const blob = gitText(["hash-object", "-w", "--stdin"], { input: bytes });
  runGit(["update-index", "--add", "--cacheinfo", `${mode},${blob},${path}`], {
    env: { GIT_INDEX_FILE: indexPath }
  });
  return blob;
}

const projectionCache = new Map();

function validateProjectionArtifacts(ref) {
  const errors = [];
  const baselineIdentity = fileIdentity(ref, INACTIVE_BASELINE_PATH);
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  if (!baselineIdentity || !patchIdentity) {
    if (!baselineIdentity) errors.push("inactive REC-02 baseline is missing");
    if (!patchIdentity) errors.push("authorized REC-02 patch artifact is missing");
    return { errors };
  }
  const cacheKey = `${baselineIdentity.blob}:${patchIdentity.blob}`;
  if (projectionCache.has(cacheKey)) return structuredClone(projectionCache.get(cacheKey));

  if (baselineIdentity.sha256 !== INACTIVE_BASELINE_SHA256) errors.push("inactive REC-02 baseline bytes drifted");
  if (patchIdentity.sha256 !== PATCH_ARTIFACT_SHA256) errors.push("authorized REC-02 patch artifact bytes drifted");
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
    if (artifact.authority?.targetBranch !== AUTHORIZED_PATCH_TARGET_BRANCH) errors.push("patch artifact target branch drifted");
    const governed = [
      "cut_out", "vent", "past_leak", "vault_voice", "arc_future_1",
      "act3_reckoning_heading", "pregnancy_check", "custody_possession", "custody_thaw"
    ];
    if (!sameList(artifact.authority?.governedScenes || [], governed)) errors.push("patch artifact governed-scene inventory drifted");
    const patchBytes = Buffer.from(artifact.patch?.unifiedDiff || "", "utf8");
    if (patchBytes.length !== artifact.patch?.byteLength || sha256(patchBytes) !== EMBEDDED_PATCH_SHA256
      || artifact.patch?.sha256 !== EMBEDDED_PATCH_SHA256) {
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
      const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-projection-"));
      const indexPath = join(parent, "index");
      const env = { GIT_INDEX_FILE: indexPath };
      runGit(["read-tree", GATE_A_BASE_SHA], { env });
      const applied = runGit(["apply", "--cached", "--whitespace=error-all", "--verbose", "-"], {
        env,
        input: patchBytes,
        allowFailure: true
      });
      const transcript = Buffer.concat([
        Buffer.from(applied.stdout || ""), Buffer.from(applied.stderr || "")
      ]).toString("utf8");
      if (applied.status !== 0) errors.push(`strict patch reconstruction failed: ${transcript.trim()}`);
      if (/\b(?:offset|fuzz)\b/i.test(transcript)) errors.push("strict patch reconstruction reported offset or fuzz");
      if (applied.status === 0) {
        for (const row of artifact.files || []) {
          const staged = stagedIdentity(indexPath, row.path);
          if (!staged || staged.mode !== row.output?.mode || staged.blob !== row.output?.blob
            || staged.sha256 !== row.output?.sha256 || staged.byteLength !== row.output?.byteLength) {
            errors.push(`${row.path}: reconstructed output identity drifted`);
          }
        }
        updateIndexBytes(indexPath, ACTIVE_BASELINE_PATH, baselineIdentity.bytes, baselineIdentity.mode);
        const tree = gitText(["write-tree"], { env });
        if (tree !== FUNCTIONAL_TREE || tree !== artifact.functionalProjection?.tree) {
          errors.push(`functional projection tree ${tree || "missing"} != ${FUNCTIONAL_TREE}`);
        }
        const manifestRows = [
          { path: ACTIVE_BASELINE_PATH, ...stagedIdentity(indexPath, ACTIVE_BASELINE_PATH) },
          ...(artifact.files || []).map(row => ({ path: row.path, ...stagedIdentity(indexPath, row.path) }))
        ].sort((left, right) => left.path.localeCompare(right.path));
        const manifest = manifestRows.map(row => `${row.mode} ${row.blob} ${row.sha256}\t${row.path}\n`).join("");
        if (sha256(Buffer.from(manifest)) !== FUNCTIONAL_MANIFEST_SHA256
          || artifact.functionalProjection?.canonicalManifestSha256 !== FUNCTIONAL_MANIFEST_SHA256
          || artifact.functionalProjection?.canonicalManifest !== manifest) {
          errors.push("functional projection canonical manifest drifted");
        }
        functional = { tree, transcript, manifest, records: manifestRows };
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

export function forbiddenObjectInventory(source = ART_R2_SEALED_MANIFEST) {
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

function assertForbiddenObjectInventoryIdentity(actual) {
  if (actual !== FORBIDDEN_OBJECT_INVENTORY_SHA256) {
    throw new Error(`forbidden-object inventory ${actual} != ${FORBIDDEN_OBJECT_INVENTORY_SHA256}`);
  }
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

export function candidateOnlyObjectStoreReceipt({ repoRoot = ROOT, environment = process.env } = {}) {
  const gitEnvironmentNames = [...new Set([
    ...Object.keys(process.env),
    ...Object.keys(environment)
  ])].filter(name => name.startsWith("GIT_")).sort();
  const safeGitEnvironment = new Map([["GIT_PAGER", "cat"]]);
  const unsafeEnvironment = gitEnvironmentNames.filter(name => {
    const allowed = safeGitEnvironment.get(name);
    if (allowed === undefined) return true;
    return [process.env[name], environment[name]]
      .filter(value => value !== undefined)
      .some(value => value !== allowed);
  });
  if (unsafeEnvironment.length) throw new Error(`candidate-only checkout has unsafe Git environment: ${unsafeEnvironment.join(", ")}`);

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
  if (!sameList(head.parents, [GATE_A_MERGE_SHA])) throw new Error("candidate-only HEAD is not a direct child of the protected base");
  if (!sameList(changedPaths(GATE_A_MERGE_SHA, head.oid, requestedRoot), POLICY_CORRECTION_CHANGED_PATHS)) {
    throw new Error("candidate-only HEAD does not have the exact three-path scope");
  }

  const controls = [
    [RECOVERY_BASE_SHA, "commit"],
    [GATE_A_BASE_SHA, "commit"],
    [GATE_A_BASE_TREE, "tree"],
    [GATE_A_HEAD_SHA, "commit"],
    [GATE_A_MERGE_SHA, "commit"],
    [GATE_A_MERGE_TREE, "tree"]
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

function validateArtCompatibility(ref) {
  const patchIdentity = fileIdentity(ref, PATCH_ARTIFACT_PATH);
  const cacheKey = patchIdentity?.blob || "missing";
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

  const projection = validateProjectionArtifacts(ref);
  let recVerify = null;
  if (projection.errors.length) {
    errors.push(...projection.errors.map(error => `ART functional projection: ${error}`));
  } else if (projection.functional?.tree) {
    recVerify = fileIdentity(projection.functional.tree, "scripts/verify.mjs");
  }
  if (!recVerify || recVerify.blob !== REC_02_VERIFY_BLOB || recVerify.sha256 !== REC_02_VERIFY_SHA256) {
    errors.push("REC-02 verifier output identity drifted before ART transform");
  }
  try {
    if (recVerify) combinedVerify = Buffer.from(applyArtVerifierTransform(recVerify.bytes.toString("utf8")), "utf8");
  } catch (error) {
    errors.push(`combined ART verifier reconstruction failed closed: ${error.message}`);
  }
  if (!combinedVerify || gitObjectOid("blob", combinedVerify) !== ART_R2_COMBINED_VERIFY_BLOB
    || sha256(combinedVerify) !== ART_R2_COMBINED_VERIFY_SHA256) {
    errors.push("combined REC-02 + ART-R2 verifier identity drifted");
  }

  let combinedTree = null;
  let combinedManifest = null;
  if (projection.functional?.tree && combinedVerify && baseRecords.length && sealedRecords.length) {
    try {
      const functionalRecords = flatTreeRecords(projection.functional.tree);
      const combinedRecord = {
        mode: "100644",
        blob: ART_R2_COMBINED_VERIFY_BLOB,
        sha256: ART_R2_COMBINED_VERIFY_SHA256,
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
      if (combinedTree !== ART_R2_COMBINED_TREE) errors.push(`combined ART projection tree ${combinedTree} != ${ART_R2_COMBINED_TREE}`);
      if (combinedManifest !== ART_R2_COMBINED_MANIFEST_SHA256) errors.push("combined ART projection manifest drifted");
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

function workflowSecurityErrors(ref) {
  const errors = [];
  const listing = gitText(["ls-tree", "-r", "--name-only", ref, "--", ".github/workflows"]);
  const names = listing ? listing.split(/\r?\n/).filter(Boolean).sort() : [];
  const expectedNames = [RELEASE_WORKFLOW_PATH, VERIFY_WORKFLOW_PATH].sort();
  if (!sameList(names, expectedNames)) errors.push(`workflow allowlist mismatch: ${names.join(", ") || "<none>"}`);
  const expectedHashes = {
    [RELEASE_WORKFLOW_PATH]: RELEASE_WORKFLOW_SHA256,
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
  if (!status || status.blob !== POLICY_CORRECTION_STATUS_BLOB
    || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES) {
    errors.push(`${STATUS_PATH}: policy correction identity drifted`);
  }
  const record = fileIdentity(commit.oid, POLICY_CORRECTION_RECORD_PATH);
  if (!record || record.blob !== POLICY_CORRECTION_RECORD_BLOB
    || record.sha256 !== POLICY_CORRECTION_RECORD_SHA256
    || record.byteLength !== POLICY_CORRECTION_RECORD_BYTES) {
    errors.push(`${POLICY_CORRECTION_RECORD_PATH}: policy correction identity drifted`);
  }
  const projection = policyProjection(commit.oid);
  if (projection !== POLICY_PROJECTION_SHA256) {
    errors.push(`active policy projection ${projection || "missing"} != ${POLICY_PROJECTION_SHA256}`);
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
    expectedRaw = canonicalRawCommit(
      commit.tree,
      GATE_A_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
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
    return { errors: ["protected policy correction successor is not an exact two-parent merge from the Gate A successor"] };
  }
  return mergeEvidence(merge.oid, GATE_A_MERGE_SHA, policyCorrectionEvidence(merge.parents[1]));
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
  const correctionBase = policyCorrectionMergeEvidence(protectedMerge);
  if (correctionBase.errors.length) {
    throw new Error(`future STATUS base is not an exact policy-correction successor: ${correctionBase.errors.join(" | ")}`);
  }
  const status = fileIdentity(protectedMerge, STATUS_PATH);
  if (!status
    || status.blob !== POLICY_CORRECTION_STATUS_BLOB
    || status.sha256 !== POLICY_CORRECTION_STATUS_SHA256
    || status.byteLength !== POLICY_CORRECTION_STATUS_BYTES) {
    throw new Error("future STATUS source is not the exact C9 policy-correction STATUS");
  }
  let text = status.bytes.toString("utf8");
  text = replaceUniqueStatusField(text, "updated_utc", "2026-08-24");
  text = replaceUniqueStatusField(text, "tested_runtime_sha", `${protectedMerge} — exact protected policy-correction successor; recovery evidence, not certification`);
  text = replaceUniqueStatusField(text, "governed_recovery_successor_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "milestone", "REC-02-R2 — exact inactive projection activation from the landed policy-correction successor");
  text = replaceUniqueStatusField(text, "ticket", "REC-02 / issue #24 — governed zero-exit implementation r2");
  text = replaceUniqueStatusField(text, "state", `REC-02 R2 CANDIDATE — exact protected policy-correction successor ${protectedMerge}; NO-PUBLISH / NOT CERTIFIED`);
  text = replaceUniqueStatusField(text, "implementation_branch", FUTURE_BRANCH);
  text = replaceUniqueStatusField(text, "dispatch_base_sha", protectedMerge);
  text = replaceUniqueStatusField(text, "dispatch_base_tree", merge.tree);
  text = replaceUniqueStatusField(
    text,
    "c9_candidate_identity",
    `LANDED PRECURSOR — protected successor ${protectedMerge}; correction head ${merge.parents[1]}; tree ${merge.tree}; ordered parents [${merge.parents.join(",")}]`
  );
  text = replaceUniqueStatusField(text, "c9_receipt_capture_preflight", "COMPLETE / CONSUMED — exact C9 first-result receipts were durably stored before hashing or formatting");
  text = replaceUniqueStatusField(text, "c9_external_launcher_preflight", "COMPLETE / CONSUMED — exact C9 clone-local launcher and negative controls passed before identity freeze");
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
    "`policy_correction_scope: LANDED PRECURSOR — exact three-path C9 envelope retained as immutable evidence`\n`rec_02_scope: exactly artifacts/PROJECT_STATUS.md; scripts/fixtures/pipe-boot-r1-simulation-baseline.json; scripts/verify.mjs; src/scenes-02.js; src/scenes-04.js; src/scenes-05.js; src/scenes-06.js; src/scenes-13.js; src/scenes-36.js; src/scenes-55.js`",
    "future STATUS REC-02 scope"
  );
  text = replaceOnce(
    text,
    "- C9 has no authority or design blocker before identity freeze. Any required failure after freeze permanently retires that exact identity and requires a fresh successor.",
    `- C9 landed at exact protected policy-correction successor \`${protectedMerge}\`; that protected-merge authorization is consumed.`,
    "future STATUS C9 blocker"
  );
  text = replaceOnce(
    text,
    "- REC-02 remains blocked until a passing C9 successor lands and issue #24 is repinned to it.",
    `- REC-02 r2 is an exact candidate from \`${protectedMerge}\` after the required issue #24 repin. Its protected merge remains unauthorized pending exact-head checks, attributable CI, independent PASS, fresh ruleset/bypass/ref readback, and separate owner authorization.`,
    "future STATUS REC-02 blocker"
  );
  text = replaceOnce(
    text,
    "**Build / GPT-Codex:** complete the remaining independent C9/r7 policy and documentation audits, bind the exact document identities and active projection, then freeze one exact identity and run its required clean-clone, policy, verifier, simulation, and exact-scope gates once. Only after complete PASS may that exact r7 identity be pushed once and opened as one draft PR. `NO-PUBLISH / NOT CERTIFIED` remains active.",
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
  const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-future-"));
  const indexPath = join(parent, "index");
  const env = { GIT_INDEX_FILE: indexPath };
  runGit(["read-tree", protectedMerge], { env });
  const applied = runGit(["apply", "--cached", "--whitespace=error-all", "--verbose", "-"], {
    env,
    input: Buffer.from(artifact.patch.unifiedDiff, "utf8"),
    allowFailure: true
  });
  const transcript = Buffer.concat([Buffer.from(applied.stdout || ""), Buffer.from(applied.stderr || "")]).toString("utf8");
  if (applied.status !== 0 || /\b(?:offset|fuzz)\b/i.test(transcript)) throw new Error(`future strict patch application failed: ${transcript.trim()}`);
  updateIndexBytes(indexPath, ACTIVE_BASELINE_PATH, baselineIdentity.bytes);
  updateIndexBytes(indexPath, STATUS_PATH, expectedFutureStatus(protectedMerge));
  const tree = gitText(["write-tree"], { env });
  const result = { tree, transcript, status: expectedFutureStatus(protectedMerge) };
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

  const baseEvidence = policyCorrectionMergeEvidence(protectedMerge);
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

export function evaluatePolicy(facts) {
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
    } else if (facts.headRef === POLICY_CORRECTION_BRANCH) {
      route = "rec-ratchet-02-policy-correction";
      if (facts.prBaseSha !== GATE_A_MERGE_SHA) {
        errors.push(`policy-correction pull-request base ${facts.prBaseSha || "<missing>"} != ${GATE_A_MERGE_SHA}`);
      }
      evidence = policyCorrectionEvidence(facts.prHeadSha);
      const merge = mergeEvidence(facts.sha, GATE_A_MERGE_SHA, evidence);
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
    if (facts.beforeSha === GATE_A_MERGE_SHA) {
      route = "rec-ratchet-02-policy-correction-merge";
      evidence = policyCorrectionMergeEvidence(facts.afterSha);
      errors.push(...evidence.errors);
    } else {
      const base = policyCorrectionMergeEvidence(facts.beforeSha);
      if (base.errors.length === 0) {
        route = "rec-02-merge";
        evidence = futureMergeEvidence(facts.afterSha, facts.beforeSha);
        errors.push(...evidence.errors);
      } else {
        errors.push("push before SHA is not the one unconsumed exact policy-correction successor");
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
  if (!failedIdentityByHead(presentedCandidateHead(facts))) {
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

function treeWithOverrides(baseRef, overrides) {
  const parent = mkdtempSync(join(tmpdir(), "sunsplitter-policy-tree-"));
  const indexPath = join(parent, "index");
  const env = { GIT_INDEX_FILE: indexPath };
  runGit(["read-tree", baseRef], { env });
  for (const [path, value] of Object.entries(overrides)) {
    if (value === null) {
      runGit(["update-index", "--force-remove", "--", path], { env });
      continue;
    }
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value.bytes);
    updateIndexBytes(indexPath, path, bytes, value.mode || "100644");
  }
  return gitText(["write-tree"], { env });
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

function policyCorrectionFixture() {
  const overrides = Object.fromEntries(
    POLICY_CORRECTION_CHANGED_PATHS.map(path => [path, readFileSync(resolve(ROOT, path))])
  );
  const tree = treeWithOverrides(GATE_A_MERGE_SHA, overrides);
  const records = canonicalRecords(tree, POLICY_CORRECTION_CHANGED_PATHS);
  assert.ok(records.every(Boolean));
  const raw = canonicalRawCommit(
    tree,
    GATE_A_MERGE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    records
  );
  const oid = writeRawCommit(raw);
  return { oid, tree, raw, records };
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

function selfTest() {
  assert.ok(FULL_SHA256_RE.test(POLICY_PROJECTION_SHA256) && !/^0+$/.test(POLICY_PROJECTION_SHA256));
  assert.ok(FULL_SHA256_RE.test(TRANSITION_SHA256) && !/^0+$/.test(TRANSITION_SHA256));
  assert.equal(sha256(normalizedPolicyBytes(readFileSync(resolve(ROOT, POLICY_PATH)))), POLICY_PROJECTION_SHA256);
  assert.deepEqual(GATE_A_CHANGED_PATHS, [
    VERIFY_WORKFLOW_PATH, STATUS_PATH, INACTIVE_BASELINE_PATH, PATCH_ARTIFACT_PATH, TRANSITION_PATH, POLICY_PATH
  ].sort());
  assert.deepEqual(POLICY_CORRECTION_CHANGED_PATHS, [STATUS_PATH, POLICY_CORRECTION_RECORD_PATH, POLICY_PATH].sort());
  assert.equal(FUTURE_CHANGED_PATHS.length, 10);

  const inventoryAudit = withGitInvocationAudit(() => forbiddenObjectInventory());
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
  assert.throws(() => forbiddenObjectInventory(`${ART_R2_SEALED_MANIFEST}\n`), /byte length drifted/);
  assert.throws(
    () => forbiddenObjectInventory(ART_R2_SEALED_MANIFEST.replace("100644", "100755")),
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

  const correction = policyCorrectionFixture();
  const correctionEvidenceResult = policyCorrectionEvidence(correction.oid);
  assert.deepEqual(correctionEvidenceResult.errors, []);
  const correctionSynthetic = genericMerge(
    correction.tree,
    [GATE_A_MERGE_SHA, correction.oid],
    "Synthetic policy correction merge fixture"
  );
  const correctionPr = prFacts({
    sha: correctionSynthetic.oid,
    base: GATE_A_MERGE_SHA,
    head: correction.oid,
    headRef: POLICY_CORRECTION_BRANCH
  });
  const correctionPush = pushFacts({ before: GATE_A_MERGE_SHA, after: correctionSynthetic.oid });
  assert.deepEqual(evaluatePolicy(correctionPr).errors, []);
  assert.deepEqual(evaluatePolicy(correctionPush).errors, []);
  expectPolicyFailure(correctionPr, facts => { facts.repository = "attacker/Sunsplitter"; }, "repository attacker/Sunsplitter");
  expectPolicyFailure(correctionPr, facts => { facts.baseRef = "main"; }, "pull requests to main");
  expectPolicyFailure(correctionPr, facts => { facts.headRef = "ticket/unarmed"; }, "not an armed recovery route");
  expectPolicyFailure(correctionPr, facts => { facts.prHeadRepository = "fork/Sunsplitter"; }, "pull-request head repository");
  expectPolicyFailure(correctionPr, facts => { facts.checkedOutSha = correction.oid; }, "checked-out SHA");
  expectPolicyFailure(correctionPr, facts => { facts.ref = "refs/tags/sun-v0.30.1"; facts.refType = "tag"; }, "tag creation");
  expectPolicyFailure(correctionPr, facts => { facts.prBaseSha = GATE_A_BASE_SHA; }, "policy-correction pull-request base");
  const consumedGateAPr = prFacts({
    sha: genericMerge(gateA.tree, [GATE_A_BASE_SHA, gateA.oid], "consumed historical Gate A PR fixture").oid,
    base: GATE_A_BASE_SHA,
    head: gateA.oid,
    headRef: GATE_A_BRANCH
  });
  assert.ok(evaluatePolicy(consumedGateAPr).errors.some(error => error.includes("historical Gate A route is consumed")));

  let zeroGitRejected = 0;
  const exactRejectedResult = (result, identity, label) => {
    assert.deepEqual(result.errors, [identity.error], `${label}: wrong terminal error`);
    assert.equal(result.terminalFailure ?? result.evidence?.terminalFailure, true, `${label}: missing terminal flag`);
  };
  const failedSpellings = head => [head, head.toUpperCase(), `  ${head.toUpperCase()}  `];
  for (const identity of FAILED_IDENTITIES) {
    for (const spelling of failedSpellings(identity.head)) {
      const routes = [
        ["direct correction", () => policyCorrectionEvidence(spelling)],
        ["direct future", () => futureEvidence(spelling, correctionSynthetic.oid)],
        ["full correction PR", () => evaluatePolicy(prFacts({
          sha: "0".repeat(40), base: GATE_A_MERGE_SHA, head: spelling, headRef: POLICY_CORRECTION_BRANCH
        }))],
        ["full future PR", () => evaluatePolicy(prFacts({
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
            POLICY_PR_BASE_SHA: GATE_A_MERGE_SHA,
            POLICY_PR_HEAD_SHA: spelling
          }, () => { readerCalls += 1; return "0".repeat(40); });
          assert.equal(readerCalls, 0);
          return evaluatePolicy(facts);
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
          return evaluatePolicy(facts);
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
    Buffer.from(correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Alternate Build <noreply@openai.com> 1787792400 -0500`)),
    Buffer.from(correctionText.replace(`committer ${POLICY_CORRECTION_AUTHOR}`, `committer Alternate Build <noreply@openai.com> 1787792400 -0500`)),
    Buffer.from(correctionText.replace("1787792400", "1787792401")),
    Buffer.from(correctionText.replaceAll("-0500", "+0000")),
    Buffer.from(correctionText.replace(`parent ${GATE_A_MERGE_SHA}`, `parent ${GATE_A_BASE_SHA}`)),
    Buffer.from(correctionText.replace(`parent ${GATE_A_MERGE_SHA}`, `parent ${GATE_A_MERGE_SHA}\nparent ${GATE_A_BASE_SHA}`)),
    Buffer.from(correctionText.replace("author ", "encoding UTF-8\nauthor ")),
    Buffer.from(correctionText.replace(
      correctionManifest,
      [correctionManifestLines[1], correctionManifestLines[0], ...correctionManifestLines.slice(2)].join("\n") + "\n"
    ))
  ];
  assert.equal(correctionRawMutations.length, 13);
  for (const bytes of correctionRawMutations) {
    countFailure(policyCorrectionEvidence(writeRawCommit(bytes)).errors.length > 0, "correction raw-frame mutation accepted");
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
      GATE_A_MERGE_SHA,
      POLICY_CORRECTION_AUTHOR,
      POLICY_CORRECTION_COMMIT_TITLE,
      records.every(Boolean) ? records : correction.records
    );
    countFailure(policyCorrectionEvidence(writeRawCommit(raw)).errors.length > 0, `correction tree fixture accepted: ${label}`);
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
    const facts = prFacts({ sha: fixture.oid, base: GATE_A_MERGE_SHA, head, headRef: POLICY_CORRECTION_BRANCH });
    countFailure(evaluatePolicy(facts).passed === false, "invalid correction topology accepted");
  };
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA], "correction one-parent fixture"));
  rejectCorrectionTopology(genericMerge(correction.tree, [correction.oid, GATE_A_MERGE_SHA], "correction swapped fixture"));
  rejectCorrectionTopology(genericMerge(correction.tree, [GATE_A_MERGE_SHA, correction.oid, GATE_A_BASE_SHA], "correction octopus fixture"));
  rejectCorrectionTopology(genericMerge(GATE_A_MERGE_TREE, [GATE_A_MERGE_SHA, correction.oid], "correction wrong-tree fixture"));
  rejectCorrectionTopology({ oid: correction.oid });
  const rebasedCorrectionHead = writeRawCommit(canonicalRawCommit(
    correction.tree,
    GATE_A_BASE_SHA,
    POLICY_CORRECTION_AUTHOR,
    POLICY_CORRECTION_COMMIT_TITLE,
    correction.records
  ));
  rejectCorrectionTopology(
    genericMerge(correction.tree, [GATE_A_MERGE_SHA, rebasedCorrectionHead], "correction rebased fixture"),
    rebasedCorrectionHead
  );
  const alternateCorrectionHead = writeRawCommit(Buffer.from(
    correctionText.replace(`author ${POLICY_CORRECTION_AUTHOR}`, `author Alternate Build <noreply@openai.com> 1787792400 -0500`),
    "utf8"
  ));
  rejectCorrectionTopology(
    genericMerge(correction.tree, [GATE_A_MERGE_SHA, alternateCorrectionHead], "correction alternate-author fixture"),
    alternateCorrectionHead
  );
  const repeatedCorrectionSuccessor = genericMerge(
    correction.tree,
    [correctionSynthetic.oid, correction.oid],
    "repeated correction fixture"
  );
  countFailure(
    evaluatePolicy(pushFacts({ before: correctionSynthetic.oid, after: repeatedCorrectionSuccessor.oid })).passed === false,
    "repeated correction successor accepted"
  );

  for (const branch of FAILED_POLICY_CORRECTION_BRANCHES) {
    const facts = structuredClone(correctionPr);
    facts.headRef = branch;
    countFailure(evaluatePolicy(facts).errors.some(error => error.includes("failed, frozen, and non-reusable")), `frozen branch accepted: ${branch}`);
  }
  const oldRec02Facts = structuredClone(correctionPr);
  oldRec02Facts.headRef = AUTHORIZED_PATCH_TARGET_BRANCH;
  countFailure(evaluatePolicy(oldRec02Facts).errors.some(error => error.includes("REC-02 r1 route")), "old REC-02 r1 route accepted");

  for (const identity of FAILED_IDENTITIES) {
    const placeholderRaw = Buffer.from([
      `tree ${identity.tree}`,
      `parent ${GATE_A_MERGE_SHA}`,
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
      ["correction", () => policyCorrectionEvidence(placeholder)],
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

  const directPFuture = genericMerge(
    correction.tree,
    [GATE_A_MERGE_SHA, correction.oid],
    "direct P to REC-02 fixture"
  );
  countFailure(evaluatePolicy(prFacts({
    sha: directPFuture.oid,
    base: GATE_A_MERGE_SHA,
    head: correction.oid,
    headRef: FUTURE_BRANCH
  })).passed === false, "direct P to REC-02 accepted");

  const protectedMerge = correctionSynthetic.oid;
  const future = futureFixture(protectedMerge);
  const futureSynthetic = genericMerge(future.tree, [protectedMerge, future.oid], "Synthetic REC-02 r2 merge fixture");
  const futurePr = prFacts({ sha: futureSynthetic.oid, base: protectedMerge, head: future.oid, headRef: FUTURE_BRANCH });
  const futurePush = pushFacts({ before: protectedMerge, after: futureSynthetic.oid });
  assert.deepEqual(evaluatePolicy(futurePr).errors, []);
  assert.deepEqual(evaluatePolicy(futurePush).errors, []);

  const futureStatus = fileIdentity(future.tree, STATUS_PATH).bytes;
  const futureStatusText = futureStatus.toString("utf8");
  assert.match(futureStatusText, /`updated_utc: 2026-08-24`/);
  assert.match(futureStatusText, new RegExp(`governed_recovery_successor_sha: ${protectedMerge}`));
  assert.match(futureStatusText, new RegExp(`active_simulation_baseline_sha256: ${INACTIVE_BASELINE_SHA256}`));
  assert.match(futureStatusText, /C9 landed at exact protected policy-correction successor/);
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
    /C9 PRE-IDENTITY|c9_candidate_identity:\s*UNFROZEN|complete the (?:remaining )?independent C9\/r7|REC-02 remains blocked until a passing C9 successor lands/
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
    future.raw.toString("utf8").replace(`parent ${protectedMerge}`, `parent ${protectedMerge}\nparent ${GATE_A_MERGE_SHA}`),
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
    countFailure(evaluatePolicy(pushFacts({ before: protectedMerge, after: fixture.oid })).passed === false, "future bad merge accepted");
  }
  const consumedPr = prFacts({ sha: futureSynthetic.oid, base: futureSynthetic.oid, head: future.oid, headRef: FUTURE_BRANCH });
  countFailure(evaluatePolicy(consumedPr).passed === false, "consumed future PR accepted");
  countFailure(evaluatePolicy(pushFacts({ before: futureSynthetic.oid, after: futureSynthetic.oid })).passed === false, "consumed future push accepted");
  const repeatedFutureSuccessor = genericMerge(
    future.tree,
    [futureSynthetic.oid, future.oid],
    "repeated future fixture"
  );
  countFailure(
    evaluatePolicy(pushFacts({ before: futureSynthetic.oid, after: repeatedFutureSuccessor.oid })).passed === false,
    "repeated future successor accepted"
  );

  assert.equal(structuredRejected, 101);

  const evaluateInColdProcess = facts => {
    const moduleUrl = pathToFileURL(resolve(ROOT, POLICY_PATH)).href;
    const source = [
      `import { evaluatePolicy } from ${JSON.stringify(moduleUrl)};`,
      "const result = evaluatePolicy(JSON.parse(process.argv[1]));",
      "process.stdout.write(JSON.stringify(result));"
    ].join("\n");
    const child = spawnSync(process.execPath, ["--input-type=module", "--eval", source, JSON.stringify(facts)], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024
    });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout);
  };
  for (const [facts, route] of [
    [correctionPr, "rec-ratchet-02-policy-correction"],
    [correctionPush, "rec-ratchet-02-policy-correction-merge"],
    [futurePr, "rec-02"],
    [futurePush, "rec-02-merge"]
  ]) {
    const cold = evaluateInColdProcess(facts);
    assert.equal(cold.passed, true, cold.errors?.join(" | "));
    assert.equal(cold.route, route);
  }

  const storeUnitRoot = realpathSync(mkdtempSync(join(tmpdir(), "sunsplitter-c9-store-unit-")));
  try {
    runGit(["init", "--quiet"], { cwd: storeUnitRoot });
    const reachableOids = gitText([
      "rev-list", "--objects", "--no-object-names", correction.oid
    ]).split("\n").filter(Boolean);
    assert.equal(new Set(reachableOids).size, reachableOids.length, "store unit reachable inventory contains duplicates");
    for (const oid of reachableOids) {
      const type = gitText(["cat-file", "-t", oid]);
      assert.match(type, /^(?:blob|commit|tree)$/, `store unit object ${oid} has unsupported type ${type}`);
      const bytes = gitBytes(["cat-file", type, oid]);
      const copied = gitText(["hash-object", "--literally", "-t", type, "-w", "--stdin"], {
        cwd: storeUnitRoot,
        input: bytes
      });
      assert.equal(copied, oid, `store unit object ${oid} changed while copying`);
    }
    runGit(["update-ref", "--no-deref", "HEAD", correction.oid], { cwd: storeUnitRoot });
    const storePass = candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} });
    assert.equal(storePass.absent, 103);
    assert.equal(storePass.controlsPresent, 6);
    assert.equal(storePass.head, correction.oid);
    assert.equal(storePass.inventorySha256, FORBIDDEN_OBJECT_INVENTORY_SHA256);
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
    assert.equal(storePass.schemaVersion, 2);
    assert.throws(
      () => assertForbiddenObjectInventoryIdentity("0".repeat(64)),
      /forbidden-object inventory/
    );

    const gitDirectory = join(storeUnitRoot, ".git");
    const objectsDirectory = join(gitDirectory, "objects");
    const storeUnitAlias = `${storeUnitRoot}-alias`;
    symlinkSync(storeUnitRoot, storeUnitAlias);
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitAlias, environment: {} }),
      /checkout root is symlinked or redirected/
    );
    unlinkSync(storeUnitAlias);

    const fetchHeadPath = join(gitDirectory, "FETCH_HEAD");
    writeFileSync(fetchHeadPath, `${correction.oid}\n`, { flag: "wx" });
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
      /Git pseudoref FETCH_HEAD/
    );
    unlinkSync(fetchHeadPath);

    const gitInfoDirectory = join(gitDirectory, "info");
    for (const legacyMetadataName of ["grafts", "refs"]) {
      const legacyMetadataPath = join(gitInfoDirectory, legacyMetadataName);
      writeFileSync(legacyMetadataPath, `${correction.oid}\n`, { flag: "wx" });
      assert.throws(
        () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
        /legacy Git object\/ref metadata/
      );
      unlinkSync(legacyMetadataPath);
    }

    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: { GIT_DIR: "/unsafe" } }),
      /unsafe Git environment/
    );
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: { GIT_REFERENCE_BACKEND: "files" } }),
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
        maxBuffer: 32 * 1024 * 1024
      }
    );
    assert.equal(coldUnsafeEnvironment.status, 0, coldUnsafeEnvironment.stderr);

    runGit(["update-ref", "refs/heads/forbidden", correction.oid], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /contains refs or tags/);
    runGit(["update-ref", "-d", "refs/heads/forbidden"], { cwd: storeUnitRoot });

    runGit(["update-ref", "refs/tags/forbidden", correction.oid], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /contains refs or tags/);
    runGit(["update-ref", "-d", "refs/tags/forbidden"], { cwd: storeUnitRoot });

    runGit(["remote", "add", "origin", "https://invalid.example/Sunsplitter.git"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /contains a remote/);
    runGit(["remote", "remove", "origin"], { cwd: storeUnitRoot });

    for (const legacyName of ["branches", "remotes"]) {
      const legacyPath = join(gitDirectory, legacyName);
      mkdirSync(legacyPath, { recursive: true });
      const legacyMarker = join(legacyPath, "forbidden");
      writeFileSync(legacyMarker, "https://invalid.example/Sunsplitter.git\n", { flag: "wx" });
      assert.throws(
        () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
        new RegExp(`legacy Git ${legacyName}`)
      );
      rmSync(legacyPath, { recursive: true });
    }

    const refsPath = join(gitDirectory, "refs");
    const parkedRefsPath = join(gitDirectory, "refs.c9-parked");
    renameSync(refsPath, parkedRefsPath);
    symlinkSync(parkedRefsPath, refsPath);
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
      /Git directory contains symlink/
    );
    unlinkSync(refsPath);
    renameSync(parkedRefsPath, refsPath);

    const infoDirectory = join(objectsDirectory, "info");
    mkdirSync(infoDirectory, { recursive: true });
    const alternatesPath = join(infoDirectory, "alternates");
    writeFileSync(alternatesPath, "/definitely/missing/objects\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /object alternates/);
    unlinkSync(alternatesPath);
    const httpAlternatesPath = join(infoDirectory, "http-alternates");
    writeFileSync(httpAlternatesPath, "https://invalid.example/objects\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /object alternates/);
    unlinkSync(httpAlternatesPath);

    const shallowPath = join(gitDirectory, "shallow");
    writeFileSync(shallowPath, `${correction.oid}\n`, { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /is shallow/);
    unlinkSync(shallowPath);

    const commonPath = join(gitDirectory, "commondir");
    writeFileSync(commonPath, ".\n", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /common Git directory/);
    unlinkSync(commonPath);

    const packDirectory = join(objectsDirectory, "pack");
    mkdirSync(packDirectory, { recursive: true });
    const promisorPath = join(packDirectory, "forbidden.PROMISOR");
    writeFileSync(promisorPath, "", { flag: "wx" });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /promisor pack/);
    unlinkSync(promisorPath);

    runGit(["config", "extensions.partialClone", "origin"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /unsafe Git configuration/);
    runGit(["config", "--unset", "extensions.partialClone"], { cwd: storeUnitRoot });

    runGit(["config", "diff.external", "/definitely/not-executed"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /unsafe Git configuration/);
    runGit(["config", "--unset", "diff.external"], { cwd: storeUnitRoot });

    runGit(["config", "fsck.missingEmail", "ignore"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /unsafe Git configuration/);
    runGit(["config", "--unset", "fsck.missingEmail"], { cwd: storeUnitRoot });

    const worktreeConfigPath = join(gitDirectory, "config.worktree");
    runGit(["config", "extensions.worktreeConfig", "true"], { cwd: storeUnitRoot });
    runGit(["config", "--worktree", "fsck.missingEmail", "ignore"], { cwd: storeUnitRoot });
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
      /unsafe Git configuration|worktree-scoped Git configuration/
    );
    runGit(["config", "--worktree", "--unset", "fsck.missingEmail"], { cwd: storeUnitRoot });
    runGit(["config", "--unset", "extensions.worktreeConfig"], { cwd: storeUnitRoot });
    assert.equal(existsSync(worktreeConfigPath), true, "worktree config fixture was not created");
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
      /worktree-scoped Git configuration/
    );
    unlinkSync(worktreeConfigPath);
    assert.equal(candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }).result, "PASS");

    runGit(["config", "include.path", "/definitely/missing-config"], { cwd: storeUnitRoot });
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /unsafe Git configuration/);
    runGit(["config", "--unset", "include.path"], { cwd: storeUnitRoot });

    const objectSymlink = join(objectsDirectory, "forbidden-symlink");
    symlinkSync(gitDirectory, objectSymlink);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /Git directory contains symlink/);
    unlinkSync(objectSymlink);

    const missingControlPath = join(objectsDirectory, RECOVERY_BASE_SHA.slice(0, 2), RECOVERY_BASE_SHA.slice(2));
    const parkedControlPath = `${missingControlPath}.missing`;
    renameSync(missingControlPath, parkedControlPath);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /required control/);
    renameSync(parkedControlPath, missingControlPath);

    const forbiddenBytes = gitBytes(["cat-file", "tree", FUNCTIONAL_TREE]);
    const copiedForbidden = gitText(["hash-object", "--literally", "-t", "tree", "-w", "--stdin"], {
      cwd: storeUnitRoot,
      input: forbiddenBytes
    });
    assert.equal(copiedForbidden, FUNCTIONAL_TREE);
    assert.throws(() => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }), /forbidden objects present/);
    unlinkSync(join(objectsDirectory, FUNCTIONAL_TREE.slice(0, 2), FUNCTIONAL_TREE.slice(2)));

    const unrelatedBytes = Buffer.from("C9 unrelated unreachable object\n", "utf8");
    const unrelatedOid = gitText(["hash-object", "-w", "--stdin"], {
      cwd: storeUnitRoot,
      input: unrelatedBytes
    });
    assert.equal(reachableOids.includes(unrelatedOid), false, "unreachable fixture unexpectedly belongs to candidate history");
    assert.throws(
      () => candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }),
      new RegExp(`unreachable stored objects: ${unrelatedOid}`)
    );
    unlinkSync(join(objectsDirectory, unrelatedOid.slice(0, 2), unrelatedOid.slice(2)));
    assert.equal(candidateOnlyObjectStoreReceipt({ repoRoot: storeUnitRoot, environment: {} }).result, "PASS");
  } finally {
    rmSync(storeUnitRoot, { recursive: true, force: true });
  }

  console.log(`PASS release-policy self-test — ${zeroGitRejected} zero-Git rejected-head checks; ${historicalRawRejected} historical raw-frame fixtures; ${structuredRejected} structured adversarial fixtures; immutable Gate A, one self-consuming C9 correction, and one self-consuming REC-02 r2 route accepted; NO-PUBLISH remains active`);
  console.log(`FIXTURE gate-a-head=${gateA.oid} tree=${gateA.tree}`);
  console.log(`FIXTURE correction-head=${correction.oid} tree=${correction.tree} synthetic=${correctionSynthetic.oid}`);
  console.log(`FIXTURE future-head=${future.oid} tree=${future.tree} synthetic=${futureSynthetic.oid}`);
}

function taskForRoute(route) {
  if (route?.startsWith("rec-ratchet-02-policy-correction")) {
    return "REC-RATCHET-02-POLICY-SELFTEST-CORRECTION-R7-C9";
  }
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

function main() {
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

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL release-policy crash: ${error.stack || error.message}`);
    process.exitCode = 1;
  }
}
