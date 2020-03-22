"""/html/body/app-research-root/div/app-macro-page/div[2]/app-macro-report/div[2]/div[1]/div[1]/div/div/div[2]/div/p"""

from bs4 import BeautifulSoup # HTML Parser
from gtts import gTTS # Google text to speach
from afinn import Afinn # Sentiment analysis
import requests # Web requests
import statistics
import csv

class Report:
    def __init__(self, text, scores, sentiment, date):
        self.text = text
        self.sscores = scores
        self.sscore = float(sentiment)
        self.date = date
    def __str__(self):
        return self.date + " \t " + str(self.sscore) + " \t " + str(len(self.sscores))



def init_omxs30():
    # Headers; date;high;low;close;mean;vol;Oms;
    result = {}
    with open('data/omxs30.csv', mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter = ";")
        for row in csv_reader:
            result[row["date"]] = row

    # csv_reader.sort(key=lambda x: x["Datum"], reverse=True)
    return result


NUMBER_OF_REPORTS_TO_FETCH = 100
SENTIMENTS = []

def main():
    afinn = Afinn(language='sv', emoticons=True)

    omx = init_omxs30()
    print(omx["2020-03-19"])
    
    return

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
        SENTIMENTS.append(Report(report, scores, sum(scores), pub_date))

    print(statistics.mean(map(lambda i: i.sscore, SENTIMENTS)))
    print("Date\tScore\tnrofwords\n")
    for i in SENTIMENTS:
        print(i)

    #tts = gTTS(SENTIMENTS[0].text, lang='sv')
    #tts.save('report.mp3')

main()
