// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: fingerprint;
// FQ-RELEASE: 2026.08.26.1-audit.fixes | BASELINE: f62e516841fbceed | FILE: fq_release_manifest.js

const RELEASE_ID = "2026.08.26.1-audit.fixes";

const BASELINE_SHA256 = "f62e516841fbceedabca6cd9d5f6c4d2ee89ff867b36661537026c073457b4a0";

const DATA_ONLY = Object.freeze(["fq_data.js", "fq_guide_data.js"]);

const FILE_HASHES = Object.freeze({
  "fq_add_airport.js": "585c8122690ee5bcf216b465eacd7f2a0529a8673fdff873084b2f707b0b698c",
  "fq_addflight.js": "5b20102ecf4d3d6ab87a16803e9ea4c33146a9c59ce5a567943fb788d80a5daa",
  "fq_airlines.js": "ce6beb894620e09c86798e08b0ee6d17103cba548e88fb2c0697e7cdeada7844",
  "fq_airports.js": "23f09bb19dc1c05d219b38a13bdac5ca28554c1ad30613fc0e6828d0f4a6f37d",
  "fq_alerts.js": "d761e66025bf74d07aadcdd621894d3b3e86a65bd1ee6b324f0bc4d252c3bd3e",
  "fq_audit.js": "f569cc2a182659fd52f4cdf7326bcbb3a391fe353177068c9c6c5e66b2a653de",
  "fq_auth_additions.js": "77db4e68dde2aebd47bc02eaf9f8e150de47b1f46fb620ee3c1965d4fb653f9b",
  "fq_auth.js": "e79a10b51e926f3a75e76d9b0e58c6cfb92fdbd1a34824b1b1824e56629bba2d",
  "fq_backup.js": "833d55ffdee7115ff9313e29bf4ba41fd3f1e125f90215370699fc15262eacaa",
  "fq_bootstrap.js": "6567707ec03ecb459012a4d05fcb8e3dd6c57ee921996aa20b593d0049b662a1",
  "fq_bulk_write.js": "f6e92841c4be5be3cfc4f4614c3727d732f715f0d6b1f6dfb80cbdf62fe0667c",
  "fq_config.js": "181de6e705f7917dfaf6725c618e32f92f30911ef9a6b02976467a6072cfca70",
  "fq_countries.js": "c17bf69bd33b34aac7afb53a44697f856bd8207ec72127934a0c171c36e347a1",
  "fq_data.js": "ea4619285e40d5cf95402e943c20f2c21addb11998570dd32d86565a2e47772c",
  "fq_dbadmin.js": "591f4bf653843f80ccac8eb19192ba72920bbbdaf38d4ac8ac708523dc4dbfb4",
  "fq_delete.js": "041557cdac8dc3cc0d426438dce89ae5f4f7b439e3623cfa47f51900c7e8262f",
  "fq_diag_injection.js": "16be477d0232864b78c5f944e92a7c33ddaebe684f60c533162c748297555016",
  "fq_diag_state.js": "9521227d32d92dc7714f0fce78f669bd416da0818a5912e8c7c7450918e9789a",
  "fq_diagnose.js": "85449a0252f1e0f31a9a9287179e0bc4e4c516ff71b79395317e87291b0a4970",
  "fq_editflight.js": "c3543f4110d427fbaa29875f9b9cf36e2c84c065a0120a941bf31095f1bd7f99",
  "fq_enum_inspection.js": "9301213b9f2d6bd114bbfc2b412009d83a9e62c4ec3040635c98568e982e0c7d",
  "fq_enum_status.js": "1c8ec9367595feb8b1038d853bad6ecd60495ff9d7c71a0305928638a4af7b33",
  "fq_enum_tafweej.js": "3e60fbdc18f542b1865943c8df9cd86a3b6e34ae9cdf03dfaadf480372ec9988",
  "fq_enum_visa.js": "c46003d12c1af5f0f611af679c4c6af0fe0960113c31c5fc1d94906db742d1f1",
  "fq_export_guide.js": "e020fdf5ade77048ef5f5b1619e834f4eb3212dee12586824d7d20a02c084233",
  "fq_firebase_auth.js": "e15472f37ef024ae802d9a30d16e5cef837709df3bd527406bb526ca9ac0a49f",
  "fq_firebase_content.js": "1833d2d8b59eb6cb2367d6f10a2bffddb846a078d495daa6b2c2bcfe6b2f5d08",
  "fq_firebase_flights.js": "7fed40435cb39d7da30e26a173614b408813541bb7250d3db943aa595dc7c540",
  "fq_firebase_reg.js": "0c47345f8610e09e05bef43489ae4131dbc0753c5c466fbe4fc9f6b03acfc234",
  "fq_firebase_rest.js": "08584adc0b0743fc04eda0de280f59dc9db377a0fd2b65df43cd15d547819c81",
  "fq_firebase_webview.js": "a195b5ccd95347a3cc6bb72a9dc191962d9faec59a6890a2d2e6ef47196879fd",
  "fq_firebase.js": "b5ba1b135d058b61febfd92f5253cd2220828a6e97467eb5a0335c4c48a035a2",
  "fq_guide_data.js": "72130334cd8cc52f9164291d62b52f68c3fa062ecbf38a28d79d9d79456efbb5",
  "fq_guide.js": "bb78d51cec25270f78c958388f223cf9a447c28fc77c434e2c791ad74182a269",
  "fq_hall_add.js": "6e94155277422aff5b736a5e47aff8d004bfa52720d0a69458e0ec51e93a739c",
  "fq_helpers.js": "0cb34d2a5ea3f505b8ff74a48877e7209a35e72c02c4a95408343eb5887f5f1e",
  "fq_html.js": "2766d9f138fcb5dcecadc0463759dade45f2cae1b77e69a2f0dd44c9fe315054",
  "fq_icons.js": "2adeb85901f1c4c1c2ae7d7701801eeabde4c16904dbc76f14b90e68f8396681",
  "fq_import.js": "375d9329c45f357a481daabdba944af3eb3ed5251d997706994cfa6005d98d0a",
  "fq_installer.js": "d7048d3d7d09d54be330562783b1000019de64bfa205fbf4deda39f400e216c7",
  "fq_jed_html.js": "c35b7698b0a70bb20bc36439ef6dbe088abaec8d62a190fb44aa90dea9267144",
  "fq_jed_modal.js": "685ed3097fa272e5d0a967588abc659b97c84caf43661dea8aa09a667a58c2d3",
  "fq_jed_store.js": "c6d3436f45125a5eb986d33408ec5e9ae8fe44320dc97c1f26197c1466a427c6",
  "fq_jed_styles.js": "b566a32b014dd26ac7cd80fb73fbf634f1792b67a5dceb3357cf81829f90484f",
  "fq_jed_text.js": "7fac1f6aebd3fd1823fa08ece5548f8996732b1ca613323a9bb6754ab4cb32d8",
  "fq_jed_transfer.js": "5502818cb2d78e92507afe4edbf5e544732625ca686392324ba5b7198c00eec1",
  "fq_jed_view.js": "803cbb7c22e1729fa58b0d0df6b0b14166f3a781e8bbed901d3f76782901528b",
  "fq_keys_scan.js": "b4b20baf1951c71f517eaac0bd868bbc42f5797a9d5c9ce377685209d80ad7fb",
  "fq_live_scrape.js": "b8555743d8e233690fe53a7c8959b9741efc9d2e9b7a93e5ce4bb830536370cf",
  "fq_live_store.js": "f8de340a891bed42e3215ac4d843c19826b5a4c904a4b9f235b449c2b075925d",
  "fq_live_view.js": "764cecb22aadc7f9a496f450944f732ec572a2b2d06cdfa75c1941a266db2c69",
  "fq_live.js": "92f81abe33e2266d29660c233a0172f9930cb48e101aa3285a5c217b7223751a",
  "fq_logger.js": "a84dc4505e270fd7b19212eaa3e8ffc11ba018347e19fac792d2146e5967e54a",
  "fq_main.js": "6b108b2a57e8c924eb15471078dcf54f1af0adebbfd97ef137b6696e38e9e7d3",
  "fq_migrate_flight_keys.js": "1a6bb59a36c101c8a202bcee5dd787a9f605166956de449d826148d76227d09c",
  "fq_monitor_auth.js": "56d4e42e68b89edbdfa2ca07c73758789441ab95d237740f65b8af1a70560ced",
  "fq_monitor_base.js": "fd5934f49c2e44c7748395b64d7e00f8805405e2b949187cfadbb7f4b0cf0ceb",
  "fq_monitor_capture.js": "ab3320b571b53b4e4a5256de9f42e7b40d760893ccb66855dd27d4881a5a4368",
  "fq_monitor_dashboard.js": "a5143c840036935d314916dec27f34b7e3f42fecc546bdc10703d160da6f51f6",
  "fq_monitor_device.js": "3efcb82205d2734b4afeeb3d750e77d70137ad15a48f16b6de8ffe471997f172",
  "fq_monitor_journey.js": "6f53ae61dde6ccffae1ba32c2212679df520739b3131773152b9aa6e399f843e",
  "fq_monitor_local_web.js": "98837a3eda4a0e9c8ce3a311bb5a927819fe9cf5f135032a0896b5dc017a7b2d",
  "fq_monitor_local.js": "7e637a832c80fa7f8ca2a8431f4aa03d5f678b0bfae96a91b9213120b7a9a793",
  "fq_monitor_net.js": "cfcd9f55b90ab7508d607f3b47e24651ec06c1e4afdd81f1a7d8b1d19158bc92",
  "fq_monitor_queue.js": "428434010f876ef80f307fcda7c31e749491002962d1463cfbb974571f3cae76",
  "fq_monitor_session.js": "49cc80e066ea04050c7fb058b8e7f19c738d19c793b67f5042cc94993a6df4f5",
  "fq_monitor_v2_view_code.js": "9e19fac7656cfe99ce0470146de9841275224b4a158cb4f2193b9fd08875b29b",
  "fq_monitor_v2_view_html.js": "fb2c91e1b778b9570f48b4924414ddd56abb48a2c38af2843d01950e67ed9155",
  "fq_monitor_v2_view_styles.js": "f0aa54a8138db2d317374e9a795725dc2000a2a1b5859f41d414cd973ee1e07a",
  "fq_net_request.js": "a460e2e209b4b836d0f12c2a4efd980042b0d3e482026904f9f51f6c5758d032",
  "fq_parser.js": "4c43bc455ae27acc1ecff9b0cfa8ed0572446ac4ceac1b9edcc58e4078568a2d",
  "fq_permissions.js": "ea7fdc47b134bff68e54bf29ea1c3e15652f164249a86712055af830c75b0209",
  "fq_profile_code.js": "b8873b4ea9eba24e751a48e20afee3c1c8681422267ec38a6e2a6e760b3aceed",
  "fq_profile_html.js": "039ca694ab8a3ddebd08e4012946c3e13d74429905f2b2e9d1337141447aef4a",
  "fq_profile_store.js": "d52da9ed65b48952002bd70816c0e0a0e71715cea7b04e21d3649b570fc4c86e",
  "fq_profile_styles.js": "64356392d577d82807ce3379543bf4492cd0f5dc5353d78be4f8f3a18bf439a3",
  "fq_profile.js": "df4a360a8a4ceb1b8bf6752a1fd6b23e2f5669f2c1b1150dc0c260c2f9fbcfae",
  "fq_publish.js": "fcd868e0c6a8de603ff13de7ab1bbf3dfb503c186c2d81518ca1107152ad80a1",
  "fq_queue_file.js": "82a082094da287858a5b8958277db482cd4408977af3ef17c8c8d90fc3e62cb3",
  "fq_queue_flush.js": "b59feef1d61061380217a64f25f748778f5afde24db3c9a77604019dca010cef",
  "fq_queue_model.js": "9611b12e282cfac9960098b4c0b81edfec84e08666a75bf6af2b3922014c633c",
  "fq_queue_store.js": "c7ed532367a87e12ae34952ed6aa00213f5a43358bfae39c89bc1cc660f71b72",
  "fq_queue_submit.js": "c716cf2a1bf412aef5f9ca63ddc18ed03bb8e368042d83809cbe54485af12dbf",
  "fq_queue_view.js": "c1b02ef6e56641fd5b977a4e7a91859d654de27810c083d33a9b0bf952dc1095",
  "fq_reg_copy.js": "47b4cc1294ccdc74d277a6ca49a31c2a85ddc910bdc19374928e74c9f5487ac9",
  "fq_reg_form.js": "f90719c7bdaa734a4c27d8ac8a2cac35ce32fcd6b7a5e75585ac4153cc2df8f0",
  "fq_reg_history.js": "80fbf8721158ac03a0eba6e0027dbeba31e6a1db332de8319ee850c19906ecc8",
  "fq_reg_html.js": "85d26e9ef8286300eb3ee509dc6c3cd2e468881369c4137634f6bacaa5a9a315",
  "fq_reg_shift.js": "e76e71b2a71a6c3dfe0215cd3bbb915b38aef1f5203bdd49c50d03e23d257111",
  "fq_reg_styles.js": "ff8c065302665ae3fd698787bed0f419bd78611ee70d34e0e9eecc1aa695afd3",
  "fq_regmodel.js": "fb39b9443f81c51f1a37d43a5339cbb7b019c6794cf75a5bd6f3b0bfe63a1cae",
  "fq_search.js": "967eb4767cb62e1457dc7a4fd311e3cc35d598133beda69f4c7412af5c114a50",
  "fq_secrets_manager.js": "66369b3e4ab1db7e87f3cf759248fb44d468d710f2eaa1b99ec41e6cf0ada489",
  "fq_secrets.js": "4eb7f70e14e5a96b4b3b2302119fd8caeec870ee08e3663bb73acb29265972c1",
  "fq_sidebar.js": "9601e8ebfb4a3c85c310b1843e4bb8df4c4a70996bc52e1eb1d9a6a11724a0aa",
  "fq_snapshot.js": "c89116826b63188db59adc4e5f1bbd946db4fa543ed13496dcb3948d364da3ef",
  "fq_stats_aggregator.js": "89adec3132db7b78a97153864b90ec6ba3a74f5ac4e9fa870380b7b7cec9f62b",
  "fq_stats_code.js": "351dce76ed1d984f27b6c66afc17ed1998038938f1e8221cef902131f255c84b",
  "fq_stats_html.js": "a6bc19d7ab3bd939c0d7443c0c2cdf733991d6e59c38f20ca7957df8c2bb198e",
  "fq_stats_report.js": "88cb940efd6cbafc0e73a4731b89113b32485a32297edf8442031b2d6746cc0c",
  "fq_stats_styles.js": "630de9fea9639b57dab76a86189737295a606365c16f2d13de53d11e5a596408",
  "fq_stats.js": "7e1be899473f46cd3bb7c8fc002e9dface00cae45979ebc938df7f89c11310d6",
  "fq_storage.js": "c6bf792b740355b3c746914adac5362b92c1eb0574d8adc7183672614ff37a25",
  "fq_styles.js": "4ac8637890834f341fb8dfa8a24d72c766bcaf6df6f7c670c714b04fe9a6c140",
  "fq_sync.js": "a36f02333afc695d0b848b6af75dd91e36ab60b39b7041f1f74f8c0a750e5ca5",
  "fq_t4_button.js": "542ad03682069283961a993e63ca628243298e2a1ba22b9ccd7b036c647fc44a",
  "fq_t4_editor.js": "8cb79772c1c6d7ef34240a2834cb606a8fcf54b53732586b7316973fb2207240",
  "fq_t4_form.js": "ce8cbdd25a6390de1b5d6f43c06d721e437deaeaeece9462446c1f7f8c2acbd9",
  "fq_t4_html.js": "274cf84550c98f5664f377e9350fc34cecc34a5d20e4e46eeec69bf08c2aef5f",
  "fq_t4_modal.js": "c7c4c332579fb8496d87ac732221150a30c7c021f264cb6ff3de3b5d1a45a649",
  "fq_t4_report.js": "b7e389a9496e671463f1d7ba3aa04e13ac4ebfb79afdb16198cb16fe7e5f4f08",
  "fq_t4_store.js": "5e136c4c7b63dcda855feb13df8f079203edda8315ec39dcbec28b82372046aa",
  "fq_t4_styles.js": "ba842ae61b220a5fa8b9b24316e0ab33305f335b7da629e16cc0e0d6b5b44d0c",
  "fq_t4_text.js": "7568b6e3d778305bb8c1f69858ea522331eb5b90ffec2c5ea9496e8e831472ed",
  "fq_t4_view.js": "6ec1f4f554ab098c90f9ff541b98d6eed6a59d888a0ebf8b28bdbd9a98ff322a",
  "fq_toast.js": "84d6bb13691954155cbf16d151a3722df44bcce14199075d43afe2ad6b0874bb",
  "fq_widget.js": "7c030bd7e6847553a9b1f75daca72c5e5e88c18b1a7dc2fed09139a09f361b3f",
  "fq_wl_editor.js": "584cf8c8fd5f91ed72f4fd23ba08e145fbd586b855aaa6e2f4ff56cfe797e468",
  "fq_wl_form.js": "364c8ce444ce53d631c3904442f715c15d6475a63ba4fc55508bb70dbe5eced7",
  "fq_wl_html.js": "f7ffbff3398d50b2f93411448f6ea72664680908e77152e51824942bb6e0ac8c",
  "fq_wl_store.js": "025fd1309777996bb34e0716fc2aad51915120b93da93c89f53ed2b4dc7bc742",
  "fq_wl_text.js": "015df660fa0c422680e6cc3bcbeaac85700c30bc7917150aef34326bb650b78d",
  "fq_wl_view.js": "1cbc0f23e2508950fff5526d404333df9ee9589b606431a1c17c18da3e64007a",
  "lessons-learned.js": "530ac0dd5cf351a7b54f908651f1b658d0b905188a46c285b0f0553c8ee53cd8",
  "selftest_cases.js": "035605373dcca9cc137b684a4385a253fd092d1763d420ecb9be1f8ba85e5fe1",
  "selftest.js": "88e584dea908fd912f030ec3cda48d01ad4716a65026a27747607e17354db57a",
  "setup_dev.js": "c2e10feb9ba391b62cd7ff1ffddd4c2fc6e05436ff6651cec4e922994f575b9d",
});

/**
 * يفحص أن سطر رأس ملفٍ يحمل ختم الإصدار الحالي.
 * @param {string} headerLine سطر الرأس
 * @returns {boolean} true إن حمل الختم
 */
function isSameRelease(headerLine) {
  return String(headerLine || "").indexOf(`FQ-RELEASE: ${RELEASE_ID}`) !== -1;
}

/**
 * يُرجع بيان الإصدار: الختم والبصمات وعدد الملفات.
 * @returns {Readonly<Object>} البيان
 */
function getReleaseManifest() {
  return Object.freeze({ releaseId: RELEASE_ID, baselineSha256: BASELINE_SHA256, fileCount: Object.keys(FILE_HASHES).length + 1, dataOnly: DATA_ONLY, files: FILE_HASHES });
}

module.exports = Object.freeze({ RELEASE_ID, BASELINE_SHA256, getReleaseManifest, isSameRelease });
