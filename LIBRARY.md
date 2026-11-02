# Combo & defence library

Generated from `library.json` by `tools/build_library_md.py`. Edit the JSON, not this file.

Orthodox stance. 1 jab, 2 cross, 3 lead hook, 4 rear hook; **up jab** = lead-hand long uppercut from range; **check hook** = lead hook thrown while pivoting off the line. `|` separates the calls of a trap sequence. McGregor is southpaw: his straight left is Milan's **2**, and his kicks to his right side are mirrored here.

**Totals:** 168 combos, 17 trap sequences, 43 incoming attacks with answers, 15 spotlights. 15 entries contain a spinning or flying technique; the engine caps them per round (1 per round, more during the McGregor/Ruffy spin spotlights), so jabs and straights stay far more frequent.

## Sessions and spotlights

Three options, all hard. Every round mixes everything. Every ~2 minutes a **spotlight** (one short spoken line) makes one setup and its family come up more often, then the next spotlight takes over.

- **Fight mix**: incoming attacks ×1.3, spotlights: The liver, McGregor's straight, Body kicks, Hooks and uppercuts, Superman punch, Adesanya's feints, Ruffy in and out, Long strings, Lead side kick, Clinch, Pull counters, Question mark kick, McGregor's kicks and spins, Ruffy's spins
- **Counters and defence**: incoming attacks ×2.6, spotlights: Pull counters, Adesanya's check hook, The liver, Hooks and uppercuts, Long strings, Body kicks, McGregor's straight, Lead side kick, Clinch
- **Kicks**: incoming attacks ×1.6, spotlights: Body kicks, Adesanya's feints, Lead side kick, Question mark kick, Superman punch, McGregor's kicks and spins, The liver, Long strings, Ruffy's spins, Hooks and uppercuts

| spotlight | spoken | setup | family |
|---|---|---|---|
| McGregor's straight | Spotlight: McGregor. Feint, then the 2. | `feint 1, 2` | c02, c14, c10, mc01, c09, p21 |
| Ruffy in and out | Spotlight: Ruffy. In, 2, 3, out. | `step in, 2, 3, step out` | h06, h04, c08, L14, l10 |
| Pull counters | Spotlight: pull counters. Make them miss, make them pay. | `1, pull, 2` | p02, p09, p21, p22, t09, tm3, L04 |
| The liver | Spotlight: the liver. Go downstairs. | `1, liver shot, 3` | l01, l02, l03, l06, l09, l11, tl1, k10, l14 |
| Hooks and uppercuts | Spotlight: hooks and uppercuts. | `1, rear uppercut, 3` | h01, h02, u01, u02, u06, u08, tu1, h14 |
| Adesanya's feints | Spotlight: Adesanya. Feint, then kick. | `feint 1, calf kick` | ad01, ad02, ad06, ta2, k07, L06 |
| Question mark kick | Spotlight: front kick, then the question mark. | `front kick | front kick | question mark kick` | ad05, ad07, ad08, mc02, L16 |
| Body kicks | Spotlight: body kicks. Both sides. | `2, 3, rear body kick` | k20, k21, k23, k24, k26, l14, tm2 |
| McGregor's kicks and spins | Spotlight: McGregor. Kick them back, spin, 2. | `front kick, 2 | front kick, 2 | front kick, back kick` | mc03, mc04, mc05, mc06, mc07 |
| Clinch | Spotlight: clinch. Knees, elbow, frame out. | `3, clinch, knee, knee, frame out` | cl2, cl3, cl4, cl5, cl6, e05, L08 |
| Long strings | Spotlight: long strings. Don't stop. | `1, 2, lead head kick, slip, pull, body jab, step in, liver shot, 3` | L02, L03, L05, L07, L09, L10, L11, L12, L13, L15 |
| Adesanya's check hook | Spotlight: Adesanya's check hook. Let them rush in. | `incoming blitz → check hook, pivot out` | d35, d09, p23, p22, d43 |
| Ruffy's spins | Spotlight: Ruffy. Fake the jab, then spin. | `feint 1, wheel kick` | ru04, ru05, tr1, x05 |
| Lead side kick | Spotlight: the lead side kick. Keep them long. | `side kick, 1, 2` | sk1, sk2, sk4, sk5, sk6 |
| Superman punch | Spotlight: the superman punch. Sell the kick. | `rear body kick | rear body kick | superman punch` | sm1, sm2, sm3, sm4, sm5 |

## Combos

