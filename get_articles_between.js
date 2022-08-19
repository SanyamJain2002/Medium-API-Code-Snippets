class Medium {
    constructor(api_key) {
        this.api_key = api_key
        this.calls = 0
    }

    __get_resp(endpoint) {
        const base_url = "https://medium2.p.rapidapi.com";
        this.calls += 1;
        return fetch(base_url + endpoint, {
            headers: {
                "x-rapidapi-key": this.api_key
            }
        }).then(res => res.json());
    }

    async get_user_id(username) {
        const resp = await this.__get_resp('/user/id_for/'+username);
        return resp['id'];
    }

    async get_user_info(user_id) {
        const resp = await this.__get_resp('/user/'+user_id);
        return resp;
    }

    async get_article_info(article_id) {
        const resp = await this.__get_resp('/article/'+article_id);
        return resp;
    }

    async get_article_responses(article_id) {
        const resp = await this.__get_resp('/article/'+article_id+'/responses');
        return resp;
    }

    async get_publication_articles(publication_id, from) {
        const resp = await this.__get_resp('/publication/'+publication_id+'/articles?from='+from)
        return resp;
    }

    async get_publication_info(publication_id) {
        const resp = await this.__get_resp('/publication/'+publication_id);
        return resp;
    }

    async get_all_articles(article_ids) {
        let articles = [];
        for(let i=0; i < article_ids.length; i++) {
            let resp = await this.get_article_info(article_ids[i]);
            articles.push(resp);
        }
        return articles;
    }
}

async function get_articles_between(publication_id, _from = null, _to = null){
    let medium = new Medium("YOUR_RAPIDAPI_KEY");
    var articles;

    if(_from === null){
        _from = new Date();
    }

    if (_from!=null && _to!=null){
        if(_to.getTime() < _from.getTime()){
            var resp = await medium.__get_resp('/publication/'+publication_id+'/articles?from=' + _from.toISOString().slice(0, -5) );
            var next_to = (resp["to"]).split(' ');
            next_to = new Date(next_to[0]+'T'+next_to[1]+'Z');

            var article_ids = resp['publication_articles'].reverse();
            while(next_to.getTime() > _to.getTime()){
                console.log(next_to);
                var resp = await medium.__get_resp('/publication/'+publication_id+'/articles?from=' + next_to.toISOString().slice(0, -5));
                article_ids = article_ids.concat(resp['publication_articles'].reverse());
                var nt = (resp["to"]).split(' ');
                next_to = new Date(nt[0]+'T'+nt[1]+'Z');
            }

            articles = await medium.get_all_articles(article_ids);
            console.log('Got articles: '+articles.length)

            function filter_article(article){
                var d = article['published_at'].split(' ');
                var article_publish_date = new Date(d[0]+'T'+d[1]+'Z');
                article_publish_date = article_publish_date.getTime();
                return (_to.getTime() <= article_publish_date) && (_from.getTime() >= article_publish_date);
            }

            articles = articles.filter(filter_article);
            console.log('Filtered Articles: '+ articles.length);
        }
        else {
            console.log('[ERROR]: "from" date should be greated that "to" date. Try swapping both.');
            return []; 
        }
    }
    else{
        var resp = await medium.__get_resp('/publication/'+publication_id+'/articles?from=' + _from.toISOString().slice(0, -5) );
        var articles = await medium.get_all_articles(resp['publication_articles']); 
    }

    console.log('returing articles: '+articles.length)
    return articles;
}

async function main(){
    var fromdate = new Date('2022-08-18T16:02:37Z');
    var todate = new Date('2022-07-25T16:02:37Z');

    var articles = await get_articles_between('98111c9905da', fromdate, todate);

    for(let i=0; i<articles.length; i++) {
        console.log(articles[i].title + ' ---- ' + articles[i]["published_at"]);
    }
}

main();
    