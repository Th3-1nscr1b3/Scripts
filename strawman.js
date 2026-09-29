import {eventSource, event_types} from '../../../../script.js';
import {characters} from '../../../../characters.js';

// ==========================================
// CONSTANTS & REGEXES
// ==========================================
const formatPool = (p) => [...p]
    .sort((a, b) => b.length - a.length)
    .map(w => w.replace(/ /g, "\\s+"))
    .join("|");

const subPro = formatPool(["he", "she", "it", "they"]);
const possPro = formatPool(["his", "hers?", "its", "theirs?"]);
const objPro = formatPool(["him", "her", "it", "them"]);
const selfPro = formatPool(["himself", "herself", "itself", "themselves"]);
const subAct = `(?:${subPro}|[a-z]+(?:\\s+[a-z]+){0,2})`;
const possAct = `(?:${possPro}|(?:\\w+\\s+){0,2}\\w+['’]s)`;
const objAct = `(?:${objPro}|[a-z]+(?:\\s+[a-z]+){0,2})`;

const adjGrp = formatPool(["calm", "calculated", "controlled", "deliberate", "deft", "efficient", "effortless", "exaggerated", "familiar", "firm", "fluid", "gentle", "graceful",
    "kind", "lithe", "measured", "mechanical", "methodical", "painful", "practiced", "precise", "quiet", "renewed", "single-minded", "slow", "smooth", "soft",
    "steady", "sure", "surprising", "swift", "thick", "unhurried", "unsteady"]);
const advGrp = formatPool(["gently", "firmly", "kindly", "softly", "slowly", "calmly", "quietly", "precisely"]);
const preGrp = formatPool(["on", "along", "down", "against", "through", "up", "over", "into", "onto", "across", "in"]);
const conjGrp = formatPool(["although", "but", "though", "yet"]);

const clothGrp = formatPool(["blouse", "boxers", "boxer briefs", "boxer shorts", "bra", "briefs", "clothes", "clothing", "dress", "dress pants", "dress shirt", "G-string",
    "garments?", "gown", "jeans", "panties", "pants", "robe", "shirt", "shorts", "skirts?", "slacks", "sleeves?", "t-shirt", "top", "trousers", "tunic", "underwear"]);

const footGrp = formatPool(["bare feet", "boots", "feet", "footsteps", "heels", "shoes", "slippers", "steps", "work boots"]);

const bodyGrp = formatPool(["abdomen", "ankles?", "arms?", "back", "belly", "body", "cal(?:f|ves)", "cheeks", "chest", "collarbone", "ear", "elbows?", "face", "fingers?", "fingertips?",
    "hand", "hipbones?", "hips?", "jaw", "knees?", "knuckles", "legs?", "lips", "neck", "palm", "ribs", "shoulder", "skin", "spine", "stomach", "temple", "thighs?", "thumb", "waist", "wrists?"]);

const voiceGrp = formatPool(["adoration", "anger", "anguish", "arousal", "awe", "care", "desperation", "desire", "drink", "emotion", "excitement", "exertion", "exhaustion", "fear", "fury", "gratitude",
    "grief", "guilt", "hunger", "hurt", "intoxication", "loneliness", "longing", "love", "lust", "need(?:iness)?", "nerves", "pain", "passion", "pride", "rage", "relief", "shame", "sleep",
    "sorrow", "(?:unshed\\s+)?tears", "tenderness", "urgency", "violence", "vulnerability", "want(?:ing)?", "warning", "whisk(?:e)?y", "wine"]);

const mannerGrp = formatPool(["agility", "calculation", "certainty", "confidence", "deliberation", "delicacy", "desperation", "determination", "dexterity", "ease", "efficiency", "familiarity", "ferocity", "fervor", "focus",
    "force", "gentleness", "grace", "intensity", "motions?", "nimbleness", "nonchalance", "precision", "resolve", "satisfaction", "skill", "strength", "thrust", "urgency", "vigor", "violence"]);

const herbalGrp = ["sage", "thyme", "rosemary", "crushed mint", "honeysuckle"];
const woodGrp = ["oak", "pine", "birch", "cypress", "oakmoss"];
const resinGrp = ["pine resin", "myrrh", "frankincense"];
const floralGrp = ["chamomile", "jasmine", "orange blossom", "wildflower"];
const spiceGrp = ["clove", "anise", "cardamom"];
const citrusGrp = ["lemon peel", "bergamot", "orange rind"];