| id | call | fighter | tags | why it works | src |
|---|---|---|---|---|---|
| c01 | 1, 2 |  | snipe jab warm | The jab measures and blinds; the cross travels down the same line. | [coach] |
| c02 | 1, 1, 2 |  | snipe jab | The double jab steals distance and hides the cross. | [coach] |
| c03 | 1, body 2 |  | snipe body | Jab high lifts the guard; the cross goes under it to the body. | [coach] |
| c04 | body jab, 2 |  | snipe jab body warm | Jab to the body drops the hands; the cross goes to the open chin. | [coach] |
| c05 | up jab, 2 |  | snipe jab | The up jab splits the guard from below; the cross follows through the gap. | [coach] |
| c06 | 2, up jab |  | snipe jab | The 2 makes them shell high; the up jab comes up through the middle. | [coach] |
| c07 | feint 1, 2 | McGregor | snipe feint | The jab feint freezes them; the 2 lands while they are still reacting. | [sherdog_mcg], [fox_ufc205] |
| c08 | 1, 2, step out | Ruffy | snipe exit warm | Land the one two and leave on an angle. | [lowkick_ruffy] |
| c09 | 2, step out | McGregor | snipe exit | A long cross from outside, then leave before they answer. | [be_mcg_siver] |
| c10 | feint 2, 1, 2 |  | snipe feint | Fake the cross so they cover; jab and cross land as they open back up. | [coach] |
| c12 | up jab, 2, up jab |  | snipe jab | Up jab and 2 set each other up: under, over, under. | [coach] |
| c13 | 1, 2, up jab, 2 |  | snipe jab | The up jab splits the guard after the one two; the last 2 goes through the gap. | [coach] |
| c14 | shoulder feint, 1, 2 | Adesanya | snipe feint | A shoulder twitch makes them react; the one two lands on the reaction. | [sherdog_adesanya], [sk_adesanya_feints] |
| c15 | feint level change, 2 |  | snipe feint | A level change sells the takedown; the cross lands as they drop their hands. | [coach] |
| c16 | 1, 2, pivot out |  | snipe exit warm | One two, then turn off the line so they punch air. | [coach] |
| h01 | 1, 3, 2 |  | hook snipe warm | Jab, lead hook round the guard, then the cross straight through the middle it opened. | [coach] |
| h02 | 1, 3, 2, 3 |  | hook | Same start, and the last hook catches them leaning away from the cross. | [coach] |
| h03 | 3, 2 |  | hook | The hook pulls the guard wide; the cross goes down the middle. | [coach] |
| h04 | 2, 3, 2 | Ruffy | hook snipe | Right, left, right: each punch loads the next. | [cageside_ruffy_mullarkey] |
| h06 | 2, 3, step out | Ruffy | hook exit | Cross, hook, and out before they answer. | [cageside_ruffy_mullarkey] |
| h07 | 1, 3, 2, pivot out |  | hook exit | Land the 1, 3, 2 and turn off the line. | [coach] |
| h08 | 3, 2, 3, step out |  | hook exit | Hook, cross, hook, gone. | [coach] |
| h09 | 3, 4, 3, step out |  | hook exit | Close range: punish with hooks both sides, then leave. | [coach] |
| h10 | up jab, 3, 2 |  | hook jab | The up jab lifts the chin; the hook comes round while they look up. | [coach] |
| h11 | body jab, 3, 2 |  | hook body | Body jab drops the hands; hook and cross go upstairs. | [coach] |
| h12 | feint 2, 3, 2 |  | hook feint | They cover the centre for the cross; the hook comes round the side. | [coach] |
| h13 | step in, 2, 3, step out | Ruffy | hook snipe exit | Ruffy's dart: one long step in, right hand, left hook, and out. | [cageside_ruffy_mullarkey], [cageside_ruffy_llontop] |
| h14 | 1, 3, 2, 3, 2 |  | hook | Five-punch burst, all off the 1, 3, 2 rhythm. | [coach] |
| l01 | 1, liver shot |  | liver body | The jab raises their eyes; the lead hook digs into the liver. | [coach] |
| l02 | 2, liver shot |  | liver body | The cross turns you; the lead hook comes back off that turn into the liver. | [coach] |
| l03 | liver shot, 3 |  | liver hook | Liver first drops the right elbow; the same hook goes up to the head. | [coach] |
| l04 | 1, liver shot, 3 |  | liver hook | Jab, liver, head: body-head with the same hand. | [coach] |
| l05 | 1, 2, liver shot |  | liver | After the one two they shell high; the liver is open. | [coach] |
| l06 | 1, 2, liver shot, 3 |  | liver hook | One two, liver, then the hook upstairs as their elbow drops. | [coach] |
| l07 | liver shot, 3, 2 |  | liver hook | Down, up, and the cross through the middle. | [coach] |
| l08 | feint 1, liver shot |  | liver feint | The jab feint lifts their guard; go under it to the liver. | [coach] |
| l09 | 2, liver shot, 3, step out |  | liver hook exit | Cross, liver, head hook, out. | [coach] |
| l10 | step in, liver shot, 3, step out |  | liver exit | Step in low to the liver, come up with the hook, leave. | [coach] |
| l11 | slip, liver shot, 3 |  | liver counter | Slip their jab outside and you are already loaded for the liver. | [coach] |
| l12 | body jab, 2, liver shot |  | liver body | Three to the body in a row: jab, cross, liver. | [coach] |
| l13 | up jab, 2, liver shot |  | liver jab | Up jab and 2 lift the guard; finish on the liver. | [coach] |
| l14 | liver shot, rear body kick |  | liver kick body | The lead hook turns your hips; the rear kick lands on the same side as the liver. | [coach] |
| l15 | liver shot, rear head kick |  | liver kick | Liver brings the elbow down; the rear kick goes high on the same side. | [coach] |
| u01 | lead uppercut, 2 |  | upper | The lead uppercut splits the guard; the cross follows. | [coach] |
| u02 | rear uppercut, 3 |  | upper hook | Rear uppercut up the middle, lead hook round the side. | [coach] |
| u03 | 1, rear uppercut, 3 |  | upper hook | Jab to close the gap, then rear uppercut and lead hook. | [coach] |
| u04 | 1, 2, lead uppercut, 2 |  | upper | One two, the lead uppercut through the shell, and the 2 again. | [coach] |
| u06 | 3, rear uppercut, 3 |  | upper hook | Hook, uppercut, hook: they cover the side and get split down the middle. | [coach] |
| u07 | liver shot, lead uppercut |  | upper liver | Liver, then the same hand comes up the middle as they fold. | [coach] |
| u08 | rear uppercut, 3, 2 |  | upper hook | Uppercut, hook, cross. | [coach] |
| u09 | slip, rear uppercut, 3 |  | upper counter | Slip inside and the rear uppercut is loaded. | [coach] |
| u10 | roll, 3, rear uppercut |  | upper counter | Roll under their hook, answer with hook and uppercut. | [coach] |
| u11 | body 2, lead uppercut, 2 |  | upper body | Body cross folds them; the uppercut meets them coming down. | [coach] |
| u12 | 1, 3, rear uppercut, 3, step out |  | upper hook exit | Hook-uppercut-hook burst after the jab, then leave. | [coach] |
| k01 | body 2, rear head kick |  | kick body | The body cross pulls their elbow down; the rear kick goes over it to the head. | [evolve_headkick] |
| k02 | 2, lead head kick |  | kick | The cross turns your hips; let the lead leg ride that turn up to the head. | [ds_ludwig], [be_highkicks] |
| k03 | 1, low kick |  | kick warm warmkick | The jab raises their eyes; the low kick lands where they aren't looking. | [coach] |
| k04 | 1, rear head kick |  | kick jab | The jab blinds them; the rear head kick comes round the side. | [ds_moraes] |
| k05 | teep, rear head kick |  | kick teep | The teep makes them guard the middle; the head kick goes around it. | [evolve_headkick] |
| k06 | 1, 3, rear body kick |  | kick hook body | The lead hook turns them and reloads your hips for the rear kick. | [coach] |
| k07 | feint kick, 2 |  | kick feint | Fake the kick so they lift the leg; the cross lands while they stand on one foot. | [evolve_headkick] |
| k08 | up jab, rear head kick |  | kick jab | The up jab splits the guard upward; the head kick comes around it. | [coach] |
| k09 | lead body kick, 2 |  | kick body warmkick | The lead kick brings their elbow down; the cross follows straight. | [coach] |
| k10 | 1, 2, liver shot, low kick |  | kick liver | Dutch style: hands high, liver, then the low kick off the hook. | [coach] |
| k11 | calf kick, 2 |  | kick | The calf kick makes them shift their weight; the cross catches them flat. | [coach] |
| k12 | 1, 3, rear head kick |  | kick hook | The hook pulls their guard to one side; the rear kick lands on the other. | [coach] |
| k13 | feint 2, lead head kick |  | kick feint | Fake the cross so they cover the centre; the lead kick comes round. | [ds_ludwig] |
| k14 | 2, lead body kick |  | kick body | The cross turns you; the lead kick lands on the liver side. | [coach] |
| k15 | low kick, 2 |  | kick warmkick | The low kick drops their eyes; the cross follows up top. | [coach] |
| k16 | body jab, lead head kick |  | kick jab | The body jab pulls their hands down; the lead leg goes high. | [evolve_headkick] |
| k17 | teep, 2, lead head kick |  | kick teep | Teep to set range, cross to turn them, lead kick to finish. | [coach] |
| k18 | feint low kick, rear head kick |  | kick feint | Fake low, go high: their guard follows the fake down. | [evolve_headkick] |
| k19 | teep, 1, 2 |  | kick teep warmkick | The teep stops them; jab and cross land while they come back in. | [evolve_pereira] |
| k20 | 1, rear body kick |  | kick body warmkick | The jab raises their hands; the rear body kick lands under the elbow. | [coach] |
| k21 | 3, rear body kick |  | kick body hook | The lead hook turns your hips the right way; the rear kick comes off that turn. | [coach] |
| k22 | 2, 3, rear body kick |  | kick body hook | Cross, hook, and the hook loads the rear body kick. | [coach] |
| k23 | lead body kick, 2, 3, rear body kick |  | kick body hook | Body kicks on both sides with the hands in between. | [coach] |
| k24 | rear body kick, 1, 2 |  | kick body | Land the body kick, step down forward, one two. | [coach] |
| k25 | up jab, lead body kick |  | kick jab body | The up jab lifts their guard; the lead body kick goes under it. | [coach] |
| k26 | 1, 2, lead body kick |  | kick body | The cross turns your hips; the lead body kick comes off that turn. | [coach] |
| k27 | 2, lead head kick, 2 |  | kick | Cross, lead head kick, and the cross again as they recover. | [coach] |
| sk1 | side kick, 2 |  | kick body | The lead side kick stops them on the way in; the cross catches them as they reset. | [coach] |
| sk2 | 1, side kick |  | kick jab | The jab freezes their front foot; the side kick goes straight into the body. | [coach] |
| sk3 | side kick, 1, 2 |  | kick snipe | Side kick to keep them long, then snipe with the one two. | [coach] |
| sk4 | feint 1, side kick |  | kick feint | The jab feint draws them forward into the side kick. | [coach] |
| sk5 | side kick, 3, 2, step out |  | kick hook exit | Side kick, step down forward into the hook and cross, then out. | [coach] |
| sk6 | pull, side kick |  | kick pull counter | Pull from their punch, and the side kick meets them stepping in. | [coach] |
| sm1 | feint kick, superman punch |  | kick feint snipe | Fake the rear kick so they drop the hands for it; the superman punch comes over the top. | [coach] |
| sm2 | 1, superman punch |  | snipe jab | The jab measures; the superman punch covers the extra distance with the 2. | [coach] |
| sm3 | superman punch, 3 |  | snipe hook | Land the superman punch and the lead hook comes round as you land forward. | [coach] |
| sm4 | rear body kick, superman punch, 3, step out |  | kick body hook exit | Real kick first, then the fake of it becomes the superman punch, hook, out. | [coach] |
| sm5 | superman punch, liver shot |  | snipe liver | They cover high from the superman punch; the liver is open as you land. | [coach] |
| ad01 | shoulder feint, lead body kick | Adesanya | kick feint body | Adesanya's shoulder feint makes them guard high; the lead kick goes to the open body. | [sherdog_adesanya], [fightprimer_adesanya] |
| ad02 | hip feint, rear head kick | Adesanya | kick feint | The hip feint covers distance and fakes a kick; the real one goes high. | [fightprimer_adesanya], [sk_adesanya_feints] |
| ad03 | feint 1, calf kick | Adesanya | kick feint jab | The jab fake freezes their hands and front foot; the calf kick lands on the planted leg. | [fightprimer_adesanya], [user_lead] |
| ad04 | 1, 1, lead head kick | Adesanya | kick jab | Two jabs make them slip outside; the lead head kick is waiting where their head goes. | [user_lead], [be_highkicks] |
| ad05 | front kick, 1, 2 | Adesanya | kick snipe | The front kick to the body stops them and folds them; jab and cross land as they come back up. | [fightprimer_adesanya], [sk_adesanya_5tech] |
| ad06 | hip feint, front kick | Adesanya | kick feint | Feint with the hips, then the real front kick straight to the belly. | [fightprimer_adesanya] |
| ad07 | feint low kick, question mark kick | Adesanya | kick feint | Adesanya: make it look low, change it high at the last second. | [sk_adesanya_qmark] |
| ad08 | front kick, question mark kick | Adesanya | kick | The real front kick, then the same chamber turned over to the head. | [fightprimer_adesanya], [sk_adesanya_qmark] |
| mc01 | front kick, 2 | McGregor | kick snipe | McGregor's front kick backs them up to the fence, where the straight waits. | [sk_mcg_unorthodox] |
| mc02 | 1, front kick, 2 | McGregor | kick snipe | The jab raises their hands; the front kick folds them; the 2 lands as they come back up. | [sk_mcg_unorthodox] |
| mc03 | oblique kick, 2 | McGregor | kick | The oblique stomp above the knee stops their step; the 2 lands while they are stuck. | [mma_oblique] |
| mc04 | oblique kick, 1, 2 | McGregor | kick snipe | Stop the advance with the oblique kick, then snipe them while they reset. | [mma_oblique] |
| mc05 | back kick, 2 | McGregor | kick | The spinning back kick cuts off their escape; when they circle away from it, they circle into your 2. | [sherdog_prev189], [sk_mcg_unorthodox] |
| mc06 | wheel kick, 2 | McGregor | kick | The wheel kick stops them moving to the centre; they turn back into the straight. | [sherdog_prev189], [sk_mcg_unorthodox] |
| mc07 | 1, 2, back kick | McGregor | kick | After the one two they expect a hook; turn and drive the back kick straight up the middle to the body. | [sk_mcg_unorthodox] |
| mc08 | feint kick, knee | McGregor | kick knee feint | Cerrone flinched at the body kick; the knee came while he defended the kick. | [be_mcg_cerrone] |
| ru03 | feint 1, wheel kick | Ruffy | kick feint | The UFC 313 knockout: a jab feint raises their hands for the punch and the turn of the feint becomes the wheel kick. | [keviniole_ruffy], [lowkick_ruffy_koty] |
| ru04 | back kick, wheel kick | Ruffy | kick | Spinning back kick to the body, then the spinning kick high. He dropped Chandler with that rhythm. | [cageside_ruffy_chandler] |
| ru05 | 2, 3, back kick | Ruffy | kick | The lead hook already turns you clockwise; keep turning into the back kick. | [cageside_ruffy_llontop], [user_lead] |
| ru06 | 2, 3, wheel kick | Ruffy | kick | The hook turns you into the wheel kick round the side. | [cageside_ruffy_llontop], [user_lead] |
| ru07 | 2, flying knee | Ruffy | knee | The right hand stumbles them and the flying knee meets them. That's how Mullarkey went. | [cageside_ruffy_mullarkey] |
| p01 | 1, pull, 2 |  | pull counter snipe | Your jab invites their jab back; pull just out of range and fire the cross over it. | [evolve_pull], [ds_pull] |
| p02 | pull, 2 | McGregor | pull counter warm | Let their punch fall short, then hit the space it left open. | [evolve_pull], [sherdog_mcg] |
| p03 | pull, 2, 3, step out |  | pull counter exit | Pull, then cross and hook while they are overextended. Then leave. | [evolve_pullcombos] |
| p04 | pull, 1, 2 |  | pull counter | After the miss they are stretched out; jab and cross before they recover. | [evolve_pullcombos] |
| p05 | pull, body 2 |  | pull counter | A missed punch leaves the body open; drive the cross into it. | [evolve_pullcombos] |
| p06 | pull, up jab, 2 |  | pull counter jab | The up jab comes up under their returning hand; the cross follows. | [coach] |
| p07 | pull, 2, lead head kick |  | pull counter kick | The cross loads your hips; ride that turn into the lead head kick. | [evolve_pull], [evolve_headkick] |
| p08 | feint 1, pull, 2 | McGregor | pull counter | The feint draws their counter; pull out of it and punish. | [sherdog_mcg], [evolve_pull] |
| p09 | 1, 2, pull, 2 |  | pull counter snipe | They answer your one two; pull out of it and cross again. | [evolve_pullcombos] |
| p10 | pull, 2, pivot out |  | pull counter exit | Counter, then pivot: they turn into nothing. | [evolve_pull] |
| p11 | slip, 2 |  | counter | Slip outside their jab and your cross is already loaded. | [evolve_counter5] |
| p12 | slip, 2, 3 |  | counter | Slip outside, cross over the top, hook behind it. | [evolve_counter5] |
| p13 | roll, 3, 2 |  | counter | Roll under the hook and come back with your own hook and cross. | [evolve_headmove] |
| p14 | parry, 1, 2 |  | counter warm | The rear hand parries their jab, so your lead hand is free: jab back, then the cross. | [evolve_counter5] |
| p16 | pull, lead head kick |  | pull counter kick | After the pull your weight is on the back leg, so the lead leg is free to kick. | [coach] |
| p17 | pull, 3 |  | pull counter | Pull, and come back with the lead hook as they reach. | [evolve_pullcombos] |
| p18 | step back, 2 |  | counter snipe | Stepping back draws them in; the cross meets them on the step. | [evolve_lowkick_def] |
| p20 | 1, pull, 2, step out | McGregor | pull counter exit | Bait, pull, punish, leave. The whole sniper game in one combo. | [evolve_pull], [lowkick_ruffy] |
| p21 | hop back, 2 | McGregor | pull counter snipe | McGregor's back-skip: hop back and to your right, and the 2 meets them as they square up chasing. | [vice_mcg_alvarez], [fox_ufc205] |
| p22 | 1, pull, 3 | Adesanya | pull counter | When they overextend on the answer, the lead hook catches them. Adesanya finished Whittaker this way. | [1news_whittaker], [cbs_ufc243] |
| p23 | pull, check hook, pivot out | Adesanya | pull counter | Pull from the punch, then the lead hook as you pivot: they fall into it and you are already off the line. | [1news_whittaker] |
| p25 | 1, 2, slip, 2 |  | counter snipe | They answer your one two; slip it and the cross is loaded. | [coach] |
| p26 | 1, 3, 2, roll, 3 |  | counter hook | Roll under their return hook and hook back. | [coach] |
| p27 | slip, roll, 3, 2 |  | counter hook | Slip the jab, roll the hook, answer with hook and cross. | [coach] |
| cl1 | 3, clinch, knee, knee, frame out |  | clinch knee hook | The hook gets you inside; grab, two knees, frame off and leave. | [coach] |
| cl2 | 2, clinch, knee, rear elbow, frame out |  | clinch knee elbow | Cross to close the gap, grab, knee, elbow, frame out. | [coach] |
| cl3 | clinch, knee, knee, frame out, 2 |  | clinch knee | Knees in the clinch, frame off, and the 2 as they come back to you. | [coach] |
| cl4 | liver shot, clinch, knee, frame out, 2 |  | clinch knee liver | Liver shot, grab them as they fold, knee, frame out, 2. | [coach] |
| cl5 | 1, 2, clinch, knee, frame out, rear head kick |  | clinch knee kick | Close with the one two, knee in the clinch, frame them off into the head kick. | [coach] |
| cl6 | clinch, lead elbow, frame out, 2 |  | clinch elbow | Short elbow off the clinch, frame, cross. | [coach] |
| e05 | 3, rear elbow, step out |  | exit elbow hook | The hook turns them, the elbow comes across, then you leave. | [coach] |
| e06 | 2, lead elbow, pivot out |  | exit elbow | If the cross gets you too close, lead elbow and pivot off the line. | [coach] |
| x06 | sprawl, 1, 2 |  | counter | Sprawl the shot, back up to stance, punish as they stand. | [coach] |
| x07 | 1, 2, sprawl, 2 |  | counter | They duck under your one two: sprawl and cross as they come up. | [coach] |
| x01 | low kick, wheel kick |  | kick | The low kick drops their eyes; the wheel kick comes around high. | [coach] |
| x02 | teep, flying knee |  | knee | The teep makes them rebound forward, straight into the knee. | [coach] |
| x03 | 1, flying knee |  | knee | The jab freezes their guard high; the flying knee comes from underneath. | [coach] |
| x04 | feint 2, back kick |  | kick | They brace for the cross; the back kick goes into the belly. | [coach] |
| x05 | 3, spinning back fist |  |  | The hook turns you; keep turning and the back fist lands on the same side. | [coach] |
| L01 | 1, 2, lead head kick, slip, pull, body jab, step in, liver shot, 3 |  | long kick liver | Milan's string: attack, defend, and attack again, high and low, without a break. | [coach] |
| L02 | 1, 3, 2, slip, 2, liver shot, step out |  | long hook liver | 1, 3, 2, slip their answer, cross, liver, out. | [coach] |
| L03 | up jab, 2, roll, 3, rear body kick |  | long hook kick body | Up jab, cross, roll their hook, and hook into the rear body kick. | [coach] |
| L04 | 1, 1, 2, pull, 2, lead head kick |  | long pull kick | Double jab and cross, pull their answer, cross, lead head kick off the turn. | [coach] |
| L05 | liver shot, 3, 2, slip, 2, step out |  | long liver hook | Down, up, through, slip, cross, gone. | [coach] |
| L06 | feint 1, calf kick, 1, 3, 2, pivot out |  | long kick hook | Adesanya's calf kick setup, then the 1, 3, 2 and off the line. | [coach] |
| L07 | teep, 1, 2, slip, liver shot, 3, rear body kick |  | long liver kick | Teep, one two, slip, liver, hook, and the hook loads the body kick. | [coach] |
| L08 | 2, 3, clinch, knee, knee, frame out, 2 |  | long clinch knee | Punch in, knees in the clinch, frame out, cross. | [coach] |
| L09 | 1, 2, roll, 3, rear uppercut, 3, step out |  | long upper hook | One two, roll their answer, hook-uppercut-hook, out. | [coach] |
| L10 | body jab, 2, 3, lead uppercut, 2, step out |  | long upper body | Body jab, cross, hook, uppercut, cross, out. | [coach] |
| L11 | slip, 2, liver shot, 3, roll, 3, 2 |  | long liver hook counter | Counter, body-head, roll, and the 3, 2 again. | [coach] |
| L12 | oblique kick, 1, 2, slip, 2, liver shot |  | long kick liver | Stop them with the oblique, one two, slip, cross, liver. | [coach] |
| L13 | 1, 3, 2, pull, 2, lead body kick |  | long hook pull kick | 1, 3, 2, pull their answer, cross, and the lead body kick off the turn. | [coach] |
| L14 | step in, 2, 3, 2, pull, 2, step out |  | long hook pull exit | Ruffy-style entry, pull the counter, cross, gone. | [coach] |
| L15 | up jab, 2, 3, rear uppercut, 3, rear head kick |  | long upper kick | Six strikes: the last hook loads the rear head kick. | [coach] |
| L16 | front kick, 1, 2, liver shot, 3, step out |  | long kick liver | Front kick to stop them, then hands high and low, out. | [coach] |

