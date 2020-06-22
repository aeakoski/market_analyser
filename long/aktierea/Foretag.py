from bs4 import BeautifulSoup # HTML Parser
import requests

class Foretag:
    def __init__(self, l):
        self.vinst_per_aktie = -1
        self.EP_tal = -1
        self.JEK_per_aktie = -1
        self.direktavkastning = -1
        self.branch = -1
        self.namn = -1
        self.link = l
        self.kortnamn = -1
        self.antal_aktier = -1

        self.kolumn_A = -1
        self.kolumn_B = -1
        self.kolumn_A_plus_B = -1

    def __str__(self):
        return self.namn + "\t" + str(self.branch) + "\t" + str(self.direktavkastning) + "\t" + str(self.kolumn_A) + "\t" + str(self.kolumn_B) + "\t" + str(self.kolumn_A_plus_B)

    def populeraData(self):
        html = requests.get(self.link)
        soup = BeautifulSoup(html.text.replace(u'\xa0', u' '), features='html.parser')
        elem = soup.findAll('dl', {'class': 'border XSText rightAlignText noMarginTop highlightOnHover thickBorderBottom noTopBorder'})

        vanster_rubrik = elem[0].findAll('dt')
        vanster_data = elem[0].findAll('dd')

        hoger_rubrik = elem[1].findAll('dt')
        hoger_data = elem[1].findAll('dd')

        assert len(vanster_rubrik) == len(vanster_data), "Left column w/ values are ot parsed correctly"
        assert len(hoger_rubrik) == len(hoger_data), "Right column w/ values are ot parsed correctly"

        namn = soup.find('h1', {'class': 'large marginBottom10px'})
        self.namn = namn.text.strip()
        print(self.namn)
        for i in range(len(vanster_rubrik)):
            if vanster_rubrik[i].text.strip() == "Kortnamn":
                self.kortnamn = vanster_data[i].text.strip()
            elif vanster_rubrik[i].text.strip() == "Bransch":
                self.branch = vanster_data[i].text.strip()

            if hoger_rubrik[i].text.strip() == "Antal aktier":
                self.antal_aktier = int(hoger_data[i].text.strip().replace(" ", ""))
            elif hoger_rubrik[i].text.strip() == "Direktavkastning %":
                self.direktavkastning = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))
            elif hoger_rubrik[i].text.strip() == "Eget kapital/aktie SEK":
                self.JEK_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))
            elif hoger_rubrik[i].text.strip() == "Eget kapital/aktie EUR":
                self.JEK_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*10.5
            elif hoger_rubrik[i].text.strip() == "Eget kapital/aktie GBP":
                self.JEK_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*11.69
            elif hoger_rubrik[i].text.strip() == "Eget kapital/aktie CAD":
                self.JEK_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*6.96
            elif hoger_rubrik[i].text.strip() == "Vinst/aktie SEK":
                self.vinst_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))
            elif hoger_rubrik[i].text.strip() == "Vinst/aktie EUR":
                self.vinst_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*10.5
            elif hoger_rubrik[i].text.strip() == "Vinst/aktie GBP":
                self.vinst_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*11.69
            elif hoger_rubrik[i].text.strip() == "Vinst/aktie CAD":
                self.vinst_per_aktie = float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))*6.69
            elif hoger_rubrik[i].text.strip() == "P/E-tal":
                self.EP_tal = 1 / float(hoger_data[i].text.strip().replace(" ", "").replace(",", "."))

    def verifiera_all_data_hittad(self):
        assert self.vinst_per_aktie != -1, self.vinst_per_aktie
        assert self.EP_tal != -1, self.EP_tal
        assert self.JEK_per_aktie != -1, self.JEK_per_aktie
        assert self.direktavkastning != -1, self.direktavkastning
        assert self.branch != -1, self.branch
        assert self.namn != -1, self.namn
        assert self.link != -1, self.link
        assert self.kortnamn != -1, self.kortnamn
        assert self.antal_aktier != -1, self.antal_aktier