const asBeforeGrp = formatPool(["such", "just", "same", "smooth", "long", "far", "much", "soon", "fast", "usual", "acting", "known", "served", "used", "regarded", "rough", "defined", "portrayed", "viewed", "so", "described"]);
const asAfterGrp = formatPool(["if", "enough", "always", "though", "to", "well", "much", "a", "an", "soon", "many", "in", "usual", "expected", "per", "for", "wore", "progressed", "one"]);

// ==========================================
// FEATURE 1: RANDOMIZERS
// ==========================================
const fabricPattern = `\\bthe\\s+(?:[a-z]+\\s*,?\\s*){0,3}(?:cotton|denim|fabric)\\s+of\\s+(${possAct})\\s+(${clothGrp})\\b`;
const fabricRandomizer = {
    ra_fabric: [new RegExp(fabricPattern, "gi"), [["$1 $2", 100]]]
};

const scentRandomizer = {
    ra_scent_lavender: [/\blavender\b/gi, [[herbalGrp, 40], [floralGrp, 50], [spiceGrp, 10]]],
    ra_scent_wood: [/\b(?:sandal[\s-]?wood|cedar[\s-]?wood)\b/gi, [[woodGrp, 25], [resinGrp, 25], [spiceGrp, 25], [citrusGrp, 25]]]
};

const lookaheadSubject = `(?:he|she|they|it|[A-Z][a-z]+)`;
const lookaheadVerb = `(?:did|had)(?:n['’]?t|\\s+not)\\s+(?:known?|reali[sz]ed?)`;

const nosePattern = `\\b(${subAct})\\s+(?:exhaled|(?:breathed|let)\\s+out)\\s+(?:sharply|a[^.!?;\\n]+?breath(?:er)?)(?:\\b\\s+through\\s+(?:${possPro})\\s+nose)?(?!\\s+${lookaheadSubject}\\s+${lookaheadVerb})\\b(?:,\\s*)?[^.!?\\n]*([.!?])`;
const noseRandomizer = {
    ra_nose_exhale: [new RegExp(nosePattern, "gi"), [["$1 huffed$2", 20], ["$1 sighed$2", 50], ["$1 sniffed$2", 20], ["$1 snorted$2", 10]]]
};

const blowRandomizer = {
    ra_physical_blow: [
        new RegExp(`\\b(?:hit|landed|struck)\\s+(${objAct})\\s+like\\s+(?:a\\s+)?physical\\s+blows?\\b`, "gi"),
        [["staggered $1", 9], ["dazed $1", 9], ["shocked $1", 9], ["overwhelmed $1", 10], ["stunned $1", 9], ["struck $1", 9], ["rattled $1", 9], ["jarred $1", 9], ["rocked $1", 9], ["floored $1", 9], ["seized $1", 9]]
    ]
};

const adverbRandomizers = {
    ra_ease: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}(?:ease|smoothness)\b/gi, [["easily", 10], ["easy", 10], ["effortlessly", 10], ["smoothly", 10], ["facilely", 10], ["fluently", 10], ["handily", 10], ["without difficulty", 10], ["without trouble", 10], ["without a hitch", 10]]],
    ra_urgency: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}(?:urgency|haste)\b/gi, [["hastily", 10], ["quickly", 10], ["snappily", 10], ["rashly", 10], ["hurriedly", 10], ["briskly", 10], ["rapidly", 10], ["fleetly", 10], ["precipitously", 10], ["quick", 10]]],
    ra_fervor: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}(?:passion|fervor)\b/gi, [["fervently", 20], ["fervidly", 20], ["ardently", 20], ["impassionately", 20], ["passionately", 20]]],
    ra_grace: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}grace\b/gi, [["gracefully", 20], ["featly", 20], ["nimbly", 20], ["smoothly", 20], ["lithely", 20]]],
    ra_efficiency: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}efficiency\b/gi, [["expertly", 20], ["efficiently", 20], ["ably", 20], ["skillfully", 20], ["adeptly", 20]]],
    ra_slowness: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}slowness\b/gi, [["slowly", 34], ["at a slow pace", 33], ["at a slow speed", 33]]],
    ra_deliberation: [/\bwith\s+(?:an?\s+)?(?:\w+\s+){0,2}deliberation\b/gi, [["intentionally", 20], ["purposely", 20], ["purposively", 20], ["willfully", 20], ["consciously", 20]]]
};

const buildAsRegex = () => {
    const regexString = `(?<!\\b(?:${asBeforeGrp})\\s+)(?<!\\bas\\s+(?:\\w+\\s+){1,2})\\bas\\b(?!\\s+(?:${asAfterGrp}|${adjGrp})\\b)(?!\\s+(?:\\w+\\s+){1,2}as\\b)`;
    return new RegExp(regexString, "gi");
};

