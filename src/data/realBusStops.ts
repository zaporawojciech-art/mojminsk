export interface RealBusStop {
  id: string;
  altId?: string;
  name: string;
  fullName: string;
  ref?: string | null;
  lat: number;
  lon: number;
  zone: string;
  lines: string[];
  isTransfer: boolean;
  wheelchair?: string;
}

/**
 * Kompletna baza wszystkich 244 przystanków i peronów autobusowych
 * w Mińsku Mazowieckim oraz gminie Mińsk Mazowiecki.
 * Źródło: Oficjalny rejestr ZDiTM Mińsk Mazowiecki + Geodezja OpenStreetMap.
 */
export const REAL_BUS_STOPS: RealBusStop[] = [
  {
    "id": "000037",
    "name": "11 Listopada",
    "fullName": "11 Listopada 01",
    "ref": "01",
    "lat": 52.184463,
    "lon": 21.559062,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000038",
    "name": "11 Listopada",
    "fullName": "11 Listopada 02",
    "ref": "02",
    "lat": 52.184048,
    "lon": 21.559538,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9907820992",
    "name": "Anielinek I",
    "fullName": "Anielinek I",
    "ref": null,
    "lat": 52.225062,
    "lon": 21.629039,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9907820994",
    "name": "Anielinek II",
    "fullName": "Anielinek II",
    "ref": null,
    "lat": 52.221175,
    "lon": 21.645346,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9374614168",
    "name": "Arynów I",
    "fullName": "Arynów I",
    "ref": null,
    "lat": 52.204564,
    "lon": 21.536671,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11500956956",
    "name": "Bagnista",
    "fullName": "Bagnista",
    "ref": null,
    "lat": 52.191451,
    "lon": 21.560425,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000033",
    "name": "Bagnista",
    "fullName": "Bagnista 01",
    "ref": "01",
    "lat": 52.19147,
    "lon": 21.560545,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000034",
    "name": "Bagnista",
    "fullName": "Bagnista 04",
    "ref": "04",
    "lat": 52.191357,
    "lon": 21.560762,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "4084847297",
    "name": "Barcząca",
    "fullName": "Barcząca",
    "ref": null,
    "lat": 52.156607,
    "lon": 21.628694,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11328804620",
    "name": "Barcząca Jasna",
    "fullName": "Barcząca Jasna",
    "ref": null,
    "lat": 52.151791,
    "lon": 21.635262,
    "zone": "Gmina Mińsk",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321623",
    "name": "Boczna",
    "fullName": "Boczna",
    "ref": null,
    "lat": 52.186956,
    "lon": 21.559571,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000007",
    "name": "Boczna",
    "fullName": "Boczna 02",
    "ref": "02",
    "lat": 52.186941,
    "lon": 21.559569,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000008",
    "name": "Boczna",
    "fullName": "Boczna 07",
    "ref": "07",
    "lat": 52.187033,
    "lon": 21.559429,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12168063271",
    "name": "Borek Miński III",
    "fullName": "Borek Miński III",
    "ref": null,
    "lat": 52.229018,
    "lon": 21.553878,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12153716544",
    "name": "Brzóze Długa",
    "fullName": "Brzóze Długa",
    "ref": null,
    "lat": 52.221699,
    "lon": 21.557763,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12168063267",
    "name": "Brzóze Graniczna",
    "fullName": "Brzóze Graniczna",
    "ref": null,
    "lat": 52.209575,
    "lon": 21.536413,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141740966",
    "name": "Brzóze Kościelna",
    "fullName": "Brzóze Kościelna",
    "ref": null,
    "lat": 52.223816,
    "lon": 21.538174,
    "zone": "Gmina Mińsk",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12168063272",
    "name": "Brzóze Północna",
    "fullName": "Brzóze Północna",
    "ref": null,
    "lat": 52.229958,
    "lon": 21.54201,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140975364",
    "name": "Brzóze Stanisławowska",
    "fullName": "Brzóze Stanisławowska",
    "ref": null,
    "lat": 52.223045,
    "lon": 21.539622,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140985067",
    "name": "Brzóze, Arynów II",
    "fullName": "Brzóze, Arynów II",
    "ref": null,
    "lat": 52.21258,
    "lon": 21.537812,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000029",
    "name": "Budowlana",
    "fullName": "Budowlana 01",
    "ref": "01",
    "lat": 52.184214,
    "lon": 21.5717,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000030",
    "name": "Budowlana",
    "fullName": "Budowlana 02",
    "ref": "02",
    "lat": 52.184186,
    "lon": 21.574583,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9264801507",
    "name": "Budy Barcząckie",
    "fullName": "Budy Barcząckie",
    "ref": null,
    "lat": 52.160599,
    "lon": 21.618419,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164443",
    "name": "Budy Barcząckie I",
    "fullName": "Budy Barcząckie I",
    "ref": null,
    "lat": 52.16132,
    "lon": 21.629202,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164444",
    "name": "Budy Barcząckie II",
    "fullName": "Budy Barcząckie II",
    "ref": null,
    "lat": 52.1621,
    "lon": 21.638492,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164445",
    "name": "Budy Barcząckie III",
    "fullName": "Budy Barcząckie III",
    "ref": null,
    "lat": 52.163053,
    "lon": 21.647837,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11511302055",
    "name": "Chełmońskiego",
    "fullName": "Chełmońskiego",
    "ref": null,
    "lat": 52.184297,
    "lon": 21.568474,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000003",
    "name": "Chełmońskiego",
    "fullName": "Chełmońskiego 02",
    "ref": "02",
    "lat": 52.184311,
    "lon": 21.568304,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000004",
    "name": "Chełmońskiego",
    "fullName": "Chełmońskiego 05",
    "ref": "05",
    "lat": 52.184127,
    "lon": 21.567912,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000051",
    "name": "Chemik",
    "fullName": "Chemik 02",
    "ref": "02",
    "lat": 52.1752,
    "lon": 21.57263,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000052",
    "name": "Chemik",
    "fullName": "Chemik 05",
    "ref": "05",
    "lat": 52.175204,
    "lon": 21.573012,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164466",
    "name": "Chmielew II",
    "fullName": "Chmielew II",
    "ref": null,
    "lat": 52.140929,
    "lon": 21.606489,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078222848",
    "name": "Chorośla - Choszczówka Rudzka",
    "fullName": "Chorośla - Choszczówka Rudzka 01",
    "ref": "01",
    "lat": 52.200618,
    "lon": 21.485754,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078222847",
    "name": "Chorośla - Choszczówka Rudzka",
    "fullName": "Chorośla - Choszczówka Rudzka 02",
    "ref": "02",
    "lat": 52.20049,
    "lon": 21.487062,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394701795",
    "name": "Choszczówka Dębska",
    "fullName": "Choszczówka Dębska 01",
    "ref": "01",
    "lat": 52.209419,
    "lon": 21.489916,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394701797",
    "name": "Choszczówka Dębska wiadukt",
    "fullName": "Choszczówka Dębska wiadukt 01",
    "ref": "01",
    "lat": 52.20603,
    "lon": 21.502347,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394701796",
    "name": "Choszczówka Dębska wiadukt",
    "fullName": "Choszczówka Dębska wiadukt 02",
    "ref": "02",
    "lat": 52.206404,
    "lon": 21.502109,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078285478",
    "name": "Choszczówka Stojecka Centrum",
    "fullName": "Choszczówka Stojecka Centrum 01",
    "ref": "01",
    "lat": 52.195926,
    "lon": 21.509072,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078285457",
    "name": "Choszczówka Stojecka Centrum",
    "fullName": "Choszczówka Stojecka Centrum 02",
    "ref": "02",
    "lat": 52.195465,
    "lon": 21.510006,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078285465",
    "name": "Choszczówka Stojecka Chabrowa",
    "fullName": "Choszczówka Stojecka Chabrowa 01",
    "ref": "01",
    "lat": 52.198122,
    "lon": 21.500799,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078285458",
    "name": "Choszczówka Stojecka Chabrowa",
    "fullName": "Choszczówka Stojecka Chabrowa 02",
    "ref": "02",
    "lat": 52.197576,
    "lon": 21.502087,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "8078285454",
    "name": "Choszczówka Stojecka Wschód",
    "fullName": "Choszczówka Stojecka Wschód 01",
    "ref": "01",
    "lat": 52.192411,
    "lon": 21.522253,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "13328713633",
    "name": "Choszczówka Stojecka Wschód",
    "fullName": "Choszczówka Stojecka Wschód 02",
    "ref": "02",
    "lat": 52.191927,
    "lon": 21.523374,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000118",
    "name": "Chrobrego",
    "fullName": "Chrobrego 02",
    "ref": "02",
    "lat": 52.179352,
    "lon": 21.584125,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000115",
    "name": "Chrobrego",
    "fullName": "Chrobrego 03",
    "ref": "03",
    "lat": 52.179414,
    "lon": 21.583996,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394831345",
    "name": "Chrośla Lawendowa I",
    "fullName": "Chrośla Lawendowa I 01",
    "ref": "01",
    "lat": 52.196469,
    "lon": 21.486005,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394831346",
    "name": "Chrośla Lawendowa I",
    "fullName": "Chrośla Lawendowa I 02",
    "ref": "02",
    "lat": 52.19629,
    "lon": 21.485798,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394831347",
    "name": "Chrośla Lawendowa II",
    "fullName": "Chrośla Lawendowa II 01",
    "ref": "01",
    "lat": 52.190071,
    "lon": 21.483828,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394831348",
    "name": "Chrośla Lawendowa II",
    "fullName": "Chrośla Lawendowa II 02",
    "ref": "02",
    "lat": 52.189964,
    "lon": 21.483695,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12249243410",
    "name": "Cmentarz - Brama Wschodnia",
    "fullName": "Cmentarz - Brama Wschodnia 01",
    "ref": "01",
    "lat": 52.188978,
    "lon": 21.580097,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000028",
    "name": "Cmentarz",
    "fullName": "Cmentarz 05",
    "ref": "05",
    "lat": 52.184214,
    "lon": 21.578473,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000027",
    "name": "Cmentarz",
    "fullName": "Cmentarz 06",
    "ref": "06",
    "lat": 52.183869,
    "lon": 21.579605,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000091",
    "name": "Cmentarz Żydowski",
    "fullName": "Cmentarz Żydowski 01",
    "ref": "01",
    "lat": 52.173201,
    "lon": 21.584188,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000092",
    "name": "Cmentarz Żydowski",
    "fullName": "Cmentarz Żydowski 06",
    "ref": "06",
    "lat": 52.173155,
    "lon": 21.583914,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394796202",
    "name": "Cyganka Szkoła",
    "fullName": "Cyganka Szkoła 01",
    "ref": "01",
    "lat": 52.220494,
    "lon": 21.506345,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12394796203",
    "name": "Cyganka Szkoła",
    "fullName": "Cyganka Szkoła 02",
    "ref": "02",
    "lat": 52.220549,
    "lon": 21.506553,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140945484",
    "name": "Cyganka Wybranieckich",
    "fullName": "Cyganka Wybranieckich 05L",
    "ref": "05L",
    "lat": 52.226141,
    "lon": 21.493721,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140975363",
    "name": "Cyganka Wybranieckich",
    "fullName": "Cyganka Wybranieckich 06P",
    "ref": "06P",
    "lat": 52.226193,
    "lon": 21.493953,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000042",
    "name": "Dąbrówki",
    "fullName": "Dąbrówki 01",
    "ref": "01",
    "lat": 52.17514,
    "lon": 21.58153,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000043",
    "name": "Dąbrówki",
    "fullName": "Dąbrówki 04",
    "ref": "04",
    "lat": 52.17501,
    "lon": 21.58142,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12151466889",
    "name": "Dłużka I",
    "fullName": "Dłużka I",
    "ref": null,
    "lat": 52.219515,
    "lon": 21.572447,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12168063268",
    "name": "Dłużka II",
    "fullName": "Dłużka II",
    "ref": null,
    "lat": 52.224314,
    "lon": 21.577474,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11542616584",
    "name": "Dźwigowa",
    "fullName": "Dźwigowa",
    "ref": null,
    "lat": 52.172493,
    "lon": 21.563659,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000111",
    "name": "Dźwigowa",
    "fullName": "Dźwigowa 01",
    "ref": "01",
    "lat": 52.172466,
    "lon": 21.564419,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000106",
    "name": "Dźwigowa",
    "fullName": "Dźwigowa 02",
    "ref": "02",
    "lat": 52.172433,
    "lon": 21.564266,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11542616609",
    "name": "Fabryka Urządzeń Dźwigowych",
    "fullName": "Fabryka Urządzeń Dźwigowych 02",
    "ref": "02",
    "lat": 52.173887,
    "lon": 21.557442,
    "zone": "Centrum",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11542616604",
    "name": "Fabryka Urządzeń Dźwigowych",
    "fullName": "Fabryka Urządzeń Dźwigowych 03",
    "ref": "03",
    "lat": 52.173959,
    "lon": 21.55682,
    "zone": "Centrum",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000108",
    "name": "FUD",
    "fullName": "FUD 02",
    "ref": "02",
    "lat": 52.173806,
    "lon": 21.557942,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000109",
    "name": "FUD",
    "fullName": "FUD 03",
    "ref": "03",
    "lat": 52.173864,
    "lon": 21.558107,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "12155239310",
    "name": "Gliniak I",
    "fullName": "Gliniak I",
    "ref": null,
    "lat": 52.161364,
    "lon": 21.559556,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155239311",
    "name": "Gliniak II",
    "fullName": "Gliniak II",
    "ref": null,
    "lat": 52.157101,
    "lon": 21.558941,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "5125058880",
    "name": "Huta Mińska 802/6/06",
    "fullName": "Huta Mińska 802/6/06",
    "ref": null,
    "lat": 52.152439,
    "lon": 21.572794,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "5125060140",
    "name": "Huta Mińska 802/6/43",
    "fullName": "Huta Mińska 802/6/43",
    "ref": null,
    "lat": 52.153441,
    "lon": 21.572315,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321627",
    "name": "Jagiellońska",
    "fullName": "Jagiellońska",
    "ref": null,
    "lat": 52.190418,
    "lon": 21.55228,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000035",
    "name": "Jagiellońska",
    "fullName": "Jagiellońska 03",
    "ref": "03",
    "lat": 52.190421,
    "lon": 21.552235,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000036",
    "name": "Jagiellońska",
    "fullName": "Jagiellońska 04",
    "ref": "04",
    "lat": 52.1904,
    "lon": 21.552313,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000085",
    "name": "Jana Pawła II",
    "fullName": "Jana Pawła II 02",
    "ref": "02",
    "lat": 52.182726,
    "lon": 21.552462,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000086",
    "name": "Jana Pawła II",
    "fullName": "Jana Pawła II 03",
    "ref": "03",
    "lat": 52.182949,
    "lon": 21.551974,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321639",
    "name": "Jasna",
    "fullName": "Jasna",
    "ref": null,
    "lat": 52.18666,
    "lon": 21.570323,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000011",
    "name": "Jasna",
    "fullName": "Jasna 01",
    "ref": "01",
    "lat": 52.186701,
    "lon": 21.570239,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000012",
    "name": "Jasna",
    "fullName": "Jasna 02",
    "ref": "02",
    "lat": 52.186717,
    "lon": 21.57033,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321637",
    "name": "Karolina",
    "fullName": "Karolina",
    "ref": null,
    "lat": 52.191647,
    "lon": 21.57246,
    "zone": "Gmina Mińsk",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000001",
    "name": "Karolina",
    "fullName": "Karolina 03",
    "ref": "03",
    "lat": 52.191855,
    "lon": 21.572317,
    "zone": "Gmina Mińsk",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000002",
    "name": "Karolina",
    "fullName": "Karolina 04",
    "ref": "04",
    "lat": 52.191697,
    "lon": 21.572525,
    "zone": "Gmina Mińsk",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000025",
    "name": "Kazikowskiego",
    "fullName": "Kazikowskiego 02",
    "ref": "02",
    "lat": 52.179655,
    "lon": 21.560556,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000026",
    "name": "Kazikowskiego",
    "fullName": "Kazikowskiego 03",
    "ref": "03",
    "lat": 52.1799,
    "lon": 21.56105,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000046",
    "name": "Klonowa",
    "fullName": "Klonowa 45",
    "ref": "45",
    "lat": 52.167251,
    "lon": 21.56848,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000071",
    "name": "Klonowa Osiedle",
    "fullName": "Klonowa Osiedle 03",
    "ref": "03",
    "lat": 52.166099,
    "lon": 21.571904,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164450",
    "name": "Kolonia Janów I",
    "fullName": "Kolonia Janów I",
    "ref": null,
    "lat": 52.174713,
    "lon": 21.634244,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164451",
    "name": "Kolonia Janów II",
    "fullName": "Kolonia Janów II",
    "ref": null,
    "lat": 52.168453,
    "lon": 21.63883,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321645",
    "name": "Kościelna",
    "fullName": "Kościelna",
    "ref": null,
    "lat": 52.180703,
    "lon": 21.573768,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000013",
    "name": "Kościelna",
    "fullName": "Kościelna 01",
    "ref": "01",
    "lat": 52.180858,
    "lon": 21.573843,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000014",
    "name": "Kościelna",
    "fullName": "Kościelna 02",
    "ref": "02",
    "lat": 52.179766,
    "lon": 21.572802,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000009",
    "name": "Kościuszki",
    "fullName": "Kościuszki 02",
    "ref": "02",
    "lat": 52.18162,
    "lon": 21.5587,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321633",
    "name": "Krasickiego",
    "fullName": "Krasickiego",
    "ref": null,
    "lat": 52.196193,
    "lon": 21.564011,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000081",
    "name": "Krasickiego",
    "fullName": "Krasickiego 01",
    "ref": "01",
    "lat": 52.196173,
    "lon": 21.564403,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000082",
    "name": "Krasickiego",
    "fullName": "Krasickiego 04",
    "ref": "04",
    "lat": 52.196209,
    "lon": 21.564017,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12151466896",
    "name": "Królewiec Wspólna I 220817W/01P",
    "fullName": "Królewiec Wspólna I 220817W/01P",
    "ref": null,
    "lat": 52.203437,
    "lon": 21.561486,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12151466893",
    "name": "Królewiec Wspólna II",
    "fullName": "Królewiec Wspólna II",
    "ref": null,
    "lat": 52.205092,
    "lon": 21.54967,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12151466895",
    "name": "Królewiec Wspólna III 220817W/04P",
    "fullName": "Królewiec Wspólna III 220817W/04P",
    "ref": null,
    "lat": 52.205433,
    "lon": 21.537728,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12151466894",
    "name": "Królewiec Wspólna III 220817W/05L",
    "fullName": "Królewiec Wspólna III 220817W/05L",
    "ref": null,
    "lat": 52.205365,
    "lon": 21.538132,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321629",
    "name": "Kwiatowa",
    "fullName": "Kwiatowa",
    "ref": null,
    "lat": 52.192428,
    "lon": 21.556287,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000079",
    "name": "Kwiatowa",
    "fullName": "Kwiatowa 02",
    "ref": "02",
    "lat": 52.19242,
    "lon": 21.55624,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000080",
    "name": "Kwiatowa",
    "fullName": "Kwiatowa 03",
    "ref": "03",
    "lat": 52.192369,
    "lon": 21.556656,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000104",
    "name": "Langiewicza",
    "fullName": "Langiewicza 01",
    "ref": "01",
    "lat": 52.170478,
    "lon": 21.568014,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000103",
    "name": "Langiewicza",
    "fullName": "Langiewicza 02",
    "ref": "02",
    "lat": 52.170488,
    "lon": 21.567875,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321631",
    "name": "Leśna",
    "fullName": "Leśna",
    "ref": null,
    "lat": 52.193182,
    "lon": 21.5626,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000031",
    "name": "Leśna",
    "fullName": "Leśna 03",
    "ref": "03",
    "lat": 52.193141,
    "lon": 21.562536,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000032",
    "name": "Leśna",
    "fullName": "Leśna 06",
    "ref": "06",
    "lat": 52.193368,
    "lon": 21.562712,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000113",
    "name": "Licealna",
    "fullName": "Licealna 02",
    "ref": "02",
    "lat": 52.179486,
    "lon": 21.548827,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000114",
    "name": "Licealna",
    "fullName": "Licealna 03",
    "ref": "03",
    "lat": 52.180203,
    "lon": 21.54896,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321650",
    "name": "Ludowa",
    "fullName": "Ludowa",
    "ref": null,
    "lat": 52.16624,
    "lon": 21.57855,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000097",
    "name": "Ludowa",
    "fullName": "Ludowa 01",
    "ref": "01",
    "lat": 52.166263,
    "lon": 21.57861,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000098",
    "name": "Ludowa",
    "fullName": "Ludowa 04",
    "ref": "04",
    "lat": 52.166204,
    "lon": 21.578717,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11542616581",
    "name": "Łąkowa",
    "fullName": "Łąkowa",
    "ref": null,
    "lat": 52.170841,
    "lon": 21.564923,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000112",
    "name": "Łąkowa",
    "fullName": "Łąkowa 01",
    "ref": "01",
    "lat": 52.170752,
    "lon": 21.564823,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000105",
    "name": "Łąkowa",
    "fullName": "Łąkowa 02",
    "ref": "02",
    "lat": 52.170825,
    "lon": 21.564882,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000064",
    "name": "Łupińskiego",
    "fullName": "Łupińskiego 01",
    "ref": "01",
    "lat": 52.172796,
    "lon": 21.587783,
    "zone": "Serbinów",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000065",
    "name": "Łupińskiego",
    "fullName": "Łupińskiego 02",
    "ref": "02",
    "lat": 52.172256,
    "lon": 21.587891,
    "zone": "Serbinów",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000066",
    "name": "Łupińskiego",
    "fullName": "Łupińskiego 03",
    "ref": "03",
    "lat": 52.172655,
    "lon": 21.587097,
    "zone": "Serbinów",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321635",
    "name": "Małaszczyckiej",
    "fullName": "Małaszczyckiej",
    "ref": null,
    "lat": 52.195982,
    "lon": 21.569685,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000005",
    "name": "Małaszczyckiej",
    "fullName": "Małaszczyckiej 01",
    "ref": "01",
    "lat": 52.195587,
    "lon": 21.570593,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000006",
    "name": "Małaszczyckiej",
    "fullName": "Małaszczyckiej 02",
    "ref": "02",
    "lat": 52.195989,
    "lon": 21.57012,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164467",
    "name": "Marianka I",
    "fullName": "Marianka I",
    "ref": null,
    "lat": 52.147878,
    "lon": 21.596637,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164468",
    "name": "Marianka II",
    "fullName": "Marianka II",
    "ref": null,
    "lat": 52.151604,
    "lon": 21.590969,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000049",
    "name": "Mechanik",
    "fullName": "Mechanik 15",
    "ref": "15",
    "lat": 52.171542,
    "lon": 21.543262,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000050",
    "name": "Mechanik",
    "fullName": "Mechanik 16",
    "ref": "16",
    "lat": 52.171838,
    "lon": 21.54458,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000054",
    "name": "Mickiewicza",
    "fullName": "Mickiewicza 01",
    "ref": "01",
    "lat": 52.176722,
    "lon": 21.584469,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000055",
    "name": "Mickiewicza",
    "fullName": "Mickiewicza 02",
    "ref": "02",
    "lat": 52.177067,
    "lon": 21.584269,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141721263",
    "name": "Miejska Szkoła Artystyczna",
    "fullName": "Miejska Szkoła Artystyczna",
    "ref": null,
    "lat": 52.181738,
    "lon": 21.556741,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000087",
    "name": "Miejska Szkoła Artystyczna",
    "fullName": "Miejska Szkoła Artystyczna 01",
    "ref": "01",
    "lat": 52.181702,
    "lon": 21.556756,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000088",
    "name": "Miejska Szkoła Artystyczna",
    "fullName": "Miejska Szkoła Artystyczna 04",
    "ref": "04",
    "lat": 52.181823,
    "lon": 21.555806,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "7044608887",
    "name": "Mikanów 802/6/08",
    "fullName": "Mikanów 802/6/08",
    "ref": null,
    "lat": 52.140299,
    "lon": 21.581635,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "7044608886",
    "name": "Mikanów 802/6/41",
    "fullName": "Mikanów 802/6/41",
    "ref": null,
    "lat": 52.141314,
    "lon": 21.580658,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "5167689881",
    "name": "Mińsk Maz. Siennicka 802/6/02",
    "fullName": "Mińsk Maz. Siennicka 802/6/02",
    "ref": null,
    "lat": 52.173763,
    "lon": 21.568959,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141725921",
    "name": "Mińsk Mazowiecki Kazikowskiego",
    "fullName": "Mińsk Mazowiecki Kazikowskiego",
    "ref": null,
    "lat": 52.17992,
    "lon": 21.56104,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141000203",
    "name": "Mińsk Mazowiecki Kościuszki",
    "fullName": "Mińsk Mazowiecki Kościuszki",
    "ref": null,
    "lat": 52.181605,
    "lon": 21.558703,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141701772",
    "name": "Mińsk Mazowiecki Orzeszkowej",
    "fullName": "Mińsk Mazowiecki Orzeszkowej 02",
    "ref": "02",
    "lat": 52.186655,
    "lon": 21.543211,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000089",
    "name": "Mireckiego",
    "fullName": "Mireckiego 01",
    "ref": "01",
    "lat": 52.176664,
    "lon": 21.566793,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000090",
    "name": "Mireckiego",
    "fullName": "Mireckiego 02",
    "ref": "02",
    "lat": 52.176571,
    "lon": 21.568159,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9907820991",
    "name": "Mistów III",
    "fullName": "Mistów III",
    "ref": null,
    "lat": 52.228011,
    "lon": 21.615616,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310601",
    "name": "Mrozowska",
    "fullName": "Mrozowska",
    "ref": null,
    "lat": 52.174513,
    "lon": 21.561894,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164481",
    "name": "Niedziałka Druga",
    "fullName": "Niedziałka Druga",
    "ref": null,
    "lat": 52.208931,
    "lon": 21.633588,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "2641169157",
    "name": "Nowe Osiny",
    "fullName": "Nowe Osiny",
    "ref": null,
    "lat": 52.179234,
    "lon": 21.610963,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11500956982",
    "name": "Nowy Świat",
    "fullName": "Nowy Świat",
    "ref": null,
    "lat": 52.192671,
    "lon": 21.553865,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000119",
    "name": "Nowy Świat",
    "fullName": "Nowy Świat 01",
    "ref": "01",
    "lat": 52.192765,
    "lon": 21.55391,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000120",
    "name": "Nowy Świat",
    "fullName": "Nowy Świat 06",
    "ref": "06",
    "lat": 52.192729,
    "lon": 21.553985,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000039",
    "name": "Okrzei",
    "fullName": "Okrzei 04",
    "ref": "04",
    "lat": 52.180136,
    "lon": 21.557795,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000044",
    "name": "Osiedlowa",
    "fullName": "Osiedlowa 12",
    "ref": "12",
    "lat": 52.165211,
    "lon": 21.52465,
    "zone": "Stojadła",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164452",
    "name": "Osiny I",
    "fullName": "Osiny I",
    "ref": null,
    "lat": 52.180227,
    "lon": 21.631322,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164454",
    "name": "Osiny II",
    "fullName": "Osiny II",
    "ref": null,
    "lat": 52.180667,
    "lon": 21.627426,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9290944329",
    "name": "Piękna",
    "fullName": "Piękna",
    "ref": null,
    "lat": 52.177225,
    "lon": 21.54984,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000083",
    "name": "Piękna",
    "fullName": "Piękna 01",
    "ref": "01",
    "lat": 52.176947,
    "lon": 21.549884,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000084",
    "name": "Piękna",
    "fullName": "Piękna 04",
    "ref": "04",
    "lat": 52.177296,
    "lon": 21.549669,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000022",
    "name": "PKP Anielina",
    "fullName": "PKP Anielina 01",
    "ref": "01",
    "lat": 52.16864,
    "lon": 21.586307,
    "zone": "Anielina",
    "lines": [
      "M4"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000023",
    "name": "PKP Anielina",
    "fullName": "PKP Anielina 02",
    "ref": "02",
    "lat": 52.16838,
    "lon": 21.586077,
    "zone": "Anielina",
    "lines": [
      "M4"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000024",
    "name": "Plac Dworcowy",
    "fullName": "Plac Dworcowy 01",
    "ref": "01",
    "lat": 52.17654,
    "lon": 21.55398,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000060",
    "name": "Przedszkole Miejskie nr 5",
    "fullName": "Przedszkole Miejskie nr 5 01",
    "ref": "01",
    "lat": 52.18027,
    "lon": 21.56256,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000061",
    "name": "Przedszkole Miejskie nr 5",
    "fullName": "Przedszkole Miejskie nr 5 02",
    "ref": "02",
    "lat": 52.179771,
    "lon": 21.563309,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12249243409",
    "name": "Przemysłowa",
    "fullName": "Przemysłowa 07",
    "ref": "07",
    "lat": 52.186183,
    "lon": 21.581586,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12249243408",
    "name": "Przemysłowa",
    "fullName": "Przemysłowa 08",
    "ref": "08",
    "lat": 52.18521,
    "lon": 21.58106,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000016",
    "name": "Rondo Bitwy Warszawskiej 1920 r.",
    "fullName": "Rondo Bitwy Warszawskiej 1920 r. 01",
    "ref": "01",
    "lat": 52.178125,
    "lon": 21.559041,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000099",
    "name": "Rondo Dziąga",
    "fullName": "Rondo Dziąga 03",
    "ref": "03",
    "lat": 52.18333,
    "lon": 21.576473,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000100",
    "name": "Rondo Dziąga",
    "fullName": "Rondo Dziąga 04",
    "ref": "04",
    "lat": 52.182833,
    "lon": 21.57583,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000095",
    "name": "Rondo Żołnierzy Wyklętych",
    "fullName": "Rondo Żołnierzy Wyklętych 02",
    "ref": "02",
    "lat": 52.188071,
    "lon": 21.542577,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000110",
    "name": "Rudzkiego",
    "fullName": "Rudzkiego 01",
    "ref": "01",
    "lat": 52.173417,
    "lon": 21.562133,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000107",
    "name": "Rudzkiego",
    "fullName": "Rudzkiego 04",
    "ref": "04",
    "lat": 52.173318,
    "lon": 21.562109,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000067",
    "name": "Serbinów",
    "fullName": "Serbinów 02",
    "ref": "02",
    "lat": 52.177354,
    "lon": 21.588721,
    "zone": "Serbinów",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000068",
    "name": "Serbinów",
    "fullName": "Serbinów 03",
    "ref": "03",
    "lat": 52.177351,
    "lon": 21.588812,
    "zone": "Serbinów",
    "lines": [
      "M1",
      "M2",
      "M4"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000076",
    "name": "Sienkiewicza",
    "fullName": "Sienkiewicza 01",
    "ref": "01",
    "lat": 52.186549,
    "lon": 21.55225,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000077",
    "name": "Sienkiewicza",
    "fullName": "Sienkiewicza 06",
    "ref": "06",
    "lat": 52.18626,
    "lon": 21.553017,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000010",
    "name": "Siennicka",
    "fullName": "Siennicka 47",
    "ref": "47",
    "lat": 52.177935,
    "lon": 21.570866,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "5167690436",
    "name": "Siennicka 802/6/47",
    "fullName": "Siennicka 802/6/47",
    "ref": null,
    "lat": 52.177801,
    "lon": 21.570714,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310613",
    "name": "Sieńkiewicza",
    "fullName": "Sieńkiewicza 01",
    "ref": "01",
    "lat": 52.186499,
    "lon": 21.552267,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310614",
    "name": "Sieńkiewicza",
    "fullName": "Sieńkiewicza 06",
    "ref": "06",
    "lat": 52.186474,
    "lon": 21.552364,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310593",
    "name": "Sosnkowskiego",
    "fullName": "Sosnkowskiego",
    "ref": null,
    "lat": 52.169148,
    "lon": 21.536217,
    "zone": "Anielina",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000069",
    "name": "Sosnkowskiego",
    "fullName": "Sosnkowskiego 13",
    "ref": "13",
    "lat": 52.16904,
    "lon": 21.53656,
    "zone": "Anielina",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000070",
    "name": "Sosnkowskiego",
    "fullName": "Sosnkowskiego 14",
    "ref": "14",
    "lat": 52.16921,
    "lon": 21.53637,
    "zone": "Anielina",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000045",
    "name": "Spacerowa",
    "fullName": "Spacerowa 04",
    "ref": "04",
    "lat": 52.165884,
    "lon": 21.568127,
    "zone": "Anielina",
    "lines": [
      "M3",
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12168063273",
    "name": "Staojadła Południowa",
    "fullName": "Staojadła Południowa",
    "ref": null,
    "lat": 52.1847,
    "lon": 21.535552,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9907841195",
    "name": "Stara Niedziałka I",
    "fullName": "Stara Niedziałka I",
    "ref": null,
    "lat": 52.203308,
    "lon": 21.609945,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164479",
    "name": "Stara Niedziałka II",
    "fullName": "Stara Niedziałka II",
    "ref": null,
    "lat": 52.208101,
    "lon": 21.623251,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164474",
    "name": "Stara Niedziałka III",
    "fullName": "Stara Niedziałka III",
    "ref": null,
    "lat": 52.196677,
    "lon": 21.594427,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164463",
    "name": "Stare Zakole",
    "fullName": "Stare Zakole",
    "ref": null,
    "lat": 52.158392,
    "lon": 21.60732,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "1910822992",
    "name": "Stojadła I",
    "fullName": "Stojadła I",
    "ref": null,
    "lat": 52.164433,
    "lon": 21.52043,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12159937734",
    "name": "Stojadła I",
    "fullName": "Stojadła I 487/02L",
    "ref": "487/02L",
    "lat": 52.187833,
    "lon": 21.534789,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "1910822994",
    "name": "Stojadła I",
    "fullName": "Stojadła I 487/02P",
    "ref": "487/02P",
    "lat": 52.187387,
    "lon": 21.534511,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11055482137",
    "name": "Stojadła II",
    "fullName": "Stojadła II",
    "ref": null,
    "lat": 52.189301,
    "lon": 21.533149,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12153716547",
    "name": "Stojadła II",
    "fullName": "Stojadła II 487/03P",
    "ref": "487/03P",
    "lat": 52.181128,
    "lon": 21.532143,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "7365963330",
    "name": "Stojadła II",
    "fullName": "Stojadła II 487/04L",
    "ref": "487/04L",
    "lat": 52.182112,
    "lon": 21.532877,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140980938",
    "name": "Stojadła II Carrefour",
    "fullName": "Stojadła II Carrefour",
    "ref": null,
    "lat": 52.190417,
    "lon": 21.529772,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310589",
    "name": "Szkoła Podstawowa nr 2",
    "fullName": "Szkoła Podstawowa nr 2",
    "ref": null,
    "lat": 52.176944,
    "lon": 21.576647,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000053",
    "name": "Szkoła Podstawowa nr 2",
    "fullName": "Szkoła Podstawowa nr 2 02",
    "ref": "02",
    "lat": 52.176946,
    "lon": 21.57657,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321625",
    "name": "Szkoła Podstawowa nr 5",
    "fullName": "Szkoła Podstawowa nr 5",
    "ref": null,
    "lat": 52.188632,
    "lon": 21.554976,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000017",
    "name": "Szkoła Podstawowa nr 5",
    "fullName": "Szkoła Podstawowa nr 5 01",
    "ref": "01",
    "lat": 52.188548,
    "lon": 21.55514,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000018",
    "name": "Szkoła Podstawowa nr 5",
    "fullName": "Szkoła Podstawowa nr 5 02",
    "ref": "02",
    "lat": 52.188554,
    "lon": 21.555344,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000062",
    "name": "Szkoła Podstawowa nr 6",
    "fullName": "Szkoła Podstawowa nr 6 19",
    "ref": "19",
    "lat": 52.174682,
    "lon": 21.552777,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000063",
    "name": "Szkoła Podstawowa nr 6",
    "fullName": "Szkoła Podstawowa nr 6 20",
    "ref": "20",
    "lat": 52.175008,
    "lon": 21.554149,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12153716545",
    "name": "Szkoła Podstawowa w Brzózem",
    "fullName": "Szkoła Podstawowa w Brzózem",
    "ref": null,
    "lat": 52.220251,
    "lon": 21.543354,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155239312",
    "name": "Szkoła Podstawowa w Hucie Mińskiej z siedzibą w Cielechowiźnie",
    "fullName": "Szkoła Podstawowa w Hucie Mińskiej z siedzibą w Cielechowiźnie",
    "ref": null,
    "lat": 52.152375,
    "lon": 21.56429,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000040",
    "name": "Szpital",
    "fullName": "Szpital 03",
    "ref": "03",
    "lat": 52.174221,
    "lon": 21.578786,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000041",
    "name": "Szpital",
    "fullName": "Szpital 04",
    "ref": "04",
    "lat": 52.174316,
    "lon": 21.577815,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000047",
    "name": "Szpitalna",
    "fullName": "Szpitalna 01",
    "ref": "01",
    "lat": 52.173555,
    "lon": 21.570236,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000048",
    "name": "Szpitalna",
    "fullName": "Szpitalna 02",
    "ref": "02",
    "lat": 52.173407,
    "lon": 21.569635,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2",
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000093",
    "name": "Śniadeckich",
    "fullName": "Śniadeckich 01",
    "ref": "01",
    "lat": 52.174061,
    "lon": 21.574812,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000094",
    "name": "Śniadeckich",
    "fullName": "Śniadeckich 04",
    "ref": "04",
    "lat": 52.173599,
    "lon": 21.574456,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000072",
    "name": "Targowisko",
    "fullName": "Targowisko 01",
    "ref": "01",
    "lat": 52.185443,
    "lon": 21.556141,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000073",
    "name": "Targowisko",
    "fullName": "Targowisko 06",
    "ref": "06",
    "lat": 52.185468,
    "lon": 21.556281,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164462",
    "name": "Targówka I",
    "fullName": "Targówka I",
    "ref": null,
    "lat": 52.165835,
    "lon": 21.591397,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164461",
    "name": "Targówka II",
    "fullName": "Targówka II",
    "ref": null,
    "lat": 52.163748,
    "lon": 21.597724,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000074",
    "name": "Tartaczna",
    "fullName": "Tartaczna 01",
    "ref": "01",
    "lat": 52.181193,
    "lon": 21.549632,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000075",
    "name": "Tartaczna",
    "fullName": "Tartaczna 02",
    "ref": "02",
    "lat": 52.181299,
    "lon": 21.549572,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M2"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "11511302061",
    "name": "Urząd Gminy",
    "fullName": "Urząd Gminy",
    "ref": null,
    "lat": 52.18399,
    "lon": 21.563668,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000101",
    "name": "Urząd Gminy",
    "fullName": "Urząd Gminy 03",
    "ref": "03",
    "lat": 52.183651,
    "lon": 21.565423,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000102",
    "name": "Urząd Gminy",
    "fullName": "Urząd Gminy 04",
    "ref": "04",
    "lat": 52.18396,
    "lon": 21.564146,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141721176",
    "name": "Urząd Miasta",
    "fullName": "Urząd Miasta",
    "ref": null,
    "lat": 52.181014,
    "lon": 21.559391,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M2",
      "M3"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "000078",
    "name": "Urząd Miasta",
    "fullName": "Urząd Miasta 03",
    "ref": "03",
    "lat": 52.180998,
    "lon": 21.559419,
    "zone": "Centrum",
    "lines": [
      "M1",
      "M2",
      "M3"
    ],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "9291310609",
    "name": "Urząd Skarbowy",
    "fullName": "Urząd Skarbowy",
    "ref": null,
    "lat": 52.183558,
    "lon": 21.562297,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000058",
    "name": "Urząd Skarbowy",
    "fullName": "Urząd Skarbowy 01",
    "ref": "01",
    "lat": 52.183616,
    "lon": 21.562263,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000059",
    "name": "Urząd Skarbowy",
    "fullName": "Urząd Skarbowy 02",
    "ref": "02",
    "lat": 52.183942,
    "lon": 21.562274,
    "zone": "Centrum",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310616",
    "name": "Warszawkie Przedmieście",
    "fullName": "Warszawkie Przedmieście 03",
    "ref": "03",
    "lat": 52.187565,
    "lon": 21.548241,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310615",
    "name": "Warszawkie Przedmieście",
    "fullName": "Warszawkie Przedmieście 04",
    "ref": "04",
    "lat": 52.187524,
    "lon": 21.548399,
    "zone": "Mińsk Mazowiecki",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141717254",
    "name": "Warszawska",
    "fullName": "Warszawska",
    "ref": null,
    "lat": 52.18667,
    "lon": 21.543806,
    "zone": "Centrum",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000015",
    "name": "Warszawska",
    "fullName": "Warszawska 01",
    "ref": "01",
    "lat": 52.186687,
    "lon": 21.543835,
    "zone": "Centrum",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000021",
    "name": "Warszawskie Przedmieście - Osiedle",
    "fullName": "Warszawskie Przedmieście - Osiedle 02",
    "ref": "02",
    "lat": 52.188565,
    "lon": 21.5444,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291321617",
    "name": "Warszawskie Przedmieście – Osiedle",
    "fullName": "Warszawskie Przedmieście – Osiedle 02",
    "ref": "02",
    "lat": 52.188657,
    "lon": 21.544221,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000019",
    "name": "Warszawskie Przedmieście",
    "fullName": "Warszawskie Przedmieście 03",
    "ref": "03",
    "lat": 52.187409,
    "lon": 21.549055,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000020",
    "name": "Warszawskie Przedmieście",
    "fullName": "Warszawskie Przedmieście 04",
    "ref": "04",
    "lat": 52.187264,
    "lon": 21.549199,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "2111324594",
    "name": "Wiciejów I",
    "fullName": "Wiciejów I",
    "ref": null,
    "lat": 52.153633,
    "lon": 21.648006,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000056",
    "name": "Widok",
    "fullName": "Widok 17",
    "ref": "17",
    "lat": 52.173509,
    "lon": 21.549089,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000057",
    "name": "Widok",
    "fullName": "Widok 18",
    "ref": "18",
    "lat": 52.173687,
    "lon": 21.55014,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M3"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164470",
    "name": "Wólka Mińska",
    "fullName": "Wólka Mińska",
    "ref": null,
    "lat": 52.202883,
    "lon": 21.569538,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "1910822993",
    "name": "Zajezdnia ZDiTM",
    "fullName": "Zajezdnia ZDiTM 01",
    "ref": "01",
    "lat": 52.165906,
    "lon": 21.521832,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": true,
    "wheelchair": "yes"
  },
  {
    "id": "9264868983",
    "name": "Zakole Stare",
    "fullName": "Zakole Stare",
    "ref": null,
    "lat": 52.162604,
    "lon": 21.613753,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12155164464",
    "name": "Zakole_WIktororowo",
    "fullName": "Zakole_WIktororowo",
    "ref": null,
    "lat": 52.150659,
    "lon": 21.617372,
    "zone": "Gmina Mińsk",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "1910822990",
    "name": "Zamienie Brzozowa",
    "fullName": "Zamienie Brzozowa",
    "ref": null,
    "lat": 52.143448,
    "lon": 21.502599,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "1910822991",
    "name": "Zamienie Kościelna",
    "fullName": "Zamienie Kościelna",
    "ref": null,
    "lat": 52.15052,
    "lon": 21.505255,
    "zone": "Stojadła",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "9291310590",
    "name": "Zespół Szkolno-Przedszkolny nr 1",
    "fullName": "Zespół Szkolno-Przedszkolny nr 1",
    "ref": null,
    "lat": 52.177461,
    "lon": 21.576169,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000096",
    "name": "Zespół Szkolno-Przedszkolny nr 1",
    "fullName": "Zespół Szkolno-Przedszkolny nr 1 02",
    "ref": "02",
    "lat": 52.177448,
    "lon": 21.576127,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M1"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12141716689",
    "name": "Żuków I",
    "fullName": "Żuków I",
    "ref": null,
    "lat": 52.224347,
    "lon": 21.519617,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140946198",
    "name": "Żuków II",
    "fullName": "Żuków II 03L",
    "ref": "03L",
    "lat": 52.223539,
    "lon": 21.50978,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "12140946399",
    "name": "Żuków II",
    "fullName": "Żuków II 04P",
    "ref": "04P",
    "lat": 52.223792,
    "lon": 21.509759,
    "zone": "Stojadła",
    "lines": [],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000116",
    "name": "Żwirowa",
    "fullName": "Żwirowa 01",
    "ref": "01",
    "lat": 52.182068,
    "lon": 21.583786,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  },
  {
    "id": "000117",
    "name": "Żwirowa",
    "fullName": "Żwirowa 04",
    "ref": "04",
    "lat": 52.182108,
    "lon": 21.583915,
    "zone": "Mińsk Mazowiecki",
    "lines": [
      "M4"
    ],
    "isTransfer": false,
    "wheelchair": "yes"
  }
];

/**
 * Wyszukuje przystanki według frazy (nazwa, ulica, numer słupka, linia, strefa)
 */
export function searchRealBusStops(query: string, maxResults = 25): RealBusStop[] {
  const q = query.trim().toLowerCase();
  if (!q) return REAL_BUS_STOPS.slice(0, maxResults);

  return REAL_BUS_STOPS.filter((stop) => {
    return (
      stop.name.toLowerCase().includes(q) ||
      stop.fullName.toLowerCase().includes(q) ||
      (stop.ref && stop.ref.toLowerCase().includes(q)) ||
      stop.zone.toLowerCase().includes(q) ||
      stop.lines.some((line) => line.toLowerCase() === q || `linia ${line.toLowerCase()}` === q)
    );
  }).slice(0, maxResults);
}

/**
 * Zwraca przystanki obsługiwane przez daną linię (np. M1, M2, M3, M4)
 */
export function getBusStopsForLine(lineId: string): RealBusStop[] {
  const lid = lineId.toUpperCase();
  return REAL_BUS_STOPS.filter((s) => s.lines.includes(lid));
}

/**
 * Zwraca przystanki w danej strefie miasta/gminy
 */
export function getBusStopsByZone(zone: string): RealBusStop[] {
  return REAL_BUS_STOPS.filter((s) => s.zone.toLowerCase() === zone.toLowerCase());
}

/**
 * Zwraca szczegółowe parametry przystanku na podstawie nazwy lub fragmentu
 */
export function getStopDetails(stopName: string): RealBusStop | undefined {
  if (!stopName) return undefined;
  const q = stopName.trim().toLowerCase();
  return (
    REAL_BUS_STOPS.find((s) => s.name.toLowerCase() === q || s.fullName.toLowerCase() === q) ||
    REAL_BUS_STOPS.find(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        q.includes(s.name.toLowerCase()) ||
        s.fullName.toLowerCase().includes(q),
    )
  );
}