## Trap sequences

The repeated calls condition the opponent; the last call breaks the pattern. Later rounds call back to traps done earlier in the session (pattern once, then the break).

| id | sequence | fighter | why it works | src |
|---|---|---|---|---|
| t01 | 1, body 2 | 1, body 2 | body 2, rear head kick |  | Two body crosses teach them to drop the elbow; the third goes high. | [evolve_headkick], [be_highkicks] |
| t02 | 1, 2 | 1, 2 | 2, lead head kick |  | After repeated one twos they cover high and centre; the lead kick goes around. | [ds_ludwig] |
| t09 | 1, 2, step out | 1, 2, step out | 1, 2, pull, 2 | McGregor | Leaving after the one two invites them to follow; the third time you stay and counter. | [evolve_pull] |
| t10 | lead body kick | lead body kick | lead head kick |  | Body kicks make them drop the arm; the same kick goes upstairs. Jones did it to Cormier. | [evolve_headkick] |
| t14 | pull, 2 | pull, 2 | pull, lead head kick |  | Twice they eat the pull counter and cover for the cross; the third answer is the kick. | [evolve_pull], [evolve_headkick] |
| t15 | 1, 2, liver shot, low kick | 1, 2, liver shot, low kick | 1, 2, liver shot, rear head kick |  | Dutch style: they learn to check the low kick after the punches; the same kick goes high. | [evolve_headkick] |
| tl1 | liver shot, 2 | liver shot, 2 | liver shot, 3 |  | After two liver-cross they drop the right elbow for the body; the hook goes to the head. | [coach] |
| tl2 | 1, 3, 2 | 1, 3, 2 | 1, liver shot, 3 |  | They wait for the hook high; this time it goes to the liver first. | [coach] |
| tu1 | 3, 2 | 3, 2 | 3, rear uppercut, 3 |  | Hooks make them cover the sides; the uppercut splits the middle. | [coach] |
| ta1 | front kick | front kick | question mark kick | Adesanya | Two real front kicks to the body teach them to drop the hands; the third chambers the same and turns over to the head. | [fightprimer_adesanya], [sk_adesanya_qmark] |
| ta2 | feint 1, calf kick | feint 1, calf kick | feint 1, 2 | Adesanya | After two calf kicks they lift the leg on every jab fake; the third time the 2 lands on a man standing on one foot. | [fightprimer_adesanya], [user_lead] |
| tm1 | front kick, 2 | front kick, 2 | front kick, back kick | McGregor | Front kick and straight walks them to the fence; the third time the spinning back kick lands as they brace for the straight. | [sk_mcg_unorthodox], [sherdog_prev189] |
| tm2 | rear body kick | rear body kick | feint kick, 2 | McGregor | Two body kicks and they flinch at any kick; fake it and the 2 lands on the flinch. | [be_mcg_cerrone] |
| tm3 | 1, step out | 1, step out | 1, hop back, 2 | McGregor | Jab and leave twice so they start to chase; the third time back-skip and counter as they come. | [vice_mcg_alvarez], [fox_ufc205] |
| tr1 | 1, 2 | 1, 2 | feint 1, wheel kick | Ruffy | One twos make them raise the hands at any jab; the feint does the rest and the wheel kick goes round the guard. | [keviniole_ruffy], [lowkick_ruffy_koty] |
| t19 | 1, pull | 1, pull | 1, pull, 2 |  | Two empty pulls make them commit to the counter; the third time it's waiting for them. | [evolve_pull], [ds_pull] |
| ts1 | rear body kick | rear body kick | superman punch |  | Two body kicks make them drop the elbow and wait for the kick; the same start becomes the superman punch. | [coach] |

