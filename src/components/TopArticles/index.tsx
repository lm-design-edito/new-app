import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import { isNonNullObject } from '@design-edito/tools/agnostic/objects/is-object'
import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date'
import Thumbnail from './Thumbnail'

export type ForecastApiArticleData = {
  title?: string
  description?: string
  img?: string
  free?: string
  author?: string | null
  section?: string
  subSection?: string
  keywords?: string
  publishedAt?: string
  modifiedAt?: string
  url?: string
  pageview?: string
  uniquePageview?: string
  readingRate?: string
  readingTime?: string
  totalShare?: string
  shareRate?: string
  shareFb?: string
  shareTw?: string
  shareMail?: string
  comment?: string
  commentRate?: string
  gift?: string
  tunnelAccess?: string
  abortion?: string
  conversion?: string
  conversionRate?: string
  unsubwill?: string
  churn?: string
}

export type Props = {
  dateFormat?: string
  dateLocale?: string
}

export type State = {
  loading: boolean
  error: null | string
  articlesData: ForecastApiArticleData[]
}

export default class TopArticles extends Component<Props, State> {
  static clss: string = 'lm-top-articles'
  clss = TopArticles.clss
  bemClss = Bem.bem('lm-top-articles')

  state: State = {
    loading: false,
    error: null,
    articlesData: []
  }

  constructor (props: Props) {
    super(props)
    this.fetchArticles = this.fetchArticles.bind(this)
  }

  componentDidMount(): void {
    this.fetchArticles()
  }

  async fetchArticles () {
    this.setState({ loading: true, error: null })
    try {
      const requestUrl = 'https://www.lemonde.fr/ajax/fetch-forecast?keywords=Covid,%20cinq%20ans%20apr%C3%A8s&since=2d&published=30d'
      const response = await window.fetch(requestUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      if (!response.ok) throw `HTTP error status: ${response.status} - ${response.statusText}`
      const articlesData = await response.json()
      if (!Array.isArray(articlesData)) throw `Response is not an array. ${JSON.stringify(articlesData)}`
      if (articlesData.some(article => !isNonNullObject(article))) throw `Some items in response array are not objects. ${JSON.stringify(articlesData)}`
      const [first, second, third] = articlesData as ForecastApiArticleData[]
      this.setState({
        loading: false,
        error: null,
        articlesData: [first, second, third].filter(e => e !== undefined) as ForecastApiArticleData[]
      })
    } catch (err) {
      console.error(err)
      this.setState({
        loading: false,
        error: null,
        articlesData: defaultArticlesData
      })
    }
  }

  render() {
    const { props, state, bemClss } = this
    const { dateFormat, dateLocale } = props
    const lmClasses = [bemClss.value]
    if (state.error !== null || state.loading === true) return <></> // [WIP] better handling for loading & error states ?
    return <div className={lmClasses.join(' ')}>{
      state.articlesData?.map((articleData, i) => {
        const { url, img, title, publishedAt = '1970-01-01 00:00:00', free } = articleData
        const [date = '1970-01-01', time = '00:00:00'] = publishedAt.split(' ')
        const [year = '1970', month = '01', day = '01'] = date.split('-')
        const [hour = '00', minute = '00', second = '00'] = time.split(':')
        const publishedAtDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        )
        const formattedDate = formatDate(publishedAtDate, dateFormat ?? '{{YYYY}}-{{MM}}-{{DD}}', dateLocale)
        const thumbTextContent = <>
          <h3 className='lm-top-articles__article-title'>{free === '0'
            ? <svg style={{ verticalAlign: 'middle' }} xmlns='http://www.w3.org/2000/svg' width='26' height='18' viewBox='0 0 26 18'>
              <g fill='none' fill-rule='evenodd'>
                <path fill='#ffc600' d='M0 0h18v18H0z'/>
                <path fill='#fff' d='M14.276 5.96c-.5.309-.667.727-.667 1.372v5.154c0 .324.039.471.205.566l.167.095.46-.284.155.324-1.602 1.01-.55-.391c-.244-.175-.347-.39-.347-.808V8.395c0-.86.257-1.319.616-1.6l.205-.162-1.512-.93-.678.431v6.702c0 .566-.077.647-.552.902 0 0-.37.189-.882.471h-.103V6.781c0-.363-.039-.445-.23-.606l-.538-.457-.654.39v3.849c0 .673-.102 1.157-.614 1.493l-1.28.848-.13-.228c.398-.324.488-.782.488-1.32V6.82c0-.578-.077-.807-.654-.699-.217.04-.55.094-.755.121-.846.121-1.205-.511-.628-1.305 0 0 .141-.202.5-.687l.282.202-.205.31c-.27.404-.052.62.384.457.205-.08.602-.241.883-.363 1.217-.498 1.665.323 1.73.808l1.511-.956 1.305 1.05 1.614-1.05 1.243.74c.422.256.627.148.922-.014l.243-.134.192.337zm-7.902 8.25c-.128-.378-.5-.768-1.166-.795-.628-.013-1.524.243-2.267.835l-.141-.189c.538-.62 1.793-1.614 3.112-1.628.692 0 1.179.242 1.525.633l.576-.337.167.35z'/>
              </g>
            </svg>
            : ''}{title}
          </h3>
          <p className='lm-top-articles__article-date'>{formattedDate}</p>
        </>
        return <Thumbnail
          key={`${i}-${url}`}
          targetUrl={url}
          imageSrc={img}
          contentBelow={thumbTextContent} />
      })
    }</div>
  }
}

