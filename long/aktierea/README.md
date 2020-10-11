# Aktierea

[Aktierea](https://www.aktierea.se/) är en handels-strategi. Oklart om det är något att ha. Men detta program räknar iallafall ut vilka aktier som man borde inneha enligt den metoden.

Tanken är att köpa i
- ...
- ...
- ...
- ...
- Maj
- Juni
- ...
- Augusti
- September
- ...
- ...
- ...

Och sälja i:
- ...
- ...
- ...
- April
- ...
- ...
- ...
- ...
- ...
- ...
- ...
- ...

Analysera i slutet på varje kvartal

## Installation

Använder `Python 3` och `pip3`

```bash
pip3 install requests
pip3 install BeautifulSoup4
```

## Användning

**TODO**
Kör main.py för att få analysresultatet i två filer:
- restlt_vinnare.csv
- restlt_förlorare.csv

```bash
python3 main.py
```

Listan med företag som analyseras finns i foretag2.csv. Denna genereras utav:

[https://www.avanza.se/aktier/lista.html](https://www.avanza.se/aktier/lista.html)

```bash
python3 get.py
```
Genererar en foretag**X**.csv fil vilket sedan ska änvändas utav main programmet.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
