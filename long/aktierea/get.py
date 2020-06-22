from bs4 import BeautifulSoup # HTML Parser

html = ""

with open("large2.html", 'r', encoding="utf-8") as fd:
    html = "".join(fd.readlines())

soup = BeautifulSoup(html.replace(u'\xa0', u' '), features='html.parser')
elem = soup.findAll('a', {'class': 'ellipsis'})
print("Företag,Länk")
for l in elem:
    print(l.text.strip() + ",https://www.avanza.se" +  l['href'])
print(len(elem))
