# Combo & defence library

Generated from `library.json` by `tools/build_library_md.py`. Edit the JSON, not this file.

Orthodox stance. 1 jab, 2 cross, 3 lead hook, 4 rear hook; **up jab** = lead-hand long uppercut from range; **check hook** = lead hook thrown while pivoting off the line. `|` separates the calls of a trap sequence. McGregor is southpaw: his straight left is Milan's **2**, and his kicks to his right side are mirrored here.

**Totals:** 125 combos, 29 trap sequences, 37 incoming attacks with answers, 9 round themes. 16 entries contain a spinning or flying technique; the engine caps them per round (1 per round, 4 in the McGregor/Ruffy spin themes), so jabs and straights stay far more frequent.

## Round themes

Each 10-minute round teaches one setup: the coach explains it in one line, you drill it (first ~15% of the round), then it is mixed in with related calls (to ~50%), then hidden among everything else with traps and callbacks to earlier traps (to the end). Intensity rises through the round.

**Snipe days**

| round | theme | setup taught | spoken teach line | related calls |
|---|---|---|---|---|
| 1 | McGregor's straight | `feint 1, 2` | The setup: feint the jab with your shoulder. When they flinch, two, straight down the middle. Drill it. | s01, s02, s16, s18, s26, t03, t16, mc01, s10, s29, s31 |
| 2 | Ruffy's in and out | `step in, 2, 3, step out` | The setup: one long step in, 2, 3, and step out before they answer. Hands can be low, feet never stop. Drill it. | ru02, ru08, s08, s19, e01, e02, e04, s25, tr2, s28, s32 |
| 3 | McGregor's pull counter | `1, pull, 2` | The setup: jab, lean back just out of their answer, and fire the 2 over it. Drill it. | p02, p09, p20, p21, p24, t08, t09, tm3, t19, p08, s30 |

**Kicks days**

| round | theme | setup taught | spoken teach line | related calls |
|---|---|---|---|---|
| 1 | Adesanya's feints into kicks | `feint 1, calf kick` | The setup: fake the jab. While they're frozen, calf kick the front leg. Drill it. | ad01, ad02, ad06, s26, k07, k18, ta2, ta4, k11, k20, k25 |
| 2 | Front kick and question mark kick | `front kick | front kick | question mark kick` | The setup: front kick to the body, twice. They drop their hands to catch it. The third one chambers the same and turns over to the head. Drill it. | ad05, ad07, ad08, ad04, ta3, mc01, k05, t13, s14, k26, k24 |
| 3 | McGregor's kicks and spins | `front kick, 2 | front kick, 2 | front kick, back kick` | The setup: front kick, 2. Twice. Then front kick and spin into the back kick while they brace for the 2. Drill it. | mc01, mc02, mc03, mc04, mc05, mc06, mc07, tm2, mc08, k21, k22, k23 |

**Counter days**

| round | theme | setup taught | spoken teach line | related calls |
|---|---|---|---|---|
| 1 | Pull counter defence | `incoming cross → pull, 2` | The setup: when you hear incoming cross, lean back just out of range and fire your 2 straight back. Drill it. | d02, d06, d33, d37, p02, p04, p05, p19, p21, x07 |
| 2 | Adesanya's counters | `incoming blitz → check hook, pivot out` | The setup: when they rush in, don't back up straight. Pivot as you throw the lead hook, and you're off the line. That's how Adesanya finished Whittaker. Drill it. | d34, d35, d09, d11, p22, p23, p17, d12 |
| 3 | Ruffy's counters and spins | `feint 1, wheel kick` | The setup: fake the jab, and let the turn of the feint become the spinning wheel kick. The King Green knockout. Drill it slow first. | ru04, ru05, ru06, ru07, tr1, d19, d22, d24, d26, d28, d30 |

## Combos