## Incoming attacks

A forced pause after the last combo, an alert chirp, then a **different voice** (female, en-US) says "Incoming cross!". After a short reaction window the coach says the defence and counter (can be switched off).

| id | incoming | defend → counter | fighter | why | src |
|---|---|---|---|---|---|
| d01 | jab | parry, 1, 2 |  | Parry the jab with the rear hand; the lead hand is free, so jab straight back, then cross. | [evolve_counter5] |
| d02 | jab | pull, 2 | McGregor | Lean back just enough for the jab to fall short, then cross over it. | [evolve_pull], [ds_pull] |
| d03 | jab | slip, 2 |  | Slip outside the jab; your cross is loaded on that side. | [evolve_counter5] |
| d04 | jab | step back, 1, 2 |  | Step out of range, then come back as they recover. | [evolve_headmove] |
| d05 | jab | pull, lead head kick |  | After the pull your weight is back and the lead leg is free. | [coach] |
| d06 | cross | pull, 2 | McGregor | The cross falls short when you pull; your cross comes back while their chin is open. | [evolve_pull], [sherdog_mcg] |
| d07 | cross | slip, 3 |  | Slip outside the cross and the lead hook is loaded on that side. | [evolve_counter5] |
| d08 | cross | shoulder roll, 2 |  | Take it on the shoulder and fire the cross straight back. | [evolve_mayweather] |
| d09 | cross | pull, 3 | Adesanya | Pull, and hook them as their cross comes back. | [evolve_pullcombos], [1news_whittaker] |
| d10 | cross | parry, 2 |  | Their cross is parried by your lead hand, so the rear hand is free: fire the 2 straight back. | [evolve_counter5] |
| d11 | lead hook | roll, 3, 2 |  | Roll under the hook and come back with your own hook and cross. | [evolve_headmove] |
| d12 | lead hook | pull, 2 |  | The hook passes in front of your face; the cross goes through the middle it opened. | [evolve_pull] |
| d13 | lead hook | block, 2, step out |  | Glove to the temple, answer straight, and leave before the next one. | [evolve_mt_def] |
| d14 | rear hook | block, 3 |  | Block the rear hook; your lead hook is the shortest answer. | [evolve_block_counter] |
| d15 | overhand | step back, 1, 2 |  | The overhand is long and slow: step back, let it miss, punish the gap. | [coach] |
| d16 | jab cross | parry, pull, 2 |  | Parry the jab, pull from the cross, and cross back over it. | [evolve_pullcombos] |
| d17 | jab cross | step back, 2 |  | Step back from both, then cross as they finish. | [evolve_headmove] |
| d18 | double jab | parry, parry, 1, 2 |  | Parry both jabs with the rear hand, then jab and cross on the third beat. | [evolve_counter5] |
| d19 | rear low kick | check, 2 |  | Check with the lead shin and cross while they land square. | [evolve_check], [evolve_lowkick_def] |
| d20 | rear low kick | step back, 2 |  | Pull the leg back so the kick misses, then cross as they swing through. | [evolve_lowkick_def] |
| d21 | rear low kick | check, low kick |  | Check, then answer kick for kick. | [evolve_check] |
| d22 | calf kick | check, 2 |  | Turn the knee out to check the calf, then cross as they land. | [evolve_check] |
| d23 | calf kick | check, teep |  | Check and teep straight away so they can't follow up. | [evolve_mt_counters] |
| d24 | body kick | catch, 2 |  | Catch the body kick and cross while they hop on one leg. | [evolve_mt_def] |
| d25 | body kick | block, rear body kick |  | Block it, then kick back on the same side while they reset. | [evolve_block_counter] |
| d26 | rear head kick | block, 2 |  | Block high, arm tight to the head, then cross while they land. | [evolve_mt_def] |
| d27 | rear head kick | pull, 1, 2 |  | Lean back and let it pass in front of you, then punish as they turn open. | [evolve_mt_def] |
| d28 | lead head kick | block, 1, 2 |  | Block with the rear arm, then jab and cross before they reset their feet. | [evolve_block_counter] |
| d29 | lead head kick | step back, 2 |  | Step back out of the arc; their hip is open as the kick passes. | [evolve_mt_def] |
| d30 | teep | parry, 1, 2 |  | Sweep the teep across with the rear hand; they turn sideways, jab and cross. | [evolve_teep_def] |
| d31 | teep | catch, 2 |  | Catch the teep and cross while they balance on one leg. | [evolve_teep_def] |
| d32 | teep | angle out, low kick |  | Step off the line and low kick the leg they are standing on. | [evolve_teep_def] |
| d33 | cross | hop back, 2 | McGregor | Back-skip out of range and land the 2 as they square up. | [vice_mcg_alvarez], [fox_ufc205] |
| d34 | blitz | check hook, pivot out | Adesanya | When they rush in, pivot as you throw the lead hook; they run into it and you are off the line. | [1news_whittaker], [cbs_ufc243] |
| d35 | jab cross | pull, 3 | Adesanya | Pull from the cross; they overextend and the lead hook catches them coming in. | [1news_whittaker], [cbs_ufc243] |
| d36 | takedown | sprawl, 1, 2 |  | Hips back and down, then back up and punish as they stand. | [coach] |
| d37 | blitz | pull, 2, step out | McGregor | Pull from the rush, straight down the middle, then leave on the angle. | [evolve_pull], [fox_ufc205] |
| d38 | body hook | block, 3, 2 |  | Elbow down on the body hook, then hook and cross straight back. | [evolve_mt_def] |
| d39 | uppercut | pull, 2 |  | Lean back from the uppercut; it passes in front of you and the cross is open. | [evolve_pull] |
| d40 | clinch | frame out, 2 |  | Frame on the neck and shoulder, push off, and cross as they let go. | [coach] |
| d41 | body hook | step back, 2 |  | Step back out of the body hook; it falls short and the cross lands. | [coach] |
| d42 | jab | slip, liver shot, 3 |  | Slip outside the jab and dig the liver, then hook up top. | [coach] |
| d43 | cross | roll, 3, 2 |  | Roll under the cross, come up with the hook and the cross. | [evolve_headmove] |

