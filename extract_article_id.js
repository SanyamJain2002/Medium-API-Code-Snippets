function extract_article_id(article_url){
    const regex = /https?:\/\/[^\s]+/
    var urls = article_url.match(regex);

    if (urls.length!=0){
        var url = new URL(urls[0])
        var urlpath = url.pathname

        if(urlpath.length!=0){
            var last_location = (urlpath.split('/')).at(-1);     
            var article_id = (last_location.split('-')).at(-1);

            return article_id 
        }
    }
}

const article_id = extract_article_id("https://nishu-jain.medium.com/about-me-nishu-jain-562c5821b5f0");
console.log(article_id);

