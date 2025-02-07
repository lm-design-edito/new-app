import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'
import { unknownToString } from '@design-edito/tools/agnostic/errors/unknown-to-string'
import { isNonNullObject } from '@design-edito/tools/agnostic/objects/is-object'
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
      // const errStr = unknownToString(err)
      // this.setState({ loading: false, error: errStr })
      this.setState({
        loading: false,
        error: null,
        articlesData: [{"title":"\u00ab\u00a0Derri\u00e8re vos d\u00e9cisions, ce sont des gens qui vont mourir\u00a0\u00bb\u00a0: d\u00e9couvrez les extraits du livre-enqu\u00eate \u00ab\u00a0Les\u00a0Juges et l\u2019Assassin\u00a0\u00bb sur la gestion du Covid-19","description":"Dans leur livre \u00e0 para\u00eetre mercredi 22\u00a0janvier chez Flammarion, les journalistes du \u00ab\u00a0Monde\u00a0\u00bb G\u00e9rard Davet et Fabrice Lhomme reviennent, \u00e9l\u00e9ments in\u00e9dits \u00e0 l\u2019appui, sur la fa\u00e7on dont l\u2019ex\u00e9cutif a g\u00e9r\u00e9 la crise engendr\u00e9e en\u00a02020\u00a0par l\u2019\u00e9pid\u00e9mie. Nous en publions des extraits.","img":"https:\/\/img.lemde.fr\/2025\/01\/19\/0\/0\/5394\/3596\/600\/0\/60\/0\/fc84e7b_ftp-import-images-1-wsq7omh3in2g-5779871-01-06.jpg","free":"0","author":"G\u00e9rard Davet, Fabrice Lhomme","section":"D\u00e9bats","subSection":"Covid, cinq ans apr\u00e8s","keywords":"Covid, cinq ans apr\u00e8s,Coronavirus et pand\u00e9mie de Covid-19,Soci\u00e9t\u00e9,Pand\u00e9mies,Livres,D\u00e9bats,Politique,Sant\u00e9","publishedAt":"2025-01-21 05:00:20","modifiedAt":"2025-01-21 10:34:39","url":"https:\/\/www.lemonde.fr\/idees\/article\/2025\/01\/21\/derriere-vos-decisions-ce-sont-des-gens-qui-vont-mourir-decouvrez-les-extraits-du-livre-enquete-les-juges-et-l-assassin-sur-la-gestion-du-covid-19_6507882_3232.html","pageview":"226236","uniquePageview":"199184","readingRate":"37.1128","readingTime":"92.52327157798202","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"215","commentRate":"0.001079403970634433","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"4","conversionRate":"0.00002008193364257459","unsubwill":"0","churn":"0"},{"title":"Covid-19\u00a0: il y a cinq ans, ces semaines cruciales qui ont vu dirigeants mondiaux et scientifiques t\u00e2tonner face \u00e0\u00a0une crise in\u00e9dite","description":"D\u00e9but 2020, une \u00e9trange \u00e9pid\u00e9mie virale, n\u00e9e en Chine, se propage \u00e0 travers le monde. Pendant que les scientifiques cernent l\u2019ennemi et d\u00e9finissent les meilleures d\u00e9fenses, les gouvernements tardent \u00e0 r\u00e9agir. Retour sur un pas de deux d\u00e9licat entre science et politiques sanitaires.","img":"https:\/\/img.lemde.fr\/2025\/01\/29\/0\/0\/5749\/3833\/600\/0\/60\/0\/561c733_sirius-fs-upload-1-tvjxed48ovrq-1738168000763-lgeai-operation-chardon79.jpg","free":"0","author":"Florence Rosier","section":"Plan\u00e8te","subSection":"Covid, cinq ans apr\u00e8s","keywords":"Covid, cinq ans apr\u00e8s,Coronavirus et pand\u00e9mie de Covid-19,Maladies infectieuses,Pathologies,Sant\u00e9,Plan\u00e8te","publishedAt":"2025-01-30 04:45:07","modifiedAt":"2025-01-31 06:57:49","url":"https:\/\/www.lemonde.fr\/planete\/article\/2025\/01\/30\/covid-19-il-y-a-cinq-ans-ces-semaines-cruciales-qui-ont-vu-dirigeants-mondiaux-et-scientifiques-tatonner-face-a-une-crise-inedite_6522933_3244.html","pageview":"38562","uniquePageview":"36225","readingRate":"35.6757","readingTime":"76.57495602772926","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"26","commentRate":"0.0007177363666837548","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"4","conversionRate":"0.00011042097987934274","unsubwill":"0","churn":"0"},{"title":"Didier Raoult dans \u00ab\u00a0Le Monde\u00a0\u00bb, de scientifique \u00ab\u00a0anticonformiste\u00a0\u00bb \u00e0 \u00ab\u00a0nouvelle \u00e9g\u00e9rie des complotistes\u00a0\u00bb","description":"Le nom du microbiologiste appara\u00eet pour la premi\u00e8re fois dans le quotidien le 24\u00a0septembre\u00a01994, \u00e0 l\u2019occasion de son \u00e9lection \u00e0 la t\u00eate de l\u2019universit\u00e9 Aix-Marseille-II. Depuis, le journal a document\u00e9 chaque \u00e9tape de son parcours, jusqu\u2019\u00e0 ses r\u00e9cents d\u00e9m\u00eal\u00e9s avec l\u2019ordre des m\u00e9decins et la justice.","img":"https:\/\/img.lemde.fr\/2025\/01\/14\/127\/0\/7274\/4849\/600\/0\/60\/0\/13a61d4_sirius-fs-upload-1-ydslw7twzhpr-1736871890407-000-328l8vj.jpg","free":"0","author":"Yann Bouchez","section":"M le mag","subSection":"La premi\u00e8re fois que \u00ab Le Monde \u00bb a \u00e9crit...","keywords":"Covid, cinq ans apr\u00e8s,Coronavirus et pand\u00e9mie de Covid-19,Maladies infectieuses,Pathologies,Sant\u00e9,Soci\u00e9t\u00e9,La premi\u00e8re fois que \u00ab Le Monde \u00bb a \u00e9crit...,M le mag","publishedAt":"2025-01-17 09:00:06","modifiedAt":"2025-01-17 09:00:06","url":"https:\/\/www.lemonde.fr\/m-le-mag\/article\/2025\/01\/17\/didier-raoult-dans-le-monde-de-scientifique-anticonformiste-a-nouvelle-egerie-des-complotistes_6502651_4500055.html","pageview":"33797","uniquePageview":"30942","readingRate":"54.6062","readingTime":"51.664480097095364","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"24","commentRate":"0.000775644780271428","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"Le tourisme mondial a retrouv\u00e9 son niveau record de 2019","description":"Selon une estimation de l\u2019ONU publi\u00e9e lundi, 1,4 milliard de touristes ont effectu\u00e9 un voyage \u00e0 l\u2019\u00e9tranger en 2024, soit le m\u00eame chiffre qu\u2019avant la pand\u00e9mie de Covid-19.","img":"https:\/\/img.lemde.fr\/2023\/07\/31\/0\/0\/6238\/4158\/600\/0\/60\/0\/c61d1d8_f63324ce728b4bca93b3b61f5f704cf1-0-97c58c5804e74549b7f89928acaf0e9e.jpg","free":"1","author":null,"section":"\u00c9conomie","subSection":"Tourisme","keywords":"Tourisme,\u00c9conomie,Covid, cinq ans apr\u00e8s,Coronavirus et pand\u00e9mie de Covid-19,Soci\u00e9t\u00e9","publishedAt":"2025-01-20 19:07:49","modifiedAt":"2025-01-20 19:07:49","url":"https:\/\/www.lemonde.fr\/economie\/article\/2025\/01\/20\/le-tourisme-mondial-a-retrouve-son-niveau-record-de-2019_6507441_3234.html","pageview":"18213","uniquePageview":"15789","readingRate":"59.9192","readingTime":"22.16967944227892","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"26","commentRate":"0.0016467160360605813","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"},{"title":"A Codogno, premi\u00e8re ville italienne touch\u00e9e par le Covid-19,\u00a0il y a cinq ans, des \u00ab\u00a0certitudes balay\u00e9es\u00a0\u00bb et des traumatismes qui durent","description":"La petite ville lombarde de 15\u00a0000\u00a0habitants et les neuf communes avoisinantes sont brutalement devenues, le 21\u00a0f\u00e9vrier\u00a02020, la premi\u00e8re zone confin\u00e9e d\u2019Europe face \u00e0 la pand\u00e9mie de Covid-19.","img":"https:\/\/img.lemde.fr\/2025\/01\/29\/0\/2\/2995\/1997\/600\/0\/60\/0\/b221b7a_sirius-fs-upload-1-slzur2m3jdel-1738169636816-l4440920.jpg","free":"0","author":"Allan Kaval","section":"Plan\u00e8te","subSection":"Covid, cinq ans apr\u00e8s","keywords":"Plan\u00e8te,Covid, cinq ans apr\u00e8s,Coronavirus et pand\u00e9mie de Covid-19,Maladies infectieuses,Pathologies,Sant\u00e9,Soci\u00e9t\u00e9","publishedAt":"2025-01-31 10:00:05","modifiedAt":"2025-01-31 13:28:40","url":"https:\/\/www.lemonde.fr\/planete\/article\/2025\/01\/31\/a-codogno-premiere-ville-italienne-touchee-par-le-covid-19-il-y-a-cinq-ans-des-certitudes-balayees-et-des-traumatismes-qui-durent_6525113_3244.html","pageview":"17740","uniquePageview":"16478","readingRate":"50.5177","readingTime":"56.07979704260406","totalShare":"0","shareRate":"0","shareFb":"0","shareTw":"0","shareMail":"0","comment":"15","commentRate":"0.0009103046426561027","gift":"0","tunnelAccess":"0","abortion":"0","conversion":"0","conversionRate":"0","unsubwill":"0","churn":"0"}] as any
      })
    }
  }

  render() {
    const { state, bemClss } = this
    const lmClasses = [bemClss.value]
    if (state.error !== null || state.loading === true) return <></> // [WIP] better handling for loading & error states ?
    return <div className={lmClasses.join(' ')}>{
      state.articlesData?.map((articleData, i) => {
        const { url, img, title } = articleData
        const thumbTextContent = <>
          <h3>{title}</h3>
        </>
        return <Thumbnail
          key={url}
          targetUrl={url}
          imageSrc={img}
          contentBelow={thumbTextContent} />
      })
    }</div>
  }
}