## Flurries

Hard days: two 15–20 s all-out flurries in the middle of every round, plus the last 20 s. The burnout finisher is 6 × (20 s on, 10 s off).

| flurry | spoken |
|---|---|
| straights | Straights. One two, nonstop, all out. |
| body | Two to the body, two to the head. Nonstop. |
| jabs | Jabs only. As fast as you can. |
| upjab | Up jab, two, up jab, two. Nonstop. |
| pull2 | Pull and two. Pull and two. Nonstop. |
| hooks | Three, two, three, two. Nonstop. |
| kicks | Body kicks. Switch legs every kick. |
| teeps | Teep, one two, teep. Nonstop. |
| sprawls | Sprawl, back up, one two. Nonstop. |
| liver | Liver shot, hook up top. Nonstop. |

## Audit

Changes from v1:

- Incoming attacks are now spoken by a second, female en-US voice as 'Incoming cross!', after an alert chirp and a forced silence. v1 said 'Cross!' in the coach voice straight after a numbered combo, which is how 'one, two, cross' happened.
- k03 '1, 2, low kick' became '1, low kick' and t15 became the Dutch '1, 2, 3, low kick' pattern, for the same reason as k06. k06 '1, 2, rear body kick' became '1, 2, 3, rear body kick': straight after the cross the rear kick is not loaded (rear hand into rear leg); the lead hook reloads the hips.
- k07 kept as 'feint kick, 2' (fake the kick, land the cross on the flinch).
- k01 'body 2, rear head kick' kept on purpose (Milan's favourite), marked ok in the audit.
- v1 rare r06 'rear head kick, wheel kick' dropped: two full spins of the same leg in a row is not something anyone sets up on purpose.
- v1 rare r01 became mc07 (McGregor's spinning back kick to the body after the one two). The rest of the rare list moved into combos, capped by the spin limit.
- Every offence call is checked by tools/build_library_md.py: no 'cross'/'hook' words in offence (numbers only), no doubled tokens except pumped jabs/kicks/pulls, combos end on a strike or an exit, rear hand straight into a rear kick is flagged, every token is in the known vocabulary, every source key exists.
- v4: no teep-teep or double front kick inside one combo (a freestanding bag moves away after the first one); after parrying a jab with the rear hand the lead hand fires first (parry, 1, 2), and only a parried cross is answered with the 2. The audit now enforces both.
- v6: Milan found single-theme rounds boring. Now there are 3 options (Fight mix hard / technical, Counters and defence), every round mixes everything, and the fighter setups are 2-minute spotlights. Added hooks (1, 3, 2), the liver shot, uppercuts, clinch on the bag, and long fast strings. No '1, 2, 3' (Milan: it doesn't make sense to him; 1, 3, 2 instead), and the audit enforces that. Lone-jab traps (1 | 1 | 1 ...) and near-duplicates removed.
- v6: all sessions are hard (Milan: no easy options). Third option is Kicks (everything, kick-heavy). Added the lead side kick.

Automatic checks (run on every build of this file): **all passed.**

- k01 (body 2, rear head kick): kept on purpose: rear hand into rear kick on purpose: Milan's favourite, the body cross dips the hips and the kick comes off that dip
- t01 (1, body 2 | 1, body 2 | body 2, rear head kick): kept on purpose: builds on k01 (body 2, rear head kick), Milan's favourite

## Sources

Research was done by web search (Nov 2026). The articles below are the ones the lines are based on; they are fight reports and breakdowns, not formal studies. In this build the pages could not be opened directly from the build machine, so the fighter claims rest on the search-result summaries of these pages; open the links to check a detail. `coach` marks lines that are standard striking logic with no single source; `user_lead` marks research leads from Milan's feedback that no breakdown found in search confirmed (e.g. Adesanya's jab to make them slip into a high kick, Ruffy mixing spins into fast combos).

- **[evolve_pull]** [What Is The Pull Counter In Boxing And How To Use It (Evolve MMA)](https://evolve-mma.com/blog/what-is-the-pull-counter-in-boxing-and-how-to-use-it/)
- **[evolve_pullcombos]** [10 Pull-Back Combinations For Boxing (Evolve MMA)](https://evolve-mma.com/blog/10-pull-back-combinations-for-boxing/)
- **[ds_pull]** [The Pull Counter in Boxing (Dynamic Striking)](https://dynamicstriking.com/blogs/news/pull-counter-in-boxing)
- **[evolve_counter5]** [5 Boxing Counter Combinations You Can Add To Your Game (Evolve MMA)](https://evolve-mma.com/blog/5-boxing-counter-combinations-you-can-add-to-your-game/)
- **[evolve_headmove]** [4 Head Movement Techniques For Boxing (Evolve MMA)](https://evolve-mma.com/blog/4-head-movement-techniques-for-boxing-and-how-to-train-them/)
- **[evolve_mayweather]** [5 Of Floyd Mayweather's Signature Boxing Techniques (Evolve MMA)](https://evolve-mma.com/blog/5-of-floyd-mayweathers-signature-boxing-techniques-you-can-add-to-your-game/)
- **[sherdog_mcg]** [The Film Room: Conor McGregor (Sherdog)](https://sherdog.com/news/articles/The-Film-Room-Conor-McGregor-143473)
- **[be_mcg_siver]** [Judo Chop: McGregor vs Siver, maximizing the puncher's chance (Bloody Elbow)](https://bloodyelbow.com/2015/01/21/conor-mcgregor-siver-ufc-boston-judo-chop-maximizing-puncher-chance-mma-technique-breakdown-gif-ko)
- **[be_mcg_mendes]** [Judo Chop: McGregor vs Mendes, strengths and weaknesses (Bloody Elbow)](https://bloodyelbow.com/2015/07/13/ufc-189-judo-chop-mcgregor-mendes-weakness-strength-conor-mma-technique-knockout-gif)
- **[vice_mcg_alvarez]** [The Tactical Guide to Conor McGregor vs Eddie Alvarez (Vice)](https://vice.com/en/article/the-tactical-guide-to-conor-mcgregor-versus-eddie-alvarez)
- **[lowkick_ruffy]** [Mauricio Ruffy 'the Sniper' at UFC 325 (LowKick MMA)](https://www.lowkickmma.com/mma-world-reacts-as-mauricio-ruffy-returns-to-winning-ways-at-ufc-325/)
- **[evolve_pereira]** [How To Fight Like Alex Pereira (Evolve MMA)](https://evolve-mma.com/blog/how-to-fight-like-alex-pereira-breaking-down-the-style-of-poatan/)
- **[fightlib_pereira]** [How Alex Pereira conducts his offensive onslaught (Fight Library)](https://fight-library.com/2024/03/30/how-alex-pereira-conducts-his-offensive-onslaught/)
- **[evolve_headkick]** [The Art Of Setting Up A Head Kick (Evolve University)](https://evolve-university.com/blog/the-art-of-setting-up-a-head-kick-tricks-for-catching-opponents-off-guard/)
- **[be_highkicks]** [Essential MMA techniques: High kicks, part 1 (Bloody Elbow)](https://bloodyelbow.com/2019/09/04/essential-mma-techniques-high-kicks-part-1-donald-cerrone-anderson-silva-lyoto-machida)
- **[ds_ludwig]** [Landing the head kick with Duane Ludwig (Dynamic Striking)](https://dynamicstriking.com/blogs/news/landing-the-head-kick-with-duane-ludwig)
- **[ds_moraes]** [Simple set-up for the head kick with Marlon Moraes (Dynamic Striking)](https://dynamicstriking.com/blogs/news/surprisingly-simple-set-up-for-the-head-kick-with-marlon-moraes)
- **[evolve_mt_def]** [10 Essential Muay Thai Defense Techniques (Evolve MMA)](https://evolve-mma.com/blog/10-essential-muay-thai-defense-techniques-to-master/)
- **[evolve_block_counter]** [5 Muay Thai Block And Counter Combinations (Evolve University)](https://evolve-university.com/blog/5-muay-thai-block-and-counter-combinations-you-must-know/)
- **[evolve_lowkick_def]** [How Do You Defend Muay Thai Low Kicks? (Evolve University)](https://evolve-university.com/blog/how-do-you-defend-muay-thai-low-kicks/)
- **[evolve_check]** [How To Check Kicks In Muay Thai (Evolve MMA)](https://evolve-mma.com/blog/how-to-check-kicks-in-muay-thai)
- **[evolve_teep_def]** [The 3 Best Ways To Defend A Muay Thai Push Kick (Evolve University)](https://evolve-university.com/blog/the-3-best-ways-to-defend-a-muay-thai-push-kick/)
- **[evolve_mt_counters]** [3 Muay Thai Counters You Need To Know (Evolve MMA)](https://evolve-mma.com/blog/3-muay-thai-counters-you-need-to-know/)
- **[coach]** General striking coaching logic (no single source; reasoning written out in the why-line)
- **[fightprimer_adesanya]** [Advanced Striking 20: Israel Adesanya (Fight Primer)](https://www.fightprimer.com/advanced-striking-20-israel-adesanya-bit-of-a-weeb-tho)
- **[sherdog_adesanya]** [The Film Room: Israel Adesanya (Sherdog)](https://sherdog.com/news/articles/The-Film-Room-Israel-Adesanya-152583)
- **[sk_adesanya_feints]** [Watch: Israel Adesanya breaks down his feinting technique (Sportskeeda)](https://www.sportskeeda.com/mma/news-watch-israel-adesanya-breaks-feinting-technique)
- **[sk_adesanya_qmark]** [Watch: Israel Adesanya breaks down the technique for his question mark kick (Sportskeeda)](https://www.sportskeeda.com/mma/news-watch-israel-adesanya-breaks-technique-question-mark-kick)
- **[sk_adesanya_5tech]** [5 Israel Adesanya striking techniques (Sportskeeda)](https://sportskeeda.com/mma/5-israel-adesanya-striking-techniques)
- **[1news_whittaker]** [Israel Adesanya lands deadly left hook to knock out Robert Whittaker (1News, UFC 243)](https://www.1news.co.nz/2019/10/06/israel-adesanya-lands-deadly-left-hook-to-knock-out-robert-whittaker-claim-ufc-title)
- **[cbs_ufc243]** [UFC 243 results: Adesanya claims middleweight crown with TKO of Whittaker (CBS Sports)](https://www.cbssports.com/mma/news/ufc-243-results-highlights-israel-adesanya-claims-middleweight-crown-with-violent-tko-of-robert-whittaker/amp)
- **[keviniole_ruffy]** [UFC 313: Mauricio Ruffy puts King Green to sleep with wheel kick (keviniole.com)](https://www.keviniole.com/2025/03/08/mauricio-ruffy-scores-incredible-headkick-ko-of-king-green)
- **[lowkick_ruffy_koty]** [LowKick MMA 2025 KO of the Year: Ruffy's spinning wheel kick over King Green](https://www.lowkickmma.com/lowkick-mmas-2025-awards-ko-of-the-year-mauricio-ruffys-spinning-wheel-kick-over-king-green/)
- **[cageside_ruffy_mullarkey]** [Mauricio Ruffy finishes Jamie Mullarkey at UFC 301 (Cageside Press)](https://cagesidepress.com/2024/05/04/mauricio-ruffy-puts-on-showstopper-finishes-jamie-mullarkey-at-ufc-301)
- **[cageside_ruffy_llontop]** [UFC 309: Ruffy goes the distance against James Llontop (Cageside Press)](https://cagesidepress.com/2024/11/16/ufc-309-mauricio-ruffy-goes-distance-for-the-first-time-against-tough-as-nails-james-llontop)
- **[cageside_ruffy_chandler]** [Mauricio Ruffy delivers highlight-reel KO against Chandler (Cageside Press)](https://cagesidepress.com/2026/06/14/mauricio-ruffy-delivers-highlight-reel-ko-against-chandler-at-ufc-white-house/)
- **[sherdog_prev189]** [Preview: UFC 189 Mendes vs McGregor (Sherdog): spinning kicks cut off escape angles except into the left straight](https://dev.sherdog.com/news/articles/1/Preview-UFC-189-Mendes-vs-McGregor-88663)
- **[sk_mcg_unorthodox]** [5 unorthodox but effective strikes Conor McGregor may use vs Poirier (Sportskeeda)](https://sportskeeda.com/mma/ufc-264-5-unorthodox-effective-strikes-conor-mcgregor-may-use-trilogy-fight-dustin-poirier)
- **[mma_oblique]** [Savate oblique kicks (MixedMartialArts.com): McGregor's oblique kick vs Diaz, UFC 196](https://www.mixedmartialarts.com/mma/savate-oblique-kicks-jon-jones)
- **[be_mcg_cerrone]** [UFC 246 McGregor vs Cerrone quick analysis (Bloody Elbow)](https://bloodyelbow.com/2020/01/19/ufc-246-conor-mcgregor-donald-cerrone-quick-analysis-breaking-down-shoulder-bumps-mma-results-news)
- **[fox_ufc205]** [UFC 205 Breakdown: Conor McGregor's Double Crown (Fox Sports)](https://amp.foxsports.com/stories/ufc/ufc-205-breakdown-conor-mcgregors-double-crown)
- **[mmatorch_pull]** [Floyd Mayweather vs Conor McGregor breakdown: the pull counter (MMATorch)](https://mmatorch.com/?p=15442)
- **[user_lead]** Research lead from Milan's v1 feedback, not independently confirmed by a breakdown found in search
