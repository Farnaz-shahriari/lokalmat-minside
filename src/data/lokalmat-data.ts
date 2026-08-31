/* =============================================================================
   LOKALMAT DATASET
   =============================================================================
   Ported verbatim from the design handoff's design-source/data/lokalmat-data.js.
   Product records are real (from lokalmat_50_produkter_komplett.xlsx). Producer
   regions, coordinates, blurbs and approval statuses are believable SAMPLE data.

   IN PRODUCTION this whole file is replaced by API calls. The handoff lists what
   the server must supply: producers (with lat/lng), products, categories and
   filter definitions, the user's followed/saved sets, and their saved searches
   with unseen-hit counts. The unseen-hit count is a server concern — it drives
   the Min side notification section and the e-mail notifications.

   The 12 decorative category tints live in ./category-tints.ts, deliberately
   separated. See that file's header.
   ========================================================================== */

export interface Producer {
  id: string;
  name: string;
  town: string;
  county: string;
  region: string;
  lat: number;
  lng: number;
  blurb: string;
  categories: string[];
  productCount: number;
  /** Synthesised deterministically below, see the note on FILTER_DEFS. */
  marked: string[];
  rev: string[];
  salg: string[];
}

export interface Product {
  id: number;
  name: string;
  producer: string;
  producerId: string;
  category: string;
  subcategory?: string;
  description?: string;
  url?: string;
  approval: ApprovalState;
  fresh: "nyhet" | "oppdatert" | null;
  inSeason: boolean;
  /** Derived below from category + inSeason. */
  sesong: string;
}

export type ApprovalState = "none" | "til-behandling" | "godkjent";

