export type VocabCategory =
  | 'greetings'
  | 'numbers'
  | 'family'
  | 'food'
  | 'colors'
  | 'time'
  | 'verbs'
  | 'travel'
  | 'body'
  | 'weather'
  | 'emotions'
  | 'objects'
  | 'questions'
  | 'animals';

export type Gender = 'm' | 'f' | null;

export interface VocabWord {
  id: string;
  french: string;
  phonetic: string; // English-friendly approximate pronunciation (not strict IPA)
  english: string;
  category: VocabCategory;
  gender?: Gender;
  example_fr?: string;
  example_en?: string;
}

export const VOCAB_CATEGORIES: { key: VocabCategory; label: string; emoji: string; color: string }[] = [
  { key: 'greetings', label: 'Greetings',  emoji: '👋', color: '#00E676' },
  { key: 'numbers',   label: 'Numbers',    emoji: '🔢', color: '#2979FF' },
  { key: 'family',    label: 'Family',     emoji: '👪', color: '#FF7043' },
  { key: 'food',      label: 'Food & Drink', emoji: '🍽️', color: '#FFB300' },
  { key: 'colors',    label: 'Colors',     emoji: '🎨', color: '#AB47BC' },
  { key: 'time',      label: 'Time & Days', emoji: '🕐', color: '#26C6DA' },
  { key: 'verbs',     label: 'Verbs',      emoji: '🏃', color: '#66BB6A' },
  { key: 'travel',    label: 'Travel',     emoji: '✈️', color: '#5C6BC0' },
  { key: 'body',      label: 'Body',       emoji: '🫀', color: '#EF5350' },
  { key: 'weather',   label: 'Weather',    emoji: '☀️', color: '#FFA726' },
  { key: 'emotions',  label: 'Adjectives', emoji: '😊', color: '#EC407A' },
  { key: 'objects',   label: 'House & Objects', emoji: '🏠', color: '#8D6E63' },
  { key: 'questions', label: 'Questions',  emoji: '❓', color: '#78909C' },
  { key: 'animals',   label: 'Animals',    emoji: '🐾', color: '#43A047' },
];

