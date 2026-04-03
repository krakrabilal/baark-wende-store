// src/data/constants.js
export const ACCOUNTS = [
  { id: "Bilalboss1", pw: "Bonjour123.",  name: "Bilal",   role: "superadmin" },
  { id: "Admin1",     pw: "Bonjour123.",  name: "Admin 1", role: "admin" },
  { id: "Admin2",     pw: "Bonsoir1234.", name: "Admin 2", role: "admin" },
];

export const CATS = ["Tous","Montres","Telephones","Voitures","Vetements","Autres"];
export const STATUSES = ["En attente","En cours","Livre","Annule"];

export const CAT_ICONS = {
  Montres:"⌚", Telephones:"📱", Voitures:"🚗", Vetements:"👗", Autres:"📦", Tous:"🏪",
};

export const INIT_PRODS = [
  { id:1,  name:"Montre Rolex Submariner",  cat:"Montres",    price:850000,   old:1100000,  stock:5,  r:4.8, rv:24, img:"⌚", badge:"Populaire",   desc:"Montre de luxe suisse, etanche 300m, cadran noir, bracelet Oyster.", photos:[] },
  { id:2,  name:"iPhone 15 Pro Max",        cat:"Telephones", price:650000,   old:720000,   stock:12, r:4.9, rv:41, img:"📱", badge:"Nouveau",     desc:"Apple A17 Pro, 48MP, Dynamic Island, USB-C, 256Go, Titanium.", photos:[] },
  { id:3,  name:"BMW X5 2023",              cat:"Voitures",   price:35000000, old:null,     stock:2,  r:4.7, rv:8,  img:"🚗", badge:"Premium",     desc:"SUV luxe, 3.0L turbo, 7 places, toit panoramique, cuir Nappa.", photos:[] },
  { id:4,  name:"Veste Bogolan Africaine",  cat:"Vetements",  price:45000,    old:60000,    stock:30, r:4.6, rv:19, img:"👔", badge:"Exclusif",    desc:"Veste artisanale tissu Bogolan du Mali, coupe moderne M-XXL.", photos:[] },
  { id:5,  name:"Samsung Galaxy S24 Ultra", cat:"Telephones", price:580000,   old:620000,   stock:8,  r:4.7, rv:33, img:"📱", badge:null,          desc:"Snapdragon 8 Gen 3, S Pen, 200MP, 6.8 pouces AMOLED, 512Go.", photos:[] },
  { id:6,  name:"Montre Hublot Big Bang",   cat:"Montres",    price:1200000,  old:null,     stock:3,  r:5.0, rv:11, img:"⌚", badge:"Luxe",        desc:"Boitier titane 44mm, mouvement automatique UNICO.", photos:[] },
  { id:7,  name:"Toyota Camry 2022",        cat:"Voitures",   price:18500000, old:20000000, stock:4,  r:4.5, rv:15, img:"🚗", badge:null,          desc:"Berline hybride 2.5L, 7 airbags, Apple CarPlay, garantie 3 ans.", photos:[] },
  { id:8,  name:"Sneakers Kente Edition",   cat:"Vetements",  price:55000,    old:70000,    stock:20, r:4.4, rv:27, img:"👟", badge:"Tendance",    desc:"Sneakers inspirees tissu Kente ghaneen, semelle Air, 38-45.", photos:[] },
  { id:9,  name:"Casque Sony WH-1000XM5",  cat:"Autres",     price:195000,   old:230000,   stock:15, r:4.8, rv:38, img:"🎧", badge:null,          desc:"Reduction bruit active, 30h autonomie, Bluetooth 5.2.", photos:[] },
  { id:10, name:"Montre Cartier Tank",      cat:"Montres",    price:2800000,  old:null,     stock:2,  r:5.0, rv:6,  img:"⌚", badge:"Rare",        desc:"Tank Must XL, quartz, boitier acier PVD or, cuir bordeaux.", photos:[] },
  { id:11, name:"iPad Pro M2",              cat:"Telephones", price:480000,   old:530000,   stock:9,  r:4.8, rv:22, img:"💻", badge:null,          desc:"12.9 pouces, M2, Liquid Retina XDR, 5G, 256Go.", photos:[] },
  { id:12, name:"Boubou Brode Luxe",        cat:"Vetements",  price:85000,    old:110000,   stock:25, r:4.9, rv:44, img:"👘", badge:"Best-seller", desc:"Grand bazin riche, broderies dorees artisanales, 8 couleurs.", photos:[] },
];

