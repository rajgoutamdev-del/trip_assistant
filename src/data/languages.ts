import type { LanguagePack, Phrase } from '@/types';

type Row = [Phrase['category'], string, string, string];

const pack = (language: string, nativeName: string, rows: Row[]): LanguagePack => ({
  language,
  nativeName,
  phrases: rows.map(([category, english, script, roman], i) => ({
    id: `${language.toLowerCase()}-${i}`,
    category,
    english,
    script,
    roman,
  })),
});

export const HINDI = pack('Hindi', 'हिन्दी', [
  ['greetings', 'Hello / Greetings', 'नमस्ते', 'Namaste'],
  ['greetings', 'Thank you', 'धन्यवाद', 'Dhanyavaad'],
  ['greetings', 'Do you speak English?', 'क्या आप अंग्रेज़ी बोलते हैं?', 'Kya aap angrezi bolte hain?'],
  ['greetings', 'My name is…', 'मेरा नाम … है', 'Mera naam … hai'],
  ['shopping', 'How much does this cost?', 'यह कितने का है?', 'Yeh kitne ka hai?'],
  ['shopping', 'That is too expensive', 'यह बहुत महँगा है', 'Yeh bahut mehnga hai'],
  ['shopping', 'Can you lower the price?', 'थोड़ा कम कीजिए', 'Thoda kam kijiye'],
  ['food', 'I am vegetarian', 'मैं शाकाहारी हूँ', 'Main shaakaahaari hoon'],
  ['food', 'Please make it less spicy', 'कम मिर्च डालिए', 'Kam mirch daaliye'],
  ['food', 'Is this drinking water?', 'क्या यह पीने का पानी है?', 'Kya yeh peene ka paani hai?'],
  ['food', 'The bill, please', 'बिल दीजिए', 'Bill dijiye'],
  ['transport', 'Where is the bus stop?', 'बस स्टॉप कहाँ है?', 'Bus stop kahaan hai?'],
  ['transport', 'Please use the meter', 'मीटर से चलिए', 'Meter se chaliye'],
  ['transport', 'Stop here, please', 'यहीं रोक दीजिए', 'Yaheen rok dijiye'],
  ['transport', 'How far is it?', 'कितनी दूर है?', 'Kitni door hai?'],
  ['emergency', 'Help!', 'मदद कीजिए!', 'Madad kijiye!'],
  ['emergency', 'Call the police', 'पुलिस को बुलाइए', 'Police ko bulaiye'],
  ['emergency', 'I need a doctor', 'मुझे डॉक्टर की ज़रूरत है', 'Mujhe doctor ki zaroorat hai'],
  ['emergency', 'Where is the nearest hospital?', 'नज़दीकी अस्पताल कहाँ है?', 'Nazdeeki aspataal kahaan hai?'],
  ['emergency', 'I am lost', 'मैं रास्ता भूल गया हूँ', 'Main raasta bhool gaya hoon'],
  ['smalltalk', 'Yes / No', 'हाँ / नहीं', 'Haan / Nahin'],
  ['smalltalk', 'Please wait a moment', 'एक मिनट रुकिए', 'Ek minute rukiye'],
  ['smalltalk', 'I do not understand', 'मुझे समझ नहीं आया', 'Mujhe samajh nahin aaya'],
  ['smalltalk', 'Is photography allowed?', 'फोटो खींच सकते हैं?', 'Photo kheench sakte hain?'],
]);

export const MARATHI = pack('Marathi', 'मराठी', [
  ['greetings', 'Hello / Greetings', 'नमस्कार', 'Namaskaar'],
  ['greetings', 'Thank you', 'धन्यवाद', 'Dhanyavaad'],
  ['greetings', 'How are you?', 'कसे आहात?', 'Kase aahaat?'],
  ['shopping', 'How much does this cost?', 'हे कितीला आहे?', 'He kitila aahe?'],
  ['shopping', 'Too expensive', 'खूप महाग आहे', 'Khoop mahaag aahe'],
  ['food', 'I am vegetarian', 'मी शाकाहारी आहे', 'Mee shaakaahaari aahe'],
  ['food', 'Less spicy, please', 'कमी तिखट करा', 'Kami tikhat kara'],
  ['food', 'Water, please', 'पाणी द्या', 'Paani dya'],
  ['transport', 'Where is the station?', 'स्टेशन कुठे आहे?', 'Station kuthe aahe?'],
  ['transport', 'Stop here', 'इथे थांबा', 'Ithe thaamba'],
  ['transport', 'By meter, please', 'मीटरने चला', 'Meter-ne chala'],
  ['emergency', 'Help!', 'मदत करा!', 'Madat kara!'],
  ['emergency', 'I need a doctor', 'मला डॉक्टर हवे आहेत', 'Mala doctor have aahet'],
  ['smalltalk', 'I do not understand', 'मला समजत नाही', 'Mala samajat naahi'],
  ['smalltalk', 'Yes / No', 'होय / नाही', 'Hoy / Naahi'],
]);

