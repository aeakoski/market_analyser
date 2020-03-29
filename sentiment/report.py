"""/html/body/app-research-root/div/app-macro-page/div[2]/app-macro-report/div[2]/div[1]/div[1]/div/div/div[2]/div/p"""

from bs4 import BeautifulSoup # HTML Parser
from gtts import gTTS # Google text to speach
from afinn import Afinn # Sentiment analysis
import requests # Web requests
import statistics
import csv
import matplotlib.pyplot as plt
import string

NUMBER_OF_REPORTS_TO_FETCH = 6 #300
REPORTS = []

class Report:
    def __init__(self, text, scores, sentiment, date, openAt, closeAt):
        self.text = text
        self.sscores = scores
        self.sscore = float(sentiment)
        self.date = date
        self.omxOpen = float(openAt.replace(",", "."))
        self.omxClose = float(closeAt.replace(",", "."))
        self._2gram = {}
        self._3gram = {}
    def __str__(self):
        return self.date + " \t " + str(self.sscore) + " \t " + str(len(self.sscores))
    def create2gram(self):
        cleanText = ""
        for char in self.text:
            if char.isalpha():
                cleanText = cleanText + char.lower()
            elif len(cleanText) and cleanText[-1] != " ":
                cleanText = cleanText + " "

        if cleanText[-1] == " ":
            cleanText = cleanText[:-1]

        print(cleanText)
        cleanTextList = cleanText.split(" ")
        for i in range(len(cleanTextList)):
            if i+1 == len(cleanTextList):
                break
            try:
                self._2gram[cleanTextList[i] + " " + cleanTextList[i+1]] += 1
            except KeyError:
                self._2gram[cleanTextList[i] + " " + cleanTextList[i+1]] = 1

        toPrint = []
        for i in self._2gram.keys():
            toPrint.append((i, self._2gram[i]))
        toPrint.sort(key = lambda x : x[1])

        for i in toPrint:
            print i[0]

def init_omxs30():
    # Headers; date;high;low;close;mean;vol;Oms;
    result = {}
    with open('data/newomxs30.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            result[row["date"]] = row

    # csv_reader.sort(key=lambda x: x["Datum"], reverse=True)
    return result

def init_snp500():
    # Headers; date;high;low;close;mean;vol;Oms;
    result = {}
    with open('data/snp500.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            dList = row["date"].split("/")
            row["date"] = dList[2] + "-" + dList[0] + "-" + dList[1]
            result[row["date"]] = row

    # csv_reader.sort(key=lambda x: x["Datum"], reverse=True)
    return result

def main():
    print("Start")
    afinn = Afinn(language='sv', emoticons=True)

    omx = init_omxs30()
    #omx = init_snp500()

    url = 'https://research.sebgroup.com/mapi/reports?reporttype=Morning%20Alert&nbrows='+str(NUMBER_OF_REPORTS_TO_FETCH)
    res = requests.get(url)
    res = res.json()["reports"]
    for i in range(0, NUMBER_OF_REPORTS_TO_FETCH):
        html_doc = res[i]["sections"][-1]["text"]
        soup = BeautifulSoup(html_doc, 'html.parser')
        report = ""
        for j in soup.find_all("p", recursive=False):
            report = report + j.text
        pub_date = res[i]["publishedDate"].split("T")[0]
        scores = afinn.scores_with_pattern(report)
        try:
            REPORTS.append(Report(report, scores, sum(scores), pub_date, omx[pub_date]["open"], omx[pub_date]["close"]))
        except KeyError:
            # Possible error reasons
            # OMX file is not up to date
            # Date parseing is wrong

            # print("ERROR: Key error")
            # print(pub_date)
            pass

    print("Done parsing")
    for report in REPORTS:
        print("Report")
        report.create2gram()

    # print(statistics.mean(map(lambda i: i.sscore, REPORTS)))
    # print("Date\tScore\tnrofwords\n")

    # Get the report in MP3 format
    #tts = gTTS(REPORTS[0].text, lang='sv')
    #tts.save('report.mp3')


    # Plot sentiment market correlation

    # x = []
    # y_avkastning = []
    # y_change = []
    #
    # for i in REPORTS:
    #     print(i)
    #     x.append(i.sscore)
    #     y_change.append(i.omxClose - i.omxOpen)

    # fig, ax = plt.subplots()
    # ax.scatter(x, y_change, color="red")
    # ax.set_ylabel('snp500 Delta')
    # ax.set_xlabel('Sentiment')
    # ax.axhline(1, color="#bfbfbf")
    # ax.axvline(25, color="#bfbfbf")
    #
    # fig.suptitle('Correlation snp500 delta / Sentiment of Morning Alert')
    # plt.show()

main()
