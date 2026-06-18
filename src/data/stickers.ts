import { Sticker } from "../types";

export const TEAMS_DATA: { [code: string]: { name: string; flag: string; players: string[] } } = {
  ARG: { name: "Argentina", flag: "🇦🇷", players: ["Lionel Messi", "Emiliano Martínez", "Rodrigo De Paul"] },
  BRA: { name: "Brazil", flag: "🇧🇷", players: ["Neymar Jr.", "Vinícius Jr.", "Casemiro"] },
  FRA: { name: "France", flag: "🇫🇷", players: ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé"] },
  GER: { name: "Germany", flag: "🇩🇪", players: ["Jamal Musiala", "Florian Wirtz", "Kai Havertz"] },
  ENG: { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", players: ["Jude Bellingham", "Bukayo Saka", "Harry Kane"] },
  USA: { name: "United States", flag: "🇺🇸", players: ["Christian Pulisic", "Weston McKennie", "Tyler Adams"] },
  MEX: { name: "Mexico", flag: "🇲🇽", players: ["Santiago Giménez", "Guillermo Ochoa", "Edson Álvarez"] },
  CAN: { name: "Canada", flag: "🇨🇦", players: ["Alphonso Davies", "Jonathan David", "Stephen Eustáquio"] },
  ITA: { name: "Italy", flag: "🇮🇹", players: ["Federico Chiesa", "Nicolò Barella", "Gianluigi Donnarumma"] },
  ESP: { name: "Spain", flag: "🇪🇸", players: ["Lamine Yamal", "Rodri", "Pedri"] },
  POR: { name: "Portugal", flag: "🇵🇹", players: ["Cristiano Ronaldo", "Bruno Fernandes", "Bernardo Silva"] },
  NED: { name: "Netherlands", flag: "🇳🇱", players: ["Virgil van Dijk", "Frenkie de Jong", "Cody Gakpo"] },
  BEL: { name: "Belgium", flag: "🇧🇪", players: ["Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku"] },
  CRO: { name: "Croatia", flag: "🇭🇷", players: ["Luka Modrić", "Mateo Kovačić", "Joško Gvardiol"] },
  MAR: { name: "Morocco", flag: "🇲🇦", players: ["Achraf Hakimi", "Yassine Bounou", "Sofyan Amrabat"] },
  SEN: { name: "Senegal", flag: "🇸🇳", players: ["Sadio Mané", "Kalidou Koulibaly", "Édouard Mendy"] },
  JPN: { name: "Japan", flag: "🇯🇵", players: ["Kaoru Mitoma", "Wataru Endo", "Takefusa Kubo"] },
  KOR: { name: "South Korea", flag: "🇰🇷", players: ["Son Heung-min", "Kim Min-jae", "Hwang Hee-chan"] },
  AUS: { name: "Australia", flag: "🇦🇺", players: ["Mathew Ryan", "Jackson Irvine", "Harry Souttar"] },
  URU: { name: "Uruguay", flag: "🇺🇾", players: ["Federico Valverde", "Darwin Núñez", "Ronald Araujo"] },
  COL: { name: "Colombia", flag: "🇨🇴", players: ["Luis Díaz", "James Rodríguez", "Davinson Sánchez"] },
  ECU: { name: "Ecuador", flag: "🇪🇨", players: ["Moisés Caicedo", "Pervis Estupiñán", "Piero Hincapié"] },
  SUI: { name: "Switzerland", flag: "🇨🇭", players: ["Granit Xhaka", "Yann Sommer", "Manuel Akanji"] },
  DEN: { name: "Denmark", flag: "🇩🇰", players: ["Christian Eriksen", "Rasmus Højlund", "Pierre-Emile Højbjerg"] },
  SWE: { name: "Sweden", flag: "🇸🇪", players: ["Alexander Isak", "Dejan Kulusevski", "Viktor Gyökeres"] },
  POL: { name: "Poland", flag: "🇵🇱", players: ["Robert Lewandowski", "Piotr Zieliński", "Matty Cash"] },
  UKR: { name: "Ukraine", flag: "🇺🇦", players: ["Oleksandr Zinchenko", "Mykhailo Mudryk", "Artem Dovbyk"] },
  WAL: { name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", players: ["Brennan Johnson", "Daniel James", "Ethan Ampadu"] },
  SCO: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", players: ["Andrew Robertson", "Scott McTominay", "Billy Gilmour"] },
  TUR: { name: "Turkey", flag: "🇹🇷", players: ["Arda Güler", "Hakan Çalhanoğlu", "Kenan Yıldız"] },
  GRE: { name: "Greece", flag: "🇬🇷", players: ["Anastasios Bakasetas", "Odysseas Vlachodimos", "Kostas Tsimikas"] },
  EGY: { name: "Egypt", flag: "🇪🇬", players: ["Mohamed Salah", "Mostafa Mohamed", "Trézéguet"] },
  NGA: { name: "Nigeria", flag: "🇳🇬", players: ["Victor Osimhen", "Ademola Lookman", "Alex Iwobi"] },
  GHA: { name: "Ghana", flag: "🇬🇭", players: ["Mohammed Kudus", "Inaki Williams", "Jordan Ayew"] },
  CMR: { name: "Cameroon", flag: "🇨🇲", players: ["Vincent Aboubakar", "André Onana", "Bryan Mbeumo"] },
  TUN: { name: "Tunisia", flag: "🇹🇳", players: ["Youssef Msakni", "Ellyes Skhiri", "Hannibal Mejbri"] },
  KSA: { name: "Saudi Arabia", flag: "🇸🇦", players: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Saud Abdulhamid"] },
  IRN: { name: "Iran", flag: "🇮🇷", players: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"] },
  IRQ: { name: "Iraq", flag: "🇮🇶", players: ["Aymen Hussein", "Ali Jasim", "Zidane Iqbal"] },
  QAT: { name: "Qatar", flag: "🇶🇦", players: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos"] },
  UAE: { name: "United Arab Emirates", flag: "🇦🇪", players: ["Ali Mabkhout", "Fabio Lima", "Caio Canedo"] },
  PER: { name: "Peru", flag: "🇵🇪", players: ["Gianluca Lapadula", "Luis Advíncula", "Jefferson Farfán"] },
  CHI: { name: "Chile", flag: "🇨🇱", players: ["Alexis Sánchez", "Eduardo Vargas", "Claudio Bravo"] },
  PAR: { name: "Paraguay", flag: "🇵🇾", players: ["Miguel Almirón", "Julio Enciso", "Gustavo Gómez"] },
  VEN: { name: "Venezuela", flag: "🇻🇪", players: ["Salomón Rondón", "Yangel Herrera", "Jefferson Savarino"] },
  CRC: { name: "Costa Rica", flag: "🇨🇷", players: ["Joel Campbell", "Francisco Calvo", "Keylor Navas"] },
  JAM: { name: "Jamaica", flag: "🇯🇲", players: ["Leon Bailey", "Michail Antonio", "Bobby Decordova-Reid"] },
  PAN: { name: "Panama", flag: "🇵🇦", players: ["Adalberto Carrasquilla", "Ismael Díaz", "Aníbal Godoy"] }
};

const makeStickerList = (): Sticker[] => {
  const list: Sticker[] = [];

  // Loop through all 48 teams
  Object.keys(TEAMS_DATA).forEach((code) => {
    const team = TEAMS_DATA[code];
    
    // Each team now has exactly 20 cards!
    const positionNames = [
      "Team Crest Badge",       // #1
      "Full Team Squad photo",  // #2
      team.players[0],          // #3 (Superstar 1)
      team.players[1],          // #4 (Superstar 2)
      team.players[2],          // #5 (Superstar 3)
      "Goalkeeper (GK)",        // #6
      "Right Defending Back",   // #7
      "Center Defending Back",  // #8
      "Left Defending Back",    // #9
      "Defending Midfielder",   // #10
      "Central Playmaker",      // #11
      "Attacking Midfielder",   // #12
      "Left Winger Forward",    // #13
      "Right Winger Forward",   // #14
      "Center Striker (ST)",    // #15
      "Goalkeeper Reserve",     // #16
      "Defense Substitute",     // #17
      "Midfield Substitute",    // #18
      "Attack Substitute",      // #19
      "Team Coach Manager"      // #20
    ];

    for (let num = 1; num <= 20; num++) {
      const name = positionNames[num - 1];
      let fact = "";
      if (num === 1) {
        fact = `${team.name}'s official crest is a symbol of immense country pride and historical federation glory!`;
      } else if (num === 2) {
        fact = `The official collective World Cup squad photograph for the legendary ${team.name} national crew.`;
      } else if (num <= 5) {
        fact = `${name} is a high-profile elite key athlete carrying the dreams and expectations of ${team.name}.`;
      } else {
        fact = `Representing slot #${num} for ${team.name} in their quest for global stadium glory in the World Cup!`;
      }

      list.push({
        id: `${code} ${num}`,
        team: team.name,
        code: code,
        number: num,
        name: name,
        ownedStatus: "needed",
        doublesCount: 0,
        fact: fact
      });
    }
  });

  // FWC Special Legends (World Cup Specials - 10 slots!)
  const fwcSpecials = [
    { num: 1, name: "FIFA World Cup Trophy", fact: "The real solid-gold FIFA World Cup Trophy weighs 6.1 kilograms and is kept in a Switzerland high-security vault!" },
    { num: 2, name: "Official mascot", fact: "Panini special mascot stickers are always highly rare, often selling for thousands at global collector auctions!" },
    { num: 3, name: "Lusail Stadium Qatar", fact: "This golden bowl stadium design is inspired by handcrafted artwork and light lanterns across the Middle East." },
    { num: 4, name: "Legend Pelé", fact: "The legendary Pelé is the only athlete in global football history to win three clean World Cups (1958, 1962, 1970)!" },
    { num: 5, name: "Legend Diego Maradona", fact: "Maradona's spectacular 'Goal of the Century' in 1986 involved passing five separate defenders in 10 seconds!" },
    { num: 6, name: "Legend Zinedine Zidane", fact: "Zidane's epic brace at the Stade de France secured France's first historic title on home turf in 1998!" },
    { num: 7, name: "Legend Ronaldo Nazário", fact: "The iconic Brazilian 'El Fenomeno' scored eight goals in 2002, fully claiming golden honors!" },
    { num: 8, name: "Legend Johan Cruyff", fact: "Inventor of the mesmerizing Cruyff Turn, Johan epitomized total football across the 1970s!" },
    { num: 9, name: "Legend Franz Beckenbauer", fact: "The legendary 'Kaiser' conquered the World Cup both as an field commander (1974) and manager (1990)!" },
    { num: 10, name: "Legend Michel Platini", fact: "Platini was three-time Ballon d'Or winner and orchestrated France's beautiful midfields." }
  ];

  fwcSpecials.forEach((f) => {
    list.push({
      id: `FWC ${f.num}`,
      team: "Special Legends",
      code: "FWC",
      number: f.num,
      name: f.name,
      ownedStatus: "needed",
      doublesCount: 0,
      fact: f.fact
    });
  });

  // Coca-Cola Special Section (CC- 10 slots!)
  const ccSpecials = [
    { num: 1, name: "Coca-Cola Celebration Anthem", fact: "The Coca-Cola celebratory series honors iconic fans and players matching team pride with world music!" },
    { num: 2, name: "Coca-Cola Fan Zone Arena", fact: "Coca-Cola fan stickers celebrate physical supporters painting their faces and chanting stadium songs!" },
    { num: 3, name: "Coca-Cola Pitch Side Magic", fact: "Representing high-definition sideline action cameras capturing real-time dramatic sliding tackles and flags!" },
    { num: 4, name: "Coca-Cola Zero Sugar Hero", fact: "Dedicated to the most energy-packed defensive star player running the longest sprint distances in games!" },
    { num: 5, name: "Coca-Cola Global Team Spirit", fact: "Showcases the beautiful gesture of team jersey swapping in fair play at the whistle of the match." },
    { num: 6, name: "Coca-Cola Golden Boot", fact: "The ultimate goal-scoring prize, sponsored for the striker with the most clinical scoring efficiency!" },
    { num: 7, name: "Coca-Cola Magic Wave Cheer", fact: "Honors the classic stadium wave moving across the spectators, a historical crowd staple since Mexico 1986!" },
    { num: 8, name: "Coca-Cola Ultimate Match Champion", fact: "The pinnacle of the Coca-Cola collection, representing the victorious team lifts of the FIFA gold medals!" },
    { num: 9, name: "Coca-Cola Classic Fan Banner", fact: "Celebrating generations of collector families cheering in unity with official flags and retro banners." },
    { num: 10, name: "Coca-Cola Trophy Tour Train", fact: "Commemorates the global train and airplane route transporting the original trophy to millions of fans!" }
  ];

  ccSpecials.forEach((c) => {
    list.push({
      id: `CC ${c.num}`,
      team: "Coca-Cola Section",
      code: "CC",
      number: c.num,
      name: c.name,
      ownedStatus: "needed",
      doublesCount: 0,
      fact: c.fact
    });
  });

  return list;
};

export const INITIAL_STICKERS: Sticker[] = makeStickerList();

export const TEAMS: { [key: string]: { name: string; flag: string } } = (() => {
  const obj: { [key: string]: { name: string; flag: string } } = {};
  Object.keys(TEAMS_DATA).forEach((code) => {
    obj[code] = { name: TEAMS_DATA[code].name, flag: TEAMS_DATA[code].flag };
  });
  obj["FWC"] = { name: "Special Legends", flag: "🏆" };
  obj["CC"] = { name: "Coca-Cola Section", flag: "🥤" };
  return obj;
})();