export const defaultArticlesData: [ForecastApiArticleData, ForecastApiArticleData, ForecastApiArticleData] = [
  {
    "title": "« Cinq ans plus tard, la grande désillusion du “monde d’après” la crise due au Covid-19 »",
    "description": "Où est passée cette aspiration commune à transformer nos sociétés ? Dès que l’urgence sanitaire a été levée, nous sommes retombés dans nos ornières : culte de la croissance, exploitation aveugle des ressources, divisions géopolitiques. Pourtant, se réjouit Sylvie Matelly, directrice de l’Institut Jacques Delors, dans une tribune au « Monde », l’Europe a alors su serrer les rangs.",
    "img": "https://img.lemde.fr/2023/04/13/0/0/3000/2000/600/0/60/0/9ca095a_1681404751794-000-1s29dk.jpg",
    "free": "0",
    "author": "Sylvie Matelly",
    "section": "Débats",
    "subSection": "Covid, cinq ans après",
    "keywords": "Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Maladies infectieuses,Pathologies,Santé,Société,Tribunes éco,Économie,Tribunes,Débats",
    "publishedAt": "2025-03-07 11:00:03",
    "modifiedAt": "2025-03-07 15:17:22",
    "url": "https://www.lemonde.fr/idees/article/2025/03/07/cinq-ans-plus-tard-la-grande-desillusion-du-monde-d-apres-la-crise-due-au-covid-19_6577011_3232.html",
    "pageview": "8028",
    "uniquePageview": "3666",
    "readingRate": "33.98593608271666",
    "readingTime": "8457.12002182215",
    "totalShare": "1",
    "shareRate": "0.00025243625530426377",
    "shareFb": "0",
    "shareTw": "0",
    "shareMail": "0",
    "comment": "4",
    "commentRate": "0.007478957769388066",
    "gift": "0",
    "tunnelAccess": "9",
    "abortion": "0",
    "conversion": "1",
    "conversionRate": "0.00025243625530426377",
    "unsubwill": "0",
    "churn": "0"
  },
  {
    "title": "Cinq ans après le Covid-19, « le télétravail semble déclencher une évolution de la répartition des tâches au sein des couples »",
    "description": "Le travail à distance modifie la vie de l’entreprise – pas toujours pour le meilleur – et transforme aussi la vie privée, analyse l’économiste Claudia Senik dans une tribune au « Monde ». En France, les heures de travail domestique s’allongent pour les hommes qui télétravaillent, mais pas pour les femmes.",
    "img": "https://img.lemde.fr/2023/12/08/0/0/4471/2981/600/0/60/0/c090fc5_1702027663780-pns-6733589.jpg",
    "free": "0",
    "author": "Claudia Senik",
    "section": "Débats",
    "subSection": "Covid, cinq ans après",
    "keywords": "Tribunes éco,Économie,Travail,Conditions de travail,Emploi,Tribunes,Débats,Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Maladies infectieuses,Société,Egalité femmes-hommes",
    "publishedAt": "2025-03-07 5:00:19",
    "modifiedAt": "2025-03-07 15:14:17",
    "url": "https://www.lemonde.fr/idees/article/2025/03/07/cinq-ans-apres-le-covid-19-le-teletravail-semble-declencher-une-evolution-de-la-repartition-des-taches-au-sein-des-couples_6576874_3232.html",
    "pageview": "6636",
    "uniquePageview": "2605",
    "readingRate": "42.460952470307156",
    "readingTime": "6337.571976967371",
    "totalShare": "1",
    "shareRate": "0.0012667946445964807",
    "shareFb": "0",
    "shareTw": "0",
    "shareMail": "0",
    "comment": "1",
    "commentRate": "0.0020672727833839846",
    "gift": "0",
    "tunnelAccess": "0",
    "abortion": "0",
    "conversion": "0",
    "conversionRate": "0",
    "unsubwill": "0",
    "churn": "0"
  },
  {
    "title": "Arnaud Fontanet, épidémiologiste : « 20 millions de vies ont été sauvées grâce à la vaccination contre le Covid-19 »",
    "description": "Cinq ans après, la France est-elle mieux préparée pour la prochaine pandémie ? En avons-nous retenu les leçons ? Le professeur Arnaud Fontanet, médecin épidémiologiste des maladies émergentes, a répondu à vos questions lors d’un tchat.",
    "img": "https://img.lemde.fr/2022/07/11/0/96/5280/3520/600/0/60/0/507d386_5679582-01-06.jpg",
    "free": "1",
    "author": null,
    "section": "Société",
    "subSection": "Covid, cinq ans après",
    "keywords": "Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Maladies infectieuses,Pathologies,Santé,Société",
    "publishedAt": "2025-02-26 15:40:40",
    "modifiedAt": "2025-02-26 17:03:56",
    "url": "https://www.lemonde.fr/societe/article/2025/02/26/arnaud-fontanet-epidemiologiste-20-millions-de-vies-ont-ete-sauvees-grace-a-la-vaccination-contre-le-covid-19_6565378_3224.html",
    "pageview": "2451",
    "uniquePageview": "1205",
    "readingRate": "34.25995034498793",
    "readingTime": "22361.629875518673",
    "totalShare": "0",
    "shareRate": "0",
    "shareFb": "0",
    "shareTw": "0",
    "shareMail": "0",
    "comment": "2",
    "commentRate": "0.004008774511145111",
    "gift": "0",
    "tunnelAccess": "0",
    "abortion": "0",
    "conversion": "0",
    "conversionRate": "0",
    "unsubwill": "0",
    "churn": "0"
  }
]

