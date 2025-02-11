import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import { unknownToString } from '@design-edito/tools/agnostic/errors/unknown-to-string'
import { isNonNullObject } from '@design-edito/tools/agnostic/objects/is-object'
import { formatDate } from '@design-edito/tools/agnostic/time/dates/format-date'
import Thumbnail from './Thumbnail'

export type ForecastApiArticleData = {
  url?: string
  title?: string
  description?: string
  img?: string
  free?: string
  author?: string
  section?: string
  subSection?: string
  keywords?: string
  publishedAt?: string
  modifiedAt?: string
}

export const orderByOptions = ['pageview', 'uniquePageview', 'readingRate', 'readingTime', 'totalShare', 'shareRate', 'shareFb', 'shareTw', 'shareMail', 'comment', 'commentRate', 'gift', 'tunnelAccess', 'abortion', 'conversion', 'conversionRate', 'unsubwill', 'churn'] as const
export const langOptions = ['fr', 'en'] as const
export const deviceOptions = ['all', 'desktop', 'mobile', 'tablet', 'mobile_ios', 'mobile_android'] as const
export const mediumOptions = ['all', 'search', 'social', 'direct', 'internal'] as const
export const sinceOptions = ['1h', '1d', '2d', '7d', '30d'] as const
export const publishedSinceOptions = ['1d', '2d', '3d', '4d', '5d', '6d', '7d', '30d'] as const
export const orderByDirectionOptions = ['desc', 'asc'] as const