export const KONKANI = pack('Konkani', 'कोंकणी', [
  ['greetings', 'Hello / Greetings', 'नमस्कार', 'Namaskar'],
  ['greetings', 'Thank you', 'देव बरें करूं', 'Dev borem korum'],
  ['greetings', 'How are you?', 'कशें आसा?', 'Koshem asa?'],
  ['shopping', 'How much is this?', 'हें कितले?', 'Hem kitlem?'],
  ['food', 'Is there fish curry?', 'नुस्त्याचें कडी आसा?', 'Nustyachem kodi asa?'],
  ['food', 'I am vegetarian', 'हांव शाकाहारी', 'Hanv shakahari'],
  ['transport', 'Where is the beach?', 'दर्यावेळ खंय आसा?', 'Daryavell khoim asa?'],
  ['transport', 'Stop here', 'हांगा रावय', 'Hanga ravoi'],
  ['emergency', 'Help me', 'म्हाका मदत कर', 'Mhaka modot kor'],
  ['smalltalk', 'Yes / No', 'हय / ना', 'Hoi / Na'],
]);

export const MALAYALAM = pack('Malayalam', 'മലയാളം', [
  ['greetings', 'Hello / Greetings', 'നമസ്കാരം', 'Namaskaaram'],
  ['greetings', 'Thank you', 'നന്ദി', 'Nandi'],
  ['greetings', 'Do you speak English?', 'നിങ്ങൾ ഇംഗ്ലീഷ് സംസാരിക്കുമോ?', 'Ningal English samsaarikkumo?'],
  ['shopping', 'How much is this?', 'ഇതിന് എന്ത് വിലയാണ്?', 'Ithinu enthu vilayaanu?'],
  ['shopping', 'Too expensive', 'വളരെ വില കൂടുതലാണ്', 'Valare vila kooduthalaanu'],
  ['food', 'I am vegetarian', 'ഞാൻ വെജിറ്റേറിയൻ ആണ്', 'Njaan vegetarian aanu'],
  ['food', 'Less spicy, please', 'എരിവ് കുറയ്ക്കാമോ?', 'Erivu kuraykkaamo?'],
  ['food', 'Is there coconut in this?', 'ഇതിൽ തേങ്ങ ഉണ്ടോ?', 'Ithil thenga undo?'],
  ['transport', 'Where is the boat jetty?', 'ബോട്ട് ജെട്ടി എവിടെയാണ്?', 'Boat jetty evideyaanu?'],
  ['transport', 'Stop here', 'ഇവിടെ നിർത്തൂ', 'Ivide nirthoo'],
  ['emergency', 'Help!', 'സഹായിക്കൂ!', 'Sahaayikkoo!'],
  ['emergency', 'I need a doctor', 'എനിക്ക് ഡോക്ടറെ വേണം', 'Enikku doctore venam'],
  ['smalltalk', 'I do not understand', 'എനിക്ക് മനസ്സിലായില്ല', 'Enikku manassilaayilla'],
  ['smalltalk', 'Yes / No', 'അതെ / അല്ല', 'Athe / Alla'],
]);

export const BHOJPURI = pack('Bhojpuri', 'भोजपुरी', [
  ['greetings', 'Greetings', 'प्रणाम', 'Pranaam'],
  ['greetings', 'How are you?', 'का हाल बा?', 'Ka haal ba?'],
  ['shopping', 'How much is this?', 'ई केतना के बा?', 'Ee ketna ke ba?'],
  ['food', 'Is it vegetarian?', 'ई शाकाहारी बा?', 'Ee shaakaahaari ba?'],
  ['transport', 'Where is the ghat?', 'घाट कहाँ बा?', 'Ghaat kahan ba?'],
  ['emergency', 'Help me', 'हमरा मदद करीं', 'Hamra madad karin'],
  ['smalltalk', 'Yes / No', 'हँ / ना', 'Han / Na'],
]);

export const LANGUAGE_PACKS = { HINDI, MARATHI, KONKANI, MALAYALAM, BHOJPURI };