export const VOCAB_WORDS: VocabWord[] = [
  // ─── Greetings ──────────────────────────────────────────────────────────
  { id: 'bonjour', french: 'Bonjour', phonetic: 'bohn-ZHOOR', english: 'Hello / Good morning', category: 'greetings', example_fr: 'Bonjour, comment allez-vous ?', example_en: 'Hello, how are you?' },
  { id: 'bonsoir', french: 'Bonsoir', phonetic: 'bohn-SWAHR', english: 'Good evening', category: 'greetings' },
  { id: 'salut', french: 'Salut', phonetic: 'sah-LU', english: 'Hi / Bye (informal)', category: 'greetings' },
  { id: 'au-revoir', french: 'Au revoir', phonetic: 'oh ruh-VWAHR', english: 'Goodbye', category: 'greetings' },
  { id: 'bonne-nuit', french: 'Bonne nuit', phonetic: 'bun NWEE', english: 'Good night', category: 'greetings' },
  { id: 'sil-vous-plait', french: "S'il vous plaît", phonetic: 'seel voo PLEH', english: 'Please (formal)', category: 'greetings' },
  { id: 'sil-te-plait', french: "S'il te plaît", phonetic: 'seel tuh PLEH', english: 'Please (informal)', category: 'greetings' },
  { id: 'merci', french: 'Merci', phonetic: 'mehr-SEE', english: 'Thank you', category: 'greetings', example_fr: 'Merci beaucoup !', example_en: 'Thank you very much!' },
  { id: 'merci-beaucoup', french: 'Merci beaucoup', phonetic: 'mehr-SEE boh-KOO', english: 'Thank you very much', category: 'greetings' },
  { id: 'de-rien', french: 'De rien', phonetic: 'duh ree-EN', english: "You're welcome", category: 'greetings' },
  { id: 'excusez-moi', french: 'Excusez-moi', phonetic: 'ex-kew-zay MWAH', english: 'Excuse me (formal)', category: 'greetings' },
  { id: 'pardon', french: 'Pardon', phonetic: 'par-DOHN', english: 'Sorry / Pardon', category: 'greetings' },
  { id: 'oui', french: 'Oui', phonetic: 'WEE', english: 'Yes', category: 'greetings' },
  { id: 'non', french: 'Non', phonetic: 'NOHN', english: 'No', category: 'greetings' },
  { id: 'comment-allez-vous', french: 'Comment allez-vous ?', phonetic: 'koh-mahn tah-lay VOO', english: 'How are you? (formal)', category: 'greetings' },
  { id: 'ca-va', french: 'Ça va ?', phonetic: 'sah VAH', english: "How's it going? (informal)", category: 'greetings', example_fr: 'Ça va bien, merci !', example_en: "I'm doing well, thanks!" },
  { id: 'ca-va-bien', french: 'Ça va bien', phonetic: 'sah vah bee-EN', english: "I'm doing well", category: 'greetings' },
  { id: 'enchante', french: 'Enchanté(e)', phonetic: 'ahn-shahn-TAY', english: 'Nice to meet you', category: 'greetings' },
  { id: 'a-bientot', french: 'À bientôt', phonetic: 'ah bee-en-TOH', english: 'See you soon', category: 'greetings' },
  { id: 'a-demain', french: 'À demain', phonetic: 'ah duh-MAN', english: 'See you tomorrow', category: 'greetings' },

  // ─── Numbers ────────────────────────────────────────────────────────────
  { id: 'un', french: 'Un', phonetic: 'UHN', english: 'One', category: 'numbers' },
  { id: 'deux', french: 'Deux', phonetic: 'DUH', english: 'Two', category: 'numbers' },
  { id: 'trois', french: 'Trois', phonetic: 'TWAH', english: 'Three', category: 'numbers' },
  { id: 'quatre', french: 'Quatre', phonetic: 'KAH-truh', english: 'Four', category: 'numbers' },
  { id: 'cinq', french: 'Cinq', phonetic: 'SANK', english: 'Five', category: 'numbers' },
  { id: 'six', french: 'Six', phonetic: 'SEES', english: 'Six', category: 'numbers' },
  { id: 'sept', french: 'Sept', phonetic: 'SET', english: 'Seven', category: 'numbers' },
  { id: 'huit', french: 'Huit', phonetic: 'WEET', english: 'Eight', category: 'numbers' },
  { id: 'neuf', french: 'Neuf', phonetic: 'NUHF', english: 'Nine', category: 'numbers' },
  { id: 'dix', french: 'Dix', phonetic: 'DEES', english: 'Ten', category: 'numbers' },
  { id: 'onze', french: 'Onze', phonetic: 'OHNZ', english: 'Eleven', category: 'numbers' },
  { id: 'douze', french: 'Douze', phonetic: 'DOOZ', english: 'Twelve', category: 'numbers' },
  { id: 'treize', french: 'Treize', phonetic: 'TREZ', english: 'Thirteen', category: 'numbers' },
  { id: 'quatorze', french: 'Quatorze', phonetic: 'kah-TORZ', english: 'Fourteen', category: 'numbers' },
  { id: 'quinze', french: 'Quinze', phonetic: 'KANZ', english: 'Fifteen', category: 'numbers' },
  { id: 'seize', french: 'Seize', phonetic: 'SEZ', english: 'Sixteen', category: 'numbers' },
  { id: 'dix-sept', french: 'Dix-sept', phonetic: 'dee-SET', english: 'Seventeen', category: 'numbers' },
  { id: 'dix-huit', french: 'Dix-huit', phonetic: 'deez-WEET', english: 'Eighteen', category: 'numbers' },
  { id: 'dix-neuf', french: 'Dix-neuf', phonetic: 'deez-NUHF', english: 'Nineteen', category: 'numbers' },
  { id: 'vingt', french: 'Vingt', phonetic: 'VAN', english: 'Twenty', category: 'numbers' },
  { id: 'trente', french: 'Trente', phonetic: 'TRAHNT', english: 'Thirty', category: 'numbers' },
  { id: 'quarante', french: 'Quarante', phonetic: 'kah-RAHNT', english: 'Forty', category: 'numbers' },
  { id: 'cinquante', french: 'Cinquante', phonetic: 'sang-KAHNT', english: 'Fifty', category: 'numbers' },
  { id: 'soixante', french: 'Soixante', phonetic: 'swah-SAHNT', english: 'Sixty', category: 'numbers' },
  { id: 'cent', french: 'Cent', phonetic: 'SAHN', english: 'One hundred', category: 'numbers' },
  { id: 'mille', french: 'Mille', phonetic: 'MEEL', english: 'One thousand', category: 'numbers' },

  // ─── Family ─────────────────────────────────────────────────────────────
  { id: 'la-famille', french: 'la famille', phonetic: 'lah fah-MEE-yuh', english: 'family', category: 'family', gender: 'f' },
  { id: 'le-pere', french: 'le père', phonetic: 'luh PEHR', english: 'father', category: 'family', gender: 'm' },
  { id: 'la-mere', french: 'la mère', phonetic: 'lah MEHR', english: 'mother', category: 'family', gender: 'f' },
  { id: 'le-frere', french: 'le frère', phonetic: 'luh FREHR', english: 'brother', category: 'family', gender: 'm' },
  { id: 'la-soeur', french: 'la sœur', phonetic: 'lah SUHR', english: 'sister', category: 'family', gender: 'f' },
  { id: 'le-fils', french: 'le fils', phonetic: 'luh FEES', english: 'son', category: 'family', gender: 'm' },
  { id: 'la-fille', french: 'la fille', phonetic: 'lah FEE-yuh', english: 'daughter / girl', category: 'family', gender: 'f' },
  { id: 'les-parents', french: 'les parents', phonetic: 'lay pah-RAHN', english: 'parents', category: 'family', gender: 'm' },
  { id: 'le-mari', french: 'le mari', phonetic: 'luh mah-REE', english: 'husband', category: 'family', gender: 'm' },
  { id: 'la-femme', french: 'la femme', phonetic: 'lah FAHM', english: 'wife / woman', category: 'family', gender: 'f' },
  { id: 'le-grand-pere', french: 'le grand-père', phonetic: 'luh grahn-PEHR', english: 'grandfather', category: 'family', gender: 'm' },
  { id: 'la-grand-mere', french: 'la grand-mère', phonetic: 'lah grahn-MEHR', english: 'grandmother', category: 'family', gender: 'f' },
  { id: 'lenfant', french: "l'enfant", phonetic: 'lahn-FAHN', english: 'child', category: 'family' },
  { id: 'le-cousin', french: 'le cousin / la cousine', phonetic: 'luh koo-ZAN / lah koo-ZEEN', english: 'cousin', category: 'family' },
  { id: 'le-bebe', french: 'le bébé', phonetic: 'luh bay-BAY', english: 'baby', category: 'family', gender: 'm' },
  { id: 'lami', french: "l'ami / l'amie", phonetic: 'lah-MEE', english: 'friend', category: 'family' },

  // ─── Food & Drink ───────────────────────────────────────────────────────
  { id: 'le-pain', french: 'le pain', phonetic: 'luh PAN', english: 'bread', category: 'food', gender: 'm' },
  { id: 'le-fromage', french: 'le fromage', phonetic: 'luh froh-MAHZH', english: 'cheese', category: 'food', gender: 'm' },
  { id: 'le-lait', french: 'le lait', phonetic: 'luh LEH', english: 'milk', category: 'food', gender: 'm' },
  { id: 'leau', french: "l'eau", phonetic: 'LOH', english: 'water', category: 'food', gender: 'f' },
  { id: 'le-cafe', french: 'le café', phonetic: 'luh kah-FAY', english: 'coffee', category: 'food', gender: 'm' },
  { id: 'le-the', french: 'le thé', phonetic: 'luh TAY', english: 'tea', category: 'food', gender: 'm' },
  { id: 'le-vin', french: 'le vin', phonetic: 'luh VAN', english: 'wine', category: 'food', gender: 'm' },
  { id: 'la-viande', french: 'la viande', phonetic: 'lah vee-AHND', english: 'meat', category: 'food', gender: 'f' },
  { id: 'le-poulet', french: 'le poulet', phonetic: 'luh poo-LEH', english: 'chicken', category: 'food', gender: 'm' },
  { id: 'le-poisson', french: 'le poisson', phonetic: 'luh pwah-SOHN', english: 'fish', category: 'food', gender: 'm' },
  { id: 'les-legumes', french: 'les légumes', phonetic: 'lay lay-GOOM', english: 'vegetables', category: 'food', gender: 'm' },
  { id: 'les-fruits', french: 'les fruits', phonetic: 'lay FRWEE', english: 'fruit', category: 'food', gender: 'm' },
  { id: 'la-pomme', french: 'la pomme', phonetic: 'lah POHM', english: 'apple', category: 'food', gender: 'f' },
  { id: 'la-banane', french: 'la banane', phonetic: 'lah bah-NAHN', english: 'banana', category: 'food', gender: 'f' },
  { id: 'lorange', french: "l'orange", phonetic: 'loh-RAHNZH', english: 'orange', category: 'food', gender: 'f' },
  { id: 'le-sucre', french: 'le sucre', phonetic: 'luh SOO-kruh', english: 'sugar', category: 'food', gender: 'm' },
  { id: 'le-sel', french: 'le sel', phonetic: 'luh SEL', english: 'salt', category: 'food', gender: 'm' },
  { id: 'le-petit-dejeuner', french: 'le petit déjeuner', phonetic: 'luh puh-tee day-zhuh-NAY', english: 'breakfast', category: 'food', gender: 'm' },
  { id: 'le-dejeuner', french: 'le déjeuner', phonetic: 'luh day-zhuh-NAY', english: 'lunch', category: 'food', gender: 'm' },
  { id: 'le-diner', french: 'le dîner', phonetic: 'luh dee-NAY', english: 'dinner', category: 'food', gender: 'm' },
  { id: 'le-restaurant', french: 'le restaurant', phonetic: 'luh res-toh-RAHN', english: 'restaurant', category: 'food', gender: 'm' },
  { id: 'laddition', french: "l'addition", phonetic: 'lah-dee-see-OHN', english: 'the bill / check', category: 'food', gender: 'f' },
  { id: 'delicieux', french: 'délicieux', phonetic: 'day-lee-see-UH', english: 'delicious', category: 'food' },
  { id: 'jai-faim', french: 'J\'ai faim', phonetic: 'zhay FAN', english: "I'm hungry", category: 'food' },
  { id: 'jai-soif', french: 'J\'ai soif', phonetic: 'zhay SWAHF', english: "I'm thirsty", category: 'food' },

  // ─── Colors ─────────────────────────────────────────────────────────────
  { id: 'rouge', french: 'rouge', phonetic: 'ROOZH', english: 'red', category: 'colors' },
  { id: 'bleu', french: 'bleu', phonetic: 'BLUH', english: 'blue', category: 'colors' },
  { id: 'vert', french: 'vert', phonetic: 'VEHR', english: 'green', category: 'colors' },
  { id: 'jaune', french: 'jaune', phonetic: 'ZHOHN', english: 'yellow', category: 'colors' },
  { id: 'noir', french: 'noir', phonetic: 'NWAHR', english: 'black', category: 'colors' },
  { id: 'blanc', french: 'blanc', phonetic: 'BLAHN', english: 'white', category: 'colors' },
  { id: 'gris', french: 'gris', phonetic: 'GREE', english: 'grey', category: 'colors' },
  { id: 'orange-color', french: 'orange', phonetic: 'oh-RAHNZH', english: 'orange', category: 'colors' },
  { id: 'violet', french: 'violet', phonetic: 'vee-oh-LEH', english: 'purple', category: 'colors' },
  { id: 'rose', french: 'rose', phonetic: 'ROHZ', english: 'pink', category: 'colors' },
  { id: 'marron', french: 'marron', phonetic: 'mah-ROHN', english: 'brown', category: 'colors' },
  { id: 'clair-fonce', french: 'clair / foncé', phonetic: 'KLEHR / fohn-SAY', english: 'light / dark', category: 'colors' },

  // ─── Time & Days ────────────────────────────────────────────────────────
  { id: 'le-temps', french: 'le temps', phonetic: 'luh TAHN', english: 'time / weather', category: 'time', gender: 'm' },
  { id: 'aujourdhui', french: "aujourd'hui", phonetic: 'oh-zhoor-DWEE', english: 'today', category: 'time' },
  { id: 'demain', french: 'demain', phonetic: 'duh-MAN', english: 'tomorrow', category: 'time' },
  { id: 'hier', french: 'hier', phonetic: 'YEHR', english: 'yesterday', category: 'time' },
  { id: 'le-matin', french: 'le matin', phonetic: 'luh mah-TAN', english: 'morning', category: 'time', gender: 'm' },
  { id: 'lapres-midi', french: "l'après-midi", phonetic: 'lah-preh-mee-DEE', english: 'afternoon', category: 'time' },
  { id: 'le-soir', french: 'le soir', phonetic: 'luh SWAHR', english: 'evening', category: 'time', gender: 'm' },
  { id: 'la-nuit', french: 'la nuit', phonetic: 'lah NWEE', english: 'night', category: 'time', gender: 'f' },
  { id: 'lundi', french: 'lundi', phonetic: 'luhn-DEE', english: 'Monday', category: 'time' },
  { id: 'mardi', french: 'mardi', phonetic: 'mar-DEE', english: 'Tuesday', category: 'time' },
  { id: 'mercredi', french: 'mercredi', phonetic: 'mehr-kruh-DEE', english: 'Wednesday', category: 'time' },
  { id: 'jeudi', french: 'jeudi', phonetic: 'zhuh-DEE', english: 'Thursday', category: 'time' },
  { id: 'vendredi', french: 'vendredi', phonetic: 'vahn-druh-DEE', english: 'Friday', category: 'time' },
  { id: 'samedi', french: 'samedi', phonetic: 'sahm-DEE', english: 'Saturday', category: 'time' },
  { id: 'dimanche', french: 'dimanche', phonetic: 'dee-MAHNSH', english: 'Sunday', category: 'time' },
  { id: 'maintenant', french: 'maintenant', phonetic: 'man-tuh-NAHN', english: 'now', category: 'time' },

  // ─── Verbs ──────────────────────────────────────────────────────────────
  { id: 'etre', french: 'être', phonetic: 'EH-truh', english: 'to be', category: 'verbs', example_fr: 'Je suis fatigué.', example_en: 'I am tired.' },
  { id: 'avoir', french: 'avoir', phonetic: 'ah-VWAHR', english: 'to have', category: 'verbs', example_fr: "J'ai un chien.", example_en: 'I have a dog.' },
  { id: 'aller', french: 'aller', phonetic: 'ah-LAY', english: 'to go', category: 'verbs', example_fr: 'Je vais au marché.', example_en: 'I am going to the market.' },
  { id: 'faire', french: 'faire', phonetic: 'FEHR', english: 'to do / to make', category: 'verbs' },
  { id: 'vouloir', french: 'vouloir', phonetic: 'voo-LWAHR', english: 'to want', category: 'verbs', example_fr: 'Je veux un café.', example_en: 'I want a coffee.' },
  { id: 'pouvoir', french: 'pouvoir', phonetic: 'poo-VWAHR', english: 'to be able to / can', category: 'verbs' },
  { id: 'devoir', french: 'devoir', phonetic: 'duh-VWAHR', english: 'to have to / must', category: 'verbs' },
  { id: 'savoir', french: 'savoir', phonetic: 'sah-VWAHR', english: 'to know (a fact)', category: 'verbs' },
  { id: 'connaitre', french: 'connaître', phonetic: 'koh-NEH-truh', english: 'to know (a person/place)', category: 'verbs' },
  { id: 'voir', french: 'voir', phonetic: 'VWAHR', english: 'to see', category: 'verbs' },
  { id: 'venir', french: 'venir', phonetic: 'vuh-NEER', english: 'to come', category: 'verbs' },
  { id: 'prendre', french: 'prendre', phonetic: 'PRAHN-druh', english: 'to take', category: 'verbs' },
  { id: 'mettre', french: 'mettre', phonetic: 'MEH-truh', english: 'to put', category: 'verbs' },
  { id: 'dire', french: 'dire', phonetic: 'DEER', english: 'to say', category: 'verbs' },
  { id: 'parler', french: 'parler', phonetic: 'par-LAY', english: 'to speak', category: 'verbs', example_fr: 'Je parle un peu français.', example_en: 'I speak a little French.' },
  { id: 'manger', french: 'manger', phonetic: 'mahn-ZHAY', english: 'to eat', category: 'verbs' },
  { id: 'boire', french: 'boire', phonetic: 'BWAHR', english: 'to drink', category: 'verbs' },
  { id: 'dormir', french: 'dormir', phonetic: 'dor-MEER', english: 'to sleep', category: 'verbs' },
  { id: 'travailler', french: 'travailler', phonetic: 'trah-vah-YAY', english: 'to work', category: 'verbs' },
  { id: 'aimer', french: 'aimer', phonetic: 'eh-MAY', english: 'to like / to love', category: 'verbs', example_fr: "J'aime la musique.", example_en: 'I like music.' },
  { id: 'habiter', french: 'habiter', phonetic: 'ah-bee-TAY', english: 'to live (reside)', category: 'verbs' },
  { id: 'acheter', french: 'acheter', phonetic: 'ash-TAY', english: 'to buy', category: 'verbs' },
  { id: 'comprendre', french: 'comprendre', phonetic: 'kohn-PRAHN-druh', english: 'to understand', category: 'verbs', example_fr: 'Je ne comprends pas.', example_en: "I don't understand." },
  { id: 'chercher', french: 'chercher', phonetic: 'shehr-SHAY', english: 'to look for', category: 'verbs' },

  // ─── Travel ─────────────────────────────────────────────────────────────
  { id: 'laeroport', french: "l'aéroport", phonetic: 'lah-ay-roh-POR', english: 'airport', category: 'travel', gender: 'm' },
  { id: 'la-gare', french: 'la gare', phonetic: 'lah GAHR', english: 'train station', category: 'travel', gender: 'f' },
  { id: 'le-billet', french: 'le billet', phonetic: 'luh bee-YEH', english: 'ticket', category: 'travel', gender: 'm' },
  { id: 'le-passeport', french: 'le passeport', phonetic: 'luh pahs-POR', english: 'passport', category: 'travel', gender: 'm' },
  { id: 'lhotel', french: "l'hôtel", phonetic: 'loh-TEL', english: 'hotel', category: 'travel', gender: 'm' },
  { id: 'la-valise', french: 'la valise', phonetic: 'lah vah-LEEZ', english: 'suitcase', category: 'travel', gender: 'f' },
  { id: 'a-gauche', french: 'à gauche', phonetic: 'ah GOHSH', english: 'to the left', category: 'travel' },
  { id: 'a-droite', french: 'à droite', phonetic: 'ah DRWAHT', english: 'to the right', category: 'travel' },
  { id: 'tout-droit', french: 'tout droit', phonetic: 'too DRWAH', english: 'straight ahead', category: 'travel' },
  { id: 'pres', french: 'près', phonetic: 'PREH', english: 'near', category: 'travel' },
  { id: 'loin', french: 'loin', phonetic: 'LWAN', english: 'far', category: 'travel' },
  { id: 'le-taxi', french: 'le taxi', phonetic: 'luh tahk-SEE', english: 'taxi', category: 'travel', gender: 'm' },
  { id: 'la-carte', french: 'la carte', phonetic: 'lah KART', english: 'map', category: 'travel', gender: 'f' },
  { id: 'ou-est', french: 'Où est... ?', phonetic: 'oo EH', english: 'Where is...?', category: 'travel', example_fr: 'Où est la gare ?', example_en: 'Where is the train station?' },

  // ─── Body ───────────────────────────────────────────────────────────────
  { id: 'la-tete', french: 'la tête', phonetic: 'lah TET', english: 'head', category: 'body', gender: 'f' },
  { id: 'les-yeux', french: 'les yeux', phonetic: 'lay-ZYUH', english: 'eyes', category: 'body', gender: 'm' },
  { id: 'le-nez', french: 'le nez', phonetic: 'luh NAY', english: 'nose', category: 'body', gender: 'm' },
  { id: 'la-bouche', french: 'la bouche', phonetic: 'lah BOOSH', english: 'mouth', category: 'body', gender: 'f' },
  { id: 'la-main', french: 'la main', phonetic: 'lah MAN', english: 'hand', category: 'body', gender: 'f' },
  { id: 'le-bras', french: 'le bras', phonetic: 'luh BRAH', english: 'arm', category: 'body', gender: 'm' },
  { id: 'la-jambe', french: 'la jambe', phonetic: 'lah ZHAHMB', english: 'leg', category: 'body', gender: 'f' },
  { id: 'le-pied', french: 'le pied', phonetic: 'luh pee-AY', english: 'foot', category: 'body', gender: 'm' },
  { id: 'le-coeur', french: 'le cœur', phonetic: 'luh KUHR', english: 'heart', category: 'body', gender: 'm' },
  { id: 'le-dos', french: 'le dos', phonetic: 'luh DOH', english: 'back', category: 'body', gender: 'm' },

  // ─── Weather ────────────────────────────────────────────────────────────
  { id: 'il-fait-beau', french: 'Il fait beau', phonetic: 'eel feh BOH', english: "It's nice weather", category: 'weather' },
  { id: 'il-fait-chaud', french: 'Il fait chaud', phonetic: 'eel feh SHOH', english: "It's hot", category: 'weather' },
  { id: 'il-fait-froid', french: 'Il fait froid', phonetic: 'eel feh FRWAH', english: "It's cold", category: 'weather' },
  { id: 'il-pleut', french: 'Il pleut', phonetic: 'eel PLUH', english: "It's raining", category: 'weather' },
  { id: 'il-neige', french: 'Il neige', phonetic: 'eel NEZH', english: "It's snowing", category: 'weather' },
  { id: 'le-soleil', french: 'le soleil', phonetic: 'luh soh-LAY', english: 'sun', category: 'weather', gender: 'm' },
  { id: 'le-nuage', french: 'le nuage', phonetic: 'luh new-AHZH', english: 'cloud', category: 'weather', gender: 'm' },
  { id: 'le-vent', french: 'le vent', phonetic: 'luh VAHN', english: 'wind', category: 'weather', gender: 'm' },

  // ─── Adjectives / Emotions ──────────────────────────────────────────────
  { id: 'heureux', french: 'heureux / heureuse', phonetic: 'uh-RUH / uh-RUHZ', english: 'happy', category: 'emotions' },
  { id: 'triste', french: 'triste', phonetic: 'TREEST', english: 'sad', category: 'emotions' },
  { id: 'fatigue', french: 'fatigué(e)', phonetic: 'fah-tee-GAY', english: 'tired', category: 'emotions' },
  { id: 'content', french: 'content(e)', phonetic: 'kohn-TAHN', english: 'glad / pleased', category: 'emotions' },
  { id: 'en-colere', french: 'en colère', phonetic: 'ahn koh-LEHR', english: 'angry', category: 'emotions' },
  { id: 'grand', french: 'grand(e)', phonetic: 'GRAHN / GRAHND', english: 'big / tall', category: 'emotions' },
  { id: 'petit', french: 'petit(e)', phonetic: 'puh-TEE / puh-TEET', english: 'small', category: 'emotions' },
  { id: 'beau', french: 'beau / belle', phonetic: 'BOH / BEL', english: 'beautiful', category: 'emotions' },
  { id: 'bon', french: 'bon / bonne', phonetic: 'BOHN / BUN', english: 'good', category: 'emotions' },
  { id: 'mauvais', french: 'mauvais(e)', phonetic: 'moh-VEH', english: 'bad', category: 'emotions' },
  { id: 'facile', french: 'facile', phonetic: 'fah-SEEL', english: 'easy', category: 'emotions' },
  { id: 'difficile', french: 'difficile', phonetic: 'dee-fee-SEEL', english: 'difficult', category: 'emotions' },
  { id: 'rapide', french: 'rapide', phonetic: 'rah-PEED', english: 'fast', category: 'emotions' },
  { id: 'lent', french: 'lent(e)', phonetic: 'LAHN / LAHNT', english: 'slow', category: 'emotions' },
  { id: 'nouveau', french: 'nouveau / nouvelle', phonetic: 'noo-VOH / noo-VEL', english: 'new', category: 'emotions' },
  { id: 'vieux', french: 'vieux / vieille', phonetic: 'VYUH / VYAY', english: 'old', category: 'emotions' },
  { id: 'chaud', french: 'chaud(e)', phonetic: 'SHOH / SHOHD', english: 'hot', category: 'emotions' },
  { id: 'froid', french: 'froid(e)', phonetic: 'FRWAH / FRWAHD', english: 'cold', category: 'emotions' },

  // ─── Questions ──────────────────────────────────────────────────────────
  { id: 'qui', french: 'qui', phonetic: 'KEE', english: 'who', category: 'questions' },
  { id: 'que-quoi', french: 'que / quoi', phonetic: 'kuh / KWAH', english: 'what', category: 'questions' },
  { id: 'ou', french: 'où', phonetic: 'OO', english: 'where', category: 'questions' },
  { id: 'quand', french: 'quand', phonetic: 'KAHN', english: 'when', category: 'questions' },
  { id: 'pourquoi', french: 'pourquoi', phonetic: 'poor-KWAH', english: 'why', category: 'questions', example_fr: "Pourquoi pas ?", example_en: 'Why not?' },
  { id: 'comment', french: 'comment', phonetic: 'koh-MAHN', english: 'how', category: 'questions' },
  { id: 'combien', french: 'combien', phonetic: 'kohm-bee-EN', english: 'how much / how many', category: 'questions', example_fr: 'Combien ça coûte ?', example_en: 'How much does this cost?' },
  { id: 'quel', french: 'quel / quelle', phonetic: 'KEL', english: 'which / what', category: 'questions' },
  { id: 'est-ce-que', french: 'est-ce que', phonetic: 'es-kuh', english: '(question marker — "is it that...")', category: 'questions' },

  // ─── House & Objects ────────────────────────────────────────────────────
  { id: 'la-maison', french: 'la maison', phonetic: 'lah meh-ZOHN', english: 'house', category: 'objects', gender: 'f' },
  { id: 'la-chambre', french: 'la chambre', phonetic: 'lah SHAHM-bruh', english: 'bedroom', category: 'objects', gender: 'f' },
  { id: 'la-cuisine', french: 'la cuisine', phonetic: 'lah kwee-ZEEN', english: 'kitchen', category: 'objects', gender: 'f' },
  { id: 'la-porte', french: 'la porte', phonetic: 'lah PORT', english: 'door', category: 'objects', gender: 'f' },
  { id: 'la-fenetre', french: 'la fenêtre', phonetic: 'lah fuh-NEH-truh', english: 'window', category: 'objects', gender: 'f' },
  { id: 'la-table', french: 'la table', phonetic: 'lah TAH-bluh', english: 'table', category: 'objects', gender: 'f' },
  { id: 'la-chaise', french: 'la chaise', phonetic: 'lah SHEZ', english: 'chair', category: 'objects', gender: 'f' },
  { id: 'le-lit', french: 'le lit', phonetic: 'luh LEE', english: 'bed', category: 'objects', gender: 'm' },
  { id: 'le-livre', french: 'le livre', phonetic: 'luh LEE-vruh', english: 'book', category: 'objects', gender: 'm' },
  { id: 'le-telephone', french: 'le téléphone', phonetic: 'luh tay-lay-FOHN', english: 'phone', category: 'objects', gender: 'm' },
  { id: 'la-voiture', french: 'la voiture', phonetic: 'lah vwah-TOOR', english: 'car', category: 'objects', gender: 'f' },
  { id: 'largent', french: "l'argent", phonetic: 'lar-ZHAHN', english: 'money', category: 'objects', gender: 'm' },
  { id: 'la-salle-de-bain', french: 'la salle de bain', phonetic: 'lah sal duh BAN', english: 'bathroom', category: 'objects', gender: 'f' },
  { id: 'la-cle', french: 'la clé', phonetic: 'lah KLAY', english: 'key', category: 'objects', gender: 'f' },

  // ─── Animals ────────────────────────────────────────────────────────────
  { id: 'le-chien', french: 'le chien', phonetic: 'luh shee-EN', english: 'dog', category: 'animals', gender: 'm' },
  { id: 'le-chat', french: 'le chat', phonetic: 'luh SHAH', english: 'cat', category: 'animals', gender: 'm' },
  { id: 'loiseau', french: "l'oiseau", phonetic: 'lwah-ZOH', english: 'bird', category: 'animals', gender: 'm' },
  { id: 'le-cheval', french: 'le cheval', phonetic: 'luh shuh-VAL', english: 'horse', category: 'animals', gender: 'm' },
  { id: 'la-vache', french: 'la vache', phonetic: 'lah VASH', english: 'cow', category: 'animals', gender: 'f' },
  { id: 'le-lapin', french: 'le lapin', phonetic: 'luh lah-PAN', english: 'rabbit', category: 'animals', gender: 'm' },
  { id: 'la-souris', french: 'la souris', phonetic: 'lah soo-REE', english: 'mouse', category: 'animals', gender: 'f' },
  { id: 'le-canard', french: 'le canard', phonetic: 'luh kah-NAR', english: 'duck', category: 'animals', gender: 'm' },
  { id: 'le-mouton', french: 'le mouton', phonetic: 'luh moo-TOHN', english: 'sheep', category: 'animals', gender: 'm' },
  { id: 'lelephant', french: "l'éléphant", phonetic: 'lay-lay-FAHN', english: 'elephant', category: 'animals', gender: 'm' },
  { id: 'le-lion', french: 'le lion', phonetic: 'luh lee-OHN', english: 'lion', category: 'animals', gender: 'm' },
];
