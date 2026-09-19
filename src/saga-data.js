// Canon anchors are summaries; every player mission, probability and ending is original fan fiction.
// Each saga has four scenes, twelve edges, and multiple terminal paths. No hidden random rolls.
const edge=(id,label,next,effect,detail)=>({id,label,next,effect,detail});
const scene=(title,text,rows)=>({title,text,edges:rows.map((r,i)=>edge(String(i),...r))});
const saga=(id,title,eras,regions,places,cast,anchor,source,opening,investigation,rescue,finale)=>({
 id,title,eras,regions,places,cast,anchor,source,
 nodes:{opening:scene(...opening),investigation:scene(...investigation),rescue:scene(...rescue),finale:scene(...finale)}
});
const story=slug=>`https://one-piece.com/story/${slug}/index.html`;
export const SAGAS=[
 saga('tangerine','The price of a tangerine',[2,3],['east_blue'],['Conomi Islands','Arlong Park'],['nami','arlong'],
 'Nami’s village suffered under Arlong’s tribute system; her bargain did not protect her savings from corrupt Marines.',story('east_blue'),
 ['A ledger under the floorboards','A citrus seller entrusts you with a duplicate tribute ledger. A collector arrives before the ink is dry.',[
 ['Trace the Marine payment trail','investigation','insight','A customs receipt ties the tribute to someone wearing a justice coat.'],
 ['Hide the families who cannot pay','rescue','trust','A storehouse becomes a refuge; every extra mouth strains its provisions.'],
 ['Sell the ledger back to the collector',null,'betrayal','You buy a quiet departure by exposing the seller. Nami will remember who profited.']]],
 ['Justice for sale','The officer will destroy the evidence unless someone carries it past his checkpoint.',[
 ['Smuggle copies in citrus crates','finale','evidence','Several merchants can now corroborate the same crime.'],
 ['Distract the patrol while witnesses flee','rescue','wound','The witnesses escape; the checkpoint leaves you with injuries.'],
 ['Accept hush money',null,'betrayal','The officer pays, then burns the original. The village loses its strongest testimony.']]],
 ['One boat too few','The hidden families need passage; a fisher refuses to abandon the oldest villagers.',[
 ['Repair the fishing boats overnight','finale','supply','The repair consumes your supplies, but no family must be divided.'],
 ['Take the wounded by the shallow channel','finale','trust','Local pilots mark a path an armed ship cannot follow.'],
 ['Draw the patrol away and get arrested',null,'capture','The families reach the sea while you disappear into a branch prison.']]],
 ['A harbor that remembers','The villagers can turn scattered help into a lasting defense, but the collectors are returning.',[
 ['Build a warning network along the coast',null,'sanctuary','Lookouts and fishing boats share signals. Collectors will never arrive unnoticed again.'],
 ['Publish the testimony under your flag',null,'exposure','Your name takes the blame; the village finally has witnesses beyond its shores.'],
 ['The collectors seize the last supply boat',null,'setback','The resistance survives in secret, but this season’s supplies are gone.']]]),
 saga('baratie','A meal owed to the sea',[1,2,3],['east_blue'],['Baratie'],['zeff','sanji'],
 'Zeff and Sanji’s experience of starvation underlies Baratie’s commitment to feeding the hungry.',story('east_blue'),
 ['An enemy at the table','Starving raiders wash against the restaurant. Their captain still wears stolen Marine insignia.',[
 ['Feed them and question the quartermaster','investigation','supply','Zeff insists on a meal first. The quartermaster then admits the cargo was medicine.'],
 ['Carry food to the wounded on their wreck','rescue','trust','Sanji helps load the provisions; the wreck is taking water.'],
 ['Demand payment before serving',null,'estranged','The raiders leave hungry. The cooks remember a debt you refused to recognize.']]],
 ['The false manifest','The raiders were paid to steal a shipment meant for an island clinic.',[
 ['Trace the broker through the shipping code','finale','evidence','A delivery schedule identifies the next stolen shipment.'],
 ['Return the surviving medicine','rescue','trust','A patient list gives every crate a human cost.'],
 ['Sell the stolen medicine',null,'betrayal','Your purse grows; the clinic’s empty shelves become your responsibility.']]],
 ['A kitchen in a storm','You have a crowded lifeboat, a failing stove, and too few hands.',[
 ['Ration meals until every survivor is fed','finale','insight','Careful provisioning keeps both cooks and raiders standing.'],
 ['Burn spare timber to keep the stove alive','finale','supply','You trade saleable cargo for hot food and another night.'],
 ['A collapsing spar catches you',null,'wound','The survivors get clear. You spend the following months recovering.']]],
 ['The captain returns for seconds','The raiders must choose what sort of crew they become after being spared starvation.',[
 ['Convert the stolen route into a relief run',null,'sanctuary','The restaurant becomes the first stop on an honest provisioning route.'],
 ['Give the clinic the broker’s name',null,'exposure','The theft is exposed and your involvement draws unwelcome attention.'],
 ['The captain breaks the promise',null,'setback','The relief voyage never arrives. You preserve the names of those still waiting.']]]),
 saga('ohara','Books that would not burn',[1,2,3],['west_blue','paradise','new_world'],['Ohara'],['robin'],
 'Ohara was destroyed for forbidden research; its scholars fought to preserve knowledge even as their home burned.',story('enies_lobby'),
 ['A water-damaged catalogue','A refugee carries an index of books rescued from a condemned collection. The actual volumes are scattered among smugglers.',[
 ['Decode the catalogue’s shipping annotations','investigation','insight','A librarian hid routes inside routine accession numbers.'],
 ['Protect the courier from a checkpoint search','rescue','trust','The pages matter because someone survived to carry them.'],
 ['Surrender the index for a reward',null,'betrayal','The authorities pay promptly. A shelf of names vanishes with the catalogue.']]],
 ['A library without a building','One seller offers a genuine fragment beside a convincing forgery.',[
 ['Compare marginal notes across both fragments','finale','evidence','The disagreement reveals a later censor’s handwriting, not a new ancient truth.'],
 ['Move the scholars before buying the books','rescue','supply','Safe lodging costs money but keeps the readers alive.'],
 ['Publish an unverified translation',null,'setback','The false translation damages trust and gives the censors an easy rebuttal.']]],
 ['The person behind the pages','A frightened apprentice wants to abandon the research to keep their family safe.',[
 ['Arrange a new identity and safe passage','finale','supply','The apprentice keeps a copy and gains time to decide freely.'],
 ['Split the archive among trusted couriers','finale','evidence','No single arrest can erase the collection now.'],
 ['Take the apprentice’s place at inspection',null,'capture','The archive travels on while your name enters a government file.']]],
 ['The right to remember','The surviving records need a custodian, not a claim that you have solved the Void Century.',[
 ['Found a dispersed archive',null,'archive','Copies, provenance notes, and cautious translations survive in separate harbors.'],
 ['Expose the campaign of censorship',null,'exposure','You publish the evidence of suppression without pretending incomplete fragments tell the whole history.'],
 ['Lose the originals during a raid',null,'setback','Your catalogue survives, but the lost pages will haunt every future reconstruction.']]]),
 saga('amber','The white town’s black ledger',[1,2,3],['north_blue'],['Flevance Kingdom','Minion Island'],['law'],
 'Flevance’s Amber Lead tragedy and Corazon’s sacrifice shaped Law’s life; Amber Lead poisoning was not a contagious plague.',story('dressrosa'),
 ['A diagnosis hidden by profit','A mining ledger describes toxic exposure as a contagious illness. Survivors still face closed doors.',[
 ['Audit the mine’s medical records','investigation','insight','The timing follows exposure at work, not contact between patients.'],
 ['Escort an ostracized family to a clinic','rescue','trust','The family needs care and shelter before it can give testimony.'],
 ['Resell the mine’s remaining ore',null,'betrayal','A buyer ignores your warning. Another harbor inherits the danger.']]],
 ['The clean signature','A company official offers to fund treatment if you omit the names that approved the exports.',[
 ['Keep the signatures with the laboratory notes','finale','evidence','Responsibility cannot be separated from the records of exposure.'],
 ['Accept treatment funding without surrendering copies','rescue','insight','A second archive protects the evidence while patients receive care.'],
 ['Destroy the ledger for a private settlement',null,'betrayal','One family is paid; the rest lose their chance to prove what happened.']]],
 ['No miracle on demand','A doctor can manage symptoms, but an unknown patient cannot simply be promised Law’s rare power.',[
 ['Fund sustained treatment and clean housing','finale','supply','Recovery depends on repeated care, not one legendary intervention.'],
 ['Document cases with the patients’ consent','finale','evidence','Survivors choose which parts of their histories can be shared.'],
 ['The clinic is sealed during an inspection',null,'capture','You remain with the patients and are detained alongside them.']]],
 ['What a white city leaves behind','The survivors want both a future and a record of who profited from their suffering.',[
 ['Endow a survivor-run clinic',null,'sanctuary','Clean housing and a permanent clinic outlast a one-time donation.'],
 ['Release the export ledger',null,'exposure','Ports begin rejecting the ore. The people named in the accounts want you silenced.'],
 ['The sponsors withdraw',null,'setback','Treatment continues on a smaller scale, while the promised public inquiry collapses.']]]),
 saga('alabasta','Rain on a powder trail',[2,3],['paradise'],['Alabasta Kingdom','Alubarna','Nanohana','Rainbase'],['vivi','crocodile','smoker'],
 'Crocodile and Baroque Works manipulated Alabasta’s drought and civil conflict while Vivi sought to stop the fighting.',story('alabasta'),
 ['Two armies, one false rumor','A water convoy is blamed for stealing rain. Vivi’s contact needs proof before the rumor becomes a massacre.',[
 ['Follow the Dance Powder supply chain','investigation','insight','The crates bear a port mark used by a shell company.'],
 ['Escort civilians out of the fighting corridor','rescue','trust','Both sides accuse your convoy of sheltering spies.'],
 ['Profit from the panic at the wells',null,'betrayal','Your water sells at a fortune. The empty cups have faces you will remember.']]],
 ['A broker without a name','A Baroque Works intermediary orders the last documents burned.',[
 ['Seize the duplicate cargo manifest','finale','evidence','The forged seals link several supposedly independent shipments.'],
 ['Persuade a frightened clerk to leave with you','rescue','trust','A living witness can explain what the numbers conceal.'],
 ['The intermediary buys your silence',null,'betrayal','The conspiracy keeps its cover and gains another paid accomplice.']]],
 ['The road between banners','Civilians are trapped between armed columns that each believe the other poisoned the wells.',[
 ['Negotiate a marked evacuation corridor','finale','insight','Neutral water bearers carry the agreement to both commanders.'],
 ['Use your own stores to cross the desert','finale','supply','The journey empties your hold but preserves the convoy.'],
 ['Stay behind when the rearguard is surrounded',null,'capture','The refugees reach shelter; you become a bargaining piece.']]],
 ['A truth louder than cannon','The armies need a reason to stop before the next volley.',[
 ['Bring witnesses and manifests together',null,'archive','The evidence survives public scrutiny and helps local leaders dismantle the lie.'],
 ['Broadcast the names of the conspirators',null,'exposure','Your transmission interrupts the propaganda and puts a price on your interference.'],
 ['The evidence arrives too late',null,'setback','You preserve it for an inquiry, but cannot undo the casualties of this battle.']]]),
 saga('skybell','The bell beneath the clouds',[2,3],['paradise'],['Skypiea','Upper Yard','Jaya'],['robin','nami'],
 'Shandora’s history connects the sky island conflict to Noland’s promise; the golden bell is more than treasure.',story('skypiea'),
 ['A sound no chart records','A sky trader has a Dial carrying a broken bell tone and a map annotated in two different traditions.',[
 ['Compare the map with the ruins','investigation','insight','The old coastline fits a piece of land that no longer lies at sea level.'],
 ['Help a divided village cross a damaged cloud bridge','rescue','trust','The evacuation puts rival families on the same rope.'],
 ['Sell the Dial as a curiosity',null,'estranged','The recording disappears into a collector’s vault before anyone hears its meaning.']]],
 ['Gold and a missing context','A treasure crew wants to strip a carved wall for its ornaments.',[
 ['Copy the inscription and preserve its setting','finale','evidence','The location matters as much as the marks; a rubbing alone cannot translate itself.'],
 ['Bargain for the workers’ safe withdrawal','rescue','supply','You pay to prevent a violent clash at the ruins.'],
 ['Let the wall be broken for gold',null,'betrayal','Your share is heavy. The historical context is irretrievable.']]],
 ['The bridge shakes','A cloud current shifts while the youngest evacuees are halfway across.',[
 ['Anchor the rope to the old stonework','finale','insight','The ruins become shelter rather than a prize.'],
 ['Leave your cargo to lighten the crossing','finale','supply','The bridge holds with people aboard and treasure behind.'],
 ['The last crossing breaks beneath you',null,'wound','Rescuers pull you free after everyone else has crossed.']]],
 ['A promise carried by sound','The competing stories can be heard together if someone protects the gathering.',[
 ['Establish a shared record of the ruins',null,'archive','Both communities retain their names for the same places.'],
 ['Carry the bell’s testimony to the sea below',null,'insight','A navigator gains a lead connecting sky and sea without claiming every mystery is solved.'],
 ['The treasure fleet interrupts the meeting',null,'setback','The recording survives, but reconciliation must wait for safer skies.']]]),
 saga('waterseven','The last train before Aqua Laguna',[2,3],['paradise'],['Water Seven','Enies Lobby','San Faldo'],['franky','robin','lucci'],
 'Water 7’s shipwrights, CP9’s infiltration, and Robin’s capture lead into the confrontation at Enies Lobby.',story('enies_lobby'),
 ['A passenger removed from the manifest','A shipyard apprentice copies a classified rail manifest. Their mentor disappears before the evening tide.',[
 ['Trace the forged shipyard authorization','investigation','insight','An insider knew which seal would pass without a second glance.'],
 ['Evacuate the flooded lower docks','rescue','trust','The storm is a threat even to people with no part in the conspiracy.'],
 ['Hand the apprentice to the inspectors',null,'betrayal','The inspectors commend your cooperation and confiscate every copy they find.']]],
 ['A mask in the workshop','The forged order leads to a sealed compartment on the last train.',[
 ['Hide a duplicate manifest in a repair invoice','finale','evidence','An ordinary shipwright’s bill gets the evidence past the sweep.'],
 ['Free the passenger before pursuing the handler','rescue','wound','You gain a witness but pay for the escape with a serious fall.'],
 ['Board the guarded carriage alone',null,'capture','The guards lock the carriage before the train clears the station.']]],
 ['Rising water, falling roofs','Dockworkers and a captive witness need the same scarce rescue skiffs.',[
 ['Organize the shipwrights into rescue teams','finale','trust','Their knowledge of the canals saves time that strength alone would waste.'],
 ['Strip your own stores to reinforce the skiffs','finale','supply','Your voyage loses supplies; the skiffs gain another trip.'],
 ['A collapsing warehouse traps you',null,'wound','The rescue teams return for you after the last civilian is clear.']]],
 ['A flag over the judicial island','Your local rescue intersects with a government willing to erase witnesses.',[
 ['Smuggle the witness and records into safety',null,'sanctuary','A safe berth and several copies survive the official denial.'],
 ['Publish the infiltration evidence',null,'exposure','Shipyards tighten their trust while government agents add your name to their search.'],
 ['The train escapes with the final dossier',null,'setback','You save people but lose the paper trail identifying the operation’s sponsors.']]]),
 saga('auction','Lot number zero',[2,3],['paradise'],['Sabaody Archipelago'],['rayleigh','hancock','kizaru'],
 'Sabaody’s human auction exposes the violence of the slave trade and the protection afforded to Celestial Dragons.',story('sabaody'),
 ['A catalogue with people in it','A coating-yard worker identifies a missing friend in an auction catalogue. The sale begins at sundown.',[
 ['Follow the auction house’s transport accounts','investigation','insight','The accounts reveal holding pens beyond the public showroom.'],
 ['Move a group of escapees into the mangroves','rescue','trust','The workers know channels the patrol launches cannot enter.'],
 ['Collect a finder’s fee from the auctioneer',null,'betrayal','The payment buys another lock for the holding pens.']]],
 ['The lock and the signal','Removing a collar without understanding its mechanism can kill the person you mean to save.',[
 ['Secure a qualified specialist and isolate the alarm','finale','evidence','Preparation makes a coordinated release possible; the collars are never treated as harmless jewelry.'],
 ['Evacuate workers before the alarm is raised','rescue','supply','A silent departure protects people who cannot survive an admiral’s intervention.'],
 ['The broker recognizes your false papers',null,'capture','The forged pass becomes evidence against you.']]],
 ['Bubbles before dawn','A coated vessel can carry the escapees if the harbor agents do not identify it.',[
 ['Hide departures among ordinary yard movements','finale','insight','Shipwrights lend routine paperwork without naming the passengers.'],
 ['Abandon cargo space to make room for families','finale','supply','Every extra berth costs profit and prevents a separation.'],
 ['Lead a patrol away from the vessel',null,'wound','The ship slips out while you recover from the pursuit.']]],
 ['Freedom needs a destination','The escapees need homes and identities after the exhilarating first night.',[
 ['Establish a protected resettlement route',null,'sanctuary','The coating yard becomes the first link in a continuing escape network.'],
 ['Release the buyer ledger',null,'exposure','The people who paid for prisoners discover that their names are no longer private.'],
 ['A corrupt agent exposes the destination',null,'setback','The network relocates; the people remain free but lose their first safe harbor.']]]),
 saga('summit','Letters from the frozen bay',[2],['paradise','calm_belt'],['Marineford','Impel Down','Sabaody Archipelago'],['ace','whitebeard','koby'],
 'Ace’s execution draws Whitebeard’s fleet to Marineford; the war destroys lives far beyond the strongest combatants.',story('marineford'),
 ['A bag of undelivered letters','A medical tender seeks volunteers as the execution becomes a fleet-wide emergency. The letters belong to both sides.',[
 ['Map a rescue lane through the blockading ships','investigation','insight','A tide table offers a small opening between patrol rotations.'],
 ['Take the wounded regardless of their flag','rescue','trust','The first rescued sailor points you toward someone from the opposing side.'],
 ['Sell the letters as intelligence',null,'betrayal','Families become bargaining chips in a war they cannot stop.']]],
 ['The bay will not stay open','A route that was safe at dawn is now exposed to artillery.',[
 ['Signal neutral medical markings to both fleets','finale','evidence','Several captains acknowledge the channel, though no guarantee can bind every gunner.'],
 ['Transfer the injured before the next bombardment','rescue','supply','You leave valuable equipment behind to free deck space.'],
 ['The cordon closes around your tender',null,'capture','Your medical mission survives in testimony while you face detention.']]],
 ['The last stretcher','A Marine and a pirate each demand that you leave the other behind.',[
 ['Make them carry the same stretcher','finale','trust','Cooperation begins with a person neither can lift alone.'],
 ['Spend the reserve medicine on both patients','finale','supply','You sail home with empty cabinets and living passengers.'],
 ['A shell hits the improvised ward',null,'wound','The evacuation continues while others treat your injuries.']]],
 ['When the guns finally stop','The war’s canonical tragedy is the anchor; your mission determines who receives help around its edges.',[
 ['Deliver the survivors and their letters',null,'sanctuary','Several families receive a living messenger instead of a casualty notice.'],
 ['Publish testimony about abandoned wounded',null,'exposure','Your account refuses to sort suffering by allegiance.'],
 ['The fleet scatters before every search is finished',null,'setback','You preserve a list of the missing rather than inventing reassuring answers.']]]),
 saga('fishman','Sunlight beneath ten thousand meters',[2,3],['new_world','paradise','red_line'],['Fish-Man Island'],['jinbe','hancock'],
 'Fish-Man Island’s struggle for dignity is tied to Otohime’s diplomacy, Fisher Tiger’s liberation of slaves, and inherited prejudice.',story('fishman_island'),
 ['A petition damaged by seawater','A human merchant and a fish-man dockworker each insist that the other sabotaged a shared shipment.',[
 ['Reconstruct the cargo’s route and missing seals','investigation','insight','A third party altered the paperwork at the surface port.'],
 ['Protect the mixed neighborhood from reprisals','rescue','trust','The first safe house is a workshop where both communities already work together.'],
 ['Exploit the feud to buy the cargo cheaply',null,'betrayal','The bargain deepens a grievance others will have to live with.']]],
 ['A profitable old hatred','The saboteur earns a commission whenever surface-undersea trade fails.',[
 ['Preserve both sets of original documents','finale','evidence','Matching signatures undermine the story told to each side.'],
 ['Escort the witnesses through hostile streets','rescue','wound','Their testimony survives an attack meant to silence it.'],
 ['Take a share of the replacement contract',null,'betrayal','You become another reason reconciliation appears impossible.']]],
 ['Air is a shared supply','A damaged bubble shelter forces hostile neighbors to share repairs.',[
 ['Put rival craftsmen on the same repair crew','finale','trust','Each learns whose work kept the children breathing.'],
 ['Buy emergency coating materials','finale','supply','An expensive repair prevents a neighborhood evacuation.'],
 ['The repair fails before help arrives',null,'wound','A rescue team reaches you after a dangerous loss of air.']]],
 ['A treaty small enough to keep','A single trade route cannot erase centuries of injustice; it can become a promise people can check.',[
 ['Create a jointly managed harbor fund',null,'sanctuary','Both communities control repairs and can inspect how the money is spent.'],
 ['Expose the sabotage with both witnesses present',null,'archive','The shared record prevents either community from being written out of the truth.'],
 ['A sponsor revives the old rumor',null,'setback','The agreement stalls, though the repair crew continues meeting in private.']]]),
 saga('dressrosa','The names the toys remember',[3],['new_world'],['Dressrosa Kingdom','Green Bit'],['robin','law','doflamingo'],
 'Sugar’s power turns people into toys and erases others’ memories of them; Dressrosa’s hidden labor system serves Doflamingo.',story('dressrosa'),
 ['A toy with a wedding ring','A damaged toy insists a family portrait once contained another person. The empty space is not proof anyone else can remember.',[
 ['Track the portrait’s repairs and old inventories','investigation','insight','Material inconsistencies remain even where personal memory fails.'],
 ['Hide exhausted workers from a factory patrol','rescue','trust','Their immediate need is shelter, whatever the world remembers about them.'],
 ['Return the toy to the foreman',null,'betrayal','A missing person becomes another repaired asset on a production list.']]],
 ['An inventory of erased lives','The factory’s quotas count workers its public registers say do not exist.',[
 ['Copy the production records before the shift changes','finale','evidence','The contradiction is measurable even without recovered memories.'],
 ['Use a supply lift to evacuate the weakest workers','rescue','supply','Your cargo allowance becomes space for living witnesses.'],
 ['The foreman catches you at the archive',null,'capture','The records remain locked while you join the prisoners.']]],
 ['The lift stops between floors','The escape route has room for people or contraband weapons, but not both.',[
 ['Leave the weapons and bring everyone','finale','trust','The workers see exactly what their lives were worth to you.'],
 ['Pay a harbor crew to conceal the escapees','finale','supply','Your route ends in a fishing loft with enough beds.'],
 ['A patrol cuts off your exit',null,'wound','You hold the lift long enough for the last workers to leave.']]],
 ['When the names return','In this alternate mission, evidence and community decide how victims reclaim their place; you do not gain Sugar’s power.',[
 ['Build a register controlled by the survivors',null,'archive','Each survivor can correct the record and decide how their story is used.'],
 ['Trace the factory profits into the underworld',null,'exposure','The records expose buyers beyond Dressrosa and make you their problem.'],
 ['The accounting archive burns during the turmoil',null,'setback','The survivors remain, but many claims now depend on testimony alone.']]]),
 saga('wholecake','An invitation written in sugar',[3],['new_world'],['Whole Cake Island','Cacao'],['sanji','bege','katakuri'],
 'Big Mom’s political marriages and Sanji’s coerced wedding turn a celebration into a struggle over family, power, and escape.',story('wholecakeisland'),
 ['A place setting with your name','A courier delivers a wedding-service contract that contains a hostage clause in its decorative border.',[
 ['Study the guest list for a route out','investigation','insight','The catering schedule reveals a departure that the ceremonial program omits.'],
 ['Hide the servants marked as expendable','rescue','trust','The kitchen knows who was ordered never to leave the island.'],
 ['Accept a bonus for reporting deserters',null,'betrayal','Your invitation becomes protection purchased with someone else’s freedom.']]],
 ['The sweetness of a perfect trap','The exit plan relies on a mirror passage whose guide has not agreed to help.',[
 ['Secure the guide’s voluntary cooperation','finale','evidence','A negotiated route replaces an assumption that would have stranded everyone.'],
 ['Prepare an ordinary harbor escape as backup','rescue','supply','Extra boats cost dearly and work without borrowed powers.'],
 ['A security officer intercepts the guest list',null,'capture','The seating plan now doubles as an interrogation chart.']]],
 ['The kitchen’s last service','A crowd of frightened servants gathers beside food intended for a banquet.',[
 ['Provision the escape boats from the surplus','finale','trust','No one begins a flight to freedom on an empty stomach.'],
 ['Buy silence with your share of the contract','finale','supply','The payment creates a narrow departure window.'],
 ['A pursuing patrol catches the rearguard',null,'wound','The boats reach open water while you bear the cost of delay.']]],
 ['A family chosen at the pier','The people leaving need a future that does not reproduce the contract they escaped.',[
 ['Create a free kitchen at the next safe harbor',null,'sanctuary','The cooks own their work and choose who sits at their table.'],
 ['Release the hostage clauses to the trade network',null,'exposure','Future suppliers know what the beautiful contracts conceal.'],
 ['The escape fleet is scattered by weather',null,'setback','You retain a reunion plan, but must live with the uncertainty of separated boats.']]]),
 saga('wano','Paper cranes over the factories',[3],['new_world'],['Wano Country'],['kinemon','yamato','hyogoro'],
 'Wano’s occupation poisons the land and forces labor; SMILE failures leave lasting harm, while the Kozuki resistance seeks liberation.',story('land_of_wano2'),
 ['A child laughs beside an empty bowl','A village cannot trust the river or the food shipments. A folded crane carries a resistance meeting place.',[
 ['Follow the factory’s waste channel','investigation','insight','The discharge schedule tells you when the water becomes dangerous.'],
 ['Move the sick villagers to clean water','rescue','trust','Forced laughter does not mean their pain has ended.'],
 ['Take a factory contract for looking away',null,'betrayal','The wages buy food for you and another poisoned season for the village.']]],
 ['Numbers behind the smoke','The factory needs a maintenance shutdown; the resistance could use the same opening.',[
 ['Copy the shift plans for the resistance','finale','evidence','The plans identify guards, workers, and a path that avoids the dormitories.'],
 ['Evacuate forced laborers before sabotage','rescue','supply','Empty beds matter more than an impressive explosion.'],
 ['The foreman discovers your crane message',null,'capture','You are sent to a labor prison carrying the names you refused to reveal.']]],
 ['A well without a lord','A hidden spring can sustain the village if no one sells its location.',[
 ['Teach the village to manage the spring together','finale','trust','Local custodians replace dependence on a single patron.'],
 ['Purchase containers and sanitation supplies','finale','supply','Transporting clean water becomes daily work rather than a one-time rescue.'],
 ['A search party reaches the supply trail',null,'wound','You divert the search and return injured after dark.']]],
 ['After the liberation songs','A victory over occupiers does not automatically clean rivers or cure SMILE’s victims.',[
 ['Protect a long-term water restoration effort',null,'sanctuary','The village gains reliable water and a reason to remain after the celebrations.'],
 ['Preserve testimony of the labor camps',null,'archive','The record names the workers as people rather than statistics in a victory report.'],
 ['A new patron claims the spring',null,'setback','Freedom still requires defending small institutions against familiar habits of power.']]]),
 saga('egghead','The signal that outlived its speaker',[3],['new_world'],['Egghead Island','G-14'],['bonney','vegapunk','kuma'],
 'Egghead connects Kuma and Bonney’s history to a government siege and Vegapunk’s broadcast about a world threatened by rising seas.',story('egghead'),
 ['A relay snail in a sealed crate','A technician asks you to carry a broadcast relay out of the siege. Nearby civilians need the same transport.',[
 ['Authenticate the relay’s recorded message','investigation','insight','You distinguish a signed recording from a broker’s sensational additions.'],
 ['Reserve the escape vessel for civilians','rescue','trust','The relay will need a smaller carrier; living passengers take the safe berths.'],
 ['Sell the transmitter to an intelligence buyer',null,'betrayal','The buyer pays to choose what the public will never hear.']]],
 ['Memory is not merchandise','A storage unit contains private material related to Kuma’s family alongside public scientific warnings.',[
 ['Separate the public warning from private records','finale','evidence','You preserve evidence without turning a family’s suffering into a trophy.'],
 ['Ask the family’s allies to carry the personal archive','rescue','trust','Custody passes to people with a reason to protect the person behind the data.'],
 ['The security sweep locates your terminal',null,'capture','The message survives in another copy while you face detention.']]],
 ['The shield opens once','The evacuation window is too short for every machine in the lab.',[
 ['Carry technicians and portable research copies','finale','trust','People who understand the work can rebuild what a crate cannot explain.'],
 ['Leave your cargo to make space for the relay','finale','supply','You trade a profitable voyage for a fragile signal.'],
 ['Debris strikes the evacuation ramp',null,'wound','Others haul you aboard before the route closes.']]],
 ['A warning becomes a responsibility','The broadcast’s revelations demand preparation; possessing a relay grants no Ancient Weapon or automatic answer to the Void Century.',[
 ['Build an independent warning and evacuation network',null,'sanctuary','Coastal communities gain tide logs, marked routes, and working communication.'],
 ['Preserve authenticated copies of the broadcast',null,'archive','The record can be checked against the source instead of repeated as rumor.'],
 ['Jamming cuts off your local relay',null,'setback','The wider warning exists, but your harbor must rebuild its means of hearing it.']]]),
 saga('elbaph','The library beneath the giant tree',[3],['new_world'],['Elbaph'],['robin','dorry','brogy'],
 'The journey from Egghead reaches Elbaph, where giant history and the survival of Ohara’s books give Robin’s search new meaning.','https://www.shueisha.co.jp/books/items/contents.html?jdcn=08X10000000063450500',
 ['A book larger than your berth','A giant custodian asks for help cataloguing water-damaged human-sized volumes among an enormous collection.',[
 ['Compare the volumes with a surviving Ohara index','investigation','insight','A shelf mark bridges two libraries that should never have been separated.'],
 ['Help move a threatened school collection','rescue','trust','Children need a safe place to learn before visitors need access to rare books.'],
 ['Sell the location of the rarest manuscripts',null,'betrayal','A collector now knows which shelves to target. The custodians will remember the leak.']]],
 ['The story inside the saga','An old warrior’s oral account disagrees with a written annotation.',[
 ['Preserve both versions with their provenance','finale','evidence','Disagreement becomes a research question instead of an excuse to erase one witness.'],
 ['Invite the custodian to choose what can be copied','rescue','trust','Access becomes a relationship with responsibilities.'],
 ['Declare a convenient legend proven',null,'setback','The claim wins attention and fails the first careful comparison.']]],
 ['A school is more than a building','Moving the books exposes the children’s route to opportunistic raiders.',[
 ['Arrange an escort with the giant custodians','finale','trust','Local knowledge keeps the procession on a defensible path.'],
 ['Pay for duplicate copies and separate storage','finale','supply','The collection can survive the loss of one building.'],
 ['A falling shelf injures the rearguard',null,'wound','The books and children arrive while you need several months of care.']]],
 ['Who gets to tell the next generation','The archive can connect cultures without turning an unfinished history into a definitive prophecy.',[
 ['Found an exchange between island libraries',null,'archive','Careful copies travel with attribution and permission; the originals remain with their custodians.'],
 ['Create a refuge for displaced scholars',null,'sanctuary','Readers gain time, shelter, and a community willing to defend learning.'],
 ['Rival patrons demand exclusive access',null,'setback','The custodians close the collection until a fair agreement can be restored.']]]),
 saga('roger','A logbook before the great era',[0],['paradise','new_world'],['Twins Cape','Loadestar Island'],['roger','rayleigh','crocus'],
 'Roger’s final voyage reaches the last island; his execution later launches the Great Pirate Era. Your parallel voyage does not reveal an invented canon answer to the treasure.',story('land_of_wano2'),
 ['An unfinished chart at the lighthouse','A passing crew leaves a damaged log for repair. The erased bearings suggest a route its navigator deliberately protected.',[
 ['Reconstruct the safe public bearings','investigation','insight','Crocus distinguishes navigational help from a captain’s private destination.'],
 ['Assist the vessels gathering at the cape','rescue','trust','Rookies need weather advice more urgently than legends need admirers.'],
 ['Sell a fabricated route to the final island',null,'betrayal','Your buyers pay for certainty you do not possess.']]],
 ['Where an ordinary needle stops','A copied entry describes the limits of following the Log Pose alone.',[
 ['Record the limits honestly','finale','evidence','Your notes identify the need for other evidence without conjuring a Road Poneglyph.'],
 ['Help a lost crew return to charted waters','rescue','supply','A safe return preserves a dream better than a glorious disappearance.'],
 ['Publish guessed coordinates as fact',null,'setback','The first expedition returns with broken instruments and justified anger.']]],
 ['A small boat among legends','An overloaded vessel wants to follow a famous sail into weather it cannot survive.',[
 ['Convince the captain to refit and train','finale','trust','The voyage is postponed, not abandoned.'],
 ['Contribute spare rigging and provisions','finale','supply','The crew’s next attempt begins with practical preparation.'],
 ['A rescue line snaps in the swell',null,'wound','You return with the crew and a hard-earned respect for the current.']]],
 ['What a witness owes the future','The era is changing, and strangers ask you for a story worth chasing.',[
 ['Publish a trustworthy pilot’s journal',null,'archive','Your record leaves room for wonder without selling false certainty.'],
 ['Establish a refuge for the next generation of crews',null,'sanctuary','A lighthouse table becomes a place where ambition can learn seamanship.'],
 ['A collector locks the log away',null,'setback','The safest bearings survive in your memory, but the original disappears from public reach.']]])
];
export const SAGA_BY_ID=Object.fromEntries(SAGAS.map(s=>[s.id,s]));
// Original voyages can begin in any sea, keeping quieter ports rich without teleporting canon characters.
SAGAS.push(
 saga('crew_oath','The empty chair at supper',[0,1,2,3],[],[],[],
 'Original side story about chosen family, promises, and the cost of command; no canonical event is asserted.',null,
 ['A name missing from the roll call','A port relief worker has vanished after helping a stranger. Their unfinished meal is still on the table.',[
 ['Reconstruct their last deliveries','investigation','insight','The delivery list points toward a creditor buying labor contracts.'],
 ['Protect the people they left in hiding','rescue','trust','The hidden travelers know why the relief worker took such a risk.'],
 ['Take over the profitable contract yourself',null,'betrayal','You inherit the income and the obligations that trapped your predecessor.']]],
 ['The debt that keeps growing','The contract charges workers for the food and shelter required to do the work.',[
 ['Copy the arithmetic that makes repayment impossible','finale','evidence','The ledger proves the debt was designed never to end.'],
 ['Buy time while the workers leave','rescue','supply','You pay a deposit and quietly prepare a different route.'],
 ['Challenge the creditor without backup',null,'capture','The creditor turns your interference into another enforceable debt.']]],
 ['A berth for someone without papers','Sheltering the workers may cost your crew access to a reliable port.',[
 ['Let the refugees help plan their own departure','finale','trust','Their knowledge produces an exit your crew could not have found alone.'],
 ['Give up cargo space for extra berths','finale','supply','The next voyage begins poorer and with everyone accounted for.'],
 ['The creditor’s hired guards find the shelter',null,'wound','You hold them long enough for the others to leave.']]],
 ['The chair is filled again','The missing worker returns to find that their rescue has changed what your flag means.',[
 ['Keep a permanent berth for people in need',null,'sanctuary','Your flag becomes a promise with a practical cost, not merely a boast.'],
 ['Publish the debt ledger in every friendly port',null,'exposure','The creditor loses the protection of secrecy and knows whom to blame.'],
 ['The relief network fractures over the cost',null,'setback','The rescued workers are safe, but rebuilding trust will take more than a speech.']]]),
 saga('blackchart','The map with three owners',[0,1,2,3],[],[],[],
 'Original treasure voyage built around unreliable charts, salvage rights, and the people missing from legends.',null,
 ['Three claims to the same wreck','A fisher, a merchant, and a bereaved family each bring a map of the same lost ship. Only one calls its contents treasure.',[
 ['Compare the charts against the harbor register','investigation','insight','The vessel changed names twice, leaving each claimant part of the truth.'],
 ['Help the family identify the recovered belongings','rescue','trust','A carved spoon establishes a connection gold cannot prove.'],
 ['Sell all three claims to a salvage syndicate',null,'betrayal','The syndicate sends guards instead of a mediator.']]],
 ['A hold full of unfinished lives','The wreck’s cargo includes wages, medicine, and personal effects alongside coins.',[
 ['Catalogue everything before claiming salvage','finale','evidence','An inventory makes it harder to pretend every recovered object has no owner.'],
 ['Bring unstable medicine ashore safely','rescue','supply','Careful transport costs more than the resale value of the damaged crates.'],
 ['The syndicate catches you inside the wreck',null,'capture','Your dive becomes evidence in a claim backed by armed men.']]],
 ['The last safe dive','A storm will seal the wreck under sediment; one more descent must have a clear purpose.',[
 ['Recover the crew register and personal effects','finale','trust','The families can finally learn who sailed together.'],
 ['Hire local divers and pay them fairly','finale','supply','The people taking the risk share control over the recovery.'],
 ['A shifting beam pins the recovery line',null,'wound','The divers rescue you and abandon the dangerous section.']]],
 ['How much is a discovery worth?','The harbor waits to learn whether your first instinct after finding treasure is to claim or to account.',[
 ['Create a public salvage record and return belongings',null,'archive','Future claims have evidence, and the families regain pieces of their history.'],
 ['Use your lawful share to support the harbor',null,'sanctuary','A modest fortune becomes repairs, rescue equipment, and wages.'],
 ['The wreck collapses before claims are settled',null,'setback','You preserve the register, but the remaining wealth belongs to the sea.']]])
);
for(const s of SAGAS)SAGA_BY_ID[s.id]=s;