| id | call | fighter | tags | why it works | src |
|---|---|---|---|---|---|
| s01 | 1, 2 |  | snipe jab warm | The jab measures and blinds; the cross travels down the same line. | [coach] |
| s02 | 1, 1, 2 |  | snipe jab | The double jab steals distance, and the second jab hides the cross. | [coach] |
| s03 | 1, body 2 |  | snipe jab | Jab high lifts the guard; the cross goes under it to the body. | [coach] |
| s04 | body jab, 2 |  | snipe jab | Jab to the body drops the hands; the cross goes to the open chin. | [coach] |
| s05 | up jab, 2 |  | snipe jab | The up jab splits the guard from below; the cross follows through the gap. | [coach] |
| s06 | 1, up jab, 2 |  | snipe jab | The normal jab makes them shell high; the up jab comes under the gloves. | [coach] |
| s07 | up jab, step out | Ruffy | snipe jab warm exit | Touch with the up jab from range and leave before they can answer. | [lowkick_ruffy] |
| s08 | 1, 2, step out | Ruffy | snipe exit warm | Land the one two and leave on an angle. Never stay to admire it. | [lowkick_ruffy] |
| s09 | feint 1, 2 | McGregor | snipe | The jab feint freezes them; the cross lands while they are still reacting. | [sherdog_mcg], [fox_ufc205] |
| s10 | feint 2, 1, 2 |  | snipe | Fake the cross so they cover; jab and cross land as they open back up. | [coach] |
| s11 | 1, 2, 1 |  | snipe jab | Finishing on the jab keeps them on the end of your reach while you reset. | [coach] |
| s12 | 1, body 2, 2 |  | snipe | Same cross on two levels: they can only guard one of them. | [coach] |
| s13 | 1, 2, teep |  | snipe teep warmkick | The teep after the cross pushes them straight back out to your range. | [coach] |
| s14 | teep, 1, 2 |  | snipe teep | The teep stops their step; the jab and cross catch them while they reset. | [coach] |
| s15 | 1, teep |  | snipe teep jab warmkick | The jab lifts their hands and eyes; the teep lands in the open belly. | [coach] |
| s16 | feint 1, body 2 | McGregor | snipe | A jab feint makes them lift the guard; drive the cross into the body. | [sherdog_mcg], [fox_ufc205] |
| s17 | 1, pivot out |  | snipe jab warm exit | Jab and angle off: they reset facing an empty spot. | [coach] |
| s18 | 1, 1, 1, 2 |  | snipe jab | Pumping jabs set a rhythm; the cross breaks it. | [coach] |
| s19 | 2, step out | McGregor | snipe exit | A long cross from outside, then leave on the angle before they answer. | [be_mcg_siver] |
| s20 | body 2, up jab |  | snipe jab | The body cross pulls their elbows down; the up jab rises straight through. | [coach] |
| s21 | 1, 2, 1, 2 |  | snipe | Four straights: every hand comes straight back to the face. | [coach] |
| s22 | 1, 1 |  | snipe jab warm | The double jab: the first finds the range, the second scores. | [coach] |
| s23 | body 2, 2 |  | snipe | Body then head with the same hand: the eyes follow the first one down. | [coach] |
| s24 | feint level change, 2 |  | snipe | In MMA a level change sells the takedown; the cross lands as they sprawl. | [coach] |
| s25 | 1, 2, 3, step out |  | snipe exit | They move away from the cross into the hook. Then you leave. | [coach] |
| e01 | 3, 2, step out |  | exit | The lead hook pulls their guard wide; the cross goes down the middle, then step out. | [coach] |
| e02 | 2, 3, 2, pivot out |  | exit | Cross, hook, cross turns them; pivot out so they punch where you were. | [coach] |
| e03 | body 3, 3, step out |  | exit | The hook to the liver drops their elbow; the same hook goes up top. Then leave. | [coach] |
| e04 | 2, 3, angle out |  | exit | Punish on the inside, then angle off before they can clinch or trade. | [coach] |
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
| p15 | pull, teep |  | pull counter teep | If they keep walking after the miss, teep them back to range. | [coach] |
| p16 | pull, lead head kick |  | pull counter kick | After the pull your weight is on the back leg, so the lead leg is free to kick. | [coach] |
| p17 | pull, 3 |  | pull counter | Pull, and come back with the lead hook as they reach. | [evolve_pullcombos] |
| p18 | step back, 2 |  | counter snipe | Stepping back draws them in; the cross meets them on the step. | [evolve_lowkick_def] |
| p19 | pull, pull, 2 |  | pull counter | Pull from the one two and fire your cross as their second hand comes back. | [evolve_pullcombos] |
| p20 | 1, pull, 2, step out | McGregor | pull counter exit | Bait, pull, punish, leave. The whole sniper game in one combo. | [evolve_pull], [lowkick_ruffy] |
| k01 | body 2, rear head kick |  | kick | The body cross pulls their elbow down; the rear kick goes over it to the head. | [evolve_headkick] |
| k02 | 2, lead head kick |  | kick | The cross turns your hips; let the lead leg ride that turn up to the head. | [ds_ludwig], [be_highkicks] |
| k03 | 1, low kick |  | kick warm warmkick | The jab raises their eyes; the rear low kick lands where they aren't looking. | [evolve_headkick] |
| k04 | 1, rear head kick |  | kick jab | The jab blinds them; the rear head kick comes around the side. | [ds_moraes] |
| k05 | teep, rear head kick |  | kick teep | The teep makes them guard the middle; the head kick goes around it. | [evolve_headkick] |
| k06 | 1, 2, 3, rear body kick |  | kick | The lead hook turns them and reloads your hips; the rear kick lands on the open side. | [coach] |
| k07 | feint kick, 2 |  | kick snipe | Fake the kick so they lift the leg; the cross lands while they stand on one foot. | [evolve_headkick] |
| k08 | up jab, rear head kick |  | kick jab | The up jab splits the guard upward; the head kick comes around it. | [coach] |
| k09 | lead body kick, 2 |  | kick | The lead kick to the body brings their elbow down; the cross follows straight. | [coach] |
| k10 | 1, 2, 3, low kick |  | kick | Dutch style: punches up top hide the low kick finish. | [evolve_headkick] |
| k11 | calf kick, 2 |  | kick | The calf kick makes them shift their weight; the cross catches them flat. | [coach] |
| k12 | 1, 2, 3, rear head kick |  | kick | The hook pulls their guard to one side; the rear kick lands on the other. | [evolve_headkick] |
| k13 | feint 2, lead head kick |  | kick | Fake the cross so they cover the centre; the lead kick comes around the side. | [ds_ludwig] |
| k14 | 2, lead body kick |  | kick | The cross turns you; the lead kick lands on the liver side. | [coach] |
| k15 | low kick, 2 |  | kick warmkick | The low kick drops their eyes; the cross follows up top. | [coach] |
| k16 | body jab, lead head kick |  | kick jab | The body jab pulls their hands down; the lead leg goes high. | [evolve_headkick] |
| k17 | teep, 2, lead head kick |  | kick teep | Teep to set range, cross to turn them, lead kick to finish on the open side. | [coach] |
| k18 | feint low kick, rear head kick |  | kick | Fake low, go high: their guard follows the fake down. | [evolve_headkick] |
| k19 | teep, 1, 2 |  | kick teep warm warmkick | The teep stops them; jab and cross land while they come back in. | [evolve_pereira] |
| s26 | shoulder feint, 1, 2 | Adesanya | snipe feint | A shoulder twitch costs nothing and makes them react; the one two lands on the reaction. | [sherdog_adesanya], [sk_adesanya_feints] |
| s27 | 1, 2, 3, 2 |  | snipe | The hook turns their head into the line of the last cross. | [coach] |
| s28 | 2, 3, 2 | Ruffy | snipe | Cross, hook, cross: each punch loads the next one. | [cageside_ruffy_mullarkey] |
| e05 | 3, rear elbow, step out |  | exit elbow | Close range is punish and exit: the hook turns them, the elbow comes across, then you leave. | [coach] |
| e06 | 2, lead elbow, pivot out |  | exit elbow | If the cross gets you too close, turn it into a lead elbow and pivot off the line. | [coach] |
| e07 | 2, 3, knee, step out |  | exit knee | Cross and hook bend them over; the knee comes up the middle. Short knee, the bag moves. | [coach] |
| p21 | hop back, 2 | McGregor | pull counter snipe | McGregor's back-skip: hop back and to your right, and the 2 meets them as they square up chasing. | [vice_mcg_alvarez], [fox_ufc205] |
| p22 | 1, pull, 3 | Adesanya | pull counter | When they overextend on the answer, the lead hook catches them. Adesanya finished Whittaker this way. | [1news_whittaker], [cbs_ufc243] |
| p23 | pull, check hook, pivot out | Adesanya | pull counter | Pull from the punch, then the lead hook as you pivot: they fall into it and you are already off the line. | [1news_whittaker] |
| p24 | 1, hop back, 2 | McGregor | pull counter snipe | Jab to make them answer, back-skip out of the answer, 2 on the way in. | [vice_mcg_alvarez], [mmatorch_pull] |
| ad01 | shoulder feint, lead body kick | Adesanya | kick feint | Adesanya's shoulder feint makes them guard high; the lead kick goes to the open body. | [sherdog_adesanya], [fightprimer_adesanya] |
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
| ru01 | step in, 2, 3, step out | Ruffy | snipe exit | Ruffy's dart: one long step in, right hand, left hook, and out before they answer. | [cageside_ruffy_mullarkey], [cageside_ruffy_llontop] |
| ru02 | step in, 2, step out | Ruffy | snipe exit | In with the right hand and straight back out: hit and don't be there. | [cageside_ruffy_mullarkey] |
| ru03 | feint 1, wheel kick | Ruffy | kick feint | The UFC 313 knockout: a jab feint raises their hands for the punch and the turn of the feint becomes the wheel kick. | [keviniole_ruffy], [lowkick_ruffy_koty] |
| ru04 | back kick, wheel kick | Ruffy | kick | Spinning back kick to the body, then the spinning kick high. He dropped Chandler with that rhythm. | [cageside_ruffy_chandler] |
| ru05 | 2, 3, back kick | Ruffy | kick | The lead hook already turns you clockwise; keep turning into the back kick. | [cageside_ruffy_llontop], [user_lead] |
| ru06 | 1, 2, 3, wheel kick | Ruffy | kick | Fast hands bring their guard tight; the hook turns you into the wheel kick round the side. | [cageside_ruffy_llontop], [user_lead] |
| ru07 | 2, flying knee | Ruffy | knee | The right hand stumbles them and the flying knee meets them. That's how Mullarkey went. | [cageside_ruffy_mullarkey] |
| ru08 | 2, 3, 2, step out | Ruffy | snipe exit | Right, left, right, and leave. The basic Ruffy burst. | [cageside_ruffy_mullarkey] |
| s29 | 2, up jab |  | snipe jab | The 2 makes them shell high; the up jab comes up through the middle of the shell. | [coach] |
| s30 | up jab, 2, up jab |  | snipe jab | Up jab and 2 set each other up: under, over, under. | [coach] |
| s31 | 1, 2, up jab, 2 |  | snipe jab | The up jab splits the guard after the one two; the last 2 goes through the gap. | [coach] |
| s32 | up jab, 2, 3, 2 |  | snipe jab | Up jab lifts the chin, then cross, hook, cross while they are still looking up. | [coach] |
| k20 | 1, rear body kick |  | kick warmkick body | The jab raises their eyes and hands; the rear body kick lands under the elbow. | [evolve_headkick] |
| k21 | 3, rear body kick |  | kick body | The lead hook turns your hips the right way; the rear kick comes off that turn. | [coach] |
| k22 | 2, 3, rear body kick |  | kick body | Cross, hook, and the hook loads the rear body kick. Dutch style. | [evolve_headkick] |
| k23 | lead body kick, 2, 3, rear body kick |  | kick body | Body kicks on both sides with the hands in between: they can't guard both. | [coach] |
| k24 | rear body kick, 1, 2 |  | kick body | Land the body kick, step down forward, and the one two follows. | [coach] |
| k25 | up jab, lead body kick |  | kick jab body | The up jab lifts their guard; the lead body kick goes under it. | [coach] |
| k26 | 1, 2, lead body kick |  | kick body | The cross turns your hips; the lead body kick comes off that turn to the liver. | [coach] |
| x06 | sprawl, 1, 2 |  | counter | Sprawl the shot, back up to stance, punish as they stand. | [coach] |
| x07 | 1, 2, sprawl, 2 |  | counter | They duck under your one two for a takedown: sprawl and cross as they come up. | [coach] |
| x01 | low kick, wheel kick |  | kick | The low kick drops their eyes; the wheel kick comes around high. | [coach] |
| x02 | teep, flying knee |  | knee | The teep makes them rebound forward, straight into the knee. | [coach] |
| x03 | 1, flying knee |  | knee | The jab freezes their guard high; the flying knee comes from underneath. | [coach] |
| x04 | feint 2, back kick |  | kick | They brace for the cross; the back kick goes into the belly. | [coach] |
| x05 | 3, spinning back fist |  |  | The hook turns you; keep turning and the back fist lands on the same side. | [coach] |
| f01 | step in, step out |  |  | In and out: range is the first thing you control. | [coach] |
| f02 | circle left |  |  | Circle away from their power hand. | [coach] |
| f03 | circle right |  |  | Change direction so they can't time you. | [coach] |
| f04 | step in, pivot out |  |  | Step in, then turn off the line. | [coach] |
| f05 | step in, step out, circle left |  |  | In, out, and off the line. | [coach] |

