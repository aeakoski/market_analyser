"""/html/body/app-research-root/div/app-macro-page/div[2]/app-macro-report/div[2]/div[1]/div[1]/div/div/div[2]/div/p"""

from bs4 import BeautifulSoup # HTML Parser
from gtts import gTTS # Google text to speach
from afinn import Afinn # Sentiment analysis
import requests # Web requests
import statistics
import csv
import matplotlib.pyplot as plt
import string
import pandas as pd

NUMBER_OF_REPORTS_TO_FETCH = 8 #300
REPORTS = []

class Report:
    def __init__(self, text, date, openAt, closeAt):
        self.text = text
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

        cleanTextList = cleanText.split(" ")
        for i in range(len(cleanTextList)):
            if i+1 == len(cleanTextList):
                break
            try:
                self._2gram[cleanTextList[i] + " " + cleanTextList[i+1]] += 1
            except KeyError:
                self._2gram[cleanTextList[i] + " " + cleanTextList[i+1]] = 1


def init_omxs30():
    # Headers; date;high;low;close;mean;vol;Oms;
    result = {}
    with open('data/newomxs30_test_data.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            result[row["date"]] = row
    return result

def main():
    print("Start")

    omx = init_omxs30()

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
        try:
            REPORTS.append(Report(report, pub_date, omx[pub_date]["open"], omx[pub_date]["close"]))
        except KeyError:
            # Possible error reasons
            # OMX file is not up to date
            # Date parseing is wrong

            # print("ERROR: Key error")
            # print(pub_date)
            pass

    print("Done parsing")


    train_df = pd.read_csv("./training.csv")
    trimmed_df = train_df[(train_df["wheight"] > 2) & (train_df["stdev"] < abs(train_df["mean"])/2)]


    for report in REPORTS:
        print("Report " + report.date)
        reportscores = []
        report.create2gram()


        for ng in report._2gram.keys():
            intersect = trimmed_df.loc[trimmed_df["ngram"] == ng.encode("utf-8")]
            if intersect.shape[0] > 0:
                reportscores.append(intersect["mean"].iloc[0])
                print(str(intersect["ngram"].iloc[0]) + "\t" + str(round(intersect["mean"].iloc[0], 2)))
                ## print(intersect.head())
        m = 0
        if len(reportscores) > 0:
            m = round(statistics.mean(reportscores),2)
        print("Total score: " + str(m))
        print("Wheight: " + str(len(reportscores)))
        stdev = -1
        if len(reportscores) > 1:
            stdev = statistics.stdev(reportscores)
        print("Deviation: " + str(stdev))
        print("Market move: " + str(report.omxClose - report.omxOpen))

        print("")

    # Make a guess on the market state


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
