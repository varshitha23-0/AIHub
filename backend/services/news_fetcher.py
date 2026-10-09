import requests
import feedparser
import trafilatura


from config import (
    NEWSAPI_API_KEY,
    GNEWS_API_KEY,
    CURRENTS_API_KEY,
    RSS_SOURCES
)



# ==========================================
# NEWSAPI
# ==========================================

def fetch_newsapi():

    url = "https://newsapi.org/v2/top-headlines"


    params = {

        "language": "en",
        "pageSize": 100,
        "apiKey": NEWSAPI_API_KEY

    }


    response = requests.get(
        url,
        params=params,
        timeout=30
    )


    response.raise_for_status()


    return response.json().get(
        "articles",
        []
    )



# ==========================================
# GNEWS
# ==========================================


def fetch_gnews():

    if not GNEWS_API_KEY:
        raise RuntimeError(
            "GNEWS_API_KEY is not configured. Add it to backend/.env."
        )

    url = "https://gnews.io/api/v4/top-headlines"


    params = {

        "lang": "en",
        "max": 10,
        "apikey": GNEWS_API_KEY

    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=30
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(
            f"GNews request failed ({type(exc).__name__}); check the API key, "
            "network connection, and account quota."
        ) from None


    return response.json().get(
        "articles",
        []
    )



# ==========================================
# CURRENTS
# ==========================================


def fetch_currents():

    url=(
        "https://api.currentsapi.services"
        "/v1/latest-news"
    )


    params={

        "language":"en",
        "apiKey":CURRENTS_API_KEY

    }


    response=requests.get(
        url,
        params=params,
        timeout=30
    )


    response.raise_for_status()


    return response.json().get(
        "news",
        []
    )



# ==========================================
# RSS FETCHER
# ==========================================


def fetch_rss():

    articles=[]


    for source in RSS_SOURCES:


        try:

            print(
                "Fetching RSS:",
                source["name"]
            )


            feed = feedparser.parse(
                source["url"]
            )


            for item in feed.entries[:20]:


                articles.append({

                    "title":
                    item.get(
                        "title",
                        ""
                    ),


                    "description":
                    item.get(
                        "summary",
                        ""
                    ),


                    "url":
                    item.get(
                        "link",
                        ""
                    ),


                    "published":
                    item.get(
                        "published",
                        ""
                    ),


                    "source":
                    source["name"],


                    "trust_score":
                    source["trust_score"]

                })


        except Exception as e:

            print(
                source["name"],
                e
            )


    return articles




# ==========================================
# ARTICLE EXTRACTION
# ==========================================


def extract_full_article(url):

    if not url:
        return ""


    try:

        downloaded = (
            trafilatura.fetch_url(url)
        )


        if not downloaded:
            return ""


        return (
            trafilatura.extract(
                downloaded
            )
            or ""
        )


    except:

        return ""




# ==========================================
# NORMALIZATION
# ==========================================


def normalize_article(article):


    url = article.get(
        "url",
        ""
    )


    return {


        "title":
        article.get(
            "title",
            ""
        ).strip(),


        "description":
        article.get(
            "description",
            ""
        ).strip(),


        "url":
        url,


        "source":
        article.get(
            "source",
            ""
        ),


        "published_at":
        (
            article.get(
                "publishedAt"
            )
            or
            article.get(
                "published"
            )
            or ""
        ),


        "trust_score":
        article.get(
            "trust_score",
            0.5
        ),


        "full_content":
        extract_full_article(url)

    }




# ==========================================
# DUPLICATE REMOVAL
# ==========================================


def remove_duplicates(articles):


    seen=set()

    result=[]


    for article in articles:


        title=article["title"].lower()


        if title in seen:
            continue


        seen.add(title)

        result.append(article)


    return result




# ==========================================
# MAIN COLLECTOR
# ==========================================


def fetch_all_news():


    all_articles=[]


    sources=[

        ("NewsAPI",fetch_newsapi),

        ("GNews",fetch_gnews),

        ("Currents",fetch_currents),

        ("RSS",fetch_rss)

    ]


    for name,func in sources:


        try:

            print(
                "Fetching",
                name
            )


            data=func()


            print(
                name,
                len(data)
            )


            all_articles.extend(
                data
            )


        except Exception as e:

            print(
                name,
                "ERROR:",
                e
            )



    print(
        "Normalizing..."
    )


    all_articles=[

        normalize_article(x)

        for x in all_articles

    ]



    all_articles=remove_duplicates(
        all_articles
    )



    print(
        "TOTAL:",
        len(all_articles)
    )


    return all_articles



if __name__=="__main__":

    news=fetch_all_news()

    print(
        news[0]
    )