export interface SavedSearchFilters {
  query: string;
  cats: string[];
  fylker: string[];
  marked: string[];
  rev: string[];
  salg: string[];
  sesong: string[];
  radius: number;
  approvedOnly: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  /** Unseen new hits. Server-owned in production. */
  count: number;
  filters: SavedSearchFilters;
  emailUpdates: boolean;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export { CATEGORIES } from "./category-tints";

type RawProducer = Omit<Producer, "marked" | "rev" | "salg">;

const RAW_PRODUCERS: RawProducer[] = [
  {
    "id": "prod-odhumbla-gardsmjolk",
    "name": "Ødhumbla gardsmjølk",
    "town": "Vågå",
    "county": "Innlandet",
    "region": "Vågå, Innlandet",
    "lat": 61.875,
    "lng": 9.099,
    "blurb": "Tradisjonell seterdrift i Gudbrandsdalen med upasteurisert mjølk fra eget kufjøs.",
    "categories": [
      "Meieriprodukter"
    ],
    "productCount": 1
  },
  {
    "id": "prod-roma",
    "name": "Roma",
    "town": "Ulvik",
    "county": "Vestland",
    "region": "Ulvik, Vestland",
    "lat": 60.566,
    "lng": 6.913,
    "blurb": "Presser brus og saft på frukt fra norske gårder i hjertet av Hardanger.",
    "categories": [
      "Drikkevarer"
    ],
    "productCount": 9
  },
  {
    "id": "prod-skakke-roykeri-as",
    "name": "Skakke Røykeri As",
    "town": "Stavanger",
    "county": "Rogaland",
    "region": "Stavanger, Rogaland",
    "lat": 58.97,
    "lng": 5.733,
    "blurb": "Lite håndverksrøykeri som varmrøyker fisk og kjøtt over orefra Ryfylke.",
    "categories": [
      "Kjøtt"
    ],
    "productCount": 1
  },
  {
    "id": "prod-raa-brewing",
    "name": "Raa Brewing",
    "town": "Bergen",
    "county": "Vestland",
    "region": "Bergen, Vestland",
    "lat": 60.391,
    "lng": 5.322,
    "blurb": "Mikrobryggeri på Vestlandet med fokus på ferske, ufiltrerte øltyper.",
    "categories": [
      "Alkoholholdige drikker"
    ],
    "productCount": 2
  },
  {
    "id": "prod-rorosfisk-as",
    "name": "RørosFisk AS",
    "town": "Røros",
    "county": "Trøndelag",
    "region": "Røros, Trøndelag",
    "lat": 62.574,
    "lng": 11.384,
    "blurb": "Oppdrett og foredling av fjellrøye i rent vann 600 meter over havet.",
    "categories": [
      "Fisk og sjømat"
    ],
    "productCount": 1
  },
  {
    "id": "prod-metervare-as",
    "name": "Metervare AS",
    "town": "Oslo",
    "county": "Oslo",
    "region": "Oslo, Oslo",
    "lat": 59.913,
    "lng": 10.752,
    "blurb": "Urbant matkollektiv som kortreist fermenterer og syltner råvarer fra Østlandet.",
    "categories": [
      "Kjøtt"
    ],
    "productCount": 1
  },
  {
    "id": "prod-eplehagen-havna",
    "name": "Eplehagen Havna",
    "town": "Larvik",
    "county": "Vestfold",
    "region": "Larvik, Vestfold",
    "lat": 59.053,
    "lng": 10.035,
    "blurb": "Familiegård i Vestfold med gamle eplesorter, most og syltetøy.",
    "categories": [
      "Drikkevarer"
    ],
    "productCount": 1
  },
  {
    "id": "prod-takka",
    "name": "Takka",
    "town": "Bærum",
    "county": "Akershus",
    "region": "Bærum, Akershus",
    "lat": 59.892,
    "lng": 10.546,
    "blurb": "Stenovnsbakeri som baker surdeigsbrød og flatbrød på norsk korn.",
    "categories": [
      "Korn- og Bakevarer"
    ],
    "productCount": 3
  },
  {
    "id": "prod-the-farm-society",
    "name": "The Farm Society™",
    "town": "Oslo",
    "county": "Oslo",
    "region": "Oslo, Oslo",
    "lat": 59.926,
    "lng": 10.741,
    "blurb": "Bynært andelslandbruk som leverer sesongkasser og spesialiteter til byen.",
    "categories": [
      "Frukt og grønt"
    ],
    "productCount": 2
  },
  {
    "id": "prod-arctic-botanics",
    "name": "Arctic Botanics",
    "town": "Tromsø",
    "county": "Troms",
    "region": "Tromsø, Troms",
    "lat": 69.649,
    "lng": 18.956,
    "blurb": "Destillerer arktiske urter og bær til alkoholfri og alkoholholdig drikke.",
    "categories": [
      "Frukt og grønt"
    ],
    "productCount": 6
  },
  {
    "id": "prod-lokken-gard-hvaler",
    "name": "Løkken Gård Hvaler",
    "town": "Hvaler",
    "county": "Østfold",
    "region": "Hvaler, Østfold",
    "lat": 59.052,
    "lng": 11.033,
    "blurb": "Øygård på Hvaler med grønnsaker dyrket i havluft og morenejord.",
    "categories": [
      "Saft, syltetøy, geleer",
      "Annet"
    ],
    "productCount": 8
  },
  {
    "id": "prod-kongshaug-krabbe-as",
    "name": "Kongshaug Krabbe AS",
    "town": "Austevoll",
    "county": "Vestland",
    "region": "Austevoll, Vestland",
    "lat": 60.083,
    "lng": 5.225,
    "blurb": "Fanger og koker taskekrabbe rett utenfor øyene sør for Bergen.",
    "categories": [
      "Fisk og sjømat"
    ],
    "productCount": 2
  },
  {
    "id": "prod-tastes-of-norway",
    "name": "Tastes Of Norway",
    "town": "Lillehammer",
    "county": "Innlandet",
    "region": "Lillehammer, Innlandet",
    "lat": 61.115,
    "lng": 10.466,
    "blurb": "Samler og foredler spesialiteter fra småprodusenter i innlandet.",
    "categories": [
      "Annet"
    ],
    "productCount": 3
  },
  {
    "id": "prod-bryggeriet-froya",
    "name": "Bryggeriet Frøya",
    "town": "Frøya",
    "county": "Trøndelag",
    "region": "Frøya, Trøndelag",
    "lat": 63.719,
    "lng": 8.692,
    "blurb": "Øybryggeri ytterst i havgapet med øl brygget på havsalt og tang.",
    "categories": [
      "Alkoholholdige drikker"
    ],
    "productCount": 3
  },
  {
    "id": "prod-roros-bryggeri-og-mineralvannfabrikk-as",
    "name": "Røros Bryggeri og Mineralvannfabrikk AS",
    "town": "Røros",
    "county": "Trøndelag",
    "region": "Røros, Trøndelag",
    "lat": 62.576,
    "lng": 11.388,
    "blurb": "Historisk bryggeri som tapper mineralvann og brus på kildevann fra fjellet.",
    "categories": [
      "Drikkevarer"
    ],
    "productCount": 3
  },
  {
    "id": "prod-skarbo-gard",
    "name": "Skarbø Gard",
    "town": "Ørsta",
    "county": "Møre og Romsdal",
    "region": "Ørsta, Møre og Romsdal",
    "lat": 62.199,
    "lng": 6.131,
    "blurb": "Sunnmørsgård med utegangargris og urfe på frodige fjordbeiter.",
    "categories": [
      "Alkoholholdige drikker"
    ],
    "productCount": 1
  },
  {
    "id": "prod-hjorundfjord-fruktpresseri",
    "name": "Hjørundfjord Fruktpresseri",
    "town": "Hjørundfjord",
    "county": "Møre og Romsdal",
    "region": "Hjørundfjord, Møre og Romsdal",
    "lat": 62.203,
    "lng": 6.622,
    "blurb": "Presser most og saft på frukt fra bratte hager langs Hjørundfjorden.",
    "categories": [
      "Drikkevarer"
    ],
    "productCount": 2
  },
  {
    "id": "prod-villa-wagyu-villa-samdrift",
    "name": "Villa Wagyu (Villa Samdrift)",
    "town": "Sande",
    "county": "Vestfold",
    "region": "Sande, Vestfold",
    "lat": 59.59,
    "lng": 10.226,
    "blurb": "Oppdretter norsk wagyu-storfe med lang fôringstid for marmorert kjøtt.",
    "categories": [
      "Kjøtt"
    ],
    "productCount": 1
  }
];
type RawProduct = Omit<Product, "sesong">;

const RAW_PRODUCTS: RawProduct[] = [
 {
  "id": 1,
  "name": "Ødhumbla setermjølk",
  "producer": "Ødhumbla gardsmjølk",
  "producerId": "prod-odhumbla-gardsmjolk",
  "category": "Meieriprodukter",
  "subcategory": "Melk",
  "description": "Ødhumbla setermjølk er lågpasteurisert og ikkje-homogenisert mjølk produsert på tradisjonell seter i Gudbrandsdalen. Mjø",
  "url": "https://www.lokalmat.no/produsenter/odhumbla-gardsmjolk/odhumbla-setermjolk/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 2,
  "name": "Roma Pære 0,5l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Pære er en brus laget av frukt fra norske gårder. Delikat pærebrus som smaker sånn pærer gjør. Alltid i sesong hos",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-paere-05l/",
  "approval": "til-behandling",
  "fresh": "nyhet",
  "inSeason": true
 },
 {
  "id": 3,
  "name": "Roma Eple uten tilsatt sukker 0,5l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Eple uten tilsatt sukker er en brus laget av frukt fra norske gårder. Frisk eplebrus som smaker sånn epler gjør. Al",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-eple-uten-tilsatt-sukker-05l/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 4,
  "name": "Roma Eple 0,5l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Eple er en brus laget av frukt fra norske gårder. Frisk eplebrus som smaker sånn epler gjør. Alltid i sesong hos Ro",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-eple-05l/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 5,
  "name": "Roma Morell & Kirsebær 0,5l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Morell & Kirsebær er en brus laget av bær fra norske gårder. Søt morellbrus med friske kirsebær. Alltid i sesong ho",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-morell-and-kirsebaer-05l/",
  "approval": "none",
  "fresh": "oppdatert",
  "inSeason": false
 },
 {
  "id": 6,
  "name": "Roma Kirsebær & Pære 0,5l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Kirsebær & Pære er en brus laget av frukt og bær fra norske gårder. Frisk kirsebærbrus med søte pærer. Alltid i ses",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-kirsebaer-and-paere-05l/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 7,
  "name": "Roma Pære 0,33l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Pære er en brus laget av frukt fra norske gårder. Delikat pærebrus som smaker sånn pærer gjør. Alltid i sesong hos",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-paere-033l/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 8,
  "name": "Roma Eple 0,33l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Eple er en brus laget av frukt fra norske gårder. Frisk eplebrus som smaker sånn epler gjør. Alltid i sesong hos Ro",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-eple-033l/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 9,
  "name": "Roma Morell & Kirsebær 0,33l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Morell & Kirsebær er en brus laget av bær fra norske gårder. Søt morellbrus med friske kirsebær. Alltid i sesong ho",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-morell-and-kirsebaer-033l/",
  "approval": "none",
  "fresh": "nyhet",
  "inSeason": false
 },
 {
  "id": 10,
  "name": "Skakke Bålbacon",
  "producer": "Skakke Røykeri As",
  "producerId": "prod-skakke-roykeri-as",
  "category": "Kjøtt",
  "subcategory": "Svin",
  "description": "Tørrsaltet og røykt på spon av epletre. Uten svor. Sølvvinner i NM kjøtt 2024",
  "url": "https://www.lokalmat.no/produsenter/skakke-roykeri-as/skakke-balbacon/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 11,
  "name": "RAA BREWING COMPANY Lervik Sommerfestival 440ml",
  "producer": "Raa Brewing",
  "producerId": "prod-raa-brewing",
  "category": "Alkoholholdige drikker",
  "subcategory": "Øl",
  "url": "https://www.lokalmat.no/produsenter/raa-brewing/raa-brewing-company-lervik-sommerfestival-440ml/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 12,
  "name": "RAA BREWING COMPANY Sarpepils 440ml",
  "producer": "Raa Brewing",
  "producerId": "prod-raa-brewing",
  "category": "Alkoholholdige drikker",
  "subcategory": "Øl",
  "url": "https://www.lokalmat.no/produsenter/raa-brewing/raa-brewing-company-sarpepils-440ml/",
  "approval": "til-behandling",
  "fresh": "oppdatert",
  "inSeason": true
 },
 {
  "id": 13,
  "name": "Sikrogn 300g 300g X",
  "producer": "RørosFisk AS",
  "producerId": "prod-rorosfisk-as",
  "category": "Fisk og sjømat",
  "subcategory": "Bearbeidet fisk",
  "description": "Sikrogn fra Rørosreigionen. Sik høstet i vann i klare fjellvann rundt Røros",
  "url": "https://www.lokalmat.no/produsenter/rorosfisk-as/sikrogn-300g-300g-x/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 14,
  "name": "KollenWinner'n",
  "producer": "Metervare AS",
  "producerId": "prod-metervare-as",
  "category": "Kjøtt",
  "subcategory": "Pølser",
  "description": "KollenWinner’n er en nydelig wienerpølse med høy kjøttprosent, som kommer i en familiepakke med 6 pølser",
  "url": "https://www.lokalmat.no/produsenter/metervare-as/kollenwinner'n/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 15,
  "name": "Rød Ingrid Marie eplemost",
  "producer": "Eplehagen Havna",
  "producerId": "prod-eplehagen-havna",
  "category": "Drikkevarer",
  "subcategory": "Juice",
  "description": "Økologisk, gårdspresset eplemost fra Hvaler",
  "url": "https://www.lokalmat.no/produsenter/eplehagen-havna/rod-ingrid-marie-eplemost/",
  "approval": "none",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 16,
  "name": "Mors Tynnlefse 4 Lefser, 900g",
  "producer": "Takka",
  "producerId": "prod-takka",
  "category": "Korn- og Bakevarer",
  "subcategory": "Lefser og Lomper",
  "description": "Tynnlefse smurt med smør, sukker og kanel",
  "url": "https://www.lokalmat.no/produsenter/takka/mors-tynnlefse-4-lefser-900g/",
  "approval": "godkjent",
  "fresh": "nyhet",
  "inSeason": false
 },
 {
  "id": 17,
  "name": "Buggelefse 795g",
  "producer": "Takka",
  "producerId": "prod-takka",
  "category": "Korn- og Bakevarer",
  "subcategory": "Lefser og Lomper",
  "description": "Smurte lefseruller",
  "url": "https://www.lokalmat.no/produsenter/takka/buggelefse-795g/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 18,
  "name": "Brokkoli",
  "producer": "The Farm Society™",
  "producerId": "prod-the-farm-society",
  "category": "Frukt og grønt",
  "description": "Næringsrike brokkoliskudd med en frisk og delikat kålsmak",
  "url": "https://www.lokalmat.no/produsenter/the-farm-societytm/brokkoli/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 19,
  "name": "Koriander",
  "producer": "The Farm Society™",
  "producerId": "prod-the-farm-society",
  "category": "Frukt og grønt",
  "description": "Ung og aromatisk urt med en sitruspreget smak og ferske spiselige frø",
  "url": "https://www.lokalmat.no/produsenter/the-farm-societytm/koriander/",
  "approval": "none",
  "fresh": "oppdatert",
  "inSeason": true
 },
 {
  "id": 20,
  "name": "Viltvoksende Tinvedpulver, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk tindvedpulver [Hippophae rhamnoides] er laget med 100% tindved, også kjent som Nordens pasjonsfrukt. Tindved h",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-tinvedpulver-50g/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 21,
  "name": "Viltvoksende Bærmikspulver, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk bærmikspulver er en av våre bestsellere og inneholder alle de mest populære viltvoksende bærene fra nord: mult",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-baermikspulver-50g/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 22,
  "name": "Viltvoksende Tyttebærpulver, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk tyttebærpulver av ypperst kvalitet laget med utsøkte tyttebær fra den rene nauren i nord. Tilsett tyttebærpulv",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-tyttebaerpulver-50g/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 23,
  "name": "Viltvoksende Blåbær,tørket, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk blåbær, tørket hele [bilberries, Vaccinium myrtillus] tilfører frokostblandingen, yoghurten og baksten smaken",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-blabaertorket-50g/",
  "approval": "godkjent",
  "fresh": "nyhet",
  "inSeason": true
 },
 {
  "id": 24,
  "name": "Viltvoksende Blåbærpulver, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk blåbærpulver tilfører mat og drikke en smak av viltvoksende nordiske blåbær. Blåbærpulver er en perfekt ingred",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-blabaerpulver-50g/",
  "approval": "none",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 25,
  "name": "Viltvoksende Moltepulver, 50g",
  "producer": "Arctic Botanics",
  "producerId": "prod-arctic-botanics",
  "category": "Frukt og grønt",
  "subcategory": "Bær",
  "description": "Økologisk multepulver er laget med 100% viltvoksende multer [rubus chamaemorus] og er en av våre bestsellere. Økologisk",
  "url": "https://www.lokalmat.no/produsenter/arctic-botanics/viltvoksende-moltepulver-50g/",
  "approval": "none",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 26,
  "name": "Roma Kirsebær & Pære 0,33l",
  "producer": "Roma",
  "producerId": "prod-roma",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "Roma Kirsebær & Pære er en brus laget av frukt og bær fra norske gårder. Frisk kirsebærbrus med søte pærer. Alltid i ses",
  "url": "https://www.lokalmat.no/produsenter/roma/roma-kirsebaer-and-paere-033l/",
  "approval": "godkjent",
  "fresh": "oppdatert",
  "inSeason": false
 },
 {
  "id": 27,
  "name": "Chili Jam Hvitløk & Ingefær",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Saft, syltetøy, geleer",
  "subcategory": "Syltetøy",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/chili-jam-hvitlok-and-ingefaer/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 28,
  "name": "Ghost Garlic",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Saus, salsa og kondiment",
  "description": "En kraftfull og kompleks chilisaus for de mer interesserte. Laget med svart hvitløk, fermentert ghost chili med syrlighe",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/ghost-garlic/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 29,
  "name": "Hot Salt",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Krydder",
  "description": "Dette er et salt med tydelig chilipreg, balansert av fermentert sødme fra gulrot og aromatisk løk og hvitløk. Smaken er",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/hot-salt/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 30,
  "name": "Ananas Habanero",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Saus, salsa og kondiment",
  "description": "En frisk og fuktig chilisaus med en tropisk varme. Søt ananas og frisk ingefær møter styrken fra fermentert habanero-chi",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/ananas-habanero/",
  "approval": "godkjent",
  "fresh": "nyhet",
  "inSeason": false
 },
 {
  "id": 31,
  "name": "Hvaler Basco",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Saus, salsa og kondiment",
  "description": "En klassisk, rød chili saus med fyldig smak. Laget med fermentert rød habanero, paprika og tomat som gir en særegen smak",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/hvaler-basco/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 32,
  "name": "Hvaler Flamme",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Saus, salsa og kondiment",
  "description": "Vår sterkeste saus. Laget med røkte, røde jalapeños, fermentert ghost chili og tomat for å gi en fyldig og kraftig smak",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/hvaler-flamme/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 33,
  "name": "Krabbeklør 36x10 kg",
  "producer": "Kongshaug Krabbe AS",
  "producerId": "prod-kongshaug-krabbe-as",
  "category": "Fisk og sjømat",
  "subcategory": "Skalldyr",
  "description": "Krabbeklør fra taskekrabbe",
  "url": "https://www.lokalmat.no/produsenter/kongshaug-krabbe-as/krabbeklor-36x10-kg/",
  "approval": "godkjent",
  "fresh": "oppdatert",
  "inSeason": false
 },
 {
  "id": 34,
  "name": "3 Bit Brunost-TON143",
  "producer": "Tastes Of Norway",
  "producerId": "prod-tastes-of-norway",
  "category": "Annet",
  "subcategory": "Sjokolade",
  "description": "3 bit eske med brunost smak",
  "url": "https://www.lokalmat.no/produsenter/tastes-of-norway/3-bit-brunost-ton143/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 35,
  "name": "16 Bit-TON013",
  "producer": "Tastes Of Norway",
  "producerId": "prod-tastes-of-norway",
  "category": "Annet",
  "subcategory": "Sjokolade",
  "description": "16 bit Sjokolade eske",
  "url": "https://www.lokalmat.no/produsenter/tastes-of-norway/16-bit-ton013/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 36,
  "name": "8 Bit-TON006",
  "producer": "Tastes Of Norway",
  "producerId": "prod-tastes-of-norway",
  "category": "Annet",
  "subcategory": "Sjokolade",
  "description": "8 bit Sjokolade eske (norsk smaker)",
  "url": "https://www.lokalmat.no/produsenter/tastes-of-norway/8-bit-ton006/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 37,
  "name": "Solemdalslefser 950g, 4stk",
  "producer": "Takka",
  "producerId": "prod-takka",
  "category": "Korn- og Bakevarer",
  "subcategory": "Lefser og Lomper",
  "description": "Fløyelsmyk og velsmakende smurt tynnlefse",
  "url": "https://www.lokalmat.no/produsenter/takka/solemdalslefser-950g-4stk/",
  "approval": "til-behandling",
  "fresh": "nyhet",
  "inSeason": true
 },
 {
  "id": 38,
  "name": "Peach Chilli",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "subcategory": "Saus, salsa og kondiment",
  "description": "En fruktig chilisaus laget med fersken og chili fra gården. Sausen kombinerer sødmen fra fersken og grapefrukt med varme",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/peach-chilli/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 39,
  "name": "Lemon Garlic",
  "producer": "Løkken Gård Hvaler",
  "producerId": "prod-lokken-gard-hvaler",
  "category": "Annet",
  "description": "En frisk og syrlig chilisaus med tydelig smak av sitron og hvitløk. Paprika runder av smaken mens chilien gir et skikkel",
  "url": "https://www.lokalmat.no/produsenter/lokken-gard-hvaler/lemon-garlic/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 40,
  "name": "Jedinorog",
  "producer": "Bryggeriet Frøya",
  "producerId": "prod-bryggeriet-froya",
  "category": "Alkoholholdige drikker",
  "subcategory": "Øl",
  "description": "Jedinorog Russian imperial stout er et kraftig og smaksrikt øl med preg av røstet malt og lakris",
  "url": "https://www.lokalmat.no/produsenter/bryggeriet-froya/jedinorog/",
  "approval": "godkjent",
  "fresh": "oppdatert",
  "inSeason": false
 },
 {
  "id": 41,
  "name": "Draug",
  "producer": "Bryggeriet Frøya",
  "producerId": "prod-bryggeriet-froya",
  "category": "Alkoholholdige drikker",
  "subcategory": "Øl",
  "description": "Draug er et fyldig og maltrikt bokkøl. Et undergjæret sterkøl",
  "url": "https://www.lokalmat.no/produsenter/bryggeriet-froya/draug/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 42,
  "name": "Krabbeskjell 150g",
  "producer": "Kongshaug Krabbe AS",
  "producerId": "prod-kongshaug-krabbe-as",
  "category": "Fisk og sjømat",
  "subcategory": "Skalldyr",
  "description": "Krabbeskjell med hvitt og brunt kjøtt fra taskekrabbe. Pyntet med coctailklo",
  "url": "https://www.lokalmat.no/produsenter/kongshaug-krabbe-as/krabbeskjell-150g/",
  "approval": "til-behandling",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 43,
  "name": "Sletringen",
  "producer": "Bryggeriet Frøya",
  "producerId": "prod-bryggeriet-froya",
  "category": "Alkoholholdige drikker",
  "subcategory": "Øl",
  "description": "Sletringen Hvit IPA er en krysning av wit og IPA. En fruktig og smaksrik øl",
  "url": "https://www.lokalmat.no/produsenter/bryggeriet-froya/sletringen/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 44,
  "name": "Perlende Tyttebærdrikk Fra Røros Drikkeri, Boks 0,33l*24",
  "producer": "Røros Bryggeri og Mineralvannfabrikk AS",
  "producerId": "prod-roros-bryggeri-og-mineralvannfabrikk-as",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "url": "https://www.lokalmat.no/produsenter/roros-bryggeri-og-mineralvannfabrikk-as/perlende-tyttebaerdrikk-fra-roros-drikkeri-boks-033l*24/",
  "approval": "none",
  "fresh": "nyhet",
  "inSeason": false
 },
 {
  "id": 45,
  "name": "Perlende Blåbærdrikk Fra Røros Drikkeri, Boks 0,33l*24",
  "producer": "Røros Bryggeri og Mineralvannfabrikk AS",
  "producerId": "prod-roros-bryggeri-og-mineralvannfabrikk-as",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "description": "En frisk og perlende drikk laget med ekte blåbær fra regionen, hentet fra vårt eget bærmottak. Drikken er kokt forsiktig",
  "url": "https://www.lokalmat.no/produsenter/roros-bryggeri-og-mineralvannfabrikk-as/perlende-blabaerdrikk-fra-roros-drikkeri-boks-033l*24/",
  "approval": "none",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 46,
  "name": "Skarbø Sider Gravenstein",
  "producer": "Skarbø Gard",
  "producerId": "prod-skarbo-gard",
  "category": "Alkoholholdige drikker",
  "subcategory": "Annet",
  "description": "Skarbø Sider Gravenstein er ein delikat sider med god fylde, laga av den tradisjonsrike sorten Gravenstein",
  "url": "https://www.lokalmat.no/produsenter/skarbo-gard/skarbo-sider-gravenstein/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 },
 {
  "id": 47,
  "name": "Perlende Rabarbradrikk Fra Røros Drikkeri, Boks 0,33l*24",
  "producer": "Røros Bryggeri og Mineralvannfabrikk AS",
  "producerId": "prod-roros-bryggeri-og-mineralvannfabrikk-as",
  "category": "Drikkevarer",
  "subcategory": "Brus",
  "url": "https://www.lokalmat.no/produsenter/roros-bryggeri-og-mineralvannfabrikk-as/perlende-rabarbradrikk-fra-roros-drikkeri-boks-033l*24/",
  "approval": "til-behandling",
  "fresh": "oppdatert",
  "inSeason": true
 },
 {
  "id": 48,
  "name": "Hjørundfjordmost Discovery",
  "producer": "Hjørundfjord Fruktpresseri",
  "producerId": "prod-hjorundfjord-fruktpresseri",
  "category": "Drikkevarer",
  "subcategory": "Juice",
  "description": "Hjørundfjordmost Discovery er ein eplemost laga av eplesorten Discovery. Den er god som tørstedrikk og eit naturleg følg",
  "url": "https://www.lokalmat.no/produsenter/hjorundfjord-fruktpresseri/hjorundfjordmost-discovery-44328/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 49,
  "name": "Hjørundfjordmost Discovery",
  "producer": "Hjørundfjord Fruktpresseri",
  "producerId": "prod-hjorundfjord-fruktpresseri",
  "category": "Drikkevarer",
  "subcategory": "Juice",
  "description": "Hjørundfjordmost Discovery er ein eplemost laga av eplesorten Discovery. Den er god som tørstedrikk og eit naturleg følg",
  "url": "https://www.lokalmat.no/produsenter/hjorundfjord-fruktpresseri/hjorundfjordmost-discovery/",
  "approval": "none",
  "fresh": null,
  "inSeason": true
 },
 {
  "id": 50,
  "name": "Villa Wagyu Burger 2 X 160g Villa Wagyu 160g, 2stk (320g)",
  "producer": "Villa Wagyu (Villa Samdrift)",
  "producerId": "prod-villa-wagyu-villa-samdrift",
  "category": "Kjøtt",
  "subcategory": "Farseprodukter",
  "url": "https://www.lokalmat.no/produsenter/villa-wagyu-(villa-samdrift)/villa-wagyu-burger-2-x-160g-villa-wagyu-160g-2stk-(320g)/",
  "approval": "godkjent",
  "fresh": null,
  "inSeason": false
 }
];
/* Seed saved searches. emailUpdates is applied by AppState on load (false for
   seeded searches, true for newly created ones), so it is omitted here. */
export const SAVED_SEARCHES: Omit<SavedSearch, "emailUpdates">[] = [
  { "id":"ss1", "name":"Lokal drikke til hyllene", "count":2, "filters":{ "query":"", "cats":["Drikkevarer","Saft, syltetøy, geleer"], "fylker":[], "marked":[], "rev":[], "salg":["Grossist"], "sesong":[], "radius":900, "approvedOnly":false } },
  { "id":"ss2", "name":"Kjøtt fra norske gårder", "count":5, "filters":{ "query":"", "cats":["Kjøtt"], "fylker":[], "marked":[], "rev":["KSL-revidert"], "salg":[], "sesong":[], "radius":900, "approvedOnly":false } },
  { "id":"ss3", "name":"Honning og søtt i nærheten", "count":1, "filters":{ "query":"honning", "cats":[], "fylker":[], "marked":[], "rev":[], "salg":[], "sesong":[], "radius":300, "approvedOnly":false } },
  { "id":"ss4", "name":"Øl fra mikrobryggeri", "count":1, "filters":{ "query":"øl", "cats":["Alkoholholdige drikker"], "fylker":[], "marked":["Spesialbutikk"], "salg":[], "rev":[], "sesong":[], "radius":900, "approvedOnly":false } }
];
export const COMMON_SEARCHES: string[] = ["Kjøtt og fjørfe","Lokal drikke","Økologisk melk","Kortreiste grønnsaker sesong","Sesongbaserte produkter i nærheten"];
export const USER = { name:"Ola Nordmann", email:"ola.nordmann@rema1000.no", store:"REMA 1000", initials:"ON" };
export const MAP_CENTER: LatLng & { label: string } = { lat:59.913, lng:10.752, label:"Oslo" };
// initial state seeds
export const INITIAL_FOLLOWED: string[] = ["prod-odhumbla-gardsmjolk","prod-roma","prod-skakke-roykeri-as","prod-raa-brewing","prod-rorosfisk-as","prod-metervare-as","prod-eplehagen-havna"];
export const INITIAL_SAVED: number[] = [1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49];
/**
 * Haversine distance in kilometres. Used for the map radius filter, the
 * "i ditt område" ordering, and the distance badge on ProducerCard.
 */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t;
  const dLng = (b.lng - a.lng) * t;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const FILTER_DEFS: Record<string, string[]> = {
  markedsordning: [
    "Dagligvare",
    "Storhusholdning",
    "Spesialbutikk",
    "Bondens marked",
    "REKO-ring",
  ],
  revisjoner: [
    "KSL-revidert",
    "Nyt Norge",
    "Spesialitet",
    "Debio økologisk",
    "Ekstern revisjoner",
  ],
  salgskanaler: [
    "Direktesalg",
    "Grossist",
    "Nettbutikk",
    "Gårdsbutikk",
    "Torghandel",
  ],
  sesonger: ["Vår", "Sommer", "Høst", "Vinter", "Helårs"],
  fylker: [...new Set(RAW_PRODUCERS.map((p) => p.county))].sort(),
};

/* Producer-level filter attributes are synthesised deterministically from the
   record's index, exactly as the prototype did — the sample dataset has no real
   markedsordning / revisjon / salgskanal data. In production these are real
   fields on the producer record and this block goes away. */
export const PRODUCERS: Producer[] = RAW_PRODUCERS.map((p, i) => {
  const pick = (arr: string[], n: number, off: number): string[] => {
    const out: string[] = [];
    for (let k = 0; k < arr.length; k++) {
      if ((i + k + off) % Math.ceil(arr.length / n) === 0) out.push(arr[k]);
    }
    return out.length ? out.slice(0, n) : [arr[i % arr.length]];
  };
  return {
    ...p,
    marked: pick(FILTER_DEFS.markedsordning, 2, 1),
    rev: ["KSL-revidert"]
      .concat(i % 2 === 0 ? ["Nyt Norge"] : [])
      .concat(i % 5 === 3 ? ["Spesialitet"] : [])
      .concat(i % 4 === 2 ? ["Debio økologisk"] : []),
    salg: pick(FILTER_DEFS.salgskanaler, 3, 2),
  };
});

/* Per-product season, derived the same way the prototype derived it. */
export const PRODUCTS: Product[] = RAW_PRODUCTS.map((p) => {
  let sesong: string;
  if (p.inSeason) sesong = "Sommer";
  else if (p.category === "Frukt og grønt" || p.category === "Saft, syltetøy, geleer")
    sesong = "Høst";
  else if (p.category === "Kjøtt") sesong = p.id % 2 ? "Høst" : "Vinter";
  else if (p.category === "Fisk og sjømat") sesong = "Vinter";
  else sesong = "Helårs";
  return { ...p, sesong };
});
