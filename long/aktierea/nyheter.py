from GoogleNews import GoogleNews

googlenews = GoogleNews(lang='sv', period="3m")
googlenews.search('castellum')

for h in googlenews.results():
    print(h['title'])
    print(h['date'])
    print(h['link'])
    print("")