export type Props = {
  dateFormat?: string
  dateLocale?: string
  orderBy?: typeof orderByOptions[number]
  lang?: typeof langOptions[number]
  device?: typeof deviceOptions[number]
  medium?: typeof mediumOptions[number]
  since?: typeof sinceOptions[number]
  publishedSince?: typeof publishedSinceOptions[number]
  free?: boolean
  author?: string
  subsection?: string
  section?: string
  keywords?: string
  excludedSections?: string
  excludedSubsections?: string
  itemNumber?: number
  page?: number
  orderByDirection?: typeof orderByDirectionOptions[number]
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
    const { props } = this
    this.setState({ loading: true, error: null })
    try {
      const requestUrlRoot = `https://forecast.lemonde.fr/api/v1/top-articles/${props.orderBy ?? 'pageview'}?`
      const requesUrlParams = {
        key: window.atob('QUl6YVN5REVKLW45NGNncXFTOGlwVlhOVmYwTzZRbnpieTUwaFRv'),
        orderByDirection: props.orderBy,
        lang: props.lang,
        device: props.device,
        medium: props.medium,
        since: props.since,
        publishedSince: props.publishedSince,
        free: props.free,
        author: props.author,
        subsection: props.subsection,
        section: props.section,
        keywords: props.keywords,
        excludedSections: props.excludedSections,
        excludedSubsections: props.excludedSubsections,
        itemNumber: props.itemNumber,
        page: props.page
      }
      const requestUrlQueryString = Object
        .entries(requesUrlParams)
        .filter(([_, val]) => val !== undefined)
        .map(([key, val]) => `${key}=${encodeURIComponent(`${val ?? ''}`)}`)
        .join('&')
      const requestUrl = `${requestUrlRoot}${requestUrlQueryString}`
      const response = await window.fetch(requestUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      if (!response.ok) throw `HTTP error status: ${response.status} - ${response.statusText}`
      const articlesData = await response.json()
      if (!Array.isArray(articlesData)) throw `Response is not an array. ${JSON.stringify(articlesData)}`
      if (articlesData.some(article => !isNonNullObject(article))) throw `Some items in response array are not objects. ${JSON.stringify(articlesData)}`
      this.setState({ loading: false, error: null, articlesData: articlesData as ForecastApiArticleData[] })
    } catch (err) {
      console.error(err)
      const errStr = unknownToString(err)
      // this.setState({ loading: false, error: errStr })
      this.setState({
        loading: false,
        error: null,
        articlesData: [
          {
            "title": "« Derrière vos décisions, ce sont des gens qui vont mourir » : découvrez les extraits du livre-enquête « Les Juges et l’Assassin » sur la gestion du Covid-19",
            "description": "Dans leur livre à paraître mercredi 22 janvier chez Flammarion, les journalistes du « Monde » Gérard Davet et Fabrice Lhomme reviennent, éléments inédits à l’appui, sur la façon dont l’exécutif a géré la crise engendrée en 2020 par l’épidémie. Nous en publions des extraits.",
            "img": "https://img.lemde.fr/2025/01/19/0/0/5394/3596/600/0/60/0/fc84e7b_ftp-import-images-1-wsq7omh3in2g-5779871-01-06.jpg",
            "free": "0",
            "author": "Gérard Davet, Fabrice Lhomme",
            "section": "Débats",
            "subSection": "Covid, cinq ans après",
            "keywords": "Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Société,Pandémies,Livres,Débats,Politique,Santé",
            "publishedAt": "2025-01-21 05:00:20",
            "modifiedAt": "2025-01-21 10:34:39",
            "url": "https://www.lemonde.fr/idees/article/2025/01/21/derriere-vos-decisions-ce-sont-des-gens-qui-vont-mourir-decouvrez-les-extraits-du-livre-enquete-les-juges-et-l-assassin-sur-la-gestion-du-covid-19_6507882_3232.html",
            "pageview": "226236",
            "uniquePageview": "199184",
            "readingRate": "37.1128",
            "readingTime": "92.52327157798202",
            "totalShare": "0",
            "shareRate": "0",
            "shareFb": "0",
            "shareTw": "0",
            "shareMail": "0",
            "comment": "215",
            "commentRate": "0.001079403970634433",
            "gift": "0",
            "tunnelAccess": "0",
            "abortion": "0",
            "conversion": "4",
            "conversionRate": "0.00002008193364257459",
            "unsubwill": "0",
            "churn": "0"
          },
          {
            "title": "Covid-19 : il y a cinq ans, ces semaines cruciales qui ont vu dirigeants mondiaux et scientifiques tâtonner face à une crise inédite",
            "description": "Début 2020, une étrange épidémie virale, née en Chine, se propage à travers le monde. Pendant que les scientifiques cernent l’ennemi et définissent les meilleures défenses, les gouvernements tardent à réagir. Retour sur un pas de deux délicat entre science et politiques sanitaires.",
            "img": "https://img.lemde.fr/2025/01/29/0/0/5749/3833/600/0/60/0/561c733_sirius-fs-upload-1-tvjxed48ovrq-1738168000763-lgeai-operation-chardon79.jpg",
            "free": "0",
            "author": "Florence Rosier",
            "section": "Planète",
            "subSection": "Covid, cinq ans après",
            "keywords": "Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Maladies infectieuses,Pathologies,Santé,Planète",
            "publishedAt": "2025-01-30 04:45:07",
            "modifiedAt": "2025-01-31 06:57:49",
            "url": "https://www.lemonde.fr/planete/article/2025/01/30/covid-19-il-y-a-cinq-ans-ces-semaines-cruciales-qui-ont-vu-dirigeants-mondiaux-et-scientifiques-tatonner-face-a-une-crise-inedite_6522933_3244.html",
            "pageview": "38562",
            "uniquePageview": "36225",
            "readingRate": "35.6757",
            "readingTime": "76.57495602772926",
            "totalShare": "0",
            "shareRate": "0",
            "shareFb": "0",
            "shareTw": "0",
            "shareMail": "0",
            "comment": "26",
            "commentRate": "0.0007177363666837548",
            "gift": "0",
            "tunnelAccess": "0",
            "abortion": "0",
            "conversion": "4",
            "conversionRate": "0.00011042097987934274",
            "unsubwill": "0",
            "churn": "0"
          },
          {
            "title": "Didier Raoult dans « Le Monde », de scientifique « anticonformiste » à « nouvelle égérie des complotistes »",
            "description": "Le nom du microbiologiste apparaît pour la première fois dans le quotidien le 24 septembre 1994, à l’occasion de son élection à la tête de l’université Aix-Marseille-II. Depuis, le journal a documenté chaque étape de son parcours, jusqu’à ses récents démêlés avec l’ordre des médecins et la justice.",
            "img": "https://img.lemde.fr/2025/01/14/127/0/7274/4849/600/0/60/0/13a61d4_sirius-fs-upload-1-ydslw7twzhpr-1736871890407-000-328l8vj.jpg",
            "free": "0",
            "author": "Yann Bouchez",
            "section": "M le mag",
            "subSection": "La première fois que « Le Monde » a écrit...",
            "keywords": "Covid, cinq ans après,Coronavirus et pandémie de Covid-19,Maladies infectieuses,Pathologies,Santé,Société,La première fois que « Le Monde » a écrit...,M le mag",
            "publishedAt": "2025-01-17 09:00:06",
            "modifiedAt": "2025-01-17 09:00:06",
            "url": "https://www.lemonde.fr/m-le-mag/article/2025/01/17/didier-raoult-dans-le-monde-de-scientifique-anticonformiste-a-nouvelle-egerie-des-complotistes_6502651_4500055.html",
            "pageview": "33797",
            "uniquePageview": "30942",
            "readingRate": "54.6062",
            "readingTime": "51.664480097095364",
            "totalShare": "0",
            "shareRate": "0",
            "shareFb": "0",
            "shareTw": "0",
            "shareMail": "0",
            "comment": "24",
            "commentRate": "0.000775644780271428",
            "gift": "0",
            "tunnelAccess": "0",
            "abortion": "0",
            "conversion": "0",
            "conversionRate": "0",
            "unsubwill": "0",
            "churn": "0"
          }
        ] as any
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