## Trap sequences

The repeated calls condition the opponent; the last call breaks the pattern. Later rounds call back to traps done earlier in the session (pattern once, then the break).

| id | sequence | fighter | why it works | src |
|---|---|---|---|---|
| t01 | 1, body 2 | 1, body 2 | 1, body 2 | body 2, rear head kick |  | Three body crosses teach them to drop the elbow; the fourth goes high. | [evolve_headkick], [be_highkicks] |
| t02 | 1, 2 | 1, 2 | 2, lead head kick |  | After repeated one twos they cover high and centre; the lead kick goes around. | [ds_ludwig] |
| t03 | 1 | 1 | 1 | feint 1, 2 |  | Three identical jabs set the rhythm; the feint breaks it and the cross lands on the flinch. | [sherdog_mcg] |
| t04 | 1 | 1 | up jab, 2 |  | Straight jabs make them cover high; the up jab comes underneath on the third. | [coach] |
| t05 | teep | teep | feint kick, 2 |  | Two teeps make them reach for the leg; fake the third and cross over the lowered hand. | [evolve_teep_def] |
| t06 | body jab, body 2 | body jab, body 2 | body jab, 2 |  | Twice to the body drops their guard; the same entry goes to the head the third time. | [evolve_headkick] |
| t07 | low kick | low kick | 1, rear head kick |  | Low kicks pull their eyes and guard down; the same leg comes up high. | [evolve_headkick] |
| t08 | 1, step back | 1, step back | 1, pull, 2 | McGregor | Jab and step back teaches them to chase; the third time, pull and catch them chasing. | [evolve_pull], [sherdog_mcg] |
| t09 | 1, 2, step out | 1, 2, step out | 1, 2, pull, 2 | McGregor | Leaving after the one two invites them to follow; the third time you stay and counter. | [evolve_pull] |
| t10 | lead body kick | lead body kick | lead head kick |  | Body kicks make them drop the arm; the same kick goes upstairs. Jones did it to Cormier. | [evolve_headkick] |
| t11 | 1, 2 | 1, 2 | 1, body 2 |  | Two one twos make them shell high; the third cross goes under, to the body. | [coach] |
| t12 | up jab | up jab | up jab, rear head kick |  | Up jabs make them squeeze the guard tight in the middle; the head kick goes around it. | [coach] |
| t13 | teep | 1, teep | 1, rear head kick |  | Teeps make them guard the middle; after the jab, the kick goes high instead. | [evolve_headkick] |
| t14 | pull, 2 | pull, 2 | pull, lead head kick |  | Twice they eat the pull counter and cover for the cross; the third answer is the kick. | [evolve_pull], [evolve_headkick] |
| t15 | 1, 2, 3, low kick | 1, 2, 3, low kick | 1, 2, 3, rear head kick |  | Dutch style: they learn to check after the punches; now the same kick goes high. | [evolve_headkick] |
| t16 | feint 1 | feint 1 | 1, 2 |  | Feints with no follow-up teach them to ignore it; the next one is real. | [sherdog_mcg] |
| t17 | calf kick | calf kick | feint kick, 2 |  | Calf kicks make them lift the leg early; fake it and cross while they stand on one foot. | [coach] |
| t18 | 1 | 1, 2 | 1, 2, 3, step out |  | Each combo adds a strike; they defend the last pattern, not the new one. | [coach] |
| t19 | 1, pull | 1, pull | 1, pull, 2 |  | Two empty pulls make them commit to the counter; the third time it's waiting for them. | [evolve_pull], [ds_pull] |
| t20 | feint 2 | feint 2 | 1, body 2 |  | Cross feints make them cover their face; the real cross goes to the body. | [coach] |
| ta1 | front kick | front kick | question mark kick | Adesanya | Two real front kicks to the body teach them to drop the hands; the third chambers the same and turns over to the head. | [fightprimer_adesanya], [sk_adesanya_qmark] |
| ta2 | feint 1, calf kick | feint 1, calf kick | feint 1, 2 | Adesanya | After two calf kicks they lift the leg on every jab fake; the third time the 2 lands on a man standing on one foot. | [fightprimer_adesanya], [user_lead] |
| ta3 | 1 | 1 | 1, lead head kick | Adesanya | Jabs teach them to slip outside; the third time the kick is waiting where they slip. | [user_lead], [be_highkicks] |
| ta4 | shoulder feint | hip feint | shoulder feint, rear head kick | Adesanya | Feints with nothing behind them teach them to stop reacting; then the real kick comes off the same look. | [sherdog_adesanya], [sk_adesanya_feints] |
| tm1 | front kick, 2 | front kick, 2 | front kick, back kick | McGregor | Front kick and straight walks them to the fence; the third time the spinning back kick lands as they brace for the straight. | [sk_mcg_unorthodox], [sherdog_prev189] |
| tm2 | rear body kick | rear body kick | feint kick, 2 | McGregor | Two body kicks and they flinch at any kick; fake it and the 2 lands on the flinch. | [be_mcg_cerrone] |
| tm3 | 1, step out | 1, step out | 1, hop back, 2 | McGregor | Jab and leave twice so they start to chase; the third time back-skip and counter as they come. | [vice_mcg_alvarez], [fox_ufc205] |
| tr1 | 1, 2 | 1, 2 | feint 1, wheel kick | Ruffy | One twos make them raise the hands at any jab; the feint does the rest and the wheel kick goes round the guard. | [keviniole_ruffy], [lowkick_ruffy_koty] |
| tr2 | step in, 2, step out | step in, 2, step out | step in, 2, 3, back kick | Ruffy | Darting in and out makes them wait for the exit; this time keep turning into the back kick. | [cageside_ruffy_llontop], [user_lead] |

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

## Flurries

Hard days: two 15–20 s all-out flurries in the middle of every round, plus the last 20 s. The burnout finisher is 6 × (20 s on, 10 s off).

| flurry | spoken |
|---|---|
| straights | Straights. One two, nonstop, all out. |
| body | Two to the body, two to the head. Nonstop. |
| jabs | Jabs only. As fast as you can. |
| upjab | Up jab, two, up jab, two. Nonstop. |
| pull2 | Pull and two. Pull and two. Nonstop. |
| hooks | Three, two. Hook and cross. Nonstop. |
| kicks | Body kicks. Switch legs every kick. |
| teeps | Teep, one two, teep. Nonstop. |
| sprawls | Sprawl, back up, one two. Nonstop. |

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

Automatic checks (run on every build of this file): **all passed.**

- k01 (body 2, rear head kick): kept on purpose: rear hand into rear kick on purpose: Milan's favourite, the body cross dips the hips and the kick comes off that dip
- t01 (1, body 2 | 1, body 2 | 1, body 2 | body 2, rear head kick): kept on purpose: builds on k01 (body 2, rear head kick), Milan's favourite

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
