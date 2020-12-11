from Foretag import Foretag
from csv import DictReader

foretag = []

"""
Nu finns det några undantag men huvudregeln är ta bort alla A-aktier
och behåll B-aktierna om det finns flera aktieslag under samma
bolagsnamn. Du ska vid analysen bara ha med ett aktieslag för varje
bolag.
"""
csv_reader = None
with open('foretag2.csv', mode='r') as csv_file:
        csv_reader = DictReader(csv_file, delimiter=",")


for rad in csv_reader:
    print(rad['Länk'])
    try:
        f = Foretag(rad['Länk'])
        f.populeraData()
        f.verifiera_all_data_hittad()
        foretag.append(f)
    except Exception as e:
        print("ERROR")
        print(e)




#url = "https://www.avanza.se/aktier/om-aktien.html/5447/abb-ltd"

"""
Sedan brukar jag rensa bort alla bolag som redovisat negativ
vinst, alltså har gått med förlust vid senaste årsskitet
vilket är redovisat i årsbokslutet och finns under kollumn
vinst/aktie.
"""
forlorare_1 = []
i = 0
while i <= len(foretag)-1:
    if (foretag[i].vinst_per_aktie < 0):
        forlorare_1.append(foretag[i])
        del foretag[i]
        continue
    i+=1


print("")
print("Förlorare i vinst / aktie")
for f in forlorare_1:
    print(f.namn)
print("")
"""
Alla bolag och kolumner sorteras efter E/P-talet så att
högsta talet kommer högst upp och det bolaget får siffran
1 i kolumn A, osv.
"""

foretag.sort(key=lambda f: f.EP_tal, reverse=True)

for i in range(len(foretag)):
    foretag[i].kolumn_A = i

"""
Sedan sorteras alla bolag och kolumner, även kolumn A, efter
JEK/aktie så att högsta talet kommer högst upp och det bolaget
får siffran 1 i kolumn B
"""

foretag.sort(key=lambda f: f.JEK_per_aktie, reverse=True)

for i in range(len(foretag)):
    foretag[i].kolumn_B = i

"""
Sedan summeras siffrorna i kolumn A med kolumn B i kolumnen A+B.
"""

for i in range(len(foretag)):
    foretag[i].kolumn_A_plus_B = foretag[i].kolumn_A + foretag[i].kolumn_B


"""
Sedan sorteras alla bolag och kolumner så att lägsta talet
kommer högst upp i kolumn A+B.
"""
foretag.sort(key=lambda f: f.kolumn_A_plus_B)

"""
Nu väljer du ut de 20 översta bolagen.
"""
if(20 < len(foretag)):
    foretag = foretag[0:20]

"""
Där efter sorteras alla bolag och kolumner i dessa tjugo
bolagen efter Direktavkastningen så att de bolag med högsta
värdet kommer högst upp.
"""
foretag.sort(key=lambda f: f.direktavkastning, reverse=True)


"""
Behåll sedan bara de två översta bankerna, de två översta
fastighetsbolagen och de två översta investmentbolagen.
Resten av dessa bolagstyper tar du bort.
"""

finans = 0
fastighet = 0


forlorare_2 = []
i = 0
while i <= len(foretag)-1:
    if (foretag[i].branch == "Fastigheter"):
        if fastighet > 2:
            forlorare_2.append(foretag[i])
            del foretag[i]
            continue
        else:
            fastighet += 1
    elif (foretag[i].branch == "Finans"):
        if finans > 4:
            forlorare_2.append(foretag[i])
            del foretag[i]
            continue
        else:
            finans += 1
    i += 1

print("")
print("Förlorare i Fastigheter och Finans")
for f in forlorare_2:
    print(f.namn)
print("")
print("Vinnare!!!!")
print("")

print("Namn\tBranch\tDirr.avk\tA\tB\tA+B")
for i in foretag:
    print(i)
