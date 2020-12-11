from bs4 import BeautifulSoup # HTML Parser

html = ""

with open("large2.html", 'r', encoding="utf-8") as fd:
    html = "".join(fd.readlines())

soup = BeautifulSoup(html.replace(u'\xa0', u' '), features='html.parser')
elem = soup.findAll('a', {'class': 'ellipsis'})

with open("foretag3.csv", "wb") as fd:
    fd.write("Företag,Länk".encode("utf-8"))
    fd.write("\n")
    for l in elem:
        fd.write((l.text.strip() + ",https://www.avanza.se" +  l['href']).encode("utf-8"))
        fd.write("\n")
    #fd.write(str(len(elem)).encode("utf-8"))
    fd.write("\n")