const Randomizers = {
    ra_as: [buildAsRegex(), [["when", 35], ["while", 35], ["as", 30]]],
    ra_immediately: [/\bimmediately\b/gi, [["directly", 20], ["forthwith", 20], ["instanter", 20], ["straightaway", 20], ["immediately", 20]]],
    ra_reply: [/\breplied\b/gi, [["responded", 10], ["answered", 20], ["returned", 15], ["retorted", 15], ["countered", 10], ["replied", 30]]],
    ra_strides: [/\b(?:in|with)[\w\s,]*?(?:long|easy|quick|purposeful|swift|measured)\s+(?:steps|strides)\b/gi, [["quickly", 25], ["swiftly", 25], ["briskly", 25], ["speedily", 25]]],
    ra_unshed_tears: [/\b((?:his|her|its|\w+'s)[\w\s,]+?eyes)(?:\s+were)?[\w\s,]+? with\s+(?:unshed\s+)?tears\b/gi, [["$1 were watery", 15], ["$1 were glassy", 17], ["$1 were moist", 17], ["$1 were damp", 17], ["$1 were teary", 17], ["$1 were glassen", 17]]],
    ra_unreadable: [[/\b((?:his|her|its|\w+'s)\s+(?:face|expression))\s+(?:was\s+)?unreadable\b/gi, /\b((?:his|her|\w+'s)\s+expression)\s+(?:was\s+)?carefully\s+neutral\b/gi], [["$1 was guarded", 25], ["$1 remained neutral", 25], ["$1 gave nothing away", 25], ["$1 revealed nothing", 25]]],
    ra_choose_words: [/\b(he|she|\w+)\s+(?:paused|hesitated)(?:[a-z0-9_,-]+)?\s+(?:considering|choosing)\s+(his|her)\s+words\s+carefully\b/gi, [["$1 took a moment to gather $2 thoughts", 18], ["$1 stalled for a moment", 18], ["$1 searched for the right words", 18], ["$1 searched for the right way to say it", 18], ["$1 fumbled for the right words", 18], ["$1 paused, then continued", 10]]],
    ra_do_little: [[/\bdid\s+little\s+to\b/gi, /\bdoing\s+little\s+to\b/gi], [["didn't do much to", 14], ["didn't", 14], ["couldn't", 16], ["couldn't have done less to", 14], ["did next to nothing to", 14], ["hardly served to", 14], ["hardly did anything to", 14]]],
    ra_amber_liquid: [/\bamber\s+liquid\b/gi, [["drink", 80], ["content", 20]]],
    ra_particularly: [/\bparticularly\b/gi, [["especially", 30], ["notably", 30], ["highly", 30], ["particularly", 10]]],
    ra_mock: [/\bmock\b/gi, [["fake", 25], ["false", 25], ["sham", 20], ["feigned", 10], ["pretend", 15], ["contrived", 5]]],
    ra_perceptible_1: [/\b(?:an|a)(?:[\w\s,]+?)?(?:barely|almost)\s+(?:im)?perceptible\b/gi, [["a faint", 34], ["a subtle", 33], ["a small", 33]]],
    ra_perceptible_2: [/\b[\w\s,]*?(?:barely|almost)\s+(?:im)?perceptible\b/gi, [["faint", 34], ["subtle", 33], ["small", 33]]],
    ra_thick_with: [/\bthick\s+with\s+(adoration|awe|love|pride|wonder)\b/gi, [["full of $1", 50], ["filled with $1", 50]]],
    ra_conspirative: [[/\bconspiratorial\b/gi, /\bconspirational\b/gi], [["collusive", 26], ["furtive", 26], ["intimate", 28], ["conspiratorial", 10], ["conspirational", 10]]]
};

const allRandomizers = {...fabricRandomizer, ...scentRandomizer, ...noseRandomizer, ...blowRandomizer, ...adverbRandomizers, ...Randomizers};

// ==========================================
// FEATURE 2: REPLACEMENTS
// ==========================================
const adjReplacements = {re_adj: [new RegExp(`\\b(${adjGrp})\\s+(?:but|yet)\\s+(?:not\\s+)?\\w+\\b`, "gi"), "$1"]};
const advReplacements = {re_adv: [new RegExp(`(?:,\\s+)?(${advGrp})\\s+(?:but|yet)\\s+(?:not\\s+)?\\w+\\b`, "gi"), "$1"]};
const whisperPattern = `(?:,\\s*)?(?:${possAct})\\s+(?:own\\s+)?(?:voice|words)\\s+(?:(?:was|were)\\s+)?barely\\s+(?:(?:above|more\\s+than)\\s+)?a[\\w\\s,]*(?:whisper|murmur|rumble)\\b`;
const whisperReplacement = {re_whisper: [new RegExp(whisperPattern, "gi"), " quietly"]};
const mixPattern = `\\ba\\s+mix\\s+of\\s+(?:${voiceGrp})\\s+and\\s+((?:\\w+\\s+){0,2}${voiceGrp})`;
const mixReplacement = {re_mix: [new RegExp(mixPattern, "gi"), "$1"]};

const Replacements = {
    re_kiss: [/\bsearing\s+kiss\b/gi, "kiss"],
    re_parting: [/\bwhen\s+they\s+finally\s+parted\b/gi, "upon parting"],
    re_silence: [/\bin\s+(?:comfortable|companionable)\s+silence\b/gi, "companionably"],
    re_gray: [/\bgrey\b/gi, "gray"],
    re_ce: [/ce's\b/gi, "ce'"],
    re_s: [/s's\b/gi, "s'"],
    re_rapid_fire: [/\brapid(?:[\s-]fire)?\s+(German|Spanish|Yoruba|French|clicks?|trills?)\b/gi, "$1"]
};

const allReplacements = {...adjReplacements, ...advReplacements, ...whisperReplacement, ...mixReplacement, ...Replacements};

// ==========================================
// FEATURE 3: DELETIONS
// ==========================================
const footActionGrp = formatPool(["were", "thudded", "clicked", "padded", "stepped", "tapped", "thudding", "clicking", "padding", "stepping", "tapping", "whispered", "whispering"]);
const footAdjGrp = formatPool(["silent", "soft", "quiet", "soundless", "mute", "rapid", "quick"]);
const footNounGrp = formatPool(["sound", "noise"]);
const surfGrp = formatPool(["floor", "walls", "hardwood", "tile", "stone", "wood", "carpet", "rug"]);
const sensGrp = formatPool(["shudder", "jolt", "spark", "shiver", "ripple", "tremor", "jitter"]);
const gaspGrp = formatPool(["catch", "catching", "caught", "hitch", "hitched", "hitching", "stop", "stopped", "stopping"]);
const traceAdjGrp = "(?:idle|lazy|absent|small|slow)(?:ly)?";

const coreDeletions = {
    del_voice: new RegExp(`\\b(?:${possAct})\\s+(?:own\\s+)?(?:(?:deep|low|gravelly|raspy|hoarse)\\s+)?(?:voice|words)\\s+(?:(?:was|were)\\s+)?(?:(?:thick|rough|heavy|laced|hoarse|husky)\\s+)with\\s+(?:${voiceGrp})(?:\\s+and\\s+(?:${voiceGrp}))?\\b`, "gi"),
    del_mega: new RegExp(`\\b(?:(?:with|in)\\s+)(?:(?:one|an|a|the)\\s+)?(?:(?:${adjGrp})\\s+)?(?:${mannerGrp})\\b(?:(?:\\s+(?:that|which)(?:\\s+was)?)?\\s+(?:(?:(?:\\w+ly\\s+)?(?:belied|betrayed|defied)\\s+(?:${possPro}))|(?:(?:spoke|came|born)\\s+(?:from|of))|made|of)\\s+[^.!?;,\\n]+)?(?:\\b|(?=[.!?;,\\n]|$))`, "gi"),
    del_footwear: new RegExp(`\\b(?:${possAct})\\s+[\\w\\s,]{0,20}(?:${footGrp}|${clothGrp})\\s+(?:(?:(?:${footActionGrp})\\s+)?[\\w\\s,]{0,20}(?:(?:${footAdjGrp})(?:ly)?)?|\\s+(?:making|made)(?:\\s+almost)?\\s+no\\s+(?:${footNounGrp}))\\s+(?:${preGrp})\\s+the[\\w\\s,]*?(?:${surfGrp})(?:\\s+(?:floor|ground|surface))?\\b`, "gi"),
    del_shiver: new RegExp(`(?:,\\s+)?\\b(?:(?:${possAct})|the)\\s+(?:[\\w,]+\\s+){1,4}(?:that\\s+)?sen(?:t|ding)\\s+(?:a\\s+(?:${sensGrp})|(?:${sensGrp}s))\\s+(?:of\\s+(?:\\w+\\s+){0,2})?(?:${preGrp})\\s+(?:(?:${possAct})\\s+(?:${bodyGrp})|(?:${objAct})(?:\\s+both)?)\\b`, "gi"),
    del_hitch: new RegExp(`(?<!(?:to\\s+make|that\\s+made))(?:(?:,\\s+)|(?:\\s+and\\s+))?\\b(?:(?:${subAct})\\s+(?:could\\s+feel|felt)\\s+)?(?:${possAct})\\s+breath(?:ing)?\\s+(?:(?:was|had)\\s+)?(?:${gaspGrp})\\b[^.!?"“”\\n]*?(?=[.!?])`, "gi"),
    del_heart: new RegExp(`\\b(?:${possAct})\\s+heart\\s+swell(?:ed|ing)\\s+with\\s+(?:${voiceGrp})\\b(?:\\s+and\\s+${voiceGrp})?\\b(?:\\s+at\\s+the\\s+(?:sight|thought|idea|sound|feeling|knowledge)(?:\\s+of)?)?\\b`, "gi"),
    del_trace: new RegExp(`\\b(?:(?:(?:${possAct})\\s+(?:${bodyGrp})|(?:${subAct}))\\s+)?(?:(?:was|were)\\s+)?(?:(?:${traceAdjGrp})\\s+)?trac(?:ed|ing|es)\\s+(?:(?:${traceAdjGrp})\\s+)?(?:circles|patterns)(?:\\s+(?:${preGrp})\\s+(?:(?:${possAct}|the|a|an)\\s+)?[\\w\\s,]*?(?:(?:${bodyGrp})s?|(?:${clothGrp})))?(?:\\s+with\\s+(?:${possPro})\\s+(?:${bodyGrp}))?\\b(?:(?:\\s+(?:${preGrp})\\s+(?:the|a|an)\\s+[^.!?;,\\n]+)|(?:(?:,\\s+)?(?:while|as|when)\\s+[^.!?;,\\n]+)|(?:,\\s+(?:${possAct}|the|a|an)\\s+(?:${bodyGrp}|fingers?|thumbs?|hands?)\\s+(?:catch|brush|trail|linger)[^.!?;,\\n]+))?`, "gi"),
    del_intent: new RegExp(`\\b(?:and\\s+)?(?:(?:${possAct})|the)\\s+(?:own\\s+)?(?:voice|words)\\s+(?:was|were|(?:came|coming)\\s+out|sounded)?[^.!?;\\n]+?than\\s+(?:(?:${subAct})\\s+)?(?:(?:had\\s+)?intended|felt|expected|usual|normal|meant)\\b`, "gi"),
    del_knuckle: new RegExp(`\\b(?:until\\s+)?(?:(?:(?:${possAct})|the)\\s+)?(?:white-knuckled|knuckles\\s+(?:(?:were\\s+)?(?:(?:turn(?:ed|ing)|went)\\s+)?(?:whit|pal|blanch)(?:e|en(?:ed|ing)?|ed|ing)?))(?:\\s+[^,.!?]+)?\\b`, "gi"),
    del_pullAway: new RegExp(`\\b(?:${conjGrp})\\s+(?:(?:${subAct})\\s+)?(?:(?:did|could)(?:n'?t|\\s+not)|made\\s+no\\s+(?:effort|attempt|move)\\s+to)\\s+(?:move|pull)\\s+away\\b`, "gi"),
    del_should: new RegExp(`\\b(?:${subAct})\\s+(?:knew\\s+(?:${subPro})\\s+)?should\\s+(?:have\\s+)?[^.,!?;\\n]+[.,!?]+\\s+should\\s+(?:have\\s+)?[^.,!?;\\n]+[.,!?—]+\\s+(?:${conjGrp}|instead)\\b[^.!?;\\n]*[.!?]`, "gi"),
    del_heldBreath: new RegExp(`\\b(?:(?:${subAct})\\s+)?(?:let|was\\s+letting)\\s+out\\s+a[\\w\\s,]*?breath\\s+(?:${subAct})\\s+(?:did|had)(?:n'?t|\\s+not)\\s+(?:known?|reali[sz]ed?)\\s+(?:${subPro})(?:'d|\\s+had)?\\s+(?:been|was)\\s+holding\\b(?:(?:while|when|as)[^.!?"“”\\n]*?(?=[.!?]))?`, "gi"),
    del_brush: new RegExp(`(?:,\\s+)?(?:${possAct})\\s+(?:${bodyGrp})\\s+brush(?:ed|ing)(?:\\s+(?:${advGrp}))?(?:\\s+(?:${preGrp}))?(?:\\s+(?:(?:${possAct}|the|an|a)\\s+)?[\\w\\s,]*?(?:${bodyGrp}))?(?:\\s+(?:as|while|when))?(?:[^.!?"“”\\n]*?(?=[.!?]))?`, "gi"),
    del_deliberate: new RegExp(`(?:(?:a|an)\\s+(?:${adjGrp}),\\s+|(?:${adjGrp})\\s+and\\s+|a\\s+)deliberate|deliberate\\s+and\\s+(?:${adjGrp})|,?\\s*more\\s+deliberate`, "gi")
};

const dynamicDeletions = {
    del_hesitate: new RegExp(`\\b(?:${subAct})\\s+(?:(?:just|only)\\s+){0,2}hesitated\\s+(?:(?:just|only)\\s+){0,2}(?:(?:for\\s+)?(?:(?:just|only)\\s+){0,2}a\\s+(?:[a-zA-Z0-9_,-]+\\s+){0,6}(?:moment|second|heartbeat|beat)|briefly)\\s+(?:before|,)\\b`, "gi"),
    del_control: new RegExp(`\\b(?:as|while|when)\\s+(?:${subAct})\\s+[^.!?;\\n]*?(?:struggl(?:ed|ing)|fought|fighting|tried)\\s+to\\s+(?:maintain|keep|remain|stay(?:\\s+in)?)\\s+(?:control|(?:${possPro})\\s+composure)\\b`, "gi"),
    del_hotBreath: new RegExp(`(?<!\\b(?:feel|felt|(?:hear|sense)d?)\\s+)\\b(?:${possAct})\\s+breath\\s+(?:was\\s+)?(?:hot|warm)\\s+(?:on|against)\\s+(?:${possAct})\\s+(?:${bodyGrp})\\b`, "gi"),
    del_heat: new RegExp(`(?:${conjGrp})\\s+there\\s+(?:was\\s+no|wasn'?t\\s+any)(?:\\s+real)?[\\w\\s]+?(?:behind|in|to)\\s+(?:it|(?:${possPro})\\s+(?:tone|words|voice))\\b`, "gi"),
    del_low_voice: new RegExp(`\\b(?:${possAct})[^.!?;\\n]*?voice\\s+(?:was\\s+)?a(?:\\w+\\s+){0,3}(?:murmur|whisper|grumble|rumble|mumble|growl)[^.!?—,](?:\\s+(?:that|which)\\s+[^.!?;]+)?`, "gi"),
    del_steps: new RegExp(`(?:,\\s+)(?:${possAct})\\s+(?:steps|movements)\\s+(?:were\\s+)?(?:${adjGrp})(?:\\s+and\\s+(?:${adjGrp}))?(?:\\s+(?:when|while|as))?\\b`, "gi"),
    del_no_answer: new RegExp(`\\b(?:${subAct})\\s+did(?:n't|\\s+not)\\s+answer\\s+(?:directly|forthwith|instanter|straightaway|immediately|right\\s+away)\\b`, "gi"),
    del_hollow: new RegExp(`\\b(?:but|yet|though|although)\\s+the\\s+words\\s+(?:sounded|felt|rang)[^.!?;\\n]+?to\\s+(?:${possAct})\\s+(?:own\\s+)?ears\\b`, "gi"),
    del_barely_audible: new RegExp(`\\b(?:${possAct})\\s+(?:voice|words)\\s+(?:(?:was|were)\\s+)?(?:hardly|barely)\\s+audible\\s+over[^!,?.\\n]+?\\b`, "gi"),
    del_eyes_leaving: new RegExp(`\\b(?:${possAct})[\\w\\s]+?(?:gaze|eyes)\\s+never\\s+(?:left|leaving)\\s+(?:${possAct}|${objAct})(?:\\s+face)?\\b`, "gi"),
    del_fists: new RegExp(`\\b(?:${possAct})\\s+hands?\\s+(?:(?:was\\s+|were)\\s+)?clench(?:ed|ing)\\s+at\\s+(?:${possPro})[^,.!?—\\-]+\\b`, "gi"),
    del_half_half: new RegExp(`\\b(?:half|more|part)\\s+to\\s+(?:${selfPro})[\\s,]+?(?:half|part|than)\\s+(?:to\\s+)?(?:[a-z]+(?:\\s+)?){1,2}\\b`, "gi"),
    del_barely: new RegExp(`\\b(?:with\\s+)?(?:(?:bare|scarce|hard)ly\\s+)?(?:conceal|contain|constrain|restrain|repress)ed(?=(?:${voiceGrp})\\b)`, "gi"),
    del_wrist: new RegExp(`\\bwith\\s+a[\\w\\s,]+?practiced[\\w\\s,]+?\\s+of\\s+(?:${possPro})\\s+wrist\\b`, "gi"),
    del_crinkling: new RegExp(`\\b(?:${possAct})\\s+eyes\\s+crinkling\\s+at\\s+the\\s+(?:corners|edges)\\b`, "gi"),
    del_perceive: new RegExp(`\\b(?:that\\s+)?only\\s+(?:${subAct})\\s+could\\s+(?:see|hear|perceive)\\b`, "gi"),
    del_knew_answer: new RegExp(`,\\s+though\\s+(?:${subAct})\\s+(?:already\\s+)?knew\\s+the\\s+answer\\b`, "gi"),
    del_really_look: new RegExp(`(?:,\\s+|—)really\\s+look(?:ed|ing)(?:\\s+at\\s+(?:${objPro}))?\\b`, "gi"),
    del_name: new RegExp(`\\b(?:with|and)\\s+something\\s+(?:${subAct})[^.!?\\n]+name\\b`, "gi"),
    del_so_like: new RegExp(`(?:,\\s+|—)so\\s+like\\s+(?:(?:${objPro})\\s+)?(?:${possAct})[,—]`, "gi"),
    del_feel_than_hear: new RegExp(`\\bthat\\s+(?:${subAct})\\s+more\\s+felt\\s+than\\s+heard\\b`, "gi"),
    del_match: new RegExp(`\\s+that\\s+matched\\s+(?:${possAct})\\s+own\\b`, "gi"),
    del_only_for: new RegExp(`\\bmeant\\s+only\\s+for\\s+(?:${objPro})\\b`, "gi"),
    del_completely: new RegExp(`(?<=\\b(?:${objPro})\\s+)completely\\b`, "gi")
};

const staticDeletions = {
    del_unspoken: /\b(?:a|an)[\w\s,]*?(?:(?:communica|conversa)tion|understanding)\s+pass(?:ed|ing)\s+between[\w\s,]+?them(?:\s+both)?\b/gi,
    del_serpent: /\blike\s+(?:a|an)[\w\s,]*?(?:tidal\s+wave|serpent\s+ready\s+to\s+strike|predator\s+stalking\s+its\s+prey)\b/gi,
    del_knowing: /(?<=\b(?:smil|grinn|smirk)(?:ed|ing))\s+knowingly\b|(?:,\s+)?\bknowing(?=(?:smile|grin|smirk)\b)/gi,
    del_harder: /\b(?:harder|with[\w\s,]*?more\s+force)\s+than\s+(?:necessary|intended|needed)\b/gi,
    del_that_was: /["“'’]That\s+was(?:\.{3})?(?:\s+\w+){0,3}[.!?—\-]*\s*["”'’]/gi,
    del_bruise: /\b(?:hard|strong)\s+enough\s+to\s+(?:leave\s+)?a?[^.,?!]+\b/gi,
    del_nothing: /\bthat\s+had\s+nothing\s+to\s+do\s+with[^.,!;?]+/gi,
    del_perceptible: /\b(?:barely|almost)\s+(?:im)?perceptibl[ey]\b/gi,
    del_question: /\s+it\s+was(?:n't|\s+not)\s+a\s+question[,.]/gi,
    del_fire: /\b(?:you\s+are\s+)?playing\s+with\s+fire\b/gi,
    del_pure: /,\s+(?:pure|transfixed|unadulterated),?\b/gi,
    del_bin: /\b(?:in(?:to)?\s+)?\s+a\s+messy\s+bun\b/gi,
    del_lifeline: /\blike\s+(?:it\s+was\s+)?a\s+lifeline\b/gi,
    del_sth_else: /\band\s+something\s+else\s+entirely\b/gi,
    del_offer: /\blike\s+a\s+peace\s+offer(?:ing)?\b/gi,
    del_methodic: /\b(?:,\s+)?methodical(?:ly)?,?\b/gi,
    del_lace: /\b(?:of\s+)?lac[ey]\b(?!-clad\b)/gi,
    del_thought: /\band\s+here\s+I\s+thought\b/gi,
    del_even: /\beven(?=while|when|as)\b/gi,
    del_inch: /\binch\s+by[\w\s]*?inch\b/gi,
    del_promises: /\bpromises,\s+promises\b/gi,
    del_unique: /\bsomething\s+uniquely\b/gi,
    del_intently: /\bintently\b/gi
};

const allDeletions = {...coreDeletions, ...dynamicDeletions, ...staticDeletions};

// ==========================================
// TROPE SCRUBBER CORE ENGINE
// ==========================================
function scrubTropes(text) {
    if (!text) return text;

    const startedWithCapital = /^[ \t]*['"“‘]?[ \t]*[A-Z]/.test(text);

    // >> EXECUTE RANDOMIZERS
    Object.entries(allRandomizers).forEach(([key, rule]) => {
        const patterns = Array.isArray(rule[0]) ? rule[0] : [rule[0]];
        const options = rule[1];

        patterns.forEach((pattern) => {
            text = text.replace(pattern, (...args) => {
                const match = args[0];
                const groups = args.slice(1, -2);

                const totalWeight = options.reduce((sum, opt) => sum + opt[1], 0);
                let randomNum = Math.random() * totalWeight;
                let chosenAlternative = options[0][0];

                for (let i = 0; i < options.length; i++) {
                    if (randomNum < options[i][1]) {
                        chosenAlternative = options[i][0];
                        break;
                    }
                    randomNum -= options[i][1];
                }

                if (Array.isArray(chosenAlternative)) {
                    if (chosenAlternative.length === 0) return match;
                    const randomIndex = Math.floor(Math.random() * chosenAlternative.length);
                    chosenAlternative = chosenAlternative[randomIndex];
                }

                if (groups.length > 0 && groups[0] !== undefined) {
                    chosenAlternative = chosenAlternative.replace(/\$1/g, groups[0]);
                }
                if (groups.length > 1 && groups[1] !== undefined) {
                    chosenAlternative = chosenAlternative.replace(/\$2/g, groups[1]);
                }

                const firstChar = match.charAt(0);
                if (firstChar === firstChar.toUpperCase() && /[A-Z]/.test(firstChar)) {
                    chosenAlternative = chosenAlternative.charAt(0).toUpperCase() + chosenAlternative.slice(1);
                }

                return chosenAlternative;
            });
        });
    });

    // >> EXECUTE REPLACEMENTS
    const DOLLAR_VAR_REGEX = /\$(\d+|&)/g;
    Object.entries(allReplacements).forEach(([key, rule]) => {
        const pattern = rule[0];
        const replacement = rule[1];

        text = text.replace(pattern, (match, ...args) => {
            if (typeof replacement === 'string') {
                const captureGroups = args.slice(0, -2);
                let interpolatedReplacement = replacement.replace(DOLLAR_VAR_REGEX, (dollarMatch, token) => {
                    if (token === '&') return match;
                    const groupIndex = parseInt(token, 10) - 1;
                    return captureGroups[groupIndex] !== undefined ? captureGroups[groupIndex] : dollarMatch;
                });

                const firstLetterMatch = match.match(/[a-zA-Z]/);
                const isCapitalized = firstLetterMatch && firstLetterMatch[0] === firstLetterMatch[0].toUpperCase();

                if (isCapitalized) {
                    return interpolatedReplacement.replace(/[a-zA-Z]/, (l) => l.toUpperCase());
                }
                return interpolatedReplacement;
            }
            return replacement;
        });
    });

    // >> EXECUTE DELETIONS
    Object.entries(allDeletions).forEach(([key, pattern]) => {
        text = text.replace(pattern, "");
    });

    // Orphaned Apostrophe Cleanup
    text = text.replace(/(?<![a-zA-Z])['’]s?(?![a-zA-Z])/g, "");

    // ==========================================
    // PUNCTUATION & CLEANUP
    // ==========================================
    let cleanedText = text
        .replace(/[ \t]+([,.!?;:…])/g, "$1")
        .replace(/\.{3}/g, "…")
        .replace(/([?!.]),/g, "$1")
        .replace(/[.,]\.[.,'"’”]*/g, ".")
        .replace(/,{2,}/g, ",")
        .replace(/^[ \t]*[.,]+[ \t]*/gm, "")
        .replace(/([.!?…]["']?[ \t]+)[.,]+[ \t]*/g, "$1")
        .replace(/([,.!?;:…])[ \t]*([A-Za-z])/g, "$1 $2")
        .replace(/(['"’”])[ \t]*([.,])/g, "$2$1")
        .replace(/([A-Za-z0-9])[ \t]+(['’])[ \t]+([A-Za-z0-9])/g, "$1$2$3")
        .replace(/ - /g, "—")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/[ \t]+$/g, "")
        .replace(/([,.!?;:…"“”])$/g, "$1 ")
        .replace(/([.!?]\s+)([a-z])/g, (match, prefix, letter) => prefix + letter.toUpperCase());

    cleanedText = cleanedText.replace(/^[ \t]+/gm, "");
    if (startedWithCapital) {
        cleanedText = cleanedText.replace(/^(['"“‘]?)[ \t]*([a-z])/, (match, quote, letter) => quote + letter.toUpperCase());
    }

    return cleanedText;
}

// ==========================================
// SILLYTAVERN EXTENSION HOOK
// ==========================================
jQuery(async () => {
    // Intercept generation text immediately when ST receives it
    eventSource.on(event_types.MESSAGE_RECEIVED, (data) => {
        // Ensure we only process text generated by an AI character, not the user
        if (data.is_user === false && data.mes) {
            data.mes = scrubTropes(data.mes);
        }
    });
});