export const INIT_ORDERS = [
  { id:"BWS-001", client:"Konan Aya",      phone:"07 11 22 33", product:"iPhone 15 Pro Max",  amount:650000,  status:"Livre",      date:"15/03/2025", lieu:"Cocody"   },
  { id:"BWS-002", client:"Traore Moussa",  phone:"05 22 33 44", product:"Montre Hublot",      amount:1200000, status:"En cours",   date:"20/03/2025", lieu:"Yopougon" },
  { id:"BWS-003", client:"Coulibaly F.",   phone:"01 33 44 55", product:"Boubou Brode",       amount:85000,   status:"En attente", date:"22/03/2025", lieu:"Adjame"   },
  { id:"BWS-004", client:"Bamba Ibrahim",  phone:"07 44 55 66", product:"Samsung Galaxy S24", amount:580000,  status:"Annule",     date:"23/03/2025", lieu:"Marcory"  },
  { id:"BWS-005", client:"Diallo Aminata", phone:"05 55 66 77", product:"Sneakers Kente",     amount:55000,   status:"Livre",      date:"24/03/2025", lieu:"Plateau"  },
];

export const INIT_REVIEWS = [
  { id:"r1", prodId:null, name:"Konan Beatrice",    av:"K", r:5, date:"15 Mars 2025", txt:"Commande recue en 24h ! Produit magnifique. Je recommande !", approved:true  },
  { id:"r2", prodId:null, name:"Traore Ibrahim",    av:"T", r:5, date:"10 Mars 2025", txt:"iPhone 15 livre le lendemain. Authentique avec facture.",     approved:true  },
  { id:"r3", prodId:null, name:"Coulibaly Aminata", av:"C", r:4, date:"05 Mars 2025", txt:"Boubou splendide. Service apres-vente tres arrangeant.",       approved:false },
];

export const BOUTIQUE = {
  name:    "Baark Wende Store",
  slogan:  "Qualite et confiance a prix accessible",
  email:   "baarkwendestore@baarkwende.com",
  tel1:    "0170260670",
  tel2:    "+225 0787213203",
  wa:      "2250170260610",
  lieu:    "Abidjan, Cote d'Ivoire",
  fb:      "Baark Wende Store",
  horaires:"Lun-Sam 8h-20h / Dim 10h-18h",
};

export const LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none'%3E%3Ccircle cx='50' cy='50' r='50' fill='%230D0A14'/%3E%3Cpath d='M25 35h8l10 24h22l8-20H33' stroke='url(%23g1)' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='42' cy='68' r='4' fill='%23EC4899'/%3E%3Ccircle cx='58' cy='68' r='4' fill='%23EC4899'/%3E%3Cpath d='M38 48h26M34 42h30' stroke='%238B5CF6' stroke-width='3' stroke-linecap='round'/%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='25' y1='35' x2='75' y2='60' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%238B5CF6'/%3E%3Cstop offset='1' stop-color='%23EC4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E";

export const fmt  = (n) => new Intl.NumberFormat("fr-CI").format(n) + " FCFA";
export const stars = (r) => "★".repeat(Math.floor(r)) + "☆".repeat(5 - Math.floor(r));
export const nid  = () => "BWS-" + Math.random().toString(36).slice(2, 6).toUpperCase();
export const today = () => new Date().toLocaleDateString("fr-FR");
