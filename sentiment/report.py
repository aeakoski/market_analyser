"""/html/body/app-research-root/div/app-macro-page/div[2]/app-macro-report/div[2]/div[1]/div[1]/div/div/div[2]/div/p"""

from bs4 import BeautifulSoup # HTML Parser
from gtts import gTTS # Google text to speach
from afinn import Afinn # Sentiment analysis
import requests # Web requests
import statistics

class Report:
    def __init__(self, text, scores, sentiment, date):
        self.text = text
        self.sscores = scores
        self.sscore = float(sentiment)
        self.date = date
    def __str__(self):
        return self.date + " \t " + str(self.sscore) + " \t " + str(len(self.sscores))



NUMBER_OF_REPORTS_TO_FETCH = 100
SENTIMENTS = []

afinn = Afinn(language='sv', emoticons=True)

url = 'https://research.sebgroup.com/mapi/reports?reporttype=Morning%20Alert&nbrows='+str(NUMBER_OF_REPORTS_TO_FETCH)
res = requests.get(url)
res = res.json()["reports"]
for i in range(0, NUMBER_OF_REPORTS_TO_FETCH):
    # "publishedDate": "2020-03-20T07:00:41.235976+01:00" Split at 'T'
    html_doc = res[i]["sections"][-1]["text"]

    soup = BeautifulSoup(html_doc, 'html.parser')
    report = ""
    for j in soup.find_all("p", recursive=False):
        report = report + j.text
    pub_date = res[i]["publishedDate"].split("T")[0]
    # score = afinn.score(report)
    scores = afinn.scores_with_pattern(report)
    SENTIMENTS.append(Report(report, scores, sum(scores), pub_date))

print(type(SENTIMENTS[0].sscore))
print(statistics.mean(map(lambda i: i.sscore, SENTIMENTS)))
print("Date\tScore\tnrofwords\n")
for i in SENTIMENTS:
    print(i)

#tts = gTTS(SENTIMENTS[0].text, lang='sv')
#tts.save('report.mp3')
